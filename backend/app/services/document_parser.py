import io
import re
import zipfile
import requests
from bs4 import BeautifulSoup
from pypdf import PdfReader
from youtube_transcript_api import YouTubeTranscriptApi

def extract_youtube_video_id(url: str) -> str:
    """
    Extracts the video ID from common YouTube URL formats.
    """
    regex = r"(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})"
    match = re.search(regex, url)
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

def parse_web_url(url: str) -> str:
    """
    Extracts visible text from a website URL.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    response = requests.get(url, headers=headers, timeout=15)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.text, "html.parser")
    
    # Remove script, style, header, footer, nav components
    for element in soup(["script", "style", "nav", "header", "footer", "noscript", "meta"]):
        element.decompose()
        
    # Get text content
    text = soup.get_text(separator="\n")
    
    # Clean whitespace
    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    cleaned_text = "\n".join(chunk for chunk in chunks if chunk)
    
    if not cleaned_text.strip():
        raise ValueError("The web page does not contain extractable text content.")
        
    return cleaned_text

def parse_github_repo(url: str) -> list[dict]:
    """
    Downloads a public GitHub repo as a zip archive and extracts code files.
    Returns a list of dicts with 'name' and 'content' for each file.
    """
    # Normalize github url (e.g. https://github.com/owner/repo)
    # Match: github.com/:owner/:repo
    match = re.search(r"github\.com/([^/]+)/([^/]+)", url)
    if not match:
        raise ValueError("Invalid GitHub URL. Must be in the format 'https://github.com/owner/repo'")
        
    owner = match.group(1)
    repo = match.group(2).split("#")[0].split("?")[0]
    # strip trailing .git if present
    if repo.endswith(".git"):
        repo = repo[:-4]
        
    # We will try main.zip then master.zip
    zip_url = f"https://github.com/shapes/{owner}/{repo}/archive/refs/heads/main.zip"
    
    # Try downloading main branch
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(f"https://github.com/{owner}/{repo}/archive/refs/heads/main.zip", headers=headers, timeout=30)
    
    if response.status_code != 200:
        # Try master branch
        response = requests.get(f"https://github.com/{owner}/{repo}/archive/refs/heads/master.zip", headers=headers, timeout=30)
        
    if response.status_code != 200:
        raise ValueError(f"Failed to download GitHub repository archive (tried 'main' and 'master' branches). Status code: {response.status_code}")
        
    files = []
    supported_extensions = (
        '.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', 
        '.md', '.txt', '.rs', '.go', '.java', '.cpp', '.h', '.yml', '.yaml'
    )
    
    with zipfile.ZipFile(io.BytesIO(response.content)) as zip_ref:
        for file_info in zip_ref.infolist():
            # Skip directories
            if file_info.is_dir():
                continue
                
            # Filter files by extension and skip typical build/dependency artifacts
            filename = file_info.filename
            if any(part in filename for part in ('node_modules/', '.git/', '__pycache__/', 'dist/', 'build/', 'venv/', 'env/')):
                continue
                
            if filename.endswith(supported_extensions):
                try:
                    with zip_ref.open(file_info) as f:
                        content = f.read().decode('utf-8', errors='ignore')
                        # Get a clean path (remove root repo folder from filename)
                        clean_path = "/".join(filename.split("/")[1:])
                        if content.strip():
                            files.append({
                                "name": clean_path,
                                "content": content
                            })
                except Exception:
                    # Ignore parsing failures for single files
                    continue
                    
    if not files:
        raise ValueError("No matching code/text files found in the repository.")
        
    return files

def parse_youtube_transcript(url: str) -> str:
    """
    Retrieves the transcript of a YouTube video using its URL.
    """
    video_id = extract_youtube_video_id(url)
    if not video_id:
        raise ValueError("Could not extract a valid YouTube Video ID from URL.")
        
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        transcript_text = "\n".join([item["text"] for item in transcript_list])
        return transcript_text
    except Exception as e:
        raise ValueError(f"Could not retrieve transcript for this YouTube video. It might not have closed captions, or the API blocked the request. Error: {str(e)}")
