import { useState, useMemo } from 'react';
import {
  MapPin,
  PhoneCall,
  AlertTriangle,
  Navigation,
  CheckCircle2,
  Clock,
  Activity,
  RefreshCw,
  ArrowRight,
  Users,
  HeartHandshake,
  ChevronRight,
  Radio,
  Crosshair,
  Car,
} from 'lucide-react';
import InteractiveMap from '../../components/common/InteractiveMap';
import LiveRescueTrackingModal from '../user-dashboard/LiveRescueTrackingModal';

const Dashboard = ({
  user,
  teamProfile,
  isOnline,
  setIsOnline,
  pendingCount = 0,
  enRouteCount = 0,
  completedCount = 0,
  activityTimeline = [],
  requests = [],
  filtered = [],
  broadcasts = [],
  shelters = [],
  broadcastsLoading = false,
  onAcceptBroadcast,
  onDeclineBroadcast,
  onOpenUpdateModal,
  onOpenShelterTransfer,
  onTrackMission,
  onRefresh,
  volunteerApplications = [],
  setActiveTab,
}) => {
  // Map filter: 'all' | 'assigned' | 'broadcasts'
  const [mapFilter, setMapFilter] = useState('all');
  const [showShelters, setShowShelters] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [localTrackingId, setLocalTrackingId] = useState(null);
  const [mapCenterOverride, setMapCenterOverride] = useState(null);

  // Rescue Squad Coordinates & Vehicle Information
  const squadCoords = useMemo(() => {
    const lat = Number(
      teamProfile?.latitude ||
        teamProfile?.currentLocation?.latitude ||
        user?.latitude ||
        9.9312
    );
    const lon = Number(
      teamProfile?.longitude ||
        teamProfile?.currentLocation?.longitude ||
        user?.longitude ||
        76.2673
    );
    return {
      latitude: isNaN(lat) || lat === 0 ? 9.9312 : lat,
      longitude: isNaN(lon) || lon === 0 ? 76.2673 : lon,
      title: user?.fullName || teamProfile?.rescueTeamName || 'Rescue Squad Base',
      vehicle: `${teamProfile?.vehicleType || 'Ambulance'} (${teamProfile?.vehicleNumber || 'Dispatch Squad'})`,
      district: teamProfile?.operatingDistrict || user?.district || 'Operations Zone',
      phone: teamProfile?.contactPhone || user?.phoneNumber || '',
    };
  }, [teamProfile, user]);

  // Combine requests, filtered, and incoming broadcasts safely
  const allIncidents = useMemo(() => {
    const map = new Map();
    (requests || []).forEach((r) => {
      const id = r.rescueRequestId || r._id || r.id;
      if (id) map.set(id, r);
    });
    (filtered || []).forEach((r) => {
      const id = r.rescueRequestId || r._id || r.id;
      if (id && !map.has(id)) map.set(id, r);
    });
    (broadcasts || []).forEach((b) => {
      const id = b.rescueRequestId || b._id || b.id;
      if (id && !map.has(id)) map.set(id, b);
    });
    return Array.from(map.values());
  }, [requests, filtered, broadcasts]);

  // Filter active incidents for map
  const activeIncidents = useMemo(() => {
    return allIncidents.filter((inc) => {
      const status = inc.rescueStage || inc.status || 'Pending';
      const isDone = status === 'Completed' || status === 'Cancelled';
      if (isDone) return false;

      const myStatus = inc.myStatus || inc.candidateStatus;
      const isAssigned = inc.isAssignedToThisTeam || inc.isAssignedToMe || myStatus === 'Assigned';
      const isAccepted = myStatus === 'Accepted' || myStatus === 'Backup';

      if (mapFilter === 'assigned') return isAssigned;
      if (mapFilter === 'broadcasts') return !isAssigned && !isAccepted;
      return true;
    });
  }, [allIncidents, mapFilter]);

  // Counts for pills
  const assignedIncidentsCount = useMemo(() => {
    return allIncidents.filter((inc) => {
      const myStatus = inc.myStatus || inc.candidateStatus;
      return inc.isAssignedToThisTeam || inc.isAssignedToMe || myStatus === 'Assigned';
    }).length;
  }, [allIncidents]);

  const broadcastIncidentsCount = useMemo(() => {
    return allIncidents.filter((inc) => {
      const myStatus = inc.myStatus || inc.candidateStatus;
      const isAssigned = inc.isAssignedToThisTeam || inc.isAssignedToMe || myStatus === 'Assigned';
      const isAccepted = myStatus === 'Accepted' || myStatus === 'Backup';
      return !isAssigned && !isAccepted && inc.status !== 'Completed' && inc.status !== 'Cancelled';
    }).length;
  }, [allIncidents]);

  // Default to ongoing active mission if user hasn't explicitly selected or cleared
  const activeAssignedMission = useMemo(() => {
    return allIncidents.find((inc) => {
      const isAssigned = inc.isAssignedToThisTeam || inc.isAssignedToMe || inc.myStatus === 'Assigned';
      const st = inc.rescueStage || inc.status;
      return (
        isAssigned &&
        ['En Route', 'Arrived on Scene', 'Animal Rescued', 'Transporting to Shelter', 'Assigned'].includes(st)
      );
    });
  }, [allIncidents]);

  const activeSelectedIncident =
    selectedIncident === 'none' ? null : (selectedIncident || activeAssignedMission);

  // Build Map Markers
  const mapMarkers = useMemo(() => {
    const list = [];

    // 1. Incident Pins
    activeIncidents.forEach((inc) => {
      if (!inc.latitude || !inc.longitude) return;
      const isAssigned = Boolean(inc.isAssignedToThisTeam || inc.isAssignedToMe || inc.myStatus === 'Assigned');
      const isAccepted = Boolean(inc.candidateStatus === 'Accepted' || inc.myStatus === 'Accepted' || inc.myStatus === 'Backup');
      const isCritical = inc.priority === 'Critical' || inc.priority === 'Emergency' || inc.animalCondition === 'Injured';
      const reqId = inc.rescueRequestId || inc._id || inc.id;

      list.push({
        id: reqId,
        type: 'RESCUE_REPORT',
        latitude: Number(inc.latitude),
        longitude: Number(inc.longitude),
        title: `${inc.animalCondition || 'Injured'} ${inc.animalType || 'Animal'}`,
        address: inc.locationAddress || inc.location || 'Incident Area',
        priority: inc.priority || (isCritical ? 'Critical' : 'High'),
        status: inc.rescueStage || inc.status || 'Broadcasted',
        isAssigned,
        isAccepted,
        animalIcon:
          inc.animalType === 'Cat'
            ? '🐱'
            : inc.animalType === 'Bird'
            ? '🐦'
            : inc.animalType === 'Cow' || inc.animalType === 'Cattle'
            ? '🐄'
            : '🐕',
        distanceKm: inc.distanceKm ?? inc.myDistanceKm ?? 0,
        actionHint: 'Click to select operation & view route',
        raw: inc,
      });
    });

    // 2. Shelter Pins
    if (showShelters && shelters && shelters.length > 0) {
      shelters.forEach((s) => {
        if (!s.latitude || !s.longitude) return;
        list.push({
          id: `shelter-${s._id || s.shelterNumber}`,
          type: 'SHELTER',
          name: s.shelterName || 'Animal Shelter',
          latitude: Number(s.latitude),
          longitude: Number(s.longitude),
          district: s.district || 'Kerala',
          phone: s.shelterPhoneNumber || '',
          shelterStatus: s.shelterStatus || s.currentStatus || 'OPEN',
          availableSpots: s.availableSpots ?? s.availableCages ?? 0,
          totalCages: s.totalCapacity ?? 0,
        });
      });
    }

    return list;
  }, [activeIncidents, showShelters, shelters]);

  // Selected Incident Location for Route Polyline
  const selectedIncidentLoc = useMemo(() => {
    if (!activeSelectedIncident || !activeSelectedIncident.latitude || !activeSelectedIncident.longitude) return null;
    return {
      latitude: Number(activeSelectedIncident.latitude),
      longitude: Number(activeSelectedIncident.longitude),
      title: `${activeSelectedIncident.animalCondition || 'Injured'} ${activeSelectedIncident.animalType || 'Animal'}`,
      address: activeSelectedIncident.locationAddress || activeSelectedIncident.location || 'Incident Area',
    };
  }, [activeSelectedIncident]);

  // Selected Destination Shelter Location for Route Polyline
  const selectedShelterLoc = useMemo(() => {
    if (!activeSelectedIncident?.destinationShelterId) return null;
    const dest = activeSelectedIncident.destinationShelterId;
    if (!dest.latitude || !dest.longitude) return null;
    return {
      latitude: Number(dest.latitude),
      longitude: Number(dest.longitude),
      title: dest.shelterName || 'Destination Shelter',
    };
  }, [activeSelectedIncident]);

  const mapCenter = useMemo(() => {
    if (mapCenterOverride) return mapCenterOverride;
    if (selectedIncidentLoc) {
      return [selectedIncidentLoc.latitude, selectedIncidentLoc.longitude];
    }
    return [squadCoords.latitude, squadCoords.longitude];
  }, [mapCenterOverride, selectedIncidentLoc, squadCoords]);

  const handleTrackIncident = (inc) => {
    const id = inc?.rescueRequestId || inc?._id || inc?.id || inc;
    if (onTrackMission) {
      onTrackMission(id);
    } else {
      setLocalTrackingId(id);
    }
  };

  const handleFocusSquadBase = () => {
    setMapCenterOverride([squadCoords.latitude, squadCoords.longitude]);
  };

  return (
    <div className="space-y-6">
      {/* Page Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Rescue Operations —{' '}
            <span className="text-[#237737]">
              {user?.fullName || teamProfile?.rescueTeamName || user?.rescueTeamName || 'Rescue Squad'}
            </span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {squadCoords.district} · {teamProfile?.vehicleType || 'Ambulance Unit'} ·{' '}
            {isOnline ? 'Online on dispatch standby' : 'Offline'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Online / Offline toggle */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            {isOnline ? 'Online' : 'Offline'}
          </button>

          {/* Emergency Call */}
          <a
            href={squadCoords.phone ? `tel:${squadCoords.phone}` : '#'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#237737] hover:bg-[#1d632e] text-white transition-all cursor-pointer shadow shadow-[#237737]/20"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Emergency Hotline
          </a>
        </div>
      </div>

      {/* ── Emergency Broadcasts Alert Feed ── */}
      {broadcasts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Incoming Emergency Distress Broadcasts ({broadcasts.length})
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              Real-time Geofence
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {broadcasts.map((b) => {
              const reqId = b._id || b.id || b.rescueRequestId;
              const hasAccepted = b.isAssignedToThisTeam || b.candidateStatus === 'Accepted';
              const isPrimary = b.isAssignedToThisTeam;

              return (
                <div
                  key={reqId}
                  className="bg-white border border-amber-200/70 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">
                          {b.animalType === 'Cat' ? '🐱' : b.animalType === 'Bird' ? '🐦' : '🐕'}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900">
                          {b.animalCondition} {b.animalType}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedIncident(b);
                            if (b.latitude && b.longitude) {
                              setMapCenterOverride([Number(b.latitude), Number(b.longitude)]);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          title="View on Map"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#237737]" />
                        </button>
                        <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {b.rescueRequestId || (reqId ? reqId.slice(-6) : '')}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{b.locationAddress || 'Incident Area'}</span>
                      {b.distanceKm !== undefined && (
                        <span className="font-black text-[#237737] shrink-0">
                          • {b.distanceKm} km away
                        </span>
                      )}
                    </p>

                    {b.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded-xl">
                        "{b.description}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleTrackIncident(b)}
                      className="px-2.5 py-1 text-slate-600 hover:text-[#237737] hover:bg-emerald-50 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 border border-slate-200"
                    >
                      <Radio className="w-3 h-3 text-[#237737]" /> Track
                    </button>

                    {hasAccepted ? (
                      <div className="flex items-center justify-between gap-2 ml-auto">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-xl border ${
                            isPrimary
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {isPrimary ? '✓ Primary Assigned' : '✓ Backup Accepted'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenUpdateModal && onOpenUpdateModal(b)}
                            className="px-3 py-1.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenShelterTransfer && onOpenShelterTransfer(b)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                          >
                            Shelter
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          type="button"
                          onClick={() => onDeclineBroadcast && onDeclineBroadcast(reqId)}
                          className="px-3 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => onAcceptBroadcast && onAcceptBroadcast(reqId)}
                          className="px-4 py-1.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accept Rescue
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Stat Cards (Clickable Navigators) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending */}
        <div
          onClick={() => setActiveTab && setActiveTab('Rescue Operations')}
          className="p-5 bg-white border border-slate-100/80 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
          title="Click to view and manage Pending Requests"
        >
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Pending Requests
              </div>
              <div className="text-3xl font-black text-slate-900 mt-0.5">{pendingCount}</div>
              <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 mt-0.5">
                Manage requests <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* En Route */}
        <div
          onClick={() => setActiveTab && setActiveTab('Rescue Operations')}
          className="p-5 bg-white border border-slate-100/80 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
          title="Click to view En Route field dispatches"
        >
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                En Route
              </div>
              <div className="text-3xl font-black text-slate-900 mt-0.5">{enRouteCount}</div>
              <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5 mt-0.5">
                Track dispatches <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Completed Today */}
        <div
          onClick={() => setActiveTab && setActiveTab('Rescue Operations')}
          className="p-5 bg-white border border-slate-100/80 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
          title="Click to view Completed rescues"
        >
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Completed Rescues
              </div>
              <div className="text-3xl font-black text-slate-900 mt-0.5">{completedCount}</div>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
                View history <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Volunteers Metric */}
        <div
          onClick={() => setActiveTab && setActiveTab('Manage Volunteers')}
          className="p-5 bg-white border border-slate-100/80 rounded-2xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
          title="Click to view and manage Volunteer Applications"
        >
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-purple-500/10 text-purple-600 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Volunteer Pool
              </div>
              <div className="text-3xl font-black text-slate-900 mt-0.5">
                {volunteerApplications.length}
              </div>
              <span className="text-[10px] text-purple-600 font-bold flex items-center gap-0.5 mt-0.5">
                Manage volunteers <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Rescue Map + Activity Timeline ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Rescue Map Container */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            {/* Map Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#237737] flex items-center justify-center">
                  <Activity className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Live Rescue Radar & Field Map
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Squad Base • {squadCoords.district} • GPS Active
                  </p>
                </div>
              </div>

              {/* Status pill & Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {isOnline ? 'Standby' : 'Offline'}
                </span>

                <button
                  type="button"
                  onClick={handleFocusSquadBase}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-slate-200 bg-white shadow-2xs cursor-pointer"
                  title="Center map on squad base location"
                >
                  <Crosshair className="w-3.5 h-3.5 text-[#237737]" />
                  Base
                </button>

                {onRefresh && (
                  <button
                    type="button"
                    onClick={onRefresh}
                    disabled={broadcastsLoading}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl text-xs font-bold transition border border-slate-200 bg-white shadow-2xs cursor-pointer"
                    title="Refresh radar coordinates"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${broadcastsLoading ? 'animate-spin text-[#237737]' : ''}`}
                    />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Pills Toolbar */}
            <div className="px-5 py-2.5 border-b border-slate-100 flex items-center justify-between gap-2 overflow-x-auto bg-white text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setMapFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                    mapFilter === 'all'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  All Incidents ({activeIncidents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMapFilter('assigned')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                    mapFilter === 'assigned'
                      ? 'bg-[#237737] text-white border-[#237737]'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Assigned ({assignedIncidentsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setMapFilter('broadcasts')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                    mapFilter === 'broadcasts'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Broadcasts ({broadcastIncidentsCount})
                </button>
              </div>

              {/* Show Shelters Toggle */}
              <button
                type="button"
                onClick={() => setShowShelters(!showShelters)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1 border shrink-0 ${
                  showShelters
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                }`}
                title="Toggle shelter facilities layer on map"
              >
                <span>🏥</span>
                <span>Shelters ({shelters.length})</span>
              </button>
            </div>

            {/* Interactive Real-Time Map */}
            <div className="p-2 sm:p-3 bg-slate-50">
              <InteractiveMap
                center={mapCenter}
                zoom={12}
                markers={mapMarkers}
                assignedTeamLocation={squadCoords}
                incidentLocation={selectedIncidentLoc}
                destinationShelterLocation={selectedShelterLoc}
                showRoutePolyline={Boolean(selectedIncidentLoc)}
                height="380px"
                onSelectMarker={({ type, data }) => {
                  if (type === 'rescue-report' && data?.raw) {
                    setSelectedIncident(data.raw);
                  }
                }}
              />
            </div>
          </div>

          {/* Interactive Selected Incident Drawer or Radar Footer */}
          <div className="p-3.5 border-t border-slate-100 bg-white">
            {activeSelectedIncident ? (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center text-xl shadow-xs shrink-0">
                    {activeSelectedIncident.animalType === 'Cat'
                      ? '🐱'
                      : activeSelectedIncident.animalType === 'Bird'
                      ? '🐦'
                      : '🐕'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                        {activeSelectedIncident.animalCondition} {activeSelectedIncident.animalType}
                      </h4>
                      <span className="font-mono text-[10px] font-bold text-[#237737] bg-emerald-100 px-2 py-0.5 rounded-md">
                        {activeSelectedIncident.rescueRequestId ||
                          activeSelectedIncident.id ||
                          (activeSelectedIncident._id ? activeSelectedIncident._id.slice(-6) : '')}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        {activeSelectedIncident.priority || 'Critical'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {activeSelectedIncident.locationAddress || activeSelectedIncident.location || 'Incident Area'}
                      </span>
                      {activeSelectedIncident.distanceKm !== undefined && (
                        <span className="font-black text-[#237737] shrink-0">
                          • {activeSelectedIncident.distanceKm} km away
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end shrink-0">
                  {/* Track Mission Button */}
                  <button
                    type="button"
                    onClick={() => handleTrackIncident(activeSelectedIncident)}
                    className="px-3 py-1.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Radio className="w-3.5 h-3.5" /> Track Mission
                  </button>

                  {/* If assigned to this team: Update Stage & To Shelter */}
                  {(activeSelectedIncident.isAssignedToThisTeam ||
                    activeSelectedIncident.isAssignedToMe ||
                    activeSelectedIncident.myStatus === 'Assigned') && (
                    <>
                      <button
                        type="button"
                        onClick={() => onOpenUpdateModal && onOpenUpdateModal(activeSelectedIncident)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                      >
                        Update Stage
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onOpenShelterTransfer && onOpenShelterTransfer(activeSelectedIncident)
                        }
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                      >
                        To Shelter
                      </button>
                    </>
                  )}

                  {/* If incoming broadcast: Accept Rescue */}
                  {!activeSelectedIncident.isAssignedToThisTeam &&
                    !activeSelectedIncident.isAssignedToMe &&
                    activeSelectedIncident.myStatus !== 'Assigned' &&
                    activeSelectedIncident.candidateStatus !== 'Accepted' && (
                      <button
                        type="button"
                        onClick={() =>
                          onAcceptBroadcast &&
                          onAcceptBroadcast(
                            activeSelectedIncident._id || activeSelectedIncident.id || activeSelectedIncident.rescueRequestId
                          )
                        }
                        className="px-3 py-1.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                      </button>
                    )}

                  {/* Directions via Google Maps */}
                  {activeSelectedIncident.latitude && activeSelectedIncident.longitude && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${activeSelectedIncident.latitude},${activeSelectedIncident.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition cursor-pointer border border-transparent hover:border-slate-200"
                      title="Open Google Maps Route Navigation"
                    >
                      <Navigation className="w-4 h-4 text-blue-600" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedIncident('none')}
                    className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    <strong>Radar Active:</strong> {activeIncidents.length} active emergency incidents plotted •{' '}
                    {shelters.length} verified shelter facilities
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Click any marker to trace dispatch route & track live mission
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#237737]" /> Activity Timeline
              </h3>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="p-1 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
                  title="Refresh activity logs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}
            </div>
            <div className="p-5 space-y-4 max-h-[380px] overflow-y-auto">
              {activityTimeline.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0 mt-0.5`} />
                    {i < activityTimeline.length - 1 && <div className="w-px h-5 bg-slate-100" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold">{item.time}</p>
                    <p
                      className={`text-xs mt-0.5 leading-relaxed ${
                        item.highlight ? 'text-blue-600 font-semibold' : 'text-slate-700 font-medium'
                      }`}
                    >
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}

              {activityTimeline.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                  Standing by. No dispatch actions logged yet today.
                </div>
              )}
            </div>
          </div>

          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40">
            <button
              onClick={() => setActiveTab && setActiveTab('Rescue Operations')}
              className="w-full text-center text-xs font-bold text-[#237737] hover:underline cursor-pointer flex items-center justify-center gap-1"
            >
              View Full Rescue Operations Log <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Two-Column Operational Previews ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Assigned Rescue Requests Preview */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#237737]" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Assigned Emergency Dispatches
                </h3>
              </div>
              <button
                onClick={() => setActiveTab && setActiveTab('Rescue Operations')}
                className="text-xs font-bold text-[#237737] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({filtered.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {filtered.slice(0, 4).map((req) => (
                <div
                  key={req.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 transition cursor-pointer"
                  onClick={() => {
                    setSelectedIncident(req);
                    if (req.latitude && req.longitude) {
                      setMapCenterOverride([Number(req.latitude), Number(req.longitude)]);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-base">{req.animalIcon || '🐾'}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {req.animal || 'Animal Distress'}
                        </h4>
                        <span className="text-[10px] font-mono text-[#237737] font-bold">
                          {req.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{req.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrackIncident(req);
                      }}
                      className="px-2.5 py-1 text-slate-600 hover:text-[#237737] hover:bg-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 border border-slate-200 cursor-pointer"
                    >
                      <Radio className="w-3 h-3 text-[#237737]" /> Track
                    </button>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${req.statusColor}`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                  No active rescue dispatches at this moment.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveTab && setActiveTab('Rescue Operations')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Manage Rescue Operations Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#237737]" />
            </button>
          </div>
        </div>

        {/* Right Column: Volunteer Applications Preview */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-purple-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Volunteer Applications
                </h3>
              </div>
              <button
                onClick={() => setActiveTab && setActiveTab('Manage Volunteers')}
                className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Manage ({volunteerApplications.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {volunteerApplications.slice(0, 4).map((app) => {
                const currentStatus = app.applicationStatus || app.status || 'Pending';
                const statusBadge =
                  currentStatus === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : currentStatus === 'Volunteer Visit'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : currentStatus === 'Rejected'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <div
                    key={app._id || app.volunteerApplicationId}
                    onClick={() => setActiveTab && setActiveTab('Manage Volunteers')}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 text-xs cursor-pointer transition"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900">{app.fullName}</span>
                        {app.hasVehicle && <Car className="w-3 h-3 text-amber-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {app.district} • {app.volunteerApplicationId}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}
                    >
                      {currentStatus === 'Volunteer Visit' ? 'Orientation' : currentStatus}
                    </span>
                  </div>
                );
              })}

              {volunteerApplications.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                  No volunteer applications submitted yet.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveTab && setActiveTab('Manage Volunteers')}
              className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Go to Manage Volunteers Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Team Members ── */}
      <div className="bg-white border border-slate-100/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#237737]" /> Team Responders & Field Squad
          </h3>
          <span className="text-xs text-slate-400 font-semibold">
            {1 + volunteerApplications.filter((v) => (v.applicationStatus || v.status) === 'Approved').length} Registered
          </span>
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              name: user?.fullName || 'Rescue Lead',
              role: 'Squad Lead / Driver',
              status: isOnline ? 'On Standby' : 'Offline',
              color: 'bg-teal-600',
            },
            ...volunteerApplications
              .filter((v) => (v.applicationStatus || v.status) === 'Approved')
              .slice(0, 3)
              .map((v, idx) => ({
                name: v.fullName,
                role: v.hasVehicle ? 'Emergency Transport' : 'Field Volunteer',
                status: 'Available',
                color: idx % 2 === 0 ? 'bg-purple-600' : 'bg-blue-600',
              })),
          ].map((m) => (
            <div
              key={m.name}
              className="flex flex-col items-center text-center p-4 rounded-2xl border border-slate-100 hover:border-[#237737]/20 hover:bg-emerald-50/30 transition-all"
            >
              <div
                className={`w-11 h-11 rounded-full ${m.color} text-white font-extrabold text-base flex items-center justify-center shadow-sm mb-2`}
              >
                {m.name[0]}
              </div>
              <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{m.name}</p>
              <p className="text-[10px] text-slate-400 font-medium">{m.role}</p>
              <span
                className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  m.status === 'On Standby' || m.status === 'Available'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {m.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Fallback Local Tracking Modal */}
      {localTrackingId && (
        <LiveRescueTrackingModal
          isOpen={Boolean(localTrackingId)}
          onClose={() => setLocalTrackingId(null)}
          rescueRequestId={localTrackingId}
          showTeamResponses={true}
        />
      )}
    </div>
  );
};

export default Dashboard;
