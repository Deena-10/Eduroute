// In-app notification dropdown
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { subscribeUserToPush } from '../utils/pushSubscription';

const NotificationBell = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const res = await axiosInstance.get('/user/notifications');
        if (res.data?.success && res.data?.data) setNotifications(res.data.data);
      } catch (e) {
        console.warn('Fetch notifications error:', e);
      }
    };
    fetch();
  }, [user]);

  const handleEnablePush = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setLoading(true);
      await subscribeUserToPush();
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 mt-1 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-200 z-50">
            <div className="p-3 border-b border-gray-100 flex justify-between items-center">
              <span className="font-semibold text-gray-900">Notifications</span>
              {('Notification' in window && Notification.permission !== 'granted') && (
                <button
                  type="button"
                  onClick={handleEnablePush}
                  disabled={loading}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {loading ? 'Enabling...' : 'Enable push'}
                </button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 text-center">No notifications yet</p>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <Link
                    key={n.id}
                    to="/events"
                    onClick={() => {
                      setOpen(false);
                      axiosInstance.put(`/user/notifications/${n.id}/read`).catch(() => {});
                    }}
                    className={`block p-3 border-b border-gray-50 hover:bg-gray-50 ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                  >
                    <p className="font-medium text-sm text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-600 truncate">{n.message}</p>
                  </Link>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <Link
                to="/events"
                onClick={() => setOpen(false)}
                className="block p-2 text-center text-sm text-blue-600 hover:bg-gray-50 rounded-b-xl"
              >
                View all
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
