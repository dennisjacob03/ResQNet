import React from 'react';
import { MapPin } from 'lucide-react';
import { getMediaUrl } from '../../config/api';

const Profile = ({ user, shelterData, capacities = [], cages = [] }) => {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
          Shelter Facility Profile
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
          Manage facility credentials, manager contact details, and shelter capacity
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {user?.profilePic ? (
            <img
              src={getMediaUrl(user.profilePic)}
              alt={user?.fullName || 'Shelter Manager'}
              className="w-20 h-20 rounded-3xl object-cover border border-slate-200 shadow-md shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-amber-600 text-white font-black text-3xl flex items-center justify-center shadow-md select-none shrink-0">
              {(user?.fullName || 'S')[0].toUpperCase()}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-black text-slate-900">
                {user?.fullName || shelterData?.shelterName || 'Shelter Manager'}
              </h2>
              <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-xl text-xs font-bold">
                Shelter Manager
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              {user?.email || shelterData?.shelterEmail}
            </p>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {shelterData?.shelterNumber ? `Shelter #${shelterData.shelterNumber} • ` : ''}
              {shelterData?.latitude && shelterData?.longitude
                ? `GPS: (${shelterData.latitude.toFixed(3)}, ${shelterData.longitude.toFixed(3)})`
                : 'Facility Management'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          {[
            { label: 'Shelter Facility ID', value: shelterData?.shelterNumber || 'Pending' },
            {
              label: 'Registration Type',
              value: shelterData?.registrationType || 'Registered Facility',
            },
            { label: 'Registration Number', value: shelterData?.registrationNumber || 'N/A' },
            {
              label: 'Phone Contact',
              value: shelterData?.shelterPhoneNumber || user?.phoneNumber || 'Not provided',
            },
            {
              label: 'Total Capacity',
              value: `${capacities.reduce((a, c) => a + (c.totalCapacity || 0), 0)} Spots`,
            },
            { label: 'Total Cages', value: `${cages.length} Cages` },
            {
              label: 'Operational Status',
              value:
                shelterData?.shelterStatus ||
                shelterData?.currentStatus ||
                'UNDER_MAINTENANCE',
            },
            { label: 'Admin Status', value: shelterData?.status || 'Active' },
          ].map((field) => (
            <div key={field.label} className="p-4 bg-[#F8FAF9] rounded-2xl border border-slate-100/80">
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
