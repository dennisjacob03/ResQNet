import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  RefreshCw,
  Truck,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import InteractiveMap from '../../components/common/InteractiveMap';
import { getRescueRequestById } from '../../services/rescueRequestService';

const STAGES = [
  { key: 'Broadcasted', label: 'Dispatched', desc: 'Dispatched to nearby rescue teams' },
  { key: 'Accepted', label: 'Nearest Team Assigned', desc: 'Nearest unit verified & dispatched' },
  { key: 'En Route', label: 'En Route', desc: 'Responders moving to scene' },
  { key: 'Arrived on Scene', label: 'On Scene', desc: 'Responders securing animal' },
  { key: 'Animal Rescued', label: 'Animal Rescued', desc: 'Animal secured in vehicle' },
  { key: 'Transporting to Shelter', label: 'To Shelter', desc: 'Routing to nearby open shelter' },
  { key: 'Delivered to Shelter', label: 'Safe & Admitted', desc: 'Delivered to shelter care' },
];

const getStageIndex = (stage) => {
  const idx = STAGES.findIndex((s) => s.key === stage);
  if (idx !== -1) return idx;
  if (stage === 'Completed') return STAGES.length - 1;
  return 0;
};

const LiveRescueTrackingModal = ({ isOpen, onClose, rescueRequestId }) => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetails = async () => {
    if (!rescueRequestId) return;
    try {
      setLoading(true);
      setError('');
      const res = await getRescueRequestById(rescueRequestId);
      if (res?.request) {
        setRequest(res.request);
      }
    } catch (err) {
      console.warn('Failed to load rescue request tracking:', err);
      setError('Failed to fetch real-time rescue status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && rescueRequestId) {
      fetchDetails();
      const interval = setInterval(fetchDetails, 12000); // 12-second live refresh
      return () => clearInterval(interval);
    }
  }, [isOpen, rescueRequestId]);

  if (!isOpen) return null;

  const currentStageIndex = getStageIndex(request?.rescueStage || 'Broadcasted');
  const isCompleted = request?.status === 'Completed' || request?.rescueStage === 'Delivered to Shelter';

  // Map Data
  const incidentLoc = request?.latitude && request?.longitude ? {
    latitude: request.latitude,
    longitude: request.longitude,
    title: `${request.animalCondition} ${request.animalType}`,
    address: request.locationAddress,
  } : null;

  const assignedLoc = request?.assignedRescueTeamLocation?.latitude ? {
    latitude: request.assignedRescueTeamLocation.latitude,
    longitude: request.assignedRescueTeamLocation.longitude,
    title: request.assignedRescueTeamName || 'Assigned Unit',
    vehicle: request.assignedRescueTeamVehicle,
  } : null;

  const shelterLoc = request?.destinationShelterLocation?.latitude ? {
    latitude: request.destinationShelterLocation.latitude,
    longitude: request.destinationShelterLocation.longitude,
    title: request.destinationShelterName || 'Shelter Facility',
  } : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full border border-slate-100 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-extrabold text-slate-900">Live Rescue Operation Tracking</h3>
                <span className="font-mono text-xs font-black bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg">
                  {request?.rescueRequestId || rescueRequestId}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                    isCompleted
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : request?.status === 'In Transit' || request?.rescueStage === 'En Route'
                      ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {request?.rescueStage || 'Broadcasting'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-0.5 flex items-center gap-1.5">
                <span>{request?.animalCondition || 'Injured'} {request?.animalType || 'Animal'}</span>
                <span>•</span>
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-xs">{request?.locationAddress || 'Incident Area'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDetails}
              disabled={loading}
              title="Refresh live status"
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#237737]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
              {error}
            </div>
          )}

          {/* 6-Stage Visual Stepper */}
          <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 sm:p-5">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">
              Operation Status Progression
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {STAGES.map((s, index) => {
                const isPassed = index <= currentStageIndex;
                const isCurrent = index === currentStageIndex;

                return (
                  <div
                    key={s.key}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isCurrent
                        ? 'bg-[#237737] text-white border-[#237737] shadow-sm shadow-[#237737]/20 scale-[1.02]'
                        : isPassed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-white text-slate-400 border-slate-200/80 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      {isPassed && !isCurrent ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className={`text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ${
                          isCurrent ? 'bg-white text-[#237737]' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-extrabold block leading-tight">{s.label}</span>
                    <span className={`text-[9px] block mt-0.5 line-clamp-2 ${isCurrent ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {s.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned Rescue Team & Shelter Highlights Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Assigned Rescue Team Card */}
            <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#237737]" /> Responding Unit
                </span>
                {request?.assignedRescueTeamNumber && (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-black rounded-md border border-emerald-200">
                    Nearest Unit Selected
                  </span>
                )}
              </div>

              {request?.assignedRescueTeamName ? (
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{request.assignedRescueTeamName}</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Vehicle: {request.assignedRescueTeamVehicle || 'Rescue Ambulance'} • Call: {request.assignedRescueTeamNumber}
                  </p>
                  {request.assignedRescueTeamPhone && (
                    <a
                      href={`tel:${request.assignedRescueTeamPhone}`}
                      className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 bg-[#237737] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#1d632e] transition"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Responders ({request.assignedRescueTeamPhone})
                    </a>
                  )}
                </div>
              ) : (
                <div className="py-2 text-xs text-slate-400 font-medium">
                  Broadcasting to candidate rescue teams... Nearest accepting unit will appear here automatically.
                </div>
              )}
            </div>

            {/* Destination Shelter Card */}
            <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Destination Shelter
                </span>
                {request?.shelterNotified && (
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-800 text-[10px] font-black rounded-md border border-indigo-200">
                    Shelter Notified
                  </span>
                )}
              </div>

              {request?.destinationShelterName ? (
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{request.destinationShelterName}</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Status: <strong className="text-indigo-700">{request.shelterIntakeStatus || 'Notified'}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">
                    The rescue squad has reserved pen capacity at this facility and will transfer the animal upon scene clearance.
                  </p>
                </div>
              ) : (
                <div className="py-2 text-xs text-slate-400 font-medium">
                  Destination shelter will be selected by the rescue team based on proximity and cage capacity once the animal is secured.
                </div>
              )}
            </div>
          </div>

          {/* Interactive Live Map */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#237737]" /> Live Operation Route & Pins
              </h4>
              <span className="text-[11px] text-slate-400 font-semibold">
                Dashed line traces emergency dispatch path
              </span>
            </div>

            <InteractiveMap
              center={
                assignedLoc
                  ? [assignedLoc.latitude, assignedLoc.longitude]
                  : incidentLoc
                  ? [incidentLoc.latitude, incidentLoc.longitude]
                  : [9.9312, 76.2673]
              }
              zoom={13}
              incidentLocation={incidentLoc}
              assignedTeamLocation={assignedLoc}
              destinationShelterLocation={shelterLoc}
              showRoutePolyline={true}
              height="340px"
            />
          </div>

          {/* Operation Timeline Logs */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" /> Real-time Activity Log
            </h4>
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3 max-h-48 overflow-y-auto">
              {(request?.trackingTimeline || []).map((t, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#237737] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900">{t.stage}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{t.note}</p>
                  </div>
                </div>
              ))}

              {(!request?.trackingTimeline || request.trackingTimeline.length === 0) && (
                <div className="text-center py-3 text-xs text-slate-400 font-medium">
                  Awaiting initial field responder check-in...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
          <span className="text-xs text-slate-400 font-semibold">
            Status auto-refreshes every 12 seconds
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
          >
            Close Tracking
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveRescueTrackingModal;
