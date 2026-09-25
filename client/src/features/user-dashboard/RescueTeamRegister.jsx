import React, { useState, useEffect } from 'react';
import {
  Truck,
  ClipboardList,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Shield,
  ShieldCheck,
  Navigation,
  FileText,
  Calendar,
  Check,
  ChevronRight,
  Phone,
  Mail,
  Users,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  submitRescueTeamApplication,
  getMyRescueTeamApplication,
} from '../../services/rescueTeamService';
import {
  rescueTeamApplicationSchema,
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

const STANDARD_EQUIPMENT = [
  'First Aid & Trauma Kit',
  'Animal Stretcher / Transfer Net',
  'Secure Transport Crates / Cages',
  'Handling Gloves & Catch Pole',
  'Water & Hydration Supplies',
  'High-Visibility Safety Vests & Flashlights',
];

const RescueTeamRegister = ({ onApplicationSubmitted, onRequireProfile, onNavigateToProfile }) => {
  const { user } = useAuth();
  const profileStatus = checkProfileCompletion(user);

  // Active view tab ('form' | 'status')
  const [viewTab, setViewTab] = useState('form');

  // Application data
  const [currentApp, setCurrentApp] = useState(null);
  const [applicationsList, setApplicationsList] = useState([]);
  const [rescueTeam, setRescueTeam] = useState(null);
  const [loadingApp, setLoadingApp] = useState(false);

  // Form states
  const [teamName, setTeamName] = useState('');
  const [teamLeadName, setTeamLeadName] = useState(user?.fullName || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phoneNumber || '');
  const [operatingDistrict, setOperatingDistrict] = useState('Ernakulam');
  const [coverageZone, setCoverageZone] = useState('');
  const [vehicleType, setVehicleType] = useState('Van');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [totalMembers, setTotalMembers] = useState('3');
  const [equipmentList, setEquipmentList] = useState([
    'First Aid & Trauma Kit',
    'Secure Transport Crates / Cages',
    'Handling Gloves & Catch Pole',
  ]);
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [notes, setNotes] = useState('');

  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleBlurField = (fieldName, val) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    let err = '';
    if (fieldName === 'teamName') {
      if (!val || val.trim().length < 3) err = 'Team name must be at least 3 characters';
    } else if (fieldName === 'teamLeadName') {
      err = validateField(null, 'teamLeadName', val);
    } else if (fieldName === 'contactEmail') {
      err = validateField(null, 'email', val);
    } else if (fieldName === 'contactPhone') {
      err = validateField(null, 'phone', val);
    } else if (fieldName === 'operatingDistrict') {
      err = validateField(null, 'district', val);
    } else if (fieldName === 'coverageZone') {
      if (!val || val.trim().length < 3) err = 'Coverage zone must be at least 3 characters';
    } else if (fieldName === 'vehicleNumber') {
      err = validateField(null, 'vehicleNumber', val);
    } else if (fieldName === 'totalMembers') {
      const num = Number(val);
      if (isNaN(num) || num < 1) err = 'Total members must be at least 1';
    } else if (fieldName === 'address') {
      err = validateField(null, 'address', val);
    }
    setFieldErrors((prev) => ({ ...prev, [fieldName]: err }));
  };

  // Load user's application
  const loadApplication = async () => {
    setLoadingApp(true);
    try {
      const res = await getMyRescueTeamApplication();
      if (res.success) {
        setCurrentApp(res.application || null);
        setApplicationsList(res.applications || []);
        setRescueTeam(res.rescueTeam || null);
        if (res.application && viewTab === 'form' && !formSuccess) {
          // If already has an application, default to status tab
          setViewTab('status');
        }
      }
    } catch (err) {
      console.warn('Failed to load rescue team application:', err.message);
    } finally {
      setLoadingApp(false);
    }
  };

  useEffect(() => {
    loadApplication();
  }, []);

  // Update contact details if user auth resolves
  useEffect(() => {
    if (user?.fullName && !teamLeadName) setTeamLeadName(user.fullName);
    if (user?.email && !contactEmail) setContactEmail(user.email);
    if (user?.phoneNumber && !contactPhone) setContactPhone(user.phoneNumber);
  }, [user]);

  // GPS auto-locate
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      (err) => {
        alert('Could not retrieve location: ' + err.message);
        setLocating(false);
      }
    );
  };

  const handleToggleEquipment = (eq) => {
    setEquipmentList((prev) =>
      prev.includes(eq) ? prev.filter((item) => item !== eq) : [...prev, eq]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!profileStatus.isComplete) {
      if (onRequireProfile) {
        onRequireProfile('Register Rescue Team');
      }
      return;
    }

    const payload = {
      teamName: teamName.trim(),
      teamLeadName: teamLeadName.trim(),
      contactEmail: contactEmail.trim().toLowerCase(),
      contactPhone: contactPhone.trim(),
      operatingDistrict,
      coverageZone: coverageZone.trim(),
      vehicleType,
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      totalMembers: Number(totalMembers) || 0,
      equipment: equipmentList,
      address: address.trim(),
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      notes: notes.trim(),
    };

    const valResult = rescueTeamApplicationSchema.safeParse(payload);
    if (!valResult.success) {
      const { errors } = extractZodErrors(valResult);
      setFieldErrors(errors);
      setTouched({
        teamName: true,
        teamLeadName: true,
        contactEmail: true,
        contactPhone: true,
        operatingDistrict: true,
        coverageZone: true,
        vehicleType: true,
        vehicleNumber: true,
        totalMembers: true,
        equipment: true,
        address: true,
      });
      const firstMsg = Object.values(errors)[0] || 'Please fix all field validation errors before submitting.';
      setFormError(firstMsg);
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitRescueTeamApplication(payload);

      if (res.success) {
        setFormSuccess('Rescue Team application submitted successfully! Admin valuation pending.');
        setCurrentApp(res.application);
        setApplicationsList((prev) => [res.application, ...prev]);
        setViewTab('status');
        if (onApplicationSubmitted) onApplicationSubmitted();
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Failed to submit application. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header & Tab Navigation ── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/50">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Rescue Team Registration
                </h2>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">
                  Rapid Response
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-semibold mt-1">
                Register your emergency rescue squad. Admins will conduct an on-site inspection of your response vehicle and gear before certification.
              </p>
            </div>
          </div>

          {/* Sub-tab pills */}
          <div className="flex items-center gap-2 bg-[#F8FAF9] p-1.5 rounded-2xl border border-slate-200/70 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setViewTab('form')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewTab === 'form'
                  ? 'bg-[#237737] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Register Team
            </button>
            <button
              type="button"
              onClick={() => setViewTab('status')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer relative ${
                viewTab === 'status'
                  ? 'bg-[#237737] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              My Application Status
              {currentApp && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentApp.applicationStatus === 'Approved'
                      ? 'bg-emerald-400'
                      : currentApp.applicationStatus === 'Team Visit'
                      ? 'bg-blue-400 animate-pulse'
                      : currentApp.applicationStatus === 'Rejected'
                      ? 'bg-rose-400'
                      : 'bg-amber-400'
                  }`}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Active View Content ── */}
      {viewTab === 'form' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* If already has an approved team, show congratulations notice */}
          {currentApp?.applicationStatus === 'Approved' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-sm">
                  You are a certified Rescue Team!
                </p>
                <p className="text-emerald-700 mt-0.5">
                  Your squad "{currentApp.teamName}" is officially active ({rescueTeam?.teamId || 'RT-0001'}). You can review your certified credentials in the <strong>My Application Status</strong> tab.
                </p>
              </div>
            </div>
          )}

          {/* If application is under review or visit */}
          {currentApp && currentApp.applicationStatus !== 'Approved' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-blue-900">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  You already have an active application (<strong>{currentApp.rescueTeamApplicationId}</strong>) with status: <strong>{currentApp.applicationStatus}</strong>.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewTab('status')}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition cursor-pointer shrink-0"
              >
                Track Status →
              </button>
            </div>
          )}

          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Rescue Squad & Vehicle Details
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Please provide authentic details about your rescue team, response vehicle, and field equipment.
            </p>
          </div>

          {/* Mandatory Profile Incomplete Warning Card */}
          {!profileStatus.isComplete && (
            <ProfileRequiredCard
              user={user}
              onNavigateToProfile={onNavigateToProfile}
              actionName="register a rescue team"
            />
          )}

          {formError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-700 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              {formSuccess}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Identity & Lead */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Rescue Team / Squad Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => {
                    setTeamName(e.target.value);
                    if (touched.teamName) handleBlurField('teamName', e.target.value);
                  }}
                  onBlur={() => handleBlurField('teamName', teamName)}
                  placeholder="e.g. Ernakulam Animal Emergency Responders"
                  className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] transition ${
                    fieldErrors.teamName && touched.teamName
                      ? 'border-rose-400 bg-rose-50/20'
                      : 'border-slate-200'
                  }`}
                />
                {fieldErrors.teamName && touched.teamName && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{fieldErrors.teamName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Team Leader / Primary Handler <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={teamLeadName}
                  onChange={(e) => {
                    setTeamLeadName(e.target.value);
                    if (touched.teamLeadName) handleBlurField('teamLeadName', e.target.value);
                  }}
                  onBlur={() => handleBlurField('teamLeadName', teamLeadName)}
                  placeholder="e.g. Rahul Nair"
                  className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] transition ${
                    fieldErrors.teamLeadName && touched.teamLeadName
                      ? 'border-rose-400 bg-rose-50/20'
                      : 'border-slate-200'
                  }`}
                />
                {fieldErrors.teamLeadName && touched.teamLeadName && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{fieldErrors.teamLeadName}</p>
                )}
              </div>
            </div>

            {/* 2. Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Emergency Contact Phone <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={contactPhone}
                    maxLength={10}
                    onChange={(e) => {
                      setContactPhone(e.target.value);
                      if (touched.contactPhone) handleBlurField('contactPhone', e.target.value);
                    }}
                    onBlur={() => handleBlurField('contactPhone', contactPhone)}
                    placeholder="e.g. 9876543210"
                    className={`w-full pl-10 pr-4 py-2.5 bg-[#F8FAF9] border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] transition ${
                      fieldErrors.contactPhone && touched.contactPhone
                        ? 'border-rose-400 bg-rose-50/20'
                        : 'border-slate-200'
                    }`}
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
                {fieldErrors.contactPhone && touched.contactPhone && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{fieldErrors.contactPhone}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Official Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => {
                      setContactEmail(e.target.value);
                      if (touched.contactEmail) handleBlurField('contactEmail', e.target.value);
                    }}
                    onBlur={() => handleBlurField('contactEmail', contactEmail)}
                    placeholder="e.g. rescue@resqnet.org"
                    className={`w-full pl-10 pr-4 py-2.5 bg-[#F8FAF9] border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] transition ${
                      fieldErrors.contactEmail && touched.contactEmail
                        ? 'border-rose-400 bg-rose-50/20'
                        : 'border-slate-200'
                    }`}
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
                {fieldErrors.contactEmail && touched.contactEmail && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{fieldErrors.contactEmail}</p>
                )}
              </div>
            </div>

            {/* 3. Coverage & Territory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Operating District <span className="text-rose-500">*</span>
                </label>
                <select
                  value={operatingDistrict}
                  onChange={(e) => {
                    setOperatingDistrict(e.target.value);
                    if (touched.operatingDistrict) handleBlurField('operatingDistrict', e.target.value);
                  }}
                  onBlur={() => handleBlurField('operatingDistrict', operatingDistrict)}
                  className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] cursor-pointer ${
                    fieldErrors.operatingDistrict && touched.operatingDistrict
                      ? 'border-rose-400 bg-rose-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  {KERALA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {fieldErrors.operatingDistrict && touched.operatingDistrict && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{fieldErrors.operatingDistrict}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Primary Coverage Zone / Key Town <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={coverageZone}
                  onChange={(e) => {
                    setCoverageZone(e.target.value);
                    if (touched.coverageZone) handleBlurField('coverageZone', e.target.value);
                  }}
                  onBlur={() => handleBlurField('coverageZone', coverageZone)}
                  placeholder="e.g. Kakkanad, Aluva & Edappally Belt"
                  className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] ${
                    fieldErrors.coverageZone && touched.coverageZone
                      ? 'border-rose-400 bg-rose-50/20'
                      : 'border-slate-200'
                  }`}
                />
                {fieldErrors.coverageZone && touched.coverageZone && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{fieldErrors.coverageZone}</p>
                )}
              </div>
            </div>

            {/* 4. Vehicle Specifications */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Dedicated Rescue Vehicle
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Vehicle Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
                  >
                    <option value="Van">Van (Recommended)</option>
                    <option value="Ambulance">Animal Ambulance</option>
                    <option value="Car">Car / SUV</option>
                    <option value="Bike">Rescue Two-Wheeler</option>
                    <option value="Other">Other Vehicle</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Vehicle Reg. Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => {
                      setVehicleNumber(e.target.value.toUpperCase());
                      if (touched.vehicleNumber) handleBlurField('vehicleNumber', e.target.value.toUpperCase());
                    }}
                    onBlur={() => handleBlurField('vehicleNumber', vehicleNumber)}
                    placeholder="e.g. KL-07-CD-1234"
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-semibold uppercase tracking-wide focus:outline-none focus:border-[#237737] ${
                      fieldErrors.vehicleNumber && touched.vehicleNumber
                        ? 'border-rose-400 bg-rose-50/20'
                        : 'border-slate-200'
                    }`}
                  />
                  {fieldErrors.vehicleNumber && touched.vehicleNumber && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">{fieldErrors.vehicleNumber}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Active Responders Count <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={totalMembers}
                    onChange={(e) => {
                      setTotalMembers(e.target.value);
                      if (touched.totalMembers) handleBlurField('totalMembers', e.target.value);
                    }}
                    onBlur={() => handleBlurField('totalMembers', totalMembers)}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] ${
                      fieldErrors.totalMembers && touched.totalMembers
                        ? 'border-rose-400 bg-rose-50/20'
                        : 'border-slate-200'
                    }`}
                  />
                  {fieldErrors.totalMembers && touched.totalMembers && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">{fieldErrors.totalMembers}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 5. Equipment Checklist */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#237737]" />
                Available Rescue & First-Aid Gear (Inspected during Team Visit) <span className="text-rose-500">*</span>
              </label>
              {fieldErrors.equipment && touched.equipment && (
                <p className="text-[11px] text-rose-500 font-semibold">{fieldErrors.equipment}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STANDARD_EQUIPMENT.map((item) => {
                  const isChecked = equipmentList.includes(item);
                  return (
                    <div
                      key={item}
                      onClick={() => handleToggleEquipment(item)}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                        isChecked
                          ? 'bg-emerald-50/80 border-emerald-400 text-emerald-900'
                          : 'bg-[#F8FAF9] border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span>{item}</span>
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center ${
                          isChecked ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 6. Base Location & GPS */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Base Station Address / Parking Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (touched.address) handleBlurField('address', e.target.value);
                  }}
                  onBlur={() => handleBlurField('address', address)}
                  placeholder="e.g. Near Civil Station, Kakkanad, Ernakulam"
                  className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] ${
                    fieldErrors.address && touched.address
                      ? 'border-rose-400 bg-rose-50/20'
                      : 'border-slate-200'
                  }`}
                />
                {fieldErrors.address && touched.address && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{fieldErrors.address}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="grid grid-cols-2 gap-3 w-full sm:w-2/3">
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="Latitude (e.g. 9.9816)"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
                  />
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="Longitude (e.g. 76.2999)"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locating}
                  className="w-full sm:w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
                  {locating ? 'Detecting…' : 'Detect GPS'}
                </button>
              </div>
            </div>

            {/* 7. Additional Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Additional Operational Capabilities & Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                placeholder="Mention past rescue experience, veterinary tie-ups, flood rescue boat availability, 24/7 night coverage, etc."
                className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] resize-none"
              ></textarea>
            </div>

            {/* Mandatory Inspection Notice */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-sm">
                  Mandatory Admin Team Visit & Inspection
                </p>
                <p className="text-amber-800 mt-0.5 leading-relaxed">
                  Upon submitting this registration, ResQNet administrators will review your application and schedule a physical valuation visit. An assigned inspector will verify your response vehicle, safety equipment, and team readiness before granting certification.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              {!profileStatus.isComplete && (
                <p className="text-xs text-amber-700 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  Profile details must be updated before registering.
                </p>
              )}
              <button
                type={profileStatus.isComplete ? 'submit' : 'button'}
                onClick={(e) => {
                  if (!profileStatus.isComplete) {
                    e.preventDefault();
                    if (onRequireProfile) {
                      onRequireProfile('Register Rescue Team');
                    }
                  }
                }}
                disabled={submitting}
                className={`w-full sm:w-auto px-8 py-3 text-white font-black text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${
                  profileStatus.isComplete
                    ? 'bg-[#237737] hover:bg-[#1b5e2b] shadow-[#237737]/20 ml-auto'
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20 ml-auto'
                }`}
              >
                {submitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" /> Submitting Application…
                  </>
                ) : profileStatus.isComplete ? (
                  <>
                    <Check className="w-4 h-4" /> Submit Rescue Team Application
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" /> Complete Profile to Register Team
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Status / History Tab ── */}
      {viewTab === 'status' && (
        <div className="space-y-6">
          {loadingApp ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#237737]" />
              <p className="text-xs font-bold mt-2">Loading application status…</p>
            </div>
          ) : !currentApp ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">No Application Submitted Yet</h3>
              <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
                Register your team to respond to emergency animal distress calls and receive certified rescue alerts.
              </p>
              <button
                type="button"
                onClick={() => setViewTab('form')}
                className="px-5 py-2.5 bg-[#237737] text-white rounded-xl font-bold text-xs hover:bg-[#1b5e2b] transition cursor-pointer"
              >
                Register a Rescue Squad Now
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Application Banner */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">Application</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-xs font-black rounded-md">
                        #{currentApp.rescueTeamApplicationId}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mt-1">
                      {currentApp.teamName}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      Lead: {currentApp.teamLeadName} • {currentApp.operatingDistrict} • Submitted on{' '}
                      {new Date(currentApp.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span
                      className={`px-3.5 py-1.5 rounded-full text-xs font-black border flex items-center gap-1.5 ${
                        currentApp.applicationStatus === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : currentApp.applicationStatus === 'Team Visit'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                          : currentApp.applicationStatus === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {currentApp.applicationStatus === 'Approved' && <CheckCircle className="w-3.5 h-3.5" />}
                      {currentApp.applicationStatus === 'Team Visit' && <Calendar className="w-3.5 h-3.5" />}
                      {currentApp.applicationStatus === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                      {currentApp.applicationStatus === 'Rejected' && <AlertCircle className="w-3.5 h-3.5" />}
                      {currentApp.applicationStatus}
                    </span>
                  </div>
                </div>

                {/* ── Visual Journey Stepper ── */}
                <div className="pt-6">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
                    Valuation & Certification Progress
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Step 1 */}
                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1">
                      <div className="flex items-center gap-2 text-emerald-700 font-black text-xs">
                        <CheckCircle className="w-4 h-4" />
                        <span>1. Application Received</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                        Vehicle {currentApp.vehicleNumber} ({currentApp.vehicleType}) registered.
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div
                      className={`p-4 rounded-2xl border space-y-1 ${
                        currentApp.applicationStatus === 'Team Visit' ||
                        currentApp.applicationStatus === 'Approved' ||
                        currentApp.applicationStatus === 'Rejected'
                          ? 'bg-blue-50/50 border-blue-200'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-blue-700 font-black text-xs">
                        <Calendar className="w-4 h-4" />
                        <span>2. Admin Team Visit</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                        {currentApp.teamVisitScheduleDate ? (
                          <>
                            Scheduled for{' '}
                            <strong>
                              {new Date(currentApp.teamVisitScheduleDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </strong>{' '}
                            ({currentApp.teamVisitValuationPeriod || 'Standard Window'})
                          </>
                        ) : (
                          'Awaiting scheduling by ResQNet Field Inspector'
                        )}
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div
                      className={`p-4 rounded-2xl border space-y-1 ${
                        currentApp.applicationStatus === 'Approved'
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : currentApp.applicationStatus === 'Rejected'
                          ? 'bg-rose-50/50 border-rose-200'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div
                        className={`flex items-center gap-2 font-black text-xs ${
                          currentApp.applicationStatus === 'Approved'
                            ? 'text-emerald-700'
                            : currentApp.applicationStatus === 'Rejected'
                            ? 'text-rose-700'
                            : 'text-slate-500'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>3. Decision & Certification</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                        {currentApp.applicationStatus === 'Approved'
                          ? 'Certified! Responder Role Activated.'
                          : currentApp.applicationStatus === 'Rejected'
                          ? 'Application Not Approved. Review report findings.'
                          : 'Audit report and Pass/Fail evaluation pending.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scheduled Team Visit Details Card (If active) */}
              {currentApp.applicationStatus === 'Team Visit' && (
                <div className="bg-blue-50/70 border border-blue-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-blue-950">
                        Physical Team Visit & Valuation Scheduled
                      </h4>
                      <p className="text-xs text-blue-800 font-semibold">
                        ResQNet field inspector will audit your equipment and vehicle roadworthiness.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-4 rounded-2xl border border-blue-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Valuation Date</span>
                      <p className="font-extrabold text-slate-900 mt-0.5">
                        {currentApp.teamVisitScheduleDate
                          ? new Date(currentApp.teamVisitScheduleDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : 'TBD'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Time Window</span>
                      <p className="font-extrabold text-slate-900 mt-0.5">
                        {currentApp.teamVisitValuationPeriod || 'Standard Valuation Window'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Auditor</span>
                      <p className="font-extrabold text-slate-900 mt-0.5">
                        {currentApp.teamVisitInspector || 'Admin Field Officer'}
                      </p>
                    </div>
                  </div>

                  {currentApp.teamVisitNotes && (
                    <div className="text-xs bg-blue-100/50 p-3.5 rounded-xl text-blue-900">
                      <span className="font-bold">Inspector Guidelines: </span>
                      {currentApp.teamVisitNotes}
                    </div>
                  )}
                </div>
              )}

              {/* Inspection Report Findings (If filed) */}
              {currentApp.teamVisitReport && (
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <h4 className="text-sm font-black text-slate-900">
                        Official Inspection & Valuation Report
                      </h4>
                    </div>
                    {currentApp.teamVisitReportDate && (
                      <span className="text-xs text-slate-400 font-semibold">
                        Filed on {new Date(currentApp.teamVisitReportDate).toLocaleDateString('en-IN')}
                      </span>
                    )}
                  </div>

                  {/* Checklist Summary */}
                  {currentApp.teamVisitChecks && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {[
                        { label: 'Vehicle Safe', val: currentApp.teamVisitChecks.vehicleVerified },
                        { label: 'Gear Verified', val: currentApp.teamVisitChecks.equipmentVerified },
                        { label: 'Responders Ready', val: currentApp.teamVisitChecks.membersVerified },
                        { label: 'Safety Compliant', val: currentApp.teamVisitChecks.safetyCompliance },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={`p-2.5 rounded-xl border text-center font-bold ${
                            item.val
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}
                        >
                          <span className="text-[10px] block">{item.label}</span>
                          <span className="text-xs">{item.val ? '✓ Verified' : '—'}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-4 bg-[#F8FAF9] border border-slate-200/70 rounded-2xl text-xs text-slate-800 leading-relaxed font-medium">
                    {currentApp.teamVisitReport}
                  </div>
                </div>
              )}

              {/* Approved Rescue Team Active Credentials Card */}
              {currentApp.applicationStatus === 'Approved' && (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-emerald-950">
                        Active Rescue Team Credentials
                      </h4>
                      <p className="text-xs text-emerald-800 font-semibold">
                        You are active and dispatched for emergency animal distress calls in your district.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-emerald-100 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Team ID</span>
                      <p className="font-extrabold text-slate-900 mt-0.5">
                        {rescueTeam?.teamId || 'RT-0001'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Rescue Number</span>
                      <p className="font-extrabold text-blue-600 mt-0.5">
                        {rescueTeam?.rescueTeamNumber || 'RTN001'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Vehicle</span>
                      <p className="font-extrabold text-slate-900 mt-0.5">
                        {rescueTeam?.vehicleNumber || currentApp.vehicleNumber}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Dispatch District</span>
                      <p className="font-extrabold text-slate-900 mt-0.5">
                        {rescueTeam?.operatingDistrict || currentApp.operatingDistrict}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RescueTeamRegister;
