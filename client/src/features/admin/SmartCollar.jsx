import React from 'react';

const SmartCollar = ({ onBackToOverview }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Hero Status Banner */}
      <div className="bg-gradient-to-br from-emerald-500/5 via-white to-cyan-500/5 border border-emerald-100 rounded-3xl p-8 sm:p-10 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

        <div className="max-w-2xl mx-auto space-y-4 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            This tab is under development
          </h2>

          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
            The ResQNet IoT Smart Collar Telemetry Dashboard is currently undergoing hardware bench testing and field validation. Once active, administrators can track satellite coordinates, monitor animal vital signs, and manage geofenced safe zones in real time.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onBackToOverview}
              className="px-5 py-2.5 bg-[#237737] hover:bg-[#1d632e] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-[#237737]/15"
            >
              Back to Dashboard Overview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartCollar;
