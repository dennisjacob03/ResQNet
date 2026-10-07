import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { getMediaUrl } from '../../config/api';

const Profile = ({ user }) => {
  const profileFields = [
    { label: 'Role Level', value: 'Platform Super Admin (Tier 1)' },
    { label: 'Security Status', value: '2FA Enabled & Verified ✓' },
    { label: 'Phone Number', value: user?.phoneNumber || 'Not provided' },
    { label: 'Audit Log Access', value: 'Full Read / Write / Export' },
    { label: 'User Role Authority', value: 'Manage All Roles & Shelters' },
    { label: 'Account State', value: user?.status || 'Active & Verified' },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {user?.profilePic ? (
            <img
              src={getMediaUrl(user.profilePic)}
              alt={user?.fullName || 'Administrator'}
              className="w-20 h-20 rounded-3xl object-cover border border-slate-200 shadow-md shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-purple-600 text-white font-black text-3xl flex items-center justify-center shadow-md select-none shrink-0">
              {(user?.fullName || 'A')[0].toUpperCase()}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-black text-slate-900">
                {user?.fullName || 'Platform Administrator'}
              </h2>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200/60 rounded-xl text-xs font-bold">
                Super Administrator
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              {user?.email || 'admin@resqnet.com'}
            </p>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Full Root Access • Platform
              Security Officer
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          {profileFields.map((field) => (
            <div
              key={field.label}
              className="p-4 bg-[#F8FAF9] rounded-2xl border border-slate-100/80"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {field.label}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 mt-1 block">
                {field.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
