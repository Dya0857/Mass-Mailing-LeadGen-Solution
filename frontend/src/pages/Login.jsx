import { useState } from "react";
import { Mail, ShieldCheck, CheckCircle2, BarChart2 } from "lucide-react";
import api from "../api";  // REQUIRED BACKEND CONNECT
import Register from "./Register";
import "./styles/auth.css";


export default function Login({ onLogin, setPage}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  // ===== LOGIN HANDLER (BACKEND CONNECTED) ===== //
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);

      setMsg("Login successful");
      onLogin(); // NAVIGATE TO DASHBOARD
    } catch (err) {
      setMsg(err.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="login-wrapper">
        
      {/* LEFT PANEL */}
      <div className="login-left">
        <form className="login-box" onSubmit={handleLogin}>

          <div className="branding">
            <Mail size={42} strokeWidth={1.7} />
            <div>
              <h2>MailMaster</h2>
              <p>Lead Generation Solution for SMEs</p>
            </div>
          </div>

          <label>Email Address</label>
          <input
            type="email"
            placeholder="john@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="options">
            <label className="remember">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            <a href="#" className="forgot">Forgot Password?</a>
          </div>

          <button type="submit" className="btn-main">Sign In →</button>
          <p className="signup-text">
  Don't have an account?
  <button 
    type="button"
    onClick={() => setPage("register")} 
    style={{ background: "none", border: 0, color: "#007bff", cursor: "pointer" }}
  >
    Sign up free
  </button>
</p>

          {msg && <p style={{ marginTop: 10, color: "crimson" }}>{msg}</p>} 
        </form>
      </div>


      {/* RIGHT PANEL */}
      <div className="login-right">
        <h1>Safe & Reliable <br /> Email Marketing</h1>

        <p className="sub-text">
          Send bulk emails without worrying about blacklists or spam filters.
          Optimized delivery means more inbox hits and better conversions.
        </p>

        <div className="feature-card">
          <ShieldCheck size={20} /> Spam Protection
          <p>Keep your domain reputation intact</p>
        </div>

        <div className="feature-card">
          <CheckCircle2 size={20} /> Verified Email Delivery
          <p>Reduce bounce, increase inbox placement</p>
        </div>

        <div className="feature-card">
          <BarChart2 size={20} /> Real-time Analytics
          <p>Track clicks, opens, and engagement</p>
        </div>
      </div>

    </div>
  );
}
