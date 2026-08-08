import requests
from typing import List, Dict, Any, Optional
from app.config import settings

def clean_query_keywords(query: str) -> List[str]:
    # Extract keywords for local smart search
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
        'be', 'been', 'being', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 
        'about', 'against', 'between', 'into', 'through', 'during', 'before', 
        'after', 'above', 'below', 'from', 'up', 'down', 'in', 'out', 'off', 
        'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 
        'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 
        'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 
        'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 
        'just', 'don', 'should', 'now', 'what', 'who', 'which', 'this', 'that'
    }
    words = re_words = [w.lower().strip("?,.!:;\"'") for w in query.split()]
    return [w for w in words if w and w not in stop_words]

def run_local_mock_llm(query: str, context_chunks: List[Dict[str, Any]]) -> str:
    """
    Offline/local semantic text synthesizer that parses sentences in context chunks
    to match keywords in the query. Returns a synthesized, cited answer.
    """
    if not context_chunks:
        return "I cannot find the answer in the provided documents because there are no files in the workspace yet. Please upload a PDF, add a Web URL, YouTube link, or GitHub repo first!"
        
    keywords = clean_query_keywords(query)
    
    # Map from doc_id to its index in citation list (1-indexed)
    doc_citation_map = {}
    citation_index = 1
    citations_list = []
    
    for chunk in context_chunks:
        doc_id = chunk["doc_id"]
        if doc_id not in doc_citation_map:
            doc_citation_map[doc_id] = {
                "num": citation_index,
                "name": chunk["doc_name"],
                "type": chunk["source_type"],
                "url": chunk["source_url"]
            }
            citations_list.append(doc_citation_map[doc_id])
            citation_index += 1
            
    # Try to find matching sentences in the chunks
    matched_sentences = []
    
    for chunk in context_chunks:
        text = chunk["text"]
        doc_num = doc_citation_map[chunk["doc_id"]]["num"]
        
        # Split text into sentences (crude split)
        sentences = [s.strip() for s in text.replace("?", ".").replace("!", ".").split(".") if s.strip()]
        
        for sentence in sentences:
            # Score sentence based on keyword match
            score = 0
            sentence_lower = sentence.lower()
            for kw in keywords:
                if kw and kw in sentence_lower:
                    score += 1
                    
            if score > 0:
                matched_sentences.append({
                    "text": sentence,
                    "score": score,
                    "doc_num": doc_num,
                    "doc_name": chunk["doc_name"]
                })
                
    # Sort matched sentences by score
    matched_sentences.sort(key=lambda x: x["score"], reverse=True)
    
    if matched_sentences:
        # Take top 4 unique matched sentences to build a coherent response
        seen_sentences = set()
        chosen = []
        for s in matched_sentences:
            if len(chosen) >= 4:
                break
            # Avoid duplicate matching sentences
            cleaned = s["text"].lower()
            if cleaned not in seen_sentences:
                seen_sentences.add(cleaned)
                chosen.append(s)
                
        # Group sentences by document to make it readable
        response_parts = ["Based on the details found in your workspace:"]
        
        # Grouping
        grouped = {}
        for item in chosen:
            doc_num = item["doc_num"]
            if doc_num not in grouped:
                grouped[doc_num] = []
            grouped[doc_num].append(item["text"])
            
        for doc_num, s_list in grouped.items():
            doc_meta = [c for c in citations_list if c["num"] == doc_num][0]
            joined_sentences = ". ".join(s_list) + "."
            response_parts.append(f"- From **{doc_meta['name']}** ({doc_meta['type']}): \"{joined_sentences}\" [{doc_num}]")
            
        return "\n\n".join(response_parts)
    else:
        # Fallback summary: synthesize a generic answer from the first two chunks
        response_parts = ["Here is what I found in the retrieved documents:"]
        for idx in range(min(2, len(context_chunks))):
            chunk = context_chunks[idx]
            doc_num = doc_citation_map[chunk["doc_id"]]["num"]
            # Take the first 150 characters
            snippet = chunk["text"][:180].strip() + "..."
            response_parts.append(f"- **{chunk['doc_name']}**: \"{snippet}\" [{doc_num}]")
        
        response_parts.append("\nIf you need specific details, please ask a question targeting keywords in the documents.")
        return "\n\n".join(response_parts)

def generate_answer(
    query: str,
    context_chunks: List[Dict[str, Any]],
    model_settings: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Orchestrates response generation using the selected provider (Ollama, Gemini, OpenAI, or Local Fallback).
    Returns a dict with 'content' (answer text) and 'citations' (list of cited documents).
    """
    # 1. Setup citations list mapping
    citations = []
    doc_id_to_citation_index = {}
    citation_counter = 1
    
    for chunk in context_chunks:
        doc_id = chunk["doc_id"]
        if doc_id not in doc_id_to_citation_index:
            doc_id_to_citation_index[doc_id] = citation_counter
            citations.append({
                "index": citation_counter,
                "doc_id": doc_id,
                "name": chunk["doc_name"],
                "source_type": chunk["source_type"],
                "source_url": chunk["source_url"]
            })
            citation_counter += 1
            
    # If no contexts, standard empty return
    if not context_chunks:
        return {
            "content": "I cannot find any documents in this workspace to answer your query. Please upload files or add links first.",
            "citations": []
        }

    # 2. Get settings overrides
    settings_dict = model_settings or {}
    provider = settings_dict.get("provider", settings.LLM_PROVIDER)
    api_key = settings_dict.get("apiKey", None)
    model_name = settings_dict.get("model", None)
    
    # 3. Construct LLM system & context prompt
    context_str = ""
    for chunk in context_chunks:
        idx = doc_id_to_citation_index[chunk["doc_id"]]
        context_str += f"Source [{idx}] ({chunk['doc_name']}):\n{chunk['text']}\n---\n\n"
        
    prompt = (
        "You are InfoSurf, an AI-powered Enterprise Knowledge Hub. Answer the user's question based strictly on the provided sources.\n"
        "Instructions:\n"
        "- Do not make up facts or use external knowledge. If the source material is insufficient, explain what is missing.\n"
        "- You must cite your source using standard square bracket notations, like [1] or [2], matching the index from the provided source list.\n"
        "- Insert citation brackets at the end of sentences that use information from that source.\n\n"
        "Provided Sources:\n"
        f"{context_str}"
        "User Question:\n"
        f"{query}\n\n"
        "Answer (be helpful, structured, and clear):"
    )

    content_answer = ""
    
    try:
        if provider == "ollama":
            url = f"{settings_dict.get('ollamaUrl', settings.OLLAMA_BASE_URL)}/api/chat"
            payload = {
                "model": model_name or settings.OLLAMA_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "stream": False
            }
            res = requests.post(url, json=payload, timeout=25)
            if res.status_code == 200:
                content_answer = res.json()["message"]["content"]
            else:
                raise ValueError(f"Ollama server returned status code {res.status_code}")
                
        elif provider == "gemini":
            key = api_key or settings.GEMINI_API_KEY
            if not key:
                raise ValueError("Gemini API key is required but was not provided.")
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name or 'gemini-1.5-flash'}:generateContent?key={key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            res = requests.post(url, json=payload, timeout=25)
            if res.status_code == 200:
                res_data = res.json()
                content_answer = res_data["candidates"][0]["content"]["parts"][0]["text"]
            else:
                raise ValueError(f"Gemini API returned error: {res.text}")
                
        elif provider == "openai":
            key = api_key or settings.OPENAI_API_KEY
            if not key:
                raise ValueError("OpenAI API key is required but was not provided.")
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {key}"}
            payload = {
                "model": model_name or "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}]
            }
            res = requests.post(url, headers=headers, json=payload, timeout=25)
            if res.status_code == 200:
                content_answer = res.json()["choices"][0]["message"]["content"]
            else:
                raise ValueError(f"OpenAI API returned error: {res.text}")
                
        else: # provider == "local" or fallback
            content_answer = run_local_mock_llm(query, context_chunks)
            
    except Exception as e:
        # Fallback to local offline generator if API fails
        print(f"Error in LLM Generation ({provider}): {e}. Falling back to offline generator.")
        content_answer = f"*[LLM Error: {str(e)}. Falling back to offline matcher]*\n\n" + run_local_mock_llm(query, context_chunks)

    return {
        "content": content_answer,
        "citations": citations
    }
