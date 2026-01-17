import React, { useState } from "react";

export default function CreateCampaign() {
  const [form, setForm] = useState({
    campaignName: "",
    subject: "",
    previewText: "",
    senderName: "",
    emailBody: "",
    recipients: "",
    schedule: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
  };

  return (
    <div className="container mt-4">
      <h4 className="fw-bold mb-3">Create Campaign</h4>

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label">Campaign Name</label>
          <input className="form-control" name="campaignName" onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Subject</label>
          <input className="form-control" name="subject" onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Preview Text</label>
          <input className="form-control" name="previewText" onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Sender Name</label>
          <input className="form-control" name="senderName" onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Email Body</label>
          <textarea className="form-control" rows="4" name="emailBody" onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Recipients (comma separated)</label>
          <input className="form-control" name="recipients" onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Schedule (optional)</label>
          <input type="datetime-local" className="form-control" name="schedule" onChange={handleChange} />
        </div>

        <button className="btn btn-primary">Create Campaign</button>
      </form>
    </div>
  );
}
