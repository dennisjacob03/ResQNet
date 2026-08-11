import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { loginSchema, validateField } from '../../../utils/validationSchemas';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);

    if (touched[name] || value.length > 0) {
      const errorMsg = validateField(null, name, value, updatedData);
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
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

    setTouched({ email: true, password: true });

    const validationResult = loginSchema.safeParse(formData);

    if (!validationResult.success) {
      const fieldErrors = {};
      validationResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setErrorMessage('Please fix all field validation errors before logging in.');
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const result = await login(formData.email.trim(), formData.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrorMessage(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const result = await googleLogin();
      if (result.success) {
        navigate('/dashboard');
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
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      {errorMessage && (
        <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        {/* Email Address */}
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

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-semibold text-slate-700">
              Password
            </label>
          </div>
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

        {/* Action Buttons */}
        <div className="pt-1 space-y-2.5">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#237737] hover:bg-[#1d632e] active:bg-[#185326] disabled:opacity-50 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer shadow-sm"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Sign In →</>
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
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
