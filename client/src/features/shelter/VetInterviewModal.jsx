import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  AlertCircle,
  RefreshCw,
  Check,
  Stethoscope,
} from 'lucide-react';
import { scheduleVetInterview } from '../../services/veterinaryService';

const TIME_SLOT_OPTIONS = [
  '09:00 AM - 11:00 AM (Morning Round)',
  '11:00 AM - 01:00 PM (Clinical Assessment)',
  '02:00 PM - 04:00 PM (Surgical Review)',
  '04:00 PM - 06:00 PM (Evening Consultation)',
];

const VetInterviewModal = ({
  isOpen,
  onClose,
  application,
  shelterData,
  onInterviewScheduled,
}) => {
  const [interviewDate, setInterviewDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOT_OPTIONS[0]);
  const [location, setLocation] = useState('');
  const [interviewer, setInterviewer] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (application) {
      // Default to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      setInterviewDate(`${yyyy}-${mm}-${dd}`);

      setLocation(
        application.interviewLocation ||
          `${shelterData?.shelterName || 'Shelter'} - Clinical & Surgical Wing`
      );
      setInterviewer(
        application.interviewInterviewer ||
          'Shelter Medical Director / Senior Veterinarian'
      );
      setNotes(
        application.interviewNotes ||
          'Please bring your original Veterinary Council registration certificate, degree transcripts, and surgical log.'
      );
      setErrorMsg('');
    }
  }, [application, shelterData]);

  if (!isOpen || !application) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!interviewDate) {
      setErrorMsg('Please select an interview date.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        interviewScheduleDate: interviewDate,
        interviewTimeSlot: timeSlot,
        interviewLocation: location.trim(),
        interviewInterviewer: interviewer.trim(),
        interviewNotes: notes.trim(),
      };

      const res = await scheduleVetInterview(application._id, payload);
      if (res?.success) {
        if (onInterviewScheduled) onInterviewScheduled(res.application);
        onClose();
      } else {
        setErrorMsg(res?.message || 'Failed to schedule interview.');
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Scheduling failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
                Schedule Clinical Interview
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                {application.fullName} • {application.position}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer shrink-0 ml-2"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-slate-800">
            {/* Candidate preview snippet */}
            <div className="p-3 sm:p-3.5 bg-slate-50 border border-slate-100 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Council Reg No:</span>
                <strong className="text-slate-800 truncate block">{application.councilRegistrationNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Qualification:</span>
                <strong className="text-slate-800 truncate block">{application.qualification}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Experience:</span>
                <strong className="text-slate-800 truncate block">{application.experienceYears} Years</strong>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start sm:items-center gap-2 text-rose-800 text-xs font-bold leading-snug">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Interview Date *</span>
              </label>
              <input
                type="date"
                min={todayStr}
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Time Slot *</span>
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] cursor-pointer"
              >
                {TIME_SLOT_OPTIONS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Clinic / In-Person Location</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Hope Animal Shelter - Small Animal OT & Examination Room"
              required
              className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Lead Interviewer / Examiner</span>
            </label>
            <input
              type="text"
              value={interviewer}
              onChange={(e) => setInterviewer(e.target.value)}
              placeholder="e.g. Dr. K. Menon (Senior Vet Surgeon) & Shelter Manager"
              required
              className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Instructions / Notes for Candidate</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Documents to bring, surgical scrub requirements, etc."
              className="w-full px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
            />
          </div>
        </div>

          {/* Footer actions - Fixed at Bottom */}
          <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 shrink-0 bg-slate-50/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl transition cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition cursor-pointer shadow-md shadow-blue-600/15 disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Interview Schedule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VetInterviewModal;
