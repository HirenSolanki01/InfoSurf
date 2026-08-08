import React, { useState, useEffect, useRef } from "react";
import { useAuth, API_BASE, AuthProvider } from "./context/AuthContext";
import { getSavedSettings } from "./components/SettingsModal";
import SettingsModal from "./components/SettingsModal";
import { 
  LogOut, Plus, Trash2, Globe, FileText, 
  Settings, Send, Key, Lock, Mail, Compass, HelpCircle, 
  Paperclip, ArrowRight, ShieldAlert, Cpu, CheckCircle, RefreshCw
} from "lucide-react";

// Custom SVG Icons for Github & Youtube since lucide-react version doesn't export them
const Github = ({ size = 24, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Youtube = ({ size = 24, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3v6Z" />
  </svg>
);

// Inline modal for Link Imports
const ImportModal = ({ isOpen, onClose, onImport, importType, setImportType, url, setUrl, loading }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    onImport();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glassmorphism">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2>Add Knowledge Source Link</h2>
            <button type="button" className="close-btn" onClick={onClose}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Link Type</label>
              <div className="import-tabs">
                <button
                  type="button"
                  className={`import-tab ${importType === "website" ? "active" : ""}`}
                  onClick={() => setImportType("website")}
                >
                  <Globe size={14} className="mt-1" /> Web URL
                </button>
                <button
                  type="button"
                  className={`import-tab ${importType === "youtube" ? "active" : ""}`}
                  onClick={() => setImportType("youtube")}
                >
                  <Youtube size={14} className="mt-1" /> YouTube Video
                </button>
                <button
                  type="button"
                  className={`import-tab ${importType === "github" ? "active" : ""}`}
                  onClick={() => setImportType("github")}
                >
                  <Github size={14} className="mt-1" /> GitHub Repo
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="url-input">URL Link</label>
              <input
                id="url-input"
                type="url"
                required
                placeholder={
                  importType === "website" 
                    ? "https://example.com/article" 
                    : importType === "youtube" 
                    ? "https://www.youtube.com/watch?v=video_id" 
                    : "https://github.com/owner/repository"
                }
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            {importType === "github" && (
              <p className="text-xs text-secondary mt-1">
                Note: public repositories are supported. InfoSurf will fetch and index all code files (.py, .js, .ts, etc.).
              </p>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <RefreshCw className="animate-spin" size={16} /> : "Index Source"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { user, token, logout, login, signup } = useAuth();
  
  // Auth Form states
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // App Dashboard states
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  
  // Documents & Chats
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  
  // Modals & Uploads
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importType, setImportType] = useState("website");
  const [importUrl, setImportUrl] = useState("");
  
  const [isUploading, setIsUploading] = useState(false);
  const [isChatSending, setIsChatSending] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load workspaces
  const fetchWorkspaces = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/workspaces`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
        if (data.length > 0 && !activeWorkspace) {
          setActiveWorkspace(data[0]);
        }
      }
    } catch (err) {
      console.error("Error loading workspaces", err);
    }
  };

  // Load workspace docs & history
  const fetchWorkspaceData = async (workspaceId) => {
    if (!token || !workspaceId) return;
    try {
      // Fetch documents
      const docRes = await fetch(`${API_BASE}/api/chat/${workspaceId}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (docRes.ok) {
        const docData = await docRes.json();
        setDocuments(docData);
      }

      // Fetch history
      const historyRes = await fetch(`${API_BASE}/api/chat/${workspaceId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setMessages(historyData.map(msg => ({
          ...msg,
          // parse citations from string if present
          citations: msg.citations ? JSON.parse(msg.citations) : null
        })));
      }
    } catch (err) {
      console.error("Error loading workspace details", err);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [token]);

  useEffect(() => {
    if (activeWorkspace) {
      fetchWorkspaceData(activeWorkspace.id);
    } else {
      setDocuments([]);
      setMessages([]);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auth submits
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      if (isLoginTab) {
        await login(emailInput, passwordInput);
      } else {
        await signup(emailInput, passwordInput);
      }
    } catch (err) {
      setAuthError(err.message || "An authentication error occurred.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Workspace actions
  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/workspaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newWorkspaceName })
      });
      if (res.ok) {
        const newWs = await res.json();
        setWorkspaces([...workspaces, newWs]);
        setActiveWorkspace(newWs);
        setNewWorkspaceName("");
      } else {
        const errData = await res.json();
        alert(errData.detail || "Failed to create workspace");
      }
    } catch (err) {
      console.error("Workspace create error:", err);
      alert("Error: " + (err.message || "Failed to connect to server."));
    }
  };

  const handleDeleteWorkspace = async (workspaceId, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this workspace? This will delete all document embeddings and chat history!")) return;
    try {
      const res = await fetch(`${API_BASE}/api/workspaces/${workspaceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const filtered = workspaces.filter(w => w.id !== workspaceId);
        setWorkspaces(filtered);
        if (activeWorkspace?.id === workspaceId) {
          setActiveWorkspace(filtered.length > 0 ? filtered[0] : null);
        }
      }
    } catch (err) {
      console.error("Workspace deletion failed", err);
    }
  };

  // PDF uploads
  const handlePDFUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeWorkspace) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/api/chat/${activeWorkspace.id}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const doc = await res.json();
        setDocuments(prev => [...prev, doc]);
        // Trigger quick refresh in 1s to query if state remains 'processing'
        setTimeout(() => fetchWorkspaceData(activeWorkspace.id), 2000);
      } else {
        const data = await res.json();
        alert(data.detail || "Failed to process PDF.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading PDF");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Link imports
  const handleImportLink = async () => {
    if (!activeWorkspace) return;
    setImportLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat/${activeWorkspace.id}/add-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          source_type: importType,
          url: importUrl
        })
      });

      if (res.ok) {
        const addedDocs = await res.json();
        setDocuments(prev => [...prev, ...addedDocs]);
        setImportUrl("");
        setIsImportOpen(false);
      } else {
        const errData = await res.json();
        alert(errData.detail || "Failed to import website/link.");
      }
    } catch (err) {
      console.error(err);
      alert("Error importing URL Link source");
    } finally {
      setImportLoading(false);
    }
  };

  // Document removal
  const handleDeleteDoc = async (docId) => {
    if (!confirm("Remove this source and delete all its text embeddings?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/chat/${activeWorkspace.id}/documents/${docId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Chat queries
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || !activeWorkspace || isChatSending) return;
    
    const userMessageText = chatInput;
    setChatInput("");
    setIsChatSending(true);

    // Optimistically add user message
    const tempUserMsg = {
      id: Date.now(),
      role: "user",
      content: userMessageText,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    const activeSettings = getSavedSettings();

    try {
      const res = await fetch(`${API_BASE}/api/chat/${activeWorkspace.id}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessageText,
          model_settings: activeSettings
        })
      });

      if (res.ok) {
        const responseData = await res.json();
        const assistantMsg = {
          id: Date.now() + 1,
          role: "assistant",
          content: responseData.answer,
          citations: responseData.citations,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        const err = await res.json();
        alert(err.detail || "Error communicating with the knowledge engine.");
      }
    } catch (err) {
      console.error(err);
      alert("Connection timeout or server offline.");
    } finally {
      setIsChatSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render Login Card
  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card glassmorphism">
          <div className="auth-header">
            <h1 className="auth-logo">InfoSurf</h1>
            <p className="auth-subtitle">AI-Powered Enterprise Knowledge Hub</p>
          </div>

          <div className="auth-tabs">
            <button 
              className={`auth-tab ${isLoginTab ? "active" : ""}`}
              onClick={() => { setIsLoginTab(true); setAuthError(""); }}
            >
              Sign In
            </button>
            <button 
              className={`auth-tab ${!isLoginTab ? "active" : ""}`}
              onClick={() => { setIsLoginTab(false); setAuthError(""); }}
            >
              Create Account
            </button>
          </div>

          {authError && <div className="error-alert">{authError}</div>}

          <form onSubmit={handleAuthSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="flex items-center gap-2">
                <Mail className="text-secondary shrink-0" size={16} />
                <input
                  id="email"
                  type="email"
                  required
                  style={{ flex: 1 }}
                  placeholder="name@company.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="flex items-center gap-2">
                <Lock className="text-secondary shrink-0" size={16} />
                <input
                  id="password"
                  type="password"
                  required
                  style={{ flex: 1 }}
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }} disabled={authLoading}>
              {authLoading 
                ? <RefreshCw className="animate-spin" size={18} /> 
                : (isLoginTab ? "Sign In to Workspace" : "Register Account")
              }
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Active settings provider text
  const currentSettings = getSavedSettings();
  const providerLabel = {
    local: "Offline Matcher",
    ollama: `Ollama (${currentSettings.model})`,
    gemini: `Gemini API (${currentSettings.model})`,
    openai: `OpenAI API (${currentSettings.model})`
  }[currentSettings.provider] || "Local";

  return (
    <div className="app-layout">
      {/* 1. Leftmost Workspace Sidebar */}
      <div className="sidebar glassmorphism">
        <div className="sidebar-brand">InfoSurf</div>
        
        <div className="sidebar-content">
          <div>
            <div className="section-label">Your Workspaces</div>
            <div className="workspace-list">
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  className={`workspace-item ${activeWorkspace?.id === ws.id ? "active" : ""}`}
                  onClick={() => setActiveWorkspace(ws)}
                >
                  <div className="workspace-name">
                    <Compass size={16} />
                    <span>{ws.name}</span>
                  </div>
                  <button
                    className="workspace-delete-btn"
                    onClick={(e) => handleDeleteWorkspace(ws.id, e)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {workspaces.length === 0 && (
                <p className="text-xs text-secondary" style={{ padding: "0 10px" }}>No workspaces yet.</p>
              )}
            </div>
          </div>

          <form onSubmit={handleCreateWorkspace} className="create-workspace-box">
            <div className="section-label">Create Workspace</div>
            <input
              type="text"
              className="create-workspace-input"
              placeholder="e.g. Finance Research"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary flex justify-between" style={{ padding: "8px 12px", fontSize: "0.82rem" }}>
              <span>Add Workspace</span>
              <Plus size={14} />
            </button>
          </form>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile" title={user?.email}>
            <div className="message-avatar" style={{ width: 24, height: 24, fontSize: "0.75rem" }}>
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <span>{user?.email}</span>
          </div>
          <div className="footer-actions">
            <button className="icon-btn" title="Settings" onClick={() => setIsSettingsOpen(true)}>
              <Settings size={16} />
            </button>
            <button className="icon-btn" title="Sign Out" onClick={logout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Middle Sources panel */}
      {activeWorkspace ? (
        <div className="sources-panel glassmorphism">
          <div className="sources-header">
            <h3>
              <Paperclip size={16} />
              <span>Knowledge Sources</span>
            </h3>
          </div>

          <div className="sources-content">
            <div className="import-methods">
              <div className="section-label">Import Document</div>
              
              {/* Drag n drop local PDF upload */}
              <div className="upload-drag" onClick={() => fileInputRef.current?.click()}>
                <FileText className="text-cyan-400" size={24} />
                <p><strong>Upload local PDF</strong></p>
                <p>Click to browse files</p>
                {isUploading && <p className="text-cyan-400">Processing PDF...</p>}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept=".pdf"
                  onChange={handlePDFUpload}
                />
              </div>

              {/* URL import trigger */}
              <button 
                type="button" 
                className="btn btn-secondary flex items-center justify-center gap-2"
                style={{ marginTop: "10px", fontSize: "0.85rem", padding: "10px" }}
                onClick={() => setIsImportOpen(true)}
              >
                <Plus size={14} /> Add Web / YouTube / GitHub
              </button>
            </div>

            <div>
              <div className="section-label" style={{ marginBottom: "10px" }}>Indexed Documents ({documents.length})</div>
              <div className="document-list">
                {documents.map((doc) => {
                  const Icon = {
                    pdf: FileText,
                    website: Globe,
                    github: Github,
                    youtube: Youtube
                  }[doc.source_type] || FileText;

                  return (
                    <div key={doc.id} className="document-card">
                      <div className="document-info">
                        <div className="document-title" title={doc.name}>
                          {doc.name}
                        </div>
                        <div className="document-meta">
                          <Icon size={12} />
                          <span>{doc.source_type}</span>
                          <span className={`status-indicator status-${doc.status}`}>
                            <span className="status-dot"></span>
                            <span className="text-xs" style={{ textTransform: "capitalize" }}>{doc.status}</span>
                          </span>
                        </div>
                      </div>
                      <button 
                        className="icon-btn" 
                        style={{ padding: 4 }} 
                        onClick={() => handleDeleteDoc(doc.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
                {documents.length === 0 && (
                  <p className="text-xs text-secondary" style={{ textAlign: "center", padding: "20px 0" }}>
                    No knowledge sources imported yet. Upload files or links to populate semantic embeddings!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* 3. Main Chat panel */}
      <div className="chat-container">
        {activeWorkspace ? (
          <>
            <div className="chat-header">
              <div className="active-workspace-title">{activeWorkspace.name}</div>
              <div className="active-model-badge">
                <Cpu size={12} className="text-cyan-400" />
                <span>Engine: {providerLabel}</span>
              </div>
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="empty-chat">
                  <h2>Welcome to {activeWorkspace.name} Workspace</h2>
                  <p style={{ maxWidth: 500, margin: "0 auto", fontSize: "0.95rem" }}>
                    InfoSurf uses Retrieval-Augmented Generation (RAG) to scan your indexed files (PDFs, sites, transcripts, repositories) and generate accurate, context-aware answers with citations.
                  </p>
                  
                  {documents.length === 0 && (
                    <div className="info-box-success flex gap-2" style={{ maxWidth: 450, marginTop: 20 }}>
                      <ShieldAlert size={20} className="text-cyan-400 shrink-0" />
                      <p style={{ textAlign: "left" }}>
                        <strong>Quick Start:</strong> Upload a PDF or add website links in the sidebar drawer, then ask questions about the source contents here.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`message-bubble ${msg.role}`}>
                    <div className="message-avatar">
                      {msg.role === "user" ? "U" : "AI"}
                    </div>
                    <div className="message-content-wrapper">
                      <div className="message-content">
                        {msg.content.split("\n").map((paragraph, idx) => (
                          <p key={idx}>{paragraph}</p>
                        ))}
                        
                        {/* Citations references */}
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="citations-panel">
                            {msg.citations.map((cite) => (
                              <div 
                                key={cite.index} 
                                className="citation-card" 
                                title={cite.source_url || cite.name}
                                onClick={() => {
                                  if (cite.source_url) window.open(cite.source_url, "_blank");
                                }}
                              >
                                <span className="citation-index">[{cite.index}]</span>
                                <span>{cite.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isChatSending && (
                <div className="message-bubble assistant">
                  <div className="message-avatar">AI</div>
                  <div className="message-content">
                    <p style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <RefreshCw className="animate-spin text-cyan-400" size={16} />
                      Thinking and searching sources...
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <div className="chat-input-wrapper">
                <textarea
                  placeholder="Ask a question about the indexed knowledge bases..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isChatSending}
                />
                <button 
                  className="btn btn-primary flex items-center justify-center" 
                  style={{ width: 52, height: 52, borderRadius: 16, padding: 0 }}
                  onClick={handleSendMessage}
                  disabled={isChatSending || !chatInput.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-chat">
            <h2>Select or Create a Workspace</h2>
            <p>Please select a workspace from the sidebar or build a new one to begin uploading documents.</p>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      {/* Link Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        importType={importType}
        setImportType={setImportType}
        url={importUrl}
        setUrl={setImportUrl}
        onImport={handleImportLink}
        loading={importLoading}
      />
    </div>
  );
};

// Root element to inject Auth Provider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
