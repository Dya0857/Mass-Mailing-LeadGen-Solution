import { useState } from "react";
import api from "../service/api";
import "../styles/CreateCampaign.css";

export default function CreateCampaign() {
  // ===== Modes & Messages =====
  const [mode, setMode] = useState("manual");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // ===== Campaign Form =====
  const [form, setForm] = useState({
    name: "",
    subject: "",
    previewText: "",
    senderName: "MailMaster Team",
    content: "",
    emailList: "",
    scheduleDate: "",
    scheduleTime: "",
  });

  // ===== AI Form =====
  const [aiForm, setAiForm] = useState({
    product: "",
    audience: "",
    goal: "",
    tone: "professional",
    length: "medium",
  });

  // ===== Handlers =====
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAIChange = (e) => {
    setAiForm({ ...aiForm, [e.target.name]: e.target.value });
  };

  // ===== AI Generate =====
  const handleGenerateAI = async () => {
    setAiLoading(true);
    setMsg("");

    try {
      const res = await api.post("/ai/generate-campaign", aiForm);
      const text = res.data.content || "";

      const subjectMatch = text.match(/Subject:\s*(.*)/i);
      const bodyMatch = text.match(/Body:\s*([\s\S]*)/i);

      setForm((prev) => ({
        ...prev,
        subject: subjectMatch ? subjectMatch[1].trim() : prev.subject,
        content: bodyMatch ? bodyMatch[1].trim() : prev.content,
      }));
    } catch (err) {
      setMsg("❌ AI generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  // ===== Submit Campaign =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      await api.post("/campaign/create", {
        ...form,
        mode,
      });

      setMsg("✅ Campaign scheduled successfully");
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  // ===== UI =====
  return (
    <div className="campaign-page">
      <div className="campaign-container">
        {/* Header */}
        <div className="campaign-header">
          <h1>Create New Campaign</h1>
          <p>Design and schedule your email marketing campaign</p>
        </div>

        <div className="campaign-card">
          {/* Mode Toggle */}
          <p className="section-label">Campaign Mode</p>
          <div className="mode-toggle">
            <button
              type="button"
              className={mode === "manual" ? "active" : ""}
              onClick={() => setMode("manual")}
            >
              Manual Email
            </button>
            <button
              type="button"
              className={mode === "ai" ? "active" : ""}
              onClick={() => setMode("ai")}
            >
              ✨ AI Assistant
            </button>
          </div>

          {/* ===== AI PANEL ===== */}
          {mode === "ai" && (
            <div className="ai-panel">
              <h3>✨ AI Campaign Builder</h3>
              <p className="ai-subtext">
                Generate subject & content using AI. You can edit before saving.
              </p>

              <div className="ai-grid">
                <div className="form-group">
                  <label>Product / Service</label>
                  <input
                    type="text"
                    name="product"
                    value={aiForm.product}
                    onChange={handleAIChange}
                    placeholder="e.g. AI Email Marketing Tool"
                  />
                </div>

                <div className="form-group">
                  <label>Target Audience</label>
                  <input
                    type="text"
                    name="audience"
                    value={aiForm.audience}
                    onChange={handleAIChange}
                    placeholder="e.g. Startup founders"
                  />
                </div>

                <div className="form-group">
                  <label>Campaign Goal</label>
                  <input
                    type="text"
                    name="goal"
                    value={aiForm.goal}
                    onChange={handleAIChange}
                    placeholder="e.g. Lead generation"
                  />
                </div>

                <div className="form-group">
                  <label>Tone</label>
                  <select
                    name="tone"
                    value={aiForm.tone}
                    onChange={handleAIChange}
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="persuasive">Persuasive</option>
                    <option value="casual">Casual</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                className="ai-generate-btn"
                onClick={handleGenerateAI}
                disabled={aiLoading}
              >
                {aiLoading ? "Generating..." : "✨ Generate with AI"}
              </button>
            </div>
          )}

          {/* ===== FORM ===== */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Campaign Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email List</label>
              <input
                type="text"
                name="emailList"
                value={form.emailList}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Subject</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Preview Text</label>
              <input
                type="text"
                name="previewText"
                value={form.previewText}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Sender Name</label>
              <input
                type="text"
                name="senderName"
                value={form.senderName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Content</label>
              <textarea
                name="content"
                rows="6"
                value={form.content}
                onChange={handleChange}
                disabled={aiLoading}
                required
              />
            </div>

            <div className="schedule-grid">
              <div className="form-group">
                <label>Schedule Date</label>
                <input
                  type="date"
                  name="scheduleDate"
                  value={form.scheduleDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Schedule Time</label>
                <input
                  type="time"
                  name="scheduleTime"
                  value={form.scheduleTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="campaign-footer">
              <button type="button" className="test-btn">
                Send Test Email
              </button>

              <button
                type="submit"
                className="primary-btn"
                disabled={loading}
              >
                {loading ? "Scheduling..." : "Schedule Campaign"}
              </button>
            </div>
          </form>

          {msg && <p className="status-msg">{msg}</p>}
        </div>
      </div>
    </div>
  );
}
