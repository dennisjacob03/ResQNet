import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Globe, Share2, MessageSquare, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0f172a] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center group">
              <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl inline-flex items-center shadow-md border border-white/20 group-hover:scale-105 transition-transform">
                <img
                  src="/logo.png"
                  alt="ResQNet Logo"
                  className="h-8 w-auto object-contain select-none"
                />
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Empowering communities, rescue squads, shelters, and veterinary clinics with real-time GPS tracking, AI triage, and smart IoT collars for rapid animal rescue.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-[#237737] hover:text-white transition-colors text-slate-400">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-[#237737] hover:text-white transition-colors text-slate-400">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-[#237737] hover:text-white transition-colors text-slate-400">
                <MessageSquare className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-[#237737] hover:text-white transition-colors text-slate-400">
                <Heart className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">AI Triage System</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Live Rescue GPS</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">IoT Smart Collar</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Shelter Directory</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Vet Health Records</a></li>
            </ul>
          </div>

          {/* User Roles */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Portals</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Public Reporting</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Rescue Squad Access</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Shelter Management</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Veterinary Portal</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Admin Governance</Link></li>
            </ul>
          </div>

          {/* Emergency Contact */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Emergency Hotline</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#34a853] shrink-0 mt-0.5" />
                <span>+1 (800) 737-7638 (24/7 Rescue Dispatch)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#34a853] shrink-0 mt-0.5" />
                <span>support@resqnet.org</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#34a853] shrink-0 mt-0.5" />
                <span>Global Animal Welfare Network</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ResQNet Platform. All rights reserved. Powered by AI Triage & IoT Mesh.</p>
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
