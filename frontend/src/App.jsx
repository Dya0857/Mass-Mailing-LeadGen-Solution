import React, { useState } from "react";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SendMail from "./pages/SendMail";
import BulkMail from "./pages/BulkMail";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  const [page, setPage] = useState("login");

  const handleLogin = () => setPage("dashboard");

  const handleLogout = () => {
    localStorage.removeItem("token");
    setPage("login");
  };

  return (
    <AuthProvider>
      <div style={{ padding: "20px" }}>

        {/* REGISTER */}
        {page === "register" && <Register setPage={setPage} />}
    

        {/* LOGIN */}
{page === "login" && <Login onLogin={handleLogin} setPage={setPage} />}


        {/* DASHBOARD */}
        {page === "dashboard" && (
          <>
            <Dashboard onLogout={handleLogout} />
            <div style={{ marginTop: 20 }}>
              <button className="btn btn-primary me-2" onClick={() => setPage("sendmail")}>
                Send Mail
              </button>
              <button className="btn btn-secondary" onClick={() => setPage("bulkmail")}>
                Bulk Mail
              </button>
            </div>
          </>
        )}

        {/* SEND MAIL */}
        {page === "sendmail" && (
          <>
            <SendMail />
            <button className="btn btn-link mt-3" onClick={() => setPage("dashboard")}>
              Back to Dashboard
            </button>
          </>
        )}

        {/* BULK MAIL */}
        {page === "bulkmail" && (
          <>
            <BulkMail />
            <button className="btn btn-link mt-3" onClick={() => setPage("dashboard")}>
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </AuthProvider>
  );
}