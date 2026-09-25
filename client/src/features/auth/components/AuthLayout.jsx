import React, { useState, useEffect } from 'react';
import { CircleCheckBig } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPublicStats } from '../../../services/statsService';

const AuthLayout = ({ children, title, subtitle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === '/login' || location.pathname === '/';
  const redirectParam = new URLSearchParams(location.search).get('redirect');

  const [stats, setStats] = useState({
    animalsRescued: 0,
    partnerShelters: 0,
    petsAdopted: 0,
  });

  useEffect(() => {
    let isMounted = true;
    getPublicStats()
      .then((data) => {
        if (isMounted && data?.stats) {
          setStats({
            animalsRescued: data.stats.animalsRescued || 0,
            partnerShelters: data.stats.partnerShelters || 0,
            petsAdopted: data.stats.petsAdopted || 0,
          });
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch public stats in AuthLayout:', err.message);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row font-sans bg-[#F8FAF9]">
      
      {/* Mobile Top Header (< lg) */}
      <div className="lg:hidden bg-[#237737] px-4 py-3 text-white flex items-center justify-between shadow-xs sticky top-0 z-30">
        <div className="bg-white/95 px-2.5 py-1 rounded-lg inline-flex items-center shadow-xs">
          <img
            src="/logo.png"
            alt="ResQNet Logo"
            className="h-7 w-auto object-contain"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-xs p-1 rounded-lg border border-white/10">
          <button
            type="button"
            onClick={() => navigate(redirectParam ? `/login?redirect=${redirectParam}` : '/login')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isLogin
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-emerald-100 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => navigate(redirectParam ? `/register?redirect=${redirectParam}` : '/register')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer ${
              !isLogin
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-emerald-100 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>
      </div>

      {/* Desktop Left Side: Solid Forest Green Brand Banner (lg:flex) */}
      <div className="hidden lg:flex lg:w-4/12 xl:w-4/12 bg-[#237737] p-8 xl:p-10 text-white flex-col justify-between relative overflow-hidden h-full flex-shrink-0">
        {/* Top Logo Container */}
        <div>
          <div className="mb-6 lg:mb-8">
            <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl inline-flex items-center shadow-md border border-white/50">
              <img
                src="/logo.png"
                alt="ResQNet Logo"
                className="h-8 lg:h-9 w-auto object-contain"
              />
            </div>
          </div>
          <div className="pt-6">
            {/* Main Headline */}
            <h1 className="text-2xl xl:text-3xl font-extrabold leading-tight text-white tracking-tight mb-3">
              Every animal deserves a chance.
            </h1>

            {/* Description */}
            <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed mb-6 max-w-md font-normal">
              Join thousands of rescuers, vets, and animal lovers on the platform that's saving lives every day.
            </p>

            {/* Stats List */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-white text-xs sm:text-sm font-medium">
                <CircleCheckBig className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span>{stats.animalsRescued.toLocaleString()} animals rescued</span>
              </div>

              <div className="flex items-center gap-2.5 text-white text-xs sm:text-sm font-medium">
                <CircleCheckBig className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span>{stats.partnerShelters.toLocaleString()} partner shelters</span>
              </div>

              <div className="flex items-center gap-2.5 text-white text-xs sm:text-sm font-medium">
                <CircleCheckBig className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span>{stats.petsAdopted.toLocaleString()} adoptions completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Copyright */}
        <div className="pt-4 text-emerald-200/75 text-xs font-normal">
          © 2026 ResQNet Platform
        </div>
      </div>

      {/* Right Side: Light Form Section */}
      <div className="flex-1 bg-[#F8FAF9] p-4 sm:p-6 lg:p-8 flex flex-col justify-between overflow-y-auto min-h-[calc(100vh-60px)] lg:min-h-full">
         
        {/* Desktop Top Segmented Navigation Pills (Sign In / Register) */}
        <div className="hidden lg:flex justify-end">
          <div className="bg-slate-200/70 p-1 rounded-xl inline-flex items-center gap-1 border border-slate-300/60">
            <button
              type="button"
              onClick={() => navigate(redirectParam ? `/login?redirect=${redirectParam}` : '/login')}
              className={`px-4 py-1 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isLogin
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate(redirectParam ? `/register?redirect=${redirectParam}` : '/register')}
              className={`px-4 py-1 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                !isLogin
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Main Content Form Wrapper */}
        <div className="max-w-xl mx-auto w-full my-auto py-2 sm:py-4">
          {(title || subtitle) && (
            <div className="mb-4 sm:mb-6">
              {title && (
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </div>

        {/* Footer Terms & Conditions */}
        <div className="pt-4 pb-2 text-center text-xs text-slate-500 font-medium">
          By continuing, you agree to ResQNet's{' '}
          <a href="#terms" className="underline hover:text-slate-800">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#privacy" className="underline hover:text-slate-800">
            Privacy Policy
          </a>.
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;
