import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Info } from 'lucide-react';

import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import MedicalRecords from './MedicalRecords';
import Vaccinations from './Vaccinations';
import MedicinesStock from './MedicinesStock';
import Profile from './Profile';
import AddRecordModal from './AddRecordModal';
import AddVaccinationModal from './AddVaccinationModal';
import SendReminderModal from './SendReminderModal';

import {
  getMyVetAssignment,
  getAssignedShelterAnimals,
  getClinicalRecords,
  getVaccinationRecords,
} from '../../services/veterinaryService';

import { useDashboardTabNavigation } from '../../utils/dashboardNavigation';

const VetDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useDashboardTabNavigation('Veterinary Staff');
  const [subTab, setSubTab] = useState('Medical Records');
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return false;
    }
    const saved = localStorage.getItem('resqnet_sidebar_open');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined' && window.innerWidth >= 768) {
        localStorage.setItem('resqnet_sidebar_open', String(next));
      }
      return next;
    });
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        const saved = localStorage.getItem('resqnet_sidebar_open');
        setSidebarOpen(saved !== null ? saved === 'true' : true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [notifOpen, setNotifOpen] = useState(false);

  // Live Backend State
  const [vetStaff, setVetStaff] = useState(null);
  const [shelterData, setShelterData] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [medicalCases, setMedicalCases] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [showAddVaccinationModal, setShowAddVaccinationModal] = useState(false);
  const [showSendReminderModal, setShowSendReminderModal] = useState(false);
  const [reminderAnimal, setReminderAnimal] = useState(null);
  const [reminderVaccination, setReminderVaccination] = useState(null);

  const loadVetData = async () => {
    setLoading(true);
    try {
      // 1. Fetch assignment & shelter
      const assignRes = await getMyVetAssignment().catch(() => null);
      if (assignRes?.vetStaff) {
        setVetStaff(assignRes.vetStaff);
        setShelterData(assignRes.shelter);
      }

      // 2. Fetch animals, records, vaccinations
      const [animalsRes, recordsRes, vacRes] = await Promise.all([
        getAssignedShelterAnimals().catch(() => ({ animals: [] })),
        getClinicalRecords().catch(() => ({ records: [] })),
        getVaccinationRecords().catch(() => ({ vaccinations: [] })),
      ]);

      setAnimals(animalsRes?.animals || []);
      setMedicalCases(recordsRes?.records || []);
      setVaccinations(vacRes?.vaccinations || []);
    } catch (err) {
      console.warn('Failed to load veterinary dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVetData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRecordCreated = (newRecord) => {
    setMedicalCases((prev) => [newRecord, ...prev]);
  };

  const handleVaccinationCreated = (newVac) => {
    setVaccinations((prev) => [newVac, ...prev]);
  };

  const handleOpenSendReminder = (item) => {
    if (item?.vaccineName || item?.dateGiven) {
      // Opened from vaccination row
      setReminderVaccination(item);
      const foundAnimal = animals.find((a) => a.animalId === item.animalId || a._id === item.animalObjectId);
      setReminderAnimal(foundAnimal || { animalId: item.animalId, name: item.animalName, species: item.species });
    } else if (item?.medicalRecordId || item?.report) {
      // Opened from medical case row
      setReminderVaccination(null);
      const foundAnimal = animals.find((a) => a.animalId === item.animalId || a._id === item.animalObjectId);
      setReminderAnimal(foundAnimal || { animalId: item.animalId, name: item.animalName, species: item.species });
    } else {
      // General reminder
      setReminderVaccination(null);
      setReminderAnimal(animals[0] || null);
    }
    setShowSendReminderModal(true);
  };

  const handleReminderSent = (newReminder) => {
    // Refresh vaccinations to reflect reminderSent state
    if (reminderVaccination) {
      setVaccinations((prev) =>
        prev.map((v) =>
          v._id === reminderVaccination._id ? { ...v, reminderSent: true } : v
        )
      );
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAF9] font-sans overflow-hidden text-slate-800">
      {/* Top Navbar */}
      <Header
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        notifOpen={notifOpen}
        setNotifOpen={setNotifOpen}
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
          vetStaff={vetStaff}
        />

        {/* Dashboard Panels */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 space-y-6">
          {activeTab === 'Vet Dashboard' && (
            <Dashboard
              medicalCases={medicalCases}
              vaccinations={vaccinations}
              lowStockMedicines={lowStockMedicines}
              vetStaff={vetStaff}
              shelterData={shelterData}
              user={user}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'Medical Records' && (
            <div className="space-y-6">
              <MedicalRecords
                medicalCases={medicalCases}
                setShowAddRecordModal={setShowAddRecordModal}
                onOpenSendReminder={handleOpenSendReminder}
              />
            </div>
          )}

          {activeTab === 'Vaccinations' && (
            <div className="space-y-6">
              <Vaccinations
                vaccinations={vaccinations}
                onOpenAddVaccination={() => setShowAddVaccinationModal(true)}
                onOpenSendReminder={handleOpenSendReminder}
              />
            </div>
          )}

          {activeTab === 'Medicines Stock' && vetStaff?.canManageMedicineStock && (
            <div className="space-y-6">
              <MedicinesStock />
            </div>
          )}

          {activeTab === 'My Profile' && (
            <Profile user={user} vetStaff={vetStaff} shelterData={shelterData} />
          )}
        </main>
      </div>

      {/* Add Clinical / Surgery Record Modal */}
      <AddRecordModal
        showAddRecordModal={showAddRecordModal}
        setShowAddRecordModal={setShowAddRecordModal}
        animals={animals}
        shelterData={shelterData}
        onRecordCreated={handleRecordCreated}
      />

      {/* Add Vaccination Modal */}
      <AddVaccinationModal
        isOpen={showAddVaccinationModal}
        onClose={() => setShowAddVaccinationModal(false)}
        animals={animals}
        shelterData={shelterData}
        onVaccinationCreated={handleVaccinationCreated}
      />

      {/* Send Animal Reminder to Shelter Modal */}
      <SendReminderModal
        isOpen={showSendReminderModal}
        onClose={() => setShowSendReminderModal(false)}
        animals={animals}
        initialAnimal={reminderAnimal}
        initialVaccination={reminderVaccination}
        shelterData={shelterData}
        onReminderSent={handleReminderSent}
      />
    </div>
  );
};

export default VetDashboard;
