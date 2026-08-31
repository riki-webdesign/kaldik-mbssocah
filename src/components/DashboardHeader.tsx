import React, { useEffect, useState } from 'react';
import { UserRole } from '../types';

interface DashboardHeaderProps {
  activeTab: string;
  onOpenAddModal: () => void;
  onOpenNotifDrawer: () => void;
  onToggleMobileSidebar: () => void;
  unreadNotifCount: number;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  userRole: UserRole;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeTab,
  onOpenAddModal,
  onOpenNotifDrawer,
  onToggleMobileSidebar,
  unreadNotifCount,
  isDarkMode,
  toggleDarkMode,
  userRole,
  searchQuery,
  setSearchQuery
}) => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'beranda':
        return 'Ringkasan Agenda Pesantren';
      case 'kalender':
        return 'Kalender Akademik & Ibadah';
      case 'agenda':
        return 'Jadwal Agenda Saya';
      case 'pengumuman':
        return 'Papan Pengumuman Official';
      case 'realtime':
        return 'Pusat Data Real-time & API';
      default:
        return 'Dashboard Kaldik Santri';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-3.5 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-4">
        
        {/* Left Side: Mobile Toggle + Page Title + Time */}
        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Open Sidebar"
          >
            <i className="fa-solid fa-bars text-lg"></i>
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-poppins truncate">
              {getPageTitle()}
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 mt-0.5">
              <span className="truncate"><i className="fa-regular fa-calendar-check text-emerald-500 mr-1"></i>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="hidden sm:inline">•</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold shrink-0">{timeString}</span>
            </p>
          </div>
        </div>

        {/* Right Side: Search + Add Button + Notifications + Dark Mode Toggle */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative hidden sm:block w-48 lg:w-64">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kegiatan, kitab, lokasi..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          {/* Role Status Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <span className={`w-2 h-2 rounded-full ${userRole === 'admin_utama' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`}></span>
            <span className="text-slate-700 dark:text-slate-200">
              {userRole === 'admin_utama' ? 'Akun Admin Utama' : userRole === 'ustadz' ? 'Akun Ustadz' : 'Akun Santri'}
            </span>
          </div>

          {/* Upload & Add Agenda Button for Admin Utama & Ustadz */}
          {userRole === 'admin_utama' && (
            <button
              onClick={onOpenAddModal}
              className="hidden sm:flex px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all items-center gap-1.5 whitespace-nowrap"
            >
              <i className="fa-solid fa-cloud-arrow-up text-xs"></i>
              <span className="hidden sm:inline">Upload / Tambah Agenda</span>
            </button>
          )}

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifDrawer}
            className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            title="Pengingat & Push Notification"
            aria-label="Open Notifications"
          >
            <i className="fa-solid fa-bell text-sm"></i>
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* Dark Mode Switcher */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            <i className={`fa-solid ${isDarkMode ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-600'}`}></i>
          </button>
        </div>

      </div>
    </header>
  );
};
