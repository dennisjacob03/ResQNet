import React from 'react';
import { Building2, X } from 'lucide-react';

const CageDetailsModal = ({
  showCageDetailsModal,
  setShowCageDetailsModal,
  selectedCageDetails,
  handleUpdateCageStatus,
  handleDeleteCage,
}) => {
  if (!showCageDetailsModal || !selectedCageDetails) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Cage #{selectedCageDetails.cageNumber} Details
              </h2>
              <p className="text-[11px] text-slate-400 font-bold">
                {selectedCageDetails.categoryId?.categoryName || 'General'} Wing
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCageDetailsModal(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cage Specs Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Cage Number</span>
            <span className="font-black text-slate-900 text-sm mt-0.5 block">
              #{selectedCageDetails.cageNumber}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Cage Type</span>
            <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">
              {selectedCageDetails.type}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Status</span>
            <div className="mt-1.5 flex items-center justify-between">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                  selectedCageDetails.status === 'AVAILABLE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : selectedCageDetails.status === 'OCCUPIED'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {selectedCageDetails.status}
              </span>

              <select
                value={selectedCageDetails.status}
                onChange={(e) => handleUpdateCageStatus(selectedCageDetails._id, e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
              >
                <option value="AVAILABLE">Set AVAILABLE</option>
                <option value="OCCUPIED">Set OCCUPIED</option>
                <option value="MAINTENANCE">Set MAINTENANCE</option>
              </select>
            </div>
          </div>
        </div>

        {/* Occupant Information */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-500">Current Occupant</span>
          {selectedCageDetails.animalId ? (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                  {(selectedCageDetails.animalId.name || 'A')[0]}
                </div>
                <div>
                  <span className="font-black text-slate-900 text-sm block">
                    {selectedCageDetails.animalId.name}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {selectedCageDetails.animalId.species} •{' '}
                    {selectedCageDetails.animalId.breed || 'Mixed'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-center text-xs font-semibold text-slate-400">
              Cage is currently Vacant and available for new animal intake.
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => handleDeleteCage(selectedCageDetails._id)}
            className="w-1/3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-2xl transition cursor-pointer border border-rose-200"
          >
            Delete Cage
          </button>
          <button
            onClick={() => setShowCageDetailsModal(false)}
            className="w-2/3 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-2xl transition cursor-pointer shadow-md shadow-[#237737]/10"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default CageDetailsModal;
