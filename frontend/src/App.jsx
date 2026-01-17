import { Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected Pages
import Dashboard from "./pages/Dashboard";
import SendMail from "./pages/SendMail";
import BulkMail from "./pages/BulkMail";
import CampaignPage from "./pages/CampaignPage";
import CreateCampaign from "./pages/CreateCampaign";

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
          <Route path="/send-mail" element={<SendMail />} />
          <Route path="/bulk-mail" element={<BulkMail />} />

          {/* Campaign Routes */}
          <Route path="/campaigns" element={<CampaignPage />} />
          <Route path="/campaigns/create" element={<CreateCampaign />} />
        </Route>
      </Route>

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
