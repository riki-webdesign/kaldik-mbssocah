import React, { useState, useEffect } from 'react';
import { AgendaEvent, EventCategory } from '../types';

interface EditEventModalProps {
  isOpen: boolean;
  event: AgendaEvent | null;
  onClose: () => void;
  onSaveEvent?: (updatedEvent: AgendaEvent) => void;
  onUpdateEvent?: (updatedEvent: AgendaEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  event,
  onClose,
  onSaveEvent,
  onUpdateEvent,
  onDeleteEvent
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('formal');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:30');
  const [location, setLocation] = useState('');
  const [speakerOrTeacher, setSpeakerOrTeacher] = useState('');
  const [description, setDescription] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setCategory(event.category || 'formal');
      setStartDate(event.startDate || new Date().toISOString().split('T')[0]);
      setEndDate(event.endDate || '');
      setStartTime(event.startTime || '08:00');
      setEndTime(event.endTime || '09:30');
      setLocation(event.location || 'Pondok Pesantren Babusalam Socah');
      setSpeakerOrTeacher(event.speakerOrTeacher || '');
      setDescription(event.description || '');
      setIsDone(Boolean(event.isDone));
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updated: AgendaEvent = {
      ...event,
      title: title.trim(),
      category,
      startDate,
      endDate: endDate ? endDate : undefined,
      startTime,
      endTime,
      location: location.trim() || 'Pondok Pesantren Babusalam Socah',
      speakerOrTeacher: speakerOrTeacher.trim(),
      description: description.trim(),
      isDone
    };

    const handleSave = onUpdateEvent || onSaveEvent;
    if (handleSave) {
      handleSave(updated);
    }
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus agenda "${event.title}"?`)) {
      if (onDeleteEvent) {
        onDeleteEvent(event.id);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base shadow-sm">
              <i className="fa-solid fa-pen-to-square"></i>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-poppins">
                Edit Konten Agenda
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ubah rincian, waktu, lokasi atau pengampu agenda pesantren
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Judul */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Judul Kegiatan / Agenda *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Kajian Kitab Kuning Fathul Qorib"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-medium"
            />
          </div>

          {/* Kategori & Status Selesai */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Agenda
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="formal">Pendidikan Formal / KBM</option>
                <option value="diniyah">Madrasah Diniyah</option>
                <option value="ibadah">Ibadah & Shalat</option>
                <option value="asrama">Kegiatan Asrama</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Pelaksanaan
              </label>
              <div className="flex items-center gap-2 h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  id="edit-isDone"
                  checked={isDone}
                  onChange={(e) => setIsDone(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="edit-isDone" className="text-slate-700 dark:text-slate-300 cursor-pointer font-medium">
                  {isDone ? 'Sudah Terlaksana' : 'Belum Terlaksana'}
                </label>
              </div>
            </div>
          </div>

          {/* Tanggal Mulai & Sampai */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Mulai *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Selesai (Opsional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Jam Mulai & Selesai */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jam Mulai
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jam Selesai
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Lokasi & Pembina */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lokasi Kegiatan
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Masjid / Aula / Ruang Kelas"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pengampu / Pembimbing
              </label>
              <input
                type="text"
                value={speakerOrTeacher}
                onChange={(e) => setSpeakerOrTeacher(e.target.value)}
                placeholder="Ust. M. Syukri, Lc."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan / Deskripsi Agenda
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rincian kitab yang dibahas, perlengkapan yang wajib dibawa santri, dll..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            ></textarea>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <i className="fa-solid fa-trash-can"></i>
              <span>Hapus Agenda</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <i className="fa-solid fa-check"></i>
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
