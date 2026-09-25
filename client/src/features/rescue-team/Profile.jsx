import React from 'react';

const Profile = ({ user, isOnline }) => {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-900">My Profile</h1>
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-extrabold text-2xl flex items-center justify-center shadow">
            {(user?.fullName || 'R')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-extrabold text-slate-900">
              {user?.fullName || 'Rescue User'}
            </p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold bg-teal-100 text-teal-700 px-2.5 py-0.5 rounded-full">
              Rescue Team
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          {[
            { label: 'Phone', value: user?.phoneNumber || 'Not set' },
            { label: 'Role', value: user?.role || 'Rescue Team' },
            { label: 'Zone / Location', value: user?.district || user?.city || user?.address || 'Field Headquarters' },
            { label: 'Status', value: isOnline ? 'Online' : 'Offline' },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                {f.label}
              </p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{f.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
