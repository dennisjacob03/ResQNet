import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import { Sparkles } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#070D09] flex flex-col items-center justify-center text-slate-100 overflow-hidden select-none">
        {/* Ambient background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#237737]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] bg-emerald-400/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Central Entrance Container */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm">
          {/* Logo with breathing glow halo */}
          <div className="relative mb-6">
            <div className="absolute -inset-3 bg-gradient-to-r from-[#237737] via-emerald-400 to-[#1b5e2b] rounded-3xl opacity-40 blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-2xl bg-white/[0.06] backdrop-blur-2xl border border-white/15 p-3 flex items-center justify-center shadow-2xl ring-1 ring-white/10">
              <img
                src="/logofavicon.png"
                alt="ResQNet Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_12px_rgba(35,119,55,0.6)] animate-[pulse_2.5s_ease-in-out_infinite]"
              />
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#237737] border-2 border-[#070D09] flex items-center justify-center text-emerald-200 shadow-md">
                <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
            </div>
          </div>

          {/* Title & Welcome Text */}
          <div className="space-y-1.5 mb-6">
            <h2 className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
              <span>Entering</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-[#237737]">
                ResQNet
              </span>
            </h2>
            <p className="text-xs font-semibold text-emerald-100/60 tracking-wide">
              Preparing your animal care portal...
            </p>
          </div>

          {/* Sleek Shimmering Loading Bar */}
          <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden relative shadow-inner mb-4">
            <div className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-300 to-[#237737] shadow-[0_0_12px_rgba(52,211,153,0.8)] resqnet-shimmer" />
          </div>

          {/* Micro status badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-medium text-white/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Establishing secure session</span>
          </div>
        </div>

        <style>{`
          @keyframes resqnetShimmerSlide {
            0% {
              left: -40%;
              width: 40%;
            }
            50% {
              left: 30%;
              width: 60%;
            }
            100% {
              left: 100%;
              width: 30%;
            }
          }
          .resqnet-shimmer {
            animation: resqnetShimmerSlide 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
