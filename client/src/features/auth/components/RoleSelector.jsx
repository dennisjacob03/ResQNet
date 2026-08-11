import React from 'react';
import { User, ShieldAlert, Home, BookOpen, Settings, Check } from 'lucide-react';

const ROLES = [
  {
    id: 'Public User',
    label: 'Public User',
    description: 'Report animals & adopt pets',
    icon: User,
  },
  {
    id: 'Rescue Team',
    label: 'Rescue Team',
    description: 'Manage rescue operations',
    icon: ShieldAlert,
  },
  {
    id: 'Shelter',
    label: 'Shelter',
    description: 'Manage shelter & animals',
    icon: Home,
  },
  {
    id: 'Veterinary Staff',
    label: 'Veterinary Staff',
    description: 'Medical records & treatment',
    icon: BookOpen,
  },
  {
    id: 'Admin',
    label: 'Administrator',
    description: 'Full platform access',
    icon: Settings,
  },
];

const RoleSelector = ({ selectedRole = 'Public User', onSelectRole }) => {
  const activeRole =
    ROLES.find(
      (role) =>
        selectedRole === role.id ||
        (role.id === 'Admin' && selectedRole === 'Administrator')
    ) || ROLES[0];

  return (
    <div className="mb-4">
      {/* Role Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isSelected =
            selectedRole === role.id ||
            (role.id === 'Admin' && selectedRole === 'Administrator');

          return (
            <div key={role.id} className="relative group">
              {/* Custom Styled Hover Tooltip (Replaces Browser Title Tooltip) */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none transition-all duration-200">
                <div className="bg-slate-900/95 backdrop-blur-xs text-white text-[10px] font-medium px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap border border-slate-700/60 tracking-tight">
                  {role.description}
                </div>
                <div className="w-2 h-2 -mt-1 bg-slate-900/95 rotate-45 border-r border-b border-slate-700/60" />
              </div>

              {/* Role Select Button */}
              <button
                type="button"
                onClick={() => onSelectRole(role.id)}
                className={`w-full flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-200 cursor-pointer outline-none select-none relative ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#237737] to-[#1c642e] border-[#1d632e] text-white shadow-md shadow-emerald-900/10 ring-2 ring-[#237737]/25 -translate-y-0.5'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-xs hover:-translate-y-0.5'
                }`}
              >
                {/* Active Checkmark Badge */}
                {/* {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-white text-[#237737] flex items-center justify-center shadow-xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )} */}

                {/* Icon Box */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 transition-colors ${
                    isSelected
                      ? 'bg-white/20 text-white shadow-inner'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-100/70 group-hover:text-[#237737]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 stroke-[2]" />
                </div>

                {/* Button Title / Label */}
                <span
                  className={`text-[11px] tracking-tight leading-tight text-center ${
                    isSelected
                      ? 'font-extrabold text-white'
                      : 'font-semibold text-slate-800 group-hover:text-slate-900'
                  }`}
                >
                  {role.label}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;

