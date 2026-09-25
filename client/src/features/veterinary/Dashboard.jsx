import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Bell,
  AlertTriangle,
  Stethoscope,
  Scissors,
  FileText,
  Syringe,
  Package,
  Plus,
  ChevronRight,
  ShieldCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';

const Dashboard = ({
  medicalCases = [],
  vaccinations = [],
  lowStockMedicines = [],
  vetStaff,
  shelterData,
  user,
  setActiveTab,
}) => {
  const activeCasesCount = medicalCases.filter(
    (c) => c.status === 'Ongoing' || c.status === 'Critical'
  ).length;

  const criticalCount = medicalCases.filter((c) => c.status === 'Critical').length;
  const surgeryCount = medicalCases.filter((c) => c.isSurgery || c.type === 'Surgery').length;
  const upcomingVaccinationsCount = vaccinations.length;

  // Handlers that navigate to the appropriate dedicated page
  const handleNavigateToNewRecord = () => {
    if (setActiveTab) setActiveTab('Medical Records');
  };

  const handleNavigateToNewVaccination = () => {
    if (setActiveTab) setActiveTab('Vaccinations');
  };

  return (
    <div className="space-y-6">
      {/* Clinic Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
              <Stethoscope className="w-7 h-7 text-[#237737]" />
              <span>Veterinary Clinic Overview</span>
            </h1>
            {vetStaff?.vetStaffId && (
              <span className="px-2.5 py-0.5 bg-[#237737]/10 text-[#237737] border border-[#237737]/30 text-xs font-black rounded-lg font-mono">
                {vetStaff.vetStaffId}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-medium">
            Dr. {vetStaff?.fullName || user?.fullName || 'Staff Veterinarian'} •{' '}
            <strong className="text-[#237737]">
              {shelterData?.shelterName || 'Assigned Shelter Sanctuary'}
            </strong>{' '}
            {vetStaff?.specialization && `• ${vetStaff.specialization}`}
          </p>
        </div>

        {/* Action Button that navigates to Manage Records */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleNavigateToNewRecord}
            className="px-4 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm shadow-[#237737]/15"
          >
            <Plus className="w-4 h-4" />
            <span>New Medical Record</span>
          </button>
        </div>
      </div>

      {/* 4 Interactive Metric Cards - Each navigates to its dedicated page */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Cases */}
        <div
          onClick={() => setActiveTab && setActiveTab('Medical Records')}
          className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
          title="Click to view and manage Medical Records"
        >
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Active Cases
            </div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {activeCasesCount || medicalCases.length}
            </div>
            <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5 mt-0.5">
              Manage records <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Surgeries Performed */}
        <div
          onClick={() => setActiveTab && setActiveTab('Medical Records')}
          className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md hover:border-purple-200 transition-all cursor-pointer group"
          title="Click to view Surgeries in Medical Records"
        >
          <div className="p-3 bg-purple-500/10 text-purple-600 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform">
            <Scissors className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Surgeries Logged
            </div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{surgeryCount}</div>
            <span className="text-[10px] text-purple-600 font-bold flex items-center gap-0.5 mt-0.5">
              View surgery logs <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Vaccinations Total */}
        <div
          onClick={() => setActiveTab && setActiveTab('Vaccinations')}
          className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md hover:border-orange-200 transition-all cursor-pointer group"
          title="Click to view and manage Vaccinations"
        >
          <div className="p-3 bg-orange-500/10 text-orange-600 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform">
            <Syringe className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Vaccinations Due
            </div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {upcomingVaccinationsCount}
            </div>
            <span className="text-[10px] text-orange-600 font-bold flex items-center gap-0.5 mt-0.5">
              Manage vaccines <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Critical Cases */}
        <div
          onClick={() => setActiveTab && setActiveTab('Medical Records')}
          className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md hover:border-rose-200 transition-all cursor-pointer group"
          title="Click to filter Critical cases in Medical Records"
        >
          <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Critical Cases
            </div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{criticalCount}</div>
            <span className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5 mt-0.5">
              Immediate attention <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Hub - Direct Access to Dedicated Management Pages */}
      <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-base text-slate-900">
            Clinical Management Quick Access
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Select a dedicated workspace to perform medical, surgical, and vaccination duties
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Medical Records */}
          <button
            onClick={() => setActiveTab && setActiveTab('Medical Records')}
            className="p-5 bg-slate-50/70 hover:bg-emerald-50/40 border border-slate-100 hover:border-emerald-200 rounded-2xl text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#237737] transition-colors">
                Medical Records
              </h4>
              <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
                Log and review clinical examination reports, surgeries, and diagnoses.
              </p>
            </div>
            <div className="mt-4 text-xs font-bold text-[#237737] flex items-center gap-1">
              <span>Go to Records</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 2: Vaccinations Registry */}
          <button
            onClick={() => setActiveTab && setActiveTab('Vaccinations')}
            className="p-5 bg-slate-50/70 hover:bg-orange-50/40 border border-slate-100 hover:border-orange-200 rounded-2xl text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Syringe className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-orange-600 transition-colors">
                Vaccinations
              </h4>
              <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
                Record administered vaccines, due booster dates, and batch numbers.
              </p>
            </div>
            <div className="mt-4 text-xs font-bold text-orange-600 flex items-center gap-1">
              <span>Go to Vaccinations</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 3: Shelter Reminders */}
          <button
            onClick={() => setActiveTab && setActiveTab('Vaccinations')}
            className="p-5 bg-slate-50/70 hover:bg-blue-50/40 border border-slate-100 hover:border-blue-200 rounded-2xl text-left transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Bell className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                Shelter Reminders
              </h4>
              <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
                Dispatch urgent medical checkup and booster alerts directly to shelter staff.
              </p>
            </div>
            <div className="mt-4 text-xs font-bold text-blue-600 flex items-center gap-1">
              <span>Send Reminders</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 4: Medicines Stock — only if permitted */}
          {vetStaff?.canManageMedicineStock && (
            <button
              onClick={() => setActiveTab && setActiveTab('Medicines Stock')}
              className="p-5 bg-slate-50/70 hover:bg-purple-50/40 border border-slate-100 hover:border-purple-200 rounded-2xl text-left transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Package className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">
                  Medicines Stock
                </h4>
                <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
                  Monitor pharmaceutical inventory, critical low stock alerts, and refills.
                </p>
              </div>
              <div className="mt-4 text-xs font-bold text-purple-600 flex items-center gap-1">
                <span>Inspect Stock</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Two-Column Overview Previews (Non-action, informational only with navigation links) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Medical Records Preview */}
        <div className="lg:col-span-7 bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#237737]" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Recent Clinical Examinations
                </h3>
              </div>
              <button
                onClick={() => setActiveTab && setActiveTab('Medical Records')}
                className="text-xs font-bold text-[#237737] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({medicalCases.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {medicalCases.slice(0, 4).map((record, idx) => {
                const caseId = record.medicalRecordId || `MED-${idx + 1}`;
                const patientName = record.animalName || 'Shelter Animal';
                const diagnosis =
                  record.surgeryDetails?.procedureName ||
                  record.diagnosis ||
                  record.report ||
                  'Routine Checkup';
                const isSurgery = record.isSurgery || record.type === 'Surgery';

                return (
                  <div
                    key={record._id || caseId}
                    onClick={() => setActiveTab && setActiveTab('Medical Records')}
                    className="p-3.5 bg-slate-50/60 hover:bg-slate-100/70 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                        {isSurgery ? (
                          <Scissors className="w-4 h-4 text-purple-600" />
                        ) : (
                          <FileText className="w-4 h-4 text-[#237737]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-xs text-slate-900 truncate">
                            {patientName}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400 font-semibold">
                            {caseId}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                          {diagnosis}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                          record.status === 'Critical'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : record.status === 'Ongoing'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {record.status || 'Ongoing'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {medicalCases.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                  No clinical reports filed yet. Navigate to Medical Records to add an entry.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => setActiveTab && setActiveTab('Medical Records')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Manage All Medical Records Page</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#237737]" />
            </button>
          </div>
        </div>

        {/* Right Column: Upcoming Vaccinations Preview + Medicine Alert */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Vaccinations Preview */}
          <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-500" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    Vaccination Schedule Preview
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab && setActiveTab('Vaccinations')}
                  className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Manage ({vaccinations.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {vaccinations.slice(0, 3).map((vac, idx) => {
                  const dueDate = vac.nextDueDate
                    ? new Date(vac.nextDueDate).toLocaleDateString()
                    : 'Due Soon';
                  return (
                    <div
                      key={vac._id || idx}
                      onClick={() => setActiveTab && setActiveTab('Vaccinations')}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-100 transition"
                    >
                      <div>
                        <span className="font-black text-slate-900">{vac.animalName || 'Patient'}</span>
                        <p className="text-[11px] text-slate-500 font-medium">{vac.vaccineName}</p>
                      </div>
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-lg">
                        Due: {dueDate}
                      </span>
                    </div>
                  );
                })}

                {vaccinations.length === 0 && (
                  <div className="py-6 text-center text-slate-400 text-xs font-semibold">
                    No upcoming vaccinations.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => setActiveTab && setActiveTab('Vaccinations')}
                className="w-full py-2 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Open Vaccinations & Reminders Page</span>
                <ArrowRight className="w-3.5 h-3.5 text-orange-600" />
              </button>
            </div>
          </div>

          {/* Medicines Stock Alert — only if permitted */}
          {vetStaff?.canManageMedicineStock && (
            <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-600" />
                  <h4 className="font-extrabold text-sm text-slate-900">Medicines Stock Alert</h4>
                </div>
                <button
                  onClick={() => setActiveTab && setActiveTab('Medicines Stock')}
                  className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Inventory</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Check pharmaceutical levels, emergency sedation items, antibiotics, and surgical supplies.
              </p>

              <button
                onClick={() => setActiveTab && setActiveTab('Medicines Stock')}
                className="mt-3.5 w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Go to Medicines Stock Page</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
