import React from 'react';
import {
  Tag,
  Dog,
  Search,
  Plus,
  Edit2,
  Eye,
  Trash2,
} from 'lucide-react';

const ManageAnimals = ({
  animalsList = [],
  animalsLoading = false,
  animalCategories = [],
  categoriesLoading = false,
  animalActiveSubView = 'categories',
  setAnimalActiveSubView,
  categorySearchQuery = '',
  setCategorySearchQuery,
  categoryStatusFilter = 'All',
  setCategoryStatusFilter,
  animalSearchQuery = '',
  setAnimalSearchQuery,
  animalSpeciesFilter = 'All',
  setAnimalSpeciesFilter,
  animalStatusFilter = 'All',
  setAnimalStatusFilter,
  handleOpenAddCategoryModal,
  handleOpenEditCategoryModal,
  handleToggleCategoryStatus,
  handleOpenAddAnimalModal,
  handleToggleAnimalStatus,
  handleDeleteAnimal,
  setSelectedAnimalForModal,
  setShowAnimalDetailsModal,
}) => {
  const filteredCategories = animalCategories.filter((cat) => {
    const q = categorySearchQuery.toLowerCase();
    const matchQ =
      !q ||
      cat.categoryId?.toLowerCase().includes(q) ||
      cat.categoryName?.toLowerCase().includes(q) ||
      cat.description?.toLowerCase().includes(q);
    const matchSt =
      categoryStatusFilter === 'All' || cat.status === categoryStatusFilter;
    return matchQ && matchSt;
  });

  const filteredAnimals = animalsList.filter((anl) => {
    const q = animalSearchQuery.toLowerCase();
    const matchQ =
      !q ||
      anl.animalId?.toLowerCase().includes(q) ||
      anl.name?.toLowerCase().includes(q) ||
      anl.breed?.toLowerCase().includes(q) ||
      anl.cageNumber?.toLowerCase().includes(q) ||
      anl.shelterName?.toLowerCase().includes(q);
    const matchSp =
      animalSpeciesFilter === 'All' ||
      anl.species?.toLowerCase() === animalSpeciesFilter.toLowerCase();
    const matchSt =
      animalStatusFilter === 'All' || anl.status === animalStatusFilter;
    return matchQ && matchSp && matchSt;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Registered Animals
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{animalsList.length}</div>
          <div className="text-[10px] font-bold text-[#237737] mt-0.5">
            Active Database Records
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Animal Categories
          </div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {animalCategories.length}
          </div>
          <div className="text-[10px] font-bold text-blue-600 mt-0.5">
            {animalCategories.filter((c) => c.status === 'Active').length} Active Classifications
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Available for Adoption
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {
              animalsList.filter(
                (a) => a.status === 'Available' || a.status === 'Rescued'
              ).length
            }
          </div>
          <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
            In Care / Adoption Ready
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Under Treatment
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {
              animalsList.filter(
                (a) => a.status === 'Under Treatment' || a.status === 'Critical'
              ).length
            }
          </div>
          <div className="text-[10px] font-bold text-amber-600 mt-0.5">
            Medical Intensive Care
          </div>
        </div>
      </div>

      {/* View Switch Tabs (Category Table vs Registered Animals) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAnimalActiveSubView('categories')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              animalActiveSubView === 'categories'
                ? 'bg-[#237737] text-white shadow-sm shadow-[#237737]/10'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Animal Categories ({animalCategories.length})</span>
          </button>

          <button
            onClick={() => setAnimalActiveSubView('animals')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              animalActiveSubView === 'animals'
                ? 'bg-[#237737] text-white shadow-sm shadow-[#237737]/10'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Dog className="w-3.5 h-3.5" />
            <span>Registered Animals ({animalsList.length})</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400">
          <span>
            Primary Key:{' '}
            <code className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">
              categoryId
            </code>
          </span>
        </div>
      </div>

      {/* VIEW 1: ANIMAL CATEGORIES TABLE */}
      {animalActiveSubView === 'categories' && (
        <div className="space-y-4">
          {/* Category Purpose & Search Row */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  placeholder="Search category name, ID, desc…"
                  className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] transition"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {['All', 'Active', 'Inactive'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setCategoryStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      categoryStatusFilter === st
                        ? 'bg-[#237737] text-white shadow-sm'
                        : 'bg-[#F8FAF9] hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleOpenAddCategoryModal}
              className="px-4 py-2 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow shadow-[#237737]/10 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Animal Category
            </button>
          </div>

          {/* Category Table */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#237737]" />
                  Animal Category Table
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  Stores different categories of animals such as Dog, Cat, Bird, Cow, etc.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {animalCategories.length} Total Categories
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/30">
                    <th className="py-3.5 px-5">SI No.</th>
                    <th className="py-3.5 px-5">Category ID</th>
                    <th className="py-3.5 px-5">Category Name</th>
                    <th className="py-3.5 px-5">Description</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5">Created At</th>
                    <th className="py-3.5 px-5">Updated At</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                  {filteredCategories.map((cat, index) => (
                    <tr
                      key={cat._id || cat.categoryId || index}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-bold text-slate-400">{index + 1}</td>
                      <td className="py-3.5 px-5 font-mono font-bold text-[#237737]">
                        {cat.categoryId || `CAT-${String(index + 1).padStart(4, '0')}`}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-700 font-black text-xs flex items-center justify-center">
                            {cat.categoryName === 'Dog'
                              ? '🐕'
                              : cat.categoryName === 'Cat'
                              ? '🐈'
                              : cat.categoryName === 'Bird'
                              ? '🦜'
                              : cat.categoryName === 'Cow'
                              ? '🐄'
                              : '🐾'}
                          </span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {cat.categoryName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 max-w-xs text-slate-500 text-xs">
                        {cat.description || 'General animal classification'}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                            cat.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                              : 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                          }`}
                        >
                          {cat.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-[11px] text-slate-400">
                        {cat.createdAt
                          ? new Date(cat.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="py-3.5 px-5 text-[11px] text-slate-400">
                        {cat.updatedAt
                          ? new Date(cat.updatedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditCategoryModal(cat)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleCategoryStatus(cat)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                              cat.status === 'Active'
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {cat.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {animalCategories.length === 0 && !categoriesLoading && (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-10 text-center text-slate-400 text-xs font-semibold"
                      >
                        No animal categories defined yet. Click "+ Add Animal Category" above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: REGISTERED ANIMALS REGISTRY */}
      {animalActiveSubView === 'animals' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={animalSearchQuery}
                  onChange={(e) => setAnimalSearchQuery(e.target.value)}
                  placeholder="Search name, ID, breed, cage…"
                  className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#237737] transition"
                />
              </div>

              {/* Species Filter */}
              <select
                value={animalSpeciesFilter}
                onChange={(e) => setAnimalSpeciesFilter(e.target.value)}
                className="px-3.5 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
              >
                <option value="All">All Species / Categories</option>
                {animalCategories.map((c) => (
                  <option key={c._id || c.categoryId} value={c.categoryName}>
                    {c.categoryName}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={animalStatusFilter}
                onChange={(e) => setAnimalStatusFilter(e.target.value)}
                className="px-3.5 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Rescued">Rescued</option>
                <option value="Under Treatment">Under Treatment</option>
                <option value="Critical">Critical</option>
                <option value="Adopted">Adopted</option>
                <option value="Released">Released</option>
              </select>
            </div>

            <button
              onClick={handleOpenAddAnimalModal}
              className="px-4 py-2 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow shadow-[#237737]/10 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" /> Register Animal
            </button>
          </div>

          {/* Registered Animals Table */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Dog className="w-4 h-4 text-[#237737]" />
                  Registered Rescue Animals Registry
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  Comprehensive index of rescued animals across all shelter facilities and partner clinics
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {animalsList.length} Total Animals Registered
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/30">
                    <th className="py-3.5 px-5">Animal ID</th>
                    <th className="py-3.5 px-5">Animal Name & Breed</th>
                    <th className="py-3.5 px-5">Category / Species</th>
                    <th className="py-3.5 px-5">Gender / Age</th>
                    <th className="py-3.5 px-5">Facility / Cage</th>
                    <th className="py-3.5 px-5">Health</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                  {filteredAnimals.map((anl) => (
                    <tr
                      key={anl._id || anl.animalId}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-mono font-bold text-[#237737]">
                        {anl.animalId}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#237737]/10 text-[#237737] font-black text-xs flex items-center justify-center shrink-0">
                            {anl.species === 'Dog'
                              ? '🐕'
                              : anl.species === 'Cat'
                              ? '🐈'
                              : anl.species === 'Bird'
                              ? '🦜'
                              : anl.species === 'Cow'
                              ? '🐄'
                              : '🐾'}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm">
                              {anl.name || 'Unnamed Animal'}
                            </p>
                            <p className="text-[11px] text-slate-400 font-semibold">
                              {anl.breed || 'Mixed Breed'} {anl.color ? `• ${anl.color}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-extrabold text-slate-800">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                          {anl.species}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">
                        {anl.gender || 'Unknown'} {anl.approxAge ? `• ${anl.approxAge}` : ''}
                      </td>
                      <td className="py-3.5 px-5">
                        <p className="font-bold text-slate-800">
                          {anl.shelterName || 'Central Registry'}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Cage: {anl.cageNumber || 'Unassigned'}
                        </p>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            anl.healthCondition === 'Critical'
                              ? 'bg-rose-100 text-rose-700'
                              : anl.healthCondition === 'Under Treatment'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {anl.healthCondition || 'Healthy'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <select
                          value={anl.status}
                          onChange={(e) => handleToggleAnimalStatus(anl, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                            anl.status === 'Available' || anl.status === 'Rescued'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : anl.status === 'Under Treatment' || anl.status === 'Critical'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : anl.status === 'Adopted'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="Available">Available</option>
                          <option value="Rescued">Rescued</option>
                          <option value="Under Treatment">Under Treatment</option>
                          <option value="Critical">Critical</option>
                          <option value="Adopted">Adopted</option>
                          <option value="Released">Released</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedAnimalForModal(anl);
                              setShowAnimalDetailsModal(true);
                            }}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAnimal(anl)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                            title="Delete Animal Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {animalsList.length === 0 && !animalsLoading && (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-10 text-center text-slate-400 text-xs font-semibold"
                      >
                        No registered animals found. Click "+ Register Animal" above to add the first record.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAnimals;
