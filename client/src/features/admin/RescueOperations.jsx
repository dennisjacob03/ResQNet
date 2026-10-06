import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MapPin,
  Radio,
  RefreshCw,
  Search,
  Truck,
  UserCheck,
} from "lucide-react";
import InteractiveMap from "../../components/common/InteractiveMap";
import LiveRescueTrackingModal from "../user-dashboard/LiveRescueTrackingModal";
import { getAdminRescueRequests } from "../../services/rescueRequestService";

const statusStyles = {
  Notified: "bg-amber-50 text-amber-800 border-amber-200",
  Accepted: "bg-blue-50 text-blue-800 border-blue-200",
  Assigned: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Declined: "bg-slate-100 text-slate-500 border-slate-200",
  Backup: "bg-indigo-50 text-indigo-800 border-indigo-200",
};

const getReportId = (report) => report.rescueRequestId || report._id;

const RescueOperations = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [trackingReportId, setTrackingReportId] = useState(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminRescueRequests();
      setReports(response?.requests || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load rescue operations.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    const interval = setInterval(loadReports, 12000);
    return () => clearInterval(interval);
  }, []);

  const filteredReports = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return reports.filter((report) => {
      const searchable = [
        getReportId(report),
        report.locationAddress,
        report.animalType,
        report.animalCondition,
        report.assignedRescueTeamName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        (stageFilter === "All" ||
          (report.rescueStage || report.status) === stageFilter)
      );
    });
  }, [reports, query, stageFilter]);

  const activeReports = reports.filter(
    (report) =>
      !["Completed", "Cancelled", "Delivered to Shelter"].includes(
        report.rescueStage || report.status,
      ),
  );
  const broadcastCount = reports.filter(
    (report) => report.rescueStage === "Broadcasted",
  ).length;
  const assignedCount = reports.filter(
    (report) => report.assignedRescueTeamId || report.assignedRescueTeamName,
  ).length;
  const acceptedCount = reports.reduce(
    (count, report) =>
      count +
      (report.candidateTeams || []).filter((team) =>
        ["Accepted", "Assigned"].includes(team.status),
      ).length,
    0,
  );

  const markers = activeReports
    .filter((report) => report.latitude && report.longitude)
    .map((report) => ({
      id: getReportId(report),
      type: "RESCUE_REPORT",
      latitude: report.latitude,
      longitude: report.longitude,
      title: `${report.animalCondition || "Injured"} ${report.animalType || "Animal"}`,
      address: report.locationAddress,
      status: report.rescueStage || report.status,
    }));

  return (
    <div className="space-y-5 pb-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Active Missions",
            value: activeReports.length,
            icon: AlertTriangle,
            color: "text-rose-600",
            bg: "bg-rose-50",
          },
          {
            label: "Broadcasted",
            value: broadcastCount,
            icon: Radio,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Teams Accepted",
            value: acceptedCount,
            icon: UserCheck,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Units Assigned",
            value: assignedCount,
            icon: Truck,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm"
          >
            <div
              className={`w-9 h-9 ${bg} ${color} rounded-xl flex items-center justify-center`}
            >
              <Icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-3">
              {label}
            </p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search report ID, animal, location, or assigned unit"
            className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#237737]"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={stageFilter}
            onChange={(event) => setStageFilter(event.target.value)}
            className="px-3 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
          >
            <option value="All">All mission stages</option>
            {[
              "Broadcasted",
              "Accepted",
              "En Route",
              "Arrived on Scene",
              "Animal Rescued",
              "Transporting to Shelter",
              "Delivered to Shelter",
              "Completed",
              "Cancelled",
            ].map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={loadReports}
            disabled={loading}
            title="Refresh rescue operations"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
        <div className="flex items-center justify-between px-2 pb-3">
          <div>
            <h2 className="font-extrabold text-slate-900">
              Live Broadcast Map
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Incident pins refresh every 12 seconds
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />{" "}
            Active locations
          </span>
        </div>
        <InteractiveMap
          markers={markers}
          filterMode="all"
          height="410px"
          onSelectMarker={({ data }) => setSelectedReportId(getReportId(data))}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900">
            Rescue Reports ({filteredReports.length})
          </h2>
          <span className="text-[11px] font-bold text-slate-400 inline-flex items-center gap-1">
            <Clock3 className="w-3.5 h-3.5" /> Live status polling
          </span>
        </div>
        {filteredReports.map((report) => {
          const reportId = getReportId(report);
          const isSelected = selectedReportId === reportId;
          return (
            <div
              key={reportId}
              className={`bg-white border rounded-2xl p-4 shadow-sm transition ${isSelected ? "border-[#237737] ring-2 ring-[#237737]/10" : "border-slate-100"}`}
            >
              <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedReportId(isSelected ? null : reportId)
                  }
                  className="text-left min-w-0 cursor-pointer"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                      {reportId}
                    </span>
                    <span className="px-2 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                      {report.rescueStage || report.status || "Broadcasted"}
                    </span>
                    <span className="font-extrabold text-sm text-slate-900">
                      {report.animalCondition || "Injured"}{" "}
                      {report.animalType || "Animal"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    {report.locationAddress || "Incident location"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Reported by {report.userId?.fullName || "Citizen"} ·{" "}
                    {report.createdAt
                      ? new Date(report.createdAt).toLocaleString()
                      : "Recently"}
                  </p>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  {report.assignedRescueTeamName && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl">
                      Assigned: {report.assignedRescueTeamName}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setTrackingReportId(reportId)}
                    className="px-3 py-1.5 bg-[#237737] hover:bg-[#1d632e] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Track mission
                  </button>
                </div>
              </div>

              {isSelected && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      Broadcast recipients and responses
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400">
                      {(report.candidateTeams || []).length} teams notified
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                    {(report.candidateTeams || []).map((team) => (
                      <div
                        key={
                          team.teamObjectId ||
                          team.teamId ||
                          team.rescueTeamNumber
                        }
                        className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-slate-800 truncate">
                            {team.rescueTeamName ||
                              team.rescueTeamNumber ||
                              "Rescue team"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {team.distanceKm != null
                              ? `${team.distanceKm} km away`
                              : "Distance unavailable"}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 px-2 py-1 rounded-lg border text-[10px] font-black ${statusStyles[team.status] || statusStyles.Notified}`}
                        >
                          {team.status || "Notified"}
                        </span>
                      </div>
                    ))}
                  </div>
                  {report.assignedRescueTeamName && (
                    <p className="mt-3 text-xs text-emerald-700 font-bold inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Nearest accepted unit
                      assigned: {report.assignedRescueTeamName}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {!loading && filteredReports.length === 0 && (
          <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center text-sm text-slate-400 font-semibold">
            No rescue reports match the current filters.
          </div>
        )}
      </div>
      <LiveRescueTrackingModal
        isOpen={Boolean(trackingReportId)}
        rescueRequestId={trackingReportId}
        showTeamResponses
        onClose={() => setTrackingReportId(null)}
      />
    </div>
  );
};

export default RescueOperations;
