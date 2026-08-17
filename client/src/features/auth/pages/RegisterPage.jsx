import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { AlertCircle, CheckCircle2, XCircle, ArrowLeft, MailCheck, Smartphone, ShieldCheck } from 'lucide-react';
import { registerSchema, validateField } from '../../../utils/validationSchemas';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, googleLogin, sendOtp, verifyOtp, setupRecaptcha, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const redirectParam = new URLSearchParams(location.search).get('redirect');

  const [step, setStep] = useState(1);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // OTP Timer effect
  useEffect(() => {
    let interval;
    if (otpTimer > 0 && step === 2) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer, step]);

  // Password requirement live checks
  const passwordCriteria = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
    noSpaces: formData.password.length > 0 && !/\s/.test(formData.password),
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);

    if (touched[name] || value.length > 0) {
      const errorMsg = validateField(null, name, value, updatedData);
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));

      if (name === 'password' && (touched.confirmPassword || formData.confirmPassword.length > 0)) {
        const confirmErr = validateField(null, 'confirmPassword', formData.confirmPassword, updatedData);
        setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
      }
    }

    if (errorMessage) setErrorMessage('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorMsg = validateField(null, name, value, formData);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Mark all fields touched
    const allTouched = {
      fullName: true,
      email: true,
      phoneNumber: true,
      password: true,
      confirmPassword: true,
    };
    setTouched(allTouched);

    const validationResult = registerSchema.safeParse(formData);

    if (!validationResult.success) {
      const fieldErrors = {};
      validationResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setErrorMessage('Please fix all field validation errors before submitting.');
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // 1. Dispatch Phone OTP
      let phoneSuccess = false;
      try {
        const appVerifier = setupRecaptcha('recaptcha-container');
        const phoneRes = await sendPhoneOtp(formData.phoneNumber.trim(), appVerifier);
        if (phoneRes.success) {
          setConfirmationResult(phoneRes.confirmationResult);
          phoneSuccess = true;
        }
      } catch (fbErr) {
        console.warn('Firebase Phone Auth setup failed:', fbErr.message);
      }

      // 2. Dispatch Email OTP
      const emailRes = await sendOtp(formData.email.trim(), 'email_verification', formData.fullName.trim());

      setStep(2);
      setOtpTimer(60);
      if (!phoneSuccess) {
        console.warn('Phone OTP dispatch incomplete, fallback to manual verification');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify Phone Code handler
  const handleVerifyPhoneCode = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (phoneOtp.length !== 6) {
      setErrorMessage('Please enter a 6-digit Phone OTP verification code.');
      return;
    }

    if (!confirmationResult) {
      setErrorMessage('Phone verification session not found. Please click Resend Phone Code.');
      return;
    }

    setPhoneLoading(true);
    try {
      const res = await verifyPhoneOtp(confirmationResult, phoneOtp.trim());
      if (res.success) {
        setPhoneVerified(true);
        setSuccessMessage('Phone number verified successfully ✓');
      } else {
        setErrorMessage(res.message || 'Invalid Phone OTP code. Please check preset test code (123456) or SMS.');
      }
    } catch (err) {
      setErrorMessage('Failed to verify phone OTP code.');
    } finally {
      setPhoneLoading(false);
    }
  };

  // Verify Email Code handler
  const handleVerifyEmailCode = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (emailOtp.length !== 6) {
      setErrorMessage('Please enter a 6-digit Email OTP verification code.');
      return;
    }

    setEmailLoading(true);
    try {
      const res = await verifyOtp(formData.email.trim(), emailOtp.trim(), 'email_verification');
      if (res.success) {
        setEmailVerified(true);
        setSuccessMessage('Email address verified successfully ✓');
      } else {
        setErrorMessage(res.message || 'Invalid Email OTP code. Please check your inbox.');
      }
    } catch (err) {
      setErrorMessage('Failed to verify email OTP code.');
    } finally {
      setEmailLoading(false);
    }
  };

  // Final Registration Handler (Both Phone and Email MUST be verified)
  const handleFinalRegistration = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!phoneVerified || !emailVerified) {
      setErrorMessage('Both Phone Number and Email Address MUST be verified before registration can be completed.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
        role: 'Public User',
        otp: emailOtp.trim(),
        isPhoneVerified: true,
      };

      const result = await register(payload);
      if (result.success) {
        if (redirectParam === 'report') {
          navigate('/dashboard?tab=report');
        } else if (redirectParam === 'adopt') {
          navigate('/dashboard?tab=adopt');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMessage(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred during account creation.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendPhone = async () => {
    if (otpTimer > 0) return;
    setPhoneLoading(true);
    setErrorMessage('');
    try {
      const appVerifier = setupRecaptcha('recaptcha-container');
      const phoneRes = await sendPhoneOtp(formData.phoneNumber.trim(), appVerifier);
      if (phoneRes.success) {
        setConfirmationResult(phoneRes.confirmationResult);
        setOtpTimer(60);
        setSuccessMessage('Phone OTP code resent to +91 ' + formData.phoneNumber);
      } else {
        setErrorMessage(phoneRes.message || 'Failed to resend Phone OTP.');
      }
    } catch (err) {
      setErrorMessage('Failed to resend Phone OTP.');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (otpTimer > 0) return;
    setEmailLoading(true);
    setErrorMessage('');
    try {
      const emailRes = await sendOtp(formData.email.trim(), 'email_verification', formData.fullName.trim());
      if (emailRes.success) {
        setOtpTimer(60);
        setSuccessMessage('Email OTP code resent to ' + formData.email);
      } else {
        setErrorMessage(emailRes.message || 'Failed to resend Email OTP.');
      }
    } catch (err) {
      setErrorMessage('Failed to resend Email OTP.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const result = await googleLogin();
      if (result.success) {
        if (redirectParam === 'report') {
          navigate('/dashboard?tab=report');
        } else if (redirectParam === 'adopt') {
          navigate('/dashboard?tab=adopt');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMessage(result.message || 'Google Sign-in failed');
      }
    } catch (err) {
      setErrorMessage('Google Sign-in error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (name) => {
    const isError = touched[name] && errors[name];
    const isValid = touched[name] && !errors[name] && formData[name];
    
    if (isError) {
      return 'w-full px-3.5 py-2 bg-rose-50/30 border border-rose-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm transition';
    }
    if (isValid) {
      return 'w-full px-3.5 py-2 bg-white border border-emerald-500/80 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 text-sm transition';
    }
    return 'w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#237737] focus:ring-2 focus:ring-[#237737]/20 text-sm transition';
  };

  return (
    <AuthLayout
      title={step === 1 ? "Create an account" : "Dual OTP Verification Required"}
      subtitle={step === 1 ? "Enter your details to continue" : "Verify both your Phone Number and Email Address to complete sign-up"}
    >
      <div id="recaptcha-container"></div>
      {step === 2 && (
        <button 
          onClick={() => { setStep(1); setPhoneVerified(false); setEmailVerified(false); setErrorMessage(''); }}
          className="mb-4 text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to details
        </button>
      )}

      {errorMessage && (
        <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Alex Johnson"
                className={getInputClass('fullName')}
              />
              {touched.fullName && !errors.fullName && formData.fullName && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-2.5" />
              )}
            </div>
            {touched.fullName && errors.fullName && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <XCircle className="w-3.5 h-3.5" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          {/* Email & Phone Number Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="alex@example.com"
                  className={getInputClass('email')}
                />
                {touched.email && !errors.email && formData.email && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-2.5" />
                )}
              </div>
              {touched.email && errors.email && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Phone Number (10-digit Indian)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="9876543210"
                  maxLength={10}
                  className={getInputClass('phoneNumber')}
                />
                {touched.phoneNumber && !errors.phoneNumber && formData.phoneNumber && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-2.5" />
                )}
              </div>
              {touched.phoneNumber && errors.phoneNumber && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.phoneNumber}</span>
                </p>
              )}
            </div>
          </div>

          {/* Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={getInputClass('password')}
                />
                {touched.password && !errors.password && formData.password && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-2.5" />
                )}
              </div>
              {touched.password && errors.password && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={getInputClass('confirmPassword')}
                />
                {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-2.5" />
                )}
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>
          </div>

          {/* Live Password Criteria Helper Box */}
          {formData.password.length > 0 && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 mt-1">
              <p className="font-semibold text-slate-600 mb-1">Password Requirements:</p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <div className={`flex items-center gap-1.5 ${passwordCriteria.length ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                  <span>{passwordCriteria.length ? '✓' : '○'}</span> At least 8 characters
                </div>
                <div className={`flex items-center gap-1.5 ${passwordCriteria.uppercase ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                  <span>{passwordCriteria.uppercase ? '✓' : '○'}</span> 1 uppercase letter (A-Z)
                </div>
                <div className={`flex items-center gap-1.5 ${passwordCriteria.lowercase ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                  <span>{passwordCriteria.lowercase ? '✓' : '○'}</span> 1 lowercase letter (a-z)
                </div>
                <div className={`flex items-center gap-1.5 ${passwordCriteria.number ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                  <span>{passwordCriteria.number ? '✓' : '○'}</span> 1 number (0-9)
                </div>
                <div className={`flex items-center gap-1.5 ${passwordCriteria.special ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                  <span>{passwordCriteria.special ? '✓' : '○'}</span> 1 special character (!@#$)
                </div>
                <div className={`flex items-center gap-1.5 ${passwordCriteria.noSpaces ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                  <span>{passwordCriteria.noSpaces ? '✓' : '○'}</span> No spaces allowed
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons Step 1 */}
          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#237737] hover:bg-[#1d632e] active:bg-[#185326] disabled:opacity-50 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer shadow-sm"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Continue →</>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center mt-6 mb-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-[#F8FAF9] px-2.5 text-[10px] font-medium text-slate-400 uppercase tracking-wider absolute">
                or continue with
              </span>
            </div>

            {/* Google Sign-in */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-2 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
              </svg>
              Sign up with Google
            </button>
          </div>
        </form>
      ) : (
        /* Step 2 Form - Mandatory Dual Verification (Phone AND Email) */
        <div className="space-y-5 pt-1">
          {/* Progress Tracker */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <span className="font-semibold text-slate-600">Verification Progress:</span>
            <div className="flex gap-2">
              <span className={`px-2 py-0.5 rounded-full font-bold ${phoneVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                Phone: {phoneVerified ? 'Verified ✓' : 'Pending'}
              </span>
              <span className={`px-2 py-0.5 rounded-full font-bold ${emailVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                Email: {emailVerified ? 'Verified ✓' : 'Pending'}
              </span>
            </div>
          </div>

          {/* Section 1: Phone Verification */}
          <div className={`p-4 rounded-xl border transition ${phoneVerified ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Smartphone className={`w-5 h-5 ${phoneVerified ? 'text-emerald-600' : 'text-slate-600'}`} />
                <span className="font-semibold text-sm text-slate-800">1. Phone Number Verification</span>
              </div>
              {phoneVerified ? (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              ) : (
                <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                  Action Required
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Sent to: <strong className="text-slate-700">+91 {formData.phoneNumber}</strong> (Preset test OTP: <span className="font-mono font-bold text-slate-800">123456</span>)
            </p>

            {!phoneVerified && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full text-center text-lg tracking-[0.3em] px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#237737]"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyPhoneCode}
                    disabled={phoneLoading || phoneOtp.length !== 6}
                    className="py-2 px-4 bg-[#237737] hover:bg-[#1d632e] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shrink-0 transition cursor-pointer"
                  >
                    {phoneLoading ? 'Verifying...' : 'Verify Phone'}
                  </button>
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleResendPhone}
                    disabled={otpTimer > 0 || phoneLoading}
                    className="text-xs text-[#237737] font-semibold hover:underline disabled:text-slate-400"
                  >
                    {otpTimer > 0 ? `Resend Phone Code in ${otpTimer}s` : 'Resend Phone Code'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Email Verification */}
          <div className={`p-4 rounded-xl border transition ${emailVerified ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MailCheck className={`w-5 h-5 ${emailVerified ? 'text-emerald-600' : 'text-slate-600'}`} />
                <span className="font-semibold text-sm text-slate-800">2. Email Address Verification</span>
              </div>
              {emailVerified ? (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              ) : (
                <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                  Action Required
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Sent to: <strong className="text-slate-700">{formData.email}</strong> (Check console / inbox)
            </p>

            {!emailVerified && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full text-center text-lg tracking-[0.3em] px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#237737]"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmailCode}
                    disabled={emailLoading || emailOtp.length !== 6}
                    className="py-2 px-4 bg-[#237737] hover:bg-[#1d632e] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shrink-0 transition cursor-pointer"
                  >
                    {emailLoading ? 'Verifying...' : 'Verify Email'}
                  </button>
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={otpTimer > 0 || emailLoading}
                    className="text-xs text-[#237737] font-semibold hover:underline disabled:text-slate-400"
                  >
                    {otpTimer > 0 ? `Resend Email Code in ${otpTimer}s` : 'Resend Email Code'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Final Action Button: Create Account */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleFinalRegistration}
              disabled={loading || !phoneVerified || !emailVerified}
              className="w-full py-3.5 px-4 bg-[#237737] hover:bg-[#1d632e] active:bg-[#185326] disabled:opacity-50 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-md"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : phoneVerified && emailVerified ? (
                <>
                  <ShieldCheck className="w-5 h-5" /> Complete Registration & Login →
                </>
              ) : (
                <>Complete Verification ({phoneVerified ? 1 : 0} / 2 Verified)</>
              )}
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default RegisterPage;
