import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  getShelterIncomingIntakes,
  confirmShelterAdmission,
} from '../../services/rescueRequestService';
import LiveRescueTrackingModal from '../user-dashboard/LiveRescueTrackingModal';
import { AlertCircle, X } from 'lucide-react';

// Modular Components
import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import ManageAnimals from './ManageAnimals';
import ManageCages from './ManageCages';
import ManageAdoptions from './ManageAdoptions';
import ManageVetStaff from './ManageVetStaff';
import Profile from './Profile';

// Standalone Modals
import AddCapacityModal from './AddCapacityModal';
import AddCageModal from './AddCageModal';
import AddAnimalModal from './AddAnimalModal';
import AnimalDetailsModal from './AnimalDetailsModal';
import CageDetailsModal from './CageDetailsModal';

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

  // Live Rescue Intakes & Tracking State
  const [incomingIntakes, setIncomingIntakes] = useState([]);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingRequestId, setTrackingRequestId] = useState(null);

  // Modals for setup & view
  const [showAddCapacityModal, setShowAddCapacityModal] = useState(false);
  const [editingCapacity, setEditingCapacity] = useState(null);
  const [showAddCageModal, setShowAddCageModal] = useState(false);
  const [showAddAnimalModal, setShowAddAnimalModal] = useState(false);
  const [selectedAnimalDetails, setSelectedAnimalDetails] = useState(null);
  const [showAnimalDetailsModal, setShowAnimalDetailsModal] = useState(false);
  const [animalDetailsInitialTab, setAnimalDetailsInitialTab] = useState('profile');
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

  // Filter states for Manage Animals Tab
  const [animalSearchQuery, setAnimalSearchQuery] = useState('');
  const [animalSpeciesFilter, setAnimalSpeciesFilter] = useState('All');
  const [animalHealthFilter, setAnimalHealthFilter] = useState('All');

  // Filter states for Manage Cages Tab
  const [cageSearchQuery, setCageSearchQuery] = useState('');
  const [cageCategoryFilter, setCageCategoryFilter] = useState('All');
  const [cageStatusFilter, setCageStatusFilter] = useState('All');
  const [cageTypeFilter, setCageTypeFilter] = useState('All');

  // Load all shelter facility data
  const loadAllShelterData = async () => {
    try {
      setShelterLoading(true);
      const [shelterRes, catsRes, capRes, cageRes, anmRes, notifRes, intakesRes] = await Promise.all([
        getMyShelter().catch(() => null),
        getAllCategories().catch(() => ({ data: [] })),
        getMyShelterCapacities().catch(() => ({ capacities: [] })),
        getMyShelterCages().catch(() => ({ cages: [] })),
        getMyShelterAnimals().catch(() => ({ animals: [] })),
        getMyNotifications().catch(() => ({ notifications: [] })),
        getShelterIncomingIntakes().catch(() => ({ intakes: [] })),
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
      if (intakesRes?.intakes) setIncomingIntakes(intakesRes.intakes);
    } catch (err) {
      console.warn('Error loading shelter facility data:', err.message);
    } finally {
      setShelterLoading(false);
    }
  };

  useEffect(() => {
    loadAllShelterData();
    const interval = setInterval(loadAllShelterData, 15000); // 15-sec live refresh
    return () => clearInterval(interval);
  }, []);

  const handleConfirmAdmission = async (reqId) => {
    try {
      const res = await confirmShelterAdmission(reqId);
      if (res?.success) {
        alert(res.message || 'Animal intake admission confirmed!');
        loadAllShelterData();
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to confirm admission.');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!newStatus || statusUpdating) return;
    setStatusFeedback('');
    setStatusError('');

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
  const handleViewAnimalDetails = (animal, tab = 'profile') => {
    setSelectedAnimalDetails(animal);
    setAnimalDetailsInitialTab(tab);
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

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAF9] font-sans overflow-hidden text-slate-800">
      {/* Top Navbar */}
      <Header
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        notifOpen={notifOpen}
        setNotifOpen={setNotifOpen}
        notifications={notifications}
        setActiveTab={setActiveTab}
      />

      {/* Main Container Below Navbar */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          handleLogout={handleLogout}
        />

        {/* Dashboard Panels */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 space-y-6">
          {/* Status Update Feedback Alert */}
          {statusFeedback && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center justify-between animate-in fade-in shadow-xs">
              <span>✓ {statusFeedback}</span>
              <button
                onClick={() => setStatusFeedback('')}
                className="text-emerald-600 hover:text-emerald-900 cursor-pointer"
              >
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
              <button
                onClick={() => setStatusError('')}
                className="text-rose-600 hover:text-rose-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Tab 1: Shelter Dashboard Overview */}
          {activeTab === 'Shelter Dashboard' && (
            <Dashboard
              shelterData={shelterData}
              user={user}
              setupReadiness={setupReadiness}
              statusUpdating={statusUpdating}
              handleStatusChange={handleStatusChange}
              capacities={capacities}
              cages={cages}
              displayAnimals={animalsList}
              incomingIntakes={incomingIntakes}
              onTrackIncomingTeam={(reqId) => {
                setTrackingRequestId(reqId);
                setTrackingModalOpen(true);
              }}
              onConfirmAdmission={handleConfirmAdmission}
              loadAllShelterData={loadAllShelterData}
              setActiveTab={setActiveTab}
            />
          )}

          {/* Tab 2: Manage Animals */}
          {activeTab === 'Manage Animals' && (
            <ManageAnimals
              displayAnimals={animalsList}
              animalSearchQuery={animalSearchQuery}
              setAnimalSearchQuery={setAnimalSearchQuery}
              animalSpeciesFilter={animalSpeciesFilter}
              setAnimalSpeciesFilter={setAnimalSpeciesFilter}
              animalHealthFilter={animalHealthFilter}
              setAnimalHealthFilter={setAnimalHealthFilter}
              setShowAddAnimalModal={setShowAddAnimalModal}
              handleViewAnimalDetails={handleViewAnimalDetails}
            />
          )}

          {/* Tab 3: Manage Cages */}
          {activeTab === 'Manage Cages' && (
            <ManageCages
              capacities={capacities}
              cages={cages}
              categories={categories}
              cageSearchQuery={cageSearchQuery}
              setCageSearchQuery={setCageSearchQuery}
              cageCategoryFilter={cageCategoryFilter}
              setCageCategoryFilter={setCageCategoryFilter}
              cageStatusFilter={cageStatusFilter}
              setCageStatusFilter={setCageStatusFilter}
              cageTypeFilter={cageTypeFilter}
              setCageTypeFilter={setCageTypeFilter}
              handleOpenAddCapacity={handleOpenAddCapacity}
              handleOpenEditCapacity={handleOpenEditCapacity}
              handleDeleteCapacity={handleDeleteCapacity}
              setShowAddCageModal={setShowAddCageModal}
              handleUpdateCageStatus={handleUpdateCageStatus}
              handleViewCageDetails={handleViewCageDetails}
              handleDeleteCage={handleDeleteCage}
            />
          )}

          {/* Tab 4: Manage Adoptions */}
          {activeTab === 'Manage Adoptions' && <ManageAdoptions />}

          {/* Tab 5: Manage Veterinary Staff */}
          {activeTab === 'Veterinary Staff' && (
            <ManageVetStaff shelterData={shelterData} />
          )}

          {/* Tab 6: My Profile */}
          {activeTab === 'My Profile' && (
            <Profile
              user={user}
              shelterData={shelterData}
              capacities={capacities}
              cages={cages}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <AnimalDetailsModal
        showAnimalDetailsModal={showAnimalDetailsModal}
        setShowAnimalDetailsModal={setShowAnimalDetailsModal}
        selectedAnimalDetails={selectedAnimalDetails}
        shelterData={shelterData}
        initialTab={animalDetailsInitialTab}
      />

      <CageDetailsModal
        showCageDetailsModal={showCageDetailsModal}
        setShowCageDetailsModal={setShowCageDetailsModal}
        selectedCageDetails={selectedCageDetails}
        handleUpdateCageStatus={handleUpdateCageStatus}
        handleDeleteCage={handleDeleteCage}
      />

      <AddCapacityModal
        showAddCapacityModal={showAddCapacityModal}
        setShowAddCapacityModal={setShowAddCapacityModal}
        editingCapacity={editingCapacity}
        capCategoryId={capCategoryId}
        setCapCategoryId={setCapCategoryId}
        capTotal={capTotal}
        setCapTotal={setCapTotal}
        capOccupied={capOccupied}
        setCapOccupied={setCapOccupied}
        capSubmitting={capSubmitting}
        categories={categories}
        handleSaveCapacity={handleSaveCapacity}
      />

      <AddCageModal
        showAddCageModal={showAddCageModal}
        setShowAddCageModal={setShowAddCageModal}
        cageCategoryId={cageCategoryId}
        setCageCategoryId={setCageCategoryId}
        cageNumber={cageNumber}
        setCageNumber={setCageNumber}
        cageType={cageType}
        setCageType={setCageType}
        cageStatus={cageStatus}
        setCageStatus={setCageStatus}
        cageSubmitting={cageSubmitting}
        categories={categories}
        handleCreateCage={handleCreateCage}
      />

      <AddAnimalModal
        showAddAnimalModal={showAddAnimalModal}
        setShowAddAnimalModal={setShowAddAnimalModal}
        newAnimalName={newAnimalName}
        setNewAnimalName={setNewAnimalName}
        newAnimalSpecies={newAnimalSpecies}
        setNewAnimalSpecies={setNewAnimalSpecies}
        newAnimalBreed={newAnimalBreed}
        setNewAnimalBreed={setNewAnimalBreed}
        newAnimalAge={newAnimalAge}
        setNewAnimalAge={setNewAnimalAge}
        newAnimalCage={newAnimalCage}
        setNewAnimalCage={setNewAnimalCage}
        newAnimalStatus={newAnimalStatus}
        setNewAnimalStatus={setNewAnimalStatus}
        animalSubmitting={animalSubmitting}
        cages={cages}
        handleCreateAnimal={handleCreateAnimal}
      />

      {/* Live Rescue Tracking Modal for Incoming Squad Intakes */}
      <LiveRescueTrackingModal
        isOpen={trackingModalOpen}
        onClose={() => setTrackingModalOpen(false)}
        rescueRequestId={trackingRequestId}
      />
    </div>
  );
};

export default ShelterDashboard;
