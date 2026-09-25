import { X, Lock } from 'lucide-react';

const UserDetailsModal = ({
  isOpen,
  user,
  onClose,
  handleUpdateRole,
  handleToggleStatus,
}) => {
  if (!isOpen || !user) return null;

  const roleClass =
    user.role === 'Admin'
      ? 'bg-purple-50 text-purple-700 border-purple-200/60'
      : user.role === 'Rescue Team'
      ? 'bg-blue-50 text-blue-700 border-blue-200/60'
      : user.role === 'Shelter' || user.role === 'Shelter Manager'
      ? 'bg-amber-50 text-amber-700 border-amber-200/60'
      : user.role === 'Veterinary Staff'
      ? 'bg-teal-50 text-teal-700 border-teal-200/60'
      : 'bg-slate-100 text-slate-700 border-slate-200/60';

  const statusClass =
    user.status === 'Active'
      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50'
      : user.status === 'Suspended'
      ? 'bg-rose-500/10 text-rose-700 border-rose-200/50'
      : 'bg-amber-500/10 text-amber-700 border-amber-200/50';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-slate-100 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            {user.profilePic ? (
              <img
                src={
                  user.profilePic.startsWith('/uploads')
                    ? `http://localhost:5000${user.profilePic}`
                    : user.profilePic
                }
                alt={user.fullName || user.name}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-[#237737]/10 text-[#237737] font-black text-lg flex items-center justify-center shrink-0">
                {(user.fullName || user.name || 'U')[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {user.fullName || user.name}
              </h3>
              <p className="text-xs text-slate-400 font-semibold">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Status & Role Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${roleClass}`}>
            Role: {user.role}
          </span>

          <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${statusClass}`}>
            Status: {user.status || 'Active'}
          </span>

          <span
            className={`px-3 py-1 rounded-xl text-xs font-bold ${
              user.isEmailVerified
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            Email {user.isEmailVerified ? 'Verified ✓' : 'Unverified ✗'}
          </span>

          <span
            className={`px-3 py-1 rounded-xl text-xs font-bold ${
              user.isPhoneVerified
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            Phone {user.isPhoneVerified ? 'Verified ✓' : 'Unverified ✗'}
          </span>
        </div>

        {/* Profile Information Grid */}
        <div className="bg-[#F8FAF9] rounded-2xl p-4 border border-slate-100 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                Phone Number
              </span>
              <span className="text-slate-800 font-extrabold">
                {user.phoneNumber || 'Not provided'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                Date of Birth
              </span>
              <span className="text-slate-800 font-extrabold">
                {user.dob
                  ? new Date(user.dob).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Not specified'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                City / Town
              </span>
              <span className="text-slate-800 font-extrabold">{user.city || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                District
              </span>
              <span className="text-slate-800 font-extrabold">
                {user.district || 'Not specified'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                State
              </span>
              <span className="text-slate-800 font-extrabold">{user.state || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                Pincode
              </span>
              <span className="text-slate-800 font-extrabold">
                {user.pincode || 'Not specified'}
              </span>
            </div>
          </div>

          {user.address && (
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-slate-400 font-bold block uppercase text-[10px]">
                Street Address
              </span>
              <span className="text-slate-800 font-semibold">{user.address}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-medium">
            <div>
              <span className="block font-bold">Registered On:</span>
              <span>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="block font-bold">Account ID:</span>
              <span className="font-mono text-[10px] text-slate-500">
                {user._id || user.id}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions in Modal */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-extrabold text-slate-700">
            Administrative Controls:
          </span>
          <div className="flex items-center gap-2">
            <select
              value={user.role}
              onChange={(e) => handleUpdateRole(user._id || user.id, e.target.value)}
              className="px-3 py-2 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#237737] cursor-pointer flex-1"
            >
              <option value="Public User">Role: Public User</option>
              <option value="Rescue Team">Role: Rescue Team</option>
              <option value="Shelter">Role: Shelter</option>
              <option value="Veterinary Staff">Role: Veterinary Staff</option>
              <option value="Admin">Role: Admin</option>
            </select>

            {user.role === 'Admin' ? (
              <button
                disabled
                type="button"
                title="Admin user account cannot be suspended"
                className="px-4 py-2 text-xs font-bold rounded-xl border bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-80 inline-flex items-center gap-1.5 shadow-none select-none"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Suspend User</span>
              </button>
            ) : (
              <button
                onClick={() => handleToggleStatus(user)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                  user.status === 'Active'
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}
              >
                {user.status === 'Active' ? 'Suspend User' : 'Activate User'}
              </button>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
