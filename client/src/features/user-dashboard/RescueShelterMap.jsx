import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Truck,
  Building2,
  Search,
  Phone,
  Filter,
  CheckCircle2,
  RefreshCw,
  Navigation,
  Shield,
} from 'lucide-react';
import InteractiveMap from '../../components/common/InteractiveMap';
import { getAllRescueTeamsAndSheltersMap } from '../../services/rescueRequestService';

const RescueShelterMap = ({ showHeader = true }) => {
  const [data, setData] = useState({ rescueTeams: [], shelters: [], markers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'RESCUE_TEAM' | 'SHELTER'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [activeMarker, setActiveMarker] = useState(null);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAllRescueTeamsAndSheltersMap();
      if (res?.success) {
        setData({
          rescueTeams: res.rescueTeams || [],
          shelters: res.shelters || [],
          markers: res.markers || [],
        });
      }
    } catch (err) {
      console.warn('Failed to load map data:', err);
      setError('Unable to load directory map data. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  // Extract unique districts
  const districts = Array.from(
    new Set(
      data.markers
        .map((m) => m.district)
        .filter((d) => d && d.trim().length > 0)
    )
  ).sort();

  // Filter markers
  const filteredMarkers = data.markers.filter((m) => {
    if (filterType !== 'ALL' && m.type !== filterType) return false;
    if (selectedDistrict !== 'ALL' && m.district !== selectedDistrict) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (m.name || '').toLowerCase();
      const addr = (m.address || '').toLowerCase();
      const dist = (m.district || '').toLowerCase();
      if (!name.includes(q) && !addr.includes(q) && !dist.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const teamCount = data.markers.filter((m) => m.type === 'RESCUE_TEAM').length;
  const shelterCount = data.markers.filter((m) => m.type === 'SHELTER').length;

  const defaultCenter =
    filteredMarkers.length > 0
      ? [filteredMarkers[0].latitude, filteredMarkers[0].longitude]
      : [9.9312, 76.2673];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
              <MapPin className="w-7 h-7 text-[#237737]" />
              Rescue Teams & Shelters Directory
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
              Explore all verified rescue teams, rapid response units, and animal shelter facilities across the network.
            </p>
          </div>

          <button
            onClick={fetchMapData}
            disabled={loading}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#237737]' : ''}`} />
            Refresh Directory
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer border flex items-center gap-2 ${
                filterType === 'ALL'
                  ? 'bg-[#237737] text-white border-[#237737] shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>All Facilities</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filterType === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {data.markers.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('RESCUE_TEAM')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer border flex items-center gap-2 ${
                filterType === 'RESCUE_TEAM'
                  ? 'bg-[#237737] text-white border-[#237737] shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Rescue Teams</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filterType === 'RESCUE_TEAM' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {teamCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('SHELTER')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer border flex items-center gap-2 ${
                filterType === 'SHELTER'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Shelters</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filterType === 'SHELTER' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {shelterCount}
              </span>
            </button>
          </div>

          {/* Search Box & District Dropdown */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, address..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#237737]"
              />
            </div>

              {districts.length > 0 && (
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#237737] cursor-pointer"
                >
                  <option value="ALL">All Districts</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={fetchMapData}
                disabled={loading}
                title="Refresh directory data"
                className="p-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-slate-600 transition cursor-pointer shrink-0 shadow-xs flex items-center justify-center"
              >
                <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin text-[#237737]' : ''}`} />
              </button>
            </div>
        </div>
      </div>

      {/* Main Map Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-[#237737]" /> Active Locations
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              Showing {filteredMarkers.length} of {data.markers.length} points
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#237737] inline-block"></span>
              <span>Rescue Squads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span>
              <span>Shelters</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
          <InteractiveMap
            center={defaultCenter}
            zoom={filteredMarkers.length === 1 ? 14 : 11}
            markers={filteredMarkers}
            height="500px"
          />
        </div>
      </div>

      {/* Cards Directory Listing Grid */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center justify-between">
          <span>Facilities Directory ({filteredMarkers.length})</span>
          <span className="text-xs text-slate-400 font-semibold">
            Click any pin on map or view cards below
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMarkers.map((marker) => {
            const isRescueTeam = marker.type === 'RESCUE_TEAM';

            return (
              <div
                key={marker.id}
                className="bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isRescueTeam
                            ? 'bg-[#237737]/10 text-[#237737]'
                            : 'bg-indigo-50 text-indigo-600'
                        }`}
                      >
                        {isRescueTeam ? <Truck className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">{marker.name}</h4>
                        <span
                          className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isRescueTeam
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-indigo-50 text-indigo-800'
                          }`}
                        >
                          {isRescueTeam ? 'Rescue Squad' : 'Shelter Facility'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 font-medium line-clamp-2">
                    {marker.address || 'Address registered on network.'}
                  </p>

                  {/* Extra specs */}
                  {isRescueTeam && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 rounded-xl p-2.5 space-y-1">
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-slate-400">Team Code:</span>
                        <strong className="text-slate-700">{marker.teamNumber || 'RT-ACTIVE'}</strong>
                      </div>
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-slate-400">Vehicle:</span>
                        <span className="font-bold text-[#237737]">{marker.vehicleType || 'Ambulance'}</span>
                      </div>
                    </div>
                  )}

                  {!isRescueTeam && (
                    <div className="text-[11px] text-slate-600 bg-indigo-50/50 rounded-xl p-2.5 space-y-1.5 border border-indigo-100/50">
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-slate-500">Available Cages:</span>
                        <span className="font-black text-indigo-700">
                          {marker.availableCages !== undefined ? marker.availableCages : 'Open'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-slate-500">Total Capacity:</span>
                        <span className="font-bold text-slate-700">{marker.totalCages || 'N/A'}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {marker.phone ? (
                    <a
                      href={`tel:${marker.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call ({marker.phone})
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Emergency hotline ready</span>
                  )}

                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {marker.district || 'Kerala'}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredMarkers.length === 0 && !loading && (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs font-semibold bg-white rounded-2xl border border-slate-100">
              No matching rescue teams or shelters found for this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RescueShelterMap;
