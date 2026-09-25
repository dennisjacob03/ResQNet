import React, { useState } from 'react';
import {
  FileText,
  X,
  Check,
  XCircle,
  ShieldCheck,
  CheckSquare,
  Square,
  HeartHandshake,
  AlertCircle,
} from 'lucide-react';
import {
  auditReportSchema,
  extractZodErrors,
  validateField,
} from '../../utils/validationSchemas';

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
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !application) return null;

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
    setErrorMsg('');

    const validationData = {
      status: volunteerReportDecision,
      report: (volunteerVisitReportText || '').trim(),
    };

    const parseResult = auditReportSchema.safeParse(validationData);
    if (!parseResult.success) {
      const errs = extractZodErrors(parseResult.error);
      setFieldErrors(errs);
      setTouched({ report: true });
      const firstErr = Object.values(errs)[0];
      setErrorMsg(firstErr || 'Please check the form for errors.');
      return;
    }

    if (volunteerReportDecision === 'Approved') {
      const allChecked = Object.values(volunteerReportChecks).every(Boolean);
      if (!allChecked) {
        setErrorMsg('All 4 safety & orientation checklist items must be verified before approval.');
        return;
      }
    }

    handleSubmitVolunteerVisitReport(e);
  };

  const handleToggleCheck = (key) => {
    if (setVolunteerReportChecks) {
      setVolunteerReportChecks((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 font-black flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  Orientation Report & Decision
                </h3>
                <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 text-xs font-black rounded-lg border border-teal-200">
                  Squad Evaluation
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                {application.fullName} ({application.volunteerApplicationId || 'VAP-0001'})
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
            <span className="text-[10px] font-bold text-slate-400 uppercase">District & Skills</span>
            <p className="font-extrabold text-slate-800 mt-0.5">
              {application.district || 'Kerala'} •{' '}
              {Array.isArray(application.skills) && application.skills.length > 0
                ? application.skills.slice(0, 2).join(', ')
                : 'General Aid'}
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
            <span className="text-[10px] font-bold text-slate-400 uppercase">Transport Vehicle</span>
            <p className="font-semibold text-slate-700 mt-0.5">
              {application.hasVehicle
                ? `${application.vehicleType || 'Vehicle'} (${application.vehicleNumber || 'Yes'})`
                : 'No vehicle'}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Verification Checklist */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Orientation & Safety Checklist
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleToggleCheck('identityVerified')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition cursor-pointer ${
                  volunteerReportChecks.identityVerified
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                {volunteerReportChecks.identityVerified ? (
                  <CheckSquare className="w-4 h-4 text-[#237737] shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span>1. Photo ID Verified</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleCheck('animalHandlingReady')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition cursor-pointer ${
                  volunteerReportChecks.animalHandlingReady
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                {volunteerReportChecks.animalHandlingReady ? (
                  <CheckSquare className="w-4 h-4 text-[#237737] shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span>2. Animal Handling Ready</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleCheck('safetyOrientationDone')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition cursor-pointer ${
                  volunteerReportChecks.safetyOrientationDone
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                {volunteerReportChecks.safetyOrientationDone ? (
                  <CheckSquare className="w-4 h-4 text-[#237737] shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span>3. Safety Protocols Briefed</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleCheck('commitmentAgreement')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition cursor-pointer ${
                  volunteerReportChecks.commitmentAgreement
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                {volunteerReportChecks.commitmentAgreement ? (
                  <CheckSquare className="w-4 h-4 text-[#237737] shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span>4. Code of Conduct Signed</span>
              </button>
            </div>
          </div>

          {/* Orientation Report Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">
              Evaluation Report & Squad Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={volunteerVisitReportText}
              onChange={(e) => {
                setVolunteerVisitReportText(e.target.value);
                if (touched.report) handleBlurField('report', e.target.value);
              }}
              onBlur={() => handleBlurField('report', volunteerVisitReportText)}
              required
              placeholder="Detail the candidate's responsiveness, interaction with animals, field readiness (min 15 chars)..."
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition ${
                fieldErrors.report && touched.report
                  ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                  : 'bg-[#F8FAF9] border border-slate-200 focus:border-[#237737]'
              }`}
            />
            {fieldErrors.report && touched.report && (
              <p className="text-[11px] text-rose-500 font-semibold mt-1">
                {fieldErrors.report}
              </p>
            )}
          </div>

          {/* Decision Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">
              Final Decision <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVolunteerReportDecision('Approved')}
                className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2 font-bold text-xs transition cursor-pointer ${
                  volunteerReportDecision === 'Approved'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Check className="w-4 h-4" /> Approve & Issue Volunteer Badge
              </button>

              <button
                type="button"
                onClick={() => setVolunteerReportDecision('Rejected')}
                className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2 font-bold text-xs transition cursor-pointer ${
                  volunteerReportDecision === 'Rejected'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-4 h-4" /> Decline Application
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reportSubmitting}
              className="px-5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              {reportSubmitting ? 'Submitting Report...' : 'Submit Evaluation Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VolunteerVisitReportModal;
