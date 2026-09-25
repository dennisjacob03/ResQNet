import React from 'react';
import { HeartHandshake, X, ShieldCheck, Clock, Check, Calendar } from 'lucide-react';

const VolunteerVisitModal = ({
  isOpen,
  application,
  onClose,
  volunteerVisitDate,
  setVolunteerVisitDate,
  volunteerVisitValuationPeriod,
  setVolunteerVisitValuationPeriod,
  volunteerVisitCoordinator,
  setVolunteerVisitCoordinator,
  volunteerVisitNotes,
  setVolunteerVisitNotes,
  volunteerVisitSubmitting,
  handleConfirmScheduleVolunteerVisit,
}) => {
  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-[#237737] font-black flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">Schedule Volunteer Visit</h3>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-black rounded-lg border border-emerald-200">
                  Orientation Session
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

        {/* Info Notice */}
        <div className="p-3.5 bg-emerald-50 border border-emerald-200/70 rounded-2xl text-xs text-emerald-950 space-y-1">
          <p className="font-extrabold flex items-center gap-1.5 text-[#237737]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            Mandatory Orientation & Verification Session
          </p>
          <p className="text-emerald-800 text-[11px] leading-relaxed">
            All prospective volunteers must complete an in-person orientation and animal safety verification session at a ResQNet shelter or community center before receiving official volunteer credentials.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleConfirmScheduleVolunteerVisit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">
                Orientation Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={volunteerVisitDate}
                onChange={(e) => setVolunteerVisitDate(e.target.value)}
                required
                min={new Date().toISOString().slice(0, 10)}
                className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Session Window / Slot</label>
              <input
                type="text"
                value={volunteerVisitValuationPeriod}
                onChange={(e) => setVolunteerVisitValuationPeriod(e.target.value)}
                placeholder="e.g. 10:00 AM - 1:00 PM"
                className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">
              Assigned Coordinator / Field Officer
            </label>
            <input
              type="text"
              value={volunteerVisitCoordinator}
              onChange={(e) => setVolunteerVisitCoordinator(e.target.value)}
              placeholder="e.g. Volunteer Relations Officer / Shelter Manager"
              className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">
              Venue & Candidate Instructions
            </label>
            <textarea
              value={volunteerVisitNotes}
              onChange={(e) => setVolunteerVisitNotes(e.target.value)}
              placeholder="e.g. Bring government photo ID (Aadhaar/Driving License) and wear closed-toe shoes. Venue: ResQNet Central Facility, Ernakulam."
              rows={3}
              className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={volunteerVisitSubmitting}
              className="px-5 py-2 bg-[#237737] hover:bg-[#1b5e20] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {volunteerVisitSubmitting ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5" />
                  Schedule Orientation Session
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VolunteerVisitModal;
