import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserProfileDropdown from '../../components/common/UserProfileDropdown';
import {
  getMyShelter,
  updateMyShelterStatus,
  getMyShelterCapacities,
  saveMyShelterCapacity,
  deleteMyShelterCapacity,
  getMyShelterCages,
  createMyShelterCage,
  updateMyShelterCage,
  deleteMyShelterCage,
  getMyShelterAnimals,
  createMyShelterAnimal,
} from '../../services/shelterService';
import { getAllCategories } from '../../services/animalService';
import { getMyNotifications } from '../../services/notificationService';
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
  ChevronLeft,
  Info,
  Wrench,
  Lock,
  Unlock,
  Layers,
  Sparkles,
  AlertCircle,
  Trash2,
  RefreshCw,
  Eye,
  Edit,
  Activity,
  Calendar,
  Filter,
} from 'lucide-react';

const ShelterDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Shelter Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('resqnet_sidebar_open');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem('resqnet_sidebar_open', String(next));
      return next;
    });
  };
  const [notifOpen, setNotifOpen] = useState(false);

  // Real Shelter Data from backend
  const [shelterData, setShelterData] = useState(null);
  const [setupReadiness, setSetupReadiness] = useState(null);
  const [shelterLoading, setShelterLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState('');
  const [statusError, setStatusError] = useState('');

  // Facility Setup States (Capacities, Cages, Categories)
  const [categories, setCategories] = useState([]);
  const [capacities, setCapacities] = useState([]);
  const [cages, setCages] = useState([]);
  const [animalsList, setAnimalsList] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Modals for setup & view
  const [showAddCapacityModal, setShowAddCapacityModal] = useState(false);
  const [editingCapacity, setEditingCapacity] = useState(null);
  const [showAddCageModal, setShowAddCageModal] = useState(false);
  const [showAddAnimalModal, setShowAddAnimalModal] = useState(false);
  const [selectedAnimalDetails, setSelectedAnimalDetails] = useState(null);
  const [showAnimalDetailsModal, setShowAnimalDetailsModal] = useState(false);
  const [selectedCageDetails, setSelectedCageDetails] = useState(null);
  const [showCageDetailsModal, setShowCageDetailsModal] = useState(false);

  // Capacity Form State
  const [capCategoryId, setCapCategoryId] = useState('');
  const [capTotal, setCapTotal] = useState('');
  const [capOccupied, setCapOccupied] = useState('0');
  const [capSubmitting, setCapSubmitting] = useState(false);

  // Cage Form State
  const [cageCategoryId, setCageCategoryId] = useState('');
  const [cageNumber, setCageNumber] = useState('');
  const [cageType, setCageType] = useState('Normal');
  const [cageStatus, setCageStatus] = useState('AVAILABLE');
  const [cageSubmitting, setCageSubmitting] = useState(false);

  // Animal Form State
  const [newAnimalName, setNewAnimalName] = useState('');
  const [newAnimalSpecies, setNewAnimalSpecies] = useState('Dog');
  const [newAnimalBreed, setNewAnimalBreed] = useState('');
  const [newAnimalAge, setNewAnimalAge] = useState('');
  const [newAnimalCage, setNewAnimalCage] = useState('');
  const [newAnimalStatus, setNewAnimalStatus] = useState('Rescued');
  const [newAnimalNeutered, setNewAnimalNeutered] = useState(false);
  const [newAnimalAbout, setNewAnimalAbout] = useState('');
  const [animalSubmitting, setAnimalSubmitting] = useState(false);

  // Search & Filter states for Dashboard Overview
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('All');

  // Search & Filter states for Manage Animals Tab
  const [animalSearchQuery, setAnimalSearchQuery] = useState('');
  const [animalSpeciesFilter, setAnimalSpeciesFilter] = useState('All');
  const [animalHealthFilter, setAnimalHealthFilter] = useState('All');

  // Search & Filter states for Manage Cages Tab
  const [cageSearchQuery, setCageSearchQuery] = useState('');
  const [cageCategoryFilter, setCageCategoryFilter] = useState('All');
  const [cageStatusFilter, setCageStatusFilter] = useState('All');
  const [cageTypeFilter, setCageTypeFilter] = useState('All');

  // Load all shelter facility data
  const loadAllShelterData = async () => {
    try {
      setShelterLoading(true);
      const [shelterRes, catsRes, capRes, cageRes, anmRes, notifRes] = await Promise.all([
        getMyShelter().catch(() => null),
        getAllCategories().catch(() => ({ data: [] })),
        getMyShelterCapacities().catch(() => ({ capacities: [] })),
        getMyShelterCages().catch(() => ({ cages: [] })),
        getMyShelterAnimals().catch(() => ({ animals: [] })),
        getMyNotifications().catch(() => ({ notifications: [] })),
      ]);

      if (shelterRes?.success && shelterRes.shelter) {
        setShelterData(shelterRes.shelter);
        setSetupReadiness(shelterRes.setupReadiness || null);
      }

      if (catsRes?.data) setCategories(catsRes.data);
      if (capRes?.capacities) setCapacities(capRes.capacities);
      if (cageRes?.cages) setCages(cageRes.cages);
      if (anmRes?.animals) setAnimalsList(anmRes.animals);
      if (notifRes?.notifications) setNotifications(notifRes.notifications);
    } catch (err) {
      console.warn('Error loading shelter facility data:', err.message);
    } finally {
      setShelterLoading(false);
    }
  };

  useEffect(() => {
    loadAllShelterData();
  }, []);

  const handleStatusChange = async (newStatus) => {
    if (!newStatus || statusUpdating) return;
    setStatusFeedback('');
    setStatusError('');

    // Pre-check on frontend if user tries to switch away from UNDER_MAINTENANCE when setup is incomplete
    if (newStatus !== 'UNDER_MAINTENANCE' && setupReadiness && !setupReadiness.isReady) {
      setStatusError(
        `Cannot switch to "${newStatus}". Please complete all 3 setup requirements (Capacity, Cages, and Animals) before opening facility.`
      );
      return;
    }

    try {
      setStatusUpdating(true);
      const res = await updateMyShelterStatus(newStatus);
      if (res.success && res.shelter) {
        setShelterData(res.shelter);
        if (res.setupReadiness) setSetupReadiness(res.setupReadiness);
        setStatusFeedback(`Operational status updated to ${newStatus}`);
        setTimeout(() => setStatusFeedback(''), 4000);
      } else {
        setStatusError(res.message || 'Failed to update operational status.');
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Failed to update status. Please try again.';
      setStatusError(errMsg);
      if (err?.response?.data?.setupReadiness) {
        setSetupReadiness(err.response.data.setupReadiness);
      }
    } finally {
      setStatusUpdating(false);
    }
  };

  // Open Add Capacity Modal
  const handleOpenAddCapacity = () => {
    setEditingCapacity(null);
    setCapCategoryId('');
    setCapTotal('');
    setCapOccupied('0');
    setShowAddCapacityModal(true);
  };

  // Open Edit Capacity Modal
  const handleOpenEditCapacity = (cap) => {
    setEditingCapacity(cap);
    setCapCategoryId(cap.categoryId?._id || cap.categoryId || '');
    setCapTotal(String(cap.totalCapacity || ''));
    setCapOccupied(String(cap.occupiedCapacity || '0'));
    setShowAddCapacityModal(true);
  };

  // Submit Capacity (Create or Update)
  const handleSaveCapacity = async (e) => {
    e.preventDefault();
    if (!capCategoryId || !capTotal || Number(capTotal) <= 0) return;
    try {
      setCapSubmitting(true);
      const res = await saveMyShelterCapacity({
        categoryId: capCategoryId,
        totalCapacity: Number(capTotal),
        occupiedCapacity: Number(capOccupied || 0),
      });
      if (res.success) {
        setShowAddCapacityModal(false);
        setCapCategoryId('');
        setCapTotal('');
        setCapOccupied('0');
        setEditingCapacity(null);
        await loadAllShelterData();
        setStatusFeedback('Capacity details saved successfully.');
        setTimeout(() => setStatusFeedback(''), 3000);
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save capacity.');
    } finally {
      setCapSubmitting(false);
    }
  };

  // Delete Category Capacity
  const handleDeleteCapacity = async (capacityId) => {
    if (!window.confirm('Are you sure you want to remove this capacity configuration?')) return;
    try {
      await deleteMyShelterCapacity(capacityId);
      await loadAllShelterData();
      setStatusFeedback('Category capacity removed.');
      setTimeout(() => setStatusFeedback(''), 3000);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete capacity.');
    }
  };

  // Submit Cage
  const handleCreateCage = async (e) => {
    e.preventDefault();
    if (!cageCategoryId || !cageNumber) return;
    try {
      setCageSubmitting(true);
      const res = await createMyShelterCage({
        categoryId: cageCategoryId,
        cageNumber: Number(cageNumber),
        type: cageType,
        status: cageStatus,
      });
      if (res.success) {
        setShowAddCageModal(false);
        setCageCategoryId('');
        setCageNumber('');
        setCageType('Normal');
        setCageStatus('AVAILABLE');
        await loadAllShelterData();
        setStatusFeedback('Cage added successfully.');
        setTimeout(() => setStatusFeedback(''), 3000);
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to add cage.');
    } finally {
      setCageSubmitting(false);
    }
  };

  // Quick update cage status
  const handleUpdateCageStatus = async (cageId, newStatus) => {
    try {
      await updateMyShelterCage(cageId, { status: newStatus });
      await loadAllShelterData();
      if (selectedCageDetails && selectedCageDetails._id === cageId) {
        setSelectedCageDetails({ ...selectedCageDetails, status: newStatus });
      }
      setStatusFeedback(`Cage status updated to ${newStatus}`);
      setTimeout(() => setStatusFeedback(''), 2500);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update cage status.');
    }
  };

  // Delete Cage
  const handleDeleteCage = async (cageId) => {
    if (!window.confirm('Are you sure you want to remove this cage?')) return;
    try {
      await deleteMyShelterCage(cageId);
      await loadAllShelterData();
      if (showCageDetailsModal) setShowCageDetailsModal(false);
      setStatusFeedback('Cage removed successfully.');
      setTimeout(() => setStatusFeedback(''), 3000);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete cage.');
    }
  };

  // Submit Animal
  const handleCreateAnimal = async (e) => {
    e.preventDefault();
    if (!newAnimalSpecies.trim()) return;
    try {
      setAnimalSubmitting(true);
      const res = await createMyShelterAnimal({
        name: newAnimalName.trim(),
        species: newAnimalSpecies,
        breed: newAnimalBreed.trim(),
        approxAge: newAnimalAge,
        cageNumber: newAnimalCage,
        healthCondition: 'Healthy',
        status: newAnimalStatus,
        neutered: newAnimalNeutered,
        about: newAnimalAbout.trim(),
      });
      if (res.success) {
        setShowAddAnimalModal(false);
        setNewAnimalName('');
        setNewAnimalBreed('');
        setNewAnimalAge('');
        setNewAnimalCage('');
        setNewAnimalAbout('');
        setNewAnimalNeutered(false);
        await loadAllShelterData();
        setStatusFeedback('Animal registered successfully.');
        setTimeout(() => setStatusFeedback(''), 3000);
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to register animal.');
    } finally {
      setAnimalSubmitting(false);
    }
  };

  // Open View Animal Details Modal
  const handleViewAnimalDetails = (animal) => {
    setSelectedAnimalDetails(animal);
    setShowAnimalDetailsModal(true);
  };

  // Open View Cage Details Modal
  const handleViewCageDetails = (cage) => {
    setSelectedCageDetails(cage);
    setShowCageDetailsModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Effective Animals list from backend
  const displayAnimals = animalsList;

  // Filter animals for Manage Animals Tab
  const filteredManageAnimals = displayAnimals.filter((animal) => {
    const name = animal.name || '';
    const breed = animal.breed || '';
    const id = animal.animalId || animal._id || '';
    const matchesSearch =
      name.toLowerCase().includes(animalSearchQuery.toLowerCase()) ||
      breed.toLowerCase().includes(animalSearchQuery.toLowerCase()) ||
      id.toLowerCase().includes(animalSearchQuery.toLowerCase());
    const matchesSpecies =
      animalSpeciesFilter === 'All' || animal.species === animalSpeciesFilter;
    const matchesHealth =
      animalHealthFilter === 'All' ||
      animal.healthCondition === animalHealthFilter ||
      animal.status === animalHealthFilter;
    return matchesSearch && matchesSpecies && matchesHealth;
  });

  // Filter cages for Manage Cages Tab
  const filteredManageCages = cages.filter((cage) => {
    const cageNum = String(cage.cageNumber || '');
    const categoryName = cage.categoryId?.categoryName || 'General';
    const matchesSearch = cageNum.includes(cageSearchQuery) || categoryName.toLowerCase().includes(cageSearchQuery.toLowerCase());
    const matchesCategory = cageCategoryFilter === 'All' || categoryName === cageCategoryFilter;
    const matchesStatus = cageStatusFilter === 'All' || cage.status === cageStatusFilter;
    const matchesType = cageTypeFilter === 'All' || cage.type === cageTypeFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesType;
  });

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAF9] font-sans overflow-hidden text-slate-800">
      
      {/* Full-width Top Navbar */}
      <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-8 flex-shrink-0 z-30 w-full">
        {/* Brand Logo & Sidebar Toggle */}
        <div className="flex items-center gap-3 select-none shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img src="/logo.png" alt="ResQNet Logo" className="h-9 w-auto object-contain" />
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 flex justify-center px-4 max-w-xl mx-auto">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search animals, cages, wings..."
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
              {notifications.some(n => n.status === 'Unread') && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                  <span className="text-sm font-extrabold text-slate-900">Notifications</span>
                  <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"><X className="w-4 h-4" /></button>
                </div>
                <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n, i) => (
                      <div key={n._id || i} className="p-3.5 hover:bg-slate-50 transition-colors">
                        <p className="text-xs text-slate-700 font-semibold">{n.title || n.message || n.text}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400 font-semibold">
                      No new notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown / Widget */}
          <UserProfileDropdown
            onOpenProfile={() => setActiveTab('My Profile')}
            unreadCount={notifications.filter(n => n.status === 'Unread').length}
            onOpenNotifications={() => setNotifOpen(!notifOpen)}
            customRole="Shelter"
          />
        </div>
      </header>

      {/* Main Container Below Navbar */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Panel (below navbar) */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } bg-white border-r border-slate-100 flex flex-col justify-between h-full z-20 overflow-y-auto shrink-0 transition-all duration-300 ease-in-out`}
        >
          <nav className={`${sidebarOpen ? 'p-4' : 'p-3'} space-y-1.5`}>
            {[
              { name: 'Shelter Dashboard', icon: Building2 },
              { name: 'Manage Animals', icon: Dog },
              { name: 'Manage Cages', icon: Layers },
              { name: 'Manage Adoptions', icon: Heart },
            ].map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  title={!sidebarOpen ? item.name : undefined}
                  className={`w-full flex items-center ${
                    sidebarOpen ? 'justify-between px-4' : 'justify-center px-0'
                  } py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer relative group ${
                    isActive
                      ? 'bg-[#237737] text-white shadow-md shadow-[#237737]/10'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  <div className={`flex items-center ${sidebarOpen ? 'gap-3 min-w-0' : 'justify-center'}`}>
                    <IconComponent className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    {sidebarOpen && <span className="truncate whitespace-nowrap">{item.name}</span>}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className={`${sidebarOpen ? 'p-4' : 'p-3'} border-t border-slate-100 space-y-1`}>
            <button
              onClick={toggleSidebar}
              className={`w-full flex items-center ${
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
              onClick={handleLogout}
              className={`w-full flex items-center ${
                sidebarOpen ? 'gap-3 px-4' : 'justify-center px-0'
              } py-3 text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl text-sm font-semibold transition cursor-pointer`}
              title={!sidebarOpen ? 'Log Out' : undefined}
            >
              <LogOut className="w-5 h-5 flex-shrink-0 text-slate-500 hover:text-rose-500" />
              {sidebarOpen && <span className="whitespace-nowrap">Log Out</span>}
            </button>
          </div>
        </aside>

        {/* Dashboard Panels */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Status Update Feedback Alert */}
          {statusFeedback && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center justify-between animate-in fade-in shadow-xs">
              <span>✓ {statusFeedback}</span>
              <button onClick={() => setStatusFeedback('')} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Status Error / Locked Notice Alert */}
          {statusError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 flex items-start justify-between gap-3 animate-in fade-in shadow-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-extrabold block">Action Required</span>
                  <span className="text-rose-700 font-semibold">{statusError}</span>
                </div>
              </div>
              <button onClick={() => setStatusError('')} className="text-rose-600 hover:text-rose-900 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              TAB 1: SHELTER DASHBOARD (FACILITY OVERVIEW)
          ═════════════════════════════════════════════════════════════ */}
          {activeTab === 'Shelter Dashboard' && (
            <div className="space-y-6">
              
              {/* Header Title section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                      {shelterData?.shelterName || user?.fullName || 'Shelter Facility'}
                    </h1>
                    {shelterData?.shelterNumber && (
                      <span className="px-2.5 py-0.5 bg-[#237737]/10 text-[#237737] border border-[#237737]/30 text-xs font-black rounded-lg">
                        {shelterData.shelterNumber}
                      </span>
                    )}

                    {/* Operational Status Dropdown with Lock/Unlock indicator */}
                    <div className="relative inline-flex items-center gap-1.5">
                      <div className="relative inline-flex items-center">
                        <select
                          value={shelterData?.shelterStatus || shelterData?.currentStatus || 'UNDER_MAINTENANCE'}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          disabled={statusUpdating}
                          className={`text-xs font-black rounded-xl pl-8 pr-8 py-1.5 border appearance-none cursor-pointer focus:outline-none transition-all shadow-xs ${
                            (shelterData?.shelterStatus || shelterData?.currentStatus || 'UNDER_MAINTENANCE') === 'OPEN'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:border-emerald-500'
                              : (shelterData?.shelterStatus || shelterData?.currentStatus || 'UNDER_MAINTENANCE') === 'FULL'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 focus:border-rose-500'
                              : (shelterData?.shelterStatus || shelterData?.currentStatus || 'UNDER_MAINTENANCE') === 'UNDER_MAINTENANCE'
                              ? 'bg-amber-50 text-amber-800 border-amber-300 focus:border-amber-500'
                              : 'bg-slate-100 text-slate-700 border-slate-300 focus:border-slate-500'
                          }`}
                          title={
                            setupReadiness && !setupReadiness.isReady
                              ? 'Facility setup incomplete: Fill capacity, cages, and animals to unlock'
                              : 'Change facility operational intake status'
                          }
                        >
                          <option value="UNDER_MAINTENANCE">
                            🛠️ Under Maintenance {setupReadiness && !setupReadiness.isReady ? '(Setup Required)' : ''}
                          </option>
                          <option 
                            value="OPEN" 
                            disabled={setupReadiness && !setupReadiness.isReady}
                          >
                            🟢 Open for Rescue {setupReadiness && !setupReadiness.isReady ? '🔒 (Locked)' : ''}
                          </option>
                          <option 
                            value="FULL" 
                            disabled={setupReadiness && !setupReadiness.isReady}
                          >
                            🔴 Capacity Full {setupReadiness && !setupReadiness.isReady ? '🔒 (Locked)' : ''}
                          </option>
                          <option 
                            value="CLOSED" 
                            disabled={setupReadiness && !setupReadiness.isReady}
                          >
                            ⚪ Temporarily Closed {setupReadiness && !setupReadiness.isReady ? '🔒 (Locked)' : ''}
                          </option>
                        </select>

                        {/* Lock / Unlock Icon Badge inside select */}
                        <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2">
                          {setupReadiness && !setupReadiness.isReady ? (
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </div>

                        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">
                          ▼
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium flex items-center gap-2">
                    <span>
                      {shelterData?.latitude && shelterData?.longitude
                        ? `GPS: ${shelterData.latitude.toFixed(4)}, ${shelterData.longitude.toFixed(4)}`
                        : 'Facility Management'}
                    </span>
                    <span>•</span>
                    <span>Updated just now</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleOpenAddCapacity}
                    className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Layers className="w-4 h-4 text-emerald-600" /> Set Capacity
                  </button>
                  <button 
                    onClick={() => setShowAddCageModal(true)}
                    className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4 text-blue-600" /> Add Cage
                  </button>
                  <button 
                    onClick={() => setShowAddAnimalModal(true)}
                    className="px-4 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow shadow-[#237737]/10 animate-hover"
                  >
                    <Plus className="w-4 h-4" /> Add Animal
                  </button>
                </div>
              </div>

              {/* ── Facility Setup & Operational Readiness Checklist Card ── */}
              {((shelterData?.shelterStatus || shelterData?.currentStatus || 'UNDER_MAINTENANCE') === 'UNDER_MAINTENANCE' || (setupReadiness && !setupReadiness.isReady)) && (
                <div className="bg-white border-2 border-amber-200/80 rounded-3xl p-6 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-slate-900">
                            Facility Setup & Readiness Checklist
                          </h3>
                          <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-lg border ${
                            setupReadiness?.isReady 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}>
                            {setupReadiness?.isReady ? 'READY TO OPEN' : 'SETUP REQUIRED'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Complete all 3 requirements below to unlock and switch your facility status from <strong>Under Maintenance</strong> to <strong>Open for Rescue</strong>.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={loadAllShelterData}
                      title="Refresh setup status"
                      className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl transition cursor-pointer self-start sm:self-center"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 3 Requirements Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    
                    {/* Requirement 1: Category Capacity */}
                    <div className={`p-4 rounded-2xl border transition ${
                      setupReadiness?.hasCapacity 
                        ? 'bg-emerald-50/50 border-emerald-200/80' 
                        : 'bg-amber-50/40 border-amber-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-emerald-600" />
                          1. Category Capacity
                        </span>
                        {setupReadiness?.hasCapacity ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded-md text-[10px]">
                            ✓ Configured
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-black rounded-md text-[10px]">
                            ⚠️ Missing
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 font-medium text-[11px] min-h-[32px]">
                        {capacities.length > 0
                          ? `${capacities.length} category capacities configured (${capacities.reduce((a,c)=>a+(c.totalCapacity||0),0)} total spots)`
                          : 'Set cage capacity for animal categories (Dog, Cat, etc.)'}
                      </p>
                      <button
                        onClick={handleOpenAddCapacity}
                        className={`mt-3 w-full py-2 rounded-xl font-bold text-xs transition cursor-pointer border ${
                          setupReadiness?.hasCapacity
                            ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            : 'bg-amber-600 hover:bg-amber-700 text-white border-transparent'
                        }`}
                      >
                        {setupReadiness?.hasCapacity ? 'Manage Capacity' : '+ Configure Capacity'}
                      </button>
                    </div>

                    {/* Requirement 2: Cages */}
                    <div className={`p-4 rounded-2xl border transition ${
                      setupReadiness?.hasCages 
                        ? 'bg-emerald-50/50 border-emerald-200/80' 
                        : 'bg-amber-50/40 border-amber-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          2. Cage Details
                        </span>
                        {setupReadiness?.hasCages ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded-md text-[10px]">
                            ✓ Configured
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-black rounded-md text-[10px]">
                            ⚠️ Missing
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 font-medium text-[11px] min-h-[32px]">
                        {cages.length > 0
                          ? `${cages.length} individual cages configured in facility`
                          : 'Add cage numbers and wing types (Normal, Quarantine, etc.)'}
                      </p>
                      <button
                        onClick={() => setShowAddCageModal(true)}
                        className={`mt-3 w-full py-2 rounded-xl font-bold text-xs transition cursor-pointer border ${
                          setupReadiness?.hasCages
                            ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            : 'bg-blue-600 hover:bg-blue-700 text-white border-transparent'
                        }`}
                      >
                        {setupReadiness?.hasCages ? 'Add More Cages' : '+ Add Cage Details'}
                      </button>
                    </div>

                    {/* Requirement 3: Animals */}
                    <div className={`p-4 rounded-2xl border transition ${
                      setupReadiness?.hasAnimals 
                        ? 'bg-emerald-50/50 border-emerald-200/80' 
                        : 'bg-amber-50/40 border-amber-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                          <Dog className="w-4 h-4 text-emerald-600" />
                          3. Animal Registry
                        </span>
                        {setupReadiness?.hasAnimals ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded-md text-[10px]">
                            ✓ Configured
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-black rounded-md text-[10px]">
                            ⚠️ Missing
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 font-medium text-[11px] min-h-[32px]">
                        {displayAnimals.length > 0
                          ? `${displayAnimals.length} animals registered in facility`
                          : 'Add rescued animal details and cage allocations'}
                      </p>
                      <button
                        onClick={() => setShowAddAnimalModal(true)}
                        className={`mt-3 w-full py-2 rounded-xl font-bold text-xs transition cursor-pointer border ${
                          setupReadiness?.hasAnimals
                            ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            : 'bg-[#237737] hover:bg-[#1d632e] text-white border-transparent'
                        }`}
                      >
                        {setupReadiness?.hasAnimals ? 'Add Animal' : '+ Register Animal'}
                      </button>
                    </div>

                  </div>

                  {/* Readiness Status Footer */}
                  {setupReadiness?.isReady && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-900 animate-in fade-in">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Great job! All facility requirements are satisfied. You can now use the status dropdown in the header to switch to <strong>Open for Rescue</strong>.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Metric Cards Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Animals */}
                <div 
                  onClick={() => setActiveTab('Manage Animals')}
                  className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-emerald-200"
                >
                  <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl flex-shrink-0">
                    <Dog className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Animals</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">
                      {displayAnimals.length}
                    </div>
                  </div>
                </div>

                {/* Total Cages */}
                <div 
                  onClick={() => setActiveTab('Manage Cages')}
                  className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-blue-200"
                >
                  <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl flex-shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Cages</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">
                      {cages.length}
                    </div>
                  </div>
                </div>

                {/* Total Capacity */}
                <div 
                  onClick={() => setActiveTab('Manage Cages')}
                  className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-orange-200"
                >
                  <div className="p-3 bg-orange-500/10 text-orange-600 rounded-xl flex-shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Capacity</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">
                      {capacities.reduce((acc, c) => acc + (c.totalCapacity || 0), 0) || shelterData?.totalCages || 0}
                    </div>
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
                      {displayAnimals.filter(a => a.healthCondition === 'Critical' || a.status === 'Critical').length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Wing Capacity Overview Section */}
              <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900">Wing Capacity Overview</h3>
                    <p className="text-xs text-slate-400 font-medium">Category-wise occupancy and capacity thresholds</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenAddCapacity}
                      className="px-3 py-1.5 bg-[#237737]/10 text-[#237737] hover:bg-[#237737]/20 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Configure Capacity
                    </button>
                    <button
                      onClick={() => setActiveTab('Manage Cages')}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer ml-1"
                    >
                      Manage Cages <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {capacities.length > 0 ? (
                    capacities.map((cap) => {
                      const total = cap.totalCapacity || 1;
                      const occupied = cap.occupiedCapacity || 0;
                      const pct = Math.min(100, Math.round((occupied / total) * 100));
                      const isHigh = pct >= 80;

                      return (
                        <div key={cap._id || cap.capacityId} className="space-y-1.5">
                          <div className="flex justify-between text-sm font-bold">
                            <span className="text-slate-800">{cap.categoryId?.categoryName || 'General'} Wing</span>
                            <span className="text-slate-400">
                              {occupied}/{total} occupied{' '}
                              <span className={`${isHigh ? 'text-orange-500/90' : 'text-emerald-600'} font-extrabold ml-1.5`}>
                                • {pct}%
                              </span>
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full w-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isHigh ? 'bg-orange-500' : 'bg-[#237737]'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                      No category capacities configured yet. Click "+ Configure Capacity" above to set wing limits.
                    </div>
                  )}
                </div>
              </div>

              {/* Animal Registry Table Card */}
              <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm space-y-6">
                
                {/* Search / Filter header */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                      Recent Animal Registry
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Quick overview of sheltered animals</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                    <button 
                      onClick={() => setActiveTab('Manage Animals')}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                    >
                      View All Animals <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setShowAddAnimalModal(true)}
                      className="px-3.5 py-2 bg-[#237737] text-white hover:bg-[#1d632e] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Register Animal
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
                        <th className="pb-3.5">Cage</th>
                        <th className="pb-3.5">Health Status</th>
                        <th className="pb-3.5 pr-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                      {displayAnimals.slice(0, 5).map((animal) => (
                        <tr key={animal._id || animal.animalId} className="hover:bg-slate-50/50 transition">
                          <td className="py-4 pl-4 text-slate-400 text-xs font-bold">
                            {animal.animalId || animal._id?.slice(-6)}
                          </td>
                          <td className="py-4 text-slate-900 font-extrabold">
                            {animal.name || 'Unnamed Rescue'}
                          </td>
                          <td className="py-4">{animal.species}</td>
                          <td className="py-4 text-xs font-bold text-slate-500">
                            {animal.breed || 'Mixed'}
                          </td>
                          <td className="py-4">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200/50">
                              {animal.cageNumber || 'General'}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                              animal.healthCondition === 'Healthy' || animal.status === 'Healthy'
                                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                                : animal.healthCondition === 'Under Treatment' || animal.status === 'Under Treatment'
                                ? 'bg-amber-500/10 text-amber-700 border-amber-200/50'
                                : 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                            }`}>
                              {animal.healthCondition || animal.status || 'Healthy'}
                            </span>
                          </td>
                          <td className="py-4 pr-4 text-right">
                            <button
                              onClick={() => handleViewAnimalDetails(animal)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-[#237737] hover:text-white text-slate-700 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                              title="View animal details"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {displayAnimals.length === 0 && (
                  <div className="py-10 text-center text-slate-400 text-xs font-semibold space-y-2">
                    <p>No animals registered in facility yet.</p>
                    <button
                      onClick={() => setShowAddAnimalModal(true)}
                      className="px-4 py-2 bg-[#237737] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Register Animal
                    </button>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              TAB 2: MANAGE ANIMALS (FULL ANIMAL REGISTRY & DETAILS)
          ═════════════════════════════════════════════════════════════ */}
          {activeTab === 'Manage Animals' && (
            <div className="space-y-6">
              
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
                    <Dog className="w-7 h-7 text-[#237737]" /> Manage Animals
                  </h1>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                    Register rescue animals, allocate pens, track health conditions, and view detailed profiles.
                  </p>
                </div>

                <button 
                  onClick={() => setShowAddAnimalModal(true)}
                  className="px-5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-[#237737]/15"
                >
                  <Plus className="w-4 h-4" /> Register New Animal
                </button>
              </div>

              {/* Animal Stats Bar */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Animals</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">{displayAnimals.length}</span>
                </div>
                <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Healthy / Stable</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">
                    {displayAnimals.filter(a => a.healthCondition === 'Healthy' || a.status === 'Healthy' || a.status === 'Rescued').length}
                  </span>
                </div>
                <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Under Treatment</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">
                    {displayAnimals.filter(a => a.healthCondition === 'Under Treatment' || a.status === 'Under Treatment').length}
                  </span>
                </div>
                <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Critical Cases</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">
                    {displayAnimals.filter(a => a.healthCondition === 'Critical' || a.status === 'Critical').length}
                  </span>
                </div>
              </div>

              {/* Animal Registry Table Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
                
                {/* Search & Multi-Filters Toolbar */}
                <div className="flex flex-col lg:flex-row gap-3 items-center justify-between pb-4 border-b border-slate-100">
                  <div className="relative w-full lg:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={animalSearchQuery}
                      onChange={(e) => setAnimalSearchQuery(e.target.value)}
                      placeholder="Search by animal name, breed, or ID..."
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#237737] focus:bg-white transition"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                    {/* Species Filter */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-400">Species:</span>
                      <select
                        value={animalSpeciesFilter}
                        onChange={(e) => setAnimalSpeciesFilter(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
                      >
                        <option value="All">All Species</option>
                        <option value="Dog">Dogs</option>
                        <option value="Cat">Cats</option>
                        <option value="Bird">Birds</option>
                        <option value="Cow">Cattle</option>
                        <option value="Other">Other Species</option>
                      </select>
                    </div>

                    {/* Health Filter */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-400">Health:</span>
                      <select
                        value={animalHealthFilter}
                        onChange={(e) => setAnimalHealthFilter(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
                      >
                        <option value="All">All Health Statuses</option>
                        <option value="Healthy">Healthy</option>
                        <option value="Under Treatment">Under Treatment</option>
                        <option value="Critical">Critical</option>
                        <option value="Adopted">Adopted</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        setAnimalSearchQuery('');
                        setAnimalSpeciesFilter('All');
                        setAnimalHealthFilter('All');
                      }}
                      className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition cursor-pointer"
                      title="Reset filters"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400 tracking-wider">
                        <th className="pb-3.5 pl-4">ID</th>
                        <th className="pb-3.5">Animal Name</th>
                        <th className="pb-3.5">Species</th>
                        <th className="pb-3.5">Breed</th>
                        <th className="pb-3.5">Age & Gender</th>
                        <th className="pb-3.5">Cage Allocation</th>
                        <th className="pb-3.5">Health Condition</th>
                        <th className="pb-3.5">Intake Date</th>
                        <th className="pb-3.5 pr-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                      {filteredManageAnimals.map((animal) => (
                        <tr key={animal._id || animal.animalId} className="hover:bg-slate-50/50 transition">
                          <td className="py-4 pl-4 text-slate-400 text-xs font-bold">
                            {animal.animalId || animal._id?.slice(-6)}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                                {(animal.name || 'A')[0].toUpperCase()}
                              </div>
                              <span className="text-slate-900 font-extrabold">{animal.name || 'Unnamed Rescue'}</span>
                            </div>
                          </td>
                          <td className="py-4 font-bold text-slate-700">{animal.species}</td>
                          <td className="py-4 text-xs font-bold text-slate-500">{animal.breed || 'Mixed'}</td>
                          <td className="py-4 text-xs font-bold text-slate-500">
                            {animal.approxAge || '1y'} • {animal.gender || 'Unknown'}
                          </td>
                          <td className="py-4">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200/60">
                              {animal.cageNumber || 'General'}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                              animal.healthCondition === 'Healthy' || animal.status === 'Healthy'
                                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                                : animal.healthCondition === 'Under Treatment' || animal.status === 'Under Treatment'
                                ? 'bg-amber-500/10 text-amber-700 border-amber-200/50'
                                : 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                            }`}>
                              {animal.healthCondition || animal.status || 'Healthy'}
                            </span>
                          </td>
                          <td className="py-4 text-xs text-slate-400 font-bold">
                            {animal.createdAt
                              ? new Date(animal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : 'Recent'}
                          </td>
                          <td className="py-4 pr-4 text-right">
                            <button
                              onClick={() => handleViewAnimalDetails(animal)}
                              className="px-3 py-1.5 bg-[#237737]/10 hover:bg-[#237737] text-[#237737] hover:text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredManageAnimals.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-sm font-semibold space-y-2">
                    <p>No animals matched your search or filters.</p>
                    <button
                      onClick={() => setShowAddAnimalModal(true)}
                      className="px-4 py-2 bg-[#237737] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Register New Animal
                    </button>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              TAB 3: MANAGE CAGES (CAPACITIES & CAGES DETAILS)
          ═════════════════════════════════════════════════════════════ */}
          {activeTab === 'Manage Cages' && (
            <div className="space-y-6">
              
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
                    <Layers className="w-7 h-7 text-[#237737]" /> Manage Cages & Capacity
                  </h1>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                    Configure cage allocations, monitor pen occupancy, view cage details, and update species capacity limits when needed.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleOpenAddCapacity}
                    className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Layers className="w-4 h-4 text-emerald-600" /> Set / Update Capacity
                  </button>
                  <button 
                    onClick={() => setShowAddCageModal(true)}
                    className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/15"
                  >
                    <Plus className="w-4 h-4" /> Add New Cage
                  </button>
                </div>
              </div>

              {/* ── SECTION 1: CAPACITY TABLE & WING LIMITS ── */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                      Species Wing Capacity Management
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      Total Capacity: {capacities.reduce((a,c)=>a+(c.totalCapacity||0),0)} spots across {capacities.length} categories
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddCapacity}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer self-start sm:self-center"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Category Limit
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {capacities.map((cap) => {
                    const total = cap.totalCapacity || 1;
                    const occupied = cap.occupiedCapacity || 0;
                    const available = Math.max(0, total - occupied);
                    const pct = Math.min(100, Math.round((occupied / total) * 100));
                    const isHigh = pct >= 80;

                    return (
                      <div key={cap._id || cap.capacityId} className="p-5 bg-[#F8FAF9] border border-slate-200/80 rounded-2xl space-y-4 hover:border-emerald-300 transition">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                              {cap.categoryId?.categoryName?.[0] || 'C'}
                            </div>
                            <div>
                              <span className="font-black text-slate-900 text-sm block">
                                {cap.categoryId?.categoryName || 'General'} Wing
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold block">
                                Category ID: {cap.categoryId?._id?.slice(-6) || 'N/A'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditCapacity(cap)}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-white rounded-lg transition cursor-pointer"
                              title="Update Capacity"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCapacity(cap._id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition cursor-pointer"
                              title="Delete Capacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Capacity Stats */}
                        <div className="grid grid-cols-3 gap-2 text-center pt-1">
                          <div className="p-2 bg-white rounded-xl border border-slate-100">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Total</span>
                            <span className="text-sm font-black text-slate-800">{total}</span>
                          </div>
                          <div className="p-2 bg-white rounded-xl border border-slate-100">
                            <span className="text-[9px] font-bold text-amber-600 uppercase block">Occupied</span>
                            <span className="text-sm font-black text-slate-800">{occupied}</span>
                          </div>
                          <div className="p-2 bg-white rounded-xl border border-slate-100">
                            <span className="text-[9px] font-bold text-emerald-600 uppercase block">Available</span>
                            <span className="text-sm font-black text-emerald-700">{available}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-400">Utilization</span>
                            <span className={isHigh ? 'text-orange-600 font-extrabold' : 'text-emerald-700 font-extrabold'}>
                              {pct}%
                            </span>
                          </div>
                          <div className="h-2 bg-slate-200/70 rounded-full w-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isHigh ? 'bg-orange-500' : 'bg-[#237737]'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenEditCapacity(cap)}
                          className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
                        >
                          Edit / Update Capacity
                        </button>
                      </div>
                    );
                  })}
                </div>

                {capacities.length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-xs font-semibold space-y-2">
                    <p>No species wing capacities configured yet.</p>
                    <button
                      onClick={handleOpenAddCapacity}
                      className="px-4 py-2 bg-[#237737] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Configure First Capacity
                    </button>
                  </div>
                )}
              </div>

              {/* ── SECTION 2: SHELTER CAGES & PENS ── */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                      Shelter Cages & Pens ({cages.length})
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      Individual cage allocations, types, and occupancy statuses
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddCageModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-center"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Cage
                  </button>
                </div>

                {/* Filters toolbar */}
                <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full lg:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={cageSearchQuery}
                      onChange={(e) => setCageSearchQuery(e.target.value)}
                      placeholder="Search cage # or category..."
                      className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#237737] focus:bg-white transition"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                    {/* Category filter */}
                    <select
                      value={cageCategoryFilter}
                      onChange={(e) => setCageCategoryFilter(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
                    >
                      <option value="All">All Categories</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c.categoryName}>{c.categoryName}</option>
                      ))}
                    </select>

                    {/* Status filter */}
                    <select
                      value={cageStatusFilter}
                      onChange={(e) => setCageStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="OCCUPIED">OCCUPIED</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                    </select>

                    {/* Type filter */}
                    <select
                      value={cageTypeFilter}
                      onChange={(e) => setCageTypeFilter(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
                    >
                      <option value="All">All Types</option>
                      <option value="Normal">Normal</option>
                      <option value="Initial">Initial</option>
                      <option value="Quarantine">Quarantine</option>
                      <option value="Recovery">Recovery</option>
                    </select>
                  </div>
                </div>

                {/* Cages Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400 tracking-wider">
                        <th className="pb-3.5 pl-4">Cage #</th>
                        <th className="pb-3.5">Category Wing</th>
                        <th className="pb-3.5">Type</th>
                        <th className="pb-3.5">Status</th>
                        <th className="pb-3.5">Assigned Animal</th>
                        <th className="pb-3.5 pr-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                      {filteredManageCages.map((cage) => (
                        <tr key={cage._id || cage.cageId} className="hover:bg-slate-50/50 transition">
                          <td className="py-4 pl-4 text-slate-900 font-extrabold text-sm">
                            Cage #{cage.cageNumber}
                          </td>
                          <td className="py-4 text-slate-700 font-bold">
                            {cage.categoryId?.categoryName || 'General'}
                          </td>
                          <td className="py-4">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                              {cage.type}
                            </span>
                          </td>
                          <td className="py-4">
                            <select
                              value={cage.status}
                              onChange={(e) => handleUpdateCageStatus(cage._id, e.target.value)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black border cursor-pointer focus:outline-none transition ${
                                cage.status === 'AVAILABLE'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : cage.status === 'OCCUPIED'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              <option value="AVAILABLE">🟢 AVAILABLE</option>
                              <option value="OCCUPIED">🟡 OCCUPIED</option>
                              <option value="MAINTENANCE">🔴 MAINTENANCE</option>
                            </select>
                          </td>
                          <td className="py-4 text-slate-600 font-semibold">
                            {cage.animalId?.name ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md font-bold text-[11px]">
                                {cage.animalId.name} ({cage.animalId.species})
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">None (Vacant)</span>
                            )}
                          </td>
                          <td className="py-4 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleViewCageDetails(cage)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-[#237737] hover:text-white text-slate-700 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                                title="View cage details"
                              >
                                <Eye className="w-3.5 h-3.5" /> View Details
                              </button>
                              <button
                                onClick={() => handleDeleteCage(cage._id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                title="Delete Cage"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredManageCages.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-xs font-semibold space-y-2">
                    <p>No cages matched your search criteria.</p>
                    <button
                      onClick={() => setShowAddCageModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Cage
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              TAB 4: MANAGE ADOPTIONS
          ═════════════════════════════════════════════════════════════ */}
          {activeTab === 'Manage Adoptions' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
                  <Heart className="w-7 h-7 text-rose-600" /> Manage Adoptions
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                  Review and process adoption applications submitted for your shelter's rescued animals.
                </p>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8" />
                </div>
                <h2 className="text-lg font-black text-slate-900">Adoption Applications Portal</h2>
                <p className="text-slate-500 text-xs max-w-md mx-auto font-medium">
                  Adoption requests submitted by users will appear here for verification, home checks, and handover approvals.
                </p>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              TAB 5: MY PROFILE TAB
          ═════════════════════════════════════════════════════════════ */}
          {activeTab === 'My Profile' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">Shelter Facility Profile</h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">Manage facility credentials, manager contact details, and shelter capacity</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {user?.profilePic ? (
                    <img
                      src={user.profilePic.startsWith('/uploads') ? `http://localhost:5000${user.profilePic}` : user.profilePic}
                      alt={user?.fullName || 'Shelter Manager'}
                      className="w-20 h-20 rounded-3xl object-cover border border-slate-200 shadow-md shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-3xl bg-amber-600 text-white font-black text-3xl flex items-center justify-center shadow-md select-none shrink-0">
                      {(user?.fullName || 'S')[0].toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl font-black text-slate-900">{user?.fullName || shelterData?.shelterName || 'Shelter Manager'}</h2>
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-xl text-xs font-bold">
                        Shelter Manager
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500">{user?.email || shelterData?.shelterEmail}</p>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {shelterData?.shelterNumber ? `Shelter #${shelterData.shelterNumber} • ` : ''}
                      {shelterData?.latitude && shelterData?.longitude
                        ? `GPS: (${shelterData.latitude.toFixed(3)}, ${shelterData.longitude.toFixed(3)})`
                        : 'Facility Management'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  {[
                    { label: 'Shelter Facility ID', value: shelterData?.shelterNumber || 'S01' },
                    { label: 'Registration Type', value: shelterData?.registrationType || 'State Trust / Society' },
                    { label: 'Registration Number', value: shelterData?.registrationNumber || 'N/A' },
                    { label: 'Phone Contact', value: shelterData?.shelterPhoneNumber || user?.phoneNumber || '+91 94471 23456' },
                    { label: 'Total Capacity', value: `${capacities.reduce((a,c)=>a+(c.totalCapacity||0),0)} Spots` },
                    { label: 'Total Cages', value: `${cages.length} Cages` },
                    { label: 'Operational Status', value: shelterData?.shelterStatus || shelterData?.currentStatus || 'UNDER_MAINTENANCE' },
                    { label: 'Admin Status', value: shelterData?.status || 'Active' },
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

        </main>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          MODAL: VIEW ANIMAL DETAILS
      ═════════════════════════════════════════════════════════════ */}
      {showAnimalDetailsModal && selectedAnimalDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Dog className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Animal Profile Details</h2>
                  <p className="text-[11px] text-slate-400 font-bold">ID: {selectedAnimalDetails.animalId || selectedAnimalDetails._id}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAnimalDetailsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Animal Header Card */}
            <div className="p-4 bg-[#F8FAF9] border border-slate-200/70 rounded-2xl flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shadow-sm shrink-0">
                {(selectedAnimalDetails.name || 'A')[0].toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedAnimalDetails.name || 'Unnamed Rescue'}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                    selectedAnimalDetails.healthCondition === 'Healthy' || selectedAnimalDetails.status === 'Healthy'
                      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                      : selectedAnimalDetails.healthCondition === 'Under Treatment'
                      ? 'bg-amber-500/10 text-amber-700 border-amber-200/50'
                      : 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                  }`}>
                    {selectedAnimalDetails.healthCondition || selectedAnimalDetails.status || 'Healthy'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  {selectedAnimalDetails.species} • {selectedAnimalDetails.breed || 'Mixed Breed'}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Approx Age</span>
                <span className="font-extrabold text-slate-800 mt-0.5 block">{selectedAnimalDetails.approxAge || '1 Year'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Gender</span>
                <span className="font-extrabold text-slate-800 mt-0.5 block">{selectedAnimalDetails.gender || 'Unknown'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Cage / Pen Allocation</span>
                <span className="font-extrabold text-[#237737] mt-0.5 block">{selectedAnimalDetails.cageNumber || 'General Wing'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Neutered / Spayed</span>
                <span className="font-extrabold text-slate-800 mt-0.5 block">{selectedAnimalDetails.neutered ? 'Yes (Verified)' : 'No'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Shelter Facility</span>
                <span className="font-extrabold text-slate-800 mt-0.5 block">{shelterData?.shelterName || 'ResQNet Shelter Facility'}</span>
              </div>
            </div>

            {/* Notes / About */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500">Rescue History & Medical Notes</span>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs font-medium text-slate-700 leading-relaxed">
                {selectedAnimalDetails.about || 'No specific rescue notes recorded for this animal.'}
              </div>
            </div>

            <button
              onClick={() => setShowAnimalDetailsModal(false)}
              className="w-full py-3 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-2xl transition cursor-pointer shadow-md shadow-[#237737]/10"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL: VIEW CAGE DETAILS
      ═════════════════════════════════════════════════════════════ */}
      {showCageDetailsModal && selectedCageDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Cage #{selectedCageDetails.cageNumber} Details</h2>
                  <p className="text-[11px] text-slate-400 font-bold">{selectedCageDetails.categoryId?.categoryName || 'General'} Wing</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCageDetailsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cage Specs Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Cage Number</span>
                <span className="font-black text-slate-900 text-sm mt-0.5 block">#{selectedCageDetails.cageNumber}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Cage Type</span>
                <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{selectedCageDetails.type}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Status</span>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                    selectedCageDetails.status === 'AVAILABLE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : selectedCageDetails.status === 'OCCUPIED'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {selectedCageDetails.status}
                  </span>

                  <select
                    value={selectedCageDetails.status}
                    onChange={(e) => handleUpdateCageStatus(selectedCageDetails._id, e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="AVAILABLE">Set AVAILABLE</option>
                    <option value="OCCUPIED">Set OCCUPIED</option>
                    <option value="MAINTENANCE">Set MAINTENANCE</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Occupant Information */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500">Current Occupant</span>
              {selectedCageDetails.animalId ? (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                      {(selectedCageDetails.animalId.name || 'A')[0]}
                    </div>
                    <div>
                      <span className="font-black text-slate-900 text-sm block">{selectedCageDetails.animalId.name}</span>
                      <span className="text-xs font-semibold text-slate-500">{selectedCageDetails.animalId.species} • {selectedCageDetails.animalId.breed || 'Mixed'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-center text-xs font-semibold text-slate-400">
                  Cage is currently Vacant and available for new animal intake.
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleDeleteCage(selectedCageDetails._id)}
                className="w-1/3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-2xl transition cursor-pointer border border-rose-200"
              >
                Delete Cage
              </button>
              <button
                onClick={() => setShowCageDetailsModal(false)}
                className="w-2/3 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-2xl transition cursor-pointer shadow-md shadow-[#237737]/10"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL: CONFIGURE / UPDATE CATEGORY CAPACITY
      ═════════════════════════════════════════════════════════════ */}
      {showAddCapacityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full border border-slate-100 shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Layers className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black text-slate-900">
                  {editingCapacity ? 'Update Category Capacity' : 'Set Category Capacity'}
                </h2>
              </div>
              <button 
                onClick={() => setShowAddCapacityModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCapacity} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Animal Category</label>
                <select
                  value={capCategoryId}
                  onChange={(e) => setCapCategoryId(e.target.value)}
                  required
                  disabled={Boolean(editingCapacity)}
                  className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition cursor-pointer disabled:opacity-60"
                >
                  <option value="">Select Animal Category...</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.categoryName} ({cat.description?.slice(0, 30)}...)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Total Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={capTotal}
                    onChange={(e) => setCapTotal(e.target.value)}
                    placeholder="e.g. 25"
                    required
                    className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Occupied (optional)</label>
                  <input
                    type="number"
                    min="0"
                    value={capOccupied}
                    onChange={(e) => setCapOccupied(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={capSubmitting}
                className="w-full py-3 bg-[#237737] hover:bg-[#1d632e] text-white text-sm font-bold rounded-2xl transition cursor-pointer shadow-md shadow-[#237737]/10 disabled:opacity-50"
              >
                {capSubmitting ? 'Saving Capacity...' : editingCapacity ? 'Update Capacity Limit' : 'Save Capacity Details'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL: ADD CAGE
      ═════════════════════════════════════════════════════════════ */}
      {showAddCageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full border border-slate-100 shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Building2 className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black text-slate-900">Add Cage / Pen</h2>
              </div>
              <button 
                onClick={() => setShowAddCageModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCage} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Animal Category</label>
                <select
                  value={cageCategoryId}
                  onChange={(e) => setCageCategoryId(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition cursor-pointer"
                >
                  <option value="">Select Category...</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Cage Number</label>
                  <input
                    type="number"
                    min="1"
                    value={cageNumber}
                    onChange={(e) => setCageNumber(e.target.value)}
                    placeholder="e.g. 101"
                    required
                    className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Cage Type</label>
                  <select
                    value={cageType}
                    onChange={(e) => setCageType(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition cursor-pointer"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Initial">Initial</option>
                    <option value="Quarantine">Quarantine</option>
                    <option value="Recovery">Recovery</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Status</label>
                <select
                  value={cageStatus}
                  onChange={(e) => setCageStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition cursor-pointer"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="OCCUPIED">OCCUPIED</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={cageSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl transition cursor-pointer shadow-md shadow-blue-600/10 disabled:opacity-50"
              >
                {cageSubmitting ? 'Adding Cage...' : 'Add Cage Details'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL: REGISTER ANIMAL
      ═════════════════════════════════════════════════════════════ */}
      {showAddAnimalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full border border-slate-100 shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Dog className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black text-slate-900">Register Rescued Animal</h2>
              </div>
              <button 
                onClick={() => setShowAddAnimalModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnimal} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Animal Name (optional)</label>
                <input 
                  type="text" 
                  value={newAnimalName}
                  onChange={(e) => setNewAnimalName(e.target.value)}
                  placeholder="e.g. Bruno"
                  className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Species</label>
                  <select
                    value={newAnimalSpecies}
                    onChange={(e) => setNewAnimalSpecies(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition cursor-pointer"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Cow">Cow</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Approx. Age</label>
                  <input 
                    type="text" 
                    value={newAnimalAge}
                    onChange={(e) => setNewAnimalAge(e.target.value)}
                    placeholder="e.g. 2y, 6m"
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
                  placeholder="e.g. Labrador Mix, Stray"
                  className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Cage / Pen #</label>
                  <select
                    value={newAnimalCage}
                    onChange={(e) => setNewAnimalCage(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition cursor-pointer"
                  >
                    <option value="">Select Cage (optional)...</option>
                    {cages.map((c) => (
                      <option key={c._id} value={`Cage #${c.cageNumber}`}>
                        Cage #{c.cageNumber} ({c.categoryId?.categoryName || 'General'}) - {c.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Health Status</label>
                  <select
                    value={newAnimalStatus}
                    onChange={(e) => setNewAnimalStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition cursor-pointer"
                  >
                    <option value="Rescued">Rescued / Healthy</option>
                    <option value="Under Treatment">Under Treatment</option>
                    <option value="Critical">Critical</option>
                    <option value="Adopted">Adopted</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={animalSubmitting}
                className="w-full py-3 bg-[#237737] hover:bg-[#1d632e] text-white text-sm font-bold rounded-2xl transition cursor-pointer shadow-md shadow-[#237737]/10 disabled:opacity-50"
              >
                {animalSubmitting ? 'Registering Animal...' : 'Register Animal'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ShelterDashboard;
