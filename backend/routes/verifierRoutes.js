import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import { EmailVerifierPage } from "./pages/EmailVerifier";

function App() {
  return (
    <Routes>
      {/* Protected layout */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/email-verifier" element={<EmailVerifierPage />} />
      </Route>

      {/* Public */}
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
