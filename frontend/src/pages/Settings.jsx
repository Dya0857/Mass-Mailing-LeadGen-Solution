import { useState, useEffect, useCallback } from "react";
import "../styles/Settings.css";
import api from "../service/api";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import RichEmailEditor from "./RichEmailEditor"; // adjust path as needed

// ─── Template Manager ─────────────────────────────────────────────────────────
const TemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState({ name: "", subject: "", body: "" });
  const [attachments, setAttachments] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetchTemplates(); }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get("/users/profile");
      if (res.data.templates) setTemplates(res.data.templates);
    } catch (err) {
      console.error("Failed to load templates", err);
    }
  };

  const handleSave = async () => {
    if (!currentTemplate.name) { setMsg("❌ Name is required"); return; }
    try {
      if (currentTemplate._id) {
        const res = await api.put(`/users/templates/${currentTemplate._id}`, currentTemplate);
        setTemplates(res.data);
        setMsg("✅ Template updated");
      } else {
        const res = await api.post("/users/templates", currentTemplate);
        setTemplates(res.data);
        setMsg("✅ Template added");
      }
      setIsEditing(false);
      setCurrentTemplate({ name: "", subject: "", body: "" });
      setAttachments([]);
    } catch {
      setMsg("❌ Error saving template");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        const res = await api.delete(`/users/templates/${id}`);
        setTemplates(res.data);
      } catch (err) {
        console.error("Error deleting template", err);
      }
    }
  };

  const handleBodyChange = useCallback((html) => {
    setCurrentTemplate(prev => ({ ...prev, body: html }));
  }, []);

  const handleAddImage = useCallback((img) => {
    setAttachments(prev => [...prev, img]);
  }, []);

  const handleAddPDF = useCallback((pdf) => {
    setAttachments(prev => [...prev, pdf]);
  }, []);

  const handleRemoveAttachment = useCallback((idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const startEditing = (template = { name: "", subject: "", body: "" }) => {
    setCurrentTemplate(template);
    setAttachments([]);
    setIsEditing(true);
    setMsg("");
  };

  return (
    <div className="settings-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>My Templates</h3>
        {!isEditing && (
          <button
            className="btn btn-sm btn-primary d-flex align-items-center"
            onClick={() => startEditing()}
          >
            <Plus size={16} className="me-1" /> New Template
          </button>
        )}
      </div>

      {msg && (
        <div className={`alert p-2 small mb-3 ${msg.includes("✅") ? "alert-success" : "alert-danger"}`}>
          {msg}
        </div>
      )}

      {isEditing ? (
        <div className="bg-light p-3 rounded">
          {/* Template Name */}
          <div className="mb-2">
            <label className="form-label small fw-bold">Template Name</label>
            <input
              className="form-control form-control-sm"
              value={currentTemplate.name}
              onChange={e => setCurrentTemplate(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Welcome Email"
            />
          </div>

          {/* Subject */}
          <div className="mb-2">
            <label className="form-label small fw-bold">Subject</label>
            <input
              className="form-control form-control-sm"
              value={currentTemplate.subject}
              onChange={e => setCurrentTemplate(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Email Subject"
            />
          </div>

          {/* Body — Rich Editor */}
          <div className="mb-3">
            <label className="form-label small fw-bold">Body</label>
            <RichEmailEditor
              value={currentTemplate.body}
              onChange={handleBodyChange}
              attachments={attachments}
              onAddImage={handleAddImage}
              onAddPDF={handleAddPDF}
              onRemoveAttachment={handleRemoveAttachment}
            />
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-success d-flex align-items-center" onClick={handleSave}>
              <Save size={16} className="me-1" /> Save
            </button>
            <button
              className="btn btn-sm btn-secondary d-flex align-items-center"
              onClick={() => { setIsEditing(false); setAttachments([]); }}
            >
              <X size={16} className="me-1" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {templates.length === 0 ? (
            <p className="text-secondary small fst-italic">No templates found. Create one to get started.</p>
          ) : (
            templates.map(t => (
              <div key={t._id} className="p-3 border rounded d-flex justify-content-between align-items-center bg-white">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="fw-bold text-dark">{t.name}</div>
                  <div className="small text-secondary">{t.subject || "(No subject)"}</div>
                  {t.body && (
                    <div
                      className="small text-muted mt-1"
                      style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {t.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}
                    </div>
                  )}
                </div>
                <div className="d-flex gap-2 ms-3 flex-shrink-0">
                  <button
                    className="btn btn-sm btn-outline-secondary p-1"
                    onClick={() => startEditing(t)}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger p-1"
                    onClick={() => handleDelete(t._id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ─── Settings Page ────────────────────────────────────────────────────────────
const Settings = () => {
  const [aiSettings, setAiSettings] = useState({ defaultVariationCount: 7 });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("aiSettings") || '{"defaultVariationCount": 7}');
    setAiSettings(saved);
  }, []);

  const handleAiSettingsChange = (key, value) => {
    const newSettings = { ...aiSettings, [key]: value };
    setAiSettings(newSettings);
    localStorage.setItem("aiSettings", JSON.stringify(newSettings));
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>⚙️ Settings</h1>
        <p className="settings-subtitle">Manage system and user preferences</p>
      </div>
      <div className="settings-content">
        <section>
          <h2 style={{ marginBottom: "20px", color: "#00695c", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
            🖥️ System Settings
          </h2>
          <div className="settings-card">
            <h3>🤖 AI Assistant Settings</h3>
            <div className="settings-option">
              <label className="setting-label">
                <span className="label-text">Default Number of Variations</span>
                <p className="label-description">
                  Default number of email variations to generate. For 1000–2000 recipients,
                  use 7–10 variations to avoid spam filters.
                </p>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={aiSettings.defaultVariationCount}
                  onChange={e => handleAiSettingsChange("defaultVariationCount", parseInt(e.target.value) || 7)}
                  className="number-input"
                />
                <span className="input-hint">variations (recommended: 7–10 for large lists)</span>
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: "20px" }}>
          <h2 style={{ marginBottom: "20px", color: "#00695c", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
            📄 Email Templates
          </h2>
          <TemplateManager />
        </section>
      </div>
    </div>
  );
};

export default Settings;