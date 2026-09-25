import React, { useState } from 'react';
import {
  FileText,
  X,
  Clock,
  Check,
  XCircle,
  ShieldCheck,
  CheckSquare,
  Square,
  HeartHandshake,
  AlertCircle,
} from 'lucide-react';
import { auditReportSchema, extractZodErrors, validateField } from '../../utils/validationSchemas';

const VolunteerVisitReportModal = ({
  isOpen,
  application,
  onClose,
  volunteerVisitReportText,
  setVolunteerVisitReportText,
  volunteerReportDecision,
  setVolunteerReportDecision,
  volunteerReportChecks = {
    identityVerified: true,
    animalHandlingReady: true,
    safetyOrientationDone: true,
    commitmentAgreement: true,
  },
  setVolunteerReportChecks,
  reportSubmitting,
  handleSubmitVolunteerVisitReport,
}) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [localError, setLocalError] = useState('');

  if (!isOpen || !application) return null;

  const handleToggleCheck = (key) => {
    if (setVolunteerReportChecks) {
      setVolunteerReportChecks((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    }
  };

  const handleBlurField = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(auditReportSchema, field, value);
    setFieldErrors((prev) => {
      const updated = { ...prev };
      if (err) updated[field] = err;
      else delete updated[field];
      return updated;
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    const validationData = {
      reportText: (volunteerVisitReportText || '').trim(),
      decision: volunteerReportDecision,
    };

    const parseResult = auditReportSchema.safeParse(validationData);
    if (!parseResult.success) {
      const errs = extractZodErrors(parseResult.error);
      setFieldErrors(errs);
      setTouched({ reportText: true });
      const firstErr = Object.values(errs)[0];
      setLocalError(firstErr || 'Please check the form for errors.');
      return;
    }

    if (volunteerReportDecision === 'Approved') {
      if (
        !volunteerReportChecks.identityVerified ||
        !volunteerReportChecks.animalHandlingReady ||
        !volunteerReportChecks.safetyOrientationDone ||
        !volunteerReportChecks.commitmentAgreement
      ) {
        setLocalError('All orientation and safety checklist items must be confirmed before approval.');
        return;
      }
    }

    handleSubmitVolunteerVisitReport(e);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 font-black flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  Orientation Report & Decision
                </h3>
                <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 text-xs font-black rounded-lg border border-purple-200">
                  Verification Audit
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                {application.fullName || application.volunteerName || application._name} (
                {application.volunteerApplicationId || application._id2 || 'VAP-0001'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Context Summary */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-[#F8FAF9] p-3.5 rounded-2xl border border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Orientation Date</span>
            <p className="font-extrabold text-slate-800 mt-0.5">
              {application.visitScheduleDate
                ? new Date(application.visitScheduleDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Today'}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">District & Role</span>
            <p className="font-extrabold text-slate-800 mt-0.5">
              {application.district || 'Kerala'} • Community Volunteer
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Availability</span>
            <p className="font-semibold text-slate-700 mt-0.5 truncate">
              {Array.isArray(application.availability)
                ? application.availability.join(', ')
                : application.availability || 'Flexible'}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Mobility</span>
            <p className="font-semibold text-slate-700 mt-0.5">
              {application.hasVehicle
                ? `${application.vehicleNumber || 'Vehicle'} (${application.vehicleType || 'Car'})`
                : 'No Vehicle'}
            </p>
          </div>
        </div>

        {/* Audit Verification Checklist */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            Orientation & Safety Checklist:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              {
                key: 'identityVerified',
                label: 'Government Photo ID Verified',
                desc: 'Aadhaar / Passport / License checked',
              },
              {
                key: 'animalHandlingReady',
                label: 'Animal Handling Aptitude',
                desc: 'Demonstrated calm, gentle animal handling',
              },
              {
                key: 'safetyOrientationDone',
                label: 'Safety Briefing Completed',
                desc: 'Bite safety, sanitation & emergency SOPs',
              },
              {
                key: 'commitmentAgreement',
                label: 'Volunteer Pledge Signed',
                desc: 'Code of conduct & confidentiality agreed',
              },
            ].map((check) => {
              const isChecked = !!volunteerReportChecks[check.key];
              return (
                <div
                  key={check.key}
                  onClick={() => handleToggleCheck(check.key)}
                  className={`p-3 rounded-2xl border text-xs transition cursor-pointer flex items-start gap-2.5 ${
                    isChecked
                      ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                      : 'bg-[#F8FAF9] border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="mt-0.5 shrink-0 text-emerald-600">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-[11px] leading-tight">{check.label}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{check.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {localError && (
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{localError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Coordinator Assessment & Orientation Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={volunteerVisitReportText}
              onChange={(e) => {
                setVolunteerVisitReportText(e.target.value);
                if (touched.reportText) {
                  handleBlurField('reportText', e.target.value);
                }
              }}
              onBlur={(e) => handleBlurField('reportText', e.target.value)}
              placeholder="Record candidate attendance, engagement level, animal interaction feedback, and any special task recommendations..."
              rows={4}
              className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl text-xs font-semibold focus:outline-none transition leading-relaxed ${
                touched.reportText && fieldErrors.reportText
                  ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                  : 'border-slate-200 focus:border-[#237737]'
              }`}
            />
            {touched.reportText && fieldErrors.reportText && (
              <p className="text-[11px] text-rose-500 font-semibold mt-1">
                {fieldErrors.reportText}
              </p>
            )}
          </div>

          {/* Decision Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              Audit Decision & Certification: <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVolunteerReportDecision('Approved')}
                className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                  volunteerReportDecision === 'Approved'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}
              >
                <Check className="w-4 h-4" />
                Pass & Certify Volunteer
              </button>

              <button
                type="button"
                onClick={() => setVolunteerReportDecision('Rejected')}
                className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                  volunteerReportDecision === 'Rejected'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
                }`}
              >
                <XCircle className="w-4 h-4" />
                Fail & Reject
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reportSubmitting}
              className={`px-5 py-2 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm ${
                volunteerReportDecision === 'Approved'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {reportSubmitting ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  Submitting Report...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {volunteerReportDecision === 'Approved'
                    ? 'Certify & Issue Badge'
                    : 'Submit Report & Reject'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VolunteerVisitReportModal;
