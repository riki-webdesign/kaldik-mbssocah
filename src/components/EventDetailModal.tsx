import React from 'react';
import { AgendaEvent, UserRole } from '../types';

interface EventDetailModalProps {
  event: AgendaEvent | null;
  onClose: () => void;
  onToggleDone: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
  onEditEvent?: (event: AgendaEvent) => void;
  userRole?: UserRole;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onToggleDone,
  onDeleteEvent,
  onEditEvent,
  userRole
}) => {
  if (!event) return null;

  const isAdmin = userRole === 'admin_utama' || userRole === 'ustadz' || !userRole;

  const handleDelete = () => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus agenda "${event.title}"?`)) {
      onDeleteEvent(event.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="space-y-1">
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase ${
                event.category === 'formal'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  : event.category === 'diniyah'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : event.category === 'ibadah'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
              }`}
            >
              {event.category}
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-poppins mt-1">
              {event.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Event Meta Details */}
        <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <i className="fa-regular fa-clock text-emerald-500 text-base"></i>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                {event.endDate && event.endDate !== event.startDate
                  ? `${event.startDate} s.d. ${event.endDate}`
                  : event.startDate}{' '}
                • {event.startTime || 'All Day'} {event.endTime ? `- ${event.endTime}` : ''}
              </p>
              <p className="text-[10px] text-slate-400">Waktu Pelaksanaan</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <i className="fa-solid fa-location-dot text-blue-500 text-base"></i>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{event.location}</p>
              <p className="text-[10px] text-slate-400">Lokasi Pesantren</p>
            </div>
          </div>

          {event.speakerOrTeacher && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <i className="fa-solid fa-user-tie text-amber-500 text-base"></i>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{event.speakerOrTeacher}</p>
                <p className="text-[10px] text-slate-400">Pengampu / Pembimbing</p>
              </div>
            </div>
          )}

          {event.description && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Catatan Agenda</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{event.description}</p>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Hapus Agenda Ini"
              >
                <i className="fa-solid fa-trash-can"></i>
                <span>Hapus</span>
              </button>

              {onEditEvent && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditEvent(event);
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Edit Konten Agenda"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                  <span>Edit</span>
                </button>
              )}
            </div>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onToggleDone(event.id);
                onClose();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                event.isDone
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
              }`}
            >
              <i className={`fa-solid ${event.isDone ? 'fa-rotate-left' : 'fa-check'}`}></i>
              <span>{event.isDone ? 'Batal Selesai' : 'Selesai'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
