import React from "react";
import { 
  AlertTriangle, CheckCircle2, FileQuestion, Layers, 
  Split, Network, ArrowRight, ShieldCheck, Zap 
} from "lucide-react";

const ProblemSection = () => {
  return (
    <section className="section-container">
      <div className="section-header">
        <div className="pill-badge" style={{ borderColor: "rgba(244, 63, 94, 0.3)", color: "var(--accent-rose)", background: "rgba(244, 63, 94, 0.08)" }}>
          <AlertTriangle size={13} />
          <span>The Knowledge Fragmentation Crisis</span>
        </div>
        <h2 className="section-title">
          Research is fragmented.
        </h2>
        <p className="section-subtitle">
          Information lives scattered across disconnected silos, PDF folders, browser tabs, and code repositories. Finding verifiable answers takes hours of manual hunting.
        </p>
      </div>

      <div className="comparison-grid">
        {/* Left: Fragmented Chaos */}
        <div className="problem-card fragmented">
          <span className="problem-tag">The Disconnected Reality</span>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "12px", color: "#ffffff" }}>
            Chaos of Isolated Silos
          </h3>
          <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)" }}>
            Researchers constantly jump between PDF viewers, GitHub trees, documentation sites, and video timestamps—losing context and hallucinating ungrounded assumptions.
          </p>

          <div className="silos-cluster">
            <div className="silo-item">
              <FileQuestion size={16} /> 40+ Open Browser Tabs
            </div>
            <div className="silo-item">
              <Split size={16} /> Untracked PDF Annotations
            </div>
            <div className="silo-item">
              <Layers size={16} /> Disconnected GitHub Files
            </div>
            <div className="silo-item">
              <AlertTriangle size={16} /> Unverified AI Hallucinations
            </div>
            <div className="silo-item">
              <Split size={16} /> Unsearchable Video Transcripts
            </div>
          </div>
        </div>

        {/* Right: InfoSurf Unified Solution */}
        <div className="problem-card unified">
          <span className="problem-tag">The InfoSurf Paradigm</span>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "12px", color: "#ffffff" }}>
            Unified Knowledge Graph
          </h3>
          <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)" }}>
            Every document, web article, repository, and video transcript is ingested into a unified, isolated vector space with instant semantic retrieval and verifiable citations.
          </p>

          <div className="unified-flow-visual">
            <div className="unified-row">
              <div className="flex items-center gap-3">
                <Zap size={16} className="text-cyan-400" />
                <span>Heterogeneous Ingestion</span>
              </div>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}>
                PDF · Web · Code · YouTube
              </span>
            </div>

            <div className="unified-row">
              <div className="flex items-center gap-3">
                <Network size={16} className="text-indigo-400" />
                <span>Vector Semantic Search</span>
              </div>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--accent-indigo)" }}>
                Qdrant DB (384-dim)
              </span>
            </div>

            <div className="unified-row">
              <div className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>Deterministic Citations</span>
              </div>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--accent-emerald)" }}>
                100% Provenance
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
