import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  AlertTriangle,
  Heart,
  Bell,
  User,
  LogOut,
  Menu,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Plus,
  Shield,
  FileText,
  UserCheck,
  TrendingUp,
  Cpu,
  Tv,
  Users,
  Search,
  SlidersHorizontal,
  X,
  Building2,
  Calendar,
  Settings
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Admin Dashboard');
  const [subTab, setSubTab] = useState('Overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // User Management State (Mock Data for interactive list)
  const [usersList, setUsersList] = useState([
    { id: 'U-001', name: 'Alex Johnson', email: 'alex@resqnet.in', role: 'Public User', status: 'Active', joined: 'Jan 2026' },
    { id: 'U-002', name: 'Sarah Connor', email: 'sarah@resqnet.in', role: 'Rescue Team', status: 'Active', joined: 'Feb 2026' },
    { id: 'U-003', name: 'Dr. James Herriot', email: 'james@resqnet.in', role: 'Veterinary Staff', status: 'Active', joined: 'Dec 2025' },
    { id: 'U-004', name: 'Emily Davis', email: 'emily@pawsandcare.org', role: 'Shelter Manager', status: 'Suspended', joined: 'Mar 2026' },
    { id: 'U-005', name: 'Robert Chen', email: 'robert@resqnet.in', role: 'Rescue Team', status: 'Active', joined: 'Apr 2026' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Public User');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getFirstName = () => {
    if (!user?.fullName) return 'Admin';
    return user.fullName.split(' ')[0];
  };

  // Add user handler
  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser = {
      id: 'U-0' + (usersList.length + 1).toString().padStart(2, '0'),
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: 'Active',
      joined: 'August 2026'
    };

    setUsersList([newUser, ...usersList]);
    setNewUserName('');
    setNewUserEmail('');
    setShowAddUserModal(false);
  };

  // Delete/Suspend user handler
  const handleToggleStatus = (id) => {
    setUsersList(
      usersList.map(u => 
        u.id === id 
          ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } 
          : u
      )
    );
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAF9] font-sans overflow-hidden text-slate-800">
      
      {/* Sidebar Panel */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-0 lg:w-20'
        } transition-all duration-300 bg-white border-r border-slate-100 flex flex-col justify-between h-full z-20 overflow-hidden shrink-0`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-slate-100 flex items-center gap-3">
            {sidebarOpen ? (
              <img src="/logo.png" alt="ResQNet Logo" className="h-9 w-auto object-contain select-none" />
            ) : (
              <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-start select-none">
                <img src="/logo.png" alt="ResQNet Logo" className="h-9 min-w-[130px] max-w-none object-cover object-left" />
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {[
              { name: 'Admin Dashboard', icon: TrendingUp },
              { name: 'User Management', icon: Users },
              { name: 'AI Module', icon: Cpu },
              { name: 'Smart Collar', icon: Tv },
              { name: 'Notifications', icon: Bell, badge: 2 },
              { name: 'My Profile', icon: User }
            ].map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.name);
                    // Automatically switch sub-tabs based on sidebar click
                    if (item.name === 'User Management') {
                      setSubTab('User Management');
                    } else if (item.name === 'Admin Dashboard') {
                      setSubTab('Overview');
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#237737] text-white shadow-md shadow-[#237737]/10'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
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

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-rose-600 rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 text-slate-500 hover:text-rose-500" />
            {sidebarOpen && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-900">Admin Dashboard</h2>
          </div>

          <div className="flex items-center gap-4.5">
            {/* Notification Bell */}
            <button className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl cursor-pointer relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center">
                A
              </div>
              <span className="hidden sm:inline text-sm font-bold text-slate-900">
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Dashboard Panels */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Dashboard Title & Top Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                Admin Dashboard
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                Platform-wide analytics • August 2026
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm">
                <FileText className="w-4 h-4 text-slate-400" /> Export Report
              </button>
              <button 
                onClick={() => setShowAddUserModal(true)}
                className="px-4.5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow shadow-[#237737]/10"
              >
                <Plus className="w-4 h-4" /> Add User
              </button>
            </div>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Metric 1 */}
            <div className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Users</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">18,420</div>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center mt-1">↑ 1,240 this month</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Rescue Requests</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">4,280</div>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center mt-1">↑ 420 this month</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Animals Rescued</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">12,480</div>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center mt-1">↑ 380 this month</span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl flex-shrink-0">
                <Heart className="w-5 h-5 fill-rose-500/10" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Adoptions</div>
                <div className="text-2xl font-black text-slate-900 mt-0.5">8,920</div>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center mt-1">↑ 130 this month</span>
              </div>
            </div>

          </div>

          {/* Sub Navigation Tabs */}
          <div className="border-b border-slate-200">
            <div className="flex gap-6 text-sm font-bold text-slate-500">
              {['Overview', 'User Management', 'Shelters'].map((tab) => {
                const isActive = subTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setSubTab(tab);
                      // Mirror tabs to match sidebar focus
                      if (tab === 'User Management') {
                        setActiveTab('User Management');
                      } else {
                        setActiveTab('Admin Dashboard');
                      }
                    }}
                    className={`pb-3 border-b-2 cursor-pointer transition ${
                      isActive
                        ? 'border-[#237737] text-[#237737]'
                        : 'border-transparent hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-Tab 1: Overview Chart Analytics */}
          {subTab === 'Overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Line Chart Card (Rescue & Adoption Trends) */}
              <div className="lg:col-span-8 bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="pb-4 mb-4 border-b border-slate-100">
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900">Rescue & Adoption Trends</h3>
                  </div>

                  {/* Inline SVG Chart */}
                  <div className="relative pt-6">
                    <svg className="w-full h-64" viewBox="0 0 600 240">
                      {/* Grid lines */}
                      <line x1="40" y1="20" x2="580" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="70" x2="580" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="120" x2="580" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="170" x2="580" y2="170" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="220" x2="580" y2="220" stroke="#cbd5e1" strokeWidth="1.5" />

                      {/* Y-axis Labels */}
                      <text x="15" y="24" className="text-[10px] fill-slate-400 font-extrabold">380</text>
                      <text x="15" y="74" className="text-[10px] fill-slate-400 font-extrabold">285</text>
                      <text x="15" y="124" className="text-[10px] fill-slate-400 font-extrabold">190</text>
                      <text x="20" y="174" className="text-[10px] fill-slate-400 font-extrabold">95</text>
                      <text x="25" y="224" className="text-[10px] fill-slate-400 font-extrabold">0</text>

                      {/* Line chart fill area (Rescues - Green) */}
                      <path
                        d="M 40 170 Q 140 160, 240 130 T 440 90 T 580 50 L 580 220 L 40 220 Z"
                        fill="url(#green-gradient)"
                        opacity="0.08"
                      />

                      {/* Line chart fill area (Adoptions - Blue) */}
                      <path
                        d="M 40 190 Q 140 175, 240 150 T 440 110 T 580 80 L 580 220 L 40 220 Z"
                        fill="url(#blue-gradient)"
                        opacity="0.08"
                      />

                      {/* Gradients */}
                      <defs>
                        <linearGradient id="green-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Chart Lines (Rescues - Green) */}
                      <path
                        d="M 40 170 Q 140 160, 240 130 T 440 90 T 580 50"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Chart Lines (Adoptions - Blue) */}
                      <path
                        d="M 40 190 Q 140 175, 240 150 T 440 110 T 580 80"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeDasharray="1 0"
                      />

                      {/* Data Dots */}
                      <circle cx="580" cy="50" r="4.5" fill="#22c55e" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="580" cy="80" r="4.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                    </svg>

                    {/* X-axis Labels */}
                    <div className="flex justify-between pl-10 pr-2 text-[10px] font-extrabold text-slate-400 mt-2">
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Apr</span>
                      <span>May</span>
                      <span>Jun</span>
                      <span>Jul</span>
                    </div>
                  </div>
                </div>

                {/* Legends */}
                <div className="flex justify-center gap-5 pt-4 text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" /> Rescues
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-500" /> Adoptions
                  </div>
                </div>

              </div>

              {/* Donut Chart Card (Animals by Species) */}
              <div className="lg:col-span-4 bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="pb-4 mb-4 border-b border-slate-100">
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900">Animals by Species</h3>
                  </div>

                  {/* Inline Donut Chart */}
                  <div className="flex items-center justify-center py-6">
                    <svg className="w-40 h-40" viewBox="0 0 36 36">
                      {/* Background circle */}
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4.2" />

                      {/* Segment 1: Dogs 48% (green) - offset 0 */}
                      <circle 
                        cx="18" cy="18" r="15.915" 
                        fill="none" 
                        stroke="#22c55e" 
                        strokeWidth="4.2" 
                        strokeDasharray="48 52" 
                        strokeDashoffset="100" 
                      />

                      {/* Segment 2: Cats 32% (blue) - offset 48 */}
                      <circle 
                        cx="18" cy="18" r="15.915" 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="4.2" 
                        strokeDasharray="32 68" 
                        strokeDashoffset="52" 
                      />

                      {/* Segment 3: Birds 12% (orange) - offset 80 */}
                      <circle 
                        cx="18" cy="18" r="15.915" 
                        fill="none" 
                        stroke="#f97316" 
                        strokeWidth="4.2" 
                        strokeDasharray="12 88" 
                        strokeDashoffset="20" 
                      />

                      {/* Segment 4: Others 8% (purple) - offset 92 */}
                      <circle 
                        cx="18" cy="18" r="15.915" 
                        fill="none" 
                        stroke="#a855f7" 
                        strokeWidth="4.2" 
                        strokeDasharray="8 92" 
                        strokeDashoffset="8" 
                      />
                    </svg>
                  </div>
                </div>

                {/* Legend list matching layout */}
                <div className="space-y-2 pt-4 border-t border-slate-100 text-xs font-bold text-slate-500">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Dogs</span>
                    <span className="text-slate-900">48%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Cats</span>
                    <span className="text-slate-900">32%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Birds</span>
                    <span className="text-slate-900">12%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Others</span>
                    <span className="text-slate-900">8%</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Sub-Tab 2: User Management Panel (Interactive table) */}
          {subTab === 'User Management' && (
            <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm space-y-6">
              
              {/* Search filter bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                
                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search users by name or email"
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#237737] text-sm font-semibold transition"
                    />
                    <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
                  >
                    <option value="All">All Roles</option>
                    <option value="Public User">Public User</option>
                    <option value="Rescue Team">Rescue Team</option>
                    <option value="Veterinary Staff">Veterinary Staff</option>
                    <option value="Shelter Manager">Shelter Manager</option>
                  </select>
                </div>

                <div className="text-xs text-slate-400 font-extrabold">
                  {usersList.length} users registered
                </div>

              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400 tracking-wider">
                      <th className="pb-3.5 pl-4">User Details</th>
                      <th className="pb-3.5">Role</th>
                      <th className="pb-3.5">Status</th>
                      <th className="pb-3.5">Joined</th>
                      <th className="pb-3.5 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                    {usersList
                      .filter(u => {
                        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesRole = roleFilter === 'All' || u.role === roleFilter;
                        return matchesSearch && matchesRole;
                      })
                      .map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-4 pl-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#237737]/10 text-[#237737] font-black text-sm flex items-center justify-center">
                              {user.name[0].toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-slate-900">{user.name}</h4>
                              <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                              user.status === 'Active'
                                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                                : 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-4 text-slate-400 text-xs font-bold">{user.joined}</td>
                          <td className="py-4 pr-4 text-right">
                            <button 
                              onClick={() => handleToggleStatus(user.id)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                                user.status === 'Active'
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200/50'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200/50'
                              }`}
                            >
                              {user.status === 'Active' ? 'Suspend' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* Sub-Tab 3: Shelters */}
          {subTab === 'Shelters' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {nearbyShelters.map((shelter, idx) => (
                <div key={idx} className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-emerald-500/10 text-[#237737] rounded-2xl">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-400">{shelter.distance}</span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">{shelter.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">{shelter.spaces}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-extrabold text-slate-500">
                      <span>Occupancy</span>
                      <span>{shelter.percentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full w-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${shelter.barColor}`} 
                        style={{ width: `${shelter.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full border border-slate-100 shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">Add New User</h2>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="p-1 text-slate-450 hover:text-slate-650 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Full Name</label>
                <input 
                  type="text" 
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Robert Smith"
                  required
                  className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Email Address</label>
                <input 
                  type="email" 
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. robert@resqnet.in"
                  required
                  className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Role</label>
                <select 
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition cursor-pointer"
                >
                  <option value="Public User">Public User</option>
                  <option value="Rescue Team">Rescue Team</option>
                  <option value="Veterinary Staff">Veterinary Staff</option>
                  <option value="Shelter Manager">Shelter Manager</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-[#237737] hover:bg-[#1d632e] text-white text-sm font-bold rounded-2xl transition cursor-pointer shadow-md shadow-[#237737]/10"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
