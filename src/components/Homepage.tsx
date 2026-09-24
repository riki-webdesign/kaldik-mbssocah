import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AgendaEvent, PrayerTime, UserRole } from '../types';

interface HomepageProps {
  onEnterDashboard: () => void;
  prayerTimes: PrayerTime[];
  todayEvents: AgendaEvent[];
  allEvents?: AgendaEvent[];
  onOpenLeaveModal?: () => void;
  isLoggedIn?: boolean;
  userRole?: UserRole;
  onLogout?: () => void;
  onSelectEvent?: (event: AgendaEvent) => void;
  onEditEvent?: (event: AgendaEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  onOpenAddModal?: () => void;
}

interface AcademicMonth {
  name: string;
  year: number;
  monthIndex: number; // 0-11 for JS Date
  semester: 'ganjil' | 'genap';
  code: string; // e.g. "2026-08"
}

export const Homepage: React.FC<HomepageProps> = ({
  onEnterDashboard,
  prayerTimes,
  todayEvents,
  allEvents = [],
  onOpenLeaveModal,
  isLoggedIn = false,
  userRole = 'santri',
  onLogout,
  onSelectEvent,
  onEditEvent,
  onDeleteEvent,
  onOpenAddModal
}) => {
  const isAdmin = Boolean(isLoggedIn) && (userRole === 'admin_utama' || userRole === 'ustadz');
  // Academic Year Months list (Tahun Pelajaran 2026/2027)
  const academicMonths: AcademicMonth[] = useMemo(() => [
    { name: 'Juli', year: 2026, monthIndex: 6, semester: 'ganjil', code: '2026-07' },
    { name: 'Agustus', year: 2026, monthIndex: 7, semester: 'ganjil', code: '2026-08' },
    { name: 'September', year: 2026, monthIndex: 8, semester: 'ganjil', code: '2026-09' },
    { name: 'Oktober', year: 2026, monthIndex: 9, semester: 'ganjil', code: '2026-10' },
    { name: 'November', year: 2026, monthIndex: 10, semester: 'ganjil', code: '2026-11' },
    { name: 'Desember', year: 2026, monthIndex: 11, semester: 'ganjil', code: '2026-12' },
    { name: 'Januari', year: 2027, monthIndex: 0, semester: 'genap', code: '2027-01' },
    { name: 'Februari', year: 2027, monthIndex: 1, semester: 'genap', code: '2027-02' },
    { name: 'Maret', year: 2027, monthIndex: 2, semester: 'genap', code: '2027-03' },
    { name: 'April', year: 2027, monthIndex: 3, semester: 'genap', code: '2027-04' },
    { name: 'Mei', year: 2027, monthIndex: 4, semester: 'genap', code: '2027-05' },
    { name: 'Juni', year: 2027, monthIndex: 5, semester: 'genap', code: '2027-06' },
  ], []);

  // State
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(1); // Default to Agustus 2026
  const [selectedSemester, setSelectedSemester] = useState<'semua' | 'ganjil' | 'genap'>('ganjil');
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const monthSliderRef = useRef<HTMLDivElement>(null);
  const semesterSliderRef = useRef<HTMLDivElement>(null);
  const desktopSemesterSliderRef = useRef<HTMLDivElement>(null);
  const [desktopPageIdx, setDesktopPageIdx] = useState<number>(0);

  const handleScrollSemesterSlider = (direction: 'left' | 'right') => {
    if (semesterSliderRef.current) {
      const scrollAmount = semesterSliderRef.current.clientWidth * 0.85;
      semesterSliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleDesktopPageChange = (pageIdx: number) => {
    setDesktopPageIdx(pageIdx);
    if (desktopSemesterSliderRef.current) {
      const pageWidth = desktopSemesterSliderRef.current.clientWidth;
      desktopSemesterSliderRef.current.scrollTo({
        left: pageIdx * pageWidth,
        behavior: 'smooth'
      });
    }
  };

  const handleScrollDesktopSemester = (direction: 'left' | 'right', totalPages: number) => {
    const nextIdx = direction === 'left'
      ? Math.max(0, desktopPageIdx - 1)
      : Math.min(totalPages - 1, desktopPageIdx + 1);
    handleDesktopPageChange(nextIdx);
  };

  const handleSelectMonth = (idx: number) => {
    setSelectedMonthIdx(idx);
    setSelectedDateStr(null);
    const targetCard = document.getElementById(`month-card-${idx}`);
    if (targetCard && monthSliderRef.current) {
      targetCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  const handlePrevMonth = () => {
    const nextIdx = selectedMonthIdx > 0 ? selectedMonthIdx - 1 : 11;
    handleSelectMonth(nextIdx);
  };

  const handleNextMonth = () => {
    const nextIdx = selectedMonthIdx < 11 ? selectedMonthIdx + 1 : 0;
    handleSelectMonth(nextIdx);
  };

  // Center active month in mobile slider on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const targetCard = document.getElementById(`month-card-${selectedMonthIdx}`);
      if (targetCard && monthSliderRef.current) {
        targetCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const activeMonth = academicMonths[selectedMonthIdx];

  // Real-time events list provided by Firestore
  const mergedEvents = useMemo(() => {
    return allEvents || [];
  }, [allEvents]);

  // Calendar Grid Calculation
  const calendarGrid = useMemo(() => {
    const year = activeMonth.year;
    const month = activeMonth.monthIndex;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday

    const grid = [];
    // Leading empty slots
    for (let i = 0; i < firstDayIndex; i++) {
      grid.push(null);
    }
    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      grid.push({
        dayNumber: d,
        dateString,
      });
    }
    return grid;
  }, [activeMonth]);

  // Date Range Helper: Format Event Date string
  const formatEventDate = (evt: AgendaEvent) => {
    if (evt.endDate && evt.endDate !== evt.startDate) {
      return `${evt.startDate} s.d. ${evt.endDate}`;
    }
    return evt.startDate;
  };

  // Map events to date strings (including all dates in multi-day range)
  const eventsByDate = useMemo(() => {
    const map: { [dateStr: string]: AgendaEvent[] } = {};
    mergedEvents.forEach((evt) => {
      const startStr = evt.startDate;
      const endStr = evt.endDate || evt.startDate;

      const [sy, sm, sd] = startStr.split('-').map(Number);
      const [ey, em, ed] = endStr.split('-').map(Number);

      const curr = new Date(sy, sm - 1, sd);
      const last = new Date(ey, em - 1, ed);

      while (curr <= last) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, '0');
        const d = String(curr.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        if (!map[dateStr]) map[dateStr] = [];
        if (!map[dateStr].some((item) => item.id === evt.id)) {
          map[dateStr].push(evt);
        }
        curr.setDate(curr.getDate() + 1);
      }
    });
    return map;
  }, [mergedEvents]);

  // Filtered Events for Semester View
  const semesterEvents = useMemo(() => {
    return mergedEvents.filter((evt) => {
      const endStr = evt.endDate || evt.startDate;
      const [, startMStr] = evt.startDate.split('-');
      const [, endMStr] = endStr.split('-');
      const startM = parseInt(startMStr, 10);
      const endM = parseInt(endMStr, 10);

      const isInGanjil = (startM >= 7 && startM <= 12) || (endM >= 7 && endM <= 12);
      const isInGenap = (startM >= 1 && startM <= 6) || (endM >= 1 && endM <= 6);

      if (selectedSemester === 'ganjil' && !isInGanjil) return false;
      if (selectedSemester === 'genap' && !isInGenap) return false;

      if (searchFilter.trim() !== '') {
        const q = searchFilter.toLowerCase();
        return (
          evt.title.toLowerCase().includes(q) ||
          evt.location.toLowerCase().includes(q) ||
          evt.description.toLowerCase().includes(q) ||
          evt.category.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [mergedEvents, selectedSemester, searchFilter]);

  // Group semester events in pairs of 2 for mobile 2-tier vertical stack slider
  const pairedSemesterEvents = useMemo(() => {
    const pairs: AgendaEvent[][] = [];
    for (let i = 0; i < semesterEvents.length; i += 2) {
      pairs.push(semesterEvents.slice(i, i + 2));
    }
    return pairs;
  }, [semesterEvents]);

  // Group semester events in pages of 12 (3 columns x 4 rows) for desktop & tablet slider
  const desktopSemesterPages = useMemo(() => {
    const pages: AgendaEvent[][] = [];
    const PAGE_SIZE = 12; // 3 columns x 4 rows = 12 items per slide
    for (let i = 0; i < semesterEvents.length; i += PAGE_SIZE) {
      pages.push(semesterEvents.slice(i, i + PAGE_SIZE));
    }
    return pages;
  }, [semesterEvents]);

  // Reset desktop page index if filter or semester changes
  useEffect(() => {
    setDesktopPageIdx(0);
    if (desktopSemesterSliderRef.current) {
      desktopSemesterSliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [selectedSemester, searchFilter]);

  // Selected Date Events (multi-day inclusive)
  const selectedDateEvents = useMemo(() => {
    if (!selectedDateStr) return [];
    return mergedEvents.filter((e) => {
      const endStr = e.endDate || e.startDate;
      return selectedDateStr >= e.startDate && selectedDateStr <= endStr;
    });
  }, [selectedDateStr, mergedEvents]);

  // Active Month Events (multi-day inclusive)
  const monthEvents = useMemo(() => {
    return mergedEvents.filter((e) => {
      const startYM = e.startDate.substring(0, 7);
      const endYM = (e.endDate || e.startDate).substring(0, 7);
      return activeMonth.code >= startYM && activeMonth.code <= endYM;
    });
  }, [mergedEvents, activeMonth]);

  // Category Color Helper
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'formal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border-blue-200 dark:border-blue-500/30';
      case 'diniyah':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30';
      case 'ibadah':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30';
      case 'asrama':
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border-purple-200 dark:border-purple-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-poppins">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-24 overflow-hidden bg-gradient-to-br from-white via-emerald-50/40 to-blue-50/40 dark:from-slate-950 dark:via-emerald-950/40 dark:to-blue-950/40 border-b border-slate-200 dark:border-slate-800">
        
        {/* Gambar 3 Santri Memakai Jas (Transparan 35% / Opacity 35%) */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center lg:justify-end opacity-35"
          style={{ opacity: 0.35 }}
        >
          {/* Overlay gradient mask to ensure total text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 dark:to-transparent z-10"></div>
          
          {/* High resolution photo background of 3 santri wearing suits */}
          <div className="relative w-full lg:w-2/3 h-full flex items-center justify-center pr-0 lg:pr-12">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80"
              alt="3 Santri Memakai Jas Almamater Pondok Pesantren Babusalam Socah"
              className="w-full h-full object-cover object-center filter contrast-110 saturate-110 scale-105"
              referrerPolicy="no-referrer"
            />
            {/* Custom SVG Illustration overlay of 3 Santri in Formal Suits & Peci */}
            <div className="absolute inset-0 flex items-center justify-center p-6 bg-emerald-950/20 mix-blend-overlay">
              <svg viewBox="0 0 800 400" className="w-full h-full max-w-2xl opacity-80" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Santri 1 Left - Wearing Green Jas & Peci */}
                <g transform="translate(180, 80)">
                  {/* Peci */}
                  <rect x="55" y="20" width="90" height="35" rx="6" fill="#0f172a" />
                  {/* Head */}
                  <circle cx="100" cy="80" r="35" fill="#f8fafc" opacity="0.9" />
                  {/* Jas Almamater */}
                  <path d="M30 130 C30 110, 170 110, 170 130 L190 280 L10 280 Z" fill="#059669" />
                  {/* Kemeja Putih & Dasi */}
                  <polygon points="100,130 85,190 100,210 115,190" fill="#ffffff" />
                  <polygon points="100,145 92,200 100,230 108,200" fill="#0284c7" />
                  {/* Kerah Jas */}
                  <path d="M60 130 L100 185 L80 130 Z" fill="#047857" />
                  <path d="M140 130 L100 185 L120 130 Z" fill="#047857" />
                </g>

                {/* Santri 2 Center (Utama) - Wearing Navy Jas & Peci */}
                <g transform="translate(320, 50)">
                  {/* Peci */}
                  <rect x="50" y="15" width="100" height="40" rx="8" fill="#0f172a" />
                  {/* Head */}
                  <circle cx="100" cy="80" r="38" fill="#f8fafc" opacity="0.9" />
                  {/* Jas Almamater */}
                  <path d="M20 135 C20 110, 180 110, 180 135 L200 300 L0 300 Z" fill="#0284c7" />
                  {/* Kemeja Putih & Dasi */}
                  <polygon points="100,135 82,200 100,225 118,200" fill="#ffffff" />
                  <polygon points="100,150 90,210 100,245 110,210" fill="#059669" />
                  {/* Kerah Jas */}
                  <path d="M55 135 L100 195 L75 135 Z" fill="#0369a1" />
                  <path d="M145 135 L100 195 L125 135 Z" fill="#0369a1" />
                </g>

                {/* Santri 3 Right - Wearing Dark Teal Jas & Peci */}
                <g transform="translate(470, 85)">
                  {/* Peci */}
                  <rect x="55" y="20" width="90" height="35" rx="6" fill="#0f172a" />
                  {/* Head */}
                  <circle cx="100" cy="80" r="35" fill="#f8fafc" opacity="0.9" />
                  {/* Jas Almamater */}
                  <path d="M30 130 C30 110, 170 110, 170 130 L190 280 L10 280 Z" fill="#0d9488" />
                  {/* Kemeja Putih & Dasi */}
                  <polygon points="100,130 85,190 100,210 115,190" fill="#ffffff" />
                  <polygon points="100,145 92,200 100,230 108,200" fill="#d97706" />
                  {/* Kerah Jas */}
                  <path d="M60 130 L100 185 L80 130 Z" fill="#0f766e" />
                  <path d="M140 130 L100 185 L120 130 Z" fill="#0f766e" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                Kaldik Santri & Informasi Agenda Resmi
              </div>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl lg:text-3xl text-slate-800 dark:text-slate-200 font-normal">
                  Agenda & Kalender Akademik
                </h2>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight font-poppins">
                  PONDOK PESANTREN <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 dark:from-emerald-400 dark:via-teal-300 dark:to-blue-400">
                    BABUSALAM SOCAH
                  </span>
                </h1>
              </div>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl font-light leading-relaxed">
                Sistem kalender pendidikan terpadu, agenda kegiatan santri pesantren & boarding, jadwal madrasah diniyah, dan program tahunan Pondok Pesantren Babusalam Socah, Bangkalan.
              </p>

              {/* Admin Session Notice (If Logged In) */}
              {isLoggedIn && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 truncate">
                      Sesi aktif sebagai <strong className="text-emerald-900 dark:text-emerald-200">{userRole === 'admin_utama' ? 'Admin Utama' : 'Ustadz'}</strong>. Anda dapat mengedit agenda secara realtime.
                    </p>
                  </div>
                  <button
                    onClick={onEnterDashboard}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-gauge-high text-xs"></i>
                    <span>Dashboard</span>
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={onEnterDashboard}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold text-base shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2.5"
                  >
                    <i className="fa-solid fa-gauge-high text-lg"></i>
                    <span>Buka Dashboard Admin</span>
                  </button>
                ) : (
                  <a
                    href="#kalender-section"
                    className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-base border border-slate-200 dark:border-slate-700/80 backdrop-blur-md transition-all flex items-center gap-2"
                  >
                    <i className="fa-solid fa-calendar-days text-emerald-600 dark:text-emerald-400"></i>
                    <span>Lihat Kalender Digital</span>
                  </a>
                )}

                {isLoggedIn && (
                  <a
                    href="#kalender-section"
                    className="px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-base border border-slate-200 dark:border-slate-700/80 backdrop-blur-md transition-all flex items-center gap-2"
                  >
                    <i className="fa-solid fa-calendar-days text-emerald-600 dark:text-emerald-400"></i>
                    <span>Lihat Kalender</span>
                  </a>
                )}

                {onOpenLeaveModal && (
                  <button
                    type="button"
                    onClick={onOpenLeaveModal}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-base shadow-lg shadow-amber-500/25 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2.5"
                  >
                    <i className="fa-solid fa-suitcase-rolling text-lg"></i>
                    <span>Formulir Izin Pulang</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Interactive Mockup Container */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl p-6 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-2xl shadow-emerald-200/40 dark:shadow-emerald-950/40 space-y-5">
                
                {/* Header Mockup */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-slate-800 p-0.5 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center shadow-xs">
                      <img
                        src="https://kaldik.babussalamsocah.com/Image/logo.png"
                        alt="Logo MBS Socah"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white font-poppins">Jadwal Shalat & Kegiatan</h3>
                      <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Majelis Tarjih Muhammadiyah (Socah)</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Aktif
                  </span>
                </div>

                {/* Prayer Times Ribbon */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {prayerTimes.slice(0, 6).map((pt) => (
                    <div
                      key={pt.name}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        pt.isNext
                          ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-400 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm shadow-emerald-500/10 dark:shadow-emerald-500/20 scale-105'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <i className={`fa-solid ${pt.icon} text-xs mb-1 block ${pt.isNext ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}></i>
                      <div className="text-[10px] font-medium leading-none">{pt.name}</div>
                      <div className="text-xs font-bold mt-1">{pt.time}</div>
                    </div>
                  ))}
                </div>

                {/* Mini Agenda List Preview */}
                <div className="space-y-2.5 pt-2">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Agenda Santri Hari Ini</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Babusalam Socah</span>
                  </div>

                  {todayEvents.slice(0, 3).map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            evt.category === 'formal'
                              ? 'bg-blue-500'
                              : evt.category === 'diniyah'
                              ? 'bg-emerald-500'
                              : evt.category === 'ibadah'
                              ? 'bg-amber-400'
                              : 'bg-orange-500'
                          }`}
                        ></div>
                        <div>
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">{evt.title}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                            <span><i className="fa-regular fa-clock text-[9px] mr-1"></i>{evt.startTime} - {evt.endTime}</span>
                            <span>•</span>
                            <span><i className="fa-solid fa-location-dot text-[9px] mr-1"></i>{evt.location}</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 capitalize">
                        {evt.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>



      {/* 1. PILIHAN BULAN (MONTH SELECTOR SECTION) */}
      <section id="pilihan-bulan" className="py-12 sm:py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-2">
                <i className="fa-regular fa-calendar-check"></i> FITUR 1: PILIHAN BULAN
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-poppins">
                Pilihan Bulan Kalender Akademik (TP 2026/2027)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Pilih bulan untuk melihat jadwal agenda kegiatan santri dan program Pondok Pesantren Babusalam Socah.
              </p>
            </div>

            {/* Prev & Next Month Controls */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={handlePrevMonth}
                aria-label="Bulan Sebelumnya"
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <i className="fa-solid fa-chevron-left text-[10px]"></i>
                <span>Bulan Sebelumnya</span>
              </button>
              <button
                onClick={handleNextMonth}
                aria-label="Bulan Berikutnya"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
              >
                <span>Bulan Berikutnya</span>
                <i className="fa-solid fa-chevron-right text-[10px]"></i>
              </button>
            </div>
          </div>

          {/* Mobile Swipe Hint Badge */}
          <div className="flex sm:hidden items-center justify-between pb-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <i className="fa-solid fa-arrows-left-right text-xs animate-pulse"></i>
              <span>Geser ke samping (slider)</span>
            </span>
            <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">
              Bulan {selectedMonthIdx + 1} / 12
            </span>
          </div>

          {/* Month Selector: Mobile Slider (Horizontal Scroll Snap) / Desktop Grid */}
          <div
            ref={monthSliderRef}
            className="flex sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 overflow-x-auto sm:overflow-x-visible pb-3 sm:pb-0 snap-x snap-mandatory scroll-smooth scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {academicMonths.map((m, idx) => {
              const isSelected = idx === selectedMonthIdx;
              const eventCountInMonth = mergedEvents.filter((e) => {
                const s = e.startDate.substring(0, 7);
                const end = (e.endDate || e.startDate).substring(0, 7);
                return m.code >= s && m.code <= end;
              }).length;

              return (
                <button
                  id={`month-card-${idx}`}
                  key={m.code}
                  onClick={() => handleSelectMonth(idx)}
                  className={`min-w-[175px] xs:min-w-[190px] sm:min-w-0 flex-shrink-0 sm:flex-shrink snap-center sm:snap-none p-4 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-500 shadow-xl shadow-emerald-600/25 scale-[1.02] ring-2 ring-emerald-400/50'
                      : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-emerald-300 dark:hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {m.semester === 'ganjil' ? 'Sem. Ganjil' : 'Sem. Genap'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {eventCountInMonth} Agenda
                    </span>
                  </div>

                  <div className="mt-2 text-lg font-extrabold font-poppins flex items-baseline justify-between">
                    <span>{m.name}</span>
                    <span className={`text-xs font-medium ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>{m.year}</span>
                  </div>

                  {isSelected && (
                    <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-[10px] text-emerald-100 font-medium">
                      <span>Bulan Aktif Terpilih</span>
                      <i className="fa-solid fa-circle-check"></i>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Pagination Indicator Dots */}
          <div className="flex sm:hidden items-center justify-center gap-1.5 pt-3">
            {academicMonths.map((m, idx) => (
              <button
                key={m.code}
                onClick={() => handleSelectMonth(idx)}
                aria-label={`Pilih bulan ${m.name}`}
                className={`transition-all rounded-full ${
                  idx === selectedMonthIdx
                    ? 'w-6 h-2 bg-emerald-600 dark:bg-emerald-400'
                    : 'w-2 h-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* 2. KALENDER GRID SECTION */}
      <section id="kalender-section" className="py-16 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold mb-2">
                <i className="fa-solid fa-calendar-days"></i> AGENDA & JADWAL BULANAN
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-poppins">
                Jadwal Kegiatan {activeMonth.name} {activeMonth.year}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Daftar rincian agenda harian dan program santri Pondok Pesantren Babusalam Socah untuk bulan {activeMonth.name}.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Ibadah / Tahfizh
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> KBM Formal
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Diniyah / Asrama
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Calendar Grid Box (7 cols) - Hidden on Mobile/Tablet, Displayed on Desktop */}
            <div className="hidden lg:block lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
              
              {/* Month Header Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-blue-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg">
                    <i className="fa-solid fa-calendar"></i>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg leading-tight font-poppins">{activeMonth.name} {activeMonth.year}</h3>
                    <p className="text-xs text-emerald-100 font-light">Pondok Pesantren Babusalam Socah</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
                  Semester {activeMonth.semester === 'ganjil' ? 'Ganjil' : 'Genap'}
                </span>
              </div>

              {/* Day Name Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase text-slate-400 dark:text-slate-500 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-rose-500">Ahad</span>
                <span>Senin</span>
                <span>Selasa</span>
                <span>Rabu</span>
                <span>Kamis</span>
                <span className="text-emerald-600 dark:text-emerald-400">Jumat</span>
                <span>Sabtu</span>
              </div>

              {/* Days Grid Cells */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarGrid.map((item, idx) => {
                  if (!item) {
                    return <div key={`empty-${idx}`} className="h-20 sm:h-24 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200/50 dark:border-slate-800/40"></div>;
                  }

                  const dateEvts = eventsByDate[item.dateString] || [];
                  const isSelectedDate = selectedDateStr === item.dateString;
                  const isToday = item.dateString === new Date().toISOString().split('T')[0];

                  return (
                    <button
                      key={item.dateString}
                      onClick={() => setSelectedDateStr(item.dateString)}
                      className={`h-20 sm:h-24 p-1.5 sm:p-2 rounded-xl text-left border transition-all flex flex-col justify-between group relative ${
                        isSelectedDate
                          ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400'
                          : isToday
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700'
                          : 'bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs sm:text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                          isToday
                            ? 'bg-blue-600 text-white'
                            : isSelectedDate
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {item.dayNumber}
                        </span>

                        {dateEvts.length > 0 && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                            {dateEvts.length}
                          </span>
                        )}
                      </div>

                      {/* Event Dot / Title Preview */}
                      <div className="space-y-1 overflow-hidden w-full">
                        {dateEvts.slice(0, 2).map((e) => (
                          <div
                            key={e.id}
                            className={`text-[9px] px-1 py-0.5 rounded truncate font-medium leading-none ${
                              e.category === 'formal'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
                                : e.category === 'diniyah'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                                : e.category === 'ibadah'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200'
                            }`}
                          >
                            {e.title}
                          </div>
                        ))}
                        {dateEvts.length > 2 && (
                          <div className="text-[8px] text-slate-400 font-semibold pl-1">
                            +{dateEvts.length - 2} kegiatan lagi
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Event Details Side Panel (Full Width on Mobile, 4 cols on Desktop) */}
            <div className="w-full lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
              
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {selectedDateStr ? `Agenda Tanggal ${selectedDateStr}` : `Agenda Bulan ${activeMonth.name}`}
                  </h3>
                  <p className="text-xs text-slate-500">Rincian kegiatan Pondok Pesantren Babusalam Socah</p>
                </div>
                {selectedDateStr && (
                  <button
                    onClick={() => setSelectedDateStr(null)}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                  >
                    Reset Tanggal
                  </button>
                )}
              </div>

              {/* Render Selected Date Events or Month Events */}
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {(selectedDateStr ? selectedDateEvents : monthEvents).length === 0 ? (
                  <div className="text-center py-10 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                    <i className="fa-solid fa-calendar-xmark text-3xl text-slate-400"></i>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {selectedDateStr
                        ? 'Tidak ada agenda khusus pada tanggal ini.'
                        : `Belum ada agenda tambahan untuk bulan ${activeMonth.name}.`}
                    </p>
                    {isAdmin && onOpenAddModal && (
                      <button
                        onClick={onOpenAddModal}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-all cursor-pointer"
                      >
                        <i className="fa-solid fa-plus text-xs"></i>
                        <span>Tambah Agenda</span>
                      </button>
                    )}
                  </div>
                ) : (
                  (selectedDateStr ? selectedDateEvents : monthEvents).map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => onSelectEvent && onSelectEvent(evt)}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 hover:border-emerald-400 dark:hover:border-emerald-500/80 transition-all cursor-pointer group shadow-sm hover:shadow relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${getCategoryBadge(evt.category)}`}>
                          {evt.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            <i className="fa-regular fa-calendar mr-1"></i>
                            {formatEventDate(evt)}
                          </span>
                          {isAdmin && (
                            <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                              {onEditEvent && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditEvent(evt);
                                  }}
                                  title="Edit Agenda"
                                  className="p-1 px-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-emerald-50 text-slate-600 dark:text-slate-200 hover:text-emerald-600 border border-slate-200 dark:border-slate-600 text-xs transition-colors cursor-pointer"
                                >
                                  <i className="fa-solid fa-pen-to-square"></i>
                                </button>
                              )}
                              {onDeleteEvent && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Apakah Anda yakin ingin menghapus agenda "${evt.title}" secara permanen dari server online?`)) {
                                      onDeleteEvent(evt.id);
                                    }
                                  }}
                                  title="Hapus Agenda dari Server Online"
                                  className="p-1 px-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-rose-50 text-slate-600 dark:text-slate-200 hover:text-rose-600 border border-slate-200 dark:border-slate-600 text-xs transition-colors cursor-pointer"
                                >
                                  <i className="fa-solid fa-trash-can"></i>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {evt.title}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {evt.description}
                      </p>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
                        <span><i className="fa-regular fa-clock mr-1 text-emerald-600 dark:text-emerald-400"></i>{evt.startTime || '07:00'} - {evt.endTime || 'Selesai'}</span>
                        <span><i className="fa-solid fa-location-dot mr-1 text-blue-600 dark:text-blue-400"></i>{evt.location}</span>
                      </div>

                      {evt.speakerOrTeacher && (
                        <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium pt-1 flex items-center gap-1">
                          <i className="fa-solid fa-user-tie"></i>
                          <span>Pengampu / Pembina: {evt.speakerOrTeacher}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 3. AGENDA (SEMESTER) SECTION */}
      <section id="agenda-semester" className="py-12 sm:py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-semibold mb-2">
                <i className="fa-solid fa-list-check"></i> FITUR 2: AGENDA (SEMESTER)
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-poppins">
                Daftar Agenda Kegiatan Berdasarkan Semester
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Filter dan jelajahi seluruh agenda akademis, diniyah, dan pesantren Pondok Pesantren Babusalam Socah untuk Semester Ganjil & Genap.
              </p>
            </div>

            {/* Semester Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 self-start md:self-auto max-w-full">
              <button
                onClick={() => setSelectedSemester('ganjil')}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedSemester === 'ganjil'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-graduation-cap"></i>
                <span>Semester Ganjil</span>
              </button>
              <button
                onClick={() => setSelectedSemester('genap')}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedSemester === 'genap'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-book-open-reader"></i>
                <span>Semester Genap</span>
              </button>
              <button
                onClick={() => setSelectedSemester('semua')}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedSemester === 'semua'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <i className="fa-solid fa-layer-group"></i>
                <span>Semua Semester</span>
              </button>
            </div>
          </div>

          {/* Search Box Filter & Slider Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
            <div className="relative max-w-md w-full">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Cari agenda semester (misal: PTS, PAS, MABA, Tahfizh)..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Slider Navigation & Status (Mobile + Desktop/Tablet) */}
            {semesterEvents.length > 0 && (
              <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                {/* Mobile Info */}
                <div className="flex md:hidden items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <i className="fa-solid fa-arrows-left-right text-xs animate-pulse"></i>
                  <span>Geser ({semesterEvents.length} Agenda)</span>
                </div>

                {/* Desktop/Tablet Info */}
                <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <i className="fa-solid fa-table-cells text-emerald-600 dark:text-emerald-400 text-xs"></i>
                  <span>
                    Slide <b>{desktopPageIdx + 1}</b> dari <b>{desktopSemesterPages.length}</b> ({semesterEvents.length} total agenda)
                  </span>
                </div>

                {/* Navigation Buttons (Works for both Mobile & Desktop) */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      handleScrollSemesterSlider('left');
                      handleScrollDesktopSemester('left', desktopSemesterPages.length);
                    }}
                    disabled={desktopPageIdx === 0 && desktopSemesterPages.length > 1}
                    aria-label="Geser Agenda ke Kiri"
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fa-solid fa-chevron-left text-[10px]"></i>
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </button>
                  <button
                    onClick={() => {
                      handleScrollSemesterSlider('right');
                      handleScrollDesktopSemester('right', desktopSemesterPages.length);
                    }}
                    disabled={desktopPageIdx === desktopSemesterPages.length - 1 && desktopSemesterPages.length > 1}
                    aria-label="Geser Agenda ke Kanan"
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <i className="fa-solid fa-chevron-right text-[10px]"></i>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Agenda Cards Section */}
          {semesterEvents.length === 0 ? (
            <div className="w-full py-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
              <i className="fa-solid fa-folder-open text-4xl text-slate-400"></i>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Tidak ada agenda ditemukan untuk kriteria pencarian ini.
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE: 2-ROW VERTICAL STACK HORIZONTAL SLIDER */}
              <div
                ref={semesterSliderRef}
                className="flex md:hidden gap-3.5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 -mx-4 px-4"
              >
                {pairedSemesterEvents.map((pair, colIdx) => (
                  <div
                    key={`col-${colIdx}`}
                    className="w-[86vw] xs:w-[320px] max-w-[340px] flex-shrink-0 snap-center flex flex-col gap-3"
                  >
                    {pair.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => onSelectEvent && onSelectEvent(evt)}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-400 transition-all shadow-sm space-y-2.5 flex flex-col justify-between flex-1 cursor-pointer group hover:shadow"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${getCategoryBadge(evt.category)}`}>
                              {evt.category}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                <i className="fa-regular fa-calendar text-emerald-600 dark:text-emerald-400 mr-1"></i>
                                {formatEventDate(evt)}
                              </span>
                              {isAdmin && (
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  {onEditEvent && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditEvent(evt);
                                      }}
                                      title="Edit Agenda"
                                      className="p-1 rounded-md bg-white dark:bg-slate-700 hover:bg-emerald-50 text-slate-600 dark:text-slate-200 hover:text-emerald-600 border border-slate-200 dark:border-slate-600 text-[10px] cursor-pointer"
                                    >
                                      <i className="fa-solid fa-pen-to-square"></i>
                                    </button>
                                  )}
                                  {onDeleteEvent && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`Apakah Anda yakin ingin menghapus agenda "${evt.title}" secara permanen dari server online?`)) {
                                          onDeleteEvent(evt.id);
                                        }
                                      }}
                                      title="Hapus Agenda dari Server Online"
                                      className="p-1 rounded-md bg-white dark:bg-slate-700 hover:bg-rose-50 text-slate-600 dark:text-slate-200 hover:text-rose-600 border border-slate-200 dark:border-slate-600 text-[10px] cursor-pointer"
                                    >
                                      <i className="fa-solid fa-trash-can"></i>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {evt.title}
                          </h3>

                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                            {evt.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 space-y-1">
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <i className="fa-regular fa-clock text-emerald-600 dark:text-emerald-400 text-[10px]"></i>
                              {evt.startTime || '07:00'} - {evt.endTime || 'Selesai'}
                            </span>
                            <span className="flex items-center gap-1 font-medium truncate max-w-[140px]">
                              <i className="fa-solid fa-location-dot text-blue-600 dark:text-blue-400 text-[10px]"></i>
                              {evt.location}
                            </span>
                          </div>

                          {evt.speakerOrTeacher && (
                            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium truncate">
                              Pembina: {evt.speakerOrTeacher}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* DESKTOP & TABLET: 3 COLUMNS X 4 ROWS (12 CARDS PER SLIDE) SLIDER */}
              <div className="hidden md:block space-y-5">
                <div
                  ref={desktopSemesterSliderRef}
                  onScroll={(e) => {
                    const target = e.currentTarget;
                    const page = Math.round(target.scrollLeft / (target.clientWidth || 1));
                    if (page !== desktopPageIdx && page >= 0 && page < desktopSemesterPages.length) {
                      setDesktopPageIdx(page);
                    }
                  }}
                  className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none gap-6 pb-2"
                >
                  {desktopSemesterPages.map((pageEvents, pIdx) => (
                    <div
                      key={`desktop-page-${pIdx}`}
                      className="w-full min-w-full flex-shrink-0 snap-start grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5"
                    >
                      {pageEvents.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => onSelectEvent && onSelectEvent(evt)}
                          className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all space-y-3 flex flex-col justify-between cursor-pointer group"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${getCategoryBadge(evt.category)}`}>
                                {evt.category}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                  <i className="fa-regular fa-calendar text-emerald-600 dark:text-emerald-400 mr-1.5"></i>
                                  {formatEventDate(evt)}
                                </span>
                                {isAdmin && (
                                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    {onEditEvent && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onEditEvent(evt);
                                        }}
                                        title="Edit Agenda"
                                        className="p-1 px-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-emerald-50 text-slate-600 dark:text-slate-200 hover:text-emerald-600 border border-slate-200 dark:border-slate-600 text-xs transition-colors cursor-pointer"
                                      >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                      </button>
                                    )}
                                    {onDeleteEvent && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (window.confirm(`Apakah Anda yakin ingin menghapus agenda "${evt.title}" secara permanen dari server online?`)) {
                                            onDeleteEvent(evt.id);
                                          }
                                        }}
                                        title="Hapus Agenda dari Server Online"
                                        className="p-1 px-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-rose-50 text-slate-600 dark:text-slate-200 hover:text-rose-600 border border-slate-200 dark:border-slate-600 text-xs transition-colors cursor-pointer"
                                      >
                                        <i className="fa-solid fa-trash-can"></i>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {evt.title}
                            </h3>

                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                              {evt.description}
                            </p>
                          </div>

                          <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                            <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <i className="fa-regular fa-clock text-emerald-600 dark:text-emerald-400 text-xs"></i>
                                {evt.startTime || '07:00'} - {evt.endTime || 'Selesai'}
                              </span>
                              <span className="flex items-center gap-1.5 font-medium truncate max-w-[160px]">
                                <i className="fa-solid fa-location-dot text-blue-600 dark:text-blue-400 text-xs"></i>
                                {evt.location}
                              </span>
                            </div>

                            {evt.speakerOrTeacher && (
                              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium truncate">
                                Pembina: {evt.speakerOrTeacher}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Desktop Slider Pagination Dots & Jump Controls */}
                {desktopSemesterPages.length > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    {desktopSemesterPages.map((_, dotIdx) => (
                      <button
                        key={`desktop-dot-${dotIdx}`}
                        onClick={() => handleDesktopPageChange(dotIdx)}
                        aria-label={`Ke slide halaman ${dotIdx + 1}`}
                        className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                          desktopPageIdx === dotIdx
                            ? 'w-8 bg-emerald-600 dark:bg-emerald-500 shadow-sm'
                            : 'w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </section>


      {/* INFORMASI PEMBINAAN & PROFIL LEMBAGA */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <i className="fa-solid fa-school"></i> Profil Singkat
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                PONDOK PESANTREN BABUSALAM SOCAH
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Lembaga pendidikan pondok pesantren berasrama yang memadukan keunggulan ilmu pengetahuan umum, sains, teknologi, serta pembinaan akhlak mulia, madrasah diniyah, dan tahfizh Al-Qur'an.
              </p>
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-location-dot text-emerald-600 dark:text-emerald-400"></i>
                  <span>Kecamatan Socah, Kabupaten Bangkalan, Jawa Timur</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-phone text-emerald-600 dark:text-emerald-400"></i>
                  <span>Kontak Layanan : <a href="https://wa.me/6281234955586" target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">081234955586</a></span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Visi Misi :</h4>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 italic">
                "Qur'ani, Gemilang, Berkemajuan"
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex justify-between">
                <span>Status: Pondok Pesantren Terakreditasi</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Babusalam Socah</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 py-12 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-white/80 dark:bg-slate-800/80 p-0.5 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
              <img
                src="https://kaldik.babussalamsocah.com/Image/logo.png"
                alt="Logo Pondok Pesantren Babussalam Socah"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="leading-tight">
              <span className="text-slate-900 dark:text-white font-extrabold text-sm font-poppins block uppercase leading-none">
                PONDOK PESANTREN
              </span>
              <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 font-poppins block uppercase mt-0.5">
                BABUSALAM SOCAH
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center">
            © {new Date().getFullYear()} Kaldik Santri – Pondok Pesantren Babusalam Socah. Hak Cipta Dilindungi.
          </p>

          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
            <a href="https://wa.me/6281234955586" target="_blank" rel="noopener noreferrer" aria-label="Kontak Layanan Whatsapp 081234955586" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"><i className="fa-brands fa-whatsapp text-lg"></i></a>
            <a href="#" aria-label="Instagram" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"><i className="fa-brands fa-instagram text-lg"></i></a>
            <a href="#" aria-label="Youtube" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"><i className="fa-brands fa-youtube text-lg"></i></a>
          </div>
        </div>
      </footer>

    </div>
  );
};
