import { useMemo, useState } from 'react';
import {
  MapPin,
  Search,
  Radio,
  CheckCircle2,
  Truck,
  RefreshCw,
  Phone,
  Building2,
  Clock,
  UserCheck,
  XCircle,
  SlidersHorizontal,
} from 'lucide-react';
import LiveRescueTrackingModal from '../user-dashboard/LiveRescueTrackingModal';

const stageBadgeStyles = {
  Broadcasted: 'bg-amber-50 text-amber-800 border-amber-200',
  Accepted: 'bg-blue-50 text-blue-800 border-blue-200',
  'En Route': 'bg-sky-50 text-sky-800 border-sky-200',
  'Arrived on Scene': 'bg-indigo-50 text-indigo-800 border-indigo-200',
  'Animal Rescued': 'bg-purple-50 text-purple-800 border-purple-200',
  'Transporting to Shelter': 'bg-amber-50 text-amber-800 border-amber-200',
  'Delivered to Shelter': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
};

const getAnimalIcon = (type) => {
  if (type === 'Cat') return '🐱';
  if (type === 'Bird') return '🐦';
  if (type === 'Cow' || type === 'Cattle') return '🐄';
  return '🐕';
};

const RescueOperations = ({
  requests = [],
  filtered: legacyFiltered = [],
  broadcasts = [],
  broadcastsLoading = false,
  loading = false,
  priorityFilter: controlledPriority,
  setPriorityFilter: setControlledPriority,
  onAcceptBroadcast,
  onDeclineBroadcast,
  setShowUpdateModal,
  onOpenShelterTransfer,
  onRefresh,
}) => {
  const [activeCategory, setActiveCategory] = useState('All'); // 'All' | 'Broadcasted' | 'Accepted' | 'Assigned' | 'Completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [internalPriority, setInternalPriority] = useState('All');
  const [trackingRequestId, setTrackingRequestId] = useState(null);

  const priorityFilter = controlledPriority ?? internalPriority;
  const setPriorityFilter = setControlledPriority ?? setInternalPriority;

  // Combine requests and broadcasts safely
  const allRequests = useMemo(() => {
    const list = requests.length > 0 ? requests : legacyFiltered.length > 0 ? legacyFiltered : broadcasts;
    // Map list to standard shape
    const map = new Map();
    list.forEach((item) => {
      const id = item.rescueRequestId || item._id || item.id;
      if (!id) return;
      if (!map.has(id)) {
        map.set(id, item);
      }
    });
    // Also include any broadcast that might not have been in requests
    broadcasts.forEach((b) => {
      const id = b.rescueRequestId || b._id || b.id;
      if (id && !map.has(id)) {
        map.set(id, b);
      }
    });
    return Array.from(map.values());
  }, [requests, legacyFiltered, broadcasts]);

  // Derived categories
  const broadcastedList = useMemo(() => {
    return allRequests.filter((r) => {
      const myStatus = r.myStatus || r.candidateStatus || 'Notified';
      const isAssigned = r.isAssignedToMe || r.isAssignedToThisTeam || myStatus === 'Assigned';
      return !isAssigned && myStatus === 'Notified' && r.status !== 'Completed' && r.status !== 'Cancelled';
    });
  }, [allRequests]);

  const acceptedList = useMemo(() => {
    return allRequests.filter((r) => {
      const myStatus = r.myStatus || r.candidateStatus;
      const isAssigned = r.isAssignedToMe || r.isAssignedToThisTeam || myStatus === 'Assigned';
      return (myStatus === 'Accepted' || myStatus === 'Backup') && !isAssigned;
    });
  }, [allRequests]);

  const assignedList = useMemo(() => {
    return allRequests.filter((r) => {
      const myStatus = r.myStatus || r.candidateStatus;
      const isAssigned = r.isAssignedToMe || r.isAssignedToThisTeam || myStatus === 'Assigned';
      return isAssigned && r.status !== 'Completed' && r.rescueStage !== 'Delivered to Shelter';
    });
  }, [allRequests]);

  const completedList = useMemo(() => {
    return allRequests.filter(
      (r) => r.status === 'Completed' || r.rescueStage === 'Delivered to Shelter'
    );
  }, [allRequests]);

  // Filtered by Category + Priority + Search Query
  const displayedRequests = useMemo(() => {
    let base = allRequests;
    if (activeCategory === 'Broadcasted') base = broadcastedList;
    else if (activeCategory === 'Accepted') base = acceptedList;
    else if (activeCategory === 'Assigned') base = assignedList;
    else if (activeCategory === 'Completed') base = completedList;

    const q = searchQuery.trim().toLowerCase();

    return base.filter((r) => {
      const reqId = (r.rescueRequestId || r._id || r.id || '').toLowerCase();
      const animal = `${r.animalCondition || ''} ${r.animalType || ''}`.toLowerCase();
      const location = (r.locationAddress || r.location || '').toLowerCase();
      const reporter = (r.reporter || r.reportedByName || r.userId?.fullName || '').toLowerCase();

      const matchesQuery =
        !q ||
        reqId.includes(q) ||
        animal.includes(q) ||
        location.includes(q) ||
        reporter.includes(q);

      const matchesPriority =
        priorityFilter === 'All' ||
        (r.priority || '').toLowerCase() === priorityFilter.toLowerCase();

      return matchesQuery && matchesPriority;
    });
  }, [allRequests, activeCategory, broadcastedList, acceptedList, assignedList, completedList, searchQuery, priorityFilter]);

  const isLoading = loading || broadcastsLoading;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#237737]" />
            Rescue Operations & Incident Dispatch
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
            Real-time feed of broadcasted emergency alerts, squad acceptances, and assigned field missions.
          </p>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#237737]' : ''}`} />
            Refresh Operations
          </button>
        )}
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          {
            label: 'Broadcasted (Pending)',
            count: broadcastedList.length,
            icon: Radio,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-200/80',
            category: 'Broadcasted',
            badge: broadcastedList.length > 0 ? 'Needs Response' : 'Clear',
          },
          {
            label: 'Accepted (Backup Squad)',
            count: acceptedList.length,
            icon: UserCheck,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-200/80',
            category: 'Accepted',
            badge: 'Standby',
          },
          {
            label: 'Assigned (Active Missions)',
            count: assignedList.length,
            icon: Truck,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200/80',
            category: 'Assigned',
            badge: 'In Progress',
          },
          {
            label: 'Completed / Safe',
            count: completedList.length,
            icon: CheckCircle2,
            color: 'text-slate-600',
            bg: 'bg-slate-100',
            border: 'border-slate-200',
            category: 'Completed',
            badge: 'Delivered',
          },
        ].map(({ label, count, icon: Icon, color, bg, border, category, badge }) => (
          <div
            key={label}
            onClick={() => setActiveCategory(category)}
            className={`p-4 rounded-2xl bg-white border ${border} shadow-2xs cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] ${
              activeCategory === category ? 'ring-2 ring-[#237737]' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl ${bg} ${color} flex items-center justify-center`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {badge}
              </span>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-3">{label}</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{count}</p>
          </div>
        ))}
      </div>

      {/* Category Pills & Search Controls Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-2xs space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'All', label: 'All Requests', count: allRequests.length },
            { id: 'Broadcasted', label: 'Broadcasted', count: broadcastedList.length, dot: broadcastedList.length > 0 },
            { id: 'Accepted', label: 'Accepted (Backup)', count: acceptedList.length },
            { id: 'Assigned', label: 'Assigned to Us', count: assignedList.length },
            { id: 'Completed', label: 'Completed', count: completedList.length },
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#237737] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {cat.dot && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Inputs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search request ID, animal, incident location, or reporter..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#237737] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737]"
            >
              <option value="All">All Priorities</option>
              {['Emergency', 'Critical', 'High', 'Medium', 'Low'].map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Highlight Banner for Incoming Broadcasts (when in All or Broadcasted view) ── */}
      {(activeCategory === 'All' || activeCategory === 'Broadcasted') && broadcastedList.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-amber-600" />
                Action Required: Incoming Emergency Broadcasts ({broadcastedList.length})
              </h3>
            </div>
            <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100/90 border border-amber-300/60 px-2.5 py-0.5 rounded-full">
              Nearest team auto-assigned upon acceptance
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {broadcastedList.map((req) => {
              const reqId = req.rescueRequestId || req._id || req.id;
              const animalName = `${req.animalCondition || 'Injured'} ${req.animalType || 'Animal'}`;
              const dist = req.distanceKm ?? req.myDistanceKm;

              return (
                <div
                  key={reqId}
                  className="bg-white border border-amber-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between space-y-3 hover:shadow-sm transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getAnimalIcon(req.animalType)}</span>
                        <span className="font-black text-sm text-slate-900">{animalName}</span>
                      </div>
                      <span className="font-mono text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {req.rescueRequestId || (reqId ? reqId.slice(-6) : '')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{req.locationAddress || req.location || 'Incident Area'}</span>
                      {dist !== undefined && dist !== null && (
                        <span className="text-[#237737] font-black shrink-0">• {dist} km away</span>
                      )}
                    </p>

                    {req.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded-lg italic">
                        "{req.description}"
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1">
                      <span>Reporter: {req.reporter || req.reportedByName || req.userId?.fullName || 'Citizen'}</span>
                      {req.reportedByPhone || req.userId?.phoneNumber ? (
                        <a
                          href={`tel:${req.reportedByPhone || req.userId?.phoneNumber}`}
                          className="inline-flex items-center gap-1 text-[#237737] font-bold hover:underline"
                        >
                          <Phone className="w-3 h-3" /> {req.reportedByPhone || req.userId?.phoneNumber}
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setTrackingRequestId(reqId)}
                      className="px-2.5 py-1 text-slate-500 hover:text-slate-800 text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#237737]" /> Track Mission
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onDeclineBroadcast && onDeclineBroadcast(reqId)}
                        className="px-3 py-1 text-slate-500 hover:text-rose-600 text-xs font-bold rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => onAcceptBroadcast && onAcceptBroadcast(reqId)}
                        className="px-3.5 py-1.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accept Rescue
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Operations List Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              {activeCategory === 'All' ? 'All Rescue Requests' : `${activeCategory} Requests`} ({displayedRequests.length})
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Live updates trace team acceptances, vehicle dispatches, and shelter intakes
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-400 inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Auto-sync enabled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                {[
                  'Request ID',
                  'Animal',
                  'Location & Distance',
                  'Reporter',
                  'Priority',
                  'Team Status',
                  'Mission Stage',
                  'Actions',
                ].map((header) => (
                  <th
                    key={header}
                    className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedRequests.map((req) => {
                const reqId = req.rescueRequestId || req._id || req.id;
                const myStatus = req.myStatus || req.candidateStatus || 'Notified';
                const isAssigned = req.isAssignedToMe || req.isAssignedToThisTeam || myStatus === 'Assigned';
                const dist = req.distanceKm ?? req.myDistanceKm;
                const animalName = `${req.animalCondition || 'Injured'} ${req.animalType || 'Animal'}`;
                const reporterName = req.reporter || req.reportedByName || req.userId?.fullName || 'Citizen';
                const reporterPhone = req.reporterPhone || req.reportedByPhone || req.userId?.phoneNumber;
                const stage = req.rescueStage || req.status || 'Broadcasted';

                return (
                  <tr key={reqId} className="hover:bg-slate-50/70 transition-colors">
                    {/* ID */}
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-black text-[#237737] bg-emerald-50/60 px-2 py-0.5 rounded-md border border-emerald-100">
                        {req.rescueRequestId || reqId}
                      </span>
                    </td>

                    {/* Animal */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{getAnimalIcon(req.animalType)}</span>
                        <div>
                          <p className="text-xs font-extrabold text-slate-900 leading-tight">{animalName}</p>
                          <span className="text-[10px] text-slate-400 font-semibold">{req.animalCondition}</span>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-xs text-slate-700 font-medium flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{req.locationAddress || req.location || 'Incident Area'}</span>
                      </p>
                      {dist !== undefined && dist !== null && (
                        <p className="text-[10px] text-[#237737] font-black mt-0.5 ml-4.5">
                          {dist} km from current post
                        </p>
                      )}
                    </td>

                    {/* Reporter */}
                    <td className="px-5 py-3.5">
                      <p className="text-xs text-slate-800 font-semibold">{reporterName}</p>
                      {reporterPhone && (
                        <a
                          href={`tel:${reporterPhone}`}
                          className="text-[10px] text-[#237737] font-bold hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-2.5 h-2.5" /> {reporterPhone}
                        </a>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black border ${
                          req.priority === 'Emergency' || req.priority === 'Critical'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : req.priority === 'High'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {req.priority || 'Medium'}
                      </span>
                    </td>

                    {/* Team Status (Broadcasted / Accepted / Assigned) */}
                    <td className="px-5 py-3.5">
                      {isAssigned ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Assigned (Primary)
                        </span>
                      ) : myStatus === 'Accepted' || myStatus === 'Backup' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200">
                          <UserCheck className="w-3 h-3 text-blue-600" /> Accepted (Backup)
                        </span>
                      ) : myStatus === 'Declined' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-500 border border-slate-200">
                          <XCircle className="w-3 h-3 text-slate-400" /> Declined
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                          <Radio className="w-3 h-3 text-amber-600 animate-pulse" /> Broadcasted (Pending)
                        </span>
                      )}
                    </td>

                    {/* Mission Stage */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          stageBadgeStyles[stage] || 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {stage}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Track Mission Button for ALL requests */}
                        <button
                          type="button"
                          onClick={() => setTrackingRequestId(reqId)}
                          className="px-2.5 py-1 bg-[#237737] hover:bg-[#1d632e] text-white rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                          title="Open live mission tracking and view all team responses"
                        >
                          <MapPin className="w-3 h-3" /> Track mission
                        </button>

                        {/* If not assigned and not accepted yet, show Accept / Decline */}
                        {!isAssigned && myStatus === 'Notified' && (
                          <>
                            <button
                              type="button"
                              onClick={() => onAcceptBroadcast && onAcceptBroadcast(reqId)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
                              title="Accept this rescue broadcast"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeclineBroadcast && onDeclineBroadcast(reqId)}
                              className="px-2 py-1 text-slate-400 hover:text-rose-600 rounded-lg text-xs font-bold transition cursor-pointer"
                              title="Decline this rescue broadcast"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {/* If assigned primary, show Update Stage & To Shelter */}
                        {isAssigned && (
                          <>
                            <button
                              type="button"
                              onClick={() => setShowUpdateModal && setShowUpdateModal(req.raw || req)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
                              title="Update operation stage (En Route, Animal Rescued, etc.)"
                            >
                              <Truck className="w-3 h-3 text-slate-500" /> Stage
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onOpenShelterTransfer && onOpenShelterTransfer(req.raw || req)
                              }
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
                              title="Route animal to nearby shelter"
                            >
                              <Building2 className="w-3 h-3 text-indigo-600" /> Shelter
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {displayedRequests.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-xs font-semibold">
                    No rescue requests found matching the current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Mission Tracking Modal (Shows map + all notified teams + responses) */}
      <LiveRescueTrackingModal
        isOpen={Boolean(trackingRequestId)}
        rescueRequestId={trackingRequestId}
        showTeamResponses={true}
        onClose={() => setTrackingRequestId(null)}
      />
    </div>
  );
};

export default RescueOperations;
