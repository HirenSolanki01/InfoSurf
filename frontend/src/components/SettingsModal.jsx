import React, { useState, useEffect } from "react";
import { X, Settings, ShieldAlert, Cpu } from "lucide-react";

export const getSavedSettings = () => {
  const defaults = {
    provider: "local",
    ollamaUrl: "http://localhost:11434",
    model: "llama3.1",
    apiKey: "",
  };
  try {
    const saved = localStorage.getItem("infosurf_settings");
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  } catch {
    return defaults;
  }
};

const SettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState(getSavedSettings());
  const [saveStatus, setSaveStatus] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem("infosurf_settings", JSON.stringify(settings));
    setSaveStatus("Settings saved successfully!");
    setTimeout(() => {
      setSaveStatus("");
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glassmorphism settings-modal">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Cpu className="text-cyan-400" size={20} />
            <h2>AI Model & Settings</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="provider">LLM Provider</label>
            <select
              id="provider"
              value={settings.provider}
              onChange={(e) => {
                const prov = e.target.value;
                let defaultModel = "llama3.1";
                if (prov === "gemini") defaultModel = "gemini-1.5-flash";
                if (prov === "openai") defaultModel = "gpt-4o-mini";
                if (prov === "local") defaultModel = "local";
                setSettings({ ...settings, provider: prov, model: defaultModel });
              }}
            >
              <option value="local">Local Smart Matcher (Offline Fallback)</option>
              <option value="ollama">Ollama (Llama 3.1 Local)</option>
              <option value="gemini">Google Gemini API</option>
              <option value="openai">OpenAI API</option>
            </select>
          </div>

          {settings.provider === "local" && (
            <div className="info-box-success flex gap-2">
              <ShieldAlert size={18} className="text-cyan-400 shrink-0" />
              <p>
                <strong>Offline local mode active.</strong> No internet connection or external servers are required. Synthesizes answers using a keyword-relevance matching algorithm over indexed files.
              </p>
            </div>
          )}

          {settings.provider === "ollama" && (
            <>
              <div className="form-group">
                <label htmlFor="ollamaUrl">Ollama Server URL</label>
                <input
                  id="ollamaUrl"
                  type="text"
                  placeholder="e.g., http://localhost:11434"
                  value={settings.ollamaUrl}
                  onChange={(e) => setSettings({ ...settings, ollamaUrl: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="ollamaModel">Ollama Model</label>
                <input
                  id="ollamaModel"
                  type="text"
                  placeholder="e.g., llama3.1"
                  value={settings.model}
                  onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                />
              </div>
            </>
          )}

          {(settings.provider === "gemini" || settings.provider === "openai") && (
            <>
              <div className="form-group">
                <label htmlFor="apiKey">
                  {settings.provider === "gemini" ? "Gemini" : "OpenAI"} API Key
                </label>
                <input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your private API Key"
                  value={settings.apiKey}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="apiModel">Model Name</label>
                <input
                  id="apiModel"
                  type="text"
                  placeholder={settings.provider === "gemini" ? "gemini-1.5-flash" : "gpt-4o-mini"}
                  value={settings.model}
                  onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                />
              </div>
            </>
          )}
        </div>

        <div className="modal-footer flex items-center justify-between">
          <span className="save-status text-cyan-400">{saveStatus}</span>
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
