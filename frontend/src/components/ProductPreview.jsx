import React, { useState } from "react";
import { 
  FileText, Globe, Database, ArrowRight, ShieldCheck, 
  Sparkles, CheckCircle2, Terminal, Play, Cpu, ExternalLink 
} from "lucide-react";

// Inline Custom SVG
const GithubIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const YoutubeIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3v6Z" />
  </svg>
);

const ProductPreview = ({ onOpenWorkspace }) => {
  const [activeTab, setActiveTab] = useState("multisource");

  const showcaseData = {
    multisource: {
      workspaceName: "Autonomous Systems Research",
      engine: "SentenceTransformers + Qdrant",
      documents: [
        { name: "neural_navigation_v3.pdf", type: "pdf", status: "active", icon: FileText },
        { name: "pytorch-robotics-core/main", type: "github", status: "active", icon: GithubIcon },
        { name: "ieee-spectrum.org/robotics", type: "website", status: "active", icon: Globe },
        { name: "MIT 6.S094 Lecture 04", type: "youtube", status: "active", icon: YoutubeIcon },
      ],
      userPrompt: "How does the trajectory planner handle dynamic obstacle avoidance under latency constraints?",
      answer: "The trajectory planner employs a receding-horizon optimization model [1] that integrates real-time LiDAR point clouds with inertial state estimators. To mitigate latency under 45ms, the controller computes collision-free spline trajectories using vectorized SIMD kernels in PyTorch [2], while bounding uncertainty through predictive risk metrics extracted from recent IEEE benchmarks [3].",
      citations: [
        { index: 1, name: "neural_navigation_v3.pdf (p. 14)", type: "pdf" },
        { index: 2, name: "pytorch-robotics-core/planner.py", type: "github" },
        { index: 3, name: "ieee-spectrum.org/robotics", type: "website" }
      ]
    },
    pdf: {
      workspaceName: "Transformer Attention Benchmarks",
      engine: "all-MiniLM-L6-v2 (Local)",
      documents: [
        { name: "attention_is_all_you_need.pdf", type: "pdf", status: "active", icon: FileText },
        { name: "flash_attention_v2.pdf", type: "pdf", status: "active", icon: FileText },
        { name: "kv_cache_compression.pdf", type: "pdf", status: "active", icon: FileText }
      ],
      userPrompt: "Compare the memory complexity of standard Multi-Head Attention vs FlashAttention-2.",
      answer: "Standard MHA scales with quadratic memory complexity O(N²) relative to sequence length N because it materializes intermediate N×N attention matrices in high-bandwidth memory (HBM) [1]. In contrast, FlashAttention-2 computes exact attention with O(N) memory complexity by tiling matrix operations into fast SRAM caches and fusing softmax passes [2].",
      citations: [
        { index: 1, name: "attention_is_all_you_need.pdf (p. 4)", type: "pdf" },
        { index: 2, name: "flash_attention_v2.pdf (p. 7)", type: "pdf" }
      ]
    },
    github: {
      workspaceName: "FastAPI Microservices Architecture",
      engine: "Qdrant Vector Engine",
      documents: [
        { name: "backend/app/main.py", type: "github", status: "active", icon: GithubIcon },
        { name: "backend/app/services/rag_service.py", type: "github", status: "active", icon: GithubIcon },
        { name: "backend/app/security.py", type: "github", status: "active", icon: GithubIcon }
      ],
      userPrompt: "Where are vector embeddings inserted and how are workspace filters applied?",
      answer: "Vector points are generated and upserted in batches of 100 via `rag_service.py` using `qdrant_client.upsert()` [1]. Similarity queries apply strict metadata filters on `workspace_id` using Qdrant's `FieldCondition` model inside `search_workspace()` [2], preventing cross-tenant data leakage.",
      citations: [
        { index: 1, name: "rag_service.py (Lines 80-95)", type: "github" },
        { index: 2, name: "rag_service.py (Lines 110-125)", type: "github" }
      ]
    }
  };

  const current = showcaseData[activeTab] || showcaseData.multisource;

  return (
    <section id="product" className="section-container">
      <div className="section-header">
        <div className="pill-badge">
          <Sparkles size={13} />
          <span>Interactive Product Showcase</span>
        </div>
        <h2 className="section-title">
          Your entire research workflow, in one place.
        </h2>
        <p className="section-subtitle">
          Experience the unified workspace for indexing, querying, and grounded synthesis across heterogeneous sources.
        </p>
      </div>

      <div className="product-showcase-window">
        {/* Window Titlebar */}
        <div className="window-titlebar">
          <div className="window-dots">
            <span className="window-dot dot-red" />
            <span className="window-dot dot-yellow" />
            <span className="window-dot dot-green" />
          </div>

          <div className="window-tab-selector">
            <button 
              className={`tab-btn ${activeTab === "multisource" ? "active" : ""}`}
              onClick={() => setActiveTab("multisource")}
            >
              Multi-Source Synthesis
            </button>
            <button 
              className={`tab-btn ${activeTab === "pdf" ? "active" : ""}`}
              onClick={() => setActiveTab("pdf")}
            >
              PDF Deep Analysis
            </button>
            <button 
              className={`tab-btn ${activeTab === "github" ? "active" : ""}`}
              onClick={() => setActiveTab("github")}
            >
              Codebase Intelligence
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="status-dot-pulse" />
            <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
              {current.engine}
            </span>
          </div>
        </div>

        {/* Window Workspace Layout */}
        <div className="showcase-layout">
          {/* Sidebar Sources */}
          <div className="showcase-sidebar">
            <div>
              <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px" }}>
                Active Workspace
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-primary)" }}>
                {current.workspaceName}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "10px" }}>
                Knowledge Sources ({current.documents.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {current.documents.map((doc, idx) => {
                  const IconComponent = doc.icon;
                  return (
                    <div key={idx} className="glass-card" style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "var(--radius-sm)" }}>
                      <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
                        <IconComponent size={14} className="text-cyan-400 shrink-0" />
                        <span style={{ fontSize: "0.82rem", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {doc.name}
                        </span>
                      </div>
                      <span className="status-dot-pulse" style={{ width: 5, height: 5 }} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: "auto", padding: "12px", background: "rgba(0, 210, 255, 0.05)", border: "1px dashed rgba(0, 210, 255, 0.2)", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--accent-cyan)" }}>
                + Add PDF / URL / GitHub / Video
              </span>
            </div>
          </div>

          {/* Main Chat Dialog Stream */}
          <div className="showcase-main">
            {/* User Prompt */}
            <div style={{ alignSelf: "flex-end", maxWidth: "85%", background: "var(--gradient-accent)", color: "#ffffff", padding: "12px 18px", borderRadius: "16px 16px 2px 16px", fontSize: "0.92rem", lineHeight: "1.5" }}>
              {current.userPrompt}
            </div>

            {/* Assistant Synthesized Answer */}
            <div className="glass-card" style={{ alignSelf: "flex-start", maxWidth: "90%", padding: "18px 22px", borderRadius: "16px 16px 16px 2px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="flex items-center gap-2">
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--gradient-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "800", color: "#fff" }}>
                  AI
                </div>
                <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--accent-cyan)" }}>InfoSurf Synthesis</span>
              </div>

              <div style={{ fontSize: "0.92rem", lineHeight: "1.65", color: "var(--text-primary)" }}>
                {current.answer}
              </div>

              {/* Citations references */}
              <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "12px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", alignSelf: "center", marginRight: "4px" }}>
                  Grounding Citations:
                </span>
                {current.citations.map((cite) => (
                  <div 
                    key={cite.index}
                    className="citation-card"
                    style={{ background: "rgba(0, 210, 255, 0.08)", borderColor: "rgba(0, 210, 255, 0.25)" }}
                  >
                    <span className="citation-index">[{cite.index}]</span>
                    <span style={{ color: "var(--text-primary)" }}>{cite.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock input bar */}
            <div style={{ marginTop: "auto", display: "flex", gap: "10px", background: "rgba(17, 19, 24, 0.8)", border: "1px solid var(--border-subtle)", padding: "10px 16px", borderRadius: "var(--radius-md)" }}>
              <input 
                type="text" 
                readOnly 
                value="Ask a follow-up question or query across linked documents..." 
                style={{ flex: 1, background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "0.88rem", outline: "none" }}
              />
              <button 
                className="btn btn-gradient"
                style={{ padding: "6px 16px", fontSize: "0.8rem" }}
                onClick={onOpenWorkspace}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <button 
          className="btn btn-primary btn-arrow"
          onClick={onOpenWorkspace}
        >
          <span>Launch Your Live Workspace</span>
          <ArrowRight size={16} className="arrow-icon" />
        </button>
      </div>
    </section>
  );
};

export default ProductPreview;
