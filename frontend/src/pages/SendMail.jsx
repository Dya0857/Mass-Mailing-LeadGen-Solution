import React, { useState } from "react";
import api from "../api";

export default function SendMail() {
  const [mail, setMail] = useState({ to: "", subject: "", body: "" });
  const [msg, setMsg] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await api.post("/mail", mail, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg(res.data.message || "Email sent!");
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to send mail");
    }
  };

  return (
    <div className="container">
      <h2>Send Email</h2>
      <form onSubmit={handleSend}>
        <input
          type="email"
          placeholder="Recipient Email"
          value={mail.to}
          onChange={(e) => setMail({ ...mail, to: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Subject"
          value={mail.subject}
          onChange={(e) => setMail({ ...mail, subject: e.target.value })}
          required
        />
        <textarea
          placeholder="Message Body"
          value={mail.body}
          onChange={(e) => setMail({ ...mail, body: e.target.value })}
          required
        />
        <button type="submit">Send</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}
