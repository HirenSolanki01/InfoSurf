import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    workspaces = relationship("Workspace", back_populates="owner", cascade="all, delete-orphan")


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="workspaces")
    documents = relationship("Document", back_populates="workspace", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="workspace", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    source_type = Column(String, nullable=False)  # pdf, website, github, youtube
    source_url = Column(String, nullable=True)
    content_text = Column(Text, nullable=True)  # Stored text content for fallback search and references
    status = Column(String, default="processing")  # processing, active, failed
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    workspace = relationship("Workspace", back_populates="documents")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    citations = Column(Text, nullable=True)  # JSON serialized list of metadata citations
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    workspace = relationship("Workspace", back_populates="chat_messages")
