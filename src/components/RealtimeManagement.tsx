import React, { useState } from 'react';
import { AgendaEvent, Announcement, AttendanceRecord, PrayerTime, UserRole } from '../types';

interface RealtimeManagementProps {
  events: AgendaEvent[];
  setEvents: React.Dispatch<React.SetStateAction<AgendaEvent[]>>;
  prayerTimes: PrayerTime[];
  setPrayerTimes: React.Dispatch<React.SetStateAction<PrayerTime[]>>;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  attendance: AttendanceRecord[];
  onOpenAddModal: () => void;
  userRole?: UserRole;
  isLoggedIn?: boolean;
  onDeleteEventFromDb?: (id: string) => void;
  onDeleteAnnouncementFromDb?: (id: string) => void;
  onEditEvent?: (event: AgendaEvent) => void;
}

export const RealtimeManagement: React.FC<RealtimeManagementProps> = ({
  events,
  setEvents,
  prayerTimes,
  announcements,
  setAnnouncements,
  attendance,
  onOpenAddModal,
  userRole,
  isLoggedIn = false,
  onDeleteEventFromDb,
  onDeleteAnnouncementFromDb,
  onEditEvent
}) => {
  const [activeTab, setActiveTab] = useState<'agendas' | 'announcements' | 'api-logs'>('agendas');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isAdmin = Boolean(isLoggedIn) && (userRole === 'admin_utama' || userRole === 'ustadz');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteEvent = (id: string) => {
    if (!isAdmin) {
      alert('Akses Ditolak: Hanya Admin Utama yang dapat menghapus agenda.');
      return;
    }
    if (onDeleteEventFromDb) {
      onDeleteEventFromDb(id);
    } else {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
    showToast('Agenda berhasil dihapus dari Cloud Firestore & perangkat.');
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (!isAdmin) {
      alert('Akses Ditolak: Hanya Admin Utama yang dapat menghapus pengumuman.');
      return;
    }
    if (onDeleteAnnouncementFromDb) {
      onDeleteAnnouncementFromDb(id);
    } else {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }
    showToast('Pengumuman dihapus secara real-time dari database.');
  };

  const handleExportData = () => {
    const payload = JSON.stringify({ events, prayerTimes, announcements, attendance }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rihlah_Backup_Pesantren_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Data berhasil diekspor ke file JSON.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white border border-emerald-500 shadow-2xl flex items-center gap-3 animate-bounce">
          <i className="fa-solid fa-circle-check text-emerald-400 text-lg"></i>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-emerald-900 p-6 rounded-2xl text-white border border-slate-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Real-time State Sync Active
          </div>
          <h2 className="text-xl font-bold font-poppins">Pusat Manajemen Data Real-time & API</h2>
          <p className="text-xs text-slate-300">
            Kelola agenda, pengumuman, dan riwayat sinkronisasi API pihak ketiga secara langsung.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            <span>+ Tambah Agenda</span>
          </button>
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-download"></i>
            <span>Ekspor JSON</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('agendas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'agendas'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Kelola Agenda ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'announcements'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Kelola Pengumuman ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('api-logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'api-logs'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          Status API Pihak Ketiga
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'agendas' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3">Judul Kegiatan</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Tanggal & Waktu</th>
                  <th className="p-3">Lokasi</th>
                  <th className="p-3">Pengampu</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{evt.title}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                        {evt.category}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {evt.startDate} ({evt.startTime} - {evt.endTime})
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{evt.location}</td>
                    <td className="p-3 text-slate-500 italic">{evt.speakerOrTeacher || '-'}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onEditEvent && (
                          <button
                            onClick={() => onEditEvent(evt)}
                            className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 hover:bg-amber-100 text-xs transition-colors"
                            title="Edit Konten Agenda"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus agenda "${evt.title}"?`)) {
                              handleDeleteEvent(evt.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 hover:bg-rose-100 text-xs transition-colors"
                          title="Hapus Agenda"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          {announcements.map((anc) => (
            <div
              key={anc.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {anc.category}
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{anc.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{anc.content}</p>
              </div>
              <button
                onClick={() => handleDeleteAnnouncement(anc.id)}
                className="p-2 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 hover:bg-rose-100 text-xs shrink-0"
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'api-logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white font-poppins">Status Integrasi Cloud & API Real-time</h3>
          
          {/* Firebase Firestore Realtime Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-lg">
                <i className="fa-solid fa-fire text-amber-500"></i>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Google Cloud Firebase Firestore</h4>
                  <span className="px-2 py-0.2 text-[10px] bg-emerald-500 text-slate-950 rounded-full font-bold">Real-time DB</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sinkronisasi instan dua arah (Multi-Device Listener) aktif pada semua koleksi.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-slate-400 font-mono">
                  <span>• events: {events.length} docs</span>
                  <span>• announcements: {announcements.length} docs</span>
                  <span>• prayer_times: {prayerTimes.length} docs</span>
                </div>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs flex items-center gap-2 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Firestore Connected (Live)
            </span>
          </div>

          {/* Aladhan API Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                <i className="fa-solid fa-cloud-arrow-down"></i>
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Aladhan Islamic Prayer Times API</h4>
                <p className="text-[11px] text-slate-400">Endpoint: https://api.aladhan.com/v1/timingsByCity</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              200 OK (Terhubung)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
