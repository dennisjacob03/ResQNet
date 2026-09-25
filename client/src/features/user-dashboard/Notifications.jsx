import React, { useState } from 'react';
import {
  Bell,
  Clock,
  X,
  Check,
  RefreshCw,
} from 'lucide-react';

const Notifications = ({
  notifications = [],
  notificationsLoading = false,
  loadNotifications,
  unreadCount = 0,
  handleMarkAllRead,
  handleToggleRead,
  handleDeleteNotification,
  getNotificationIconInfo,
  formatNotificationTime,
}) => {
  const [notificationFilter, setNotificationFilter] = useState('All');

  const filteredNotifications = notifications.filter((notif) => {
    if (notificationFilter === 'Unread') return notif.status === 'Unread';
    if (notificationFilter === 'ShelterApplication') return notif.type === 'ShelterApplication';
    if (notificationFilter === 'Rescue') return notif.type === 'Rescue';
    if (notificationFilter === 'Welcome') return notif.type === 'Welcome' || notif.type === 'System';
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">
            Stay updated with shelter approvals, emergency rescues, and adoption status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadNotifications}
            disabled={notificationsLoading}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
            title="Refresh notifications"
          >
            <RefreshCw className={`w-4 h-4 ${notificationsLoading ? 'animate-spin' : ''}`} />
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#237737] border border-emerald-200/80 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" /> Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Notification Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'All', label: 'All Notifications', count: notifications.length },
          { id: 'Unread', label: 'Unread', count: unreadCount },
          {
            id: 'ShelterApplication',
            label: 'Shelter Applications',
            count: notifications.filter((n) => n.type === 'ShelterApplication').length,
          },
          {
            id: 'Rescue',
            label: 'Rescue Reports',
            count: notifications.filter((n) => n.type === 'Rescue').length,
          },
          {
            id: 'Welcome',
            label: 'Welcome & System',
            count: notifications.filter((n) => n.type === 'Welcome' || n.type === 'System').length,
          },
        ].map((flt) => (
          <button
            key={flt.id}
            onClick={() => setNotificationFilter(flt.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              notificationFilter === flt.id
                ? 'bg-[#237737] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {flt.label}
            {flt.count > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  notificationFilter === flt.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {flt.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {notificationsLoading && (
        <div className="p-6 bg-white border border-slate-100 rounded-2xl text-slate-400 text-xs font-semibold animate-pulse flex items-center gap-2">
          <Clock className="w-4 h-4" /> Loading notifications…
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3.5">
        {filteredNotifications.map((notif) => {
          const iconInfo = getNotificationIconInfo(notif);
          const Icon = iconInfo.icon;
          const isUnread = notif.status === 'Unread' || notif.unread;

          return (
            <div
              key={notif._id || notif.id}
              onClick={() => handleToggleRead(notif._id || notif.id)}
              className={`p-5 bg-white border border-slate-100 hover:border-slate-200/80 rounded-2xl flex items-start gap-4 transition-all duration-200 cursor-pointer shadow-sm relative ${
                isUnread ? 'border-l-4 border-l-[#237737] bg-emerald-50/15' : ''
              }`}
            >
              <div className={`p-3 ${iconInfo.color} rounded-2xl flex-shrink-0 mt-0.5`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="space-y-1.5 pr-8 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-extrabold text-sm text-slate-900">{notif.title}</h4>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${iconInfo.badgeColor}`}>
                    {iconInfo.label}
                  </span>
                  {isUnread && (
                    <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" title="Unread"></span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  {notif.message || notif.body}
                </p>

                <p className="text-[10px] text-slate-400 font-bold pt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatNotificationTime(notif.createdAt || notif.time)}
                </p>
              </div>

              <button
                onClick={(e) => handleDeleteNotification(notif._id || notif.id, e)}
                className="absolute right-4 top-4 text-slate-350 hover:text-rose-500 transition cursor-pointer p-1 rounded-lg hover:bg-slate-50"
                title="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}

        {!notificationsLoading && notifications.length === 0 && (
          <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
              <Bell className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">No Notifications Yet</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto font-medium">
                You'll be notified here when your shelter application updates, emergency reports are assigned, or announcements occur.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
