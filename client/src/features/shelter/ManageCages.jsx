import React from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
} from 'lucide-react';

const ManageCages = ({
  capacities = [],
  cages = [],
  categories = [],
  cageSearchQuery,
  setCageSearchQuery,
  cageCategoryFilter,
  setCageCategoryFilter,
  cageStatusFilter,
  setCageStatusFilter,
  cageTypeFilter,
  setCageTypeFilter,
  handleOpenAddCapacity,
  handleOpenEditCapacity,
  handleDeleteCapacity,
  setShowAddCageModal,
  handleUpdateCageStatus,
  handleViewCageDetails,
  handleDeleteCage,
}) => {
  const filteredManageCages = cages.filter((cage) => {
    const cageNum = String(cage.cageNumber || '');
    const categoryName = cage.categoryId?.categoryName || 'General';
    const matchesSearch =
      cageNum.includes(cageSearchQuery) ||
      categoryName.toLowerCase().includes(cageSearchQuery.toLowerCase());
    const matchesCategory =
      cageCategoryFilter === 'All' || categoryName === cageCategoryFilter;
    const matchesStatus =
      cageStatusFilter === 'All' || cage.status === cageStatusFilter;
    const matchesType =
      cageTypeFilter === 'All' || cage.type === cageTypeFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-[#237737]" /> Manage Cages & Capacity
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
            Configure cage allocations, monitor pen occupancy, view cage details, and update species capacity limits when needed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddCapacity}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Layers className="w-4 h-4 text-emerald-600" /> Set / Update Capacity
          </button>
          <button
            onClick={() => setShowAddCageModal(true)}
            className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/15"
          >
            <Plus className="w-4 h-4" /> Add New Cage
          </button>
        </div>
      </div>

      {/* ── SECTION 1: CAPACITY TABLE & WING LIMITS ── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
              Species Wing Capacity Management
            </h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Total Capacity: {capacities.reduce((a, c) => a + (c.totalCapacity || 0), 0)} spots across {capacities.length} categories
            </p>
          </div>
          <button
            onClick={handleOpenAddCapacity}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer self-start sm:self-center"
          >
            <Plus className="w-3.5 h-3.5" /> Add Category Limit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {capacities.map((cap) => {
            const total = cap.totalCapacity || 1;
            const occupied = cap.occupiedCapacity || 0;
            const available = Math.max(0, total - occupied);
            const pct = Math.min(100, Math.round((occupied / total) * 100));
            const isHigh = pct >= 80;

            return (
              <div
                key={cap._id || cap.capacityId}
                className="p-5 bg-[#F8FAF9] border border-slate-200/80 rounded-2xl space-y-4 hover:border-emerald-300 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                      {cap.categoryId?.categoryName?.[0] || 'C'}
                    </div>
                    <div>
                      <span className="font-black text-slate-900 text-sm block">
                        {cap.categoryId?.categoryName || 'General'} Wing
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        Category ID: {cap.categoryId?._id?.slice(-6) || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditCapacity(cap)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-white rounded-lg transition cursor-pointer"
                      title="Update Capacity"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCapacity(cap._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition cursor-pointer"
                      title="Delete Capacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Capacity Stats */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 bg-white rounded-xl border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Total</span>
                    <span className="text-sm font-black text-slate-800">{total}</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-100">
                    <span className="text-[9px] font-bold text-amber-600 uppercase block">Occupied</span>
                    <span className="text-sm font-black text-slate-800">{occupied}</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-100">
                    <span className="text-[9px] font-bold text-emerald-600 uppercase block">Available</span>
                    <span className="text-sm font-black text-emerald-700">{available}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-400">Utilization</span>
                    <span
                      className={
                        isHigh ? 'text-orange-600 font-extrabold' : 'text-emerald-700 font-extrabold'
                      }
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200/70 rounded-full w-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isHigh ? 'bg-orange-500' : 'bg-[#237737]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEditCapacity(cap)}
                  className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  Edit / Update Capacity
                </button>
              </div>
            );
          })}
        </div>

        {capacities.length === 0 && (
          <div className="py-8 text-center text-slate-400 text-xs font-semibold space-y-2">
            <p>No species wing capacities configured yet.</p>
            <button
              onClick={handleOpenAddCapacity}
              className="px-4 py-2 bg-[#237737] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Configure First Capacity
            </button>
          </div>
        )}
      </div>

      {/* ── SECTION 2: SHELTER CAGES & PENS ── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
              Shelter Cages & Pens ({cages.length})
            </h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Individual cage allocations, types, and occupancy statuses
            </p>
          </div>

          <button
            onClick={() => setShowAddCageModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-center"
          >
            <Plus className="w-3.5 h-3.5" /> Add Cage
          </button>
        </div>

        {/* Filters toolbar */}
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={cageSearchQuery}
              onChange={(e) => setCageSearchQuery(e.target.value)}
              placeholder="Search cage # or category..."
              className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#237737] focus:bg-white transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Category filter */}
            <select
              value={cageCategoryFilter}
              onChange={(e) => setCageCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.categoryName}>
                  {c.categoryName}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={cageStatusFilter}
              onChange={(e) => setCageStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="OCCUPIED">OCCUPIED</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
            </select>

            {/* Type filter */}
            <select
              value={cageTypeFilter}
              onChange={(e) => setCageTypeFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Normal">Normal</option>
              <option value="Initial">Initial</option>
              <option value="Quarantine">Quarantine</option>
              <option value="Recovery">Recovery</option>
            </select>
          </div>
        </div>

        {/* Cages Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400 tracking-wider">
                <th className="pb-3.5 pl-4">Cage #</th>
                <th className="pb-3.5">Category Wing</th>
                <th className="pb-3.5">Type</th>
                <th className="pb-3.5">Status</th>
                <th className="pb-3.5">Assigned Animal</th>
                <th className="pb-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
              {filteredManageCages.map((cage) => (
                <tr key={cage._id || cage.cageId} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 pl-4 text-slate-900 font-extrabold text-sm">
                    Cage #{cage.cageNumber}
                  </td>
                  <td className="py-4 text-slate-700 font-bold">
                    {cage.categoryId?.categoryName || 'General'}
                  </td>
                  <td className="py-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                      {cage.type}
                    </span>
                  </td>
                  <td className="py-4">
                    <select
                      value={cage.status}
                      onChange={(e) => handleUpdateCageStatus(cage._id, e.target.value)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black border cursor-pointer focus:outline-none transition ${
                        cage.status === 'AVAILABLE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : cage.status === 'OCCUPIED'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      <option value="AVAILABLE">🟢 AVAILABLE</option>
                      <option value="OCCUPIED">🟡 OCCUPIED</option>
                      <option value="MAINTENANCE">🔴 MAINTENANCE</option>
                    </select>
                  </td>
                  <td className="py-4 text-slate-600 font-semibold">
                    {cage.animalId?.name ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md font-bold text-[11px]">
                        {cage.animalId.name} ({cage.animalId.species})
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">None (Vacant)</span>
                    )}
                  </td>
                  <td className="py-4 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleViewCageDetails(cage)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-[#237737] hover:text-white text-slate-700 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                        title="View cage details"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </button>
                      <button
                        onClick={() => handleDeleteCage(cage._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Cage"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredManageCages.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold space-y-2">
            <p>No cages matched your search criteria.</p>
            <button
              onClick={() => setShowAddCageModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Cage
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCages;
