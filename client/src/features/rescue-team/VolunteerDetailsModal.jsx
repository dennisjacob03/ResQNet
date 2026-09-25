import React from 'react';
import {
  HeartHandshake,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Car,
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  FileText,
} from 'lucide-react';

const VolunteerDetailsModal = ({
  isOpen,
  application,
  onClose,
  onOpenScheduleVisit,
  onOpenReportModal,
}) => {
  if (!isOpen || !application) return null;

  const status = application.applicationStatus || 'Pending';
  const statusBadge =
    status === 'Approved'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : status === 'Volunteer Visit'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : status === 'Rejected'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#237737]/10 text-[#237737] font-black flex items-center justify-center text-xl shrink-0">
              {application.fullName ? application.fullName.charAt(0).toUpperCase() : 'V'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-extrabold text-slate-900">{application.fullName}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${statusBadge}`}>
                  {status}
                </span>
                {application.volunteerId && (
                  <span className="px-2.5 py-0.5 bg-[#237737] text-white rounded-lg text-xs font-black">
                    Badge: {application.volunteerId}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Application #{application.volunteerApplicationId || 'VAP-0001'} • Submitted on{' '}
                {application.createdAt
                  ? new Date(application.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Recent'}
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

        {/* Contact & Location Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Contact Information
            </span>
            <p className="font-semibold text-slate-700 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#237737]" />
              <a href={`tel:${application.phone}`} className="hover:underline">
                {application.phone}
              </a>
            </p>
            <p className="font-semibold text-slate-700 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#237737]" />
              <a href={`mailto:${application.email}`} className="hover:underline">
                {application.email}
              </a>
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Operational District
            </span>
            <p className="font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>
                {application.district}
                {application.city ? `, ${application.city}` : ''}
              </span>
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              {application.address || 'District resident'}
            </p>
          </div>
        </div>

        {/* Emergency Contact */}
        {application.emergencyContact && (
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Emergency Contact
            </span>
            <p className="font-bold text-slate-800">
              {application.emergencyContact.name || 'Not specified'}{' '}
              {application.emergencyContact.relation && (
                <span className="text-slate-400 font-normal">
                  ({application.emergencyContact.relation})
                </span>
              )}
              {application.emergencyContact.phone && (
                <span className="text-slate-600 font-semibold ml-2">
                  • {application.emergencyContact.phone}
                </span>
              )}
            </p>
          </div>
        )}

        {/* Availability & Skills & Transport */}
        <div className="space-y-3 text-xs">
          {/* Availability */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Availability
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Array.isArray(application.availability) && application.availability.length > 0 ? (
                application.availability.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg font-bold border border-emerald-200/60"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-slate-400">Flexible</span>
              )}
            </div>
          </div>

          {/* Interests */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Preferred Interest Areas
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Array.isArray(application.interests) && application.interests.length > 0 ? (
                application.interests.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg font-semibold border border-blue-200/60"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-slate-400">General Support</span>
              )}
            </div>
          </div>

          {/* Skills */}
          {Array.isArray(application.skills) && application.skills.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Candidate Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {application.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-purple-50 text-purple-800 rounded-lg font-semibold border border-purple-200/60"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Transport / Vehicle */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-800 block">
                {application.hasVehicle
                  ? `Has Personal Vehicle: ${application.vehicleType || 'Vehicle'}`
                  : 'No Personal Vehicle (Public transit/field transport)'}
              </span>
              {application.vehicleNumber && (
                <span className="text-slate-400 font-mono text-[11px]">
                  Reg: {application.vehicleNumber}
                </span>
              )}
            </div>
          </div>

          {/* Experience Notes */}
          {application.experienceNotes && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Past Experience & Motivations
              </span>
              <p className="text-slate-700 leading-relaxed font-medium">
                {application.experienceNotes}
              </p>
            </div>
          )}
        </div>

        {/* Orientation & Evaluation Assessment Record */}
        {(application.visitScheduleDate || application.visitReport) && (
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold">
              <ShieldCheck className="w-4 h-4 text-[#237737]" />
              <span>Orientation & Verification Audit Record</span>
            </div>

            {application.visitScheduleDate && (
              <p className="text-slate-700">
                <strong>Scheduled:</strong>{' '}
                {new Date(application.visitScheduleDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}{' '}
                {application.visitValuationPeriod && `(${application.visitValuationPeriod})`} •{' '}
                Coordinator: {application.visitCoordinator || 'Field Responder'}
              </p>
            )}

            {application.visitReport && (
              <div className="mt-2 pt-2 border-t border-emerald-200/60">
                <p className="text-slate-800">
                  <strong>Report Notes:</strong> {application.visitReport}
                </p>
                {application.visitReportDecision && (
                  <p className="mt-1 font-bold text-[#237737]">
                    Result: {application.visitReportDecision}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {status === 'Pending' && (
              <button
                onClick={() => {
                  onClose();
                  onOpenScheduleVisit(application);
                }}
                className="px-4 py-2 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" /> Schedule Orientation
              </button>
            )}

            {status === 'Volunteer Visit' && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onOpenReportModal(application);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" /> Submit Evaluation Report
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenScheduleVisit(application);
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Reschedule
                </button>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDetailsModal;
