import React from 'react';
import { Calendar, X, ShieldCheck, Clock, Check } from 'lucide-react';

const SiteVisitModal = ({
  isOpen,
  application,
  onClose,
  siteVisitDate,
  setSiteVisitDate,
  siteVisitValuationPeriod,
  setSiteVisitValuationPeriod,
  siteVisitInspector,
  setSiteVisitInspector,
  siteVisitNotes,
  setSiteVisitNotes,
  siteVisitSubmitting,
  handleConfirmScheduleSiteVisit,
}) => {
  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 font-black flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">Schedule Site Visit</h3>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-black rounded-lg border border-blue-200">
                  Valuation Period
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

        {/* Info Notice */}
        <div className="p-3.5 bg-blue-50 border border-blue-200/70 rounded-2xl text-xs text-blue-900 space-y-1">
          <p className="font-extrabold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            Mandatory Physical Inspection Process
          </p>
          <p className="text-blue-700 text-[11px] leading-relaxed">
            Admins must schedule a valuation period date to physically inspect facility cages,
            veterinary hygiene, and safety compliance before granting approval.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleConfirmScheduleSiteVisit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">
                Valuation Period Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={siteVisitDate}
                onChange={(e) => setSiteVisitDate(e.target.value)}
                required
                min={new Date().toISOString().slice(0, 10)}
                className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Valuation Window / Slot</label>
              <input
                type="text"
                value={siteVisitValuationPeriod}
                onChange={(e) => setSiteVisitValuationPeriod(e.target.value)}
                placeholder="e.g. 10:00 AM - 1:00 PM or 3-Day Window"
                className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">
              Assigned Auditor / Field Inspector
            </label>
            <input
              type="text"
              value={siteVisitInspector}
              onChange={(e) => setSiteVisitInspector(e.target.value)}
              placeholder="e.g. Admin / Field Officer Name"
              className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">
              Inspection Notes & Shelter Instructions
            </label>
            <textarea
              value={siteVisitNotes}
              onChange={(e) => setSiteVisitNotes(e.target.value)}
              rows="3"
              placeholder="e.g. Keep trust registration documents, cage cleanliness registers, and veterinary agreements ready."
              className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] resize-none"
            ></textarea>
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
              disabled={siteVisitSubmitting}
              className="w-2/3 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-blue-600/15 flex items-center justify-center gap-2"
            >
              {siteVisitSubmitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" /> Scheduling Visit…
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Confirm & Set Valuation Date
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteVisitModal;
