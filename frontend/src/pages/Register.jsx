import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../service/api";
import "../styles/auth.css"; // 🔴 IMPORTANT: ensure this exists

export default function Register() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (user.password !== user.confirmPassword) {
      setMsg("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", {
        name: user.name,
        company: user.company,
        email: user.email,
        password: user.password,
      });

      setMsg("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setMsg(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      {/* LEFT SECTION */}
      <div className="register-left">
        <div className="register-card">
          <h2 className="mb-1 fw-bold">Create Account</h2>
          <p className="reg-subtitle">
            Get started with Mass Mailer in seconds
          </p>

          <form onSubmit={handleRegister} className="mt-3">
            <div className="reg-input">
              <input
                type="text"
                placeholder="Full Name"
                value={user.name}
                onChange={(e) =>
                  setUser({ ...user, name: e.target.value })
                }
                required
              />
            </div>

            <div className="reg-input">
              <input
                type="text"
                placeholder="Company Name"
                value={user.company}
                onChange={(e) =>
                  setUser({ ...user, company: e.target.value })
                }
                required
              />
            </div>

            <div className="reg-input">
              <input
                type="email"
                placeholder="Work Email Address"
                value={user.email}
                onChange={(e) =>
                  setUser({ ...user, email: e.target.value })
                }
                required
              />
            </div>

            <div className="reg-input">
              <input
                type="password"
                placeholder="Password"
                value={user.password}
                onChange={(e) =>
                  setUser({ ...user, password: e.target.value })
                }
                required
              />
            </div>

            <div className="reg-input">
              <input
                type="password"
                placeholder="Confirm Password"
                value={user.confirmPassword}
                onChange={(e) =>
                  setUser({
                    ...user,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />
            </div>

            <button className="reg-btn" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          {msg && <p className="reg-msg">{msg}</p>}

          <hr className="divider" />

          <p className="text-center register-switch">
            Already have an account?{" "}
            <span
              className="link-btn"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="register-right">
        <h1>Automate Your Email Marketing</h1>
        <p>
          Generate leads, manage outreach & send bulk emails effortlessly.
        </p>

        <div className="reg-feature">Fast onboarding</div>
        <div className="reg-feature">Smart analytics dashboard</div>
        <div className="reg-feature">Spam-safe mass mail delivery</div>
      </div>
    </div>
  );
}
