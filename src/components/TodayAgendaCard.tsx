import React from 'react';
import { AgendaEvent, UserRole } from '../types';

interface TodayAgendaCardProps {
  events: AgendaEvent[];
  onToggleDone: (eventId: string) => void;
  onSelectEvent: (event: AgendaEvent) => void;
  onOpenAddModal: () => void;
  onEditEvent?: (event: AgendaEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  userRole?: UserRole;
  isLoggedIn?: boolean;
}

export const TodayAgendaCard: React.FC<TodayAgendaCardProps> = ({
  events,
  onToggleDone,
  onSelectEvent,
  onOpenAddModal,
  onEditEvent,
  onDeleteEvent,
  userRole,
  isLoggedIn = false
}) => {
  const isAdmin = Boolean(isLoggedIn) && (userRole === 'admin_utama' || userRole === 'ustadz');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm">
            <i className="fa-solid fa-list-check"></i>
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white font-poppins">Agenda Hari Ini</h3>
            <p className="text-[11px] text-slate-400">Jadwal kegiatan terdaftar untuk hari ini</p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={onOpenAddModal}
            className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold transition-colors flex items-center gap-1"
            title="Tambah Agenda"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Tambah</span>
          </button>
        )}
      </div>

      {/* Agenda Items List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <i className="fa-solid fa-calendar-xmark text-2xl text-slate-300 dark:text-slate-700"></i>
            <p className="text-xs">Tidak ada agenda untuk hari ini.</p>
          </div>
        ) : (
          events.map((evt) => (
            <div
              key={evt.id}
              className={`p-3 rounded-xl border transition-all ${
                evt.isDone
                  ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                  : 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-500/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <button
                    onClick={() => onToggleDone(evt.id)}
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center text-[10px] transition-colors shrink-0 ${
                      evt.isDone
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                        : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                    }`}
                    title={evt.isDone ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
                  >
                    {evt.isDone && <i className="fa-solid fa-check"></i>}
                  </button>

                  <div className="cursor-pointer flex-1 min-w-0" onClick={() => onSelectEvent(evt)}>
                    <h4
                      className={`text-xs font-semibold text-slate-900 dark:text-slate-100 truncate ${
                        evt.isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {evt.title}
                    </h4>
                    
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                        <i className="fa-regular fa-clock"></i>
                        {evt.startTime} - {evt.endTime}
                      </span>
                      <span>•</span>
                      <span className="truncate flex items-center gap-1">
                        <i className="fa-solid fa-location-dot text-slate-400"></i>
                        {evt.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-semibold capitalize ${
                      evt.category === 'formal'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        : evt.category === 'diniyah'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : evt.category === 'ibadah'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300'
                    }`}
                  >
                    {evt.category}
                  </span>

                  {isAdmin && onEditEvent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditEvent(evt);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                      title="Edit Agenda"
                    >
                      <i className="fa-solid fa-pen-to-square text-xs"></i>
                    </button>
                  )}

                  {isAdmin && onDeleteEvent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Hapus agenda "${evt.title}"?`)) {
                          onDeleteEvent(evt.id);
                        }
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Hapus Agenda"
                    >
                      <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
