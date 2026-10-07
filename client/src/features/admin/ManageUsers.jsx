import React from 'react';
import {
  Users,
  Search,
  AlertCircle,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Eye,
  UserPlus,
  Lock,
} from 'lucide-react';
import { getMediaUrl } from '../../config/api';

const ManageUsers = ({
  usersList = [],
  usersLoading = false,
  usersError = '',
  loadUsers,
  searchQuery = '',
  setSearchQuery,
  roleFilter = 'All',
  setRoleFilter,
  statusFilter = 'All',
  setStatusFilter,
  userActionLoading = {},
  handleToggleStatus,
  handleUpdateRole,
  handleDeleteUser,
  setSelectedUserForModal,
  setShowUserDetailsModal,
  onOpenAddUserModal,
}) => {
  const filteredUsers = usersList.filter((u) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (u.fullName || u.name || '').toLowerCase().includes(query) ||
      (u.email || '').toLowerCase().includes(query) ||
      (u.phoneNumber || '').toLowerCase().includes(query) ||
      (u.city || '').toLowerCase().includes(query) ||
      (u.district || '').toLowerCase().includes(query) ||
      (u.state || '').toLowerCase().includes(query);
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Registered
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{usersList.length}</div>
          <div className="text-[10px] font-bold text-blue-600 mt-0.5">Database Accounts</div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Users</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {usersList.filter((u) => u.status === 'Active').length}
          </div>
          <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
            {usersList.length > 0
              ? `${Math.round(
                  (usersList.filter((u) => u.status === 'Active').length / usersList.length) * 100
                )}% of total`
              : '0%'}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Users</div>
          <div className="text-2xl font-black text-[#237737] mt-1">
            {usersList.filter((u) => u.isEmailVerified || u.isPhoneVerified).length}
          </div>
          <div className="text-[10px] font-bold text-slate-400 mt-0.5">
            {usersList.filter((u) => u.isEmailVerified && u.isPhoneVerified).length} dual verified
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Suspended / Inactive
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {usersList.filter((u) => u.status !== 'Active').length}
          </div>
          <div className="text-[10px] font-bold text-rose-500 mt-0.5">
            {usersList.filter((u) => u.status === 'Suspended').length} suspended
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, phone, city…"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#237737] text-xs font-semibold transition"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="Public User">Public User</option>
              <option value="Rescue Team">Rescue Team</option>
              <option value="Shelter">Shelter</option>
              <option value="Veterinary Staff">Veterinary Staff</option>
              <option value="Admin">Admin</option>
            </select>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {['All', 'Active', 'Suspended', 'Inactive'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#237737] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {st === 'All' ? 'All Statuses' : st}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <span className="text-xs text-slate-400 font-extrabold">
              {filteredUsers.length} of {usersList.length} users
            </span>
            {onOpenAddUserModal && (
              <button
                onClick={onOpenAddUserModal}
                className="px-4 py-2 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow shadow-[#237737]/10 flex items-center gap-1.5 shrink-0"
              >
                <UserPlus className="w-4 h-4" /> Add User
              </button>
            )}
          </div>
        </div>

        {/* Error Banner */}
        {usersError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-700 text-xs font-bold">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{usersError}</span>
            </div>
            <button
              onClick={loadUsers}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {usersLoading && (
          <div className="p-12 bg-[#F8FAF9] border border-slate-100 rounded-2xl text-center text-slate-400 text-sm font-semibold animate-pulse flex items-center justify-center gap-2.5">
            <RefreshCw className="w-5 h-5 animate-spin text-[#237737]" />
            <span>Loading registered users from database…</span>
          </div>
        )}

        {/* Empty State */}
        {!usersLoading && usersList.length === 0 && (
          <div className="bg-[#F8FAF9] border border-slate-100 rounded-3xl p-12 text-center space-y-3">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">No Users Registered Yet</h3>
            <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
              Registered users will automatically appear here.
            </p>
          </div>
        )}

        {/* Users Table */}
        {!usersLoading && usersList.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="pb-3.5 pl-4">User Details</th>
                  <th className="pb-3.5">Role</th>
                  <th className="pb-3.5">City / Location</th>
                  <th className="pb-3.5">Status</th>
                  <th className="pb-3.5">Joined</th>
                  <th className="pb-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredUsers.map((u) => {
                  const userId = u._id || u.id;
                  const displayName = u.fullName || u.name || 'Unnamed User';
                  const displayEmail = u.email || 'No email';
                  const displayPhone = u.phoneNumber || 'No phone';
                  const displayLocation =
                    [u.city, u.district, u.state].filter(Boolean).join(', ') ||
                    u.address ||
                    'Not specified';
                  const joinedDate = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : u.joined || 'Recent';

                  const roleBadgeClass =
                    u.role === 'Admin'
                      ? 'bg-purple-50 text-purple-700 border-purple-200/60'
                      : u.role === 'Rescue Team'
                      ? 'bg-blue-50 text-blue-700 border-blue-200/60'
                      : u.role === 'Shelter' || u.role === 'Shelter Manager'
                      ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                      : u.role === 'Veterinary Staff'
                      ? 'bg-teal-50 text-teal-700 border-teal-200/60'
                      : 'bg-slate-100 text-slate-700 border-slate-200/60';

                  return (
                    <tr key={userId} className="hover:bg-slate-50/70 transition">
                      {/* User Details Column */}
                      <td className="py-4 pl-4">
                        <div className="flex items-center gap-3">
                          {u.profilePic ? (
                            <img
                              src={getMediaUrl(u.profilePic)}
                              alt={displayName}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#237737]/10 text-[#237737] font-black text-sm flex items-center justify-center shrink-0">
                              {displayName[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className="space-y-0.5">
                            <h4 className="font-extrabold text-slate-900 text-sm">{displayName}</h4>
                            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {displayEmail}
                              </span>
                            </div>
                            {displayPhone !== 'No phone' && (
                              <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{displayPhone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role Column */}
                      <td className="py-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${roleBadgeClass}`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Location Column */}
                      <td className="py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold max-w-xs">
                          <MapPin className="w-3.5 h-3.5 text-[#237737] shrink-0" />
                          <span className="truncate">{displayLocation}</span>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                            u.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                              : u.status === 'Suspended'
                              ? 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                              : 'bg-amber-500/10 text-amber-700 border-amber-200/50'
                          }`}
                        >
                          {u.status || 'Active'}
                        </span>
                      </td>

                      {/* Joined Column */}
                      <td className="py-4 text-slate-400 text-xs font-semibold whitespace-nowrap">
                        {joinedDate}
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Profile */}
                          <button
                            onClick={() => {
                              setSelectedUserForModal(u);
                              setShowUserDetailsModal(true);
                            }}
                            title="View User Details"
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Toggle Status */}
                          {u.role === 'Admin' ? (
                            <button
                              disabled
                              type="button"
                              title="Admin user cannot be suspended"
                              className="px-3 py-1.5 text-xs font-bold rounded-lg border bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-80 inline-flex items-center gap-1.5 shadow-none select-none"
                            >
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Suspend</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              disabled={userActionLoading[userId]}
                              title={
                                u.status === 'Active' ? 'Suspend Account' : 'Activate Account'
                              }
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer disabled:opacity-50 ${
                                u.status === 'Active'
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200/50'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200/50'
                              }`}
                            >
                              {userActionLoading[userId] ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : u.status === 'Active' ? (
                                'Suspend'
                              ) : (
                                'Activate'
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
