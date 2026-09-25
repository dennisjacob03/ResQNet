import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw, Tag, Construction, FileText } from 'lucide-react';

// Subcomponents
import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import ManageUsers from './ManageUsers';
import ManageShelters from './ManageShelters';
import ManageApplications from './ManageApplications';
import ManageAnimals from './ManageAnimals';
import ManageVet from './ManageVet';
import ManageRescueTeams from './ManageRescueTeams';
import ManageVolunteers from './ManageVolunteers';
import AIModule from './AIModule';
import SmartCollar from './SmartCollar';
import Profile from './Profile';
import RescueShelterMap from '../user-dashboard/RescueShelterMap';

// Modals
import UserDetailsModal from './UserDetailsModal';
import AddUserModal from './AddUserModal';
import CategoryModal from './CategoryModal';
import AddAnimalModal from './AddAnimalModal';
import AnimalDetailsModal from './AnimalDetailsModal';
import ShelterDetailsModal from './ShelterDetailsModal';
import ApplicationDetailsModal from './ApplicationDetailsModal';
import SiteVisitModal from './SiteVisitModal';
import SiteVisitReportModal from './SiteVisitReportModal';
import TeamVisitModal from './TeamVisitModal';
import TeamVisitReportModal from './TeamVisitReportModal';
import VolunteerVisitModal from './VolunteerVisitModal';
import VolunteerVisitReportModal from './VolunteerVisitReportModal';

// Services
import {
  getAllApplications,
  reviewApplication,
} from '../../services/shelterApplicationService';
import {
  getAllRescueTeamApplications,
  scheduleTeamVisit,
  submitTeamVisitReport,
} from '../../services/rescueTeamService';
import {
  getAllVolunteerApplications,
  scheduleVolunteerVisit,
  submitVolunteerVisitReport,
} from '../../services/volunteerService';
import {
  getAllShelters,
  createShelter,
  updateShelter,
  deleteShelter,
} from '../../services/shelterService';
import {
  getAllUsers,
  getUserStats,
  updateUserStatus,
  updateUserRole,
  createUser,
  deleteUser,
} from '../../services/userService';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllAnimals,
  createAnimal,
  updateAnimal,
  deleteAnimal,
} from '../../services/animalService';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Admin Dashboard');
  const [subTab, setSubTab] = useState('Overview');
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

  // Animals & Category Management State
  const [animalsList, setAnimalsList] = useState([]);
  const [animalsLoading, setAnimalsLoading] = useState(false);
  const [animalsLoaded, setAnimalsLoaded] = useState(false);
  const [animalCategories, setAnimalCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [animalActiveSubView, setAnimalActiveSubView] = useState('categories'); // 'categories' or 'animals'
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [categoryStatusFilter, setCategoryStatusFilter] = useState('All');
  const [animalSearchQuery, setAnimalSearchQuery] = useState('');
  const [animalSpeciesFilter, setAnimalSpeciesFilter] = useState('All');
  const [animalStatusFilter, setAnimalStatusFilter] = useState('All');

  // Add / Edit Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryStatus, setCategoryStatus] = useState('Active');
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [categorySuccess, setCategorySuccess] = useState('');

  // Add Animal Modal State
  const [showAddAnimalModal, setShowAddAnimalModal] = useState(false);
  const [animalName, setAnimalName] = useState('');
  const [animalSpecies, setAnimalSpecies] = useState('Dog');
  const [animalBreed, setAnimalBreed] = useState('');
  const [animalGender, setAnimalGender] = useState('Male');
  const [animalApproxAge, setAnimalApproxAge] = useState('');
  const [animalColor, setAnimalColor] = useState('');
  const [animalCageNumber, setAnimalCageNumber] = useState('');
  const [animalHealthCondition, setAnimalHealthCondition] = useState('Healthy');
  const [animalStatus, setAnimalStatus] = useState('Available');
  const [animalShelterName, setAnimalShelterName] = useState('Central Animal Registry');
  const [animalSubmitting, setAnimalSubmitting] = useState(false);
  const [animalError, setAnimalError] = useState('');
  const [animalSuccess, setAnimalSuccess] = useState('');

  // Animal Details Modal State
  const [selectedAnimalForModal, setSelectedAnimalForModal] = useState(null);
  const [showAnimalDetailsModal, setShowAnimalDetailsModal] = useState(false);

  // User Management State (Real Database Integration)
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    inactiveUsers: 0,
    verifiedEmailUsers: 0,
    verifiedPhoneUsers: 0,
    signupsThisMonth: 0,
    roleBreakdown: {},
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [userActionLoading, setUserActionLoading] = useState({});
  const [selectedUserForModal, setSelectedUserForModal] = useState(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserSubmitting, setAddUserSubmitting] = useState(false);
  const [addUserError, setAddUserError] = useState('');
  const [addUserSuccess, setAddUserSuccess] = useState('');

  // Applications Management State
  const [applicationsCategoryTab, setApplicationsCategoryTab] = useState('All');
  const [shelterApplications, setShelterApplications] = useState([]);
  const [shelterAppsLoading, setShelterAppsLoading] = useState(false);
  const [shelterAppsLoaded, setShelterAppsLoaded] = useState(false);
  const [shelterReviewNote, setShelterReviewNote] = useState({});
  const [shelterReviewing, setShelterReviewing] = useState({});
  const [shelterAppSearchQuery, setShelterAppSearchQuery] = useState('');
  const [shelterAppFilterStatus, setShelterAppFilterStatus] = useState('All');

  // Applications Lists (Other Roles)
  const [vetApplications, setVetApplications] = useState([]);
  const [rescueTeamApplications, setRescueTeamApplications] = useState([]);
  const [volunteerApplications, setVolunteerApplications] = useState([]);

  // Filter & Search states for dedicated management tabs
  const [vetSearchQuery, setVetSearchQuery] = useState('');
  const [vetStatusFilter, setVetStatusFilter] = useState('All');

  const [rescueSearchQuery, setRescueSearchQuery] = useState('');
  const [rescueStatusFilter, setRescueStatusFilter] = useState('All');

  const [volunteerSearchQuery, setVolunteerSearchQuery] = useState('');
  const [volunteerStatusFilter, setVolunteerStatusFilter] = useState('All');

  // Shelters Management State
  const [sheltersList, setSheltersList] = useState([]);
  const [sheltersLoading, setSheltersLoading] = useState(false);
  const [sheltersLoaded, setSheltersLoaded] = useState(false);
  const [shelterSearchQuery, setShelterSearchQuery] = useState('');
  const [shelterFilterStatus, setShelterFilterStatus] = useState('All');
  const [selectedShelterForModal, setSelectedShelterForModal] = useState(null);
  const [showShelterDetailsModal, setShowShelterDetailsModal] = useState(false);
  const [shelterActionLoading, setShelterActionLoading] = useState({});

  // Application Details Modal State
  const [selectedApplicationForModal, setSelectedApplicationForModal] = useState(null);
  const [showApplicationDetailsModal, setShowApplicationDetailsModal] = useState(false);

  // Site Visit & Valuation Modal State
  const [showSiteVisitModal, setShowSiteVisitModal] = useState(false);
  const [selectedAppForSiteVisit, setSelectedAppForSiteVisit] = useState(null);
  const [siteVisitDate, setSiteVisitDate] = useState('');
  const [siteVisitValuationPeriod, setSiteVisitValuationPeriod] = useState('Full Day Inspection');
  const [siteVisitNotes, setSiteVisitNotes] = useState('');
  const [siteVisitInspector, setSiteVisitInspector] = useState('');
  const [siteVisitSubmitting, setSiteVisitSubmitting] = useState(false);

  // Site Visit Inspection Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedAppForReport, setSelectedAppForReport] = useState(null);
  const [siteVisitReportText, setSiteVisitReportText] = useState('');
  const [reportDecision, setReportDecision] = useState('Approved');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // Team Visit & Valuation Modal State (Rescue)
  const [showTeamVisitModal, setShowTeamVisitModal] = useState(false);
  const [selectedRescueAppForVisit, setSelectedRescueAppForVisit] = useState(null);
  const [teamVisitDate, setTeamVisitDate] = useState('');
  const [teamVisitValuationPeriod, setTeamVisitValuationPeriod] = useState('11:00 AM - 2:00 PM');
  const [teamVisitNotes, setTeamVisitNotes] = useState('');
  const [teamVisitInspector, setTeamVisitInspector] = useState('');
  const [teamVisitSubmitting, setTeamVisitSubmitting] = useState(false);

  // Team Visit Inspection Report Modal State (Rescue)
  const [showTeamReportModal, setShowTeamReportModal] = useState(false);
  const [selectedRescueAppForReport, setSelectedRescueAppForReport] = useState(null);
  const [teamVisitReportText, setTeamVisitReportText] = useState('');
  const [teamReportDecision, setTeamReportDecision] = useState('Approved');
  const [teamReportChecks, setTeamReportChecks] = useState({
    vehicleVerified: true,
    equipmentVerified: true,
    membersVerified: true,
    safetyCompliance: true,
  });
  const [teamReportSubmitting, setTeamReportSubmitting] = useState(false);

  // Volunteer Visit & Orientation Modal State
  const [showVolunteerVisitModal, setShowVolunteerVisitModal] = useState(false);
  const [selectedVolunteerAppForVisit, setSelectedVolunteerAppForVisit] = useState(null);
  const [volunteerVisitDate, setVolunteerVisitDate] = useState('');
  const [volunteerVisitValuationPeriod, setVolunteerVisitValuationPeriod] = useState('10:00 AM - 1:00 PM');
  const [volunteerVisitNotes, setVolunteerVisitNotes] = useState('');
  const [volunteerVisitCoordinator, setVolunteerVisitCoordinator] = useState('');
  const [volunteerVisitSubmitting, setVolunteerVisitSubmitting] = useState(false);

  // Volunteer Visit Orientation Report Modal State
  const [showVolunteerReportModal, setShowVolunteerReportModal] = useState(false);
  const [selectedVolunteerAppForReport, setSelectedVolunteerAppForReport] = useState(null);
  const [volunteerVisitReportText, setVolunteerVisitReportText] = useState('');
  const [volunteerReportDecision, setVolunteerReportDecision] = useState('Approved');
  const [volunteerReportChecks, setVolunteerReportChecks] = useState({
    identityVerified: true,
    animalHandlingReady: true,
    safetyOrientationDone: true,
    commitmentAgreement: true,
  });
  const [volunteerReportSubmitting, setVolunteerReportSubmitting] = useState(false);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('Public User');
  const [newUserStatus, setNewUserStatus] = useState('Active');
  const [newUserCity, setNewUserCity] = useState('');
  const [newUserDistrict, setNewUserDistrict] = useState('');
  const [newUserState, setNewUserState] = useState('');
  const [newUserAddress, setNewUserAddress] = useState('');
  const [newUserPincode, setNewUserPincode] = useState('');

  // ─────────────────────────────────────────────
  // Service API Loaders
  // ─────────────────────────────────────────────
  const loadShelterApplications = async () => {
    setShelterAppsLoading(true);
    try {
      const res = await getAllApplications();
      setShelterApplications(res.applications || []);
    } catch (e) {
      console.error('Failed to load shelter applications:', e.message);
    } finally {
      setShelterAppsLoading(false);
      setShelterAppsLoaded(true);
    }
  };

  const loadRescueTeamApplications = async () => {
    try {
      const res = await getAllRescueTeamApplications();
      if (res?.applications) {
        setRescueTeamApplications(res.applications);
      }
    } catch (e) {
      console.error('Failed to load rescue team applications:', e.message);
    }
  };

  const loadVolunteerApplications = async () => {
    try {
      const res = await getAllVolunteerApplications();
      if (res?.applications) {
        setVolunteerApplications(res.applications);
      }
    } catch (e) {
      console.error('Failed to load volunteer applications:', e.message);
    }
  };

  const loadShelters = async () => {
    setSheltersLoading(true);
    try {
      const res = await getAllShelters();
      setSheltersList(res.shelters || []);
    } catch (e) {
      console.error('Failed to load shelters:', e.message);
    } finally {
      setSheltersLoading(false);
      setSheltersLoaded(true);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const [usersRes, statsRes] = await Promise.all([
        getAllUsers(),
        getUserStats().catch((e) => {
          console.warn('Could not load user stats:', e.message);
          return { stats: null };
        }),
      ]);

      if (usersRes?.users) {
        setUsersList(usersRes.users);
      }
      if (statsRes?.stats) {
        setUserStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Failed to load users:', err.message);
      setUsersError(err?.response?.data?.message || 'Failed to fetch users from database.');
    } finally {
      setUsersLoading(false);
      setUsersLoaded(true);
    }
  };

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await getAllCategories();
      setAnimalCategories(res.data || []);
    } catch (e) {
      console.error('Failed to load animal categories:', e.message);
    } finally {
      setCategoriesLoading(false);
      setCategoriesLoaded(true);
    }
  };

  const loadAnimals = async () => {
    setAnimalsLoading(true);
    try {
      const res = await getAllAnimals();
      setAnimalsList(res.data || []);
    } catch (e) {
      console.error('Failed to load animals:', e.message);
    } finally {
      setAnimalsLoading(false);
      setAnimalsLoaded(true);
    }
  };

  useEffect(() => {
    loadUsers();
    loadShelterApplications();
    loadRescueTeamApplications();
    loadVolunteerApplications();
    loadShelters();
    loadAnimals();
    loadCategories();
  }, []);

  useEffect(() => {
    if (subTab === 'Manage Shelters' || subTab === 'Shelters') {
      loadShelters();
    }
  }, [subTab]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ─────────────────────────────────────────────
  // Application Handlers
  // ─────────────────────────────────────────────
  const handleReviewApplication = async (id, status) => {
    setShelterReviewing((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await reviewApplication(id, status, shelterReviewNote[id] || '');
      if (res.success) {
        setShelterApplications((prev) =>
          prev.map((app) => (app._id === id ? res.application : app))
        );
        if (sheltersLoaded) {
          loadShelters();
        }
      }
    } catch (e) {
      console.error('Review failed:', e.message);
    } finally {
      setShelterReviewing((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleOpenScheduleSiteVisit = (app) => {
    setSelectedAppForSiteVisit(app);
    setSiteVisitDate(
      app.siteVisitScheduleDate
        ? new Date(app.siteVisitScheduleDate).toISOString().slice(0, 10)
        : new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)
    );
    setSiteVisitValuationPeriod(
      app.siteVisitValuationPeriod || '10:00 AM - 2:00 PM (Evaluation Window)'
    );
    setSiteVisitInspector(app.siteVisitInspector || user?.fullName || 'Admin Field Officer');
    setSiteVisitNotes(
      app.siteVisitNotes ||
        'Please have premises, animal registers, veterinary clearance documents, and cages ready for physical audit.'
    );
    setShowSiteVisitModal(true);
  };

  const handleConfirmScheduleSiteVisit = async (e) => {
    e.preventDefault();
    if (!selectedAppForSiteVisit) return;
    setSiteVisitSubmitting(true);
    try {
      const payload = {
        status: 'Site Visit',
        siteVisitScheduleDate: siteVisitDate ? new Date(siteVisitDate) : new Date(),
        siteVisitValuationPeriod,
        siteVisitInspector,
        siteVisitNotes,
      };
      const res = await reviewApplication(selectedAppForSiteVisit._id, payload);
      if (res.success) {
        setShelterApplications((prev) =>
          prev.map((a) => (a._id === selectedAppForSiteVisit._id ? res.application : a))
        );
        setShowSiteVisitModal(false);
        setSelectedAppForSiteVisit(null);
      }
    } catch (err) {
      console.error('Failed to schedule site visit:', err.message);
    } finally {
      setSiteVisitSubmitting(false);
    }
  };

  const handleOpenReportModal = (app) => {
    setSelectedAppForReport(app);
    setSiteVisitReportText(
      app.siteVisitReport ||
        `Physical site visit conducted on ${
          app.siteVisitScheduleDate
            ? new Date(app.siteVisitScheduleDate).toLocaleDateString('en-IN')
            : new Date().toLocaleDateString('en-IN')
        }. Premises inspected for cage cleanliness, water/food supply, animal safety, and staff readiness. Verified ${
          app.occupiedCages || 0
        }/${app.totalCages || 0} cages and ${app.totalStaffs || 0} staff members.`
    );
    setReportDecision('Approved');
    setShowReportModal(true);
  };

  const handleSubmitSiteVisitReport = async (e) => {
    e.preventDefault();
    if (!selectedAppForReport) return;
    setReportSubmitting(true);
    try {
      const payload = {
        status: reportDecision,
        siteVisitReport: siteVisitReportText,
        reviewNote: siteVisitReportText,
      };
      const res = await reviewApplication(selectedAppForReport._id, payload);
      if (res.success) {
        setShelterApplications((prev) =>
          prev.map((a) => (a._id === selectedAppForReport._id ? res.application : a))
        );
        if (reportDecision === 'Approved') {
          loadShelters();
        }
        setShowReportModal(false);
        setSelectedAppForReport(null);
      }
    } catch (err) {
      console.error('Failed to submit site visit report:', err.message);
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleReviewVetApp = (id, newStatus) => {
    setVetApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
  };

  const handleOpenScheduleTeamVisit = (app) => {
    setSelectedRescueAppForVisit(app);
    setTeamVisitDate(
      app.teamVisitScheduleDate
        ? new Date(app.teamVisitScheduleDate).toISOString().slice(0, 10)
        : new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)
    );
    setTeamVisitValuationPeriod(
      app.teamVisitValuationPeriod || '11:00 AM - 2:00 PM (Valuation Window)'
    );
    setTeamVisitInspector(app.teamVisitInspector || user?.fullName || 'Admin Field Officer');
    setTeamVisitNotes(
      app.teamVisitNotes ||
        'Please have rescue vehicle parked at base with stretcher, transport cages, first-aid trauma kit, and team responder IDs ready.'
    );
    setShowTeamVisitModal(true);
  };

  const handleConfirmScheduleTeamVisit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedRescueAppForVisit) return;
    setTeamVisitSubmitting(true);
    try {
      const appId = selectedRescueAppForVisit._id || selectedRescueAppForVisit.id;
      const payload = {
        teamVisitScheduleDate: teamVisitDate ? new Date(teamVisitDate) : new Date(),
        teamVisitValuationPeriod,
        teamVisitInspector,
        teamVisitNotes,
      };
      const res = await scheduleTeamVisit(appId, payload);
      if (res.success) {
        setRescueTeamApplications((prev) =>
          prev.map((a) =>
            (a._id === appId || a.id === appId)
              ? { ...a, ...res.application, applicationStatus: 'Team Visit', status: 'Team Visit' }
              : a
          )
        );
        setShowTeamVisitModal(false);
        setSelectedRescueAppForVisit(null);
      }
    } catch (err) {
      console.error('Failed to schedule team visit:', err.message);
    } finally {
      setTeamVisitSubmitting(false);
    }
  };

  const handleOpenTeamReportModal = (app) => {
    setSelectedRescueAppForReport(app);
    setTeamVisitReportText(
      app.teamVisitReport ||
        `Physical inspection & vehicle audit conducted on ${
          app.teamVisitScheduleDate
            ? new Date(app.teamVisitScheduleDate).toLocaleDateString('en-IN')
            : new Date().toLocaleDateString('en-IN')
        }. Response vehicle ${app.vehicleNumber || ''} (${app.vehicleType || 'Vehicle'}) inspected for animal transport cages, stretcher, safety gear, and emergency trauma equipment. Squad readiness verified with ${
          app.totalMembers || 1
        } active responders.`
    );
    setTeamReportDecision('Approved');
    if (app.teamVisitChecks) {
      setTeamReportChecks(app.teamVisitChecks);
    } else {
      setTeamReportChecks({
        vehicleVerified: true,
        equipmentVerified: true,
        membersVerified: true,
        safetyCompliance: true,
      });
    }
    setShowTeamReportModal(true);
  };

  const handleSubmitTeamReport = async (e) => {
    if (e) e.preventDefault();
    if (!selectedRescueAppForReport) return;
    setTeamReportSubmitting(true);
    try {
      const appId = selectedRescueAppForReport._id || selectedRescueAppForReport.id;
      const payload = {
        teamVisitReport: teamVisitReportText,
        teamVisitChecks: teamReportChecks,
        decision: teamReportDecision,
      };
      const res = await submitTeamVisitReport(appId, payload);
      if (res.success) {
        setRescueTeamApplications((prev) =>
          prev.map((a) =>
            (a._id === appId || a.id === appId)
              ? {
                  ...a,
                  ...res.application,
                  applicationStatus: teamReportDecision,
                  status: teamReportDecision,
                  rescueTeam: res.rescueTeam || a.rescueTeam,
                }
               : a
          )
        );
        setShowTeamReportModal(false);
        setSelectedRescueAppForReport(null);
      }
    } catch (err) {
      console.error('Failed to submit team visit report:', err.message);
    } finally {
      setTeamReportSubmitting(false);
    }
  };

  const handleReviewRescueApp = async (id, newStatus) => {
    try {
      if (newStatus === 'Rejected') {
        await submitTeamVisitReport(id, {
          teamVisitReport: 'Application declined by administration.',
          decision: 'Rejected',
        });
      }
      setRescueTeamApplications((prev) =>
        prev.map((app) =>
          (app._id === id || app.id === id)
            ? { ...app, applicationStatus: newStatus, status: newStatus }
            : app
        )
      );
    } catch (err) {
      console.error('Failed to review rescue app:', err.message);
      setRescueTeamApplications((prev) =>
        prev.map((app) =>
          (app._id === id || app.id === id)
            ? { ...app, applicationStatus: newStatus, status: newStatus }
            : app
        )
      );
    }
  };

  // Volunteer Visit Handlers
  const handleOpenScheduleVolunteerVisit = (app) => {
    setSelectedVolunteerAppForVisit(app);
    setVolunteerVisitDate(
      app.visitScheduleDate
        ? new Date(app.visitScheduleDate).toISOString().slice(0, 10)
        : new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)
    );
    setVolunteerVisitValuationPeriod(app.visitValuationPeriod || '10:00 AM - 1:00 PM');
    setVolunteerVisitNotes(
      app.visitNotes ||
        'Bring Government Photo ID (Aadhaar/Driving License) and wear comfortable closed-toe footwear.'
    );
    setVolunteerVisitCoordinator(app.visitCoordinator || 'ResQNet Volunteer Coordinator');
    setShowVolunteerVisitModal(true);
  };

  const handleConfirmScheduleVolunteerVisit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedVolunteerAppForVisit || !volunteerVisitDate) return;
    setVolunteerVisitSubmitting(true);
    try {
      const appId = selectedVolunteerAppForVisit._id || selectedVolunteerAppForVisit.id;
      const payload = {
        visitScheduleDate: volunteerVisitDate,
        visitValuationPeriod: volunteerVisitValuationPeriod,
        visitCoordinator: volunteerVisitCoordinator,
        visitNotes: volunteerVisitNotes,
      };
      const res = await scheduleVolunteerVisit(appId, payload);
      if (res.success) {
        setVolunteerApplications((prev) =>
          prev.map((a) =>
            (a._id === appId || a.id === appId)
              ? {
                  ...a,
                  ...res.application,
                  applicationStatus: 'Volunteer Visit',
                  status: 'Volunteer Visit',
                  visitScheduleDate: volunteerVisitDate,
                  visitValuationPeriod: volunteerVisitValuationPeriod,
                  visitCoordinator: volunteerVisitCoordinator,
                  visitNotes: volunteerVisitNotes,
                }
              : a
          )
        );
        setShowVolunteerVisitModal(false);
        setSelectedVolunteerAppForVisit(null);
      }
    } catch (err) {
      console.error('Failed to schedule volunteer visit:', err.message);
    } finally {
      setVolunteerVisitSubmitting(false);
    }
  };

  const handleOpenVolunteerReportModal = (app) => {
    setSelectedVolunteerAppForReport(app);
    setVolunteerVisitReportText(
      app.visitReport ||
        `Volunteer orientation and identity verification conducted on ${
          app.visitScheduleDate
            ? new Date(app.visitScheduleDate).toLocaleDateString('en-IN')
            : new Date().toLocaleDateString('en-IN')
        }. Candidate demonstrated active interest, gentle animal handling readiness, and completed the ResQNet safety and emergency protocols briefing.`
    );
    setVolunteerReportDecision('Approved');
    if (app.visitChecks) {
      setVolunteerReportChecks(app.visitChecks);
    } else {
      setVolunteerReportChecks({
        identityVerified: true,
        animalHandlingReady: true,
        safetyOrientationDone: true,
        commitmentAgreement: true,
      });
    }
    setShowVolunteerReportModal(true);
  };

  const handleSubmitVolunteerVisitReport = async (e) => {
    if (e) e.preventDefault();
    if (!selectedVolunteerAppForReport) return;
    setVolunteerReportSubmitting(true);
    try {
      const appId = selectedVolunteerAppForReport._id || selectedVolunteerAppForReport.id;
      const payload = {
        visitReport: volunteerVisitReportText,
        visitChecks: volunteerReportChecks,
        decision: volunteerReportDecision,
      };
      const res = await submitVolunteerVisitReport(appId, payload);
      if (res.success) {
        setVolunteerApplications((prev) =>
          prev.map((a) =>
            (a._id === appId || a.id === appId)
              ? {
                  ...a,
                  ...res.application,
                  applicationStatus: volunteerReportDecision,
                  status: volunteerReportDecision,
                  volunteerId: res.application?.volunteerId || a.volunteerId,
                }
              : a
          )
        );
        setShowVolunteerReportModal(false);
        setSelectedVolunteerAppForReport(null);
      }
    } catch (err) {
      console.error('Failed to submit volunteer visit report:', err.message);
    } finally {
      setVolunteerReportSubmitting(false);
    }
  };

  const handleReviewVolunteerApp = async (id, newStatus) => {
    try {
      if (newStatus === 'Rejected') {
        await submitVolunteerVisitReport(id, {
          visitReport: 'Application declined by administration.',
          decision: 'Rejected',
        });
      }
      setVolunteerApplications((prev) =>
        prev.map((app) =>
          (app._id === id || app.id === id)
            ? { ...app, applicationStatus: newStatus, status: newStatus }
            : app
        )
      );
    } catch (err) {
      console.error('Failed to review volunteer app:', err.message);
      setVolunteerApplications((prev) =>
        prev.map((app) =>
          (app._id === id || app.id === id)
            ? { ...app, applicationStatus: newStatus, status: newStatus }
            : app
        )
      );
    }
  };

  // ─────────────────────────────────────────────
  // Shelter Handlers
  // ─────────────────────────────────────────────
  const handleToggleShelterStatus = async (shelter) => {
    const shelterId = shelter._id;
    const currentAccountStatus = shelter.status === 'Inactive' ? 'Inactive' : 'Active';
    const nextStatus = currentAccountStatus === 'Active' ? 'Inactive' : 'Active';
    setShelterActionLoading((prev) => ({ ...prev, [shelterId]: true }));
    try {
      const res = await updateShelter(shelterId, { status: nextStatus });
      if (res.success) {
        setSheltersList((prev) =>
          prev.map((s) => (s._id === shelterId ? { ...s, ...res.shelter, status: nextStatus } : s))
        );
        if (selectedShelterForModal?._id === shelterId) {
          setSelectedShelterForModal((prev) => ({
            ...prev,
            ...res.shelter,
            status: nextStatus,
          }));
        }
      }
    } catch (err) {
      console.error('Toggle shelter status failed:', err.message);
    } finally {
      setShelterActionLoading((prev) => ({ ...prev, [shelterId]: false }));
    }
  };

  const handleUpdateShelterCurrentStatus = async (shelterId, newCurrentStatus) => {
    try {
      const res = await updateShelter(shelterId, {
        shelterStatus: newCurrentStatus,
        currentStatus: newCurrentStatus,
      });
      if (res.success) {
        setSheltersList((prev) =>
          prev.map((s) =>
            s._id === shelterId
              ? {
                  ...s,
                  ...res.shelter,
                  shelterStatus: newCurrentStatus,
                  currentStatus: newCurrentStatus,
                }
              : s
          )
        );
        if (selectedShelterForModal?._id === shelterId) {
          setSelectedShelterForModal((prev) => ({
            ...prev,
            ...res.shelter,
            shelterStatus: newCurrentStatus,
            currentStatus: newCurrentStatus,
          }));
        }
      }
    } catch (err) {
      console.error('Update shelter status failed:', err.message);
    }
  };

  const handleDeleteShelter = async (shelterId) => {
    if (
      !window.confirm(
        'Are you sure you want to deactivate this shelter? The record will be safely archived (Soft Deleted).'
      )
    )
      return;
    try {
      const res = await deleteShelter(shelterId);
      if (res.success) {
        setSheltersList((prev) => prev.filter((s) => s._id !== shelterId));
      }
    } catch (err) {
      console.error('Delete shelter failed:', err.message);
    }
  };

  // ─────────────────────────────────────────────
  // User Handlers
  // ─────────────────────────────────────────────
  const handleCreateUser = async (formDataOrEvent) => {
    if (formDataOrEvent && typeof formDataOrEvent.preventDefault === 'function') {
      formDataOrEvent.preventDefault();
    }
    setAddUserError('');
    setAddUserSuccess('');
    setAddUserSubmitting(true);

    try {
      const isCustomPayload = formDataOrEvent && !formDataOrEvent.preventDefault;
      const payload = isCustomPayload
        ? formDataOrEvent
        : {
            fullName: newUserName.trim(),
            email: newUserEmail.trim(),
            phoneNumber: newUserPhone.trim(),
            password: newUserPassword,
            role: newUserRole,
            status: newUserStatus,
            city: newUserCity.trim(),
            district: newUserDistrict.trim(),
            state: newUserState.trim(),
            address: newUserAddress.trim(),
            pincode: newUserPincode.trim(),
            isEmailVerified: true,
            isPhoneVerified: true,
          };

      const res = await createUser(payload);
      if (res.success && res.user) {
        setAddUserSuccess(`User ${res.user.fullName} (${res.user.role}) created successfully!`);
        setUsersList((prev) => [res.user, ...prev]);
        setUserStats((prev) => ({
          ...prev,
          totalUsers: prev.totalUsers + 1,
          activeUsers: res.user.status === 'Active' ? prev.activeUsers + 1 : prev.activeUsers,
        }));

        if (res.user.role === 'Shelter' && typeof loadShelters === 'function') {
          loadShelters();
        }

        setTimeout(() => {
          setShowAddUserModal(false);
          setAddUserSuccess('');
          setNewUserName('');
          setNewUserEmail('');
          setNewUserPhone('');
          setNewUserPassword('');
          setNewUserRole('Public User');
          setNewUserStatus('Active');
          setNewUserCity('');
          setNewUserDistrict('');
          setNewUserState('');
          setNewUserAddress('');
          setNewUserPincode('');
        }, 1200);

        return res;
      } else {
        setAddUserError(res.message || 'Failed to create user.');
        return null;
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Error creating user account.';
      setAddUserError(errorMsg);
      throw err;
    } finally {
      setAddUserSubmitting(false);
    }
  };

  const handleToggleStatus = async (targetUser) => {
    const userId = targetUser._id || targetUser.id;
    const newStatus = targetUser.status === 'Active' ? 'Suspended' : 'Active';

    if (targetUser.role === 'Admin' && newStatus === 'Suspended') {
      alert('An Admin user account cannot be suspended.');
      return;
    }

    setUserActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await updateUserStatus(userId, newStatus);
      if (res.success) {
        setUsersList((prev) =>
          prev.map((u) => ((u._id || u.id) === userId ? { ...u, status: newStatus } : u))
        );
        if (
          selectedUserForModal &&
          (selectedUserForModal._id || selectedUserForModal.id) === userId
        ) {
          setSelectedUserForModal((prev) => ({ ...prev, status: newStatus }));
        }
        setUserStats((prev) => ({
          ...prev,
          activeUsers:
            newStatus === 'Active' ? prev.activeUsers + 1 : Math.max(0, prev.activeUsers - 1),
          suspendedUsers:
            newStatus === 'Suspended'
              ? prev.suspendedUsers + 1
              : Math.max(0, prev.suspendedUsers - 1),
        }));
      }
    } catch (err) {
      console.error('Failed to update user status:', err.message);
      alert(err?.response?.data?.message || 'Failed to update user status');
    } finally {
      setUserActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    setUserActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await updateUserRole(userId, newRole);
      if (res.success) {
        setUsersList((prev) =>
          prev.map((u) => ((u._id || u.id) === userId ? { ...u, role: newRole } : u))
        );
        if (
          selectedUserForModal &&
          (selectedUserForModal._id || selectedUserForModal.id) === userId
        ) {
          setSelectedUserForModal((prev) => ({ ...prev, role: newRole }));
        }
      }
    } catch (err) {
      console.error('Failed to update user role:', err.message);
      alert(err?.response?.data?.message || 'Failed to update user role');
    } finally {
      setUserActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteUser = async (targetUser) => {
    const userId = targetUser._id || targetUser.id;
    const userName = targetUser.fullName || targetUser.name;

    if (
      !window.confirm(
        `Are you sure you want to deactivate and remove user "${userName}"? Note: The record and audit logs will be safely archived (Soft Deleted).`
      )
    ) {
      return;
    }

    setUserActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await deleteUser(userId);
      if (res.success) {
        setUsersList((prev) => prev.filter((u) => (u._id || u.id) !== userId));
        if (
          selectedUserForModal &&
          (selectedUserForModal._id || selectedUserForModal.id) === userId
        ) {
          setShowUserDetailsModal(false);
          setSelectedUserForModal(null);
        }
        setUserStats((prev) => ({
          ...prev,
          totalUsers: Math.max(0, prev.totalUsers - 1),
        }));
      }
    } catch (err) {
      console.error('Failed to delete user:', err.message);
      alert(err?.response?.data?.message || 'Failed to delete user');
    } finally {
      setUserActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // ─────────────────────────────────────────────
  // Category Handlers
  // ─────────────────────────────────────────────
  const handleOpenAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDescription('');
    setCategoryStatus('Active');
    setCategoryError('');
    setCategorySuccess('');
    setShowCategoryModal(true);
  };

  const handleOpenEditCategoryModal = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.categoryName || '');
    setCategoryDescription(cat.description || '');
    setCategoryStatus(cat.status || 'Active');
    setCategoryError('');
    setCategorySuccess('');
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setCategoryError('Category Name is required.');
      return;
    }
    setCategorySubmitting(true);
    setCategoryError('');
    setCategorySuccess('');

    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, {
          categoryName: categoryName.trim(),
          description: categoryDescription.trim(),
          status: categoryStatus,
        });
        setCategorySuccess(`Category "${categoryName}" updated successfully!`);
      } else {
        await createCategory({
          categoryName: categoryName.trim(),
          description: categoryDescription.trim(),
          status: categoryStatus,
        });
        setCategorySuccess(`Category "${categoryName}" created successfully!`);
      }
      await loadCategories();
      setTimeout(() => {
        setShowCategoryModal(false);
        setEditingCategory(null);
        setCategoryName('');
        setCategoryDescription('');
        setCategoryStatus('Active');
        setCategorySuccess('');
      }, 700);
    } catch (err) {
      setCategoryError(err.message || 'Failed to save category');
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleToggleCategoryStatus = async (cat) => {
    const newStatus = cat.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateCategory(cat._id, { status: newStatus });
      setAnimalCategories((prev) =>
        prev.map((c) => (c._id === cat._id ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      console.error('Failed to toggle category status:', err.message);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (
      !window.confirm(
        `Are you sure you want to delete category "${cat.categoryName}" (${cat.categoryId})?`
      )
    ) {
      return;
    }
    try {
      await deleteCategory(cat._id);
      setAnimalCategories((prev) => prev.filter((c) => c._id !== cat._id));
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  // ─────────────────────────────────────────────
  // Animal Handlers
  // ─────────────────────────────────────────────
  const handleOpenAddAnimalModal = () => {
    setAnimalName('');
    setAnimalSpecies(animalCategories[0]?.categoryName || 'Dog');
    setAnimalBreed('');
    setAnimalGender('Male');
    setAnimalApproxAge('');
    setAnimalColor('');
    setAnimalCageNumber('');
    setAnimalHealthCondition('Healthy');
    setAnimalStatus('Available');
    setAnimalShelterName('Central Animal Registry');
    setAnimalError('');
    setAnimalSuccess('');
    setShowAddAnimalModal(true);
  };

  const handleSaveAnimal = async (e) => {
    e.preventDefault();
    if (!animalSpecies.trim()) {
      setAnimalError('Species / Category is required.');
      return;
    }
    setAnimalSubmitting(true);
    setAnimalError('');
    setAnimalSuccess('');

    try {
      await createAnimal({
        name: animalName.trim(),
        species: animalSpecies.trim(),
        breed: animalBreed.trim(),
        gender: animalGender,
        approxAge: animalApproxAge.trim(),
        color: animalColor.trim(),
        cageNumber: animalCageNumber.trim(),
        healthCondition: animalHealthCondition,
        status: animalStatus,
        shelterName: animalShelterName.trim() || 'Central Animal Registry',
      });
      setAnimalSuccess('Animal registered successfully!');
      await loadAnimals();
      setTimeout(() => {
        setShowAddAnimalModal(false);
        setAnimalName('');
        setAnimalBreed('');
        setAnimalApproxAge('');
        setAnimalColor('');
        setAnimalCageNumber('');
        setAnimalSuccess('');
      }, 700);
    } catch (err) {
      setAnimalError(err.message || 'Failed to register animal');
    } finally {
      setAnimalSubmitting(false);
    }
  };

  const handleToggleAnimalStatus = async (animal, newStatus) => {
    try {
      await updateAnimal(animal._id, { status: newStatus });
      setAnimalsList((prev) =>
        prev.map((a) => (a._id === animal._id ? { ...a, status: newStatus } : a))
      );
      if (selectedAnimalForModal && selectedAnimalForModal._id === animal._id) {
        setSelectedAnimalForModal((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update animal status:', err.message);
    }
  };

  const handleDeleteAnimal = async (animal) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${animal.name || 'animal'} (${
          animal.animalId
        }) from the active registry?`
      )
    ) {
      return;
    }
    try {
      await deleteAnimal(animal._id);
      setAnimalsList((prev) => prev.filter((a) => a._id !== animal._id));
      if (selectedAnimalForModal && selectedAnimalForModal._id === animal._id) {
        setShowAnimalDetailsModal(false);
        setSelectedAnimalForModal(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete animal');
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
        setSubTab={setSubTab}
      />

      {/* Main Container Below Navbar */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setSubTab={setSubTab}
          handleLogout={handleLogout}
          loadUsers={loadUsers}
          loadShelters={loadShelters}
          loadAnimals={loadAnimals}
          loadCategories={loadCategories}
          loadShelterApplications={loadShelterApplications}
        />

        {/* Dashboard Panels */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 space-y-6">
          {/* Dashboard Title & Top Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                {subTab === 'My Profile'
                  ? 'Administrator Profile'
                  : subTab === 'Manage Shelters' || subTab === 'Shelters'
                  ? 'Manage Shelters'
                  : subTab === 'Manage Animals'
                  ? 'Manage Animals & Categories'
                  : subTab === 'Manage Applications' || subTab === 'Shelter Applications'
                  ? 'Manage Applications'
                  : subTab === 'Manage Users' || subTab === 'User Management'
                  ? 'Manage Users'
                  : subTab === 'Manage Vet'
                  ? 'Manage Veterinary Staff'
                  : subTab === 'Manage Rescue Teams'
                  ? 'Manage Rescue Teams'
                  : subTab === 'Manage Volunteers'
                  ? 'Manage Volunteers'
                  : subTab === 'Rescue & Shelter Map' || activeTab === 'Rescue & Shelter Map'
                  ? 'Rescue Teams & Shelters Directory'
                  : subTab === 'AI Module'
                  ? 'AI Module'
                  : subTab === 'Smart Collar'
                  ? 'Smart Collar'
                  : 'Admin Dashboard'}
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                {subTab === 'My Profile'
                  ? 'System administrator credentials and platform superuser settings'
                  : subTab === 'Manage Shelters' || subTab === 'Shelters'
                  ? 'Manage registered partner shelters, monitor cage occupancy, and assign unique IDs (SH-0001, SH-0002...)'
                  : subTab === 'Manage Animals'
                  ? 'View registered rescue animals and configure animal category classifications'
                  : subTab === 'Manage Applications' || subTab === 'Shelter Applications'
                  ? 'Review, verify, and approve registration applications for Shelters, Veterinary Staff, Rescue Teams, and Volunteers'
                  : subTab === 'Manage Users' || subTab === 'User Management'
                  ? 'View, search, filter, and manage roles and permissions for all registered platform accounts'
                  : subTab === 'Manage Vet'
                  ? 'Manage registered veterinary surgeons, license verification, clinic affiliations, and emergency duty rosters'
                  : subTab === 'Manage Rescue Teams'
                  ? 'Coordinate active emergency rescue teams, dispatch readiness, vehicle fleet, and operational coverage'
                  : subTab === 'Manage Volunteers'
                  ? 'Manage registered community volunteers, field skills, contributions, and rescue support assignments'
                  : subTab === 'Rescue & Shelter Map' || activeTab === 'Rescue & Shelter Map'
                  ? 'Explore all verified rescue teams, rapid response units, and animal shelter facilities across the network'
                  : subTab === 'AI Module'
                  ? 'Computer vision and deep learning models for animal distress severity assessment and breed classification'
                  : subTab === 'Smart Collar'
                  ? 'Real-time GPS telemetry, biometric vitals monitoring, and geofencing for stray & rescued animals'
                  : 'Platform-wide analytics • Live System Status'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {subTab === 'Manage Animals' || activeTab === 'Manage Animals' ? (
                <>
                  <button
                    onClick={() => {
                      loadAnimals();
                      loadCategories();
                    }}
                    className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <RefreshCw
                      className={`w-4 h-4 text-slate-400 ${
                        animalsLoading || categoriesLoading ? 'animate-spin' : ''
                      }`}
                    />{' '}
                    Refresh
                  </button>
                  <button
                    onClick={handleOpenAddCategoryModal}
                    className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Tag className="w-4 h-4 text-[#237737]" /> + Add Category
                  </button>
                </>
              ) : subTab === 'Manage Shelters' || subTab === 'Shelters' ? (
                <button
                  onClick={loadShelters}
                  className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-4 h-4 text-slate-400" /> Refresh
                </button>
              ) : subTab === 'Manage Applications' || subTab === 'Shelter Applications' ? (
                <button
                  onClick={loadShelterApplications}
                  className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-4 h-4 text-slate-400" /> Refresh
                </button>
              ) : subTab === 'Manage Users' || subTab === 'User Management' ? (
                <button
                  onClick={loadUsers}
                  className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-slate-400 ${usersLoading ? 'animate-spin' : ''}`}
                  />{' '}
                  Refresh
                </button>
              ) : subTab === 'Manage Vet' ||
                subTab === 'Manage Rescue Teams' ||
                subTab === 'Manage Volunteers' ? (
                <button
                  onClick={loadUsers}
                  className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-slate-400 ${usersLoading ? 'animate-spin' : ''}`}
                  />{' '}
                  Refresh
                </button>
              ) : subTab === 'Rescue & Shelter Map' || activeTab === 'Rescue & Shelter Map' ? (
                <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200/80 rounded-xl text-[#237737] text-xs font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#237737] animate-ping" />
                  <span>Live Geospatial Grid</span>
                </div>
              ) : subTab === 'AI Module' || subTab === 'Smart Collar' ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-900 text-xs font-bold">
                  <Construction className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span>Feature in Development</span>
                </div>
              ) : (
                <button className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm">
                  <FileText className="w-4 h-4 text-slate-400" /> Export Report
                </button>
              )}
            </div>
          </div>

          {/* Tab Views */}
          {subTab === 'Overview' && (
            <Dashboard
              userStats={userStats}
              usersList={usersList}
              shelterApplications={shelterApplications}
              sheltersList={sheltersList}
              animalsList={animalsList}
              animalCategories={animalCategories}
              setSubTab={setSubTab}
              setActiveTab={setActiveTab}
            />
          )}

          {(subTab === 'Manage Users' || subTab === 'User Management') && (
            <ManageUsers
              usersList={usersList}
              usersLoading={usersLoading}
              usersError={usersError}
              loadUsers={loadUsers}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              userActionLoading={userActionLoading}
              handleToggleStatus={handleToggleStatus}
              handleUpdateRole={handleUpdateRole}
              handleDeleteUser={handleDeleteUser}
              setSelectedUserForModal={setSelectedUserForModal}
              setShowUserDetailsModal={setShowUserDetailsModal}
              onOpenAddUserModal={() => setShowAddUserModal(true)}
            />
          )}

          {(subTab === 'Manage Shelters' || subTab === 'Shelters') && (
            <ManageShelters
              sheltersList={sheltersList}
              sheltersLoading={sheltersLoading}
              shelterSearchQuery={shelterSearchQuery}
              setShelterSearchQuery={setShelterSearchQuery}
              shelterFilterStatus={shelterFilterStatus}
              setShelterFilterStatus={setShelterFilterStatus}
              shelterActionLoading={shelterActionLoading}
              handleUpdateShelterCurrentStatus={handleUpdateShelterCurrentStatus}
              handleToggleShelterStatus={handleToggleShelterStatus}
              setSelectedShelterForModal={setSelectedShelterForModal}
              setShowShelterDetailsModal={setShowShelterDetailsModal}
              onOpenMap={() => {
                setActiveTab('Rescue & Shelter Map');
                setSubTab('Rescue & Shelter Map');
              }}
            />
          )}

          {(subTab === 'Manage Applications' || subTab === 'Shelter Applications') && (
            <ManageApplications
              shelterApplications={shelterApplications}
              vetApplications={vetApplications}
              rescueTeamApplications={rescueTeamApplications}
              volunteerApplications={volunteerApplications}
              shelterAppsLoading={shelterAppsLoading}
              shelterAppSearchQuery={shelterAppSearchQuery}
              setShelterAppSearchQuery={setShelterAppSearchQuery}
              applicationsCategoryTab={applicationsCategoryTab}
              setApplicationsCategoryTab={setApplicationsCategoryTab}
              shelterAppFilterStatus={shelterAppFilterStatus}
              setShelterAppFilterStatus={setShelterAppFilterStatus}
              shelterReviewing={shelterReviewing}
              handleOpenScheduleSiteVisit={handleOpenScheduleSiteVisit}
              handleOpenReportModal={handleOpenReportModal}
              handleOpenScheduleTeamVisit={handleOpenScheduleTeamVisit}
              handleOpenTeamReportModal={handleOpenTeamReportModal}
              handleOpenScheduleVolunteerVisit={handleOpenScheduleVolunteerVisit}
              handleOpenVolunteerReportModal={handleOpenVolunteerReportModal}
              handleReviewApplication={handleReviewApplication}
              handleReviewVetApp={handleReviewVetApp}
              handleReviewRescueApp={handleReviewRescueApp}
              handleReviewVolunteerApp={handleReviewVolunteerApp}
              setSelectedApplicationForModal={setSelectedApplicationForModal}
              setShowApplicationDetailsModal={setShowApplicationDetailsModal}
            />
          )}

          {subTab === 'Manage Vet' && (
            <ManageVet
              usersList={usersList}
              vetSearchQuery={vetSearchQuery}
              setVetSearchQuery={setVetSearchQuery}
              vetStatusFilter={vetStatusFilter}
              setVetStatusFilter={setVetStatusFilter}
              handleToggleStatus={handleToggleStatus}
              setSelectedUserForModal={setSelectedUserForModal}
              setShowUserDetailsModal={setShowUserDetailsModal}
            />
          )}

          {subTab === 'Manage Rescue Teams' && (
            <ManageRescueTeams
              usersList={usersList}
              rescueSearchQuery={rescueSearchQuery}
              setRescueSearchQuery={setRescueSearchQuery}
              rescueStatusFilter={rescueStatusFilter}
              setRescueStatusFilter={setRescueStatusFilter}
              handleToggleStatus={handleToggleStatus}
              setSelectedUserForModal={setSelectedUserForModal}
              setShowUserDetailsModal={setShowUserDetailsModal}
              onOpenMap={() => {
                setActiveTab('Rescue & Shelter Map');
                setSubTab('Rescue & Shelter Map');
              }}
            />
          )}

          {subTab === 'Manage Volunteers' && (
            <ManageVolunteers
              usersList={usersList}
              volunteerSearchQuery={volunteerSearchQuery}
              setVolunteerSearchQuery={setVolunteerSearchQuery}
              volunteerStatusFilter={volunteerStatusFilter}
              setVolunteerStatusFilter={setVolunteerStatusFilter}
              handleToggleStatus={handleToggleStatus}
              setSelectedUserForModal={setSelectedUserForModal}
              setShowUserDetailsModal={setShowUserDetailsModal}
            />
          )}

          {(subTab === 'Manage Animals' || activeTab === 'Manage Animals') && (
            <ManageAnimals
              animalsList={animalsList}
              animalsLoading={animalsLoading}
              animalCategories={animalCategories}
              categoriesLoading={categoriesLoading}
              animalActiveSubView={animalActiveSubView}
              setAnimalActiveSubView={setAnimalActiveSubView}
              categorySearchQuery={categorySearchQuery}
              setCategorySearchQuery={setCategorySearchQuery}
              categoryStatusFilter={categoryStatusFilter}
              setCategoryStatusFilter={setCategoryStatusFilter}
              animalSearchQuery={animalSearchQuery}
              setAnimalSearchQuery={setAnimalSearchQuery}
              animalSpeciesFilter={animalSpeciesFilter}
              setAnimalSpeciesFilter={setAnimalSpeciesFilter}
              animalStatusFilter={animalStatusFilter}
              setAnimalStatusFilter={setAnimalStatusFilter}
              handleOpenAddCategoryModal={handleOpenAddCategoryModal}
              handleOpenEditCategoryModal={handleOpenEditCategoryModal}
              handleToggleCategoryStatus={handleToggleCategoryStatus}
              handleOpenAddAnimalModal={handleOpenAddAnimalModal}
              handleToggleAnimalStatus={handleToggleAnimalStatus}
              handleDeleteAnimal={handleDeleteAnimal}
              setSelectedAnimalForModal={setSelectedAnimalForModal}
              setShowAnimalDetailsModal={setShowAnimalDetailsModal}
            />
          )}

          {subTab === 'AI Module' && (
            <AIModule
              onBackToOverview={() => {
                setActiveTab('Admin Dashboard');
                setSubTab('Overview');
              }}
            />
          )}

          {subTab === 'Smart Collar' && (
            <SmartCollar
              onBackToOverview={() => {
                setActiveTab('Admin Dashboard');
                setSubTab('Overview');
              }}
            />
          )}

          {(subTab === 'Rescue & Shelter Map' || activeTab === 'Rescue & Shelter Map') && (
            <RescueShelterMap showHeader={false} />
          )}

          {(subTab === 'My Profile' || activeTab === 'My Profile') && <Profile user={user} />}
        </main>
      </div>

      {/* Modals */}
      <UserDetailsModal
        isOpen={showUserDetailsModal}
        user={selectedUserForModal}
        onClose={() => {
          setShowUserDetailsModal(false);
          setSelectedUserForModal(null);
        }}
        handleUpdateRole={handleUpdateRole}
        handleToggleStatus={handleToggleStatus}
      />

      <AddUserModal
        isOpen={showAddUserModal}
        sheltersList={sheltersList}
        addUserSubmitting={addUserSubmitting}
        addUserError={addUserError}
        addUserSuccess={addUserSuccess}
        handleCreateUser={handleCreateUser}
        onClose={() => {
          setShowAddUserModal(false);
          setAddUserError('');
          setAddUserSuccess('');
        }}
      />

      <CategoryModal
        isOpen={showCategoryModal}
        editingCategory={editingCategory}
        categoryName={categoryName}
        setCategoryName={setCategoryName}
        categoryDescription={categoryDescription}
        setCategoryDescription={setCategoryDescription}
        categorySubmitting={categorySubmitting}
        categoryError={categoryError}
        categorySuccess={categorySuccess}
        handleSaveCategory={handleSaveCategory}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
          setCategoryError('');
          setCategorySuccess('');
        }}
      />

      <AddAnimalModal
        isOpen={showAddAnimalModal}
        animalName={animalName}
        setAnimalName={setAnimalName}
        animalSpecies={animalSpecies}
        setAnimalSpecies={setAnimalSpecies}
        animalBreed={animalBreed}
        setAnimalBreed={setAnimalBreed}
        animalGender={animalGender}
        setAnimalGender={setAnimalGender}
        animalApproxAge={animalApproxAge}
        setAnimalApproxAge={setAnimalApproxAge}
        animalColor={animalColor}
        setAnimalColor={setAnimalColor}
        animalCageNumber={animalCageNumber}
        setAnimalCageNumber={setAnimalCageNumber}
        animalHealthCondition={animalHealthCondition}
        setAnimalHealthCondition={setAnimalHealthCondition}
        animalStatus={animalStatus}
        setAnimalStatus={setAnimalStatus}
        animalShelterName={animalShelterName}
        setAnimalShelterName={setAnimalShelterName}
        animalCategories={animalCategories}
        animalSubmitting={animalSubmitting}
        animalError={animalError}
        animalSuccess={animalSuccess}
        handleSaveAnimal={handleSaveAnimal}
        onClose={() => {
          setShowAddAnimalModal(false);
          setAnimalError('');
          setAnimalSuccess('');
        }}
      />

      <AnimalDetailsModal
        isOpen={showAnimalDetailsModal}
        animal={selectedAnimalForModal}
        onClose={() => {
          setShowAnimalDetailsModal(false);
          setSelectedAnimalForModal(null);
        }}
      />

      <ShelterDetailsModal
        isOpen={showShelterDetailsModal}
        shelter={selectedShelterForModal}
        onClose={() => {
          setShowShelterDetailsModal(false);
          setSelectedShelterForModal(null);
        }}
        handleToggleShelterStatus={handleToggleShelterStatus}
        shelterActionLoading={shelterActionLoading}
      />

      <ApplicationDetailsModal
        isOpen={showApplicationDetailsModal}
        application={selectedApplicationForModal}
        onClose={() => {
          setShowApplicationDetailsModal(false);
          setSelectedApplicationForModal(null);
        }}
        handleOpenScheduleSiteVisit={handleOpenScheduleSiteVisit}
        handleOpenReportModal={handleOpenReportModal}
        handleOpenScheduleTeamVisit={handleOpenScheduleTeamVisit}
        handleOpenTeamReportModal={handleOpenTeamReportModal}
        handleOpenScheduleVolunteerVisit={handleOpenScheduleVolunteerVisit}
        handleOpenVolunteerReportModal={handleOpenVolunteerReportModal}
        handleReviewApplication={handleReviewApplication}
        handleReviewVetApp={handleReviewVetApp}
        handleReviewRescueApp={handleReviewRescueApp}
        handleReviewVolunteerApp={handleReviewVolunteerApp}
      />

      <SiteVisitModal
        isOpen={showSiteVisitModal}
        application={selectedAppForSiteVisit}
        onClose={() => {
          setShowSiteVisitModal(false);
          setSelectedAppForSiteVisit(null);
        }}
        siteVisitDate={siteVisitDate}
        setSiteVisitDate={setSiteVisitDate}
        siteVisitValuationPeriod={siteVisitValuationPeriod}
        setSiteVisitValuationPeriod={setSiteVisitValuationPeriod}
        siteVisitInspector={siteVisitInspector}
        setSiteVisitInspector={setSiteVisitInspector}
        siteVisitNotes={siteVisitNotes}
        setSiteVisitNotes={setSiteVisitNotes}
        siteVisitSubmitting={siteVisitSubmitting}
        handleConfirmScheduleSiteVisit={handleConfirmScheduleSiteVisit}
      />

      <SiteVisitReportModal
        isOpen={showReportModal}
        application={selectedAppForReport}
        onClose={() => {
          setShowReportModal(false);
          setSelectedAppForReport(null);
        }}
        siteVisitReportText={siteVisitReportText}
        setSiteVisitReportText={setSiteVisitReportText}
        reportDecision={reportDecision}
        setReportDecision={setReportDecision}
        reportSubmitting={reportSubmitting}
        handleSubmitSiteVisitReport={handleSubmitSiteVisitReport}
      />

      <TeamVisitModal
        isOpen={showTeamVisitModal}
        application={selectedRescueAppForVisit}
        onClose={() => {
          setShowTeamVisitModal(false);
          setSelectedRescueAppForVisit(null);
        }}
        teamVisitDate={teamVisitDate}
        setTeamVisitDate={setTeamVisitDate}
        teamVisitValuationPeriod={teamVisitValuationPeriod}
        setTeamVisitValuationPeriod={setTeamVisitValuationPeriod}
        teamVisitInspector={teamVisitInspector}
        setTeamVisitInspector={setTeamVisitInspector}
        teamVisitNotes={teamVisitNotes}
        setTeamVisitNotes={setTeamVisitNotes}
        teamVisitSubmitting={teamVisitSubmitting}
        handleConfirmScheduleTeamVisit={handleConfirmScheduleTeamVisit}
      />

      <TeamVisitReportModal
        isOpen={showTeamReportModal}
        application={selectedRescueAppForReport}
        onClose={() => {
          setShowTeamReportModal(false);
          setSelectedRescueAppForReport(null);
        }}
        teamVisitReportText={teamVisitReportText}
        setTeamVisitReportText={setTeamVisitReportText}
        teamReportDecision={teamReportDecision}
        setTeamReportDecision={setTeamReportDecision}
        teamReportChecks={teamReportChecks}
        setTeamReportChecks={setTeamReportChecks}
        reportSubmitting={teamReportSubmitting}
        handleSubmitTeamVisitReport={handleSubmitTeamReport}
      />

      <VolunteerVisitModal
        isOpen={showVolunteerVisitModal}
        application={selectedVolunteerAppForVisit}
        onClose={() => {
          setShowVolunteerVisitModal(false);
          setSelectedVolunteerAppForVisit(null);
        }}
        volunteerVisitDate={volunteerVisitDate}
        setVolunteerVisitDate={setVolunteerVisitDate}
        volunteerVisitValuationPeriod={volunteerVisitValuationPeriod}
        setVolunteerVisitValuationPeriod={setVolunteerVisitValuationPeriod}
        volunteerVisitCoordinator={volunteerVisitCoordinator}
        setVolunteerVisitCoordinator={setVolunteerVisitCoordinator}
        volunteerVisitNotes={volunteerVisitNotes}
        setVolunteerVisitNotes={setVolunteerVisitNotes}
        volunteerVisitSubmitting={volunteerVisitSubmitting}
        handleConfirmScheduleVolunteerVisit={handleConfirmScheduleVolunteerVisit}
      />

      <VolunteerVisitReportModal
        isOpen={showVolunteerReportModal}
        application={selectedVolunteerAppForReport}
        onClose={() => {
          setShowVolunteerReportModal(false);
          setSelectedVolunteerAppForReport(null);
        }}
        volunteerVisitReportText={volunteerVisitReportText}
        setVolunteerVisitReportText={setVolunteerVisitReportText}
        volunteerReportDecision={volunteerReportDecision}
        setVolunteerReportDecision={setVolunteerReportDecision}
        volunteerReportChecks={volunteerReportChecks}
        setVolunteerReportChecks={setVolunteerReportChecks}
        reportSubmitting={volunteerReportSubmitting}
        handleSubmitVolunteerVisitReport={handleSubmitVolunteerVisitReport}
      />
    </div>
  );
};

export default AdminDashboard;
