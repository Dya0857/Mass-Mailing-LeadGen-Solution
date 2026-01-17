import { useState } from "react";
import api from "../service/api";
import "../styles/CreateCampaign.css";

export default function CreateCampaign() {
  const [mode, setMode] = useState("manual");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
      setMsg(err.response?.data?.message || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="campaign-page">
      <div className="campaign-container">
        {/* Header */}
        <div className="campaign-header">
          <h1>Create New Campaign</h1>
          <p>Design and schedule your email marketing campaign</p>
        </div>

        {/* Card */}
        <div className="campaign-card">
          {/* Mode */}
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

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Campaign Name */}
            <div className="form-group">
              <label>Campaign Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Summer Sale Campaign"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email List */}
            <div className="form-group">
              <label>Email List</label>
              <input
                type="text"
                name="emailList"
                placeholder="Select or upload email list"
                value={form.emailList}
                onChange={handleChange}
                required
              />
            </div>

            {/* Subject */}
            <div className="form-group">
              <label>Email Subject</label>
              <input
                type="text"
                name="subject"
                placeholder="Enter subject line"
                value={form.subject}
                onChange={handleChange}
                required
              />
              <p className="helper-text">
                Recommended: under 60 characters
              </p>
            </div>

            {/* Preview Text */}
            <div className="form-group">
              <label>Preview Text</label>
              <input
                type="text"
                name="previewText"
                placeholder="Appears next to subject in inbox"
                value={form.previewText}
                onChange={handleChange}
              />
            </div>

            {/* Sender */}
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

            {/* Content */}
            <div className="form-group">
              <label>Email Content</label>
              <textarea
                name="content"
                rows="6"
                placeholder="Write your email content here..."
                value={form.content}
                onChange={handleChange}
                required
              />
              <div className="editor-actions">
                <button type="button">Add Image</button>
                <button type="button">Add Link</button>
                <button type="button">Insert Variable</button>
              </div>
            </div>

            {/* Schedule */}
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

            {/* Footer */}
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
