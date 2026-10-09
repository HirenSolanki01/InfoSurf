import React, { useState, useEffect, useRef } from "react";
import { useAuth, API_BASE } from "../context/AuthContext";
import { getSavedSettings } from "./SettingsModal";
import SettingsModal from "./SettingsModal";
import { 
  ArrowLeft, Plus, Trash2, Globe, FileText, 
  Settings, Send, Key, Lock, Mail, Compass, 
  Paperclip, ArrowRight, ShieldAlert, Cpu, CheckCircle, 
  RefreshCw, LogOut, UploadCloud, ExternalLink, HelpCircle,
  Copy, Check, Search, ChevronLeft, ChevronRight, PanelRight,
  Sparkles, Layers, BookOpen, Terminal, Code2, AlertCircle
} from "lucide-react";

// Inline Custom SVG for GitHub & YouTube
const GithubIcon = ({ size = 15, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const YoutubeIcon = ({ size = 15, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3v6Z" />
  </svg>
);

// Link Import Modal
const ImportLinkModal = ({ isOpen, onClose, onImport, importType, setImportType, url, setUrl, loading }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    onImport();
  };

  const getLoadingText = () => {
    if (importType === "website") return "Extracting Web Content...";
    if (importType === "youtube") return "Retrieving Transcript & Metadata...";
    if (importType === "github") return "Indexing Repository Files...";
    return "Indexing Source...";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#fff" }}>Add Knowledge Source Link</h2>
            <button type="button" className="icon-btn" onClick={onClose} disabled={loading}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Source Type</label>
              <div className="import-tabs">
                <button
                  type="button"
                  className={`import-tab ${importType === "website" ? "active" : ""}`}
                  onClick={() => setImportType("website")}
                  disabled={loading}
                >
                  <Globe size={14} className="mt-1" /> Web URL
                </button>
                <button
                  type="button"
                  className={`import-tab ${importType === "youtube" ? "active" : ""}`}
                  onClick={() => setImportType("youtube")}
                  disabled={loading}
                >
                  <YoutubeIcon size={14} className="mt-1" /> YouTube Video
                </button>
                <button
                  type="button"
                  className={`import-tab ${importType === "github" ? "active" : ""}`}
                  onClick={() => setImportType("github")}
                  disabled={loading}
                >
                  <GithubIcon size={14} className="mt-1" /> GitHub Repo
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="modal-url-input">
                {importType === "website" ? "Website Article / Documentation URL" : importType === "youtube" ? "YouTube Video / Shorts URL" : "Public GitHub Repository URL"}
              </label>
              <input
                id="modal-url-input"
                type="text"
                required
                disabled={loading}
                placeholder={
                  importType === "website" 
                    ? "https://example.com/docs or example.com" 
                    : importType === "youtube" 
                    ? "https://www.youtube.com/watch?v=video_id or shorts URL" 
                    : "https://github.com/owner/repository"
                }
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            {importType === "website" && (
              <p className="text-xs text-secondary">
                InfoSurf will extract readable content and page titles from standard web pages or documentation sites.
              </p>
            )}
            {importType === "youtube" && (
              <p className="text-xs text-secondary">
                Supports all YouTube video, shorts, and live URLs. Captions and metadata will be parsed automatically.
              </p>
            )}
            {importType === "github" && (
              <p className="text-xs text-secondary">
                Public repositories: InfoSurf will automatically extract and index code files (.py, .js, .ts, .md, etc.).
              </p>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={loading || !url.trim()}>
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} /> 
                  <span>{getLoadingText()}</span>
                </>
              ) : (
                "Index Source"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Document Inspector Modal
const DocumentInspectorModal = ({ doc, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen || !doc) return null;

  const text = doc.content_text || "";
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content doc-inspector-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2" style={{ minWidth: 0, flex: 1 }}>
            <FileText size={18} className="text-cyan-400 shrink-0" />
            <span style={{ fontSize: "1rem", fontWeight: "700", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {doc.name}
            </span>
          </div>
          <button className="icon-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body" style={{ overflowY: "auto", maxHeight: "65vh" }}>
          <div className="flex items-center justify-between" style={{ background: "rgba(255, 255, 255, 0.03)", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center gap-3 text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
              <span style={{ color: "var(--accent-cyan)", textTransform: "uppercase", fontWeight: "600" }}>{doc.source_type}</span>
              <span>·</span>
              <span>Status: <strong style={{ color: doc.status === "active" ? "var(--accent-emerald)" : "var(--accent-amber)" }}>{doc.status}</strong></span>
              <span>·</span>
              <span>{charCount.toLocaleString()} chars ({wordCount.toLocaleString()} words)</span>
            </div>

            {text && (
              <button className="icon-btn flex items-center gap-1 text-xs" onClick={handleCopy} title="Copy full text">
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            )}
          </div>

          {doc.source_url && (
            <div style={{ fontSize: "0.82rem", wordBreak: "break-all" }}>
              <a href={doc.source_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-cyan-400">
                <ExternalLink size={12} /> {doc.source_url}
              </a>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: "6px" }}>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Extracted Text Preview
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                {text.length > 5000 ? "Showing first 5,000 characters" : "Full document text"}
              </span>
            </div>
            
            <div style={{ background: "#07080B", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: "14px", fontSize: "0.85rem", lineHeight: "1.6", color: "var(--text-secondary)", whiteSpace: "pre-wrap", maxHeight: "400px", overflowY: "auto", fontFamily: doc.source_type === "github" ? "var(--font-mono)" : "var(--font-sans)" }}>
              {text ? (text.length > 5000 ? text.slice(0, 5000) + "\n\n[... truncated preview for display ...]" : text) : "No text content was parsed from this source."}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

// Formatted Code Block Component with Copy Action
const CodeBlock = ({ code, language = "code" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="code-block-container">
      <div className="code-block-header">
        <span>{language}</span>
        <button className="icon-btn flex items-center gap-1 text-xs" onClick={handleCopy}>
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Formatted Assistant Message Renderer
const FormattedAnswer = ({ content, citations = [], onCitationClick }) => {
  const [copiedAnswer, setCopiedAnswer] = useState(false);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(content);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 1500);
  };

  // Simple parser to separate code blocks from regular markdown paragraphs
  const parseBlocks = (text) => {
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const elements = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push({
          type: "text",
          content: text.slice(lastIndex, match.index)
        });
      }
      elements.push({
        type: "code",
        language: match[1] || "code",
        content: match[2]
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      elements.push({
        type: "text",
        content: text.slice(lastIndex)
      });
    }

    return elements;
  };

  const blocks = parseBlocks(content);

  return (
    <div className="assistant-response-paper">
      <div className="response-paper-header">
        <div className="flex items-center gap-2">
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--gradient-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "800", color: "#fff" }}>
            AI
          </div>
          <span style={{ fontSize: "0.84rem", fontWeight: "700", color: "var(--accent-cyan)", letterSpacing: "0.02em" }}>
            InfoSurf Research Synthesis
          </span>
        </div>

        <button className="icon-btn flex items-center gap-1 text-xs" onClick={handleCopyAll} title="Copy response">
          {copiedAnswer ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          <span>{copiedAnswer ? "Copied" : "Copy"}</span>
        </button>
      </div>

      <div className="response-paper-body">
        {blocks.map((block, idx) => {
          if (block.type === "code") {
            return <CodeBlock key={idx} code={block.content} language={block.language} />;
          }

          // Process text paragraphs and highlight citations [1], [2], etc.
          return (
            <div key={idx}>
              {block.content.split("\n\n").map((paragraph, pIdx) => {
                if (!paragraph.trim()) return null;

                // Split paragraph by citation markers [1], [2]
                const parts = paragraph.split(/(\[\d+\])/g);
                return (
                  <p key={pIdx}>
                    {parts.map((part, partIdx) => {
                      const match = part.match(/^\[(\d+)\]$/);
                      if (match) {
                        const citeNum = parseInt(match[1], 10);
                        const matchedCite = citations.find(c => c.index === citeNum);
                        return (
                          <span
                            key={partIdx}
                            className="citation-badge"
                            title={matchedCite ? `${matchedCite.name} (${matchedCite.source_type})` : `Source [${citeNum}]`}
                            onClick={() => onCitationClick && onCitationClick(matchedCite)}
                          >
                            [{citeNum}]
                          </span>
                        );
                      }
                      return part;
                    })}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Grounding Citations Section at bottom of answer */}
      {citations && citations.length > 0 && (
        <div className="response-sources-grounding">
          <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "10px" }}>
            Grounding Sources & Citations ({citations.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {citations.map((cite) => (
              <div 
                key={cite.index}
                className="citation-card"
                onClick={() => onCitationClick && onCitationClick(cite)}
                title={cite.source_url || cite.name}
              >
                <span className="citation-index">[{cite.index}]</span>
                <span style={{ fontWeight: "500", color: "var(--text-primary)" }}>{cite.name}</span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>({cite.source_type})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const WorkspaceView = ({ onBackToHome, initialPrompt = "" }) => {
  const { user, token, logout } = useAuth();
  
  // Workspaces & Selection
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  
  // Documents & Chat
  const [documents, setDocuments] = useState([]);
  const [sourceFilter, setSourceFilter] = useState("all"); // "all" | "pdf" | "web" | "github"
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState(initialPrompt);
  
  // Layout states (Collapsible Panels)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contextDrawerOpen, setContextDrawerOpen] = useState(true);
  
  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importType, setImportType] = useState("website");
  const [importUrl, setImportUrl] = useState("");
  const [inspectingDoc, setInspectingDoc] = useState(null);
  
  // Loading & Execution states
  const [isUploading, setIsUploading] = useState(false);
  const [isChatSending, setIsChatSending] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch workspaces & initialize default if empty
  const fetchWorkspaces = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/workspaces`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        let data = await res.json();
        if (data.length === 0) {
          // Auto-create initial default workspace for a smooth onboarding experience
          const createRes = await fetch(`${API_BASE}/api/workspaces`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name: "General Research" })
          });
          if (createRes.ok) {
            const newWs = await createRes.json();
            data = [newWs];
          }
        }
        setWorkspaces(data);
        if (data.length > 0) {
          setActiveWorkspace(prev => prev ? (data.find(w => w.id === prev.id) || data[0]) : data[0]);
        }
      }
    } catch (err) {
      console.error("Error loading workspaces", err);
    }
  };

  // Fetch documents and chat history for the active workspace
  const fetchWorkspaceData = async (workspaceId) => {
    if (!token || !workspaceId) return;
    try {
      const docRes = await fetch(`${API_BASE}/api/chat/${workspaceId}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (docRes.ok) {
        const docData = await docRes.json();
        setDocuments(docData);
      }

      const historyRes = await fetch(`${API_BASE}/api/chat/${workspaceId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setMessages(historyData.map(msg => ({
          ...msg,
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

  // Create Workspace
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
        setWorkspaces(prev => [...prev, newWs]);
        setActiveWorkspace(newWs);
        setNewWorkspaceName("");
      } else {
        const errData = await res.json();
        alert(errData.detail || "Failed to create workspace");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend server.");
    }
  };

  // Delete Workspace
  const handleDeleteWorkspace = async (workspaceId, e) => {
    e.stopPropagation();
    if (!confirm("Delete this workspace and all indexed vectors?")) return;
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
      console.error(err);
    }
  };

  // Upload PDF
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
        setTimeout(() => fetchWorkspaceData(activeWorkspace.id), 1500);
      } else {
        const data = await res.json();
        alert(data.detail || "Failed to process PDF.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading PDF.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Import Web/YouTube/GitHub Link
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
        alert(errData.detail || "Failed to import link.");
      }
    } catch (err) {
      console.error(err);
      alert("Error importing source link.");
    } finally {
      setImportLoading(false);
    }
  };

  // Delete Document
  const handleDeleteDoc = async (docId) => {
    if (!confirm("Delete this document and remove its embeddings from Qdrant?")) return;
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

  // Chat Query
  const handleSendMessage = async (queryText = chatInput) => {
    if (!queryText.trim() || !activeWorkspace || isChatSending) return;
    
    const userMessageText = queryText;
    setChatInput("");
    setIsChatSending(true);

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
        alert(err.detail || "Error communicating with knowledge engine.");
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

  const currentSettings = getSavedSettings();
  const providerLabel = {
    local: "Local Offline Matcher",
    ollama: `Ollama (${currentSettings.model})`,
    gemini: `Gemini (${currentSettings.model})`,
    openai: `OpenAI (${currentSettings.model})`
  }[currentSettings.provider] || "Local";

  // Filtered documents list
  const filteredDocs = documents.filter(doc => {
    if (sourceFilter === "pdf") return doc.source_type === "pdf";
    if (sourceFilter === "web") return doc.source_type === "website" || doc.source_type === "youtube";
    if (sourceFilter === "github") return doc.source_type === "github";
    return true;
  });

  // Filtered workspaces list
  const visibleWorkspaces = workspaces.filter(ws => 
    ws.name.toLowerCase().includes(workspaceSearch.toLowerCase())
  );

  return (
    <div className="workspace-studio">
      {/* ===================================================================
          1. TOP NAVIGATION BAR
          =================================================================== */}
      <header className="workspace-topbar">
        <div className="workspace-topbar-left">
          <button 
            className="btn btn-secondary flex items-center gap-2"
            style={{ padding: "6px 12px", fontSize: "0.82rem" }}
            onClick={onBackToHome}
          >
            <ArrowLeft size={14} /> Back to Website
          </button>

          <div className="flex items-center gap-2" style={{ borderLeft: "1px solid var(--border-subtle)", paddingLeft: "16px" }}>
            <div className="brand-icon-box" style={{ width: 28, height: 28 }}>
              <Compass size={16} />
            </div>
            <span style={{ fontWeight: "700", color: "#fff", fontSize: "1.05rem" }}>InfoSurf</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Studio</span>
          </div>
        </div>

        {/* Center: Active Workspace Name & Switcher */}
        <div className="workspace-topbar-center">
          {activeWorkspace && (
            <div className="flex items-center gap-2" style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border-subtle)", padding: "5px 14px", borderRadius: "var(--radius-full)" }}>
              <Compass size={14} className="text-cyan-400" />
              <span style={{ fontSize: "0.88rem", fontWeight: "600", color: "#fff" }}>
                {activeWorkspace.name}
              </span>
            </div>
          )}
        </div>

        {/* Right: Engine Indicator, Context Panel Toggle, Settings, Logout */}
        <div className="workspace-topbar-right">
          <button 
            className="pill-badge"
            style={{ cursor: "pointer" }}
            onClick={() => setIsSettingsOpen(true)}
            title="Configure AI model engine"
          >
            <Cpu size={12} />
            <span>{providerLabel}</span>
          </button>

          <button 
            className={`btn btn-secondary ${contextDrawerOpen ? "active" : ""}`}
            style={{ padding: "6px 12px", fontSize: "0.82rem", borderColor: contextDrawerOpen ? "var(--accent-cyan)" : "var(--border-subtle)" }}
            onClick={() => setContextDrawerOpen(!contextDrawerOpen)}
            title="Toggle Knowledge Sources Panel"
          >
            <PanelRight size={14} className={contextDrawerOpen ? "text-cyan-400" : ""} />
            <span>Sources ({documents.length})</span>
          </button>

          <div className="flex items-center gap-2" style={{ borderLeft: "1px solid var(--border-subtle)", paddingLeft: "12px" }}>
            <div className="user-profile" title={user?.email} style={{ maxWidth: "120px" }}>
              <div className="message-avatar" style={{ width: 26, height: 26, fontSize: "0.75rem" }}>
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <span style={{ fontSize: "0.82rem" }}>{user?.email}</span>
            </div>

            <button className="icon-btn" title="Settings" onClick={() => setIsSettingsOpen(true)}>
              <Settings size={16} />
            </button>
            <button className="icon-btn" title="Sign Out" onClick={logout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ===================================================================
          2. WORKSPACE 3-COLUMN STUDIO BODY
          =================================================================== */}
      <div className="workspace-body">
        {/* -----------------------------------------------------------------
            LEFT SIDEBAR: Workspaces & Research Sessions
            ----------------------------------------------------------------- */}
        <aside className={`workspace-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
          <div className="sidebar-header">
            {!sidebarCollapsed && (
              <button 
                className="new-research-btn"
                onClick={() => {
                  const name = prompt("Enter a name for your new research workspace:");
                  if (name && name.trim()) {
                    setNewWorkspaceName(name.trim());
                    handleCreateWorkspace({ preventDefault: () => {} });
                  }
                }}
              >
                <Plus size={16} />
                <span>New Workspace</span>
              </button>
            )}
            <button 
              className="icon-btn" 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {!sidebarCollapsed ? (
            <div className="sidebar-scrollable">
              {/* Workspace Search Filter */}
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: "var(--text-muted)" }} />
                <input
                  type="text"
                  placeholder="Filter workspaces..."
                  value={workspaceSearch}
                  onChange={(e) => setWorkspaceSearch(e.target.value)}
                  style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: "7px 10px 7px 30px", fontSize: "0.82rem", color: "#fff", outline: "none" }}
                />
              </div>

              {/* Workspaces List */}
              <div>
                <div className="section-label">Your Workspaces ({workspaces.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  {visibleWorkspaces.map((ws) => (
                    <div
                      key={ws.id}
                      className={`workspace-item ${activeWorkspace?.id === ws.id ? "active" : ""}`}
                      onClick={() => setActiveWorkspace(ws)}
                    >
                      <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
                        <Compass size={15} className="shrink-0" />
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {ws.name}
                        </span>
                      </div>
                      <button
                        className="workspace-delete-btn"
                        onClick={(e) => handleDeleteWorkspace(ws.id, e)}
                        title="Delete workspace"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  {workspaces.length === 0 && (
                    <p className="text-xs text-secondary" style={{ padding: "8px" }}>Creating workspace...</p>
                  )}
                </div>
              </div>

              {/* Quick Add Workspace Form */}
              <form onSubmit={handleCreateWorkspace} style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div className="section-label">Quick Create</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Workspace name..."
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", padding: "6px 10px", fontSize: "0.82rem", color: "#fff", outline: "none" }}
                  />
                  <button type="submit" className="btn btn-secondary" style={{ padding: "6px 10px" }} title="Add workspace">
                    <Plus size={14} />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  className={`icon-btn ${activeWorkspace?.id === ws.id ? "text-cyan-400" : ""}`}
                  onClick={() => setActiveWorkspace(ws)}
                  title={ws.name}
                  style={{ background: activeWorkspace?.id === ws.id ? "rgba(0,210,255,0.12)" : "transparent" }}
                >
                  <Compass size={18} />
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* -----------------------------------------------------------------
            CENTER: Calm, Focused Editorial Research Stream
            ----------------------------------------------------------------- */}
        <main className="workspace-main-pane">
          <div className="research-stream-container">
            <div className="research-stream-content">
              {messages.length === 0 ? (
                /* Editorial Empty State */
                <div className="editorial-empty-state">
                  <div className="editorial-empty-icon">
                    <Sparkles size={28} />
                  </div>
                  <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.03em", marginBottom: "12px" }}>
                    What are you researching today?
                  </h2>
                  <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    Ask natural language questions across all indexed documents, websites, repositories, and transcripts in <strong>{activeWorkspace?.name}</strong>.
                  </p>

                  {documents.length === 0 && (
                    <div className="info-box-success flex items-center gap-3" style={{ marginTop: "24px", textAlign: "left" }}>
                      <ShieldAlert size={20} className="text-cyan-400 shrink-0" />
                      <p style={{ margin: 0 }}>
                        <strong>Workspace Ready:</strong> Upload your first PDF or add website links in the right panel to begin semantic vector search.
                      </p>
                    </div>
                  )}

                  {/* Starter Research Prompts */}
                  <div className="starter-suggestions-grid">
                    <div 
                      className="starter-card"
                      onClick={() => handleSendMessage("Summarize the main methodology, datasets, and conclusions from the indexed documents.")}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-cyan-400" />
                        <span style={{ fontSize: "0.88rem", fontWeight: "600", color: "#fff" }}>Summarize Documents</span>
                      </div>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        Extract core methodology, findings, and key takeaways.
                      </span>
                    </div>

                    <div 
                      className="starter-card"
                      onClick={() => handleSendMessage("Compare the key differences and tradeoffs presented across the uploaded sources.")}
                    >
                      <div className="flex items-center gap-2">
                        <Layers size={14} className="text-indigo-400" />
                        <span style={{ fontSize: "0.88rem", fontWeight: "600", color: "#fff" }}>Comparative Analysis</span>
                      </div>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        Cross-reference insights and compare architectural tradeoffs.
                      </span>
                    </div>

                    <div 
                      className="starter-card"
                      onClick={() => handleSendMessage("Explain the system architecture and list all API endpoints in the repository.")}
                    >
                      <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-purple-400" />
                        <span style={{ fontSize: "0.88rem", fontWeight: "600", color: "#fff" }}>Codebase Extraction</span>
                      </div>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        Locate API routers, schemas, and implementation logic.
                      </span>
                    </div>

                    <div 
                      className="starter-card"
                      onClick={() => handleSendMessage("What are the most cited claims and evidence in these sources?")}
                    >
                      <div className="flex items-center gap-2">
                        <ShieldAlert size={14} className="text-emerald-400" />
                        <span style={{ fontSize: "0.88rem", fontWeight: "600", color: "#fff" }}>Citation Discovery</span>
                      </div>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        Trace factual claims back to supporting citations.
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Message Stream */
                messages.map((msg) => (
                  <div key={msg.id} className="research-message-row">
                    {msg.role === "user" ? (
                      <div className="user-query-card">
                        {msg.content}
                      </div>
                    ) : (
                      <FormattedAnswer
                        content={msg.content}
                        citations={msg.citations}
                        onCitationClick={(cite) => {
                          if (cite && cite.doc_id) {
                            const found = documents.find(d => d.id === cite.doc_id);
                            if (found) setInspectingDoc(found);
                            else if (cite.source_url) window.open(cite.source_url, "_blank");
                          } else if (cite && cite.source_url) {
                            window.open(cite.source_url, "_blank");
                          }
                        }}
                      />
                    )}
                  </div>
                ))
              )}

              {/* In-Flight RAG Telemetry Loading Indicator */}
              {isChatSending && (
                <div className="assistant-response-paper" style={{ animation: "pulseGlow 2s infinite" }}>
                  <div className="flex items-center gap-3">
                    <RefreshCw className="animate-spin text-cyan-400 shrink-0" size={18} />
                    <div>
                      <div style={{ fontSize: "0.92rem", fontWeight: "600", color: "#fff" }}>
                        Researching knowledge base...
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                        Embedding query → Retrieving Qdrant vector hits → Synthesizing cited answer
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Research Composer */}
          <div className="workspace-composer-wrapper">
            <div className="research-composer-box">
              <textarea
                className="composer-textarea"
                placeholder="Ask InfoSurf anything about your research materials..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isChatSending}
              />

              <div className="composer-controls-row">
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    className="btn btn-secondary flex items-center gap-2"
                    style={{ padding: "6px 12px", fontSize: "0.78rem", borderRadius: "var(--radius-full)" }}
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach local PDF"
                  >
                    <Paperclip size={13} /> Attach PDF
                  </button>

                  <button 
                    type="button"
                    className="btn btn-secondary flex items-center gap-2"
                    style={{ padding: "6px 12px", fontSize: "0.78rem", borderRadius: "var(--radius-full)" }}
                    onClick={() => setIsImportOpen(true)}
                    title="Add Web / YouTube / GitHub Link"
                  >
                    <Globe size={13} /> Add URL Link
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span style={{ fontSize: "0.74rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                    ↵ Enter to send
                  </span>

                  <button 
                    type="button"
                    className="btn btn-gradient flex items-center justify-center"
                    style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", padding: 0 }}
                    onClick={() => handleSendMessage()}
                    disabled={isChatSending || !chatInput.trim()}
                    title="Execute research query"
                  >
                    {isChatSending ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* -----------------------------------------------------------------
            RIGHT CONTEXT / SOURCES DRAWER
            ----------------------------------------------------------------- */}
        <aside className={`workspace-context-drawer ${contextDrawerOpen ? "" : "closed"}`}>
          <div className="context-drawer-header">
            <div className="flex items-center gap-2">
              <Paperclip size={16} className="text-cyan-400" />
              <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "#fff" }}>Knowledge Sources</span>
              <span className="citation-index" style={{ fontSize: "0.7rem" }}>{documents.length}</span>
            </div>
            <button className="icon-btn" onClick={() => setContextDrawerOpen(false)} title="Close drawer">
              &times;
            </button>
          </div>

          <div className="context-drawer-body">
            {/* Drag and Drop PDF Upload */}
            <div className="upload-drag" onClick={() => fileInputRef.current?.click()}>
              <UploadCloud size={24} className="text-cyan-400" />
              <p><strong>Upload PDF Document</strong></p>
              <p>Click to browse local files</p>
              {isUploading && <p className="text-cyan-400">Embedding vectors in Qdrant...</p>}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".pdf"
                onChange={handlePDFUpload}
              />
            </div>

            {/* URL Link Importer Trigger */}
            <button 
              type="button" 
              className="btn btn-secondary flex items-center justify-center gap-2"
              style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
              onClick={() => setIsImportOpen(true)}
            >
              <Plus size={14} /> Add Web / YouTube / GitHub
            </button>

            {/* Source Type Filter Tabs */}
            <div className="source-filters-row">
              <button 
                className={`source-filter-btn ${sourceFilter === "all" ? "active" : ""}`}
                onClick={() => setSourceFilter("all")}
              >
                All ({documents.length})
              </button>
              <button 
                className={`source-filter-btn ${sourceFilter === "pdf" ? "active" : ""}`}
                onClick={() => setSourceFilter("pdf")}
              >
                PDFs
              </button>
              <button 
                className={`source-filter-btn ${sourceFilter === "web" ? "active" : ""}`}
                onClick={() => setSourceFilter("web")}
              >
                Web/Video
              </button>
              <button 
                className={`source-filter-btn ${sourceFilter === "github" ? "active" : ""}`}
                onClick={() => setSourceFilter("github")}
              >
                Code
              </button>
            </div>

            {/* Indexed Sources List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredDocs.map((doc) => {
                const IconComponent = {
                  pdf: FileText,
                  website: Globe,
                  github: GithubIcon,
                  youtube: YoutubeIcon
                }[doc.source_type] || FileText;

                return (
                  <div key={doc.id} className="source-item-card">
                    <div style={{ minWidth: 0, flex: 1, cursor: "pointer" }} onClick={() => setInspectingDoc(doc)}>
                      <div className="flex items-center gap-2" style={{ marginBottom: "4px" }}>
                        <IconComponent size={14} className="text-cyan-400 shrink-0" />
                        <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }} title={doc.name}>
                          {doc.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`status-badge status-${doc.status}`}>
                          <span className="status-dot-pulse" style={{ width: 5, height: 5 }} />
                          {doc.status}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          {doc.source_type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button 
                        className="icon-btn" 
                        style={{ padding: "4px" }} 
                        onClick={() => setInspectingDoc(doc)}
                        title="Inspect parsed text"
                      >
                        <Search size={13} />
                      </button>
                      <button 
                        className="icon-btn" 
                        style={{ padding: "4px" }} 
                        onClick={() => handleDeleteDoc(doc.id)}
                        title="Delete source"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {documents.length === 0 && (
                <div style={{ padding: "24px 12px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                  No sources indexed yet. Add a PDF or link above.
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ===================================================================
          MODALS
          =================================================================== */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      <ImportLinkModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        importType={importType}
        setImportType={setImportType}
        url={importUrl}
        setUrl={setImportUrl}
        onImport={handleImportLink}
        loading={importLoading}
      />

      <DocumentInspectorModal
        doc={inspectingDoc}
        isOpen={!!inspectingDoc}
        onClose={() => setInspectingDoc(null)}
      />
    </div>
  );
};

export default WorkspaceView;
