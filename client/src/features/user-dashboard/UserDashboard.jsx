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
  Upload,
  Camera,
  Check,
  Search,
  SlidersHorizontal,
  X,
  Building2,
  Navigation,
  Info,
  Star,
  Edit3
} from 'lucide-react';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Form states for Report Animal
  const [animalType, setAnimalType] = useState('Dog');
  const [animalCondition, setAnimalCondition] = useState('Injured');
  const [description, setDescription] = useState(
    'Injured male stray dog near the bus stop. Has a visible wound on his right hind leg. Limping badly and unable to move. Appeared this morning.'
  );
  const [locationInput, setLocationInput] = useState('MG Road, Sector 14');
  const [hasPhoto, setHasPhoto] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Search & Filter states for Adoption
  const [searchTerm, setSearchTerm] = useState('');
  const [petCategory, setPetCategory] = useState('All');
  const [selectedPet, setSelectedPet] = useState(null);

  // Live Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Rescue Completed',
      body: 'Your report RQ-1031 (Injured Pigeon) has been successfully resolved.',
      time: '1 day ago',
      unread: false,
      icon: CheckCircle2,
      iconColor: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      id: 2,
      title: 'Rescue Team En Route',
      body: 'Team Alpha is on their way to MG Road for RQ-1042. ETA: 8 minutes.',
      time: '2h ago',
      unread: true,
      icon: Navigation,
      iconColor: 'bg-blue-500/10 text-blue-600',
    },
    {
      id: 3,
      title: 'Adoption Application Update',
      body: 'Your application to adopt Bruno (P-101) is under review by Paws & Care Shelter.',
      time: '3h ago',
      unread: true,
      icon: Heart,
      iconColor: 'bg-rose-500/10 text-rose-600',
    },
    {
      id: 4,
      title: 'New Report Nearby',
      body: 'A Critical rescue request was filed 0.8km from your location — Whitefield Main Rd.',
      time: '5h ago',
      unread: true,
      icon: AlertTriangle,
      iconColor: 'bg-amber-500/10 text-amber-600',
    },
    {
      id: 5,
      title: 'Vaccination Reminder',
      body: "Shadow's Rabies Booster is due on Aug 4. Contact Paws & Care Clinic to schedule.",
      time: 'Yesterday',
      unread: false,
      icon: Bell,
      iconColor: 'bg-purple-500/10 text-purple-600',
    },
    {
      id: 6,
      title: 'Thank You!',
      body: 'Your report RQ-1029 helped rescue 4 kittens. They are now healthy at Green Valley Shelter.',
      time: 'Yesterday',
      unread: false,
      icon: Star,
      iconColor: 'bg-emerald-500/10 text-emerald-600',
    }
  ]);

  // Compute live unread count
  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications(
      notifications.map(n => ({ ...n, unread: false }))
    );
  };

  const handleToggleRead = (id) => {
    setNotifications(
      notifications.map(n => n.id === id ? { ...n, unread: false } : n)
    );
  };

  // Mock Rescue Reports Data
  const [rescueReports, setRescueReports] = useState([
    {
      id: 'RQ-1042',
      type: 'Injured Stray Dog',
      status: 'Rescue In Progress',
      location: 'MG Road, Sector 14',
      time: '2h ago',
      statusColor: 'bg-amber-500/10 text-amber-700 border-amber-200/50',
      iconColor: 'bg-amber-500/15 text-amber-600',
    },
    {
      id: 'RQ-1038',
      type: 'Kitten — Stranded',
      status: 'Assigned',
      location: 'Park Street, Near ATM',
      time: '5h ago',
      statusColor: 'bg-blue-500/10 text-blue-700 border-blue-200/50',
      iconColor: 'bg-blue-500/15 text-blue-600',
    },
    {
      id: 'RQ-1031',
      type: 'Injured Pigeon',
      status: 'Resolved',
      location: 'Residency Road',
      time: '1d ago',
      statusColor: 'bg-[#237737]/10 text-[#237737] border-[#237737]/20',
      iconColor: 'bg-[#237737]/15 text-[#237737]',
    }
  ]);

  // Mock Adoption Pets Data
  const pets = [
    {
      id: 'P-101',
      name: 'Bruno',
      category: 'Dog',
      breed: 'Labrador Mix',
      age: '2y',
      gender: 'Male',
      desc: 'Friendly and playful. Great with kids. Loves fetch and long walks.',
      vaccinated: true,
      neutered: true,
      shelter: 'Paws & Care',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'P-102',
      name: 'Whiskers',
      category: 'Cat',
      breed: 'Domestic Shorthair',
      age: '1y',
      gender: 'Female',
      desc: 'Curious and affectionate. Indoor cat. Loves warm laps and window sills.',
      vaccinated: true,
      neutered: false,
      shelter: 'Green Valley',
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'P-103',
      name: 'Goldie',
      category: 'Dog',
      breed: 'Golden Retriever',
      age: '4y',
      gender: 'Female',
      desc: 'Calm and gentle. Perfect companion for families and seniors alike.',
      vaccinated: true,
      neutered: true,
      shelter: 'Paws & Care',
      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'P-104',
      name: 'Luna',
      category: 'Cat',
      breed: 'Siamese Mix',
      age: '6m',
      gender: 'Female',
      desc: 'Playful and vocal. Enjoys chasing toys and climbing cat trees.',
      vaccinated: true,
      neutered: true,
      shelter: 'Paws & Care',
      image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'P-105',
      name: 'Max',
      category: 'Dog',
      breed: 'German Shepherd',
      age: '3y',
      gender: 'Male',
      desc: 'Intelligent, loyal, and highly energetic. Needs an active owner.',
      vaccinated: true,
      neutered: false,
      shelter: 'Green Valley',
      image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'P-106',
      name: 'Cleo',
      category: 'Cat',
      breed: 'Calico',
      age: '2y',
      gender: 'Female',
      desc: 'Quiet and independent. Prefers a serene home to nap and explore.',
      vaccinated: true,
      neutered: true,
      shelter: 'Green Valley',
      image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=600',
    }
  ];

  // User Profile States
  const [profileName, setProfileName] = useState(user?.fullName || 'Alex Johnson');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'user@resqnet.in');
  const [profilePhone, setProfilePhone] = useState(user?.phoneNumber || '+91 98765 43210');
  const [profileLocation, setProfileLocation] = useState('Bangalore, Karnataka');
  const [isEditing, setIsEditing] = useState(false);

  // Preference switches
  const [prefRescue, setPrefRescue] = useState(true);
  const [prefAdoption, setPrefAdoption] = useState(true);
  const [prefVaccination, setPrefVaccination] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getFirstName = () => {
    return profileName.split(' ')[0];
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newReportId = 'RQ-' + Math.floor(1000 + Math.random() * 9000);
    const newReport = {
      id: newReportId,
      type: `${animalCondition} ${animalType}`,
      status: 'Reported',
      location: locationInput || 'Detected Location',
      time: 'Just now',
      statusColor: 'bg-slate-500/10 text-slate-700 border-slate-200/50',
      iconColor: 'bg-slate-500/15 text-slate-600',
    };

    setRescueReports([newReport, ...rescueReports]);
    setSubmitSuccess(true);

    const newNotification = {
      id: notifications.length + 1,
      title: 'Report Submitted',
      body: `Your report for a ${animalCondition} ${animalType} has been successfully filed under ${newReportId}.`,
      time: 'Just now',
      unread: true,
      icon: AlertTriangle,
      iconColor: 'bg-amber-500/10 text-amber-600',
    };
    setNotifications([newNotification, ...notifications]);

    setTimeout(() => {
      setSubmitSuccess(false);
      setActiveTab('Dashboard');
    }, 2000);
  };

  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      petCategory === 'All' ||
      (petCategory === 'Dogs' && pet.category === 'Dog') ||
      (petCategory === 'Cats' && pet.category === 'Cat');
    return matchesSearch && matchesCategory;
  });

  // Mock Nearby Shelters Data
  const nearbyShelters = [
    {
      name: 'Paws & Care Shelter',
      distance: '1.2 km away',
      spaces: '26 spaces available',
      percentage: 74,
      barColor: 'bg-orange-500',
    },
    {
      name: 'Green Valley Animal Rescue',
      distance: '3.4 km away',
      spaces: '55 spaces available',
      percentage: 45,
      barColor: 'bg-emerald-500',
    },
    {
      name: 'City Animal Welfare Centre',
      distance: '5.1 km away',
      spaces: '11 spaces available',
      percentage: 89,
      barColor: 'bg-red-500',
    }
  ];

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
              { name: 'Dashboard', icon: LayoutDashboard },
              { name: 'Report Animal', icon: AlertTriangle },
              { name: 'Adopt a Pet', icon: Heart },
              { name: 'Notifications', icon: Bell, badge: unreadCount },
              { name: 'My Profile', icon: User }
            ].map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.name);
                    setSubmitSuccess(false);
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
                  {sidebarOpen && item.badge > 0 && !isActive && (
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
            <h2 className="text-lg font-bold text-slate-900">
              {activeTab === 'Dashboard' ? 'My Dashboard' : activeTab === 'Report Animal' ? 'Report an Animal' : activeTab === 'Adopt a Pet' ? 'Pet Adoption' : activeTab === 'My Profile' ? 'My Profile' : activeTab}
            </h2>
          </div>

          <div className="flex items-center gap-4.5">
            {/* Notification Bell */}
            <button 
              onClick={() => setActiveTab('Notifications')}
              className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl cursor-pointer relative transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center">
                {getFirstName()[0].toUpperCase()}
              </div>
              <span className="hidden sm:inline text-sm font-bold text-slate-900">
                {profileName}
              </span>
            </div>
          </div>
        </header>

        {/* Dashboard Panels */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* Tab 1: Dashboard Home */}
          {activeTab === 'Dashboard' && (
            <div className="space-y-6">
              {/* Greeting banner */}
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                  Good morning, {getFirstName()} 👋
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                  Here's what's happening with your rescue reports.
                </p>
              </div>

              {/* Metric Cards Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filed */}
                <div className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl flex-shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Reports Filed</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">{rescueReports.length}</div>
                  </div>
                </div>

                {/* Resolved */}
                <div className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Resolved</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">
                      {rescueReports.filter(r => r.status === 'Resolved').length}
                    </div>
                  </div>
                </div>

                {/* In Progress */}
                <div className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">In Progress</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">
                      {rescueReports.filter(r => r.status === 'Rescue In Progress' || r.status === 'Assigned').length}
                    </div>
                  </div>
                </div>

                {/* Pets Saved */}
                <div className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl flex-shrink-0">
                    <Heart className="w-5 h-5 fill-rose-500/10" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pets Saved</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">1</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => setActiveTab('Report Animal')}
                  className="p-6 bg-white border border-slate-100 rounded-2xl hover:border-[#237737]/35 shadow-sm hover:shadow-md flex flex-col items-center justify-center text-center gap-3 cursor-pointer group transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-200/50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm text-slate-900">Report Animal</span>
                </button>

                <button 
                  onClick={() => setActiveTab('Adopt a Pet')}
                  className="p-6 bg-white border border-slate-100 rounded-2xl hover:border-[#237737]/35 shadow-sm hover:shadow-md flex flex-col items-center justify-center text-center gap-3 cursor-pointer group transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-200/50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                    <Heart className="w-5 h-5 fill-rose-500/10" />
                  </div>
                  <span className="font-bold text-sm text-slate-900">Adopt a Pet</span>
                </button>

                <button className="p-6 bg-white border border-slate-100 rounded-2xl hover:border-[#237737]/35 shadow-sm hover:shadow-md flex flex-col items-center justify-center text-center gap-3 cursor-pointer group transition-all duration-200">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-200/50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm text-slate-900">Find Shelter</span>
                </button>

                <button className="p-6 bg-white border border-slate-100 rounded-2xl hover:border-red-500/35 shadow-sm hover:shadow-md flex flex-col items-center justify-center text-center gap-3 cursor-pointer group transition-all duration-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-200/50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm text-slate-900">Emergency</span>
                </button>
              </div>

              {/* Bottom Grid Details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Card: My Rescue Reports */}
                <div className="lg:col-span-7 bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between pb-4.5 mb-2.5 border-b border-slate-100">
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900">My Rescue Reports</h3>
                    <button 
                      onClick={() => setActiveTab('Report Animal')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Report
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {rescueReports.map((report) => (
                      <div 
                        key={report.id} 
                        className="p-4 bg-slate-50/50 border border-slate-100 hover:border-slate-200/80 rounded-2xl flex items-start sm:items-center justify-between gap-4 transition-colors"
                      >
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div className={`p-2.5 ${report.iconColor} rounded-xl flex-shrink-0`}>
                            <AlertTriangle className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-extrabold text-sm text-slate-900">{report.type}</h4>
                              <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-full ${report.statusColor}`}>
                                {report.status}
                              </span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 font-semibold flex items-center gap-1">
                              {report.location} <span className="text-slate-300">•</span> {report.time}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-xs text-slate-400 shrink-0 select-none">
                          {report.id}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Card: Nearby Shelters */}
                <div className="lg:col-span-5 bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="pb-4.5 mb-4.5 border-b border-slate-100">
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900">Nearby Shelters</h3>
                    </div>

                    <div className="space-y-4">
                      {nearbyShelters.map((shelter, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <h4 className="font-extrabold text-slate-900 text-sm">{shelter.name}</h4>
                              <p className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-0.5">
                                {shelter.distance} <span className="text-slate-300">•</span> {shelter.spaces}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-slate-500">{shelter.percentage}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full w-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${shelter.barColor}`} 
                              style={{ width: `${shelter.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Report Animal Form */}
          {activeTab === 'Report Animal' && (
            <div className="max-w-4xl mx-auto space-y-6 pb-12">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                  Report an Animal in Distress
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                  Fill out the details below. Our AI will auto-prioritize based on condition and location.
                </p>
              </div>

              {submitSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 animate-pulse shadow-sm">
                  <Check className="w-5 h-5 bg-emerald-500 text-white rounded-full p-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Report submitted successfully!</span> Redirecting to dashboard...
                  </div>
                </div>
              )}

              <form 
                onSubmit={handleReportSubmit}
                className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div className="space-y-2.5">
                  <label className="block text-sm font-extrabold text-slate-800">
                    Animal Type
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {['Dog', 'Cat', 'Bird', 'Cow', 'Horse', 'Other'].map((type) => {
                      const isSelected = animalType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAnimalType(type)}
                          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition cursor-pointer border ${
                            isSelected
                              ? 'bg-[#237737] text-white border-[#237737] shadow-sm shadow-[#237737]/15'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="block text-sm font-extrabold text-slate-800">
                    Animal Condition
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {['Injured', 'Sick', 'Stranded', 'Abandoned', 'Aggressive', 'Deceased'].map((condition) => {
                      const isSelected = animalCondition === condition;
                      return (
                        <button
                          key={condition}
                          type="button"
                          onClick={() => setAnimalCondition(condition)}
                          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition cursor-pointer border ${
                            isSelected
                              ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/15'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {condition}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-extrabold text-slate-800">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Provide details about the animal's condition, appearance, location markers..."
                    className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200/80 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#237737] focus:ring-2 focus:ring-[#237737]/15 text-sm transition leading-relaxed font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-extrabold text-slate-800">
                    Incident Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      required
                      placeholder="e.g. MG Road, Sector 14, near the metro station"
                      className="w-full pl-11 pr-4 py-3 bg-[#F8FAF9] border border-slate-200/80 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#237737] focus:ring-2 focus:ring-[#237737]/15 text-sm transition font-medium"
                    />
                    <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-3.5">
                  <label className="block text-sm font-extrabold text-slate-800">
                    Upload Photos
                  </label>
                  
                  <div 
                    onClick={() => setHasPhoto(true)}
                    className="border-2 border-dashed border-slate-200 hover:border-[#237737]/45 rounded-3xl p-8 bg-[#F8FAF9]/50 hover:bg-[#F8FAF9] transition flex flex-col items-center justify-center text-center gap-3 cursor-pointer group"
                  >
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 group-hover:text-[#237737] group-hover:scale-105 transition-all">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        Drag & drop images here, or <span className="text-[#237737] underline hover:text-[#1d632e]">browse files</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1 font-semibold">
                        JPEG, PNG up to 10MB. AI will analyze for injury severity.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3.5 pt-2">
                    {hasPhoto && (
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                        <div className="w-full h-full bg-slate-150 flex flex-col items-center justify-center text-slate-400 text-center p-1.5 bg-[#e2e8f0]">
                          <Camera className="w-5 h-5 text-slate-500 mb-0.5" />
                          <span className="text-[9px] font-bold tracking-tight text-slate-600">Dog_Pic.jpg</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setHasPhoto(false)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center cursor-pointer shadow"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => setHasPhoto(true)}
                      className="w-20 h-20 border-2 border-dashed border-slate-200 hover:border-slate-350 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 cursor-pointer transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="pt-4.5 border-t border-slate-100">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 bg-[#237737] hover:bg-[#1d632e] active:bg-[#185326] text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-md shadow-[#237737]/10"
                  >
                    Submit Report →
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 3: Adopt a Pet List */}
          {activeTab === 'Adopt a Pet' && (
            <div className="space-y-6 pb-12">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                  Find Your Perfect Companion
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                  Browse available pets from our partner shelters across the city.
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or breed"
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#237737] text-sm font-semibold transition"
                    />
                    <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
                  </div>

                  {['All Pets', 'Dogs', 'Cats'].map((cat) => {
                    const isSelected = petCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setPetCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#237737] text-white border-[#237737] shadow-sm shadow-[#237737]/15'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {cat === 'Dogs' && '🐶'}
                        {cat === 'Cats' && '🐱'}
                        {cat}
                      </button>
                    );
                  })}

                  <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                    <SlidersHorizontal className="w-4 h-4 text-slate-400" /> More Filters
                  </button>
                </div>

                <div className="text-xs text-slate-400 font-extrabold self-end md:self-center">
                  {filteredPets.length} pets available
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPets.map((pet) => (
                  <div 
                    key={pet.id} 
                    className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
                  >
                    <div className="relative h-56 bg-slate-100 overflow-hidden group">
                      <img 
                        src={pet.image} 
                        alt={pet.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-4 right-4 flex gap-1.5">
                        {pet.vaccinated && (
                          <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg shadow-sm">
                            Vaccinated
                          </span>
                        )}
                        {pet.neutered && (
                          <span className="px-2.5 py-1 bg-blue-500 text-white text-[10px] font-black rounded-lg shadow-sm">
                            Neutered
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-black text-slate-900">{pet.name}</h3>
                          <span className="text-xs font-bold text-slate-400">{pet.id}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                          {pet.breed} <span className="text-slate-300">•</span> {pet.age} <span className="text-slate-300">•</span> {pet.gender}
                        </p>
                        <p className="text-xs text-slate-500 mt-3 leading-relaxed font-semibold">
                          {pet.desc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs font-extrabold text-slate-600">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4 text-slate-400" /> {pet.shelter}
                        </span>
                        <button 
                          onClick={() => setSelectedPet(pet)}
                          className="text-[#237737] hover:text-[#1d632e] cursor-pointer flex items-center gap-0.5 transition"
                        >
                          View Profile &gt;
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPets.length === 0 && (
                <div className="py-20 text-center space-y-2">
                  <p className="text-lg font-bold text-slate-700">No companions found</p>
                  <p className="text-sm text-slate-400 max-w-xs mx-auto font-medium">
                    Try checking your spelling or selecting a different category.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Notifications List */}
          {activeTab === 'Notifications' && (
            <div className="max-w-4xl mx-auto space-y-6 pb-12">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                    Notifications
                  </h1>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1 font-semibold">
                    {unreadCount} unread
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-xs font-extrabold text-[#237737] hover:text-[#1d632e] hover:underline cursor-pointer transition"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-3.5">
                {notifications.map((notif) => {
                  const Icon = notif.icon;
                  return (
                    <div 
                      key={notif.id}
                      onClick={() => handleToggleRead(notif.id)}
                      className={`p-5 bg-white border border-slate-100 hover:border-slate-200/80 rounded-2xl flex items-start gap-4 transition-all duration-200 cursor-pointer shadow-sm relative ${
                        notif.unread ? 'border-l-4 border-l-[#237737]' : ''
                      }`}
                    >
                      <div className={`p-3 ${notif.iconColor} rounded-2xl flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="space-y-1 pr-6">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-sm text-slate-900">{notif.title}</h4>
                          {notif.unread && (
                            <span className="w-1.5 h-1.5 bg-[#237737] rounded-full flex-shrink-0" title="Unread"></span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                          {notif.body}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold pt-1">
                          {notif.time}
                        </p>
                      </div>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setNotifications(notifications.filter(n => n.id !== notif.id));
                        }}
                        className="absolute right-4 top-4 text-slate-350 hover:text-slate-500 transition cursor-pointer"
                        title="Dismiss notification"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}

                {notifications.length === 0 && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                      <Bell className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">No Notifications Yet</h3>
                      <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto font-medium">
                        We will notify you here when rescue reports update or matching pets are found.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 5: My Profile View */}
          {activeTab === 'My Profile' && (
            <div className="max-w-4xl mx-auto space-y-6 pb-12">
              
              {/* Profile Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                
                {/* Header Information block */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-100 pb-6">
                  
                  {/* Photo & Titles */}
                  <div className="flex items-center gap-4.5">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-700 text-white font-black text-3xl flex items-center justify-center shadow-sm select-none">
                      {profileName[0].toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">{profileName}</h2>
                      <p className="text-xs text-slate-400 font-bold mt-0.5">
                        Public User <span className="text-slate-350">•</span> {profileLocation.split(',')[0]}
                      </p>
                      
                      <span className="inline-block mt-2 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-700 border border-emerald-200/50 text-[10px] font-black rounded-lg">
                        Public User
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="sm:self-start px-4.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-350 text-slate-800 text-xs font-extrabold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                  </button>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Email</label>
                    <input 
                      type="email" 
                      value={profileEmail} 
                      disabled 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-400 font-semibold text-sm cursor-not-allowed"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Phone</label>
                    <input 
                      type="text" 
                      value={profilePhone} 
                      onChange={(e) => setProfilePhone(e.target.value)}
                      disabled={!isEditing} 
                      className={`w-full px-4 py-3 border rounded-2xl font-semibold text-sm transition ${
                        isEditing 
                          ? 'bg-[#F8FAF9] border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#237737]' 
                          : 'bg-slate-50 border-slate-200/80 text-slate-700 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Location</label>
                    <input 
                      type="text" 
                      value={profileLocation} 
                      onChange={(e) => setProfileLocation(e.target.value)}
                      disabled={!isEditing} 
                      className={`w-full px-4 py-3 border rounded-2xl font-semibold text-sm transition ${
                        isEditing 
                          ? 'bg-[#F8FAF9] border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#237737]' 
                          : 'bg-slate-50 border-slate-200/80 text-slate-700 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  {/* Member Since */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Member Since</label>
                    <input 
                      type="text" 
                      value="January 2026" 
                      disabled 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-400 font-semibold text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Edit Form Actions */}
                {isEditing && (
                  <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={() => {
                        setProfilePhone(user?.phoneNumber || '+91 98765 43210');
                        setProfileLocation('Bangalore, Karnataka');
                        setIsEditing(false);
                      }}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Discard
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow shadow-[#237737]/10"
                    >
                      Save Changes
                    </button>
                  </div>
                )}

                <div className="border-t border-slate-100 my-4" />

                {/* Activity Summary section */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-base text-slate-900">Activity Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Card 1 */}
                    <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-center shadow-sm">
                      <div className="text-2xl font-black text-slate-900">{rescueReports.length}</div>
                      <div className="text-[10px] text-slate-400 font-extrabold uppercase mt-1">Reports Filed</div>
                    </div>

                    {/* Card 2 */}
                    <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-center shadow-sm">
                      <div className="text-2xl font-black text-slate-900">1</div>
                      <div className="text-[10px] text-slate-400 font-extrabold uppercase mt-1">Adoptions</div>
                    </div>

                    {/* Card 3 */}
                    <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-center shadow-sm">
                      <div className="text-2xl font-black text-slate-900">12h</div>
                      <div className="text-[10px] text-slate-400 font-extrabold uppercase mt-1">Volunteer Hours</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Notification Preferences Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Notification Preferences</h3>
                </div>

                {/* Preferences List */}
                <div className="space-y-4 font-semibold text-slate-700 text-sm">
                  {/* Pref 1 */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                    <span>Rescue request updates</span>
                    <button 
                      type="button" 
                      onClick={() => setPrefRescue(!prefRescue)}
                      className={`w-11 h-6 rounded-full p-0.5 transition cursor-pointer flex items-center ${
                        prefRescue ? 'bg-emerald-600' : 'bg-slate-200'
                      }`}
                    >
                      <span className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        prefRescue ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Pref 2 */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                    <span>Adoption application status</span>
                    <button 
                      type="button" 
                      onClick={() => setPrefAdoption(!prefAdoption)}
                      className={`w-11 h-6 rounded-full p-0.5 transition cursor-pointer flex items-center ${
                        prefAdoption ? 'bg-emerald-600' : 'bg-slate-200'
                      }`}
                    >
                      <span className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        prefAdoption ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Pref 3 */}
                  <div className="flex items-center justify-between pb-3.5">
                    <span>Vaccination reminders</span>
                    <button 
                      type="button" 
                      onClick={() => setPrefVaccination(!prefVaccination)}
                      className={`w-11 h-6 rounded-full p-0.5 transition cursor-pointer flex items-center ${
                        prefVaccination ? 'bg-emerald-600' : 'bg-slate-200'
                      }`}
                    >
                      <span className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        prefVaccination ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Placeholders for Other Tabs */}
          {activeTab !== 'Dashboard' && activeTab !== 'Report Animal' && activeTab !== 'Adopt a Pet' && activeTab !== 'Notifications' && activeTab !== 'My Profile' && (
            <div className="max-w-xl mx-auto py-16 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                <Info className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{activeTab} Page</h2>
              <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">
                This tab is under development and will be connected to the respective microservice logic soon.
              </p>
            </div>
          )}

        </main>
      </div>

      {/* Pet Details Modal */}
      {selectedPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full border border-slate-100 shadow-xl flex flex-col">
            <div className="relative h-64 bg-slate-150">
              <img 
                src={selectedPet.image} 
                alt={selectedPet.name} 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setSelectedPet(null)}
                className="absolute top-4 right-4 p-2 bg-slate-950/50 hover:bg-slate-950/70 text-white rounded-full transition cursor-pointer shadow animate-hover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-900">{selectedPet.name}</h2>
                  <span className="text-xs font-bold text-slate-400">{selectedPet.id}</span>
                </div>
                <p className="text-xs text-slate-400 font-bold mt-1">
                  {selectedPet.breed} • {selectedPet.age} • {selectedPet.gender}
                </p>
              </div>

              <div className="flex gap-2">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                  selectedPet.vaccinated 
                    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50' 
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}>
                  {selectedPet.vaccinated ? '✓ Vaccinated' : '✗ Unvaccinated'}
                </span>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                  selectedPet.neutered 
                    ? 'bg-blue-500/10 text-blue-700 border-blue-200/50' 
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}>
                  {selectedPet.neutered ? '✓ Neutered' : '✗ Intact'}
                </span>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">About</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  {selectedPet.desc} Bruno is fully house-trained, friendly with other animals, and loves being around people.
                </p>
              </div>

              <div className="p-4 bg-[#F8FAF9] rounded-2xl flex items-center justify-between border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white border border-[#F8FAF9] rounded-xl text-slate-500">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-xs">{selectedPet.shelter} Shelter</h5>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Partner Rescue Facility</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm shadow-[#237737]/10">
                  Adopt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;
