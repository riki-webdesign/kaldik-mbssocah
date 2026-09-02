import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AgendaEvent, EventCategory } from '../types';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FullCalendar: any;
  }
}

interface CalendarViewProps {
  events: AgendaEvent[];
  onSelectEvent: (event: AgendaEvent) => void;
  onOpenAddModal: () => void;
  searchQuery?: string;
  userRole?: string;
  isLoggedIn?: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onSelectEvent,
  onOpenAddModal,
  searchQuery = '',
  userRole,
  isLoggedIn = false
}) => {
  const isAdmin = Boolean(isLoggedIn) && (userRole === 'admin_utama' || userRole === 'ustadz');
  const calendarRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calendarInstanceRef = useRef<any>(null);
  const onSelectEventRef = useRef(onSelectEvent);
  onSelectEventRef.current = onSelectEvent;

  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');

  // Filter events based on category & search query
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [events, selectedCategory, searchQuery]);

  // Convert AgendaEvent to FullCalendar event format
  const calendarEvents = useMemo(() => {
    return filteredEvents.map((e) => {
      let color = '#2563EB'; // formal - blue
      if (e.category === 'diniyah') color = '#059669'; // green
      if (e.category === 'ibadah') color = '#D97706'; // gold/yellow
      if (e.category === 'asrama') color = '#EA580C'; // orange

      const start = e.startTime ? `${e.startDate}T${e.startTime}:00` : e.startDate;
      let end: string | undefined = undefined;
      const endDate = e.endDate || e.startDate;

      if (e.endTime) {
        end = `${endDate}T${e.endTime}:00`;
      } else if (endDate !== e.startDate) {
        // FullCalendar allDay end date is exclusive, so add 1 day to endDate
        const d = new Date(endDate);
        d.setDate(d.getDate() + 1);
        end = d.toISOString().split('T')[0];
      }

      return {
        id: e.id,
        title: e.title,
        start: start,
        end: end,
        allDay: e.allDay || (!e.startTime && !e.endTime),
        backgroundColor: color,
        borderColor: color,
        textColor: '#FFFFFF',
        extendedProps: { ...e }
      };
    });
  }, [filteredEvents]);

  // Initialize and update FullCalendar via CDN window.FullCalendar
  useEffect(() => {
    if (!calendarRef.current) return;

    const renderOrUpdateCalendar = () => {
      if (window.FullCalendar && window.FullCalendar.Calendar) {
        if (!calendarInstanceRef.current) {
          calendarInstanceRef.current = new window.FullCalendar.Calendar(calendarRef.current, {
            initialView: 'dayGridMonth',
            headerToolbar: {
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            buttonText: {
              today: 'Hari Ini',
              month: 'Bulan',
              week: 'Pekan',
              day: 'Hari'
            },
            events: calendarEvents,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            eventClick: (info: any) => {
              const raw = info.event.extendedProps as AgendaEvent;
              onSelectEventRef.current(raw);
            },
            height: 'auto',
            aspectRatio: 1.5
          });
          calendarInstanceRef.current.render();
        } else {
          const cal = calendarInstanceRef.current;
          // Remove all existing event sources to prevent stale or duplicate events
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sources = cal.getEventSources();
          if (sources && sources.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            sources.forEach((src: any) => src.remove());
          }
          cal.removeAllEvents();
          cal.addEventSource(calendarEvents);
        }
      }
    };

    if (window.FullCalendar && window.FullCalendar.Calendar) {
      renderOrUpdateCalendar();
    } else {
      const interval = setInterval(() => {
        if (window.FullCalendar && window.FullCalendar.Calendar) {
          clearInterval(interval);
          renderOrUpdateCalendar();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [calendarEvents]);

  const categoryChips: { id: EventCategory | 'all'; label: string; color: string; count: number }[] = [
    { id: 'all', label: 'Semua Kegiatan', color: 'bg-slate-700', count: events.length },
    { id: 'formal', label: 'Sekolah Formal', color: 'bg-blue-600', count: events.filter((e) => e.category === 'formal').length },
    { id: 'diniyah', label: 'Madrasah Diniyah', color: 'bg-emerald-600', count: events.filter((e) => e.category === 'diniyah').length },
    { id: 'ibadah', label: 'Ibadah & Shalat', color: 'bg-amber-600', count: events.filter((e) => e.category === 'ibadah').length },
    { id: 'asrama', label: 'Kegiatan Asrama', color: 'bg-orange-600', count: events.filter((e) => e.category === 'asrama').length }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-4">
      {/* Category Filter Pills & Add Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categoryChips.map((chip) => {
            const isSelected = selectedCategory === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setSelectedCategory(chip.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? `${chip.color} text-white shadow-md shadow-slate-900/10 scale-105`
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{chip.label}</span>
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isAdmin && (
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <i className="fa-solid fa-cloud-arrow-up"></i>
              <span>Upload / Tambah Agenda</span>
            </button>
          )}
        </div>
      </div>

      {/* FullCalendar Interactive Stage */}
      <div className="fullcalendar-wrapper min-h-[500px]">
        <div ref={calendarRef} id="calendar"></div>
      </div>

      {/* Calendar Color Legend */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <i className="fa-solid fa-circle-info text-emerald-500"></i>
          Petunjuk Kategori:
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            Sekolah Formal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            Madrasah Diniyah
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            Ibadah & Shalat
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
            Kegiatan Asrama
          </span>
        </div>
      </div>
    </div>
  );
};
