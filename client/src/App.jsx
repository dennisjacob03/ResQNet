import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './features/landing/LandingPage';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UserDashboard from './features/user-dashboard/UserDashboard';
import AdminDashboard from './features/admin/AdminDashboard';
import ShelterDashboard from './features/shelter/ShelterDashboard';
import VetDashboard from './features/veterinary/VetDashboard';
import RescueTeamDashboard from './features/rescue-team/RescueTeamDashboard';
import PetDetailsPage from './features/adoption/PetDetailsPage';

const DashboardGateway = () => {
  const { user } = useAuth();
  if (user?.role === 'Admin') {
    return <AdminDashboard />;
  }
  if (user?.role === 'Shelter' || user?.role === 'Shelter Manager') {
    return <ShelterDashboard />;
  }
  if (user?.role === 'Veterinary Staff') {
    return <VetDashboard />;
  }
  if (user?.role === 'Rescue Team') {
    return <RescueTeamDashboard />;
  }
  return <UserDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardGateway />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adoption/:id"
            element={
              <ProtectedRoute>
                <PetDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
