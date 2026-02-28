import { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import {
  Send,
  TestTube,
  CheckCircle,
  AlertCircle,
  XCircle,
  Sparkles,
  Search,
  Upload,
  FileText,
  Download,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import api from "../service/api";

export default function CampaignPage() {
  const [spamScore, setSpamScore] = useState(85);
  const [aiMode, setAiMode] = useState('questions'); // 'questions' | 'generated'
  const [generatedVariations, setGeneratedVariations] = useState([]);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [activeTab, setActiveTab] = useState('manual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const fileInputRef = useRef(null);
  const imageFileInputRef = useRef(null); // Ref for image upload
  const contentRef = useRef(null); // Add ref for textarea
  const [sendingNow, setSendingNow] = useState(false);
  const [sendingTest, setSendingTest] = useState(false); // Add sendingTest state
  const [templates, setTemplates] = useState([]);

  async function fetchTemplates() {
    try {
      const res = await api.get("campaign/templates");

      if (res.data && Array.isArray(res.data)) {
        setTemplates(res.data);
        setStatusMsg("");
      } else {
        console.warn("[CampaignPage] Unexpected response format:", res.data);
        setStatusMsg("⚠️ Invalid template data received.");
      }
    } catch (err) {
      console.error("[CampaignPage] Failed to load templates:", err);
      if (err.response) {
        // The server responded with a status code that falls out of the range of 2xx
        setStatusMsg(`❌ Server Error: ${err.response.status} - ${err.response.data?.message || err.response.statusText}`);
      } else if (err.request) {
        // The request was made but no response was received
        setStatusMsg("❌ Network Error: No response from server. Check if backend is running.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setStatusMsg(`❌ Error: ${err.message}`);
      }
    }
  }

  useEffect(() => {
    console.log("[CampaignPage] Component mounted, waiting 100ms for auth state...");
    const timer = setTimeout(() => {
      console.log("[CampaignPage] Initial load triggered after delay");
      fetchTemplates();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Form State
  const [form, setForm] = useState({
    name: "",
    emailList: "",
    subject: "",
    previewText: "",
    senderName: "MailMaster Team",
    content: "",
    scheduleDate: "",
    scheduleTime: "",
    recipients: [],
    emailProvider: "ses", // Default to SES

  });


  const [aiFormData, setAiFormData] = useState(() => {
    // Load default variation count from settings
    const savedSettings = JSON.parse(
      localStorage.getItem("aiSettings") || '{"defaultVariationCount": 7}'
    );
    return {
      audience: '',
      tone: 'Professional',
      keywords: '',
      context: '',
      campaignType: 'promotion',
      variationCount: savedSettings.defaultVariationCount || 7
    };
  });

  // Email Verifier Mock Data
  const mockEmails = [
    { email: 'john.doe@company.com', status: 'valid', risk: 'low', reason: 'Valid mailbox' },
    { email: 'jane.smith@business.com', status: 'valid', risk: 'low', reason: 'Valid mailbox' },
    { email: 'invalid@fake-domain-xyz.com', status: 'invalid', risk: 'high', reason: 'Domain does not exist' },
    { email: 'bounce@example.com', status: 'risky', risk: 'medium', reason: 'Frequent bouncer' },
    { email: 'test@test.com', status: 'risky', risk: 'medium', reason: 'Role-based email' },
    { email: 'user@company.com', status: 'valid', risk: 'low', reason: 'Valid mailbox' },
    { email: 'admin@oldcompany.net', status: 'invalid', risk: 'high', reason: 'Mailbox not found' },
    { email: 'support@service.com', status: 'risky', risk: 'medium', reason: 'Role-based email' },
  ];

  const stats = {
    total: mockEmails.length,
    valid: mockEmails.filter(e => e.status === 'valid').length,
    invalid: mockEmails.filter(e => e.status === 'invalid').length,
    risky: mockEmails.filter(e => e.status === 'risky').length,
  };

  const getSpamScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  const getSpamScoreStatus = (score) => {
    if (score >= 80) return { label: 'Safe', color: 'bg-success-subtle text-success', icon: CheckCircle };
    if (score >= 60) return { label: 'Moderate Risk', color: 'bg-warning-subtle text-warning', icon: AlertCircle };
    return { label: 'High Risk', color: 'bg-danger-subtle text-danger', icon: XCircle };
  };

  const handleGenerateEmail = async () => {
    setIsGenerating(true);
    setStatusMsg('');

    try {
      const res = await api.post("ai/generate-campaign", aiFormData);
      const variations = res.data.variations || [];

      if (Array.isArray(variations) && variations.length > 0) {
        setGeneratedVariations(variations);
        setSelectedVariationIndex(0);
        setAiMode('generated');

        // Populate the manual form with the first variation
        setForm(prev => ({
          ...prev,
          subject: variations[0].subject,
          content: variations[0].body
        }));
      } else {
        throw new Error("Invalid format received from AI");
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      setStatusMsg(`❌ Generation failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateEmail = () => {
    setAiMode('questions');
    setGeneratedVariations([]);
  };

  const handleUploadCSV = () => {
    fileInputRef.current.click();
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFileName(file.name);

    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        const emails = new Set();

        data.forEach(row => {
          // row is an array when header: false
          if (Array.isArray(row)) {
            row.forEach(val => {
              if (typeof val === 'string' && val.includes('@')) {
                const matched = val.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                if (matched) emails.add(matched[0].trim());
              }
            });
          }
        });

        const emailList = Array.from(emails);
        setForm(prev => ({ ...prev, recipients: emailList }));

        if (emailList.length > 0) {
          setStatusMsg(`✅ Successfully imported ${emailList.length} emails`);
        } else {
          setStatusMsg("⚠️ No valid emails found in the CSV. Please check the file format.");
        }
      },
      error: (error) => {
        console.error("CSV Parse Error:", error);
        setStatusMsg("❌ Failed to parse CSV file");
      }
    });
  };


  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setStatusMsg("");

    try {
      await api.post("campaign/create", {
        ...form,
        variations: generatedVariations.length > 0 ? generatedVariations : [{ subject: form.subject, body: form.content }],
        mode: activeTab,
      });

      setStatusMsg("✅ Campaign scheduled successfully");
    } catch (err) {
      setStatusMsg(err.response?.data?.message || "❌ Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleSendNow = async () => {
    if (form.recipients.length === 0) {
      setStatusMsg("❌ Please upload a CSV with email addresses first");
      return;
    }

    setSendingNow(true);
    setStatusMsg("");

    try {
      const payload = {
        ...form,
        variations: generatedVariations.length > 0 ? generatedVariations : [{ subject: form.subject, body: form.content }],
        mode: activeTab,
      };

      const res = await api.post("campaign/send-now", payload);
      const { results } = res.data;

      if (results) {
        const successCount = results.success?.length || 0;
        const failureCount = results.failure?.length || 0;
        setStatusMsg(`✅ Campaign finished: ${successCount} sent, ${failureCount} failed.`);
      } else {
        setStatusMsg(`✅ ${res.data.message}`);
      }
    } catch (err) {
      setStatusMsg(err.response?.data?.message || "❌ Failed to send mails");
    } finally {
      setSendingNow(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setStatusMsg("");

    const formData = new FormData();
    formData.append("image", file);

    // DEBUG: Log FormData contents
    console.log("Uploading file:", file.name, file.size, file.type);
    for (let [key, value] of formData.entries()) {
      console.log(`FormData Entry - ${key}:`, value);
    }

    try {
      const token = localStorage.getItem("token");
      const baseUrl = "http://localhost:5005/api/"; // Match api.js baseUrl

      const response = await fetch(`${baseUrl}campaign/upload-image`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          // DO NOT set Content-Type, browser will set it with boundary
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.imageUrl) {
        console.log("Image upload success. URL:", data.imageUrl);
        const imgTag = `<img src="${data.imageUrl}" alt="uploaded-image" style="max-width: 100%; height: auto;" />`;
        insertAtCursor(imgTag);
        setStatusMsg("✅ Image uploaded and inserted");
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Image upload failed detailed error:", err);
      setStatusMsg(`❌ Image upload failed: ${err.message}`);
    } finally {
      setLoading(false);
      // Reset input so the same file can be selected again if deleted
      if (imageFileInputRef.current) imageFileInputRef.current.value = "";
    }
  };

  const handleAddImage = () => {
    imageFileInputRef.current.click();
  };

  const handleInsertLink = () => {
    const url = prompt("Enter Link URL (e.g., https://example.com):");
    if (!url) return;
    const text = prompt("Enter Link Text:", "Click here");
    const linkTag = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text || url}</a>`;
    insertAtCursor(linkTag);
  };

  const insertAtCursor = (textToInsert) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const oldContent = form.content;
    const newContent = oldContent.substring(0, start) + textToInsert + oldContent.substring(end);

    setForm(prev => ({ ...prev, content: newContent }));

    // Update variations if in AI mode
    if (generatedVariations.length > 0) {
      const newVars = [...generatedVariations];
      newVars[selectedVariationIndex].body = newContent;
      setGeneratedVariations(newVars);
    }

    // Set cursor position after insertion (needs timeout for React to update)
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  const handleSendTest = async () => {
    const testEmail = prompt("Enter email address to send test to:");
    if (!testEmail) return;

    setSendingTest(true);
    setStatusMsg("");

    try {
      await api.post("campaign/test-email", {
        subject: form.subject,
        content: form.content,
        testEmail: testEmail,
      });
      setStatusMsg(`✅ Test email sent to ${testEmail}`);
    } catch (err) {
      setStatusMsg(err.response?.data?.message || "❌ Failed to send test email");
    } finally {
      setSendingTest(false);
    }
  };

  const statusInfo = getSpamScoreStatus(spamScore);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="p-4 bg-light min-vh-100">
      <div className="mb-4">
        <h1 className="h2 text-dark mb-1">Create New Campaign</h1>
        <p className="text-secondary">Design and schedule your email marketing campaign</p>
      </div>

      {/* Search Bar */}

      <div className="mb-4">
        <div className="position-relative" style={{ maxWidth: '400px' }}>
          <Search size={18} className="position-absolute start-0 top-50 translate-middle-y ms-3 text-secondary" />
          <input
            type="text"
            className="form-control ps-5 rounded-pill shadow-none"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Campaign Form with Tabs */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 pt-4 px-4">
              <h5 className="card-title fw-semibold">Campaign Details</h5>
            </div>
            <div className="card-body p-4 pt-0">
              {/* Tabs */}
              <ul className="nav nav-pills nav-fill bg-light p-1 rounded-3 mb-4">
                <li className="nav-item">
                  <button
                    className={`nav-link rounded-3 border-0 ${activeTab === 'manual' ? 'active shadow-sm' : 'text-secondary bg-transparent'}`}
                    onClick={() => setActiveTab('manual')}
                  >
                    Manual Email
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link rounded-3 border-0 d-flex align-items-center justify-content-center ${activeTab === 'ai' ? 'active shadow-sm' : 'text-secondary bg-transparent'}`}
                    onClick={() => setActiveTab('ai')}
                  >
                    <Sparkles size={16} className="me-2" />
                    AI Assistant
                  </button>
                </li>
              </ul>

              {activeTab === 'manual' || (activeTab === 'ai' && aiMode === 'generated') ? (
                <div className="d-flex flex-column gap-4">
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
                          <button
                            key={index}
                            type="button"
                            className={`nav-link border-0 px-4 py-2 bg-transparent ${selectedVariationIndex === index ? 'text-primary border-bottom border-primary border-2 fw-semibold' : 'text-secondary'}`}
                            onClick={() => {
                              setSelectedVariationIndex(index);
                              setForm(prev => ({
                                ...prev,
                                subject: generatedVariations[index].subject,
                                content: generatedVariations[index].body
                              }));
                            }}
                          >
                            Variation {index + 1}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Template Selector for Manual/Edited Mode - ONLY show in Manual Tab */}
                  {activeTab === 'manual' && (
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label fw-medium small text-secondary mb-0">Load Template (Optional)</label>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none small"
                          style={{ fontSize: '11px' }}
                          onClick={fetchTemplates}
                        >
                          Refresh
                        </button>
                      </div>
                      <select
                        className="form-select form-select-sm"
                        onChange={(e) => {
                          const tId = e.target.value;
                          if (!tId) return;
                          const t = templates.find(temp => temp._id === tId);
                          if (t) {
                            setForm(prev => ({
                              ...prev,
                              subject: t.subject || prev.subject,
                              content: t.body || prev.content
                            }));
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="">-- Select a Template to Load --</option>
                        {templates.map(t => (
                          <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  )}


                  <div>
                    <label className="form-label fw-medium small">Campaign Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Summer Sale 2025"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  {/* Email Provider Selection Removed - Defaulting to SES */}


                  {/* CSV Upload */}
                  <div>
                    <label className="form-label fw-medium small">Upload Email List (CSV)</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={onFileChange}
                      accept=".csv"
                      className="d-none"
                    />
                    <input
                      type="file"
                      ref={imageFileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="d-none"
                    />
                    <button className="btn btn-outline-primary flex-grow-1 d-flex align-items-center justify-content-center" onClick={handleUploadCSV}>
                      <Upload size={16} className="me-2" />
                      {uploadedFileName || 'Upload CSV File'}
                    </button>
                    {uploadedFileName && (
                      <span className="badge bg-success-subtle text-success d-flex align-items-center px-3 border border-success-subtle">
                        <CheckCircle size={14} className="me-1" /> {form.recipients.length} Emails
                      </span>
                    )}
                    <p className="x-small text-secondary mt-1" style={{ fontSize: '11px' }}>Universal CSV format recommended</p>


                    <div>
                      <label className="form-label fw-medium small">Subject Line</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter an engaging subject"
                        value={form.subject}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm({ ...form, subject: val });
                          if (generatedVariations.length > 0) {
                            const newVars = [...generatedVariations];
                            newVars[selectedVariationIndex].subject = val;
                            setGeneratedVariations(newVars);
                          }
                        }}
                      />
                    </div>

                    <div>
                      <label className="form-label fw-medium small">Email Body</label>
                      <textarea
                        className="form-control"
                        rows="8"
                        placeholder="Compose your message..."
                        ref={contentRef}
                        value={form.content}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm({ ...form, content: val });
                          if (generatedVariations.length > 0) {
                            const newVars = [...generatedVariations];
                            newVars[selectedVariationIndex].body = val;
                            setGeneratedVariations(newVars);
                          }
                        }}
                      ></textarea>
                      <div className="d-flex gap-2 mt-2">
                        <button type="button" className="btn btn-sm btn-light border text-secondary" onClick={handleAddImage}>Add Image</button>
                        <button type="button" className="btn btn-sm btn-light border text-secondary" onClick={handleInsertLink}>Insert Link</button>
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-medium small">Schedule Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={form.scheduleDate}
                          onChange={(e) => setForm({ ...form, scheduleDate: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-medium small">Schedule Time</label>
                        <input
                          type="time"
                          className="form-control"
                          value={form.scheduleTime}
                          onChange={(e) => setForm({ ...form, scheduleTime: e.target.value })}
                        />
                      </div>
                    </div>

                    {statusMsg && (
                      <div className={`alert ${statusMsg.includes('✅') ? 'alert-success' : 'alert-danger'} py-2 small`}>
                        {statusMsg}
                      </div>
                    )}

                    <div className="d-flex gap-3 pt-3">
                      <button
                        className="btn btn-primary px-4 py-2 flex-grow-1 d-flex align-items-center justify-content-center"
                        onClick={handleSubmit}
                        disabled={loading}
                      >
                        {loading ? <Loader2 size={18} className="me-2 animate-spin" /> : <Send size={18} className="me-2" />}
                        {loading ? "Scheduling..." : "Schedule Campaign"}
                      </button>
                      <button
                        className="btn btn-success px-4 py-2 flex-grow-1 d-flex align-items-center justify-content-center text-white border-0"
                        onClick={handleSendNow}
                        disabled={sendingNow || loading}
                        style={{ background: '#00695C' }}
                      >
                        {sendingNow ? <Loader2 size={18} className="me-2 animate-spin" /> : <Send size={18} className="me-2" />}
                        {sendingNow ? "Sending..." : "Send Mails Now"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary px-4 py-2 flex-grow-1 d-flex align-items-center justify-content-center"
                        onClick={handleSendTest}
                        disabled={sendingTest || loading}
                      >
                        {sendingTest ? <Loader2 size={18} className="me-2 animate-spin" /> : <TestTube size={18} className="me-2" />}
                        {sendingTest ? "Sending..." : "Send Test"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
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
                      <select
                        className="form-select shadow-none"
                        value={aiFormData.campaignType}
                        onChange={(e) => setAiFormData({ ...aiFormData, campaignType: e.target.value })}
                      >
                        <option value="promotion">Promotion</option>
                        <option value="announcement">Announcement</option>
                        <option value="newsletter">Newsletter</option>
                        <option value="cold-outreach">Cold Outreach</option>
                        <option value="event-invite">Event Invitation</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium small">Variation Count</label>
                      <input
                        type="number"
                        className="form-control shadow-none"
                        min="1"
                        max="5"
                        value={aiFormData.variationCount}
                        onChange={(e) => setAiFormData({ ...aiFormData, variationCount: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium small">Target Audience</label>
                      <input
                        type="text"
                        className="form-control shadow-none"
                        placeholder="e.g., Marketing managers at tech startups"
                        value={aiFormData.audience}
                        onChange={(e) => setAiFormData({ ...aiFormData, audience: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium small">Keywords (comma separated)</label>
                      <input
                        type="text"
                        className="form-control shadow-none"
                        placeholder="e.g., high-ROI, automated, scalable"
                        value={aiFormData.keywords}
                        onChange={(e) => setAiFormData({ ...aiFormData, keywords: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-medium small">Context/Key Points</label>
                      <textarea
                        className="form-control shadow-none"
                        rows="3"
                        placeholder="Provide deep context for the AI to generate better content..."
                        value={aiFormData.context}
                        onChange={(e) => setAiFormData({ ...aiFormData, context: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium small">Tone</label>
                      <select
                        className="form-select shadow-none"
                        value={aiFormData.tone}
                        onChange={(e) => setAiFormData({ ...aiFormData, tone: e.target.value })}
                      >
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
                      <AlertCircle size={16} />
                      {statusMsg}
                    </div>
                  )}

                  <button
                    className="btn btn-primary d-flex align-items-center justify-content-center py-2 border-0 shadow-sm"
                    onClick={handleGenerateEmail}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={18} className="me-2 animate-spin" />
                        Generating {aiFormData.variationCount} Variations...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} className="me-2" />
                        Generate Anti-Spam Variations
                      </>
                    )}
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
