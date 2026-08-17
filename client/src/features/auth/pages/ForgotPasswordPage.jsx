import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Mail,
  KeyRound,
  Lock,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { emailSchema, passwordSchema } from '../../../utils/validationSchemas';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp, resetPassword } = useAuth();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Resend countdown timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Live password requirements
  const passwordCriteria = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
    noSpaces: newPassword.length > 0 && !/\s/.test(newPassword),
  };

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setEmailError('');

    const validationResult = emailSchema.safeParse(email.trim());
    if (!validationResult.success) {
      setEmailError(validationResult.error.issues[0]?.message || 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const res = await sendOtp(email.trim(), 'forgot_password');
      if (res.success) {
        setStep(2);
        setResendTimer(60);
        setSuccessMessage(`A 6-digit OTP code has been sent to ${email.trim()}`);
      } else {
        setErrorMessage(res.message || 'Failed to send OTP code');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred while sending OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || loading) return;
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await sendOtp(email.trim(), 'forgot_password');
      if (res.success) {
        setResendTimer(60);
        setSuccessMessage(`A new verification code has been sent to ${email.trim()}`);
      } else {
        setErrorMessage(res.message || 'Failed to resend OTP code');
      }
    } catch (err) {
      setErrorMessage('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!otp || otp.trim().length !== 6) {
      setErrorMessage('Please enter a valid 6-digit OTP code.');
      return;
    }

    setLoading(true);

    try {
      const res = await verifyOtp(email.trim(), otp.trim(), 'forgot_password');
      if (res.success) {
        setStep(3);
        setSuccessMessage('OTP code verified! You can now create a new password.');
      } else {
        setErrorMessage(res.message || 'Invalid or expired OTP code');
      }
    } catch (err) {
      setErrorMessage('An error occurred during OTP verification.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setPasswordErrors({});

    const passResult = passwordSchema.safeParse(newPassword);
    if (!passResult.success) {
      setErrorMessage(passResult.error.issues[0]?.message || 'Password does not meet minimum safety requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrors({ confirmPassword: 'Passwords do not match' });
      setErrorMessage('Please ensure both passwords match.');
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(email.trim(), otp.trim(), newPassword);
      if (res.success) {
        setStep(4);
      } else {
        setErrorMessage(res.message || 'Failed to reset password');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred while updating your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={
        step === 1
          ? 'Forgot Password?'
          : step === 2
          ? 'Verify Security Code'
          : step === 3
          ? 'Reset Your Password'
          : 'Password Reset Complete'
      }
      subtitle={
        step === 1
          ? 'Enter your registered email address to receive a password reset code'
          : step === 2
          ? `Enter the 6-digit code sent to ${email}`
          : step === 3
          ? 'Create a strong, new password for your account'
          : 'Your password has been successfully updated'
      }
    >
      {errorMessage && (
        <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && step !== 4 && (
        <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Progress Bar */}
      {step < 4 && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-[#237737]' : 'bg-slate-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-[#237737]' : 'bg-slate-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-[#237737]' : 'bg-slate-200'}`} />
        </div>
      )}

      {/* Step 1: Request OTP Form */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Registered Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="alex@example.com"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#237737] focus:ring-2 focus:ring-[#237737]/20 text-sm transition"
                autoFocus
              />
            </div>
            {emailError && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{emailError}</span>
              </p>
            )}
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#237737] hover:bg-[#1d632e] active:bg-[#185326] disabled:opacity-50 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer shadow-sm"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending Verification Code...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" /> Send Verification OTP →
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </div>
        </form>
      )}

      {/* Step 2: Enter OTP Form */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5 text-center">
            <KeyRound className="w-7 h-7 text-[#237737] mx-auto mb-1.5" />
            <p className="text-xs text-slate-600 font-medium">
              Security OTP code has been dispatched to
            </p>
            <p className="text-sm font-bold text-slate-800">{email}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 text-center">
              6-Digit OTP Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="123456"
              className="w-full text-center tracking-[0.5em] font-mono text-2xl py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#237737] focus:ring-2 focus:ring-[#237737]/20 transition"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 px-1 pt-1">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Change Email
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendTimer > 0 || loading}
              className="text-[#237737] hover:text-[#1d632e] disabled:text-slate-400 font-semibold flex items-center gap-1 cursor-pointer transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
            </button>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-2.5 px-4 bg-[#237737] hover:bg-[#1d632e] active:bg-[#185326] disabled:opacity-50 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer shadow-sm"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying Code...
                </>
              ) : (
                <>Verify OTP Code →</>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Enter New Password */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-3" noValidate>
          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#237737] focus:ring-2 focus:ring-[#237737]/20 text-sm transition"
                autoFocus
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#237737] focus:ring-2 focus:ring-[#237737]/20 text-sm transition"
              />
            </div>
            {passwordErrors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{passwordErrors.confirmPassword}</span>
              </p>
            )}
          </div>

          {/* Password Strength Requirements Helper Box */}
          {newPassword.length > 0 && (
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

          <div className="pt-3 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#237737] hover:bg-[#1d632e] active:bg-[#185326] disabled:opacity-50 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer shadow-sm"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Reset Password →
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Step 4: Reset Success */}
      {step === 4 && (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 text-[#237737] rounded-full flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Password Reset Successfully!
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your account password has been updated. You can now log in using your new credentials.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-2.5 px-4 bg-[#237737] hover:bg-[#1d632e] active:bg-[#185326] text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            Go to Sign In →
          </button>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
