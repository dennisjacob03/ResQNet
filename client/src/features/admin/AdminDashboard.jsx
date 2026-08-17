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

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Admin Dashboard');
  const [subTab, setSubTab] = useState('Overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

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

  const handleUpdateShelterStatus = async (shelterId, newStatus) => {
    try {
      const res = await updateShelter(shelterId, { status: newStatus });
      if (res.success) {
        setSheltersList(prev =>
          prev.map(s => s._id === shelterId ? res.shelter : s)
        );
      }
    } catch (err) {
      console.error('Update status failed:', err.message);
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
          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {[
              { name: 'Admin Dashboard', icon: TrendingUp },
              { name: 'Manage Users', icon: Users },
              { name: 'Manage Shelters', icon: Building2 },
              {
                name: 'Manage Applications',
                icon: ClipboardList,
                badge:
                  (shelterApplications.filter((a) => a.status === 'Pending').length +
                    vetApplications.filter((a) => a.status === 'Pending').length +
                    rescueTeamApplications.filter((a) => a.status === 'Pending').length +
                    volunteerApplications.filter((a) => a.status === 'Pending').length) ||
                  null,
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
            <h2 className="text-lg font-bold text-slate-900">
              {subTab === 'My Profile'
                ? 'Administrator Profile'
                : subTab === 'Manage Shelters' || subTab === 'Shelters'
                ? 'Manage Shelters'
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
                ? 'AI Distress & Breed Analysis Module'
                : subTab === 'Smart Collar'
                ? 'IoT Smart Collar Fleet Management'
                : 'Admin Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4.5">
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
              {subTab === 'Manage Shelters' || subTab === 'Shelters' ? (
                <>
                  <button
                    onClick={loadShelters}
                    className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-400" /> Refresh
                  </button>
                  <button
                    onClick={() => setShowAddShelterModal(true)}
                    className="px-4.5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow shadow-[#237737]/10"
                  >
                    <Plus className="w-4 h-4" /> Add Shelter
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
                  <button 
                    onClick={() => setShowAddUserModal(true)}
                    className="px-4.5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow shadow-[#237737]/10"
                  >
                    <Plus className="w-4 h-4" /> Add User
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
                  <button 
                    onClick={() => {
                      setNewUserRole('Veterinary Staff');
                      setShowAddUserModal(true);
                    }}
                    className="px-4.5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow shadow-[#237737]/10"
                  >
                    <Plus className="w-4 h-4" /> Add Vet Account
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
                  <button 
                    onClick={() => {
                      setNewUserRole('Rescue Team');
                      setShowAddUserModal(true);
                    }}
                    className="px-4.5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow shadow-[#237737]/10"
                  >
                    <Plus className="w-4 h-4" /> Register Rescue Team
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
                  <button 
                    onClick={() => {
                      setNewUserRole('Public User');
                      setShowAddUserModal(true);
                    }}
                    className="px-4.5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow shadow-[#237737]/10"
                  >
                    <Plus className="w-4 h-4" /> Add Volunteer
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
                  <button 
                    onClick={() => setShowAddUserModal(true)}
                    className="px-4.5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow shadow-[#237737]/10"
                  >
                    <Plus className="w-4 h-4" /> Add User
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
                      Registered users will automatically appear here. You can also directly create an account using the "+ Add User" button.
                    </p>
                    <button
                      onClick={() => setShowAddUserModal(true)}
                      className="mt-2 px-5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
                    >
                      + Add New User
                    </button>
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
                          <th className="pb-3.5">Verification</th>
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

                                {/* Verification Column */}
                                <td className="py-4">
                                  <div className="flex flex-col gap-1">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                        u.isEmailVerified
                                          ? 'bg-emerald-50 text-emerald-700'
                                          : 'bg-slate-100 text-slate-400'
                                      }`}
                                    >
                                      <Check className={`w-3 h-3 ${u.isEmailVerified ? 'text-emerald-600' : 'text-slate-300'}`} />
                                      Email
                                    </span>
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                        u.isPhoneVerified
                                          ? 'bg-emerald-50 text-emerald-700'
                                          : 'bg-slate-100 text-slate-400'
                                      }`}
                                    >
                                      <Check className={`w-3 h-3 ${u.isPhoneVerified ? 'text-emerald-600' : 'text-slate-300'}`} />
                                      Phone
                                    </span>
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

                                    {/* Delete User */}
                                    <button
                                      onClick={() => handleDeleteUser(u)}
                                      disabled={userActionLoading[userId]}
                                      title="Delete Account"
                                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer disabled:opacity-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
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

          {/* Sub-Tab 3: Shelters Management (Real Dynamic Shelter Schema & S01, S02 IDs) */}
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
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Facilities</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {sheltersList.filter(s => s.status === 'OPEN').length}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 mt-0.5">Available for intake</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full / Maxed</div>
                  <div className="text-2xl font-black text-rose-600 mt-1">
                    {sheltersList.filter(s => s.status === 'FULL').length}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 mt-0.5">At 100% capacity</div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Cage Spaces</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {sheltersList.reduce((acc, s) => acc + (s.occupiedCages || 0), 0)} / {sheltersList.reduce((acc, s) => acc + (s.totalCages || 0), 0)}
                  </div>
                  <div className="text-[10px] font-bold text-blue-600 mt-0.5">
                    {sheltersList.reduce((acc, s) => acc + (s.totalCages || 0), 0) > 0
                      ? `${Math.round((sheltersList.reduce((acc, s) => acc + (s.occupiedCages || 0), 0) / sheltersList.reduce((acc, s) => acc + (s.totalCages || 0), 0)) * 100)}% occupied`
                      : '0% occupied'}
                  </div>
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
                      placeholder="Search shelter by name, S01, or email…"
                      className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#237737] transition"
                    />
                    <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1">
                    {['All', 'OPEN', 'FULL', 'UNDER_MAINTENANCE', 'CLOSED'].map((st) => (
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
                  {sheltersList.length} total registered
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
                  <button
                    onClick={() => setShowAddShelterModal(true)}
                    className="mt-2 px-5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
                  >
                    + Add Shelter Now
                  </button>
                </div>
              )}

              {/* Shelters Grid / Cards */}
              {!sheltersLoading && sheltersList.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {sheltersList
                    .filter((s) => {
                      const q = shelterSearchQuery.toLowerCase();
                      const matchSearch =
                        !q ||
                        s.shelterName?.toLowerCase().includes(q) ||
                        s.shelterNumber?.toLowerCase().includes(q) ||
                        s.shelterEmail?.toLowerCase().includes(q);
                      const matchStatus =
                        shelterFilterStatus === 'All' || s.status === shelterFilterStatus;
                      return matchSearch && matchStatus;
                    })
                    .map((shelter) => {
                      const occupancyRate =
                        shelter.totalCages > 0
                          ? Math.round((shelter.occupiedCages / shelter.totalCages) * 100)
                          : 0;

                      return (
                        <div
                          key={shelter._id}
                          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between"
                        >
                          <div>
                            {/* Header row: shelterNumber badge, status badge */}
                            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                              <div className="flex items-center gap-2.5">
                                <span className="px-3 py-1 bg-[#237737]/10 border border-[#237737]/30 text-[#237737] font-black text-sm rounded-xl">
                                  {shelter.shelterNumber || 'SH-0001'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <select
                                  value={shelter.status}
                                  onChange={(e) => handleUpdateShelterStatus(shelter._id, e.target.value)}
                                  className={`px-3 py-1 text-xs font-extrabold rounded-xl border transition cursor-pointer ${
                                    shelter.status === 'OPEN'
                                      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
                                      : shelter.status === 'FULL'
                                      ? 'bg-rose-500/10 text-rose-700 border-rose-200'
                                      : shelter.status === 'UNDER_MAINTENANCE'
                                      ? 'bg-amber-500/10 text-amber-700 border-amber-200'
                                      : 'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}
                                >
                                  <option value="OPEN">● OPEN</option>
                                  <option value="FULL">● FULL</option>
                                  <option value="UNDER_MAINTENANCE">● UNDER MAINTENANCE</option>
                                  <option value="CLOSED">● CLOSED</option>
                                </select>

                                <button
                                  onClick={() => handleDeleteShelter(shelter._id)}
                                  title="Delete Shelter"
                                  className="p-1.5 text-slate-350 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Main Info */}
                            <div className="mt-4 space-y-1">
                              <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-[#237737] shrink-0" />
                                {shelter.shelterName}
                              </h3>
                              <p className="text-xs text-slate-400 font-semibold pl-7">
                                {shelter.userId?.fullName ? `Manager: ${shelter.userId.fullName} (${shelter.userId.email})` : 'Managed directly by System Admin'}
                              </p>
                            </div>

                            {/* Contact & Location Grid */}
                            <div className="grid grid-cols-2 gap-2.5 mt-4 text-xs font-semibold">
                              <div className="p-3 bg-[#F8FAF9] rounded-xl flex items-center gap-2 text-slate-700">
                                <Phone className="w-3.5 h-3.5 text-[#237737] shrink-0" />
                                <span className="truncate">+91 {shelter.shelterPhoneNumber}</span>
                              </div>
                              <div className="p-3 bg-[#F8FAF9] rounded-xl flex items-center gap-2 text-slate-700">
                                <MapPin className="w-3.5 h-3.5 text-[#237737] shrink-0" />
                                <span className="truncate">{shelter.latitude?.toFixed(4)}, {shelter.longitude?.toFixed(4)}</span>
                              </div>
                            </div>

                            {/* Capacity Visual Progress Bar */}
                            <div className="mt-4 p-4 bg-[#F8FAF9] rounded-2xl border border-slate-100 space-y-2">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                                <span className="flex items-center gap-1.5">
                                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                                  Cage Occupancy: {shelter.occupiedCages} / {shelter.totalCages}
                                </span>
                                <span className={occupancyRate >= 90 ? 'text-rose-600' : 'text-slate-700'}>
                                  {occupancyRate}% ({shelter.totalCages - shelter.occupiedCages} vacant)
                                </span>
                              </div>

                              <div className="h-2 bg-slate-200/80 rounded-full w-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    occupancyRate >= 90
                                      ? 'bg-rose-500'
                                      : occupancyRate >= 70
                                      ? 'bg-amber-500'
                                      : 'bg-[#237737]'
                                  }`}
                                  style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pt-0.5">
                                <span>Staff: {shelter.totalStaffs} members</span>
                                <span>Email: {shelter.shelterEmail}</span>
                              </div>
                            </div>
                          </div>

                          {/* Footer Tag */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
                            <span>
                              {shelter.shelterApplicationId
                                ? `Created from Application #${shelter.shelterApplicationId}`
                                : 'Created directly by Admin'}
                            </span>
                            <span>
                              Added {new Date(shelter.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

            </div>
          )}

          {/* Sub-Tab 4: Manage Applications (Shelter, Vet, Rescue, Volunteer) */}
          {(subTab === 'Manage Applications' || subTab === 'Shelter Applications') && (
            <div className="space-y-6">

              {/* Application Category Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  {
                    id: 'Shelter',
                    label: '🏢 Shelter Registrations',
                    count: shelterApplications.length,
                    pending: shelterApplications.filter((a) => a.status === 'Pending').length,
                  },
                  {
                    id: 'Vet',
                    label: '🩺 Vet Staff Applications',
                    count: vetApplications.length,
                    pending: vetApplications.filter((a) => a.status === 'Pending').length,
                  },
                  {
                    id: 'Rescue',
                    label: '🚑 Rescue Team Applications',
                    count: rescueTeamApplications.length,
                    pending: rescueTeamApplications.filter((a) => a.status === 'Pending').length,
                  },
                  {
                    id: 'Volunteer',
                    label: '🤝 Volunteer Applications',
                    count: volunteerApplications.length,
                    pending: volunteerApplications.filter((a) => a.status === 'Pending').length,
                  },
                ].map((cat) => {
                  const isCatActive = applicationsCategoryTab === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setApplicationsCategoryTab(cat.id)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                        isCatActive
                          ? 'bg-[#237737] text-white shadow-md shadow-[#237737]/15'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          isCatActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cat.count}
                      </span>
                      {cat.pending > 0 && (
                        <span className="px-1.5 py-0.2 bg-amber-400 text-amber-950 text-[10px] font-black rounded-full">
                          {cat.pending} pending
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ═══ CATEGORY 1: SHELTER REGISTRATION APPLICATIONS ═══ */}
              {applicationsCategoryTab === 'Shelter' && (
                <div className="space-y-5">
                  {/* Search & Status Filter Bar for Shelter Applications */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      <div className="relative w-full sm:w-72">
                        <input
                          type="text"
                          value={shelterAppSearchQuery}
                          onChange={(e) => setShelterAppSearchQuery(e.target.value)}
                          placeholder="Search by shelter name, email, reg#…"
                          className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#237737] transition"
                        />
                        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                      </div>

                      <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1">
                        {['All', 'Pending', 'Approved', 'Rejected'].map((st) => (
                          <button
                            key={st}
                            onClick={() => setShelterAppFilterStatus(st)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                              shelterAppFilterStatus === st
                                ? 'bg-[#237737] text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                          >
                            {st === 'All' ? 'All Applications' : st}
                            {st === 'Pending' && shelterApplications.filter(a => a.status === 'Pending').length > 0 && (
                              <span className="ml-1.5 px-1.5 py-0.2 bg-amber-400 text-amber-950 text-[10px] rounded-full font-black">
                                {shelterApplications.filter(a => a.status === 'Pending').length}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs font-extrabold text-slate-400">
                      {shelterApplications.length} shelter applications
                    </div>
                  </div>

                  {shelterAppsLoading && (
                    <div className="p-6 bg-white border border-slate-100 rounded-2xl text-slate-400 text-sm font-semibold animate-pulse flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Loading shelter applications…
                    </div>
                  )}

                  {!shelterAppsLoading && shelterApplications.length === 0 && (
                    <div className="p-10 bg-white border border-slate-100 rounded-2xl text-center">
                      <div className="p-4 bg-slate-100 rounded-2xl w-fit mx-auto mb-3">
                        <ClipboardList className="w-7 h-7 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-semibold text-sm">No shelter applications yet.</p>
                      <p className="text-slate-400 font-medium text-xs mt-1">Applications submitted by users will appear here.</p>
                    </div>
                  )}

                  {!shelterAppsLoading && shelterApplications.length > 0 && (
                    <div className="space-y-4">
                      {shelterApplications
                        .filter((app) => {
                          const q = shelterAppSearchQuery.toLowerCase().trim();
                          const matchSearch =
                            !q ||
                            app.shelterName?.toLowerCase().includes(q) ||
                            app.shelterEmail?.toLowerCase().includes(q) ||
                            app.registrationNumber?.toLowerCase().includes(q) ||
                            app.shelterApplicationId?.toLowerCase().includes(q) ||
                            app.applicantId?.fullName?.toLowerCase().includes(q) ||
                            app.userId?.fullName?.toLowerCase().includes(q);
                          const matchStatus =
                            shelterAppFilterStatus === 'All' || app.status === shelterAppFilterStatus;
                          return matchSearch && matchStatus;
                        })
                        .map((app) => (
                        <div key={app._id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                          {/* Application Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-[#237737]/10 text-[#237737] rounded-xl">
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-extrabold text-slate-900 text-sm">{app.shelterName}</h4>
                                  <span className="text-[10px] text-slate-400 font-bold">#{app.shelterApplicationId}</span>
                                  {app.shelter && (
                                    <span className="px-2 py-0.5 bg-[#237737]/10 border border-[#237737]/30 text-[#237737] text-[10px] font-black rounded-lg">
                                      {app.shelter.shelterNumber}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                                  Reg ({app.registrationType || 'STATE_TRUST_SOCIETY'}): {app.registrationNumber}
                                </p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 text-[10px] font-black rounded-full border ${
                              app.status === 'Approved'
                                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
                                : app.status === 'Rejected'
                                ? 'bg-rose-500/10 text-rose-700 border-rose-200'
                                : 'bg-amber-500/10 text-amber-700 border-amber-200'
                            }`}>
                              {app.status}
                            </span>
                          </div>

                          {/* Applicant & Shelter Info Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div className="p-3 bg-[#F8FAF9] rounded-xl">
                              <div className="text-slate-400 font-bold mb-0.5">Applicant</div>
                              <div className="text-slate-800 font-extrabold">{app.applicantId?.fullName || app.userId?.fullName || 'N/A'}</div>
                              <div className="text-slate-500 font-semibold text-[10px]">{app.applicantId?.email || app.userId?.email}</div>
                            </div>
                            <div className="p-3 bg-[#F8FAF9] rounded-xl">
                              <div className="text-slate-400 font-bold mb-0.5">Shelter Contact</div>
                              <div className="text-slate-800 font-extrabold">{app.shelterEmail}</div>
                              <div className="text-slate-500 font-semibold text-[10px]">+91 {app.shelterPhoneNumber}</div>
                            </div>
                            <div className="p-3 bg-[#F8FAF9] rounded-xl">
                              <div className="text-slate-400 font-bold mb-0.5">Location</div>
                              <div className="text-slate-800 font-extrabold">{app.latitude?.toFixed(4)}, {app.longitude?.toFixed(4)}</div>
                              <div className="text-slate-500 font-semibold text-[10px]">Lat / Long</div>
                            </div>
                            <div className="p-3 bg-[#F8FAF9] rounded-xl">
                              <div className="text-slate-400 font-bold mb-0.5">Capacity</div>
                              <div className="text-slate-800 font-extrabold">{app.occupiedCages}/{app.totalCages} cages</div>
                              <div className="text-slate-500 font-semibold text-[10px]">{app.totalStaffs} staff members</div>
                            </div>
                          </div>

                          {/* Review Note + Action Buttons */}
                          {app.status === 'Pending' && (
                            <div className="space-y-3 pt-1 border-t border-slate-100">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Review Note (optional — shown to applicant on rejection)</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Missing valid registration document"
                                  value={shelterReviewNote[app._id] || ''}
                                  onChange={(e) => setShelterReviewNote(prev => ({ ...prev, [app._id]: e.target.value }))}
                                  className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] transition"
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleReviewApplication(app._id, 'Approved')}
                                  disabled={shelterReviewing[app._id]}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  {shelterReviewing[app._id] ? 'Processing…' : 'Approve & Create Shelter'}
                                </button>
                                <button
                                  onClick={() => handleReviewApplication(app._id, 'Rejected')}
                                  disabled={shelterReviewing[app._id]}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 disabled:opacity-60 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Reject
                                </button>
                              </div>
                            </div>
                          )}

                          {app.status !== 'Pending' && (
                            <div className="pt-1 border-t border-slate-100 text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                {app.status === 'Approved' ? (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>
                                      Approved — Shelter registered {app.shelter?.shelterNumber ? `as ${app.shelter.shelterNumber}` : ''}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                    <span>Rejected{app.reviewNote ? ` — ${app.reviewNote}` : ''}</span>
                                  </>
                                )}
                              </div>

                              <div className="text-[10px] text-slate-300 font-bold">
                                Submitted {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ═══ CATEGORY 2: VET STAFF REGISTRATION APPLICATIONS ═══ */}
              {applicationsCategoryTab === 'Vet' && (
                <div className="space-y-4">
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">Veterinary Council License & Clinic Verification Requests</span>
                    </div>
                    <div className="text-xs font-extrabold text-slate-400">
                      {vetApplications.length} total applications
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {vetApplications.map((v) => (
                      <div key={v.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-teal-500/10 text-teal-600 rounded-xl">
                              <Stethoscope className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-slate-900 text-sm">{v.applicantName}</h4>
                                <span className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200/50 text-[10px] font-bold rounded-lg">
                                  {v.registrationNumber}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                                {v.qualification} • {v.experienceYears} Years Clinical Experience
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-[10px] font-black rounded-full border ${
                            v.status === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
                              : v.status === 'Rejected'
                              ? 'bg-rose-500/10 text-rose-700 border-rose-200'
                              : 'bg-amber-500/10 text-amber-700 border-amber-200'
                          }`}>
                            {v.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div className="p-3 bg-[#F8FAF9] rounded-xl">
                            <div className="text-slate-400 font-bold mb-0.5">Clinic / Hospital</div>
                            <div className="text-slate-800 font-extrabold">{v.clinicName}</div>
                          </div>
                          <div className="p-3 bg-[#F8FAF9] rounded-xl">
                            <div className="text-slate-400 font-bold mb-0.5">Location</div>
                            <div className="text-slate-800 font-extrabold">{v.city}</div>
                          </div>
                          <div className="p-3 bg-[#F8FAF9] rounded-xl">
                            <div className="text-slate-400 font-bold mb-0.5">Email</div>
                            <div className="text-slate-800 font-extrabold">{v.email}</div>
                          </div>
                          <div className="p-3 bg-[#F8FAF9] rounded-xl">
                            <div className="text-slate-400 font-bold mb-0.5">Contact</div>
                            <div className="text-slate-800 font-extrabold">+91 {v.phone}</div>
                          </div>
                        </div>

                        {v.status === 'Pending' && (
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleReviewVetApp(v.id, 'Approved')}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve & Verify License
                            </button>
                            <button
                              onClick={() => handleReviewVetApp(v.id, 'Rejected')}
                              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══ CATEGORY 3: RESCUE TEAM REGISTRATION APPLICATIONS ═══ */}
              {applicationsCategoryTab === 'Rescue' && (
                <div className="space-y-4">
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">Rescue Squad Accreditation & Territory Coverage Requests</span>
                    </div>
                    <div className="text-xs font-extrabold text-slate-400">
                      {rescueTeamApplications.length} total applications
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {rescueTeamApplications.map((r) => (
                      <div key={r.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
                              <Truck className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-slate-900 text-sm">{r.teamName}</h4>
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/50 text-[10px] font-bold rounded-lg">
                                  Lead: {r.teamLead}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                                Coverage: {r.coverageZone}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-[10px] font-black rounded-full border ${
                            r.status === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
                              : r.status === 'Rejected'
                              ? 'bg-rose-500/10 text-rose-700 border-rose-200'
                              : 'bg-amber-500/10 text-amber-700 border-amber-200'
                          }`}>
                            {r.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div className="p-3 bg-[#F8FAF9] rounded-xl">
                            <div className="text-slate-400 font-bold mb-0.5">Fleet & Equipment</div>
                            <div className="text-slate-800 font-extrabold">{r.vehicleFleet}</div>
                          </div>
                          <div className="p-3 bg-[#F8FAF9] rounded-xl">
                            <div className="text-slate-400 font-bold mb-0.5">Operatives & Volunteers</div>
                            <div className="text-slate-800 font-extrabold">{r.memberCount} certified members</div>
                          </div>
                          <div className="p-3 bg-[#F8FAF9] rounded-xl">
                            <div className="text-slate-400 font-bold mb-0.5">Contact Lead</div>
                            <div className="text-slate-800 font-extrabold">{r.email} • +91 {r.phone}</div>
                          </div>
                        </div>

                        {r.status === 'Pending' && (
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleReviewRescueApp(r.id, 'Approved')}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve & Accredit Unit
                            </button>
                            <button
                              onClick={() => handleReviewRescueApp(r.id, 'Rejected')}
                              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══ CATEGORY 4: VOLUNTEER REGISTRATION APPLICATIONS ═══ */}
              {applicationsCategoryTab === 'Volunteer' && (
                <div className="space-y-4">
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">Community Volunteer Enlistment & Foster Program Applications</span>
                    </div>
                    <div className="text-xs font-extrabold text-slate-400">
                      {volunteerApplications.length} total applications
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {volunteerApplications.map((vol) => (
                      <div key={vol.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-xl">
                              <HeartHandshake className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-slate-900 text-sm">{vol.volunteerName}</h4>
                                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200/50 text-[10px] font-bold rounded-lg">
                                  {vol.city}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                                Availability: {vol.availability}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-[10px] font-black rounded-full border ${
                            vol.status === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
                              : vol.status === 'Rejected'
                              ? 'bg-rose-500/10 text-rose-700 border-rose-200'
                              : 'bg-amber-500/10 text-amber-700 border-amber-200'
                          }`}>
                            {vol.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div className="p-3 bg-[#F8FAF9] rounded-xl">
                            <div className="text-slate-400 font-bold mb-0.5">Interest Areas</div>
                            <div className="text-slate-800 font-extrabold">{vol.interests.join(', ')}</div>
                          </div>
                          <div className="p-3 bg-[#F8FAF9] rounded-xl">
                            <div className="text-slate-400 font-bold mb-0.5">Email</div>
                            <div className="text-slate-800 font-extrabold">{vol.email}</div>
                          </div>
                          <div className="p-3 bg-[#F8FAF9] rounded-xl">
                            <div className="text-slate-400 font-bold mb-0.5">Phone Number</div>
                            <div className="text-slate-800 font-extrabold">+91 {vol.phone}</div>
                          </div>
                        </div>

                        {vol.status === 'Pending' && (
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleReviewVolunteerApp(vol.id, 'Approved')}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve Volunteer
                            </button>
                            <button
                              onClick={() => handleReviewVolunteerApp(vol.id, 'Rejected')}
                              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

      {/* Add User Modal (Real MongoDB Registration) */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#237737]" /> Create User Account
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Directly add a verified account to the ResQNet platform database.
                </p>
              </div>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error & Success Messages */}
            {addUserSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-700 text-xs font-bold">
                <CheckCircle className="w-4 h-4 shrink-0" /> {addUserSuccess}
              </div>
            )}
            {addUserError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-700 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" /> {addUserError}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Full Name <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Dennis Jacob"
                  required
                  className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#237737] font-semibold text-xs transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Email Address <span className="text-rose-500">*</span></label>
                  <input 
                    type="email" 
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#237737] font-semibold text-xs transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Phone Number <span className="text-rose-500">*</span></label>
                  <input 
                    type="tel" 
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    maxLength={10}
                    required
                    className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#237737] font-semibold text-xs transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Password <span className="text-rose-500">*</span></label>
                  <input 
                    type="password" 
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    minLength={6}
                    required
                    className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#237737] font-semibold text-xs transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Role</label>
                  <select 
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#237737] font-bold text-xs transition cursor-pointer"
                  >
                    <option value="Public User">Public User</option>
                    <option value="Rescue Team">Rescue Team</option>
                    <option value="Shelter">Shelter</option>
                    <option value="Veterinary Staff">Veterinary Staff</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">City / Town</label>
                  <input 
                    type="text" 
                    value={newUserCity}
                    onChange={(e) => setNewUserCity(e.target.value)}
                    placeholder="e.g. Kottayam"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#237737] font-semibold text-xs transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">District</label>
                  <input 
                    type="text" 
                    value={newUserDistrict}
                    onChange={(e) => setNewUserDistrict(e.target.value)}
                    placeholder="e.g. Kottayam"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#237737] font-semibold text-xs transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">State</label>
                  <input 
                    type="text" 
                    value={newUserState}
                    onChange={(e) => setNewUserState(e.target.value)}
                    placeholder="e.g. Kerala"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#237737] font-semibold text-xs transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Street Address</label>
                  <input 
                    type="text" 
                    value={newUserAddress}
                    onChange={(e) => setNewUserAddress(e.target.value)}
                    placeholder="e.g. Main Road, Near Market"
                    className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#237737] font-semibold text-xs transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Pincode</label>
                  <input 
                    type="text" 
                    value={newUserPincode}
                    onChange={(e) => setNewUserPincode(e.target.value)}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#237737] font-semibold text-xs transition"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={addUserSubmitting}
                  className="w-2/3 py-3 bg-[#237737] hover:bg-[#1d632e] disabled:opacity-60 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-[#237737]/15 flex items-center justify-center gap-2"
                >
                  {addUserSubmitting ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Creating User…</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Save Account to Database</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Shelter Modal (Direct Admin Creation) */}
      {showAddShelterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#237737]" /> Add New Shelter
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Directly register a shelter facility. A unique shelter number (e.g. S01, S02...) will be generated.
                </p>
              </div>
              <button
                onClick={() => setShowAddShelterModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error / Success Messages */}
            {shelterFormSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-700 text-xs font-bold">
                <CheckCircle className="w-4 h-4 shrink-0" /> {shelterFormSuccess}
              </div>
            )}
            {shelterFormError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-700 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" /> {shelterFormError}
              </div>
            )}

            <form onSubmit={handleAddShelter} className="space-y-4">
              {/* Shelter Name & Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Shelter Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={addShelterName}
                  onChange={(e) => setAddShelterName(e.target.value)}
                  placeholder="e.g. Green Valley Animal Shelter"
                  required
                  className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#237737] text-xs font-semibold transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Shelter Email <span className="text-rose-500">*</span></label>
                  <input
                    type="email"
                    value={addShelterEmail}
                    onChange={(e) => setAddShelterEmail(e.target.value)}
                    placeholder="shelter@example.com"
                    required
                    className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#237737] text-xs font-semibold transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Phone Number <span className="text-rose-500">*</span></label>
                  <input
                    type="tel"
                    value={addShelterPhone}
                    onChange={(e) => setAddShelterPhone(e.target.value)}
                    placeholder="10-digit number"
                    maxLength={10}
                    required
                    className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#237737] text-xs font-semibold transition"
                  />
                </div>
              </div>

              {/* Coordinates & Location detection */}
              <div className="space-y-2 p-3.5 bg-[#F8FAF9] rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#237737]" /> Location Coordinates <span className="text-rose-500">*</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={addLocating}
                    className="flex items-center gap-1 px-3 py-1 bg-[#237737]/10 hover:bg-[#237737]/20 text-[#237737] text-[11px] font-bold rounded-lg transition cursor-pointer"
                  >
                    <Navigation className="w-3 h-3" />
                    {addLocating ? 'Detecting…' : 'Detect Location'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="any"
                    value={addLatitude}
                    onChange={(e) => setAddLatitude(e.target.value)}
                    placeholder="Latitude (e.g. 9.9312)"
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
                  />
                  <input
                    type="number"
                    step="any"
                    value={addLongitude}
                    onChange={(e) => setAddLongitude(e.target.value)}
                    placeholder="Longitude (e.g. 76.2673)"
                    required
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
                  />
                </div>
              </div>

              {/* Capacity & Staff */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Total Staff <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    min="0"
                    value={addTotalStaffs}
                    onChange={(e) => setAddTotalStaffs(e.target.value)}
                    placeholder="e.g. 10"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Total Cages <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    min="0"
                    value={addTotalCages}
                    onChange={(e) => setAddTotalCages(e.target.value)}
                    placeholder="e.g. 40"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Occupied <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    min="0"
                    value={addOccupiedCages}
                    onChange={(e) => setAddOccupiedCages(e.target.value)}
                    placeholder="e.g. 5"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Initial Status</label>
                <select
                  value={addStatus}
                  onChange={(e) => setAddStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
                >
                  <option value="OPEN">OPEN (Accepting Animals)</option>
                  <option value="FULL">FULL (At Capacity)</option>
                  <option value="UNDER_MAINTENANCE">UNDER MAINTENANCE</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddShelterModal(false)}
                  className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={shelterSubmitting}
                  className="w-2/3 py-3 bg-[#237737] hover:bg-[#1d632e] disabled:opacity-60 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-[#237737]/15 flex items-center justify-center gap-2"
                >
                  {shelterSubmitting ? (
                    <><Clock className="w-4 h-4 animate-spin" /> Saving Shelter…</>
                  ) : (
                    <><Building2 className="w-4 h-4" /> Save Shelter Record</>
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
