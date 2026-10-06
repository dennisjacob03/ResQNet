import { useMemo, useState, useEffect, useRef } from "react";
import {
  Check,
  MapPin,
  Upload,
  Plus,
  AlertTriangle,
  X,
  Radio,
  Truck,
  Building2,
  Clock,
  Search,
  RefreshCw,
  ArrowRight,
  Phone,
  SlidersHorizontal,
} from "lucide-react";
import {
  rescueRequestSchema,
  extractZodErrors,
  validateField,
} from "../../utils/validationSchemas";
import { ProfileRequiredCard } from "../../components/common/ProfileRequiredCard";
import { checkProfileCompletion } from "../../utils/profileUtils";
import { getUserRescueRequests } from "../../services/rescueRequestService";
import LiveRescueTrackingModal from "./LiveRescueTrackingModal";

const stageBadgeStyles = {
  Broadcasted: "bg-amber-50 text-amber-800 border-amber-200",
  Accepted: "bg-blue-50 text-blue-800 border-blue-200",
  "En Route": "bg-sky-50 text-sky-800 border-sky-200",
  "Arrived on Scene": "bg-indigo-50 text-indigo-800 border-indigo-200",
  "Animal Rescued": "bg-purple-50 text-purple-800 border-purple-200",
  "Transporting to Shelter": "bg-amber-50 text-amber-800 border-amber-200",
  "Delivered to Shelter": "bg-emerald-50 text-emerald-800 border-emerald-200",
  Completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Cancelled: "bg-rose-50 text-rose-800 border-rose-200",
};

const getAnimalIcon = (type) => {
  if (type === "Cat") return "🐱";
  if (type === "Bird") return "🐦";
  if (type === "Cow" || type === "Cattle") return "🐄";
  if (type === "Horse") return "🐴";
  return "🐕";
};

const RescueRequest = ({
  animalType,
  setAnimalType,
  animalCondition,
  setAnimalCondition,
  description,
  setDescription,
  locationInput,
  setLocationInput,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  district,
  setDistrict,
  photoFile,
  setPhotoFile,
  submitSuccess,
  setSubmitSuccess,
  submitting,
  handleReportSubmit,
  user,
  onNavigateToProfile,
  onOpenProfileModal,
  rescueReports = [],
  onTrackRescue,
  onRefreshReports,
  latestSubmittedReportId,
}) => {
  const [activeTab, setActiveTab] = useState("form"); // 'form' | 'reports'
  const [internalReports, setInternalReports] = useState([]);
  const reportsList =
    rescueReports && rescueReports.length > 0 ? rescueReports : internalReports;

  const [reportsLoading, setReportsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [localTrackingId, setLocalTrackingId] = useState(null);

  const [detectingLoc, setDetectingLoc] = useState(false);
  const [locStatus, setLocStatus] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [photoError, setPhotoError] = useState("");
  const photoInputRef = useRef(null);

  const photoPreview = useMemo(() => {
    if (!photoFile) return "";
    return URL.createObjectURL(photoFile);
  }, [photoFile]);

  // Fetch submitted reports directly if not provided or when user requests
  const fetchMyReports = async () => {
    setReportsLoading(true);
    try {
      if (onRefreshReports) {
        await onRefreshReports();
      }
      const res = await getUserRescueRequests();
      if (res?.requests) {
        setInternalReports(res.requests);
      }
    } catch (err) {
      console.warn("Failed to load user rescue reports:", err);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (activeTab === "reports" && reportsList.length === 0) {
      getUserRescueRequests()
        .then((res) => {
          if (isMounted && res?.requests) {
            setInternalReports(res.requests);
          }
        })
        .catch((err) => console.warn("Failed to load reports:", err));
    }
    return () => {
      isMounted = false;
    };
  }, [activeTab, reportsList.length]);

  const handlePhotoChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPhotoError("Photo must be 10MB or smaller.");
      return;
    }
    setPhotoError("");
    setPhotoFile(file);
  };

  const handleBlurField = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(rescueRequestSchema, field, value);
    setFieldErrors((prev) => {
      const updated = { ...prev };
      if (err) updated[field] = err;
      else delete updated[field];
      return updated;
    });
  };

  const profileStatus = checkProfileCompletion(user);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!profileStatus.isComplete) {
      if (onOpenProfileModal) {
        onOpenProfileModal();
      }
      return;
    }

    const data = {
      animalType,
      animalCondition,
      description: (description || "").trim(),
      locationAddress: (locationInput || "").trim(),
      latitude,
      longitude,
      district,
    };
    const res = rescueRequestSchema.safeParse(data);
    if (!res.success) {
      const errors = extractZodErrors(res.error);
      setFieldErrors(errors);
      setTouched({
        animalType: true,
        animalCondition: true,
        description: true,
        locationAddress: true,
      });
      return;
    }
    handleReportSubmit(e);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingLoc(true);
    setLocStatus("Detecting your GPS coordinates...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        if (setLatitude) setLatitude(lat);
        if (setLongitude) setLongitude(lng);
        setLocStatus(`GPS Acquired: ${lat}, ${lng}`);
        if (!locationInput) {
          setLocationInput(`Coordinates: ${lat}, ${lng}`);
          setFieldErrors((prev) => {
            const up = { ...prev };
            delete up.locationAddress;
            return up;
          });
        }
        setDetectingLoc(false);
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setLocStatus(
          "Could not detect location. Please enter address manually.",
        );
        setDetectingLoc(false);
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const handleTrackMission = (reqId) => {
    if (!reqId) return;
    if (onTrackRescue) {
      onTrackRescue(reqId);
    } else {
      setLocalTrackingId(reqId);
    }
  };

  const resetFormForAnother = () => {
    if (setSubmitSuccess) setSubmitSuccess(false);
    if (setDescription) setDescription("");
    if (setLocationInput) setLocationInput("");
    if (setPhotoFile) setPhotoFile(null);
    if (setLatitude) setLatitude(null);
    if (setLongitude) setLongitude(null);
    setActiveTab("form");
  };

  // Filtered reports
  const activeReportsCount = useMemo(() => {
    return reportsList.filter(
      (r) =>
        r.status !== "Completed" &&
        r.status !== "Cancelled" &&
        r.rescueStage !== "Delivered to Shelter",
    ).length;
  }, [reportsList]);

  const filteredReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reportsList.filter((r) => {
      const id = (r.rescueRequestId || r._id || "").toLowerCase();
      const animal = `${r.animalCondition || ""} ${r.animalType || ""}`.toLowerCase();
      const loc = (r.locationAddress || "").toLowerCase();
      const stage = (r.rescueStage || r.status || "").toLowerCase();

      const matchesQuery =
        !q || id.includes(q) || animal.includes(q) || loc.includes(q);

      const matchesStatus =
        statusFilter === "All"
          ? true
          : statusFilter === "Active"
          ? r.status !== "Completed" &&
            r.status !== "Cancelled" &&
            r.rescueStage !== "Delivered to Shelter"
          : statusFilter === "Completed"
          ? r.status === "Completed" || r.rescueStage === "Delivered to Shelter"
          : stage.includes(statusFilter.toLowerCase());

      return matchesQuery && matchesStatus;
    });
  }, [reportsList, searchQuery, statusFilter]);

  const latestId =
    latestSubmittedReportId ||
    (reportsList.length > 0
      ? reportsList[0].rescueRequestId || reportsList[0]._id
      : null);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            {activeTab === "form"
              ? "Report an Animal in Distress"
              : "My Submitted Rescue Reports"}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
            {activeTab === "form"
              ? "Fill out the distress report. Our system broadcasts to nearby rescue units for rapid response."
              : "Review all emergency reports you have filed, check squad dispatch status, and track live transit routes."}
          </p>
        </div>

        {/* Tab Switcher: Report Form vs. My Submitted Reports */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "form"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-[#237737]" />
            Report Animal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "reports"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>My Reports</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeReportsCount > 0
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {reportsList.length}
            </span>
            {activeReportsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* ── Active Missions Alert Banner (when on form tab) ── */}
      {activeTab === "form" && activeReportsCount > 0 && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#237737] flex items-center justify-center shrink-0">
              <Truck className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900">
                You have {activeReportsCount} active rescue mission
                {activeReportsCount > 1 ? "s" : ""} in progress!
              </p>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                Responders are actively coordinating field operations.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {latestId && (
              <button
                type="button"
                onClick={() => handleTrackMission(latestId)}
                className="px-3.5 py-1.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" /> Track Latest Mission
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab("reports")}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1"
            >
              View All ({reportsList.length}) →
            </button>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* VIEW 1: MY SUBMITTED REPORTS & LIVE MISSION TRACKING                  */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {/* Controls Bar: Search & Status Filter */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by report ID, animal, or incident address..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#237737] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737]"
              >
                <option value="All">All Reports ({reportsList.length})</option>
                <option value="Active">Active In-Progress ({activeReportsCount})</option>
                <option value="Completed">Completed / Sheltered</option>
                <option value="Broadcasted">Broadcasted</option>
                <option value="En Route">En Route</option>
              </select>

              <button
                type="button"
                onClick={fetchMyReports}
                disabled={reportsLoading}
                title="Refresh submitted reports"
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-pointer"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    reportsLoading ? "animate-spin text-[#237737]" : ""
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("form")}
                className="px-3.5 py-2 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> New Report
              </button>
            </div>
          </div>

          {/* Reports Card List */}
          <div className="space-y-3">
            {filteredReports.map((report) => {
              const reqId = report.rescueRequestId || report._id || report.id;
              const animalName = `${report.animalCondition || "Injured"} ${
                report.animalType || "Animal"
              }`;
              const stage = report.rescueStage || report.status || "Broadcasted";
              const isFinished =
                stage === "Completed" || stage === "Delivered to Shelter";
              const assignedTeam =
                report.assignedRescueTeamName ||
                report.assignedRescueTeamId?.rescueTeamName;
              const assignedPhone =
                report.assignedRescueTeamPhone ||
                report.assignedRescueTeamId?.contactPhone;
              const vehicle =
                report.assignedRescueTeamVehicle ||
                report.assignedRescueTeamId?.vehicleNumber;
              const destinationShelter =
                report.destinationShelterName ||
                report.destinationShelterId?.shelterName;

              return (
                <div
                  key={reqId}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-sm transition space-y-3.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {report.image ? (
                        <img
                          src={report.image}
                          alt={animalName}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shrink-0">
                          {getAnimalIcon(report.animalType)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-black bg-emerald-50 text-[#237737] border border-emerald-200 px-2 py-0.5 rounded-md">
                            {report.rescueRequestId || reqId}
                          </span>
                          <h3 className="font-extrabold text-sm text-slate-900 truncate">
                            {animalName}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                              stageBadgeStyles[stage] ||
                              "bg-slate-50 text-slate-700 border-slate-200"
                            }`}
                          >
                            {stage}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 font-semibold mt-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate">
                            {report.locationAddress || "Incident Location"}
                          </span>
                        </p>

                        {report.description && (
                          <p className="text-[11px] text-slate-500 font-medium mt-1 line-clamp-1 italic">
                            "{report.description}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Track Mission Action Button */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTrackMission(reqId)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                          isFinished
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-800"
                            : "bg-[#237737] hover:bg-[#1d632e] text-white animate-pulse"
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Track Live Mission</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Responding Team & Shelter Details Snippet */}
                  <div className="pt-2.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#237737] shrink-0" />
                      <span className="truncate">
                        <strong>Responding Unit:</strong>{" "}
                        {assignedTeam ? (
                          <span className="text-[#237737] font-bold">
                            {assignedTeam} {vehicle ? `(${vehicle})` : ""}
                            {assignedPhone && (
                              <a
                                href={`tel:${assignedPhone}`}
                                className="ml-1 text-[#237737] hover:underline inline-flex items-center gap-0.5"
                                title={`Call ${assignedTeam}`}
                              >
                                <Phone className="w-2.5 h-2.5" />
                                {assignedPhone}
                              </a>
                            )}
                          </span>
                        ) : (
                          <span className="text-amber-600 font-semibold">
                            Dispatched to nearby squads
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate">
                        <strong>Shelter Care:</strong>{" "}
                        {destinationShelter ? (
                          <span className="text-indigo-700 font-bold">
                            {destinationShelter}
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            Assigned upon rescue
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:justify-end text-[11px] text-slate-400">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>
                        Filed:{" "}
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleString([], {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Recently"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredReports.length === 0 && !reportsLoading && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Radio className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-800">
                  {reportsList.length === 0
                    ? "No rescue reports submitted yet."
                    : "No reports match your search or filter."}
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  When you spot an injured, stranded, or distressed animal, submit
                  a report to alert field responders immediately.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("form")}
                  className="px-4 py-2 bg-[#237737] text-white text-xs font-bold rounded-xl hover:bg-[#1d632e] transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Report an Animal Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* VIEW 2: REPORT ANIMAL DISTRESS FORM                                   */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === "form" && (
        <>
          {/* Post-submission Success Banner & Live Tracking Quick Launcher */}
          {submitSuccess && (
            <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 rounded-3xl shadow-sm space-y-3.5 animate-in fade-in">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-emerald-950">
                      Rescue Distress Report Submitted Successfully!
                    </h3>
                    <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                      Emergency broadcast dispatched to nearby rescue teams. The
                      closest squad to accept will respond immediately.
                    </p>
                  </div>
                </div>

                {latestId && (
                  <span className="font-mono text-xs font-black bg-white text-[#237737] border border-emerald-300 px-2.5 py-1 rounded-xl shadow-2xs">
                    {latestId}
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-emerald-200/80 flex flex-wrap items-center gap-2.5">
                {latestId && (
                  <button
                    type="button"
                    onClick={() => handleTrackMission(latestId)}
                    className="px-4 py-2 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Track Live Mission Now
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab("reports")}
                  className="px-4 py-2 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  View All My Submitted Reports →
                </button>

                <button
                  type="button"
                  onClick={resetFormForAnother}
                  className="px-3.5 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Report Another Animal
                </button>
              </div>
            </div>
          )}

          {/* Mandatory Profile Incomplete Warning Card */}
          {!profileStatus.isComplete && (
            <ProfileRequiredCard
              user={user}
              onNavigateToProfile={onNavigateToProfile}
              actionName="reporting animal emergencies"
            />
          )}

          {/* The Report Form */}
          <form
            onSubmit={onSubmit}
            className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
          >
            <div className="space-y-2.5">
              <label className="block text-sm font-extrabold text-slate-800">
                Animal Type
              </label>
              <div className="flex flex-wrap gap-2.5">
                {["Dog", "Cat", "Bird", "Cow", "Horse", "Other"].map((type) => {
                  const isSelected = animalType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAnimalType(type)}
                      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition cursor-pointer border ${
                        isSelected
                          ? "bg-[#237737] text-white border-[#237737] shadow-sm shadow-[#237737]/15"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="block text-sm font-extrabold text-slate-800">
                Animal Condition
              </label>
              <div className="flex flex-wrap gap-2.5">
                {[
                  "Injured",
                  "Sick",
                  "Stranded",
                  "Abandoned",
                  "Aggressive",
                  "Deceased",
                ].map((condition) => {
                  const isSelected = animalCondition === condition;
                  return (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => setAnimalCondition(condition)}
                      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition cursor-pointer border ${
                        isSelected
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/15"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {condition}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-extrabold text-slate-800">
                Description *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (touched.description)
                    handleBlurField("description", e.target.value);
                }}
                onBlur={() => handleBlurField("description", description)}
                required
                placeholder="Provide details about the animal's condition, appearance, landmarks (min 10 characters)..."
                className={`w-full px-4 py-3 rounded-2xl placeholder-slate-400 focus:outline-none text-sm transition leading-relaxed font-medium ${
                  fieldErrors.description && touched.description
                    ? "border border-rose-400 bg-rose-50/20 focus:border-rose-500"
                    : "bg-[#F8FAF9] border border-slate-200/80 focus:border-[#237737] focus:ring-2 focus:ring-[#237737]/15 text-slate-800"
                }`}
              />
              {fieldErrors.description && touched.description && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">
                  {fieldErrors.description}
                </p>
              )}
            </div>

            {/* Location Section with GPS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-extrabold text-slate-800">
                  Incident Location & Landmark *
                </label>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={detectingLoc}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {detectingLoc ? "Detecting GPS..." : "Use My GPS Location"}
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => {
                    setLocationInput(e.target.value);
                    if (touched.locationAddress)
                      handleBlurField("locationAddress", e.target.value);
                  }}
                  onBlur={() => handleBlurField("locationAddress", locationInput)}
                  required
                  placeholder="e.g. Near Metro Pillar 42, MG Road, Ernakulam (min 5 characters)"
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl placeholder-slate-400 focus:outline-none text-sm transition font-medium ${
                    fieldErrors.locationAddress && touched.locationAddress
                      ? "border border-rose-400 bg-rose-50/20 focus:border-rose-500"
                      : "bg-[#F8FAF9] border border-slate-200/80 focus:border-[#237737] focus:ring-2 focus:ring-[#237737]/15 text-slate-800"
                  }`}
                />
                <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              </div>
              {fieldErrors.locationAddress && touched.locationAddress && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">
                  {fieldErrors.locationAddress}
                </p>
              )}

              {locStatus && (
                <p className="text-xs text-slate-500 font-medium">{locStatus}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    District / Region
                  </label>
                  <input
                    type="text"
                    value={district || ""}
                    onChange={(e) => setDistrict && setDistrict(e.target.value)}
                    placeholder="e.g. Ernakulam"
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-slate-200/80 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-[#237737]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Latitude (auto or manual)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={latitude || ""}
                    onChange={(e) =>
                      setLatitude &&
                      setLatitude(e.target.value ? parseFloat(e.target.value) : "")
                    }
                    placeholder="9.9312"
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-slate-200/80 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-[#237737]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Longitude (auto or manual)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={longitude || ""}
                    onChange={(e) =>
                      setLongitude &&
                      setLongitude(e.target.value ? parseFloat(e.target.value) : "")
                    }
                    placeholder="76.2673"
                    className="w-full px-3 py-2 bg-[#F8FAF9] border border-slate-200/80 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-[#237737]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3.5">
              <label className="block text-sm font-extrabold text-slate-800">
                Upload Photos
              </label>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  handlePhotoChange(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />

              <div
                onClick={() => photoInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handlePhotoChange(e.dataTransfer.files?.[0]);
                }}
                className="border-2 border-dashed border-slate-200 hover:border-[#237737]/45 rounded-3xl p-8 bg-[#F8FAF9]/50 hover:bg-[#F8FAF9] transition flex flex-col items-center justify-center text-center gap-3 cursor-pointer group"
              >
                <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 group-hover:text-[#237737] group-hover:scale-105 transition-all">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    Drag & drop images here, or{" "}
                    <span className="text-[#237737] underline hover:text-[#1d632e]">
                      browse files
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">
                    JPEG, PNG up to 10MB. AI will analyze for injury severity.
                  </p>
                </div>
              </div>
              {photoError && (
                <p className="text-xs text-rose-500 font-semibold">{photoError}</p>
              )}

              <div className="flex flex-wrap gap-3.5 pt-2">
                {photoFile && (
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                    <img
                      src={photoPreview}
                      alt="Selected rescue report"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoFile(null)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center cursor-pointer shadow"
                      aria-label="Remove photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  aria-label="Add photo"
                  className="w-20 h-20 border-2 border-dashed border-slate-200 hover:border-slate-350 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 cursor-pointer transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="pt-4.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type={profileStatus.isComplete ? "submit" : "button"}
                onClick={(e) => {
                  if (!profileStatus.isComplete) {
                    e.preventDefault();
                    if (onOpenProfileModal) {
                      onOpenProfileModal();
                    }
                  }
                }}
                disabled={submitting}
                className={`w-full sm:w-auto px-8 py-3.5 font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-md ${
                  profileStatus.isComplete
                    ? "bg-[#237737] hover:bg-[#1d632e] active:bg-[#185326] disabled:opacity-60 text-white shadow-[#237737]/15"
                    : "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20"
                }`}
              >
                {submitting
                  ? "Broadcasting Alert..."
                  : profileStatus.isComplete
                  ? "Submit Report →"
                  : "Complete Profile to Submit →"}
              </button>
              {!profileStatus.isComplete && (
                <p className="text-xs text-amber-700 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  Verified profile details are required to submit reports.
                </p>
              )}
            </div>
          </form>
        </>
      )}

      {/* Fallback Live Tracking Modal if not intercepted by parent */}
      {!onTrackRescue && (
        <LiveRescueTrackingModal
          isOpen={Boolean(localTrackingId)}
          rescueRequestId={localTrackingId}
          showTeamResponses={true}
          onClose={() => setLocalTrackingId(null)}
        />
      )}
    </div>
  );
};

export default RescueRequest;
