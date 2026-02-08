import { useState, useEffect } from "react";
import { Search, Bell, User } from "lucide-react";

export default function Topbar() {
  const [user, setUser] = useState({ name: "User", role: "User", avatar: null });

  useEffect(() => {
    const updateUser = () => {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser.name) {
        setUser({
          name: storedUser.name,
          role: "User", // Role not typically stored in user object yet, usually in token. keeping default.
          avatar: storedUser.avatar
        });
      } else {
        // Fallback to token if localStorage is empty (e.g. fresh login)
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setUser(prev => ({ ...prev, name: payload.name || payload.email || "User" }));
          } catch (err) {
            console.error("Invalid token");
          }
        }
      }
    };

    updateUser();

    // Listen for storage changes (cross-tab) or custom events if needed
    window.addEventListener("storage", updateUser);
    return () => window.removeEventListener("storage", updateUser);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-search-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search campaigns, contacts..."
            className="search-input"
          />
        </div>
      </div>

      <div className="topbar-right">
        <button className="notification-button">
          <Bell size={24} />
          <span className="notification-badge">3</span>
        </button>

        <div className="user-profile-section">
          <div className="user-info">
            <p className="user-name">{user.name}</p>
            <p className="user-role">{user.role}</p>
          </div>

          <div className="user-avatar">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
              />
            ) : (
              <User size={20} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
