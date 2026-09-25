import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Heart,
  MapPin,
  Phone,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { checkProfileCompletion } from '../../utils/profileUtils';
import { ProfileRequiredCard } from '../../components/common/ProfileRequiredCard';

const Dashboard = ({
  getFirstName,
  rescueReports = [],
  sheltersList = [],
  setActiveTab,
  user,
  onNavigateToProfile,
  onTrackRescue,
}) => {
  const profileStatus = checkProfileCompletion(user);

  return (
    <div className="space-y-6">
      {/* Greeting banner */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
          Good morning, {getFirstName ? getFirstName() : 'Friend'} 👋
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
          Here's what's happening with your rescue reports and neighborhood support.
        </p>
      </div>

      {/* Mandatory Profile Incomplete Warning Banner */}
      {!profileStatus.isComplete && (
        <ProfileRequiredCard
          user={user}
          onNavigateToProfile={onNavigateToProfile || (() => setActiveTab('My Profile'))}
          actionName="reporting rescues, adopting pets, and joining programs"
        />
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Filed */}
        <div
          onClick={() => setActiveTab && setActiveTab('Report Animal')}
          className="p-3.5 sm:p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-3.5 sm:gap-4.5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all cursor-pointer group"
          title="Click to view and report rescue cases"
        >
          <div className="p-2.5 sm:p-3 bg-amber-500/10 text-amber-600 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">Reports Filed</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{rescueReports.length}</div>
          </div>
        </div>

        {/* Resolved */}
        <div
          onClick={() => setActiveTab && setActiveTab('Report Animal')}
          className="p-3.5 sm:p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-3.5 sm:gap-4.5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group"
          title="Click to view resolved rescue cases"
        >
          <div className="p-2.5 sm:p-3 bg-emerald-500/10 text-emerald-600 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">Resolved</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {rescueReports.filter((r) => r.status === 'Resolved' || r.status === 'Completed').length}
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div
          onClick={() => setActiveTab && setActiveTab('Report Animal')}
          className="p-3.5 sm:p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-3.5 sm:gap-4.5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
          title="Click to track in-progress rescue cases"
        >
          <div className="p-2.5 sm:p-3 bg-blue-500/10 text-blue-600 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">In Progress</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {rescueReports.filter((r) => r.status === 'In Progress' || r.status === 'Assigned' || r.status === 'In Transit').length}
            </div>
          </div>
        </div>

        {/* Facilities on Map */}
        <div
          onClick={() => setActiveTab && setActiveTab('Rescue & Shelter Map')}
          className="p-3.5 sm:p-5 bg-white border border-slate-100/80 rounded-2xl flex items-center gap-3.5 sm:gap-4.5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
          title="Click to view network directory map"
        >
          <div className="p-2.5 sm:p-3 bg-indigo-500/10 text-indigo-600 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">Live Map</div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">Teams & Shelters</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => setActiveTab('Report Animal')}
          className="p-4 sm:p-6 bg-white border border-slate-100 rounded-2xl hover:border-[#237737]/35 shadow-sm hover:shadow-md flex flex-col items-center justify-center text-center gap-2.5 sm:gap-3 cursor-pointer group transition-all duration-200"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-500/10 border border-amber-200/50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="font-bold text-xs sm:text-sm text-slate-900">Report Animal</span>
        </button>

        <button
          onClick={() => setActiveTab('Adopt a Pet')}
          className="p-4 sm:p-6 bg-white border border-slate-100 rounded-2xl hover:border-[#237737]/35 shadow-sm hover:shadow-md flex flex-col items-center justify-center text-center gap-2.5 sm:gap-3 cursor-pointer group transition-all duration-200"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-500/10 border border-rose-200/50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-500/10" />
          </div>
          <span className="font-bold text-xs sm:text-sm text-slate-900">Adopt a Pet</span>
        </button>

        <button
          onClick={() => setActiveTab('Rescue & Shelter Map')}
          className="p-4 sm:p-6 bg-white border border-slate-100 rounded-2xl hover:border-[#237737]/35 shadow-sm hover:shadow-md flex flex-col items-center justify-center text-center gap-2.5 sm:gap-3 cursor-pointer group transition-all duration-200"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500/10 border border-blue-200/50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="font-bold text-xs sm:text-sm text-slate-900">Find Teams & Shelters</span>
        </button>

        <button
          onClick={() => setActiveTab('Rescue & Shelter Map')}
          className="p-4 sm:p-6 bg-white border border-slate-100 rounded-2xl hover:border-red-500/35 shadow-sm hover:shadow-md flex flex-col items-center justify-center text-center gap-2.5 sm:gap-3 cursor-pointer group transition-all duration-200"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500/10 border border-emerald-200/50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="font-bold text-xs sm:text-sm text-slate-900">Emergency Hotlines</span>
        </button>
      </div>

      {/* Bottom Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Card: My Rescue Reports */}
        <div className="lg:col-span-7 bg-white border border-slate-100/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3.5 sm:pb-4.5 mb-2.5 border-b border-slate-100">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">My Rescue Reports</h3>
            <button
              onClick={() => setActiveTab('Report Animal')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> New Report
            </button>
          </div>

          <div className="space-y-3 sm:space-y-3.5">
            {rescueReports.map((report) => {
              const repId = report._id || report.id || report.rescueRequestId;
              const displayType = report.type || `${report.animalCondition || 'Injured'} ${report.animalType || 'Animal'}`;
              const displayStatus = report.rescueStage || report.status || 'Reported';
              const displayLocation = report.locationAddress || report.location || 'Location provided';
              const displayTime = report.time || (report.createdAt ? new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently');

              return (
                <div
                  key={repId}
                  className="p-3.5 sm:p-4 bg-slate-50/50 border border-slate-100 hover:border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-3.5">
                    <div className="p-2 sm:p-2.5 bg-amber-500/15 text-amber-600 rounded-xl flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <h4 className="font-extrabold text-sm text-slate-900">{displayType}</h4>
                        <span className="px-2 py-0.5 border text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-800 border-emerald-200">
                          {displayStatus}
                        </span>
                        {report.assignedRescueTeamName && (
                          <span className="text-[10px] font-bold text-slate-500">
                            Unit: {report.assignedRescueTeamName}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-400 mt-1 font-semibold flex items-center gap-1 flex-wrap">
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">{displayLocation}</span>
                        <span className="text-slate-300">•</span>
                        <span>{displayTime}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t border-slate-200/50 sm:border-0">
                    <button
                      onClick={() => onTrackRescue && onTrackRescue(repId)}
                      className="px-3 py-1.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Track Live
                    </button>
                    <span className="font-mono font-bold text-[11px] text-slate-400 select-none">
                      {report.rescueRequestId || report.id || (repId ? repId.slice(-6) : '')}
                    </span>
                  </div>
                </div>
              );
            })}

            {rescueReports.length === 0 && (
              <div className="py-10 text-center text-slate-400 text-xs font-semibold space-y-2">
                <p>No emergency rescue reports submitted yet.</p>
                <button
                  onClick={() => setActiveTab('Report Animal')}
                  className="px-3.5 py-1.5 bg-[#237737] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Report Injured Animal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Nearby Shelters */}
        <div className="lg:col-span-5 bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-4.5 mb-4.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">Nearby Shelters</h3>
              <span className="text-xs text-slate-400 font-bold">{sheltersList.length} Active</span>
            </div>

            <div className="space-y-4">
              {sheltersList.length > 0 ? (
                sheltersList.slice(0, 4).map((shelter) => {
                  const total = shelter.totalCages || 1;
                  const occupied = shelter.occupiedCages || 0;
                  const available = Math.max(0, total - occupied);
                  const percentage = Math.min(100, Math.round((occupied / total) * 100));
                  const barColor = percentage >= 80 ? 'bg-orange-500' : 'bg-[#237737]';

                  return (
                    <div key={shelter._id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">{shelter.shelterName}</h4>
                          <p className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-0.5">
                            {available} spots available • {shelter.shelterStatus || shelter.currentStatus || 'OPEN'}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-slate-500">{percentage}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full w-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                  No registered shelters found in database yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
