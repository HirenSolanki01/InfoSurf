import React from "react";
import { 
  Cpu, Database, Server, Code2, Lock, 
  Terminal, Layers, Sparkles, ShieldCheck 
} from "lucide-react";

const TechStackSection = () => {
  const techSpecs = [
    {
      category: "Frontend Architecture",
      tech: "React 19 + Vite",
      details: "Single-page application styled via custom Vanilla CSS design tokens, offering high rendering performance and zero bloated runtime CSS dependencies.",
      icon: Code2
    },
    {
      category: "Backend Engine",
      tech: "FastAPI + Python 3.13",
      details: "High-throughput asynchronous REST API server powered by Uvicorn, exposing workspace management, file streams, and RAG query endpoints.",
      icon: Server
    },
    {
      category: "Vector Database",
      tech: "Qdrant Vector Engine",
      details: "Local persistent vector storage utilizing cosine similarity search and metadata filters to maintain sub-25ms retrieval latency with workspace isolation.",
      icon: Database
    },
    {
      category: "Embedding Model",
      tech: "SentenceTransformers (MiniLM)",
      details: "Dense 384-dimensional vector representations computed locally using all-MiniLM-L6-v2 without external API latency or privacy leaks.",
      icon: Cpu
    },
    {
      category: "Database & Security",
      tech: "SQLAlchemy + PBKDF2 + JWT",
      details: "Relational schema management with SQLite/PostgreSQL, password hashing via native PBKDF2-HMAC-SHA256, and OAuth2 bearer token authentication.",
      icon: Lock
    },
    {
      category: "Ingestion Parsers",
      tech: "PyPDF · BeautifulSoup · YouTube API",
      details: "Multi-format parsers extracting sanitized text from PDF documents, live websites, GitHub code archives, and YouTube video transcripts.",
      icon: Layers
    }
  ];

  return (
    <section id="technology" className="section-container">
      <div className="section-header">
        <div className="pill-badge">
          <Terminal size={13} />
          <span>Engineering Specifications</span>
        </div>
        <h2 className="section-title">
          Modern engineering. Zero bloat.
        </h2>
        <p className="section-subtitle">
          Built with an enterprise-grade Python and React stack designed for local reproducibility, performance, and deterministic security.
        </p>
      </div>

      <div className="tech-grid">
        {techSpecs.map((spec, idx) => {
          const IconComp = spec.icon;
          return (
            <div key={idx} className="glass-card tech-spec-card">
              <div className="tech-spec-icon">
                <IconComp size={20} />
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                  {spec.category}
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#ffffff", marginBottom: "6px" }}>
                  {spec.tech}
                </h3>
                <p style={{ fontSize: "0.85rem", lineHeight: "1.55", color: "var(--text-secondary)" }}>
                  {spec.details}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TechStackSection;
