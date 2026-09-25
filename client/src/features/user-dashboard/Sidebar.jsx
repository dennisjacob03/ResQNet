import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Heart,
  Building2,
  Truck,
  HeartHandshake,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  LogOut,
  MapPin,
  X,
} from 'lucide-react';
import { checkProfileCompletion } from '../../utils/profileUtils';

const Sidebar = ({
  activeTab,
  setActiveTab,
  sidebarOpen,
  toggleSidebar,
  handleOpenShelterTab,
  setSubmitSuccess,
  handleLogout,
  user,
}) => {
  const profileStatus = checkProfileCompletion(user);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Report Animal', icon: AlertTriangle },
    { name: 'Rescue & Shelter Map', icon: MapPin },
    { name: 'Adopt a Pet', icon: Heart },
    { name: 'Register Shelter', icon: Building2 },
    { name: 'Register Rescue Team', icon: Truck },
    { name: 'Volunteer', icon: HeartHandshake },
    { name: 'Join Vet Staff', icon: Stethoscope },
  ];

  const handleNavClick = (itemName) => {
    if (itemName === 'Register Shelter') {
      if (handleOpenShelterTab) handleOpenShelterTab();
      else setActiveTab('Register Shelter');
    } else {
      setActiveTab(itemName);
      if (setSubmitSuccess) setSubmitSuccess(false);
    }
    // Auto-close drawer on mobile viewports for seamless UX
    if (window.innerWidth < 768 && sidebarOpen) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-30 md:hidden transition-opacity animate-in fade-in"
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          bg-white border-r border-slate-100 flex flex-col justify-between h-full overflow-y-auto shrink-0 transition-all duration-300 ease-in-out
          ${
            sidebarOpen
              ? 'translate-x-0 w-72 max-w-[85vw] md:w-64 md:translate-x-0 shadow-2xl md:shadow-none'
              : '-translate-x-full md:translate-x-0 md:w-20'
          }
        `}
      >
        <div>
          {/* Mobile Drawer Header with Close Button */}
          <div className="md:hidden px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="ResQNet Logo" className="h-7 w-auto object-contain" />
              <span className="text-[11px] font-black text-[#237737] uppercase tracking-wider">
                User Portal
              </span>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className={`${sidebarOpen ? 'p-3 sm:p-4' : 'p-3'} space-y-1.5`}>
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.name)}
                  title={!sidebarOpen ? item.name : undefined}
                  className={`w-full flex items-center ${
                    sidebarOpen ? 'justify-between px-3.5 sm:px-4' : 'justify-center px-0'
                  } py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer relative group ${
                    isActive
                      ? 'bg-[#237737] text-white shadow-md shadow-[#237737]/10'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  <div
                    className={`flex items-center ${
                      sidebarOpen ? 'gap-3 min-w-0' : 'justify-center'
                    }`}
                  >
                    <IconComponent
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-500'
                      }`}
                    />
                    {sidebarOpen && <span className="truncate whitespace-nowrap">{item.name}</span>}
                  </div>
                  {sidebarOpen && item.badge > 0 && !isActive && (
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                      {item.badge}
                    </span>
                  )}
                  {!sidebarOpen && item.badge > 0 && !isActive && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className={`${sidebarOpen ? 'p-3 sm:p-4' : 'p-3'} border-t border-slate-100 space-y-1`}>
          {/* Profile Incomplete Quick Action Pill */}
          {sidebarOpen && !profileStatus.isComplete && (
            <div
              onClick={() => {
                setActiveTab('My Profile');
                if (window.innerWidth < 768 && sidebarOpen) toggleSidebar();
              }}
              className="p-3 bg-amber-50 hover:bg-amber-100/70 border border-amber-200/80 rounded-2xl mb-2 cursor-pointer transition text-left group"
              title="Click to complete your profile"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  Profile Incomplete
                </span>
                <span className="text-[10px] font-black text-[#237737] bg-white border border-amber-200 px-1.5 py-0.5 rounded shadow-2xs">
                  {profileStatus.percentage}%
                </span>
              </div>
              <p className="text-[10px] text-amber-800/80 mt-1 font-semibold group-hover:text-amber-900 leading-tight">
                Update details to unlock all actions →
              </p>
            </div>
          )}
          {!sidebarOpen && !profileStatus.isComplete && (
            <button
              onClick={() => setActiveTab('My Profile')}
              className="w-full flex items-center justify-center p-2 mb-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl transition cursor-pointer relative"
              title={`Profile ${profileStatus.percentage}% Complete - Click to update`}
            >
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            </button>
          )}

          {/* Desktop Collapse / Expand Toggle */}
          <button
            onClick={toggleSidebar}
            className={`hidden md:flex w-full items-center ${
              sidebarOpen ? 'gap-3 px-4' : 'justify-center px-0'
            } py-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition cursor-pointer`}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? (
              <>
                <ChevronLeft className="w-4 h-4 flex-shrink-0 text-slate-400" />
                <span className="whitespace-nowrap">Collapse Sidebar</span>
              </>
            ) : (
              <ChevronRight className="w-5 h-5 flex-shrink-0 text-slate-400" />
            )}
          </button>

          <button
            onClick={() => {
              if (window.innerWidth < 768 && sidebarOpen) toggleSidebar();
              handleLogout();
            }}
            className={`w-full flex items-center ${
              sidebarOpen ? 'gap-3 px-4' : 'justify-center px-0'
            } py-3 text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl text-sm font-semibold transition cursor-pointer`}
            title={!sidebarOpen ? 'Log Out' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 text-slate-500 hover:text-rose-500" />
            {sidebarOpen && <span className="whitespace-nowrap">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
