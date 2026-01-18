import { Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected Pages
import Dashboard from "./pages/Dashboard";
import CampaignPage from "./pages/CampaignPage";
import { EmailVerifierPage } from "./pages/EmailVerifier";

// Layout & Route Guard
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Campaign Routes */}
          <Route path="/campaigns" element={<CampaignPage />} />
          <Route path="/email-verifier" element={<EmailVerifierPage />} />
        </Route>
      </Route>

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
