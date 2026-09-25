import React from 'react';
import { MapPin } from 'lucide-react';

const Profile = ({ user, vetStaff, shelterData }) => {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
          Veterinary Profile
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
          Manage your clinic credentials and veterinary staff details
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {user?.profilePic ? (
            <img
              src={
                user.profilePic.startsWith('/uploads')
                  ? `http://localhost:5000${user.profilePic}`
                  : user.profilePic
              }
              alt={user?.fullName || 'Doctor'}
              className="w-20 h-20 rounded-3xl object-cover border border-slate-200 shadow-md shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-cyan-600 text-white font-black text-3xl flex items-center justify-center shadow-md select-none shrink-0">
              {(user?.fullName || vetStaff?.fullName || 'V')[0].toUpperCase()}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-black text-slate-900">
                {user?.fullName || vetStaff?.fullName || 'Staff Doctor'}
              </h2>
              <span className="px-3 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200/60 rounded-xl text-xs font-bold">
                Veterinary Staff
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              {user?.email || vetStaff?.email || 'N/A'}
            </p>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />{' '}
              {vetStaff?.clinicName || shelterData?.shelterName || 'Partner Veterinary Ward & Clinic'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          {[
            {
              label: 'Specialization',
              value: vetStaff?.specialization || 'General Veterinary Medicine & Surgery',
            },
            {
              label: 'Veterinary Reg. No.',
              value: vetStaff?.licenseNumber || vetStaff?.vetStaffId || 'Registered Practitioner',
            },
            {
              label: 'Phone Contact',
              value: user?.phoneNumber || vetStaff?.phone || 'Not provided',
            },
            {
              label: 'Clinic Shift',
              value: vetStaff?.clinicShift || '09:00 AM – 06:00 PM',
            },
            {
              label: 'Assigned Shelter',
              value: shelterData?.shelterName || vetStaff?.assignedShelterName || 'Assigned Sanctuary',
            },
            {
              label: 'Account Status',
              value: user?.status || 'Active & Verified',
            },
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
