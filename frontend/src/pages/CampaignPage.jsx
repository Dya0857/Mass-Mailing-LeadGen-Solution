import { useState, useRef, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import {
  Send, TestTube, CheckCircle, AlertCircle, XCircle,
  Sparkles, Search, Upload, Loader2,
} from 'lucide-react';
import api from "../service/api";
import RichEmailEditor from "./RichEmailEditor"; // adjust path as needed

export default function CampaignPage() {
  const [spamScore, setSpamScore] = useState(85);
  const [aiMode, setAiMode] = useState('questions');
  const [generatedVariations, setGeneratedVariations] = useState([]);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [activeTab, setActiveTab] = useState('manual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const fileInputRef = useRef(null);
  const [sendingNow, setSendingNow] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => { fetchTemplates(); }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get("/users/profile");
      if (res.data && Array.isArray(res.data.templates)) {
        setTemplates(res.data.templates);
        if (res.data.templates.length === 0) setStatusMsg("⚠️ No templates found. Create one in Settings.");
        else setStatusMsg("");
      } else {
        setStatusMsg("⚠️ Invalid template data received.");
      }
    } catch (err) {
      if (err.response?.status === 404) setStatusMsg("❌ Backend API not found. Please RESTART your backend server.");
      else if (err.request) setStatusMsg("❌ Network error: No response from server.");
      else setStatusMsg(`❌ Error: ${err.message}`);
    }
  };

  const [form, setForm] = useState({
    name: "",
    subject: "",
    previewText: "",
    senderName: "MailMaster Team",
    content: "",
    scheduleDate: "",
    scheduleTime: "",
    recipients: [],
    batchSize: 500,
    batchDelay: 10,
  });

  const [aiFormData, setAiFormData] = useState(() => {
    const savedSettings = JSON.parse(localStorage.getItem("aiSettings") || '{"defaultVariationCount": 7}');
    return {
      audience: '',
      tone: 'Professional',
      keywords: '',
      context: '',
      campaignType: 'promotion',
      variationCount: savedSettings.defaultVariationCount || 7,
    };
  });

  const getSpamScoreStatus = (score) => {
    if (score >= 80) return { label: 'Safe', color: 'bg-success-subtle text-success', icon: CheckCircle };
    if (score >= 60) return { label: 'Moderate Risk', color: 'bg-warning-subtle text-warning', icon: AlertCircle };
    return { label: 'High Risk', color: 'bg-danger-subtle text-danger', icon: XCircle };
  };

  const handleGenerateEmail = async () => {
    setIsGenerating(true);
    setStatusMsg('');
    try {
      const res = await api.post("/ai/generate-campaign", aiFormData);
      const variations = res.data.variations || [];
      if (Array.isArray(variations) && variations.length > 0) {
        setGeneratedVariations(variations);
        setSelectedVariationIndex(0);
        setAiMode('generated');
        setForm(prev => ({ ...prev, subject: variations[0].subject, content: variations[0].body }));
      } else throw new Error("Invalid format received from AI");
    } catch (error) {
      setStatusMsg(`❌ Generation failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateEmail = () => { setAiMode('questions'); setGeneratedVariations([]); };

  const handleUploadCSV = () => fileInputRef.current.click();

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFileName(file.name);
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const emails = new Set();
        results.data.forEach(row => {
          if (Array.isArray(row)) row.forEach(val => {
            if (typeof val === 'string' && val.includes('@')) {
              const m = val.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
              if (m) emails.add(m[0].trim());
            }
          });
        });
        const emailList = Array.from(emails);
        setForm(prev => ({ ...prev, recipients: emailList }));
        setStatusMsg(emailList.length > 0
          ? `✅ Successfully imported ${emailList.length} emails`
          : "⚠️ No valid emails found in the CSV.");
      },
      error: () => setStatusMsg("❌ Failed to parse CSV file"),
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setStatusMsg("");
    try {
      let scheduleAt = null;
      if (form.scheduleDate && form.scheduleTime) {
        scheduleAt = new Date(`${form.scheduleDate}T${form.scheduleTime}`).toISOString();
      }

      await api.post("/campaign/create", {
        ...form,
        emailList: form.recipients.length > 0 ? "CSV_UPLOAD" : "",
        variations: generatedVariations.length > 0 ? generatedVariations : [{ subject: form.subject, body: form.content }],
        mode: activeTab,
        scheduleAt, // Send pre-calculated ISO timestamp
      });
      setStatusMsg("✅ Campaign scheduled successfully");
    } catch (err) {
      setStatusMsg(err.response?.data?.message || "❌ Failed to create campaign");
    } finally { setLoading(false); }
  };

  const handleSendNow = async () => {
    if (form.recipients.length === 0) { setStatusMsg("❌ Please upload a CSV with email addresses first"); return; }
    setSendingNow(true);
    setStatusMsg("");
    try {
      const res = await api.post("/campaign/send-now", {
        ...form,
        variations: generatedVariations.length > 0 ? generatedVariations : [{ subject: form.subject, body: form.content }],
        mode: activeTab,
        attachments: attachments.map(a => ({ name: a.name, type: a.type })),
      });
      const { results } = res.data;
      if (results) {
        setStatusMsg(`✅ Campaign finished: ${results.success?.length || 0} sent, ${results.failure?.length || 0} failed.`);
      } else setStatusMsg(`✅ ${res.data.message}`);
    } catch (err) {
      setStatusMsg(err.response?.data?.message || "❌ Failed to send mails");
    } finally { setSendingNow(false); }
  };

  const handleSendTest = async () => {
    if (!form.subject || !form.content) {
      setStatusMsg("❌ Subject and body are required for test email");
      return;
    }

    const testEmail = prompt("Enter email address for test:");
    if (!testEmail) return;

    setSendingTest(true);
    setStatusMsg("");
    try {
      await api.post("/campaign/test-email", {
        subject: form.subject,
        content: form.content,
        testEmail: testEmail
      });
      setStatusMsg(`✅ Test email sent to ${testEmail} successfully`);
    } catch (err) {
      setStatusMsg(err.response?.data?.message || "❌ Failed to send test email");
    } finally {
      setSendingTest(false);
    }
  };

  // ── Stable callbacks for editor ───────────────────────────────────────────
  const handleContentChange = useCallback((html) => {
    setForm(prev => {
      if (prev.content === html) return prev;
      return { ...prev, content: html };
    });
    // also sync into generated variations if active
    setGeneratedVariations(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[selectedVariationIndex] = { ...updated[selectedVariationIndex], body: html };
      return updated;
    });
  }, [selectedVariationIndex]);

  const handleAddImage = useCallback((img) => setAttachments(prev => [...prev, img]), []);
  const handleAddPDF = useCallback((pdf) => setAttachments(prev => [...prev, pdf]), []);
  const handleRemoveAttachment = useCallback((idx) => setAttachments(prev => prev.filter((_, i) => i !== idx)), []);

  const formContent = (
    <div className="d-flex flex-column gap-4">
      {/* AI variation tabs */}
      {activeTab === 'ai' && aiMode === 'generated' && (
        <>
          <div className="p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <CheckCircle size={20} className="text-success" />
              <span className="small fw-semibold text-success">{generatedVariations.length} Anti-Spam Variations Generated</span>
            </div>
            <button className="btn btn-sm btn-outline-success" onClick={handleRegenerateEmail}>Regenerate</button>
          </div>
          <div className="nav nav-tabs border-bottom-0 mb-3">
            {generatedVariations.map((_, index) => (
              <button key={index} type="button"
                className={`nav-link border-0 px-4 py-2 bg-transparent ${selectedVariationIndex === index ? 'text-primary border-bottom border-primary border-2 fw-semibold' : 'text-secondary'}`}
                onClick={() => {
                  setSelectedVariationIndex(index);
                  setForm(prev => ({ ...prev, subject: generatedVariations[index].subject, content: generatedVariations[index].body }));
                }}>
                Variation {index + 1}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Template selector (manual only) */}
      {activeTab === 'manual' && (
        <div className="mb-1">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <label className="form-label fw-medium small text-secondary mb-0">Load Template (Optional)</label>
            <button type="button" className="btn btn-link p-0 text-decoration-none small" style={{ fontSize: '11px' }} onClick={fetchTemplates}>Refresh</button>
          </div>
          <select className="form-select form-select-sm" defaultValue=""
            onChange={(e) => {
              const t = templates.find(t => t._id === e.target.value);
              if (t) setForm(prev => ({ ...prev, subject: t.subject || prev.subject, content: t.body || prev.content }));
            }}>
            <option value="">-- Select a Template to Load --</option>
            {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </div>
      )}

      {/* Campaign name */}
      <div>
        <label className="form-label fw-medium small">Campaign Name</label>
        <input type="text" className="form-control" placeholder="e.g., Summer Sale 2025"
          value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
      </div>

      {/* CSV upload */}
      <div>
        <label className="form-label fw-medium small">Upload Email List (CSV)</label>
        <input type="file" ref={fileInputRef} onChange={onFileChange} accept=".csv" className="d-none" />
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-outline-primary flex-grow-1 d-flex align-items-center justify-content-center" onClick={handleUploadCSV}>
            <Upload size={16} className="me-2" />
            {uploadedFileName || 'Upload CSV File'}
          </button>
          {uploadedFileName && (
            <span className="badge bg-success-subtle text-success d-flex align-items-center px-3 border border-success-subtle">
              <CheckCircle size={14} className="me-1" /> {form.recipients.length} Emails
            </span>
          )}
        </div>
        <p className="text-secondary mt-1 mb-0" style={{ fontSize: '11px' }}>Universal CSV format recommended</p>
      </div>

      {/* Subject */}
      <div>
        <label className="form-label fw-medium small">Subject Line</label>
        <input type="text" className="form-control" placeholder="Enter an engaging subject"
          value={form.subject}
          onChange={e => {
            const val = e.target.value;
            setForm(prev => ({ ...prev, subject: val }));
            if (generatedVariations.length > 0) {
              const newVars = [...generatedVariations];
              newVars[selectedVariationIndex] = { ...newVars[selectedVariationIndex], subject: val };
              setGeneratedVariations(newVars);
            }
          }} />
      </div>

      {/* Rich email body */}
      <div>
        <label className="form-label fw-medium small">Email Body</label>
        <RichEmailEditor
          value={form.content}
          onChange={handleContentChange}
          attachments={attachments}
          onAddImage={handleAddImage}
          onAddPDF={handleAddPDF}
          onRemoveAttachment={handleRemoveAttachment}
        />
      </div>

      {/* Schedule */}
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label fw-medium small">Schedule Date</label>
          <input type="date" className="form-control" value={form.scheduleDate}
            onChange={e => setForm(prev => ({ ...prev, scheduleDate: e.target.value }))} />
        </div>
        <div className="col-md-6">
          <label className="form-label fw-medium small">Schedule Time</label>
          <input type="time" className="form-control" value={form.scheduleTime}
            onChange={e => setForm(prev => ({ ...prev, scheduleTime: e.target.value }))} />
        </div>
      </div>

      {/* Batching */}
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label fw-medium small">Batch Size (Recipients)</label>
          <input type="number" className="form-control" placeholder="500" value={form.batchSize}
            onChange={e => setForm(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 0 }))} />
        </div>
        <div className="col-md-6">
          <label className="form-label fw-medium small">Wait Time (Minutes)</label>
          <input type="number" className="form-control" placeholder="10" value={form.batchDelay}
            onChange={e => setForm(prev => ({ ...prev, batchDelay: parseInt(e.target.value) || 0 }))} />
        </div>
        <div className="col-12 mt-1">
          <p className="text-secondary mb-0" style={{ fontSize: '11px' }}>
            <AlertCircle size={12} className="me-1 inline" />
            Batching helps prevent your emails from being flagged as spam by spacing out delivery.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className={`alert ${statusMsg.includes('✅') ? 'alert-success' : 'alert-danger'} py-2 small`}>
          {statusMsg}
        </div>
      )}

      {/* Action buttons */}
      <div className="d-flex gap-3 pt-3">
        <button className="btn btn-primary px-4 py-2 flex-grow-1 d-flex align-items-center justify-content-center"
          onClick={handleSubmit} disabled={loading}>
          {loading ? <Loader2 size={18} className="me-2 animate-spin" /> : <Send size={18} className="me-2" />}
          {loading ? "Scheduling..." : "Schedule Campaign"}
        </button>
        <button
          className="btn btn-success px-4 py-2 flex-grow-1 d-flex align-items-center justify-content-center text-white border-0"
          onClick={handleSendNow} disabled={sendingNow || loading}
          style={{ background: '#00695C' }}>
          {sendingNow ? <Loader2 size={18} className="me-2 animate-spin" /> : <Send size={18} className="me-2" />}
          {sendingNow ? "Sending..." : "Send Mails Now"}
        </button>
        <button
          className="btn btn-outline-secondary px-4 py-2 flex-grow-1 d-flex align-items-center justify-content-center"
          onClick={handleSendTest}
          disabled={sendingTest || loading}
        >
          {sendingTest ? <Loader2 size={18} className="me-2 animate-spin" /> : <TestTube size={18} className="me-2" />}
          {sendingTest ? "Sending..." : "Send Test"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-light min-vh-100">
      <div className="mb-4">
        <h1 className="h2 text-dark mb-1">Create New Campaign</h1>
        <p className="text-secondary">Design and schedule your email marketing campaign</p>
      </div>

      <div className="mb-4">
        <div className="position-relative" style={{ maxWidth: '400px' }}>
          <Search size={18} className="position-absolute start-0 top-50 translate-middle-y ms-3 text-secondary" />
          <input type="text" className="form-control ps-5 rounded-pill shadow-none"
            placeholder="Search campaigns..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="card-title fw-semibold">Campaign Details</h5>
            </div>
            <div className="card-body p-4 pt-0">
              {/* Tabs */}
              <ul className="nav nav-pills nav-fill bg-light p-1 rounded-3 mb-4">
                <li className="nav-item">
                  <button className={`nav-link rounded-3 border-0 ${activeTab === 'manual' ? 'active shadow-sm' : 'text-secondary bg-transparent'}`}
                    onClick={() => setActiveTab('manual')}>Manual Email</button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link rounded-3 border-0 d-flex align-items-center justify-content-center ${activeTab === 'ai' ? 'active shadow-sm' : 'text-secondary bg-transparent'}`}
                    onClick={() => setActiveTab('ai')}>
                    <Sparkles size={16} className="me-2" />AI Assistant
                  </button>
                </li>
              </ul>

              {activeTab === 'manual' || (activeTab === 'ai' && aiMode === 'generated') ? (
                formContent
              ) : (
                /* AI questions form */
                <div className="d-flex flex-column gap-4">
                  <div className="p-3 rounded-3" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)', border: '1px solid #e0e7ff' }}>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <Sparkles size={20} className="text-primary" />
                      <h6 className="mb-0 fw-semibold text-dark">AI Email Generator</h6>
                    </div>
                    <p className="small text-secondary mb-0">Answer a few questions and let AI compose your campaign.</p>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium small">Campaign Type</label>
                      <select className="form-select shadow-none" value={aiFormData.campaignType}
                        onChange={e => setAiFormData(prev => ({ ...prev, campaignType: e.target.value }))}>
                        <option value="promotion">Promotion</option>
                        <option value="announcement">Announcement</option>
                        <option value="newsletter">Newsletter</option>
                        <option value="cold-outreach">Cold Outreach</option>
                        <option value="event-invite">Event Invitation</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium small">Variation Count</label>
                      <input type="number" className="form-control shadow-none" min="1" max="10"
                        value={aiFormData.variationCount}
                        onChange={e => setAiFormData(prev => ({ ...prev, variationCount: parseInt(e.target.value) || 1 }))} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium small">Target Audience</label>
                      <input type="text" className="form-control shadow-none"
                        placeholder="e.g., Marketing managers at tech startups"
                        value={aiFormData.audience}
                        onChange={e => setAiFormData(prev => ({ ...prev, audience: e.target.value }))} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium small">Keywords (comma separated)</label>
                      <input type="text" className="form-control shadow-none"
                        placeholder="e.g., high-ROI, automated, scalable"
                        value={aiFormData.keywords}
                        onChange={e => setAiFormData(prev => ({ ...prev, keywords: e.target.value }))} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium small">Context / Key Points</label>
                      <textarea className="form-control shadow-none" rows="3"
                        placeholder="Provide deep context for the AI to generate better content..."
                        value={aiFormData.context}
                        onChange={e => setAiFormData(prev => ({ ...prev, context: e.target.value }))} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium small">Tone</label>
                      <select className="form-select shadow-none" value={aiFormData.tone}
                        onChange={e => setAiFormData(prev => ({ ...prev, tone: e.target.value }))}>
                        <option value="Professional">Professional</option>
                        <option value="Friendly">Friendly</option>
                        <option value="Urgent">Urgent</option>
                        <option value="Persuasive">Persuasive</option>
                        <option value="Playful">Playful</option>
                      </select>
                    </div>
                  </div>
                  {statusMsg && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small">
                      <AlertCircle size={16} />{statusMsg}
                    </div>
                  )}
                  <button className="btn btn-primary d-flex align-items-center justify-content-center py-2 border-0 shadow-sm"
                    onClick={handleGenerateEmail} disabled={isGenerating}>
                    {isGenerating
                      ? <><Loader2 size={18} className="me-2 animate-spin" />Generating {aiFormData.variationCount} Variations...</>
                      : <><Sparkles size={18} className="me-2" />Generate Anti-Spam Variations</>
                    }
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}