from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, workspaces, chat
from app.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# Configure CORS so our React frontend can make requests to our API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend origin e.g. ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(workspaces.router)
app.include_router(chat.router)

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "docs_url": "/docs"
    }
