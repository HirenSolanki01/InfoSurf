import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, User, LogOut, Menu, X, Compass, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ onOpenWorkspace, onOpenAuth }) => {
  const { user, token, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`navbar-wrapper ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-inner">
        <a href="#" className="brand-logo">
          <div className="brand-icon-box">
            <Compass size={20} />
          </div>
          <span>InfoSurf</span>
        </a>

        <nav className="nav-links">
          <a href="#product" className="nav-link">Product</a>
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#pipeline" className="nav-link">RAG Architecture</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#citations" className="nav-link">Citations</a>
          <a href="#technology" className="nav-link">Technology</a>
        </nav>

        <div className="nav-actions">
          {token ? (
            <div className="flex items-center gap-3">
              <button 
                className="btn btn-gradient btn-arrow"
                onClick={onOpenWorkspace}
              >
                <span>Open Workspace</span>
                <ArrowRight size={15} className="arrow-icon" />
              </button>
              <button 
                className="btn btn-secondary icon-btn"
                onClick={logout}
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                className="btn btn-secondary"
                style={{ padding: "8px 16px", fontSize: "0.86rem" }}
                onClick={() => onOpenAuth(true)}
              >
                Sign In
              </button>
              <button 
                className="btn btn-secondary"
                style={{ padding: "8px 16px", fontSize: "0.86rem", borderColor: "rgba(0, 210, 255, 0.3)", color: "var(--accent-cyan)" }}
                onClick={() => onOpenAuth(false)}
              >
                Sign Up
              </button>
              <button 
                className="btn btn-gradient btn-arrow"
                style={{ padding: "8px 18px", fontSize: "0.86rem" }}
                onClick={() => onOpenAuth(false)}
              >
                <span>Start Researching</span>
                <ArrowRight size={14} className="arrow-icon" />
              </button>
            </div>
          )}

          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="glass-heavy" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px", borderBottom: "1px solid var(--border-subtle)" }}>
          <a href="#product" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Product</a>
          <a href="#how-it-works" className="nav-link" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
          <a href="#pipeline" className="nav-link" onClick={() => setMobileMenuOpen(false)}>RAG Architecture</a>
          <a href="#features" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#citations" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Citations</a>
          <a href="#technology" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Technology</a>
          <div style={{ paddingTop: "10px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "10px" }}>
            {token ? (
              <button className="btn btn-gradient" onClick={() => { setMobileMenuOpen(false); onOpenWorkspace(); }}>
                Open Workspace
              </button>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={() => { setMobileMenuOpen(false); onOpenAuth(true); }}>
                  Sign In
                </button>
                <button className="btn btn-gradient" onClick={() => { setMobileMenuOpen(false); onOpenAuth(false); }}>
                  Sign Up (Create Account)
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
