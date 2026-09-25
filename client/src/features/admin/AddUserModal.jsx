import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Check,
  Eye,
  EyeOff,
  Key,
  Copy,
  Sparkles,
  Building,
  Truck,
  User,
  MapPin,
  Phone,
  Mail,
  Stethoscope,
  ShieldCheck,
  Award,
} from 'lucide-react';
import {
  adminAddUserSchema,
  extractZodErrors,
  validateField,
} from '../../utils/validationSchemas';
import { getAllShelters } from '../../services/shelterService';

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

const STANDARD_EQUIPMENT_OPTIONS = [
  'First Aid & Trauma Kit',
  'Animal Stretcher / Transfer Net',
  'Secure Transport Crates',
  'Handling Gloves & Catch Pole',
  'High-Visibility Safety Vests',
  'Water & Hydration Supplies',
];

const ROLES_CONFIG = [
  {
    id: 'Public User',
    label: 'Public User',
    description: 'Citizen reporter & pet adopter',
    icon: User,
  },
  {
    id: 'Rescue Team',
    label: 'Rescue Team',
    description: 'Emergency response & squad fleet',
    icon: Truck,
  },
  {
    id: 'Shelter',
    label: 'Shelter',
    description: 'Animal care facility & housing',
    icon: Building,
  },
  {
    id: 'Veterinary Staff',
    label: 'Veterinary Staff',
    description: 'Clinical doctor or triage nurse',
    icon: Stethoscope,
  },
];

const AddUserModal = ({
  isOpen,
  onClose,
  handleCreateUser,
  addUserSubmitting = false,
  addUserError = '',
  addUserSuccess = '',
  sheltersList = [],
  // Legacy prop support
  newUserName,
  setNewUserName,
  newUserEmail,
  setNewUserEmail,
  newUserPhone,
  setNewUserPhone,
  newUserPassword,
  setNewUserPassword,
  newUserRole,
  setNewUserRole,
}) => {
  // Form State
  const [formData, setFormData] = useState({
    // Core Mandatory Credentials
    fullName: newUserName || '',
    email: newUserEmail || '',
    phoneNumber: newUserPhone || '',
    password: newUserPassword || '',
    role: newUserRole && newUserRole !== 'Admin' ? newUserRole : 'Public User',
    status: 'Active',
    isEmailVerified: true,
    isPhoneVerified: true,

    // Common Address
    city: '',
    district: 'Ernakulam',
    state: 'Kerala',
    pincode: '',
    address: '',
    dob: '',

    // Rescue Team Fields
    teamName: '',
    vehicleType: 'Van',
    vehicleNumber: '',
    operatingDistrict: 'Ernakulam',
    coverageZone: '',
    totalMembers: 4,
    equipment: [
      'First Aid & Trauma Kit',
      'Animal Stretcher / Transfer Net',
      'Secure Transport Crates',
    ],
    availability: 'Available',

    // Shelter Fields
    shelterName: '',
    registrationType: 'STATE_TRUST_SOCIETY',
    registrationNumber: '',
    shelterPhoneNumber: '',
    shelterEmail: '',
    totalStaffs: 4,
    totalCages: 15,
    occupiedCages: 0,
    shelterStatus: 'OPEN',

    // Veterinary Staff Fields
    shelterId: '',
    position: 'Veterinary Doctor',
    councilRegistrationNumber: '',
    qualification: 'BVSc & AH',
    specialization: 'General Practice',
    experience: 2,
    joiningDate: new Date().toISOString().split('T')[0],
  });

  const [availableShelters, setAvailableShelters] = useState(sheltersList || []);
  const [sheltersLoading, setSheltersLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Sync available shelters if passed as prop or fetch directly
  useEffect(() => {
    if (sheltersList && sheltersList.length > 0) {
      setAvailableShelters(sheltersList);
      if (!formData.shelterId && sheltersList[0]?._id) {
        setFormData((prev) => ({ ...prev, shelterId: sheltersList[0]._id }));
      }
    } else if (isOpen) {
      const fetchShelters = async () => {
        try {
          setSheltersLoading(true);
          const res = await getAllShelters({ status: 'Active' });
          if (res?.shelters && res.shelters.length > 0) {
            setAvailableShelters(res.shelters);
            if (!formData.shelterId) {
              setFormData((prev) => ({ ...prev, shelterId: res.shelters[0]._id }));
            }
          }
        } catch (err) {
          console.warn('Could not load shelters list for dropdown:', err.message);
        } finally {
          setSheltersLoading(false);
        }
      };
      fetchShelters();
    }
  }, [isOpen, sheltersList]);

  // Generate strong temporary password
  const generateTemporaryPassword = () => {
    const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowers = 'abcdefghijkmnopqrstuvwxyz';
    const digits = '23456789';
    const symbols = '!@#$%^&*';

    let pass = '';
    pass += uppers[Math.floor(Math.random() * uppers.length)];
    pass += lowers[Math.floor(Math.random() * lowers.length)];
    pass += digits[Math.floor(Math.random() * digits.length)];
    pass += symbols[Math.floor(Math.random() * symbols.length)];

    const allChars = uppers + lowers + digits + symbols;
    for (let i = 0; i < 6; i++) {
      pass += allChars[Math.floor(Math.random() * allChars.length)];
    }
    // Shuffle
    pass = pass.split('').sort(() => 0.5 - Math.random()).join('');

    handleFieldChange('password', pass);
    setShowPassword(true);
  };

  const handleCopyPassword = () => {
    if (!formData.password) return;
    navigator.clipboard.writeText(formData.password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  if (!isOpen) return null;

  const handleFieldChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // Sync legacy setters if passed
      if (field === 'fullName' && setNewUserName) setNewUserName(value);
      if (field === 'email' && setNewUserEmail) setNewUserEmail(value);
      if (field === 'phoneNumber' && setNewUserPhone) setNewUserPhone(value);
      if (field === 'password' && setNewUserPassword) setNewUserPassword(value);
      if (field === 'role' && setNewUserRole) setNewUserRole(value);
      return next;
    });

    if (touched[field]) {
      const err = validateField(adminAddUserSchema, field, value, formData);
      setFieldErrors((prev) => {
        const updated = { ...prev };
        if (err) updated[field] = err;
        else delete updated[field];
        return updated;
      });
    }
  };

  const handleBlurField = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(adminAddUserSchema, field, formData[field], formData);
    setFieldErrors((prev) => {
      const updated = { ...prev };
      if (err) updated[field] = err;
      else delete updated[field];
      return updated;
    });
  };

  const handleRoleChange = (roleId) => {
    handleFieldChange('role', roleId);
    setLocalError('');
    setFieldErrors((prev) => {
      const updated = { ...prev };
      if (roleId === 'Rescue Team' || roleId === 'Shelter') {
        delete updated.fullName;
      }
      return updated;
    });
  };

  const toggleEquipment = (item) => {
    setFormData((prev) => {
      const current = prev.equipment || [];
      const updated = current.includes(item)
        ? current.filter((x) => x !== item)
        : [...current, item];
      return { ...prev, equipment: updated };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');

    // For Rescue Team & Shelter: use teamName or shelterName as the account fullName
    const effectiveFullName =
      formData.role === 'Rescue Team'
        ? (formData.teamName || '').trim()
        : formData.role === 'Shelter'
        ? (formData.shelterName || '').trim()
        : (formData.fullName || '').trim();

    // Prepare validation payload
    const validationData = {
      fullName: effectiveFullName,
      email: (formData.email || '').trim().toLowerCase(),
      phoneNumber: (formData.phoneNumber || '').trim(),
      password: formData.password || '',
      role: formData.role || 'Public User',
      status: formData.status || 'Active',
      city: (formData.city || '').trim(),
      district: (formData.district || '').trim(),
      state: (formData.state || '').trim(),
      address: (formData.address || '').trim(),
      pincode: (formData.pincode || '').trim(),
      dob: formData.dob || '',

      // Role specific fields
      teamName: (formData.teamName || '').trim(),
      vehicleType: formData.vehicleType,
      vehicleNumber: (formData.vehicleNumber || '').trim().toUpperCase(),
      operatingDistrict: formData.operatingDistrict || formData.district,
      coverageZone: (formData.coverageZone || '').trim(),
      totalMembers: formData.totalMembers,
      equipment: formData.equipment || [],

      shelterName: (formData.shelterName || '').trim(),
      registrationType: formData.registrationType,
      registrationNumber: (formData.registrationNumber || '').trim().toUpperCase(),
      shelterPhoneNumber: formData.shelterPhoneNumber || formData.phoneNumber,
      shelterEmail: formData.shelterEmail || formData.email,
      totalStaffs: formData.totalStaffs,
      totalCages: formData.totalCages,
      occupiedCages: formData.occupiedCages,
      shelterStatus: formData.shelterStatus,

      shelterId: formData.shelterId,
      position: formData.position,
      councilRegistrationNumber: (formData.councilRegistrationNumber || '').trim().toUpperCase(),
      qualification: (formData.qualification || '').trim(),
      specialization: (formData.specialization || '').trim(),
      experience: formData.experience,
    };

    // Full schema validation using Zod
    const parseResult = adminAddUserSchema.safeParse(validationData);
    if (!parseResult.success) {
      const errs = extractZodErrors(parseResult.error);
      setFieldErrors(errs);

      // Mark all relevant fields as touched
      const touchedMap = {};
      Object.keys(validationData).forEach((k) => {
        touchedMap[k] = true;
      });
      setTouched(touchedMap);

      const firstErr = Object.values(errs)[0];
      setLocalError(firstErr || 'Please check the highlighted form errors before continuing.');
      return;
    }

    try {
      if (typeof handleCreateUser === 'function') {
        const res = await handleCreateUser(validationData);
        if (res && res.success) {
          setLocalSuccess(
            `Account for "${validationData.fullName}" provisioned successfully! Credentials and temporary password have been sent to ${validationData.email}.`
          );
          setTimeout(() => {
            onClose();
          }, 1600);
        }
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to create user account.';
      setLocalError(msg);
    }
  };

  const displayError = localError || addUserError;
  const displaySuccess = localSuccess || addUserSuccess;

  // Password requirements calculation
  const pass = formData.password || '';
  const passLength = pass.length >= 8;
  const passUpper = /[A-Z]/.test(pass);
  const passLower = /[a-z]/.test(pass);
  const passDigit = /[0-9]/.test(pass);
  const passSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full border border-slate-100 shadow-2xl my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#237737]/10 text-[#237737] flex items-center justify-center shadow-inner">
              <UserPlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">Provision New User Account</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#237737]/10 text-[#237737]">
                  Admin Direct
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                Create user with role-specific details & credentials emailed automatically
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {displayError && (
            <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-2xl border border-rose-200 flex items-center gap-2.5 shadow-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{displayError}</span>
            </div>
          )}

          {displaySuccess && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-200 flex items-center gap-2.5 shadow-xs">
              <CheckCircle className="w-4 h-4 shrink-0 text-[#237737]" />
              <span>{displaySuccess}</span>
            </div>
          )}

          <form id="admin-add-user-form" onSubmit={onSubmit} className="space-y-6">
            {/* Step 1: Select User Role (Admin excluded as requested) */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Select User Role <span className="text-rose-500">*</span></span>
                <span className="text-[11px] text-slate-400 font-normal lowercase">determines fields below</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {ROLES_CONFIG.map((role) => {
                  const Icon = role.icon;
                  const isSelected = formData.role === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleChange(role.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#237737] text-white border-[#237737] shadow-md shadow-[#237737]/20 ring-2 ring-[#237737]/20 -translate-y-0.5'
                          : 'bg-[#F8FAF9] border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center mb-1.5 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-extrabold leading-tight">
                        {role.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Primary Account Credentials */}
            <div className="bg-slate-50/70 border border-slate-100 rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-slate-800 border-b border-slate-200/70 pb-2">
                <ShieldCheck className="w-4 h-4 text-[#237737]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Primary Account & Access Information
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name: ONLY displayed for Public User and Veterinary Staff.
                    For Rescue Team & Shelter, teamName/shelterName is used directly! */}
                {(formData.role === 'Public User' || formData.role === 'Veterinary Staff') && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      {formData.role === 'Veterinary Staff' ? 'Doctor / Staff Full Name' : 'Full Name'}{' '}
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleFieldChange('fullName', e.target.value)}
                        onBlur={() => handleBlurField('fullName')}
                        placeholder={
                          formData.role === 'Veterinary Staff'
                            ? 'e.g. Dr. Anand Verma'
                            : 'e.g. Anand Verma'
                        }
                        required
                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition ${
                          fieldErrors.fullName && touched.fullName
                            ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                            : 'bg-white border border-slate-200 focus:border-[#237737]'
                        }`}
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    {fieldErrors.fullName && touched.fullName && (
                      <p className="text-[11px] text-rose-500 font-semibold mt-1">
                        {fieldErrors.fullName}
                      </p>
                    )}
                  </div>
                )}

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      onBlur={() => handleBlurField('email')}
                      placeholder="e.g. user@example.com"
                      required
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition ${
                        fieldErrors.email && touched.email
                          ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                          : 'bg-white border border-slate-200 focus:border-[#237737]'
                      }`}
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  {fieldErrors.email && touched.email && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-slate-500 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                      onBlur={() => handleBlurField('phoneNumber')}
                      placeholder="9876543210 (10 digits)"
                      required
                      className={`w-full pl-11 pr-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition ${
                        fieldErrors.phoneNumber && touched.phoneNumber
                          ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                          : 'bg-white border border-slate-200 focus:border-[#237737]'
                      }`}
                    />
                  </div>
                  {fieldErrors.phoneNumber && touched.phoneNumber && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">
                      {fieldErrors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Account Status */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Account Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
                  >
                    <option value="Active">Active (Immediate Access)</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                {/* Temporary Password */}
                <div className="space-y-1.5 sm:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-[#237737]" />
                      <span>Temporary Password <span className="text-rose-500">*</span></span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={generateTemporaryPassword}
                        className="text-[11px] font-bold text-[#237737] hover:text-[#1c622d] bg-[#237737]/10 hover:bg-[#237737]/15 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" /> Auto-Generate
                      </button>

                      {formData.password && (
                        <button
                          type="button"
                          onClick={handleCopyPassword}
                          className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                        >
                          {copiedPassword ? (
                            <>
                              <Check className="w-3 h-3 text-[#237737]" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleFieldChange('password', e.target.value)}
                      onBlur={() => handleBlurField('password')}
                      placeholder="Enter temporary password (min. 8 characters)"
                      required
                      className={`w-full pl-4 pr-11 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition ${
                        fieldErrors.password && touched.password
                          ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                          : 'bg-[#F8FAF9] border border-slate-200 focus:border-[#237737]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {fieldErrors.password && touched.password && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">
                      {fieldErrors.password}
                    </p>
                  )}

                  {/* Password Strength Checklist */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <span
                      className={`text-[10px] font-bold flex items-center gap-1 ${
                        passLength ? 'text-[#237737]' : 'text-slate-400'
                      }`}
                    >
                      <Check className={`w-3 h-3 ${passLength ? 'opacity-100' : 'opacity-30'}`} />
                      8+ characters
                    </span>
                    <span
                      className={`text-[10px] font-bold flex items-center gap-1 ${
                        passUpper && passLower ? 'text-[#237737]' : 'text-slate-400'
                      }`}
                    >
                      <Check className={`w-3 h-3 ${passUpper && passLower ? 'opacity-100' : 'opacity-30'}`} />
                      Upper & Lowercase
                    </span>
                    <span
                      className={`text-[10px] font-bold flex items-center gap-1 ${
                        passDigit ? 'text-[#237737]' : 'text-slate-400'
                      }`}
                    >
                      <Check className={`w-3 h-3 ${passDigit ? 'opacity-100' : 'opacity-30'}`} />
                      Number (0-9)
                    </span>
                    <span
                      className={`text-[10px] font-bold flex items-center gap-1 ${
                        passSpecial ? 'text-[#237737]' : 'text-slate-400'
                      }`}
                    >
                      <Check className={`w-3 h-3 ${passSpecial ? 'opacity-100' : 'opacity-30'}`} />
                      Symbol (!@#$)
                    </span>
                  </div>

                  <p className="text-[11px] text-[#237737] font-semibold flex items-center gap-1 mt-2">
                    <Mail className="w-3.5 h-3.5" />
                    <span>This temporary password will be automatically emailed to the user upon account provisioning.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Role-Specific Details Section */}
            {/* 3A: RESCUE TEAM SPECIFIC DETAILS */}
            {formData.role === 'Rescue Team' && (
              <div className="bg-emerald-50/40 border border-emerald-100 rounded-3xl p-5 space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-slate-800 border-b border-emerald-200/60 pb-2">
                  <Truck className="w-4 h-4 text-[#237737]" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#237737]">
                    Rescue Squad & Logistics Details
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Team Name is the Primary Name for Rescue Team */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      Rescue Team Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.teamName}
                      onChange={(e) => handleFieldChange('teamName', e.target.value)}
                      onBlur={() => handleBlurField('teamName')}
                      placeholder="e.g. Kochi Rapid Animal Rescue Squad"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition ${
                        fieldErrors.teamName && touched.teamName
                          ? 'border border-rose-400 bg-rose-50/20'
                          : 'bg-white border border-slate-200 focus:border-[#237737]'
                      }`}
                    />
                    {fieldErrors.teamName && touched.teamName && (
                      <p className="text-[11px] text-rose-500 font-semibold">{fieldErrors.teamName}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Operating District <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.operatingDistrict}
                      onChange={(e) => handleFieldChange('operatingDistrict', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
                    >
                      {KERALA_DISTRICTS.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Vehicle Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => handleFieldChange('vehicleType', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
                    >
                      <option value="Van">Rescue Van</option>
                      <option value="Ambulance">Animal Ambulance</option>
                      <option value="Bike">Emergency Response Bike</option>
                      <option value="Car">Patrol Car</option>
                      <option value="Other">Special Transport Unit</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Vehicle Registration Plate <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.vehicleNumber}
                      onChange={(e) => handleFieldChange('vehicleNumber', e.target.value.toUpperCase())}
                      onBlur={() => handleBlurField('vehicleNumber')}
                      placeholder="e.g. KL-07-AB-1234"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition uppercase ${
                        fieldErrors.vehicleNumber && touched.vehicleNumber
                          ? 'border border-rose-400 bg-rose-50/20'
                          : 'bg-white border border-slate-200 focus:border-[#237737]'
                      }`}
                    />
                    {fieldErrors.vehicleNumber && touched.vehicleNumber && (
                      <p className="text-[11px] text-rose-500 font-semibold">{fieldErrors.vehicleNumber}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Base Coverage Zone</label>
                    <input
                      type="text"
                      value={formData.coverageZone}
                      onChange={(e) => handleFieldChange('coverageZone', e.target.value)}
                      placeholder="e.g. Ernakulam Marine Drive & Edappally"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Active Squad Members</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.totalMembers}
                      onChange={(e) => handleFieldChange('totalMembers', parseInt(e.target.value) || 1)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
                    />
                  </div>

                  {/* Standard Equipment */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Equipped Gear & Supplies</label>
                    <div className="flex flex-wrap gap-1.5">
                      {STANDARD_EQUIPMENT_OPTIONS.map((item) => {
                        const isChecked = (formData.equipment || []).includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleEquipment(item)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              isChecked
                                ? 'bg-[#237737] text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <Check className={`w-3 h-3 ${isChecked ? 'opacity-100' : 'opacity-0'}`} />
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3B: SHELTER SPECIFIC DETAILS */}
            {formData.role === 'Shelter' && (
              <div className="bg-amber-50/40 border border-amber-100 rounded-3xl p-5 space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-slate-800 border-b border-amber-200/60 pb-2">
                  <Building className="w-4 h-4 text-amber-700" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-800">
                    Animal Shelter Facility Specifications
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Shelter Name is the Primary Name for Shelter */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      Shelter Facility Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.shelterName}
                      onChange={(e) => handleFieldChange('shelterName', e.target.value)}
                      onBlur={() => handleBlurField('shelterName')}
                      placeholder="e.g. Cochin Animal Care Shelter"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition ${
                        fieldErrors.shelterName && touched.shelterName
                          ? 'border border-rose-400 bg-rose-50/20'
                          : 'bg-white border border-slate-200 focus:border-amber-600'
                      }`}
                    />
                    {fieldErrors.shelterName && touched.shelterName && (
                      <p className="text-[11px] text-rose-500 font-semibold">{fieldErrors.shelterName}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Registration Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.registrationType}
                      onChange={(e) => handleFieldChange('registrationType', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-600 cursor-pointer"
                    >
                      <option value="STATE_TRUST_SOCIETY">State Trust / Society Act</option>
                      <option value="NGO_DARPAN">NITI Aayog NGO Darpan</option>
                      <option value="MCA_CIN">MCA Corporate CIN (Sec 8)</option>
                      <option value="NGO_PAN">Income Tax NGO PAN</option>
                      <option value="AWBI_ID">Animal Welfare Board of India (AWBI)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Registration Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.registrationNumber}
                      onChange={(e) => handleFieldChange('registrationNumber', e.target.value.toUpperCase())}
                      onBlur={() => handleBlurField('registrationNumber')}
                      placeholder="e.g. KL/2023/00142"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition uppercase ${
                        fieldErrors.registrationNumber && touched.registrationNumber
                          ? 'border border-rose-400 bg-rose-50/20'
                          : 'bg-white border border-slate-200 focus:border-amber-600'
                      }`}
                    />
                    {fieldErrors.registrationNumber && touched.registrationNumber && (
                      <p className="text-[11px] text-rose-500 font-semibold">{fieldErrors.registrationNumber}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Total Cage / Kennel Capacity</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.totalCages}
                      onChange={(e) => handleFieldChange('totalCages', parseInt(e.target.value) || 1)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Initial Occupied Cages</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.occupiedCages}
                      onChange={(e) => handleFieldChange('occupiedCages', parseInt(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Facility Operating Status</label>
                    <select
                      value={formData.shelterStatus}
                      onChange={(e) => handleFieldChange('shelterStatus', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-600 cursor-pointer"
                    >
                      <option value="OPEN">Open (Accepting Animals)</option>
                      <option value="FULL">Full (Max Capacity Reached)</option>
                      <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Staff Count</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.totalStaffs}
                      onChange={(e) => handleFieldChange('totalStaffs', parseInt(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3C: VETERINARY STAFF SPECIFIC DETAILS */}
            {formData.role === 'Veterinary Staff' && (
              <div className="bg-sky-50/40 border border-sky-100 rounded-3xl p-5 space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-slate-800 border-b border-sky-200/60 pb-2">
                  <Stethoscope className="w-4 h-4 text-sky-700" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-sky-800">
                    Veterinary Qualifications & Shelter Placement
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Position */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Staff Position <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => handleFieldChange('position', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-600 cursor-pointer"
                    >
                      <option value="Veterinary Doctor">Veterinary Doctor (Surgeon / Physician)</option>
                      <option value="Veterinary Nurse">Veterinary Nurse / Compounder</option>
                    </select>
                  </div>

                  {/* Assigned Shelter */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Assigned Shelter Facility <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.shelterId}
                      onChange={(e) => handleFieldChange('shelterId', e.target.value)}
                      onBlur={() => handleBlurField('shelterId')}
                      className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-600 cursor-pointer ${
                        fieldErrors.shelterId && touched.shelterId ? 'border-rose-400' : 'border-slate-200'
                      }`}
                    >
                      <option value="">-- Choose Assigned Shelter --</option>
                      {availableShelters.map((sh) => (
                        <option key={sh._id || sh.id} value={sh._id || sh.id}>
                          {sh.shelterName} ({sh.shelterNumber || 'Shelter'})
                        </option>
                      ))}
                    </select>
                    {fieldErrors.shelterId && touched.shelterId && (
                      <p className="text-[11px] text-rose-500 font-semibold">{fieldErrors.shelterId}</p>
                    )}
                  </div>

                  {/* Council Reg Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      State / National Council Reg No <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.councilRegistrationNumber}
                      onChange={(e) => handleFieldChange('councilRegistrationNumber', e.target.value.toUpperCase())}
                      onBlur={() => handleBlurField('councilRegistrationNumber')}
                      placeholder="e.g. KVC-88421 or VCI-5412"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition uppercase ${
                        fieldErrors.councilRegistrationNumber && touched.councilRegistrationNumber
                          ? 'border border-rose-400 bg-rose-50/20'
                          : 'bg-white border border-slate-200 focus:border-sky-600'
                      }`}
                    />
                    {fieldErrors.councilRegistrationNumber && touched.councilRegistrationNumber && (
                      <p className="text-[11px] text-rose-500 font-semibold">
                        {fieldErrors.councilRegistrationNumber}
                      </p>
                    )}
                  </div>

                  {/* Qualification */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Degree / Qualification <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.qualification}
                      onChange={(e) => handleFieldChange('qualification', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-600 cursor-pointer"
                    >
                      <option value="BVSc & AH">BVSc & AH (Bachelor of Veterinary Science)</option>
                      <option value="MVSc (Surgery)">MVSc - Veterinary Surgery & Radiology</option>
                      <option value="MVSc (Medicine)">MVSc - Veterinary Medicine</option>
                      <option value="DVM">DVM (Doctor of Veterinary Medicine)</option>
                      <option value="Diploma in Veterinary Nursing">Diploma in Veterinary Nursing</option>
                      <option value="Other">Other Certified Animal Health Degree</option>
                    </select>
                  </div>

                  {/* Specialization */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Clinical Specialization</label>
                    <select
                      value={formData.specialization}
                      onChange={(e) => handleFieldChange('specialization', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-600 cursor-pointer"
                    >
                      <option value="General Practice">General Small Animal Practice</option>
                      <option value="Small Animal Surgery">Soft Tissue & Orthopedic Surgery</option>
                      <option value="Emergency & Critical Care">Emergency & Trauma Triage</option>
                      <option value="Canine & Feline Medicine">Canine & Feline Internal Medicine</option>
                      <option value="Avian & Wildlife">Avian, Exotic & Wildlife Care</option>
                    </select>
                  </div>

                  {/* Experience */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Experience (Years)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.experience}
                      onChange={(e) => handleFieldChange('experience', parseInt(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-sky-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Geographic & Address Details */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-slate-800 border-b border-slate-200/60 pb-2">
                <MapPin className="w-4 h-4 text-[#237737]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Location & Address Information
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">City / Locality</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    placeholder="e.g. Kochi"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">District</label>
                  <select
                    value={formData.district}
                    onChange={(e) => handleFieldChange('district', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
                  >
                    {KERALA_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleFieldChange('state', e.target.value)}
                    placeholder="Kerala"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">PIN Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => handleFieldChange('pincode', e.target.value.replace(/\D/g, ''))}
                    onBlur={() => handleBlurField('pincode')}
                    placeholder="682001 (6 digits)"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition ${
                      fieldErrors.pincode && touched.pincode
                        ? 'border border-rose-400 bg-rose-50/20'
                        : 'bg-white border border-slate-200 focus:border-[#237737]'
                    }`}
                  />
                  {fieldErrors.pincode && touched.pincode && (
                    <p className="text-[11px] text-rose-500 font-semibold">{fieldErrors.pincode}</p>
                  )}
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Street Address</label>
                  <textarea
                    rows="2"
                    value={formData.address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    placeholder="House / building number, street, landmark..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="admin-add-user-form"
            disabled={addUserSubmitting}
            className="px-6 py-2.5 bg-[#237737] hover:bg-[#1d632e] disabled:opacity-50 text-white text-xs font-extrabold rounded-xl transition cursor-pointer shadow-md shadow-[#237737]/20 flex items-center gap-2"
          >
            {addUserSubmitting ? (
              <>
                <Clock className="w-4 h-4 animate-spin" /> Provisioning User…
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" /> Provision {formData.role}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
