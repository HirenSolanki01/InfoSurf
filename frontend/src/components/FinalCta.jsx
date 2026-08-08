import React from "react";
import { ArrowRight, Compass, Sparkles, ShieldCheck } from "lucide-react";

const FinalCta = ({ onStartResearch }) => {
  return (
    <section className="section-container" style={{ paddingBottom: "120px" }}>
      <div className="final-cta-card">
        <div className="pill-badge" style={{ marginBottom: "20px" }}>
          <Sparkles size={13} />
          <span>Begin Your Next Research Project</span>
        </div>
        <h2 style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.04em", marginBottom: "18px" }}>
          Turn information into insight.
        </h2>
        <p style={{ fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)", color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto 36px auto", lineHeight: "1.6" }}>
          Research faster. Understand more. Stay grounded in your sources with InfoSurf's deterministic knowledge hub.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button 
            className="btn btn-primary btn-arrow"
            style={{ padding: "14px 32px", fontSize: "1rem" }}
            onClick={onStartResearch}
          >
            <span>Start Researching</span>
            <ArrowRight size={18} className="arrow-icon" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinalCta;
