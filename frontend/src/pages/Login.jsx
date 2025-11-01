import React, { useState } from "react";
import api from "../api";

export default function Login({ onLogin }) {
  const [data, setData] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", data);
      localStorage.setItem("token", res.data.token);
      setMsg("Login successful!");
      onLogin(); // Redirect to dashboard
    } catch (err) {
      setMsg(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}
