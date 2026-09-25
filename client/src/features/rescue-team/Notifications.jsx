import React from 'react';

const Notifications = ({ activityTimeline = [] }) => {
  return (
    <div className="space-y-5 max-w-3xl">
      <h1 className="text-2xl font-extrabold text-slate-900">Notifications</h1>
      {activityTimeline.map((item, i) => (
        <div
          key={i}
          className="bg-white border border-slate-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm"
        >
          <div className={`w-3 h-3 rounded-full ${item.color || 'bg-teal-500'} mt-1 flex-shrink-0`} />
          <div>
            <p className="text-sm font-semibold text-slate-800">{item.text}</p>
            <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
          </div>
        </div>
      ))}

      {activityTimeline.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center text-slate-400 text-sm font-medium">
          No notifications yet.
        </div>
      )}
    </div>
  );
};

export default Notifications;
