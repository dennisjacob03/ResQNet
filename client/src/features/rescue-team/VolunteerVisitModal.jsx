import React from 'react';
import { HeartHandshake, X, ShieldCheck, Clock, Calendar, MapPin } from 'lucide-react';

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
                <h3 className="text-lg font-black text-slate-900">Schedule Volunteer Orientation</h3>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-black rounded-lg border border-emerald-200">
                  Rescue Squad
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

        {/* Candidate Badge */}
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl text-xs text-emerald-950 space-y-1">
          <p className="font-extrabold flex items-center gap-1.5 text-[#237737]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            Rescue Team Field Orientation
          </p>
          <p className="text-emerald-800 text-[11px] leading-relaxed">
            Schedule an orientation session to verify photo ID, evaluate animal handling skills, and brief the candidate on emergency dispatch safety.
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
              <label className="text-xs font-bold text-slate-600">Time Window</label>
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
              Assigned Squad Coordinator / Team Lead
            </label>
            <input
              type="text"
              value={volunteerVisitCoordinator}
              onChange={(e) => setVolunteerVisitCoordinator(e.target.value)}
              placeholder="e.g. Squad Lead / Field Response Officer"
              className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">
              Session Location & Briefing Notes
            </label>
            <textarea
              rows={3}
              value={volunteerVisitNotes}
              onChange={(e) => setVolunteerVisitNotes(e.target.value)}
              placeholder="Provide meeting point, base location, instructions, and required gear or photo identification..."
              className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={volunteerVisitSubmitting}
              className="px-5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              {volunteerVisitSubmitting ? 'Scheduling...' : 'Confirm Orientation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VolunteerVisitModal;
