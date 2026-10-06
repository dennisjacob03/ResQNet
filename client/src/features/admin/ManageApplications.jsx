import React from 'react';
import {
  ClipboardList,
  Search,
  RefreshCw,
  Building2,
  Stethoscope,
  Truck,
  HeartHandshake,
  Mail,
  Calendar,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const ManageApplications = ({
  shelterApplications = [],
  vetApplications = [],
  rescueTeamApplications = [],
  volunteerApplications = [],
  shelterAppsLoading = false,
  shelterAppSearchQuery = '',
  setShelterAppSearchQuery,
  applicationsCategoryTab = 'All',
  setApplicationsCategoryTab,
  shelterAppFilterStatus = 'All',
  setShelterAppFilterStatus,
  shelterReviewing = {},
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
  setSelectedApplicationForModal,
  setShowApplicationDetailsModal,
}) => {
  const allApps = [
    ...shelterApplications.map((a) => ({
      ...a,
      _appType: 'Shelter',
      _name: a.shelterName,
      _contact: a.applicantId?.email || a.userId?.email || a.shelterEmail || a.email,
      _subLabel: `Reg: ${a.registrationNumber || 'N/A'} • ${a.operatingDistrict || a.district || 'Kerala'}`,
      _id2: a.shelterApplicationId || a.shelterId || a.id,
      _submittedAt: a.createdAt || a.submittedAt,
      status: a.applicationStatus || a.status || 'Pending',
    })),
    ...vetApplications.map((a) => ({
      ...a,
      _appType: 'Vet',
      _name: a.applicantName || a.clinicName,
      _contact: a.email,
      _subLabel: `${a.qualification || 'Vet'} • ${a.experienceYears || '0'}yr exp`,
      _id2: a.id,
      _submittedAt: a.submittedAt,
      status: a.status || 'Pending',
    })),
    ...rescueTeamApplications.map((a) => ({
      ...a,
      _appType: 'Rescue',
      _name: a.rescueTeamName,
      _contact: a.applicantId?.email || a.userId?.email || a.contactEmail || a.email,
      _subLabel: `${a.operatingDistrict || 'Kerala'} • ${a.vehicleType || 'Vehicle'} (${a.vehicleNumber || 'N/A'})`,
      _id2: a.rescueTeamApplicationId || a._id || a.id,
      _submittedAt: a.createdAt || a.submittedAt,
      status: a.applicationStatus || a.status || 'Pending',
    })),
    ...volunteerApplications.map((a) => ({
      ...a,
      _appType: 'Volunteer',
      _name: a.fullName || a.volunteerName,
      _contact: a.email,
      _subLabel: `${a.district || 'Kerala'} • ${
        Array.isArray(a.availability) ? a.availability.join(', ') : a.availability || 'Weekends'
      }`,
      _id2: a.volunteerApplicationId || a.id || a._id,
      _submittedAt: a.createdAt || a.submittedAt,
      status: a.applicationStatus || a.status || 'Pending',
    })),
  ];

  const q = shelterAppSearchQuery.toLowerCase().trim();
  const filtered = allApps.filter((a) => {
    const matchType =
      applicationsCategoryTab === 'All' || a._appType === applicationsCategoryTab;
    const matchStatus =
      shelterAppFilterStatus === 'All' ||
      a.status === shelterAppFilterStatus ||
      (shelterAppFilterStatus === 'Site Visit' &&
        (a.status === 'Team Visit' || a.status === 'Volunteer Visit'));
    const matchSearch =
      !q ||
      a._name?.toLowerCase().includes(q) ||
      a._contact?.toLowerCase().includes(q) ||
      a._id2?.toLowerCase().includes(q);
    return matchType && matchStatus && matchSearch;
  });

  const typeConfig = {
    Shelter: {
      color: 'bg-[#237737]/10 text-[#237737] border-[#237737]/30',
      icon: <Building2 className="w-3.5 h-3.5" />,
      label: '🏢 Shelter',
    },
    Vet: {
      color: 'bg-teal-500/10 text-teal-700 border-teal-200/50',
      icon: <Stethoscope className="w-3.5 h-3.5" />,
      label: '🩺 Vet',
    },
    Rescue: {
      color: 'bg-blue-500/10 text-blue-700 border-blue-200/50',
      icon: <Truck className="w-3.5 h-3.5" />,
      label: '🚑 Rescue',
    },
    Volunteer: {
      color: 'bg-rose-500/10 text-rose-700 border-rose-200/50',
      icon: <HeartHandshake className="w-3.5 h-3.5" />,
      label: '🤝 Volunteer',
    },
  };

  return (
    <div className="space-y-6">
      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Applications
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {shelterApplications.length +
              vetApplications.length +
              rescueTeamApplications.length +
              volunteerApplications.length}
          </div>
          <div className="text-[10px] font-bold text-blue-600 mt-0.5">All types combined</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Pending Review
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {
              [
                ...shelterApplications,
                ...vetApplications,
                ...rescueTeamApplications,
                ...volunteerApplications,
              ].filter((a) => (a.applicationStatus || a.status) === 'Pending').length
            }
          </div>
          <div className="text-[10px] font-bold text-amber-600 mt-0.5">
            Awaiting site visit / review
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Inspections
          </div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {
              allApps.filter(
                (a) => a.status === 'Site Visit' || a.status === 'Team Visit'
              ).length
            }
          </div>
          <div className="text-[10px] font-bold text-blue-600 mt-0.5">
            Shelter & Team visits active
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Processed</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {
              [
                ...shelterApplications,
                ...vetApplications,
                ...rescueTeamApplications,
                ...volunteerApplications,
              ].filter((a) => (a.applicationStatus || a.status) === 'Approved').length
            }
          </div>
          <div className="text-[10px] font-bold text-slate-400 mt-0.5">
            {
              [
                ...shelterApplications,
                ...vetApplications,
                ...rescueTeamApplications,
                ...volunteerApplications,
              ].filter((a) => (a.applicationStatus || a.status) === 'Rejected').length
            }{' '}
            rejected
          </div>
        </div>
      </div>

      {/* ── Filter & Search Bar ── */}
      <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={shelterAppSearchQuery}
                onChange={(e) => setShelterAppSearchQuery(e.target.value)}
                placeholder="Search by name, email, ID…"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#237737] text-xs font-semibold transition"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            </div>

            {/* Application Type Dropdown */}
            <select
              value={applicationsCategoryTab}
              onChange={(e) => setApplicationsCategoryTab(e.target.value)}
              className="px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
            >
              <option value="All">All Application Types</option>
              <option value="Shelter">🏢 Shelter Registration</option>
              <option value="Vet">🩺 Vet Staff</option>
              <option value="Rescue">🚑 Rescue Team</option>
              <option value="Volunteer">🤝 Volunteer</option>
            </select>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {['All', 'Pending', 'Site Visit', 'Approved', 'Rejected'].map((st) => {
                const pendingCount = allApps.filter((a) => a.status === 'Pending').length;
                const siteVisitCount = allApps.filter(
                  (a) => a.status === 'Site Visit' || a.status === 'Team Visit'
                ).length;

                return (
                  <button
                    key={st}
                    onClick={() => setShelterAppFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      shelterAppFilterStatus === st
                        ? 'bg-[#237737] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{st === 'Site Visit' ? 'Valuation Visits' : st === 'All' ? 'All Statuses' : st}</span>
                    {st === 'Pending' && pendingCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-amber-400 text-amber-950 text-[10px] rounded-full font-black">
                        {pendingCount}
                      </span>
                    )}
                    {st === 'Site Visit' && siteVisitCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-blue-400 text-blue-950 text-[10px] rounded-full font-black">
                        {siteVisitCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <span className="text-xs text-slate-400 font-extrabold">
              {filtered.length} of {allApps.length} applications
            </span>
          </div>
        </div>

        {/* Loading */}
        {shelterAppsLoading && (
          <div className="p-12 bg-[#F8FAF9] border border-slate-100 rounded-2xl text-center text-slate-400 text-sm font-semibold animate-pulse flex items-center justify-center gap-2.5">
            <RefreshCw className="w-5 h-5 animate-spin text-[#237737]" />
            <span>Loading applications from database…</span>
          </div>
        )}

        {/* Unified Applications Table */}
        {!shelterAppsLoading && (
          <>
            {filtered.length === 0 ? (
              <div className="p-10 bg-[#F8FAF9] border border-slate-100 rounded-2xl text-center">
                <div className="p-4 bg-slate-100 rounded-2xl w-fit mx-auto mb-3">
                  <ClipboardList className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-500 font-semibold text-sm">No applications found.</p>
                <p className="text-slate-400 font-medium text-xs mt-1">
                  Try adjusting the filters or search query.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="pb-3.5 pl-4">Applicant / Application</th>
                      <th className="pb-3.5">Type</th>
                      <th className="pb-3.5">Contact</th>
                      <th className="pb-3.5">Status</th>
                      <th className="pb-3.5">Submitted</th>
                      <th className="pb-3.5 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {filtered.map((app, idx) => {
                      const tc = typeConfig[app._appType] || typeConfig.Shelter;
                      const appKey = app._id || app.id || idx;
                      const statusBadge =
                        app.status === 'Approved'
                          ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                          : app.status === 'Rejected'
                          ? 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                          : app.status === 'Site Visit'
                          ? 'bg-blue-500/10 text-blue-700 border-blue-200/50'
                          : 'bg-amber-500/10 text-amber-700 border-amber-200/50';

                      const submittedDate = app._submittedAt
                        ? new Date(app._submittedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'N/A';

                      return (
                        <tr key={appKey} className="hover:bg-slate-50/70 transition">
                          {/* Applicant / Application Column */}
                          <td className="py-4 pl-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${tc.color}`}
                              >
                                {tc.icon}
                              </div>
                              <div className="space-y-0.5">
                                <h4 className="font-extrabold text-slate-900 text-sm">
                                  {app._name}
                                </h4>
                                <div className="text-[11px] text-slate-400 font-semibold">
                                  {app._subLabel}
                                </div>
                                {app._id2 && (
                                  <div className="text-[10px] text-slate-300 font-bold">
                                    #{app._id2}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Type Column */}
                          <td className="py-4">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${tc.color}`}
                            >
                              {tc.label}
                            </span>
                          </td>

                          {/* Contact Column */}
                          <td className="py-4">
                            <div className="flex items-center gap-1.5 text-slate-700 max-w-[180px]">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{app._contact}</span>
                            </div>
                          </td>

                          {/* Status Column */}
                          <td className="py-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                                app.status === 'Approved'
                                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                                  : app.status === 'Rejected'
                                  ? 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                                  : app.status === 'Site Visit' ||
                                    app.status === 'Team Visit' ||
                                    app.status === 'Volunteer Visit'
                                  ? 'bg-blue-500/10 text-blue-700 border-blue-200/50'
                                  : 'bg-amber-500/10 text-amber-700 border-amber-200/50'
                              }`}
                            >
                              {app.status}
                            </span>
                            {(app.status === 'Site Visit' ||
                              app.status === 'Team Visit' ||
                              app.status === 'Volunteer Visit') &&
                              (app.siteVisitScheduleDate ||
                                app.teamVisitScheduleDate ||
                                app.visitScheduleDate) && (
                              <div className="text-[10px] text-blue-600 font-bold mt-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(
                                  app.siteVisitScheduleDate ||
                                    app.teamVisitScheduleDate ||
                                    app.visitScheduleDate
                                ).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </div>
                            )}
                          </td>

                          {/* Submitted Column */}
                          <td className="py-4 text-slate-400 text-xs font-semibold whitespace-nowrap">
                            {submittedDate}
                          </td>

                          {/* Actions Column */}
                          <td className="py-4 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Preview Modal Button */}
                              <button
                                onClick={() => {
                                  setSelectedApplicationForModal(app);
                                  setShowApplicationDetailsModal(true);
                                }}
                                title="View Application Details"
                                className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Shelter Application Flow */}
                              {app._appType === 'Shelter' ? (
                                <>
                                  {app.status === 'Pending' && (
                                    <>
                                      <button
                                        onClick={() => handleOpenScheduleSiteVisit(app)}
                                        title="Schedule Physical Site Visit & Valuation Period"
                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                                      >
                                        <Calendar className="w-3.5 h-3.5" />
                                        Schedule Site Visit
                                      </button>
                                      <button
                                        onClick={() => handleReviewApplication(app._id, 'Rejected')}
                                        disabled={shelterReviewing[app._id]}
                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 disabled:opacity-60 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer"
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                        Reject
                                      </button>
                                    </>
                                  )}

                                  {app.status === 'Site Visit' && (
                                    <>
                                      <button
                                        onClick={() => handleOpenReportModal(app)}
                                        title="Upload Site Inspection Report & Finalize Approval"
                                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                        Report & Decide
                                      </button>
                                      <button
                                        onClick={() => handleOpenScheduleSiteVisit(app)}
                                        title="Reschedule Valuation Date"
                                        className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition cursor-pointer"
                                      >
                                        <Calendar className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}

                                  {(app.status === 'Approved' || app.status === 'Rejected') && (
                                    <span className="text-[11px] text-slate-400 font-semibold px-2 py-1 bg-slate-50 rounded-lg">
                                      {app.status === 'Approved' ? '✓ Approved' : '✗ Rejected'}
                                    </span>
                                  )}
                                </>
                              ) : app._appType === 'Rescue' ? (
                                /* Rescue Team Application Flow */
                                <>
                                  {app.status === 'Pending' && (
                                    <>
                                      <button
                                        onClick={() => handleOpenScheduleTeamVisit(app)}
                                        title="Schedule Physical Team Visit & Vehicle Valuation"
                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                                      >
                                        <Calendar className="w-3.5 h-3.5" />
                                        Schedule Team Visit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleReviewRescueApp(app._id || app.id, 'Rejected')
                                        }
                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer"
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                        Reject
                                      </button>
                                    </>
                                  )}

                                  {app.status === 'Team Visit' && (
                                    <>
                                      <button
                                        onClick={() => handleOpenTeamReportModal(app)}
                                        title="Submit Team Inspection Report & Decide"
                                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                        Report & Decide
                                      </button>
                                      <button
                                        onClick={() => handleOpenScheduleTeamVisit(app)}
                                        title="Reschedule Valuation Date"
                                        className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition cursor-pointer"
                                      >
                                        <Calendar className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}

                                  {(app.status === 'Approved' || app.status === 'Rejected') && (
                                    <span className="text-[11px] text-slate-400 font-semibold px-2 py-1 bg-slate-50 rounded-lg">
                                      {app.status === 'Approved' ? '✓ Approved' : '✗ Rejected'}
                                    </span>
                                  )}
                                </>
                              ) : app._appType === 'Volunteer' ? (
                                /* Volunteer Application Flow */
                                <>
                                  {app.status === 'Pending' && (
                                    <>
                                      <button
                                        onClick={() => handleOpenScheduleVolunteerVisit(app)}
                                        title="Schedule Volunteer Orientation & Verification Visit"
                                        className="flex items-center gap-1 px-3 py-1.5 bg-[#237737] hover:bg-[#1b5e20] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                                      >
                                        <Calendar className="w-3.5 h-3.5" />
                                        Schedule Orientation Visit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleReviewVolunteerApp(app._id || app.id, 'Rejected')
                                        }
                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer"
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                        Reject
                                      </button>
                                    </>
                                  )}

                                  {app.status === 'Volunteer Visit' && (
                                    <>
                                      <button
                                        onClick={() => handleOpenVolunteerReportModal(app)}
                                        title="Submit Orientation Assessment Report & Decide"
                                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                        Report & Decide
                                      </button>
                                      <button
                                        onClick={() => handleOpenScheduleVolunteerVisit(app)}
                                        title="Reschedule Orientation Session"
                                        className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition cursor-pointer"
                                      >
                                        <Calendar className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}

                                  {(app.status === 'Approved' || app.status === 'Rejected') && (
                                    <span className="text-[11px] text-slate-400 font-semibold px-2 py-1 bg-slate-50 rounded-lg">
                                      {app.status === 'Approved' ? '✓ Approved' : '✗ Rejected'}
                                    </span>
                                  )}
                                </>
                              ) : (
                                /* Vet & other actions */
                                <>
                                  {app.status === 'Pending' ? (
                                    <>
                                      <button
                                        onClick={() => handleReviewVetApp(app.id, 'Approved')}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                                      </button>
                                      <button
                                        onClick={() => handleReviewVetApp(app.id, 'Rejected')}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer"
                                      >
                                        <XCircle className="w-3.5 h-3.5" /> Reject
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-[11px] text-slate-300 font-semibold px-2 py-1 bg-slate-50 rounded-lg">
                                      {app.status === 'Approved' ? '✓ Processed' : '✗ Declined'}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManageApplications;
