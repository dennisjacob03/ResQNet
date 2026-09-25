import React, { useState, useEffect } from 'react';
import {
  Dog,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Stethoscope,
  Scissors,
  Calendar,
  Clock,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { getClinicalRecords } from '../../services/veterinaryService';

const ManageAnimals = ({
  displayAnimals = [],
  animalSearchQuery,
  setAnimalSearchQuery,
  animalSpeciesFilter,
  setAnimalSpeciesFilter,
  animalHealthFilter,
  setAnimalHealthFilter,
  setShowAddAnimalModal,
  handleViewAnimalDetails,
}) => {
  const [viewMode, setViewMode] = useState('animals'); // 'animals' | 'medical_records'
  const [allClinicalRecords, setAllClinicalRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [recordSearchQuery, setRecordSearchQuery] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState('All');

  // Fetch all clinical records uploaded by veterinary staff for this shelter
  const loadShelterClinicalRecords = async () => {
    try {
      setLoadingRecords(true);
      const res = await getClinicalRecords();
      if (res?.records) {
        setAllClinicalRecords(res.records);
      } else {
        setAllClinicalRecords([]);
      }
    } catch (err) {
      console.warn('Failed to load all shelter clinical records:', err);
      setAllClinicalRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    loadShelterClinicalRecords();
  }, [displayAnimals.length]);

  // Filtered Animals
  const filteredManageAnimals = displayAnimals.filter((animal) => {
    const name = animal.name || '';
    const breed = animal.breed || '';
    const id = animal.animalId || animal._id || '';
    const matchesSearch =
      name.toLowerCase().includes(animalSearchQuery.toLowerCase()) ||
      breed.toLowerCase().includes(animalSearchQuery.toLowerCase()) ||
      id.toLowerCase().includes(animalSearchQuery.toLowerCase());
    const matchesSpecies =
      animalSpeciesFilter === 'All' || animal.species === animalSpeciesFilter;
    const matchesHealth =
      animalHealthFilter === 'All' ||
      animal.healthCondition === animalHealthFilter ||
      animal.status === animalHealthFilter;
    return matchesSearch && matchesSpecies && matchesHealth;
  });

  // Filtered Clinical Records
  const filteredClinicalRecords = allClinicalRecords.filter((record) => {
    const animalName = record.animalName || '';
    const doctorName = record.vetName || '';
    const id = record.animalId || record.medicalRecordId || '';
    const diagnosis = record.report || record.diagnosis || '';
    const term = recordSearchQuery.toLowerCase();
    const matchesSearch =
      animalName.toLowerCase().includes(term) ||
      doctorName.toLowerCase().includes(term) ||
      id.toLowerCase().includes(term) ||
      diagnosis.toLowerCase().includes(term);
    const matchesType =
      recordTypeFilter === 'All' ||
      record.type === recordTypeFilter ||
      (recordTypeFilter === 'Surgery' && (record.isSurgery || record.type === 'Surgery'));
    return matchesSearch && matchesType;
  });

  const handleOpenAnimalForRecord = (record) => {
    // Find matching animal in displayAnimals
    const match = displayAnimals.find(
      (a) =>
        (record.animalObjectId && String(a._id) === String(record.animalObjectId)) ||
        (record.animalId && (a.animalId === record.animalId || String(a._id) === record.animalId))
    );

    if (match) {
      handleViewAnimalDetails(match, 'medical');
    } else {
      // Fallback object with available information
      handleViewAnimalDetails(
        {
          _id: record.animalObjectId || record.animalId,
          animalId: record.animalId || 'ANL',
          name: record.animalName || 'Shelter Animal',
          species: record.species || 'Dog',
          healthCondition: record.status || 'Ongoing',
        },
        'medical'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Dog className="w-7 h-7 text-[#237737]" /> Manage Animals & Medical Records
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
            Register animals, track health conditions, allocate pens, and inspect clinical reports uploaded by veterinary staff.
          </p>
        </div>

        <button
          onClick={() => setShowAddAnimalModal(true)}
          className="px-5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-[#237737]/15"
        >
          <Plus className="w-4 h-4" /> Register New Animal
        </button>
      </div>

      {/* Animal & Medical Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setViewMode('animals')}
          className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs cursor-pointer hover:border-slate-300 transition"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Animals</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{displayAnimals.length}</span>
        </div>
        <div
          onClick={() => setViewMode('animals')}
          className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs cursor-pointer hover:border-emerald-200 transition"
        >
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Healthy / Stable</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {
              displayAnimals.filter(
                (a) => a.healthCondition === 'Healthy' || a.status === 'Healthy' || a.status === 'Rescued'
              ).length
            }
          </span>
        </div>
        <div
          onClick={() => setViewMode('animals')}
          className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs cursor-pointer hover:border-amber-200 transition"
        >
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Under Treatment</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {
              displayAnimals.filter(
                (a) => a.healthCondition === 'Under Treatment' || a.status === 'Under Treatment'
              ).length
            }
          </span>
        </div>
        <div
          onClick={() => setViewMode('medical_records')}
          className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs cursor-pointer hover:border-blue-200 transition"
        >
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block flex items-center justify-between">
            <span>Vet Clinical Logs</span>
            <Stethoscope className="w-3.5 h-3.5" />
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{allClinicalRecords.length}</span>
        </div>
      </div>

      {/* View Switcher: Animal Registry vs Veterinary Clinical Logs */}
      <div className="flex items-center gap-3 border-b border-slate-200/80 pb-1">
        <button
          onClick={() => setViewMode('animals')}
          className={`pb-3 px-3 text-xs sm:text-sm font-extrabold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            viewMode === 'animals'
              ? 'border-[#237737] text-[#237737]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Dog className="w-4 h-4" />
          <span>Shelter Animals Registry ({displayAnimals.length})</span>
        </button>

        <button
          onClick={() => {
            setViewMode('medical_records');
            loadShelterClinicalRecords();
          }}
          className={`pb-3 px-3 text-xs sm:text-sm font-extrabold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            viewMode === 'medical_records'
              ? 'border-[#237737] text-[#237737]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4 text-blue-600" />
          <span>Veterinary Staff Clinical Reports ({allClinicalRecords.length})</span>
        </button>
      </div>

      {/* VIEW 1: ANIMAL REGISTRY TABLE */}
      {viewMode === 'animals' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
          {/* Search & Multi-Filters Toolbar */}
          <div className="flex flex-col lg:flex-row gap-3 items-center justify-between pb-4 border-b border-slate-100">
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={animalSearchQuery}
                onChange={(e) => setAnimalSearchQuery(e.target.value)}
                placeholder="Search by animal name, breed, or ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#237737] focus:bg-white transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              {/* Species Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400">Species:</span>
                <select
                  value={animalSpeciesFilter}
                  onChange={(e) => setAnimalSpeciesFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
                >
                  <option value="All">All Species</option>
                  <option value="Dog">Dogs</option>
                  <option value="Cat">Cats</option>
                  <option value="Bird">Birds</option>
                  <option value="Cow">Cattle</option>
                  <option value="Other">Other Species</option>
                </select>
              </div>

              {/* Health Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400">Health:</span>
                <select
                  value={animalHealthFilter}
                  onChange={(e) => setAnimalHealthFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
                >
                  <option value="All">All Health Statuses</option>
                  <option value="Healthy">Healthy</option>
                  <option value="Under Treatment">Under Treatment</option>
                  <option value="Critical">Critical</option>
                  <option value="Adopted">Adopted</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setAnimalSearchQuery('');
                  setAnimalSpeciesFilter('All');
                  setAnimalHealthFilter('All');
                }}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition cursor-pointer"
                title="Reset filters"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400 tracking-wider">
                  <th className="pb-3.5 pl-4">ID</th>
                  <th className="pb-3.5">Animal Name</th>
                  <th className="pb-3.5">Species</th>
                  <th className="pb-3.5">Breed</th>
                  <th className="pb-3.5">Age & Gender</th>
                  <th className="pb-3.5">Cage Allocation</th>
                  <th className="pb-3.5">Health Condition</th>
                  <th className="pb-3.5">Intake Date</th>
                  <th className="pb-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                {filteredManageAnimals.map((animal) => (
                  <tr key={animal._id || animal.animalId} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 pl-4 text-slate-400 text-xs font-bold">
                      {animal.animalId || animal._id?.slice(-6)}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                          {(animal.name || 'A')[0].toUpperCase()}
                        </div>
                        <span className="text-slate-900 font-extrabold">{animal.name || 'Unnamed Rescue'}</span>
                      </div>
                    </td>
                    <td className="py-4 font-bold text-slate-700">{animal.species}</td>
                    <td className="py-4 text-xs font-bold text-slate-500">{animal.breed || 'Mixed'}</td>
                    <td className="py-4 text-xs font-bold text-slate-500">
                      {animal.approxAge || '1y'} • {animal.gender || 'Unknown'}
                    </td>
                    <td className="py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200/60">
                        {animal.cageNumber || 'General'}
                      </span>
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          animal.healthCondition === 'Healthy' || animal.status === 'Healthy'
                            ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                            : animal.healthCondition === 'Under Treatment' || animal.status === 'Under Treatment'
                            ? 'bg-amber-500/10 text-amber-700 border-amber-200/50'
                            : 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                        }`}
                      >
                        {animal.healthCondition || animal.status || 'Healthy'}
                      </span>
                    </td>
                    <td className="py-4 text-xs text-slate-400 font-bold">
                      {animal.createdAt
                        ? new Date(animal.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recent'}
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* 1-Click Medical Records Button */}
                        <button
                          onClick={() => handleViewAnimalDetails(animal, 'medical')}
                          className="px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title="View veterinary clinical reports for this animal"
                        >
                          <Stethoscope className="w-3.5 h-3.5" /> Medical Records
                        </button>

                        {/* View Profile Button */}
                        <button
                          onClick={() => handleViewAnimalDetails(animal, 'profile')}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-[#237737] text-slate-700 hover:text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title="View full animal profile"
                        >
                          <Eye className="w-3.5 h-3.5" /> Profile
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredManageAnimals.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm font-semibold space-y-2">
              <p>No animals matched your search or filters.</p>
              <button
                onClick={() => setShowAddAnimalModal(true)}
                className="px-4 py-2 bg-[#237737] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Register New Animal
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: VETERINARY STAFF CLINICAL REPORTS LOG */}
      {viewMode === 'medical_records' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row gap-3 items-center justify-between pb-4 border-b border-slate-100">
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={recordSearchQuery}
                onChange={(e) => setRecordSearchQuery(e.target.value)}
                placeholder="Search by animal name, diagnosis, or doctor..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#237737] focus:bg-white transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400">Type:</span>
                <select
                  value={recordTypeFilter}
                  onChange={(e) => setRecordTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer"
                >
                  <option value="All">All Types</option>
                  <option value="Diagnosis">Diagnosis</option>
                  <option value="Treatment">Treatment</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Routine Checkup">Routine Checkup</option>
                </select>
              </div>

              <button
                onClick={loadShelterClinicalRecords}
                title="Refresh clinical reports"
                disabled={loadingRecords}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl transition cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loadingRecords ? 'animate-spin text-[#237737]' : ''}`} />
              </button>
            </div>
          </div>

          {loadingRecords && (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold space-y-2">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#237737]" />
              <p>Loading clinical reports uploaded by veterinary staff...</p>
            </div>
          )}

          {!loadingRecords && filteredClinicalRecords.length === 0 && (
            <div className="py-12 px-6 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 mx-auto flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-800">No Veterinary Clinical Reports Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-medium">
                  When veterinary staff log examination findings, surgeries, and treatments for your sheltered animals, they will appear here.
                </p>
              </div>
            </div>
          )}

          {!loadingRecords && filteredClinicalRecords.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredClinicalRecords.map((rec, i) => {
                const recId = rec.medicalRecordId || `MED-${i + 1}`;
                const isSurgery = rec.isSurgery || rec.type === 'Surgery';
                const formattedDate = rec.reportDate
                  ? new Date(rec.reportDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Recent';

                return (
                  <div
                    key={rec._id || recId}
                    className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-[#237737]/40 hover:shadow-md transition space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-slate-900 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                            {recId}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                              isSurgery
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : rec.type === 'Treatment'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : rec.type === 'Routine Checkup'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {rec.type}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formattedDate}
                        </span>
                      </div>

                      {/* Animal & Attending Vet */}
                      <div className="flex items-center justify-between text-xs border-y border-slate-100 py-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Animal</span>
                          <span className="font-black text-slate-900 text-sm">{rec.animalName || 'Rescued Animal'}</span>
                          <span className="text-[10px] font-mono text-slate-400 ml-1.5 font-bold">
                            [{rec.animalId}]
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Attending Vet</span>
                          <span className="font-extrabold text-[#237737] flex items-center gap-1 justify-end">
                            <Stethoscope className="w-3 h-3" />
                            {rec.vetName || 'Veterinary Staff'}
                          </span>
                        </div>
                      </div>

                      {/* Vitals quick badges */}
                      {rec.vitals &&
                        (rec.vitals.temperature || rec.vitals.weight || rec.vitals.pulse) && (
                          <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold text-slate-600">
                            {rec.vitals.temperature && (
                              <span className="px-2 py-0.5 bg-slate-50 border border-slate-200/70 rounded-md">
                                Temp: {rec.vitals.temperature}
                              </span>
                            )}
                            {rec.vitals.weight && (
                              <span className="px-2 py-0.5 bg-slate-50 border border-slate-200/70 rounded-md">
                                Weight: {rec.vitals.weight}
                              </span>
                            )}
                            {rec.vitals.pulse && (
                              <span className="px-2 py-0.5 bg-slate-50 border border-slate-200/70 rounded-md">
                                Pulse: {rec.vitals.pulse}
                              </span>
                            )}
                          </div>
                        )}

                      {/* Report Snippet */}
                      <p className="text-xs text-slate-700 font-medium line-clamp-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                        {rec.report || 'Routine medical examination conducted.'}
                      </p>
                    </div>

                    {/* Footer Action */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          rec.status === 'Critical'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : rec.status === 'Ongoing'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        Status: {rec.status || 'Ongoing'}
                      </span>

                      <button
                        onClick={() => handleOpenAnimalForRecord(rec)}
                        className="text-xs font-bold text-[#237737] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Animal Medical Dossier</span>
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageAnimals;
