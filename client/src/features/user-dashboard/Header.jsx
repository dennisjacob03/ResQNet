import React from 'react';
import { Menu, Search, Bell, X, ArrowRight } from 'lucide-react';
import UserProfileDropdown from '../../components/common/UserProfileDropdown';

const Header = ({
  sidebarOpen,
  toggleSidebar,
  notifications = [],
  unreadCount = 0,
  notifDropdownOpen,
  setNotifDropdownOpen,
  handleMarkAllRead,
  handleToggleRead,
  setActiveTab,
  getNotificationIconInfo,
  formatNotificationTime,
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
        <img src="/logo.png" alt="ResQNet Logo" className="h-8 sm:h-9 w-auto object-contain" />
      </div>

      {/* Center: Search Bar (Hidden on Mobile to preserve space) */}
      <div className="hidden md:flex flex-1 justify-center px-4 max-w-xl mx-auto">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search pets, shelters, reports..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#237737] focus:bg-white transition text-slate-800 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl cursor-pointer relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
            )}
          </button>

          {/* Notification Popover Dropdown */}
          {notifDropdownOpen && (
            <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-[#237737] hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setNotifDropdownOpen(false)}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.slice(0, 5).map((n) => {
                  const iconInfo = getNotificationIconInfo ? getNotificationIconInfo(n) : { icon: Bell, color: 'text-slate-600 bg-slate-100' };
                  const Icon = iconInfo.icon;
                  const notifId = n._id || n.id;
                  const isUnread = n.status === 'Unread';
                  return (
                    <div
                      key={notifId}
                      onClick={() => handleToggleRead && handleToggleRead(notifId)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer ${
                        isUnread ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${iconInfo.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs font-bold truncate ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                            {n.title || n.message}
                          </p>
                          {isUnread && <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message || n.text}</p>
                        <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                          {formatNotificationTime ? formatNotificationTime(n.createdAt) : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {notifications.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                    No notifications yet
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
                <button
                  onClick={() => {
                    setNotifDropdownOpen(false);
                    setActiveTab('Notifications');
                  }}
                  className="text-xs font-bold text-[#237737] hover:underline cursor-pointer flex items-center justify-center gap-1 w-full"
                >
                  View All Notifications <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown / Widget */}
        <UserProfileDropdown
          onOpenProfile={() => setActiveTab('My Profile')}
          unreadCount={unreadCount}
          onOpenNotifications={() => setActiveTab('Notifications')}
        />
      </div>
    </header>
  );
};

export default Header;
