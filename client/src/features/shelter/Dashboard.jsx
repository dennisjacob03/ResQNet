import React from 'react';
import {
  Building2,
  Dog,
  Layers,
  AlertTriangle,
  Plus,
  Wrench,
  Sparkles,
  Lock,
  Unlock,
  ChevronRight,
  Eye,
  RefreshCw,
  Truck,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

const Dashboard = ({
  shelterData,
  user,
  setupReadiness,
  statusUpdating,
  handleStatusChange,
  capacities = [],
  cages = [],
  displayAnimals = [],
  incomingIntakes = [],
  onTrackIncomingTeam,
  onConfirmAdmission,
  loadAllShelterData,
  setActiveTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Title section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              {shelterData?.shelterName || user?.fullName || 'Shelter Facility'}
            </h1>
            {shelterData?.shelterNumber && (
              <span className="px-2.5 py-0.5 bg-[#237737]/10 text-[#237737] border border-[#237737]/30 text-xs font-black rounded-lg">
                {shelterData.shelterNumber}
              </span>
            )}

            {/* Operational Status Dropdown with Lock/Unlock indicator */}
            <div className="relative inline-flex items-center gap-1.5">
              <div className="relative inline-flex items-center">
                <select
                  value={shelterData?.shelterStatus || shelterData?.currentStatus || 'UNDER_MAINTENANCE'}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={statusUpdating}
                  className={`text-xs font-black rounded-xl pl-8 pr-8 py-1.5 border appearance-none cursor-pointer focus:outline-none transition-all shadow-xs ${
                    (shelterData?.shelterStatus || shelterData?.currentStatus || 'UNDER_MAINTENANCE') === 'OPEN'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:border-emerald-500'
                      : (shelterData?.shelterStatus || shelterData?.currentStatus || 'UNDER_MAINTENANCE') === 'FULL'
                      ? 'bg-rose-50 text-rose-700 border-rose-200 focus:border-rose-500'
                      : (shelterData?.shelterStatus || shelterData?.currentStatus || 'UNDER_MAINTENANCE') === 'UNDER_MAINTENANCE'
                      ? 'bg-amber-50 text-amber-800 border-amber-300 focus:border-amber-500'
                      : 'bg-slate-100 text-slate-700 border-slate-300 focus:border-slate-500'
                  }`}
                  title={
                    setupReadiness && !setupReadiness.isReady
                      ? 'Facility setup incomplete: Fill capacity, cages, and animals to unlock'
                      : 'Change facility operational intake status'
                  }
                >
                  <option value="UNDER_MAINTENANCE">
                    🛠️ Under Maintenance {setupReadiness && !setupReadiness.isReady ? '(Setup Required)' : ''}
                  </option>
                  <option value="OPEN" disabled={setupReadiness && !setupReadiness.isReady}>
                    🟢 Open for Rescue {setupReadiness && !setupReadiness.isReady ? '🔒 (Locked)' : ''}
                  </option>
                  <option value="FULL" disabled={setupReadiness && !setupReadiness.isReady}>
                    🔴 Capacity Full {setupReadiness && !setupReadiness.isReady ? '🔒 (Locked)' : ''}
                  </option>
                  <option value="CLOSED" disabled={setupReadiness && !setupReadiness.isReady}>
                    ⚪ Temporarily Closed {setupReadiness && !setupReadiness.isReady ? '🔒 (Locked)' : ''}
                  </option>
                </select>

                {/* Lock / Unlock Icon Badge inside select */}
                <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2">
                  {setupReadiness && !setupReadiness.isReady ? (
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>

                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">
                  ▼
                </div>
              </div>
            </div>
          </div>

          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium flex items-center gap-2">
            <span>
              {shelterData?.latitude && shelterData?.longitude
                ? `GPS: ${shelterData.latitude.toFixed(4)}, ${shelterData.longitude.toFixed(4)}`
                : 'Facility Management'}
            </span>
            <span>•</span>
            <span>Updated just now</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('Manage Cages')}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Layers className="w-4 h-4 text-emerald-600" /> Manage Cages & Capacity
          </button>
          <button
            onClick={() => setActiveTab('Manage Animals')}
            className="px-4 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow shadow-[#237737]/10 animate-hover"
          >
            <Plus className="w-4 h-4" /> Add Animal
          </button>
        </div>
      </div>

      {/* ── Incoming Rescue Intakes Panel ── */}
      {incomingIntakes.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50/90 to-blue-50/80 border border-indigo-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <span>Incoming Rescue Intakes</span>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-black rounded-full">
                    {incomingIntakes.length} Active
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Field squads en route with rescued animals for shelter admission and pen allocation.
                </p>
              </div>
            </div>
            <button
              onClick={loadAllShelterData}
              title="Refresh intake queue"
              className="p-2 hover:bg-white text-slate-500 hover:text-slate-900 rounded-xl transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingIntakes.map((intake) => {
              const reqId = intake._id || intake.id || intake.rescueRequestId;
              const isAdmitted = intake.shelterIntakeStatus === 'Admitted';

              return (
                <div
                  key={reqId}
                  className="bg-white border border-indigo-100 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {intake.rescueRequestId || (reqId ? reqId.slice(-6) : '')}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 mt-1">
                          {intake.animalCondition} {intake.animalType}
                        </h4>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          isAdmitted
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                        }`}
                      >
                        {intake.shelterIntakeStatus || 'En Route'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 rounded-xl p-2.5 space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-slate-400">Rescue Squad:</span>
                        <span className="text-slate-800">{intake.assignedRescueTeamName || 'Assigned Squad'}</span>
                      </div>
                      {intake.assignedRescueTeamPhone && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Contact:</span>
                          <a href={`tel:${intake.assignedRescueTeamPhone}`} className="text-[#237737] font-bold hover:underline">
                            {intake.assignedRescueTeamPhone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Operation Stage:</span>
                        <strong className="text-indigo-700">{intake.rescueStage}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onTrackIncomingTeam && onTrackIncomingTeam(reqId)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#237737]" />
                      Track Squad Map
                    </button>

                    {!isAdmitted && (
                      <button
                        type="button"
                        onClick={() => onConfirmAdmission && onConfirmAdmission(reqId)}
                        className="px-3.5 py-1.5 bg-[#237737] hover:bg-[#1d632e] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirm Admission
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Facility Setup & Operational Readiness Checklist Card */}
      {((shelterData?.shelterStatus || shelterData?.currentStatus || 'UNDER_MAINTENANCE') === 'UNDER_MAINTENANCE' ||
        (setupReadiness && !setupReadiness.isReady)) && (
        <div className="bg-white border-2 border-amber-200/80 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-slate-900">
                    Facility Setup & Readiness Checklist
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-black rounded-lg border ${
                      setupReadiness?.isReady
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {setupReadiness?.isReady ? 'READY TO OPEN' : 'SETUP REQUIRED'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Complete all 3 requirements below to unlock and switch your facility status from{' '}
                  <strong>Under Maintenance</strong> to <strong>Open for Rescue</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={loadAllShelterData}
              title="Refresh setup status"
              className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl transition cursor-pointer self-start sm:self-center"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* 3 Requirements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Requirement 1: Category Capacity */}
            <div
              className={`p-4 rounded-2xl border transition ${
                setupReadiness?.hasCapacity
                  ? 'bg-emerald-50/50 border-emerald-200/80'
                  : 'bg-amber-50/40 border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  1. Category Capacity
                </span>
                {setupReadiness?.hasCapacity ? (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded-md text-[10px]">
                    ✓ Configured
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-black rounded-md text-[10px]">
                    ⚠️ Missing
                  </span>
                )}
              </div>
              <p className="text-slate-500 font-medium text-[11px] min-h-[32px]">
                {capacities.length > 0
                  ? `${capacities.length} category capacities configured (${capacities.reduce(
                      (a, c) => a + (c.totalCapacity || 0),
                      0
                    )} total spots)`
                  : 'Set cage capacity for animal categories (Dog, Cat, etc.)'}
              </p>
              <button
                onClick={() => setActiveTab('Manage Cages')}
                className={`mt-3 w-full py-2 rounded-xl font-bold text-xs transition cursor-pointer border ${
                  setupReadiness?.hasCapacity
                    ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    : 'bg-amber-600 hover:bg-amber-700 text-white border-transparent'
                }`}
              >
                {setupReadiness?.hasCapacity ? 'Go to Cages & Capacity' : '→ Configure in Cages'}
              </button>
            </div>

            {/* Requirement 2: Cages */}
            <div
              className={`p-4 rounded-2xl border transition ${
                setupReadiness?.hasCages
                  ? 'bg-emerald-50/50 border-emerald-200/80'
                  : 'bg-amber-50/40 border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  2. Cage Details
                </span>
                {setupReadiness?.hasCages ? (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded-md text-[10px]">
                    ✓ Configured
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-black rounded-md text-[10px]">
                    ⚠️ Missing
                  </span>
                )}
              </div>
              <p className="text-slate-500 font-medium text-[11px] min-h-[32px]">
                {cages.length > 0
                  ? `${cages.length} individual cages configured in facility`
                  : 'Add cage numbers and wing types (Normal, Quarantine, etc.)'}
              </p>
              <button
                onClick={() => setActiveTab('Manage Cages')}
                className={`mt-3 w-full py-2 rounded-xl font-bold text-xs transition cursor-pointer border ${
                  setupReadiness?.hasCages
                    ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    : 'bg-blue-600 hover:bg-blue-700 text-white border-transparent'
                }`}
              >
                {setupReadiness?.hasCages ? 'Go to Manage Cages' : '→ Setup in Manage Cages'}
              </button>
            </div>

            {/* Requirement 3: Animals */}
            <div
              className={`p-4 rounded-2xl border transition ${
                setupReadiness?.hasAnimals
                  ? 'bg-emerald-50/50 border-emerald-200/80'
                  : 'bg-amber-50/40 border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Dog className="w-4 h-4 text-emerald-600" />
                  3. Animal Registry
                </span>
                {setupReadiness?.hasAnimals ? (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded-md text-[10px]">
                    ✓ Configured
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-black rounded-md text-[10px]">
                    ⚠️ Missing
                  </span>
                )}
              </div>
              <p className="text-slate-500 font-medium text-[11px] min-h-[32px]">
                {displayAnimals.length > 0
                  ? `${displayAnimals.length} animals registered in facility`
                  : 'Add rescued animal details and cage allocations'}
              </p>
              <button
                onClick={() => setActiveTab('Manage Animals')}
                className={`mt-3 w-full py-2 rounded-xl font-bold text-xs transition cursor-pointer border ${
                  setupReadiness?.hasAnimals
                    ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    : 'bg-[#237737] hover:bg-[#1d632e] text-white border-transparent'
                }`}
              >
                {setupReadiness?.hasAnimals ? 'Go to Manage Animals' : '→ Register in Animals'}
              </button>
            </div>
          </div>

          {/* Readiness Status Footer */}
          {setupReadiness?.isReady && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-900 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Great job! All facility requirements are satisfied. You can now use the status dropdown in the header to switch to <strong>Open for Rescue</strong>.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Animals */}
        <div
          onClick={() => setActiveTab('Manage Animals')}
          className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-emerald-200"
        >
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl flex-shrink-0">
            <Dog className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Animals</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{displayAnimals.length}</div>
          </div>
        </div>

        {/* Total Cages */}
        <div
          onClick={() => setActiveTab('Manage Cages')}
          className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-blue-200"
        >
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl flex-shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Cages</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{cages.length}</div>
          </div>
        </div>

        {/* Total Capacity */}
        <div
          onClick={() => setActiveTab('Manage Cages')}
          className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-orange-200"
        >
          <div className="p-3 bg-orange-500/10 text-orange-600 rounded-xl flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Capacity</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {capacities.reduce((acc, c) => acc + (c.totalCapacity || 0), 0) || shelterData?.totalCages || 0}
            </div>
          </div>
        </div>

        {/* Critical Cases */}
        <div className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Critical Cases</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {displayAnimals.filter((a) => a.healthCondition === 'Critical' || a.status === 'Critical').length}
            </div>
          </div>
        </div>
      </div>

      {/* Wing Capacity Overview Section */}
      <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">Wing Capacity Overview</h3>
            <p className="text-xs text-slate-400 font-medium">Category-wise occupancy and capacity thresholds</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('Manage Cages')}
              className="px-3 py-1.5 bg-[#237737]/10 text-[#237737] hover:bg-[#237737]/20 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" /> Manage Cages & Capacity <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {capacities.length > 0 ? (
            capacities.map((cap) => {
              const total = cap.totalCapacity || 1;
              const occupied = cap.occupiedCapacity || 0;
              const pct = Math.min(100, Math.round((occupied / total) * 100));
              const isHigh = pct >= 80;

              return (
                <div key={cap._id || cap.capacityId} className="space-y-1.5">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-800">{cap.categoryId?.categoryName || 'General'} Wing</span>
                    <span className="text-slate-400">
                      {occupied}/{total} occupied{' '}
                      <span className={`${isHigh ? 'text-orange-500/90' : 'text-emerald-600'} font-extrabold ml-1.5`}>
                        • {pct}%
                      </span>
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full w-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isHigh ? 'bg-orange-500' : 'bg-[#237737]'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs font-semibold">
              No category capacities configured yet. Click "+ Configure Capacity" above to set wing limits.
            </div>
          )}
        </div>
      </div>

      {/* Animal Registry Table Card */}
      <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">Recent Animal Registry</h3>
            <p className="text-xs text-slate-400 font-medium">Quick overview of sheltered animals</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('Manage Animals')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
            >
              View All Animals <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab('Manage Animals')}
              className="px-3.5 py-2 bg-[#237737] text-white hover:bg-[#1d632e] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" /> Register Animal
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400 tracking-wider">
                <th className="pb-3.5 pl-4">ID</th>
                <th className="pb-3.5">Name</th>
                <th className="pb-3.5">Species</th>
                <th className="pb-3.5">Breed</th>
                <th className="pb-3.5">Cage</th>
                <th className="pb-3.5">Health Status</th>
                <th className="pb-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {displayAnimals.slice(0, 5).map((animal) => (
                <tr key={animal._id || animal.animalId} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 pl-4 text-slate-400 text-xs font-bold">
                    {animal.animalId || animal._id?.slice(-6)}
                  </td>
                  <td className="py-4 text-slate-900 font-extrabold">{animal.name || 'Unnamed Rescue'}</td>
                  <td className="py-4">{animal.species}</td>
                  <td className="py-4 text-xs font-bold text-slate-500">{animal.breed || 'Mixed'}</td>
                  <td className="py-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200/50">
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
                  <td className="py-4 pr-4 text-right">
                    <button
                      onClick={() => setActiveTab('Manage Animals')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-[#237737] hover:text-white text-slate-700 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                      title="View animal in Manage Animals"
                    >
                      <Eye className="w-3.5 h-3.5" /> View in Registry
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayAnimals.length === 0 && (
          <div className="py-10 text-center text-slate-400 text-xs font-semibold space-y-2">
            <p>No animals registered in facility yet.</p>
            <button
              onClick={() => setActiveTab('Manage Animals')}
              className="px-4 py-2 bg-[#237737] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Register Animal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
