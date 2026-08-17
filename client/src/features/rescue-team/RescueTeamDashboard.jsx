import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserProfileDropdown from '../../components/common/UserProfileDropdown';
import {
  LayoutDashboard,
  Bell,
  User,
  LogOut,
  Menu,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  AlertTriangle,
  Phone,
  PhoneCall,
  ChevronDown,
  RefreshCw,
  SlidersHorizontal,
  Users,
  Activity,
  Circle,
  X,
  Info,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */
const MOCK_REQUESTS = [
  {
    id: 'RQ-1042',
    animal: 'Injured Dog',
    animalIcon: '🐕',
    location: 'MG Road, Sec 14',
    reporter: 'Alex J.',
    priority: 'High',
    status: 'En Route',
    time: '12 min ago',
    priorityColor: 'bg-orange-100 text-orange-700 border-orange-200',
    statusColor: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    id: 'RQ-1045',
    animal: 'Stray Cat Colony',
    animalIcon: '🐈',
    location: 'Koramangala 5th Block',
    reporter: 'Priya S.',
    priority: 'Medium',
    status: 'Assigned',
    time: '28 min ago',
    priorityColor: 'bg-amber-100 text-amber-700 border-amber-200',
    statusColor: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  {
    id: 'RQ-1047',
    animal: 'Injured Cow',
    animalIcon: '🐄',
    location: 'NICE Road, Bidadi',
    reporter: 'Rajan M.',
    priority: 'Critical',
    status: 'Pending',
    time: '5 min ago',
    priorityColor: 'bg-rose-100 text-rose-700 border-rose-200',
    statusColor: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  {
    id: 'RQ-1038',
    animal: 'Trapped Bird',
    animalIcon: '🐦',
    location: 'Indiranagar 100 Ft Rd',
    reporter: 'Sneha D.',
    priority: 'Low',
    status: 'Completed',
    time: '1h 10m ago',
    priorityColor: 'bg-slate-100 text-slate-500 border-slate-200',
    statusColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  {
    id: 'RQ-1036',
    animal: 'Injured Monkey',
    animalIcon: '🐒',
    location: 'Cubbon Park Gate 3',
    reporter: 'Admin',
    priority: 'High',
    status: 'Completed',
    time: '2h ago',
    priorityColor: 'bg-orange-100 text-orange-700 border-orange-200',
    statusColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
];

const ACTIVITY_TIMELINE = [
  {
    time: '09:14',
    text: 'RQ-1047 reported — Critical injured cow',
    color: 'bg-rose-500',
    highlight: false,
  },
  {
    time: '09:22',
    text: 'RQ-1042 assigned to Team Alpha',
    color: 'bg-blue-500',
    bold: 'Team Alpha',
    highlight: false,
  },
  {
    time: '09:35',
    text: 'Team Alpha en route to MG Road',
    color: 'bg-blue-400',
    highlight: true,
  },
  {
    time: '10:01',
    text: 'RQ-1039 — rescue completed, animal transferred to shelter',
    color: 'bg-emerald-500',
    highlight: false,
  },
  {
    time: '10:18',
    text: 'New volunteer Suresh M. joined Team Beta',
    color: 'bg-slate-400',
    highlight: false,
  },
];

/* Map pin positions (% of container) */
const MAP_PINS = [
  { id: 'RQ-1047', left: '22%', top: '48%', color: 'bg-rose-500', ring: 'ring-rose-300' },
  { id: 'Team A',  left: '38%', top: '33%', color: 'bg-emerald-600', ring: 'ring-emerald-300' },
  { id: 'RQ-1042', left: '60%', top: '45%', color: 'bg-orange-500', ring: 'ring-orange-300' },
  { id: 'RQ-1045', left: '44%', top: '60%', color: 'bg-blue-500', ring: 'ring-blue-300' },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
const RescueTeamDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Rescue Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [notifOpen, setNotifOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(null); // holds request id

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /* Filter table data */
  const filtered = MOCK_REQUESTS.filter((r) => {
    const okPriority = priorityFilter === 'All' || r.priority === priorityFilter;
    const okStatus   = statusFilter   === 'All' || r.status   === statusFilter;
    return okPriority && okStatus;
  });

  const pendingCount   = MOCK_REQUESTS.filter((r) => r.status === 'Pending').length;
  const enRouteCount   = MOCK_REQUESTS.filter((r) => r.status === 'En Route').length;
  const completedCount = MOCK_REQUESTS.filter((r) => r.status === 'Completed').length;

  /* nav items */
  const NAV_ITEMS = [
    { name: 'Rescue Dashboard', icon: LayoutDashboard },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F8FAF9] font-sans overflow-hidden text-slate-800">

      {/* ── Sidebar ── */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0 lg:w-20'
        } transition-all duration-300 bg-white border-r border-slate-100 flex flex-col justify-between h-full z-20 overflow-hidden shrink-0`}
      >
        <div>
          {/* Brand */}
          <div className="h-16 px-5 border-b border-slate-100 flex items-center gap-3">
            {sidebarOpen ? (
              <img src="/logo.png" alt="ResQNet Logo" className="h-9 w-auto object-contain select-none" />
            ) : (
              <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-start select-none">
                <img src="/logo.png" alt="ResQNet Logo" className="h-9 min-w-[130px] max-w-none object-cover object-left" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#237737] text-white shadow-md shadow-[#237737]/10'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    {sidebarOpen && <span>{item.name}</span>}
                  </div>
                  {sidebarOpen && item.badge && !isActive && (
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-rose-600 rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-500 hover:text-rose-500" />
            {sidebarOpen && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-900">Rescue Operations</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl cursor-pointer relative transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">Notifications</span>
                    <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                  {['RQ-1047 reported — Critical injured cow', 'RQ-1042 assigned to Team Alpha', 'New volunteer Suresh M. joined Team Beta'].map((n, i) => (
                    <div key={i} className="px-5 py-3.5 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <p className="text-xs text-slate-700 font-medium">{n}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{['5 min ago', '22 min ago', '1h ago'][i]}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Dropdown / Widget */}
            <UserProfileDropdown
              onOpenProfile={() => setActiveTab('My Profile')}
              unreadCount={3}
              onOpenNotifications={() => setNotifOpen(!notifOpen)}
              customRole="Rescue Team"
            />
          </div>
        </header>

        {/* ── Scrollable Main ── */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

          {/* ══ RESCUE DASHBOARD TAB ══ */}
          {activeTab === 'Rescue Dashboard' && (
            <div className="space-y-6">

              {/* Page Title Row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                    Rescue Operations —{' '}
                    <span className="text-[#237737]">Team Alpha</span>
                  </h1>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Bangalore South Zone · 4 active members on field
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Online / Offline toggle */}
                  <button
                    onClick={() => setIsOnline(!isOnline)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isOnline
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    {isOnline ? 'Online' : 'Offline'}
                  </button>

                  {/* Emergency Call */}
                  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#237737] hover:bg-[#1d632e] text-white transition-all cursor-pointer shadow shadow-[#237737]/20">
                    <PhoneCall className="w-3.5 h-3.5" />
                    Emergency Call
                  </button>
                </div>
              </div>

              {/* ── Stat Cards ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Pending */}
                <div className="p-5 bg-white border border-slate-100/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl flex-shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Pending Requests</div>
                      <div className="text-3xl font-black text-slate-900 mt-0.5">{pendingCount}</div>
                    </div>
                  </div>
                </div>

                {/* En Route */}
                <div className="p-5 bg-white border border-slate-100/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl flex-shrink-0">
                      <Navigation className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">En Route</div>
                      <div className="text-3xl font-black text-slate-900 mt-0.5">{enRouteCount}</div>
                    </div>
                  </div>
                </div>

                {/* Completed Today */}
                <div className="p-5 bg-white border border-slate-100/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Completed Today</div>
                      <div className="text-3xl font-black text-slate-900 mt-0.5">{completedCount}</div>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
                        ↑ 2 more than avg this month
                      </span>
                    </div>
                  </div>
                </div>

                {/* Avg Response Time */}
                <div className="p-5 bg-white border border-slate-100/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-purple-500/10 text-purple-600 rounded-xl flex-shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Avg Response Time</div>
                      <div className="text-3xl font-black text-slate-900 mt-0.5">18 min</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Live Map + Activity Timeline ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Live Rescue Map */}
                <div className="lg:col-span-2 bg-white border border-slate-100/80 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Live Rescue Map</h3>
                    <div className="flex items-center gap-4 text-[11px] font-semibold">
                      <span className="flex items-center gap-1.5 text-rose-600">
                        <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Critical
                      </span>
                      <span className="flex items-center gap-1.5 text-orange-600">
                        <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> High
                      </span>
                      <span className="flex items-center gap-1.5 text-blue-600">
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Active
                      </span>
                    </div>
                  </div>

                  {/* Map Area */}
                  <div className="relative h-[300px] bg-slate-100 overflow-hidden">
                    {/* Background world map texture using CSS */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url("https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1280px-World_map_-_low_resolution.svg.png")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.3,
                        filter: 'sepia(0.3)',
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-50/20 to-slate-100/10" />

                    {/* Pulsing rescue zone overlay */}
                    <div
                      className="absolute rounded-full border-2 border-teal-400/30 bg-teal-400/5 animate-ping"
                      style={{ width: 120, height: 120, left: '34%', top: '26%', animationDuration: '3s' }}
                    />

                    {/* Map Pins */}
                    {MAP_PINS.map((pin) => (
                      <div
                        key={pin.id}
                        className="absolute flex flex-col items-center gap-1"
                        style={{ left: pin.left, top: pin.top, transform: 'translate(-50%, -50%)' }}
                      >
                        <div className={`w-8 h-8 rounded-full ${pin.color} ring-4 ${pin.ring} text-white flex items-center justify-center shadow-lg z-10 cursor-pointer hover:scale-110 transition-transform`}>
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${pin.color} text-white shadow whitespace-nowrap`}>
                          {pin.id}
                        </span>
                      </div>
                    ))}

                    {/* Map Footer */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm px-4 py-2.5 border-t border-slate-100">
                      <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                        Live tracking active · Last updated just now
                      </p>
                    </div>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="bg-white border border-slate-100/80 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Activity Timeline</h3>
                    <button className="p-1 hover:bg-slate-100 rounded-lg transition cursor-pointer">
                      <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                  <div className="p-5 space-y-4">
                    {ACTIVITY_TIMELINE.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          <span className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0 mt-0.5`} />
                          {i < ACTIVITY_TIMELINE.length - 1 && (
                            <div className="w-px h-5 bg-slate-100" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-slate-400 font-bold">{item.time}</p>
                          <p className={`text-xs mt-0.5 leading-relaxed ${item.highlight ? 'text-blue-600 font-semibold' : 'text-slate-700 font-medium'}`}>
                            {item.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 pb-4">
                    <button className="w-full text-center text-xs font-semibold text-[#237737] hover:underline cursor-pointer flex items-center justify-center gap-1">
                      View Full Activity Log <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Assigned Requests Table ── */}
              <div className="bg-white border border-slate-100/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-900">Assigned Requests</h3>
                  <div className="flex items-center gap-2.5">
                    {/* Priority Filter */}
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#237737]/20 cursor-pointer"
                    >
                      {['All', 'Critical', 'High', 'Medium', 'Low'].map(p => (
                        <option key={p} value={p}>{p === 'All' ? 'All Priorities' : p}</option>
                      ))}
                    </select>
                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#237737]/20 cursor-pointer"
                    >
                      {['All', 'Pending', 'Assigned', 'En Route', 'Completed'].map(s => (
                        <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
                      ))}
                    </select>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" /> Filter
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60">
                        {['Request ID', 'Animal', 'Location', 'Reporter', 'Priority', 'Status', 'Time', ''].map((h) => (
                          <th key={h} className="px-5 py-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filtered.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/60 transition-colors group">
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-bold text-[#237737]">{req.id}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                              <span>{req.animalIcon}</span> {req.animal}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs text-slate-600 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              {req.location}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs text-slate-700 font-medium">{req.reporter}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${req.priorityColor}`}>
                              {req.priority}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${req.statusColor}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{req.time}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            {req.status !== 'Completed' && (
                              <button
                                onClick={() => setShowUpdateModal(req.id)}
                                className="text-xs font-semibold text-[#237737] hover:underline cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                              >
                                Update <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-5 py-10 text-center text-slate-400 text-sm font-medium">
                            No requests match the selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Team Members ── */}
              <div className="bg-white border border-slate-100/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#237737]" /> Team Members on Field
                  </h3>
                </div>
                <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { name: 'Rohit K.', role: 'Team Lead', status: 'En Route', color: 'bg-teal-600' },
                    { name: 'Meena P.', role: 'Medic', status: 'On Standby', color: 'bg-purple-600' },
                    { name: 'Arjun S.', role: 'Driver', status: 'En Route', color: 'bg-blue-600' },
                    { name: 'Preethi R.', role: 'Rescue Spec.', status: 'Available', color: 'bg-emerald-600' },
                  ].map((m) => (
                    <div key={m.name} className="flex flex-col items-center text-center p-4 rounded-2xl border border-slate-100 hover:border-[#237737]/20 hover:bg-emerald-50/30 transition-all">
                      <div className={`w-11 h-11 rounded-full ${m.color} text-white font-extrabold text-base flex items-center justify-center shadow-sm mb-2`}>
                        {m.name[0]}
                      </div>
                      <p className="text-xs font-bold text-slate-900">{m.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{m.role}</p>
                      <span className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.status === 'En Route'
                          ? 'bg-blue-100 text-blue-700'
                          : m.status === 'Available'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ══ NOTIFICATIONS TAB ══ */}
          {activeTab === 'Notifications' && (
            <div className="space-y-5 max-w-3xl">
              <h1 className="text-2xl font-extrabold text-slate-900">Notifications</h1>
              {ACTIVITY_TIMELINE.map((item, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                  <div className={`w-3 h-3 rounded-full ${item.color} mt-1 flex-shrink-0`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══ MY PROFILE TAB ══ */}
          {activeTab === 'My Profile' && (
            <div className="max-w-2xl space-y-6">
              <h1 className="text-2xl font-extrabold text-slate-900">My Profile</h1>
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-extrabold text-2xl flex items-center justify-center shadow">
                    {(user?.fullName || 'R')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-slate-900">{user?.fullName || 'Rescue User'}</p>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold bg-teal-100 text-teal-700 px-2.5 py-0.5 rounded-full">
                      Rescue Team
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  {[
                    { label: 'Phone', value: user?.phoneNumber || 'Not set' },
                    { label: 'Role', value: user?.role || 'Rescue Team' },
                    { label: 'Zone', value: 'Bangalore South Zone' },
                    { label: 'Status', value: isOnline ? 'Online' : 'Offline' },
                  ].map((f) => (
                    <div key={f.label}>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{f.label}</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Status Update Modal ── */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Update Status — {showUpdateModal}</h3>
              <button onClick={() => setShowUpdateModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {['Assigned', 'En Route', 'On Scene', 'Completed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setShowUpdateModal(null)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-[#237737] hover:text-white hover:border-[#237737] transition-all cursor-pointer group"
                >
                  <span>{s}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescueTeamDashboard;
