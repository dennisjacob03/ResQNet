import { Building2, X, RefreshCw, CheckCircle2 } from 'lucide-react';

const ShelterDetailsModal = ({
  isOpen,
  shelter,
  onClose,
  handleToggleShelterStatus,
  shelterActionLoading = {},
}) => {
  if (!isOpen || !shelter) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#237737]/10 text-[#237737] font-black flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">{shelter.shelterName}</h3>
                <span className="px-2.5 py-0.5 bg-[#237737]/10 border border-[#237737]/30 text-[#237737] text-xs font-black rounded-lg">
                  {shelter.shelterNumber || 'SH-0001'}
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black rounded-lg inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                {shelter.userId?.fullName
                  ? `Manager: ${shelter.userId.fullName} (${shelter.userId.email})`
                  : 'Managed directly by System Admin'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-3 py-1 rounded-xl text-xs font-bold border ${
              shelter.status !== 'Inactive'
                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
                : 'bg-rose-500/10 text-rose-700 border-rose-200/50'
            }`}
          >
            Account: {shelter.status !== 'Inactive' ? 'Active' : 'Inactive'}
          </span>

          <span
            className={`px-3 py-1 rounded-xl text-xs font-bold border ${
              (shelter.shelterStatus || shelter.currentStatus) === 'OPEN'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : (shelter.shelterStatus || shelter.currentStatus) === 'FULL'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : (shelter.shelterStatus || shelter.currentStatus || 'UNDER_MAINTENANCE') === 'UNDER_MAINTENANCE'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Operational: {(shelter.shelterStatus || shelter.currentStatus || 'UNDER_MAINTENANCE').replace(/_/g, ' ')}
          </span>

          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Type: {shelter.registrationType?.replace(/_/g, ' ') || 'STATE TRUST SOCIETY'}
          </span>
        </div>

        {/* Facility Details Grid */}
        <div className="bg-[#F8FAF9] rounded-2xl p-4 border border-slate-100 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                Contact Email
              </span>
              <p className="font-extrabold text-slate-800 mt-0.5">{shelter.shelterEmail}</p>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                Phone Number
              </span>
              <p className="font-extrabold text-slate-800 mt-0.5">
                +91 {shelter.shelterPhoneNumber}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                Registration Number
              </span>
              <p className="font-extrabold text-slate-800 mt-0.5">
                {shelter.registrationNumber || 'Not specified'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                GPS Coordinates
              </span>
              <p className="font-extrabold text-slate-800 mt-0.5">
                {shelter.latitude?.toFixed(5)}, {shelter.longitude?.toFixed(5)}
              </p>
            </div>
          </div>

          {/* Capacity details */}
          <div className="pt-2 border-t border-slate-200/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>
                Cage Capacity: {shelter.occupiedCages || 0} / {shelter.totalCages || 0}
              </span>
              <span className="text-emerald-700 font-extrabold">
                {shelter.totalCages > 0
                  ? `${Math.round(
                      ((shelter.occupiedCages || 0) / shelter.totalCages) * 100
                    )}% occupied (${
                      shelter.totalCages - (shelter.occupiedCages || 0)
                    } available)`
                  : '0 available'}
              </span>
            </div>
            <div className="h-2 bg-slate-200/80 rounded-full w-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#237737] transition-all"
                style={{
                  width: `${
                    shelter.totalCages > 0
                      ? Math.min(
                          Math.round(
                            ((shelter.occupiedCages || 0) / shelter.totalCages) * 100
                          ),
                          100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1">
              <span>Staff Strength: {shelter.totalStaffs || 0} certified members</span>
              {shelter.shelterApplicationId && (
                <span>Origin: Application #{shelter.shelterApplicationId}</span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <span>
              Registered:{' '}
              {new Date(shelter.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span>
              Updated:{' '}
              {new Date(shelter.updatedAt || shelter.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={() => handleToggleShelterStatus(shelter)}
            disabled={shelterActionLoading[shelter._id]}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-2 ${
              shelter.status !== 'Inactive'
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
            }`}
          >
            {shelterActionLoading[shelter._id] ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : shelter.status !== 'Inactive' ? (
              'Deactivate Shelter'
            ) : (
              'Activate Shelter'
            )}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShelterDetailsModal;
