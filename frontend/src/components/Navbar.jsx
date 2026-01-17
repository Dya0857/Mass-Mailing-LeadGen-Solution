import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand" to="/dashboard">
        LeadGen
      </Link>

      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto">

          <li className="nav-item">
            <Link className="nav-link" to="/campaign/create">
              Create Campaign
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/campaign/list">
              Campaigns
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/send-mail">
              Send Mail
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link" to="/bulk-mail">
              Bulk Mail
            </Link>
          </li>

        </ul>

        <button className="btn btn-outline-light" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
