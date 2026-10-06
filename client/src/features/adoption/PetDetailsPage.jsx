import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  ShieldCheck,
  Calendar,
  MapPin,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  Video as VideoIcon,
  Image as ImageIcon,
  Share2,
  Copy,
  Check,
  Activity,
  Sparkles,
  Clock,
  Info,
  Phone,
  Mail,
  FileText,
  ChevronRight,
  User,
  Zap,
  Award,
  AlertTriangle,
  Send,
  X,
  Home,
  Building,
  LogIn,
  Loader2,
  Bell,
  Star,
  Lock,
} from 'lucide-react';
import { getAnimalById } from '../../services/animalService';
import { useAuth } from '../../context/AuthContext';
import {
  submitAdoptionApplication,
  checkPetApplicationStatus,
} from '../../services/adoptionService';
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../services/notificationService';
import {
  HOUSING_TYPES,
  validateAdoptionFormData,
} from './adoptionValidation';
import { checkProfileCompletion } from '../../utils/profileUtils';
import { ProfileRequiredModal } from '../../components/common/ProfileRequiredCard';

// Role-aware Dashboard Headers & Sidebars
import UserHeader from '../user-dashboard/Header';
import UserSidebar from '../user-dashboard/Sidebar';
import ShelterHeader from '../shelter/Header';
import ShelterSidebar from '../shelter/Sidebar';
import AdminHeader from '../admin/Header';
import AdminSidebar from '../admin/Sidebar';
import VetHeader from '../veterinary/Header';
import VetSidebar from '../veterinary/Sidebar';
import RescueHeader from '../rescue-team/Header';
import RescueSidebar from '../rescue-team/Sidebar';

const PetDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Sidebar collapsible state (synced with localStorage)
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

  // Live Notifications State
  const [notifications, setNotifications] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const loadNotifications = async () => {
    try {
      const res = await getMyNotifications();
      if (res?.success) {
        setNotifications(res.notifications || []);
      }
    } catch (err) {
      console.warn('Failed to load notifications in PetDetailsPage:', err.message);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => n.status === 'Unread').length;

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, status: 'Read' })));
    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.warn('Failed to mark all notifications read:', err.message);
    }
  };

  const handleToggleRead = async (notifId) => {
    const target = notifications.find((n) => n._id === notifId || n.id === notifId);
    if (target && target.status === 'Unread') {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId || n.id === notifId ? { ...n, status: 'Read' } : n))
      );
      try {
        await markNotificationRead(target._id || notifId);
      } catch (err) {
        console.warn('Failed to mark notification read:', err.message);
      }
    }
  };

  const getNotificationIconInfo = (notif) => {
    switch (notif.type) {
      case 'Welcome':
        return { icon: Star, color: 'bg-emerald-500/10 text-emerald-600' };
      case 'Rescue':
        return { icon: AlertTriangle, color: 'bg-amber-500/10 text-amber-600' };
      case 'Adoption':
        return { icon: Heart, color: 'bg-rose-500/10 text-rose-600' };
      default:
        return { icon: Bell, color: 'bg-slate-100 text-slate-600' };
    }
  };

  const formatNotificationTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const diff = (Date.now() - new Date(dateStr).getTime()) / 60000;
      if (diff < 1) return 'Just now';
      if (diff < 60) return `${Math.floor(diff)}m ago`;
      if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
      return `${Math.floor(diff / 1440)}d ago`;
    } catch {
      return '';
    }
  };

  const handleUserNavClick = (tabName) => {
    switch (tabName) {
      case 'Dashboard':
        navigate('/dashboard?tab=dashboard');
        break;
      case 'Report Animal':
        navigate('/dashboard?tab=report');
        break;
      case 'Adopt a Pet':
        navigate('/dashboard?tab=adopt');
        break;
      case 'Register Shelter':
        navigate('/dashboard?tab=shelter');
        break;
      case 'Register Rescue Team':
        navigate('/dashboard?tab=rescue');
        break;
      case 'Volunteer':
        navigate('/dashboard?tab=volunteer');
        break;
      case 'Join Vet Staff':
        navigate('/dashboard?tab=vet');
        break;
      case 'Notifications':
        navigate('/dashboard?tab=notifications');
        break;
      case 'My Profile':
        navigate('/dashboard?tab=profile');
        break;
      default:
        navigate('/dashboard');
        break;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderHeader = () => {
    if (user?.role === 'Admin') {
      return (
        <AdminHeader
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          notifOpen={notifDropdownOpen}
          setNotifOpen={setNotifDropdownOpen}
          setActiveTab={() => navigate('/dashboard')}
          setSubTab={() => {}}
        />
      );
    }
    if (user?.role === 'Shelter' || user?.role === 'Shelter Manager') {
      return (
        <ShelterHeader
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          notifOpen={notifDropdownOpen}
          setNotifOpen={setNotifDropdownOpen}
          notifications={notifications}
          setActiveTab={() => navigate('/dashboard')}
        />
      );
    }
    if (user?.role === 'Veterinary Staff') {
      return (
        <VetHeader
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          notifOpen={notifDropdownOpen}
          setNotifOpen={setNotifDropdownOpen}
          setActiveTab={() => navigate('/dashboard')}
        />
      );
    }
    if (user?.role === 'Rescue Team') {
      return (
        <RescueHeader
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          notifOpen={notifDropdownOpen}
          setNotifOpen={setNotifDropdownOpen}
          setActiveTab={() => navigate('/dashboard')}
        />
      );
    }
    return (
      <UserHeader
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        notifications={notifications}
        unreadCount={unreadCount}
        notifDropdownOpen={notifDropdownOpen}
        setNotifDropdownOpen={setNotifDropdownOpen}
        handleMarkAllRead={handleMarkAllRead}
        handleToggleRead={handleToggleRead}
        setActiveTab={handleUserNavClick}
        getNotificationIconInfo={getNotificationIconInfo}
        formatNotificationTime={formatNotificationTime}
      />
    );
  };

  const renderSidebar = () => {
    if (user?.role === 'Admin') {
      return (
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          activeTab="Manage Animals"
          setActiveTab={() => navigate('/dashboard')}
          handleLogout={handleLogout}
        />
      );
    }
    if (user?.role === 'Shelter' || user?.role === 'Shelter Manager') {
      return (
        <ShelterSidebar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          activeTab="Manage Animals"
          setActiveTab={() => navigate('/dashboard')}
          handleLogout={handleLogout}
        />
      );
    }
    if (user?.role === 'Veterinary Staff') {
      return (
        <VetSidebar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          activeTab="Vet Dashboard"
          setActiveTab={() => navigate('/dashboard')}
          handleLogout={handleLogout}
        />
      );
    }
    if (user?.role === 'Rescue Team') {
      return (
        <RescueSidebar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          activeTab="Rescue Dashboard"
          setActiveTab={() => navigate('/dashboard')}
          handleLogout={handleLogout}
        />
      );
    }
    return (
      <UserSidebar
        activeTab="Adopt a Pet"
        setActiveTab={handleUserNavClick}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        handleOpenShelterTab={() => navigate('/dashboard?tab=shelter')}
        handleLogout={handleLogout}
      />
    );
  };

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active media view: 'face' | 'fullBody' | 'video' | index (for photos array)
  const [activeMediaTab, setActiveMediaTab] = useState('face');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Adoption modal state & active application tracking
  const [existingApp, setExistingApp] = useState(null);
  const [checkingApp, setCheckingApp] = useState(false);
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalAction, setProfileModalAction] = useState('Apply to Adopt');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [adoptFormData, setAdoptFormData] = useState({
    housing_type: 'Apartment',
    ownership_status: 'Own',
    landlord_name: '',
    landlord_phone: '',
    return_policy: false,
    notes: '',
  });

  useEffect(() => {
    let isMounted = true;
    const fetchPet = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAnimalById(id);
        if (res.success && res.animal) {
          if (isMounted) {
            setPet(res.animal);
            // Default active media to face or first photo or video
            if (res.animal.facePhoto || res.animal.photo) {
              setActiveMediaTab('face');
            } else if (res.animal.fullBodyPhoto) {
              setActiveMediaTab('fullBody');
            } else if (res.animal.video) {
              setActiveMediaTab('video');
            }
          }
        } else {
          if (isMounted) setError(res.message || 'Pet not found');
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load pet details');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      fetchPet();
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Check if current logged-in user already applied for this pet
  useEffect(() => {
    let isMounted = true;
    const verifyUserApp = async () => {
      if (user && id) {
        try {
          setCheckingApp(true);
          const checkRes = await checkPetApplicationStatus(id);
          if (isMounted && checkRes.success && checkRes.hasApplied) {
            setExistingApp(checkRes.application);
          }
        } catch (err) {
          // Non-critical check
        } finally {
          if (isMounted) setCheckingApp(false);
        }
      }
    };

    verifyUserApp();
    return () => {
      isMounted = false;
    };
  }, [user, id]);

  const handleCopyTrackingId = () => {
    const tracking = pet?.trackingId || pet?.animalId || pet?._id;
    if (tracking) {
      navigator.clipboard.writeText(tracking);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleAdoptSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const profileStatus = checkProfileCompletion(user);
    if (!profileStatus.isComplete) {
      setProfileModalAction('Apply to Adopt ' + (pet?.name || 'this pet'));
      setProfileModalOpen(true);
      return;
    }

    const payload = {
      pet_id: pet._id,
      housing_type: adoptFormData.housing_type,
      ownership_status: adoptFormData.ownership_status,
      landlord_details: {
        name: adoptFormData.landlord_name,
        phone: adoptFormData.landlord_phone,
      },
      agreements: {
        return_policy: adoptFormData.return_policy,
      },
      notes: adoptFormData.notes,
    };

    const validation = validateAdoptionFormData(payload);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }
    setFormErrors({});

    try {
      setIsSubmitting(true);
      const res = await submitAdoptionApplication(payload);
      if (res.success) {
        setSubmittedApp(res.application);
        setExistingApp(res.application);
      } else {
        setSubmitError(res.message || 'Failed to submit application');
      }
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || err.message || 'Error submitting application'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/uploads')) return `http://localhost:5000${path}`;
    return `http://localhost:5000/uploads/${path}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen w-full bg-[#F8FAF9] font-sans overflow-hidden text-slate-800">
        {renderHeader()}
        <div className="flex flex-1 overflow-hidden">
          {renderSidebar()}
          <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 text-slate-800">
            <div className="w-16 h-16 border-4 border-[#237737]/20 border-t-[#237737] rounded-full animate-spin mb-4" />
            <h2 className="text-xl font-bold text-slate-700">Loading pet details...</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">Fetching verified medical & shelter records</p>
          </main>
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="flex flex-col h-screen w-full bg-[#F8FAF9] font-sans overflow-hidden text-slate-800">
        {renderHeader()}
        <div className="flex flex-1 overflow-hidden">
          {renderSidebar()}
          <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 text-center text-slate-800">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Pet Record Not Found</h2>
            <p className="text-sm text-slate-500 max-w-md mb-6 font-medium">
              {error || "The pet you are looking for might have been adopted or is no longer listed."}
            </p>
            <button
              onClick={() => navigate('/dashboard?tab=adopt')}
              className="px-6 py-3 bg-[#237737] hover:bg-[#1d632e] text-white font-bold rounded-xl text-sm transition cursor-pointer flex items-center gap-2 shadow-sm shadow-[#237737]/15"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Pet Listings
            </button>
          </main>
        </div>
      </div>
    );
  }

  // Resolve media sources
  const facePhotoUrl = getMediaUrl(pet.facePhoto || pet.photo);
  const fullBodyPhotoUrl = getMediaUrl(pet.fullBodyPhoto);
  const videoUrl = pet.video ? getMediaUrl(pet.video) : '';
  const additionalPhotos = Array.isArray(pet.photos) ? pet.photos.map(getMediaUrl) : [];

  // Derive status badge styling
  const statusLower = (pet.status || 'available').toLowerCase();
  const isAvailable = statusLower === 'available';
  const isPending = statusLower.includes('pending');
  const isAdopted = statusLower === 'adopted';

  // Format tracking ID
  const trackingId = pet.trackingId || pet.animalId || `RESQ-${pet._id?.slice(-6).toUpperCase()}`;

  // Altered status
  const isAltered = pet.spayedNeutered || pet.neutered;

  // Shelter details
  const shelterName = pet.shelterId?.shelterName || pet.shelterName || 'ResQNet Partner Sanctuary';
  const shelterCity = pet.shelterCity || pet.shelterId?.userId?.city || 'Kochi';
  const shelterState = pet.shelterState || pet.shelterId?.userId?.state || 'Kerala';
  const shelterRegNo = pet.shelterRegistrationNumber || pet.shelterId?.registrationNumber || 'AWBI/KL/2023/0491';

  // Vaccinations list
  const vaccinationsList = Array.isArray(pet.vaccinations) && pet.vaccinations.length > 0
    ? pet.vaccinations
    : [
        { name: 'Rabies Vaccine', date: pet.vaccinationDate || '2026-01-15', status: 'Completed' },
        { name: 'DHPP / Vanguard Core', date: '2025-11-20', status: 'Completed' },
        { name: 'Bordetella (Kennel Cough)', date: '2025-10-10', status: 'Completed' },
        { name: 'Deworming & Parasite Care', date: '2026-02-05', status: 'Completed' },
      ];

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAF9] font-sans overflow-hidden text-slate-800">
      {/* Role-aware Header */}
      {renderHeader()}

      {/* Main Layout Below Header */}
      <div className="flex flex-1 overflow-hidden">
        {/* Role-aware Sidebar */}
        {renderSidebar()}

        {/* Scrollable Pet Details Panel */}
        <main className="flex-1 overflow-y-auto">
          {/* Top In-Content Breadcrumbs & Action Bar */}
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Back button & Breadcrumbs */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (window.history.length > 1) {
                      navigate(-1);
                    } else {
                      navigate('/dashboard?tab=adopt');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-slate-700 bg-slate-100/80 hover:bg-slate-200 transition-all cursor-pointer group"
                  title="Go back to previous page"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-[#237737]" />
                  <span>Back to Pets</span>
                </button>

                {/* Breadcrumb text (hidden on very small screens) */}
                <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <Link to="/dashboard" className="hover:text-slate-600 transition">Dashboard</Link>
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                  <Link to="/dashboard?tab=adopt" className="hover:text-slate-600 transition">Adopt a Pet</Link>
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                  <span className="text-slate-800 font-bold truncate max-w-[160px]">{pet.name || 'Pet Profile'}</span>
                </nav>
              </div>

              {/* Right Header Actions: Share & Status */}
              <div className="flex items-center gap-2.5">
                {/* Share link button */}
                <button
                  onClick={handleShare}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="Share Pet Profile"
                >
                  {copiedShare ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="hidden sm:inline text-emerald-600">Copied Link!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-slate-500" />
                      <span className="hidden sm:inline">Share</span>
                    </>
                  )}
                </button>

                {/* Status Badge */}
                {isAvailable && (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Available for Adoption
                  </span>
                )}
                {isPending && (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 shadow-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    Adoption Pending
                  </span>
                )}
                {isAdopted && (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5 shadow-xs">
                    <Heart className="w-3.5 h-3.5 text-purple-500 fill-purple-500" />
                    Happily Adopted
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 space-y-8">
        
        {/* TOP ROW: MEDIA SHOWCASE (LEFT) + QUICK IDENTITY & ADOPT ACTION (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT 7 COLS: INTERACTIVE MEDIA SHOWCASE (Face, Full Body, Video, Extra Photos) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Primary Media Viewport */}
            <div className="relative w-full aspect-[4/3] bg-slate-900 rounded-3xl overflow-hidden shadow-md border border-slate-150 flex items-center justify-center">
              
              {/* 1. Face Photo View */}
              {activeMediaTab === 'face' && (
                facePhotoUrl ? (
                  <img
                    src={facePhotoUrl}
                    alt={`${pet.name} face shot`}
                    className="w-full h-full object-cover animate-fade-in"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex flex-col items-center justify-center text-emerald-800">
                    <ImageIcon className="w-16 h-16 text-emerald-400 mb-2" />
                    <span className="text-xl font-bold">Face Photo Not Available</span>
                  </div>
                )
              )}

              {/* 2. Full Body Photo View */}
              {activeMediaTab === 'fullBody' && (
                fullBodyPhotoUrl ? (
                  <img
                    src={fullBodyPhotoUrl}
                    alt={`${pet.name} full body view`}
                    className="w-full h-full object-cover animate-fade-in"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center text-indigo-800">
                    <ImageIcon className="w-16 h-16 text-indigo-400 mb-2" />
                    <span className="text-xl font-bold">Full Body Photo Not Provided</span>
                  </div>
                )
              )}

              {/* 3. Video View */}
              {activeMediaTab === 'video' && (
                videoUrl ? (
                  <video
                    key={videoUrl}
                    src={videoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain bg-black"
                  >
                    Your browser does not support video playback.
                  </video>
                ) : (
                  <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center">
                    <VideoIcon className="w-16 h-16 text-slate-500 mb-3" />
                    <h3 className="text-lg font-bold">No Video Available for this Pet</h3>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      The shelter has not uploaded a video tour yet. You can request a live video tour below.
                    </p>
                  </div>
                )
              )}

              {/* 4. Additional Photos (if clicked) */}
              {typeof activeMediaTab === 'number' && additionalPhotos[activeMediaTab] && (
                <img
                  src={additionalPhotos[activeMediaTab]}
                  alt={`${pet.name} photo ${activeMediaTab + 1}`}
                  className="w-full h-full object-cover animate-fade-in"
                />
              )}

              {/* Media Type Floating Pill Tag */}
              <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-slate-900/70 backdrop-blur-md text-white text-[11px] font-extrabold rounded-xl flex items-center gap-1.5 shadow">
                {activeMediaTab === 'face' && <><ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> Face Portrait</>}
                {activeMediaTab === 'fullBody' && <><ImageIcon className="w-3.5 h-3.5 text-blue-400" /> Full Body View</>}
                {activeMediaTab === 'video' && <><VideoIcon className="w-3.5 h-3.5 text-rose-400" /> Video Tour</>}
                {typeof activeMediaTab === 'number' && <><ImageIcon className="w-3.5 h-3.5 text-amber-400" /> Gallery View #{activeMediaTab + 1}</>}
              </div>

              {/* Tracking ID Watermark on Media */}
              <div className="absolute bottom-4 right-4 z-10 px-2.5 py-1 bg-black/60 backdrop-blur-md text-slate-200 text-[10px] font-mono rounded-lg">
                {trackingId}
              </div>
            </div>

            {/* Thumbnail Selectors: Face, Full Body, Video, Additional */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 select-none">
              
              {/* Tab 1: Face Photo */}
              <button
                onClick={() => setActiveMediaTab('face')}
                className={`relative aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer group flex flex-col items-center justify-center bg-slate-100 ${
                  activeMediaTab === 'face'
                    ? 'border-[#237737] shadow-md shadow-[#237737]/20 ring-2 ring-[#237737]/30'
                    : 'border-transparent hover:border-slate-300'
                }`}
              >
                {facePhotoUrl ? (
                  <img src={facePhotoUrl} alt="Face thumbnail" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
                <span className="absolute bottom-1 inset-x-1 text-center text-[9px] font-black bg-black/70 text-white rounded py-0.5 backdrop-blur-xs">
                  Face
                </span>
              </button>

              {/* Tab 2: Full Body */}
              <button
                onClick={() => setActiveMediaTab('fullBody')}
                className={`relative aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer group flex flex-col items-center justify-center bg-slate-100 ${
                  activeMediaTab === 'fullBody'
                    ? 'border-[#237737] shadow-md shadow-[#237737]/20 ring-2 ring-[#237737]/30'
                    : 'border-transparent hover:border-slate-300'
                }`}
              >
                {fullBodyPhotoUrl ? (
                  <img src={fullBodyPhotoUrl} alt="Full body thumbnail" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
                <span className="absolute bottom-1 inset-x-1 text-center text-[9px] font-black bg-black/70 text-white rounded py-0.5 backdrop-blur-xs">
                  Full Body
                </span>
              </button>

              {/* Tab 3: Video Tour (if available or indicator) */}
              <button
                onClick={() => setActiveMediaTab('video')}
                className={`relative aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer group flex flex-col items-center justify-center ${
                  videoUrl ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
                } ${
                  activeMediaTab === 'video'
                    ? 'border-[#237737] shadow-md shadow-[#237737]/20 ring-2 ring-[#237737]/30'
                    : 'border-transparent hover:border-slate-300'
                }`}
              >
                <Play className={`w-6 h-6 ${videoUrl ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
                <span className="absolute bottom-1 inset-x-1 text-center text-[9px] font-black bg-black/70 text-white rounded py-0.5 backdrop-blur-xs">
                  {videoUrl ? 'Video Tour' : 'No Video'}
                </span>
              </button>

              {/* Additional Photos from array */}
              {additionalPhotos.slice(0, 2).map((photoUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveMediaTab(idx)}
                  className={`relative aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer group flex flex-col items-center justify-center bg-slate-100 ${
                    activeMediaTab === idx
                      ? 'border-[#237737] shadow-md shadow-[#237737]/20 ring-2 ring-[#237737]/30'
                      : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <img src={photoUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                  <span className="absolute bottom-1 inset-x-1 text-center text-[9px] font-black bg-black/70 text-white rounded py-0.5 backdrop-blur-xs">
                    View #{idx + 1}
                  </span>
                </button>
              ))}

            </div>

          </div>

          {/* RIGHT 5 COLS: PET IDENTITY, SUMMARY CARD, ADOPTION ACTION */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
              
              {/* Pet Name & Tracking ID */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {pet.name || 'Unnamed Companion'}
                  </h1>
                </div>

                {/* Tracking ID Pill with Copy */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-extrabold text-slate-400">Tracking ID:</span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-xs font-mono font-bold text-slate-700 transition cursor-pointer"
                    onClick={handleCopyTrackingId}
                    title="Click to copy Tracking ID"
                  >
                    <span>{trackingId}</span>
                    {copiedId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                    )}
                  </div>
                  {copiedId && (
                    <span className="text-[11px] font-bold text-emerald-600 animate-fade-in">Copied!</span>
                  )}
                </div>

                {/* Species / Breed subtitle */}
                <p className="text-sm font-bold text-slate-500 mt-2">
                  {pet.species || 'Rescue'} • {pet.breed || 'Mixed Breed'}
                </p>
              </div>

              {/* Quick Specs Highlight Box (Species, Breed, Age, Gender, Current Size, Weight) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-[#F8FAF9] rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Species</span>
                  <span className="text-sm font-black text-slate-800">{pet.species || 'Dog'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Breed</span>
                  <span className="text-sm font-black text-slate-800 truncate block">{pet.breed || 'Indie / Mixed'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Age</span>
                  <span className="text-sm font-black text-slate-800">{pet.approxAge || '2 Years'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Gender</span>
                  <span className="text-sm font-black text-slate-800">{pet.gender || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Current Size</span>
                  <span className="text-sm font-black text-emerald-700">{pet.currentSize || 'Medium'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Weight</span>
                  <span className="text-sm font-black text-slate-800">{pet.weight || '16 kg'}</span>
                </div>
              </div>

              {/* Shelter Summary Badge */}
              <div className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-2xl">
                <div className="p-2.5 bg-emerald-50 text-[#237737] rounded-xl shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-slate-900 truncate">{shelterName}</h4>
                  <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    {shelterCity}, {shelterState}
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg shrink-0">
                  Reg: {shelterRegNo.split('/')[0] || shelterRegNo}
                </span>
              </div>

              {/* Adoption CTA Buttons */}
              <div className="space-y-2.5 pt-2">
                {existingApp && ['Pending', 'Under Review'].includes(existingApp.application_status) ? (
                  <div className="w-full p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-900 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black flex items-center gap-1.5">
                          Application Submitted
                          <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-extrabold">
                            {existingApp.adoptionId || 'Pending'}
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-700 font-medium">
                          Status: <span className="font-bold">{existingApp.application_status}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAdoptModal(true)}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                    >
                      View Details
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (!user) {
                        navigate('/login');
                        return;
                      }
                      const profileStatus = checkProfileCompletion(user);
                      if (!profileStatus.isComplete) {
                        setProfileModalAction('Apply to Adopt ' + (pet?.name || 'this pet'));
                        setProfileModalOpen(true);
                        return;
                      }
                      setSubmitError(null);
                      setSubmittedApp(null);
                      setShowAdoptModal(true);
                    }}
                    disabled={isAdopted}
                    className={`w-full py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                      isAdopted
                        ? 'bg-slate-300 cursor-not-allowed shadow-none'
                        : 'bg-[#237737] hover:bg-[#1d632e] active:bg-[#185326] shadow-[#237737]/25'
                    }`}
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    {isAdopted ? 'Already Adopted' : `Apply to Adopt ${pet.name || 'this pet'}`}
                  </button>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveMediaTab('video')}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <VideoIcon className="w-3.5 h-3.5 text-rose-500" /> Video Tour
                  </button>
                  {pet.shelterId?.shelterPhoneNumber ? (
                    <a
                      href={`tel:${pet.shelterId.shelterPhoneNumber}`}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" /> Contact Shelter
                    </a>
                  ) : (
                    <div className="flex-1 py-2.5 bg-slate-50 text-slate-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-not-allowed">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> Shelter Contact
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <p className="text-[11px] text-slate-400 font-semibold">
                  ✓ Free veterinary checkup & 30-day adoption transition support included.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* DETAILED INFORMATION PANELS: SPECS, MEDICAL, BEHAVIOR, STORIES, SHELTER REGISTRY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2 COLS: ABOUT, MEDICAL, BEHAVIORAL, BACKGROUND STORY */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. ABOUT SECTION */}
            <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <Sparkles className="w-5 h-5 text-[#237737]" />
                <h2 className="text-lg font-black text-slate-900">About {pet.name || 'this Companion'}</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-semibold whitespace-pre-line">
                {pet.about || 'A loving and resilient rescue animal looking for a compassionate guardian and a warm forever home.'}
              </p>
            </section>

            {/* 2. HEALTH, ALTERED STATUS & VACCINATIONS */}
            <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#237737]" />
                  <h2 className="text-lg font-black text-slate-900">Health & Medical Profile</h2>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                  Veterinary Verified
                </span>
              </div>

              {/* 3 Key Health Status Cards: Altered, Microchip, Special Medical Needs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Altered Status */}
                <div className="p-4 rounded-2xl border border-slate-100 bg-[#F8FAF9] space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Altered Status</span>
                  <div className="flex items-center gap-1.5">
                    {isAltered ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-sm font-black text-slate-900">Spayed / Neutered (Yes)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-sm font-black text-slate-900">Spayed / Neutered (No)</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    {isAltered ? 'Sterilization procedure completed' : 'Sterilization pending scheduled slot'}
                  </p>
                </div>

                {/* Microchipped */}
                <div className="p-4 rounded-2xl border border-slate-100 bg-[#F8FAF9] space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Microchipped</span>
                  <div className="flex items-center gap-1.5">
                    {pet.microchipped ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-sm font-black text-slate-900">Microchipped: Yes</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-sm font-black text-slate-900">Microchipped: No</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold font-mono">
                    {pet.microchipNumber || (pet.microchipped ? 'National Registry Chip' : 'Available upon adoption')}
                  </p>
                </div>

                {/* Special Medical Needs */}
                <div className="p-4 rounded-2xl border border-slate-100 bg-[#F8FAF9] space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Special Medical Needs</span>
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-sm font-black text-slate-900">
                      {pet.specialMedicalNeeds && pet.specialMedicalNeeds !== 'None' ? 'Specific Care' : 'None Reported'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold line-clamp-2">
                    {pet.specialMedicalNeeds || '100% fit and active'}
                  </p>
                </div>

              </div>

              {/* Vaccinations with Exact Dates */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Vaccination History & Administered Dates
                  </h4>
                  <span className="text-xs font-bold text-emerald-600">
                    Latest: {pet.vaccinationDate || 'Up to Date'}
                  </span>
                </div>

                <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {vaccinationsList.map((vac, idx) => (
                    <div key={idx} className="p-3 sm:px-4 flex items-center justify-between bg-white hover:bg-slate-50/70 transition text-xs">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-slate-800">{vac.name || 'Vaccination'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-semibold font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {vac.date ? new Date(vac.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Verified'}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                          {vac.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </section>

            {/* 3. BEHAVIORAL & TEMPERAMENT (Energy Level & Training) */}
            <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <Zap className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-black text-slate-900">Temperament & Training</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Energy Level */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Energy Level</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-slate-900">{pet.energyLevel || 'Moderate'}</span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      {pet.energyLevel === 'High' ? '⚡ Very Playful' : '🌤️ Balanced & Easygoing'}
                    </span>
                  </div>
                  {/* Energy Meter Visual */}
                  <div className="flex gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((lvl) => {
                      const activeCount = pet.energyLevel === 'High' || pet.energyLevel === 'Very High' ? 4 : pet.energyLevel === 'Low' || pet.energyLevel === 'Calm' ? 2 : 3;
                      const isLit = lvl <= activeCount;
                      return (
                        <div
                          key={lvl}
                          className={`h-2 flex-1 rounded-full transition ${
                            isLit ? 'bg-amber-500' : 'bg-slate-100'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Training */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Training Status</span>
                  <p className="text-sm font-black text-slate-900">
                    {pet.training || 'House-trained, Basic commands learned'}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['House-Trained', 'Leash-Trained', 'Basic Commands'].map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-extrabold rounded-lg">
                        ✓ {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 4. BACKGROUND STORY */}
            <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-black text-slate-900">Background Story & Rescue Journey</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-semibold whitespace-pre-line">
                {pet.backgroundStory ||
                  `${pet.name || 'This companion'} was rescued by our emergency dispatch squad and received full veterinary medical assessment, healthy nutrition, and daily affection at ${shelterName}. They have recovered beautifully and are ready for their lifelong home.`}
              </p>
            </section>

          </div>

          {/* RIGHT 1 COL: SHELTER DETAILS & VERIFICATION CERTIFICATE */}
          <div className="space-y-6">
            
            {/* Shelter Full Profile Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#237737]/10 flex items-center justify-center text-[#237737] font-black text-xl">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-snug">{shelterName}</h3>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                    ✓ Verified Facility
                  </span>
                </div>
              </div>

              {/* Shelter Attributes */}
              <div className="space-y-3.5 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
                
                {/* Location */}
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-extrabold text-[10px] uppercase block">Location</span>
                    <span className="text-slate-800 font-bold">{shelterCity}, {shelterState}</span>
                  </div>
                </div>

                {/* Registration Number */}
                <div className="flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-extrabold text-[10px] uppercase block">Registration Number</span>
                    <span className="text-slate-800 font-bold font-mono">{shelterRegNo}</span>
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-extrabold text-[10px] uppercase block">Direct Phone</span>
                    {pet.shelterId?.shelterPhoneNumber ? (
                      <a href={`tel:${pet.shelterId.shelterPhoneNumber}`} className="text-slate-800 font-bold hover:text-[#237737] transition">
                        +91 {pet.shelterId.shelterPhoneNumber}
                      </a>
                    ) : (
                      <span className="text-slate-400 font-medium text-xs">Not provided</span>
                    )}
                  </div>
                </div>

                {/* Shelter Email */}
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-extrabold text-[10px] uppercase block">Official Email</span>
                    <span className="text-slate-800 font-bold truncate block">
                      {pet.shelterId?.shelterEmail || pet.shelterId?.email || 'Not provided'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Visit Schedule CTA */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    if (!user) {
                      navigate('/login');
                      return;
                    }
                    const profileStatus = checkProfileCompletion(user);
                    if (!profileStatus.isComplete) {
                      setProfileModalAction('Schedule a Facility Visit');
                      setProfileModalOpen(true);
                      return;
                    }
                    setShowAdoptModal(true);
                  }}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#237737]" /> Schedule a Facility Visit
                </button>
              </div>
            </div>

            {/* Adoption Checklist Callout */}
            <div className="bg-gradient-to-br from-emerald-900 to-[#185326] text-white rounded-3xl p-6 shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-emerald-300" />
                <h4 className="text-sm font-black">Adoption Guarantee</h4>
              </div>
              <ul className="text-xs space-y-2 text-emerald-100/90 font-medium">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                  <span>Vaccinated, sterilized, and medically verified before handover.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                  <span>Comprehensive health history record and vaccination card included.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                  <span>Post-adoption follow-up checkups with partner veterinary clinics.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

          </div>
        </main>
      </div>

      {/* ADOPTION APPLICATION MODAL */}
      {showAdoptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  Adopt {pet.name || 'this Companion'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Tracking ID: {trackingId} • {shelterName}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAdoptModal(false);
                  setSubmitError(null);
                }}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {!user ? (
                /* STATE 1: GUEST USER NEEDS TO LOG IN */
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 text-[#237737] rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <LogIn className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900">Sign In Required</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium mt-1">
                      To apply for adopting {pet.name}, please log in to your ResQNet account. Your contact details will be verified with the shelter.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => navigate('/login', { state: { from: `/adoption/${id}` } })}
                      className="px-5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm flex items-center gap-2"
                    >
                      <LogIn className="w-4 h-4" /> Sign In to Continue
                    </button>
                    <button
                      onClick={() => setShowAdoptModal(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : submittedApp ? (
                /* STATE 2: NEWLY SUBMITTED APPLICATION SUCCESS CONFIRMATION */
                <div className="py-8 text-center space-y-4 animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-100 text-[#237737] rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div>
                    <span className="px-3 py-1 bg-emerald-50 text-[#237737] border border-emerald-200 rounded-full text-xs font-extrabold uppercase tracking-wide">
                      {submittedApp.adoptionId || 'Application Submitted'}
                    </span>
                    <h4 className="text-xl font-black text-slate-900 mt-2.5">
                      Adoption Request Received!
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium mt-1.5 leading-relaxed">
                      Thank you, <strong className="text-slate-800">{user.fullName}</strong>! Your application to adopt <strong className="text-slate-800">{pet.name}</strong> has been submitted to <strong className="text-slate-800">{shelterName}</strong>. The shelter team will review your housing details and contact you.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-left text-xs space-y-1.5 max-w-sm mx-auto">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Pet:</span>
                      <span className="font-bold text-slate-800">{pet.name} ({pet.species})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Status:</span>
                      <span className="font-bold text-amber-600">Pending Review</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Contact Phone:</span>
                      <span className="font-bold text-slate-800">{user.phoneNumber || 'From Profile'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setShowAdoptModal(false);
                        navigate('/dashboard');
                      }}
                      className="px-5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
                    >
                      Go to Dashboard
                    </button>
                    <button
                      onClick={() => setShowAdoptModal(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : existingApp && ['Pending', 'Under Review'].includes(existingApp.application_status) ? (
                /* STATE 3: VIEW EXISTING ACTIVE APPLICATION DETAILS */
                <div className="py-6 space-y-4 animate-fade-in">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-black text-amber-900">Application Under Review</h4>
                      <p className="text-xs text-amber-800/80 font-medium mt-0.5">
                        You have already submitted an active adoption request for this pet. The shelter is processing your documents.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
                    <div className="flex justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-400 font-semibold">Application ID:</span>
                      <span className="font-black text-slate-900">{existingApp.adoptionId || 'ADO-PENDING'}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-400 font-semibold">Status:</span>
                      <span className="font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        {existingApp.application_status}
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-400 font-semibold">Housing Type:</span>
                      <span className="font-bold text-slate-800">{existingApp.housing_type}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-100">
                      <span className="text-slate-400 font-semibold">Ownership:</span>
                      <span className="font-bold text-slate-800">{existingApp.ownership_status}</span>
                    </div>
                    {existingApp.ownership_status === 'Rent' && existingApp.landlord_details?.name && (
                      <div className="flex justify-between pb-2 border-b border-slate-100">
                        <span className="text-slate-400 font-semibold">Landlord:</span>
                        <span className="font-bold text-slate-800">
                          {existingApp.landlord_details.name} ({existingApp.landlord_details.phone})
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Submitted On:</span>
                      <span className="font-bold text-slate-800">
                        {new Date(existingApp.submitted_at || existingApp.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setShowAdoptModal(false)}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* STATE 4: ADOPTION APPLICATION FORM */
                <form onSubmit={handleAdoptSubmit} className="space-y-4">
                  
                  {/* Applicant Linked Details Card */}
                  <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase text-[#237737] flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#237737]" /> Verified Applicant Info
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> From Profile
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-white/70 rounded-xl border border-emerald-100">
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                          <span>Full Name</span>
                          <Lock className="w-2.5 h-2.5 text-slate-400" />
                        </span>
                        <span className="font-bold text-slate-800">{user.fullName || 'User'}</span>
                      </div>
                      <div className="p-2 bg-white/70 rounded-xl border border-emerald-100">
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                          <span>Contact Phone</span>
                          <Lock className="w-2.5 h-2.5 text-slate-400" />
                        </span>
                        <span className="font-bold text-slate-800">{user.phoneNumber || 'Not provided'}</span>
                      </div>
                      <div className="p-2 bg-white/70 rounded-xl border border-emerald-100">
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                          <span>Email</span>
                          <Lock className="w-2.5 h-2.5 text-slate-400" />
                        </span>
                        <span className="font-bold text-slate-800 truncate block">{user.email}</span>
                      </div>
                      <div className="p-2 bg-white/70 rounded-xl border border-emerald-100">
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                          <span>Location</span>
                          <Lock className="w-2.5 h-2.5 text-slate-400" />
                        </span>
                        <span className="font-bold text-slate-800">{user.city ? `${user.city}, ${user.state || ''}` : 'Location on file'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-emerald-100 text-[10px] text-emerald-800 font-medium">
                      <span>Applicant details are locked to your profile.</span>
                      <button
                        type="button"
                        onClick={() => navigate('/dashboard?tab=profile')}
                        className="text-[10px] font-bold text-[#237737] hover:underline cursor-pointer"
                      >
                        Edit Profile &rarr;
                      </button>
                    </div>
                  </div>

                  {/* Housing Type Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-slate-400" /> Housing Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={adoptFormData.housing_type}
                      onChange={(e) => {
                        setAdoptFormData({ ...adoptFormData, housing_type: e.target.value });
                        if (formErrors.housing_type) setFormErrors({ ...formErrors, housing_type: null });
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#237737] cursor-pointer"
                    >
                      {HOUSING_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {formErrors.housing_type && (
                      <p className="text-[11px] text-rose-600 font-medium">{formErrors.housing_type}</p>
                    )}
                  </div>

                  {/* Ownership Status Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" /> Ownership Status <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {['Own', 'Rent'].map((status) => {
                        const isSelected = adoptFormData.ownership_status === status;
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => {
                              setAdoptFormData({ ...adoptFormData, ownership_status: status });
                              if (formErrors.ownership_status) setFormErrors({ ...formErrors, ownership_status: null });
                            }}
                            className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                              isSelected
                                ? 'bg-[#237737] text-white border-[#237737] shadow-sm shadow-[#237737]/20'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-300'}`} />
                            {status === 'Own' ? 'I Own My Home' : 'I Rent / Lease'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Conditional Landlord Details (Required if Rent) */}
                  {adoptFormData.ownership_status === 'Rent' && (
                    <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-3 animate-fade-in">
                      <div>
                        <h5 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Landlord Verification Required
                        </h5>
                        <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                          Since you rent, the shelter requires landlord confirmation that pets are permitted.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">Landlord Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. John Doe"
                            value={adoptFormData.landlord_name}
                            onChange={(e) => {
                              setAdoptFormData({ ...adoptFormData, landlord_name: e.target.value });
                              if (formErrors.landlord_name) setFormErrors({ ...formErrors, landlord_name: null });
                            }}
                            className={`w-full px-3 py-2 bg-white border rounded-xl text-xs font-semibold focus:outline-none ${
                              formErrors.landlord_name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-[#237737]'
                            }`}
                          />
                          {formErrors.landlord_name && (
                            <p className="text-[10px] text-rose-600 font-medium">{formErrors.landlord_name}</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">Landlord Phone Number *</label>
                          <input
                            type="tel"
                            placeholder="e.g. 9876543210"
                            value={adoptFormData.landlord_phone}
                            onChange={(e) => {
                              setAdoptFormData({ ...adoptFormData, landlord_phone: e.target.value });
                              if (formErrors.landlord_phone) setFormErrors({ ...formErrors, landlord_phone: null });
                            }}
                            className={`w-full px-3 py-2 bg-white border rounded-xl text-xs font-semibold focus:outline-none ${
                              formErrors.landlord_phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-[#237737]'
                            }`}
                          />
                          {formErrors.landlord_phone && (
                            <p className="text-[10px] text-rose-600 font-medium">{formErrors.landlord_phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Agreement: Pet Return Policy */}
                  <div className="space-y-1.5 pt-1">
                    <label
                      className={`flex items-start gap-2.5 p-3.5 rounded-2xl border transition cursor-pointer ${
                        adoptFormData.return_policy
                          ? 'bg-emerald-50/40 border-emerald-300 text-slate-800'
                          : formErrors['agreements.return_policy']
                          ? 'bg-rose-50/30 border-rose-300'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={adoptFormData.return_policy}
                        onChange={(e) => {
                          setAdoptFormData({ ...adoptFormData, return_policy: e.target.checked });
                          if (formErrors['agreements.return_policy']) {
                            setFormErrors({ ...formErrors, 'agreements.return_policy': null });
                          }
                        }}
                        className="mt-0.5 w-4 h-4 rounded text-[#237737] focus:ring-[#237737] accent-[#237737] cursor-pointer"
                      />
                      <span className="text-[11px] leading-relaxed font-semibold">
                        <strong className="text-slate-900 block font-bold mb-0.5">Return Policy Agreement *</strong>
                        I agree to ResQNet's Pet Return Policy: If for any reason I can no longer care for {pet.name}, I will return this animal directly to the shelter rather than abandoning, selling, or transferring them without authorization.
                      </span>
                    </label>
                    {formErrors['agreements.return_policy'] && (
                      <p className="text-[11px] text-rose-600 font-medium pl-1">{formErrors['agreements.return_policy']}</p>
                    )}
                  </div>

                  {/* Optional Notes / Message to Shelter */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Message to Shelter <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Share why you'd like to adopt or describe your pet care experience..."
                      value={adoptFormData.notes}
                      onChange={(e) => setAdoptFormData({ ...adoptFormData, notes: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#237737]"
                    />
                  </div>

                  {/* Submission Error Alert */}
                  {submitError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-3.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
                        isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Submitting Application...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" /> Submit Adoption Application
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Mandatory Profile Completion Modal for Public Users */}
      <ProfileRequiredModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onNavigateToProfile={() => {
          setProfileModalOpen(false);
          navigate('/dashboard?tab=profile');
        }}
        user={user}
        actionName={profileModalAction}
      />

    </div>
  );
};

export default PetDetailsPage;
