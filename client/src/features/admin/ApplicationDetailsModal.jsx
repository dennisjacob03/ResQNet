import React from 'react';
import {
  Building2,
  Stethoscope,
  Truck,
  HeartHandshake,
  Calendar,
  X,
  Calendar as CalendarIcon,
  XCircle,
  FileText,
  CheckCircle,
} from 'lucide-react';

const ApplicationDetailsModal = ({
  isOpen,
  application,
  onClose,
  handleOpenScheduleSiteVisit,
  handleOpenReportModal,
  handleOpenScheduleTeamVisit,
  handleOpenTeamReportModal,
  handleOpenScheduleVolunteerVisit,
  handleOpenVolunteerReportModal,
  handleReviewApplication,
  handleReviewVetApp,
  handleReviewRescueApp,
  handleReviewVolunteerApp,
}) => {
  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#237737]/10 text-[#237737] font-black flex items-center justify-center shrink-0">
              {application._appType === 'Vet' ? (
                <Stethoscope className="w-6 h-6 text-teal-600" />
              ) : application._appType === 'Rescue' ? (
                <Truck className="w-6 h-6 text-blue-600" />
              ) : application._appType === 'Volunteer' ? (
                <HeartHandshake className="w-6 h-6 text-rose-600" />
              ) : (
                <Building2 className="w-6 h-6 text-[#237737]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  {application._name || 'Application Details'}
                </h3>
                {application._id2 && (
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-black rounded-lg">
                    #{application._id2}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                {application._subLabel || 'Registration Review'}
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

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-3 py-1 rounded-xl text-xs font-bold border ${
              application.status === 'Approved'
                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                : application.status === 'Rejected'
                ? 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                : application.status === 'Site Visit'
                ? 'bg-blue-500/10 text-blue-700 border-blue-200/50'
                : 'bg-amber-500/10 text-amber-700 border-amber-200/50'
            }`}
          >
            Review Status: {application.status}
          </span>

          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#237737]/10 text-[#237737] border border-[#237737]/30">
            Type: {application._appType} Application
          </span>
        </div>

        {/* Application Information Grid */}
        <div className="bg-[#F8FAF9] rounded-2xl p-4 border border-slate-100 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                Contact Person / Lead
              </span>
              <p className="font-extrabold text-slate-800 mt-0.5">
                {application.applicantId?.fullName ||
                  application.userId?.fullName ||
                  application.applicantName ||
                  application.teamLead ||
                  application.volunteerName ||
                  application._name}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                Contact Email
              </span>
              <p className="font-extrabold text-slate-800 mt-0.5">{application._contact}</p>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                Phone Number
              </span>
              <p className="font-extrabold text-slate-800 mt-0.5">
                +91{' '}
                {application.shelterPhoneNumber ||
                  application.phone ||
                  'Not provided'}
              </p>
            </div>

            {/* Specific Fields per Type */}
            {application._appType === 'Shelter' && (
              <>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    Registration Type
                  </span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {application.registrationType || 'STATE TRUST SOCIETY'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    Registration Number
                  </span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {application.registrationNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    Facility Capacity
                  </span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {application.occupiedCages || 0} / {application.totalCages || 0} cages
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    GPS Coordinates
                  </span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {application.latitude?.toFixed(4)}, {application.longitude?.toFixed(4)}
                  </p>
                </div>
                {(application.address ||
                  application.city ||
                  application.district ||
                  application.state ||
                  application.pincode) && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">
                      Shelter Physical Address
                    </span>
                    <p className="font-extrabold text-slate-800 mt-0.5">
                      {[
                        application.address,
                        application.city,
                        application.district,
                        application.state,
                        application.pincode ? `PIN: ${application.pincode}` : '',
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                )}
              </>
            )}

            {application._appType === 'Vet' && (
              <>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    Clinic / Hospital
                  </span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {application.clinicName || 'Private Practice'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    Registration / VCI Number
                  </span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {application.registrationNumber}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    Qualification
                  </span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {application.qualification}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    Clinical Experience
                  </span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {application.experienceYears} Years
                  </p>
                </div>
              </>
            )}

            {application._appType === 'Rescue' && (
              <>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    Operating District / Zone
                  </span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {application.operatingDistrict || application.coverageZone || 'Kerala'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    Vehicle & Fleet
                  </span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {application.vehicleNumber
                      ? `${application.vehicleNumber} (${application.vehicleType || 'Vehicle'})`
                      : application.vehicleFleet || 'Standard Fleet'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    Active Responders
                  </span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {application.totalMembers || application.memberCount || 1} team members
                  </p>
                </div>
                {application.equipment && application.equipment.length > 0 && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">
                      Rescue & Medical Equipment
                    </span>
                    <p className="font-extrabold text-slate-800 mt-0.5">
                      {Array.isArray(application.equipment)
                        ? application.equipment.join(', ')
                        : application.equipment}
                    </p>
                  </div>
                )}
                {application.address && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">
                      Base Address
                    </span>
                    <p className="font-extrabold text-slate-800 mt-0.5">
                      {application.address}
                    </p>
                  </div>
                )}
              </>
            )}

            {application._appType === 'Volunteer' && (
              <>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    District & City
                  </span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {application.district || 'Kerala'} {application.city ? `(${application.city})` : ''}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    Availability Schedule
                  </span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {Array.isArray(application.availability)
                      ? application.availability.join(', ')
                      : application.availability || 'Weekends'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    Vehicle & Transit Mobility
                  </span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {application.hasVehicle
                      ? `${application.vehicleNumber || 'Vehicle'} (${application.vehicleType || 'Car'})`
                      : 'No Vehicle'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    Emergency Contact
                  </span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {application.emergencyContact?.name
                      ? `${application.emergencyContact.name} (${application.emergencyContact.phone || 'N/A'})`
                      : 'Not provided'}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    Interests & Service Areas
                  </span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {Array.isArray(application.interests)
                      ? application.interests.join(' • ')
                      : application.interests}
                  </p>
                </div>
                {application.experienceNotes && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">
                      Candidate Experience & Motivation
                    </span>
                    <p className="font-semibold text-slate-700 mt-0.5 italic text-xs">
                      "{application.experienceNotes}"
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Site Visit Section for Shelter Applications */}
          {application._appType === 'Shelter' &&
            (application.siteVisitScheduleDate || application.status === 'Site Visit') && (
              <div className="pt-3 border-t border-slate-200/80 space-y-2 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                <div className="flex items-center gap-1.5 text-blue-900 font-black text-xs">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Physical Site Visit & Valuation Period</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-bold block">Valuation Scheduled Date</span>
                    <p className="font-black text-blue-900 mt-0.5">
                      {application.siteVisitScheduleDate
                        ? new Date(application.siteVisitScheduleDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Pending schedule'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">Valuation Window / Slot</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {application.siteVisitValuationPeriod || 'Standard Evaluation Window'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">Assigned Auditor</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {application.siteVisitInspector || 'Admin Field Officer'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">
                      Inspection Notes / Instructions
                    </span>
                    <p className="font-semibold text-slate-700 mt-0.5 italic">
                      {application.siteVisitNotes || 'Standard facility verification'}
                    </p>
                  </div>
                </div>

                {/* Site Visit Report */}
                {application.siteVisitReport && (
                  <div className="pt-2 border-t border-blue-200/60 mt-2">
                    <span className="text-blue-900 font-bold block uppercase text-[10px]">
                      Official Site Inspection & Valuation Report
                    </span>
                    <p className="font-medium text-slate-800 mt-1 bg-white p-2.5 rounded-lg border border-blue-100 text-xs">
                      {application.siteVisitReport}
                    </p>
                    {application.siteVisitReportDate && (
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                        Report Filed:{' '}
                        {new Date(application.siteVisitReportDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* Team Visit Section for Rescue Applications */}
          {application._appType === 'Rescue' &&
            (application.teamVisitScheduleDate || application.status === 'Team Visit') && (
              <div className="pt-3 border-t border-slate-200/80 space-y-2 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                <div className="flex items-center gap-1.5 text-blue-900 font-black text-xs">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Physical Team Visit & Vehicle Valuation</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-bold block">Valuation Scheduled Date</span>
                    <p className="font-black text-blue-900 mt-0.5">
                      {application.teamVisitScheduleDate
                        ? new Date(application.teamVisitScheduleDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Pending schedule'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">Valuation Window / Slot</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {application.teamVisitValuationPeriod || 'Standard Evaluation Window'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">Assigned Inspector</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {application.teamVisitInspector || 'Admin Field Officer'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">
                      Inspection Instructions
                    </span>
                    <p className="font-semibold text-slate-700 mt-0.5 italic">
                      {application.teamVisitNotes || 'Standard vehicle & equipment verification'}
                    </p>
                  </div>
                </div>

                {/* Team Visit Report */}
                {application.teamVisitReport && (
                  <div className="pt-2 border-t border-blue-200/60 mt-2 space-y-2">
                    <span className="text-blue-900 font-bold block uppercase text-[10px]">
                      Official Team Inspection & Valuation Report
                    </span>
                    {application.teamVisitChecks && (
                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        <span
                          className={`p-1 rounded font-bold ${
                            application.teamVisitChecks.vehicleVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {application.teamVisitChecks.vehicleVerified
                            ? '✓ Vehicle Verified'
                            : '— Vehicle'}
                        </span>
                        <span
                          className={`p-1 rounded font-bold ${
                            application.teamVisitChecks.equipmentVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {application.teamVisitChecks.equipmentVerified
                            ? '✓ Gear Verified'
                            : '— Gear'}
                        </span>
                        <span
                          className={`p-1 rounded font-bold ${
                            application.teamVisitChecks.membersVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {application.teamVisitChecks.membersVerified
                            ? '✓ Responders Ready'
                            : '— Responders'}
                        </span>
                        <span
                          className={`p-1 rounded font-bold ${
                            application.teamVisitChecks.safetyCompliance
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {application.teamVisitChecks.safetyCompliance
                            ? '✓ Safety Compliant'
                            : '— Safety'}
                        </span>
                      </div>
                    )}
                    <p className="font-medium text-slate-800 mt-1 bg-white p-2.5 rounded-lg border border-blue-100 text-xs">
                      {application.teamVisitReport}
                    </p>
                    {application.teamVisitReportDate && (
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                        Report Filed:{' '}
                        {new Date(application.teamVisitReportDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* Volunteer Visit Section */}
          {application._appType === 'Volunteer' &&
            (application.visitScheduleDate || application.status === 'Volunteer Visit') && (
              <div className="pt-3 border-t border-slate-200/80 space-y-2 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-1.5 text-emerald-900 font-black text-xs">
                  <Calendar className="w-4 h-4 text-[#237737]" />
                  <span>In-Person Volunteer Orientation & Verification</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-bold block">Orientation Scheduled Date</span>
                    <p className="font-black text-emerald-900 mt-0.5">
                      {application.visitScheduleDate
                        ? new Date(application.visitScheduleDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Pending schedule'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">Session Window / Slot</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {application.visitValuationPeriod || 'Standard Orientation Slot'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">Assigned Coordinator</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {application.visitCoordinator || 'Volunteer Officer'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">
                      Venue & Candidate Instructions
                    </span>
                    <p className="font-semibold text-slate-700 mt-0.5 italic">
                      {application.visitNotes || 'Photo ID verification & safety briefing'}
                    </p>
                  </div>
                </div>

                {/* Volunteer Visit Report */}
                {application.visitReport && (
                  <div className="pt-2 border-t border-emerald-200/60 mt-2 space-y-2">
                    <span className="text-emerald-900 font-bold block uppercase text-[10px]">
                      Official Orientation Assessment Report
                    </span>
                    {application.visitChecks && (
                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        <span
                          className={`p-1 rounded font-bold ${
                            application.visitChecks.identityVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {application.visitChecks.identityVerified
                            ? '✓ ID Verified'
                            : '— ID'}
                        </span>
                        <span
                          className={`p-1 rounded font-bold ${
                            application.visitChecks.animalHandlingReady
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {application.visitChecks.animalHandlingReady
                            ? '✓ Handling Ready'
                            : '— Handling'}
                        </span>
                        <span
                          className={`p-1 rounded font-bold ${
                            application.visitChecks.safetyOrientationDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {application.visitChecks.safetyOrientationDone
                            ? '✓ Safety Briefed'
                            : '— Safety'}
                        </span>
                        <span
                          className={`p-1 rounded font-bold ${
                            application.visitChecks.commitmentAgreement
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {application.visitChecks.commitmentAgreement
                            ? '✓ Pledge Signed'
                            : '— Pledge'}
                        </span>
                      </div>
                    )}
                    <p className="font-medium text-slate-800 mt-1 bg-white p-2.5 rounded-lg border border-emerald-100 text-xs">
                      {application.visitReport}
                    </p>
                    {application.visitReportDate && (
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                        Report Filed:{' '}
                        {new Date(application.visitReportDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* Review Note */}
          {application.reviewNote && !application.siteVisitReport && !application.teamVisitReport && (
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                Admin Review Note
              </span>
              <p className="font-semibold text-slate-700 mt-0.5 italic">
                {application.reviewNote}
              </p>
            </div>
          )}

          {/* Submitted timestamp */}
          <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-400 font-semibold">
            Submitted:{' '}
            {application._submittedAt
              ? new Date(application._submittedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : 'N/A'}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {application._appType === 'Rescue' ? (
            <div className="flex items-center gap-2">
              {application.status === 'Pending' && (
                <>
                  <button
                    onClick={() => {
                      onClose();
                      handleOpenScheduleTeamVisit(application);
                    }}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <CalendarIcon className="w-4 h-4" /> Schedule Team Visit
                  </button>
                  <button
                    onClick={() => {
                      handleReviewRescueApp(application._id || application.id, 'Rejected');
                      onClose();
                    }}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </>
              )}

              {application.status === 'Team Visit' && (
                <>
                  <button
                    onClick={() => {
                      onClose();
                      handleOpenTeamReportModal(application);
                    }}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <FileText className="w-4 h-4" /> Upload Report & Decide
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      handleOpenScheduleTeamVisit(application);
                    }}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Reschedule
                  </button>
                </>
              )}

              {(application.status === 'Approved' || application.status === 'Rejected') && (
                <span className="text-xs font-bold text-slate-400">
                  Application {application.status.toLowerCase()}.
                </span>
              )}
            </div>
          ) : application._appType === 'Shelter' ? (
            <div className="flex items-center gap-2">
              {application.status === 'Pending' && (
                <>
                  <button
                    onClick={() => {
                      onClose();
                      handleOpenScheduleSiteVisit(application);
                    }}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <CalendarIcon className="w-4 h-4" /> Schedule Site Visit
                  </button>
                  <button
                    onClick={() => {
                      handleReviewApplication(application._id, 'Rejected');
                      onClose();
                    }}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </>
              )}

              {application.status === 'Site Visit' && (
                <>
                  <button
                    onClick={() => {
                      onClose();
                      handleOpenReportModal(application);
                    }}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <FileText className="w-4 h-4" /> Upload Report & Decide
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      handleOpenScheduleSiteVisit(application);
                    }}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Reschedule
                  </button>
                </>
              )}

              {(application.status === 'Approved' || application.status === 'Rejected') && (
                <span className="text-xs font-bold text-slate-400">
                  Application {application.status.toLowerCase()}.
                </span>
              )}
            </div>
          ) : application._appType === 'Volunteer' ? (
            /* Volunteer actions */
            <div className="flex items-center gap-2">
              {application.status === 'Pending' && (
                <>
                  <button
                    onClick={() => {
                      onClose();
                      handleOpenScheduleVolunteerVisit(application);
                    }}
                    className="px-4 py-2.5 bg-[#237737] hover:bg-[#1b5e20] text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Calendar className="w-4 h-4" /> Schedule Orientation Session
                  </button>

                  <button
                    onClick={() => {
                      handleReviewVolunteerApp(application._id || application.id, 'Rejected');
                      onClose();
                    }}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </>
              )}

              {application.status === 'Volunteer Visit' && (
                <>
                  <button
                    onClick={() => {
                      onClose();
                      handleOpenVolunteerReportModal(application);
                    }}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <FileText className="w-4 h-4" /> Orientation Report & Decide
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      handleOpenScheduleVolunteerVisit(application);
                    }}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Reschedule
                  </button>
                </>
              )}

              {(application.status === 'Approved' || application.status === 'Rejected') && (
                <span className="text-xs font-bold text-slate-400">
                  Application {application.status.toLowerCase()}.
                </span>
              )}
            </div>
          ) : (
            /* Vet actions */
            <div className="flex items-center gap-2">
              {application.status === 'Pending' ? (
                <>
                  <button
                    onClick={() => {
                      handleReviewVetApp(application.id, 'Approved');
                      onClose();
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve Application
                  </button>

                  <button
                    onClick={() => {
                      handleReviewVetApp(application.id, 'Rejected');
                      onClose();
                    }}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </>
              ) : (
                <span className="text-xs font-bold text-slate-400">
                  Application {application.status.toLowerCase()}.
                </span>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal;
