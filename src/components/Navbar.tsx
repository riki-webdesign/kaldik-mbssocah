import React from 'react';
import { UserRole } from '../types';

interface NavbarProps {
  currentView: 'home' | 'dashboard';
  setCurrentView: (view: 'home' | 'dashboard') => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onOpenLoginModal?: () => void;
  onOpenLeaveModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  isDarkMode,
  toggleDarkMode,
  userRole,
  isLoggedIn = false,
  onLogout,
  onOpenLoginModal,
  onOpenLeaveModal
}) => {
  return (
    <nav className="sticky top-0 z-50 w-full transition-all duration-300 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={() => setCurrentView('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform bg-white/80 dark:bg-slate-800/80 p-0.5 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
              <img
                src="https://kaldik.babussalamsocah.com/Image/logo.png"
                alt="Logo Pondok Pesantren Babussalam Socah"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white font-poppins block uppercase leading-none">
                PONDOK PESANTREN
              </span>
              <span className="font-bold text-xs sm:text-sm tracking-wide text-emerald-600 dark:text-emerald-400 font-poppins block uppercase mt-0.5">
                BABUSALAM SOCAH
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => setCurrentView('home')}
              className={`transition-colors flex items-center gap-1.5 ${
                currentView === 'home' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400'
              }`}
            >
              <i className="fa-solid fa-house text-xs"></i>
              Beranda
            </button>
            <a href="#pilihan-bulan" className="text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <i className="fa-regular fa-calendar text-xs"></i>
              Pilihan Bulan
            </a>
            <a href="#agenda-semester" className="text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <i className="fa-solid fa-list-check text-xs"></i>
              Agenda (Semester)
            </a>
            <a href="#kalender-section" className="text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <i className="fa-solid fa-calendar-days text-xs"></i>
              Kalender
            </a>
            <button
              onClick={onOpenLeaveModal}
              className="text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 transition-colors flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 font-semibold"
            >
              <i className="fa-solid fa-suitcase-rolling text-xs"></i>
              Izin Pulang
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-amber-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-amber-400 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              <i className={`fa-solid ${isDarkMode ? 'fa-sun text-amber-400' : 'fa-moon text-slate-700'}`}></i>
            </button>

            {/* If Logged In */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                {/* Admin Status Pill */}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700/50 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{userRole === 'admin_utama' ? 'Admin Utama' : 'Ustadz'}</span>
                </div>

                {/* View Switch Button */}
                {currentView === 'home' ? (
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <i className="fa-solid fa-gauge-high text-xs"></i>
                    <span>Ke Dashboard</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentView('home')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-white dark:hover:bg-slate-700 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <i className="fa-solid fa-globe text-xs"></i>
                    <span>Halaman Depan</span>
                  </button>
                )}

                {/* Logout Button */}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800/50 transition-colors text-xs"
                    title="Keluar / Logout Akun"
                    aria-label="Logout"
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  </button>
                )}
              </div>
            ) : (
              /* If Not Logged In */
              <button
                onClick={onOpenLoginModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center gap-2 group"
              >
                <i className="fa-solid fa-right-to-bracket text-xs"></i>
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
