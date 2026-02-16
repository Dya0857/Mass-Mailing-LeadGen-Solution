import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, CheckCircle2, BarChart2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import api from "../service/api";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("user");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // EMAIL / PASSWORD LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password, role: selectedRole });
      localStorage.setItem("token", res.data.token);
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
      }
      navigate("/dashboard");
    } catch (err) {
      setMsg(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE LOGIN
  const handleGoogleLogin = async (response) => {
    if (!response?.credential) {
      setMsg("Google login failed");
      return;
    }

    setMsg("");
    setLoading(true);

    try {
      const res = await api.post("/auth/google", {
        credential: response.credential,
        role: selectedRole,
      });
      localStorage.setItem("token", res.data.token);
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
      }
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setMsg("Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* LEFT */}
      <div className="login-left">
        <form className="login-box" onSubmit={handleLogin}>
          <div className="branding">
            <Mail size={42} />
            <div>
              <h2>MailMaster</h2>
              <p>Lead Generation Solution for SMEs</p>
            </div>
          </div>

          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Login As</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="role-select"
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '15px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              backgroundColor: '#fff'
            }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button className="btn-main" disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          <div style={{ textAlign: "center", margin: "10px 0" }}>OR</div>

          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setMsg("Google login failed")}
          />

          {msg && <p style={{ color: "crimson" }}>{msg}</p>}

          <p className="signup-text">
            Don’t have an account?
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="link-btn"
            >
              Sign up free
            </button>
          </p>
        </form>
      </div>

      {/* RIGHT */}
      <div className="login-right">
        <h1>Safe & Reliable Email Marketing</h1>

        <div className="feature-card">
          <ShieldCheck size={20} /> Spam Protection
        </div>
        <div className="feature-card">
          <CheckCircle2 size={20} /> Verified Delivery
        </div>
        <div className="feature-card">
          <BarChart2 size={20} /> Real-time Analytics
        </div>
      </div>
    </div>
  );
}
