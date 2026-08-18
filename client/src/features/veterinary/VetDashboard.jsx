import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserProfileDropdown from '../../components/common/UserProfileDropdown';
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
  Search,
  SlidersHorizontal,
  X,
  Building2,
  Stethoscope,
  BookOpen,
  Calendar,
  AlertCircle
} from 'lucide-react';

const VetDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Vet Dashboard');
  const [subTab, setSubTab] = useState('Medical Records');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  // Form state for adding new record
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [newPatient, setNewPatient] = useState('');
  const [newSpecies, setNewSpecies] = useState('Dog');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newVet, setNewVet] = useState('Dr. Priya K.');
  const [newNextVisit, setNewNextVisit] = useState('');
  const [newStatus, setNewStatus] = useState('Ongoing');

  // Mock Medical Cases Data
  const [medicalCases, setMedicalCases] = useState([
    {
      id: 'MC-301',
      patient: 'Bruno',
      species: 'Dog',
      diagnosis: 'Lacerated paw — surgical closure',
      vet: 'Dr. Priya K.',
      nextVisit: 'Aug 5',
      status: 'Ongoing',
      statusColor: 'bg-amber-500/10 text-amber-700 border-amber-200/50',
    },
    {
      id: 'MC-302',
      patient: 'Max',
      species: 'Dog',
      diagnosis: 'Fracture — right femur, splint applied',
      vet: 'Dr. Rahul S.',
      nextVisit: 'Aug 7',
      status: 'Critical',
      statusColor: 'bg-rose-500/10 text-rose-700 border-rose-200/50',
    },
    {
      id: 'MC-303',
      patient: 'Whiskers',
      species: 'Cat',
      diagnosis: 'Respiratory infection — antibiotics',
      vet: 'Dr. Priya K.',
      nextVisit: 'Aug 4',
      status: 'Improving',
      statusColor: 'bg-blue-500/10 text-blue-700 border-blue-200/50',
    },
    {
      id: 'MC-304',
      patient: 'Goldie',
      species: 'Dog',
      diagnosis: 'Routine vaccination — Rabies & Distemper',
      vet: 'Dr. Arun M.',
      nextVisit: '—',
      status: 'Completed',
      statusColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50',
    }
  ]);

  // Mock Upcoming Vaccinations Data
  const vaccinations = [
    { name: 'Shadow', type: 'Rabies Booster', due: 'Due: Aug 4', badge: 'Due Soon', badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-200/30' },
    { name: 'Brownie', type: 'Distemper', due: 'Due: Aug 6', badge: null },
    { name: 'Kitkat', type: 'FVRCP', due: 'Due: Aug 9', badge: null }
  ];

  // Mock Medicine Stock Alert
  const lowStockMedicines = [
    { name: 'Amoxicillin 250mg', stock: '12 tablets left', severity: 'Critical' },
    { name: 'Rabies Vaccine Vials', stock: '5 doses left', severity: 'Warning' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Add new medical record
  const handleAddRecord = (e) => {
    e.preventDefault();
    if (!newPatient.trim() || !newDiagnosis.trim()) return;
    const newCase = {
      id: `MED-${Math.floor(800 + Math.random() * 100)}`,
      patient: newPatient,
      species: newSpecies,
      breed: 'Mixed Breed',
      diagnosis: newDiagnosis,
      vet: newVet,
      status: newStatus,
      nextVisit: newNextVisit || 'Not scheduled',
      badgeColor:
        newStatus === 'Critical'
          ? 'bg-rose-100 text-rose-700 border-rose-200'
          : newStatus === 'Ongoing'
          ? 'bg-amber-100 text-amber-700 border-amber-200'
          : 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    setMedicalCases([newCase, ...medicalCases]);
    setNewPatient('');
    setNewDiagnosis('');
    setNewNextVisit('');
    setShowAddRecordModal(false);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAF9] font-sans overflow-hidden text-slate-800">
      
      {/* Full-width Top Navbar */}
      <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-8 flex-shrink-0 z-30 w-full">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 select-none shrink-0">
          <img src="/logo.png" alt="ResQNet Logo" className="h-9 w-auto object-contain" />
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 flex justify-center px-4 max-w-xl mx-auto">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients, medical records, diagnoses..."
              className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#237737] focus:bg-white transition text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-4.5 shrink-0">
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
              <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                  <span className="text-sm font-extrabold text-slate-900">Notifications</span>
                  <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"><X className="w-4 h-4" /></button>
                </div>
                <div className="divide-y divide-slate-50">
                  {[
                    { text: 'Emergency case: Trapped Bird needs wing splint', time: '10 min ago' },
                    { text: 'Vaccination batch updated for Canine Ward B', time: '1h ago' },
                    { text: 'New rescue transferred from Team Alpha for checkup', time: '3h ago' },
                  ].map((n, i) => (
                    <div key={i} className="p-3.5 hover:bg-slate-50 transition-colors">
                      <p className="text-xs text-slate-700 font-semibold">{n.text}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown / Widget */}
          <UserProfileDropdown
            onOpenProfile={() => setActiveTab('My Profile')}
            unreadCount={1}
            onOpenNotifications={() => setNotifOpen(!notifOpen)}
            customRole="Veterinary Staff"
          />
        </div>
      </header>

      {/* Main Container Below Navbar */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Panel (below navbar) */}
        <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between h-full z-20 overflow-y-auto shrink-0">
          <nav className="p-4 space-y-1.5">
            {[
              { name: 'Vet Dashboard', icon: Stethoscope },
            ].map((item) => {
              const IconComponent = item.icon;
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
                    <IconComponent className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.name}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-rose-600 rounded-xl text-sm font-semibold transition cursor-pointer"
            >
              <LogOut className="w-4.5 h-4.5 text-slate-500 hover:text-rose-500" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Dashboard Panels */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Active Tab 1: Vet Dashboard */}
          {activeTab === 'Vet Dashboard' && (
            <div className="space-y-6">
              
              {/* Header Title Section */}
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                  Veterinary Dashboard
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                  Dr. Priya Krishnan • Paws & Care Shelter Clinic
                </p>
              </div>

              {/* Metric Cards Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Active Cases */}
                <div className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl flex-shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Cases</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">14</div>
                  </div>
                </div>

                {/* Treated Today */}
                <div className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Treated Today</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">6</div>
                  </div>
                </div>

                {/* Vaccination Due */}
                <div className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-orange-500/10 text-orange-600 rounded-xl flex-shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Vaccination Due</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">3</div>
                  </div>
                </div>

                {/* Critical Cases */}
                <div className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl flex-shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Critical Cases</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">
                      {medicalCases.filter(c => c.status === 'Critical').length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub Navigation Tabs */}
              <div className="border-b border-slate-200">
                <div className="flex gap-6 text-sm font-bold text-slate-500">
                  {['Medical Records', 'Vaccinations', 'Medicines'].map((tab) => {
                    const isActive = subTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setSubTab(tab)}
                        className={`pb-3 border-b-2 cursor-pointer transition ${
                          isActive
                            ? 'border-b-[#237737] border-b-2 text-[#237737]'
                            : 'border-transparent hover:text-slate-800'
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Panel Grid split (Left: records list, Right: sidebar stats/vaccinations) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Card: Medical Records List */}
                <div className="lg:col-span-8 bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4.5 mb-4.5 border-b border-slate-100">
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900">Medical Cases</h3>
                      <button 
                        onClick={() => setShowAddRecordModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#237737] hover:bg-[#1d632e] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm shadow-[#237737]/10"
                      >
                        <Plus className="w-3.5 h-3.5" /> New Record
                      </button>
                    </div>

                    {/* Records Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            <th className="pb-3.5 pl-2">Case ID</th>
                            <th className="pb-3.5">Patient</th>
                            <th className="pb-3.5">Diagnosis</th>
                            <th className="pb-3.5">Vet</th>
                            <th className="pb-3.5">Next Visit</th>
                            <th className="pb-3.5 pr-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                          {medicalCases.map((record) => (
                            <tr key={record.id} className="hover:bg-slate-50/50 transition">
                              <td className="py-4 pl-2 text-slate-400 text-xs font-bold">{record.id}</td>
                              <td className="py-4 text-slate-900 font-extrabold">
                                {record.patient} <span className="text-[10px] text-slate-450 font-normal ml-0.5">({record.species})</span>
                              </td>
                              <td className="py-4 text-xs font-semibold text-slate-500 max-w-[200px] truncate" title={record.diagnosis}>
                                {record.diagnosis}
                              </td>
                              <td className="py-4 text-xs text-slate-500">{record.vet}</td>
                              <td className="py-4 text-xs text-slate-400">{record.nextVisit}</td>
                              <td className="py-4 pr-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${record.statusColor}`}>
                                  {record.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </div>
                </div>

                {/* Right Card: Upcoming Vaccinations & Low Stock alerts */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Upcoming Vaccinations */}
                  <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm space-y-4">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">Upcoming Vaccinations</h3>
                    </div>

                    <div className="space-y-3.5">
                      {vaccinations.map((vac, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 border border-slate-100 hover:border-slate-200/80 rounded-2xl flex flex-col justify-between gap-1.5 transition">
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-sm text-slate-900">{vac.name}</h4>
                            {vac.badge && (
                              <span className={`px-2 py-0.5 text-[9px] border font-black rounded-lg ${vac.badgeColor}`}>
                                {vac.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-semibold">{vac.type}</p>
                          <p className="text-[10px] text-orange-500/90 font-bold mt-0.5">{vac.due}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Medicine Stock Alerts */}
                  <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm space-y-4">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">Medicine Stock Alert</h3>
                    </div>

                    <div className="space-y-3">
                      {lowStockMedicines.map((med, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <AlertCircle className={`w-4 h-4 ${med.severity === 'Critical' ? 'text-rose-500' : 'text-amber-500'}`} />
                            <div>
                              <h5 className="font-bold text-slate-800 text-xs">{med.name}</h5>
                              <p className="text-[10px] text-slate-400 font-bold mt-0.5">{med.stock}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded-md ${
                            med.severity === 'Critical' 
                              ? 'bg-rose-500/10 text-rose-700' 
                              : 'bg-amber-500/10 text-amber-700'
                          }`}>
                            {med.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ══ MY PROFILE TAB ══ */}
          {activeTab === 'My Profile' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">Veterinary Profile</h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">Manage your clinic credentials and veterinary staff details</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {user?.profilePic ? (
                    <img
                      src={user.profilePic.startsWith('/uploads') ? `http://localhost:5000${user.profilePic}` : user.profilePic}
                      alt={user?.fullName || 'Doctor'}
                      className="w-20 h-20 rounded-3xl object-cover border border-slate-200 shadow-md shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-3xl bg-cyan-600 text-white font-black text-3xl flex items-center justify-center shadow-md select-none shrink-0">
                      {(user?.fullName || 'V')[0].toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl font-black text-slate-900">{user?.fullName || 'Dr. Priya K.'}</h2>
                      <span className="px-3 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200/60 rounded-xl text-xs font-bold">
                        Veterinary Staff
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500">{user?.email || 'priya.vet@resqnet.org'}</p>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> Bangalore Central Veterinary Clinic & Shelter Ward
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  {[
                    { label: 'Specialization', value: 'Small Animal Surgery & Trauma Care' },
                    { label: 'Veterinary Reg. No.', value: 'VCI-KAR-2024-8841' },
                    { label: 'Phone Contact', value: user?.phoneNumber || '+91 98765 43210' },
                    { label: 'Clinic Shift', value: '09:00 AM – 06:00 PM' },
                    { label: 'Assigned Shelter', value: 'Green Valley Facility' },
                    { label: 'Account Status', value: 'Verified & Active' },
                  ].map((field) => (
                    <div key={field.label} className="p-4 bg-[#F8FAF9] rounded-2xl border border-slate-100/80">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{field.label}</span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-800 mt-1 block">{field.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Placeholders for Other Tabs */}
          {activeTab !== 'Vet Dashboard' && activeTab !== 'My Profile' && (
            <div className="max-w-xl mx-auto py-16 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                <Info className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{activeTab} Page</h2>
              <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">
                This tab is under development and will be connected to the respective clinic microservice logic soon.
              </p>
            </div>
          )}

        </main>
      </div>

      {/* Add Medical Record Modal */}
      {showAddRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full border border-slate-100 shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">New Medical Record</h2>
              <button 
                onClick={() => setShowAddRecordModal(false)}
                className="p-1 text-slate-450 hover:text-slate-650 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Patient Name</label>
                  <input 
                    type="text" 
                    value={newPatient}
                    onChange={(e) => setNewPatient(e.target.value)}
                    placeholder="e.g. Bruno"
                    required
                    className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Species</label>
                  <select
                    value={newSpecies}
                    onChange={(e) => setNewSpecies(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition cursor-pointer"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Diagnosis details</label>
                <input 
                  type="text" 
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                  placeholder="e.g. Fracture splint applied"
                  required
                  className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Vet Doctor</label>
                  <input 
                    type="text" 
                    value={newVet}
                    onChange={(e) => setNewVet(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Next Visit Date</label>
                  <input 
                    type="text" 
                    value={newNextVisit}
                    onChange={(e) => setNewNextVisit(e.target.value)}
                    placeholder="e.g. Aug 15"
                    className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Treatment Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition cursor-pointer"
                >
                  <option value="Ongoing">Ongoing</option>
                  <option value="Critical">Critical</option>
                  <option value="Improving">Improving</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-[#237737] hover:bg-[#1d632e] text-white text-sm font-bold rounded-2xl transition cursor-pointer shadow-md shadow-[#237737]/10"
              >
                Save Record
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default VetDashboard;
