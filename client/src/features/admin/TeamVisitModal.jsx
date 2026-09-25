import React from 'react';
import { Truck, X, ShieldCheck, Clock, Check, Calendar } from 'lucide-react';

const TeamVisitModal = ({
  isOpen,
  application,
  onClose,
  teamVisitDate,
  setTeamVisitDate,
  teamVisitValuationPeriod,
  setTeamVisitValuationPeriod,
  teamVisitInspector,
  setTeamVisitInspector,
  teamVisitNotes,
  setTeamVisitNotes,
  teamVisitSubmitting,
  handleConfirmScheduleTeamVisit,
}) => {
  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 font-black flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">Schedule Team Visit</h3>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-black rounded-lg border border-blue-200">
                  Rescue Valuation
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

        {/* Info Notice */}
        <div className="p-3.5 bg-blue-50 border border-blue-200/70 rounded-2xl text-xs text-blue-900 space-y-1">
          <p className="font-extrabold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            Mandatory Physical Team & Vehicle Inspection
          </p>
          <p className="text-blue-700 text-[11px] leading-relaxed">
            Admins must schedule an on-site valuation to audit the emergency vehicle, transport cages, first-aid kits, and responder readiness before approving registration.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleConfirmScheduleTeamVisit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">
                Valuation Period Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={teamVisitDate}
                onChange={(e) => setTeamVisitDate(e.target.value)}
                required
                min={new Date().toISOString().slice(0, 10)}
                className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Valuation Window / Slot</label>
              <input
                type="text"
                value={teamVisitValuationPeriod}
                onChange={(e) => setTeamVisitValuationPeriod(e.target.value)}
                placeholder="e.g. 11:00 AM - 2:00 PM"
                className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">
              Assigned Field Inspector / Auditor
            </label>
            <input
              type="text"
              value={teamVisitInspector}
              onChange={(e) => setTeamVisitInspector(e.target.value)}
              placeholder="e.g. ResQNet Field Inspector / Officer Name"
              className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">
              Inspection Instructions & Team Notes
            </label>
            <textarea
              value={teamVisitNotes}
              onChange={(e) => setTeamVisitNotes(e.target.value)}
              rows="3"
              placeholder="e.g. Keep rescue vehicle parked at base with stretcher, animal transport crates, first-aid trauma kit, and member ID proofs ready."
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
              disabled={teamVisitSubmitting}
              className="w-2/3 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-blue-600/15 flex items-center justify-center gap-2"
            >
              {teamVisitSubmitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" /> Scheduling Visit…
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" /> Confirm & Schedule Visit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamVisitModal;
