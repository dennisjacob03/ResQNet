import React, { useState, useEffect } from 'react';
import {
  FileText,
  X,
  Calendar,
  MapPin,
  Home,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  auditReportSchema,
  extractZodErrors,
  validateField,
} from '../../utils/validationSchemas';

const ShelterVisitReportModal = ({
  isOpen,
  application,
  onClose,
  onSubmitReport,
  loading = false,
}) => {
  const [reportText, setReportText] = useState('');
  const [decision, setDecision] = useState('Approved');
  const [checks, setChecks] = useState({
    visitDone: true,
    housingVerified: true,
    agreementConfirmed: true,
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

  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fill a professional template when the modal opens
  useEffect(() => {
    if (application && isOpen) {
      const petName = application.pet_id?.name || 'the companion';
      const applicantName = application.applicant_id?.fullName || 'the applicant';
      const visitDate = application.appointment?.date
        ? new Date(application.appointment.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'recent date';
      const location = application.appointment?.location || 'shelter campus';
      const housing = `${application.housing_type || 'Residential'} (${application.ownership_status || 'Own'})`;

      setReportText(
        application.visitReport?.reportText ||
          `In-person shelter visit conducted on ${visitDate} at ${location}. Observed interaction between ${petName} and ${applicantName}. The applicant demonstrated gentle handling, positive bonding, and clear understanding of daily care requirements. Living accommodations (${housing}) and pet readiness verified satisfactory.`
      );

      setDecision(application.visitReport?.decision || 'Approved');

      setChecks(
        application.visitReport?.checks || {
          visitDone: true,
          housingVerified: true,
          agreementConfirmed: true,
        }
      );

      setErrorMsg('');
      setFieldErrors({});
      setTouched({});
    }
  }, [application, isOpen]);

  if (!isOpen || !application) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const validationData = {
      status: decision,
      report: reportText.trim(),
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

    if (decision === 'Approved') {
      if (!checks.visitDone || !checks.housingVerified || !checks.agreementConfirmed) {
        setErrorMsg('All verification checklist items must be confirmed before approval.');
        return;
      }
    }

    onSubmitReport({
      reportText: reportText.trim(),
      decision,
      checks,
    });
  };

  const pet = application.pet_id || {};
  const applicant = application.applicant_id || {};
  const apt = application.appointment || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50/80 via-indigo-50/50 to-white">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-700 font-black flex items-center justify-center shrink-0 border border-purple-200/50 shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Shelter Visit Report & Decision
                </h3>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase rounded-md tracking-wider">
                  Audit
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {pet.name || 'Companion'} • Applicant: <strong className="text-slate-800">{applicant.fullName}</strong> ({application.adoptionId || 'ADO'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Facility & Visit Context Summary */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-600" /> Scheduled Visit
              </span>
              <p className="font-extrabold text-slate-800 text-xs">
                {apt.date
                  ? `${new Date(apt.date).toLocaleDateString()} at ${apt.time || '10:00 AM'}`
                  : 'Shelter Campus Visit'}
              </p>
              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                {apt.location || 'Shelter Facility'}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                <Home className="w-3 h-3 text-emerald-600" /> Living Accommodations
              </span>
              <p className="font-extrabold text-slate-800 text-xs">
                {application.housing_type} ({application.ownership_status})
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {application.ownership_status === 'Rent'
                  ? `Landlord: ${application.landlord_details?.name || 'Confirmed'}`
                  : 'Self-Owned Property'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Inspection Report Textarea */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 flex items-center justify-between">
                <span>
                  Physical Shelter Visit & Companion Interaction Report <span className="text-rose-500">*</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  Saved with official adoption record
                </span>
              </label>
              <textarea
                value={reportText}
                onChange={(e) => {
                  setReportText(e.target.value);
                  if (touched.report) handleBlurField('report', e.target.value);
                }}
                onBlur={() => handleBlurField('report', reportText)}
                rows={4}
                required
                placeholder="Document physical observations: companion-applicant interaction, handling comfort, household readiness (min 15 chars)..."
                className={`w-full p-3.5 rounded-2xl text-xs font-semibold focus:outline-none transition resize-none leading-relaxed ${
                  fieldErrors.report && touched.report
                    ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'bg-slate-50 border border-slate-200 focus:border-purple-600 text-slate-800'
                }`}
              />
              {fieldErrors.report && touched.report && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">
                  {fieldErrors.report}
                </p>
              )}
            </div>

            {/* Mandatory Verification Checklist */}
            <div className="space-y-2">
              <span className="font-black text-slate-700 uppercase tracking-wider text-[10px] block">
                Audit Verification Checklist
              </span>
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checks.visitDone}
                    onChange={(e) => setChecks({ ...checks, visitDone: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-600 accent-purple-600 cursor-pointer"
                  />
                  <span className="font-bold text-slate-800 leading-snug">
                    In-person shelter visit conducted & companion interaction verified.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checks.housingVerified}
                    onChange={(e) => setChecks({ ...checks, housingVerified: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-600 accent-purple-600 cursor-pointer"
                  />
                  <span className="font-bold text-slate-800 leading-snug">
                    Living arrangement ({application.housing_type}, {application.ownership_status}) and household safety confirmed.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checks.agreementConfirmed}
                    onChange={(e) => setChecks({ ...checks, agreementConfirmed: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-600 accent-purple-600 cursor-pointer"
                  />
                  <span className="font-bold text-slate-800 leading-snug">
                    Pet return policy acknowledged & adoption handover documentation signed.
                  </span>
                </label>
              </div>
            </div>

            {/* Audit Outcome Decision (Pass & Approve vs Fail & Reject) */}
            <div className="space-y-2 pt-1">
              <label className="font-bold text-slate-800 block text-xs">
                Audit Outcome Decision <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Option 1: Pass & Approve */}
                <label
                  onClick={() => setDecision('Approved')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                    decision === 'Approved'
                      ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="decision"
                      checked={decision === 'Approved'}
                      onChange={() => setDecision('Approved')}
                      className="accent-emerald-600 cursor-pointer"
                    />
                    <span className="font-black text-xs text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pass & Approve
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium mt-1.5 leading-relaxed">
                    Finalizes adoption, registers companion as Adopted, issues certificate, and notifies applicant.
                  </span>
                </label>

                {/* Option 2: Fail & Reject */}
                <label
                  onClick={() => setDecision('Rejected')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                    decision === 'Rejected'
                      ? 'bg-rose-50/90 border-rose-500 text-rose-950 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="decision"
                      checked={decision === 'Rejected'}
                      onChange={() => setDecision('Rejected')}
                      className="accent-rose-600 cursor-pointer"
                    />
                    <span className="font-black text-xs text-rose-800 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" /> Fail & Reject
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium mt-1.5 leading-relaxed">
                    Declines application with inspection findings, keeps companion available, and notifies applicant.
                  </span>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Modal Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-5 py-2.5 text-white font-bold rounded-xl transition cursor-pointer flex items-center gap-2 shadow-sm ${
                  decision === 'Approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                }`}
              >
                {loading ? (
                  <span>Submitting...</span>
                ) : decision === 'Approved' ? (
                  <>
                    <Check className="w-4 h-4" /> Confirm & Approve Adoption
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" /> Submit Report & Reject Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShelterVisitReportModal;
