import React, { useState } from "react";
import { 
  Search, ArrowRight, Sparkles, FileText, Globe, 
  Database, Cpu, CheckCircle2, ShieldCheck, ArrowUpRight 
} from "lucide-react";

// Inline Custom SVG for GitHub & YouTube
const GithubIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const YoutubeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3v6Z" />
  </svg>
);

const HeroSection = ({ onStartResearch, onExplore }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const samplePrompts = [
    "Summarize RAG architecture tradeoffs",
    "Extract API endpoints from GitHub repository",
    "Analyze findings from uploaded research PDFs",
    "Synthesize video lecture transcripts"
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onStartResearch(searchQuery);
  };

  const handleSelectPrompt = (promptText) => {
    setSearchQuery(promptText);
  };

  return (
    <section className="hero-section">
      <div className="hero-glow-blob" />
      
      <div className="hero-content">
        <div className="pill-badge">
          <span className="status-dot-pulse" />
          <span>Retrieval-Augmented Intelligence Hub</span>
        </div>

        <h1 className="hero-title">
          Research, without the <br />
          <span className="gradient-text">information overload.</span>
        </h1>

        <p className="hero-description">
          InfoSurf brings your documents, web sources, repositories, and transcripts together into one intelligent research workspace grounded in verifiable citations.
        </p>

        {/* Interactive Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hero-search-wrapper">
          <div className="hero-search-box">
            <Search size={22} className="text-cyan-400 shrink-0" />
            <input
              type="text"
              className="hero-search-input"
              placeholder="Ask anything about your research..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-gradient btn-arrow" style={{ padding: "10px 20px" }}>
              <span>Research</span>
              <ArrowRight size={15} className="arrow-icon" />
            </button>
          </div>

          <div className="hero-prompt-suggestions">
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginRight: "4px" }}>Try asking:</span>
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                className="prompt-chip"
                onClick={() => handleSelectPrompt(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </form>

        <div className="flex items-center justify-center gap-4" style={{ marginTop: "30px" }}>
          <button 
            className="btn btn-primary btn-arrow" 
            onClick={() => onStartResearch(searchQuery)}
          >
            <span>Start Researching</span>
            <ArrowUpRight size={16} className="arrow-icon" />
          </button>
          <a 
            href="#product" 
            className="btn btn-secondary"
          >
            Explore InfoSurf
          </a>
        </div>
      </div>

      {/* Hero Visual: Information Flowing into Knowledge */}
      <div className="hero-visual-container">
        <div className="data-flow-board">
          {/* Node 1: Multi-Source Ingestion */}
          <div className="glass-card flow-node-card">
            <div className="flow-node-header">
              <div className="flow-node-icon" style={{ background: "rgba(0, 210, 255, 0.1)", color: "var(--accent-cyan)" }}>
                <FileText size={18} />
              </div>
              <span className="flow-node-step">01 INGEST</span>
            </div>
            <div className="flow-node-title">Universal Sources</div>
            <div className="flow-node-desc">
              Parse PDFs, web pages, GitHub archives, and YouTube transcripts into clean text streams.
            </div>
          </div>

          {/* Node 2: Vector Embeddings */}
          <div className="glass-card flow-node-card">
            <div className="flow-node-header">
              <div className="flow-node-icon" style={{ background: "rgba(99, 102, 241, 0.1)", color: "var(--accent-indigo)" }}>
                <Cpu size={18} />
              </div>
              <span className="flow-node-step">02 EMBED</span>
            </div>
            <div className="flow-node-title">Sentence Vectors</div>
            <div className="flow-node-desc">
              Chunk context recursively and compute 384-dim semantic embeddings via all-MiniLM-L6-v2.
            </div>
          </div>

          {/* Node 3: Qdrant Retrieval */}
          <div className="glass-card flow-node-card">
            <div className="flow-node-header">
              <div className="flow-node-icon" style={{ background: "rgba(139, 92, 246, 0.1)", color: "var(--accent-purple)" }}>
                <Database size={18} />
              </div>
              <span className="flow-node-step">03 RETRIEVE</span>
            </div>
            <div className="flow-node-title">Qdrant Search</div>
            <div className="flow-node-desc">
              Sub-second cosine similarity search isolated strictly within user workspaces.
            </div>
          </div>

          {/* Node 4: Cited Synthesis */}
          <div className="glass-card flow-node-card" style={{ border: "1px solid rgba(0, 210, 255, 0.3)" }}>
            <div className="flow-node-header">
              <div className="flow-node-icon" style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--accent-emerald)" }}>
                <ShieldCheck size={18} />
              </div>
              <span className="flow-node-step" style={{ color: "var(--accent-emerald)" }}>04 GROUND</span>
            </div>
            <div className="flow-node-title">Verified Synthesis</div>
            <div className="flow-node-desc">
              Grounded answers generated with clickable [1] citations linking to exact source passages.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
