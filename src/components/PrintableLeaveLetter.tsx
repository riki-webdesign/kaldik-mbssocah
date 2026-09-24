import React, { useState } from 'react';
import { LeavePermissionRecord } from '../types';
import { LEAVE_CHECKLIST_ITEMS, getCategoryForActivity } from '../data/leaveChecklist';

interface PrintableLeaveLetterProps {
  record: LeavePermissionRecord;
  onClose?: () => void;
  onPrint?: () => void;
}

export const PrintableLeaveLetter: React.FC<PrintableLeaveLetterProps> = ({
  record,
  onClose,
  onPrint
}) => {
  const [activeSheet, setActiveSheet] = useState<'both' | 'front' | 'back'>('both');
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});

  const toggleCheck = (no: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [no]: !prev[no]
    }));
  };

  const formatRupiah = (val: number | string) => {
    const num = typeof val === 'string' ? parseInt(val.replace(/\D/g, ''), 10) || 0 : val;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const formatDateIndo = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const todayIndo = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Control Switcher in Preview (Hidden during print) */}
      <div className="no-print bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilihan Tampilan Lembar:</span>
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveSheet('both')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeSheet === 'both'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Semua Lembar (Depan & Belakang)
            </button>
            <button
              type="button"
              onClick={() => setActiveSheet('front')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeSheet === 'front'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Lembar 1 (Surat Izin SIPS)
            </button>
            <button
              type="button"
              onClick={() => setActiveSheet('back')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeSheet === 'back'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Lembar 2 (Form Ceklis 22 Poin)
            </button>
          </div>
        </div>

        {onPrint && (
          <button
            type="button"
            onClick={onPrint}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <i className="fa-solid fa-print"></i>
            <span>Cetak Langsung (A4)</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* LEMBAR 1 (BAGIAN DEPAN): SURAT IZIN PERPULANGAN SANTRI (SIPS) */}
      {/* ========================================================================= */}
      {(activeSheet === 'both' || activeSheet === 'front') && (
        <div className="bg-white text-slate-900 font-sans p-6 sm:p-8 md:p-10 max-w-3xl mx-auto shadow-xl rounded-2xl border border-slate-200 printable-document relative page-break-after">
          
          <div className="absolute top-4 right-4 text-[10px] font-mono text-slate-400 border border-slate-200 px-2 py-0.5 rounded bg-slate-50">
            LEMBAR DEPAN (1 / 2)
          </div>

          {/* KOP SURAT RESMI PONDOK PESANTREN */}
          <div className="border-b-2 border-slate-800 pb-3 mb-5 text-center relative">
            <img
              src="https://kaldik.babussalamsocah.com/Image/kop.png"
              alt="Kop Surat Pondok Pesantren Babussalam Socah"
              className="w-full h-auto max-h-32 object-contain mx-auto select-none"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* JUDUL SURAT & NOMOR */}
          <div className="text-center my-4">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider underline decoration-2 underline-offset-4 text-slate-900 font-serif">
              SURAT IZIN PERPULANGAN SANTRI (SIPS)
            </h2>
            <p className="text-xs font-mono text-slate-600 mt-1">
              Nomor: <span className="font-bold text-slate-900">SIPS/PPBS/{new Date().getFullYear()}/{record.id}</span>
            </p>
          </div>

          {/* KATA PENGANTAR */}
          <div className="text-xs sm:text-sm text-slate-800 leading-relaxed mb-4">
            <p className="mb-2 italic font-serif">
              Bismillahirrohmanirrohim,
            </p>
            <p>
              Yang bertanda tangan di bawah ini, Pengurus Bagian Pengasuhan & Ketertiban Santri Pondok Pesantren Babusalam Socah Bangkalan, menerangkan bahwa:
            </p>
          </div>

          {/* BIODATA SANTRI */}
          <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200 text-xs sm:text-sm mb-4 space-y-1.5">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4 sm:col-span-3 font-semibold text-slate-600">Nama Lengkap</div>
              <div className="col-span-8 sm:col-span-9 font-black text-slate-900 uppercase">: {record.nama}</div>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4 sm:col-span-3 font-semibold text-slate-600">Kelas / Jenjang</div>
              <div className="col-span-8 sm:col-span-9 font-bold text-slate-800">: {record.kelas}</div>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4 sm:col-span-3 font-semibold text-slate-600">No. HP / WA Wali</div>
              <div className="col-span-8 sm:col-span-9 font-mono text-slate-800">: {record.noHp}</div>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4 sm:col-span-3 font-semibold text-slate-600">Waktu Perpulangan</div>
              <div className="col-span-8 sm:col-span-9 font-semibold text-slate-800">
                : <span className="font-bold text-emerald-800">{formatDateIndo(record.tanggalPulang)}</span> s.d <span className="font-bold text-emerald-800">{formatDateIndo(record.tanggalKembali)}</span> (Maks. 17.00 WIB)
              </div>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4 sm:col-span-3 font-semibold text-slate-600">Alasan / Keperluan</div>
              <div className="col-span-8 sm:col-span-9 text-slate-700">: {record.alasanPulang || 'Libur Rutin / Kepulangan Terjadwal Santri'}</div>
            </div>
          </div>

          {/* TABEL VERIFIKASI KELENGKAPAN SANTRI (5 POIN WAJIB) */}
          <div className="mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
              <i className="fa-solid fa-clipboard-check text-emerald-600"></i>
              Rincian Verifikasi & Checklist Perpulangan:
            </h4>
            <div className="overflow-x-auto border border-slate-300 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-3 w-10 text-center">No</th>
                    <th className="py-2 px-3">Komponen Verifikasi</th>
                    <th className="py-2 px-3">Status / Keterangan</th>
                    <th className="py-2 px-3 text-center w-24">Hasil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  <tr>
                    <td className="py-2 px-3 text-center font-bold">1</td>
                    <td className="py-2 px-3 font-semibold">Laptop Santri</td>
                    <td className="py-2 px-3">
                      {record.laptopOption === 'dibawa' 
                        ? 'Dibawa pulang (Wali santri wajib mendampingi)' 
                        : 'Tidak dibawa (Disimpan aman di lemari asrama pesantren)'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${record.laptopOption === 'dibawa' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'}`}>
                        {record.laptopOption === 'dibawa' ? 'DIBAWA' : 'AMAN'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-center font-bold">2</td>
                    <td className="py-2 px-3 font-semibold">Ceklist Baju & Kerapian</td>
                    <td className="py-2 px-3">Pakaian kotor telah dicuci/dipacking rapi sesuai standar asrama.</td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        LENGKAP
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-center font-bold">3</td>
                    <td className="py-2 px-3 font-semibold">Ceklist Loker & Kamar</td>
                    <td className="py-2 px-3">Loker lemari telah dibersihkan dan digembok/dikunci dengan aman.</td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        BERSIH & AMAN
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-amber-50/50">
                    <td className="py-2 px-3 text-center font-bold">4</td>
                    <td className="py-2 px-3 font-semibold text-amber-900">Tugas Wajib di Rumah</td>
                    <td className="py-2 px-3 font-bold text-amber-950" colSpan={2}>
                      "{record.tugasDirumah}"
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* IKRAR & TATA TERTIB LIBURAN */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-700 mb-6 space-y-1">
            <p className="font-bold text-slate-900 uppercase">Ketentuan & Tata Tertib Santri Selama di Rumah:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
              <li>Menjaga akhlaqul karimah dan nama baik Pondok Pesantren Babusalam Socah.</li>
              <li>Melaksanakan shalat fardhu 5 waktu tepat waktu berjamaah & muroja'ah hafalan Al-Qur'an.</li>
              <li>Menyelesaikan/menyempurnakan tugas Jurnal Liburan dan mengisi Form Ceklis di lembar belakang.</li>
              <li>Wajib kembali ke pondok tepat waktu sesuai jadwal (sebelum pukul 17.00 WIB) membawa form ceklis berparaf wali santri.</li>
            </ol>
          </div>

          {/* TANGGAL & TANDA TANGAN (3 KOLOM RESMI) */}
          <div className="pt-2">
            <div className="text-right text-xs text-slate-700 mb-4">
              Socah, Bangkalan, {todayIndo}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {/* Kolom 1: Santri */}
              <div>
                <p className="font-semibold text-slate-700 mb-14">Santri Yang Bersangkutan,</p>
                <p className="font-bold text-slate-900 uppercase underline decoration-1 underline-offset-2">
                  ( {record.nama} )
                </p>
                <p className="text-[10px] text-slate-500">{record.kelas}</p>
              </div>

              {/* Kolom 2: Wali Santri */}
              <div>
                <p className="font-semibold text-slate-700 mb-14">Wali Santri,</p>
                <p className="font-bold text-slate-900 uppercase underline decoration-1 underline-offset-2">
                  ( ..................................... )
                </p>
                <p className="text-[10px] text-slate-500">Tanda Tangan & Nama Terang</p>
              </div>

              {/* Kolom 3: Pengasuhan / Mudir Pesantren */}
              <div className="relative">
                <p className="font-semibold text-slate-700 mb-2">Mudir Ma'had Babussalam Socah,</p>
                
                {/* TTD + Stempel Resmi Pondok Pesantren Babussalam Socah */}
                <div className="h-16 flex items-center justify-center -my-1">
                  <img
                    src="https://kaldik.babussalamsocah.com/Image/stempel.png"
                    alt="Tanda Tangan dan Stempel Mudir Ma'had Babussalam Socah"
                    className="h-16 w-auto max-w-[130px] object-contain select-none"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <p className="font-bold text-slate-900 uppercase underline decoration-1 underline-offset-2">
                  Abdillah Safa, M.Si.
                </p>
                <p className="text-[10px] text-slate-500">Mudir Ma'had Babussalam Socah</p>
              </div>
            </div>
          </div>

          {/* FOOTER VERIFIKASI QR */}
          <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 text-white rounded flex items-center justify-center text-xs font-mono font-bold">
                QR
              </div>
              <div>
                <p className="font-semibold text-slate-700">Dokumen Resmi Sistem Perizinan Santri Digital</p>
                <p className="font-mono">ID: {record.id} • Diterbitkan: {record.createdAt ? record.createdAt.split('T')[0] : todayIndo}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                LEMBAR 1: SURAT IZIN RESMI
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEMBAR 2 (BAGIAN BELAKANG): FORM CEKLIS PERPULANGAN SANTRI (22 POIN) */}
      {/* ========================================================================= */}
      {(activeSheet === 'both' || activeSheet === 'back') && (
        <div className="bg-white text-slate-900 font-sans p-6 sm:p-8 md:p-10 max-w-3xl mx-auto shadow-xl rounded-2xl border border-slate-200 printable-document relative">
          
          <div className="absolute top-4 right-4 text-[10px] font-mono text-slate-400 border border-slate-200 px-2 py-0.5 rounded bg-slate-50">
            LEMBAR BELAKANG (2 / 2)
          </div>

          {/* HEADER FORM CEKLIS */}
          <div className="border-b-2 border-slate-800 pb-3 mb-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xl font-bold shadow flex-shrink-0">
                <i className="fa-solid fa-list-check"></i>
              </div>
              <div className="text-center">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
                  PONDOK PESANTREN BABUSALAM SOCAH BANGKALAN
                </h3>
                <h2 className="text-base sm:text-xl font-black uppercase text-slate-900 font-serif">
                  FORM CEKLIS PERPULANGAN SANTRI
                </h2>
                <p className="text-[11px] text-slate-600">
                  Lampiran Wajib: Jurnal Ibadah, Amaliyah & Aktivitas Santri Selama di Rumah
                </p>
              </div>
            </div>
          </div>

          {/* IDENTITAS SINGKAT SANTRI */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Nama Santri</span>
              <strong className="text-slate-900 uppercase font-black">{record.nama}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Kelas</span>
              <strong className="text-slate-800">{record.kelas}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">No. Izin SIPS</span>
              <strong className="text-emerald-800 font-mono">{record.id}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Periode Izin Pulang</span>
              <strong className="text-slate-800">{formatDateIndo(record.tanggalPulang)} s/d {formatDateIndo(record.tanggalKembali)}</strong>
            </div>
          </div>

          {/* PETUNJUK PENGISIAN */}
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-[11px] text-slate-700 mb-3 flex items-start gap-2">
            <i className="fa-solid fa-circle-info text-emerald-600 mt-0.5 flex-shrink-0"></i>
            <div>
              <strong>Petunjuk Untuk Santri & Wali Santri:</strong> Beri tanda centang (✓) pada kolom Ceklis setelah melaksanakan setiap kegiatan. Wali santri memberikan paraf pada kolom paraf sebagai bentuk pengawasan amaliyah selama liburan di rumah.
            </div>
          </div>

          {/* TABEL CEKLIS 22 POIN PERPULANGAN */}
          <div className="overflow-x-auto border border-slate-300 rounded-xl mb-4">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-800 uppercase font-bold border-b border-slate-300">
                <tr>
                  <th className="py-1.5 px-2 w-8 text-center border-r border-slate-200">No</th>
                  <th className="py-1.5 px-3 border-r border-slate-200">Rincian Agenda / Kegiatan Santri</th>
                  <th className="py-1.5 px-2 w-28 text-center border-r border-slate-200">Kategori</th>
                  <th className="py-1.5 px-2 w-20 text-center border-r border-slate-200">Ceklis [✓]</th>
                  <th className="py-1.5 px-2 w-24 text-center">Paraf Wali</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {LEAVE_CHECKLIST_ITEMS.map((itemText, idx) => {
                  const num = idx + 1;
                  const category = getCategoryForActivity(itemText);
                  const isChecked = checkedItems[num] || false;

                  return (
                    <tr 
                      key={num} 
                      className={`hover:bg-slate-50 transition-colors ${num % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                    >
                      <td className="py-1.5 px-2 text-center font-bold border-r border-slate-200 text-slate-600">
                        {num}
                      </td>
                      <td className="py-1.5 px-3 font-semibold border-r border-slate-200 text-slate-900">
                        <div className="flex items-center justify-between gap-1">
                          <span>{itemText}</span>
                          {category === 'ibadah' && (
                            <i className="fa-solid fa-kaaba text-[10px] text-emerald-600/70 hidden sm:inline" title="Ibadah Fardhu/Sunnah"></i>
                          )}
                          {category === 'adab' && (
                            <i className="fa-solid fa-hands-holding-child text-[10px] text-blue-600/70 hidden sm:inline" title="Adab & Birrul Walidain"></i>
                          )}
                          {category === 'hafalan' && (
                            <i className="fa-solid fa-book-quran text-[10px] text-teal-600/70 hidden sm:inline" title="Muroja'ah Al-Qur'an"></i>
                          )}
                          {category === 'akademik' && (
                            <i className="fa-solid fa-book-open-reader text-[10px] text-amber-600/70 hidden sm:inline" title="Tugas Jurnal"></i>
                          )}
                        </div>
                      </td>
                      <td className="py-1.5 px-2 text-center border-r border-slate-200">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${
                          category === 'ibadah' ? 'bg-emerald-100 text-emerald-800' :
                          category === 'adab' ? 'bg-blue-100 text-blue-800' :
                          category === 'hafalan' ? 'bg-teal-100 text-teal-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {category}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-center border-r border-slate-200">
                        <button
                          type="button"
                          onClick={() => toggleCheck(num)}
                          className={`w-5 h-5 rounded border inline-flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white border-slate-400 text-transparent hover:border-emerald-500'
                          }`}
                          title="Klik untuk ceklis digital"
                        >
                          <i className="fa-solid fa-check text-[10px]"></i>
                        </button>
                      </td>
                      <td className="py-1.5 px-2 text-center text-slate-300 font-mono text-[10px]">
                        ( . . . . . )
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* CATATAN & EVALUASI WALI SANTRI */}
          <div className="border border-slate-300 rounded-xl p-3 mb-4 bg-slate-50">
            <h4 className="text-xs font-bold text-slate-800 uppercase mb-1">
              Catatan Khusus & Pesan Wali Santri Selama Ananda di Rumah:
            </h4>
            <div className="h-10 border-b border-dashed border-slate-300 mb-1"></div>
            <p className="text-[10px] text-slate-500 italic">
              *Diisi oleh orang tua/wali santri mengenai perkembangan shalat, adab, dan ketertiban ananda di rumah.
            </p>
          </div>

          {/* PENGESAHAN TANDA TANGAN LEMBAR CEKLIS */}
          <div className="pt-1">
            <div className="grid grid-cols-2 gap-4 text-center text-xs">
              {/* Kolom 1: Wali Santri */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white">
                <p className="font-semibold text-slate-700 mb-1">Tanda Tangan Pengesahan</p>
                <p className="text-[11px] text-slate-500 mb-12">Wali Santri / Orang Tua</p>
                <p className="font-bold text-slate-900 uppercase underline decoration-1 underline-offset-2">
                  ( .................................................... )
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Tanda tangan & Nama Terang</p>
              </div>

              {/* Kolom 2: Verifikator Pengasuhan saat Santri Kembali */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white">
                <p className="font-semibold text-slate-700 mb-1">Diterima & Diverifikasi Saat Kembali</p>
                <p className="text-[11px] text-slate-500 mb-12">Pengurus Pengasuhan Pondok Pesantren</p>
                <p className="font-bold text-slate-900 uppercase underline decoration-1 underline-offset-2">
                  ( .................................................... )
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Musyrif / Bagian Pengasuhan</p>
              </div>
            </div>
          </div>

          {/* FOOTER VERIFIKASI */}
          <div className="mt-5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
            <span className="font-mono">
              FORM-CEKLIS-22-PPBS • Dokumen Wajib Diserahkan Saat Kembali Ke Pondok
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              LEMBAR 2: CEKLIS PERPULANGAN
            </span>
          </div>

        </div>
      )}
    </div>
  );
};
