import React, { useState } from 'react';
import { FileText, X, Clock, Check, XCircle, AlertCircle } from 'lucide-react';
import { auditReportSchema, extractZodErrors, validateField } from '../../utils/validationSchemas';

const SiteVisitReportModal = ({
  isOpen,
  application,
  onClose,
  siteVisitReportText,
  setSiteVisitReportText,
  reportDecision,
  setReportDecision,
  reportSubmitting,
  handleSubmitSiteVisitReport,
}) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [localError, setLocalError] = useState('');

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
    setLocalError('');

    const validationData = {
      reportText: (siteVisitReportText || '').trim(),
      decision: reportDecision,
      rejectionReason: reportDecision === 'Rejected' ? (siteVisitReportText || '').trim() : undefined,
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

    handleSubmitSiteVisitReport(e);
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
                  Site Visit Report & Decision
                </h3>
                <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 text-xs font-black rounded-lg border border-purple-200">
                  Evaluation
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                {application.shelterName} ({application.shelterApplicationId || 'SA-0001'})
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

        {/* Facility Context Summary */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-[#F8FAF9] p-3 rounded-2xl border border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Valuation Date</span>
            <p className="font-extrabold text-slate-800 mt-0.5">
              {application.siteVisitScheduleDate
                ? new Date(application.siteVisitScheduleDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Facility Capacity
            </span>
            <p className="font-extrabold text-slate-800 mt-0.5">
              {application.occupiedCages || 0} / {application.totalCages || 0} Cages •{' '}
              {application.totalStaffs || 0} Staff
            </p>
          </div>
        </div>

        {localError && (
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{localError}</span>
          </div>
        )}

        {/* Report Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              {reportDecision === 'Rejected'
                ? 'Physical Site Visit Inspection Report & Rejection Reason'
                : 'Physical Site Visit Inspection & Valuation Report'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={siteVisitReportText}
              onChange={(e) => {
                setSiteVisitReportText(e.target.value);
                if (touched.reportText) {
                  handleBlurField('reportText', e.target.value);
                }
              }}
              onBlur={(e) => handleBlurField('reportText', e.target.value)}
              rows="4"
              placeholder={
                reportDecision === 'Rejected'
                  ? 'Document inspection observations, compliance failures, and detailed reason for declining the registration...'
                  : 'Document physical observations regarding facility cages, ventilation, hygiene, water access, staff readiness, and regulatory compliance...'
              }
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
                onClick={() => setReportDecision('Approved')}
                className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  reportDecision === 'Approved'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                    : 'bg-[#F8FAF9] border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="reportDecision"
                    checked={reportDecision === 'Approved'}
                    onChange={() => setReportDecision('Approved')}
                    className="accent-emerald-600"
                  />
                  <span className="font-black text-xs text-emerald-800">Pass & Approve</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium mt-1">
                  Registers facility, assigns sequential ID & emails shelter login credentials.
                </span>
              </label>

              <label
                onClick={() => setReportDecision('Rejected')}
                className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  reportDecision === 'Rejected'
                    ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-xs'
                    : 'bg-[#F8FAF9] border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="reportDecision"
                    checked={reportDecision === 'Rejected'}
                    onChange={() => setReportDecision('Rejected')}
                    className="accent-rose-600"
                  />
                  <span className="font-black text-xs text-rose-800">Fail & Reject</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium mt-1">
                  Declines application with inspection findings and notifies applicant.
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
              disabled={reportSubmitting || !siteVisitReportText.trim()}
              className={`w-2/3 py-2.5 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                reportDecision === 'Approved'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/15'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/15'
              }`}
            >
              {reportSubmitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" /> Submitting Report…
                </>
              ) : reportDecision === 'Approved' ? (
                <>
                  <Check className="w-4 h-4" /> Approve Registration
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

export default SiteVisitReportModal;
