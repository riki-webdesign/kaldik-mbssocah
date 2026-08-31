import React, { useState } from 'react';
import { AgendaEvent, EventCategory } from '../types';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: AgendaEvent) => void;
  onAddBatchEvents?: (events: AgendaEvent[]) => void;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onAddEvent,
  onAddBatchEvents
}) => {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  // Single form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('formal');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:30');
  const [location, setLocation] = useState('Pondok Pesantren Babusalam Socah');
  const [speakerOrTeacher, setSpeakerOrTeacher] = useState('');
  const [description, setDescription] = useState('');

  // Batch upload state
  const [batchRawText, setBatchRawText] = useState('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newEvt: AgendaEvent = {
      id: `evt-${Date.now()}`,
      title,
      category,
      startDate,
      endDate: endDate || undefined,
      startTime,
      endTime,
      location: location || 'Pondok Pesantren Babusalam Socah',
      description,
      speakerOrTeacher,
      isDone: false
    };

    onAddEvent(newEvt);
    onClose();

    // Reset form
    setTitle('');
    setEndDate('');
    setDescription('');
    setSpeakerOrTeacher('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setBatchRawText(content);
        setUploadSuccessMsg(`File "${file.name}" berhasil dimuat.`);
        setUploadErrorMsg(null);
      }
    };
    reader.readAsText(file);
  };

  const handleProcessBatchImport = () => {
    if (!batchRawText.trim()) {
      setUploadErrorMsg('Data upload tidak boleh kosong.');
      return;
    }

    try {
      let importedList: AgendaEvent[] = [];

      if (batchRawText.trim().startsWith('[') || batchRawText.trim().startsWith('{')) {
        // Try JSON parse
        const parsed = JSON.parse(batchRawText);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        importedList = arr.map((item, idx) => ({
          id: `evt-batch-${Date.now()}-${idx}`,
          title: item.title || item.Judul || 'Agenda Tanpa Judul',
          category: (item.category || item.Kategori || 'formal') as EventCategory,
          startDate: item.startDate || item.Tanggal || new Date().toISOString().split('T')[0],
          startTime: item.startTime || item.JamMulai || '07:00',
          endTime: item.endTime || item.JamSelesai || '12:00',
          location: item.location || item.Lokasi || 'Pondok Pesantren Babusalam Socah',
          description: item.description || item.Deskripsi || 'Diunggah oleh Admin Utama',
          speakerOrTeacher: item.speakerOrTeacher || item.Pengampu || 'Pembina Babusalam Socah',
          isDone: false
        }));
      } else {
        // Simple CSV parser (Judul, Tanggal, JamMulai, JamSelesai, Kategori, Lokasi)
        const lines = batchRawText.trim().split('\n');
        lines.forEach((line, idx) => {
          if (idx === 0 && line.toLowerCase().includes('judul')) return; // skip header
          const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 2) {
            importedList.push({
              id: `evt-csv-${Date.now()}-${idx}`,
              title: cols[0],
              startDate: cols[1] || new Date().toISOString().split('T')[0],
              startTime: cols[2] || '08:00',
              endTime: cols[3] || '10:00',
              category: (cols[4] as EventCategory) || 'formal',
              location: cols[5] || 'Pondok Pesantren Babusalam Socah',
              description: cols[6] || 'Import kalender CSV',
              speakerOrTeacher: 'Dewan Guru',
              isDone: false
            });
          }
        });
      }

      if (importedList.length > 0) {
        if (onAddBatchEvents) {
          onAddBatchEvents(importedList);
        } else {
          importedList.forEach((e) => onAddEvent(e));
        }
        setUploadSuccessMsg(`Berhasil mengimpor ${importedList.length} agenda ke dalam Kalender!`);
        setTimeout(() => {
          onClose();
          setBatchRawText('');
          setUploadSuccessMsg(null);
        }, 1200);
      } else {
        setUploadErrorMsg('Format file atau teks tidak valid. Gunakan format JSON atau CSV.');
      }
    } catch (err) {
      console.error(err);
      setUploadErrorMsg('Gagal memproses file. Pastikan format JSON/CSV valid.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-emerald-500/20">
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-poppins">
                Kelola Agenda & Kalender (Admin Utama)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tambah agenda satuan atau upload batch file kalender
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

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'single'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <i className="fa-solid fa-pen-to-square"></i>
            <span>Tambah Satuan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('batch')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'batch'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <i className="fa-solid fa-file-csv"></i>
            <span>Upload File Kalender (CSV/JSON)</span>
          </button>
        </div>

        {/* Mode 1: Single Form */}
        {activeTab === 'single' ? (
          <form onSubmit={handleSubmitSingle} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Judul Kegiatan / Agenda *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Try Out PTS Kurikulum Merdeka VII-IX"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori
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
                  Tanggal Mulai *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (!endDate || endDate < e.target.value) {
                      setEndDate(e.target.value);
                    }
                  }}
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
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lokasi Kegiatan
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Pondok Pesantren Babusalam Socah / Masjid Utama"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pengampu / Pembina
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

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deskripsi
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi atau rincian agenda..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              ></textarea>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <i className="fa-solid fa-plus"></i>
                <span>Simpan Ke Kalender</span>
              </button>
            </div>
          </form>
        ) : (
          /* Mode 2: File Upload / Batch JSON CSV */
          <div className="space-y-4 text-xs">
            <div className="border-2 border-dashed border-emerald-300 dark:border-emerald-500/40 rounded-2xl p-6 text-center bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center text-xl font-bold">
                <i className="fa-solid fa-file-arrow-up"></i>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Pilih atau Tarik File Kalender</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Mendukung format .json dan .csv</p>
              </div>
              <label className="inline-block px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-colors">
                <span>Pilih File Dari Komputer</span>
                <input
                  type="file"
                  accept=".json,.csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Atau Tempel Teks Data Kalender (JSON / CSV):
              </label>
              <textarea
                rows={5}
                value={batchRawText}
                onChange={(e) => setBatchRawText(e.target.value)}
                placeholder={`Contoh CSV:
Judul, Tanggal, JamMulai, JamSelesai, Kategori, Lokasi
"Masa Bimbingan Santri", "2026-07-15", "07:00", "15:00", "asrama", "Babusalam Socah"
"KBM Semester Ganjil", "2026-08-11", "07:00", "12:30", "formal", "Kelas VII-IX"`}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              ></textarea>
            </div>

            {uploadSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold text-xs border border-emerald-300 dark:border-emerald-800 flex items-center gap-2">
                <i className="fa-solid fa-circle-check"></i>
                <span>{uploadSuccessMsg}</span>
              </div>
            )}

            {uploadErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-semibold text-xs border border-rose-300 dark:border-rose-800 flex items-center gap-2">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>{uploadErrorMsg}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessBatchImport}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <i className="fa-solid fa-file-import"></i>
                <span>Proses Upload & Impor</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
