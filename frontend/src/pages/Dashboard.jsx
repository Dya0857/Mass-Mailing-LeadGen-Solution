import React from "react";

export default function Dashboard({ onLogout }) {
  const name = localStorage.getItem("userName") || "User";

  return (
    <div className="container">
      <h2>Welcome, {name}</h2>
      <p>This is your dashboard.</p>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}
