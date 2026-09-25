import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileCheck2,
  MapPin,
  Phone,
  Mail,
  Award,
  RefreshCw,
  Search,
  Filter,
  Check,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Package,
  Lock,
} from 'lucide-react';
import {
  getShelterVetApplications,
  getShelterVetStaff,
  toggleVetStaffMedicinePermission,
} from '../../services/veterinaryService';
import VetInterviewModal from './VetInterviewModal';
import VetInterviewReportModal from './VetInterviewReportModal';

const ManageVetStaff = ({ shelterData }) => {
  const [activeSubTab, setActiveSubTab] = useState('applications'); // 'applications' | 'staff'
  const [applications, setApplications] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedAppForInterview, setSelectedAppForInterview] = useState(null);
  const [selectedAppForReport, setSelectedAppForReport] = useState(null);
  const [togglingStaffId, setTogglingStaffId] = useState(null);
  const [toggleFeedback, setToggleFeedback] = useState({ id: null, msg: '', ok: true });

  const loadData = async () => {
    setLoading(true);
    try {
      const [appRes, staffRes] = await Promise.all([
        getShelterVetApplications().catch(() => ({ applications: [] })),
        getShelterVetStaff().catch(() => ({ staffMembers: [] })),
      ]);

      setApplications(appRes?.applications || []);
      setStaffList(staffRes?.staffMembers || []);
    } catch (err) {
      console.warn('Failed to load veterinary staff management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInterviewScheduled = (updatedApp) => {
    setApplications((prev) =>
      prev.map((app) => (app._id === updatedApp._id ? updatedApp : app))
    );
  };

  const handleReportSubmitted = (updatedApp, newStaff) => {
    setApplications((prev) =>
      prev.map((app) => (app._id === updatedApp._id ? updatedApp : app))
    );
    if (newStaff) {
      setStaffList((prev) => [newStaff, ...prev.filter((s) => s._id !== newStaff._id)]);
    }
  };

  const handleToggleMedicinePermission = async (staff) => {
    setTogglingStaffId(staff._id);
    try {
      const res = await toggleVetStaffMedicinePermission(staff._id);
      setStaffList((prev) =>
        prev.map((s) => (s._id === staff._id ? { ...s, canManageMedicineStock: res.vetStaff.canManageMedicineStock } : s))
      );
      setToggleFeedback({ id: staff._id, msg: res.message, ok: true });
    } catch (err) {
      setToggleFeedback({ id: staff._id, msg: err?.response?.data?.message || 'Failed to update permission.', ok: false });
    } finally {
      setTogglingStaffId(null);
      setTimeout(() => setToggleFeedback({ id: null, msg: '', ok: true }), 3000);
    }
  };

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      app.fullName?.toLowerCase().includes(q) ||
      app.councilRegistrationNumber?.toLowerCase().includes(q) ||
      app.qualification?.toLowerCase().includes(q) ||
      app.specialization?.toLowerCase().includes(q) ||
      app.city?.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  // Metric counts
  const pendingCount = applications.filter((a) => a.status === 'Pending').length;
  const scheduledCount = applications.filter((a) => a.status === 'Interview Scheduled').length;
  const approvedCount = staffList.length || applications.filter((a) => a.status === 'Approved').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <Stethoscope className="w-7 h-7 text-[#237737]" />
            <span>Veterinary Staff Management</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
            Review veterinary applications, schedule clinical interviews, submit evaluation reports, and assign doctors & nurses.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-sm hover:shadow"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Assigned Staff
            </div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{approvedCount}</div>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Pending Applications
            </div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{pendingCount}</div>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Interviews Scheduled
            </div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{scheduledCount}</div>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Total Candidate Pool
            </div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{applications.length}</div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 gap-8 text-sm font-bold text-slate-500">
        <button
          onClick={() => setActiveSubTab('applications')}
          className={`pb-3 border-b-2 cursor-pointer transition flex items-center gap-2 ${
            activeSubTab === 'applications'
              ? 'border-b-[#237737] text-[#237737]'
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Applications & Interviews</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('staff')}
          className={`pb-3 border-b-2 cursor-pointer transition flex items-center gap-2 ${
            activeSubTab === 'staff'
              ? 'border-b-[#237737] text-[#237737]'
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Assigned Veterinary Staff</span>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black">
            {staffList.length}
          </span>
        </button>
      </div>

      {/* VIEW: Staff Applications */}
      {activeSubTab === 'applications' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate name, council reg no, specialty..."
                className="w-full pl-9 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['All', 'Pending', 'Interview Scheduled', 'Approved', 'Rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    statusFilter === status
                      ? 'bg-[#237737] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Applications Cards Grid */}
          {loading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100">
              <RefreshCw className="w-8 h-8 text-[#237737] animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-500">Loading applications...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-2">
              <Stethoscope className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-extrabold text-slate-700">No Applications Match Filter</h3>
              <p className="text-xs text-slate-400">
                Try selecting a different status filter or clear your search keywords.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApps.map((app) => (
                <div
                  key={app._id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Row: Reg ID & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {app.vetStaffApplicationId}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                              app.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : app.status === 'Interview Scheduled'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : app.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 mt-1">
                          {app.fullName}
                        </h3>
                        <p className="text-xs font-semibold text-[#237737]">{app.position}</p>
                      </div>

                      {/* Targeted vs Open badge */}
                      <span
                        className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                          app.targetShelterId
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {app.targetShelterId ? 'Direct To Us' : 'Open Pool'}
                      </span>
                    </div>

                    {/* Candidate Details Snippet */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2.5 bg-slate-50 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                          Council Reg No
                        </span>
                        <strong className="text-slate-800">{app.councilRegistrationNumber}</strong>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                          Experience
                        </span>
                        <strong className="text-slate-800">{app.experienceYears} Years</strong>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <p>
                        <strong>Degree:</strong> {app.qualification}
                      </p>
                      <p>
                        <strong>Focus:</strong> {app.specialization}
                      </p>
                    </div>

                    {/* Contact details */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-500 border-t border-slate-100 font-medium">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {app.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {app.email}
                      </span>
                      {app.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {app.city}, {app.district}
                        </span>
                      )}
                    </div>

                    {/* Scheduled Interview Banner if applicable */}
                    {app.interviewScheduleDate && (
                      <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span>Interview Scheduled:</span>
                        </div>
                        <div className="text-slate-700 pl-5">
                          {new Date(app.interviewScheduleDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          • {app.interviewTimeSlot || '10:00 AM'}
                        </div>
                        <div className="text-[11px] text-slate-500 pl-5">
                          Location: {app.interviewLocation}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                    {app.status === 'Pending' && (
                      <button
                        onClick={() => setSelectedAppForInterview(app)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm shadow-blue-600/10 inline-flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Schedule Interview</span>
                      </button>
                    )}

                    {app.status === 'Interview Scheduled' && (
                      <>
                        <button
                          onClick={() => setSelectedAppForInterview(app)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => setSelectedAppForReport(app)}
                          className="px-4 py-2 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-extrabold rounded-xl transition cursor-pointer shadow-sm shadow-[#237737]/15 inline-flex items-center gap-1.5"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Submit Report & Assign</span>
                        </button>
                      </>
                    )}

                    {app.status === 'Approved' && (
                      <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-700">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Assigned to Shelter ({app.vetStaffId || 'Active'})</span>
                      </div>
                    )}

                    {app.status === 'Rejected' && (
                      <span className="text-xs text-rose-600 font-bold">
                        Decision: Not Approved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW: Assigned Veterinary Staff */}
      {activeSubTab === 'staff' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100">
              <RefreshCw className="w-8 h-8 text-[#237737] animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-500">Loading assigned staff...</p>
            </div>
          ) : staffList.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-[#237737] rounded-2xl flex items-center justify-center mx-auto">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">
                No Veterinary Staff Assigned Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                Review candidate applications in the "Staff Applications" tab, conduct clinical interviews, and approve candidates to assign them to your shelter.
              </p>
              <button
                onClick={() => setActiveSubTab('applications')}
                className="px-4 py-2 bg-[#237737] text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>View Candidate Applications</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffList.map((staff) => (
                <div
                  key={staff._id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-emerald-50 text-[#237737] rounded-2xl flex items-center justify-center font-black text-sm">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{staff.fullName}</h4>
                        <p className="text-xs font-bold text-[#237737]">{staff.position}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg">
                      {staff.status || 'Active'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">Staff ID:</span>
                      <strong className="text-slate-800 font-mono">{staff.vetStaffId}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">Council Reg:</span>
                      <strong className="text-slate-800">{staff.councilRegistrationNumber}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">Qualification:</span>
                      <strong className="text-slate-800 truncate max-w-[140px]" title={staff.qualification}>
                        {staff.qualification}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">Specialization:</span>
                      <strong className="text-slate-800 truncate max-w-[140px]" title={staff.specialization}>
                        {staff.specialization}
                      </strong>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-500 font-medium pt-1">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{staff.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{staff.email}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    {/* Medicine Stock Permission Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        <span>Medicine Stock Access</span>
                      </div>
                      <button
                        onClick={() => handleToggleMedicinePermission(staff)}
                        disabled={togglingStaffId === staff._id}
                        title={staff.canManageMedicineStock ? 'Revoke medicine stock access' : 'Grant medicine stock access'}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-wait ${
                          staff.canManageMedicineStock ? 'bg-[#237737]' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                            staff.canManageMedicineStock ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Feedback message */}
                    {toggleFeedback.id === staff._id && toggleFeedback.msg && (
                      <p className={`text-[10px] font-bold ${
                        toggleFeedback.ok ? 'text-emerald-600' : 'text-rose-500'
                      }`}>{toggleFeedback.msg}</p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                      <span>
                        Joined:{' '}
                        {new Date(staff.joiningDate || staff.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Assigned
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <VetInterviewModal
        isOpen={Boolean(selectedAppForInterview)}
        onClose={() => setSelectedAppForInterview(null)}
        application={selectedAppForInterview}
        shelterData={shelterData}
        onInterviewScheduled={handleInterviewScheduled}
      />

      <VetInterviewReportModal
        isOpen={Boolean(selectedAppForReport)}
        onClose={() => setSelectedAppForReport(null)}
        application={selectedAppForReport}
        shelterData={shelterData}
        onReportSubmitted={handleReportSubmitted}
      />
    </div>
  );
};

export default ManageVetStaff;
