import { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser, getCurrentUser, sendOtpApi, verifyOtpApi, resetPasswordApi, updateProfileApi } from '../services/authService';
import { auth, googleProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from '../config/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('resqnet_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('resqnet_token') || null;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await getCurrentUser();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('resqnet_user', JSON.stringify(res.user));
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session restoration failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password, role) => {
    setError(null);
    try {
      const data = await loginUser({ email, password, role });
      if (data.success && data.token) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('resqnet_token', data.token);
        localStorage.setItem('resqnet_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Login error occurred';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const data = await registerUser(userData);
      if (data.success && data.token) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('resqnet_token', data.token);
        localStorage.setItem('resqnet_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Registration error occurred';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const googleLogin = async () => {
    setError(null);
    try {
      // 1. Sign in with Google using Firebase Client SDK popup
      const userCredential = await signInWithPopup(auth, googleProvider);
      
      // 2. Retrieve Firebase ID Token
      const idToken = await userCredential.user.getIdToken();
      
      // 3. Authenticate with backend using the ID Token
      const data = await loginUser({ idToken });
      
      if (data.success && data.token) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('resqnet_token', data.token);
        localStorage.setItem('resqnet_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Google login failed' };
    } catch (err) {
      console.error('Firebase Google Auth Error:', err.response?.data || err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Google Auth flow cancelled or failed';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('resqnet_token');
    localStorage.removeItem('resqnet_user');
  };

  const sendOtp = async (email, reason = 'forgot_password', fullName = '') => {
    try {
      const data = await sendOtpApi(email, reason, fullName);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP';
      return { success: false, message: msg };
    }
  };

  const verifyOtp = async (email, otp, reason = 'forgot_password') => {
    try {
      const data = await verifyOtpApi(email, otp, reason);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid or expired OTP';
      return { success: false, message: msg };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const data = await resetPasswordApi(email, otp, newPassword);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to reset password';
      return { success: false, message: msg };
    }
  };

  // Firebase Phone Authentication Helpers
  const setupRecaptcha = (containerId = 'recaptcha-container') => {
    const element = document.getElementById(containerId);
    if (!element) {
      console.warn(`Container #${containerId} not found in DOM`);
      return null;
    }
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.warn('Failed to clear previous recaptchaVerifier:', e);
      }
      window.recaptchaVerifier = null;
    }

    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        console.warn('reCAPTCHA expired');
      }
    });

    return window.recaptchaVerifier;
  };

  const sendPhoneOtp = async (phoneNumber, appVerifier) => {
    try {
      if (!appVerifier) {
        return {
          success: false,
          message: 'reCAPTCHA verifier could not be initialized on page.'
        };
      }
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+91${formattedPhone}`;
      }
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      return { success: true, confirmationResult };
    } catch (err) {
      console.error('Firebase Phone Auth sendOtp error:', err);
      let userFriendlyMsg = err.message || 'Failed to send phone verification OTP';
      if (err.message?.includes('region') || err.message?.includes('SMS unable to be sent')) {
        userFriendlyMsg = 'SMS region for India (+91) is not enabled in Firebase Console. Go to Authentication > Settings > SMS Region Policy and enable India (+91).';
      } else if (err.code === 'auth/operation-not-allowed') {
        userFriendlyMsg = 'Phone sign-in is not enabled in your Firebase Console. Please enable Phone under Authentication > Sign-in method.';
      } else if (err.code === 'auth/invalid-phone-number') {
        userFriendlyMsg = 'Invalid phone number. Please enter a valid 10-digit phone number.';
      }
      return {
        success: false,
        message: userFriendlyMsg,
        code: err.code
      };
    }
  };

  const verifyPhoneOtp = async (confirmationResult, otpCode) => {
    try {
      const result = await confirmationResult.confirm(otpCode);
      return { success: true, user: result.user };
    } catch (err) {
      console.error('Firebase Phone Auth verifyOtp error:', err);
      let msg = err.message || 'Invalid verification OTP code';
      if (err.code === 'auth/invalid-verification-code') {
        msg = 'Invalid OTP code. Please check your 6-digit verification code and try again.';
      } else if (err.code === 'auth/code-expired') {
        msg = 'Verification OTP code has expired. Please request a new code.';
      }
      return {
        success: false,
        message: msg,
        code: err.code
      };
    }
  };

  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const data = await updateProfileApi(profileData);
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('resqnet_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Profile update failed' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Profile update error occurred';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    loading,
    error,
    login,
    register,
    googleLogin,
    logout,
    sendOtp,
    verifyOtp,
    resetPassword,
    setupRecaptcha,
    sendPhoneOtp,
    verifyPhoneOtp,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
