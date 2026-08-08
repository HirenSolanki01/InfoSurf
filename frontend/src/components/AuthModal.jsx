import React, { useState, useEffect } from "react";
import { X, Mail, Lock, RefreshCw, Compass, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AuthModal = ({ isOpen, onClose, initialTab = "login", onSuccess }) => {
  const { login, signup } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(initialTab === "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync state whenever modal opens or initialTab changes
  useEffect(() => {
    setIsLoginTab(initialTab === "login");
    setError("");
    setEmail("");
    setPassword("");
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLoginTab) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between" style={{ marginBottom: "20px" }}>
          <div className="flex items-center gap-2">
            <div className="brand-icon-box" style={{ width: 28, height: 28 }}>
              <Compass size={16} />
            </div>
            <span style={{ fontWeight: "700", fontSize: "1.15rem", color: "#fff" }}>InfoSurf</span>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="auth-tabs" style={{ marginBottom: "20px" }}>
          <button 
            type="button"
            className={`auth-tab ${isLoginTab ? "active" : ""}`}
            onClick={() => { setIsLoginTab(true); setError(""); }}
          >
            <span className="flex items-center justify-center gap-2">
              <LogIn size={15} /> Sign In
            </span>
          </button>
          <button 
            type="button"
            className={`auth-tab ${!isLoginTab ? "active" : ""}`}
            onClick={() => { setIsLoginTab(false); setError(""); }}
          >
            <span className="flex items-center justify-center gap-2">
              <UserPlus size={15} /> Sign Up
            </span>
          </button>
        </div>

        {error && (
          <div className="error-alert" style={{ marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="auth-modal-email">Email Address</label>
            <div className="flex items-center gap-2" style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "0 14px" }}>
              <Mail size={16} className="text-secondary shrink-0" />
              <input
                id="auth-modal-email"
                type="email"
                required
                style={{ flex: 1, background: "transparent", border: "none", padding: "12px 0", outline: "none", color: "#fff" }}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="auth-modal-password">Password</label>
            <div className="flex items-center gap-2" style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "0 14px" }}>
              <Lock size={16} className="text-secondary shrink-0" />
              <input
                id="auth-modal-password"
                type="password"
                required
                style={{ flex: 1, background: "transparent", border: "none", padding: "12px 0", outline: "none", color: "#fff" }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-gradient btn-arrow" 
            style={{ width: "100%", marginTop: "10px", padding: "14px" }}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              <>
                <span>{isLoginTab ? "Sign In to Workspace" : "Create Account & Enter"}</span>
                <ArrowRight size={16} className="arrow-icon" />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: "18px", textAlign: "center", fontSize: "0.82rem", color: "var(--text-muted)" }}>
          {isLoginTab ? (
            <span>
              Don't have an account?{" "}
              <button 
                type="button"
                style={{ color: "var(--accent-cyan)", textDecoration: "underline", fontWeight: "600" }}
                onClick={() => { setIsLoginTab(false); setError(""); }}
              >
                Sign Up here
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button 
                type="button"
                style={{ color: "var(--accent-cyan)", textDecoration: "underline", fontWeight: "600" }}
                onClick={() => { setIsLoginTab(true); setError(""); }}
              >
                Sign In here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
