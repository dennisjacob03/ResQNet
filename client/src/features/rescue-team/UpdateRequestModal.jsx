import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  Truck,
  CheckCircle2,
  Building2,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { updateRescueStage } from '../../services/rescueRequestService';

const RESCUE_STAGES = [
  { key: 'En Route', label: 'En Route to Scene', desc: 'Responders in vehicle heading to location' },
  { key: 'Arrived on Scene', label: 'Arrived on Scene', desc: 'Responders inspecting and securing animal' },
  { key: 'Animal Rescued', label: 'Animal Rescued', desc: 'Animal secured in rescue transport vehicle' },
  { key: 'Transporting to Shelter', label: 'Transfer to Nearby Shelter', desc: 'Notify nearby shelter and begin transfer', isShelterAction: true },
  { key: 'Delivered to Shelter', label: 'Delivered to Shelter', desc: 'Animal safely delivered to shelter team' },
  { key: 'Completed', label: 'Operation Completed', desc: 'Case marked resolved and complete' },
];

const UpdateRequestModal = ({
  showUpdateModal,
  setShowUpdateModal,
  onStageUpdated,
  onOpenShelterTransfer,
}) => {
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!showUpdateModal) return null;

  const requestId =
    typeof showUpdateModal === 'object'
      ? showUpdateModal._id || showUpdateModal.id || showUpdateModal.rescueRequestId
      : showUpdateModal;

  const currentStage =
    typeof showUpdateModal === 'object'
      ? showUpdateModal.rescueStage || showUpdateModal.status || 'Accepted'
      : 'Accepted';

  const handleSelectStage = async (stageObj) => {
    if (stageObj.isShelterAction) {
      if (onOpenShelterTransfer) {
        onOpenShelterTransfer(showUpdateModal);
      }
      setShowUpdateModal(null);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await updateRescueStage(requestId, {
        rescueStage: stageObj.key,
        note: note || `Operation updated to ${stageObj.label}`,
      });
      if (res?.success) {
        if (onStageUpdated) onStageUpdated(res.request);
        setShowUpdateModal(null);
      }
    } catch (err) {
      console.warn('Failed to update rescue stage:', err);
      setError(err?.response?.data?.message || 'Failed to update rescue stage.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">
                Update Operation Stage
              </h3>
              <span className="font-mono text-xs font-bold text-[#237737] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                {requestId}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Current Stage: <strong className="text-slate-700">{currentStage}</strong>
            </p>
          </div>
          <button
            onClick={() => setShowUpdateModal(null)}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-extrabold text-slate-700">
              Optional Note / Field Log
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. ETA 5 minutes, moving via ring road..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-[#237737]"
            />
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
              Select Next Stage
            </span>

            <div className="space-y-2">
              {RESCUE_STAGES.map((s) => {
                const isCurrent = currentStage === s.key;

                return (
                  <button
                    key={s.key}
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSelectStage(s)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer group ${
                      s.isShelterAction
                        ? 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-400 text-indigo-900'
                        : isCurrent
                        ? 'border-[#237737] bg-emerald-50/60 text-[#237737] font-bold'
                        : 'border-slate-200/80 hover:border-[#237737]/40 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          s.isShelterAction
                            ? 'bg-indigo-600 text-white'
                            : isCurrent
                            ? 'bg-[#237737] text-white'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-[#237737]/10 group-hover:text-[#237737]'
                        }`}
                      >
                        {s.isShelterAction ? (
                          <Building2 className="w-4 h-4" />
                        ) : isCurrent ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Truck className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-extrabold block">{s.label}</span>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                          {s.desc}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-[#237737] group-hover:translate-x-1 transition-transform">
                      <span>{s.isShelterAction ? 'Route' : 'Update'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50 text-xs text-slate-400">
          <span>Reporting user will see this status in real-time.</span>
          <button
            onClick={() => setShowUpdateModal(null)}
            className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateRequestModal;
