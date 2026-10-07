import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, ChevronDown, Bell } from 'lucide-react';
import { checkProfileCompletion } from '../../utils/profileUtils';
import { getMediaUrl } from '../../config/api';

const UserProfileDropdown = ({
  onOpenProfile,
  unreadCount = 0,
  onOpenNotifications,
  customRole = null,
}) => {
  const { user, logout } = useAuth();
  const profileStatus = checkProfileCompletion(user);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Close dropdown on outside click/tap
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  const handleProfileClick = (e) => {
    e?.stopPropagation();
    setIsOpen(false);
    if (onOpenProfile) {
      onOpenProfile();
    }
  };

  const handleNotificationsClick = (e) => {
    e?.stopPropagation();
    setIsOpen(false);
    if (onOpenNotifications) {
      onOpenNotifications();
    }
  };

  const handleToggleClick = (e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  // Smooth hover handlers with small delay to prevent accidental closing
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const roleText = customRole || user?.role || 'Public User';

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Rescue Team':
        return 'bg-teal-50 text-teal-700 border-teal-200/60';
      case 'Shelter':
      case 'Shelter Manager':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'Veterinary Staff':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200/60';
      case 'Admin':
        return 'bg-purple-50 text-purple-700 border-purple-200/60';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
    }
  };

  const displayName = user?.fullName || user?.name || 'User';
  const avatarLetter = (displayName || 'U')[0].toUpperCase();

  const profileImageUrl = user?.profilePic ? getMediaUrl(user.profilePic) : null;

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Profile Chip (Matching Requested Visual Design) ── */}
      <button
        type="button"
        onClick={handleToggleClick}
        className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-3 border-l border-slate-200 cursor-pointer text-left focus:outline-none group select-none py-1 hover:opacity-90 transition-opacity"
        title="Account Options"
        aria-expanded={isOpen}
      >
        {/* Avatar */}
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt={displayName}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
          />
        ) : (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0284c7] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center shadow-sm select-none shrink-0 ring-2 ring-[#0284c7]/20">
            {avatarLetter}
          </div>
        )}

        {/* Name & Role Text Stack */}
        <div className="hidden sm:flex flex-col leading-tight min-w-0">
          <span className="text-xs sm:text-[13px] font-extrabold text-slate-900 tracking-tight truncate max-w-[150px]">
            {displayName}
          </span>
          <span className="text-[10px] sm:text-[11px] text-teal-600 font-semibold truncate leading-tight mt-0.5">
            {roleText}
          </span>
        </div>

        {/* Chevron Icon */}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 hidden sm:block shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* ── Hover / Click Dropdown Menu ── */}
      {isOpen && (
        <div className="absolute right-0 top-full pt-2 w-64 max-w-[calc(100vw-2rem)] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden backdrop-blur-xl">
            {/* Header: User Summary */}
            <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#0284c7] text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                  {avatarLetter}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-slate-900 truncate">{displayName}</p>
                <p className="text-[11px] text-slate-400 font-medium truncate">{user?.email || 'No email set'}</p>
                <span className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-md border ${getRoleBadgeStyle(roleText)}`}>
                  {roleText}
                </span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-1.5 space-y-0.5">
              <button
                type="button"
                onClick={handleProfileClick}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:bg-[#237737]/10 hover:text-[#237737] rounded-xl transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-slate-500 group-hover:text-[#237737]" />
                  <span>My Profile</span>
                </div>
                {!profileStatus.isComplete && (
                  <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded-md">
                    {profileStatus.percentage}%
                  </span>
                )}
              </button>

              {onOpenNotifications && (
                <button
                  type="button"
                  onClick={handleNotificationsClick}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-slate-500" />
                    <span>Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-orange-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}

              <div className="h-px bg-slate-100 my-1" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
