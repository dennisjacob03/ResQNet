import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Bell,
  Star,
  CheckCircle2,
  AlertCircle,
  Building2,
  AlertTriangle,
  Heart,
  Info,
} from "lucide-react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import RescueRequest from "./RescueRequest";
import Adoption from "./Adoption";
import ShelterRegister from "./ShelterRegister";
import RescueTeamRegister from "./RescueTeamRegister";
import VolunteerRegister from "./VolunteerRegister";
import VeterinaryRegister from "./VeterinaryRegister";
import Notifications from "./Notifications";
import Profile from "./Profile";
import RescueShelterMap from "./RescueShelterMap";
import LiveRescueTrackingModal from "./LiveRescueTrackingModal";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  createNotification,
} from "../../services/notificationService";
import { getAllAnimals } from "../../services/animalService";
import { getAllShelters } from "../../services/shelterService";
import {
  createRescueRequest,
  getUserRescueRequests,
} from "../../services/rescueRequestService";
import { ProfileRequiredModal } from "../../components/common/ProfileRequiredCard";
import { checkProfileCompletion, isActionTab } from "../../utils/profileUtils";
import { useDashboardTabNavigation } from "../../utils/dashboardNavigation";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Profile Required Action Modal States
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalAction, setProfileModalAction] = useState("Report Animal");
  const [initialProfileEdit, setInitialProfileEdit] = useState(false);

  // Profile check callback when an action tab is activated
  const handleProfileCheckOnTab = useCallback(
    (tabName, sourceAction = null) => {
      if (isActionTab(tabName)) {
        const profileStatus = checkProfileCompletion(user);
        if (!profileStatus.isComplete) {
          setProfileModalAction(sourceAction || tabName);
          setProfileModalOpen(true);
        }
      }
    },
    [user],
  );

  const [activeTab, handleTabChange] = useDashboardTabNavigation(
    "Public User",
    handleProfileCheckOnTab,
  );

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return false;
    }
    const saved = localStorage.getItem("resqnet_sidebar_open");
    return saved !== null ? saved === "true" : true;
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        localStorage.setItem("resqnet_sidebar_open", String(next));
      }
      return next;
    });
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        const saved = localStorage.getItem("resqnet_sidebar_open");
        setSidebarOpen(saved !== null ? saved === "true" : true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleGoToProfile = () => {
    setProfileModalOpen(false);
    setInitialProfileEdit(true);
    handleTabChange("My Profile");
  };

  const handleRequireProfile = (actionName = "perform this action") => {
    setProfileModalAction(actionName);
    setProfileModalOpen(true);
  };

  // Form states for Report Animal
  const [animalType, setAnimalType] = useState("Dog");
  const [animalCondition, setAnimalCondition] = useState("Injured");
  const [description, setDescription] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [district, setDistrict] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);

  // Live Tracking Modal State
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [activeTrackingId, setActiveTrackingId] = useState(null);
  const [latestSubmittedReportId, setLatestSubmittedReportId] = useState(null);

  // Search & Filter states for Adoption
  const [searchTerm, setSearchTerm] = useState("");
  const [petCategory, setPetCategory] = useState("All");
  const [adoptionPets, setAdoptionPets] = useState([]);
  const [sheltersList, setSheltersList] = useState([]);

  // Live Notifications State (synced with MongoDB backend)
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const res = await getMyNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
      }
    } catch (err) {
      console.warn("Failed to load notifications:", err.message);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [animalsRes, sheltersRes, requestsRes] = await Promise.all([
        getAllAnimals().catch(() => ({ data: [], animals: [] })),
        getAllShelters().catch(() => ({ shelters: [] })),
        getUserRescueRequests().catch(() => ({ requests: [] })),
      ]);
      const pets = animalsRes?.data || animalsRes?.animals || [];
      setAdoptionPets(pets);
      if (sheltersRes?.shelters) {
        setSheltersList(sheltersRes.shelters);
      }
      if (requestsRes?.requests) {
        setRescueReports(requestsRes.requests);
      }
    } catch (err) {
      console.warn("Failed to load user dashboard resources:", err);
    }
  };

  // Load real data on dashboard mount
  useEffect(() => {
    loadNotifications();
    loadDashboardData();
  }, []);

  // Compute live unread count
  const unreadCount = notifications.filter((n) => n.status === "Unread").length;

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "Read" })));
    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.warn("Failed to mark all read on server:", err.message);
    }
  };

  const handleToggleRead = async (id) => {
    const target = notifications.find((n) => n._id === id || n.id === id);
    if (target && target.status === "Unread") {
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id || n.id === id ? { ...n, status: "Read" } : n,
        ),
      );
      try {
        await markNotificationRead(target._id || id);
      } catch (err) {
        console.warn(
          "Failed to mark notification read on server:",
          err.message,
        );
      }
    }
  };

  const handleDeleteNotification = async (id, e) => {
    e?.stopPropagation();
    const target = notifications.find((n) => n._id === id || n.id === id);
    setNotifications((prev) => prev.filter((n) => n._id !== id && n.id !== id));
    try {
      if (target?._id) {
        await deleteNotification(target._id);
      }
    } catch (err) {
      console.warn("Failed to delete notification on server:", err.message);
    }
  };

  const getNotificationIconInfo = (notif) => {
    switch (notif.type) {
      case "Welcome":
        return {
          icon: Star,
          color: "bg-emerald-500/10 text-emerald-600",
          badgeColor: "bg-emerald-100 text-emerald-800",
          label: "Welcome",
        };
      case "ShelterApplication":
        if (notif.title?.toLowerCase().includes("approved")) {
          return {
            icon: CheckCircle2,
            color: "bg-emerald-500/10 text-emerald-600",
            badgeColor: "bg-emerald-100 text-emerald-800",
            label: "Shelter Approved",
          };
        } else if (notif.title?.toLowerCase().includes("rejected")) {
          return {
            icon: AlertCircle,
            color: "bg-rose-500/10 text-rose-600",
            badgeColor: "bg-rose-100 text-rose-800",
            label: "Shelter Rejected",
          };
        }
        return {
          icon: Building2,
          color: "bg-blue-500/10 text-blue-600",
          badgeColor: "bg-blue-100 text-blue-800",
          label: "Shelter Application",
        };
      case "Rescue":
        return {
          icon: AlertTriangle,
          color: "bg-amber-500/10 text-amber-600",
          badgeColor: "bg-amber-100 text-amber-800",
          label: "Rescue",
        };
      case "Adoption":
        return {
          icon: Heart,
          color: "bg-rose-500/10 text-rose-600",
          badgeColor: "bg-rose-100 text-rose-800",
          label: "Adoption",
        };
      case "Alert":
        return {
          icon: AlertCircle,
          color: "bg-rose-500/10 text-rose-600",
          badgeColor: "bg-rose-100 text-rose-800",
          label: "Alert",
        };
      default:
        return {
          icon: Bell,
          color: "bg-slate-100 text-slate-600",
          badgeColor: "bg-slate-100 text-slate-700",
          label: "General",
        };
    }
  };

  const formatNotificationTime = (dateStr) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Live Rescue Reports Data
  const [rescueReports, setRescueReports] = useState([]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getFirstName = () => {
    return (user?.fullName || "User").split(" ")[0];
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    const profileStatus = checkProfileCompletion(user);
    if (!profileStatus.isComplete) {
      setProfileModalAction("Report Animal");
      setProfileModalOpen(true);
      return;
    }
    if (!description.trim()) return;

    setSubmittingReport(true);
    let createdRecord = null;

    try {
      const res = await createRescueRequest({
        animalType,
        animalCondition,
        description,
        locationAddress: locationInput || "Detected Location",
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        district: district || undefined,
        image: photoFile || undefined,
      });

      if (res?.success && res.request) {
        createdRecord = res.request;
        setRescueReports((prev) => [res.request, ...prev]);
      }
    } catch (err) {
      console.warn("Backend rescue request creation failed:", err.message);
    } finally {
      setSubmittingReport(false);
    }

    const reportId =
      createdRecord?.rescueRequestId ||
      "RQ-" + Math.floor(1000 + Math.random() * 9000);
    setLatestSubmittedReportId(reportId);

    if (!createdRecord) {
      const fallbackReport = {
        _id: "local-" + Date.now(),
        rescueRequestId: reportId,
        animalType,
        animalCondition,
        status: "Reported",
        rescueStage: "Broadcasted",
        locationAddress: locationInput || "Detected Location",
        createdAt: new Date().toISOString(),
      };
      setRescueReports((prev) => [fallbackReport, ...prev]);
    }

    setSubmitSuccess(true);

    try {
      await createNotification({
        title: "Rescue Report Submitted 🚨",
        message: `Your report for a ${animalCondition} ${animalType} has been successfully filed under ${reportId}. Nearby rescue teams have been alerted.`,
        type: "Rescue",
        priority: "High",
        metadata: { reportId },
      });
      loadNotifications();
    } catch (err) {
      console.warn("Failed to dispatch rescue notification:", err.message);
    }
  };

  const filteredPets = adoptionPets.filter((pet) => {
    const isHealthy = !pet.healthCondition || pet.healthCondition === "Healthy";
    const isAvailable = pet.status === "Available" || pet.status === "Rescued";
    if (!isHealthy || !isAvailable) return false;

    const name = pet.name || "";
    const breed = pet.breed || "";
    const species = pet.species || pet.category || "";
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      petCategory === "All" ||
      petCategory === "All Pets" ||
      (petCategory === "Dogs" && species === "Dog") ||
      (petCategory === "Cats" && species === "Cat") ||
      species === petCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAF9] font-sans overflow-hidden text-slate-800">
      {/* Modular Header */}
      <Header
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        notifications={notifications}
        unreadCount={unreadCount}
        notifDropdownOpen={notifDropdownOpen}
        setNotifDropdownOpen={setNotifDropdownOpen}
        handleMarkAllRead={handleMarkAllRead}
        handleToggleRead={handleToggleRead}
        setActiveTab={handleTabChange}
        getNotificationIconInfo={getNotificationIconInfo}
        formatNotificationTime={formatNotificationTime}
      />

      {/* Main Container Below Navbar */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Modular Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          handleOpenShelterTab={() => handleTabChange("Register Shelter")}
          setSubmitSuccess={setSubmitSuccess}
          handleLogout={handleLogout}
          user={user}
        />

        {/* Dashboard Panels */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8">
          {/* Dashboard Panels — keyed by activeTab so React fully unmounts/remounts
            the previous panel, triggering the CSS fade-in on every switch */}
          <div key={activeTab} className="tab-panel-enter h-full">
            {/* Tab 1: Dashboard Home */}
            {activeTab === "Dashboard" && (
              <Dashboard
                getFirstName={getFirstName}
                rescueReports={rescueReports}
                sheltersList={sheltersList}
                setActiveTab={handleTabChange}
                user={user}
                onNavigateToProfile={handleGoToProfile}
                onTrackRescue={(reqId) => {
                  setActiveTrackingId(reqId);
                  setTrackingModalOpen(true);
                }}
              />
            )}

            {/* Tab 2: Report Animal Form */}
            {activeTab === "Report Animal" && (
              <RescueRequest
                animalType={animalType}
                setAnimalType={setAnimalType}
                animalCondition={animalCondition}
                setAnimalCondition={setAnimalCondition}
                description={description}
                setDescription={setDescription}
                locationInput={locationInput}
                setLocationInput={setLocationInput}
                latitude={latitude}
                setLatitude={setLatitude}
                longitude={longitude}
                setLongitude={setLongitude}
                district={district}
                setDistrict={setDistrict}
                photoFile={photoFile}
                setPhotoFile={setPhotoFile}
                submitSuccess={submitSuccess}
                setSubmitSuccess={setSubmitSuccess}
                submitting={submittingReport}
                handleReportSubmit={handleReportSubmit}
                user={user}
                onNavigateToProfile={handleGoToProfile}
                onOpenProfileModal={() => {
                  setProfileModalAction("Report Animal");
                  setProfileModalOpen(true);
                }}
                rescueReports={rescueReports}
                onTrackRescue={(reqId) => {
                  setActiveTrackingId(reqId);
                  setTrackingModalOpen(true);
                }}
                onRefreshReports={loadDashboardData}
                latestSubmittedReportId={latestSubmittedReportId}
              />
            )}

            {/* Tab 3: Rescue & Shelter Map */}
            {activeTab === "Rescue & Shelter Map" && <RescueShelterMap />}

            {/* Tab 4: Adopt a Pet List */}
            {activeTab === "Adopt a Pet" && (
              <Adoption
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                petCategory={petCategory}
                setPetCategory={setPetCategory}
                filteredPets={filteredPets}
                navigate={navigate}
                user={user}
                onRequireProfile={handleRequireProfile}
                onNavigateToProfile={handleGoToProfile}
              />
            )}

            {/* Tab 5: Register Shelter */}
            {activeTab === "Register Shelter" && (
              <ShelterRegister
                onApplicationSubmitted={() => loadNotifications()}
                onRequireProfile={handleRequireProfile}
                onNavigateToProfile={handleGoToProfile}
                user={user}
              />
            )}

            {/* Tab 6: Register Rescue Team */}
            {activeTab === "Register Rescue Team" && (
              <RescueTeamRegister
                onApplicationSubmitted={() => loadNotifications()}
                onRequireProfile={handleRequireProfile}
                onNavigateToProfile={handleGoToProfile}
                user={user}
              />
            )}

            {/* Tab 7: Volunteer Program */}
            {activeTab === "Volunteer" && (
              <VolunteerRegister
                onApplicationSubmitted={() => loadNotifications()}
                onRequireProfile={handleRequireProfile}
                onNavigateToProfile={handleGoToProfile}
                user={user}
              />
            )}

            {/* Tab 8: Veterinary Staff Application & Status */}
            {activeTab === "Join Vet Staff" && (
              <VeterinaryRegister
                onApplicationSubmitted={() => loadNotifications()}
                onRequireProfile={handleRequireProfile}
                onNavigateToProfile={handleGoToProfile}
                user={user}
              />
            )}

            {/* Tab 9: Notifications List */}
            {activeTab === "Notifications" && (
              <Notifications
                notifications={notifications}
                notificationsLoading={notificationsLoading}
                loadNotifications={loadNotifications}
                unreadCount={unreadCount}
                handleMarkAllRead={handleMarkAllRead}
                handleToggleRead={handleToggleRead}
                handleDeleteNotification={handleDeleteNotification}
                getNotificationIconInfo={getNotificationIconInfo}
                formatNotificationTime={formatNotificationTime}
              />
            )}

            {/* Tab 10: My Profile View */}
            {activeTab === "My Profile" && (
              <Profile
                rescueReports={rescueReports}
                initialEditMode={initialProfileEdit}
                onEditModeReset={() => setInitialProfileEdit(false)}
              />
            )}

            {/* Placeholders for Other Tabs */}
            {activeTab !== "Dashboard" &&
              activeTab !== "Report Animal" &&
              activeTab !== "Rescue & Shelter Map" &&
              activeTab !== "Adopt a Pet" &&
              activeTab !== "Register Shelter" &&
              activeTab !== "Register Rescue Team" &&
              activeTab !== "Volunteer" &&
              activeTab !== "Join Vet Staff" &&
              activeTab !== "Notifications" &&
              activeTab !== "My Profile" && (
                <div className="max-w-xl mx-auto py-16 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                    <Info className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {activeTab} Page
                  </h2>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">
                    This tab is under development and will be connected to the
                    respective microservice logic soon.
                  </p>
                </div>
              )}
          </div>
        </main>
      </div>

      {/* Live Rescue Tracking Modal */}
      <LiveRescueTrackingModal
        isOpen={trackingModalOpen}
        onClose={() => setTrackingModalOpen(false)}
        rescueRequestId={activeTrackingId}
        showTeamResponses={true}
      />

      {/* Mandatory Profile Completion Modal for Public Users */}
      <ProfileRequiredModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onNavigateToProfile={handleGoToProfile}
        user={user}
        actionName={profileModalAction}
      />
    </div>
  );
};

export default UserDashboard;
