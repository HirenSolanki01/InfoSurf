import React, { useState } from "react";
import { ShieldCheck, FileText, Globe, Code, ExternalLink, HelpCircle } from "lucide-react";

// Inline Custom SVG for GitHub
const GithubIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const CitationExperience = () => {
  const [hoveredSource, setHoveredSource] = useState(null);

  const sources = [
    {
      id: 1,
      title: "arXiv:2005.11401 (Lewis et al.)",
      type: "Research Paper (PDF)",
      icon: FileText,
      meta: "Section 3.2 · Page 4",
      highlightText: "Retrieval-Augmented Generation combines parametric memory (pre-trained weights) with non-parametric dense vector indices, allowing models to update factual knowledge dynamically without expensive retraining."
    },
    {
      id: 2,
      title: "HuggingFace Technical Report",
      type: "Technical Article (Web)",
      icon: Globe,
      meta: "huggingface.co/blog/rag · 2024",
      highlightText: "By injecting retrieved passages directly into the prompt context, RAG architectures reduce hallucination rates by over 68% in domain-specific technical queries."
    },
    {
      id: 3,
      title: "qdrant/fastapi-rag-core",
      type: "GitHub Repository",
      icon: GithubIcon,
      meta: "rag_service.py · Line 128",
      highlightText: "Furthermore, workspace-level metadata filtering in Qdrant ensures strict isolation of sensitive enterprise documents during semantic similarity ranking."
    }
  ];

  return (
    <section id="citations" className="section-container">
      <div className="section-header">
        <div className="pill-badge" style={{ borderColor: "rgba(16, 185, 129, 0.3)", color: "var(--accent-emerald)", background: "rgba(16, 185, 129, 0.08)" }}>
          <ShieldCheck size={13} />
          <span>Verifiable Grounding</span>
        </div>
        <h2 className="section-title">
          Don't just trust the answer. <br />
          Explore where it came from.
        </h2>
        <p className="section-subtitle">
          Hover over any source card below to see the exact passage in the answer that was extracted and grounded by that source.
        </p>
      </div>

      <div className="citation-demo-box">
        {/* Sample Question */}
        <div className="citation-query-bar">
          <HelpCircle size={20} className="text-cyan-400 shrink-0" />
          <div style={{ fontSize: "0.98rem", fontWeight: "600", color: "#ffffff" }}>
            Question: What are the main advantages of Retrieval-Augmented Generation (RAG)?
          </div>
        </div>

        {/* Synthesized Answer with Interactive Grounding Highlights */}
        <div className="citation-answer-content">
          <p style={{ marginBottom: "16px" }}>
            Based on the indexed research materials in your workspace:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div 
              className={`grounded-segment ${hoveredSource === 1 ? "active-highlight" : ""}`}
              onMouseEnter={() => setHoveredSource(1)}
              onMouseLeave={() => setHoveredSource(null)}
            >
              1. {sources[0].highlightText}{" "}
              <span className="citation-badge" style={{ cursor: "pointer" }}>[1]</span>
            </div>

            <div 
              className={`grounded-segment ${hoveredSource === 2 ? "active-highlight" : ""}`}
              onMouseEnter={() => setHoveredSource(2)}
              onMouseLeave={() => setHoveredSource(null)}
            >
              2. {sources[1].highlightText}{" "}
              <span className="citation-badge" style={{ cursor: "pointer" }}>[2]</span>
            </div>

            <div 
              className={`grounded-segment ${hoveredSource === 3 ? "active-highlight" : ""}`}
              onMouseEnter={() => setHoveredSource(3)}
              onMouseLeave={() => setHoveredSource(null)}
            >
              3. {sources[2].highlightText}{" "}
              <span className="citation-badge" style={{ cursor: "pointer" }}>[3]</span>
            </div>
          </div>
        </div>

        {/* Interactive Source Cards */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "20px" }}>
          <div style={{ fontSize: "0.8rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "14px" }}>
            Linked Knowledge Sources (Hover to inspect provenance)
          </div>
          <div className="interactive-sources-list">
            {sources.map((src) => {
              const IconComp = src.icon;
              const isActive = hoveredSource === src.id;
              return (
                <div 
                  key={src.id}
                  className={`interactive-source-card ${isActive ? "active" : ""}`}
                  onMouseEnter={() => setHoveredSource(src.id)}
                  onMouseLeave={() => setHoveredSource(null)}
                >
                  <div className="flex items-center justify-between">
                    <span className="citation-index" style={{ background: isActive ? "var(--accent-cyan)" : "rgba(0, 210, 255, 0.15)", color: isActive ? "#000" : "var(--accent-cyan)" }}>
                      Source 0{src.id}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {src.meta}
                    </span>
                  </div>
                  <div className="flex items-center gap-2" style={{ marginTop: "4px" }}>
                    <IconComp size={15} className="text-cyan-400 shrink-0" />
                    <span style={{ fontSize: "0.88rem", fontWeight: "600", color: "#ffffff" }}>
                      {src.title}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                    {src.type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CitationExperience;
