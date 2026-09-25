import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
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
  Car,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  submitVolunteerApplication,
  getMyVolunteerApplication,
} from '../../services/volunteerService';
import { ProfileRequiredCard } from '../../components/common/ProfileRequiredCard';
import { checkProfileCompletion } from '../../utils/profileUtils';
import {
  volunteerApplicationSchema,
  extractZodErrors,
  validateField,
} from '../../utils/validationSchemas';

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

const AVAILABLE_DAYS = [
  'Weekdays',
  'Weekends',
  'Morning Shifts',
  'Evening Shifts',
  'Emergency On-Call',
  'Flexible',
];

const INTEREST_AREAS = [
  'Animal Feeding & Care',
  'Shelter Sanitation & Maintenance',
  'Field Rescue Assistance',
  'Foster Care & Rehabilitation',
  'Adoption Drives & Events',
  'Administrative Support',
  'Transportation & Animal Transit',
  'Photography & Social Media',
];

const SKILL_OPTIONS = [
  'Basic Animal First Aid',
  'Canine Handling & Walking',
  'Feline Care',
  'Driving & Transport',
  'Grooming & Hygiene',
  'Community Outreach',
];

const VolunteerRegister = ({ onApplicationSubmitted, onRequireProfile, onNavigateToProfile }) => {
  const { user } = useAuth();
  const profileStatus = checkProfileCompletion(user);

  // Active view tab ('form' | 'status')
  const [viewTab, setViewTab] = useState('form');

  // Application data
  const [currentApp, setCurrentApp] = useState(null);
  const [applicationsList, setApplicationsList] = useState([]);
  const [loadingApp, setLoadingApp] = useState(false);

  // Form states
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [district, setDistrict] = useState('Ernakulam');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState('Kerala');
  const [address, setAddress] = useState(user?.address || '');
  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    phone: '',
    relation: 'Family',
  });
  const [availability, setAvailability] = useState(['Weekends']);
  const [interests, setInterests] = useState(['Animal Feeding & Care', 'Adoption Drives & Events']);
  const [skills, setSkills] = useState(['Canine Handling & Walking']);
  const [experienceNotes, setExperienceNotes] = useState('');
  const [hasVehicle, setHasVehicle] = useState(false);
  const [vehicleType, setVehicleType] = useState('None');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Single field validation helper
  const handleBlurField = (fieldName, val, extra = {}) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    let err = '';
    if (fieldName === 'fullName') err = validateField(null, 'fullName', val);
    else if (fieldName === 'email') err = validateField(null, 'email', val);
    else if (fieldName === 'phone') err = validateField(null, 'phone', val);
    else if (fieldName === 'district') err = validateField(null, 'district', val);
    else if (fieldName === 'city') err = validateField(null, 'city', val);
    else if (fieldName === 'emergencyName') err = validateField(null, 'name', val);
    else if (fieldName === 'emergencyPhone') err = validateField(null, 'phone', val);
    else if (fieldName === 'vehicleNumber') {
      if (hasVehicle && vehicleType !== 'None') {
        err = validateField(null, 'vehicleNumber', val);
      }
    }
    setFieldErrors((prev) => ({ ...prev, [fieldName]: err }));
  };

  // Load user's application
  const loadApplication = async () => {
    setLoadingApp(true);
    try {
      const res = await getMyVolunteerApplication();
      if (res.success) {
        setCurrentApp(res.application || null);
        setApplicationsList(res.applications || []);
        if (res.application && viewTab === 'form' && !formSuccess) {
          setViewTab('status');
        }
      }
    } catch (err) {
      console.warn('Failed to load volunteer application:', err.message);
    } finally {
      setLoadingApp(false);
    }
  };

  useEffect(() => {
    loadApplication();
  }, []);

  // Update contact details if user auth resolves
  useEffect(() => {
    if (user?.fullName && !fullName) setFullName(user.fullName);
    if (user?.email && !email) setEmail(user.email);
    if (user?.phoneNumber && !phone) setPhone(user.phoneNumber);
    if (user?.city && !city) setCity(user.city);
    if (user?.address && !address) setAddress(user.address);
  }, [user]);

  // Toggle item in array
  const toggleArrayItem = (list, setList, item) => {
    if (list.includes(item)) {
      if (list.length > 1) {
        setList(list.filter((i) => i !== item));
      }
    } else {
      setList([...list, item]);
    }
  };

  // Submit Handler with Comprehensive Validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Check if profile is complete before allowing database action
    if (!profileStatus.isComplete) {
      if (onRequireProfile) {
        onRequireProfile('Submit Volunteer Application');
      }
      return;
    }

    const payload = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      district,
      city: city.trim(),
      state,
      address: address.trim(),
      emergencyContact: {
        name: emergencyContact.name.trim(),
        phone: emergencyContact.phone.trim(),
        relation: emergencyContact.relation,
      },
      availability,
      interests,
      skills,
      experienceNotes: experienceNotes.trim(),
      hasVehicle,
      vehicleType: hasVehicle ? vehicleType : 'None',
      vehicleNumber: hasVehicle ? vehicleNumber.trim().toUpperCase() : '',
      agreedToTerms,
    };

    // Run Zod schema validation
    const valResult = volunteerApplicationSchema.safeParse(payload);
    if (!valResult.success) {
      const { errors } = extractZodErrors(valResult);
      setFieldErrors(errors);
      setTouched({
        fullName: true,
        email: true,
        phone: true,
        district: true,
        city: true,
        emergencyName: true,
        emergencyPhone: true,
        vehicleNumber: true,
        availability: true,
        interests: true,
        agreedToTerms: true,
      });
      const firstMsg = Object.values(errors)[0] || 'Please fix the highlighted field errors below.';
      setFormError(firstMsg);
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitVolunteerApplication(payload);
      if (res.success) {
        setFormSuccess(
          `Volunteer application submitted successfully! Application ID: ${res.application?.volunteerApplicationId || 'VAP-0001'}. Admin will schedule your orientation visit.`
        );
        setCurrentApp(res.application);
        setApplicationsList((prev) => [res.application, ...prev]);
        setViewTab('status');
        if (onApplicationSubmitted) onApplicationSubmitted();
      } else {
        setFormError(res.message || 'Failed to submit application. Please try again.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setFormError(
        err?.response?.data?.message || 'Server error while submitting application. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-full border border-emerald-200 shadow-xs">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Approved & Certified
          </span>
        );
      case 'Volunteer Visit':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 font-extrabold text-xs rounded-full border border-blue-200 animate-pulse shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            Orientation Visit Scheduled
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 font-extrabold text-xs rounded-full border border-rose-200 shadow-xs">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Application Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 font-extrabold text-xs rounded-full border border-amber-200 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Under Admin Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1b5e20] to-[#237737] p-7 text-white shadow-xl shadow-[#237737]/15">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-emerald-100 mb-1">
            <HeartHandshake className="w-3.5 h-3.5" />
            Community Volunteer Program
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Be the Voice for the Voiceless 🐾
          </h1>
          <p className="text-emerald-100/90 text-sm font-medium leading-relaxed">
            Join the certified ResQNet Volunteer Network. Participate in animal feeding drives, shelter care, rescue assistance, and foster coordination across Kerala.
          </p>
        </div>
        <HeartHandshake className="absolute -right-6 -bottom-6 w-48 h-48 text-white/10 pointer-events-none" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewTab('form')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              viewTab === 'form'
                ? 'bg-[#237737] text-white shadow-md shadow-[#237737]/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            Apply to Volunteer
          </button>
          <button
            onClick={() => setViewTab('status')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer relative ${
              viewTab === 'status'
                ? 'bg-[#237737] text-white shadow-md shadow-[#237737]/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            My Application Status
            {currentApp && (
              <span
                className={`w-2 h-2 rounded-full ${
                  currentApp.applicationStatus === 'Approved'
                    ? 'bg-emerald-400'
                    : currentApp.applicationStatus === 'Volunteer Visit'
                    ? 'bg-blue-400 animate-ping'
                    : 'bg-amber-400'
                }`}
              />
            )}
          </button>
        </div>

        <button
          onClick={loadApplication}
          disabled={loadingApp}
          title="Refresh application status"
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loadingApp ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Feedback Alerts */}
      {formError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-sm font-medium animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p>{formError}</p>
        </div>
      )}
      {formSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800 text-sm font-medium">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p>{formSuccess}</p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: APPLICATION FORM */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {viewTab === 'form' && (
        <div className="space-y-6">
          {!profileStatus.isComplete && (
            <ProfileRequiredCard
              user={user}
              onNavigateToProfile={onNavigateToProfile}
              actionName="submitting a volunteer application"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Candidate Identity */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#237737] flex items-center justify-center font-black">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  1. Candidate Profile & Contact
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Personal and communication details for verification
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (touched.fullName) handleBlurField('fullName', e.target.value);
                  }}
                  onBlur={() => handleBlurField('fullName', fullName)}
                  placeholder="e.g. Dennis Jacob"
                  className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] transition ${
                    fieldErrors.fullName && touched.fullName
                      ? 'border-rose-400 bg-rose-50/20'
                      : 'border-slate-200'
                  }`}
                />
                {fieldErrors.fullName && touched.fullName && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched.email) handleBlurField('email', e.target.value);
                    }}
                    onBlur={() => handleBlurField('email', email)}
                    placeholder="e.g. volunteer@example.com"
                    className={`w-full pl-9 pr-4 py-2.5 bg-[#F8FAF9] border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] transition ${
                      fieldErrors.email && touched.email
                        ? 'border-rose-400 bg-rose-50/20'
                        : 'border-slate-200'
                    }`}
                  />
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
                {fieldErrors.email && touched.email && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (touched.phone) handleBlurField('phone', e.target.value);
                    }}
                    onBlur={() => handleBlurField('phone', phone)}
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    className={`w-full pl-9 pr-4 py-2.5 bg-[#F8FAF9] border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] transition ${
                      fieldErrors.phone && touched.phone
                        ? 'border-rose-400 bg-rose-50/20'
                        : 'border-slate-200'
                    }`}
                  />
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
                {fieldErrors.phone && touched.phone && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{fieldErrors.phone}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Operating District <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      if (touched.district) handleBlurField('district', e.target.value);
                    }}
                    onBlur={() => handleBlurField('district', district)}
                    className={`w-full pl-9 pr-4 py-2.5 bg-[#F8FAF9] border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] transition appearance-none cursor-pointer ${
                      fieldErrors.district && touched.district
                        ? 'border-rose-400 bg-rose-50/20'
                        : 'border-slate-200'
                    }`}
                  >
                    {KERALA_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {fieldErrors.district && touched.district && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{fieldErrors.district}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">City / Locality <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (touched.city) handleBlurField('city', e.target.value);
                  }}
                  onBlur={() => handleBlurField('city', city)}
                  placeholder="e.g. Aluva, Kochi"
                  className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] transition ${
                    fieldErrors.city && touched.city
                      ? 'border-rose-400 bg-rose-50/20'
                      : 'border-slate-200'
                  }`}
                />
                {fieldErrors.city && touched.city && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{fieldErrors.city}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none cursor-not-allowed"
                  readOnly
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, building, or landmark"
                  className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] transition"
                />
              </div>
            </div>

            {/* Emergency Contact Sub-card */}
            <div className={`p-4 bg-[#F8FAF9] border rounded-2xl space-y-3 ${
              (fieldErrors['emergencyContact.name'] || fieldErrors['emergencyContact.phone']) && (touched.emergencyName || touched.emergencyPhone)
                ? 'border-rose-300'
                : 'border-slate-200/80'
            }`}>
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                <Shield className="w-4 h-4 text-emerald-600" />
                Emergency Contact (In Case of Field Injury or Alerts) <span className="text-rose-500">*</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Contact Name *"
                    value={emergencyContact.name}
                    onChange={(e) => {
                      setEmergencyContact({ ...emergencyContact, name: e.target.value });
                      if (touched.emergencyName) handleBlurField('emergencyName', e.target.value);
                    }}
                    onBlur={() => handleBlurField('emergencyName', emergencyContact.name)}
                    className={`w-full px-3.5 py-2 bg-white border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] ${
                      fieldErrors['emergencyContact.name'] && touched.emergencyName
                        ? 'border-rose-400'
                        : 'border-slate-200'
                    }`}
                  />
                  {fieldErrors['emergencyContact.name'] && touched.emergencyName && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-1">
                      {fieldErrors['emergencyContact.name']}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number (10 digits) *"
                    value={emergencyContact.phone}
                    maxLength={10}
                    onChange={(e) => {
                      setEmergencyContact({ ...emergencyContact, phone: e.target.value });
                      if (touched.emergencyPhone) handleBlurField('emergencyPhone', e.target.value);
                    }}
                    onBlur={() => handleBlurField('emergencyPhone', emergencyContact.phone)}
                    className={`w-full px-3.5 py-2 bg-white border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] ${
                      fieldErrors['emergencyContact.phone'] && touched.emergencyPhone
                        ? 'border-rose-400'
                        : 'border-slate-200'
                    }`}
                  />
                  {fieldErrors['emergencyContact.phone'] && touched.emergencyPhone && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-1">
                      {fieldErrors['emergencyContact.phone']}
                    </p>
                  )}
                </div>
                <select
                  value={emergencyContact.relation}
                  onChange={(e) =>
                    setEmergencyContact({ ...emergencyContact, relation: e.target.value })
                  }
                  className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
                >
                  <option value="Family">Family Member</option>
                  <option value="Parent">Parent / Guardian</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Friend">Friend / Colleague</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Availability & Areas of Interest */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-black">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  2. Availability & Service Interests
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Choose your schedule preferences and where you would like to contribute
                </p>
              </div>
            </div>

            {/* Availability Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                When are you available to volunteer?
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_DAYS.map((slot) => {
                  const isSelected = availability.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleArrayItem(availability, setAvailability, slot)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#237737] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interest Areas Pills */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700">
                Areas of Interest & Activity Roles:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {INTEREST_AREAS.map((interest) => {
                  const isSelected = interests.includes(interest);
                  return (
                    <div
                      key={interest}
                      onClick={() => toggleArrayItem(interests, setInterests, interest)}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-50/70 border-[#237737] text-emerald-900 shadow-xs'
                          : 'bg-[#F8FAF9] border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span>{interest}</span>
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-[#237737] text-white' : 'border border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skills & Experience */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700">
                Applicable Skills & Aptitude:
              </label>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map((skill) => {
                  const isSelected = skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleArrayItem(skills, setSkills, skill)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3" /> : null}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-700">
                Experience Notes & Motivation (Optional)
              </label>
              <textarea
                value={experienceNotes}
                onChange={(e) => setExperienceNotes(e.target.value)}
                placeholder="Tell us about pets you have raised, prior volunteer experience, or why you want to support animal welfare..."
                rows={3}
                className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] transition"
              />
            </div>
          </div>

          {/* Section 3: Mobility & Transportation */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-black">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  3. Mobility & Emergency Vehicle (Optional)
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Volunteers with vehicles help transport rescued animals to clinics and foster homes
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasVehicle}
                  onChange={(e) => setHasVehicle(e.target.checked)}
                  className="w-4 h-4 text-[#237737] rounded border-slate-300 focus:ring-[#237737]"
                />
                <span className="text-xs font-bold text-slate-800">
                  I have a vehicle and can assist with animal transit or emergency pick-ups
                </span>
              </label>

              {hasVehicle && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Vehicle Type</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
                    >
                      <option value="Bike">Bike / Two-Wheeler</option>
                      <option value="Car">Car / Hatchback / Sedan</option>
                      <option value="Van">Van / SUV (Transport Crate Ready)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Vehicle Registration Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => {
                        setVehicleNumber(e.target.value.toUpperCase());
                        if (touched.vehicleNumber) handleBlurField('vehicleNumber', e.target.value.toUpperCase());
                      }}
                      onBlur={() => handleBlurField('vehicleNumber', vehicleNumber)}
                      placeholder="e.g. KL-07-CD-5678"
                      className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] ${
                        fieldErrors.vehicleNumber && touched.vehicleNumber
                          ? 'border-rose-400 bg-rose-50/20'
                          : 'border-slate-200'
                      }`}
                    />
                    {fieldErrors.vehicleNumber && touched.vehicleNumber && (
                      <p className="text-[11px] text-rose-500 font-semibold mt-1">
                        {fieldErrors.vehicleNumber}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Pledge & Terms */}
          <div className={`bg-[#F8FAF9] border rounded-3xl p-6 space-y-4 ${
            fieldErrors.agreedToTerms && touched.agreedToTerms ? 'border-rose-300 bg-rose-50/10' : 'border-slate-200'
          }`}>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agreedToTerms"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  setTouched((prev) => ({ ...prev, agreedToTerms: true }));
                  setFieldErrors((prev) => ({
                    ...prev,
                    agreedToTerms: e.target.checked ? '' : 'You must agree to the volunteer code of conduct',
                  }));
                }}
                className="w-4 h-4 text-[#237737] rounded border-slate-300 focus:ring-[#237737] mt-0.5 cursor-pointer"
              />
              <label htmlFor="agreedToTerms" className="text-xs font-semibold text-slate-700 leading-relaxed cursor-pointer">
                I hereby affirm that all information provided is accurate. I understand that serving as a ResQNet volunteer requires attending a scheduled <strong>In-Person Orientation & Verification Session</strong>, following safe animal handling guidelines, treating animals with kindness, and adhering to the ResQNet Volunteer Code of Conduct.
              </label>
            </div>
            {fieldErrors.agreedToTerms && touched.agreedToTerms && (
              <p className="text-[11px] text-rose-500 font-semibold">{fieldErrors.agreedToTerms}</p>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              {!profileStatus.isComplete && (
                <p className="text-xs text-amber-700 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  Profile details must be updated before submitting.
                </p>
              )}
              <button
                type={profileStatus.isComplete ? 'submit' : 'button'}
                onClick={(e) => {
                  if (!profileStatus.isComplete) {
                    e.preventDefault();
                    if (onRequireProfile) {
                      onRequireProfile('Submit Volunteer Application');
                    }
                  }
                }}
                disabled={submitting}
                className={`w-full sm:w-auto px-6 py-3 font-extrabold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${
                  profileStatus.isComplete
                    ? 'bg-[#237737] hover:bg-[#1b5e20] text-white shadow-[#237737]/20 ml-auto'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20 ml-auto'
                }`}
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Submitting Application...
                  </>
                ) : profileStatus.isComplete ? (
                  <>
                    <HeartHandshake className="w-4 h-4" />
                    Submit Volunteer Application
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    Complete Profile to Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: APPLICATION STATUS & BADGE */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {viewTab === 'status' && (
        <div className="space-y-6">
          {!currentApp ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-emerald-50 text-[#237737] rounded-full flex items-center justify-center mx-auto">
                <HeartHandshake className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">No Volunteer Application Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                You haven't submitted a volunteer application yet. Click the button below to submit your details and attend an orientation session.
              </p>
              <button
                onClick={() => setViewTab('form')}
                className="px-5 py-2.5 bg-[#237737] hover:bg-[#1b5e20] text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
              >
                Apply to Volunteer Now
              </button>
            </div>
          ) : (
            <>
              {/* Application Summary Card */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-[#237737] flex items-center justify-center font-black shrink-0">
                      <HeartHandshake className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-slate-900">
                          {currentApp.fullName}
                        </h2>
                        {getStatusBadge(currentApp.applicationStatus)}
                      </div>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        Application #{currentApp.volunteerApplicationId} • Submitted on{' '}
                        {new Date(currentApp.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {currentApp.volunteerId && (
                    <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200">
                      <Award className="w-5 h-5 text-emerald-600" />
                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">
                          Certified Volunteer Badge
                        </span>
                        <span className="text-sm font-black text-emerald-950">
                          {currentApp.volunteerId}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4-Stage Stepper */}
                <div className="py-2">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {/* Step 1 */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                          Step 1
                        </span>
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">Application Submitted</h4>
                      <p className="text-[11px] text-slate-500">Profile & service interests recorded</p>
                    </div>

                    {/* Step 2 */}
                    <div
                      className={`p-3.5 rounded-2xl border space-y-1 ${
                        currentApp.applicationStatus === 'Volunteer Visit' ||
                        currentApp.applicationStatus === 'Approved'
                          ? 'bg-emerald-50/80 border-emerald-200'
                          : 'bg-slate-50 border-slate-200 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider ${
                            currentApp.applicationStatus === 'Volunteer Visit' ||
                            currentApp.applicationStatus === 'Approved'
                              ? 'text-emerald-700'
                              : 'text-slate-500'
                          }`}
                        >
                          Step 2
                        </span>
                        {currentApp.applicationStatus === 'Approved' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : currentApp.applicationStatus === 'Volunteer Visit' ? (
                          <Calendar className="w-4 h-4 text-blue-600 animate-pulse" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">Orientation Visit</h4>
                      <p className="text-[11px] text-slate-500">
                        {currentApp.visitScheduleDate
                          ? new Date(currentApp.visitScheduleDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })
                          : 'Pending schedule'}
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div
                      className={`p-3.5 rounded-2xl border space-y-1 ${
                        currentApp.visitReport
                          ? 'bg-emerald-50/80 border-emerald-200'
                          : currentApp.applicationStatus === 'Volunteer Visit'
                          ? 'bg-blue-50/80 border-blue-200'
                          : 'bg-slate-50 border-slate-200 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider ${
                            currentApp.visitReport ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                        >
                          Step 3
                        </span>
                        {currentApp.visitReport ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <FileText className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">Audit & Evaluation</h4>
                      <p className="text-[11px] text-slate-500">
                        {currentApp.visitReport ? 'Evaluation Filed' : 'In-person assessment'}
                      </p>
                    </div>

                    {/* Step 4 */}
                    <div
                      className={`p-3.5 rounded-2xl border space-y-1 ${
                        currentApp.applicationStatus === 'Approved'
                          ? 'bg-emerald-50/80 border-emerald-200'
                          : currentApp.applicationStatus === 'Rejected'
                          ? 'bg-rose-50 border-rose-200'
                          : 'bg-slate-50 border-slate-200 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider ${
                            currentApp.applicationStatus === 'Approved'
                              ? 'text-emerald-700'
                              : currentApp.applicationStatus === 'Rejected'
                              ? 'text-rose-700'
                              : 'text-slate-500'
                          }`}
                        >
                          Step 4
                        </span>
                        {currentApp.applicationStatus === 'Approved' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : currentApp.applicationStatus === 'Rejected' ? (
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                        ) : (
                          <Award className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">Official Certification</h4>
                      <p className="text-[11px] text-slate-500">
                        {currentApp.applicationStatus === 'Approved'
                          ? 'Active Badge Issued'
                          : currentApp.applicationStatus === 'Rejected'
                          ? 'Declined'
                          : 'Final Approval'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scheduled Orientation Session Details Card */}
                {currentApp.visitScheduleDate && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/80 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      In-Person Orientation & Verification Session
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 font-bold block">Scheduled Date</span>
                        <p className="font-extrabold text-blue-900 mt-0.5">
                          {new Date(currentApp.visitScheduleDate).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block">Session Slot / Time</span>
                        <p className="font-extrabold text-slate-800 mt-0.5">
                          {currentApp.visitValuationPeriod || '10:00 AM - 1:00 PM'}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block">Assigned Coordinator</span>
                        <p className="font-extrabold text-slate-800 mt-0.5">
                          {currentApp.visitCoordinator || 'ResQNet Volunteer Coordinator'}
                        </p>
                      </div>
                    </div>
                    {currentApp.visitNotes && (
                      <div className="pt-2 border-t border-blue-200/60 text-xs">
                        <span className="text-slate-500 font-bold block">Candidate Instructions:</span>
                        <p className="font-medium text-slate-700 mt-0.5 italic">
                          {currentApp.visitNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Orientation Report / Decision Card */}
                {currentApp.visitReport && (
                  <div
                    className={`border rounded-2xl p-5 space-y-3 ${
                      currentApp.applicationStatus === 'Approved'
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-rose-50/60 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-extrabold text-xs text-slate-900">
                        <FileText className="w-4 h-4 text-[#237737]" />
                        Official Orientation Assessment Report
                      </div>
                      <span className="text-[11px] font-bold text-slate-500">
                        Evaluated on{' '}
                        {currentApp.visitReportDate
                          ? new Date(currentApp.visitReportDate).toLocaleDateString('en-IN')
                          : 'Recently'}
                      </span>
                    </div>

                    {currentApp.visitChecks && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <span
                          className={`p-2 rounded-xl font-bold ${
                            currentApp.visitChecks.identityVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {currentApp.visitChecks.identityVerified
                            ? '✓ ID Verified'
                            : '— ID Pending'}
                        </span>
                        <span
                          className={`p-2 rounded-xl font-bold ${
                            currentApp.visitChecks.animalHandlingReady
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {currentApp.visitChecks.animalHandlingReady
                            ? '✓ Handling Ready'
                            : '— Handling'}
                        </span>
                        <span
                          className={`p-2 rounded-xl font-bold ${
                            currentApp.visitChecks.safetyOrientationDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {currentApp.visitChecks.safetyOrientationDone
                            ? '✓ Safety Briefed'
                            : '— Safety'}
                        </span>
                        <span
                          className={`p-2 rounded-xl font-bold ${
                            currentApp.visitChecks.commitmentAgreement
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {currentApp.visitChecks.commitmentAgreement
                            ? '✓ Pledge Signed'
                            : '— Pledge'}
                        </span>
                      </div>
                    )}

                    <p className="text-xs font-medium text-slate-800 bg-white p-3 rounded-xl border border-slate-200">
                      {currentApp.visitReport}
                    </p>
                  </div>
                )}

                {/* Candidate Overview Data */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-[#F8FAF9] p-4 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">District</span>
                    <p className="font-bold text-slate-800 mt-0.5">{currentApp.district}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Availability</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {Array.isArray(currentApp.availability)
                        ? currentApp.availability.join(', ')
                        : currentApp.availability}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Vehicle & Mobility
                    </span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {currentApp.hasVehicle
                        ? `${currentApp.vehicleNumber || 'Yes'} (${currentApp.vehicleType})`
                        : 'No Vehicle'}
                    </p>
                  </div>
                  <div className="sm:col-span-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Registered Service Interests
                    </span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {Array.isArray(currentApp.interests)
                        ? currentApp.interests.join(' • ')
                        : currentApp.interests}
                    </p>
                  </div>
                </div>
              </div>

              {/* Certified Official Volunteer Card if Approved */}
              {currentApp.applicationStatus === 'Approved' && (
                <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 to-[#237737] rounded-3xl p-6 text-white shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/20 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black">
                        <Sparkles className="w-6 h-6 text-emerald-200" />
                      </div>
                      <div>
                        <span className="text-[11px] font-extrabold uppercase text-emerald-200 tracking-wider">
                          Official Volunteer Credential
                        </span>
                        <h3 className="text-xl font-black text-white">{currentApp.fullName}</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-200 block uppercase">
                        Badge ID
                      </span>
                      <span className="text-lg font-black tracking-widest font-mono">
                        {currentApp.volunteerId || 'VOL-0001'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-emerald-100">
                    <div>
                      <span className="text-[10px] text-white/70 block uppercase">District</span>
                      <p className="font-extrabold text-white">{currentApp.district}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/70 block uppercase">Status</span>
                      <p className="font-extrabold text-emerald-300">Active & Certified</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/70 block uppercase">Verified</span>
                      <p className="font-extrabold text-white">Orientation Passed</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VolunteerRegister;
