import React, { useState, useEffect } from 'react';
import {
  Heart,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Home,
  Building,
  Phone,
  Mail,
  User,
  ShieldCheck,
  AlertCircle,
  Eye,
  FileText,
  Calendar,
  Sparkles,
  RefreshCw,
  MapPin,
  Send,
  X,
  Check,
  Lock,
} from 'lucide-react';
import {
  getShelterAdoptionApplications,
  updateAdoptionApplicationStatus,
  scheduleAdoptionAppointment,
  submitShelterVisitReport,
} from '../../services/adoptionService';
import ShelterVisitReportModal from './ShelterVisitReportModal';

const ManageAdoptions = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedApp, setSelectedApp] = useState(null); // Review details modal
  const [scheduleModalApp, setScheduleModalApp] = useState(null); // Schedule visit modal
  const [approveModalApp, setApproveModalApp] = useState(null); // Approve application modal
  const [reportModalApp, setReportModalApp] = useState(null); // Shelter visit report & decision modal

  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [actionRemarks, setActionRemarks] = useState('');

  // Schedule Appointment Form State
  const [appointmentForm, setAppointmentForm] = useState({
    date: '',
    time: '11:00 AM',
    location: '',
    notes: 'Please bring a valid photo ID, proof of address, and all household members.',
  });
  const [scheduleError, setScheduleError] = useState(null);

  // Approve Checklist State
  const [approveRemarks, setApproveRemarks] = useState('');
  const [approveChecks, setApproveChecks] = useState({
    visitDone: true,
    housingVerified: true,
    agreementConfirmed: true,
  });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getShelterAdoptionApplications({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: searchQuery || undefined,
      });
      if (res.success) {
        setApplications(res.applications || []);
      } else {
        setError(res.message || 'Failed to fetch adoption applications');
      }
    } catch (err) {
      console.error('fetchApplications error:', err);
      setError(err.response?.data?.message || err.message || 'Error loading applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplications();
  };

  // Open Schedule Modal
  const openScheduleModal = (app) => {
    setScheduleModalApp(app);
    setScheduleError(null);
    const existingApt = app.appointment;
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDateStr = tomorrow.toISOString().split('T')[0];

    setAppointmentForm({
      date: existingApt?.date
        ? new Date(existingApt.date).toISOString().split('T')[0]
        : defaultDateStr,
      time: existingApt?.time || '11:00 AM',
      location: existingApt?.location || app.pet_id?.shelterName || 'Shelter Main Campus',
      notes:
        existingApt?.notes ||
        'Please bring a valid government photo ID, proof of address, and all household members.',
    });
  };

  // Submit Schedule Appointment
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!appointmentForm.date || !appointmentForm.time) {
      setScheduleError('Please specify both appointment date and time');
      return;
    }

    try {
      setActionLoading(true);
      setScheduleError(null);
      const res = await scheduleAdoptionAppointment(scheduleModalApp._id, appointmentForm);
      if (res.success) {
        // Update local application state
        setApplications((prev) =>
          prev.map((app) =>
            app._id === scheduleModalApp._id
              ? {
                  ...app,
                  application_status: res.application?.application_status || 'Shelter Visit',
                  appointment: res.application?.appointment || {
                    ...appointmentForm,
                    date: new Date(appointmentForm.date),
                    status: 'Scheduled',
                  },
                }
              : app
          )
        );

        if (selectedApp && selectedApp._id === scheduleModalApp._id) {
          setSelectedApp((prev) => ({
            ...prev,
            application_status: res.application?.application_status || 'Shelter Visit',
            appointment: res.application?.appointment,
          }));
        }

        setScheduleModalApp(null);
        alert(`Visit appointment scheduled successfully for ${scheduleModalApp.applicant_id?.fullName || 'the applicant'}!`);
      } else {
        setScheduleError(res.message || 'Failed to schedule appointment');
      }
    } catch (err) {
      setScheduleError(err.response?.data?.message || err.message || 'Error scheduling appointment');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Shelter Visit Report & Decision Modal
  const openReportModal = (app) => {
    const hasVisit =
      app.appointment &&
      ['Scheduled', 'Completed'].includes(app.appointment.status);

    if (!hasVisit) {
      if (
        window.confirm(
          `A shelter visit must be scheduled first before submitting an inspection report for ${
            app.pet_id?.name || 'this companion'
          }.\n\nWould you like to schedule the shelter visit now?`
        )
      ) {
        openScheduleModal(app);
      }
      return;
    }

    setReportModalApp(app);
  };

  // Submit Shelter Visit Report & Audit Decision (Pass & Approve / Fail & Reject)
  const handleConfirmSubmitReport = async ({ reportText, decision, checks }) => {
    if (!reportModalApp) return;
    try {
      setActionLoading(true);
      const res = await submitShelterVisitReport(reportModalApp._id, {
        reportText,
        decision,
        checks,
      });

      if (res.success) {
        const updatedApp = res.application;
        setApplications((prev) =>
          prev.map((app) => (app._id === updatedApp._id ? updatedApp : app))
        );
        if (selectedApp && selectedApp._id === updatedApp._id) {
          setSelectedApp(updatedApp);
        }
        setReportModalApp(null);
        alert(
          decision === 'Approved'
            ? `Adoption successfully APPROVED! ${updatedApp.pet_id?.name || 'The companion'} is placed in their new home.`
            : `Adoption application status updated to REJECTED based on visit evaluation.`
        );
      } else {
        alert(res.message || 'Failed to submit report');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error submitting visit report');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Approve Modal (Only allowed after shelter visit)
  const openApproveModal = (app) => {
    const hasVisit =
      app.appointment &&
      ['Scheduled', 'Completed'].includes(app.appointment.status);

    if (!hasVisit) {
      if (
        window.confirm(
          `Adoption cannot be approved yet!\n\nResQNet policy requires an in-person shelter visit before approving the adoption of ${
            app.pet_id?.name || 'this companion'
          }.\n\nWould you like to schedule the shelter visit now?`
        )
      ) {
        openScheduleModal(app);
      }
      return;
    }

    setApproveModalApp(app);
    setApproveRemarks(
      `In-person shelter visit conducted on ${new Date(
        app.appointment.date
      ).toLocaleDateString()}. Compatibility confirmed, adoption finalized.`
    );
    setApproveChecks({
      visitDone: true,
      housingVerified: true,
      agreementConfirmed: true,
    });
  };

  // Confirm Approval
  const handleApproveConfirm = async () => {
    if (!approveChecks.visitDone || !approveChecks.housingVerified || !approveChecks.agreementConfirmed) {
      alert('Please complete all verification checklist items before final approval');
      return;
    }

    try {
      setActionLoading(true);
      const res = await updateAdoptionApplicationStatus(
        approveModalApp._id,
        'Approved',
        approveRemarks
      );
      if (res.success) {
        setApplications((prev) =>
          prev.map((app) =>
            app._id === approveModalApp._id
              ? {
                  ...app,
                  application_status: 'Approved',
                  remarks: approveRemarks,
                  appointment: app.appointment
                    ? { ...app.appointment, status: 'Completed' }
                    : null,
                }
              : app
          )
        );

        if (selectedApp && selectedApp._id === approveModalApp._id) {
          setSelectedApp((prev) => ({
            ...prev,
            application_status: 'Approved',
            remarks: approveRemarks,
          }));
        }

        setApproveModalApp(null);
        alert(`Adoption successfully APPROVED! ${approveModalApp.pet_id?.name} has been placed in their new home.`);
      } else {
        alert(res.message || 'Approval failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to approve application');
    } finally {
      setActionLoading(false);
    }
  };

  // Direct Status Update (e.g. Reject or Under Review)
  const handleUpdateStatus = async (appId, newStatus, remarks = '') => {
    try {
      setActionLoading(true);
      const res = await updateAdoptionApplicationStatus(appId, newStatus, remarks);
      if (res.success) {
        setApplications((prev) =>
          prev.map((app) =>
            app._id === appId
              ? { ...app, application_status: newStatus, remarks }
              : app
          )
        );
        if (selectedApp && selectedApp._id === appId) {
          setSelectedApp((prev) => ({
            ...prev,
            application_status: newStatus,
            remarks,
          }));
        }
      } else {
        alert(res.message || 'Status update failed');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics
  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => a.application_status === 'Pending').length;
  const scheduledCount = applications.filter(
    (a) =>
      a.application_status === 'Shelter Visit' ||
      a.appointment?.status === 'Scheduled'
  ).length;
  const approvedCount = applications.filter((a) => a.application_status === 'Approved').length;

  // Client-side search and status filter matching
  const filteredApplications = applications.filter((app) => {
    const matchesStatus =
      statusFilter === 'All' ||
      app.application_status === statusFilter ||
      (statusFilter === 'Shelter Visit' &&
        (app.application_status === 'Shelter Visit' ||
          (app.appointment?.status === 'Scheduled' &&
            !['Approved', 'Rejected'].includes(app.application_status))));
    const matchesSearch =
      !searchQuery ||
      [
        app.applicant_id?.fullName,
        app.applicant_id?.phoneNumber,
        app.pet_id?.name,
        app.adoptionId,
      ].some((field) => field?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-100 text-[#237737] border-emerald-200';
      case 'Shelter Visit':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Withdrawn':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Heart className="w-7 h-7 text-rose-600 fill-rose-100" /> Manage Adoptions
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
            Review applicant living conditions, schedule shelter visit appointments, and approve adoptions.
          </p>
        </div>

        <button
          onClick={fetchApplications}
          className="self-start sm:self-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#237737]' : ''}`} />
          Refresh Registry
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Received</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
          <div className="text-[11px] text-slate-500 font-semibold mt-0.5">All applications</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Initial Review</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-amber-700/80 font-semibold mt-0.5">Awaiting initial action</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Visits Scheduled</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{scheduledCount}</div>
          <div className="text-[11px] text-indigo-700/80 font-semibold mt-0.5">In-person shelter visits</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Approved & Placed</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{approvedCount}</div>
          <div className="text-[11px] text-emerald-700/80 font-semibold mt-0.5">Finalized adoptions</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['All', 'Pending', 'Shelter Visit', 'Approved', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#237737] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search applicant, phone, or pet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-100">
          <div className="w-10 h-10 border-3 border-[#237737] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading adoption applications...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h3 className="text-sm font-bold text-rose-900">{error}</h3>
          <button
            onClick={fetchApplications}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-900">No Adoption Applications Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            {statusFilter !== 'All'
              ? `There are currently no applications matching status "${statusFilter}".`
              : 'New adoption applications submitted by users will appear here for verification.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const pet = app.pet_id || {};
            const applicant = app.applicant_id || {};
            const isRent = app.ownership_status === 'Rent';
            const apt = app.appointment;
            const isScheduled = apt && apt.status === 'Scheduled';
            const isApproved = app.application_status === 'Approved';
            const isRejected = app.application_status === 'Rejected';
            const hasVisit = apt && ['Scheduled', 'Completed'].includes(apt.status);

            return (
              <div
                key={app._id}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition duration-200 flex flex-col space-y-4"
              >
                {/* Main Card Content */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Left: Pet & Reference */}
                  <div className="flex items-start gap-4 min-w-[260px]">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                      {pet.facePhoto || pet.photo ? (
                        <img
                          src={
                            (pet.facePhoto || pet.photo).startsWith('/uploads')
                              ? `http://localhost:5000${pet.facePhoto || pet.photo}`
                              : pet.facePhoto || pet.photo
                          }
                          alt={pet.name || 'Pet'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-[#237737] font-black text-xl">
                          {(pet.name || 'P')[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900">{pet.name || 'Companion'}</h3>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-extrabold">
                          {app.adoptionId || 'ADO-REF'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        {pet.species} • {pet.breed || 'Mixed'} • {pet.gender || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mt-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Applied: {new Date(app.submitted_at || app.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Applicant Contact & Living Profile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs flex-1 border-y lg:border-y-0 lg:border-x border-slate-100 py-3 lg:py-0 lg:px-5">
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                        Applicant Contact
                      </div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {applicant.fullName || 'User'}
                      </div>
                      <div className="text-slate-600 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {applicant.phoneNumber || 'Not provided'}
                      </div>
                      <div className="text-slate-500 truncate flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {applicant.email}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                        Living Situation
                      </div>
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-emerald-600" />
                        {app.housing_type} ({app.ownership_status})
                      </div>
                      {isRent ? (
                        <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md font-bold inline-block">
                          Landlord: {app.landlord_details?.name || 'N/A'} ({app.landlord_details?.phone || 'N/A'})
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold inline-block">
                          Self-Owned Property
                        </div>
                      )}
                      <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Return Policy: {app.agreements?.return_policy ? 'Acknowledged' : 'Pending'}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Badge & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-3 min-w-[220px]">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border self-start sm:self-auto lg:self-end ${getStatusBadge(
                        app.application_status
                      )}`}
                    >
                      {app.application_status}
                    </span>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                      {/* 1. Pending Flow: Schedule Visit or Direct Reject */}
                      {!isApproved && !isRejected && !isScheduled && app.application_status !== 'Shelter Visit' && (
                        <>
                          <button
                            onClick={() => openScheduleModal(app)}
                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Calendar className="w-3.5 h-3.5" /> Schedule Visit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to decline this application before scheduling a visit?')) {
                                handleUpdateStatus(app._id, 'Rejected', 'Declined prior to visit based on profile.');
                              }
                            }}
                            className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}

                      {/* 2. Shelter Visit Scheduled Flow: Report & Decide (Like Admin Site Visit) */}
                      {!isApproved && !isRejected && (isScheduled || app.application_status === 'Shelter Visit') && (
                        <>
                          <button
                            onClick={() => openReportModal(app)}
                            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                            title="Submit In-Person Visit Inspection Report & Finalize Decision"
                          >
                            <FileText className="w-3.5 h-3.5" /> Report & Decide
                          </button>
                          <button
                            onClick={() => openScheduleModal(app)}
                            title="Reschedule Shelter Visit"
                            className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl border border-slate-200 transition cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {/* 3. Review Details Button */}
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setActionRemarks(app.remarks || '');
                        }}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Prominent Shelter Visit Appointment Callout (if scheduled) */}
                {isScheduled && (
                  <div className="p-3.5 bg-gradient-to-r from-indigo-50/90 to-blue-50/70 border border-indigo-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-sm">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-indigo-950 flex flex-wrap items-center gap-2">
                          <span>Shelter Visit Appointment Scheduled</span>
                          <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">
                            {new Date(apt.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}{' '}
                            at {apt.time}
                          </span>
                        </div>
                        <div className="text-[11px] text-indigo-800 font-semibold flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span>Location: {apt.location}</span>
                        </div>
                        {apt.notes && (
                          <p className="text-[11px] text-slate-600 mt-1 italic">
                            "{apt.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => openReportModal(app)}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <FileText className="w-3 h-3" /> Report & Decide
                      </button>
                      <button
                        onClick={() => openScheduleModal(app)}
                        className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition cursor-pointer"
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>
                )}

                {/* Notice banner if shelter visit has not been scheduled yet */}
                {!hasVisit && !isApproved && !isRejected && (
                  <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0 mt-0.5">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-amber-950 flex items-center gap-2">
                          <span>Step 1: In-Person Shelter Visit Required</span>
                          <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                            Policy Required
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-800 font-medium mt-0.5">
                          An in-person shelter visit must be scheduled and completed before you can approve this adoption.
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => openScheduleModal(app)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer self-end sm:self-center shrink-0 shadow-xs"
                    >
                      <Calendar className="w-3 h-3" /> Schedule Visit Now
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SCHEDULE VISIT APPOINTMENT MODAL */}
      {/* ========================================================================= */}
      {scheduleModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 to-blue-50/40">
              <div>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
                  Shelter Visit Scheduling
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Schedule Visit with {scheduleModalApp.applicant_id?.fullName || 'Applicant'}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Companion: <strong className="text-slate-800">{scheduleModalApp.pet_id?.name}</strong> • Ref: {scheduleModalApp.adoptionId}
                </p>
              </div>
              <button
                onClick={() => setScheduleModalApp(null)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
              {scheduleError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{scheduleError}</span>
                </div>
              )}

              {/* Applicant Preview Pill */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicant</span>
                  <span className="font-bold text-slate-900">{scheduleModalApp.applicant_id?.fullName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact</span>
                  <span className="font-bold text-slate-800">{scheduleModalApp.applicant_id?.phoneNumber}</span>
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Visit Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={appointmentForm.date}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" /> Time Slot *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 11:00 AM or 03:30 PM"
                    value={appointmentForm.time}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Quick Time Slot Buttons */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Select Time</span>
                <div className="flex flex-wrap gap-1.5">
                  {['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAppointmentForm({ ...appointmentForm, time: t })}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                        appointmentForm.time === t
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Shelter Meeting Location / Address *
                </label>
                <input
                  type="text"
                  required
                  value={appointmentForm.location}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Notes / Instructions for Applicant */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">
                  Instructions for the Applicant <span className="text-slate-400 font-normal">(Sent via notification & email)</span>
                </label>
                <textarea
                  rows={3}
                  value={appointmentForm.notes}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                  placeholder="Instructions, items to bring, or meeting directions..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalApp(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> Confirm & Notify Applicant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. APPROVE ADOPTION & HANDOVER CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {approveModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/80 to-teal-50/40">
              <div>
                <span className="text-[10px] bg-emerald-100 text-[#237737] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
                  Final Adoption Handover
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  Approve Adoption for {approveModalApp.pet_id?.name}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Applicant: <strong className="text-slate-800">{approveModalApp.applicant_id?.fullName}</strong> ({approveModalApp.applicant_id?.phoneNumber})
                </p>
              </div>
              <button
                onClick={() => setApproveModalApp(null)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs overflow-y-auto">
              {/* Verified Visit Record */}
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-indigo-950 text-xs flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-600" /> In-Person Shelter Visit Verified
                  </span>
                  <span className="text-[10px] bg-indigo-200/80 text-indigo-900 px-2 py-0.5 rounded-full font-bold">
                    {approveModalApp.appointment?.status || 'Scheduled'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-semibold">Visit Date & Time</span>
                    <span className="font-bold text-slate-900">
                      {new Date(approveModalApp.appointment?.date).toLocaleDateString()} at {approveModalApp.appointment?.time}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-semibold">Meeting Location</span>
                    <span className="font-bold text-slate-900 truncate block">
                      {approveModalApp.appointment?.location || 'Shelter Campus'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                <span className="font-extrabold text-[#237737] text-xs block">Official Handover Action</span>
                <p className="text-[11px] text-emerald-900/90 leading-relaxed font-medium">
                  Approving this application will finalize the adoption in the ResQNet registry, mark <strong>{approveModalApp.pet_id?.name}</strong> as <strong>Adopted</strong>, and dispatch the official certificate and status confirmation to the applicant.
                </p>
              </div>

              {/* Verification Checklist */}
              <div className="space-y-2">
                <span className="font-black text-slate-800 uppercase tracking-wider text-[11px] block">
                  Mandatory Verification Checklist
                </span>
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={approveChecks.visitDone}
                      onChange={(e) => setApproveChecks({ ...approveChecks, visitDone: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600 accent-emerald-600 cursor-pointer"
                    />
                    <span className="font-bold text-slate-800">
                      In-person shelter visit conducted & companion interaction verified.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={approveChecks.housingVerified}
                      onChange={(e) => setApproveChecks({ ...approveChecks, housingVerified: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600 accent-emerald-600 cursor-pointer"
                    />
                    <span className="font-bold text-slate-800">
                      Living arrangement ({approveModalApp.housing_type}, {approveModalApp.ownership_status}) and landlord permissions confirmed.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={approveChecks.agreementConfirmed}
                      onChange={(e) => setApproveChecks({ ...approveChecks, agreementConfirmed: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600 accent-emerald-600 cursor-pointer"
                    />
                    <span className="font-bold text-slate-800">
                      Return policy acknowledged & handover documentation signed.
                    </span>
                  </label>
                </div>
              </div>

              {/* Remarks / Handover Notes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Approval Remarks / Handover Notes</label>
                <textarea
                  rows={2}
                  value={approveRemarks}
                  onChange={(e) => setApproveRemarks(e.target.value)}
                  placeholder="e.g. Health records and vaccination passport handed over..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setApproveModalApp(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleApproveConfirm}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  <Check className="w-4 h-4" /> Confirm & Approve Adoption
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FULL APPLICATION REVIEW MODAL */}
      {/* ========================================================================= */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-xl w-full border border-slate-100 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <span className="text-[10px] bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full font-extrabold uppercase">
                  {selectedApp.adoptionId || 'Application Details'}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  Adoption Review: {selectedApp.pet_id?.name || 'Pet'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Pet & Applicant Summary */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Companion Details</span>
                  <div className="font-black text-sm text-slate-900">{selectedApp.pet_id?.name}</div>
                  <div className="text-slate-500 font-semibold">
                    {selectedApp.pet_id?.species} • {selectedApp.pet_id?.breed} • {selectedApp.pet_id?.gender}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Applicant Details</span>
                  <div className="font-black text-sm text-slate-900">{selectedApp.applicant_id?.fullName}</div>
                  <div className="text-slate-600 font-semibold">Phone: {selectedApp.applicant_id?.phoneNumber}</div>
                  <div className="text-slate-500 truncate">{selectedApp.applicant_id?.email}</div>
                </div>
              </div>

              {/* Scheduled Visit Appointment Section */}
              {selectedApp.appointment && selectedApp.appointment.status === 'Scheduled' && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Scheduled Shelter Visit
                    </span>
                    <button
                      onClick={() => {
                        setSelectedApp(null);
                        openScheduleModal(selectedApp);
                      }}
                      className="text-[11px] text-indigo-700 font-bold underline cursor-pointer"
                    >
                      Reschedule
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] font-semibold block">Date & Time</span>
                      <span className="font-bold text-slate-900">
                        {new Date(selectedApp.appointment.date).toLocaleDateString()} at {selectedApp.appointment.time}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] font-semibold block">Location</span>
                      <span className="font-bold text-slate-900">{selectedApp.appointment.location}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submitted Shelter Visit Inspection & Valuation Report */}
              {selectedApp.visitReport && selectedApp.visitReport.reportText && (
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-purple-600" /> Shelter Visit Inspection Report
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        selectedApp.visitReport.decision === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}
                    >
                      {selectedApp.visitReport.decision === 'Approved'
                        ? '✓ Passed Audit & Approved'
                        : '✗ Failed Audit & Rejected'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-xl border border-purple-100 whitespace-pre-wrap">
                    "{selectedApp.visitReport.reportText}"
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-purple-900">
                    {selectedApp.visitReport.checks?.visitDone && (
                      <span className="bg-purple-100/90 px-2 py-0.5 rounded-md">✓ Visit Conducted</span>
                    )}
                    {selectedApp.visitReport.checks?.housingVerified && (
                      <span className="bg-purple-100/90 px-2 py-0.5 rounded-md">✓ Living Arrangement Verified</span>
                    )}
                    {selectedApp.visitReport.checks?.agreementConfirmed && (
                      <span className="bg-purple-100/90 px-2 py-0.5 rounded-md">✓ Documentation Signed</span>
                    )}
                    {selectedApp.visitReport.submittedAt && (
                      <span className="text-slate-400 font-semibold ml-auto">
                        Filed: {new Date(selectedApp.visitReport.submittedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Housing & Landlord Inspection */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Living Accommodations & Verification
                </h4>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">Housing Type:</span>
                    <span className="font-bold text-slate-900">{selectedApp.housing_type}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">Ownership Status:</span>
                    <span className="font-bold text-slate-900">{selectedApp.ownership_status}</span>
                  </div>
                  {selectedApp.ownership_status === 'Rent' && (
                    <>
                      <div className="flex justify-between pb-2 border-b border-slate-100">
                        <span className="text-amber-800 font-semibold">Landlord Name:</span>
                        <span className="font-bold text-slate-900">
                          {selectedApp.landlord_details?.name || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-slate-100">
                        <span className="text-amber-800 font-semibold">Landlord Phone:</span>
                        <a
                          href={`tel:${selectedApp.landlord_details?.phone}`}
                          className="font-bold text-emerald-700 hover:underline"
                        >
                          {selectedApp.landlord_details?.phone || 'Not specified'}
                        </a>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Return Policy Consent:</span>
                    <span className="font-bold text-emerald-700">
                      {selectedApp.agreements?.return_policy ? '✓ Agreed' : '✗ Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Applicant Message */}
              {selectedApp.notes && (
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Applicant Notes</h4>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-slate-700 font-medium leading-relaxed italic">
                    "{selectedApp.notes}"
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Process Application Actions
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    disabled={actionLoading}
                    onClick={() => {
                      setSelectedApp(null);
                      openScheduleModal(selectedApp);
                    }}
                    className="py-2.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5" /> {selectedApp.appointment?.status === 'Scheduled' ? 'Reschedule' : 'Schedule Visit'}
                  </button>
                  {selectedApp.appointment && ['Scheduled', 'Completed'].includes(selectedApp.appointment.status) ? (
                    <button
                      disabled={actionLoading}
                      onClick={() => {
                        setSelectedApp(null);
                        openReportModal(selectedApp);
                      }}
                      className="py-2.5 px-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1 shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" /> Report & Decide
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedApp(null);
                        openScheduleModal(selectedApp);
                      }}
                      className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1"
                      title="Shelter visit must be scheduled before submitting report"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400" /> Report (Visit First)
                    </button>
                  )}
                  <button
                    disabled={actionLoading}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to reject this adoption application?')) {
                        handleUpdateStatus(selectedApp._id, 'Rejected', 'Application rejected by shelter.');
                        setSelectedApp(null);
                      }
                    }}
                    className="py-2.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1 shadow-xs"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* 4. SHELTER VISIT REPORT & DECISION MODAL */}
      {/* ========================================================================= */}
      <ShelterVisitReportModal
        isOpen={!!reportModalApp}
        application={reportModalApp}
        onClose={() => setReportModalApp(null)}
        onSubmitReport={handleConfirmSubmitReport}
        loading={actionLoading}
      />
    </div>
  );
};

export default ManageAdoptions;
