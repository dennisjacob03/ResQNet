import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Camera,
  Edit3,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Lock,
  CheckCircle,
} from 'lucide-react';
import AddressForm from '../../components/address/AddressForm';
import { checkProfileCompletion } from '../../utils/profileUtils';
import { API_BASE_URL, getMediaUrl } from '../../config/api';

const Profile = ({ rescueReports = [], initialEditMode = false, onEditModeReset }) => {
  const {
    user,
    updateProfile,
    setupRecaptcha,
    sendPhoneOtp,
    verifyPhoneOtp,
  } = useAuth();

  // User Profile States
  const [profileName, setProfileName] = useState(user?.fullName || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phoneNumber || '');
  const [profilePicUrl, setProfilePicUrl] = useState(
    user?.profilePic ? getMediaUrl(user.profilePic) : ''
  );
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profileDob, setProfileDob] = useState(user?.dob ? user.dob.slice(0, 10) : '');
  const [profileAddress, setProfileAddress] = useState(user?.address || '');
  const [profileCity, setProfileCity] = useState(user?.city || '');
  const [profileDistrict, setProfileDistrict] = useState(user?.district || '');
  const [profileState, setProfileState] = useState(user?.state || '');
  const [profilePincode, setProfilePincode] = useState(user?.pincode || '');
  const [isEditing, setIsEditing] = useState(initialEditMode);

  // Sync initialEditMode prop if triggered from navigation
  useEffect(() => {
    if (initialEditMode) {
      setIsEditing(true);
    }
  }, [initialEditMode]);

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

  // Sync profile state when user is loaded asynchronously from backend / AuthContext
  useEffect(() => {
    if (user && !isEditing) {
      setProfileName(user.fullName || '');
      setProfileEmail(user.email || '');
      setProfilePhone(user.phoneNumber || '');
      setProfilePicUrl(
        user.profilePic ? getMediaUrl(user.profilePic) : ''
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

  // Change Password Handler
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
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('resqnet_token')}`,
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
    } catch {
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
        if (onEditModeReset) onEditModeReset();
        setProfileSuccess('Phone number verified and profile updated successfully! ✓');
      } else {
        setProfileError(updateRes.message || 'Failed to save profile updates.');
      }
    } catch {
      setProfileError('An unexpected error occurred while saving profile.');
    } finally {
      setPhoneVerifying(false);
    }
  };

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

  const handleSaveProfileDirect = async () => {
    setProfileError('');
    setProfileSuccess('');

    if (!validateAllProfileFields()) {
      setProfileError('Please fix the errors highlighted below before saving.');
      return;
    }

    const rawPhone = profilePhone.replace(/\D/g, '');

    if (user?.phoneNumber && rawPhone !== user.phoneNumber.replace(/\D/g, '')) {
      return handleSendProfilePhoneOtp();
    }

    setPhoneVerifying(true);
    try {
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
        if (onEditModeReset) onEditModeReset();
        setProfileSuccess('Profile updated successfully!');
      } else {
        setProfileError(updateRes.message || 'Failed to save profile updates.');
      }
    } catch {
      setProfileError('An unexpected error occurred while updating profile.');
    } finally {
      setPhoneVerifying(false);
    }
  };

  const profileStatus = checkProfileCompletion(user);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Invisible Firebase Recaptcha Container */}
      <div id="recaptcha-container-profile"></div>

      {/* Profile Incomplete Guidance Banner */}
      {!profileStatus.isComplete && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 border border-amber-300/60 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Profile Incomplete ({profileStatus.percentage}%)
                </h4>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 rounded-md">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                Please complete all required fields below (
                <span className="font-semibold text-slate-800">
                  {profileStatus.missingFields.slice(0, 3).join(', ')}
                  {profileStatus.missingFields.length > 3
                    ? ` and ${profileStatus.missingFields.length - 3} more`
                    : ''}
                </span>
                ) to enable rescue reporting and other dashboard actions.
              </p>
            </div>
          </div>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="self-start sm:self-center px-4.5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs shrink-0"
            >
              Edit Details Now
            </button>
          )}
        </div>
      )}

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
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {user?.fullName || profileName || 'Your Name'}
              </h2>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                {user?.role || 'Public User'}
                {user?.city || profileCity ? ` • ${user?.city || profileCity}` : ''}
                {user?.state || profileState ? `, ${user?.state || profileState}` : ''}
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
              if (onEditModeReset) onEditModeReset();
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

        {/* Status Messages */}
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
            <label className="text-xs font-bold text-slate-400">
              Full Name <span className="text-rose-600 font-bold">*</span>
            </label>
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
                setProfileFieldErrors((prev) => ({
                  ...prev,
                  fullName: validateProfileField('fullName', profileName),
                }));
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
                <Smartphone className="w-4 h-4 text-[#237737]" /> Phone Number{' '}
                <span className="text-rose-600 font-bold">*</span>
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
                    setProfileFieldErrors((prev) => ({
                      ...prev,
                      phone: validateProfileField('phone', profilePhone),
                    }));
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

            {isEditing && profileTouched.phone && profileFieldErrors.phone && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" /> {profileFieldErrors.phone}
              </p>
            )}

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
                setProfileFieldErrors((prev) => ({
                  ...prev,
                  dob: validateProfileField('dob', profileDob),
                }));
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
                  user?.profilePic ? getMediaUrl(user.profilePic) : ''
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
            <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-center shadow-sm">
              <div className="text-2xl font-black text-slate-900">{rescueReports.length}</div>
              <div className="text-[10px] text-slate-400 font-extrabold uppercase mt-1">Reports Filed</div>
            </div>
            <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-center shadow-sm">
              <div className="text-2xl font-black text-slate-900">1</div>
              <div className="text-[10px] text-slate-400 font-extrabold uppercase mt-1">Adoptions</div>
            </div>
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

        <div className="space-y-4 font-semibold text-slate-700 text-sm">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <span>Rescue request updates</span>
            <button
              type="button"
              onClick={() => setPrefRescue(!prefRescue)}
              className={`w-11 h-6 rounded-full p-0.5 transition cursor-pointer flex items-center ${
                prefRescue ? 'bg-emerald-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  prefRescue ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <span>Adoption application status</span>
            <button
              type="button"
              onClick={() => setPrefAdoption(!prefAdoption)}
              className={`w-11 h-6 rounded-full p-0.5 transition cursor-pointer flex items-center ${
                prefAdoption ? 'bg-emerald-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  prefAdoption ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pb-3.5">
            <span>Vaccination reminders</span>
            <button
              type="button"
              onClick={() => setPrefVaccination(!prefVaccination)}
              className={`w-11 h-6 rounded-full p-0.5 transition cursor-pointer flex items-center ${
                prefVaccination ? 'bg-emerald-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  prefVaccination ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
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
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-slate-50"
              />
            </div>

            {newPassword && (
              <ul className="text-xs space-y-1 pl-1">
                <li
                  className={`flex items-center gap-1.5 font-medium ${
                    newPassword.length >= 8 ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" /> At least 8 characters
                </li>
                <li
                  className={`flex items-center gap-1.5 font-medium ${
                    /[A-Z]/.test(newPassword) ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" /> One uppercase letter
                </li>
                <li
                  className={`flex items-center gap-1.5 font-medium ${
                    /[0-9]/.test(newPassword) ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" /> One number
                </li>
                <li
                  className={`flex items-center gap-1.5 font-medium ${
                    confirmNewPassword && newPassword === confirmNewPassword
                      ? 'text-emerald-600'
                      : 'text-slate-400'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Passwords match
                </li>
              </ul>
            )}

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
  );
};

export default Profile;
