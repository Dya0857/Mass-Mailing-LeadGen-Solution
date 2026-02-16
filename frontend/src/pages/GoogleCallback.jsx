import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../service/api";
import { useAuth } from "../context/AuthContext";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    async function verifyGoogleLogin() {
      try {
        // Get token from URL query (Google redirects with ?credential=xxx)
        const params = new URLSearchParams(window.location.search);
        const credential = params.get("credential");

        if (!credential) {
          console.error("Google did not return credential");
          return;
        }

        // Send credential to backend
        const res = await api.post("/auth/google", { credential });

        // Save JWT from backend
        localStorage.setItem("token", res.data.token);
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          setUser(res.data.user);
        }

        // Redirect user
        navigate("/dashboard");
      } catch (err) {
        console.error("Google Login Error", err);
      }
    }

    verifyGoogleLogin();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h2>Signing you in...</h2>
      <p>Please wait while we verify your Google account.</p>
    </div>
  );
}
