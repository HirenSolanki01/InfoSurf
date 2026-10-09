import io
import re
import zipfile
import requests
from bs4 import BeautifulSoup
from pypdf import PdfReader

try:
    from youtube_transcript_api import YouTubeTranscriptApi
except ImportError:
    YouTubeTranscriptApi = None


def extract_youtube_video_id(url: str) -> str:
    """
    Extracts the video ID from all common YouTube URL formats including shorts, live, embed, and shorts/m.youtube.com.
    """
    if not url:
        return None
    url = url.strip()
    if re.fullmatch(r"[a-zA-Z0-9_-]{11}", url):
        return url

    patterns = [
        r"(?:v=|/v/|/embed/|/shorts/|/live/|youtu\.be/)([a-zA-Z0-9_-]{11})",
        r"youtube\.com/watch\?.*v=([a-zA-Z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def parse_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from PDF bytes.
    """
    pdf = PdfReader(io.BytesIO(file_bytes))
    text = []
    for i, page in enumerate(pdf.pages):
        page_text = page.extract_text()
        if page_text:
            text.append(f"--- Page {i+1} ---\n{page_text}")
    if not text:
        raise ValueError("Could not extract any text from the PDF file.")
    return "\n\n".join(text)


def parse_web_url(url: str) -> dict:
    """
    Extracts title and visible text content from a website URL.
    Returns a dict: {"title": str, "content": str, "url": str}
    """
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=20, allow_redirects=True)
        response.raise_for_status()
    except requests.exceptions.SSLError:
        response = requests.get(url, headers=headers, timeout=20, allow_redirects=True, verify=False)
        response.raise_for_status()
    except Exception as e:
        raise ValueError(f"Failed to fetch webpage ({url}): {str(e)}")

    response.encoding = response.apparent_encoding or "utf-8"
    soup = BeautifulSoup(response.text, "html.parser")

    # Extract Page Title
    title = None
    if soup.title and soup.title.string:
        title = soup.title.string.strip()
    if not title:
        og_title = soup.find("meta", property="og:title")
        if og_title and og_title.get("content"):
            title = og_title["content"].strip()
    if not title:
        title = url.replace("https://", "").replace("http://", "").split("/")[0]

    # Clean non-content tags
    for element in soup(["script", "style", "nav", "header", "footer", "noscript", "meta", "iframe", "svg", "button"]):
        element.decompose()

    # Get clean text content
    text = soup.get_text(separator="\n")
    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    cleaned_text = "\n".join(chunk for chunk in chunks if chunk)

    if not cleaned_text.strip():
        raise ValueError("The web page does not contain extractable text content.")

    return {
        "title": title,
        "content": cleaned_text,
        "url": url
    }


def parse_github_repo(url: str) -> list[dict]:
    """
    Downloads a public GitHub repo or single file, returning list of dicts with 'name' and 'content'.
    """
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    match = re.search(r"github\.com/([^/]+)/([^/]+)", url)
    if not match:
        raise ValueError("Invalid GitHub URL. Must be in the format 'https://github.com/owner/repo'")

    owner = match.group(1)
    repo_raw = match.group(2).split("#")[0].split("?")[0]
    if repo_raw.endswith(".git"):
        repo_raw = repo_raw[:-4]

    repo = repo_raw.split("/")[0]
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

    # Query GitHub API for default branch
    default_branch = "main"
    try:
        api_resp = requests.get(f"https://api.github.com/repos/{owner}/{repo}", headers=headers, timeout=8)
        if api_resp.status_code == 200:
            default_branch = api_resp.json().get("default_branch", "main")
    except Exception:
        pass

    branches_to_try = list(dict.fromkeys([default_branch, "main", "master", "dev"]))

    zip_response = None
    for branch in branches_to_try:
        zip_url = f"https://github.com/{owner}/{repo}/archive/refs/heads/{branch}.zip"
        try:
            resp = requests.get(zip_url, headers=headers, timeout=30)
            if resp.status_code == 200:
                zip_response = resp
                break
        except Exception:
            continue

    if not zip_response:
        raise ValueError(f"Could not download GitHub repository archive for '{owner}/{repo}'. Please ensure the repo is public.")

    supported_exts = (
        '.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.md', '.txt', 
        '.rs', '.go', '.java', '.cpp', '.c', '.h', '.hpp', '.yml', '.yaml', '.toml', 
        '.sh', '.bat', '.ps1', '.sql', '.dockerfile', '.env', '.xml', '.vue', '.svelte', 
        '.rb', '.php', '.cs', '.kt', '.swift', '.m', '.dart', '.rst'
    )
    supported_filenames = {'readme', 'license', 'changelog', 'dockerfile', 'makefile', 'gemfile'}

    files = []
    max_files = 60

    with zipfile.ZipFile(io.BytesIO(zip_response.content)) as zip_ref:
        for file_info in zip_ref.infolist():
            if len(files) >= max_files:
                break
            if file_info.is_dir() or file_info.file_size > 500000:
                continue

            filename = file_info.filename
            parts = filename.split("/")
            if len(parts) <= 1:
                continue
            clean_path = "/".join(parts[1:])
            base_name = parts[-1].lower()

            if any(ignored in clean_path for ignored in ('node_modules/', '.git/', '__pycache__/', 'dist/', 'build/', 'venv/', '.venv/', 'env/')):
                continue

            is_valid = clean_path.lower().endswith(supported_exts) or base_name in supported_filenames
            if is_valid:
                try:
                    with zip_ref.open(file_info) as f:
                        content = f.read().decode('utf-8', errors='ignore')
                        if content.strip():
                            files.append({
                                "name": clean_path,
                                "content": content
                            })
                except Exception:
                    continue

    if not files:
        raise ValueError(f"No matching code or text files found in GitHub repository '{owner}/{repo}'.")

    return files


def parse_youtube_transcript(url: str) -> dict:
    """
    Retrieves YouTube video title, author, and transcript/captions.
    Returns a dict: {"title": str, "author": str, "content": str, "url": str}
    """
    video_id = extract_youtube_video_id(url)
    if not video_id:
        raise ValueError("Could not extract a valid YouTube Video ID from URL.")

    title = f"YouTube Video ({video_id})"
    author = "YouTube"

    # Step 1: Fetch Video Title and Author using YouTube oEmbed
    try:
        oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        oembed_resp = requests.get(oembed_url, timeout=10)
        if oembed_resp.status_code == 200:
            data = oembed_resp.json()
            title = data.get("title", title)
            author = data.get("author_name", author)
    except Exception:
        pass

    # Step 2: Fetch Transcript
    transcript_text = None
    if YouTubeTranscriptApi:
        try:
            raw_transcript = None
            if hasattr(YouTubeTranscriptApi, 'get_transcript'):
                try:
                    raw_transcript = YouTubeTranscriptApi.get_transcript(video_id)
                except Exception:
                    pass
            
            if not raw_transcript:
                api = YouTubeTranscriptApi()
                if hasattr(api, 'fetch'):
                    raw_transcript = api.fetch(video_id)
                elif hasattr(api, 'get_transcript'):
                    raw_transcript = api.get_transcript(video_id)

            if raw_transcript:
                lines = []
                for item in raw_transcript:
                    if hasattr(item, 'text'):
                        lines.append(item.text)
                    elif isinstance(item, dict) and 'text' in item:
                        lines.append(item['text'])
                    elif isinstance(item, str):
                        lines.append(item)
                transcript_text = "\n".join(lines)
        except Exception:
            pass

    if not transcript_text or not transcript_text.strip():
        # Fallback if captions are missing or blocked
        try:
            yt_url = f"https://www.youtube.com/watch?v={video_id}"
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            resp = requests.get(yt_url, headers=headers, timeout=10)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                meta_desc = soup.find("meta", name="description") or soup.find("meta", property="og:description")
                desc = meta_desc["content"] if meta_desc and meta_desc.get("content") else ""
                transcript_text = f"Title: {title}\nAuthor/Channel: {author}\nVideo URL: https://www.youtube.com/watch?v={video_id}\n\nDescription & Notes:\n{desc}\n(Closed captions were not available for this video, but metadata was indexed)."
        except Exception:
            transcript_text = f"Title: {title}\nAuthor/Channel: {author}\nVideo URL: https://www.youtube.com/watch?v={video_id}\n(Metadata indexed for research)."

    return {
        "title": title,
        "author": author,
        "content": transcript_text,
        "video_id": video_id,
        "url": f"https://www.youtube.com/watch?v={video_id}"
    }

