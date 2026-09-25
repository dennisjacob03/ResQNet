import React, { useState } from 'react';
import { Dog, X } from 'lucide-react';
import {
  shelterAnimalSchema,
  extractZodErrors,
  validateField,
} from '../../utils/validationSchemas';

const AddAnimalModal = ({
  showAddAnimalModal,
  setShowAddAnimalModal,
  newAnimalName,
  setNewAnimalName,
  newAnimalSpecies,
  setNewAnimalSpecies,
  newAnimalBreed,
  setNewAnimalBreed,
  newAnimalAge,
  setNewAnimalAge,
  newAnimalCage,
  setNewAnimalCage,
  newAnimalStatus,
  setNewAnimalStatus,
  animalSubmitting,
  cages = [],
  handleCreateAnimal,
}) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  if (!showAddAnimalModal) return null;

  const handleBlurField = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(shelterAnimalSchema, field, value);
    setFieldErrors((prev) => {
      const updated = { ...prev };
      if (err) updated[field] = err;
      else delete updated[field];
      return updated;
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const data = {
      species: newAnimalSpecies,
      breed: (newAnimalBreed || '').trim(),
      approxAge: (newAnimalAge || '').trim(),
      cageNumber: newAnimalCage || undefined,
    };
    const res = shelterAnimalSchema.safeParse(data);
    if (!res.success) {
      const errs = extractZodErrors(res.error);
      setFieldErrors(errs);
      setTouched({ species: true, breed: true, approxAge: true });
      return;
    }
    handleCreateAnimal(e);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full border border-slate-100 shadow-xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Dog className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-slate-900">Register Rescued Animal</h2>
          </div>
          <button
            onClick={() => setShowAddAnimalModal(false)}
            className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Animal Name (optional)</label>
            <input
              type="text"
              value={newAnimalName}
              onChange={(e) => setNewAnimalName(e.target.value)}
              placeholder="e.g. Bruno"
              className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Species *</label>
              <select
                value={newAnimalSpecies}
                onChange={(e) => setNewAnimalSpecies(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition cursor-pointer"
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Cow">Cow</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Approx. Age *</label>
              <input
                type="text"
                value={newAnimalAge}
                onChange={(e) => {
                  setNewAnimalAge(e.target.value);
                  if (touched.approxAge) handleBlurField('approxAge', e.target.value);
                }}
                onBlur={() => handleBlurField('approxAge', newAnimalAge)}
                required
                placeholder="e.g. 2y, 6m"
                className={`w-full px-4 py-3 rounded-2xl focus:outline-none font-semibold text-sm transition ${
                  fieldErrors.approxAge && touched.approxAge
                    ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'bg-[#F8FAF9] border border-slate-200 focus:border-[#237737]'
                }`}
              />
              {fieldErrors.approxAge && touched.approxAge && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">
                  {fieldErrors.approxAge}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Breed *</label>
            <input
              type="text"
              value={newAnimalBreed}
              onChange={(e) => {
                setNewAnimalBreed(e.target.value);
                if (touched.breed) handleBlurField('breed', e.target.value);
              }}
              onBlur={() => handleBlurField('breed', newAnimalBreed)}
              required
              placeholder="e.g. Labrador Mix, Stray"
              className={`w-full px-4 py-3 rounded-2xl focus:outline-none font-semibold text-sm transition ${
                fieldErrors.breed && touched.breed
                  ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                  : 'bg-[#F8FAF9] border border-slate-200 focus:border-[#237737]'
              }`}
            />
            {fieldErrors.breed && touched.breed && (
              <p className="text-[11px] text-rose-500 font-semibold mt-1">
                {fieldErrors.breed}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Cage / Pen #</label>
              <select
                value={newAnimalCage}
                onChange={(e) => setNewAnimalCage(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition cursor-pointer"
              >
                <option value="">Select Cage (optional)...</option>
                {cages.map((c) => (
                  <option key={c._id} value={`Cage #${c.cageNumber}`}>
                    Cage #{c.cageNumber} ({c.categoryId?.categoryName || 'General'}) - {c.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">Health Status</label>
              <select
                value={newAnimalStatus}
                onChange={(e) => setNewAnimalStatus(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-2xl focus:outline-none focus:border-[#237737] font-semibold text-sm transition cursor-pointer"
              >
                <option value="Rescued">Rescued / Healthy</option>
                <option value="Under Treatment">Under Treatment</option>
                <option value="Critical">Critical</option>
                <option value="Adopted">Adopted</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={animalSubmitting}
            className="w-full py-3 bg-[#237737] hover:bg-[#1d632e] text-white text-sm font-bold rounded-2xl transition cursor-pointer shadow-md shadow-[#237737]/10 disabled:opacity-50"
          >
            {animalSubmitting ? 'Registering Animal...' : 'Register Animal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAnimalModal;
