import React, { useState } from "react";
import { 
  FolderDown, Cpu, Search, Sparkles, 
  Layers, ArrowRight, CheckCircle2, ShieldCheck, Database 
} from "lucide-react";

const HowItWorks = () => {
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    {
      number: "01",
      name: "CONNECT",
      title: "Universal Source Ingestion",
      desc: "Upload PDFs directly or link live website articles, GitHub repositories, and YouTube video URLs. InfoSurf extracts pure text streams while removing boilerplate and markup.",
      metricLabel: "Supported Formats",
      metricValue: "PDF · HTML · Python · JS/TS · YouTube Subtitles",
      icon: FolderDown,
      accent: "var(--accent-cyan)"
    },
    {
      number: "02",
      name: "UNDERSTAND",
      title: "Recursive Chunking & Vectorization",
      desc: "Text is segmented into overlapping semantic chunks (600 characters with 60-character sliding overlap) and mapped into 384-dimensional vector embeddings using all-MiniLM-L6-v2.",
      metricLabel: "Embedding Model",
      metricValue: "SentenceTransformers 384-dim (Local)",
      icon: Cpu,
      accent: "var(--accent-indigo)"
    },
    {
      number: "03",
      name: "RETRIEVE",
      title: "Workspace-Isolated Semantic Search",
      desc: "When you ask a research question, your query is embedded in real-time and matched against your workspace index in Qdrant using high-performance cosine similarity ranking.",
      metricLabel: "Search Latency",
      metricValue: "< 25ms Vector Cosine Filter",
      icon: Search,
      accent: "var(--accent-purple)"
    },
    {
      number: "04",
      name: "ANSWER",
      title: "Grounded Synthesis & Citations",
      desc: "Top relevant chunks are assembled into a context prompt. The engine (Ollama Llama 3.1, Gemini, or Local Matcher) generates an answer containing verifiable [1] citations.",
      metricLabel: "Fact Grounding",
      metricValue: "100% Traceable Source Provenance",
      icon: ShieldCheck,
      accent: "var(--accent-emerald)"
    }
  ];

  return (
    <section id="how-it-works" className="section-container">
      <div className="section-header">
        <div className="pill-badge">
          <Layers size={13} />
          <span>The Research Journey</span>
        </div>
        <h2 className="section-title">
          From information to insight.
        </h2>
        <p className="section-subtitle">
          Follow how raw unstructured documents and multimedia links are transformed into deterministic, cited knowledge.
        </p>
      </div>

      <div className="stages-journey-grid">
        {stages.map((stage, idx) => {
          const IconComponent = stage.icon;
          const isSelected = activeStage === idx;
          return (
            <div 
              key={idx} 
              className="glass-card stage-step-card"
              style={{
                borderColor: isSelected ? stage.accent : "var(--border-subtle)",
                boxShadow: isSelected ? `0 8px 30px rgba(0, 210, 255, 0.15)` : "none"
              }}
              onMouseEnter={() => setActiveStage(idx)}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="stage-number">{stage.number}</span>
                  <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: stage.accent }}>
                    <IconComponent size={18} />
                  </div>
                </div>
                <div className="stage-badge-small" style={{ color: stage.accent }}>
                  STAGE {stage.number} — {stage.name}
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "10px", color: "#ffffff" }}>
                  {stage.title}
                </h3>
                <p style={{ fontSize: "0.88rem", lineHeight: "1.55", color: "var(--text-secondary)" }}>
                  {stage.desc}
                </p>
              </div>

              <div style={{ marginTop: "24px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "3px" }}>
                <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  {stage.metricLabel}
                </span>
                <span style={{ fontSize: "0.82rem", fontWeight: "600", color: stage.accent, fontFamily: "var(--font-mono)" }}>
                  {stage.metricValue}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWorks;
