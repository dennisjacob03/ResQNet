import React from 'react';
import {
  Building2,
  Search,
  Clock,
  Mail,
  Phone,
  MapPin,
  Eye,
  RefreshCw,
  CheckCircle2,
  Wrench,
} from 'lucide-react';

const ManageShelters = ({
  sheltersList = [],
  sheltersLoading = false,
  shelterSearchQuery = '',
  setShelterSearchQuery,
  shelterFilterStatus = 'All',
  setShelterFilterStatus,
  shelterActionLoading = {},
  handleUpdateShelterCurrentStatus,
  handleToggleShelterStatus,
  setSelectedShelterForModal,
  setShowShelterDetailsModal,
  onOpenMap,
}) => {
  const filteredShelters = sheltersList.filter((s) => {
    const q = shelterSearchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      s.shelterName?.toLowerCase().includes(q) ||
      s.shelterNumber?.toLowerCase().includes(q) ||
      s.shelterEmail?.toLowerCase().includes(q) ||
      s.userId?.fullName?.toLowerCase().includes(q);
    const op = s.shelterStatus || s.currentStatus || 'UNDER_MAINTENANCE';
    const matchStatus =
      shelterFilterStatus === 'All' ||
      shelterFilterStatus === 'Approved' ||
      s.status === shelterFilterStatus ||
      op === shelterFilterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Approved
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{sheltersList.length}</div>
          <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
            Registered facilities
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Under Maintenance
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {
              sheltersList.filter(
                (s) =>
                  (s.shelterStatus || s.currentStatus || 'UNDER_MAINTENANCE') ===
                  'UNDER_MAINTENANCE'
              ).length
            }
          </div>
          <div className="text-[10px] font-bold text-amber-600 mt-0.5">
            Approved / Setup mode
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Open for Intake
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {
              sheltersList.filter(
                (s) => (s.shelterStatus || s.currentStatus) === 'OPEN'
              ).length
            }
          </div>
          <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
            Available for rescue
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Full / Closed
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {
              sheltersList.filter((s) =>
                ['FULL', 'CLOSED'].includes(s.shelterStatus || s.currentStatus)
              ).length
            }
          </div>
          <div className="text-[10px] font-bold text-slate-400 mt-0.5">Capacity limited</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={shelterSearchQuery}
              onChange={(e) => setShelterSearchQuery(e.target.value)}
              placeholder="Search shelter by name, SH-0001, or email…"
              className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#237737] transition"
            />
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1">
            {['All', 'UNDER_MAINTENANCE', 'OPEN', 'FULL', 'CLOSED', 'Active', 'Inactive'].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setShelterFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    shelterFilterStatus === st
                      ? 'bg-[#237737] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {st === 'All'
                    ? 'All Shelters'
                    : st === 'UNDER_MAINTENANCE'
                    ? 'Under Maintenance'
                    : st.replace(/_/g, ' ')}
                </button>
              )
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {onOpenMap && (
            <button
              type="button"
              onClick={onOpenMap}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#237737] border border-emerald-200/80 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="View all shelters on interactive map"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Locate on Map</span>
            </button>
          )}
          <div className="text-xs font-extrabold text-slate-400">
            {filteredShelters.length} of {sheltersList.length} shelters
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {sheltersLoading && (
        <div className="p-8 bg-white border border-slate-100 rounded-3xl text-center text-slate-400 text-sm font-semibold animate-pulse flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 animate-spin" /> Loading registered shelters from database…
        </div>
      )}

      {/* Empty State */}
      {!sheltersLoading && sheltersList.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-3">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800">No Shelters Registered Yet</h3>
          <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
            Approve user shelter registration applications to add shelters to the directory.
          </p>
        </div>
      )}

      {/* Shelters Table */}
      {!sheltersLoading && sheltersList.length > 0 && (
        <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="pb-3.5 pl-4">Shelter Details</th>
                  <th className="pb-3.5">Contact</th>
                  <th className="pb-3.5">Location</th>
                  <th className="pb-3.5">Operational Status</th>
                  <th className="pb-3.5">Status</th>
                  <th className="pb-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredShelters.map((shelter) => {
                  const operationalStatus =
                    shelter.shelterStatus || shelter.currentStatus || 'UNDER_MAINTENANCE';
                  const operationalClass =
                    operationalStatus === 'OPEN'
                      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/60'
                      : operationalStatus === 'FULL'
                      ? 'bg-rose-500/10 text-rose-700 border-rose-200/60'
                      : operationalStatus === 'UNDER_MAINTENANCE'
                      ? 'bg-amber-500/10 text-amber-700 border-amber-200/60'
                      : 'bg-slate-100 text-slate-600 border-slate-200/60';

                  const isAccountActive = shelter.status !== 'Inactive';

                  return (
                    <tr key={shelter._id} className="hover:bg-slate-50/70 transition">
                      {/* Shelter Details Column */}
                      <td className="py-4 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#237737]/10 text-[#237737] font-black text-sm flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-extrabold text-slate-900 text-sm">
                                {shelter.shelterName}
                              </h4>
                              <span className="px-2 py-0.5 bg-[#237737]/10 border border-[#237737]/30 text-[#237737] text-[10px] font-black rounded-lg">
                                {shelter.shelterNumber || 'SH-0001'}
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-black rounded-lg inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-semibold">
                              {shelter.userId?.fullName
                                ? `Manager: ${shelter.userId.fullName}`
                                : 'System Admin'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Column */}
                      <td className="py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[160px]">
                              {shelter.shelterEmail}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Phone className="w-3 h-3" />
                            <span>+91 {shelter.shelterPhoneNumber}</span>
                          </div>
                        </div>
                      </td>

                      {/* Location Column */}
                      <td className="py-4">
                        <div className="flex items-center gap-1.5 text-slate-700 max-w-[130px]">
                          <MapPin className="w-3.5 h-3.5 text-[#237737] shrink-0" />
                          <span className="truncate">
                            {shelter.latitude?.toFixed(4)}, {shelter.longitude?.toFixed(4)}
                          </span>
                        </div>
                      </td>

                      {/* Operational Status Column */}
                      <td className="py-4">
                        <select
                          value={operationalStatus}
                          onChange={(e) =>
                            handleUpdateShelterCurrentStatus(shelter._id, e.target.value)
                          }
                          className={`px-2.5 py-1 text-[10px] font-extrabold rounded-xl border transition cursor-pointer ${operationalClass}`}
                        >
                          <option value="UNDER_MAINTENANCE">● UNDER MAINTENANCE</option>
                          <option value="OPEN">● OPEN</option>
                          <option value="FULL">● FULL</option>
                          <option value="CLOSED">● CLOSED</option>
                        </select>
                        {operationalStatus === 'UNDER_MAINTENANCE' && (
                          <div className="text-[10px] text-amber-600 font-bold mt-1 flex items-center gap-1">
                            <Wrench className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>Setup mode</span>
                          </div>
                        )}
                      </td>

                      {/* Account Status Column */}
                      <td className="py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                            isAccountActive
                              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                              : 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                          }`}
                        >
                          {isAccountActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview Modal Button */}
                          <button
                            onClick={() => {
                              setSelectedShelterForModal(shelter);
                              setShowShelterDetailsModal(true);
                            }}
                            title="View Shelter Details"
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Deactivate / Activate Button */}
                          <button
                            onClick={() => handleToggleShelterStatus(shelter)}
                            disabled={shelterActionLoading[shelter._id]}
                            title={isAccountActive ? 'Deactivate Shelter' : 'Activate Shelter'}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer disabled:opacity-50 ${
                              isAccountActive
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200/50'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200/50'
                            }`}
                          >
                            {shelterActionLoading[shelter._id] ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : isAccountActive ? (
                              'Deactivate'
                            ) : (
                              'Activate'
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageShelters;
