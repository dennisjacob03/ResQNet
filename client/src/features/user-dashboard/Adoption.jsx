import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Building2,
  Heart,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Home,
  RefreshCw,
  AlertTriangle,
  Calendar,
  MapPin,
} from 'lucide-react';
import {
  getMyAdoptionApplications,
  withdrawAdoptionApplication,
} from '../../services/adoptionService';
import { checkProfileCompletion } from '../../utils/profileUtils';

const Adoption = ({
  searchTerm,
  setSearchTerm,
  petCategory,
  setPetCategory,
  filteredPets = [],
  navigate,
  user,
  onRequireProfile,
  onNavigateToProfile,
}) => {
  const [activeSubTab, setActiveSubTab] = useState('browse'); // 'browse' | 'my-applications'
  const [myApplications, setMyApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appsError, setAppsError] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);

  const loadMyApplications = async () => {
    try {
      setLoadingApps(true);
      setAppsError(null);
      const res = await getMyAdoptionApplications();
      if (res.success) {
        setMyApplications(res.applications || []);
      }
    } catch (err) {
      console.error('loadMyApplications error:', err);
      setAppsError(err.response?.data?.message || 'Failed to load your applications');
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'my-applications') {
      loadMyApplications();
    }
  }, [activeSubTab]);

  const handleWithdraw = async (appId) => {
    if (user) {
      const profileStatus = checkProfileCompletion(user);
      if (!profileStatus.isComplete) {
        if (onRequireProfile) {
          onRequireProfile('Withdraw Adoption Application');
        }
        return;
      }
    }

    if (!window.confirm('Are you sure you want to withdraw this adoption application?')) {
      return;
    }
    try {
      setWithdrawingId(appId);
      const res = await withdrawAdoptionApplication(appId);
      if (res.success) {
        setMyApplications((prev) =>
          prev.map((a) =>
            a._id === appId ? { ...a, application_status: 'Withdrawn' } : a
          )
        );
      } else {
        alert(res.message || 'Failed to withdraw application');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Withdrawal failed');
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-100 text-[#237737] border-emerald-200';
      case 'Shelter Visit':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Withdrawn':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            {activeSubTab === 'browse' ? 'Find Your Perfect Companion' : 'My Adoption Applications'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
            {activeSubTab === 'browse'
              ? 'Browse available pets from partner shelters across the city.'
              : 'Track status and review details of your submitted adoption requests.'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl self-start sm:self-auto border border-slate-200/60">
          <button
            onClick={() => setActiveSubTab('browse')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'browse'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> Browse Pets
          </button>
          <button
            onClick={() => setActiveSubTab('my-applications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'my-applications'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> My Applications
            {myApplications.length > 0 && (
              <span className="px-1.5 py-0.2 bg-[#237737] text-white text-[10px] rounded-full font-black">
                {myApplications.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* VIEW 1: BROWSE AVAILABLE PETS */}
      {activeSubTab === 'browse' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or breed"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#237737] text-sm font-semibold transition"
                />
                <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
              </div>

              {['All Pets', 'Dogs', 'Cats'].map((cat) => {
                const isSelected = petCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setPetCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#237737] text-white border-[#237737] shadow-sm shadow-[#237737]/15'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat === 'Dogs' && '🐶'}
                    {cat === 'Cats' && '🐱'}
                    {cat}
                  </button>
                );
              })}

              <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                <SlidersHorizontal className="w-4 h-4 text-slate-400" /> More Filters
              </button>
            </div>

            <div className="text-xs text-slate-400 font-extrabold self-end md:self-center">
              {filteredPets.length} pets available
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPets.map((pet) => (
              <div
                key={pet._id || pet.id}
                className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                <div className="relative h-56 bg-slate-100 overflow-hidden group">
                  {pet.photo ? (
                    <img
                      src={pet.photo.startsWith('/uploads') ? `http://localhost:5000${pet.photo}` : pet.photo}
                      alt={pet.name || 'Rescue Animal'}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-emerald-800 text-5xl font-black select-none">
                      {(pet.name || 'A')[0].toUpperCase()}
                    </div>
                  )}

                  <div className="absolute top-4 right-4 flex gap-1.5">
                    {(pet.healthCondition === 'Healthy' || pet.status === 'Healthy' || pet.vaccinated) && (
                      <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg shadow-sm">
                        Healthy
                      </span>
                    )}
                    {pet.neutered && (
                      <span className="px-2.5 py-1 bg-blue-500 text-white text-[10px] font-black rounded-lg shadow-sm">
                        Neutered
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-slate-900">{pet.name || 'Unnamed Rescue'}</h3>
                      <span className="text-xs font-bold text-slate-400">{pet.animalId || pet._id?.slice(-6)}</span>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      {pet.species || pet.category || 'Rescue'} • {pet.breed || 'Mixed'} • {pet.approxAge || pet.age || '1y'} • {pet.gender || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-500 mt-3 leading-relaxed font-semibold line-clamp-2">
                      {pet.about || pet.desc || 'Looking for a loving and permanent home.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs font-extrabold text-slate-600">
                    <span className="flex items-center gap-1 truncate max-w-[140px]" title={pet.shelterId?.shelterName || pet.shelter || 'ResQNet Shelter'}>
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0" /> {pet.shelterId?.shelterName || pet.shelter || 'ResQNet Shelter'}
                    </span>
                    <button
                      onClick={() => navigate(`/adoption/${pet._id || pet.animalId}`)}
                      className="px-3.5 py-1.5 bg-[#237737]/10 hover:bg-[#237737] text-[#237737] hover:text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      View Details &gt;
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPets.length === 0 && (
            <div className="py-20 text-center space-y-2">
              <p className="text-lg font-bold text-slate-700">No companions found</p>
              <p className="text-sm text-slate-400 max-w-xs mx-auto font-medium">
                Try checking your spelling or selecting a different category.
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: MY ADOPTION APPLICATIONS */}
      {activeSubTab === 'my-applications' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              {myApplications.length} Applications Registered
            </span>
            <button
              onClick={loadMyApplications}
              className="text-xs font-bold text-[#237737] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingApps ? 'animate-spin' : ''}`} /> Refresh Status
            </button>
          </div>

          {loadingApps ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-100">
              <div className="w-10 h-10 border-3 border-[#237737] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">Loading your applications...</p>
            </div>
          ) : appsError ? (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
              <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
              <p className="text-xs font-bold text-rose-800">{appsError}</p>
              <button
                onClick={loadMyApplications}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : myApplications.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-3 shadow-xs">
              <div className="w-16 h-16 bg-emerald-50 text-[#237737] rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-900">No Applications Submitted Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                When you apply to adopt a companion, your application progress, shelter remarks, and handover status will appear here.
              </p>
              <button
                onClick={() => setActiveSubTab('browse')}
                className="mt-2 px-5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm inline-flex items-center gap-2"
              >
                <Heart className="w-4 h-4" /> Browse Available Companions
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myApplications.map((app) => {
                const pet = app.pet_id || {};
                const canWithdraw = ['Pending', 'Under Review'].includes(app.application_status);

                return (
                  <div
                    key={app._id}
                    className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                        {pet.facePhoto || pet.photo ? (
                          <img
                            src={
                              (pet.facePhoto || pet.photo).startsWith('/uploads')
                                ? `http://localhost:5000${pet.facePhoto || pet.photo}`
                                : pet.facePhoto || pet.photo
                            }
                            alt={pet.name || 'Pet'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-[#237737] font-black text-xl">
                            {(pet.name || 'P')[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-slate-900">{pet.name || 'Pet'}</h3>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-extrabold">
                            {app.adoptionId || 'ADO-APP'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                          {pet.species} • {pet.breed || 'Rescue'} • Shelter: {pet.shelterName || 'Partner Shelter'}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 font-medium mt-1.5">
                          <span>Applied: {new Date(app.submitted_at || app.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Living: {app.housing_type} ({app.ownership_status})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border inline-block ${getStatusBadge(
                            app.application_status
                          )}`}
                        >
                          {app.application_status}
                        </span>
                        {app.remarks && (
                          <p className="text-[11px] text-slate-500 italic mt-1 max-w-xs">
                            "{app.remarks}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/adoption/${pet._id || pet.animalId}`)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          View Pet
                        </button>
                        {canWithdraw && (
                          <button
                            disabled={withdrawingId === app._id}
                            onClick={() => handleWithdraw(app._id)}
                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            {withdrawingId === app._id ? 'Cancelling...' : 'Withdraw'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Scheduled Shelter Visit Banner */}
                    {app.appointment && app.appointment.status === 'Scheduled' && (
                      <div className="w-full mt-3 p-3.5 bg-indigo-50/90 border border-indigo-200 rounded-xl flex items-start gap-3 text-xs">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-sm">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-indigo-950 flex flex-wrap items-center gap-2">
                            <span>Shelter Visit Scheduled</span>
                            <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">
                              {new Date(app.appointment.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}{' '}
                              at {app.appointment.time}
                            </span>
                          </div>
                          <div className="text-[11px] text-indigo-800 font-semibold flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-indigo-600 shrink-0" />
                            <span>Location: {app.appointment.location}</span>
                          </div>
                          {app.appointment.notes && (
                            <p className="text-[11px] text-slate-600 mt-1 italic">
                              Shelter Notes: "{app.appointment.notes}"
                            </p>
                          )}
                        </div>
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
  );
};

export default Adoption;
