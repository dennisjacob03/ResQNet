import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './features/landing/LandingPage';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import UserDashboard from './features/user-dashboard/UserDashboard';
import AdminDashboard from './features/admin/AdminDashboard';
import ShelterDashboard from './features/shelter/ShelterDashboard';
import VetDashboard from './features/veterinary/VetDashboard';
import RescueTeamDashboard from './features/rescue-team/RescueTeamDashboard';
import { Heart, LogOut, Shield, User, Building2, Stethoscope, UserCheck, AlertTriangle } from 'lucide-react';

// Sample Dashboard component customized by User Role
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Rescue Team':
        return <Shield className="w-6 h-6 text-teal-400" />;
      case 'Shelter':
        return <Building2 className="w-6 h-6 text-amber-400" />;
      case 'Veterinary Staff':
        return <Stethoscope className="w-6 h-6 text-cyan-400" />;
      case 'Admin':
        return <UserCheck className="w-6 h-6 text-rose-400" />;
      default:
        return <User className="w-6 h-6 text-emerald-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Header */}
        <header className="flex items-center justify-between p-6 bg-slate-900/90 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400">
              <Heart className="w-6 h-6 fill-emerald-500/30" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">
                ResQ<span className="text-emerald-400">Net</span> Portal
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Role-Based Access Control Active
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 rounded-xl text-sm font-semibold border border-slate-700 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </header>

        {/* User Welcome Card */}
        <div className="p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            {getRoleIcon(user?.role)}
          </div>

          <div className="flex items-start gap-4">
            <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl">
              {getRoleIcon(user?.role)}
            </div>
            <div>
              <span className="inline-block px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full mb-2">
                {user?.role || 'Authenticated'}
              </span>
              <h2 className="text-2xl font-bold text-white">
                Welcome back, {user?.fullName || 'User'}!
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Connected email: <span className="text-slate-200 font-medium">{user?.email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="text-xs text-slate-500 font-medium">Account Status</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">{user?.status || 'Active'}</div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="text-xs text-slate-500 font-medium">Phone Contact</div>
            <div className="text-sm font-semibold text-slate-200 mt-1">{user?.phoneNumber || 'N/A'}</div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="text-xs text-slate-500 font-medium">Location</div>
            <div className="text-sm font-semibold text-slate-200 mt-1">
              {[user?.city, user?.state].filter(Boolean).join(', ') || 'Not specified'}
            </div>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="text-xs text-slate-500 font-medium">Account Role</div>
            <div className="text-sm font-semibold text-slate-200 mt-1">{user?.role}</div>
          </div>
        </div>

        {/* Role Specific Action Panel */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
          <h3 className="text-lg font-bold text-white mb-4">
            {user?.role} Workspace Controls
          </h3>

          {user?.role === 'Public User' && (
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition">
                + Report Stray / Injured Animal
              </button>
              <button className="px-4 py-2.5 bg-slate-800 text-slate-200 font-semibold text-xs rounded-xl hover:bg-slate-700 transition">
                Browse Animals for Adoption
              </button>
            </div>
          )}

          {user?.role === 'Rescue Team' && (
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-teal-400 transition">
                View Active Dispatch Calls
              </button>
              <button className="px-4 py-2.5 bg-slate-800 text-slate-200 font-semibold text-xs rounded-xl hover:bg-slate-700 transition">
                Update Rescue GPS Status
              </button>
            </div>
          )}

          {user?.role === 'Shelter' && (
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition">
                Manage Shelter Capacity & Intake
              </button>
              <button className="px-4 py-2.5 bg-slate-800 text-slate-200 font-semibold text-xs rounded-xl hover:bg-slate-700 transition">
                Review Adoption Applications
              </button>
            </div>
          )}

          {user?.role === 'Veterinary Staff' && (
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-cyan-400 transition">
                Open Electronic Health Records (EHR)
              </button>
              <button className="px-4 py-2.5 bg-slate-800 text-slate-200 font-semibold text-xs rounded-xl hover:bg-slate-700 transition">
                Prescribe Treatments & Vaccination
              </button>
            </div>
          )}

          {user?.role === 'Admin' && (
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2.5 bg-rose-500 text-white font-bold text-xs rounded-xl hover:bg-rose-400 transition">
                Manage Platform Users & Roles
              </button>
              <button className="px-4 py-2.5 bg-slate-800 text-slate-200 font-semibold text-xs rounded-xl hover:bg-slate-700 transition">
                System Analytics & Audit Logs
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Unauthorized Page
const Unauthorized = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
    <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 mb-4">
      <AlertTriangle className="w-8 h-8" />
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
    <p className="text-slate-400 text-sm max-w-md mb-6">
      You do not have the required role permissions to access this specific module.
    </p>
    <a
      href="/dashboard"
      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition"
    >
      Return to Dashboard
    </a>
  </div>
);

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
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
