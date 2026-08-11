import React from 'react';
import { CircleCheckBig } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === '/login' || location.pathname === '/';

  return (
    <div className="h-screen w-full flex items-center justify-center font-sans">
      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Solid Forest Green Brand Banner */}
        <div className="lg:col-span-4 bg-[#237737] p-6 lg:p-8 text-white flex flex-col justify-between relative overflow-hidden h-full">
          
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
						<div className="pt-8">
							{/* Main Headline */}
							<h1 className="text-2xl sm:text-3xl lg:text-3xl font-extrabold leading-tight text-white tracking-tight mb-3">
								Every animal deserves a chance.
							</h1>

							{/* Description */}
							<p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed mb-6 max-w-md font-normal">
								Join thousands of rescuers, vets, and animal lovers on the platform that's saving lives every day.
							</p>

							{/* Stats List */}
							<div className="space-y-3">
								<div className="flex items-center gap-2.5 text-white text-xs sm:text-sm font-medium">
									<CircleCheckBig className="w-4 h-4 text-white flex-shrink-0" />
									<span>12,480 animals rescued</span>
								</div>

								<div className="flex items-center gap-2.5 text-white text-xs sm:text-sm font-medium">
									<CircleCheckBig className="w-4 h-4 text-white flex-shrink-0" />
									<span>186 partner shelters</span>
								</div>

								<div className="flex items-center gap-2.5 text-white text-xs sm:text-sm font-medium">
									<CircleCheckBig className="w-4 h-4 text-white flex-shrink-0" />
									<span>8,920 adoptions completed</span>
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
        <div className="lg:col-span-8 bg-[#F8FAF9] p-5 sm:p-8 lg:p-8 flex flex-col justify-between relative overflow-y-auto h-full">
           
          {/* Top Segmented Navigation Pills (Sign In / Register) */}
          <div className="flex justify-center sm:justify-end">
            <div className="bg-slate-200/70 p-1 rounded-xl inline-flex items-center gap-1 border border-slate-300/60">
              <button
                type="button"
                onClick={() => navigate('/login')}
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
                onClick={() => navigate('/register')}
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
          <div className="max-w-xl mx-auto w-full my-auto py-1">
            {(title || subtitle) && (
              <div className="mb-4">
                {title && (
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-slate-500 text-xs mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            {children}
          </div>

          {/* Footer Terms & Conditions */}
          <div className="pt-2 mt-2 text-center text-xs text-slate-500 font-medium">
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
    </div>
  );
};

export default AuthLayout;
