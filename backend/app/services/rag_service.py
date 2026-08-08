import os
import uuid
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.config import settings

# Initialize Qdrant client
# If QDRANT_HOST is set, connect to external server. Otherwise, store locally.
if settings.QDRANT_HOST:
    qdrant_client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
else:
    # Persistent local storage
    os.makedirs(settings.QDRANT_PATH, exist_ok=True)
    qdrant_client = QdrantClient(path=settings.QDRANT_PATH)

COLLECTION_NAME = "infosurf_chunks"

# Lazy load the embedding model to speed up server boot and avoid downloading during tests unless needed
_embedding_model = None

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        # Load the local model (downloads it on first call, ~120MB)
        _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedding_model

def ensure_collection_exists():
    try:
        collections = qdrant_client.get_collections().collections
        exists = any(c.name == COLLECTION_NAME for c in collections)
        if not exists:
            qdrant_client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=qmodels.VectorParams(
                    size=384,  # all-MiniLM-L6-v2 size is 384
                    distance=qmodels.Distance.COSINE
                )
            )
    except Exception as e:
        print(f"Error checking/creating collection: {e}")

# Ensure collection exists on module import
ensure_collection_exists()

def add_document_chunks(
    workspace_id: int,
    doc_id: int,
    doc_name: str,
    content: str,
    source_type: str,
    source_url: Optional[str] = None
) -> int:
    """
    Splits the text content into overlapping chunks, generates embeddings, 
    and inserts them into the Qdrant vector store.
    """
    # 1. Split text into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=600,
        chunk_overlap=60,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )
    chunks = text_splitter.split_text(content)
    
    if not chunks:
        return 0
        
    # 2. Generate embeddings
    model = get_embedding_model()
    embeddings = model.encode(chunks)
    
    # 3. Prepare payload and insert into Qdrant
    points = []
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        point_id = str(uuid.uuid4())
        points.append(
            qmodels.PointStruct(
                id=point_id,
                vector=embedding.tolist(),
                payload={
                    "workspace_id": workspace_id,
                    "doc_id": doc_id,
                    "doc_name": doc_name,
                    "source_type": source_type,
                    "source_url": source_url,
                    "text": chunk,
                    "chunk_index": i
                }
            )
        )
        
    ensure_collection_exists()
    
    # Upload in batches of 100 points
    batch_size = 100
    for j in range(0, len(points), batch_size):
        qdrant_client.upsert(
            collection_name=COLLECTION_NAME,
            points=points[j:j+batch_size]
        )
        
    return len(chunks)

def search_workspace(workspace_id: int, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Performs a semantic search for a query within a specific workspace.
    """
    ensure_collection_exists()
    
    model = get_embedding_model()
    query_vector = model.encode(query).tolist()
    
    # Filter by workspace_id
    workspace_filter = qmodels.Filter(
        must=[
            qmodels.FieldCondition(
                key="workspace_id",
                match=qmodels.MatchValue(value=workspace_id)
            )
        ]
    )
    
    search_results = qdrant_client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        query_filter=workspace_filter,
        limit=top_k
    ).points
    
    results = []
    for hit in search_results:
        results.append({
            "score": hit.score,
            "text": hit.payload["text"],
            "doc_id": hit.payload["doc_id"],
            "doc_name": hit.payload["doc_name"],
            "source_type": hit.payload["source_type"],
            "source_url": hit.payload["source_url"]
        })
        
    return results

def delete_document_vectors(workspace_id: int, doc_id: int):
    """
    Deletes all vector points associated with a specific document.
    """
    ensure_collection_exists()
    
    document_filter = qmodels.Filter(
        must=[
            qmodels.FieldCondition(
                key="workspace_id",
                match=qmodels.MatchValue(value=workspace_id)
            ),
            qmodels.FieldCondition(
                key="doc_id",
                match=qmodels.MatchValue(value=doc_id)
            )
        ]
    )
    
    qdrant_client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=qmodels.FilterSelector(filter=document_filter)
    )
