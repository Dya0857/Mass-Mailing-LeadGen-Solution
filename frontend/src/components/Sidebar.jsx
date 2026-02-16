import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import api from "../service/api";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get("/users/profile");
      if (res.data) {
        // Update global user state
        setUser(prev => ({ ...prev, ...res.data }));

        // Sync to localStorage
        const rawUser = localStorage.getItem("user");
        if (rawUser && rawUser !== "undefined" && rawUser !== "null") {
          const storedUser = JSON.parse(rawUser);
          localStorage.setItem("user", JSON.stringify({ ...storedUser, ...res.data }));
        }
      }
    } catch (err) {
      console.error("Failed to load user profile in sidebar", err);
    }
  };

  const userRole = user?.role || "user";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className="d-flex flex-column vh-100 text-white p-3"
      style={{
        width: "260px",
        background: "linear-gradient(180deg,#1d4ed8,#2563eb)",
      }}
    >
      <h4 className="mb-4">
        📧 MailMaster
        <div className="small text-light">Lead Generation Pro</div>
        <div className="mt-2 text-warning fw-bold" style={{ fontSize: '12px', border: '1px solid orange', padding: '2px 8px', borderRadius: '4px', width: 'fit-content' }}>
          Role: {userRole.toUpperCase()}
        </div>
      </h4>

      <ul className="nav nav-pills flex-column gap-2">
        {/* Dashboard */}
        <li className="nav-item">
          <button
            className={`nav-link text-start ${isActive("/dashboard") ? "bg-white text-primary" : "text-white"}`}
            onClick={() => navigate("/dashboard")}
          >
            🏠 Dashboard
          </button>
        </li>

        {/* Campaigns */}
        <li className="nav-item">
          <button
            className={`nav-link text-start ${isActive("/campaigns") ? "bg-white text-primary" : "text-white"}`}
            onClick={() => navigate("/campaigns")}
          >
            ✉️ Campaigns
          </button>
        </li>

        {/* Email Verifier */}
        <li className="nav-item">
          <button
            className={`nav-link text-start ${isActive("/email-verifier") ? "bg-white text-primary" : "text-white"}`}
            onClick={() => navigate("/email-verifier")}
          >
            ✔ Email Verifier
          </button>
        </li>




        {/* Reports */}
        <li className="nav-item">
          <button
            className={`nav-link text-start ${isActive("/reports") ? "bg-white text-primary" : "text-white"}`}
            onClick={() => navigate("/reports")}
          >
            📊 Reports
          </button>
        </li>

        {/* Profile */}
        <li className="nav-item">
          <button
            className={`nav-link text-start ${isActive("/edit-profile") ? "bg-white text-primary" : "text-white"}`}
            onClick={() => navigate("/edit-profile")}
          >
            👤 Profile
          </button>
        </li>

        {/* Settings */}
        {userRole?.toLowerCase() === "admin" && (
          <li className="nav-item">
            <button
              className={`nav-link text-start ${isActive("/settings") ? "bg-white text-primary" : "text-white"}`}
              onClick={() => navigate("/settings")}
            >
              ⚙ Settings
            </button>
          </li>
        )}
      </ul>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="btn btn-outline-light mt-auto"
      >
        🚪 Logout
      </button>

      <div className="mt-3 small opacity-75">
        Manage cookies or opt out
      </div>
    </div>
  );
}
