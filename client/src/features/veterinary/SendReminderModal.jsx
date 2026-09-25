import React, { useState, useEffect } from 'react';
import { X, Bell, Calendar, AlertTriangle, RefreshCw, Check, Send } from 'lucide-react';
import { sendShelterAnimalReminder } from '../../services/veterinaryService';
import {
  reminderModalSchema,
  extractZodErrors,
  validateField,
} from '../../utils/validationSchemas';

const REMINDER_TYPES = [
  'Vaccination Due',
  'Post-Op Checkup',
  'Routine Examination',
  'Medication Schedule',
];

const SendReminderModal = ({
  isOpen,
  onClose,
  animals = [],
  initialAnimal = null,
  initialVaccination = null,
  shelterData,
  onReminderSent,
}) => {
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [reminderType, setReminderType] = useState('Vaccination Due');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Field validation states
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleBlurField = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(reminderModalSchema, field, value);
    setFieldErrors((prev) => {
      const updated = { ...prev };
      if (err) updated[field] = err;
      else delete updated[field];
      return updated;
    });
  };

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (initialAnimal) {
      setSelectedAnimalId(initialAnimal._id || initialAnimal.animalId);
    } else if (animals && animals.length > 0 && !selectedAnimalId) {
      setSelectedAnimalId(animals[0]._id || animals[0].animalId);
    }

    if (initialVaccination) {
      setReminderType('Vaccination Due');
      if (initialVaccination.nextDueDate) {
        const d = new Date(initialVaccination.nextDueDate).toISOString().split('T')[0];
        setDueDate(d);
      }
      setNotes(`Booster vaccination for ${initialVaccination.vaccineName} scheduled.`);
    } else {
      // Default to 7 days from now
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setDueDate(d.toISOString().split('T')[0]);
      setNotes('Please prepare the patient and coordinate handler support for this scheduled care session.');
    }
    setErrorMsg('');
    setSuccessMsg('');
    setFieldErrors({});
    setTouched({});
  }, [isOpen, initialAnimal, initialVaccination, animals]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const validationData = {
      animalId: selectedAnimalId,
      reminderType,
      dueDate,
      notes: notes.trim(),
    };

    const parseResult = reminderModalSchema.safeParse(validationData);
    if (!parseResult.success) {
      const errs = extractZodErrors(parseResult.error);
      setFieldErrors(errs);
      setTouched({ animalId: true, reminderType: true, dueDate: true, notes: true });
      const firstErr = Object.values(errs)[0];
      setErrorMsg(firstErr || 'Please check the form for errors.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        animalId: selectedAnimalId,
        reminderType,
        dueDate,
        notes: notes.trim(),
        vaccinationId: initialVaccination?._id || null,
      };

      const res = await sendShelterAnimalReminder(payload);
      if (res?.success) {
        setSuccessMsg(res.message || 'Reminder sent to shelter successfully!');
        if (onReminderSent) onReminderSent(res.reminder);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res?.message || 'Failed to send reminder.');
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Failed to dispatch reminder.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAnimalObj = animals.find(
    (a) => a._id === selectedAnimalId || a.animalId === selectedAnimalId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 md:p-8 space-y-5 animate-in fade-in zoom-in duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Send Healthcare Reminder to Shelter
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Dispatches high-priority in-app alert & official email to{' '}
                <strong>{shelterData?.shelterName || 'Shelter'}</strong>
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

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
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
                  : 'bg-[#F8FAF9] border border-slate-200 focus:border-orange-500'
              }`}
            >
              {animals.length === 0 && <option value="">No animals found</option>}
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
            {selectedAnimalObj && (
              <span className="text-[11px] text-slate-400 block pt-0.5">
                Resident ID: <strong>{selectedAnimalObj.animalId || 'ANM'}</strong> • Species:{' '}
                <strong>{selectedAnimalObj.species}</strong> • Breed:{' '}
                <strong>{selectedAnimalObj.breed || 'Mixed'}</strong>
              </span>
            )}
          </div>

          {/* Reminder Type & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-slate-600 font-bold block">Reminder Type *</label>
              <select
                value={reminderType}
                onChange={(e) => setReminderType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl font-semibold text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                {REMINDER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-600 font-bold block">Scheduled Due Date *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (touched.dueDate) handleBlurField('dueDate', e.target.value);
                }}
                onBlur={() => handleBlurField('dueDate', dueDate)}
                required
                className={`w-full px-3.5 py-2.5 rounded-xl font-semibold text-xs focus:outline-none cursor-pointer transition ${
                  fieldErrors.dueDate && touched.dueDate
                    ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'bg-[#F8FAF9] border border-slate-200 focus:border-orange-500'
                }`}
              />
              {fieldErrors.dueDate && touched.dueDate && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">
                  {fieldErrors.dueDate}
                </p>
              )}
            </div>
          </div>

          {/* Attending Notes */}
          <div className="space-y-1.5">
            <label className="text-slate-600 font-bold block">
              Instructions & Notes for Shelter Team *
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (touched.notes) handleBlurField('notes', e.target.value);
              }}
              onBlur={() => handleBlurField('notes', notes)}
              placeholder="e.g. Ensure animal is isolated, fasted if required, and calm before attending doctor arrives (min 5 chars)..."
              required
              className={`w-full px-3.5 py-2.5 rounded-xl font-semibold text-xs focus:outline-none transition ${
                fieldErrors.notes && touched.notes
                  ? 'border border-rose-400 bg-rose-50/20 focus:border-rose-500'
                  : 'bg-[#F8FAF9] border border-slate-200 focus:border-orange-500'
              }`}
            />
            {fieldErrors.notes && touched.notes && (
              <p className="text-[11px] text-rose-500 font-semibold mt-1">
                {fieldErrors.notes}
              </p>
            )}
          </div>

          <div className="p-3 bg-orange-50/70 border border-orange-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-orange-950">
            <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <span>
              This will automatically trigger an urgent in-app notification to the shelter manager
              and send a structured clinical alert email to the shelter's primary contact.
            </span>
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
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold rounded-xl transition cursor-pointer shadow-md shadow-orange-600/15 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reminder to Shelter</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendReminderModal;
