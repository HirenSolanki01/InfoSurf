import React from "react";
import { 
  GraduationCap, Code, Compass, Video, 
  ArrowRight, Sparkles, BookOpen, Layers 
} from "lucide-react";

const UseCasesSection = ({ onStartResearch }) => {
  const useCases = [
    {
      icon: GraduationCap,
      title: "Academic & Literature Reviews",
      desc: "Upload dozens of research PDFs and immediately synthesize comparative methodologies, dataset benchmarks, and findings with verified paragraph citations.",
      tag: "Researchers & Scholars"
    },
    {
      icon: Code,
      title: "Codebase & API Intelligence",
      desc: "Ingest entire public GitHub repositories to instantly query architecture designs, locate API endpoints, and understand implementation logic.",
      tag: "Software Engineers"
    },
    {
      icon: BookOpen,
      title: "Technical Documentation Synthesis",
      desc: "Scrape live framework docs, engineering blogs, and web guides into a single coherent knowledge base for instant answers.",
      tag: "Technical Writers & Devs"
    },
    {
      icon: Video,
      title: "Multimedia Lecture Discovery",
      desc: "Extract transcripts from long-form YouTube lectures and conference talks, and query video insights alongside written research papers.",
      tag: "Students & Lifelong Learners"
    }
  ];

  return (
    <section className="section-container">
      <div className="section-header">
        <div className="pill-badge">
          <Compass size={13} />
          <span>Real-World Workflows</span>
        </div>
        <h2 className="section-title">
          Built for every research workflow.
        </h2>
        <p className="section-subtitle">
          Whether dissecting deep learning papers or exploring open-source repositories, InfoSurf accelerates comprehension.
        </p>
      </div>

      <div className="usecases-grid">
        {useCases.map((uc, idx) => {
          const IconComp = uc.icon;
          return (
            <div key={idx} className="glass-card usecase-card">
              <div className="flex items-center justify-between">
                <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "rgba(0, 210, 255, 0.08)", border: "1px solid rgba(0, 210, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-cyan)" }}>
                  <IconComp size={22} />
                </div>
                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)", background: "rgba(0, 210, 255, 0.08)", padding: "4px 10px", borderRadius: "var(--radius-full)" }}>
                  {uc.tag}
                </span>
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#ffffff" }}>
                {uc.title}
              </h3>
              <p style={{ fontSize: "0.92rem", lineHeight: "1.6", color: "var(--text-secondary)" }}>
                {uc.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default UseCasesSection;
