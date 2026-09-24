import React from 'react';
import { UserRole } from '../types';

interface DashboardSidebarProps {
  activeTab: 'beranda' | 'kalender' | 'agenda' | 'pengumuman' | 'realtime' | 'pengaturan';
  setActiveTab: (tab: 'beranda' | 'kalender' | 'agenda' | 'pengumuman' | 'realtime' | 'pengaturan') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onLogout: () => void;
  onNavigateHome?: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  unreadNotifCount: number;
  onOpenLeaveModal?: () => void;
}

interface NavItem {
  id: 'beranda' | 'kalender' | 'agenda' | 'pengumuman' | 'realtime' | 'pengaturan';
  label: string;
  icon: string;
  badge?: number;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  onLogout,
  onNavigateHome,
  isOpenMobile,
  setIsOpenMobile,
  unreadNotifCount,
  onOpenLeaveModal
}) => {
  const navItems: NavItem[] = [
    { id: 'beranda', label: 'Beranda', icon: 'fa-house-chimney' },
    { id: 'kalender', label: 'Kalender Utama', icon: 'fa-calendar-days' },
    { id: 'agenda', label: 'Agenda Saya', icon: 'fa-list-check' },
    { id: 'pengumuman', label: 'Pengumuman', icon: 'fa-bullhorn', badge: unreadNotifCount > 0 ? unreadNotifCount : undefined },
    { id: 'realtime', label: 'Manajemen Data', icon: 'fa-sliders' },
    { id: 'pengaturan', label: 'Pengaturan', icon: 'fa-gear' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-sm lg:hidden"
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[260px] bg-gradient-to-b from-white via-blue-50/50 to-emerald-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 text-slate-900 dark:text-white flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 shadow-2xl lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Top Header */}
          <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white/80 dark:bg-slate-800/80 p-0.5 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                <img
                  src="https://kaldik.babussalamsocah.com/Image/logo.png"
                  alt="Logo Pondok Pesantren Babussalam Socah"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="leading-tight">
                <h2 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white font-poppins uppercase leading-none">
                  PONDOK PESANTREN
                </h2>
                <span className="font-bold text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-poppins block uppercase mt-0.5">
                  BABUSALAM SOCAH
                </span>
              </div>
            </div>

            {/* Close Button Mobile */}
            <button
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>


          {/* Navigation Menu Links */}
          <nav className="px-3 space-y-1.5 mt-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpenMobile(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-500/20 dark:to-blue-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <i
                      className={`fa-solid ${item.icon} text-base transition-transform group-hover:scale-110 ${
                        isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-slate-300'
                      }`}
                    ></i>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500 text-white dark:text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Izin Pulang Shortcut in Sidebar */}
          {onOpenLeaveModal && (
            <div className="px-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  onOpenLeaveModal();
                  setIsOpenMobile(false);
                }}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-300/60 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 text-left transition-all group flex items-center gap-3 shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm shadow-sm group-hover:scale-110 transition-transform flex-shrink-0">
                  <i className="fa-solid fa-suitcase-rolling"></i>
                </div>
                <div>
                  <span className="block text-xs font-bold leading-tight">Formulir Izin Pulang</span>
                  <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80 font-normal">Formulir Perpulangan Santri</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Bottom Profile & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 mb-3 shadow-sm dark:shadow-none">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-inner">
              {userRole === 'admin_utama' ? 'AU' : userRole === 'ustadz' ? 'US' : 'RS'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {userRole === 'admin_utama' ? 'Admin Utama Babusalam Socah' : userRole === 'ustadz' ? 'Ust. Syukri, Lc.' : 'M. Raihan (Santri)'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium">
                {userRole === 'admin_utama' ? 'Pengelola Kaldik & Agenda' : userRole === 'ustadz' ? 'NIP: 19880211' : 'NIS: 20240101'}
              </p>
            </div>
          </div>

          {/* Navigation to Public Landing Page (Does NOT Logout) */}
          {onNavigateHome && (
            <button
              onClick={() => {
                onNavigateHome();
                setIsOpenMobile(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800/50 text-xs font-semibold transition-all shadow-sm dark:shadow-none mb-2"
            >
              <i className="fa-solid fa-globe text-emerald-600 dark:text-emerald-400"></i>
              <span>Lihat Halaman Depan</span>
            </button>
          )}

          {/* Real Logout Button (Clears session) */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-transparent hover:border-rose-200 dark:hover:border-rose-800/50 text-[11px] font-semibold transition-all"
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            <span>Keluar Akun (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
};
