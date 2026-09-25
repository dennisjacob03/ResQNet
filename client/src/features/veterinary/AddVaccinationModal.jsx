import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Calendar, RefreshCw, Check } from 'lucide-react';
import { createVaccinationRecord } from '../../services/veterinaryService';
import {
  vaccinationRecordSchema,
  extractZodErrors,
  validateField,
} from '../../utils/validationSchemas';

const VACCINE_PRESETS = [
  'Anti-Rabies Vaccine (ARV)',
  'DHPPiL 7-in-1 (Distemper, Hepatitis, Parvo, Parainfluenza, Leptospira)',
  'Canine Corona Virus Vaccine (CCV)',
  'Kennel Cough (Bordetella bronchiseptica)',
  'Feline Tricat (FPV, FHV, FCV)',
];

const AddVaccinationModal = ({
  isOpen,
  onClose,
  animals = [],
  shelterData,
  onVaccinationCreated,
}) => {
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [vaccineName, setVaccineName] = useState(VACCINE_PRESETS[0]);
  const [customVaccine, setCustomVaccine] = useState('');
  const [dateGiven, setDateGiven] = useState(new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [remarks, setRemarks] = useState('');

  // Field validation states
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleBlurField = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(vaccinationRecordSchema, field, value);
    setFieldErrors((prev) => {
      const updated = { ...prev };
      if (err) updated[field] = err;
      else delete updated[field];
      return updated;
    });
  };

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (animals && animals.length > 0 && !selectedAnimalId) {
      setSelectedAnimalId(animals[0]._id || animals[0].animalId);
    }
  }, [animals, selectedAnimalId]);

  // Helper to calculate next due date
  const setQuickDue = (months) => {
    const d = new Date(dateGiven || new Date());
    d.setMonth(d.getMonth() + months);
    const calculated = d.toISOString().split('T')[0];
    setNextDueDate(calculated);
    setFieldErrors((prev) => {
      const up = { ...prev };
      delete up.nextDueDate;
      return up;
    });
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const effectiveName = vaccineName === 'Custom' ? customVaccine.trim() : vaccineName;
    const validationData = {
      animalId: selectedAnimalId,
      vaccineName: effectiveName,
      dateGiven,
      nextDueDate: nextDueDate || undefined,
      batchNumber: batchNumber.trim(),
    };

    const parseResult = vaccinationRecordSchema.safeParse(validationData);
    if (!parseResult.success) {
      const errs = extractZodErrors(parseResult.error);
      setFieldErrors(errs);
      setTouched({
        animalId: true,
        vaccineName: true,
        dateGiven: true,
        nextDueDate: true,
        batchNumber: true,
      });
      const firstErr = Object.values(errs)[0];
      setErrorMsg(firstErr || 'Please check the form for errors.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        animalId: selectedAnimalId,
        vaccineName: effectiveName,
        dateGiven,
        nextDueDate: nextDueDate || null,
        batchNumber: batchNumber.trim(),
        remarks: remarks.trim(),
      };

      const res = await createVaccinationRecord(payload);
      if (res?.success) {
        if (onVaccinationCreated) onVaccinationCreated(res.vaccination);
        onClose();
        setCustomVaccine('');
        setRemarks('');
      } else {
        setErrorMsg(res?.message || 'Failed to record vaccination.');
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Error recording vaccination.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 md:p-8 space-y-6 animate-in fade-in zoom-in duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#237737] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Record Animal Vaccination</h2>
              <p className="text-xs text-slate-500 font-medium">
                {shelterData?.shelterName || 'Shelter'} Preventive Care Log
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
          {/* Patient Selection */}
          <div className="space-y-1.5">
            <label className="text-slate-600 font-bold block">Patient Animal *</label>
            <select
              value={selectedAnimalId}
              onChange={(e) => {
                setSelectedAnimalId(e.target.value);
                if (touched.animalId) handleBlurField('animalId', e.target.value);
              }}
              onBlur={() => handleBlurField('animalId', selectedAnimalId)}
              required
              className={`w-full px-3.5 py-2.5 rounded-xl font-semibold text-xs focus:outline-none cursor-pointer transition ${
                fieldErrors.animalId && touched.animalId
                  ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                  : 'bg-[#F8FAF9] border border-slate-200 focus:border-[#237737]'
              }`}
            >
              {animals.length === 0 && <option value="">No animals registered in shelter</option>}
              {animals.map((a) => (
                <option key={a._id || a.animalId} value={a._id || a.animalId}>
                  {a.name || 'Resident Animal'} ({a.species} - {a.animalId || 'ID'})
                </option>
              ))}
            </select>
            {fieldErrors.animalId && touched.animalId && (
              <p className="text-[11px] text-rose-500 font-semibold mt-1">
                {fieldErrors.animalId}
              </p>
            )}
          </div>

          {/* Vaccine Preset Selection */}
          <div className="space-y-1.5">
            <label className="text-slate-600 font-bold block">Vaccine Name *</label>
            <select
              value={vaccineName}
              onChange={(e) => setVaccineName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none focus:border-[#237737] cursor-pointer"
            >
              {VACCINE_PRESETS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
              <option value="Custom">Custom Vaccine / Other...</option>
            </select>
          </div>

          {vaccineName === 'Custom' && (
            <div className="space-y-1.5">
              <label className="text-slate-600 font-bold block">Specify Vaccine Name *</label>
              <input
                type="text"
                value={customVaccine}
                onChange={(e) => {
                  setCustomVaccine(e.target.value);
                  if (touched.vaccineName) handleBlurField('vaccineName', e.target.value);
                }}
                onBlur={() => handleBlurField('vaccineName', customVaccine)}
                placeholder="e.g. Tetanus Toxoid / Anti-Venom Serum"
                required
                className={`w-full px-3.5 py-2.5 rounded-xl font-semibold text-xs focus:outline-none transition ${
                  fieldErrors.vaccineName && touched.vaccineName
                    ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'bg-[#F8FAF9] border border-slate-200 focus:border-[#237737]'
                }`}
              />
              {fieldErrors.vaccineName && touched.vaccineName && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">
                  {fieldErrors.vaccineName}
                </p>
              )}
            </div>
          )}

          {/* Date Given & Next Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-slate-600 font-bold block">Date Administered *</label>
              <input
                type="date"
                value={dateGiven}
                onChange={(e) => {
                  setDateGiven(e.target.value);
                  if (touched.dateGiven) handleBlurField('dateGiven', e.target.value);
                }}
                onBlur={() => handleBlurField('dateGiven', dateGiven)}
                required
                className={`w-full px-3.5 py-2.5 rounded-xl font-semibold text-xs focus:outline-none cursor-pointer transition ${
                  fieldErrors.dateGiven && touched.dateGiven
                    ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'bg-[#F8FAF9] border border-slate-200 focus:border-[#237737]'
                }`}
              />
              {fieldErrors.dateGiven && touched.dateGiven && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">
                  {fieldErrors.dateGiven}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-600 font-bold block">Next Booster / Due Date</label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => {
                  setNextDueDate(e.target.value);
                  if (touched.nextDueDate) handleBlurField('nextDueDate', e.target.value);
                }}
                onBlur={() => handleBlurField('nextDueDate', nextDueDate)}
                className={`w-full px-3.5 py-2.5 rounded-xl font-semibold text-xs focus:outline-none cursor-pointer transition ${
                  fieldErrors.nextDueDate && touched.nextDueDate
                    ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'bg-[#F8FAF9] border border-slate-200 focus:border-[#237737]'
                }`}
              />
              {fieldErrors.nextDueDate && touched.nextDueDate && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">
                  {fieldErrors.nextDueDate}
                </p>
              )}
            </div>
          </div>

          {/* Quick Booster Presets */}
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-slate-400 font-bold">Quick Due:</span>
            <button
              type="button"
              onClick={() => setQuickDue(1)}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold cursor-pointer"
            >
              +1 Month Booster
            </button>
            <button
              type="button"
              onClick={() => setQuickDue(6)}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold cursor-pointer"
            >
              +6 Months
            </button>
            <button
              type="button"
              onClick={() => setQuickDue(12)}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold cursor-pointer"
            >
              +1 Year Annual
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-slate-600 font-bold block">Batch / Lot Number *</label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => {
                  setBatchNumber(e.target.value);
                  if (touched.batchNumber) handleBlurField('batchNumber', e.target.value);
                }}
                onBlur={() => handleBlurField('batchNumber', batchNumber)}
                required
                placeholder="e.g. ARV-2026-981 (min 3 chars)"
                className={`w-full px-3.5 py-2.5 rounded-xl font-semibold text-xs focus:outline-none transition ${
                  fieldErrors.batchNumber && touched.batchNumber
                    ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'bg-[#F8FAF9] border border-slate-200 focus:border-[#237737]'
                }`}
              />
              {fieldErrors.batchNumber && touched.batchNumber && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">
                  {fieldErrors.batchNumber}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-600 font-bold block">Clinical Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Subcutaneous / left flank / no adverse reaction"
                className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none focus:border-[#237737]"
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-extrabold rounded-xl transition cursor-pointer shadow-md shadow-[#237737]/15 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Record Vaccination</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVaccinationModal;
