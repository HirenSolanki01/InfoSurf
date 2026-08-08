import React from "react";
import { Compass, ShieldCheck } from "lucide-react";

const Footer = () => {
  return (
    <footer className="footer-wrapper">
      <div className="footer-inner">
        <div className="flex items-center gap-3">
          <div className="brand-icon-box" style={{ width: 28, height: 28 }}>
            <Compass size={16} />
          </div>
          <span style={{ fontWeight: "700", color: "#ffffff", fontSize: "1.1rem" }}>InfoSurf</span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
            — AI-Powered Enterprise Knowledge Hub
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
          <span>FastAPI</span>
          <span>·</span>
          <span>Qdrant</span>
          <span>·</span>
          <span>SentenceTransformers</span>
          <span>·</span>
          <span>React 19</span>
        </div>

        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
          © {new Date().getFullYear()} InfoSurf. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
