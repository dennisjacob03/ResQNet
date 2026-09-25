import React from 'react';
import { Plus, Bell, ShieldCheck, Check } from 'lucide-react';

const Vaccinations = ({
  vaccinations = [],
  onOpenAddVaccination,
  onOpenSendReminder,
}) => {
  return (
    <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#237737]" />
          <h3 className="font-extrabold text-base text-slate-900">Vaccination Records</h3>
        </div>
        {onOpenAddVaccination && (
          <button
            onClick={onOpenAddVaccination}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#237737] hover:bg-[#1d632e] text-white rounded-xl text-[11px] font-bold transition cursor-pointer shadow-sm shadow-[#237737]/10"
          >
            <Plus className="w-3 h-3" /> Record
          </button>
        )}
      </div>

      <div className="space-y-3">
        {vaccinations.map((vac, idx) => {
          const animalName = vac.animalName || vac.patient || 'Shelter Dog';
          const vacName = vac.vaccineName || vac.name || 'Vaccination';
          const dueDateStr = vac.nextDueDate
            ? new Date(vac.nextDueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : vac.due || 'Booster not set';

          return (
            <div
              key={vac._id || idx}
              className="p-3.5 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl flex flex-col justify-between gap-2 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>{animalName}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({vac.species || 'Dog'})
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-600 font-semibold mt-0.5">{vacName}</p>
                </div>

                {vac.reminderSent ? (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black rounded-lg flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5" /> Reminded
                  </span>
                ) : (
                  <button
                    onClick={() => onOpenSendReminder && onOpenSendReminder(vac)}
                    className="px-2 py-0.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-[9px] font-black rounded-lg transition cursor-pointer flex items-center gap-1"
                    title="Send reminder to shelter"
                  >
                    <Bell className="w-2.5 h-2.5" /> Remind Shelter
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/60 font-medium">
                <span className="text-slate-400">
                  Given:{' '}
                  {vac.dateGiven
                    ? new Date(vac.dateGiven).toLocaleDateString()
                    : 'Administered'}
                </span>
                <span className="text-orange-600 font-bold">Due: {dueDateStr}</span>
              </div>
            </div>
          );
        })}

        {vaccinations.length === 0 && (
          <div className="py-8 text-center text-slate-400 text-xs font-semibold space-y-2">
            <p>No vaccination records logged yet.</p>
            {onOpenAddVaccination && (
              <button
                onClick={onOpenAddVaccination}
                className="px-3 py-1.5 bg-[#237737] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Record First Vaccine
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Vaccinations;
