import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from app.database import get_db
from app.models import Workspace, Document, ChatMessage, User
from app.schemas import DocumentResponse, ChatQuery, ChatMessageResponse
from app.routers.auth import get_current_user
from app.services.document_parser import (
    parse_pdf, 
    parse_web_url, 
    parse_github_repo, 
    parse_youtube_transcript
)
from app.services.rag_service import add_document_chunks, search_workspace, delete_document_vectors
from app.services.llm_service import generate_answer

router = APIRouter(prefix="/api/chat", tags=["chat"])

# Request body model for link imports
class LinkImportRequest(BaseModel):
    source_type: str  # website, github, youtube
    url: str

def verify_workspace_owner(workspace_id: int, user_id: int, db: Session) -> Workspace:
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == user_id
    ).first()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found or unauthorized."
        )
    return workspace

@router.get("/{workspace_id}/documents", response_model=List[DocumentResponse])
def get_workspace_documents(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_workspace_owner(workspace_id, current_user.id, db)
    return db.query(Document).filter(Document.workspace_id == workspace_id).all()

@router.delete("/{workspace_id}/documents/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workspace_document(
    workspace_id: int,
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_workspace_owner(workspace_id, current_user.id, db)
    
    document = db.query(Document).filter(
        Document.id == doc_id,
        Document.workspace_id == workspace_id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found."
        )
        
    # Delete from Qdrant vector store
    delete_document_vectors(workspace_id, doc_id)
    
    # Delete from SQLite/PostgreSQL
    db.delete(document)
    db.commit()
    return

@router.post("/{workspace_id}/upload", response_model=DocumentResponse)
async def upload_document(
    workspace_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_workspace_owner(workspace_id, current_user.id, db)
    
    filename = file.filename
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF file uploads are currently supported."
        )
        
    # Read file content
    contents = await file.read()
    
    # Create Document row in DB (status: processing)
    db_doc = Document(
        name=filename,
        source_type="pdf",
        status="processing",
        workspace_id=workspace_id
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    
    try:
        # Parse PDF text
        text_content = parse_pdf(contents)
        
        # Save parsed content text to SQL
        db_doc.content_text = text_content
        
        # Add chunks to vector store
        num_chunks = add_document_chunks(
            workspace_id=workspace_id,
            doc_id=db_doc.id,
            doc_name=filename,
            content=text_content,
            source_type="pdf"
        )
        
        if num_chunks > 0:
            db_doc.status = "active"
        else:
            db_doc.status = "failed"
            
        db.commit()
        db.refresh(db_doc)
        return db_doc
        
    except Exception as e:
        db_doc.status = "failed"
        db_doc.content_text = f"Parsing failed: {str(e)}"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process PDF: {str(e)}"
        )

@router.post("/{workspace_id}/add-link", response_model=List[DocumentResponse])
def add_link_source(
    workspace_id: int,
    req: LinkImportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_workspace_owner(workspace_id, current_user.id, db)
    
    source_type = req.source_type.lower()
    url = req.url.strip()
    
    if source_type not in ("website", "github", "youtube"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source type must be one of: 'website', 'github', or 'youtube'"
        )
        
    added_docs = []
    
    try:
        if source_type == "website":
            parsed_web = parse_web_url(url)
            web_title = parsed_web["title"]
            text_content = parsed_web["content"]
            web_url = parsed_web["url"]
            name = f"{web_title} (Web)"
            
            db_doc = Document(
                name=name,
                source_type="website",
                source_url=web_url,
                content_text=text_content,
                status="processing",
                workspace_id=workspace_id
            )
            db.add(db_doc)
            db.commit()
            db.refresh(db_doc)
            
            add_document_chunks(
                workspace_id=workspace_id,
                doc_id=db_doc.id,
                doc_name=name,
                content=text_content,
                source_type="website",
                source_url=web_url
            )
            db_doc.status = "active"
            db.commit()
            added_docs.append(db_doc)
            
        elif source_type == "youtube":
            parsed_yt = parse_youtube_transcript(url)
            yt_title = parsed_yt["title"]
            text_content = parsed_yt["content"]
            yt_url = parsed_yt["url"]
            name = f"{yt_title} (YouTube)"
            
            db_doc = Document(
                name=name,
                source_type="youtube",
                source_url=yt_url,
                content_text=text_content,
                status="processing",
                workspace_id=workspace_id
            )
            db.add(db_doc)
            db.commit()
            db.refresh(db_doc)
            
            add_document_chunks(
                workspace_id=workspace_id,
                doc_id=db_doc.id,
                doc_name=name,
                content=text_content,
                source_type="youtube",
                source_url=yt_url
            )
            db_doc.status = "active"
            db.commit()
            added_docs.append(db_doc)
            
        elif source_type == "github":
            repo_files = parse_github_repo(url)
            
            # Extract clean repo name for display
            clean_url = url.strip().rstrip("/")
            repo_name = clean_url.split("/")[-1]
            if repo_name.endswith(".git"):
                repo_name = repo_name[:-4]
            
            for file_obj in repo_files:
                doc_name = f"{repo_name}/{file_obj['name']}"
                file_content = file_obj['content']
                
                db_doc = Document(
                    name=doc_name,
                    source_type="github",
                    source_url=url,
                    content_text=file_content,
                    status="processing",
                    workspace_id=workspace_id
                )
                db.add(db_doc)
                db.commit()
                db.refresh(db_doc)
                
                add_document_chunks(
                    workspace_id=workspace_id,
                    doc_id=db_doc.id,
                    doc_name=doc_name,
                    content=file_content,
                    source_type="github",
                    source_url=url
                )
                db_doc.status = "active"
                db.commit()
                added_docs.append(db_doc)
                
        return added_docs
        
    except ValueError as ve:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process source link: {str(e)}"
        )


@router.post("/{workspace_id}/query")
def chat_query(
    workspace_id: int,
    query_in: ChatQuery,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_workspace_owner(workspace_id, current_user.id, db)
    
    # 1. Semantic Search
    search_results = search_workspace(workspace_id, query_in.message, top_k=5)
    
    # 2. LLM Generation
    llm_output = generate_answer(query_in.message, search_results, query_in.model_settings)
    
    answer_text = llm_output["content"]
    citations_list = llm_output["citations"]
    
    # 3. Store Messages in SQL Database
    user_msg = ChatMessage(
        workspace_id=workspace_id,
        role="user",
        content=query_in.message
    )
    assistant_msg = ChatMessage(
        workspace_id=workspace_id,
        role="assistant",
        content=answer_text,
        citations=json.dumps(citations_list)
    )
    db.add(user_msg)
    db.add(assistant_msg)
    db.commit()
    
    return {
        "answer": answer_text,
        "citations": citations_list
    }

@router.get("/{workspace_id}/history", response_model=List[ChatMessageResponse])
def get_chat_history(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_workspace_owner(workspace_id, current_user.id, db)
    return db.query(ChatMessage).filter(ChatMessage.workspace_id == workspace_id).order_by(ChatMessage.created_at.asc()).all()
