from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Authentication Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None


# --- Workspace Schemas ---
class WorkspaceCreate(BaseModel):
    name: str

class WorkspaceResponse(BaseModel):
    id: int
    name: str
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Document Schemas ---
class DocumentCreate(BaseModel):
    name: str
    source_type: str
    source_url: Optional[str] = None
    workspace_id: int

class DocumentResponse(BaseModel):
    id: int
    name: str
    source_type: str
    source_url: Optional[str] = None
    content_text: Optional[str] = None
    status: str
    workspace_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Chat Message Schemas ---
class ChatMessageBase(BaseModel):
    role: str
    content: str
    citations: Optional[str] = None

class ChatMessageResponse(ChatMessageBase):
    id: int
    workspace_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ChatQuery(BaseModel):
    message: str
    model_settings: Optional[Dict[str, Any]] = None  # to pass api key, custom model, etc.
