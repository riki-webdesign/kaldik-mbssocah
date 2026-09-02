import React, { useState } from 'react';
import { Announcement, UserRole } from '../types';

interface AnnouncementCardProps {
  announcements: Announcement[];
  userRole?: UserRole;
  isLoggedIn?: boolean;
  onAddAnnouncement?: (anc: Announcement) => void;
  onDeleteAnnouncement?: (id: string) => void;
  onUpdateAnnouncement?: (anc: Announcement) => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcements,
  userRole,
  isLoggedIn = false,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onUpdateAnnouncement
}) => {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  // New announcement form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Penting' | 'Akademik' | 'Kegiatan' | 'Informasi'>('Informasi');
  const [author, setAuthor] = useState('Admin Utama Babusalam Socah');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<'Penting' | 'Akademik' | 'Kegiatan' | 'Informasi'>('Informasi');
  const [editAuthor, setEditAuthor] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editIsImportant, setEditIsImportant] = useState(false);

  const isAdmin = Boolean(isLoggedIn) && (userRole === 'admin_utama' || userRole === 'ustadz');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newAnc: Announcement = {
      id: `anc-${Date.now()}`,
      title: title.trim(),
      category,
      date: new Date().toISOString().split('T')[0],
      content: content.trim(),
      author: author.trim() || 'Admin Utama Babusalam Socah',
      isImportant
    };

    if (onAddAnnouncement) {
      onAddAnnouncement(newAnc);
    }

    setIsAddModalOpen(false);
    setTitle('');
    setContent('');
    setIsImportant(false);
  };

  const handleOpenEdit = (anc: Announcement) => {
    setEditingAnnouncement(anc);
    setEditTitle(anc.title);
    setEditCategory(anc.category);
    setEditAuthor(anc.author);
    setEditContent(anc.content);
    setEditIsImportant(Boolean(anc.isImportant));
    setSelectedAnnouncement(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement || !editTitle.trim() || !editContent.trim()) return;

    const updated: Announcement = {
      ...editingAnnouncement,
      title: editTitle.trim(),
      category: editCategory,
      content: editContent.trim(),
      author: editAuthor.trim() || 'Admin Utama Babusalam Socah',
      isImportant: editIsImportant
    };

    if (onUpdateAnnouncement) {
      onUpdateAnnouncement(updated);
    }

    setEditingAnnouncement(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm">
            <i className="fa-solid fa-bullhorn"></i>
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white font-poppins">Pengumuman & Informasi</h3>
            <p className="text-[11px] text-slate-400">Informasi resmi Babusalam Socah</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && onAddAnnouncement && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1"
            >
              <i className="fa-solid fa-cloud-arrow-up"></i>
              <span>+ Upload Informasi</span>
            </button>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold">
            {announcements.length} Berita
          </span>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {announcements.map((anc) => (
          <div
            key={anc.id}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-500/50 cursor-pointer transition-all space-y-1.5 group relative"
          >
            <div className="flex items-center justify-between gap-2" onClick={() => setSelectedAnnouncement(anc)}>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  anc.isImportant
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {anc.category}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-medium">
                  <i className="fa-regular fa-clock mr-1"></i>
                  {anc.date}
                </span>

                {isAdmin && onUpdateAnnouncement && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(anc);
                    }}
                    className="text-slate-400 hover:text-amber-500 p-1 rounded transition-colors"
                    title="Edit Informasi"
                  >
                    <i className="fa-solid fa-pen-to-square text-xs"></i>
                  </button>
                )}

                {isAdmin && onDeleteAnnouncement && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Hapus pengumuman "${anc.title}"?`)) {
                        onDeleteAnnouncement(anc.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                    title="Hapus Informasi"
                  >
                    <i className="fa-solid fa-trash-can text-xs"></i>
                  </button>
                )}
              </div>
            </div>

            <h4
              onClick={() => setSelectedAnnouncement(anc)}
              className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1"
            >
              {anc.title}
            </h4>

            <p
              onClick={() => setSelectedAnnouncement(anc)}
              className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed"
            >
              {anc.content}
            </p>

            <div
              onClick={() => setSelectedAnnouncement(anc)}
              className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200/50 dark:border-slate-700/50"
            >
              <span className="flex items-center gap-1 italic">
                <i className="fa-solid fa-user-pen"></i> {anc.author}
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:underline flex items-center gap-1">
                Selengkapnya <i className="fa-solid fa-chevron-right text-[8px]"></i>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Announcement Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white font-poppins">
                    Upload Informasi / Pengumuman Baru
                  </h3>
                  <p className="text-xs text-slate-400">Publikasikan pengumuman ke seluruh santri & ustadz</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Pengumuman / Informasi *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Edaran Resmi Penilaian Tengah Semester (PTS) Babusalam Socah"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Informasi
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as 'Penting' | 'Akademik' | 'Kegiatan' | 'Informasi')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Informasi">Informasi Umum</option>
                    <option value="Akademik">Akademik Formal / Diniyah</option>
                    <option value="Kegiatan">Kegiatan Santri</option>
                    <option value="Penting">Penting / Mendesak</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Penulis / Pengirim
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Admin Utama Babusalam Socah"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Isi Pengumuman / Informasi *
                </label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan isi pengumuman lengkap di sini..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-important"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="chk-important" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Tandai sebagai Pengumuman Penting (Prioritas)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>Upload & Terbitkan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Announcement Modal */}
      {editingAnnouncement && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
                  <i className="fa-solid fa-pen-to-square"></i>
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white font-poppins">
                    Edit Konten Informasi
                  </h3>
                  <p className="text-xs text-slate-400">Perbarui judul, isi, atau status pengumuman</p>
                </div>
              </div>
              <button
                onClick={() => setEditingAnnouncement(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Pengumuman / Informasi *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Informasi
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as 'Penting' | 'Akademik' | 'Kegiatan' | 'Informasi')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Informasi">Informasi Umum</option>
                    <option value="Akademik">Akademik Formal / Diniyah</option>
                    <option value="Kegiatan">Kegiatan Santri</option>
                    <option value="Penting">Penting / Mendesak</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Penulis / Pengirim
                  </label>
                  <input
                    type="text"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Isi Pengumuman / Informasi *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-edit-important"
                  checked={editIsImportant}
                  onChange={(e) => setEditIsImportant(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                />
                <label htmlFor="chk-edit-important" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Tandai sebagai Pengumuman Penting (Prioritas)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                {onDeleteAnnouncement && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Hapus pengumuman "${editingAnnouncement.title}"?`)) {
                        onDeleteAnnouncement(editingAnnouncement.id);
                        setEditingAnnouncement(null);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                    <span>Hapus</span>
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setEditingAnnouncement(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-check"></i>
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcement Modal Detail Popup */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="space-y-1">
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    selectedAnnouncement.isImportant
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {selectedAnnouncement.category}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-poppins">
                  {selectedAnnouncement.title}
                </h3>
                <p className="text-xs text-slate-400">
                  Dipublikasikan: {selectedAnnouncement.date} • Oleh {selectedAnnouncement.author}
                </p>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed space-y-3 whitespace-pre-line">
              {selectedAnnouncement.content}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(selectedAnnouncement)}
                    className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                    <span>Edit Konten</span>
                  </button>
                  {onDeleteAnnouncement && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus pengumuman "${selectedAnnouncement.title}"?`)) {
                          onDeleteAnnouncement(selectedAnnouncement.id);
                          setSelectedAnnouncement(null);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              )}
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ml-auto"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
