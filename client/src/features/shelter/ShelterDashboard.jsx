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
  Search,
  SlidersHorizontal,
  X,
  Building2,
  Dog,
  Check,
  ChevronRight,
  Info
} from 'lucide-react';

const ShelterDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Shelter Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Search & Filter states for Animal Registry
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [showAddAnimalModal, setShowAddAnimalModal] = useState(false);

  // Mock Animal Registry Data
  const [animals, setAnimals] = useState([
    {
      id: 'A-201',
      name: 'Bruno',
      species: 'Dog',
      breed: 'Labrador Mix',
      age: '2y',
      cage: 'D-04',
      status: 'Healthy',
      intakeDate: 'Jul 28',
      statusColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50',
    },
    {
      id: 'A-202',
      name: 'Whiskers',
      species: 'Cat',
      breed: 'Domestic Shorthair',
      age: '1y',
      cage: 'C-12',
      status: 'Under Treatment',
      intakeDate: 'Aug 02',
      statusColor: 'bg-amber-500/10 text-amber-700 border-amber-200/50',
    },
    {
      id: 'A-203',
      name: 'Goldie',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: '4y',
      cage: 'D-09',
      status: 'Healthy',
      intakeDate: 'Jul 25',
      statusColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50',
    },
    {
      id: 'A-204',
      name: 'Luna',
      species: 'Cat',
      breed: 'Siamese Mix',
      age: '6m',
      cage: 'C-02',
      status: 'Healthy',
      intakeDate: 'Aug 05',
      statusColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50',
    },
    {
      id: 'A-205',
      name: 'Max',
      species: 'Dog',
      breed: 'German Shepherd',
      age: '3y',
      cage: 'D-01',
      status: 'Critical',
      intakeDate: 'Aug 09',
      statusColor: 'bg-rose-500/10 text-rose-700 border-rose-200/50',
    },
    {
      id: 'A-206',
      name: 'Cleo',
      species: 'Cat',
      breed: 'Calico',
      age: '2y',
      cage: 'C-05',
      status: 'Healthy',
      intakeDate: 'Jul 30',
      statusColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50',
    }
  ]);

  // Form State for new Animal
  const [newAnimalName, setNewAnimalName] = useState('');
  const [newAnimalSpecies, setNewAnimalSpecies] = useState('Dog');
  const [newAnimalBreed, setNewAnimalBreed] = useState('');
  const [newAnimalAge, setNewAnimalAge] = useState('');
  const [newAnimalCage, setNewAnimalCage] = useState('');
  const [newAnimalStatus, setNewAnimalStatus] = useState('Healthy');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Add animal handler
  const handleAddAnimal = (e) => {
    e.preventDefault();
    if (!newAnimalName.trim() || !newAnimalBreed.trim()) return;

    const statusColors = {
      'Healthy': 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50',
      'Under Treatment': 'bg-amber-500/10 text-amber-700 border-amber-200/50',
      'Critical': 'bg-rose-500/10 text-rose-700 border-rose-200/50'
    };

    const newAnimal = {
      id: 'A-' + Math.floor(207 + Math.random() * 800),
      name: newAnimalName,
      species: newAnimalSpecies,
      breed: newAnimalBreed,
      age: newAnimalAge || '1y',
      cage: newAnimalCage || 'N/A',
      status: newAnimalStatus,
      intakeDate: 'Aug 10',
      statusColor: statusColors[newAnimalStatus]
    };

    setAnimals([newAnimal, ...animals]);
    setNewAnimalName('');
    setNewAnimalBreed('');
    setNewAnimalAge('');
    setNewAnimalCage('');
    setShowAddAnimalModal(false);
  };

  // Filter animals list
  const filteredAnimals = animals.filter((animal) => {
    const matchesSearch =
      animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecies =
      speciesFilter === 'All' || animal.species === speciesFilter;
    return matchesSearch && matchesSpecies;
  });

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
              { name: 'Shelter Dashboard', icon: Building2 },
              { name: 'Adopt a Pet', icon: Heart },
              { name: 'Notifications', icon: Bell, badge: 2 },
              { name: 'My Profile', icon: User }
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
            <h2 className="text-lg font-bold text-slate-900">Shelter Management</h2>
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
                S
              </div>
              <span className="hidden sm:inline text-sm font-bold text-slate-900">
                Shelter Mgr
              </span>
            </div>
          </div>
        </header>

        {/* Dashboard Panels */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Active Tab 1: Shelter Dashboard */}
          {activeTab === 'Shelter Dashboard' && (
            <div className="space-y-6">
              
              {/* Header Title section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                    Paws & Care Shelter
                  </h1>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                    Koramangala, Bangalore • Updated 5 min ago
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveTab('Adopt a Pet')}
                    className="px-4.5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow shadow-[#237737]/10 animate-hover"
                  >
                    <Heart className="w-4 h-4 fill-white/10" /> Manage Adoptions
                  </button>
                  <button 
                    onClick={() => setShowAddAnimalModal(true)}
                    className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4 text-slate-400" /> Add Animal
                  </button>
                </div>
              </div>

              {/* Metric Cards Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Animals */}
                <div className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl flex-shrink-0">
                    <Dog className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Animals</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">{animals.length}</div>
                  </div>
                </div>

                {/* Capacity Used */}
                <div className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-orange-500/10 text-orange-600 rounded-xl flex-shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Capacity Used</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">74%</div>
                  </div>
                </div>

                {/* Adoptions This Month */}
                <div className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl flex-shrink-0">
                    <Heart className="w-5 h-5 fill-blue-500/10" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Adoptions This Month</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">12</div>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center mt-1">↑ 4 more vs last month</span>
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
                      {animals.filter(a => a.status === 'Critical').length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Wing Capacity Overview */}
              <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="pb-4 border-b border-slate-100">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">Wing Capacity Overview</h3>
                </div>

                <div className="space-y-4">
                  {/* Wing 1 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-slate-800">Dog Wing</span>
                      <span className="text-slate-400">34/40 occupied <span className="text-orange-500/90 font-extrabold ml-1.5">• 85%</span></span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full w-full overflow-hidden">
                      <div className="h-full rounded-full bg-orange-500" style={{ width: '85%' }} />
                    </div>
                  </div>

                  {/* Wing 2 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-slate-800">Cat Wing</span>
                      <span className="text-slate-400">18/25 occupied <span className="text-orange-500/90 font-extrabold ml-1.5">• 72%</span></span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full w-full overflow-hidden">
                      <div className="h-full rounded-full bg-orange-500" style={{ width: '72%' }} />
                    </div>
                  </div>

                  {/* Wing 3 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-slate-800">Other Animals</span>
                      <span className="text-slate-400">6/15 occupied <span className="text-emerald-500/90 font-extrabold ml-1.5">• 40%</span></span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full w-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#237737]" style={{ width: '40%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Animal Registry Table Card */}
              <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm space-y-6">
                
                {/* Search / Filter header */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 self-start sm:self-center">
                    Animal Registry
                  </h3>

                  <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                    <div className="relative w-full sm:w-60">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search animals..."
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#237737] text-sm font-semibold transition"
                      />
                      <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    </div>

                    <select
                      value={speciesFilter}
                      onChange={(e) => setSpeciesFilter(e.target.value)}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
                    >
                      <option value="All">All Species</option>
                      <option value="Dog">Dogs</option>
                      <option value="Cat">Cats</option>
                    </select>

                    <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                      <SlidersHorizontal className="w-4 h-4 text-slate-400" /> Filter
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400 tracking-wider">
                        <th className="pb-3.5 pl-4">ID</th>
                        <th className="pb-3.5">Name</th>
                        <th className="pb-3.5">Species</th>
                        <th className="pb-3.5">Breed</th>
                        <th className="pb-3.5">Age</th>
                        <th className="pb-3.5">Cage</th>
                        <th className="pb-3.5">Health Status</th>
                        <th className="pb-3.5 pr-4">Intake Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                      {filteredAnimals.map((animal) => (
                        <tr key={animal.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-4 pl-4 text-slate-400 text-xs font-bold">{animal.id}</td>
                          <td className="py-4 text-slate-900 font-extrabold">{animal.name}</td>
                          <td className="py-4">{animal.species}</td>
                          <td className="py-4 text-xs font-bold text-slate-500">{animal.breed}</td>
                          <td className="py-4 text-xs font-bold text-slate-500">{animal.age}</td>
                          <td className="py-4">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold border border-slate-200/50">
                              {animal.cage}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${animal.statusColor}`}>
                              {animal.status}
                            </span>
                          </td>
                          <td className="py-4 pr-4 text-slate-400 text-xs font-bold">{animal.intakeDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredAnimals.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-sm font-semibold">
                    No registry match found.
                  </div>
                )}

              </div>

            </div>
          )}

          {/* Fallback tabs (Adopt a Pet, Notifications, Profile) linked to existing User views for consistency */}
          {activeTab !== 'Shelter Dashboard' && (
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

      {/* Add Animal Modal */}
      {showAddAnimalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full border border-slate-100 shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">Register New Animal</h2>
              <button 
                onClick={() => setShowAddAnimalModal(false)}
                className="p-1 text-slate-450 hover:text-slate-650 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAnimal} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Animal Name</label>
                <input 
                  type="text" 
                  value={newAnimalName}
                  onChange={(e) => setNewAnimalName(e.target.value)}
                  placeholder="e.g. Bella"
                  required
                  className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Species</label>
                  <select
                    value={newAnimalSpecies}
                    onChange={(e) => setNewAnimalSpecies(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition cursor-pointer"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Age</label>
                  <input 
                    type="text" 
                    value={newAnimalAge}
                    onChange={(e) => setNewAnimalAge(e.target.value)}
                    placeholder="e.g. 2y"
                    className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Breed</label>
                <input 
                  type="text" 
                  value={newAnimalBreed}
                  onChange={(e) => setNewAnimalBreed(e.target.value)}
                  placeholder="e.g. Golden Retriever"
                  required
                  className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Cage</label>
                  <input 
                    type="text" 
                    value={newAnimalCage}
                    onChange={(e) => setNewAnimalCage(e.target.value)}
                    placeholder="e.g. D-04"
                    className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Health Status</label>
                  <select
                    value={newAnimalStatus}
                    onChange={(e) => setNewAnimalStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition cursor-pointer"
                  >
                    <option value="Healthy">Healthy</option>
                    <option value="Under Treatment">Under Treatment</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-[#237737] hover:bg-[#1d632e] text-white text-sm font-bold rounded-2xl transition cursor-pointer shadow-md shadow-[#237737]/10"
              >
                Register Animal
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ShelterDashboard;
