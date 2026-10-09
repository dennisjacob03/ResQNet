import React, { useState, useEffect } from "react";
import {
  Activity,
  Heart,
  Thermometer,
  ShieldAlert,
  BatteryCharging,
  MapPin,
  Radio,
  Tv,
  Play,
  Pause,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Navigation,
  Clock,
  Wifi,
  Sliders,
} from "lucide-react";

const INITIAL_ANIMALS = [
  {
    id: "RQN-COL-8821",
    name: "Bruno",
    species: "Dog (Golden Retriever)",
    age: "3 yrs",
    status: "Normal",
    geofenceStatus: "INSIDE_SAFE_ZONE",
    baseHeartRate: 88,
    baseTemp: 38.6,
    baseBattery: 92,
    respiration: 24,
    activity: "Moderate Activity",
    locationName: "Safe Zone - Sector 4 (Shelter Alpha)",
    lat: 9.9312,
    lng: 76.2673,
    signalStrength: "Strong (4G LTE)",
    satellites: 14,
    solarCharging: true,
  },
  {
    id: "RQN-COL-4410",
    name: "Luna",
    species: "Cat (Domestic Short Hair)",
    age: "1.5 yrs",
    status: "Elevated Temp",
    geofenceStatus: "INSIDE_SAFE_ZONE",
    baseHeartRate: 115,
    baseTemp: 39.8,
    baseBattery: 68,
    respiration: 32,
    activity: "Resting",
    locationName: "Recovery Ward - Ward B",
    lat: 9.9385,
    lng: 76.2612,
    signalStrength: "Optimal (Wi-Fi Mesh)",
    satellites: 12,
    solarCharging: false,
  },
  {
    id: "RQN-COL-9012",
    name: "Max",
    species: "Dog (Indie)",
    age: "4 yrs",
    status: "Distress Alert",
    geofenceStatus: "GEOFENCE_BREACH",
    baseHeartRate: 134,
    baseTemp: 39.2,
    baseBattery: 41,
    respiration: 45,
    activity: "High Speed Running",
    locationName: "OUTSIDE SAFE ZONE - Near Highway 66",
    lat: 9.948,
    lng: 76.281,
    signalStrength: "Moderate (3G Fallback)",
    satellites: 8,
    solarCharging: true,
  },
  {
    id: "RQN-COL-1092",
    name: "Bella",
    species: "Dog (Labrador Mix)",
    age: "6 mos",
    status: "Normal",
    geofenceStatus: "INSIDE_SAFE_ZONE",
    baseHeartRate: 94,
    baseTemp: 38.4,
    baseBattery: 98,
    respiration: 20,
    activity: "Sleeping",
    locationName: "Foster Home Safe Perimeter",
    lat: 9.925,
    lng: 76.255,
    signalStrength: "Strong (4G LTE)",
    satellites: 15,
    solarCharging: true,
  },
];

const SmartCollar = ({ onBackToOverview }) => {
  const [animals, setAnimals] = useState(INITIAL_ANIMALS);
  const [selectedAnimalId, setSelectedAnimalId] = useState(INITIAL_ANIMALS[0].id);
  const [isStreaming, setIsStreaming] = useState(true);
  const [logs, setLogs] = useState([
    {
      id: 1,
      time: new Date().toLocaleTimeString(),
      collarId: "RQN-COL-9012",
      animalName: "Max",
      type: "warning",
      message: "Geofence boundary breach detected! Distance: +140m outside safe perimeter.",
    },
    {
      id: 2,
      time: new Date(Date.now() - 30000).toLocaleTimeString(),
      collarId: "RQN-COL-4410",
      animalName: "Luna",
      type: "info",
      message: "Body temperature alert: 39.8°C (Mild fever threshold). Notification dispatched to vet staff.",
    },
    {
      id: 3,
      time: new Date(Date.now() - 60000).toLocaleTimeString(),
      collarId: "RQN-COL-8821",
      animalName: "Bruno",
      type: "success",
      message: "Solar auxiliary charging activated. Battery level 92%.",
    },
  ]);

  const selectedAnimal = animals.find((a) => a.id === selectedAnimalId) || animals[0];

  // Live telemetry ticker
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setAnimals((prev) =>
        prev.map((animal) => {
          // Add minor realistic jitter
          const hrJitter = Math.floor(Math.random() * 5) - 2;
          const tempJitter = Math.random() * 0.2 - 0.1;
          const newHR = Math.max(50, Math.min(180, animal.baseHeartRate + hrJitter));
          const newTemp = parseFloat(
            Math.max(36.5, Math.min(41.5, animal.baseTemp + tempJitter)).toFixed(1)
          );

          return {
            ...animal,
            baseHeartRate: newHR,
            baseTemp: newTemp,
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Simulate Geofence Breach
  const handleSimulateBreach = () => {
    setAnimals((prev) =>
      prev.map((a) => {
        if (a.id === selectedAnimalId) {
          return {
            ...a,
            status: "Distress Alert",
            geofenceStatus: "GEOFENCE_BREACH",
            baseHeartRate: 142,
            locationName: "ALERT: Perimeter Breach - Sector 9 Perimeter",
          };
        }
        return a;
      })
    );

    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      collarId: selectedAnimal.id,
      animalName: selectedAnimal.name,
      type: "critical",
      message: `MANUAL SIMULATION: Geofence breach triggered for ${selectedAnimal.name} (${selectedAnimal.id}). Emergency squad notified.`,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 14)]);
  };

  // Reset Geofence status
  const handleResetGeofence = () => {
    setAnimals((prev) =>
      prev.map((a) => {
        if (a.id === selectedAnimalId) {
          return {
            ...a,
            status: "Normal",
            geofenceStatus: "INSIDE_SAFE_ZONE",
            baseHeartRate: 88,
            baseTemp: 38.5,
            locationName: "Safe Zone - Sector 4 (Shelter Alpha)",
          };
        }
        return a;
      })
    );

    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      collarId: selectedAnimal.id,
      animalName: selectedAnimal.name,
      type: "success",
      message: `Geofence perimeter reset to Normal for ${selectedAnimal.name}.`,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 14)]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                IoT Live Telemetry Engine Active
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Firmware v2.4.9-LTE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Tv className="w-8 h-8 text-emerald-400" />
              Smart Collar Live Telemetry
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mt-1 leading-relaxed">
              Real-time telemetry stream monitoring satellite GPS coordinates, vital signs, thermal shifts, solar battery charging, and automated geofence perimeters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex-1 lg:flex-none px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                isStreaming
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                  : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              }`}
            >
              {isStreaming ? (
                <>
                  <Pause className="w-4 h-4 fill-current" /> Pause Live Feed
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Resume Live Feed
                </>
              )}
            </button>

            {onBackToOverview && (
              <button
                onClick={onBackToOverview}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Overview
              </button>
            )}
          </div>
        </div>

        {/* Global Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/50">
            <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              Deployed Collars
            </div>
            <div className="text-xl font-black text-white mt-1 flex items-center justify-between">
              4 Active
              <Radio className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/50">
            <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              Geofence Status
            </div>
            <div className="text-xl font-black text-amber-400 mt-1 flex items-center justify-between">
              1 Alert
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/50">
            <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              GPS Lock Signal
            </div>
            <div className="text-xl font-black text-cyan-400 mt-1 flex items-center justify-between">
              99.2%
              <Wifi className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/50">
            <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              Solar Charging
            </div>
            <div className="text-xl font-black text-emerald-400 mt-1 flex items-center justify-between">
              3/4 Units
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Animal Collar Selector Tabs */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-1 mb-2">
          Select Tracked Animal Unit
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {animals.map((animal) => {
            const isSelected = animal.id === selectedAnimalId;
            const isBreached = animal.geofenceStatus === "GEOFENCE_BREACH";

            return (
              <button
                key={animal.id}
                onClick={() => setSelectedAnimalId(animal.id)}
                className={`p-4 rounded-xl text-left transition-all cursor-pointer relative overflow-hidden border ${
                  isSelected
                    ? isBreached
                      ? "bg-rose-50 border-rose-300 ring-2 ring-rose-500/20"
                      : "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20"
                    : "bg-slate-50/50 border-slate-200/70 hover:bg-slate-100/80"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-base font-black text-slate-900">
                      {animal.name}
                    </div>
                    <div className="text-xs font-medium text-slate-500 truncate">
                      {animal.species}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isBreached
                        ? "bg-rose-100 text-rose-700 animate-pulse"
                        : animal.status === "Elevated Temp"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {animal.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/50">
                  <span className="font-mono text-[11px] font-semibold text-slate-600">
                    {animal.id}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-slate-700">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                    {animal.baseBattery}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Telemetry Focus Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Vitals & Geofence Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vitals Overview Panel */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900">
                    Telemetry Stream: {selectedAnimal.name}
                  </h2>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-xs font-bold rounded-lg">
                    {selectedAnimal.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedAnimal.species} • Age: {selectedAnimal.age} • Device Signal: {selectedAnimal.signalStrength}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedAnimal.geofenceStatus === "GEOFENCE_BREACH" ? (
                  <button
                    onClick={handleResetGeofence}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset Safe Status
                  </button>
                ) : (
                  <button
                    onClick={handleSimulateBreach}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" /> Simulate Breach
                  </button>
                )}
              </div>
            </div>

            {/* Vital Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Heart Rate Card */}
              <div className="bg-gradient-to-br from-rose-50/50 to-pink-50/50 border border-rose-100 rounded-2xl p-4 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-600 fill-rose-500 animate-pulse" />
                    Heart Rate
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full">
                    Normal
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 font-mono">
                    {selectedAnimal.baseHeartRate}
                  </span>
                  <span className="text-xs font-bold text-slate-500">BPM</span>
                </div>

                {/* Simulated Waveform Pulse Line */}
                <div className="mt-3 h-8 w-full">
                  <svg className="w-full h-full text-rose-500 stroke-current fill-none stroke-2">
                    <path d="M 0 15 Q 15 15, 30 15 T 45 5 T 55 25 T 65 15 T 90 15 T 105 15 T 120 5 T 130 25 T 140 15 T 200 15" />
                  </svg>
                </div>
              </div>

              {/* Temperature Card */}
              <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 border border-amber-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-amber-600" />
                    Body Temp
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedAnimal.baseTemp > 39.5
                        ? "bg-rose-100 text-rose-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {selectedAnimal.baseTemp > 39.5 ? "Elevated" : "Optimal"}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 font-mono">
                    {selectedAnimal.baseTemp}
                  </span>
                  <span className="text-xs font-bold text-slate-500">°C</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Normal Range: 38.0°C - 39.2°C
                </p>
              </div>

              {/* Respiration & Activity */}
              <div className="bg-gradient-to-br from-cyan-50/50 to-blue-50/50 border border-cyan-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-cyan-600" />
                    Respiration
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded-full">
                    {selectedAnimal.activity}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 font-mono">
                    {selectedAnimal.respiration}
                  </span>
                  <span className="text-xs font-bold text-slate-500">br/min</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Activity Mode: {selectedAnimal.activity}
                </p>
              </div>
            </div>

            {/* Geofence Safe Zone Map Box */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#237737]" />
                  Geofence Safe Zone Boundary & Location
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    selectedAnimal.geofenceStatus === "GEOFENCE_BREACH"
                      ? "bg-rose-100 text-rose-700 border border-rose-300 animate-pulse"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  }`}
                >
                  {selectedAnimal.geofenceStatus === "GEOFENCE_BREACH" ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" /> GEOFENCE BREACH ALERT
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> INSIDE SAFE ZONE
                    </>
                  )}
                </span>
              </div>

              <div className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden border border-slate-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                      GPS Satellite Fix Coordinates
                    </div>
                    <div className="text-lg font-mono font-bold text-white">
                      Lat: {selectedAnimal.lat}° N, Lng: {selectedAnimal.lng}° E
                    </div>
                    <div className="text-xs text-emerald-400 font-medium flex items-center gap-1 pt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedAnimal.locationName}
                    </div>
                  </div>

                  <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 space-y-1 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-400">Locked Satellites:</span>{" "}
                      <span className="font-bold text-white">{selectedAnimal.satellites} GPS Satellites</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Safe Radius:</span>{" "}
                      <span className="font-bold text-emerald-400">500 meters</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Geofence Graphic */}
                <div className="mt-4 p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                      <Radio className="w-5 h-5 text-emerald-400 animate-ping" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        Safe Zone Perimeter Anchor #4
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Shelter Alpha Geo-fence Boundary (500m)
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-300">
                      Telemetry Interval
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">2000 ms</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Hardware Status & Real-time Logs */}
        <div className="space-y-6">
          {/* Hardware Diagnostics */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#237737]" />
              Collar Hardware Status
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-600 font-medium flex items-center gap-2">
                  <BatteryCharging className="w-4 h-4 text-emerald-600" />
                  Battery Level
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {selectedAnimal.baseBattery}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-600 font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Solar Auxiliary Charger
                </span>
                <span className={`font-bold ${selectedAnimal.solarCharging ? "text-emerald-600" : "text-slate-400"}`}>
                  {selectedAnimal.solarCharging ? "Active (+12mA)" : "Inactive (Night)"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-600 font-medium flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-cyan-600" />
                  Cellular / Mesh Signal
                </span>
                <span className="font-bold text-slate-900">
                  {selectedAnimal.signalStrength}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Telemetry Log Feed */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-700" />
                Live Telemetry Log
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                Real-Time
              </span>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border text-xs space-y-1 transition ${
                    log.type === "critical"
                      ? "bg-rose-50 border-rose-200 text-rose-900"
                      : log.type === "warning"
                      ? "bg-amber-50 border-amber-200 text-amber-900"
                      : "bg-slate-50 border-slate-200/70 text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-500">
                        [{log.time}]
                      </span>
                      {log.animalName}
                    </span>
                    <span className="font-mono text-[10px] opacity-75">
                      {log.collarId}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {log.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartCollar;
