import React, { useState } from 'react';
import { Dog, X, AlertCircle, CheckCircle, Clock, Check } from 'lucide-react';
import { adminAnimalSchema, extractZodErrors, validateField } from '../../utils/validationSchemas';

const AddAnimalModal = ({
  isOpen,
  animalName,
  setAnimalName,
  animalSpecies,
  setAnimalSpecies,
  animalBreed,
  setAnimalBreed,
  animalGender,
  setAnimalGender,
  animalApproxAge,
  setAnimalApproxAge,
  animalColor,
  setAnimalColor,
  animalCageNumber,
  setAnimalCageNumber,
  animalHealthCondition,
  setAnimalHealthCondition,
  animalStatus,
  setAnimalStatus,
  animalShelterName,
  setAnimalShelterName,
  animalCategories = [],
  animalSubmitting = false,
  animalError = '',
  animalSuccess = '',
  handleSaveAnimal,
  onClose,
}) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handleBlurField = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(adminAnimalSchema, field, value);
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
      name: (animalName || '').trim(),
      species: animalSpecies || 'Dog',
      breed: (animalBreed || '').trim(),
      approxAge: (animalApproxAge || '').trim(),
    };

    const parseResult = adminAnimalSchema.safeParse(validationData);
    if (!parseResult.success) {
      const errs = extractZodErrors(parseResult.error);
      setFieldErrors(errs);
      setTouched({ name: true, species: true, breed: true, approxAge: true });
      const firstErr = Object.values(errs)[0];
      setLocalError(firstErr || 'Please check the form for errors.');
      return;
    }

    handleSaveAnimal(e);
  };

  const displayError = localError || animalError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-xl w-full border border-slate-100 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#237737]/10 text-[#237737] flex items-center justify-center">
              <Dog className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Register New Animal</h3>
              <p className="text-[11px] text-slate-400 font-semibold">
                Add an animal record to the platform-wide rescue directory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {displayError && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {animalSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{animalSuccess}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">
                Animal Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={animalName}
                onChange={(e) => {
                  setAnimalName(e.target.value);
                  if (touched.name) handleBlurField('name', e.target.value);
                }}
                onBlur={(e) => handleBlurField('name', e.target.value)}
                placeholder="e.g. Bruno, Bella"
                className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl text-xs font-semibold focus:outline-none transition ${
                  touched.name && fieldErrors.name
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'border-slate-200 focus:border-[#237737]'
                }`}
              />
              {touched.name && fieldErrors.name && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">{fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">
                Species / Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={animalSpecies}
                onChange={(e) => {
                  setAnimalSpecies(e.target.value);
                  if (touched.species) handleBlurField('species', e.target.value);
                }}
                onBlur={(e) => handleBlurField('species', e.target.value)}
                className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl text-xs font-semibold focus:outline-none cursor-pointer transition ${
                  touched.species && fieldErrors.species
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'border-slate-200 focus:border-[#237737]'
                }`}
              >
                {animalCategories.length > 0 ? (
                  animalCategories.map((c) => (
                    <option key={c._id || c.categoryId} value={c.categoryName}>
                      {c.categoryName}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Cow">Cow</option>
                    <option value="Horse">Horse</option>
                    <option value="Other">Other</option>
                  </>
                )}
              </select>
              {touched.species && fieldErrors.species && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">{fieldErrors.species}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Breed</label>
              <input
                type="text"
                value={animalBreed}
                onChange={(e) => {
                  setAnimalBreed(e.target.value);
                  if (touched.breed) handleBlurField('breed', e.target.value);
                }}
                onBlur={(e) => handleBlurField('breed', e.target.value)}
                placeholder="e.g. Labrador Retriever, Mixed"
                className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl text-xs font-semibold focus:outline-none transition ${
                  touched.breed && fieldErrors.breed
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'border-slate-200 focus:border-[#237737]'
                }`}
              />
              {touched.breed && fieldErrors.breed && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">{fieldErrors.breed}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Gender</label>
              <select
                value={animalGender}
                onChange={(e) => setAnimalGender(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Approx. Age</label>
              <input
                type="text"
                value={animalApproxAge}
                onChange={(e) => {
                  setAnimalApproxAge(e.target.value);
                  if (touched.approxAge) handleBlurField('approxAge', e.target.value);
                }}
                onBlur={(e) => handleBlurField('approxAge', e.target.value)}
                placeholder="e.g. 2 years, 6 months"
                className={`w-full px-4 py-2.5 bg-[#F8FAF9] border rounded-xl text-xs font-semibold focus:outline-none transition ${
                  touched.approxAge && fieldErrors.approxAge
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'border-slate-200 focus:border-[#237737]'
                }`}
              />
              {touched.approxAge && fieldErrors.approxAge && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">{fieldErrors.approxAge}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Color / Coat</label>
              <input
                type="text"
                value={animalColor}
                onChange={(e) => setAnimalColor(e.target.value)}
                placeholder="e.g. Golden brown, Black & white"
                className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Cage / Enclosure Number</label>
              <input
                type="text"
                value={animalCageNumber}
                onChange={(e) => setAnimalCageNumber(e.target.value)}
                placeholder="e.g. C-12, A-04"
                className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Facility / Shelter</label>
              <input
                type="text"
                value={animalShelterName}
                onChange={(e) => setAnimalShelterName(e.target.value)}
                placeholder="Central Animal Registry"
                className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Health Condition</label>
              <select
                value={animalHealthCondition}
                onChange={(e) => setAnimalHealthCondition(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] cursor-pointer"
              >
                <option value="Healthy">Healthy</option>
                <option value="Under Treatment">Under Treatment</option>
                <option value="Critical">Critical</option>
                <option value="Injured">Injured</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Adoption Status</label>
              <select
                value={animalStatus}
                onChange={(e) => setAnimalStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] cursor-pointer"
              >
                <option value="Available">Available</option>
                <option value="Rescued">Rescued</option>
                <option value="Under Treatment">Under Treatment</option>
                <option value="Critical">Critical</option>
                <option value="Adopted">Adopted</option>
                <option value="Released">Released</option>
              </select>
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
              disabled={animalSubmitting}
              className="w-2/3 py-2.5 bg-[#237737] hover:bg-[#1d632e] disabled:opacity-60 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-[#237737]/15 flex items-center justify-center gap-2"
            >
              {animalSubmitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" /> Registering…
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Save Animal Record
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAnimalModal;
