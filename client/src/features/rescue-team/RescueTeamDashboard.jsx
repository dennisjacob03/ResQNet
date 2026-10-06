import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import RescueOperations from './RescueOperations';
import ManageVolunteers from './ManageVolunteers';
import Notifications from './Notifications';
import Profile from './Profile';
import UpdateRequestModal from './UpdateRequestModal';
import VolunteerVisitModal from './VolunteerVisitModal';
import VolunteerVisitReportModal from './VolunteerVisitReportModal';
import VolunteerDetailsModal from './VolunteerDetailsModal';
import LiveRescueTrackingModal from '../user-dashboard/LiveRescueTrackingModal';
import NearbySheltersModal from './NearbySheltersModal';

import {
  getAllVolunteerApplications,
  scheduleVolunteerVisit,
  submitVolunteerVisitReport,
} from '../../services/volunteerService';
import {
  getRescueTeamBroadcasts,
  acceptRescueRequest,
  declineRescueRequest,
  getAllRescueTeamsAndSheltersMap,
} from '../../services/rescueRequestService';

import { useDashboardTabNavigation } from '../../utils/dashboardNavigation';

const RescueTeamDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useDashboardTabNavigation('Rescue Team');
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('resqnet_sidebar_open');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem('resqnet_sidebar_open', String(next));
      return next;
    });
  };
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [notifOpen, setNotifOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(null); // holds request id or object

  // Live Requests and Broadcasts State
  const [rescueRequests, setRescueRequests] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [broadcastsLoading, setBroadcastsLoading] = useState(false);
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [teamProfile, setTeamProfile] = useState(null);
  const [shelters, setShelters] = useState([]);
  const [trackingRequestId, setTrackingRequestId] = useState(null);

  // Shelter Transfer Modal State
  const [showShelterModal, setShowShelterModal] = useState(false);
  const [selectedRequestForShelter, setSelectedRequestForShelter] = useState(null);

  // Volunteer Applications State
  const [volunteerApplications, setVolunteerApplications] = useState([]);
  const [volunteersLoading, setVolunteersLoading] = useState(false);

  // Volunteer Modals State
  const [selectedVolunteerForVisit, setSelectedVolunteerForVisit] = useState(null);
  const [showVolunteerVisitModal, setShowVolunteerVisitModal] = useState(false);
  const [volunteerVisitDate, setVolunteerVisitDate] = useState('');
  const [volunteerVisitValuationPeriod, setVolunteerVisitValuationPeriod] = useState('10:00 AM - 1:00 PM');
  const [volunteerVisitCoordinator, setVolunteerVisitCoordinator] = useState('');
  const [volunteerVisitNotes, setVolunteerVisitNotes] = useState('');
  const [volunteerVisitSubmitting, setVolunteerVisitSubmitting] = useState(false);

  const [selectedVolunteerForReport, setSelectedVolunteerForReport] = useState(null);
  const [showVolunteerReportModal, setShowVolunteerReportModal] = useState(false);
  const [volunteerVisitReportText, setVolunteerVisitReportText] = useState('');
  const [volunteerReportDecision, setVolunteerReportDecision] = useState('Approved');
  const [volunteerReportChecks, setVolunteerReportChecks] = useState({
    identityVerified: true,
    animalHandlingReady: true,
    safetyOrientationDone: true,
    commitmentAgreement: true,
  });
  const [volunteerReportSubmitting, setVolunteerReportSubmitting] = useState(false);

  const [selectedVolunteerForDetails, setSelectedVolunteerForDetails] = useState(null);
  const [showVolunteerDetailsModal, setShowVolunteerDetailsModal] = useState(false);

  const loadVolunteers = async () => {
    setVolunteersLoading(true);
    try {
      const res = await getAllVolunteerApplications();
      if (res?.applications) {
        setVolunteerApplications(res.applications);
      }
    } catch (err) {
      console.warn('Failed to load volunteer applications for rescue team:', err.message);
    } finally {
      setVolunteersLoading(false);
    }
  };

  const loadBroadcasts = async () => {
    setBroadcastsLoading(true);
    try {
      const res = await getRescueTeamBroadcasts();
      if (res?.team) {
        setTeamProfile(res.team);
      }
      const rawRequests = res?.requests || res?.broadcasts || [];
      if (Array.isArray(rawRequests)) {
        setBroadcasts(rawRequests);
        const mapped = rawRequests.map((b) => {
          const reqId = b.rescueRequestId || b._id || b.id;
          const isAssigned =
            b.isAssignedToMe ||
            b.isAssignedToThisTeam ||
            b.myStatus === 'Assigned' ||
            (user?._id && String(b.assignedRescueTeamId) === String(user._id));
          const isAccepted =
            b.myStatus === 'Accepted' ||
            b.myStatus === 'Backup' ||
            b.candidateStatus === 'Accepted';

          return {
            id: reqId,
            _id: b._id,
            rescueRequestId: b.rescueRequestId,
            animal: `${b.animalCondition || 'Injured'} ${b.animalType || 'Animal'}`,
            animalType: b.animalType || 'Animal',
            animalCondition: b.animalCondition || 'Injured',
            animalIcon:
              b.animalType === 'Cat'
                ? '🐱'
                : b.animalType === 'Bird'
                ? '🐦'
                : b.animalType === 'Cow' || b.animalType === 'Cattle'
                ? '🐄'
                : '🐕',
            location: b.locationAddress || 'Incident Location',
            locationAddress: b.locationAddress,
            city: b.city,
            district: b.district,
            latitude: b.latitude,
            longitude: b.longitude,
            reporter: b.reportedByName || b.userId?.fullName || 'Citizen Reporter',
            reporterPhone: b.reportedByPhone || b.userId?.phoneNumber || '',
            priority: b.priority || (b.animalCondition === 'Injured' ? 'Critical' : 'High'),
            status: b.rescueStage || b.status,
            rescueStage: b.rescueStage || b.status,
            myStatus: b.myStatus || (isAssigned ? 'Assigned' : isAccepted ? 'Accepted' : 'Notified'),
            isAssignedToThisTeam: isAssigned,
            isAssignedToMe: isAssigned,
            distanceKm: b.distanceKm ?? b.myDistanceKm ?? 0,
            time: b.createdAt
              ? new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Recently',
            createdAt: b.createdAt,
            priorityColor:
              b.priority === 'Emergency' || b.priority === 'Critical'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : b.priority === 'High'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-blue-50 text-blue-700 border-blue-200',
            statusColor: isAssigned
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : isAccepted
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-amber-50 text-amber-700 border-amber-200',
            raw: b,
          };
        });
        setRescueRequests(mapped);

        const activities = mapped.slice(0, 6).map((item) => ({
          time: item.time,
          text: `${item.animal}: ${item.status} (${item.location})`,
          color: item.isAssignedToThisTeam ? 'bg-emerald-500' : 'bg-blue-500',
          highlight: item.isAssignedToThisTeam,
        }));
        setActivityTimeline(activities);
      }
    } catch (err) {
      console.warn('Failed to load rescue broadcasts:', err);
    } finally {
      setBroadcastsLoading(false);
    }
  };

  const loadMapShelters = async () => {
    try {
      const res = await getAllRescueTeamsAndSheltersMap();
      if (res?.shelters && Array.isArray(res.shelters)) {
        setShelters(res.shelters);
      }
    } catch (err) {
      console.warn('Failed to load shelters for live map:', err.message);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (!isMounted) return;
      await Promise.allSettled([loadVolunteers(), loadBroadcasts(), loadMapShelters()]);
    };
    init();
    const interval = setInterval(() => {
      loadBroadcasts();
    }, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleAcceptRequest = async (reqId) => {
    try {
      const res = await acceptRescueRequest(reqId);
      if (res?.success) {
        alert(res.message || 'Rescue request accepted!');
        loadBroadcasts();
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to accept rescue request.');
    }
  };

  const handleDeclineRequest = async (reqId) => {
    try {
      const res = await declineRescueRequest(reqId, 'Team currently unavailable on this route');
      if (res?.success) {
        loadBroadcasts();
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to decline request.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /* Filter table data */
  const filtered = rescueRequests.filter((r) => {
    const okPriority = priorityFilter === 'All' || r.priority === priorityFilter;
    const okStatus = statusFilter === 'All' || r.status === statusFilter;
    return okPriority && okStatus;
  });

  const pendingCount = rescueRequests.filter((r) => r.status === 'Pending').length;
  const enRouteCount = rescueRequests.filter((r) => r.status === 'En Route').length;
  const completedCount = rescueRequests.filter((r) => r.status === 'Completed').length;

  // Volunteer Handlers
  const handleOpenScheduleVisit = (app) => {
    setSelectedVolunteerForVisit(app);
    setVolunteerVisitDate(
      app.visitScheduleDate
        ? new Date(app.visitScheduleDate).toISOString().slice(0, 10)
        : new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)
    );
    setVolunteerVisitValuationPeriod(app.visitValuationPeriod || '10:00 AM - 1:00 PM');
    setVolunteerVisitCoordinator(app.visitCoordinator || user?.fullName || 'Field Rescue Lead');
    setVolunteerVisitNotes(
      app.visitNotes ||
        'Please bring government photo ID and report to the designated field station for equipment orientation.'
    );
    setShowVolunteerVisitModal(true);
  };

  const handleConfirmScheduleVolunteerVisit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedVolunteerForVisit) return;
    setVolunteerVisitSubmitting(true);
    try {
      const appId = selectedVolunteerForVisit._id || selectedVolunteerForVisit.id;
      const payload = {
        visitScheduleDate: volunteerVisitDate ? new Date(volunteerVisitDate) : new Date(),
        visitValuationPeriod: volunteerVisitValuationPeriod,
        visitCoordinator: volunteerVisitCoordinator,
        visitNotes: volunteerVisitNotes,
      };
      const res = await scheduleVolunteerVisit(appId, payload);
      if (res?.success) {
        setVolunteerApplications((prev) =>
          prev.map((a) =>
            (a._id === appId || a.id === appId)
              ? {
                  ...a,
                  ...res.application,
                  applicationStatus: 'Volunteer Visit',
                  status: 'Volunteer Visit',
                }
              : a
          )
        );
        setShowVolunteerVisitModal(false);
        setSelectedVolunteerForVisit(null);
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to schedule volunteer visit.');
    } finally {
      setVolunteerVisitSubmitting(false);
    }
  };

  const handleOpenReportModal = (app) => {
    setSelectedVolunteerForReport(app);
    setVolunteerVisitReportText(
      app.visitReport ||
        `In-person volunteer orientation & animal safety session conducted on ${
          app.visitScheduleDate
            ? new Date(app.visitScheduleDate).toLocaleDateString('en-IN')
            : new Date().toLocaleDateString('en-IN')
        }. Candidate verified for animal handling and emergency dispatch support.`
    );
    setVolunteerReportDecision('Approved');
    if (app.visitChecks) {
      setVolunteerReportChecks(app.visitChecks);
    } else {
      setVolunteerReportChecks({
        identityVerified: true,
        animalHandlingReady: true,
        safetyOrientationDone: true,
        commitmentAgreement: true,
      });
    }
    setShowVolunteerReportModal(true);
  };

  const handleSubmitVolunteerVisitReport = async (e) => {
    if (e) e.preventDefault();
    if (!selectedVolunteerForReport) return;
    setVolunteerReportSubmitting(true);
    try {
      const appId = selectedVolunteerForReport._id || selectedVolunteerForReport.id;
      const payload = {
        visitReport: volunteerVisitReportText,
        visitChecks: volunteerReportChecks,
        decision: volunteerReportDecision,
      };
      const res = await submitVolunteerVisitReport(appId, payload);
      if (res?.success) {
        setVolunteerApplications((prev) =>
          prev.map((a) =>
            (a._id === appId || a.id === appId)
              ? {
                  ...a,
                  ...res.application,
                  applicationStatus: volunteerReportDecision,
                  status: volunteerReportDecision,
                  volunteerId: res.application?.volunteerId || a.volunteerId,
                }
              : a
          )
        );
        setShowVolunteerReportModal(false);
        setSelectedVolunteerForReport(null);
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to submit orientation report.');
    } finally {
      setVolunteerReportSubmitting(false);
    }
  };

  const handleOpenDetailsModal = (app) => {
    setSelectedVolunteerForDetails(app);
    setShowVolunteerDetailsModal(true);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAF9] font-sans overflow-hidden text-slate-800">
      {/* Top Navbar */}
      <Header
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        notifOpen={notifOpen}
        setNotifOpen={setNotifOpen}
        unreadCount={activityTimeline.length}
        activityTimeline={activityTimeline}
        setActiveTab={setActiveTab}
      />

      {/* Main Container Below Navbar */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          handleLogout={handleLogout}
        />

        {/* Scrollable Main Panels */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 space-y-6">
          {activeTab === 'Rescue Dashboard' && (
            <Dashboard
              user={user}
              teamProfile={teamProfile}
              isOnline={isOnline}
              setIsOnline={setIsOnline}
              pendingCount={pendingCount}
              enRouteCount={enRouteCount}
              completedCount={completedCount}
              activityTimeline={activityTimeline}
              requests={rescueRequests}
              filtered={filtered}
              broadcasts={broadcasts}
              shelters={shelters}
              broadcastsLoading={broadcastsLoading}
              onAcceptBroadcast={handleAcceptRequest}
              onDeclineBroadcast={handleDeclineRequest}
              onOpenUpdateModal={(req) => setShowUpdateModal(req)}
              onOpenShelterTransfer={(req) => {
                setSelectedRequestForShelter(req);
                setShowShelterModal(true);
              }}
              onTrackMission={(req) => setTrackingRequestId(req?._id || req?.id || req?.rescueRequestId || req)}
              onRefresh={loadBroadcasts}
              volunteerApplications={volunteerApplications}
              setActiveTab={setActiveTab}
            />
          )}

          {(activeTab === 'Rescue Operations' || activeTab === 'Assigned Requests') && (
            <div className="space-y-6">
              <RescueOperations
                requests={rescueRequests}
                filtered={filtered}
                broadcasts={broadcasts}
                broadcastsLoading={broadcastsLoading}
                priorityFilter={priorityFilter}
                setPriorityFilter={setPriorityFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onAcceptBroadcast={handleAcceptRequest}
                onDeclineBroadcast={handleDeclineRequest}
                setShowUpdateModal={setShowUpdateModal}
                onOpenShelterTransfer={(req) => {
                  setSelectedRequestForShelter(req);
                  setShowShelterModal(true);
                }}
                onTrackMission={(req) => setTrackingRequestId(req?._id || req?.id || req?.rescueRequestId || req)}
                onRefresh={loadBroadcasts}
              />
            </div>
          )}

          {activeTab === 'Manage Volunteers' && (
            <ManageVolunteers
              volunteerApplications={volunteerApplications}
              loading={volunteersLoading}
              onRefresh={loadVolunteers}
              onOpenScheduleVisit={handleOpenScheduleVisit}
              onOpenReportModal={handleOpenReportModal}
              onOpenDetailsModal={handleOpenDetailsModal}
            />
          )}

          {activeTab === 'Notifications' && (
            <Notifications activityTimeline={activityTimeline} />
          )}

          {activeTab === 'My Profile' && (
            <Profile user={user} isOnline={isOnline} />
          )}
        </main>
      </div>

      {/* Status Update Modal */}
      <UpdateRequestModal
        showUpdateModal={showUpdateModal}
        setShowUpdateModal={setShowUpdateModal}
        onStageUpdated={() => loadBroadcasts()}
        onOpenShelterTransfer={(req) => {
          setSelectedRequestForShelter(req);
          setShowShelterModal(true);
        }}
      />

      {/* Nearby Shelters Intake Modal */}
      <NearbySheltersModal
        isOpen={showShelterModal}
        onClose={() => {
          setShowShelterModal(false);
          setSelectedRequestForShelter(null);
        }}
        rescueRequestId={
          selectedRequestForShelter?._id ||
          selectedRequestForShelter?.id ||
          selectedRequestForShelter?.rescueRequestId
        }
        animalInfo={
          selectedRequestForShelter
            ? `${selectedRequestForShelter.animalCondition || 'Injured'} ${selectedRequestForShelter.animalType || 'Animal'}`
            : 'Rescued Animal'
        }
        onRoutedSuccess={() => {
          loadBroadcasts();
        }}
      />

      {/* Volunteer Visit Scheduling Modal */}
      <VolunteerVisitModal
        isOpen={showVolunteerVisitModal}
        application={selectedVolunteerForVisit}
        onClose={() => {
          setShowVolunteerVisitModal(false);
          setSelectedVolunteerForVisit(null);
        }}
        volunteerVisitDate={volunteerVisitDate}
        setVolunteerVisitDate={setVolunteerVisitDate}
        volunteerVisitValuationPeriod={volunteerVisitValuationPeriod}
        setVolunteerVisitValuationPeriod={setVolunteerVisitValuationPeriod}
        volunteerVisitCoordinator={volunteerVisitCoordinator}
        setVolunteerVisitCoordinator={setVolunteerVisitCoordinator}
        volunteerVisitNotes={volunteerVisitNotes}
        setVolunteerVisitNotes={setVolunteerVisitNotes}
        volunteerVisitSubmitting={volunteerVisitSubmitting}
        handleConfirmScheduleVolunteerVisit={handleConfirmScheduleVolunteerVisit}
      />

      {/* Volunteer Visit Report Modal */}
      <VolunteerVisitReportModal
        isOpen={showVolunteerReportModal}
        application={selectedVolunteerForReport}
        onClose={() => {
          setShowVolunteerReportModal(false);
          setSelectedVolunteerForReport(null);
        }}
        volunteerVisitReportText={volunteerVisitReportText}
        setVolunteerVisitReportText={setVolunteerVisitReportText}
        volunteerReportDecision={volunteerReportDecision}
        setVolunteerReportDecision={setVolunteerReportDecision}
        volunteerReportChecks={volunteerReportChecks}
        setVolunteerReportChecks={setVolunteerReportChecks}
        reportSubmitting={volunteerReportSubmitting}
        handleSubmitVolunteerVisitReport={handleSubmitVolunteerVisitReport}
      />

      {/* Volunteer Details Modal */}
      <VolunteerDetailsModal
        isOpen={showVolunteerDetailsModal}
        application={selectedVolunteerForDetails}
        onClose={() => {
          setShowVolunteerDetailsModal(false);
          setSelectedVolunteerForDetails(null);
        }}
        onOpenScheduleVisit={handleOpenScheduleVisit}
        onOpenReportModal={handleOpenReportModal}
      />

      {/* Live Rescue Mission Tracking Modal */}
      {trackingRequestId && (
        <LiveRescueTrackingModal
          isOpen={Boolean(trackingRequestId)}
          onClose={() => setTrackingRequestId(null)}
          rescueRequestId={trackingRequestId}
          showTeamResponses={true}
        />
      )}
    </div>
  );
};

export default RescueTeamDashboard;
