import React from 'react';
import {
  Stethoscope,
  Search,
  Mail,
  Phone,
  ShieldCheck,
  Eye,
} from 'lucide-react';

const ManageVet = ({
  usersList = [],
  vetSearchQuery = '',
  setVetSearchQuery,
  vetStatusFilter = 'All',
  setVetStatusFilter,
  handleToggleStatus,
  setSelectedUserForModal,
  setShowUserDetailsModal,
}) => {
  const vets = usersList
    .filter((u) => u.role === 'Veterinary Staff')
    .filter((u) => {
      const q = vetSearchQuery.toLowerCase();
      const matchQ =
        !q ||
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.city?.toLowerCase().includes(q);
      const matchSt =
        vetStatusFilter === 'All' || (u.status || 'Active') === vetStatusFilter;
      return matchQ && matchSt;
    });

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Registered Vets
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {usersList.filter((u) => u.role === 'Veterinary Staff').length}
          </div>
          <div className="text-[10px] font-bold text-teal-600 mt-0.5">Certified Surgeons</div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active On-Duty
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {
              usersList.filter(
                (u) => u.role === 'Veterinary Staff' && u.status === 'Active'
              ).length
            }
          </div>
          <div className="text-[10px] font-bold text-emerald-600 mt-0.5">Available for Triage</div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Partner Clinics
          </div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {usersList.filter((u) => u.role === 'Veterinary Staff').length}
          </div>
          <div className="text-[10px] font-bold text-blue-600 mt-0.5">Affiliated Clinics</div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Emergency Duty
          </div>
          <div className="text-2xl font-black text-purple-600 mt-1">
            {
              usersList.filter(
                (u) => u.role === 'Veterinary Staff' && u.status === 'Active'
              ).length
            }
          </div>
          <div className="text-[10px] font-bold text-purple-600 mt-0.5">On-Call Specialists</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={vetSearchQuery}
              onChange={(e) => setVetSearchQuery(e.target.value)}
              placeholder="Search vet by name, email, city…"
              className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#237737] transition"
            />
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-center gap-1.5">
            {['All', 'Active', 'Suspended'].map((st) => (
              <button
                key={st}
                onClick={() => setVetStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  vetStatusFilter === st
                    ? 'bg-[#237737] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs font-extrabold text-slate-400">
          {usersList.filter((u) => u.role === 'Veterinary Staff').length} veterinary surgeons
        </div>
      </div>

      {/* Vets Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
        {vets.map((vet) => (
          <div
            key={vet._id || vet.id}
            className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-700 flex items-center justify-center font-black text-lg shrink-0">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{vet.fullName}</h4>
                    <p className="text-[11px] text-slate-400 font-semibold">
                      {vet.city ? `${vet.city}, ${vet.state || 'Kerala'}` : 'Registered Vet'}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                    vet.status === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                      : 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                  }`}
                >
                  {vet.status || 'Active'}
                </span>
              </div>

              <div className="mt-4 p-3 bg-[#F8FAF9] rounded-2xl border border-slate-100 space-y-1.5 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="truncate">{vet.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>
                    {vet.phoneNumber ? `+91 ${vet.phoneNumber}` : 'No phone registered'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>VCI License Verified ✓</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setSelectedUserForModal(vet);
                  setShowUserDetailsModal(true);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> View Profile
              </button>
              <button
                onClick={() => handleToggleStatus(vet)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                  vet.status === 'Active'
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}
              >
                {vet.status === 'Active' ? 'Suspend' : 'Activate'}
              </button>
            </div>
          </div>
        ))}

        {usersList.filter((u) => u.role === 'Veterinary Staff').length === 0 && (
          <div className="col-span-full bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-3">
            <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto">
              <Stethoscope className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              No Veterinary Surgeons Registered Yet
            </h3>
            <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
              Registered veterinary staff will automatically appear here once approved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageVet;
