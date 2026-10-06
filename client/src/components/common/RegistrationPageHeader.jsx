import React from "react";
import { ClipboardList, Plus } from "lucide-react";

const RegistrationPageHeader = ({
  title,
  description,
  formLabel = "New Application",
  statusLabel = "Submitted Applications",
  activeTab,
  onForm,
  onStatus,
  hasApplication = false,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
      <p className="text-slate-500 text-sm mt-1">{description}</p>
    </div>

    <div className="flex items-center bg-slate-100 p-1 rounded-2xl w-fit shrink-0">
      <button
        type="button"
        onClick={onForm}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
          activeTab === "form"
            ? "bg-white text-[#237737] shadow-xs"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <Plus className="w-3.5 h-3.5" />
        {formLabel}
      </button>
      <button
        type="button"
        onClick={onStatus}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer relative ${
          activeTab === "status"
            ? "bg-white text-[#237737] shadow-xs"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <ClipboardList className="w-3.5 h-3.5" />
        {statusLabel}
        {hasApplication && (
          <span className="w-2 h-2 rounded-full bg-[#237737]" />
        )}
      </button>
    </div>
  </div>
);

export default RegistrationPageHeader;
