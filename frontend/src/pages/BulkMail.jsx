import React, { useState } from "react";
import api from "../api";
import "../App.css";

export default function BulkMail() {
  const [mails, setMails] = useState({
    to: "",
    subject: "",
    body: "",
  });
  const [msg, setMsg] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const recipients = mails.to.split(",").map((r) => r.trim()); // split by comma

      const res = await api.post(
        "/mail",
        { ...mails, to: recipients },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg(res.data.message);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to send bulk mail");
    }
  };

  return (
    <div className="container">
      <h2>Bulk Mail Sender</h2>
      <form onSubmit={handleSend}>
        <textarea
          placeholder="Enter recipient emails (comma-separated)"
          value={mails.to}
          onChange={(e) => setMails({ ...mails, to: e.target.value })}
        />
        <input
          placeholder="Subject"
          value={mails.subject}
          onChange={(e) => setMails({ ...mails, subject: e.target.value })}
        />
        <textarea
          placeholder="Message Body"
          value={mails.body}
          onChange={(e) => setMails({ ...mails, body: e.target.value })}
        />
        <button type="submit">Send to All</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}
