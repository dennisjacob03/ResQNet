import React from 'react';
import {
  MapPin,
  SlidersHorizontal,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Truck,
} from 'lucide-react';

const AssignedRequests = ({
  filtered = [],
  broadcasts = [],
  broadcastsLoading = false,
  priorityFilter,
  setPriorityFilter,
  statusFilter,
  setStatusFilter,
  onAcceptBroadcast,
  onDeclineBroadcast,
  setShowUpdateModal,
  onOpenShelterTransfer,
}) => {
  return (
    <div className="space-y-6">
      {/* Incoming Broadcasts Quick Panel if any */}
      {broadcasts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Incoming Incident Broadcasts ({broadcasts.length})
            </h3>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              Nearest squad auto-selected on acceptance
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {broadcasts.map((b) => {
              const reqId = b._id || b.id || b.rescueRequestId;
              const hasAccepted = b.isAssignedToThisTeam || b.candidateStatus === 'Accepted';
              const isPrimary = b.isAssignedToThisTeam;

              return (
                <div
                  key={reqId}
                  className="bg-white border border-amber-200/60 rounded-xl p-3.5 shadow-xs flex flex-col justify-between space-y-2.5"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900">
                        {b.animalCondition} {b.animalType}
                      </span>
                      <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {b.rescueRequestId || (reqId ? reqId.slice(-6) : '')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{b.locationAddress || 'Incident Site'}</span>
                      {b.distanceKm !== undefined && (
                        <strong className="text-[#237737] shrink-0">• {b.distanceKm} km</strong>
                      )}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    {hasAccepted ? (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                          isPrimary
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {isPrimary ? 'Assigned (Nearest)' : 'Backup Unit'}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          type="button"
                          onClick={() => onDeclineBroadcast && onDeclineBroadcast(reqId)}
                          className="px-2.5 py-1 text-slate-400 hover:text-slate-700 text-xs font-bold transition"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => onAcceptBroadcast && onAcceptBroadcast(reqId)}
                          className="px-3 py-1 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-lg transition flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Accept
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

      {/* Main Assigned Requests Table */}
      <div className="bg-white border border-slate-100/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900">Active Field Operations</h3>
          <div className="flex items-center gap-2.5">
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#237737]/20 cursor-pointer"
            >
              {['All', 'Critical', 'High', 'Medium', 'Low'].map((p) => (
                <option key={p} value={p}>
                  {p === 'All' ? 'All Priorities' : p}
                </option>
              ))}
            </select>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#237737]/20 cursor-pointer"
            >
              {['All', 'Pending', 'Assigned', 'En Route', 'Completed'].map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Statuses' : s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {[
                  'Request ID',
                  'Animal',
                  'Location',
                  'Reporter',
                  'Priority',
                  'Status',
                  'Time',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-bold text-[#237737]">{req.id}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <span>{req.animalIcon}</span> {req.animal}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-slate-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      {req.location}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-slate-700 font-medium">{req.reporter}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${req.priorityColor}`}
                    >
                      {req.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${req.statusColor}`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                      {req.time}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowUpdateModal(req.raw || req)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-[#237737] hover:text-white text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <Truck className="w-3 h-3" />
                        Stage
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenShelterTransfer && onOpenShelterTransfer(req.raw || req)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <Building2 className="w-3 h-3" />
                        To Shelter
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-400 text-sm font-medium">
                    No active operations match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssignedRequests;
