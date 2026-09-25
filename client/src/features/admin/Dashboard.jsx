import React from 'react';
import {
  Users,
  ClipboardList,
  Building2,
  Dog,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Stethoscope,
  MapPin,
} from 'lucide-react';

const Dashboard = ({
  userStats = { totalUsers: 0, activeUsers: 0, signupsThisMonth: 0 },
  usersList = [],
  shelterApplications = [],
  sheltersList = [],
  animalsList = [],
  animalCategories = [],
  setSubTab,
  setActiveTab,
}) => {
  const dogCount = animalsList.filter((a) => a.species === 'Dog').length;
  const catCount = animalsList.filter((a) => a.species === 'Cat').length;
  const birdCount = animalsList.filter((a) => a.species === 'Bird').length;
  const otherCount = animalsList.filter((a) => !['Dog', 'Cat', 'Bird'].includes(a.species)).length;
  const totalAnm = animalsList.length || 1;
  const dogPct = animalsList.length > 0 ? Math.round((dogCount / totalAnm) * 100) : 0;
  const catPct = animalsList.length > 0 ? Math.round((catCount / totalAnm) * 100) : 0;
  const birdPct = animalsList.length > 0 ? Math.round((birdCount / totalAnm) * 100) : 0;
  const otherPct = animalsList.length > 0 ? Math.max(0, 100 - dogPct - catPct - birdPct) : 0;

  return (
    <div className="space-y-6">
      {/* 4 Interactive Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 - Real User Count */}
        <div
          onClick={() => setSubTab && setSubTab('Manage Users')}
          className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
          title="Click to navigate to User Management"
        >
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Total Users
            </div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {userStats.totalUsers > 0
                ? userStats.totalUsers.toLocaleString()
                : usersList.length.toLocaleString()}
            </div>
            <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5 mt-1">
              Manage users <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 2 - Shelter Applications */}
        <div
          onClick={() => setSubTab && setSubTab('Manage Applications')}
          className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all cursor-pointer group"
          title="Click to review Applications"
        >
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Applications
            </div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {shelterApplications.length}
            </div>
            <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 mt-1">
              Review applications <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 3 - Registered Shelters */}
        <div
          onClick={() => setSubTab && setSubTab('Manage Shelters')}
          className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group"
          title="Click to manage Shelters"
        >
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Registered Shelters
            </div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {sheltersList.length}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
              Manage shelters <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 4 - Registered Animals */}
        <div
          onClick={() => setSubTab && setSubTab('Manage Animals')}
          className="p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-4.5 shadow-sm hover:shadow-md hover:border-rose-200 transition-all cursor-pointer group"
          title="Click to view Animals"
        >
          <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform">
            <Dog className="w-5 h-5 text-rose-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Animals In Care
            </div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {animalsList.length}
            </div>
            <span className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5 mt-1">
              Manage animals <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Quick Administrative Navigation Hub */}
      <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-base text-slate-900">
            Platform Management Workspaces
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Select an administrative workspace to audit, review, and configure system operations
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <button
            onClick={() => {
              setActiveTab && setActiveTab('Manage Users');
              setSubTab && setSubTab('Manage Users');
            }}
            className="p-4 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl text-left transition cursor-pointer group"
          >
            <Users className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xs text-slate-900">Users</div>
            <span className="text-[10px] text-slate-400 font-semibold">Audit accounts</span>
          </button>

          <button
            onClick={() => {
              setActiveTab && setActiveTab('Manage Shelters');
              setSubTab && setSubTab('Manage Shelters');
            }}
            className="p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-2xl text-left transition cursor-pointer group"
          >
            <Building2 className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xs text-slate-900">Shelters</div>
            <span className="text-[10px] text-slate-400 font-semibold">Sanctuaries</span>
          </button>

          <button
            onClick={() => {
              setActiveTab && setActiveTab('Manage Applications');
              setSubTab && setSubTab('Manage Applications');
            }}
            className="p-4 bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-200 rounded-2xl text-left transition cursor-pointer group"
          >
            <ClipboardList className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xs text-slate-900">Applications</div>
            <span className="text-[10px] text-slate-400 font-semibold">Audits & Visits</span>
          </button>

          <button
            onClick={() => {
              setActiveTab && setActiveTab('Manage Animals');
              setSubTab && setSubTab('Manage Animals');
            }}
            className="p-4 bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 rounded-2xl text-left transition cursor-pointer group"
          >
            <Dog className="w-5 h-5 text-rose-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xs text-slate-900">Animals</div>
            <span className="text-[10px] text-slate-400 font-semibold">Pet listings</span>
          </button>

          <button
            onClick={() => {
              setActiveTab && setActiveTab('Manage Rescue Teams');
              setSubTab && setSubTab('Manage Rescue Teams');
            }}
            className="p-4 bg-slate-50 hover:bg-teal-50 border border-slate-100 hover:border-teal-200 rounded-2xl text-left transition cursor-pointer group"
          >
            <Truck className="w-5 h-5 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xs text-slate-900">Rescue Teams</div>
            <span className="text-[10px] text-slate-400 font-semibold">Field units</span>
          </button>

          <button
            onClick={() => {
              setActiveTab && setActiveTab('Manage Volunteers');
              setSubTab && setSubTab('Manage Volunteers');
            }}
            className="p-4 bg-slate-50 hover:bg-purple-50 border border-slate-100 hover:border-purple-200 rounded-2xl text-left transition cursor-pointer group"
          >
            <HeartHandshake className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xs text-slate-900">Volunteers</div>
            <span className="text-[10px] text-slate-400 font-semibold">Community</span>
          </button>

          <button
            onClick={() => {
              setActiveTab && setActiveTab('Rescue & Shelter Map');
              setSubTab && setSubTab('Rescue & Shelter Map');
            }}
            className="p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-2xl text-left transition cursor-pointer group"
          >
            <MapPin className="w-5 h-5 text-[#237737] mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xs text-slate-900">Locate Map</div>
            <span className="text-[10px] text-slate-400 font-semibold">Teams & Shelters</span>
          </button>
        </div>
      </div>

      {/* Overview Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Card */}
        <div className="lg:col-span-2 bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Facility Activity & Records
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Live platform registry overview
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#237737]" /> Registered Animals ({animalsList.length})
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Shelters ({sheltersList.length})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-xs font-bold text-slate-400">Total Registered Animals</div>
              <div className="text-2xl font-black text-slate-800 mt-1">{animalsList.length}</div>
              <div className="text-[10px] font-semibold text-slate-500 mt-1">
                Across all partner shelters
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-xs font-bold text-slate-400">Animal Categories</div>
              <div className="text-2xl font-black text-[#237737] mt-1">
                {animalCategories.length}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 mt-1">
                Configured classifications
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-xs font-bold text-slate-400">Partner Shelters</div>
              <div className="text-2xl font-black text-blue-600 mt-1">{sheltersList.length}</div>
              <div className="text-[10px] font-semibold text-slate-500 mt-1">
                Statewide network
              </div>
            </div>
          </div>
        </div>

        {/* Pie Chart Representation */}
        <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Species Breakdown</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Distribution of rescued animals in database
            </p>
          </div>

          {animalsList.length > 0 ? (
            <>
              <div className="flex items-center justify-center py-2">
                <div className="relative w-36 h-36">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="4.2"
                      strokeDasharray={`${dogPct} ${100 - dogPct}`}
                      strokeDashoffset="100"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="4.2"
                      strokeDasharray={`${catPct} ${100 - catPct}`}
                      strokeDashoffset={`${100 - dogPct}`}
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="4.2"
                      strokeDasharray={`${birdPct} ${100 - birdPct}`}
                      strokeDashoffset={`${100 - dogPct - catPct}`}
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="4.2"
                      strokeDasharray={`${otherPct} ${100 - otherPct}`}
                      strokeDashoffset={`${100 - dogPct - catPct - birdPct}`}
                    />
                  </svg>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100 text-xs font-bold text-slate-500">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Dogs
                  </span>
                  <span className="text-slate-900">
                    {dogCount} ({dogPct}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Cats
                  </span>
                  <span className="text-slate-900">
                    {catCount} ({catPct}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Birds
                  </span>
                  <span className="text-slate-900">
                    {birdCount} ({birdPct}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Others
                  </span>
                  <span className="text-slate-900">
                    {otherCount} ({otherPct}%)
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs font-semibold">
              No animals registered in database yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
