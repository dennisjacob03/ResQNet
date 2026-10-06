import React, { useState, useEffect } from 'react';
import {
  Building2,
  ClipboardList,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Navigation,
  Shield,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Mail,
  Smartphone,
  RefreshCw,
  Eye,
  Lock,
  Calendar,
  FileText,
  X,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  submitShelterApplication,
  getMyApplication,
} from '../../services/shelterApplicationService';
import {
  validateShelterField,
  validateFullShelterForm,
  SHELTER_REGISTRATION_RULES,
} from '../shelter/shelterValidation';
import { checkProfileCompletion } from '../../utils/profileUtils';
import { ProfileRequiredCard } from '../../components/common/ProfileRequiredCard';
import { checkEmailApi } from '../../services/authService';
import AddressForm from '../../components/address/AddressForm';

const ShelterRegister = ({ onApplicationSubmitted, onRequireProfile, onNavigateToProfile }) => {
  const {
    user,
    setupRecaptcha,
    sendPhoneOtp,
    verifyPhoneOtp,
    sendOtp,
    verifyOtp,
  } = useAuth();

  const profileStatus = checkProfileCompletion(user);

  // Application data & loading states
  const [shelterApp, setShelterApp] = useState(null);
  const [shelterAppLoading, setShelterAppLoading] = useState(false);
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

  // Form input fields
  const [sRegistrationType, setSRegistrationType] = useState('STATE_TRUST_SOCIETY');
  const [sRegistrationNumber, setSRegistrationNumber] = useState('');
  const [sShelterName, setSShelterName] = useState('');
  const [sShelterEmail, setSShelterEmail] = useState('');
  const [sShelterPhone, setSShelterPhone] = useState('');
  const [sAddress, setSAddress] = useState('');
  const [sPincode, setSPincode] = useState('');
  const [sState, setSState] = useState('');
  const [sDistrict, setSDistrict] = useState('');
  const [sCity, setSCity] = useState('');
  const [sLatitude, setSLatitude] = useState('');
  const [sLongitude, setSLongitude] = useState('');
  const [sTotalStaffs, setSTotalStaffs] = useState('');
  const [sTotalCages, setSTotalCages] = useState('');
  const [sOccupiedCages, setSOccupiedCages] = useState('');
  const [sLocating, setSLocating] = useState(false);

  // Sub-tabs ('form' | 'history') and modal states
  const [shelterViewTab, setShelterViewTab] = useState('form');
  const [shelterApplicationsList, setShelterApplicationsList] = useState([]);
  const [selectedUserAppForModal, setSelectedUserAppForModal] = useState(null);
  const [showUserAppDetailsModal, setShowUserAppDetailsModal] = useState(false);

  const loadApplications = async () => {
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
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

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

  // Live single-field validator
  const validateSingleShelterField = (field, value, overrides = {}) => {
    const fullForm = {
      shelterName: sShelterName,
      registrationType: sRegistrationType,
      registrationNumber: sRegistrationNumber,
      shelterEmail: sShelterEmail,
      shelterPhoneNumber: sShelterPhone,
      address: sAddress,
      pincode: sPincode,
      state: sState,
      district: sDistrict,
      city: sCity,
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

  const handleShelterAddressChange = (updated) => {
    const newAddress = updated.address !== undefined ? updated.address : sAddress;
    const newPincode = updated.pincode !== undefined ? updated.pincode : sPincode;
    const newState = updated.state !== undefined ? updated.state : sState;
    const newDistrict = updated.district !== undefined ? updated.district : sDistrict;
    const newCity = updated.city !== undefined ? updated.city : sCity;

    setSAddress(newAddress);
    setSPincode(newPincode);
    setSState(newState);
    setSDistrict(newDistrict);
    setSCity(newCity);

    const currentForm = {
      shelterName: sShelterName,
      registrationType: sRegistrationType,
      registrationNumber: sRegistrationNumber,
      shelterEmail: sShelterEmail,
      shelterPhoneNumber: sShelterPhone,
      address: newAddress,
      pincode: newPincode,
      state: newState,
      district: newDistrict,
      city: newCity,
      latitude: sLatitude,
      longitude: sLongitude,
      totalStaffs: sTotalStaffs,
      totalCages: sTotalCages,
      occupiedCages: sOccupiedCages,
    };

    // If fields were touched, validate them against updated data
    ['address', 'pincode', 'state', 'district', 'city'].forEach((k) => {
      if (shelterTouched[k]) {
        const res = validateShelterField(k, currentForm[k], currentForm);
        setShelterFieldErrors((prev) => ({
          ...prev,
          [k]: res.valid ? '' : res.error,
        }));
      }
    });
  };

  const handleShelterAddressBlur = (field) => {
    setShelterTouched((prev) => ({ ...prev, [field]: true }));
    const currentForm = {
      shelterName: sShelterName,
      registrationType: sRegistrationType,
      registrationNumber: sRegistrationNumber,
      shelterEmail: sShelterEmail,
      shelterPhoneNumber: sShelterPhone,
      address: sAddress,
      pincode: sPincode,
      state: sState,
      district: sDistrict,
      city: sCity,
      latitude: sLatitude,
      longitude: sLongitude,
      totalStaffs: sTotalStaffs,
      totalCages: sTotalCages,
      occupiedCages: sOccupiedCages,
    };
    const res = validateShelterField(field, currentForm[field], currentForm);
    setShelterFieldErrors((prev) => ({
      ...prev,
      [field]: res.valid ? '' : res.error,
    }));
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

    if (!profileStatus.isComplete) {
      if (onRequireProfile) {
        onRequireProfile('Register Shelter');
      }
      return;
    }

    const fullForm = {
      shelterName: sShelterName,
      registrationType: sRegistrationType,
      registrationNumber: sRegistrationNumber.trim().toUpperCase(),
      shelterEmail: sShelterEmail,
      shelterPhoneNumber: sShelterPhone,
      address: sAddress.trim(),
      pincode: sPincode.trim(),
      state: sState.trim(),
      district: sDistrict.trim(),
      city: sCity.trim(),
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
        address: true,
        pincode: true,
        state: true,
        district: true,
        city: true,
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
      // 1. Verify if an account with this shelter email already exists
      try {
        const checkRes = await checkEmailApi(sShelterEmail.trim());
        if (checkRes.exists) {
          setShelterError(checkRes.message || 'An account with this email address already exists. Please choose a different shelter email.');
          setShelterFieldErrors((prev) => ({
            ...prev,
            shelterEmail: checkRes.message || 'An account with this email address already exists',
          }));
          setShelterSubmitting(false);
          return;
        }
      } catch (checkErr) {
        // Fallback to sendOtp check if checkEmailApi encounters network error
      }

      // 2. Dispatch Email OTP (backend also checks for existing account/shelter)
      const emailRes = await sendOtp(sShelterEmail.trim(), 'shelter_email_verification', sShelterName.trim());
      if (!emailRes.success) {
        setShelterError(emailRes.message || 'Failed to dispatch verification code. Please verify your shelter email.');
        setShelterSubmitting(false);
        return;
      }

      // 3. Dispatch Phone OTP via Firebase
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
    if (!profileStatus.isComplete) {
      if (onRequireProfile) {
        onRequireProfile('Register Shelter');
      }
      return;
    }

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
        address: sAddress.trim(),
        pincode: sPincode.trim(),
        state: sState.trim(),
        district: sDistrict.trim(),
        city: sCity.trim(),
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
        if (onApplicationSubmitted) {
          onApplicationSubmitted(res.application);
        }
        // Reset form inputs
        setSShelterName('');
        setSRegistrationType('STATE_TRUST_SOCIETY');
        setSRegistrationNumber('');
        setSShelterEmail('');
        setSShelterPhone('');
        setSAddress('');
        setSPincode('');
        setSState('');
        setSDistrict('');
        setSCity('');
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

  return (
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
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  shelterViewTab === 'history' ? 'bg-[#237737]/10 text-[#237737]' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {shelterApplicationsList.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Loading indicator */}
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
          {/* Mandatory Profile Incomplete Warning Card */}
          {!profileStatus.isComplete && (
            <ProfileRequiredCard
              user={user}
              onNavigateToProfile={onNavigateToProfile}
              actionName="register an animal shelter"
            />
          )}

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
                  <span className="w-7 h-7 rounded-full bg-[#237737] text-white flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  <div>
                    <p className="text-xs font-black text-slate-800">Step 1: Shelter Registration Details</p>
                    <p className="text-[11px] text-slate-400 font-semibold">
                      Fill organization details, location, and capacity
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-black text-[#237737] bg-[#237737]/10 px-3 py-1 rounded-full">
                  Step 1 of 2
                </span>
              </div>

              {/* Profile sync information banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900">
                <span className="flex items-center gap-2 font-semibold">
                  <Lock className="w-4 h-4 text-[#237737] shrink-0" />
                  Applicant contact details (Email, Phone) are linked to your profile and can only be updated from your Profile page.
                </span>
                {onNavigateToProfile && (
                  <button
                    type="button"
                    onClick={onNavigateToProfile}
                    className="px-3 py-1 bg-white border border-emerald-300 text-[#237737] hover:bg-emerald-50 rounded-lg font-bold text-xs transition cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
                  >
                    Edit in Profile &rarr;
                  </button>
                )}
              </div>

              {/* Section 1: Shelter Identity */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#237737]" /> Shelter Identity & Contacts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Shelter Manager & Applicant Info Banner */}
                  <div className="sm:col-span-2 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#237737]/15 flex items-center justify-center text-[#237737] font-extrabold text-sm">
                        {user?.fullName?.charAt(0) || 'M'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">Designated Shelter Manager</span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">You (From Profile)</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800">{user?.fullName || 'Current User'}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 hidden sm:inline-block font-medium">
                      You will be assigned as the Shelter Manager
                    </span>
                  </div>

                  {/* Shelter Name */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-600">
                        Shelter Name <span className="text-rose-500">*</span>
                      </label>
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
                    <label className="text-xs font-bold text-slate-600">
                      Registration Authority / Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={sRegistrationType}
                      onChange={(e) => {
                        const newType = e.target.value;
                        setSRegistrationType(newType);
                        validateSingleShelterField('registrationType', newType);
                        validateSingleShelterField('registrationNumber', sRegistrationNumber, {
                          registrationType: newType,
                        });
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
                      <label className="text-xs font-bold text-slate-600">
                        Registration Number <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {SHELTER_REGISTRATION_RULES[sRegistrationType]?.hint}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={sRegistrationNumber}
                      onChange={(e) =>
                        handleShelterFieldChange('registrationNumber', e.target.value.toUpperCase(), setSRegistrationNumber)
                      }
                      onBlur={(e) => handleShelterFieldBlur('registrationNumber', e.target.value.toUpperCase())}
                      placeholder={`e.g. ${
                        SHELTER_REGISTRATION_RULES[sRegistrationType]?.example || 'REG/KL/2024/001234'
                      }`}
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
                    {shelterTouched.registrationNumber &&
                      !shelterFieldErrors.registrationNumber &&
                      sRegistrationNumber && (
                        <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1 animate-fade-in">
                          <CheckCircle className="w-3 h-3 shrink-0" /> Valid registration number format ✓
                        </p>
                      )}
                  </div>

                  {/* Shelter Email */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-600">
                        Shelter Official Email <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-semibold">Shelter's email</span>
                    </div>
                    <input
                      type="email"
                      value={sShelterEmail}
                      onChange={(e) => handleShelterFieldChange('shelterEmail', e.target.value, setSShelterEmail)}
                      onBlur={async (e) => {
                        const val = e.target.value.trim();
                        handleShelterFieldBlur('shelterEmail', val);
                        if (val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                          try {
                            const res = await checkEmailApi(val);
                            if (res.exists) {
                              setShelterFieldErrors((prev) => ({
                                ...prev,
                                shelterEmail: res.message || 'An account with this email address already exists',
                              }));
                            }
                          } catch (err) {
                            // ignore soft check error
                          }
                        }
                      }}
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
                      <label className="text-xs font-bold text-slate-600">
                        Shelter Contact Number <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-semibold">Shelter official phone</span>
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

              {/* Section 2: Shelter Physical Address & Location */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-6 shadow-sm">
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#237737]" /> Shelter Physical Address & PIN Code
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold">
                    Enter the facility's physical address. Entering a valid 6-digit PIN code will automatically detect the State, District, and City.
                  </p>
                </div>

                {/* Reusable Indian Address Component */}
                <AddressForm
                  value={{
                    address: sAddress,
                    pincode: sPincode,
                    state: sState,
                    district: sDistrict,
                    city: sCity,
                  }}
                  onChange={handleShelterAddressChange}
                  onBlur={handleShelterAddressBlur}
                  errors={shelterFieldErrors}
                  touched={shelterTouched}
                  disabled={shelterSubmitting}
                  showAddressLine={true}
                />

                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-[#237737]" /> GPS Coordinates
                    </h4>
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
                      <label className="text-xs font-bold text-slate-600">
                        Latitude (-90 to +90) <span className="text-rose-500">*</span>
                      </label>
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
                      <label className="text-xs font-bold text-slate-600">
                        Longitude (-180 to +180) <span className="text-rose-500">*</span>
                      </label>
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
              </div>

              {/* Section 3: Capacity */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#237737]" /> Shelter Capacity
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Total Staff */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">
                      Total Staff (Positive number) <span className="text-rose-500">*</span>
                    </label>
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
                    <label className="text-xs font-bold text-slate-600">
                      Total Cages (Positive number) <span className="text-rose-500">*</span>
                    </label>
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
                    <label className="text-xs font-bold text-slate-600">
                      Occupied Cages (≤ Total Cages) <span className="text-rose-500">*</span>
                    </label>
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
                type={profileStatus.isComplete ? 'submit' : 'button'}
                onClick={(e) => {
                  if (!profileStatus.isComplete) {
                    e.preventDefault();
                    if (onRequireProfile) {
                      onRequireProfile('Register Shelter');
                    }
                  }
                }}
                disabled={shelterSubmitting}
                className={`w-full py-3.5 text-white text-sm font-bold rounded-2xl transition cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                  profileStatus.isComplete
                    ? 'bg-[#237737] hover:bg-[#1d632e] disabled:opacity-60 shadow-[#237737]/15'
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                }`}
              >
                {!profileStatus.isComplete ? (
                  <>
                    <AlertTriangle className="w-4 h-4" /> Complete Profile to Register Shelter →
                  </>
                ) : shelterSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" /> Dispatching Verification Codes…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Proceed to Contact Verification <ArrowRight className="w-4 h-4" />
                  </>
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
                  <span className="w-7 h-7 rounded-full bg-[#237737] text-white flex items-center justify-center text-xs font-black">
                    2
                  </span>
                  <div>
                    <p className="text-xs font-black text-slate-800">Step 2: Verify Contact Details</p>
                    <p className="text-[11px] text-slate-400 font-semibold">
                      Enter the 6-digit codes sent to your Email & Phone
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                      shelterEmailVerified && shelterPhoneVerified
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {shelterEmailVerified && shelterPhoneVerified
                      ? 'Both Verified ✓'
                      : `${(shelterEmailVerified ? 1 : 0) + (shelterPhoneVerified ? 1 : 0)} of 2 Verified`}
                  </span>
                </div>
              </div>

              {/* Verification Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Email OTP Verification Card */}
                <div
                  className={`bg-white border rounded-2xl p-5 space-y-4 shadow-sm transition ${
                    shelterEmailVerified ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2 rounded-xl ${
                          shelterEmailVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-[#237737]/10 text-[#237737]'
                        }`}
                      >
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
                            <>
                              <Clock className="w-3.5 h-3.5 animate-spin" /> Verifying…
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" /> Verify Email
                            </>
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
                <div
                  className={`bg-white border rounded-2xl p-5 space-y-4 shadow-sm transition ${
                    shelterPhoneVerified ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2 rounded-xl ${
                          shelterPhoneVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-[#237737]/10 text-[#237737]'
                        }`}
                      >
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
                            <>
                              <Clock className="w-3.5 h-3.5 animate-spin" /> Verifying…
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" /> Verify Phone
                            </>
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
                  onClick={(e) => {
                    if (!profileStatus.isComplete) {
                      e.preventDefault();
                      if (onRequireProfile) {
                        onRequireProfile('Register Shelter');
                      }
                      return;
                    }
                    handleFinalShelterSubmit();
                  }}
                  disabled={!shelterEmailVerified || !shelterPhoneVerified || shelterSubmitting}
                  className={`flex-1 py-3.5 text-white text-sm font-bold rounded-2xl transition cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                    profileStatus.isComplete
                      ? 'bg-[#237737] hover:bg-[#1d632e] disabled:opacity-40 disabled:cursor-not-allowed shadow-[#237737]/15'
                      : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                  }`}
                >
                  {!profileStatus.isComplete ? (
                    <>
                      <AlertTriangle className="w-4 h-4" /> Complete Profile to Submit Application
                    </>
                  ) : shelterSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" /> Submitting Final Application…
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4" /> Submit Verified Registration Application
                    </>
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
            <div className="space-y-5">
              {shelterApplicationsList.map((app) => (
                <div
                  key={app._id}
                  className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 hover:shadow-md transition"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#237737]/10 text-[#237737] font-black flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 text-base">{app.shelterName}</h4>
                          <span className="text-xs text-slate-400 font-bold bg-slate-100 px-2.5 py-0.5 rounded-lg">
                            #{app.shelterApplicationId}
                          </span>
                          {app.shelter?.shelterNumber && (
                            <span className="px-2.5 py-0.5 bg-[#237737]/10 border border-[#237737]/30 text-[#237737] text-xs font-black rounded-lg">
                              {app.shelter.shelterNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          {app.registrationType?.replace(/_/g, ' ')} • Reg Number:{' '}
                          <span className="font-bold text-slate-800">{app.registrationNumber || 'N/A'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start">
                      <span
                        className={`px-3 py-1 text-xs font-black rounded-full border shrink-0 ${
                          (app.applicationStatus || app.status) === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                            : (app.applicationStatus || app.status) === 'Rejected'
                            ? 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                            : (app.applicationStatus || app.status) === 'Site Visit'
                            ? 'bg-blue-500/10 text-blue-700 border-blue-200/50'
                            : 'bg-amber-500/10 text-amber-700 border-amber-200/50'
                        }`}
                      >
                        {(app.applicationStatus || app.status) === 'Site Visit'
                          ? '📅 Site Visit & Valuation'
                          : app.applicationStatus || app.status}
                      </span>

                    </div>
                  </div>

                  {/* 3-Step Audit Timeline Progress Bar */}
                  <div className="bg-[#F8FAF9] p-4 rounded-2xl border border-slate-100">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Application & Site Audit Pipeline
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* Step 1 */}
                      <div className="p-3 bg-white rounded-xl border border-emerald-200/70 shadow-xs flex items-start gap-2.5">
                        <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900">1. Application Filed</div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {new Date(app.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div
                        className={`p-3 bg-white rounded-xl border shadow-xs flex items-start gap-2.5 ${
                          (app.applicationStatus || app.status) === 'Site Visit'
                            ? 'border-blue-300 ring-2 ring-blue-100 bg-blue-50/30'
                            : (app.applicationStatus || app.status) === 'Approved' ||
                              (app.applicationStatus || app.status) === 'Rejected'
                            ? 'border-emerald-200/70'
                            : 'border-slate-200 opacity-60'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                            (app.applicationStatus || app.status) === 'Site Visit'
                              ? 'bg-blue-100 text-blue-700 animate-pulse'
                              : (app.applicationStatus || app.status) === 'Approved' ||
                                (app.applicationStatus || app.status) === 'Rejected'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900">2. Physical Site Visit</div>
                          <div className="text-[10px] text-blue-700 font-bold mt-0.5">
                            {app.siteVisitScheduleDate
                              ? `Scheduled: ${new Date(app.siteVisitScheduleDate).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                })}`
                              : (app.applicationStatus || app.status) === 'Pending'
                              ? 'Awaiting admin schedule'
                              : 'Inspection completed'}
                          </div>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div
                        className={`p-3 bg-white rounded-xl border shadow-xs flex items-start gap-2.5 ${
                          (app.applicationStatus || app.status) === 'Approved'
                            ? 'border-emerald-300 ring-2 ring-emerald-100 bg-emerald-50/30'
                            : (app.applicationStatus || app.status) === 'Rejected'
                            ? 'border-rose-300 bg-rose-50/30'
                            : 'border-slate-200 opacity-60'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                            (app.applicationStatus || app.status) === 'Approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : (app.applicationStatus || app.status) === 'Rejected'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {(app.applicationStatus || app.status) === 'Approved' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (app.applicationStatus || app.status) === 'Rejected' ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900">3. Decision & Credentials</div>
                          <div
                            className={`text-[10px] font-bold mt-0.5 ${
                              (app.applicationStatus || app.status) === 'Approved'
                                ? 'text-emerald-700'
                                : (app.applicationStatus || app.status) === 'Rejected'
                                ? 'text-rose-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {(app.applicationStatus || app.status) === 'Approved'
                              ? `Approved (${app.shelter?.shelterNumber || 'Active'})`
                              : (app.applicationStatus || app.status) === 'Rejected'
                              ? 'Declined'
                              : 'Pending evaluation report'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Site Visit Valuation Banner for user */}
                  {app.status === 'Site Visit' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="font-black text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                          Physical Site Visit Scheduled:{' '}
                          {app.siteVisitScheduleDate
                            ? new Date(app.siteVisitScheduleDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })
                            : 'Upcoming date'}
                        </div>
                        {app.siteVisitValuationPeriod && (
                          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-lg border border-blue-200">
                            Slot: {app.siteVisitValuationPeriod}
                          </span>
                        )}
                      </div>
                      <p className="text-blue-800 text-xs leading-relaxed">
                        {app.siteVisitNotes ||
                          'Admin field auditors will visit the premises to physically inspect cages, ventilation, hygiene, water access, and verify registration documents.'}
                      </p>
                      {app.siteVisitInspector && (
                        <div className="text-[11px] text-blue-700 font-semibold pt-1 border-t border-blue-200/60">
                          Assigned Inspector: <span className="font-bold text-blue-900">{app.siteVisitInspector}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Site Visit Report Banner if Approved or Rejected with report */}
                  {app.siteVisitReport && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5">
                      <div className="font-bold text-slate-700 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        Official Site Inspection & Valuation Report
                      </div>
                      <p className="text-slate-800 font-medium italic bg-white p-3 rounded-xl border border-slate-100 leading-relaxed">
                        "{app.siteVisitReport}"
                      </p>
                      {app.siteVisitReportDate && (
                        <div className="text-[10px] text-slate-400 font-semibold">
                          Report Filed:{' '}
                          {new Date(app.siteVisitReportDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      )}
                    </div>
                  )}

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
                      <div className="text-slate-800 font-extrabold">
                        {app.occupiedCages}/{app.totalCages} Cages
                      </div>
                      <div className="text-slate-500 font-semibold text-[10px] mt-0.5">
                        {app.totalStaffs} Staff Members
                      </div>
                    </div>
                    <div className="p-3 bg-[#F8FAF9] rounded-xl">
                      <div className="text-slate-400 font-bold mb-0.5">Location</div>
                      <div className="text-slate-800 font-extrabold">
                        {app.latitude?.toFixed(4)}, {app.longitude?.toFixed(4)}
                      </div>
                      <div className="text-slate-500 font-semibold text-[10px] mt-0.5">GPS Coordinates</div>
                    </div>
                  </div>

                  {/* Shelter Physical Address Display */}
                  {(app.address || app.city || app.district || app.state || app.pincode) && (
                    <div className="p-3 bg-[#F8FAF9] rounded-xl flex items-start gap-2.5 text-xs">
                      <MapPin className="w-4 h-4 text-[#237737] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-slate-400 font-bold text-[10px] uppercase">Shelter Physical Address</div>
                        <div className="text-slate-800 font-semibold mt-0.5">
                          {[app.address, app.city, app.district, app.state, app.pincode ? `PIN: ${app.pincode}` : ''].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer Info */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="text-slate-600 font-semibold">
                      {app.status === 'Approved' && (
                        <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          Registration Approved! Temporary login password has been sent to {app.shelterEmail}.
                        </span>
                      )}
                      {app.status === 'Site Visit' && (
                        <span className="text-blue-700 font-bold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          Site visit scheduled. Please prepare facilities and registers for audit.
                        </span>
                      )}
                      {app.status === 'Pending' && (
                        <span className="text-amber-700 font-bold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          Application submitted. Admin will schedule a site visit and valuation period date.
                        </span>
                      )}
                      {app.status === 'Rejected' && (
                        <span className="text-rose-600 font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          Application Rejected{app.reviewNote ? `: ${app.reviewNote}` : ''}
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-400 font-bold">
                      Submitted{' '}
                      {new Date(app.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User Shelter Application Details & Site Visit Audit Modal */}
      {showUserAppDetailsModal && selectedUserAppForModal && (
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
                    <h3 className="text-lg font-black text-slate-900">{selectedUserAppForModal.shelterName}</h3>
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-black rounded-lg">
                      #{selectedUserAppForModal.shelterApplicationId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    {selectedUserAppForModal.registrationType?.replace(/_/g, ' ')} • Reg:{' '}
                    {selectedUserAppForModal.registrationNumber || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUserAppDetailsModal(false);
                  setSelectedUserAppForModal(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                  selectedUserAppForModal.status === 'Approved'
                    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                    : selectedUserAppForModal.status === 'Rejected'
                    ? 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                    : selectedUserAppForModal.status === 'Site Visit'
                    ? 'bg-blue-500/10 text-blue-700 border-blue-200/50'
                    : 'bg-amber-500/10 text-amber-700 border-amber-200/50'
                }`}
              >
                Status:{' '}
                {selectedUserAppForModal.status === 'Site Visit'
                  ? 'Site Visit & Valuation in Progress'
                  : selectedUserAppForModal.status}
              </span>

              {selectedUserAppForModal.shelter?.shelterNumber && (
                <span className="px-3 py-1 rounded-xl text-xs font-black bg-[#237737]/10 text-[#237737] border border-[#237737]/30">
                  Facility ID: {selectedUserAppForModal.shelter.shelterNumber}
                </span>
              )}
            </div>

            {/* Physical Site Visit & Valuation Section */}
            {(selectedUserAppForModal.siteVisitScheduleDate ||
              selectedUserAppForModal.status === 'Site Visit' ||
              selectedUserAppForModal.siteVisitReport) && (
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3 text-xs text-blue-950">
                <div className="font-black text-sm flex items-center gap-2 text-blue-900 border-b border-blue-200/60 pb-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Physical Site Visit & Valuation Audit
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px] uppercase">
                      Scheduled Valuation Date
                    </span>
                    <p className="font-extrabold text-blue-950 mt-0.5">
                      {selectedUserAppForModal.siteVisitScheduleDate
                        ? new Date(selectedUserAppForModal.siteVisitScheduleDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'To be announced'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px] uppercase">
                      Inspection Window / Slot
                    </span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {selectedUserAppForModal.siteVisitValuationPeriod || 'Standard Evaluation Window'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px] uppercase">Assigned Auditor</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {selectedUserAppForModal.siteVisitInspector || 'Admin Field Officer'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px] uppercase">
                      Preparation Instructions
                    </span>
                    <p className="font-semibold text-slate-700 mt-0.5 italic">
                      {selectedUserAppForModal.siteVisitNotes ||
                        'Please ensure cages, registers, and staff are available for verification.'}
                    </p>
                  </div>
                </div>

                {/* Official Inspection Report if filed */}
                {selectedUserAppForModal.siteVisitReport && (
                  <div className="pt-2 border-t border-blue-200/60 mt-1">
                    <span className="text-blue-900 font-bold block uppercase text-[10px]">
                      Official Site Inspection & Valuation Report
                    </span>
                    <p className="font-medium text-slate-800 mt-1 bg-white p-3 rounded-xl border border-blue-100 leading-relaxed text-xs">
                      "{selectedUserAppForModal.siteVisitReport}"
                    </p>
                    {selectedUserAppForModal.siteVisitReportDate && (
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                        Report Filed:{' '}
                        {new Date(selectedUserAppForModal.siteVisitReportDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Application Data Grid */}
            <div className="bg-[#F8FAF9] rounded-2xl p-4 border border-slate-100 space-y-3 text-xs">
              <div className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                Submitted Facility Information
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Shelter Manager</span>
                  <p className="font-extrabold text-[#237737] mt-0.5">{selectedUserAppForModal.applicantName || selectedUserAppForModal.applicantId?.fullName || user?.fullName || 'Shelter Manager'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Shelter Email</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">{selectedUserAppForModal.shelterEmail}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Phone Number</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">+91 {selectedUserAppForModal.shelterPhoneNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Capacity</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {selectedUserAppForModal.occupiedCages || 0} occupied / {selectedUserAppForModal.totalCages || 0}{' '}
                    total cages
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Staff Members</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {selectedUserAppForModal.totalStaffs || 0} Certified Staff
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">GPS Coordinates</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {selectedUserAppForModal.latitude?.toFixed(5)}, {selectedUserAppForModal.longitude?.toFixed(5)}
                  </p>
                </div>
                {(selectedUserAppForModal.address ||
                  selectedUserAppForModal.city ||
                  selectedUserAppForModal.district ||
                  selectedUserAppForModal.state ||
                  selectedUserAppForModal.pincode) && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">
                      Shelter Physical Address
                    </span>
                    <p className="font-extrabold text-slate-800 mt-0.5">
                      {[
                        selectedUserAppForModal.address,
                        selectedUserAppForModal.city,
                        selectedUserAppForModal.district,
                        selectedUserAppForModal.state,
                        selectedUserAppForModal.pincode
                          ? `PIN: ${selectedUserAppForModal.pincode}`
                          : '',
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                )}
              </div>

              {/* Review Note if any and no site report */}
              {selectedUserAppForModal.reviewNote && !selectedUserAppForModal.siteVisitReport && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Admin Review Note</span>
                  <p className="font-semibold text-slate-700 mt-0.5 italic">{selectedUserAppForModal.reviewNote}</p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-400 font-semibold">
                Submitted On:{' '}
                {new Date(selectedUserAppForModal.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowUserAppDetailsModal(false);
                  setSelectedUserAppForModal(null);
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelterRegister;
