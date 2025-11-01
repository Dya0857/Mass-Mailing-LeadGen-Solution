import React, { useState } from "react";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SendMail from "./pages/SendMail";

export default function App() {
  const [page, setPage] = useState("login");

  const handleLogin = () => setPage("dashboard");
  const handleLogout = () => {
    localStorage.removeItem("token");
    setPage("login");
  };

  return (
    <div style={{ padding: "20px" }}>
      {page === "register" && (
        <>
          <Register />
          <button onClick={() => setPage("login")}>Go to Login</button>
        </>
      )}
      {page === "login" && (
        <>
          <Login onLogin={handleLogin} />
          <button onClick={() => setPage("register")}>Go to Register</button>
        </>
      )}
      {page === "dashboard" && (
        <>
          <Dashboard onLogout={handleLogout} />
          <button onClick={() => setPage("sendmail")}>Send Mail</button>
        </>
      )}
      {page === "sendmail" && (
        <>
          <SendMail />
          <button onClick={() => setPage("dashboard")}>Back to Dashboard</button>
        </>
      )}
    </div>
  );
}
