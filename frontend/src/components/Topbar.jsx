import { Search, Bell, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { user } = useAuth();

  const displayName = user?.name || "User";
  const displayRole = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()) : "User";
  const displayAvatar = user?.avatar;

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
            <p className="user-name">{displayName}</p>
            <p className="user-role">{displayRole}</p>
          </div>

          <div className="user-avatar">
            {displayAvatar ? (
              <img
                src={displayAvatar}
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
