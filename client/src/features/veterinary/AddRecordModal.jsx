import React, { useState, useEffect } from 'react';
import { X, Activity, Scissors, Stethoscope, RefreshCw, Check } from 'lucide-react';
import { createClinicalRecord } from '../../services/veterinaryService';
import {
  clinicalRecordSchema,
  extractZodErrors,
  validateField,
} from '../../utils/validationSchemas';

const AddRecordModal = ({
  showAddRecordModal,
  setShowAddRecordModal,
  animals = [],
  shelterData,
  onRecordCreated,
}) => {
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [visitType, setVisitType] = useState('Diagnosis');
  const [report, setReport] = useState('');
  const [status, setStatus] = useState('Ongoing');
  const [nextVisitDate, setNextVisitDate] = useState('');

  // Vitals
  const [temperature, setTemperature] = useState('101.5');
  const [weight, setWeight] = useState('');
  const [pulse, setPulse] = useState('90');
  const [mucosalColor, setMucosalColor] = useState('Pink & Healthy');

  // Surgery specifics
  const [isSurgery, setIsSurgery] = useState(false);
  const [procedureName, setProcedureName] = useState('Canine Spay / Neuter (OHE/Castration)');
  const [anesthesia, setAnesthesia] = useState('General Inhalation Anesthesia (Isoflurane)');
  const [postOpCare, setPostOpCare] = useState('Anti-inflammatory & antibiotic coverage for 5 days. Elizabethan collar applied.');

  // Validation states
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleBlurField = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(clinicalRecordSchema, field, value);
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
      if (animals[0].weight) setWeight(animals[0].weight);
    }
  }, [animals, selectedAnimalId]);

  if (!showAddRecordModal) return null;

  const handleAnimalChange = (e) => {
    const id = e.target.value;
    setSelectedAnimalId(id);
    const found = animals.find((a) => (a._id === id || a.animalId === id));
    if (found && found.weight) {
      setWeight(found.weight);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const validationData = {
      animalId: selectedAnimalId,
      report: report.trim(),
      temperature: temperature.trim(),
      weight: weight.trim(),
      isSurgery,
      procedureName: procedureName.trim(),
      anesthesia: anesthesia.trim(),
      postOpCare: postOpCare.trim(),
    };

    const parseResult = clinicalRecordSchema.safeParse(validationData);
    if (!parseResult.success) {
      const errs = extractZodErrors(parseResult.error);
      setFieldErrors(errs);
      setTouched({
        animalId: true,
        report: true,
        temperature: true,
        weight: true,
        procedureName: true,
        anesthesia: true,
      });
      const firstErr = Object.values(errs)[0];
      setErrorMsg(firstErr || 'Please check the form for errors.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        animalId: selectedAnimalId,
        type: isSurgery ? 'Surgery' : visitType,
        report: report.trim(),
        vitals: {
          temperature: temperature.trim(),
          weight: weight.trim(),
          pulse: pulse.trim(),
          mucosalColor: mucosalColor.trim(),
        },
        isSurgery,
        surgeryDetails: isSurgery
          ? {
              procedureName: procedureName.trim(),
              anesthesia: anesthesia.trim(),
              postOpCare: postOpCare.trim(),
            }
          : {},
        nextVisitDate: nextVisitDate || null,
        status,
      };

      const res = await createClinicalRecord(payload);
      if (res?.success) {
        if (onRecordCreated) onRecordCreated(res.record);
        setShowAddRecordModal(false);
        setReport('');
        setIsSurgery(false);
      } else {
        setErrorMsg(res?.message || 'Failed to save medical record.');
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Error saving record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl overflow-hidden max-w-xl w-full border border-slate-100 shadow-2xl p-6 md:p-8 space-y-6 animate-in fade-in zoom-in duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#237737] flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Log Animal Clinical Visit Report
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {shelterData?.shelterName || 'Shelter'} In-House Clinical Record
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddRecordModal(false)}
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
          {/* Patient Selection & Visit Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-slate-600 font-bold block">Patient Animal *</label>
              <select
                value={selectedAnimalId}
                onChange={handleAnimalChange}
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

            <div className="space-y-1.5">
              <label className="text-slate-600 font-bold block">Visit Type *</label>
              <select
                value={visitType}
                onChange={(e) => {
                  const val = e.target.value;
                  setVisitType(val);
                  if (val === 'Surgery') setIsSurgery(true);
                }}
                className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none focus:border-[#237737] cursor-pointer"
              >
                <option value="Diagnosis">Clinical Examination & Diagnosis</option>
                <option value="Treatment">Medical Treatment & Wound Care</option>
                <option value="Surgery">Surgical Procedure</option>
                <option value="Routine Checkup">Routine Physical Checkup</option>
              </select>
            </div>
          </div>

          {/* Vitals Row */}
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-1.5 text-slate-500 font-black uppercase text-[10px] tracking-wider">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>Patient Clinical Vitals</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block">Temp (°F)</label>
                <input
                  type="text"
                  value={temperature}
                  onChange={(e) => {
                    setTemperature(e.target.value);
                    if (touched.temperature) handleBlurField('temperature', e.target.value);
                  }}
                  onBlur={() => handleBlurField('temperature', temperature)}
                  placeholder="101.5 °F"
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none transition ${
                    fieldErrors.temperature && touched.temperature
                      ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'bg-white border border-slate-200 focus:border-[#237737]'
                  }`}
                />
                {fieldErrors.temperature && touched.temperature && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-0.5">
                    {fieldErrors.temperature}
                  </p>
                )}
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold block">Weight (kg)</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => {
                    setWeight(e.target.value);
                    if (touched.weight) handleBlurField('weight', e.target.value);
                  }}
                  onBlur={() => handleBlurField('weight', weight)}
                  placeholder="e.g. 14 kg"
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none transition ${
                    fieldErrors.weight && touched.weight
                      ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'bg-white border border-slate-200 focus:border-[#237737]'
                  }`}
                />
                {fieldErrors.weight && touched.weight && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-0.5">
                    {fieldErrors.weight}
                  </p>
                )}
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold block">Pulse (bpm)</label>
                <input
                  type="text"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  placeholder="90 bpm"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#237737]"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold block">Mucous Membrane</label>
                <input
                  type="text"
                  value={mucosalColor}
                  onChange={(e) => setMucosalColor(e.target.value)}
                  placeholder="Pink / Moist"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#237737]"
                />
              </div>
            </div>
          </div>

          {/* Clinical Findings & Report */}
          <div className="space-y-1.5">
            <label className="text-slate-600 font-bold block">
              Clinical Findings & Examination Report *
            </label>
            <textarea
              rows={3}
              value={report}
              onChange={(e) => {
                setReport(e.target.value);
                if (touched.report) handleBlurField('report', e.target.value);
              }}
              onBlur={() => handleBlurField('report', report)}
              placeholder="e.g. Patient presented with minor laceration on left forelimb. Sterile saline wash performed, antibiotic ointment applied, splint secured (min 10 chars)..."
              required
              className={`w-full px-3.5 py-2.5 rounded-xl font-semibold text-xs focus:outline-none transition ${
                fieldErrors.report && touched.report
                  ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                  : 'bg-[#F8FAF9] border border-slate-200 focus:border-[#237737]'
              }`}
            />
            {fieldErrors.report && touched.report && (
              <p className="text-[11px] text-rose-500 font-semibold mt-1">
                {fieldErrors.report}
              </p>
            )}
          </div>

          {/* Surgery Toggle & Fields */}
          <div className="p-3.5 bg-amber-50/50 border border-amber-200/70 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-amber-900 font-bold">
                <input
                  type="checkbox"
                  checked={isSurgery}
                  onChange={(e) => setIsSurgery(e.target.checked)}
                  className="accent-[#237737] rounded"
                />
                <span className="flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-amber-700" />
                  <span>Surgical Procedure Conducted</span>
                </span>
              </label>
              <span className="text-[10px] text-amber-700 font-semibold">OT Surgery Protocol</span>
            </div>

            {isSurgery && (
              <div className="space-y-2.5 pt-1">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block">Procedure Name *</label>
                  <input
                    type="text"
                    value={procedureName}
                    onChange={(e) => {
                      setProcedureName(e.target.value);
                      if (touched.procedureName) handleBlurField('procedureName', e.target.value);
                    }}
                    onBlur={() => handleBlurField('procedureName', procedureName)}
                    placeholder="e.g. Ovariohysterectomy (Canine Spay)"
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none transition ${
                      fieldErrors.procedureName && touched.procedureName
                        ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'bg-white border border-amber-200 focus:border-[#237737]'
                    }`}
                  />
                  {fieldErrors.procedureName && touched.procedureName && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-0.5">
                      {fieldErrors.procedureName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block">Anesthesia Protocol *</label>
                  <input
                    type="text"
                    value={anesthesia}
                    onChange={(e) => {
                      setAnesthesia(e.target.value);
                      if (touched.anesthesia) handleBlurField('anesthesia', e.target.value);
                    }}
                    onBlur={() => handleBlurField('anesthesia', anesthesia)}
                    placeholder="e.g. Xylazine + Ketamine premedication, Isoflurane maintenance"
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none transition ${
                      fieldErrors.anesthesia && touched.anesthesia
                        ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'bg-white border border-amber-200 focus:border-[#237737]'
                    }`}
                  />
                  {fieldErrors.anesthesia && touched.anesthesia && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-0.5">
                      {fieldErrors.anesthesia}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block">Post-Operative Instructions</label>
                  <input
                    type="text"
                    value={postOpCare}
                    onChange={(e) => setPostOpCare(e.target.value)}
                    placeholder="e.g. Strict cage rest 7 days, wound spray bid, suture removal on day 10"
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Status & Next Visit Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-slate-600 font-bold block">Treatment Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none focus:border-[#237737] cursor-pointer"
              >
                <option value="Ongoing">Ongoing</option>
                <option value="Critical">Critical Case (Intensive Care)</option>
                <option value="Improving">Improving / Convalescing</option>
                <option value="Completed">Completed / Discharged</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-600 font-bold block">Next Follow-Up Visit Date</label>
              <input
                type="date"
                value={nextVisitDate}
                onChange={(e) => setNextVisitDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none focus:border-[#237737] cursor-pointer"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddRecordModal(false)}
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
                  <span>Saving Record...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Clinical Record</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecordModal;
