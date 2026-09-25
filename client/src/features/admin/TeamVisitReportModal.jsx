import React, { useState } from 'react';
import { FileText, X, Clock, Check, XCircle, ShieldCheck, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { auditReportSchema, extractZodErrors, validateField } from '../../utils/validationSchemas';

const TeamVisitReportModal = ({
  isOpen,
  application,
  onClose,
  teamVisitReportText,
  setTeamVisitReportText,
  teamReportDecision,
  setTeamReportDecision,
  teamReportChecks = {
    vehicleVerified: true,
    equipmentVerified: true,
    membersVerified: true,
    safetyCompliance: true,
  },
  setTeamReportChecks,
  reportSubmitting,
  handleSubmitTeamVisitReport,
}) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [localError, setLocalError] = useState('');

  if (!isOpen || !application) return null;

  const handleToggleCheck = (key) => {
    if (setTeamReportChecks) {
      setTeamReportChecks((prev) => ({
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
      reportText: (teamVisitReportText || '').trim(),
      decision: teamReportDecision,
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

    if (teamReportDecision === 'Approved') {
      if (
        !teamReportChecks.vehicleVerified ||
        !teamReportChecks.equipmentVerified ||
        !teamReportChecks.membersVerified ||
        !teamReportChecks.safetyCompliance
      ) {
        setLocalError('All on-site verification checklist items must be confirmed before approval.');
        return;
      }
    }

    handleSubmitTeamVisitReport(e);
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
                  Team Visit Report & Decision
                </h3>
                <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 text-xs font-black rounded-lg border border-purple-200">
                  Valuation Audit
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                {application.teamName} ({application.rescueTeamApplicationId || application._id2 || 'RTA-0001'})
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

        {/* Team Context Summary */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-[#F8FAF9] p-3.5 rounded-2xl border border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Valuation Date</span>
            <p className="font-extrabold text-slate-800 mt-0.5">
              {application.teamVisitScheduleDate
                ? new Date(application.teamVisitScheduleDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Vehicle & Territory</span>
            <p className="font-extrabold text-slate-800 mt-0.5">
              {application.vehicleNumber || 'N/A'} ({application.vehicleType || 'Vehicle'}) • {application.operatingDistrict || 'Kerala'}
            </p>
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
          {/* Equipment & Compliance Verification Checklist */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              On-Site Verification Checklist
            </label>
            <div className="space-y-1.5 bg-[#F8FAF9] p-3 rounded-2xl border border-slate-200/70">
              {[
                { key: 'vehicleVerified', label: 'Emergency rescue vehicle roadworthiness & space verified' },
                { key: 'equipmentVerified', label: 'Rescue gear (cages, stretchers, handling gloves) inspected' },
                { key: 'membersVerified', label: 'Team responder readiness & emergency contact confirmed' },
                { key: 'safetyCompliance', label: 'Animal transport safety & humane handling protocols compliant' },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => handleToggleCheck(item.key)}
                  className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold cursor-pointer py-1 px-1.5 rounded-lg hover:bg-white transition"
                >
                  {teamReportChecks[item.key] ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Report Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Physical Inspection & Valuation Findings <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={teamVisitReportText}
              onChange={(e) => {
                setTeamVisitReportText(e.target.value);
                if (touched.reportText) {
                  handleBlurField('reportText', e.target.value);
                }
              }}
              onBlur={(e) => handleBlurField('reportText', e.target.value)}
              rows="4"
              placeholder="Document physical observations regarding rescue vehicle safety, cage ventilation, trauma kit supplies, responder availability, and emergency coverage readiness..."
              className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl text-xs font-semibold focus:outline-none resize-none transition ${
                touched.reportText && fieldErrors.reportText
                  ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                  : 'border-slate-200 focus:border-[#237737]'
              }`}
            ></textarea>
            {touched.reportText && fieldErrors.reportText && (
              <p className="text-[11px] text-rose-500 font-semibold mt-1">
                {fieldErrors.reportText}
              </p>
            )}
          </div>

          {/* Decision Options */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-slate-700">
              Audit Outcome Decision <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                onClick={() => setTeamReportDecision('Approved')}
                className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  teamReportDecision === 'Approved'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                    : 'bg-[#F8FAF9] border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="teamReportDecision"
                    checked={teamReportDecision === 'Approved'}
                    onChange={() => setTeamReportDecision('Approved')}
                    className="accent-emerald-600"
                  />
                  <span className="font-black text-xs text-emerald-800">Pass & Approve</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium mt-1">
                  Certifies team, registers RT-0001, upgrades user role to Rescue Team & enables SOS alerts.
                </span>
              </label>

              <label
                onClick={() => setTeamReportDecision('Rejected')}
                className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  teamReportDecision === 'Rejected'
                    ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-xs'
                    : 'bg-[#F8FAF9] border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="teamReportDecision"
                    checked={teamReportDecision === 'Rejected'}
                    onChange={() => setTeamReportDecision('Rejected')}
                    className="accent-rose-600"
                  />
                  <span className="font-black text-xs text-rose-800">Fail & Reject</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium mt-1">
                  Declines registration with inspection findings and notifies team lead.
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reportSubmitting || !teamVisitReportText.trim()}
              className={`w-2/3 py-2.5 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                teamReportDecision === 'Approved'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/15'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/15'
              }`}
            >
              {reportSubmitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" /> Submitting Report…
                </>
              ) : teamReportDecision === 'Approved' ? (
                <>
                  <Check className="w-4 h-4" /> Approve Rescue Team
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" /> Reject Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamVisitReportModal;
