import React from 'react';
import { Plus, Scissors, Bell, FileText } from 'lucide-react';

const MedicalRecords = ({
  medicalCases = [],
  setShowAddRecordModal,
  onOpenSendReminder,
}) => {
  return (
    <div className="w-full bg-white border border-slate-100/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4.5 mb-4.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#237737]" />
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
              Clinical Examination & Surgery Records
            </h3>
          </div>
          <button
            onClick={() => setShowAddRecordModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#237737] hover:bg-[#1d632e] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm shadow-[#237737]/10"
          >
            <Plus className="w-3.5 h-3.5" /> New Record
          </button>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th className="pb-3.5 pl-2">Case ID</th>
                <th className="pb-3.5">Patient</th>
                <th className="pb-3.5">Clinical Findings / Surgery</th>
                <th className="pb-3.5">Attending Vet</th>
                <th className="pb-3.5">Next Visit</th>
                <th className="pb-3.5">Status</th>
                <th className="pb-3.5 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {medicalCases.map((record, idx) => {
                const caseId = record.medicalRecordId || record.id || `MED-${idx + 1}`;
                const patientName = record.animalName || record.patient || 'Patient Animal';
                const species = record.species || 'Dog';
                const reportContent =
                  record.surgeryDetails?.procedureName ||
                  record.report ||
                  record.diagnosis ||
                  'Routine Examination';
                const isSurgery = record.isSurgery || record.type === 'Surgery';
                const vet = record.vetName || record.vet || 'Attending Doctor';
                const nextVisit = record.nextVisitDate
                  ? new Date(record.nextVisitDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : record.nextVisit || 'None';
                const status = record.status || 'Ongoing';

                const badgeColor =
                  status === 'Critical'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : status === 'Ongoing'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : status === 'Improving'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                return (
                  <tr key={record._id || caseId} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 pl-2 text-slate-400 text-xs font-mono font-bold">
                      {caseId}
                    </td>
                    <td className="py-4 text-slate-900 font-extrabold">
                      <div>{patientName}</div>
                      <span className="text-[10px] text-slate-400 font-normal">({species})</span>
                    </td>
                    <td className="py-4 text-xs font-semibold text-slate-600 max-w-[220px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isSurgery && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-black rounded flex items-center gap-0.5">
                            <Scissors className="w-2.5 h-2.5" /> Surgery
                          </span>
                        )}
                        <span className="truncate" title={reportContent}>
                          {reportContent}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-xs text-slate-500">{vet}</td>
                    <td className="py-4 text-xs text-slate-400">{nextVisit}</td>
                    <td className="py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${badgeColor}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="py-4 pr-2 text-right">
                      {onOpenSendReminder && (
                        <button
                          onClick={() => onOpenSendReminder(record)}
                          className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-[10px] font-bold transition cursor-pointer inline-flex items-center gap-1"
                          title="Send medical follow-up reminder to shelter"
                        >
                          <Bell className="w-2.5 h-2.5" /> Remind
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {medicalCases.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold space-y-2">
              <p>No clinical medical records logged yet.</p>
              <button
                onClick={() => setShowAddRecordModal(true)}
                className="px-3.5 py-1.5 bg-[#237737] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> New Clinical Record
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecords;
