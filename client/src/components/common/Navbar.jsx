import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Heart, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="ResQNet Logo"
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform select-none"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              className="text-[#4b5563] hover:text-[#237737] font-semibold text-sm transition-colors"
            >
              Features
            </a>
            <a 
              href="#impact" 
              className="text-[#4b5563] hover:text-[#237737] font-semibold text-sm transition-colors"
            >
              Impact
            </a>
            <a 
              href="#stories" 
              className="text-[#4b5563] hover:text-[#237737] font-semibold text-sm transition-colors"
            >
              Stories
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#237737] text-white hover:bg-[#1b632d] shadow-md shadow-[#237737]/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-[#151c28] hover:text-[#237737] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#237737] text-white hover:bg-[#1b632d] shadow-md shadow-[#237737]/20 transition-all cursor-pointer"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#237737]"
          >
            Features
          </a>
          <a
            href="#impact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#237737]"
          >
            Impact
          </a>
          <a
            href="#stories"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#237737]"
          >
            Stories
          </a>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="w-full text-center px-4 py-2.5 rounded-xl font-bold bg-[#237737] text-white hover:bg-[#1b632d]"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-xl font-bold text-[#151c28] border border-slate-200 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-xl font-bold bg-[#237737] text-white hover:bg-[#1b632d]"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
