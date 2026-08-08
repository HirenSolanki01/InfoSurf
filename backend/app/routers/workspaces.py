from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Workspace
from app.schemas import WorkspaceCreate, WorkspaceResponse
from app.routers.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/api/workspaces", tags=["workspaces"])

@router.get("", response_model=List[WorkspaceResponse])
def list_workspaces(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Workspace).filter(Workspace.user_id == current_user.id).all()

@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
def create_workspace(
    workspace_in: WorkspaceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if a workspace with the same name exists for this user
    existing = db.query(Workspace).filter(
        Workspace.name == workspace_in.name,
        Workspace.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A workspace with this name already exists."
        )
        
    db_workspace = Workspace(name=workspace_in.name, user_id=current_user.id)
    db.add(db_workspace)
    db.commit()
    db.refresh(db_workspace)
    return db_workspace

@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workspace(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
        Workspace.user_id == current_user.id
    ).first()
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found or unauthorized."
        )
        
    # Cascade delete is handled by database/SQLAlchemy relationships
    db.delete(workspace)
    db.commit()
    return
