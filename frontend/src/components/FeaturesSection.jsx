import React from "react";
import { 
  Search, FileText, Globe, ShieldCheck, 
  Layers, Cpu, Sparkles, Database 
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Search,
      title: "Semantic Vector Search",
      desc: "Retrieve knowledge based on deep semantic meaning and conceptual relevance rather than fragile exact keyword matching."
    },
    {
      icon: FileText,
      title: "PDF Intelligence",
      desc: "Upload multi-page research papers, documentation manuals, and reports. Text is automatically cleaned, chunked, and indexed."
    },
    {
      icon: Globe,
      title: "Universal Link Ingestion",
      desc: "Index live website articles, entire public GitHub repositories, and YouTube video transcripts directly from raw URLs."
    },
    {
      icon: ShieldCheck,
      title: "Deterministic Citations",
      desc: "Every generated assertion connects back to exact source documents, allowing immediate auditability and zero hallucination risk."
    },
    {
      icon: Layers,
      title: "Isolated Workspaces",
      desc: "Organize research projects into isolated workspaces. Documents and embeddings never cross-contaminate between contexts."
    },
    {
      icon: Cpu,
      title: "Flexible AI Engines",
      desc: "Seamlessly toggle between local Ollama (Llama 3.1), Google Gemini API, OpenAI, or the built-in smart offline matcher."
    }
  ];

  return (
    <section id="features" className="section-container">
      <div className="section-header">
        <div className="pill-badge">
          <Sparkles size={13} />
          <span>Core Capabilities</span>
        </div>
        <h2 className="section-title">
          Engineered for serious research.
        </h2>
        <p className="section-subtitle">
          Everything you need to collect, organize, query, and verify knowledge across heterogeneous information streams.
        </p>
      </div>

      <div className="features-grid">
        {features.map((feat, idx) => {
          const IconComp = feat.icon;
          return (
            <div key={idx} className="glass-card feature-card">
              <div className="feature-icon-wrapper">
                <IconComp size={22} />
              </div>
              <h3 style={{ color: "#ffffff" }}>{feat.title}</h3>
              <p style={{ color: "var(--text-secondary)" }}>{feat.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesSection;
