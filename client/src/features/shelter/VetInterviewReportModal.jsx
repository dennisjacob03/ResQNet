import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  Check,
  AlertCircle,
  RefreshCw,
  Award,
  Stethoscope,
  ShieldCheck,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { submitVetInterviewReport } from '../../services/veterinaryService';
import {
  auditReportSchema,
  extractZodErrors,
  validateField,
} from '../../utils/validationSchemas';

const VetInterviewReportModal = ({
  isOpen,
  onClose,
  application,
  shelterData,
  onReportSubmitted,
}) => {
  const [decision, setDecision] = useState('Approved');
  const [interviewReport, setInterviewReport] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // 4 Essential Verification Checks
  const [checks, setChecks] = useState({
    licenseVerified: true,
    surgicalCompetence: true,
    animalHandlingReadiness: true,
    shelterAgreement: true,
  });

  // Field validation states
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

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

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !application) return null;

  const handleToggleCheck = (key) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const validationData = {
      status: decision,
      report: interviewReport.trim(),
      rejectionReason: decision === 'Rejected' ? rejectionReason.trim() : undefined,
    };

    const parseResult = auditReportSchema.safeParse(validationData);
    if (!parseResult.success) {
      const errs = extractZodErrors(parseResult.error);
      setFieldErrors(errs);
      setTouched({ report: true, rejectionReason: true });
      const firstErr = Object.values(errs)[0];
      setErrorMsg(firstErr || 'Please check the form for errors.');
      return;
    }

    if (decision === 'Approved') {
      const allChecked = Object.values(checks).every(Boolean);
      if (!allChecked) {
        setErrorMsg('All 4 compliance & qualification verification items must be verified to approve veterinary staff.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        decision,
        interviewReport: interviewReport.trim(),
        interviewChecks: checks,
        rejectionReason: decision === 'Rejected' ? rejectionReason.trim() : '',
      };

      const res = await submitVetInterviewReport(application._id, payload);
      if (res?.success) {
        if (onReportSubmitted) onReportSubmitted(res.application, res.vetStaff);
        onClose();
      } else {
        setErrorMsg(res?.message || 'Failed to submit interview evaluation report.');
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Error recording evaluation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Modal Header - Fixed at Top */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
                Clinical Evaluation & Assignment Report
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                {application.fullName} • Reg: {application.councilRegistrationNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer shrink-0 ml-2"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form with Scrollable Content & Fixed Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 text-slate-800">
            {/* Assigned Shelter Notice */}
            <div className="p-3 sm:p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start sm:items-center gap-2.5 sm:gap-3 text-xs text-emerald-900 leading-relaxed">
              <Building2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                Evaluating for:{' '}
                <strong>{shelterData?.shelterName || 'Shelter Veterinary Service'}</strong>.
                Upon approval, candidate will be officially assigned to this shelter.
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start sm:items-center gap-2 text-rose-800 text-xs font-bold leading-snug">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Decision Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Evaluation Decision *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setDecision('Approved')}
                  className={`p-3 sm:p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center gap-3 ${
                    decision === 'Approved'
                      ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 text-emerald-950'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      decision === 'Approved' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black">Approve & Assign</div>
                    <div className="text-[10px] text-slate-500 font-semibold truncate">Promote to Veterinary Staff</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('Rejected')}
                  className={`p-3 sm:p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center gap-3 ${
                    decision === 'Rejected'
                      ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 text-rose-950'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      decision === 'Rejected' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-transparent'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black">Reject Application</div>
                    <div className="text-[10px] text-slate-500 font-semibold truncate">Does not fulfill criteria</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Verification Checklist (shown if Approved) */}
            {decision === 'Approved' && (
              <div className="space-y-2.5 p-3.5 sm:p-4 bg-[#F8FAF9] border border-slate-200/80 rounded-2xl">
                <div className="text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#237737] shrink-0" />
                  <span>Mandatory Qualification & Shelter Verification Checklist</span>
                </div>

                <div className="space-y-2.5 pt-1 text-xs font-semibold text-slate-700">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checks.licenseVerified}
                      onChange={() => handleToggleCheck('licenseVerified')}
                      className="mt-0.5 accent-[#237737] rounded shrink-0 cursor-pointer"
                    />
                    <span className="leading-snug">
                      <strong>Council License Verified:</strong> Original Veterinary Council of India / State
                      Council registration and degree certificates authenticated.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checks.surgicalCompetence}
                      onChange={() => handleToggleCheck('surgicalCompetence')}
                      className="mt-0.5 accent-[#237737] rounded shrink-0 cursor-pointer"
                    />
                    <span className="leading-snug">
                      <strong>Surgical Competence Evaluated:</strong> Demonstrated sterile surgical technique,
                      canine spay/neuter proficiency, and wound care mastery.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checks.animalHandlingReadiness}
                      onChange={() => handleToggleCheck('animalHandlingReadiness')}
                      className="mt-0.5 accent-[#237737] rounded shrink-0 cursor-pointer"
                    />
                    <span className="leading-snug">
                      <strong>Animal Handling & Safety:</strong> Demonstrated humane handling, fear-free
                      restraint, and emergency triage safety protocol readiness.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checks.shelterAgreement}
                      onChange={() => handleToggleCheck('shelterAgreement')}
                      className="mt-0.5 accent-[#237737] rounded shrink-0 cursor-pointer"
                    />
                    <span className="leading-snug">
                      <strong>Shelter Protocol Agreement:</strong> Candidate agreed to attending visit
                      schedules, electronic medical recording, and emergency on-call coordination.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Clinical Evaluation Remarks */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Clinical Evaluation Findings & Remarks *
              </label>
              <textarea
                rows={3}
                value={interviewReport}
                onChange={(e) => {
                  setInterviewReport(e.target.value);
                  if (touched.report) handleBlurField('report', e.target.value);
                }}
                onBlur={() => handleBlurField('report', interviewReport)}
                placeholder="Candidate demonstrated exceptional clinical skills during surgical evaluation. Degree and council license verified (min 15 chars)..."
                required
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition leading-relaxed ${
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

            {/* Rejection Reason (if Rejected) */}
            {decision === 'Rejected' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-rose-700 block">
                  Reason for Rejection *
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    if (touched.rejectionReason) handleBlurField('rejectionReason', e.target.value);
                  }}
                  onBlur={() => handleBlurField('rejectionReason', rejectionReason)}
                  placeholder="Reason candidate did not meet clinic standards (e.g. invalid license, insufficient surgical experience) - min 10 chars..."
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition leading-relaxed ${
                    fieldErrors.rejectionReason && touched.rejectionReason
                      ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'bg-rose-50/50 border border-rose-200 focus:border-rose-500'
                  }`}
                />
                {fieldErrors.rejectionReason && touched.rejectionReason && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">
                    {fieldErrors.rejectionReason}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer actions - Fixed at Bottom */}
          <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 shrink-0 bg-slate-50/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl transition cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2.5 text-white text-xs font-extrabold rounded-xl transition cursor-pointer shadow-md disabled:opacity-50 inline-flex items-center justify-center gap-1.5 ${
                decision === 'Approved'
                  ? 'bg-[#237737] hover:bg-[#1d632e] shadow-[#237737]/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              }`}
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : decision === 'Approved' ? (
                <>
                  <Award className="w-3.5 h-3.5" />
                  <span>Approve & Assign Staff</span>
                </>
              ) : (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>Submit Rejection</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VetInterviewReportModal;
