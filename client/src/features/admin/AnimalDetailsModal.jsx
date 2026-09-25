import React from 'react';
import { X } from 'lucide-react';

const AnimalDetailsModal = ({ isOpen, animal, onClose }) => {
  if (!isOpen || !animal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {animal.name || 'Rescue Animal'} ({animal.animalId})
              </h3>
              <p className="text-xs text-slate-400 font-semibold">
                {animal.breed || 'Mixed Breed'} • {animal.species}
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

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#F8FAF9] rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
            <p className="font-extrabold text-slate-800 mt-0.5">{animal.species}</p>
          </div>
          <div className="p-3 bg-[#F8FAF9] rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Gender & Age</span>
            <p className="font-extrabold text-slate-800 mt-0.5">
              {animal.gender} • {animal.approxAge || 'Not specified'}
            </p>
          </div>
          <div className="p-3 bg-[#F8FAF9] rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Cage / Location
            </span>
            <p className="font-extrabold text-slate-800 mt-0.5">
              {animal.cageNumber ? `Cage ${animal.cageNumber}` : 'Unassigned'}
            </p>
          </div>
          <div className="p-3 bg-[#F8FAF9] rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Facility</span>
            <p className="font-extrabold text-slate-800 mt-0.5">
              {animal.shelterName || 'Central Registry'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#F8FAF9] rounded-2xl border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Health Condition
            </span>
            <p className="font-extrabold text-slate-800 mt-0.5">
              {animal.healthCondition || 'Healthy'}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-xl text-xs font-bold border ${
              animal.status === 'Available' || animal.status === 'Rescued'
                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                : 'bg-amber-500/10 text-amber-700 border-amber-200/50'
            }`}
          >
            {animal.status}
          </span>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimalDetailsModal;
