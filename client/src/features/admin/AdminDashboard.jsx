import React, { useState, useEffect } from 'react';
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
  Settings,
  CheckCircle,
  XCircle,
  ClipboardList,
  AlertCircle,
  Navigation,
  Trash2,
  RefreshCw,
  Mail,
  Eye,
  ShieldCheck,
  Lock,
  Check,
  SlidersHorizontal as FilterIcon,
  UserPlus,
  Stethoscope,
  Truck,
  HeartHandshake,
  Activity,
  Award,
  Briefcase,
  Radio,
  Sparkles,
  Construction,
  Wifi,
  Zap,
  Dog,
  Tag,
  Edit2,
  Layers,
} from 'lucide-react';
import { getAllApplications, reviewApplication } from '../../services/shelterApplicationService';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
  const [applicationsCategoryTab, setApplicationsCategoryTab] = useState('Shelter'); // 'Shelter' | 'Vet' | 'Rescue' | 'Volunteer'
  const [shelterApplications, setShelterApplications] = useState([]);
  const [shelterAppsLoading, setShelterAppsLoading] = useState(false);
  const [shelterAppsLoaded, setShelterAppsLoaded] = useState(false);
  const [shelterReviewNote, setShelterReviewNote] = useState({});
  const [shelterReviewing, setShelterReviewing] = useState({});
  const [shelterAppSearchQuery, setShelterAppSearchQuery] = useState('');
  const [shelterAppFilterStatus, setShelterAppFilterStatus] = useState('All');

  // Vet Applications List
  const [vetApplications, setVetApplications] = useState([
    {
      id: 'VA-001',
      applicantName: 'Dr. Arjun Menon',
      email: 'dr.arjun.vet@gmail.com',
      phone: '9847123456',
      clinicName: 'PetCare Multi-Speciality Clinic',
      qualification: 'B.V.Sc & A.H, M.V.Sc (Surgery)',
      registrationNumber: 'KVC-2024-8819',
      experienceYears: 7,
      city: 'Ernakulam',
      status: 'Pending',
      submittedAt: '2026-08-15',
    },
    {
      id: 'VA-002',
      applicantName: 'Dr. Ananya Sharma',
      email: 'ananya.sharma.vets@yahoo.com',
      phone: '9446012345',
      clinicName: 'Govt. Veterinary Hospital, Palai',
      qualification: 'B.V.Sc & A.H',
      registrationNumber: 'VCI-2022-4512',
      experienceYears: 4,
      city: 'Kottayam',
      status: 'Approved',
      submittedAt: '2026-08-12',
    },
  ]);

  // Rescue Team Applications List
  const [rescueTeamApplications, setRescueTeamApplications] = useState([
    {
      id: 'RA-001',
      teamName: 'Rapid Paws Rescue Squad',
      teamLead: 'Rahul Varma',
      email: 'rapidpaws.kerala@gmail.com',
      phone: '9745123980',
      coverageZone: 'Kottayam & Idukki Districts',
      vehicleFleet: '1 Animal Ambulance (KL-05-AB-4512), 2 Rapid Utility Bikes',
      memberCount: 8,
      status: 'Pending',
      submittedAt: '2026-08-16',
    },
    {
      id: 'RA-002',
      teamName: 'Cochin Wildlife Emergency Taskforce',
      teamLead: 'Sandra Mathew',
      email: 'wildlife.cochin@resqnet.org',
      phone: '9846098712',
      coverageZone: 'Ernakulam Coastal & Suburban',
      vehicleFleet: '2 Specialized 4x4 Rescue Vans',
      memberCount: 12,
      status: 'Approved',
      submittedAt: '2026-08-10',
    },
  ]);

  // Volunteer Applications List
  const [volunteerApplications, setVolunteerApplications] = useState([
    {
      id: 'VOL-001',
      volunteerName: 'Gopika Krishnan',
      email: 'gopika.k98@gmail.com',
      phone: '9847654321',
      interests: ['Field Rescue', 'Foster Care', 'Adoption Drives'],
      availability: 'Weekends & On-Call Evenings',
      city: 'Thiruvananthapuram',
      status: 'Pending',
      submittedAt: '2026-08-16',
    },
    {
      id: 'VOL-002',
      volunteerName: 'Mathew Thomas',
      email: 'mathew.t.volunteer@gmail.com',
      phone: '9447120987',
      interests: ['Emergency Transport', 'Shelter Caretaker Support'],
      availability: 'Full Time Volunteer',
      city: 'Kottayam',
      status: 'Approved',
      submittedAt: '2026-08-11',
    },
  ]);

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
  const [showAddShelterModal, setShowAddShelterModal] = useState(false);
  const [shelterSubmitting, setShelterSubmitting] = useState(false);
  const [shelterFormError, setShelterFormError] = useState('');
  const [shelterFormSuccess, setShelterFormSuccess] = useState('');
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

  // Add Shelter Form Fields
  const [addShelterName, setAddShelterName] = useState('');
  const [addShelterEmail, setAddShelterEmail] = useState('');
  const [addShelterPhone, setAddShelterPhone] = useState('');
  const [addLatitude, setAddLatitude] = useState('');
  const [addLongitude, setAddLongitude] = useState('');
  const [addTotalStaffs, setAddTotalStaffs] = useState('');
  const [addTotalCages, setAddTotalCages] = useState('');
  const [addOccupiedCages, setAddOccupiedCages] = useState('0');
  const [addStatus, setAddStatus] = useState('OPEN');
  const [addUserId, setAddUserId] = useState('');
  const [addLocating, setAddLocating] = useState(false);

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

  const handleReviewApplication = async (id, status) => {
    setShelterReviewing(prev => ({ ...prev, [id]: true }));
    try {
      const res = await reviewApplication(id, status, shelterReviewNote[id] || '');
      if (res.success) {
        setShelterApplications(prev =>
          prev.map(app => app._id === id ? res.application : app)
        );
        if (sheltersLoaded) {
          loadShelters();
        }
      }
    } catch (e) {
      console.error('Review failed:', e.message);
    } finally {
      setShelterReviewing(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleOpenScheduleSiteVisit = (app) => {
    setSelectedAppForSiteVisit(app);
    setSiteVisitDate(
      app.siteVisitScheduleDate
        ? new Date(app.siteVisitScheduleDate).toISOString().slice(0, 10)
        : new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)
    );
    setSiteVisitValuationPeriod(app.siteVisitValuationPeriod || '10:00 AM - 2:00 PM (Evaluation Window)');
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
        }. Premises inspected for cage cleanliness, water/food supply, animal safety, and staff readiness. Verified ${app.occupiedCages || 0}/${app.totalCages || 0} cages and ${app.totalStaffs || 0} staff members.`
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

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setShelterFormError('Geolocation is not supported by your browser.');
      return;
    }
    setAddLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAddLatitude(pos.coords.latitude.toFixed(6));
        setAddLongitude(pos.coords.longitude.toFixed(6));
        setAddLocating(false);
      },
      () => {
        setShelterFormError('Unable to retrieve location. Please enter coordinates manually.');
        setAddLocating(false);
      }
    );
  };

  const handleAddShelter = async (e) => {
    e.preventDefault();
    setShelterFormError('');
    setShelterFormSuccess('');
    setShelterSubmitting(true);

    try {
      const payload = {
        shelterName: addShelterName.trim(),
        shelterEmail: addShelterEmail.trim(),
        shelterPhoneNumber: Number(addShelterPhone),
        latitude: parseFloat(addLatitude),
        longitude: parseFloat(addLongitude),
        totalStaffs: Number(addTotalStaffs || 0),
        totalCages: Number(addTotalCages || 0),
        occupiedCages: Number(addOccupiedCages || 0),
        status: addStatus,
        userId: addUserId || null,
      };

      const res = await createShelter(payload);
      if (res.success) {
        setShelterFormSuccess(`Shelter ${res.shelter.shelterNumber} created successfully!`);
        setSheltersList(prev => [res.shelter, ...prev]);
        setTimeout(() => {
          setShowAddShelterModal(false);
          setShelterFormSuccess('');
          // Reset form fields
          setAddShelterName('');
          setAddShelterEmail('');
          setAddShelterPhone('');
          setAddLatitude('');
          setAddLongitude('');
          setAddTotalStaffs('');
          setAddTotalCages('');
          setAddOccupiedCages('0');
          setAddStatus('OPEN');
          setAddUserId('');
        }, 1200);
      } else {
        setShelterFormError(res.message || 'Failed to create shelter.');
      }
    } catch (err) {
      setShelterFormError(err?.response?.data?.message || 'Error creating shelter.');
    } finally {
      setShelterSubmitting(false);
    }
  };

  const handleToggleShelterStatus = async (shelter) => {
    const shelterId = shelter._id;
    const currentAccountStatus = shelter.status === 'Inactive' ? 'Inactive' : 'Active';
    const nextStatus = currentAccountStatus === 'Active' ? 'Inactive' : 'Active';
    setShelterActionLoading(prev => ({ ...prev, [shelterId]: true }));
    try {
      const res = await updateShelter(shelterId, { status: nextStatus });
      if (res.success) {
        setSheltersList(prev =>
          prev.map(s => s._id === shelterId ? { ...s, ...res.shelter, status: nextStatus } : s)
        );
        if (selectedShelterForModal?._id === shelterId) {
          setSelectedShelterForModal(prev => ({ ...prev, ...res.shelter, status: nextStatus }));
        }
      }
    } catch (err) {
      console.error('Toggle shelter status failed:', err.message);
    } finally {
      setShelterActionLoading(prev => ({ ...prev, [shelterId]: false }));
    }
  };

  const handleUpdateShelterCurrentStatus = async (shelterId, newCurrentStatus) => {
    try {
      const res = await updateShelter(shelterId, { currentStatus: newCurrentStatus });
      if (res.success) {
        setSheltersList(prev =>
          prev.map(s => s._id === shelterId ? { ...s, ...res.shelter, currentStatus: newCurrentStatus } : s)
        );
        if (selectedShelterForModal?._id === shelterId) {
          setSelectedShelterForModal(prev => ({ ...prev, ...res.shelter, currentStatus: newCurrentStatus }));
        }
      }
    } catch (err) {
      console.error('Update shelter currentStatus failed:', err.message);
    }
  };

  const handleDeleteShelter = async (shelterId) => {
    if (!window.confirm('Are you sure you want to deactivate this shelter? The record will be safely archived (Soft Deleted).')) return;
    try {
      const res = await deleteShelter(shelterId);
      if (res.success) {
        setSheltersList(prev => prev.filter(s => s._id !== shelterId));
      }
    } catch (err) {
      console.error('Delete shelter failed:', err.message);
    }
  };

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

  // Load data on mount
  useEffect(() => {
    loadUsers();
    loadShelterApplications();
    loadShelters();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getFirstName = () => {
    if (!user?.fullName) return 'Admin';
    return user.fullName.split(' ')[0];
  };

  // Add user handler (connected to MongoDB)
  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddUserError('');
    setAddUserSuccess('');
    setAddUserSubmitting(true);

    try {
      const payload = {
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
        setAddUserSuccess(`User ${res.user.fullName} created successfully!`);
        setUsersList((prev) => [res.user, ...prev]);
        setUserStats((prev) => ({
          ...prev,
          totalUsers: prev.totalUsers + 1,
          activeUsers: res.user.status === 'Active' ? prev.activeUsers + 1 : prev.activeUsers,
        }));

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
      } else {
        setAddUserError(res.message || 'Failed to create user.');
      }
    } catch (err) {
      setAddUserError(err?.response?.data?.message || 'Error creating user account.');
    } finally {
      setAddUserSubmitting(false);
    }
  };

  // Toggle user status handler (calls backend API)
  const handleToggleStatus = async (targetUser) => {
    const userId = targetUser._id || targetUser.id;
    const newStatus = targetUser.status === 'Active' ? 'Suspended' : 'Active';

    setUserActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await updateUserStatus(userId, newStatus);
      if (res.success) {
        setUsersList((prev) =>
          prev.map((u) => ((u._id || u.id) === userId ? { ...u, status: newStatus } : u))
        );
        if (selectedUserForModal && (selectedUserForModal._id || selectedUserForModal.id) === userId) {
          setSelectedUserForModal((prev) => ({ ...prev, status: newStatus }));
        }
        setUserStats((prev) => ({
          ...prev,
          activeUsers: newStatus === 'Active' ? prev.activeUsers + 1 : Math.max(0, prev.activeUsers - 1),
          suspendedUsers: newStatus === 'Suspended' ? prev.suspendedUsers + 1 : Math.max(0, prev.suspendedUsers - 1),
        }));
      }
    } catch (err) {
      console.error('Failed to update user status:', err.message);
      alert(err?.response?.data?.message || 'Failed to update user status');
    } finally {
      setUserActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Role update handler
  const handleUpdateRole = async (userId, newRole) => {
    setUserActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await updateUserRole(userId, newRole);
      if (res.success) {
        setUsersList((prev) =>
          prev.map((u) => ((u._id || u.id) === userId ? { ...u, role: newRole } : u))
        );
        if (selectedUserForModal && (selectedUserForModal._id || selectedUserForModal.id) === userId) {
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

  // Delete user handler (Soft delete)
  const handleDeleteUser = async (targetUser) => {
    const userId = targetUser._id || targetUser.id;
    const userName = targetUser.fullName || targetUser.name;

    if (!window.confirm(`Are you sure you want to deactivate and remove user "${userName}"? Note: The record and audit logs will be safely archived (Soft Deleted).`)) {
      return;
    }

    setUserActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await deleteUser(userId);
      if (res.success) {
        setUsersList((prev) => prev.filter((u) => (u._id || u.id) !== userId));
        if (selectedUserForModal && (selectedUserForModal._id || selectedUserForModal.id) === userId) {
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

  const handleReviewVetApp = (id, newStatus) => {
    setVetApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
  };

  const handleReviewRescueApp = (id, newStatus) => {
    setRescueTeamApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
  };

  const handleReviewVolunteerApp = (id, newStatus) => {
    setVolunteerApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
  };

  // ─────────────────────────────────────────────
  // Animal & Category Handlers
  // ─────────────────────────────────────────────
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
    loadCategories();
    loadAnimals();
  }, []);

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
    if (!window.confirm(`Are you sure you want to delete category "${cat.categoryName}" (${cat.categoryId})?`)) {
      return;
    }
    try {
      await deleteCategory(cat._id);
      setAnimalCategories((prev) => prev.filter((c) => c._id !== cat._id));
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

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
    if (!window.confirm(`Are you sure you want to remove ${animal.name || 'animal'} (${animal.animalId}) from the active registry?`)) {
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
              placeholder="Search across dashboard..."
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
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                  <span className="text-sm font-extrabold text-slate-900">Admin Notifications</span>
                  <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"><X className="w-4 h-4" /></button>
                </div>
                <div className="divide-y divide-slate-50">
                  {[
                    { text: 'New Shelter registration application pending review', time: '5 min ago' },
                    { text: 'System backup completed successfully (MongoDB)', time: '2h ago' },
                    { text: 'User account status audit verified', time: '1d ago' },
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
            onOpenProfile={() => {
              setActiveTab('My Profile');
              setSubTab('My Profile');
            }}
            unreadCount={2}
            onOpenNotifications={() => setNotifOpen(!notifOpen)}
            customRole="Admin"
          />
        </div>
      </header>

      {/* Main Container Below Navbar */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Panel (below navbar) */}
        <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between h-full z-20 overflow-y-auto shrink-0">
          <nav className="p-4 space-y-1.5">
            {[
              { name: 'Admin Dashboard', icon: TrendingUp },
              { name: 'Manage Users', icon: Users },
              { name: 'Manage Shelters', icon: Building2 },
              { name: 'Manage Animals', icon: Dog },
              {
                name: 'Manage Applications',
                icon: ClipboardList
              },
              { name: 'Manage Vet', icon: Stethoscope },
              { name: 'Manage Rescue Teams', icon: Truck },
              { name: 'Manage Volunteers', icon: HeartHandshake },
              { name: 'AI Module', icon: Cpu },
              { name: 'Smart Collar', icon: Tv },
            ].map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.name);
                    if (item.name === 'Admin Dashboard') {
                      setSubTab('Overview');
                    } else {
                      setSubTab(item.name);
                    }
                    if (
                      item.name === 'Manage Users' ||
                      item.name === 'Manage Vet' ||
                      item.name === 'Manage Rescue Teams' ||
                      item.name === 'Manage Volunteers'
                    ) {
                      loadUsers();
                    } else if (item.name === 'Manage Shelters') {
                      loadShelters();
                    } else if (item.name === 'Manage Animals') {
                      loadAnimals();
                      loadCategories();
                    } else if (item.name === 'Manage Applications') {
                      loadShelterApplications();
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
                    <span>{item.name}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
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
          
          {/* Dashboard Title & Top Buttons */}
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
                  : subTab === 'AI Module'
                  ? 'Computer vision and deep learning models for animal distress severity assessment and breed classification'
                  : subTab === 'Smart Collar'
                  ? 'Real-time GPS telemetry, biometric vitals monitoring, and geofencing for stray & rescued animals'
                  : 'Platform-wide analytics • August 2026'}
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
                    <RefreshCw className={`w-4 h-4 text-slate-400 ${animalsLoading || categoriesLoading ? 'animate-spin' : ''}`} /> Refresh
                  </button>
                  <button
                    onClick={handleOpenAddCategoryModal}
                    className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Tag className="w-4 h-4 text-[#237737]" /> + Add Category
                  </button>
                </>
              ) : subTab === 'Manage Shelters' || subTab === 'Shelters' ? (
                <>
                  <button
                    onClick={loadShelters}
                    className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-400" /> Refresh
                  </button>
                </>
              ) : subTab === 'Manage Applications' || subTab === 'Shelter Applications' ? (
                <button
                  onClick={loadShelterApplications}
                  className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-4 h-4 text-slate-400" /> Refresh
                </button>
              ) : subTab === 'Manage Users' || subTab === 'User Management' ? (
                <>
                  <button
                    onClick={loadUsers}
                    className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <RefreshCw className={`w-4 h-4 text-slate-400 ${usersLoading ? 'animate-spin' : ''}`} /> Refresh
                  </button>
                </>
              ) : subTab === 'Manage Vet' ? (
                <>
                  <button
                    onClick={loadUsers}
                    className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <RefreshCw className={`w-4 h-4 text-slate-400 ${usersLoading ? 'animate-spin' : ''}`} /> Refresh
                  </button>
                </>
              ) : subTab === 'Manage Rescue Teams' ? (
                <>
                  <button
                    onClick={loadUsers}
                    className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <RefreshCw className={`w-4 h-4 text-slate-400 ${usersLoading ? 'animate-spin' : ''}`} /> Refresh
                  </button>
                </>
              ) : subTab === 'Manage Volunteers' ? (
                <>
                  <button
                    onClick={loadUsers}
                    className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <RefreshCw className={`w-4 h-4 text-slate-400 ${usersLoading ? 'animate-spin' : ''}`} /> Refresh
                  </button>
                </>
              ) : subTab === 'AI Module' || subTab === 'Smart Collar' ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-900 text-xs font-bold">
                  <Construction className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span>Feature in Development</span>
                </div>
              ) : (
                <>
                  <button className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm">
                    <FileText className="w-4 h-4 text-slate-400" /> Export Report
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Metric Cards Row (Overview) */}
          {subTab === 'Overview' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Metric 1 - Real User Count */}
              <div className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Users</div>
                  <div className="text-2xl font-black text-slate-900 mt-0.5">
                    {userStats.totalUsers > 0 ? userStats.totalUsers.toLocaleString() : usersList.length.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center mt-1">
                    {userStats.signupsThisMonth > 0
                      ? `↑ ${userStats.signupsThisMonth} new this month`
                      : `${userStats.activeUsers || usersList.filter(u => u.status === 'Active').length} active registered`}
                  </span>
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
          )}

          {/* Sub-Tab 1: Overview Dashboard Content */}
          {subTab === 'Overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Analytics Card */}
              <div className="lg:col-span-2 bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Monthly Rescues & Outcomes</h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Jan - Aug 2026 volume trend</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#237737]" /> Rescued
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" /> Adopted
                    </span>
                  </div>
                </div>

                {/* Minimalist Bar Chart Representation */}
                <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2">
                  {[
                    { month: 'Jan', rescues: 65, adoptions: 40 },
                    { month: 'Feb', rescues: 75, adoptions: 48 },
                    { month: 'Mar', rescues: 85, adoptions: 55 },
                    { month: 'Apr', rescues: 70, adoptions: 50 },
                    { month: 'May', rescues: 90, adoptions: 68 },
                    { month: 'Jun', rescues: 100, adoptions: 75 },
                    { month: 'Jul', rescues: 110, adoptions: 82 },
                    { month: 'Aug', rescues: 95, adoptions: 70 },
                  ].map((data, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-1.5 h-full">
                        <div 
                          className="w-1/2 bg-[#237737] rounded-t-lg transition-all duration-300 group-hover:bg-[#1d632e]" 
                          style={{ height: `${data.rescues}%` }}
                        />
                        <div 
                          className="w-1/2 bg-emerald-200 rounded-t-lg transition-all duration-300 group-hover:bg-emerald-300" 
                          style={{ height: `${data.adoptions}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">{data.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie Chart Representation */}
              <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Species Breakdown</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Distribution of rescued animals</p>
                </div>

                <div className="flex items-center justify-center py-4">
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22c55e" strokeWidth="4.2" strokeDasharray="48 52" strokeDashoffset="100" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="4.2" strokeDasharray="32 68" strokeDashoffset="52" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f97316" strokeWidth="4.2" strokeDasharray="12 88" strokeDashoffset="20" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#a855f7" strokeWidth="4.2" strokeDasharray="8 92" strokeDashoffset="8" />
                    </svg>
                  </div>
                </div>

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

          {/* Sub-Tab 2: Real User Management Panel */}
          {(subTab === 'Manage Users' || subTab === 'User Management') && (
            <div className="space-y-6">
              
              {/* Summary Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registered</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {usersList.length}
                  </div>
                  <div className="text-[10px] font-bold text-blue-600 mt-0.5">Database Accounts</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Users</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {usersList.filter((u) => u.status === 'Active').length}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
                    {usersList.length > 0
                      ? `${Math.round((usersList.filter((u) => u.status === 'Active').length / usersList.length) * 100)}% of total`
                      : '0%'}
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Users</div>
                  <div className="text-2xl font-black text-[#237737] mt-1">
                    {usersList.filter((u) => u.isEmailVerified || u.isPhoneVerified).length}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                    {usersList.filter((u) => u.isEmailVerified && u.isPhoneVerified).length} dual verified
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suspended / Inactive</div>
                  <div className="text-2xl font-black text-rose-600 mt-1">
                    {usersList.filter((u) => u.status !== 'Active').length}
                  </div>
                  <div className="text-[10px] font-bold text-rose-500 mt-0.5">
                    {usersList.filter((u) => u.status === 'Suspended').length} suspended
                  </div>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-72">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, email, phone, city…"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#237737] text-xs font-semibold transition"
                      />
                      <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    </div>

                    {/* Role Filter */}
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
                    >
                      <option value="All">All Roles</option>
                      <option value="Public User">Public User</option>
                      <option value="Rescue Team">Rescue Team</option>
                      <option value="Shelter">Shelter</option>
                      <option value="Veterinary Staff">Veterinary Staff</option>
                      <option value="Admin">Admin</option>
                    </select>

                    {/* Status Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                      {['All', 'Active', 'Suspended', 'Inactive'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatusFilter(st)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                            statusFilter === st
                              ? 'bg-[#237737] text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          {st === 'All' ? 'All Statuses' : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                    <span className="text-xs text-slate-400 font-extrabold">
                      {
                        usersList.filter((u) => {
                          const query = searchQuery.toLowerCase();
                          const matchesSearch =
                            (u.fullName || u.name || '').toLowerCase().includes(query) ||
                            (u.email || '').toLowerCase().includes(query) ||
                            (u.phoneNumber || '').toLowerCase().includes(query) ||
                            (u.city || '').toLowerCase().includes(query) ||
                            (u.district || '').toLowerCase().includes(query) ||
                            (u.state || '').toLowerCase().includes(query);
                          const matchesRole = roleFilter === 'All' || u.role === roleFilter;
                          const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
                          return matchesSearch && matchesRole && matchesStatus;
                        }).length
                      }{' '}
                      of {usersList.length} users
                    </span>
                  </div>
                </div>

                {/* Error Banner */}
                {usersError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-700 text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{usersError}</span>
                    </div>
                    <button
                      onClick={loadUsers}
                      className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition cursor-pointer"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Loading State */}
                {usersLoading && (
                  <div className="p-12 bg-[#F8FAF9] border border-slate-100 rounded-2xl text-center text-slate-400 text-sm font-semibold animate-pulse flex items-center justify-center gap-2.5">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#237737]" />
                    <span>Loading registered users from database…</span>
                  </div>
                )}

                {/* Empty State */}
                {!usersLoading && usersList.length === 0 && (
                  <div className="bg-[#F8FAF9] border border-slate-100 rounded-3xl p-12 text-center space-y-3">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
                      <Users className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">No Users Registered Yet</h3>
                    <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
                      Registered users will automatically appear here.
                    </p>
                  </div>
                )}

                {/* Users Table */}
                {!usersLoading && usersList.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                          <th className="pb-3.5 pl-4">User Details</th>
                          <th className="pb-3.5">Role</th>
                          <th className="pb-3.5">City / Location</th>
                          <th className="pb-3.5">Status</th>
                          <th className="pb-3.5">Joined</th>
                          <th className="pb-3.5 pr-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                        {usersList
                          .filter((u) => {
                            const query = searchQuery.toLowerCase();
                            const matchesSearch =
                              (u.fullName || u.name || '').toLowerCase().includes(query) ||
                              (u.email || '').toLowerCase().includes(query) ||
                              (u.phoneNumber || '').toLowerCase().includes(query) ||
                              (u.city || '').toLowerCase().includes(query) ||
                              (u.district || '').toLowerCase().includes(query) ||
                              (u.state || '').toLowerCase().includes(query);
                            const matchesRole = roleFilter === 'All' || u.role === roleFilter;
                            const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
                            return matchesSearch && matchesRole && matchesStatus;
                          })
                          .map((u) => {
                            const userId = u._id || u.id;
                            const displayName = u.fullName || u.name || 'Unnamed User';
                            const displayEmail = u.email || 'No email';
                            const displayPhone = u.phoneNumber || 'No phone';
                            const displayLocation =
                              [u.city, u.district, u.state].filter(Boolean).join(', ') ||
                              u.address ||
                              'Not specified';
                            const joinedDate = u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : u.joined || 'Recent';

                            const roleBadgeClass =
                              u.role === 'Admin'
                                ? 'bg-purple-50 text-purple-700 border-purple-200/60'
                                : u.role === 'Rescue Team'
                                ? 'bg-blue-50 text-blue-700 border-blue-200/60'
                                : u.role === 'Shelter' || u.role === 'Shelter Manager'
                                ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                                : u.role === 'Veterinary Staff'
                                ? 'bg-teal-50 text-teal-700 border-teal-200/60'
                                : 'bg-slate-100 text-slate-700 border-slate-200/60';

                            return (
                              <tr key={userId} className="hover:bg-slate-50/70 transition">
                                {/* User Details Column */}
                                <td className="py-4 pl-4">
                                  <div className="flex items-center gap-3">
                                    {u.profilePic ? (
                                      <img
                                        src={
                                          u.profilePic.startsWith('/uploads')
                                            ? `http://localhost:5000${u.profilePic}`
                                            : u.profilePic
                                        }
                                        alt={displayName}
                                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-xl bg-[#237737]/10 text-[#237737] font-black text-sm flex items-center justify-center shrink-0">
                                        {displayName[0]?.toUpperCase() || 'U'}
                                      </div>
                                    )}
                                    <div className="space-y-0.5">
                                      <h4 className="font-extrabold text-slate-900 text-sm">{displayName}</h4>
                                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                                        <span className="flex items-center gap-1">
                                          <Mail className="w-3 h-3 text-slate-400" />
                                          {displayEmail}
                                        </span>
                                      </div>
                                      {displayPhone !== 'No phone' && (
                                        <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                                          <Phone className="w-3 h-3 text-slate-400" />
                                          <span>{displayPhone}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Role Column */}
                                <td className="py-4">
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${roleBadgeClass}`}>
                                    {u.role}
                                  </span>
                                </td>

                                {/* Location Column */}
                                <td className="py-4">
                                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold max-w-xs">
                                    <MapPin className="w-3.5 h-3.5 text-[#237737] shrink-0" />
                                    <span className="truncate">{displayLocation}</span>
                                  </div>
                                </td>

                                {/* Status Column */}
                                <td className="py-4">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                                      u.status === 'Active'
                                        ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                                        : u.status === 'Suspended'
                                        ? 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                                        : 'bg-amber-500/10 text-amber-700 border-amber-200/50'
                                    }`}
                                  >
                                    {u.status || 'Active'}
                                  </span>
                                </td>

                                {/* Joined Column */}
                                <td className="py-4 text-slate-400 text-xs font-semibold whitespace-nowrap">
                                  {joinedDate}
                                </td>

                                {/* Actions Column */}
                                <td className="py-4 pr-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* View Profile */}
                                    <button
                                      onClick={() => {
                                        setSelectedUserForModal(u);
                                        setShowUserDetailsModal(true);
                                      }}
                                      title="View User Details"
                                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition cursor-pointer"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>

                                    {/* Toggle Status */}
                                    <button
                                      onClick={() => handleToggleStatus(u)}
                                      disabled={userActionLoading[userId]}
                                      title={u.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer disabled:opacity-50 ${
                                        u.status === 'Active'
                                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200/50'
                                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200/50'
                                      }`}
                                    >
                                      {userActionLoading[userId] ? (
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      ) : u.status === 'Active' ? (
                                        'Suspend'
                                      ) : (
                                        'Activate'
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Sub-Tab 3: Shelters Management — Table View */}
          {(subTab === 'Manage Shelters' || subTab === 'Shelters') && (
            <div className="space-y-6">
              
              {/* Summary Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Shelters</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{sheltersList.length}</div>
                  <div className="text-[10px] font-bold text-emerald-600 mt-0.5">Registered facilities</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Accounts</div>
                  <div className="text-2xl font-black text-[#237737] mt-1">
                    {sheltersList.filter(s => s.status !== 'Inactive').length}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                    {sheltersList.filter(s => s.status === 'Inactive').length} inactive
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open for Intake</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {sheltersList.filter(s => (s.currentStatus || s.status) === 'OPEN').length}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 mt-0.5">Available for rescue</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full / Maintenance</div>
                  <div className="text-2xl font-black text-amber-600 mt-1">
                    {sheltersList.filter(s => ['FULL', 'UNDER_MAINTENANCE'].includes(s.currentStatus || s.status)).length}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 mt-0.5">Limited capacity</div>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      value={shelterSearchQuery}
                      onChange={(e) => setShelterSearchQuery(e.target.value)}
                      placeholder="Search shelter by name, SH-0001, or email…"
                      className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#237737] transition"
                    />
                    <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1">
                    {['All', 'Active', 'Inactive', 'OPEN', 'FULL', 'UNDER_MAINTENANCE', 'CLOSED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setShelterFilterStatus(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                          shelterFilterStatus === st
                            ? 'bg-[#237737] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {st === 'All' ? 'All Shelters' : st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs font-extrabold text-slate-400">
                  {
                    sheltersList.filter((s) => {
                      const q = shelterSearchQuery.toLowerCase().trim();
                      const matchSearch =
                        !q ||
                        s.shelterName?.toLowerCase().includes(q) ||
                        s.shelterNumber?.toLowerCase().includes(q) ||
                        s.shelterEmail?.toLowerCase().includes(q) ||
                        s.userId?.fullName?.toLowerCase().includes(q);
                      const matchStatus =
                        shelterFilterStatus === 'All' ||
                        s.status === shelterFilterStatus ||
                        s.currentStatus === shelterFilterStatus;
                      return matchSearch && matchStatus;
                    }).length
                  }{' '}
                  of {sheltersList.length} shelters
                </div>
              </div>

              {/* Loading Indicator */}
              {sheltersLoading && (
                <div className="p-8 bg-white border border-slate-100 rounded-3xl text-center text-slate-400 text-sm font-semibold animate-pulse flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5 animate-spin" /> Loading registered shelters from database…
                </div>
              )}

              {/* Empty State */}
              {!sheltersLoading && sheltersList.length === 0 && (
                <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-3">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800">No Shelters Registered Yet</h3>
                  <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
                    Approve user shelter registration applications or directly add a shelter using the "+ Add Shelter" button.
                  </p>
                </div>
              )}

              {/* Shelters Table */}
              {!sheltersLoading && sheltersList.length > 0 && (
                <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                          <th className="pb-3.5 pl-4">Shelter Details</th>
                          <th className="pb-3.5">Contact</th>
                          <th className="pb-3.5">Location</th>
                          <th className="pb-3.5">Operational Status</th>
                          <th className="pb-3.5">Status</th>
                          <th className="pb-3.5 pr-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                        {sheltersList
                          .filter((s) => {
                            const q = shelterSearchQuery.toLowerCase().trim();
                            const matchSearch =
                              !q ||
                              s.shelterName?.toLowerCase().includes(q) ||
                              s.shelterNumber?.toLowerCase().includes(q) ||
                              s.shelterEmail?.toLowerCase().includes(q) ||
                              s.userId?.fullName?.toLowerCase().includes(q);
                            const matchStatus =
                              shelterFilterStatus === 'All' ||
                              s.status === shelterFilterStatus ||
                              s.currentStatus === shelterFilterStatus;
                            return matchSearch && matchStatus;
                          })
                          .map((shelter) => {
                            const operationalStatus = shelter.currentStatus || shelter.status || 'OPEN';
                            const operationalClass =
                              operationalStatus === 'OPEN'
                                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/60'
                                : operationalStatus === 'FULL'
                                ? 'bg-rose-500/10 text-rose-700 border-rose-200/60'
                                : operationalStatus === 'UNDER_MAINTENANCE'
                                ? 'bg-amber-500/10 text-amber-700 border-amber-200/60'
                                : 'bg-slate-100 text-slate-600 border-slate-200/60';

                            const isAccountActive = shelter.status !== 'Inactive';

                            return (
                              <tr key={shelter._id} className="hover:bg-slate-50/70 transition">
                                {/* Shelter Details Column */}
                                <td className="py-4 pl-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#237737]/10 text-[#237737] font-black text-sm flex items-center justify-center shrink-0">
                                      <Building2 className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-extrabold text-slate-900 text-sm">{shelter.shelterName}</h4>
                                        <span className="px-2 py-0.5 bg-[#237737]/10 border border-[#237737]/30 text-[#237737] text-[10px] font-black rounded-lg">
                                          {shelter.shelterNumber || 'SH-0001'}
                                        </span>
                                      </div>
                                      <div className="text-[11px] text-slate-400 font-semibold">
                                        {shelter.userId?.fullName ? `Manager: ${shelter.userId.fullName}` : 'System Admin'}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Contact Column */}
                                <td className="py-4">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5 text-slate-700">
                                      <Mail className="w-3 h-3 text-slate-400" />
                                      <span className="truncate max-w-[160px]">{shelter.shelterEmail}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                      <Phone className="w-3 h-3" />
                                      <span>+91 {shelter.shelterPhoneNumber}</span>
                                    </div>
                                  </div>
                                </td>

                                {/* Location Column */}
                                <td className="py-4">
                                  <div className="flex items-center gap-1.5 text-slate-700 max-w-[130px]">
                                    <MapPin className="w-3.5 h-3.5 text-[#237737] shrink-0" />
                                    <span className="truncate">{shelter.latitude?.toFixed(4)}, {shelter.longitude?.toFixed(4)}</span>
                                  </div>
                                </td>

                                {/* Operational Status Column */}
                                <td className="py-4">
                                  <select
                                    value={operationalStatus}
                                    onChange={(e) => handleUpdateShelterCurrentStatus(shelter._id, e.target.value)}
                                    className={`px-2.5 py-1 text-[10px] font-extrabold rounded-xl border transition cursor-pointer ${operationalClass}`}
                                  >
                                    <option value="OPEN">● OPEN</option>
                                    <option value="FULL">● FULL</option>
                                    <option value="UNDER_MAINTENANCE">● MAINTENANCE</option>
                                    <option value="CLOSED">● CLOSED</option>
                                  </select>
                                </td>

                                {/* Account Status Column */}
                                <td className="py-4">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                                      isAccountActive
                                        ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                                        : 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                                    }`}
                                  >
                                    {isAccountActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>

                                {/* Actions Column */}
                                <td className="py-4 pr-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* Preview Modal Button */}
                                    <button
                                      onClick={() => {
                                        setSelectedShelterForModal(shelter);
                                        setShowShelterDetailsModal(true);
                                      }}
                                      title="View Shelter Details"
                                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition cursor-pointer"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>

                                    {/* Deactivate / Activate Button */}
                                    <button
                                      onClick={() => handleToggleShelterStatus(shelter)}
                                      disabled={shelterActionLoading[shelter._id]}
                                      title={isAccountActive ? 'Deactivate Shelter' : 'Activate Shelter'}
                                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer disabled:opacity-50 ${
                                        isAccountActive
                                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200/50'
                                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200/50'
                                      }`}
                                    >
                                      {shelterActionLoading[shelter._id] ? (
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      ) : isAccountActive ? (
                                        'Deactivate'
                                      ) : (
                                        'Activate'
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Sub-Tab 4: Manage Applications — Unified Table with Application Type filter */}
          {(subTab === 'Manage Applications' || subTab === 'Shelter Applications') && (
            <div className="space-y-6">

              {/* ── Summary Stats ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Applications</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {shelterApplications.length + vetApplications.length + rescueTeamApplications.length + volunteerApplications.length}
                  </div>
                  <div className="text-[10px] font-bold text-blue-600 mt-0.5">All types combined</div>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Review</div>
                  <div className="text-2xl font-black text-amber-600 mt-1">
                    {[...shelterApplications, ...vetApplications, ...rescueTeamApplications, ...volunteerApplications].filter(a => a.status === 'Pending').length}
                  </div>
                  <div className="text-[10px] font-bold text-amber-600 mt-0.5">Awaiting site visit / review</div>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Site Visits Active</div>
                  <div className="text-2xl font-black text-blue-600 mt-1">
                    {shelterApplications.filter(a => a.status === 'Site Visit').length}
                  </div>
                  <div className="text-[10px] font-bold text-blue-600 mt-0.5">Valuation period scheduled</div>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Processed</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {[...shelterApplications, ...vetApplications, ...rescueTeamApplications, ...volunteerApplications].filter(a => a.status === 'Approved').length}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                    {[...shelterApplications, ...vetApplications, ...rescueTeamApplications, ...volunteerApplications].filter(a => a.status === 'Rejected').length} rejected
                  </div>
                </div>
              </div>

              {/* ── Filter & Search Bar ── */}
              <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Search */}
                    <div className="relative w-full sm:w-72">
                      <input
                        type="text"
                        value={shelterAppSearchQuery}
                        onChange={(e) => setShelterAppSearchQuery(e.target.value)}
                        placeholder="Search by name, email, ID…"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#237737] text-xs font-semibold transition"
                      />
                      <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    </div>

                    {/* Application Type Dropdown */}
                    <select
                      value={applicationsCategoryTab}
                      onChange={(e) => setApplicationsCategoryTab(e.target.value)}
                      className="px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
                    >
                      <option value="All">All Application Types</option>
                      <option value="Shelter">🏢 Shelter Registration</option>
                      <option value="Vet">🩺 Vet Staff</option>
                      <option value="Rescue">🚑 Rescue Team</option>
                      <option value="Volunteer">🤝 Volunteer</option>
                    </select>

                    {/* Status Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                      {['All', 'Pending', 'Site Visit', 'Approved', 'Rejected'].map((st) => {
                        const pendingCount = [...shelterApplications, ...vetApplications, ...rescueTeamApplications, ...volunteerApplications].filter(a => a.status === 'Pending').length;
                        const siteVisitCount = shelterApplications.filter(a => a.status === 'Site Visit').length;

                        return (
                          <button
                            key={st}
                            onClick={() => setShelterAppFilterStatus(st)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                              shelterAppFilterStatus === st
                                ? 'bg-[#237737] text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                          >
                            <span>{st === 'All' ? 'All Statuses' : st}</span>
                            {st === 'Pending' && pendingCount > 0 && (
                              <span className="px-1.5 py-0.2 bg-amber-400 text-amber-950 text-[10px] rounded-full font-black">
                                {pendingCount}
                              </span>
                            )}
                            {st === 'Site Visit' && siteVisitCount > 0 && (
                              <span className="px-1.5 py-0.2 bg-blue-400 text-blue-950 text-[10px] rounded-full font-black">
                                {siteVisitCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                    <span className="text-xs text-slate-400 font-extrabold">
                      {(() => {
                        const all = [
                          ...shelterApplications.map(a => ({ ...a, _appType: 'Shelter', _name: a.shelterName, _contact: a.applicantId?.email || a.userId?.email || a.shelterEmail, _id2: a.shelterApplicationId })),
                          ...vetApplications.map(a => ({ ...a, _appType: 'Vet', _name: a.applicantName, _contact: a.email, _id2: a.id })),
                          ...rescueTeamApplications.map(a => ({ ...a, _appType: 'Rescue', _name: a.teamName, _contact: a.email, _id2: a.id })),
                          ...volunteerApplications.map(a => ({ ...a, _appType: 'Volunteer', _name: a.volunteerName, _contact: a.email, _id2: a.id })),
                        ];
                        const q = shelterAppSearchQuery.toLowerCase().trim();
                        return all.filter(a => {
                          const matchType = applicationsCategoryTab === 'All' || a._appType === applicationsCategoryTab;
                          const matchStatus = shelterAppFilterStatus === 'All' || a.status === shelterAppFilterStatus;
                          const matchSearch = !q || a._name?.toLowerCase().includes(q) || a._contact?.toLowerCase().includes(q) || a._id2?.toLowerCase().includes(q);
                          return matchType && matchStatus && matchSearch;
                        }).length;
                      })()} of {shelterApplications.length + vetApplications.length + rescueTeamApplications.length + volunteerApplications.length} applications
                    </span>
                  </div>
                </div>

                {/* Loading */}
                {shelterAppsLoading && (
                  <div className="p-12 bg-[#F8FAF9] border border-slate-100 rounded-2xl text-center text-slate-400 text-sm font-semibold animate-pulse flex items-center justify-center gap-2.5">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#237737]" />
                    <span>Loading applications from database…</span>
                  </div>
                )}

                {/* Unified Applications Table */}
                {!shelterAppsLoading && (() => {
                  const allApps = [
                    ...shelterApplications.map(a => ({ ...a, _appType: 'Shelter', _name: a.shelterName, _contact: a.applicantId?.email || a.userId?.email || a.shelterEmail, _subLabel: `Reg: ${a.registrationNumber || 'N/A'}`, _id2: a.shelterApplicationId, _submittedAt: a.createdAt })),
                    ...vetApplications.map(a => ({ ...a, _appType: 'Vet', _name: a.applicantName, _contact: a.email, _subLabel: `${a.qualification} • ${a.experienceYears}yr exp`, _id2: a.id, _submittedAt: a.submittedAt })),
                    ...rescueTeamApplications.map(a => ({ ...a, _appType: 'Rescue', _name: a.teamName, _contact: a.email, _subLabel: `Lead: ${a.teamLead}`, _id2: a.id, _submittedAt: a.submittedAt })),
                    ...volunteerApplications.map(a => ({ ...a, _appType: 'Volunteer', _name: a.volunteerName, _contact: a.email, _subLabel: `Availability: ${a.availability}`, _id2: a.id, _submittedAt: a.submittedAt })),
                  ];
                  const q = shelterAppSearchQuery.toLowerCase().trim();
                  const filtered = allApps.filter(a => {
                    const matchType = applicationsCategoryTab === 'All' || a._appType === applicationsCategoryTab;
                    const matchStatus = shelterAppFilterStatus === 'All' || a.status === shelterAppFilterStatus;
                    const matchSearch = !q || a._name?.toLowerCase().includes(q) || a._contact?.toLowerCase().includes(q) || a._id2?.toLowerCase().includes(q);
                    return matchType && matchStatus && matchSearch;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-10 bg-[#F8FAF9] border border-slate-100 rounded-2xl text-center">
                        <div className="p-4 bg-slate-100 rounded-2xl w-fit mx-auto mb-3">
                          <ClipboardList className="w-7 h-7 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-semibold text-sm">No applications found.</p>
                        <p className="text-slate-400 font-medium text-xs mt-1">Try adjusting the filters or search query.</p>
                      </div>
                    );
                  }

                  const typeConfig = {
                    Shelter:   { color: 'bg-[#237737]/10 text-[#237737] border-[#237737]/30', icon: <Building2 className="w-3.5 h-3.5" />, label: '🏢 Shelter' },
                    Vet:       { color: 'bg-teal-500/10 text-teal-700 border-teal-200/50',    icon: <Stethoscope className="w-3.5 h-3.5" />, label: '🩺 Vet' },
                    Rescue:    { color: 'bg-blue-500/10 text-blue-700 border-blue-200/50',     icon: <Truck className="w-3.5 h-3.5" />, label: '🚑 Rescue' },
                    Volunteer: { color: 'bg-rose-500/10 text-rose-700 border-rose-200/50',     icon: <HeartHandshake className="w-3.5 h-3.5" />, label: '🤝 Volunteer' },
                  };

                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                            <th className="pb-3.5 pl-4">Applicant / Application</th>
                            <th className="pb-3.5">Type</th>
                            <th className="pb-3.5">Contact</th>
                            <th className="pb-3.5">Status</th>
                            <th className="pb-3.5">Submitted</th>
                            <th className="pb-3.5 pr-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                          {filtered.map((app, idx) => {
                            const tc = typeConfig[app._appType] || typeConfig.Shelter;
                            const appKey = app._id || app.id || idx;
                            const statusBadge =
                              app.status === 'Approved'
                                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                                : app.status === 'Rejected'
                                ? 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                                : app.status === 'Site Visit'
                                ? 'bg-blue-500/10 text-blue-700 border-blue-200/50'
                                : 'bg-amber-500/10 text-amber-700 border-amber-200/50';

                            const submittedDate = app._submittedAt
                              ? new Date(app._submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                              : 'N/A';

                            return (
                              <tr key={appKey} className="hover:bg-slate-50/70 transition">
                                {/* Applicant / Application Column */}
                                <td className="py-4 pl-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${tc.color}`}>
                                      {tc.icon}
                                    </div>
                                    <div className="space-y-0.5">
                                      <h4 className="font-extrabold text-slate-900 text-sm">{app._name}</h4>
                                      <div className="text-[11px] text-slate-400 font-semibold">{app._subLabel}</div>
                                      {app._id2 && <div className="text-[10px] text-slate-300 font-bold">#{app._id2}</div>}
                                    </div>
                                  </div>
                                </td>

                                {/* Type Column */}
                                <td className="py-4">
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${tc.color}`}>
                                    {tc.label}
                                  </span>
                                </td>

                                {/* Contact Column */}
                                <td className="py-4">
                                  <div className="flex items-center gap-1.5 text-slate-700 max-w-[180px]">
                                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="truncate">{app._contact}</span>
                                  </div>
                                </td>

                                {/* Status Column */}
                                <td className="py-4">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${statusBadge}`}>
                                    {app.status}
                                  </span>
                                  {app.status === 'Site Visit' && app.siteVisitScheduleDate && (
                                    <div className="text-[10px] text-blue-600 font-bold mt-1 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(app.siteVisitScheduleDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </div>
                                  )}
                                </td>

                                {/* Submitted Column */}
                                <td className="py-4 text-slate-400 text-xs font-semibold whitespace-nowrap">
                                  {submittedDate}
                                </td>

                                {/* Actions Column */}
                                <td className="py-4 pr-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* Preview Modal Button */}
                                    <button
                                      onClick={() => {
                                        setSelectedApplicationForModal(app);
                                        setShowApplicationDetailsModal(true);
                                      }}
                                      title="View Application Details"
                                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition cursor-pointer"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>

                                    {/* Shelter Application Flow: Pending -> Site Visit & Valuation Period -> Site Visit Report & Decision -> Approved/Rejected */}
                                    {app._appType === 'Shelter' ? (
                                      <>
                                        {app.status === 'Pending' && (
                                          <>
                                            <button
                                              onClick={() => handleOpenScheduleSiteVisit(app)}
                                              title="Schedule Physical Site Visit & Valuation Period"
                                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                                            >
                                              <Calendar className="w-3.5 h-3.5" />
                                              Schedule Site Visit
                                            </button>
                                            <button
                                              onClick={() => handleReviewApplication(app._id, 'Rejected')}
                                              disabled={shelterReviewing[app._id]}
                                              className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 disabled:opacity-60 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer"
                                            >
                                              <XCircle className="w-3.5 h-3.5" />
                                              Reject
                                            </button>
                                          </>
                                        )}

                                        {app.status === 'Site Visit' && (
                                          <>
                                            <button
                                              onClick={() => handleOpenReportModal(app)}
                                              title="Upload Site Inspection Report & Finalize Approval"
                                              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                                            >
                                              <FileText className="w-3.5 h-3.5" />
                                              Report & Decide
                                            </button>
                                            <button
                                              onClick={() => handleOpenScheduleSiteVisit(app)}
                                              title="Reschedule Valuation Date"
                                              className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition cursor-pointer"
                                            >
                                              <Calendar className="w-3.5 h-3.5" />
                                            </button>
                                          </>
                                        )}

                                        {(app.status === 'Approved' || app.status === 'Rejected') && (
                                          <span className="text-[11px] text-slate-400 font-semibold px-2 py-1 bg-slate-50 rounded-lg">
                                            {app.status === 'Approved' ? '✓ Approved' : '✗ Rejected'}
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      /* Other applications (Vet, Rescue, Volunteer) */
                                      <>
                                        {app.status === 'Pending' ? (
                                          <>
                                            {app._appType === 'Vet' && (
                                              <>
                                                <button
                                                  onClick={() => handleReviewVetApp(app.id, 'Approved')}
                                                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                                                >
                                                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                                                </button>
                                                <button
                                                  onClick={() => handleReviewVetApp(app.id, 'Rejected')}
                                                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer"
                                                >
                                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                                </button>
                                              </>
                                            )}
                                            {app._appType === 'Rescue' && (
                                              <>
                                                <button
                                                  onClick={() => handleReviewRescueApp(app.id, 'Approved')}
                                                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                                                >
                                                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                                                </button>
                                                <button
                                                  onClick={() => handleReviewRescueApp(app.id, 'Rejected')}
                                                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer"
                                                >
                                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                                </button>
                                              </>
                                            )}
                                            {app._appType === 'Volunteer' && (
                                              <>
                                                <button
                                                  onClick={() => handleReviewVolunteerApp(app.id, 'Approved')}
                                                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                                                >
                                                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                                                </button>
                                                <button
                                                  onClick={() => handleReviewVolunteerApp(app.id, 'Rejected')}
                                                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer"
                                                >
                                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                                </button>
                                              </>
                                            )}
                                          </>
                                        ) : (
                                          <span className="text-[11px] text-slate-300 font-semibold px-2 py-1 bg-slate-50 rounded-lg">
                                            {app.status === 'Approved' ? '✓ Processed' : '✗ Declined'}
                                          </span>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

            </div>
          )}


          {/* ══ SUB-TAB 5: MANAGE VET (VETERINARY STAFF MANAGEMENT) ══ */}
          {subTab === 'Manage Vet' && (
            <div className="space-y-6">
              {/* Metric Cards Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Vets</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {usersList.filter((u) => u.role === 'Veterinary Staff').length}
                  </div>
                  <div className="text-[10px] font-bold text-teal-600 mt-0.5">Certified Surgeons</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active On-Duty</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {usersList.filter((u) => u.role === 'Veterinary Staff' && u.status === 'Active').length}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 mt-0.5">Available for Triage</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Partner Clinics</div>
                  <div className="text-2xl font-black text-blue-600 mt-1">12</div>
                  <div className="text-[10px] font-bold text-blue-600 mt-0.5">Affiliated Hospitals</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emergency 24x7</div>
                  <div className="text-2xl font-black text-purple-600 mt-1">6</div>
                  <div className="text-[10px] font-bold text-purple-600 mt-0.5">On-Call Specialists</div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      value={vetSearchQuery}
                      onChange={(e) => setVetSearchQuery(e.target.value)}
                      placeholder="Search vet by name, email, city…"
                      className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#237737] transition"
                    />
                    <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {['All', 'Active', 'Suspended'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setVetStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                          vetStatusFilter === st
                            ? 'bg-[#237737] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs font-extrabold text-slate-400">
                  {usersList.filter((u) => u.role === 'Veterinary Staff').length} veterinary surgeons
                </div>
              </div>

              {/* Vets Grid / Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                {usersList
                  .filter((u) => u.role === 'Veterinary Staff')
                  .filter((u) => {
                    const q = vetSearchQuery.toLowerCase();
                    const matchQ =
                      !q ||
                      u.fullName?.toLowerCase().includes(q) ||
                      u.email?.toLowerCase().includes(q) ||
                      u.city?.toLowerCase().includes(q);
                    const matchSt = vetStatusFilter === 'All' || (u.status || 'Active') === vetStatusFilter;
                    return matchQ && matchSt;
                  })
                  .map((vet) => (
                    <div key={vet._id || vet.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-700 flex items-center justify-center font-black text-lg shrink-0">
                              <Stethoscope className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-slate-900">{vet.fullName}</h4>
                              <p className="text-[11px] text-slate-400 font-semibold">{vet.city ? `${vet.city}, ${vet.state || 'Kerala'}` : 'Registered Vet'}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                            vet.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                              : 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                          }`}>
                            {vet.status || 'Active'}
                          </span>
                        </div>

                        <div className="mt-4 p-3 bg-[#F8FAF9] rounded-2xl border border-slate-100 space-y-1.5 text-xs font-semibold text-slate-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span className="truncate">{vet.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>{vet.phoneNumber ? `+91 ${vet.phoneNumber}` : 'No phone registered'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>VCI License Verified ✓</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setSelectedUserForModal(vet);
                            setShowUserDetailsModal(true);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Profile
                        </button>
                        <button
                          onClick={() => handleToggleStatus(vet)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                            vet.status === 'Active'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {vet.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))}

                {usersList.filter((u) => u.role === 'Veterinary Staff').length === 0 && (
                  <div className="col-span-full bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-3">
                    <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto">
                      <Stethoscope className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">No Veterinary Surgeons Registered Yet</h3>
                    <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
                      You can onboard clinic doctors directly by clicking the "+ Add Vet Account" button at the top.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ SUB-TAB 6: MANAGE RESCUE TEAMS ══ */}
          {subTab === 'Manage Rescue Teams' && (
            <div className="space-y-6">
              {/* Metric Cards Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Rescue Teams</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {usersList.filter((u) => u.role === 'Rescue Team').length}
                  </div>
                  <div className="text-[10px] font-bold text-blue-600 mt-0.5">Certified Taskforces</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Field Operatives</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">34</div>
                  <div className="text-[10px] font-bold text-emerald-600 mt-0.5">Active Responders</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ambulance Fleet</div>
                  <div className="text-2xl font-black text-amber-600 mt-1">8</div>
                  <div className="text-[10px] font-bold text-amber-600 mt-0.5">Specialized Vans & Bikes</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Response Time</div>
                  <div className="text-2xl font-black text-purple-600 mt-1">12m</div>
                  <div className="text-[10px] font-bold text-purple-600 mt-0.5">From Triage to Dispatch</div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      value={rescueSearchQuery}
                      onChange={(e) => setRescueSearchQuery(e.target.value)}
                      placeholder="Search rescue teams by name, zone, phone…"
                      className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#237737] transition"
                    />
                    <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {['All', 'Active', 'Suspended'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setRescueStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                          rescueStatusFilter === st
                            ? 'bg-[#237737] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs font-extrabold text-slate-400">
                  {usersList.filter((u) => u.role === 'Rescue Team').length} rescue units registered
                </div>
              </div>

              {/* Rescue Teams Grid / Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                {usersList
                  .filter((u) => u.role === 'Rescue Team')
                  .filter((u) => {
                    const q = rescueSearchQuery.toLowerCase();
                    const matchQ =
                      !q ||
                      u.fullName?.toLowerCase().includes(q) ||
                      u.email?.toLowerCase().includes(q) ||
                      u.city?.toLowerCase().includes(q);
                    const matchSt = rescueStatusFilter === 'All' || (u.status || 'Active') === rescueStatusFilter;
                    return matchQ && matchSt;
                  })
                  .map((team) => (
                    <div key={team._id || team.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">
                              <Truck className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-slate-900">{team.fullName}</h4>
                              <p className="text-[11px] text-slate-400 font-semibold">{team.city ? `HQ: ${team.city}, ${team.state || 'Kerala'}` : 'Emergency Taskforce'}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                            team.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                              : 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                          }`}>
                            {team.status || 'Active'}
                          </span>
                        </div>

                        <div className="mt-4 p-3 bg-[#F8FAF9] rounded-2xl border border-slate-100 space-y-1.5 text-xs font-semibold text-slate-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="truncate">{team.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{team.phoneNumber ? `+91 ${team.phoneNumber}` : 'No hotline registered'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>GPS Telemetry Ready ✓</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setSelectedUserForModal(team);
                            setShowUserDetailsModal(true);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Unit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(team)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                            team.status === 'Active'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {team.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))}

                {usersList.filter((u) => u.role === 'Rescue Team').length === 0 && (
                  <div className="col-span-full bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-3">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                      <Truck className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">No Rescue Teams Registered Yet</h3>
                    <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
                      Add a field squad using "+ Register Rescue Team" at the top to enable rapid dispatch operations.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ SUB-TAB 7: MANAGE VOLUNTEERS ══ */}
          {subTab === 'Manage Volunteers' && (
            <div className="space-y-6">
              {/* Metric Cards Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Volunteers</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {usersList.filter((u) => u.role === 'Public User').length}
                  </div>
                  <div className="text-[10px] font-bold text-rose-600 mt-0.5">Community Network</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Contributors</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {usersList.filter((u) => u.role === 'Public User' && u.status === 'Active').length}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 mt-0.5">Verified Accounts</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Volunteer Hours</div>
                  <div className="text-2xl font-black text-amber-600 mt-1">1,840h</div>
                  <div className="text-[10px] font-bold text-amber-600 mt-0.5">Shelter & Field Aid</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fosters Completed</div>
                  <div className="text-2xl font-black text-purple-600 mt-1">214</div>
                  <div className="text-[10px] font-bold text-purple-600 mt-0.5">Safe Home Placements</div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      value={volunteerSearchQuery}
                      onChange={(e) => setVolunteerSearchQuery(e.target.value)}
                      placeholder="Search volunteer by name, city, email…"
                      className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#237737] transition"
                    />
                    <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {['All', 'Active', 'Suspended'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setVolunteerStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                          volunteerStatusFilter === st
                            ? 'bg-[#237737] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs font-extrabold text-slate-400">
                  {usersList.filter((u) => u.role === 'Public User').length} volunteers registered
                </div>
              </div>

              {/* Volunteer Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                {usersList
                  .filter((u) => u.role === 'Public User')
                  .filter((u) => {
                    const q = volunteerSearchQuery.toLowerCase();
                    const matchQ =
                      !q ||
                      u.fullName?.toLowerCase().includes(q) ||
                      u.email?.toLowerCase().includes(q) ||
                      u.city?.toLowerCase().includes(q);
                    const matchSt = volunteerStatusFilter === 'All' || (u.status || 'Active') === volunteerStatusFilter;
                    return matchQ && matchSt;
                  })
                  .map((vol) => (
                    <div key={vol._id || vol.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-700 flex items-center justify-center font-black text-lg shrink-0">
                              <HeartHandshake className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-slate-900">{vol.fullName}</h4>
                              <p className="text-[11px] text-slate-400 font-semibold">{vol.city ? `${vol.city}, ${vol.state || 'Kerala'}` : 'Community Volunteer'}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                            vol.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                              : 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                          }`}>
                            {vol.status || 'Active'}
                          </span>
                        </div>

                        <div className="mt-4 p-3 bg-[#F8FAF9] rounded-2xl border border-slate-100 space-y-1.5 text-xs font-semibold text-slate-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span className="truncate">{vol.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>{vol.phoneNumber ? `+91 ${vol.phoneNumber}` : 'No phone added'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>Volunteer Onboarding Completed</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setSelectedUserForModal(vol);
                            setShowUserDetailsModal(true);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Profile
                        </button>
                        <button
                          onClick={() => handleToggleStatus(vol)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                            vol.status === 'Active'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {vol.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))}

                {usersList.filter((u) => u.role === 'Public User').length === 0 && (
                  <div className="col-span-full bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-3">
                    <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                      <HeartHandshake className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">No Volunteers Enlisted Yet</h3>
                    <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
                      Community members will appear here once they register or apply through the portal.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ SUB-TAB: MANAGE ANIMALS & CATEGORIES ══ */}
          {(subTab === 'Manage Animals' || activeTab === 'Manage Animals') && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Metric Cards Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Animals</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{animalsList.length}</div>
                  <div className="text-[10px] font-bold text-[#237737] mt-0.5">Active Database Records</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Animal Categories</div>
                  <div className="text-2xl font-black text-blue-600 mt-1">{animalCategories.length}</div>
                  <div className="text-[10px] font-bold text-blue-600 mt-0.5">
                    {animalCategories.filter(c => c.status === 'Active').length} Active Classifications
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available for Adoption</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {animalsList.filter(a => a.status === 'Available' || a.status === 'Rescued').length}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 mt-0.5">In Care / Adoption Ready</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Under Treatment</div>
                  <div className="text-2xl font-black text-amber-600 mt-1">
                    {animalsList.filter(a => a.status === 'Under Treatment' || a.status === 'Critical').length}
                  </div>
                  <div className="text-[10px] font-bold text-amber-600 mt-0.5">Medical Intensive Care</div>
                </div>
              </div>

              {/* View Switch Tabs (Category Table vs Registered Animals) */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAnimalActiveSubView('categories')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                      animalActiveSubView === 'categories'
                        ? 'bg-[#237737] text-white shadow-sm shadow-[#237737]/10'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Animal Categories ({animalCategories.length})</span>
                  </button>

                  <button
                    onClick={() => setAnimalActiveSubView('animals')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                      animalActiveSubView === 'animals'
                        ? 'bg-[#237737] text-white shadow-sm shadow-[#237737]/10'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Dog className="w-3.5 h-3.5" />
                    <span>Registered Animals ({animalsList.length})</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400">
                  <span>Primary Key: <code className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">categoryId</code></span>
                </div>
              </div>

              {/* VIEW 1: ANIMAL CATEGORIES TABLE */}
              {animalActiveSubView === 'categories' && (
                <div className="space-y-4">
                  {/* Category Purpose & Search Row */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={categorySearchQuery}
                          onChange={(e) => setCategorySearchQuery(e.target.value)}
                          placeholder="Search category name, ID, desc…"
                          className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] transition"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        {['All', 'Active', 'Inactive'].map((st) => (
                          <button
                            key={st}
                            onClick={() => setCategoryStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              categoryStatusFilter === st
                                ? 'bg-[#237737] text-white shadow-sm'
                                : 'bg-[#F8FAF9] hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleOpenAddCategoryModal}
                      className="px-4 py-2 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow shadow-[#237737]/10 flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Add Animal Category
                    </button>
                  </div>

                  {/* Category Table */}
                  <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <Tag className="w-4 h-4 text-[#237737]" />
                          Animal Category Table
                        </h3>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                          Stores different categories of animals such as Dog, Cat, Bird, Cow, etc.
                        </p>
                      </div>
                      <span className="text-xs font-bold text-slate-400">
                        {animalCategories.length} Total Categories
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/30">
                            <th className="py-3.5 px-5">SI No.</th>
                            <th className="py-3.5 px-5">Category ID</th>
                            <th className="py-3.5 px-5">Category Name</th>
                            <th className="py-3.5 px-5">Description</th>
                            <th className="py-3.5 px-5">Status</th>
                            <th className="py-3.5 px-5">Created At</th>
                            <th className="py-3.5 px-5">Updated At</th>
                            <th className="py-3.5 px-5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                          {animalCategories
                            .filter((cat) => {
                              const q = categorySearchQuery.toLowerCase();
                              const matchQ =
                                !q ||
                                cat.categoryId?.toLowerCase().includes(q) ||
                                cat.categoryName?.toLowerCase().includes(q) ||
                                cat.description?.toLowerCase().includes(q);
                              const matchSt =
                                categoryStatusFilter === 'All' || cat.status === categoryStatusFilter;
                              return matchQ && matchSt;
                            })
                            .map((cat, index) => (
                              <tr key={cat._id || cat.categoryId || index} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3.5 px-5 font-bold text-slate-400">
                                  {index + 1}
                                </td>
                                <td className="py-3.5 px-5 font-mono font-bold text-[#237737]">
                                  {cat.categoryId || `CAT-${String(index + 1).padStart(4, '0')}`}
                                </td>
                                <td className="py-3.5 px-5">
                                  <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-700 font-black text-xs flex items-center justify-center">
                                      {cat.categoryName === 'Dog' ? '🐕' : cat.categoryName === 'Cat' ? '🐈' : cat.categoryName === 'Bird' ? '🦜' : cat.categoryName === 'Cow' ? '🐄' : '🐾'}
                                    </span>
                                    <span className="font-extrabold text-slate-900 text-sm">
                                      {cat.categoryName}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-5 max-w-xs text-slate-500 text-xs">
                                  {cat.description || 'General animal classification'}
                                </td>
                                <td className="py-3.5 px-5">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                                    cat.status === 'Active'
                                      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                                      : 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                                  }`}>
                                    {cat.status || 'Active'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-5 text-[11px] text-slate-400">
                                  {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                </td>
                                <td className="py-3.5 px-5 text-[11px] text-slate-400">
                                  {cat.updatedAt ? new Date(cat.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                </td>
                                <td className="py-3.5 px-5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleOpenEditCategoryModal(cat)}
                                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition cursor-pointer"
                                      title="Edit Category"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleToggleCategoryStatus(cat)}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                                        cat.status === 'Active'
                                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                      }`}
                                    >
                                      {cat.status === 'Active' ? 'Deactivate' : 'Activate'}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          {animalCategories.length === 0 && !categoriesLoading && (
                            <tr>
                              <td colSpan={8} className="py-10 text-center text-slate-400 text-xs font-semibold">
                                No animal categories defined yet. Click "+ Add Animal Category" above.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: REGISTERED ANIMALS REGISTRY */}
              {animalActiveSubView === 'animals' && (
                <div className="space-y-4">
                  {/* Search & Filter Bar */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={animalSearchQuery}
                          onChange={(e) => setAnimalSearchQuery(e.target.value)}
                          placeholder="Search name, ID, breed, cage…"
                          className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] transition"
                        />
                      </div>

                      {/* Species Filter */}
                      <select
                        value={animalSpeciesFilter}
                        onChange={(e) => setAnimalSpeciesFilter(e.target.value)}
                        className="px-3.5 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
                      >
                        <option value="All">All Species / Categories</option>
                        {animalCategories.map((c) => (
                          <option key={c._id || c.categoryId} value={c.categoryName}>
                            {c.categoryName}
                          </option>
                        ))}
                      </select>

                      {/* Status Filter */}
                      <select
                        value={animalStatusFilter}
                        onChange={(e) => setAnimalStatusFilter(e.target.value)}
                        className="px-3.5 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Available">Available</option>
                        <option value="Rescued">Rescued</option>
                        <option value="Under Treatment">Under Treatment</option>
                        <option value="Critical">Critical</option>
                        <option value="Adopted">Adopted</option>
                        <option value="Released">Released</option>
                      </select>
                    </div>

                    <button
                      onClick={handleOpenAddAnimalModal}
                      className="px-4 py-2 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow shadow-[#237737]/10 flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Register Animal
                    </button>
                  </div>

                  {/* Registered Animals Table */}
                  <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <Dog className="w-4 h-4 text-[#237737]" />
                          Registered Rescue Animals Registry
                        </h3>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                          Comprehensive index of rescued animals across all shelter facilities and partner clinics
                        </p>
                      </div>
                      <span className="text-xs font-bold text-slate-400">
                        {animalsList.length} Total Animals Registered
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/30">
                            <th className="py-3.5 px-5">Animal ID</th>
                            <th className="py-3.5 px-5">Animal Name & Breed</th>
                            <th className="py-3.5 px-5">Category / Species</th>
                            <th className="py-3.5 px-5">Gender / Age</th>
                            <th className="py-3.5 px-5">Facility / Cage</th>
                            <th className="py-3.5 px-5">Health</th>
                            <th className="py-3.5 px-5">Status</th>
                            <th className="py-3.5 px-5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                          {animalsList
                            .filter((anl) => {
                              const q = animalSearchQuery.toLowerCase();
                              const matchQ =
                                !q ||
                                anl.animalId?.toLowerCase().includes(q) ||
                                anl.name?.toLowerCase().includes(q) ||
                                anl.breed?.toLowerCase().includes(q) ||
                                anl.cageNumber?.toLowerCase().includes(q) ||
                                anl.shelterName?.toLowerCase().includes(q);
                              const matchSp =
                                animalSpeciesFilter === 'All' ||
                                anl.species?.toLowerCase() === animalSpeciesFilter.toLowerCase();
                              const matchSt =
                                animalStatusFilter === 'All' || anl.status === animalStatusFilter;
                              return matchQ && matchSp && matchSt;
                            })
                            .map((anl) => (
                              <tr key={anl._id || anl.animalId} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3.5 px-5 font-mono font-bold text-[#237737]">
                                  {anl.animalId}
                                </td>
                                <td className="py-3.5 px-5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-[#237737]/10 text-[#237737] font-black text-xs flex items-center justify-center shrink-0">
                                      {anl.species === 'Dog' ? '🐕' : anl.species === 'Cat' ? '🐈' : anl.species === 'Bird' ? '🦜' : anl.species === 'Cow' ? '🐄' : '🐾'}
                                    </div>
                                    <div>
                                      <p className="font-extrabold text-slate-900 text-sm">
                                        {anl.name || 'Unnamed Animal'}
                                      </p>
                                      <p className="text-[11px] text-slate-400 font-semibold">
                                        {anl.breed || 'Mixed Breed'} {anl.color ? `• ${anl.color}` : ''}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-5 font-extrabold text-slate-800">
                                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                                    {anl.species}
                                  </span>
                                </td>
                                <td className="py-3.5 px-5 text-slate-600">
                                  {anl.gender || 'Unknown'} {anl.approxAge ? `• ${anl.approxAge}` : ''}
                                </td>
                                <td className="py-3.5 px-5">
                                  <p className="font-bold text-slate-800">{anl.shelterName || 'Central Registry'}</p>
                                  <p className="text-[11px] text-slate-400 font-mono">Cage: {anl.cageNumber || 'Unassigned'}</p>
                                </td>
                                <td className="py-3.5 px-5">
                                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                    anl.healthCondition === 'Critical'
                                      ? 'bg-rose-100 text-rose-700'
                                      : anl.healthCondition === 'Under Treatment'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-emerald-100 text-emerald-700'
                                  }`}>
                                    {anl.healthCondition || 'Healthy'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-5">
                                  <select
                                    value={anl.status}
                                    onChange={(e) => handleToggleAnimalStatus(anl, e.target.value)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                                      anl.status === 'Available' || anl.status === 'Rescued'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : anl.status === 'Under Treatment' || anl.status === 'Critical'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : anl.status === 'Adopted'
                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                        : 'bg-slate-50 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    <option value="Available">Available</option>
                                    <option value="Rescued">Rescued</option>
                                    <option value="Under Treatment">Under Treatment</option>
                                    <option value="Critical">Critical</option>
                                    <option value="Adopted">Adopted</option>
                                    <option value="Released">Released</option>
                                  </select>
                                </td>
                                <td className="py-3.5 px-5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => {
                                        setSelectedAnimalForModal(anl);
                                        setShowAnimalDetailsModal(true);
                                      }}
                                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition cursor-pointer"
                                      title="View Details"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAnimal(anl)}
                                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                                      title="Delete Animal Record"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          {animalsList.length === 0 && !animalsLoading && (
                            <tr>
                              <td colSpan={8} className="py-10 text-center text-slate-400 text-xs font-semibold">
                                No registered animals found. Click "+ Register Animal" above to add the first record.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ══ SUB-TAB: AI MODULE (UNDER DEVELOPMENT) ══ */}
          {subTab === 'AI Module' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Hero Status Banner */}
              <div className="bg-gradient-to-br from-purple-500/5 via-white to-indigo-500/5 border border-purple-100 rounded-3xl p-8 sm:p-10 shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                <div className="max-w-2xl mx-auto space-y-4 relative z-10">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    This tab is under development
                  </h2>

                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
                    The ResQNet AI Vision & Diagnostics Suite is currently being trained and calibrated with our partner veterinary clinics. Once released, this module will automate image-based distress severity triage, classify animal breeds, and predict emergency rescue hotspots.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setActiveTab('Admin Dashboard');
                        setSubTab('Overview');
                      }}
                      className="px-5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-[#237737]/15"
                    >
                      Back to Dashboard Overview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ SUB-TAB: SMART COLLAR (UNDER DEVELOPMENT) ══ */}
          {subTab === 'Smart Collar' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Hero Status Banner */}
              <div className="bg-gradient-to-br from-emerald-500/5 via-white to-cyan-500/5 border border-emerald-100 rounded-3xl p-8 sm:p-10 shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                <div className="max-w-2xl mx-auto space-y-4 relative z-10">

                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    This tab is under development
                  </h2>

                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
                    The ResQNet IoT Smart Collar Telemetry Dashboard is currently undergoing hardware bench testing and field validation. Once active, administrators can track satellite coordinates, monitor animal vital signs, and manage geofenced safe zones in real time.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setActiveTab('Admin Dashboard');
                        setSubTab('Overview');
                      }}
                      className="px-5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-[#237737]/15"
                    >
                      Back to Dashboard Overview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ SUB-TAB 5: MY PROFILE (ADMINISTRATOR) ══ */}
          {(subTab === 'My Profile' || activeTab === 'My Profile') && (
            <div className="max-w-3xl space-y-6">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {user?.profilePic ? (
                    <img
                      src={user.profilePic.startsWith('/uploads') ? `http://localhost:5000${user.profilePic}` : user.profilePic}
                      alt={user?.fullName || 'Administrator'}
                      className="w-20 h-20 rounded-3xl object-cover border border-slate-200 shadow-md shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-3xl bg-purple-600 text-white font-black text-3xl flex items-center justify-center shadow-md select-none shrink-0">
                      {(user?.fullName || 'A')[0].toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl font-black text-slate-900">{user?.fullName || 'Dennis Jacob'}</h2>
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200/60 rounded-xl text-xs font-bold">
                        Super Administrator
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500">{user?.email || 'admin@resqnet.org'}</p>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 pt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Full Root Access • Platform Security Officer
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  {[
                    { label: 'Role Level', value: 'Platform Super Admin (Tier 1)' },
                    { label: 'Security Status', value: '2FA Enabled & Verified ✓' },
                    { label: 'Phone Number', value: user?.phoneNumber || '+91 94471 89012' },
                    { label: 'Audit Log Access', value: 'Full Read / Write / Export' },
                    { label: 'User Role Authority', value: 'Manage All Roles & Shelters' },
                    { label: 'Account State', value: 'Active & Verified' },
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

      {/* User Details Modal */}
      {showUserDetailsModal && selectedUserForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                {selectedUserForModal.profilePic ? (
                  <img
                    src={
                      selectedUserForModal.profilePic.startsWith('/uploads')
                        ? `http://localhost:5000${selectedUserForModal.profilePic}`
                        : selectedUserForModal.profilePic
                    }
                    alt={selectedUserForModal.fullName || selectedUserForModal.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-[#237737]/10 text-[#237737] font-black text-lg flex items-center justify-center shrink-0">
                    {(selectedUserForModal.fullName || selectedUserForModal.name || 'U')[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {selectedUserForModal.fullName || selectedUserForModal.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold">{selectedUserForModal.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUserDetailsModal(false);
                  setSelectedUserForModal(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status & Role Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                selectedUserForModal.role === 'Admin'
                  ? 'bg-purple-50 text-purple-700 border-purple-200/60'
                  : selectedUserForModal.role === 'Rescue Team'
                  ? 'bg-blue-50 text-blue-700 border-blue-200/60'
                  : selectedUserForModal.role === 'Shelter' || selectedUserForModal.role === 'Shelter Manager'
                  ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                  : selectedUserForModal.role === 'Veterinary Staff'
                  ? 'bg-teal-50 text-teal-700 border-teal-200/60'
                  : 'bg-slate-100 text-slate-700 border-slate-200/60'
              }`}>
                Role: {selectedUserForModal.role}
              </span>

              <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                selectedUserForModal.status === 'Active'
                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                  : selectedUserForModal.status === 'Suspended'
                  ? 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                  : 'bg-amber-500/10 text-amber-700 border-amber-200/50'
              }`}>
                Status: {selectedUserForModal.status || 'Active'}
              </span>

              <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                selectedUserForModal.isEmailVerified
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                Email {selectedUserForModal.isEmailVerified ? 'Verified ✓' : 'Unverified ✗'}
              </span>

              <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                selectedUserForModal.isPhoneVerified
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                Phone {selectedUserForModal.isPhoneVerified ? 'Verified ✓' : 'Unverified ✗'}
              </span>
            </div>

            {/* Profile Information Grid */}
            <div className="bg-[#F8FAF9] rounded-2xl p-4 border border-slate-100 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Phone Number</span>
                  <span className="text-slate-800 font-extrabold">{selectedUserForModal.phoneNumber || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Date of Birth</span>
                  <span className="text-slate-800 font-extrabold">
                    {selectedUserForModal.dob
                      ? new Date(selectedUserForModal.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                      : 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">City / Town</span>
                  <span className="text-slate-800 font-extrabold">{selectedUserForModal.city || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">District</span>
                  <span className="text-slate-800 font-extrabold">{selectedUserForModal.district || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">State</span>
                  <span className="text-slate-800 font-extrabold">{selectedUserForModal.state || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Pincode</span>
                  <span className="text-slate-800 font-extrabold">{selectedUserForModal.pincode || 'Not specified'}</span>
                </div>
              </div>

              {selectedUserForModal.address && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Street Address</span>
                  <span className="text-slate-800 font-semibold">{selectedUserForModal.address}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-medium">
                <div>
                  <span className="block font-bold">Registered On:</span>
                  <span>
                    {selectedUserForModal.createdAt
                      ? new Date(selectedUserForModal.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block font-bold">Account ID:</span>
                  <span className="font-mono text-[10px] text-slate-500">{selectedUserForModal._id || selectedUserForModal.id}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions in Modal */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-extrabold text-slate-700">Administrative Controls:</span>
              <div className="flex items-center gap-2">
                <select
                  value={selectedUserForModal.role}
                  onChange={(e) => handleUpdateRole(selectedUserForModal._id || selectedUserForModal.id, e.target.value)}
                  className="px-3 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer flex-1"
                >
                  <option value="Public User">Role: Public User</option>
                  <option value="Rescue Team">Role: Rescue Team</option>
                  <option value="Shelter">Role: Shelter</option>
                  <option value="Veterinary Staff">Role: Veterinary Staff</option>
                  <option value="Admin">Role: Admin</option>
                </select>

                <button
                  onClick={() => handleToggleStatus(selectedUserForModal)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                    selectedUserForModal.status === 'Active'
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {selectedUserForModal.status === 'Active' ? 'Suspend User' : 'Activate User'}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  setShowUserDetailsModal(false);
                  setSelectedUserForModal(null);
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}
      {/* ══ ADD / EDIT ANIMAL CATEGORY MODAL ══ */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#237737]/10 text-[#237737] flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingCategory ? 'Edit Animal Category' : 'Add Animal Category'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    {editingCategory ? `Updating ${editingCategory.categoryId}` : 'Configure a new species classification in the category table'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {categoryError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{categoryError}</span>
              </div>
            )}

            {categorySuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{categorySuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Category Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Dog, Cat, Bird, Cow, Horse, Rabbit, Other"
                  required
                  className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Description</label>
                <textarea
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  rows="3"
                  placeholder="Description for this animal classification, shelter habitat guidelines, rescue notes..."
                  className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] resize-none"
                ></textarea>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                  }}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categorySubmitting}
                  className="w-2/3 py-2.5 bg-[#237737] hover:bg-[#1d632e] disabled:opacity-60 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-[#237737]/15 flex items-center justify-center gap-2"
                >
                  {categorySubmitting ? (
                    <><Clock className="w-4 h-4 animate-spin" /> Saving Category…</>
                  ) : (
                    <><Check className="w-4 h-4" /> {editingCategory ? 'Update Category' : 'Save Category Record'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ══ ANIMAL DETAILS MODAL ══ */}
      {showAnimalDetailsModal && selectedAnimalForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {selectedAnimalForModal.name || 'Rescue Animal'} ({selectedAnimalForModal.animalId})
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold">
                    {selectedAnimalForModal.breed || 'Mixed Breed'} • {selectedAnimalForModal.species}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAnimalDetailsModal(false);
                  setSelectedAnimalForModal(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#F8FAF9] rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
                <p className="font-extrabold text-slate-800 mt-0.5">{selectedAnimalForModal.species}</p>
              </div>
              <div className="p-3 bg-[#F8FAF9] rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Gender & Age</span>
                <p className="font-extrabold text-slate-800 mt-0.5">{selectedAnimalForModal.gender} • {selectedAnimalForModal.approxAge || 'Not specified'}</p>
              </div>
              <div className="p-3 bg-[#F8FAF9] rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Cage / Location</span>
                <p className="font-extrabold text-slate-800 mt-0.5">{selectedAnimalForModal.cageNumber ? `Cage ${selectedAnimalForModal.cageNumber}` : 'Unassigned'}</p>
              </div>
              <div className="p-3 bg-[#F8FAF9] rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Facility</span>
                <p className="font-extrabold text-slate-800 mt-0.5">{selectedAnimalForModal.shelterName || 'Central Registry'}</p>
              </div>
            </div>

            <div className="p-4 bg-[#F8FAF9] rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Health Condition</span>
                <p className="font-extrabold text-slate-800 mt-0.5">{selectedAnimalForModal.healthCondition || 'Healthy'}</p>
              </div>
              <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                selectedAnimalForModal.status === 'Available' || selectedAnimalForModal.status === 'Rescued'
                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                  : 'bg-amber-500/10 text-amber-700 border-amber-200/50'
              }`}>
                {selectedAnimalForModal.status}
              </span>
            </div>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowAnimalDetailsModal(false);
                  setSelectedAnimalForModal(null);
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ SHELTER DETAILS MODAL ══ */}
      {showShelterDetailsModal && selectedShelterForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#237737]/10 text-[#237737] font-black flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">
                      {selectedShelterForModal.shelterName}
                    </h3>
                    <span className="px-2.5 py-0.5 bg-[#237737]/10 border border-[#237737]/30 text-[#237737] text-xs font-black rounded-lg">
                      {selectedShelterForModal.shelterNumber || 'SH-0001'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    {selectedShelterForModal.userId?.fullName
                      ? `Manager: ${selectedShelterForModal.userId.fullName} (${selectedShelterForModal.userId.email})`
                      : 'Managed directly by System Admin'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowShelterDetailsModal(false);
                  setSelectedShelterForModal(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                selectedShelterForModal.status !== 'Inactive'
                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                  : 'bg-rose-500/10 text-rose-700 border-rose-200/50'
              }`}>
                Account: {selectedShelterForModal.status !== 'Inactive' ? 'Active' : 'Inactive'}
              </span>

              <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                (selectedShelterForModal.currentStatus || selectedShelterForModal.status) === 'OPEN'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : (selectedShelterForModal.currentStatus || selectedShelterForModal.status) === 'FULL'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : (selectedShelterForModal.currentStatus || selectedShelterForModal.status) === 'UNDER_MAINTENANCE'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                Operational: {selectedShelterForModal.currentStatus || selectedShelterForModal.status || 'OPEN'}
              </span>

              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Type: {selectedShelterForModal.registrationType?.replace(/_/g, ' ') || 'STATE TRUST SOCIETY'}
              </span>
            </div>

            {/* Facility Details Grid */}
            <div className="bg-[#F8FAF9] rounded-2xl p-4 border border-slate-100 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Contact Email</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">{selectedShelterForModal.shelterEmail}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Phone Number</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">+91 {selectedShelterForModal.shelterPhoneNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Registration Number</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">{selectedShelterForModal.registrationNumber || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">GPS Coordinates</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {selectedShelterForModal.latitude?.toFixed(5)}, {selectedShelterForModal.longitude?.toFixed(5)}
                  </p>
                </div>
              </div>

              {/* Capacity details */}
              <div className="pt-2 border-t border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Cage Capacity: {selectedShelterForModal.occupiedCages || 0} / {selectedShelterForModal.totalCages || 0}</span>
                  <span className="text-emerald-700 font-extrabold">
                    {selectedShelterForModal.totalCages > 0
                      ? `${Math.round(((selectedShelterForModal.occupiedCages || 0) / selectedShelterForModal.totalCages) * 100)}% occupied (${(selectedShelterForModal.totalCages - (selectedShelterForModal.occupiedCages || 0))} available)`
                      : '0 available'}
                  </span>
                </div>
                <div className="h-2 bg-slate-200/80 rounded-full w-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#237737] transition-all"
                    style={{
                      width: `${
                        selectedShelterForModal.totalCages > 0
                          ? Math.min(
                              Math.round(
                                ((selectedShelterForModal.occupiedCages || 0) /
                                  selectedShelterForModal.totalCages) *
                                  100
                              ),
                              100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1">
                  <span>Staff Strength: {selectedShelterForModal.totalStaffs || 0} certified members</span>
                  {selectedShelterForModal.shelterApplicationId && (
                    <span>Origin: Application #{selectedShelterForModal.shelterApplicationId}</span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <span>
                  Registered: {new Date(selectedShelterForModal.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span>
                  Updated: {new Date(selectedShelterForModal.updatedAt || selectedShelterForModal.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => handleToggleShelterStatus(selectedShelterForModal)}
                disabled={shelterActionLoading[selectedShelterForModal._id]}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-2 ${
                  selectedShelterForModal.status !== 'Inactive'
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}
              >
                {shelterActionLoading[selectedShelterForModal._id] ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : selectedShelterForModal.status !== 'Inactive' ? (
                  'Deactivate Shelter'
                ) : (
                  'Activate Shelter'
                )}
              </button>

              <button
                onClick={() => {
                  setShowShelterDetailsModal(false);
                  setSelectedShelterForModal(null);
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ══ APPLICATION DETAILS MODAL ══ */}
      {showApplicationDetailsModal && selectedApplicationForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#237737]/10 text-[#237737] font-black flex items-center justify-center shrink-0">
                  {selectedApplicationForModal._appType === 'Vet' ? (
                    <Stethoscope className="w-6 h-6 text-teal-600" />
                  ) : selectedApplicationForModal._appType === 'Rescue' ? (
                    <Truck className="w-6 h-6 text-blue-600" />
                  ) : selectedApplicationForModal._appType === 'Volunteer' ? (
                    <HeartHandshake className="w-6 h-6 text-rose-600" />
                  ) : (
                    <Building2 className="w-6 h-6 text-[#237737]" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">
                      {selectedApplicationForModal._name || 'Application Details'}
                    </h3>
                    {selectedApplicationForModal._id2 && (
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-black rounded-lg">
                        #{selectedApplicationForModal._id2}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    {selectedApplicationForModal._subLabel || 'Registration Review'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowApplicationDetailsModal(false);
                  setSelectedApplicationForModal(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                selectedApplicationForModal.status === 'Approved'
                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                  : selectedApplicationForModal.status === 'Rejected'
                  ? 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                  : selectedApplicationForModal.status === 'Site Visit'
                  ? 'bg-blue-500/10 text-blue-700 border-blue-200/50'
                  : 'bg-amber-500/10 text-amber-700 border-amber-200/50'
              }`}>
                Review Status: {selectedApplicationForModal.status}
              </span>

              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#237737]/10 text-[#237737] border border-[#237737]/30">
                Type: {selectedApplicationForModal._appType} Application
              </span>
            </div>

            {/* Application Information Grid */}
            <div className="bg-[#F8FAF9] rounded-2xl p-4 border border-slate-100 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Contact Person / Lead</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {selectedApplicationForModal.applicantId?.fullName ||
                      selectedApplicationForModal.userId?.fullName ||
                      selectedApplicationForModal.applicantName ||
                      selectedApplicationForModal.teamLead ||
                      selectedApplicationForModal.volunteerName ||
                      selectedApplicationForModal._name}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Contact Email</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">{selectedApplicationForModal._contact}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Phone Number</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    +91 {selectedApplicationForModal.shelterPhoneNumber || selectedApplicationForModal.phone || 'Not provided'}
                  </p>
                </div>

                {/* Specific Fields per Type */}
                {selectedApplicationForModal._appType === 'Shelter' && (
                  <>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[10px]">Registration Type</span>
                      <p className="font-extrabold text-slate-800 mt-0.5">{selectedApplicationForModal.registrationType || 'STATE TRUST SOCIETY'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[10px]">Registration Number</span>
                      <p className="font-extrabold text-slate-800 mt-0.5">{selectedApplicationForModal.registrationNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[10px]">Facility Capacity</span>
                      <p className="font-extrabold text-slate-800 mt-0.5">{selectedApplicationForModal.occupiedCages || 0} / {selectedApplicationForModal.totalCages || 0} cages</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[10px]">GPS Coordinates</span>
                      <p className="font-extrabold text-slate-800 mt-0.5">
                        {selectedApplicationForModal.latitude?.toFixed(4)}, {selectedApplicationForModal.longitude?.toFixed(4)}
                      </p>
                    </div>
                  </>
                )}

                {selectedApplicationForModal._appType === 'Vet' && (
                  <>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[10px]">Clinic / Hospital</span>
                      <p className="font-extrabold text-slate-800 mt-0.5">{selectedApplicationForModal.clinicName || 'Private Practice'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[10px]">Registration / VCI Number</span>
                      <p className="font-extrabold text-slate-800 mt-0.5">{selectedApplicationForModal.registrationNumber}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[10px]">Qualification</span>
                      <p className="font-extrabold text-slate-800 mt-0.5">{selectedApplicationForModal.qualification}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[10px]">Clinical Experience</span>
                      <p className="font-extrabold text-slate-800 mt-0.5">{selectedApplicationForModal.experienceYears} Years</p>
                    </div>
                  </>
                )}

                {selectedApplicationForModal._appType === 'Rescue' && (
                  <>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[10px]">Coverage Territory</span>
                      <p className="font-extrabold text-slate-800 mt-0.5">{selectedApplicationForModal.coverageZone}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[10px]">Fleet & Equipment</span>
                      <p className="font-extrabold text-slate-800 mt-0.5">{selectedApplicationForModal.vehicleFleet}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[10px]">Active Members</span>
                      <p className="font-extrabold text-slate-800 mt-0.5">{selectedApplicationForModal.memberCount} certified operatives</p>
                    </div>
                  </>
                )}

                {selectedApplicationForModal._appType === 'Volunteer' && (
                  <>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[10px]">City / Location</span>
                      <p className="font-extrabold text-slate-800 mt-0.5">{selectedApplicationForModal.city}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[10px]">Availability</span>
                      <p className="font-extrabold text-slate-800 mt-0.5">{selectedApplicationForModal.availability}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 font-bold block uppercase text-[10px]">Interests / Service Areas</span>
                      <p className="font-extrabold text-slate-800 mt-0.5">{Array.isArray(selectedApplicationForModal.interests) ? selectedApplicationForModal.interests.join(', ') : selectedApplicationForModal.interests}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Site Visit Section for Shelter Applications */}
              {selectedApplicationForModal._appType === 'Shelter' && (selectedApplicationForModal.siteVisitScheduleDate || selectedApplicationForModal.status === 'Site Visit') && (
                <div className="pt-3 border-t border-slate-200/80 space-y-2 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-1.5 text-blue-900 font-black text-xs">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Physical Site Visit & Valuation Period</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 font-bold block">Valuation Scheduled Date</span>
                      <p className="font-black text-blue-900 mt-0.5">
                        {selectedApplicationForModal.siteVisitScheduleDate
                          ? new Date(selectedApplicationForModal.siteVisitScheduleDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                          : 'Pending schedule'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">Valuation Window / Slot</span>
                      <p className="font-bold text-slate-800 mt-0.5">{selectedApplicationForModal.siteVisitValuationPeriod || 'Standard Evaluation Window'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">Assigned Auditor</span>
                      <p className="font-bold text-slate-800 mt-0.5">{selectedApplicationForModal.siteVisitInspector || 'Admin Field Officer'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">Inspection Notes / Instructions</span>
                      <p className="font-semibold text-slate-700 mt-0.5 italic">{selectedApplicationForModal.siteVisitNotes || 'Standard facility verification'}</p>
                    </div>
                  </div>

                  {/* Site Visit Report */}
                  {selectedApplicationForModal.siteVisitReport && (
                    <div className="pt-2 border-t border-blue-200/60 mt-2">
                      <span className="text-blue-900 font-bold block uppercase text-[10px]">Official Site Inspection & Valuation Report</span>
                      <p className="font-medium text-slate-800 mt-1 bg-white p-2.5 rounded-lg border border-blue-100 text-xs">
                        {selectedApplicationForModal.siteVisitReport}
                      </p>
                      {selectedApplicationForModal.siteVisitReportDate && (
                        <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                          Report Filed: {new Date(selectedApplicationForModal.siteVisitReportDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Review Note */}
              {selectedApplicationForModal.reviewNote && !selectedApplicationForModal.siteVisitReport && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Admin Review Note</span>
                  <p className="font-semibold text-slate-700 mt-0.5 italic">{selectedApplicationForModal.reviewNote}</p>
                </div>
              )}

              {/* Submitted timestamp */}
              <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-400 font-semibold">
                Submitted: {selectedApplicationForModal._submittedAt
                  ? new Date(selectedApplicationForModal._submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : 'N/A'}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              {selectedApplicationForModal._appType === 'Shelter' ? (
                <div className="flex items-center gap-2">
                  {selectedApplicationForModal.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => {
                          setShowApplicationDetailsModal(false);
                          handleOpenScheduleSiteVisit(selectedApplicationForModal);
                        }}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <Calendar className="w-4 h-4" /> Schedule Site Visit
                      </button>
                      <button
                        onClick={() => {
                          handleReviewApplication(selectedApplicationForModal._id, 'Rejected');
                          setShowApplicationDetailsModal(false);
                          setSelectedApplicationForModal(null);
                        }}
                        className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </>
                  )}

                  {selectedApplicationForModal.status === 'Site Visit' && (
                    <>
                      <button
                        onClick={() => {
                          setShowApplicationDetailsModal(false);
                          handleOpenReportModal(selectedApplicationForModal);
                        }}
                        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <FileText className="w-4 h-4" /> Upload Report & Decide
                      </button>
                      <button
                        onClick={() => {
                          setShowApplicationDetailsModal(false);
                          handleOpenScheduleSiteVisit(selectedApplicationForModal);
                        }}
                        className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Reschedule
                      </button>
                    </>
                  )}

                  {(selectedApplicationForModal.status === 'Approved' || selectedApplicationForModal.status === 'Rejected') && (
                    <span className="text-xs font-bold text-slate-400">
                      Application {selectedApplicationForModal.status.toLowerCase()}.
                    </span>
                  )}
                </div>
              ) : (
                /* Vet, Rescue, Volunteer actions */
                <div className="flex items-center gap-2">
                  {selectedApplicationForModal.status === 'Pending' ? (
                    <>
                      <button
                        onClick={() => {
                          if (selectedApplicationForModal._appType === 'Vet') {
                            handleReviewVetApp(selectedApplicationForModal.id, 'Approved');
                          } else if (selectedApplicationForModal._appType === 'Rescue') {
                            handleReviewRescueApp(selectedApplicationForModal.id, 'Approved');
                          } else if (selectedApplicationForModal._appType === 'Volunteer') {
                            handleReviewVolunteerApp(selectedApplicationForModal.id, 'Approved');
                          }
                          setShowApplicationDetailsModal(false);
                          setSelectedApplicationForModal(null);
                        }}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve Application
                      </button>

                      <button
                        onClick={() => {
                          if (selectedApplicationForModal._appType === 'Vet') {
                            handleReviewVetApp(selectedApplicationForModal.id, 'Rejected');
                          } else if (selectedApplicationForModal._appType === 'Rescue') {
                            handleReviewRescueApp(selectedApplicationForModal.id, 'Rejected');
                          } else if (selectedApplicationForModal._appType === 'Volunteer') {
                            handleReviewVolunteerApp(selectedApplicationForModal.id, 'Rejected');
                          }
                          setShowApplicationDetailsModal(false);
                          setSelectedApplicationForModal(null);
                        }}
                        className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">
                      Application {selectedApplicationForModal.status.toLowerCase()}.
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  setShowApplicationDetailsModal(false);
                  setSelectedApplicationForModal(null);
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ══ SITE VISIT & VALUATION PERIOD SCHEDULER MODAL ══ */}
      {showSiteVisitModal && selectedAppForSiteVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 font-black flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">
                      Schedule Site Visit
                    </h3>
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-black rounded-lg border border-blue-200">
                      Valuation Period
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    {selectedAppForSiteVisit.shelterName} ({selectedAppForSiteVisit.shelterApplicationId || 'SA-0001'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSiteVisitModal(false);
                  setSelectedAppForSiteVisit(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Notice */}
            <div className="p-3.5 bg-blue-50 border border-blue-200/70 rounded-2xl text-xs text-blue-900 space-y-1">
              <p className="font-extrabold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                Mandatory Physical Inspection Process
              </p>
              <p className="text-blue-700 text-[11px] leading-relaxed">
                Admins must schedule a valuation period date to physically inspect facility cages, veterinary hygiene, and safety compliance before granting approval.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmScheduleSiteVisit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">
                    Valuation Period Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={siteVisitDate}
                    onChange={(e) => setSiteVisitDate(e.target.value)}
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">
                    Valuation Window / Slot
                  </label>
                  <input
                    type="text"
                    value={siteVisitValuationPeriod}
                    onChange={(e) => setSiteVisitValuationPeriod(e.target.value)}
                    placeholder="e.g. 10:00 AM - 1:00 PM or 3-Day Window"
                    className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">
                  Assigned Auditor / Field Inspector
                </label>
                <input
                  type="text"
                  value={siteVisitInspector}
                  onChange={(e) => setSiteVisitInspector(e.target.value)}
                  placeholder="e.g. Admin / Field Officer Name"
                  className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">
                  Inspection Notes & Shelter Instructions
                </label>
                <textarea
                  value={siteVisitNotes}
                  onChange={(e) => setSiteVisitNotes(e.target.value)}
                  rows="3"
                  placeholder="e.g. Keep trust registration documents, cage cleanliness registers, and veterinary agreements ready."
                  className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] resize-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSiteVisitModal(false);
                    setSelectedAppForSiteVisit(null);
                  }}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={siteVisitSubmitting}
                  className="w-2/3 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-blue-600/15 flex items-center justify-center gap-2"
                >
                  {siteVisitSubmitting ? (
                    <><Clock className="w-4 h-4 animate-spin" /> Scheduling Visit…</>
                  ) : (
                    <><Check className="w-4 h-4" /> Confirm & Set Valuation Date</>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ══ SITE VISIT INSPECTION REPORT & DECISION MODAL ══ */}
      {showReportModal && selectedAppForReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 font-black flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">
                      Site Visit Report & Decision
                    </h3>
                    <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 text-xs font-black rounded-lg border border-purple-200">
                      Evaluation
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    {selectedAppForReport.shelterName} ({selectedAppForReport.shelterApplicationId || 'SA-0001'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setSelectedAppForReport(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Facility Context Summary */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-[#F8FAF9] p-3 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Valuation Date</span>
                <p className="font-extrabold text-slate-800 mt-0.5">
                  {selectedAppForReport.siteVisitScheduleDate
                    ? new Date(selectedAppForReport.siteVisitScheduleDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Facility Capacity</span>
                <p className="font-extrabold text-slate-800 mt-0.5">
                  {selectedAppForReport.occupiedCages || 0} / {selectedAppForReport.totalCages || 0} Cages • {selectedAppForReport.totalStaffs || 0} Staff
                </p>
              </div>
            </div>

            {/* Report Form */}
            <form onSubmit={handleSubmitSiteVisitReport} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Physical Site Visit Inspection & Valuation Report <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={siteVisitReportText}
                  onChange={(e) => setSiteVisitReportText(e.target.value)}
                  rows="4"
                  required
                  placeholder="Document physical observations regarding facility cages, ventilation, hygiene, water access, staff readiness, and regulatory compliance..."
                  className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] resize-none"
                ></textarea>
              </div>

              {/* Decision Options */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-700">
                  Audit Outcome Decision <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => setReportDecision('Approved')}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                      reportDecision === 'Approved'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-[#F8FAF9] border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="reportDecision"
                        checked={reportDecision === 'Approved'}
                        onChange={() => setReportDecision('Approved')}
                        className="accent-emerald-600"
                      />
                      <span className="font-black text-xs text-emerald-800">Pass & Approve</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium mt-1">
                      Registers facility, assigns sequential ID & emails shelter login credentials.
                    </span>
                  </label>

                  <label
                    onClick={() => setReportDecision('Rejected')}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                      reportDecision === 'Rejected'
                        ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-xs'
                        : 'bg-[#F8FAF9] border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="reportDecision"
                        checked={reportDecision === 'Rejected'}
                        onChange={() => setReportDecision('Rejected')}
                        className="accent-rose-600"
                      />
                      <span className="font-black text-xs text-rose-800">Fail & Reject</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium mt-1">
                      Declines application with inspection findings and notifies applicant.
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReportModal(false);
                    setSelectedAppForReport(null);
                  }}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportSubmitting || !siteVisitReportText.trim()}
                  className={`w-2/3 py-2.5 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                    reportDecision === 'Approved'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/15'
                      : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/15'
                  }`}
                >
                  {reportSubmitting ? (
                    <><Clock className="w-4 h-4 animate-spin" /> Submitting Report…</>
                  ) : reportDecision === 'Approved' ? (
                    <><Check className="w-4 h-4" /> Approve Registration</>
                  ) : (
                    <><XCircle className="w-4 h-4" /> Reject Application</>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
