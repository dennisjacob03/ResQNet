import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  ShieldCheck,
  Smartphone,
  Star,
  Edit3,
  Lock,
  AlertCircle,
  CheckCircle,
  Mail,
  MailCheck,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  ClipboardList,
} from 'lucide-react';
import AddressForm from '../../components/address/AddressForm';
import UserProfileDropdown from '../../components/common/UserProfileDropdown';
import {
  submitShelterApplication,
  getMyApplication,
} from '../../services/shelterApplicationService';
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  createNotification,
} from '../../services/notificationService';
import {
  validateShelterField,
  validateFullShelterForm,
  SHELTER_REGISTRATION_RULES,
} from '../shelter/shelterValidation';

const UserDashboard = () => {
  const {
    user,
    logout,
    updateProfile,
    setupRecaptcha,
    sendPhoneOtp,
    verifyPhoneOtp,
    sendOtp,
    verifyOtp,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Deep-link tab activation via ?tab query param
  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get('tab');
    if (tabParam === 'report') {
      setActiveTab('Report Animal');
    } else if (tabParam === 'adopt') {
      setActiveTab('Adopt a Pet');
    }
  }, [location.search]);

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

  // Live Notifications State (synced with MongoDB backend)
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('All'); // 'All' | 'Unread' | 'Shelter' | 'Rescue' | 'Welcome'
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const res = await getMyNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Load real notifications on dashboard mount
  useEffect(() => {
    loadNotifications();
  }, []);

  // Compute live unread count
  const unreadCount = notifications.filter((n) => n.status === 'Unread').length;

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, status: 'Read' })));
    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.warn('Failed to mark all read on server:', err.message);
    }
  };

  const handleToggleRead = async (id) => {
    const target = notifications.find((n) => n._id === id || n.id === id);
    if (target && target.status === 'Unread') {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, status: 'Read' } : n))
      );
      try {
        await markNotificationRead(target._id || id);
      } catch (err) {
        console.warn('Failed to mark notification read on server:', err.message);
      }
    }
  };

  const handleDeleteNotification = async (id, e) => {
    e?.stopPropagation();
    const target = notifications.find((n) => n._id === id || n.id === id);
    setNotifications((prev) => prev.filter((n) => n._id !== id && n.id !== id));
    try {
      if (target?._id) {
        await deleteNotification(target._id);
      }
    } catch (err) {
      console.warn('Failed to delete notification on server:', err.message);
    }
  };

  const getNotificationIconInfo = (notif) => {
    switch (notif.type) {
      case 'Welcome':
        return {
          icon: Star,
          color: 'bg-emerald-500/10 text-emerald-600',
          badgeColor: 'bg-emerald-100 text-emerald-800',
          label: 'Welcome',
        };
      case 'ShelterApplication':
        if (notif.title?.toLowerCase().includes('approved')) {
          return {
            icon: CheckCircle2,
            color: 'bg-emerald-500/10 text-emerald-600',
            badgeColor: 'bg-emerald-100 text-emerald-800',
            label: 'Shelter Approved',
          };
        } else if (notif.title?.toLowerCase().includes('rejected')) {
          return {
            icon: AlertCircle,
            color: 'bg-rose-500/10 text-rose-600',
            badgeColor: 'bg-rose-100 text-rose-800',
            label: 'Shelter Rejected',
          };
        }
        return {
          icon: Building2,
          color: 'bg-blue-500/10 text-blue-600',
          badgeColor: 'bg-blue-100 text-blue-800',
          label: 'Shelter Application',
        };
      case 'Rescue':
        return {
          icon: AlertTriangle,
          color: 'bg-amber-500/10 text-amber-600',
          badgeColor: 'bg-amber-100 text-amber-800',
          label: 'Rescue',
        };
      case 'Adoption':
        return {
          icon: Heart,
          color: 'bg-rose-500/10 text-rose-600',
          badgeColor: 'bg-rose-100 text-rose-800',
          label: 'Adoption',
        };
      case 'Alert':
        return {
          icon: AlertCircle,
          color: 'bg-rose-500/10 text-rose-600',
          badgeColor: 'bg-rose-100 text-rose-800',
          label: 'Alert',
        };
      default:
        return {
          icon: Bell,
          color: 'bg-slate-100 text-slate-600',
          badgeColor: 'bg-slate-100 text-slate-700',
          label: 'General',
        };
    }
  };

  const formatNotificationTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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
  const [profileName, setProfileName] = useState(user?.fullName || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phoneNumber || '');
  const [profilePicUrl, setProfilePicUrl] = useState(
    user?.profilePic
      ? user.profilePic.startsWith('/uploads')
        ? `http://localhost:5000${user.profilePic}`
        : user.profilePic
      : ''
  );
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profileDob, setProfileDob] = useState(user?.dob ? user.dob.slice(0, 10) : '');
  const [profileAddress, setProfileAddress] = useState(user?.address || '');
  const [profileCity, setProfileCity] = useState(user?.city || '');
  const [profileDistrict, setProfileDistrict] = useState(user?.district || '');
  const [profileState, setProfileState] = useState(user?.state || '');
  const [profilePincode, setProfilePincode] = useState(user?.pincode || '');
  const [isEditing, setIsEditing] = useState(false);

  // Shelter Application States
  const [shelterApp, setShelterApp] = useState(null); // existing application from backend
  const [shelterAppLoading, setShelterAppLoading] = useState(false);
  const [shelterAppChecked, setShelterAppChecked] = useState(false);
  const [shelterSubmitting, setShelterSubmitting] = useState(false);
  const [shelterSuccess, setShelterSuccess] = useState('');
  const [shelterError, setShelterError] = useState('');
  const [shelterFieldErrors, setShelterFieldErrors] = useState({});
  const [shelterTouched, setShelterTouched] = useState({});

  // Shelter Step (1 = Details Form, 2 = Verify Email & Phone Codes)
  const [shelterStep, setShelterStep] = useState(1);
  const [shelterEmailVerified, setShelterEmailVerified] = useState(false);
  const [shelterPhoneVerified, setShelterPhoneVerified] = useState(false);
  const [shelterEmailOtp, setShelterEmailOtp] = useState('');
  const [shelterPhoneOtp, setShelterPhoneOtp] = useState('');
  const [shelterOtpTimer, setShelterOtpTimer] = useState(0);
  const [shelterConfirmationResult, setShelterConfirmationResult] = useState(null);
  const [shelterEmailSending, setShelterEmailSending] = useState(false);
  const [shelterPhoneSending, setShelterPhoneSending] = useState(false);
  const [shelterEmailVerifying, setShelterEmailVerifying] = useState(false);
  const [shelterPhoneVerifying, setShelterPhoneVerifying] = useState(false);

  // OTP Timer countdown
  useEffect(() => {
    let interval;
    if (shelterOtpTimer > 0 && shelterStep === 2) {
      interval = setInterval(() => {
        setShelterOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [shelterOtpTimer, shelterStep]);

  // Shelter form fields
  const [sRegistrationType, setSRegistrationType] = useState('STATE_TRUST_SOCIETY');
  const [sRegistrationNumber, setSRegistrationNumber] = useState('');
  const [sShelterName, setSShelterName] = useState('');
  const [sShelterEmail, setSShelterEmail] = useState('');
  const [sShelterPhone, setSShelterPhone] = useState('');
  const [sLatitude, setSLatitude] = useState('');
  const [sLongitude, setSLongitude] = useState('');
  const [sTotalStaffs, setSTotalStaffs] = useState('');
  const [sTotalCages, setSTotalCages] = useState('');
  const [sOccupiedCages, setSOccupiedCages] = useState('');
  const [sLocating, setSLocating] = useState(false);

  // Live single-field validator
  const validateSingleShelterField = (field, value, overrides = {}) => {
    const fullForm = {
      shelterName: sShelterName,
      registrationType: sRegistrationType,
      registrationNumber: sRegistrationNumber,
      shelterEmail: sShelterEmail,
      shelterPhoneNumber: sShelterPhone,
      latitude: sLatitude,
      longitude: sLongitude,
      totalStaffs: sTotalStaffs,
      totalCages: sTotalCages,
      occupiedCages: sOccupiedCages,
      ...overrides,
      [field]: value,
    };

    const res = validateShelterField(field, value, fullForm);
    setShelterFieldErrors((prev) => ({
      ...prev,
      [field]: res.valid ? '' : res.error,
    }));

    // If totalCages or occupiedCages changed, re-validate capacity check
    if (field === 'totalCages' || field === 'occupiedCages') {
      const capRes = validateShelterField('occupiedCages', fullForm.occupiedCages, fullForm);
      setShelterFieldErrors((prev) => ({
        ...prev,
        occupiedCages: capRes.valid ? '' : capRes.error,
      }));
    }

    return res.valid;
  };

  const handleShelterFieldChange = (field, value, setter) => {
    setter(value);
    setShelterTouched((prev) => ({ ...prev, [field]: true }));
    validateSingleShelterField(field, value);
  };

  const handleShelterFieldBlur = (field, value) => {
    setShelterTouched((prev) => ({ ...prev, [field]: true }));
    validateSingleShelterField(field, value);
  };

  // Shelter UI view mode ('form' | 'history') and list of all submitted applications
  const [shelterViewTab, setShelterViewTab] = useState('form');
  const [shelterApplicationsList, setShelterApplicationsList] = useState([]);

  // Fetch user's existing applications whenever they open the tab
  const handleOpenShelterTab = async () => {
    setActiveTab('Register Shelter');
    setShelterViewTab('form'); // Always show the application submission form first!
    setShelterAppLoading(true);
    try {
      const res = await getMyApplication();
      setShelterApp(res.application || null);
      setShelterApplicationsList(res.applications || (res.application ? [res.application] : []));
    } catch {
      setShelterApp(null);
      setShelterApplicationsList([]);
    } finally {
      setShelterAppLoading(false);
      setShelterAppChecked(true);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setShelterError('Geolocation is not supported by your browser.');
      return;
    }
    setSLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);
        setSLatitude(lat);
        setSLongitude(lon);
        setShelterTouched((prev) => ({ ...prev, latitude: true, longitude: true }));
        validateSingleShelterField('latitude', lat);
        validateSingleShelterField('longitude', lon);
        setSLocating(false);
      },
      () => {
        setShelterError('Unable to retrieve location. Please enter coordinates manually.');
        setSLocating(false);
      }
    );
  };

  // Step 1 -> Step 2: Validate fields & dispatch OTP codes
  const handleProceedToShelterVerification = async (e) => {
    e?.preventDefault();
    setShelterError('');
    setShelterSuccess('');

    // Full form live Zod validation
    const fullForm = {
      shelterName: sShelterName,
      registrationType: sRegistrationType,
      registrationNumber: sRegistrationNumber.trim().toUpperCase(),
      shelterEmail: sShelterEmail,
      shelterPhoneNumber: sShelterPhone,
      latitude: sLatitude,
      longitude: sLongitude,
      totalStaffs: sTotalStaffs,
      totalCages: sTotalCages,
      occupiedCages: sOccupiedCages,
    };

    const validationResult = validateFullShelterForm(fullForm);
    if (!validationResult.valid) {
      setShelterFieldErrors(validationResult.errors);
      setShelterTouched({
        shelterName: true,
        registrationType: true,
        registrationNumber: true,
        shelterEmail: true,
        shelterPhoneNumber: true,
        latitude: true,
        longitude: true,
        totalStaffs: true,
        totalCages: true,
        occupiedCages: true,
      });
      const firstError = Object.values(validationResult.errors)[0];
      setShelterError(firstError || 'Please fix all highlighted errors before proceeding.');
      return;
    }

    setShelterSubmitting(true);
    try {
      // 1. Dispatch Email OTP
      const emailRes = await sendOtp(sShelterEmail.trim(), 'shelter_email_verification', sShelterName.trim());
      if (!emailRes.success) {
        console.warn('Email OTP dispatch note:', emailRes.message);
      }

      // 2. Dispatch Phone OTP via Firebase
      try {
        const appVerifier = setupRecaptcha('recaptcha-container-shelter');
        const phoneRes = await sendPhoneOtp(sShelterPhone.trim(), appVerifier);
        if (phoneRes.success) {
          setShelterConfirmationResult(phoneRes.confirmationResult);
        }
      } catch (fbErr) {
        console.warn('Firebase Phone OTP warning:', fbErr.message);
      }

      setShelterStep(2);
      setShelterOtpTimer(60);
      setShelterSuccess(`Verification codes dispatched! Please enter the 6-digit codes sent to ${sShelterEmail} and +91 ${sShelterPhone}.`);
    } catch (err) {
      setShelterError('Failed to send verification codes. Please try again.');
    } finally {
      setShelterSubmitting(false);
    }
  };

  // Verify Shelter Email OTP
  const handleVerifyShelterEmail = async (e) => {
    e?.preventDefault();
    setShelterError('');
    setShelterSuccess('');

    if (shelterEmailOtp.trim().length !== 6) {
      setShelterError('Please enter a 6-digit Email verification code.');
      return;
    }

    setShelterEmailVerifying(true);
    try {
      const res = await verifyOtp(sShelterEmail.trim(), shelterEmailOtp.trim(), 'shelter_email_verification');
      if (res.success) {
        setShelterEmailVerified(true);
        setShelterSuccess('Shelter email verified successfully ✓');
      } else {
        setShelterError(res.message || 'Invalid Email verification code. Please check your inbox.');
      }
    } catch (err) {
      setShelterError('Failed to verify email code. Please check your OTP.');
    } finally {
      setShelterEmailVerifying(false);
    }
  };

  // Verify Shelter Phone OTP
  const handleVerifyShelterPhone = async (e) => {
    e?.preventDefault();
    setShelterError('');
    setShelterSuccess('');

    if (shelterPhoneOtp.trim().length !== 6) {
      setShelterError('Please enter a 6-digit Phone verification code.');
      return;
    }

    if (!shelterConfirmationResult) {
      setShelterError('Phone verification session expired. Please click Resend Phone Code.');
      return;
    }

    setShelterPhoneVerifying(true);
    try {
      const res = await verifyPhoneOtp(shelterConfirmationResult, shelterPhoneOtp.trim());
      if (res.success) {
        setShelterPhoneVerified(true);
        setShelterSuccess('Shelter phone number verified successfully ✓');
      } else {
        setShelterError(res.message || 'Invalid Phone OTP code. Please check SMS or preset code (123456).');
      }
    } catch (err) {
      setShelterError('Failed to verify phone OTP code.');
    } finally {
      setShelterPhoneVerifying(false);
    }
  };

  // Resend Email OTP
  const handleResendShelterEmailOtp = async () => {
    if (shelterOtpTimer > 0) return;
    setShelterError('');
    setShelterSuccess('');
    setShelterEmailSending(true);
    try {
      const res = await sendOtp(sShelterEmail.trim(), 'shelter_email_verification', sShelterName.trim());
      if (res.success) {
        setShelterOtpTimer(60);
        setShelterSuccess(`A new 6-digit verification code has been sent to ${sShelterEmail}`);
      } else {
        setShelterError(res.message || 'Failed to resend Email verification code.');
      }
    } catch (err) {
      setShelterError('Error resending email code.');
    } finally {
      setShelterEmailSending(false);
    }
  };

  // Resend Phone OTP
  const handleResendShelterPhoneOtp = async () => {
    if (shelterOtpTimer > 0) return;
    setShelterError('');
    setShelterSuccess('');
    setShelterPhoneSending(true);
    try {
      const appVerifier = setupRecaptcha('recaptcha-container-shelter');
      const res = await sendPhoneOtp(sShelterPhone.trim(), appVerifier);
      if (res.success) {
        setShelterConfirmationResult(res.confirmationResult);
        setShelterOtpTimer(60);
        setShelterSuccess(`A new SMS verification code has been sent to +91 ${sShelterPhone}`);
      } else {
        setShelterError(res.message || 'Failed to resend Phone verification code.');
      }
    } catch (err) {
      setShelterError('Error resending phone code.');
    } finally {
      setShelterPhoneSending(false);
    }
  };

  // Final Submit handler once both Email & Phone are verified
  const handleFinalShelterSubmit = async () => {
    if (!shelterEmailVerified || !shelterPhoneVerified) {
      setShelterError('Please complete both Email and Phone number verifications before submitting.');
      return;
    }

    setShelterError('');
    setShelterSuccess('');
    setShelterSubmitting(true);
    try {
      const res = await submitShelterApplication({
        registrationType: sRegistrationType,
        registrationNumber: sRegistrationNumber.trim().toUpperCase(),
        shelterName: sShelterName.trim(),
        shelterEmail: sShelterEmail.trim(),
        shelterPhoneNumber: Number(sShelterPhone),
        latitude: parseFloat(sLatitude),
        longitude: parseFloat(sLongitude),
        totalStaffs: Number(sTotalStaffs),
        totalCages: Number(sTotalCages),
        occupiedCages: Number(sOccupiedCages),
        isEmailVerified: true,
        isPhoneVerified: true,
      });
      if (res.success) {
        setShelterApp(res.application);
        setShelterApplicationsList((prev) => [
          res.application,
          ...prev.filter((a) => a._id !== res.application._id),
        ]);
        setShelterStep(1);
        setShelterSuccess(
          'Shelter registration application submitted successfully! Admin will review and approve.'
        );
        loadNotifications();
        // Reset form inputs
        setSShelterName('');
        setSRegistrationType('STATE_TRUST_SOCIETY');
        setSRegistrationNumber('');
        setSShelterEmail('');
        setSShelterPhone('');
        setSLatitude('');
        setSLongitude('');
        setSTotalStaffs('');
        setSTotalCages('');
        setSOccupiedCages('');
        setShelterEmailOtp('');
        setShelterPhoneOtp('');
        setShelterEmailVerified(false);
        setShelterPhoneVerified(false);
        setShelterTouched({});
        setShelterFieldErrors({});
      } else {
        setShelterError(res.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      setShelterError(err?.response?.data?.message || err?.response?.data?.error || 'Network error. Please try again.');
    } finally {
      setShelterSubmitting(false);
    }
  };

  // Mandatory Profile Phone Verification States
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [profileOtpSent, setProfileOtpSent] = useState(false);
  const [profilePhoneOtp, setProfilePhoneOtp] = useState('');
  const [profileConfirmationResult, setProfileConfirmationResult] = useState(null);
  const [profilePhoneVerified, setProfilePhoneVerified] = useState(user?.isPhoneVerified ?? true);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileFieldErrors, setProfileFieldErrors] = useState({});
  const [profileTouched, setProfileTouched] = useState({});

  // Sync profile state when user is loaded asynchronously from backend / AuthContext
  useEffect(() => {
    if (user && !isEditing) {
      setProfileName(user.fullName || '');
      setProfileEmail(user.email || '');
      setProfilePhone(user.phoneNumber || '');
      setProfilePicUrl(
        user.profilePic
          ? user.profilePic.startsWith('/uploads')
            ? `http://localhost:5000${user.profilePic}`
            : user.profilePic
          : ''
      );
      setProfileDob(user.dob ? user.dob.slice(0, 10) : '');
      setProfileAddress(user.address || '');
      setProfileCity(user.city || '');
      setProfileDistrict(user.district || '');
      setProfileState(user.state || '');
      setProfilePincode(user.pincode || '');
      setProfilePhoneVerified(user.isPhoneVerified ?? true);
    }
  }, [user, isEditing]);

  // Live validator for each profile field
  const validateProfileField = (name, value) => {
    switch (name) {
      case 'fullName':
        if (!value || !value.trim()) return 'Full name is required.';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters.';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Full name can only contain letters and spaces.';
        return '';
      case 'phone': {
        const raw = (value || '').replace(/\D/g, '');
        if (!raw) return 'Phone number is required.';
        if (raw.length !== 10) return 'Phone number must be exactly 10 digits.';
        if (!/^[6-9]\d{9}$/.test(raw)) return 'Must be a valid Indian mobile number (starts with 6-9).';
        return '';
      }
      case 'dob':
        if (value && new Date(value) > new Date()) return 'Date of birth cannot be in the future.';
        return '';
      case 'state':
        if (!value || !value.trim()) return 'State is required.';
        return '';
      case 'district':
        if (!value || !value.trim()) return 'District is required.';
        return '';
      case 'city':
        if (!value || !value.trim()) return 'City / Locality is required.';
        return '';
      case 'pincode':
        if (!value || !value.trim()) return 'PIN code is required.';
        if (!/^\d{6}$/.test(value.trim())) return 'PIN code must be exactly 6 digits.';
        return '';
      case 'address':
        if (value && value.trim().length > 0 && value.trim().length < 3) return 'Address must be at least 3 characters.';
        return '';
      default:
        return '';
    }
  };

  // Run full validation before save — returns true if valid
  const validateAllProfileFields = () => {
    const errors = {
      fullName: validateProfileField('fullName', profileName),
      phone: validateProfileField('phone', profilePhone),
      dob: validateProfileField('dob', profileDob),
      state: validateProfileField('state', profileState),
      district: validateProfileField('district', profileDistrict),
      city: validateProfileField('city', profileCity),
      pincode: validateProfileField('pincode', profilePincode),
      address: validateProfileField('address', profileAddress),
    };
    setProfileFieldErrors(errors);
    setProfileTouched({
      fullName: true,
      phone: true,
      dob: true,
      state: true,
      district: true,
      city: true,
      pincode: true,
      address: true,
      all: true,
    });
    return Object.values(errors).every((e) => !e);
  };

  // Notification Preference switches
  const [prefRescue, setPrefRescue] = useState(true);
  const [prefAdoption, setPrefAdoption] = useState(true);
  const [prefVaccination, setPrefVaccination] = useState(true);

  // Change Password States
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError('New password must contain at least one uppercase letter.');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordError('New password must contain at least one number.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      // Call the backend to change password (uses token auth to verify current password)
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('resqnet_token')}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (data.success) {
        setPasswordSuccess('Password changed successfully! Please use your new password next time you log in.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setShowChangePassword(false);
      } else {
        setPasswordError(data.message || 'Failed to change password. Please check your current password.');
      }
    } catch (err) {
      setPasswordError('An error occurred while changing the password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Send Phone OTP for Profile Update
  const handleSendProfilePhoneOtp = async () => {
    setProfileError('');
    setProfileSuccess('');

    const rawPhone = profilePhone.replace(/\D/g, '');
    if (!rawPhone || rawPhone.length !== 10) {
      setProfileError('Phone number is mandatory. Please enter a valid 10-digit Indian phone number.');
      return;
    }

    setPhoneVerifying(true);
    try {
      const appVerifier = setupRecaptcha('recaptcha-container-profile');
      const res = await sendPhoneOtp(rawPhone, appVerifier);
      if (res.success) {
        setProfileConfirmationResult(res.confirmationResult);
        setProfileOtpSent(true);
        setProfileSuccess('Phone OTP code sent! Please enter your 6-digit code below (e.g. preset test OTP 123456).');
      } else {
        setProfileError(res.message || 'Failed to send Phone OTP. Please verify Firebase setup.');
      }
    } catch (err) {
      setProfileError('Error sending phone verification code: ' + err.message);
    } finally {
      setPhoneVerifying(false);
    }
  };

  // Verify Phone OTP & Save Profile Update
  const handleVerifyProfilePhoneAndSave = async () => {
    setProfileError('');
    setProfileSuccess('');

    if (profilePhoneOtp.length !== 6) {
      setProfileError('Please enter a 6-digit verification code.');
      return;
    }

    if (!profileConfirmationResult) {
      setProfileError('Verification session expired. Please click Send OTP code again.');
      return;
    }

    setPhoneVerifying(true);
    try {
      const verifyRes = await verifyPhoneOtp(profileConfirmationResult, profilePhoneOtp.trim());
      if (!verifyRes.success) {
        setProfileError(verifyRes.message || 'Invalid Phone OTP code. Please check preset test OTP (123456).');
        setPhoneVerifying(false);
        return;
      }

      // Save profile with isPhoneVerified: true
      const rawPhone = profilePhone.replace(/\D/g, '');
      let payload;
      if (profilePicFile) {
        payload = new FormData();
        payload.append('fullName', profileName);
        payload.append('phoneNumber', rawPhone);
        payload.append('dob', profileDob);
        payload.append('address', profileAddress);
        payload.append('city', profileCity);
        payload.append('district', profileDistrict);
        payload.append('state', profileState);
        payload.append('pincode', profilePincode);
        payload.append('profilePic', profilePicFile);
        payload.append('isPhoneVerified', 'true');
      } else {
        payload = {
          fullName: profileName,
          phoneNumber: rawPhone,
          dob: profileDob,
          address: profileAddress,
          city: profileCity,
          district: profileDistrict,
          state: profileState,
          pincode: profilePincode,
          isPhoneVerified: true,
        };
      }
      const updateRes = await updateProfile(payload);

      if (updateRes.success) {
        setProfilePhoneVerified(true);
        setProfileOtpSent(false);
        setIsEditing(false);
        setProfileSuccess('Phone number verified and profile updated successfully! ✓');
      } else {
        setProfileError(updateRes.message || 'Failed to save profile updates.');
      }
    } catch (err) {
      setProfileError('An unexpected error occurred while saving profile.');
    } finally {
      setPhoneVerifying(false);
    }
  };

  // Handle profile picture file selection
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileError('Please select a valid image file (JPG, PNG, etc.).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Image must be smaller than 5MB.');
      return;
    }
    setProfilePicFile(file);
    setProfilePicUrl(URL.createObjectURL(file));
    setProfileError('');
  };

  // Direct Profile Save handler (if phone number is unchanged)
  const handleSaveProfileDirect = async () => {
    setProfileError('');
    setProfileSuccess('');

    // Run full field validation first
    if (!validateAllProfileFields()) {
      setProfileError('Please fix the errors highlighted below before saving.');
      return;
    }

    const rawPhone = profilePhone.replace(/\D/g, '');

    // If phone number was changed from initial user.phoneNumber, require OTP verification!
    if (user?.phoneNumber && rawPhone !== user.phoneNumber.replace(/\D/g, '')) {
      return handleSendProfilePhoneOtp();
    }

    setPhoneVerifying(true);
    try {
      // Build FormData to support profile pic upload
      let payload;
      if (profilePicFile) {
        payload = new FormData();
        payload.append('fullName', profileName);
        payload.append('phoneNumber', rawPhone);
        payload.append('dob', profileDob);
        payload.append('address', profileAddress);
        payload.append('city', profileCity);
        payload.append('district', profileDistrict);
        payload.append('state', profileState);
        payload.append('pincode', profilePincode);
        payload.append('profilePic', profilePicFile);
      } else {
        payload = {
          fullName: profileName,
          phoneNumber: rawPhone,
          dob: profileDob,
          address: profileAddress,
          city: profileCity,
          district: profileDistrict,
          state: profileState,
          pincode: profilePincode,
        };
      }

      const updateRes = await updateProfile(payload);

      if (updateRes.success) {
        setIsEditing(false);
        setProfilePicFile(null);
        setProfileSuccess('Profile updated successfully!');
      } else {
        setProfileError(updateRes.message || 'Failed to save profile updates.');
      }
    } catch (err) {
      setProfileError('An unexpected error occurred while updating profile.');
    } finally {
      setPhoneVerifying(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getFirstName = () => {
    return (user?.fullName || profileName || 'User').split(' ')[0];
  };

  const handleReportSubmit = async (e) => {
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

    try {
      await createNotification({
        title: 'Rescue Report Submitted 🚨',
        message: `Your report for a ${animalCondition} ${animalType} has been successfully filed under ${newReportId}. Rescue teams in your area have been alerted.`,
        type: 'Rescue',
        priority: 'High',
        metadata: { reportId: newReportId },
      });
      loadNotifications();
    } catch (err) {
      console.warn('Failed to dispatch rescue notification:', err.message);
    }

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
              { name: 'Register Shelter', icon: Building2 },
            ].map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.name === 'Register Shelter') {
                      handleOpenShelterTab();
                    } else {
                      setActiveTab(item.name);
                      setSubmitSuccess(false);
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
            <div className="relative">
              <button 
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl cursor-pointer relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notifDropdownOpen && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-bold text-[#237737] hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {notifications.slice(0, 5).map((n) => {
                      const iconInfo = getNotificationIconInfo(n);
                      const Icon = iconInfo.icon;
                      const notifId = n._id || n.id;
                      const isUnread = n.status === 'Unread';
                      return (
                        <div
                          key={notifId}
                          onClick={() => handleToggleRead(notifId)}
                          className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer ${
                            isUnread ? 'bg-emerald-50/30' : ''
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 ${iconInfo.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className={`text-xs font-bold truncate ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                                {n.title || n.message}
                              </p>
                              {isUnread && <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message || n.text}</p>
                            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                              {formatNotificationTime(n.createdAt || n.timestamp)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {notifications.length === 0 && (
                      <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                        No notifications yet
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
                    <button
                      onClick={() => {
                        setNotifDropdownOpen(false);
                        setActiveTab('Notifications');
                      }}
                      className="text-xs font-bold text-[#237737] hover:underline cursor-pointer flex items-center justify-center gap-1 w-full"
                    >
                      View All Notifications <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown / Widget */}
            <UserProfileDropdown
              onOpenProfile={() => setActiveTab('My Profile')}
              unreadCount={unreadCount}
              onOpenNotifications={() => setActiveTab('Notifications')}
            />
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
            <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                    Notifications
                  </h1>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1 font-semibold">
                    {unreadCount > 0 ? (
                      <span className="text-orange-600 font-bold">{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</span>
                    ) : (
                      'All caught up! No unread notifications.'
                    )}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={loadNotifications}
                    disabled={notificationsLoading}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
                    title="Refresh notifications"
                  >
                    <RefreshCw className={`w-4 h-4 ${notificationsLoading ? 'animate-spin' : ''}`} />
                  </button>

                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#237737] border border-emerald-200/80 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark all as read
                    </button>
                  )}
                </div>
              </div>

              {/* Notification Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'All', label: 'All Notifications', count: notifications.length },
                  { id: 'Unread', label: 'Unread', count: unreadCount },
                  { id: 'ShelterApplication', label: 'Shelter Applications', count: notifications.filter(n => n.type === 'ShelterApplication').length },
                  { id: 'Rescue', label: 'Rescue Reports', count: notifications.filter(n => n.type === 'Rescue').length },
                  { id: 'Welcome', label: 'Welcome & System', count: notifications.filter(n => n.type === 'Welcome' || n.type === 'System').length },
                ].map((flt) => (
                  <button
                    key={flt.id}
                    onClick={() => setNotificationFilter(flt.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      notificationFilter === flt.id
                        ? 'bg-[#237737] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {flt.label}
                    {flt.count > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        notificationFilter === flt.id
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {flt.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Loading State */}
              {notificationsLoading && (
                <div className="p-6 bg-white border border-slate-100 rounded-2xl text-slate-400 text-xs font-semibold animate-pulse flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Loading notifications…
                </div>
              )}

              {/* Notifications List */}
              <div className="space-y-3.5">
                {notifications
                  .filter((notif) => {
                    if (notificationFilter === 'Unread') return notif.status === 'Unread';
                    if (notificationFilter === 'ShelterApplication') return notif.type === 'ShelterApplication';
                    if (notificationFilter === 'Rescue') return notif.type === 'Rescue';
                    if (notificationFilter === 'Welcome') return notif.type === 'Welcome' || notif.type === 'System';
                    return true;
                  })
                  .map((notif) => {
                    const iconInfo = getNotificationIconInfo(notif);
                    const Icon = iconInfo.icon;
                    const isUnread = notif.status === 'Unread' || notif.unread;

                    return (
                      <div 
                        key={notif._id || notif.id}
                        onClick={() => handleToggleRead(notif._id || notif.id)}
                        className={`p-5 bg-white border border-slate-100 hover:border-slate-200/80 rounded-2xl flex items-start gap-4 transition-all duration-200 cursor-pointer shadow-sm relative ${
                          isUnread ? 'border-l-4 border-l-[#237737] bg-emerald-50/15' : ''
                        }`}
                      >
                        <div className={`p-3 ${iconInfo.color} rounded-2xl flex-shrink-0 mt-0.5`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="space-y-1.5 pr-8 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-extrabold text-sm text-slate-900">{notif.title}</h4>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${iconInfo.badgeColor}`}>
                              {iconInfo.label}
                            </span>
                            {isUnread && (
                              <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" title="Unread"></span>
                            )}
                          </div>
                          
                          <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                            {notif.message || notif.body}
                          </p>
                          
                          <p className="text-[10px] text-slate-400 font-bold pt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatNotificationTime(notif.createdAt || notif.time)}
                          </p>
                        </div>

                        <button 
                          onClick={(e) => handleDeleteNotification(notif._id || notif.id, e)}
                          className="absolute right-4 top-4 text-slate-350 hover:text-rose-500 transition cursor-pointer p-1 rounded-lg hover:bg-slate-50"
                          title="Dismiss notification"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}

                {!notificationsLoading && notifications.length === 0 && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                      <Bell className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">No Notifications Yet</h3>
                      <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto font-medium">
                        You'll be notified here when your shelter application updates, emergency reports are assigned, or announcements occur.
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
              <div id="recaptcha-container-profile"></div>
              
              {/* Profile Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                
                {/* Header Information block */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-100 pb-6">

                  {/* Photo & Titles */}
                  <div className="flex items-center gap-4.5">
                    {/* Profile Picture */}
                    <div className="relative group shrink-0">
                      {profilePicUrl ? (
                        <img
                          src={profilePicUrl}
                          alt="Profile"
                          className="w-20 h-20 rounded-2xl object-cover shadow-sm border-2 border-slate-100"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-emerald-700 text-white font-black text-3xl flex items-center justify-center shadow-sm select-none">
                          {(user?.fullName || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      {isEditing && (
                        <label
                          htmlFor="profile-pic-upload"
                          className="absolute inset-0 flex items-center justify-center bg-black/45 rounded-2xl opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        >
                          <Camera className="w-6 h-6 text-white" />
                          <input
                            id="profile-pic-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleProfilePicChange}
                          />
                        </label>
                      )}
                      {isEditing && (
                        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap shadow">
                          Change Photo
                        </span>
                      )}
                    </div>

                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">{user?.fullName || profileName || 'Your Name'}</h2>
                      <p className="text-xs text-slate-400 font-bold mt-0.5">
                        {user?.role || 'Public User'}{(user?.city || profileCity) ? ` • ${user?.city || profileCity}` : ''}{(user?.state || profileState) ? `, ${user?.state || profileState}` : ''}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-block px-2.5 py-0.5 bg-emerald-500/10 text-emerald-700 border border-emerald-200/50 text-[10px] font-black rounded-lg">
                          {user?.role || 'Public User'}
                        </span>
                        {profilePhoneVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Phone Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-lg">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> Phone Unverified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    type="button"
                    onClick={() => {
                      setIsEditing(!isEditing);
                      setProfileError('');
                      setProfileSuccess('');
                      setProfileOtpSent(false);
                      setProfileFieldErrors({});
                      setProfileTouched({});
                    }}
                    className="sm:self-start px-4.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-350 text-slate-800 text-xs font-extrabold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                  </button>
                </div>

                {/* Banner Banners */}
                {profileError && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}
                {profileSuccess && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Full Name <span className="text-rose-600 font-bold">*</span></label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProfileName(val);
                        const err = validateProfileField('fullName', val);
                        setProfileFieldErrors((prev) => ({ ...prev, fullName: err }));
                        setProfileTouched((prev) => ({ ...prev, fullName: true }));
                      }}
                      onBlur={() => {
                        setProfileTouched((prev) => ({ ...prev, fullName: true }));
                        setProfileFieldErrors((prev) => ({ ...prev, fullName: validateProfileField('fullName', profileName) }));
                      }}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 border rounded-2xl font-semibold text-sm transition ${
                        !isEditing
                          ? 'bg-slate-50 border-slate-200/80 text-slate-700 cursor-not-allowed'
                          : profileTouched.fullName && profileFieldErrors.fullName
                          ? 'bg-rose-50 border-rose-400 focus:outline-none focus:border-rose-500'
                          : 'bg-[#F8FAF9] border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#237737]'
                      }`}
                    />
                    {isEditing && profileTouched.fullName && profileFieldErrors.fullName && (
                      <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 shrink-0" /> {profileFieldErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Email Address (Read-only)</label>
                    <input 
                      type="email" 
                      value={profileEmail} 
                      disabled 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-400 font-semibold text-sm cursor-not-allowed"
                    />
                  </div>

                  {/* Phone (MANDATORY FIELD) */}
                  <div className="space-y-1.5 md:col-span-2 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-[#237737]" /> Phone Number <span className="text-rose-600 font-bold">* (Mandatory)</span>
                      </label>
                      {profilePhoneVerified && !isEditing && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Required for animal rescue dispatch calls and adoption notifications.
                    </p>
                    <div className="flex gap-2 pt-1">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-3 text-sm font-bold text-slate-500">+91</span>
                        <input
                          type="tel"
                          value={profilePhone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setProfilePhone(val);
                            if (profilePhoneVerified && val !== (user?.phoneNumber || '').replace(/\D/g, '')) {
                              setProfilePhoneVerified(false);
                            }
                            const err = validateProfileField('phone', val);
                            setProfileFieldErrors((prev) => ({ ...prev, phone: err }));
                            setProfileTouched((prev) => ({ ...prev, phone: true }));
                          }}
                          onBlur={() => {
                            setProfileTouched((prev) => ({ ...prev, phone: true }));
                            setProfileFieldErrors((prev) => ({ ...prev, phone: validateProfileField('phone', profilePhone) }));
                          }}
                          disabled={!isEditing}
                          placeholder="9876543210"
                          maxLength={10}
                          className={`w-full pl-12 pr-4 py-3 border rounded-xl font-mono text-sm transition ${
                            !isEditing
                              ? 'bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed'
                              : profileTouched.phone && profileFieldErrors.phone
                              ? 'bg-rose-50 border-rose-400 focus:outline-none focus:border-rose-500'
                              : 'bg-white border-slate-300 focus:outline-none focus:border-[#237737]'
                          }`}
                        />
                      </div>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={handleSendProfilePhoneOtp}
                          disabled={phoneVerifying || profilePhone.length !== 10}
                          className="px-4 py-2 bg-[#237737] hover:bg-[#1d632e] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0 shadow-sm"
                        >
                          {phoneVerifying ? 'Sending Code...' : profileOtpSent ? 'Resend Code' : 'Send Phone OTP'}
                        </button>
                      )}
                    </div>

                    {/* Phone field error */}
                    {isEditing && profileTouched.phone && profileFieldErrors.phone && (
                      <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 shrink-0" /> {profileFieldErrors.phone}
                      </p>
                    )}

                    {/* Inline Phone OTP Verification Box */}
                    {isEditing && profileOtpSent && (
                      <div className="mt-3 p-3.5 bg-white border border-emerald-200 rounded-xl space-y-2">
                        <label className="block text-xs font-bold text-slate-700">
                          Enter 6-Digit Phone Verification Code (e.g. preset test OTP 123456)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={profilePhoneOtp}
                            onChange={(e) => setProfilePhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="123456"
                            className="w-full text-center text-base tracking-widest px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#237737]"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyProfilePhoneAndSave}
                            disabled={phoneVerifying || profilePhoneOtp.length !== 6}
                            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition shrink-0 cursor-pointer flex items-center gap-1"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            {phoneVerifying ? 'Verifying...' : 'Verify Phone & Save'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Date of Birth</label>
                    <input
                      type="date"
                      value={profileDob}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProfileDob(val);
                        const err = validateProfileField('dob', val);
                        setProfileFieldErrors((prev) => ({ ...prev, dob: err }));
                        setProfileTouched((prev) => ({ ...prev, dob: true }));
                      }}
                      onBlur={() => {
                        setProfileTouched((prev) => ({ ...prev, dob: true }));
                        setProfileFieldErrors((prev) => ({ ...prev, dob: validateProfileField('dob', profileDob) }));
                      }}
                      disabled={!isEditing}
                      max={new Date().toISOString().slice(0, 10)}
                      className={`w-full px-4 py-3 border rounded-2xl font-semibold text-sm transition ${
                        !isEditing
                          ? 'bg-slate-50 border-slate-200/80 text-slate-700 cursor-not-allowed'
                          : profileTouched.dob && profileFieldErrors.dob
                          ? 'bg-rose-50 border-rose-400 focus:outline-none focus:border-rose-500'
                          : 'bg-[#F8FAF9] border-slate-200 hover:border-slate-300 focus:outline-none focus:border-[#237737]'
                      }`}
                    />
                    {isEditing && profileTouched.dob && profileFieldErrors.dob && (
                      <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3 shrink-0" /> {profileFieldErrors.dob}
                      </p>
                    )}
                  </div>

                  {/* Account Status */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Account Status</label>
                    <input
                      type="text"
                      value="Active ✓"
                      disabled
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-emerald-600 font-bold text-sm cursor-not-allowed"
                    />
                  </div>

                  {/* Complete Indian Address & Location Selection */}
                  <div className="md:col-span-2 pt-1">
                    <AddressForm
                      value={{
                        address: profileAddress,
                        state: profileState,
                        district: profileDistrict,
                        city: profileCity,
                        pincode: profilePincode,
                      }}
                      onChange={(updated) => {
                        setProfileAddress(updated.address || '');
                        setProfileState(updated.state || '');
                        setProfileDistrict(updated.district || '');
                        setProfileCity(updated.city || '');
                        setProfilePincode(updated.pincode || '');

                        setProfileFieldErrors((prev) => ({
                          ...prev,
                          address: validateProfileField('address', updated.address),
                          state: validateProfileField('state', updated.state),
                          district: validateProfileField('district', updated.district),
                          city: validateProfileField('city', updated.city),
                          pincode: validateProfileField('pincode', updated.pincode),
                        }));
                        setProfileTouched((prev) => ({
                          ...prev,
                          state: true,
                          district: true,
                          city: true,
                          pincode: true,
                          address: true,
                        }));
                      }}
                      onBlur={(field) => {
                        setProfileTouched((prev) => ({ ...prev, [field]: true }));
                      }}
                      errors={profileFieldErrors}
                      touched={profileTouched}
                      disabled={!isEditing}
                      showAddressLine={true}
                    />
                  </div>
                </div>

                {/* Edit Form Actions */}
                {isEditing && (
                  <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileName(user?.fullName || '');
                        setProfilePhone(user?.phoneNumber || '');
                        setProfilePicUrl(
                          user?.profilePic
                            ? user.profilePic.startsWith('/uploads')
                              ? `http://localhost:5000${user.profilePic}`
                              : user.profilePic
                            : ''
                        );
                        setProfilePicFile(null);
                        setProfileDob(user?.dob ? user.dob.slice(0, 10) : '');
                        setProfileAddress(user?.address || '');
                        setProfileCity(user?.city || '');
                        setProfileDistrict(user?.district || '');
                        setProfileState(user?.state || '');
                        setProfilePincode(user?.pincode || '');
                        setIsEditing(false);
                        setProfileError('');
                        setProfileSuccess('');
                        setProfileOtpSent(false);
                        setProfileFieldErrors({});
                        setProfileTouched({});
                      }}
                      className="px-4.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Discard
                    </button>
                    <button 
                      type="button" 
                      onClick={handleSaveProfileDirect}
                      disabled={phoneVerifying}
                      className="px-5 py-2.5 bg-[#237737] hover:bg-[#1d632e] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow shadow-[#237737]/10 flex items-center gap-1.5"
                    >
                      {phoneVerifying ? 'Saving...' : 'Save Profile Changes'}
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

              {/* Change Password Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">Change Password</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Keep your account secure with a strong password</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(!showChangePassword);
                      setPasswordError('');
                      setPasswordSuccess('');
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition px-3.5 py-2 rounded-xl"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    {showChangePassword ? 'Cancel' : 'Change Password'}
                  </button>
                </div>

                {passwordSuccess && !showChangePassword && (
                  <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-xs font-semibold">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    {passwordSuccess}
                  </div>
                )}

                {showChangePassword && (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-slate-50"
                      />
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Min 8 chars, 1 uppercase, 1 number"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-slate-50"
                      />
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter your new password"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-slate-50"
                      />
                    </div>

                    {/* Strength hints */}
                    {newPassword && (
                      <ul className="text-xs space-y-1 pl-1">
                        <li className={`flex items-center gap-1.5 font-medium ${newPassword.length >= 8 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          <CheckCircle className="w-3.5 h-3.5" /> At least 8 characters
                        </li>
                        <li className={`flex items-center gap-1.5 font-medium ${/[A-Z]/.test(newPassword) ? 'text-emerald-600' : 'text-slate-400'}`}>
                          <CheckCircle className="w-3.5 h-3.5" /> One uppercase letter
                        </li>
                        <li className={`flex items-center gap-1.5 font-medium ${/[0-9]/.test(newPassword) ? 'text-emerald-600' : 'text-slate-400'}`}>
                          <CheckCircle className="w-3.5 h-3.5" /> One number
                        </li>
                        <li className={`flex items-center gap-1.5 font-medium ${confirmNewPassword && newPassword === confirmNewPassword ? 'text-emerald-600' : 'text-slate-400'}`}>
                          <CheckCircle className="w-3.5 h-3.5" /> Passwords match
                        </li>
                      </ul>
                    )}

                    {/* Error */}
                    {passwordError && (
                      <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-xs font-semibold">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        {passwordError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {passwordLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Updating Password...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Update Password
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

            </div>
          )}

          {/* Register Shelter Tab */}
          {activeTab === 'Register Shelter' && (
            <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
              {/* Header with Title & Tab Navigation Pills */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Register Your Shelter</h1>
                  <p className="text-slate-500 text-sm mt-1">
                    Submit an application to partner your shelter with ResQNet. Admin will review and approve.
                  </p>
                </div>

                {/* Sub-tab Toggle Pills */}
                <div className="flex items-center bg-slate-100 p-1 rounded-2xl w-fit shrink-0">
                  <button
                    type="button"
                    onClick={() => setShelterViewTab('form')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      shelterViewTab === 'form'
                        ? 'bg-white text-[#237737] shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Application
                  </button>
                  <button
                    type="button"
                    onClick={() => setShelterViewTab('history')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      shelterViewTab === 'history'
                        ? 'bg-white text-[#237737] shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    Submitted Applications
                    {shelterApplicationsList.length > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        shelterViewTab === 'history' ? 'bg-[#237737]/10 text-[#237737]' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {shelterApplicationsList.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Loading skeleton */}
              {shelterAppLoading && (
                <div className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-3 text-slate-400 text-sm font-semibold animate-pulse">
                  <Clock className="w-4 h-4" /> Checking your applications…
                </div>
              )}

              {/* Invisible Firebase Recaptcha Container for Shelter Phone OTP */}
              <div id="recaptcha-container-shelter"></div>

              {/* ======================================================== */}
              {/* VIEW 1: REGISTRATION APPLICATION FORM (SHOWN FIRST)      */}
              {/* ======================================================== */}
              {shelterViewTab === 'form' && (
                <div className="space-y-5 animate-fade-in">

                  {/* Success / Error messages */}
                  {shelterSuccess && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 text-sm font-semibold animate-fade-in">
                      <CheckCircle className="w-4 h-4 shrink-0" /> {shelterSuccess}
                    </div>
                  )}
                  {shelterError && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-semibold animate-fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {shelterError}
                    </div>
                  )}

                  {/* STEP 1: SHELTER DETAILS FORM */}
                  {shelterStep === 1 && (
                    <form onSubmit={handleProceedToShelterVerification} className="space-y-5">
                      {/* Step Indicator */}
                      <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-[#237737] text-white flex items-center justify-center text-xs font-black">1</span>
                          <div>
                            <p className="text-xs font-black text-slate-800">Step 1: Shelter Registration Details</p>
                            <p className="text-[11px] text-slate-400 font-semibold">Fill organization details, location, and capacity</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-black text-[#237737] bg-[#237737]/10 px-3 py-1 rounded-full">
                          Step 1 of 2
                        </span>
                      </div>

                      {/* Section 1: Shelter Identity */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm">
                        <h3 className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#237737]" /> Shelter Identity
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Shelter Name */}
                          <div className="space-y-1.5 sm:col-span-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-600">Shelter Name <span className="text-rose-500">*</span></label>
                              {shelterTouched.shelterName && !shelterFieldErrors.shelterName && sShelterName && (
                                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> Valid
                                </span>
                              )}
                            </div>
                            <input
                              type="text"
                              value={sShelterName}
                              onChange={(e) => handleShelterFieldChange('shelterName', e.target.value, setSShelterName)}
                              onBlur={(e) => handleShelterFieldBlur('shelterName', e.target.value)}
                              placeholder="e.g. Paws & Care Animal Shelter"
                              required
                              className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl focus:outline-none text-sm font-semibold transition ${
                                shelterTouched.shelterName && shelterFieldErrors.shelterName
                                  ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                                  : 'border-slate-200 focus:border-[#237737]'
                              }`}
                            />
                            {shelterTouched.shelterName && shelterFieldErrors.shelterName && (
                              <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                                <AlertCircle className="w-3 h-3 shrink-0" /> {shelterFieldErrors.shelterName}
                              </p>
                            )}
                          </div>
                          
                          {/* Registration Type */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600">Registration Authority / Type <span className="text-rose-500">*</span></label>
                            <select
                              value={sRegistrationType}
                              onChange={(e) => {
                                const newType = e.target.value;
                                setSRegistrationType(newType);
                                validateSingleShelterField('registrationType', newType);
                                validateSingleShelterField('registrationNumber', sRegistrationNumber, { registrationType: newType });
                              }}
                              className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#237737] text-sm font-semibold transition cursor-pointer"
                            >
                              <option value="STATE_TRUST_SOCIETY">State Trust / Society Registration</option>
                              <option value="NGO_DARPAN">NGO Darpan (NITI Aayog)</option>
                              <option value="MCA_CIN">MCA Corporate Identification Number (CIN)</option>
                              <option value="NGO_PAN">NGO Trust / Society PAN</option>
                              <option value="AWBI_ID">Animal Welfare Board of India (AWBI)</option>
                            </select>
                          </div>

                          {/* Registration Number */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-600">Registration Number <span className="text-rose-500">*</span></label>
                              <span className="text-[10px] text-slate-400 font-bold">
                                {SHELTER_REGISTRATION_RULES[sRegistrationType]?.hint}
                              </span>
                            </div>
                            <input
                              type="text"
                              value={sRegistrationNumber}
                              onChange={(e) => handleShelterFieldChange('registrationNumber', e.target.value.toUpperCase(), setSRegistrationNumber)}
                              onBlur={(e) => handleShelterFieldBlur('registrationNumber', e.target.value.toUpperCase())}
                              placeholder={`e.g. ${SHELTER_REGISTRATION_RULES[sRegistrationType]?.example || 'REG/KL/2024/001234'}`}
                              required
                              className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl focus:outline-none text-sm font-semibold transition uppercase ${
                                shelterTouched.registrationNumber && shelterFieldErrors.registrationNumber
                                  ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                                  : 'border-slate-200 focus:border-[#237737]'
                              }`}
                            />
                            {shelterTouched.registrationNumber && shelterFieldErrors.registrationNumber && (
                              <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                                <AlertCircle className="w-3 h-3 shrink-0" /> {shelterFieldErrors.registrationNumber}
                              </p>
                            )}
                            {shelterTouched.registrationNumber && !shelterFieldErrors.registrationNumber && sRegistrationNumber && (
                              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                                <CheckCircle className="w-3 h-3 shrink-0" /> Valid registration number format ✓
                              </p>
                            )}
                          </div>

                          {/* Shelter Email */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-600">Shelter Email <span className="text-rose-500">*</span></label>
                              {shelterTouched.shelterEmail && !shelterFieldErrors.shelterEmail && sShelterEmail && (
                                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> Valid
                                </span>
                              )}
                            </div>
                            <input
                              type="email"
                              value={sShelterEmail}
                              onChange={(e) => handleShelterFieldChange('shelterEmail', e.target.value, setSShelterEmail)}
                              onBlur={(e) => handleShelterFieldBlur('shelterEmail', e.target.value)}
                              placeholder="shelter@example.com"
                              required
                              className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl focus:outline-none text-sm font-semibold transition ${
                                shelterTouched.shelterEmail && shelterFieldErrors.shelterEmail
                                  ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                                  : 'border-slate-200 focus:border-[#237737]'
                              }`}
                            />
                            {shelterTouched.shelterEmail && shelterFieldErrors.shelterEmail && (
                              <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                                <AlertCircle className="w-3 h-3 shrink-0" /> {shelterFieldErrors.shelterEmail}
                              </p>
                            )}
                          </div>

                          {/* Contact Number */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-600">Contact Number <span className="text-rose-500">*</span></label>
                              {shelterTouched.shelterPhoneNumber && !shelterFieldErrors.shelterPhoneNumber && sShelterPhone && (
                                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> Valid
                                </span>
                              )}
                            </div>
                            <input
                              type="tel"
                              value={sShelterPhone}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                                handleShelterFieldChange('shelterPhoneNumber', raw, setSShelterPhone);
                              }}
                              onBlur={(e) => handleShelterFieldBlur('shelterPhoneNumber', e.target.value)}
                              placeholder="10-digit mobile number"
                              required
                              maxLength={10}
                              className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl focus:outline-none text-sm font-semibold transition ${
                                shelterTouched.shelterPhoneNumber && shelterFieldErrors.shelterPhoneNumber
                                  ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                                  : 'border-slate-200 focus:border-[#237737]'
                              }`}
                            />
                            {shelterTouched.shelterPhoneNumber && shelterFieldErrors.shelterPhoneNumber && (
                              <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                                <AlertCircle className="w-3 h-3 shrink-0" /> {shelterFieldErrors.shelterPhoneNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Location */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#237737]" /> Shelter Location Coordinates
                          </h3>
                          <button
                            type="button"
                            onClick={handleUseMyLocation}
                            disabled={sLocating}
                            className="px-3.5 py-1.5 bg-[#237737]/10 hover:bg-[#237737]/20 text-[#237737] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Navigation className={`w-3.5 h-3.5 ${sLocating ? 'animate-spin' : ''}`} />
                            {sLocating ? 'Detecting…' : 'Use My Location'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Latitude */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600">Latitude (-90 to +90) <span className="text-rose-500">*</span></label>
                            <input
                              type="number"
                              step="any"
                              value={sLatitude}
                              onChange={(e) => handleShelterFieldChange('latitude', e.target.value, setSLatitude)}
                              onBlur={(e) => handleShelterFieldBlur('latitude', e.target.value)}
                              placeholder="e.g. 9.931233"
                              required
                              className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl focus:outline-none text-sm font-semibold transition ${
                                shelterTouched.latitude && shelterFieldErrors.latitude
                                  ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                                  : 'border-slate-200 focus:border-[#237737]'
                              }`}
                            />
                            {shelterTouched.latitude && shelterFieldErrors.latitude && (
                              <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                                <AlertCircle className="w-3 h-3 shrink-0" /> {shelterFieldErrors.latitude}
                              </p>
                            )}
                          </div>

                          {/* Longitude */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600">Longitude (-180 to +180) <span className="text-rose-500">*</span></label>
                            <input
                              type="number"
                              step="any"
                              value={sLongitude}
                              onChange={(e) => handleShelterFieldChange('longitude', e.target.value, setSLongitude)}
                              onBlur={(e) => handleShelterFieldBlur('longitude', e.target.value)}
                              placeholder="e.g. 76.267303"
                              required
                              className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl focus:outline-none text-sm font-semibold transition ${
                                shelterTouched.longitude && shelterFieldErrors.longitude
                                  ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                                  : 'border-slate-200 focus:border-[#237737]'
                              }`}
                            />
                            {shelterTouched.longitude && shelterFieldErrors.longitude && (
                              <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                                <AlertCircle className="w-3 h-3 shrink-0" /> {shelterFieldErrors.longitude}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 font-semibold">
                          Click "Use My Location" to auto-detect coordinates, or enter them manually from Google Maps.
                        </p>
                      </div>

                      {/* Section 3: Capacity */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm">
                        <h3 className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-[#237737]" /> Shelter Capacity
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {/* Total Staff */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600">Total Staff (Positive number) <span className="text-rose-500">*</span></label>
                            <input
                              type="number"
                              min="1"
                              value={sTotalStaffs}
                              onChange={(e) => handleShelterFieldChange('totalStaffs', e.target.value, setSTotalStaffs)}
                              onBlur={(e) => handleShelterFieldBlur('totalStaffs', e.target.value)}
                              placeholder="e.g. 12"
                              required
                              className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl focus:outline-none text-sm font-semibold transition ${
                                shelterTouched.totalStaffs && shelterFieldErrors.totalStaffs
                                  ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                                  : 'border-slate-200 focus:border-[#237737]'
                              }`}
                            />
                            {shelterTouched.totalStaffs && shelterFieldErrors.totalStaffs && (
                              <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                                <AlertCircle className="w-3 h-3 shrink-0" /> {shelterFieldErrors.totalStaffs}
                              </p>
                            )}
                          </div>

                          {/* Total Cages */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600">Total Cages (Positive number) <span className="text-rose-500">*</span></label>
                            <input
                              type="number"
                              min="1"
                              value={sTotalCages}
                              onChange={(e) => handleShelterFieldChange('totalCages', e.target.value, setSTotalCages)}
                              onBlur={(e) => handleShelterFieldBlur('totalCages', e.target.value)}
                              placeholder="e.g. 50"
                              required
                              className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl focus:outline-none text-sm font-semibold transition ${
                                shelterTouched.totalCages && shelterFieldErrors.totalCages
                                  ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                                  : 'border-slate-200 focus:border-[#237737]'
                              }`}
                            />
                            {shelterTouched.totalCages && shelterFieldErrors.totalCages && (
                              <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                                <AlertCircle className="w-3 h-3 shrink-0" /> {shelterFieldErrors.totalCages}
                              </p>
                            )}
                          </div>

                          {/* Occupied Cages */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600">Occupied Cages (≤ Total Cages) <span className="text-rose-500">*</span></label>
                            <input
                              type="number"
                              min="0"
                              value={sOccupiedCages}
                              onChange={(e) => handleShelterFieldChange('occupiedCages', e.target.value, setSOccupiedCages)}
                              onBlur={(e) => handleShelterFieldBlur('occupiedCages', e.target.value)}
                              placeholder="e.g. 28"
                              required
                              className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl focus:outline-none text-sm font-semibold transition ${
                                shelterTouched.occupiedCages && shelterFieldErrors.occupiedCages
                                  ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                                  : 'border-slate-200 focus:border-[#237737]'
                              }`}
                            />
                            {shelterTouched.occupiedCages && shelterFieldErrors.occupiedCages && (
                              <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                                <AlertCircle className="w-3 h-3 shrink-0" /> {shelterFieldErrors.occupiedCages}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Proceed to Step 2 */}
                      <button
                        type="submit"
                        disabled={shelterSubmitting}
                        className="w-full py-3.5 bg-[#237737] hover:bg-[#1d632e] disabled:opacity-60 text-white text-sm font-bold rounded-2xl transition cursor-pointer shadow-md shadow-[#237737]/15 flex items-center justify-center gap-2"
                      >
                        {shelterSubmitting ? (
                          <><Clock className="w-4 h-4 animate-spin" /> Dispatching Verification Codes…</>
                        ) : (
                          <><ShieldCheck className="w-4 h-4" /> Proceed to Contact Verification <ArrowRight className="w-4 h-4" /></>
                        )}
                      </button>
                    </form>
                  )}

                  {/* STEP 2: DUAL EMAIL & PHONE OTP VERIFICATION */}
                  {shelterStep === 2 && (
                    <div className="space-y-6 animate-fade-in">
                      {/* Step Indicator Header */}
                      <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-[#237737] text-white flex items-center justify-center text-xs font-black">2</span>
                          <div>
                            <p className="text-xs font-black text-slate-800">Step 2: Verify Contact Details</p>
                            <p className="text-[11px] text-slate-400 font-semibold">Enter the 6-digit codes sent to your Email & Phone</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                            shelterEmailVerified && shelterPhoneVerified
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {shelterEmailVerified && shelterPhoneVerified
                              ? 'Both Verified ✓'
                              : `${(shelterEmailVerified ? 1 : 0) + (shelterPhoneVerified ? 1 : 0)} of 2 Verified`}
                          </span>
                        </div>
                      </div>

                      {/* Verification Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* 1. Email OTP Verification Card */}
                        <div className={`bg-white border rounded-2xl p-5 space-y-4 shadow-sm transition ${
                          shelterEmailVerified ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-100'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className={`p-2 rounded-xl ${shelterEmailVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-[#237737]/10 text-[#237737]'}`}>
                                <Mail className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-slate-800">Shelter Email Verification</h4>
                                <p className="text-[11px] text-slate-400 font-semibold break-all">{sShelterEmail}</p>
                              </div>
                            </div>
                            {shelterEmailVerified ? (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3.5 h-3.5" /> Verified
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3 inline mr-1" /> Pending
                              </span>
                            )}
                          </div>

                          {!shelterEmailVerified ? (
                            <form onSubmit={handleVerifyShelterEmail} className="space-y-3 pt-1">
                              <div>
                                <label className="text-[11px] font-bold text-slate-500">Enter 6-Digit Email Code</label>
                                <input
                                  type="text"
                                  maxLength={6}
                                  value={shelterEmailOtp}
                                  onChange={(e) => setShelterEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                  placeholder="• • • • • •"
                                  className="w-full mt-1 px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#237737] text-center text-lg font-black tracking-widest transition"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="submit"
                                  disabled={shelterEmailVerifying || shelterEmailOtp.length !== 6}
                                  className="flex-1 py-2.5 bg-[#237737] hover:bg-[#1d632e] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  {shelterEmailVerifying ? (
                                    <><Clock className="w-3.5 h-3.5 animate-spin" /> Verifying…</>
                                  ) : (
                                    <><CheckCircle className="w-3.5 h-3.5" /> Verify Email</>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleResendShelterEmailOtp}
                                  disabled={shelterOtpTimer > 0 || shelterEmailSending}
                                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                                >
                                  <RefreshCw className={`w-3.5 h-3.5 ${shelterEmailSending ? 'animate-spin' : ''}`} />
                                  {shelterOtpTimer > 0 ? `${shelterOtpTimer}s` : 'Resend'}
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-xs font-bold">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              Email address verified successfully.
                            </div>
                          )}
                        </div>

                        {/* 2. Phone OTP Verification Card */}
                        <div className={`bg-white border rounded-2xl p-5 space-y-4 shadow-sm transition ${
                          shelterPhoneVerified ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-100'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className={`p-2 rounded-xl ${shelterPhoneVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-[#237737]/10 text-[#237737]'}`}>
                                <Smartphone className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-slate-800">Shelter Phone Verification</h4>
                                <p className="text-[11px] text-slate-400 font-semibold">+91 {sShelterPhone}</p>
                              </div>
                            </div>
                            {shelterPhoneVerified ? (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3.5 h-3.5" /> Verified
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                <Clock className="w-3 h-3 inline mr-1" /> Pending
                              </span>
                            )}
                          </div>

                          {!shelterPhoneVerified ? (
                            <form onSubmit={handleVerifyShelterPhone} className="space-y-3 pt-1">
                              <div>
                                <label className="text-[11px] font-bold text-slate-500">Enter 6-Digit SMS Code</label>
                                <input
                                  type="text"
                                  maxLength={6}
                                  value={shelterPhoneOtp}
                                  onChange={(e) => setShelterPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                  placeholder="• • • • • •"
                                  className="w-full mt-1 px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl focus:outline-none focus:border-[#237737] text-center text-lg font-black tracking-widest transition"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="submit"
                                  disabled={shelterPhoneVerifying || shelterPhoneOtp.length !== 6}
                                  className="flex-1 py-2.5 bg-[#237737] hover:bg-[#1d632e] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  {shelterPhoneVerifying ? (
                                    <><Clock className="w-3.5 h-3.5 animate-spin" /> Verifying…</>
                                  ) : (
                                    <><CheckCircle className="w-3.5 h-3.5" /> Verify Phone</>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleResendShelterPhoneOtp}
                                  disabled={shelterOtpTimer > 0 || shelterPhoneSending}
                                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                                >
                                  <RefreshCw className={`w-3.5 h-3.5 ${shelterPhoneSending ? 'animate-spin' : ''}`} />
                                  {shelterOtpTimer > 0 ? `${shelterOtpTimer}s` : 'Resend'}
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-xs font-bold">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              Phone number verified successfully.
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Step 2 Bottom Controls */}
                      <div className="flex items-center justify-between gap-4 pt-2">
                        <button
                          type="button"
                          onClick={() => setShelterStep(1)}
                          className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl transition cursor-pointer flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4" /> Edit Shelter Details
                        </button>

                        <button
                          type="button"
                          onClick={handleFinalShelterSubmit}
                          disabled={!shelterEmailVerified || !shelterPhoneVerified || shelterSubmitting}
                          className="flex-1 py-3.5 bg-[#237737] hover:bg-[#1d632e] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-2xl transition cursor-pointer shadow-md shadow-[#237737]/15 flex items-center justify-center gap-2"
                        >
                          {shelterSubmitting ? (
                            <><Clock className="w-4 h-4 animate-spin" /> Submitting Final Application…</>
                          ) : (
                            <><Building2 className="w-4 h-4" /> Submit Verified Registration Application</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ======================================================== */}
              {/* VIEW 2: SUBMITTED APPLICATIONS HISTORY                   */}
              {/* ======================================================== */}
              {shelterViewTab === 'history' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800">Your Submitted Applications</h3>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        Track previous registrations, review decisions, and facility credentials
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShelterViewTab('form')}
                      className="px-4 py-2 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Submit New Application
                    </button>
                  </div>

                  {shelterApplicationsList.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-3">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
                        <ClipboardList className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-extrabold text-slate-800">No Applications Submitted Yet</h4>
                      <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
                        Ready to partner with ResQNet? Submit your first shelter registration application today.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShelterViewTab('form')}
                        className="mt-2 px-5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Fill Registration Form Now
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {shelterApplicationsList.map((app) => (
                        <div
                          key={app._id}
                          className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 hover:shadow-md transition"
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-[#237737]/10 text-[#237737] rounded-xl">
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{app.shelterName}</h4>
                                  <span className="text-[10px] text-slate-400 font-bold">#{app.shelterApplicationId}</span>
                                  {app.shelter?.shelterNumber && (
                                    <span className="px-2 py-0.5 bg-[#237737]/10 border border-[#237737]/30 text-[#237737] text-[10px] font-black rounded-lg">
                                      {app.shelter.shelterNumber}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                                  {app.registrationType?.replace(/_/g, ' ')} • Reg: <span className="font-bold text-slate-700">{app.registrationNumber}</span>
                                </p>
                              </div>
                            </div>

                            <span className={`px-3 py-1 text-[10px] font-black rounded-full border shrink-0 ${
                              app.status === 'Approved'
                                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
                                : app.status === 'Rejected'
                                ? 'bg-rose-500/10 text-rose-700 border-rose-200'
                                : 'bg-amber-500/10 text-amber-700 border-amber-200'
                            }`}>
                              {app.status}
                            </span>
                          </div>

                          {/* Info Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="p-3 bg-[#F8FAF9] rounded-xl">
                              <div className="text-slate-400 font-bold mb-0.5">Shelter Email</div>
                              <div className="text-slate-800 font-extrabold break-all">{app.shelterEmail}</div>
                              <div className="text-emerald-600 font-bold text-[10px] mt-0.5">✓ Verified</div>
                            </div>
                            <div className="p-3 bg-[#F8FAF9] rounded-xl">
                              <div className="text-slate-400 font-bold mb-0.5">Contact Phone</div>
                              <div className="text-slate-800 font-extrabold">+91 {app.shelterPhoneNumber}</div>
                              <div className="text-emerald-600 font-bold text-[10px] mt-0.5">✓ Verified</div>
                            </div>
                            <div className="p-3 bg-[#F8FAF9] rounded-xl">
                              <div className="text-slate-400 font-bold mb-0.5">Capacity</div>
                              <div className="text-slate-800 font-extrabold">{app.occupiedCages}/{app.totalCages} Cages</div>
                              <div className="text-slate-500 font-semibold text-[10px] mt-0.5">{app.totalStaffs} Staff Members</div>
                            </div>
                            <div className="p-3 bg-[#F8FAF9] rounded-xl">
                              <div className="text-slate-400 font-bold mb-0.5">Location</div>
                              <div className="text-slate-800 font-extrabold">{app.latitude?.toFixed(4)}, {app.longitude?.toFixed(4)}</div>
                              <div className="text-slate-500 font-semibold text-[10px] mt-0.5">GPS Coordinates</div>
                            </div>
                          </div>

                          {/* Footer Info */}
                          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div className="text-slate-600 font-semibold">
                              {app.status === 'Approved' && (
                                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  Approved by Admin. Temporary password was emailed to {app.shelterEmail}.
                                </span>
                              )}
                              {app.status === 'Pending' && (
                                <span className="text-amber-700 font-bold flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  Under administrative review. You will receive an email once approved.
                                </span>
                              )}
                              {app.status === 'Rejected' && (
                                <span className="text-rose-600 font-bold flex items-center gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                  Rejected{app.reviewNote ? `: ${app.reviewNote}` : ''}
                                </span>
                              )}
                            </div>

                            <div className="text-[10px] text-slate-400 font-bold">
                              Submitted {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* Placeholders for Other Tabs */}
          {activeTab !== 'Dashboard' && activeTab !== 'Report Animal' && activeTab !== 'Adopt a Pet' && activeTab !== 'Register Shelter' && activeTab !== 'Notifications' && activeTab !== 'My Profile' && (
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
