import React, { useEffect } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldAlert,
  Sparkles,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { checkProfileCompletion } from '../../utils/profileUtils';

/**
 * ProfileRequiredModal
 * Popup dialog that appears whenever an unprofiled public user tries to perform
 * actions in the dashboard (e.g., clicking to open Report Animal page).
 */
export const ProfileRequiredModal = ({
  isOpen,
  onClose,
  onNavigateToProfile,
  user,
  actionName = 'Report Animal',
  customMessage = null,
}) => {
  const profileStatus = checkProfileCompletion(user);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-required-title"
    >
      {/* Blurred Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in zoom-in-95 fade-in duration-200">
        {/* Top Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500" />

        <div className="p-6 sm:p-7 space-y-5">
          {/* Header Row: Icon, Badge, and Close Button */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shadow-xs shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200/80">
                  <AlertTriangle className="w-3 h-3 text-amber-600" /> Action Required
                </span>
                <h3
                  id="profile-required-title"
                  className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1"
                >
                  Complete Your Profile First
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {customMessage || (
              <>
                To access{' '}
                <span className="font-extrabold text-slate-900">
                  "{actionName}"
                </span>{' '}
                and participate in animal rescues or adoptions, please update your
                profile fully. Verified contact and address details are required for emergency responders.
              </>
            )}
          </p>

          {/* Profile Progress Box */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Profile Completion</span>
              <span className="font-black text-[#237737]">
                {profileStatus.percentage}% Complete
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-[#237737] rounded-full transition-all duration-500"
                style={{ width: `${Math.max(profileStatus.percentage, 10)}%` }}
              />
            </div>

            {/* Missing Fields Tags */}
            {profileStatus.missingFields.length > 0 && (
              <div className="pt-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Missing Required Fields ({profileStatus.missingFields.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profileStatus.missingFields.map((field) => (
                    <span
                      key={field}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 px-2.5 py-1 rounded-lg"
                    >
                      <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick reassurance points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Takes less than 1 minute</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Enables instant rescue alerts</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer"
            >
              View Page First
            </button>

            <button
              type="button"
              onClick={() => {
                if (onNavigateToProfile) onNavigateToProfile();
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#237737] hover:bg-[#1d632e] active:scale-[0.98] text-white text-xs sm:text-sm font-extrabold rounded-xl transition shadow-md shadow-[#237737]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Update Profile Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ProfileRequiredCard
 * Inline banner/card displayed at the top of restricted action pages
 * (e.g., Report Animal form) when a user's profile is incomplete.
 */
export const ProfileRequiredCard = ({
  user,
  onNavigateToProfile,
  actionName = 'reporting animals',
  className = '',
}) => {
  const profileStatus = checkProfileCompletion(user);

  if (profileStatus.isComplete) return null;

  return (
    <div
      className={`bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-xs transition-all ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 border border-amber-300/60 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-amber-950">
                Profile Incomplete ({profileStatus.percentage}%)
              </h4>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-200/70 text-amber-900 rounded-md">
                Required
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-0.5 font-medium leading-relaxed">
              Before {actionName}, please fully complete your profile. Rescue teams and animal coordinators require your verified phone number and location.
            </p>
            {profileStatus.missingFields.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] font-bold text-amber-700 uppercase">
                  Missing:
                </span>
                {profileStatus.missingFields.slice(0, 4).map((f) => (
                  <span
                    key={f}
                    className="text-[10px] font-bold bg-white/80 border border-amber-200 text-amber-900 px-2 py-0.5 rounded-md"
                  >
                    {f}
                  </span>
                ))}
                {profileStatus.missingFields.length > 4 && (
                  <span className="text-[10px] font-bold text-amber-800">
                    +{profileStatus.missingFields.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToProfile}
          className="self-start sm:self-center px-4 py-2 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-extrabold rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>Complete Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ProfileRequiredModal;
