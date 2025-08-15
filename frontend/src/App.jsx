import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

import Login from "./pages/Login";
import RegisterPage from "./pages/RegisterPage";
import LawyerDashboard from "./pages/LawyerDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import AuditorDashboard from "./pages/AuditorDashboard";
import HowItWorks from "./pages/HowItWorks";
import Privacy from "./components/privacy/Privacy";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/how-it-works" element={<AppLayout> <HowItWorks> </HowItWorks> </AppLayout>} />
        <Route path="/privacy" element={<Privacy />} />
        {/* Protected with layout */}
        <Route
          path="/lawyer"
          element={
            <AppLayout>
              <ProtectedRoute role="lawyer">
                <LawyerDashboard />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/client"
          element={
            <AppLayout>
              <ProtectedRoute role="client">
                <ClientDashboard />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        <Route
          path="/auditor"
          element={
            <AppLayout>
              <ProtectedRoute role="auditor">
                <AuditorDashboard />
              </ProtectedRoute>
            </AppLayout>
          }
        />

        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}
