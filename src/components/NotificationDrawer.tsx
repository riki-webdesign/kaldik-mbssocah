import React, { useState } from 'react';
import { PushNotification } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<PushNotification[]>>;
  onMarkAllRead?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  setNotifications,
  onMarkAllRead
}) => {
  const [pushEnabled, setPushEnabled] = useState<boolean>(true);
  const [toastAlert, setToastAlert] = useState<string | null>(null);

  if (!isOpen) return null;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (onMarkAllRead) {
      onMarkAllRead();
    }
  };

  const handleTestNotification = () => {
    // Trigger simulated push notification
    const newNotif: PushNotification = {
      id: `notif-${Date.now()}`,
      title: 'Uji Coba Push Notification Instan',
      message: 'Notifikasi berhasil dikirimkan ke perangkat santri/ustadz.',
      timestamp: 'Baru saja',
      read: false,
      category: 'system'
    };
    setNotifications((prev) => [newNotif, ...prev]);

    setToastAlert('Notifikasi terkirim!');
    setTimeout(() => setToastAlert(null), 3000);

    // Audio chime simulation if browser supports
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 587.33; // D5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Audio fallback
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col justify-between text-slate-900 dark:text-white">
          
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-base">
                  <i className="fa-solid fa-bell"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-base font-poppins">Pusat Notifikasi Instan</h3>
                  <p className="text-xs text-slate-400">Pemberitahuan aktivitas & waktu shalat</p>
                </div>
              </div>

              <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* Push Permission Toggle */}
            <div className="my-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Push Notification Browser</h4>
                <p className="text-[10px] text-slate-400">Kirim pengingat saat aplikasi ditutup</p>
              </div>

              <button
                onClick={() => setPushEnabled(!pushEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  pushEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    pushEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* Test Trigger Button */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <button
                onClick={handleTestNotification}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-paper-plane text-xs"></i>
                <span>Simulasi Tes Notifikasi</span>
              </button>

              <button
                onClick={markAllRead}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold whitespace-nowrap"
              >
                Tandai Dibaca
              </button>
            </div>

            {toastAlert && (
              <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center animate-fade">
                <i className="fa-solid fa-circle-check mr-1"></i> {toastAlert}
              </div>
            )}

            {/* Notifications List */}
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    !n.read
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      {n.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-400">Rihlah Push Notification Sync Active</p>
          </div>

        </div>
      </div>
    </div>
  );
};
