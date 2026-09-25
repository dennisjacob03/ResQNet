import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  ClipboardList,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Shield,
  ShieldCheck,
  FileText,
  Calendar,
  Check,
  ChevronRight,
  Phone,
  Mail,
  Users,
  AlertTriangle,
  RefreshCw,
  Award,
  Sparkles,
  Building2,
  ExternalLink,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  submitVetStaffApplication,
  getMyVetStaffApplication,
} from '../../services/veterinaryService';
import { getAllShelters } from '../../services/shelterService';
import {
  veterinaryStaffApplicationSchema,
  extractZodErrors,
  validateField,
} from '../../utils/validationSchemas';
import { checkProfileCompletion } from '../../utils/profileUtils';
import { ProfileRequiredCard } from '../../components/common/ProfileRequiredCard';

const KERALA_DISTRICTS = [
  'Alappuzha',
  'Ernakulam',
  'Idukki',
  'Kannur',
  'Kasaragod',
  'Kollam',
  'Kottayam',
  'Kozhikode',
  'Malappuram',
  'Palakkad',
  'Pathanamthitta',
  'Thiruvananthapuram',
  'Thrissur',
  'Wayanad',
];

const QUALIFICATION_OPTIONS = [
  'BVSc & AH (Bachelor of Veterinary Science & Animal Husbandry)',
  'MVSc (Master of Veterinary Science - Small Animal Surgery)',
  'MVSc (Master of Veterinary Science - Veterinary Medicine)',
  'DVM (Doctor of Veterinary Medicine)',
  'Diploma in Veterinary Nursing / Para-veterinary Science',
  'Other Veterinary Degree / Post-graduate Diploma',
];

const SPECIALIZATION_OPTIONS = [
  'Small Animal Soft-Tissue & Orthopedic Surgery',
  'Canine & Feline Internal Medicine',
  'Emergency & Critical Trauma Care',
  'Shelter Medicine & Spay/Neuter (ABC Protocols)',
  'Dermatology & Infectious Diseases',
  'Preventive Healthcare & Vaccinology',
];

const VeterinaryRegister = ({ onApplicationSubmitted, onRequireProfile, onNavigateToProfile }) => {
  const { user } = useAuth();
  const profileStatus = checkProfileCompletion(user);

  // Active view tab ('form' | 'status')
  const [viewTab, setViewTab] = useState('form');

  // Application data
  const [currentApp, setCurrentApp] = useState(null);
  const [vetStaffData, setVetStaffData] = useState(null);
  const [loadingApp, setLoadingApp] = useState(false);

  // Shelters list for targeting
  const [shelters, setShelters] = useState([]);
  const [loadingShelters, setLoadingShelters] = useState(false);

  // Form states
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [district, setDistrict] = useState('Ernakulam');
  const [city, setCity] = useState(user?.city || '');
  const [position, setPosition] = useState('Veterinary Doctor');
  const [councilRegistrationNumber, setCouncilRegistrationNumber] = useState('');
  const [qualification, setQualification] = useState(QUALIFICATION_OPTIONS[0]);
  const [specialization, setSpecialization] = useState(SPECIALIZATION_OPTIONS[0]);
  const [experienceYears, setExperienceYears] = useState(2);
  const [targetShelterId, setTargetShelterId] = useState('all');
  const [resumeBio, setResumeBio] = useState('');

  // Field validation states
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleBlurField = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(veterinaryStaffApplicationSchema, field, value);
    setFieldErrors((prev) => {
      const updated = { ...prev };
      if (err) updated[field] = err;
      else delete updated[field];
      return updated;
    });
  };

  // Submit states
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load existing application
  const loadApplication = async () => {
    setLoadingApp(true);
    try {
      const res = await getMyVetStaffApplication();
      if (res?.application) {
        setCurrentApp(res.application);
        if (res.vetStaff) {
          setVetStaffData(res.vetStaff);
        }
        // If an application exists, default to the status tab
        setViewTab('status');
      }
    } catch (err) {
      console.warn('Could not load veterinary staff application:', err.message);
    } finally {
      setLoadingApp(false);
    }
  };

  // Load registered shelters
  const loadShelters = async () => {
    setLoadingShelters(true);
    try {
      const res = await getAllShelters();
      const list = res?.shelters || res?.data || [];
      setShelters(list.filter((s) => s.status === 'Active' || s.shelterStatus === 'OPEN'));
    } catch (err) {
      console.warn('Could not load shelters:', err.message);
    } finally {
      setLoadingShelters(false);
    }
  };

  useEffect(() => {
    loadApplication();
    loadShelters();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!profileStatus.isComplete) {
      if (onRequireProfile) {
        onRequireProfile('Join Veterinary Staff');
      }
      return;
    }

    const validationData = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: password.trim(),
      confirmPassword: confirmPassword.trim(),
      position,
      councilRegistrationNumber: councilRegistrationNumber.trim().toUpperCase(),
      qualification,
      experienceYears: Number(experienceYears) || 0,
    };

    const parseResult = veterinaryStaffApplicationSchema.safeParse(validationData);
    if (!parseResult.success) {
      const fieldErrs = extractZodErrors(parseResult.error);
      setFieldErrors(fieldErrs);
      const allTouched = Object.keys(validationData).reduce((acc, k) => ({ ...acc, [k]: true }), {});
      setTouched((prev) => ({ ...prev, ...allTouched }));
      const firstErr = Object.values(fieldErrs)[0];
      setErrorMsg(firstErr || 'Please check the form for errors.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password.trim(),
        district,
        city: city.trim(),
        position,
        councilRegistrationNumber: councilRegistrationNumber.trim().toUpperCase(),
        qualification,
        specialization,
        experienceYears: Number(experienceYears) || 0,
        targetShelterId: targetShelterId === 'all' ? null : targetShelterId,
        resume: resumeBio.trim(),
      };

      const res = await submitVetStaffApplication(payload);
      if (res?.success) {
        setSuccessMsg('Veterinary staff application submitted successfully! Your dashboard credentials are registered.');
        setCurrentApp(res.application);
        setViewTab('status');
        if (onApplicationSubmitted) onApplicationSubmitted();
      } else {
        setErrorMsg(res?.message || 'Failed to submit application.');
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Submission error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // Stepper helper
  const getStepStatus = (stepIndex) => {
    if (!currentApp) return 'pending';
    const s = currentApp.status;

    if (s === 'Rejected') {
      if (stepIndex === 0) return 'completed';
      if (stepIndex === 1 && currentApp.interviewScheduleDate) return 'completed';
      return 'failed';
    }

    if (s === 'Approved') {
      return 'completed';
    }

    if (s === 'Interview Scheduled') {
      if (stepIndex === 0) return 'completed';
      if (stepIndex === 1) return 'active';
      return 'pending';
    }

    // Pending
    if (stepIndex === 0) return 'completed';
    if (stepIndex === 1) return 'active';
    return 'pending';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#1c5e2c] via-[#237737] to-[#2d8b43] text-white p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-white/90">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>ResQNet Clinical Network</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Veterinary Staff Program
            </h1>
            <p className="text-white/80 text-xs md:text-sm max-w-2xl font-medium leading-relaxed">
              Join certified veterinary care teams across Kerala animal shelters. Perform clinical
              examinations, life-saving surgeries, routine checkups, and record animal vaccinations.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-black/20 p-1.5 rounded-2xl backdrop-blur-sm self-start md:self-center shrink-0">
            <button
              onClick={() => setViewTab('form')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                viewTab === 'form'
                  ? 'bg-white text-[#237737] shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{currentApp ? 'New Application' : 'Apply Now'}</span>
            </button>
            <button
              onClick={() => {
                setViewTab('status');
                loadApplication();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer relative ${
                viewTab === 'status'
                  ? 'bg-white text-[#237737] shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Application Status</span>
              {currentApp && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-2 right-2 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* VIEW: Application Status */}
      {viewTab === 'status' && (
        <div className="space-y-6">
          {loadingApp ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
              <RefreshCw className="w-8 h-8 text-[#237737] animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-500">Loading veterinary application status...</p>
            </div>
          ) : !currentApp ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-[#237737] rounded-2xl flex items-center justify-center mx-auto">
                <Stethoscope className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">No Application Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                You have not submitted a veterinary staff application yet. Apply with your Veterinary
                Council registration to join a shelter clinical team.
              </p>
              <button
                onClick={() => setViewTab('form')}
                className="px-5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Fill Application Form</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100/90 shadow-sm p-6 md:p-8 space-y-8">
              {/* Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {currentApp.vetStaffApplicationId}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                        currentApp.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : currentApp.status === 'Interview Scheduled'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : currentApp.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {currentApp.status === 'Interview Scheduled'
                        ? 'Clinic Interview Scheduled'
                        : currentApp.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    {currentApp.position} • {currentApp.fullName}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Targeted:{' '}
                    <strong className="text-slate-700">
                      {currentApp.targetShelterName || 'All Shelters (Open)'}
                    </strong>
                    {currentApp.assignedShelterName && (
                      <span className="ml-2 text-emerald-600 font-bold">
                        • Assigned: {currentApp.assignedShelterName}
                      </span>
                    )}
                  </p>
                </div>

                <div className="text-left sm:text-right text-xs text-slate-400 font-medium">
                  <div>Applied on:</div>
                  <div className="font-bold text-slate-700">
                    {new Date(currentApp.applicationDate || currentApp.createdAt).toLocaleDateString(
                      'en-US',
                      { year: 'numeric', month: 'long', day: 'numeric' }
                    )}
                  </div>
                </div>
              </div>

              {/* 3-Step Visual Progress Stepper */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Appointment Journey
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Step 1: Submission */}
                  <div
                    className={`p-4 rounded-2xl border transition ${
                      getStepStatus(0) === 'completed'
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-extrabold text-slate-800">1. Applied</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Credentials & Council License registered
                    </p>
                  </div>

                  {/* Step 2: In-Person Interview & Verification */}
                  <div
                    className={`p-4 rounded-2xl border transition ${
                      getStepStatus(1) === 'completed'
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : getStepStatus(1) === 'active'
                        ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          getStepStatus(1) === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : getStepStatus(1) === 'active'
                            ? 'bg-blue-600 text-white animate-pulse'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {getStepStatus(1) === 'completed' ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          '2'
                        )}
                      </div>
                      <span className="text-xs font-extrabold text-slate-800">2. Interview & Verification</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {currentApp.interviewScheduleDate
                        ? `Date: ${new Date(currentApp.interviewScheduleDate).toLocaleDateString()}`
                        : 'Pending shelter schedule'}
                    </p>
                  </div>

                  {/* Step 3: Assigned to Shelter */}
                  <div
                    className={`p-4 rounded-2xl border transition ${
                      getStepStatus(2) === 'completed'
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          getStepStatus(2) === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {getStepStatus(2) === 'completed' ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          '3'
                        )}
                      </div>
                      <span className="text-xs font-extrabold text-slate-800">3. Appointed</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Role upgraded & assigned to shelter
                    </p>
                  </div>
                </div>
              </div>

              {/* Scheduled Interview Banner (if scheduled) */}
              {currentApp.interviewScheduleDate && (
                <div className="p-5 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-blue-900 font-extrabold text-sm">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>Shelter Interview Scheduled</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded-full">
                      In-Person Assessment
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block">Date & Time:</span>
                      <strong className="text-slate-800">
                        {new Date(currentApp.interviewScheduleDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        • {currentApp.interviewTimeSlot || '10:00 AM'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Location:</span>
                      <strong className="text-slate-800">
                        {currentApp.interviewLocation || 'Shelter Veterinary Wing'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Interviewer:</span>
                      <strong className="text-slate-800">
                        {currentApp.interviewInterviewer || 'Shelter Veterinary Board'}
                      </strong>
                    </div>
                  </div>

                  {currentApp.interviewNotes && (
                    <p className="text-xs text-blue-800/90 font-medium pt-2 border-t border-blue-100">
                      <strong>Notes from Shelter:</strong> {currentApp.interviewNotes}
                    </p>
                  )}
                </div>
              )}

              {/* Approved Credentials Badge */}
              {currentApp.status === 'Approved' && (
                <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-emerald-950">
                          Officially Appointed Veterinary Staff
                        </h4>
                        <p className="text-xs text-emerald-800 font-medium">
                          Assigned to: {currentApp.assignedShelterName || 'Registered Shelter'}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-black rounded-xl">
                      {currentApp.vetStaffId || 'VS-ACTIVE'}
                    </span>
                  </div>

                  {/* Verification checklist badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-bold text-emerald-900">
                    <div className="p-2.5 bg-white/80 rounded-xl flex items-center gap-1.5 border border-emerald-100">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Council Reg Verified</span>
                    </div>
                    <div className="p-2.5 bg-white/80 rounded-xl flex items-center gap-1.5 border border-emerald-100">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Surgical Competence</span>
                    </div>
                    <div className="p-2.5 bg-white/80 rounded-xl flex items-center gap-1.5 border border-emerald-100">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Animal Safety Protocol</span>
                    </div>
                    <div className="p-2.5 bg-white/80 rounded-xl flex items-center gap-1.5 border border-emerald-100">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Shelter Agreement</span>
                    </div>
                  </div>

                  {currentApp.interviewReport && (
                    <div className="text-xs text-emerald-900/90 font-medium bg-white/70 p-3.5 rounded-xl border border-emerald-100">
                      <strong>Shelter Evaluation Remarks:</strong> {currentApp.interviewReport}
                    </div>
                  )}

                  <div className="pt-2">
                    <p className="text-xs text-emerald-800 font-medium mb-3">
                      Your application has been approved and account provisioned as <strong>Veterinary Staff</strong>.
                      Registered login email: <strong className="text-emerald-950 font-mono">{currentApp.email}</strong>.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href="/dashboard"
                        className="px-5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-2 shadow-sm"
                      >
                        <Stethoscope className="w-4 h-4" />
                        <span>Open Veterinary Dashboard</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      {user?.email && user.email.toLowerCase() !== currentApp.email.toLowerCase() && (
                        <a
                          href="/login"
                          className="px-4 py-2.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-2 shadow-sm"
                        >
                          <Lock className="w-3.5 h-3.5 text-[#237737]" />
                          <span>Log in with Veterinary Account ({currentApp.email})</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection notice */}
              {currentApp.status === 'Rejected' && (
                <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Application Not Approved</span>
                  </div>
                  <p className="text-rose-700 font-medium">
                    {currentApp.rejectionReason ||
                      'The shelter evaluation committee did not approve the application at this time.'}
                  </p>
                  <button
                    onClick={() => setViewTab('form')}
                    className="mt-2 text-[#237737] font-bold hover:underline cursor-pointer"
                  >
                    Submit a revised application &rarr;
                  </button>
                </div>
              )}

              {/* Applicant Credentials Summary */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Registered Credentials
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold">Council Reg No:</span>
                    <strong className="text-slate-800">
                      {currentApp.councilRegistrationNumber}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Qualification:</span>
                    <strong className="text-slate-800">{currentApp.qualification}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Specialization:</span>
                    <strong className="text-slate-800">{currentApp.specialization}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Experience:</span>
                    <strong className="text-slate-800">
                      {currentApp.experienceYears} Years
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Dashboard Email:</span>
                    <strong className="text-[#237737] font-mono break-all">
                      {currentApp.email}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Contact Phone:</span>
                    <strong className="text-slate-800">
                      +91 {currentApp.phone}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: Application Form */}
      {viewTab === 'form' && (
        <div className="space-y-6">
          {!profileStatus.isComplete && (
            <ProfileRequiredCard
              user={user}
              onNavigateToProfile={onNavigateToProfile}
              actionName="join veterinary staff"
            />
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-slate-100/90 shadow-sm p-6 md:p-8 space-y-8"
          >
          {/* Section 1: Candidate Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Users className="w-4 h-4 text-[#237737]" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                1. Personal Details & Location
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (touched.fullName) handleBlurField('fullName', e.target.value);
                  }}
                  onBlur={() => handleBlurField('fullName', fullName)}
                  placeholder="Dr. Rajesh Nair"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition ${
                    fieldErrors.fullName && touched.fullName
                      ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'bg-[#F8FAF9] border border-slate-200 focus:border-[#237737]'
                  }`}
                />
                {fieldErrors.fullName && touched.fullName && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Home District (Kerala) *</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] cursor-pointer"
                >
                  {KERALA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">City / Town</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Kochi, Thrissur, etc."
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Veterinary Dashboard Account Credentials */}
          <div className="bg-gradient-to-br from-emerald-50/60 to-emerald-50/20 border border-emerald-200/80 rounded-2xl p-5 md:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#237737]" />
                <h3 className="text-sm font-black uppercase tracking-wider text-emerald-950">
                  2. Veterinary Dashboard Login Credentials
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-[#237737] text-white rounded-full self-start sm:self-auto">
                Dedicated Dashboard Login
              </span>
            </div>

            <p className="text-xs text-emerald-800/80 font-medium">
              Provide the email, mobile number, and password for your official Veterinary Staff account. Once your clinical interview is approved by the shelter, you will use these credentials to log into the Veterinary Dashboard.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#237737]" />
                  <span>Official Email Address (Login ID) *</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) handleBlurField('email', e.target.value);
                  }}
                  onBlur={() => handleBlurField('email', email)}
                  placeholder="doctor@clinic.com"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none shadow-sm transition ${
                    fieldErrors.email && touched.email
                      ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'bg-white border border-emerald-200 focus:border-[#237737]'
                  }`}
                />
                {fieldErrors.email && touched.email ? (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">
                    {fieldErrors.email}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 font-medium">
                    Can be a new or clinic work email for your veterinary dashboard account.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#237737]" />
                  <span>Contact Mobile Number *</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (touched.phone) handleBlurField('phone', e.target.value);
                  }}
                  onBlur={() => handleBlurField('phone', phone)}
                  placeholder="9876543210"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none shadow-sm transition ${
                    fieldErrors.phone && touched.phone
                      ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'bg-white border border-emerald-200 focus:border-[#237737]'
                  }`}
                />
                {fieldErrors.phone && touched.phone ? (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">
                    {fieldErrors.phone}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 font-medium">
                    10-digit mobile number for emergency alert dispatches & SMS.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#237737]" />
                  <span>Set Dashboard Account Password *</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password) handleBlurField('password', e.target.value);
                    }}
                    onBlur={() => handleBlurField('password', password)}
                    placeholder="Min. 8 chars with uppercase, number, symbol"
                    required
                    className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl text-xs font-semibold focus:outline-none shadow-sm transition ${
                      fieldErrors.password && touched.password
                        ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'bg-white border border-emerald-200 focus:border-[#237737]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && touched.password ? (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">
                    {fieldErrors.password}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 font-medium">
                    At least 8 chars with uppercase, lowercase, number & symbol.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#237737]" />
                  <span>Confirm Dashboard Password *</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, confirmPassword: true }));
                      if (password !== confirmPassword) {
                        setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
                      } else {
                        setFieldErrors((prev) => {
                          const updated = { ...prev };
                          delete updated.confirmPassword;
                          return updated;
                        });
                      }
                    }}
                    placeholder="Re-enter password"
                    required
                    className={`w-full pl-3.5 pr-10 py-2.5 bg-white border rounded-xl text-xs font-semibold focus:outline-none shadow-sm transition ${
                      (fieldErrors.confirmPassword && touched.confirmPassword) || (confirmPassword && password !== confirmPassword)
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : confirmPassword && password === confirmPassword
                        ? 'border-emerald-400 focus:border-[#237737]'
                        : 'border-emerald-200 focus:border-[#237737]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <p
                    className={`text-[10px] font-bold flex items-center gap-1 ${
                      password === confirmPassword ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  >
                    {password === confirmPassword ? (
                      <>
                        <Check className="w-3 h-3" /> Passwords match ✓
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" /> Passwords do not match
                      </>
                    )}
                  </p>
                )}
                {fieldErrors.confirmPassword && touched.confirmPassword && !confirmPassword && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Qualifications & Council Registration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-[#237737]" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                3. Professional Credentials & Registration
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Position Applying For *</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] cursor-pointer"
                >
                  <option value="Veterinary Doctor">Veterinary Doctor</option>
                  <option value="Veterinary Nurse">Veterinary Nurse</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-600 flex items-center justify-between">
                  <span>Council Registration Number (VCI / State) *</span>
                  <span className="text-[10px] text-slate-400">Mandatory for verification</span>
                </label>
                <input
                  type="text"
                  value={councilRegistrationNumber}
                  onChange={(e) => {
                    setCouncilRegistrationNumber(e.target.value);
                    if (touched.councilRegistrationNumber) handleBlurField('councilRegistrationNumber', e.target.value);
                  }}
                  onBlur={() => handleBlurField('councilRegistrationNumber', councilRegistrationNumber)}
                  placeholder="e.g. KVC-2021-08492 or VCI-19482"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition ${
                    fieldErrors.councilRegistrationNumber && touched.councilRegistrationNumber
                      ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'bg-[#F8FAF9] border border-slate-200 focus:border-[#237737]'
                  }`}
                />
                {fieldErrors.councilRegistrationNumber && touched.councilRegistrationNumber && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">
                    {fieldErrors.councilRegistrationNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-600">Educational Qualification *</label>
                <select
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] cursor-pointer"
                >
                  {QUALIFICATION_OPTIONS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={experienceYears}
                  onChange={(e) => {
                    setExperienceYears(e.target.value);
                    if (touched.experienceYears) handleBlurField('experienceYears', e.target.value);
                  }}
                  onBlur={() => handleBlurField('experienceYears', experienceYears)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition ${
                    fieldErrors.experienceYears && touched.experienceYears
                      ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'bg-[#F8FAF9] border border-slate-200 focus:border-[#237737]'
                  }`}
                />
                {fieldErrors.experienceYears && touched.experienceYears && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">
                    {fieldErrors.experienceYears}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Primary Specialization / Focus Area</label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] cursor-pointer"
              >
                {SPECIALIZATION_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 4: Shelter Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-[#237737]" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                4. Shelter Preference & Assignment
              </h2>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">
                Choose Specific Shelter or Open to All Shelters
              </label>
              <select
                value={targetShelterId}
                onChange={(e) => setTargetShelterId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] cursor-pointer"
              >
                <option value="all">🌟 All Shelters (Open to Any Shelter In Need)</option>
                {shelters.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.shelterName} ({s.shelterNumber || 'Shelter'} - {s.shelterEmail})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 font-medium">
                {targetShelterId === 'all'
                  ? 'Your application will be visible to all verified shelters across ResQNet. Any shelter can invite you for an interview and appoint you.'
                  : 'Your application will be sent exclusively to the selected shelter. Only they will review your profile and conduct the interview.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">
                Professional Bio / Clinical Background (Optional)
              </label>
              <textarea
                rows={3}
                value={resumeBio}
                onChange={(e) => setResumeBio(e.target.value)}
                placeholder="Share your clinical background, surgical experience (e.g. ABC spay/neuter drives, trauma response), and clinical availability..."
                className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            {!profileStatus.isComplete ? (
              <span className="text-xs text-amber-700 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Profile details must be updated before joining veterinary staff.
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-medium">
                By submitting, you consent to shelter clinical verification & interview scheduling.
              </span>
            )}
            <button
              type={profileStatus.isComplete ? 'submit' : 'button'}
              onClick={(e) => {
                if (!profileStatus.isComplete) {
                  e.preventDefault();
                  if (onRequireProfile) {
                    onRequireProfile('Join Veterinary Staff');
                  }
                }
              }}
              disabled={submitting}
              className={`w-full sm:w-auto px-6 py-3 text-white text-xs font-extrabold rounded-xl transition cursor-pointer shadow-md disabled:opacity-50 inline-flex items-center justify-center gap-2 ${
                profileStatus.isComplete
                  ? 'bg-[#237737] hover:bg-[#1d632e] shadow-[#237737]/15'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
              }`}
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : profileStatus.isComplete ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Submit Veterinary Application</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Complete Profile to Join Vet Staff</span>
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      )}
    </div>
  );
};

export default VeterinaryRegister;
