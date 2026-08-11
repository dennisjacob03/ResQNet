import { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../services/authService';
import { auth, googleProvider, signInWithPopup } from '../config/firebase';

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
