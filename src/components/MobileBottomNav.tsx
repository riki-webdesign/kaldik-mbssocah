import React, { useState, useEffect } from 'react';

interface MobileBottomNavProps {
  onOpenLeaveModal?: () => void;
  isHidden?: boolean;
  isLoggedIn?: boolean;
  onEnterDashboard?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
  onOpenLeaveModal,
  isHidden = false,
  isLoggedIn = false,
  onEnterDashboard
}) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('beranda');

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      
      // Deteksi ketika berhenti scroll (setelah 400ms)
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const shouldHide = isHidden || isScrolling;

  return (
    <div
      className={`lg:hidden fixed bottom-4 left-4 right-4 z-30 transition-all duration-300 ease-in-out ${
        shouldHide ? 'opacity-0 translate-y-12 pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl rounded-2xl flex items-center justify-between px-4 py-2.5">
        <a 
          href="#" 
          onClick={() => { setActiveTab('beranda'); window.scrollTo({top: 0, behavior: 'smooth'}); }}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'beranda' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
        >
          <i className="fa-solid fa-house text-base"></i>
          <span className="text-[10px] font-semibold">Beranda</span>
        </a>
        
        <a 
          href="#pilihan-bulan" 
          onClick={() => setActiveTab('bulan')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'bulan' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
        >
          <i className="fa-regular fa-calendar-check text-base"></i>
          <span className="text-[10px] font-semibold">Bulan</span>
        </a>

        {/* Center Floating Action Button: Izin Pulang */}
        {onOpenLeaveModal && (
          <button
            type="button"
            onClick={onOpenLeaveModal}
            className="-mt-6 w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex flex-col items-center justify-center shadow-lg shadow-amber-500/40 border-2 border-white dark:border-slate-800 active:scale-95 transition-transform cursor-pointer"
            title="Formulir Izin Pulang Santri"
          >
            <i className="fa-solid fa-suitcase-rolling text-base"></i>
          </button>
        )}

        <a 
          href="#agenda-semester" 
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'agenda' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
        >
          <i className="fa-solid fa-list-check text-base"></i>
          <span className="text-[10px] font-semibold">Agenda</span>
        </a>

        <a 
          href="#kalender-section" 
          onClick={() => setActiveTab('kalender')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'kalender' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
        >
          <i className="fa-solid fa-calendar-days text-base"></i>
          <span className="text-[10px] font-semibold">Kalender</span>
        </a>
      </div>
    </div>
  );
};
