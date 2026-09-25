import React, { useState } from 'react';
import {
  HeartHandshake,
  Search,
  Filter,
  Calendar,
  FileText,
  Eye,
  CheckCircle,
  Clock,
  Car,
  MapPin,
  RefreshCw,
  Phone,
  Mail,
  AlertTriangle,
  Award,
} from 'lucide-react';

const ManageVolunteers = ({
  volunteerApplications = [],
  loading = false,
  onRefresh,
  onOpenScheduleVisit,
  onOpenReportModal,
  onOpenDetailsModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');

  const pendingCount = volunteerApplications.filter(
    (a) => (a.applicationStatus || a.status) === 'Pending'
  ).length;
  const visitCount = volunteerApplications.filter(
    (a) => (a.applicationStatus || a.status) === 'Volunteer Visit'
  ).length;
  const approvedCount = volunteerApplications.filter(
    (a) => (a.applicationStatus || a.status) === 'Approved'
  ).length;

  const districts = Array.from(
    new Set(volunteerApplications.map((a) => a.district).filter(Boolean))
  ).sort();

  const filteredApplications = volunteerApplications.filter((app) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      app.fullName?.toLowerCase().includes(q) ||
      app.email?.toLowerCase().includes(q) ||
      app.phone?.toLowerCase().includes(q) ||
      app.district?.toLowerCase().includes(q) ||
      app.volunteerApplicationId?.toLowerCase().includes(q) ||
      app.skills?.some((s) => s.toLowerCase().includes(q)) ||
      app.interests?.some((i) => i.toLowerCase().includes(q));

    const currentStatus = app.applicationStatus || app.status || 'Pending';
    const matchesStatus = statusFilter === 'All' || currentStatus === statusFilter;
    const matchesDistrict = districtFilter === 'All' || app.district === districtFilter;

    return matchesSearch && matchesStatus && matchesDistrict;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#237737]/10 text-[#237737] flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                Manage Volunteers
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
                Review volunteer registrations, conduct orientation sessions, and deploy certified community responders.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Applications</span>
        </button>
      </div>

      {/* 4 Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('All')}
          className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-[#237737]/30 transition cursor-pointer"
        >
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Total Candidates
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {volunteerApplications.length}
          </div>
          <span className="text-[10px] text-[#237737] font-bold mt-1 block">
            Statewide applications
          </span>
        </div>

        <div
          onClick={() => setStatusFilter('Pending')}
          className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-amber-300 transition cursor-pointer"
        >
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Pending Review
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</div>
          <span className="text-[10px] text-amber-600 font-bold mt-1 block">
            Awaiting squad orientation
          </span>
        </div>

        <div
          onClick={() => setStatusFilter('Volunteer Visit')}
          className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-300 transition cursor-pointer"
        >
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Scheduled Sessions
          </div>
          <div className="text-2xl font-black text-blue-600 mt-1">{visitCount}</div>
          <span className="text-[10px] text-blue-600 font-bold mt-1 block">
            Field visits in progress
          </span>
        </div>

        <div
          onClick={() => setStatusFilter('Approved')}
          className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-emerald-300 transition cursor-pointer"
        >
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Certified Volunteers
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{approvedCount}</div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
            Active field badges
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate, district, skills, ID…"
              className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] transition"
            />
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          </div>

          {/* District Dropdown */}
          {districts.length > 0 && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">District:</span>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
              >
                <option value="All">All Operating Districts</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3 overflow-x-auto pb-1">
          {['All', 'Pending', 'Volunteer Visit', 'Approved', 'Rejected'].map((status) => {
            const count =
              status === 'All'
                ? volunteerApplications.length
                : volunteerApplications.filter(
                    (a) => (a.applicationStatus || a.status) === status
                  ).length;
            const isActive = statusFilter === status;

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#237737] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{status === 'Volunteer Visit' ? 'Orientation Scheduled' : status}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Applications Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
        {filteredApplications.map((app) => {
          const currentStatus = app.applicationStatus || app.status || 'Pending';
          const isPending = currentStatus === 'Pending';
          const isVisit = currentStatus === 'Volunteer Visit';
          const isApproved = currentStatus === 'Approved';
          const isRejected = currentStatus === 'Rejected';

          const statusBadge = isApproved
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : isVisit
            ? 'bg-blue-50 text-blue-700 border-blue-200'
            : isRejected
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : 'bg-amber-50 text-amber-700 border-amber-200';

          return (
            <div
              key={app._id || app.volunteerApplicationId}
              className="bg-white border border-slate-100/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-sm text-slate-900">{app.fullName}</h3>
                      {app.hasVehicle && (
                        <span title={`Has ${app.vehicleType || 'vehicle'}`}>
                          <Car className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold block mt-0.5">
                      {app.volunteerApplicationId || 'VAP-0001'}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider shrink-0 ${statusBadge}`}
                  >
                    {isVisit ? 'Orientation' : currentStatus}
                  </span>
                </div>

                {/* Location & Contact */}
                <div className="space-y-1 text-xs text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>
                      {app.district}
                      {app.city ? `, ${app.city}` : ''}
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-[#237737] shrink-0" />
                    <span>{app.phone}</span>
                  </p>
                </div>

                {/* Availability & Skills Tags */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(app.availability) &&
                      app.availability.slice(0, 2).map((av, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md"
                        >
                          {av}
                        </span>
                      ))}
                    {Array.isArray(app.interests) &&
                      app.interests.slice(0, 1).map((int, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-blue-50 text-blue-800 text-[10px] font-bold rounded-md truncate max-w-[140px]"
                        >
                          {int}
                        </span>
                      ))}
                  </div>

                  {Array.isArray(app.skills) && app.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {app.skills.slice(0, 3).map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[9px] font-semibold rounded"
                        >
                          #{sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Visit info if scheduled */}
                {isVisit && app.visitScheduleDate && (
                  <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-0.5">
                    <div className="font-extrabold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-600" />
                      <span>
                        Visit:{' '}
                        {new Date(app.visitScheduleDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    {app.visitCoordinator && (
                      <p className="text-[10px] text-blue-700">Lead: {app.visitCoordinator}</p>
                    )}
                  </div>
                )}

                {/* Certified Badge if Approved */}
                {isApproved && app.volunteerId && (
                  <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 font-extrabold flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Certified Badge: {app.volunteerId}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenDetailsModal(app)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <Eye className="w-3 h-3 text-slate-500" /> Details
                </button>

                <div className="flex items-center gap-1.5">
                  {isPending && (
                    <button
                      onClick={() => onOpenScheduleVisit(app)}
                      className="px-3.5 py-1.5 bg-[#237737] hover:bg-[#1d632e] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm flex items-center gap-1"
                    >
                      <Calendar className="w-3 h-3" /> Schedule Visit
                    </button>
                  )}

                  {isVisit && (
                    <button
                      onClick={() => onOpenReportModal(app)}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" /> Evaluate
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredApplications.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 space-y-2">
          <HeartHandshake className="w-10 h-10 mx-auto text-slate-300" />
          <h4 className="font-extrabold text-sm text-slate-700">No Volunteer Applications Found</h4>
          <p className="text-xs max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'All' || districtFilter !== 'All'
              ? 'No candidate records match the active search and filter criteria.'
              : 'When public users submit volunteer applications, they will appear here for all rescue teams to review.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ManageVolunteers;
