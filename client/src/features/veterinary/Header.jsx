import React from 'react';
import { Menu, Search, Bell, X } from 'lucide-react';
import UserProfileDropdown from '../../components/common/UserProfileDropdown';

const Header = ({
  sidebarOpen,
  toggleSidebar,
  notifOpen,
  setNotifOpen,
  setActiveTab,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-3.5 sm:px-6 md:px-8 flex-shrink-0 z-30 w-full">
      {/* Brand Logo & Sidebar Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 select-none shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-1 sm:-ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <img src="/logo.png" alt="ResQNet Logo" className="h-7 sm:h-9 w-auto object-contain" />
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex flex-1 justify-center px-4 max-w-xl mx-auto">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients, medical records, diagnoses..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#237737] focus:bg-white transition text-slate-800 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl cursor-pointer relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] max-w-sm sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <span className="text-sm font-extrabold text-slate-900">Notifications</span>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                <div className="p-6 text-center text-xs text-slate-400 font-semibold">
                  No new clinical notifications
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown / Widget */}
        <UserProfileDropdown
          onOpenProfile={() => setActiveTab('My Profile')}
          unreadCount={0}
          onOpenNotifications={() => setNotifOpen(!notifOpen)}
          customRole="Veterinary Staff"
        />
      </div>
    </header>
  );
};

export default Header;
