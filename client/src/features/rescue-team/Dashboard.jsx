import React from 'react';
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
} from 'lucide-react';

const MAP_PINS = [];

const Dashboard = ({
  user,
  isOnline,
  setIsOnline,
  pendingCount = 0,
  enRouteCount = 0,
  completedCount = 0,
  activityTimeline = [],
  filtered = [],
  broadcasts = [],
  onAcceptBroadcast,
  onDeclineBroadcast,
  onOpenUpdateModal,
  onOpenShelterTransfer,
  volunteerApplications = [],
  setActiveTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Page Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Rescue Operations —{' '}
            <span className="text-[#237737]">
              {user?.fullName || user?.teamName || 'Rescue Squad'}
            </span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {user?.district || user?.city || user?.address || 'Active Operations Zone'} ·{' '}
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
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#237737] hover:bg-[#1d632e] text-white transition-all cursor-pointer shadow shadow-[#237737]/20">
            <PhoneCall className="w-3.5 h-3.5" />
            Emergency Call
          </button>
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
                      <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {b.rescueRequestId || (reqId ? reqId.slice(-6) : '')}
                      </span>
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

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {hasAccepted ? (
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
                          isPrimary
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                          {isPrimary ? '✓ Primary Assigned (Nearest)' : '✓ Accepted (Backup)'}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenUpdateModal && onOpenUpdateModal(b)}
                            className="px-3 py-1.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                          >
                            Update Stage
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenShelterTransfer && onOpenShelterTransfer(b)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                          >
                            To Shelter
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
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
                      </>
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
          onClick={() => setActiveTab && setActiveTab('Assigned Requests')}
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
          onClick={() => setActiveTab && setActiveTab('Assigned Requests')}
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
          onClick={() => setActiveTab && setActiveTab('Assigned Requests')}
          className="p-5 bg-white border border-slate-100/80 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
          title="Click to view Completed rescues"
        >
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                Completed Today
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

      {/* ── Live Map + Activity Timeline ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Rescue Map */}
        <div className="lg:col-span-2 bg-white border border-slate-100/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Live Rescue Map</h3>
            <div className="flex items-center gap-4 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5 text-rose-600">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Critical
              </span>
              <span className="flex items-center gap-1.5 text-orange-600">
                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> High
              </span>
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Active
              </span>
            </div>
          </div>

          {/* Map Area */}
          <div className="relative h-[300px] bg-slate-100 overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1280px-World_map_-_low_resolution.svg.png")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.3,
                filter: 'sepia(0.3)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/20 to-slate-100/10" />

            {/* Pulsing rescue zone overlay */}
            <div
              className="absolute rounded-full border-2 border-teal-400/30 bg-teal-400/5 animate-ping"
              style={{ width: 120, height: 120, left: '34%', top: '26%', animationDuration: '3s' }}
            />

            {/* Map Pins */}
            {MAP_PINS.map((pin) => (
              <div
                key={pin.id}
                className="absolute flex flex-col items-center gap-1"
                style={{ left: pin.left, top: pin.top, transform: 'translate(-50%, -50%)' }}
              >
                <div
                  className={`w-8 h-8 rounded-full ${pin.color} ring-4 ${pin.ring} text-white flex items-center justify-center shadow-lg z-10 cursor-pointer hover:scale-110 transition-transform`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${pin.color} text-white shadow whitespace-nowrap`}
                >
                  {pin.id}
                </span>
              </div>
            ))}

            {/* Map Footer */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm px-4 py-2.5 border-t border-slate-100">
              <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                Live tracking active · Last updated just now
              </p>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white border border-slate-100/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Activity Timeline</h3>
            <button className="p-1 hover:bg-slate-100 rounded-lg transition cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
          <div className="p-5 space-y-4">
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
              <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                Standing by. No dispatch actions logged yet.
              </div>
            )}
          </div>
          <div className="px-5 pb-4">
            <button
              onClick={() => setActiveTab && setActiveTab('Assigned Requests')}
              className="w-full text-center text-xs font-semibold text-[#237737] hover:underline cursor-pointer flex items-center justify-center gap-1"
            >
              View Full Activity Log <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Two-Column Operational Previews (Purely Navigational) ── */}
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
                onClick={() => setActiveTab && setActiveTab('Assigned Requests')}
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
                  onClick={() => setActiveTab && setActiveTab('Assigned Requests')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 transition cursor-pointer"
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
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{req.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
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
              onClick={() => setActiveTab && setActiveTab('Assigned Requests')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Manage Assigned Requests Workspace</span>
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
    </div>
  );
};

export default Dashboard;
