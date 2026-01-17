import React from "react";
import ReactDOM from "react-dom/client";

/* Router */
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* App & Pages */
import App from "./App.jsx";
import GoogleCallback from "./pages/GoogleCallback.jsx";

/* Context */
import { AuthProvider } from "./context/AuthContext";

/* Google OAuth */
import { GoogleOAuthProvider } from "@react-oauth/google";

/* Styles */
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";
import "./styles/dashboard.css";

const CLIENT_ID =
  "758728063984-4uka04lo5k0gl645dvjvrnsv3j43vhvm.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Google OAuth callback */}
            <Route path="/auth/google/callback" element={<GoogleCallback />} />

            {/* Main App */}
            <Route path="/*" element={<App />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
