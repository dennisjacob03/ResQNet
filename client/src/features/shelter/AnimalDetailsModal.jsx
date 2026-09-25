import React, { useState, useEffect } from 'react';
import {
  Dog,
  X,
  Stethoscope,
  Syringe,
  FileText,
  Calendar,
  Activity,
  Scissors,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Heart,
} from 'lucide-react';
import { getClinicalRecords, getVaccinationRecords } from '../../services/veterinaryService';

const AnimalDetailsModal = ({
  showAnimalDetailsModal,
  setShowAnimalDetailsModal,
  selectedAnimalDetails,
  shelterData,
  initialTab = 'profile',
}) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'profile');
  const [clinicalRecords, setClinicalRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Sync activeTab with initialTab when opening
  useEffect(() => {
    if (showAnimalDetailsModal) {
      setActiveTab(initialTab || 'profile');
    }
  }, [showAnimalDetailsModal, initialTab, selectedAnimalDetails]);

  // Load clinical records and vaccination history for the specific animal
  const loadMedicalHistory = async (animal) => {
    if (!animal) return;
    const animalIdentifier = animal.animalId || animal._id;
    if (!animalIdentifier) return;

    try {
      setLoadingRecords(true);
      setFetchError('');

      const [recordsRes, vacsRes] = await Promise.all([
        getClinicalRecords({ animalId: animalIdentifier }).catch((err) => {
          console.warn('Failed to fetch clinical records:', err);
          return { success: false, records: [] };
        }),
        getVaccinationRecords({ animalId: animalIdentifier }).catch((err) => {
          console.warn('Failed to fetch vaccinations:', err);
          return { success: false, vaccinations: [] };
        }),
      ]);

      if (recordsRes?.records) {
        setClinicalRecords(recordsRes.records);
      } else {
        setClinicalRecords([]);
      }

      if (vacsRes?.vaccinations) {
        setVaccinations(vacsRes.vaccinations);
      } else {
        setVaccinations([]);
      }
    } catch (err) {
      console.error('Error loading medical data for animal:', err);
      setFetchError('Unable to load clinical records at this time.');
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    if (showAnimalDetailsModal && selectedAnimalDetails) {
      loadMedicalHistory(selectedAnimalDetails);
    } else {
      setClinicalRecords([]);
      setVaccinations([]);
    }
  }, [showAnimalDetailsModal, selectedAnimalDetails]);

  if (!showAnimalDetailsModal || !selectedAnimalDetails) return null;

  const animalId = selectedAnimalDetails.animalId || selectedAnimalDetails._id;
  const animalName = selectedAnimalDetails.name || 'Rescued Animal';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-2xl sm:max-w-3xl w-full border border-slate-100 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg shrink-0">
              {(animalName || 'A')[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-slate-900">{animalName}</h2>
                <span className="px-2.5 py-0.5 bg-[#237737]/10 text-[#237737] border border-[#237737]/25 text-xs font-mono font-bold rounded-lg">
                  {animalId}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                    selectedAnimalDetails.healthCondition === 'Healthy' ||
                    selectedAnimalDetails.status === 'Healthy'
                      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                      : selectedAnimalDetails.healthCondition === 'Under Treatment'
                      ? 'bg-amber-500/10 text-amber-700 border-amber-200/50'
                      : 'bg-rose-500/10 text-rose-700 border-rose-200/50'
                  }`}
                >
                  {selectedAnimalDetails.healthCondition || selectedAnimalDetails.status || 'Healthy'}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {selectedAnimalDetails.species} • {selectedAnimalDetails.breed || 'Mixed Breed'} • Cage:{' '}
                <span className="font-bold text-[#237737]">{selectedAnimalDetails.cageNumber || 'General'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadMedicalHistory(selectedAnimalDetails)}
              title="Refresh medical records"
              disabled={loadingRecords}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loadingRecords ? 'animate-spin text-[#237737]' : ''}`} />
            </button>
            <button
              onClick={() => setShowAnimalDetailsModal(false)}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="px-6 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50 shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#237737] text-[#237737]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Dog className="w-4 h-4" />
            <span>Animal Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('medical')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'medical'
                ? 'border-[#237737] text-[#237737]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Veterinary Medical Records</span>
            {clinicalRecords.length > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full">
                {clinicalRecords.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('vaccinations')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'vaccinations'
                ? 'border-[#237737] text-[#237737]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Syringe className="w-4 h-4" />
            <span>Vaccinations</span>
            {vaccinations.length > 0 && (
              <span className="px-1.5 py-0.2 bg-orange-100 text-orange-800 text-[10px] font-black rounded-full">
                {vaccinations.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {fetchError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
              {fetchError}
            </div>
          )}

          {/* TAB 1: ANIMAL PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Approx Age</span>
                  <span className="font-extrabold text-slate-800 mt-1 block">
                    {selectedAnimalDetails.approxAge || '1 Year'}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Gender</span>
                  <span className="font-extrabold text-slate-800 mt-1 block">
                    {selectedAnimalDetails.gender || 'Unknown'}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Cage / Pen</span>
                  <span className="font-extrabold text-[#237737] mt-1 block">
                    {selectedAnimalDetails.cageNumber || 'General Wing'}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Neutered / Spayed</span>
                  <span className="font-extrabold text-slate-800 mt-1 block">
                    {selectedAnimalDetails.neutered ? 'Yes (Verified)' : 'No'}
                  </span>
                </div>
              </div>

              {/* Facility & Intake info */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Shelter Facility</span>
                    <span className="font-extrabold text-slate-900">
                      {shelterData?.shelterName || 'ResQNet Shelter Facility'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Registration Date</span>
                  <span className="font-semibold text-slate-700">
                    {selectedAnimalDetails.createdAt
                      ? new Date(selectedAnimalDetails.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Recent'}
                  </span>
                </div>
              </div>

              {/* Rescue History & Medical Notes */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#237737]" /> Intake & General Medical Notes
                </span>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs font-medium text-slate-700 leading-relaxed">
                  {selectedAnimalDetails.about ||
                    selectedAnimalDetails.notes ||
                    'No intake rescue notes recorded for this animal.'}
                </div>
              </div>

              {/* Quick Jump to Clinical Records CTA */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200/70 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Veterinary Clinical History</h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {clinicalRecords.length > 0
                        ? `${clinicalRecords.length} clinical examination reports uploaded by veterinary staff.`
                        : 'Review examination logs, surgeries, and diagnoses filed by clinic doctors.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('medical')}
                  className="px-3 py-1.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
                >
                  View Records ({clinicalRecords.length})
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: VETERINARY MEDICAL RECORDS */}
          {activeTab === 'medical' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-[#237737]" />
                    Veterinary Staff Clinical Examinations
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Official clinical examination reports, surgeries, and diagnoses uploaded by assigned veterinary staff.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400 font-mono">
                  {clinicalRecords.length} {clinicalRecords.length === 1 ? 'Report' : 'Reports'}
                </span>
              </div>

              {loadingRecords && (
                <div className="py-12 text-center text-slate-400 text-xs font-semibold space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#237737]" />
                  <p>Fetching clinical records from veterinary clinic...</p>
                </div>
              )}

              {!loadingRecords && clinicalRecords.length === 0 && (
                <div className="py-12 px-6 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 mx-auto flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800">No Clinical Records Logged Yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-medium">
                      When the attending veterinary doctor conducts an examination, diagnoses a condition, or performs a procedure on {animalName}, their clinical report will automatically show up here for shelter review.
                    </p>
                  </div>
                </div>
              )}

              {!loadingRecords && clinicalRecords.length > 0 && (
                <div className="space-y-4">
                  {clinicalRecords.map((record, index) => {
                    const recordId = record.medicalRecordId || `MED-${index + 1}`;
                    const isSurgery = record.isSurgery || record.type === 'Surgery';
                    const reportDate = record.reportDate
                      ? new Date(record.reportDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Recent';
                    const nextVisit = record.nextVisitDate
                      ? new Date(record.nextVisitDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : null;

                    return (
                      <div
                        key={record._id || recordId}
                        className="p-5 bg-[#F8FAF9] border border-slate-200/80 rounded-2xl space-y-3.5 shadow-xs hover:border-[#237737]/30 transition"
                      >
                        {/* Record Top Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-black text-slate-900 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg">
                              {recordId}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                                isSurgery
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : record.type === 'Treatment'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : record.type === 'Routine Checkup'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {record.type}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                                record.status === 'Critical'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : record.status === 'Ongoing'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              Status: {record.status || 'Ongoing'}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{reportDate}</span>
                          </div>
                        </div>

                        {/* Attending Veterinarian */}
                        <div className="flex items-center justify-between text-xs bg-white p-3 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-[#237737]" />
                            <span className="text-slate-500 font-bold">Attending Vet:</span>
                            <span className="font-black text-slate-900">
                              {record.vetName || 'Assigned Veterinary Doctor'}
                            </span>
                          </div>
                          {nextVisit && (
                            <div className="flex items-center gap-1.5 text-xs text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200/70 font-bold">
                              <Calendar className="w-3.5 h-3.5 text-orange-600" />
                              <span>Next Visit: {nextVisit}</span>
                            </div>
                          )}
                        </div>

                        {/* Vitals Summary (if any logged) */}
                        {record.vitals &&
                          (record.vitals.temperature ||
                            record.vitals.weight ||
                            record.vitals.pulse ||
                            record.vitals.mucosalColor) && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                                  Body Temp
                                </span>
                                <span className="font-black text-slate-800 text-xs mt-0.5 block">
                                  {record.vitals.temperature ? `${record.vitals.temperature}` : '—'}
                                </span>
                              </div>
                              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                                  Weight
                                </span>
                                <span className="font-black text-slate-800 text-xs mt-0.5 block">
                                  {record.vitals.weight ? `${record.vitals.weight}` : '—'}
                                </span>
                              </div>
                              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                                  Pulse Rate
                                </span>
                                <span className="font-black text-slate-800 text-xs mt-0.5 block">
                                  {record.vitals.pulse ? `${record.vitals.pulse}` : '—'}
                                </span>
                              </div>
                              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                                  Mucosa
                                </span>
                                <span className="font-black text-slate-800 text-xs mt-0.5 block">
                                  {record.vitals.mucosalColor ? `${record.vitals.mucosalColor}` : '—'}
                                </span>
                              </div>
                            </div>
                          )}

                        {/* Surgery Details (if surgical procedure) */}
                        {isSurgery && record.surgeryDetails && (
                          <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl text-xs space-y-2">
                            <div className="flex items-center gap-1.5 text-purple-900 font-extrabold text-xs">
                              <Scissors className="w-3.5 h-3.5 text-purple-700" />
                              <span>Surgical Procedure: {record.surgeryDetails.procedureName || 'Surgical Care'}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-purple-950 font-medium">
                              {record.surgeryDetails.anesthesia && (
                                <div>
                                  <span className="text-purple-600 font-bold">Anesthesia:</span>{' '}
                                  {record.surgeryDetails.anesthesia}
                                </div>
                              )}
                              {record.surgeryDetails.surgeon && (
                                <div>
                                  <span className="text-purple-600 font-bold">Operating Surgeon:</span>{' '}
                                  {record.surgeryDetails.surgeon}
                                </div>
                              )}
                            </div>
                            {record.surgeryDetails.postOpCare && (
                              <div className="pt-1 text-[11px] text-purple-900 font-medium border-t border-purple-100">
                                <span className="font-bold text-purple-700">Post-Op Care Instructions:</span>{' '}
                                {record.surgeryDetails.postOpCare}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Clinical Notes / Findings */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Clinical Examination Notes & Findings
                          </span>
                          <div className="p-3.5 bg-white rounded-xl border border-slate-200/70 text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                            {record.report || 'No detailed clinical notes provided.'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VACCINATION HISTORY */}
          {activeTab === 'vaccinations' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Syringe className="w-4 h-4 text-orange-500" />
                    Vaccination Records
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Immunization schedule and administered vaccines for this animal.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400 font-mono">
                  {vaccinations.length} {vaccinations.length === 1 ? 'Entry' : 'Entries'}
                </span>
              </div>

              {loadingRecords && (
                <div className="py-12 text-center text-slate-400 text-xs font-semibold space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-orange-500" />
                  <p>Fetching vaccination logs...</p>
                </div>
              )}

              {!loadingRecords && vaccinations.length === 0 && (
                <div className="py-12 px-6 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 mx-auto flex items-center justify-center">
                    <Syringe className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800">No Vaccinations Logged Yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-medium">
                      Vaccines administered to {animalName} by the veterinary team will appear in this registry.
                    </p>
                  </div>
                </div>
              )}

              {!loadingRecords && vaccinations.length > 0 && (
                <div className="space-y-3">
                  {vaccinations.map((vac, idx) => {
                    const dateGiven = vac.dateGiven
                      ? new Date(vac.dateGiven).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Recent';
                    const nextDue = vac.nextDueDate
                      ? new Date(vac.nextDueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : null;

                    return (
                      <div
                        key={vac._id || idx}
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm">{vac.vaccineName}</span>
                            {vac.batchNumber && (
                              <span className="text-[10px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-500">
                                Batch: {vac.batchNumber}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            ✓ Given: {dateGiven}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium pt-1">
                          <span>Administered by: <strong>{vac.administeredBy || 'Veterinarian'}</strong></span>
                          {nextDue && (
                            <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                              Next Booster: {nextDue}
                            </span>
                          )}
                        </div>

                        {vac.remarks && (
                          <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 mt-1">
                            {vac.remarks}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0 bg-slate-50/70">
          <div className="text-xs text-slate-400 font-semibold">
            {activeTab === 'medical' && `${clinicalRecords.length} clinical record(s) on file`}
            {activeTab === 'vaccinations' && `${vaccinations.length} vaccination record(s) on file`}
            {activeTab === 'profile' && `Status: ${selectedAnimalDetails.healthCondition || 'Healthy'}`}
          </div>
          <button
            onClick={() => setShowAnimalDetailsModal(false)}
            className="px-6 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimalDetailsModal;
