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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl space-y-6 p-6 md:p-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Schedule Clinical Interview
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {application.fullName} • {application.position}
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

        {/* Candidate preview snippet */}
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 font-semibold block">Council Reg No:</span>
            <strong className="text-slate-800">{application.councilRegistrationNumber}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block">Qualification:</span>
            <strong className="text-slate-800">{application.qualification}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block">Experience:</span>
            <strong className="text-slate-800">{application.experienceYears} Years</strong>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition cursor-pointer shadow-md shadow-blue-600/15 disabled:opacity-50 inline-flex items-center gap-1.5"
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
