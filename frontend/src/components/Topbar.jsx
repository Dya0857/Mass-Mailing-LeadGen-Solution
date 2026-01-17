import { Search, Bell, User } from "lucide-react";

export default function Topbar() {
  let userName = "User";
  let userRole = "User";

  const token = localStorage.getItem("token");

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userName = payload.name || payload.email || "User";
    } catch (err) {
      console.error("Invalid token");
    }
  }

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
            <p className="user-name">{userName}</p>
            <p className="user-role">{userRole}</p>
          </div>

          <div className="user-avatar">
            <User size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
