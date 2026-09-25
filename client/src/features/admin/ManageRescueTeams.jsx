import React from 'react';
import {
  Truck,
  Search,
  Mail,
  Phone,
  Navigation,
  Eye,
} from 'lucide-react';

const ManageRescueTeams = ({
  usersList = [],
  rescueSearchQuery = '',
  setRescueSearchQuery,
  rescueStatusFilter = 'All',
  setRescueStatusFilter,
  handleToggleStatus,
  setSelectedUserForModal,
  setShowUserDetailsModal,
  onOpenMap,
}) => {
  const teams = usersList
    .filter((u) => u.role === 'Rescue Team')
    .filter((u) => {
      const q = rescueSearchQuery.toLowerCase();
      const matchQ =
        !q ||
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.city?.toLowerCase().includes(q);
      const matchSt =
        rescueStatusFilter === 'All' || (u.status || 'Active') === rescueStatusFilter;
      return matchQ && matchSt;
    });

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Rescue Teams
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {usersList.filter((u) => u.role === 'Rescue Team').length}
          </div>
          <div className="text-[10px] font-bold text-blue-600 mt-0.5">Certified Taskforces</div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Responders
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {
              usersList.filter(
                (u) => u.role === 'Rescue Team' && u.status === 'Active'
              ).length
            }
          </div>
          <div className="text-[10px] font-bold text-emerald-600 mt-0.5">Ready for Dispatch</div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Registered Units
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {usersList.filter((u) => u.role === 'Rescue Team').length}
          </div>
          <div className="text-[10px] font-bold text-amber-600 mt-0.5">Specialized Teams</div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Coverage Status
          </div>
          <div className="text-2xl font-black text-purple-600 mt-1">
            {usersList.some((u) => u.role === 'Rescue Team' && u.status === 'Active')
              ? 'Active'
              : 'Standby'}
          </div>
          <div className="text-[10px] font-bold text-purple-600 mt-0.5">24x7 Emergency Grid</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={rescueSearchQuery}
              onChange={(e) => setRescueSearchQuery(e.target.value)}
              placeholder="Search rescue teams by name, zone, phone…"
              className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#237737] transition"
            />
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-center gap-1.5">
            {['All', 'Active', 'Suspended'].map((st) => (
              <button
                key={st}
                onClick={() => setRescueStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  rescueStatusFilter === st
                    ? 'bg-[#237737] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {onOpenMap && (
            <button
              type="button"
              onClick={onOpenMap}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#237737] border border-emerald-200/80 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="View all rescue teams on interactive map"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Locate on Map</span>
            </button>
          )}
          <div className="text-xs font-extrabold text-slate-400">
            {usersList.filter((u) => u.role === 'Rescue Team').length} rescue units registered
          </div>
        </div>
      </div>

      {/* Rescue Teams Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
        {teams.map((team) => (
          <div
            key={team._id || team.id}
            className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{team.fullName}</h4>
                    <p className="text-[11px] text-slate-400 font-semibold">
                      {team.city ? `HQ: ${team.city}, ${team.state || 'Kerala'}` : 'Emergency Taskforce'}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                    team.status === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                      : 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                  }`}
                >
                  {team.status || 'Active'}
                </span>
              </div>

              <div className="mt-4 p-3 bg-[#F8FAF9] rounded-2xl border border-slate-100 space-y-1.5 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{team.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    {team.phoneNumber ? `+91 ${team.phoneNumber}` : 'No hotline registered'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>GPS Telemetry Ready ✓</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setSelectedUserForModal(team);
                  setShowUserDetailsModal(true);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> View Unit
              </button>
              <button
                onClick={() => handleToggleStatus(team)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                  team.status === 'Active'
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}
              >
                {team.status === 'Active' ? 'Suspend' : 'Activate'}
              </button>
            </div>
          </div>
        ))}

        {usersList.filter((u) => u.role === 'Rescue Team').length === 0 && (
          <div className="col-span-full bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-3">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Truck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              No Rescue Teams Registered Yet
            </h3>
            <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
              Rescue team accounts will appear here once approved by administrator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRescueTeams;
