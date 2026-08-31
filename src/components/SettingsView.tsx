import React, { useState } from 'react';
import { UserRole } from '../types';

interface SettingsViewProps {
  userRole: UserRole;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userRole,
  isDarkMode,
  toggleDarkMode
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [showProfileSavedMsg, setShowProfileSavedMsg] = useState(false);

  // Profile fields state
  const [fullName, setFullName] = useState(
    userRole === 'admin_utama'
      ? 'Admin Utama Babusalam Socah'
      : userRole === 'ustadz'
      ? 'Ust. Syukri, Lc.'
      : 'M. Raihan'
  );
  const [nipNis, setNipNis] = useState(
    userRole === 'admin_utama'
      ? 'ADM-2026-BBS'
      : userRole === 'ustadz'
      ? '19880211'
      : '20240101'
  );
  const [phone, setPhone] = useState('0812-3456-7890');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setShowProfileSavedMsg(true);
    setTimeout(() => setShowProfileSavedMsg(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Profile Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-poppins">Profil Pengguna</h2>
            <p className="text-xs text-slate-400">Kelola identitas akun dan hak akses portal</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold capitalize flex items-center gap-1.5">
            <i className="fa-solid fa-shield-halved"></i>
            {userRole === 'admin_utama' ? 'Admin Utama' : userRole === 'ustadz' ? 'Ustadz / Pengampu' : 'Santri Aktif'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-500/20">
            {userRole === 'admin_utama' ? 'AU' : userRole === 'ustadz' ? 'US' : 'MR'}
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {fullName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {userRole === 'admin_utama' ? 'NIP/ID: ' : userRole === 'ustadz' ? 'NIP: ' : 'NIS: '}
              <span className="font-mono font-bold">{nipNis}</span>
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Status: Aktif terdaftar di Pondok Pesantren Babusalam Socah, Bangkalan
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {userRole === 'admin_utama' ? 'NIP / ID Pengelola' : userRole === 'ustadz' ? 'NIP Ustadz' : 'NIS Santri'}
              </label>
              <input
                type="text"
                required
                value={nipNis}
                onChange={(e) => setNipNis(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nomor WhatsApp / Kontak Aktif
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {showProfileSavedMsg && (
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800 flex items-center gap-2">
              <i className="fa-solid fa-circle-check"></i>
              <span>Profil berhasil diperbarui dan disimpan!</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <i className="fa-solid fa-floppy-disk"></i>
              <span>Simpan Perubahan Profil</span>
            </button>
          </div>
        </form>
      </div>

      {/* App Preferences */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 font-poppins">
          Preferensi Dashboard
        </h2>
        
        <div className="space-y-3 text-xs">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Tema Tampilan (Mode Gelap / Terang)</h3>
              <p className="text-slate-500 dark:text-slate-400">Sesuaikan kenyamanan mata saat malam atau siang hari</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
              <span>{isDarkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Notifikasi Suara Waktu Shalat & Agenda</h3>
              <p className="text-slate-500 dark:text-slate-400">Mainkan nada pengingat saat memasuki waktu ibadah</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Auto Sync Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Otomatis Sinkronisasi Kalender Akademik</h3>
              <p className="text-slate-500 dark:text-slate-400">Sinkronkan perubahan agenda dari server utama secara real-time</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={autoSyncEnabled}
                onChange={(e) => setAutoSyncEnabled(e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Email/WA Alerts */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Pemberitahuan Informasi Penting</h3>
              <p className="text-slate-500 dark:text-slate-400">Kirimkan ringkasan edaran resmi dan pengumuman mendaftar</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={emailNotif}
                onChange={(e) => setEmailNotif(e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
