import React, { useState, useEffect } from 'react';
import { LeavePermissionRecord } from '../types';
import { PrintableLeaveLetter } from './PrintableLeaveLetter';
import { LEAVE_CHECKLIST_ITEMS, getCategoryForActivity } from '../data/leaveChecklist';

interface LeavePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: (record: LeavePermissionRecord) => void;
}

const STORAGE_KEY = 'kaldik_babusalam_leave_permissions';

export const LeavePermissionModal: React.FC<LeavePermissionModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess
}) => {
  // Form States matching user exact requirements
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('Kelas VII A');
  const [noHp, setNoHp] = useState('');
  const [laptopOption, setLaptopOption] = useState<'dibawa' | 'tidak_dibawa'>('tidak_dibawa');
  const [isBajuChecked, setIsBajuChecked] = useState(false);
  const [isLokerChecked, setIsLokerChecked] = useState(false);
  
  // Otomatis terisi dengan tulisan (Menyelesaikan/Menyempurnakan Tugas Jurnal Selama Liburan)
  const defaultTugas = 'Menyelesaikan/Menyempurnakan Tugas Jurnal Selama Liburan';
  const [tugasDirumah, setTugasDirumah] = useState(defaultTugas);

  // Extra optional fields for complete pass
  const [tanggalPulang, setTanggalPulang] = useState('');
  const [tanggalKembali, setTanggalKembali] = useState('');
  const [alasanPulang, setAlasanPulang] = useState('Libur Rutin Bulanan Pondok Pesantren');

  // UI Flow States
  const [submittedRecord, setSubmittedRecord] = useState<LeavePermissionRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'checklist' | 'history'>('form');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [viewingRecordForPrint, setViewingRecordForPrint] = useState<LeavePermissionRecord | null>(null);
  const [savedRecords, setSavedRecords] = useState<LeavePermissionRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Interactive state for 22 checklist items
  const [interactiveChecks, setInteractiveChecks] = useState<{ [key: number]: boolean }>({});

  const toggleInteractiveCheck = (no: number) => {
    setInteractiveChecks(prev => ({
      ...prev,
      [no]: !prev[no]
    }));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Load history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          setSavedRecords(JSON.parse(raw));
        }
      } catch (e) {
        console.error('Failed to load leave permissions', e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Format currency helpers
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nama.trim()) {
      setErrorMsg('Harap isi nama lengkap santri.');
      return;
    }
    if (!noHp.trim()) {
      setErrorMsg('Harap masukkan nomor HP / WhatsApp wali/santri.');
      return;
    }
    if (!tanggalPulang) {
      setErrorMsg('Harap masukkan tanggal pulang.');
      return;
    }
    if (!tanggalKembali) {
      setErrorMsg('Harap masukkan tanggal kembali.');
      return;
    }
    if (!isBajuChecked) {
      setErrorMsg('Harap konfirmasi checklist Baju (sudah dirapikan/dicuci/dipacking).');
      return;
    }
    if (!isLokerChecked) {
      setErrorMsg('Harap konfirmasi checklist Loker (sudah dibersihkan & terkunci aman).');
      return;
    }

    setIsSubmitting(true);

    const newRecord: LeavePermissionRecord = {
      id: `SIP-${Date.now().toString().slice(-6)}`,
      nama: nama.trim(),
      kelas,
      noHp: noHp.trim(),
      laptopOption,
      isBajuChecked,
      isLokerChecked,
      tagihanBelumLunas: 0,
      tugasDirumah: tugasDirumah || defaultTugas,
      tanggalPulang,
      tanggalKembali,
      alasanPulang,
      createdAt: new Date().toISOString(),
      status: 'Disetujui'
    };

    // Save to local state and localStorage
    const updated = [newRecord, ...savedRecords];
    setSavedRecords(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    if (onSubmitSuccess) {
      onSubmitSuccess(newRecord);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedRecord(newRecord);
      showToast('Surat izin pulang & Form Ceklis 22 Poin berhasil dibuat!');
    }, 400);
  };

  const resetForm = () => {
    setNama('');
    setKelas('Kelas VII A');
    setNoHp('');
    setLaptopOption('tidak_dibawa');
    setIsBajuChecked(false);
    setIsLokerChecked(false);
    setTugasDirumah(defaultTugas);
    setSubmittedRecord(null);
    setErrorMsg('');
  };

  // Direct Printing Engine for A4 Format (Generates 2 Pages: Lembar Depan SIPS + Lembar Belakang Form Ceklis)
  const handleDirectPrint = (record: LeavePermissionRecord) => {
    const todayIndo = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const nominalFormat = record.tagihanBelumLunas === 0 
      ? 'LUNAS / Bebas Tanggungan (Rp 0)' 
      : formatRupiah(record.tagihanBelumLunas);

    // Generate 22 items rows for Page 2 (Without Keterangan column)
    const checklistRowsHtml = LEAVE_CHECKLIST_ITEMS.map((item, idx) => {
      const num = idx + 1;
      const cat = getCategoryForActivity(item);
      const isChecked = interactiveChecks[num];
      return `
        <tr>
          <td style="text-align: center; font-weight: bold; font-size: 11px;">${num}</td>
          <td style="font-weight: 600; font-size: 11px;">${item}</td>
          <td style="text-align: center; font-size: 9px; text-transform: uppercase; color: #475569;">${cat}</td>
          <td style="text-align: center; font-size: 11px; font-weight: bold;">${isChecked ? '✓' : '[ &nbsp; ]'}</td>
          <td style="text-align: center; color: #94a3b8; font-size: 10px;">( &nbsp; &nbsp; &nbsp; &nbsp; )</td>
        </tr>
      `;
    }).join('');

    const printHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Surat Izin Pulang & Form Ceklis - ${record.nama} (${record.id})</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm 14mm;
        }
        * {
          box-sizing: border-box;
          font-family: 'Times New Roman', Times, serif;
          color: #0f172a;
        }
        body {
          margin: 0;
          padding: 8px;
          background: #ffffff;
          font-size: 12px;
          line-height: 1.4;
        }
        .page-container {
          min-height: 98%;
        }
        .page-break {
          page-break-before: always;
          break-before: page;
          padding-top: 10px;
        }
        .kop {
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 3px double #0f172a;
          padding-bottom: 8px;
          margin-bottom: 12px;
          text-align: center;
        }
        .kop h3 {
          margin: 0;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #065f46;
          font-family: Arial, sans-serif;
        }
        .kop h1 {
          margin: 2px 0;
          font-size: 19px;
          font-weight: 900;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .kop h2 {
          margin: 0;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          color: #334155;
          font-family: Arial, sans-serif;
        }
        .kop p {
          margin: 2px 0 0 0;
          font-size: 10px;
          color: #475569;
          font-family: Arial, sans-serif;
        }
        .title-box {
          text-align: center;
          margin: 8px 0 10px 0;
        }
        .title-box h2 {
          margin: 0;
          font-size: 15px;
          font-weight: bold;
          text-decoration: underline;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .title-box p {
          margin: 2px 0 0 0;
          font-size: 11px;
          font-family: 'Courier New', Courier, monospace;
          font-weight: bold;
        }
        .table-data {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        .table-data td {
          padding: 2.5px 5px;
          vertical-align: top;
          font-size: 12px;
        }
        .table-data td.lbl {
          width: 28%;
          font-weight: bold;
          color: #334155;
        }
        .table-check {
          width: 100%;
          border-collapse: collapse;
          margin: 8px 0;
          font-size: 11px;
        }
        .table-check th, .table-check td {
          border: 1px solid #334155;
          padding: 4px 6px;
        }
        .table-check th {
          background-color: #f1f5f9;
          font-family: Arial, sans-serif;
          font-size: 10px;
          text-transform: uppercase;
        }
        .badge-status {
          font-weight: bold;
          text-align: center;
          display: block;
          padding: 1.5px 3px;
          border-radius: 4px;
          font-family: Arial, sans-serif;
          font-size: 9px;
        }
        .badge-ok { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
        .badge-warn { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
        .badge-danger { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
        .rules-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 6px 10px;
          border-radius: 5px;
          margin: 8px 0;
          font-size: 10.5px;
        }
        .rules-box ol {
          margin: 3px 0 0 0;
          padding-left: 16px;
        }
        .sig-section {
          margin-top: 14px;
          width: 100%;
        }
        .sig-table {
          width: 100%;
          text-align: center;
          border-collapse: collapse;
        }
        .sig-table td {
          width: 33.33%;
          vertical-align: top;
          padding: 0 4px;
        }
        .sig-space {
          height: 52px;
          position: relative;
        }
        .stempel {
          position: absolute;
          top: -4px;
          left: 50%;
          transform: translateX(-50%) rotate(-10deg);
          border: 2px dashed #059669;
          color: #059669;
          border-radius: 50%;
          width: 68px;
          height: 68px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 7px;
          font-weight: bold;
          font-family: Arial, sans-serif;
          opacity: 0.85;
        }
        .qr-foot {
          margin-top: 10px;
          border-top: 1px solid #e2e8f0;
          padding-top: 4px;
          display: flex;
          justify-content: space-between;
          font-size: 8.5px;
          color: #64748b;
          font-family: Arial, sans-serif;
        }
        .no-print-toolbar {
          text-align: center;
          margin-bottom: 15px;
          padding: 10px;
          background: #059669;
          color: white;
          border-radius: 8px;
          font-family: Arial, sans-serif;
        }
        .btn-print {
          padding: 8px 20px;
          font-weight: bold;
          cursor: pointer;
          background: #ffffff;
          color: #065f46;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          margin-right: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }
        @media print {
          .no-print-toolbar { display: none !important; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="no-print-toolbar">
        <button class="btn-print" onclick="window.print()">🖨️ Cetak Dokumen 2 Lembar (A4 / PDF)</button>
        <span style="font-size: 12px;">(Lembar 1: SIPS • Lembar 2: Form Ceklis Perpulangan)</span>
      </div>

      <!-- ========================================================= -->
      <!-- LEMBAR 1 (DEPAN): SURAT IZIN PERPULANGAN SANTRI (SIPS) -->
      <!-- ========================================================= -->
      <div class="page-container">
        <div style="text-align: right; font-size: 9px; font-family: Arial, sans-serif; color: #64748b; margin-bottom: 4px;">
          LEMBAR 1 / 2 (BAGIAN DEPAN)
        </div>

        <div class="kop" style="border-bottom: 2px solid #1e293b; padding-bottom: 6px; margin-bottom: 12px; text-align: center;">
          <img 
            src="https://ik.imagekit.io/sekawanstd/MBS%20SOcah%20%20file/kop%20surat%20Pondok.png" 
            alt="Kop Surat Pondok Pesantren Babussalam Socah" 
            style="width: 100%; max-height: 105px; object-fit: contain;" 
          />
        </div>

        <div class="title-box">
          <h2>SURAT IZIN PERPULANGAN SANTRI (SIPS)</h2>
          <p>Nomor: SIPS/PPBS/${new Date().getFullYear()}/${record.id}</p>
        </div>

        <p style="margin: 3px 0;"><em>Bismillahirrohmanirrohim,</em></p>
        <p style="margin: 2px 0 8px 0;">Pengurus Bagian Pengasuhan & Ketertiban Santri Pondok Pesantren Babusalam Socah menerangkan bahwa:</p>

        <table class="table-data">
          <tr>
            <td class="lbl">Nama Lengkap Santri</td>
            <td>: <strong>${record.nama.toUpperCase()}</strong></td>
          </tr>
          <tr>
            <td class="lbl">Kelas / Asrama</td>
            <td>: ${record.kelas}</td>
          </tr>
          <tr>
            <td class="lbl">No. HP / WA Wali</td>
            <td>: ${record.noHp}</td>
          </tr>
          <tr>
            <td class="lbl">Waktu Perpulangan</td>
            <td>: <strong>${formatDateIndo(record.tanggalPulang)}</strong> s/d <strong>${formatDateIndo(record.tanggalKembali)}</strong> (Batas Maksimal 17.00 WIB)</td>
          </tr>
          <tr>
            <td class="lbl">Alasan / Keperluan</td>
            <td>: ${record.alasanPulang || 'Libur Rutin / Kepulangan Terjadwal Santri'}</td>
          </tr>
        </table>

        <table class="table-check">
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">No</th>
              <th style="width: 32%;">Item Verifikasi</th>
              <th>Keterangan / Hasil Pemeriksaan</th>
              <th style="width: 18%; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; font-weight: bold;">1</td>
              <td><strong>Status Laptop Santri</strong></td>
              <td>${record.laptopOption === 'dibawa' ? 'Dibawa pulang (Wali santri wajib mendampingi)' : 'Tidak dibawa (Disimpan aman di lemari asrama)'}</td>
              <td><span class="badge-status ${record.laptopOption === 'dibawa' ? 'badge-warn' : 'badge-ok'}">${record.laptopOption === 'dibawa' ? 'DIBAWA' : 'AMAN'}</span></td>
            </tr>
            <tr>
              <td style="text-align: center; font-weight: bold;">2</td>
              <td><strong>Ceklist Baju & Pakaian</strong></td>
              <td>Pakaian kotor dicuci & dipacking rapi sesuai tata tertib asrama.</td>
              <td><span class="badge-status badge-ok">LENGKAP [OK]</span></td>
            </tr>
            <tr>
              <td style="text-align: center; font-weight: bold;">3</td>
              <td><strong>Ceklist Loker & Kamar</strong></td>
              <td>Loker / lemari telah dibersihkan & digembok terkunci aman.</td>
              <td><span class="badge-status badge-ok">BERSIH [OK]</span></td>
            </tr>
            <tr style="background-color: #fffbeb;">
              <td style="text-align: center; font-weight: bold;">4</td>
              <td><strong>Tugas Wajib di Rumah</strong></td>
              <td colspan="2" style="font-weight: bold; color: #78350f;">"${record.tugasDirumah}"</td>
            </tr>
          </tbody>
        </table>

        <div class="rules-box">
          <strong>Ketentuan & Tata Tertib Santri Selama di Rumah:</strong>
          <ol>
            <li>Menjaga akhlaqul karimah serta nama baik Pondok Pesantren Babusalam Socah.</li>
            <li>Melaksanakan shalat 5 waktu berjamaah & istiqomah mengaji / muroja'ah Al-Qur'an.</li>
            <li>Mengisi Form Ceklis Perpulangan (di lembar belakang) dan wajib dibawa saat kembali ke pondok.</li>
            <li>Wajib kembali ke pesantren tepat waktu sesuai jadwal sebelum pukul 17.00 WIB.</li>
          </ol>
        </div>

        <div class="sig-section">
          <div style="text-align: right; margin-bottom: 4px; font-size: 11px;">
            Socah, Bangkalan, ${todayIndo}
          </div>
          <table class="sig-table">
            <tr>
              <td>
                <strong>Santri Yang Bersangkutan,</strong>
                <div class="sig-space"></div>
                <p style="margin: 0; text-decoration: underline; font-weight: bold;">( ${record.nama.toUpperCase()} )</p>
                <p style="margin: 0; font-size: 9px; color: #64748b;">Santri Babusalam Socah</p>
              </td>
              <td>
                <strong>Wali Santri,</strong>
                <div class="sig-space"></div>
                <p style="margin: 0; text-decoration: underline; font-weight: bold;">( ..................................... )</p>
                <p style="margin: 0; font-size: 9px; color: #64748b;">Tanda Tangan & Nama Terang</p>
              </td>
              <td>
                <strong>Mudir Ma'had Babussalam Socah,</strong>
                <div class="sig-space" style="display: flex; align-items: center; justify-content: center;">
                  <img 
                    src="https://ik.imagekit.io/sekawanstd/MBS%20SOcah%20%20file/ttd%20+%20stempel.png" 
                    alt="Tanda Tangan & Stempel Mudir" 
                    style="max-height: 52px; max-width: 140px; object-fit: contain;" 
                  />
                </div>
                <p style="margin: 0; text-decoration: underline; font-weight: bold;">Abdillah Safa, M.Si.</p>
                <p style="margin: 0; font-size: 9px; color: #64748b;">Mudir Ma'had Babussalam Socah</p>
              </td>
            </tr>
          </table>
        </div>

        <div class="qr-foot">
          <span>Verifikasi: PPBS-PASS-${record.id} • Diterbitkan Digital</span>
          <span>Lembar 1 (SIPS) • Pondok Pesantren Babusalam Socah</span>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- LEMBAR 2 (BELAKANG): FORM CEKLIS PERPULANGAN (22 POIN)    -->
      <!-- ========================================================= -->
      <div class="page-container page-break">
        <div style="text-align: right; font-size: 9px; font-family: Arial, sans-serif; color: #64748b; margin-bottom: 4px;">
          LEMBAR 2 / 2 (BAGIAN BELAKANG FORM IZIN PULANG)
        </div>

        <div class="kop" style="margin-bottom: 8px; padding-bottom: 6px;">
          <div>
            <h3>Pondok Pesantren Babusalam Socah Bangkalan</h3>
            <h1 style="font-size: 16px; margin: 2px 0;">FORM CEKLIS PERPULANGAN SANTRI</h1>
            <h2>JURNAL IBADAH & AMALIYAH SANTRI SELAMA DI RUMAH</h2>
          </div>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 5px 8px; border-radius: 4px; margin-bottom: 8px; font-size: 11px; display: flex; justify-content: space-between; font-family: Arial, sans-serif;">
          <span>Nama: <strong>${record.nama.toUpperCase()}</strong> (${record.kelas})</span>
          <span>No. Izin: <strong>${record.id}</strong></span>
          <span>Periode: <strong>${formatDateIndo(record.tanggalPulang)} s/d ${formatDateIndo(record.tanggalKembali)}</strong></span>
        </div>

        <div style="font-size: 10px; margin-bottom: 6px; font-family: Arial, sans-serif; color: #334155; line-height: 1.3;">
          <em>Petunjuk: Berikan tanda centang (✓) pada kolom Ceklis setiap selesai beraktivitas. Wali santri memberikan paraf sebagai bentuk pendampingan.</em>
        </div>

        <table class="table-check" style="margin-top: 4px;">
          <thead>
            <tr>
              <th style="width: 6%; text-align: center;">No</th>
              <th style="width: 53%;">Rincian Agenda / Kegiatan Santri</th>
              <th style="width: 15%; text-align: center;">Kategori</th>
              <th style="width: 13%; text-align: center;">Ceklis [✓]</th>
              <th style="width: 13%; text-align: center;">Paraf Wali</th>
            </tr>
          </thead>
          <tbody>
            ${checklistRowsHtml}
          </tbody>
        </table>

        <div style="border: 1px solid #cbd5e1; background-color: #f8fafc; padding: 6px 8px; border-radius: 4px; margin-top: 6px; font-size: 10px;">
          <strong>Catatan / Pesan Wali Santri Selama Ananda di Rumah:</strong>
          <div style="height: 20px; border-bottom: 1px dashed #cbd5e1; margin-top: 2px;"></div>
        </div>

        <div class="sig-section" style="margin-top: 8px;">
          <table class="sig-table">
            <tr>
              <td style="width: 50%;">
                <strong style="font-size: 11px;">Tanda Tangan Pengesahan Wali Santri,</strong>
                <div style="height: 40px;"></div>
                <p style="margin: 0; text-decoration: underline; font-weight: bold; font-size: 11px;">( .................................................... )</p>
                <p style="margin: 0; font-size: 9px; color: #64748b;">Nama Terang & Tanda Tangan Orang Tua/Wali</p>
              </td>
              <td style="width: 50%;">
                <strong style="font-size: 11px;">Diverifikasi Pengasuhan Saat Kembali,</strong>
                <div style="height: 40px;"></div>
                <p style="margin: 0; text-decoration: underline; font-weight: bold; font-size: 11px;">( .................................................... )</p>
                <p style="margin: 0; font-size: 9px; color: #64748b;">Musyrif / Bagian Pengasuhan Santri</p>
              </td>
            </tr>
          </table>
        </div>

        <div class="qr-foot">
          <span>FORM-CEKLIS-22-PPBS • Wajib Diserahkan Kembali ke Pesantren</span>
          <span>Pondok Pesantren Babusalam Socah, Bangkalan</span>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 350);
        };
      </script>
    </body>
    </html>
    `;

    const printWin = window.open('', '_blank', 'width=850,height=900');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(printHtml);
      printWin.document.close();
      showToast('Membuka jendela cetak 2 lembar (Surat Izin + Form Ceklis)...');
    } else {
      setViewingRecordForPrint(record);
      setShowPrintModal(true);
      showToast('Pratinjau Surat Resmi terbuka.');
    }
  };

  const handleOpenPrintPreview = (record: LeavePermissionRecord) => {
    setViewingRecordForPrint(record);
    setShowPrintModal(true);
  };

  const handleShareWhatsApp = (record: LeavePermissionRecord) => {
    let cleanPhone = record.noHp.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith('8')) {
      cleanPhone = '62' + cleanPhone;
    }

    const text = 
      `*SURAT IZIN PERPULANGAN SANTRI (SIPS)*\n` +
      `*Pondok Pesantren Babusalam Socah, Bangkalan*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `*Assalamu'alaikum Warahmatullahi Wabarakatuh*\n\n` +
      `Diberitahukan kepada Bapak/Ibu Wali Santri bahwa surat izin perpulangan beserta *Form Ceklis Perpulangan (22 Kegiatan Liburan)* telah diterbitkan resmi oleh Bagian Pengasuhan Pesantren.\n\n` +
      `📋 *DATA SANTRI:*\n` +
      `• *No. Izin:* ${record.id}\n` +
      `• *Nama Santri:* ${record.nama}\n` +
      `• *Kelas/Kamar:* ${record.kelas}\n` +
      `• *No. HP/WA:* ${record.noHp}\n\n` +
      `🔍 *HASIL VERIFIKASI KEAMANAN:*\n` +
      `• *Status Laptop:* ${record.laptopOption === 'dibawa' ? '💻 DIBAWA PULANG (Wali wajib mendampingi)' : '🔒 TIDAK DIBAWA (Disimpan aman di asrama)'}\n` +
      `• *Ceklist Baju & Kerapian:* ✅ Selesai dicuci & dipacking rapi\n` +
      `• *Ceklist Loker & Kamar:* ✅ Bersih & digembok terkunci aman\n\n` +
      `📚 *TUGAS & JURNAL DI RUMAH:*\n` +
      `"${record.tugasDirumah}"\n\n` +
      `📝 *FORM CEKLIS PERPULANGAN (22 KEGIATAN):*\n` +
      `1. Sholat Duhur • 2. Sholat Asar • 3. Bantu Orang Tua • 4. Sholat Maghrib • 5. Sholat Isya' • 6. Belajar/Tugas Jurnal • 7. Tahajjud • 8. Sholat Subuh • 9. Murajaah Hafalan • 10. Bantu Orang Tua (dst s.d 22 Poin)\n\n` +
      `🗓️ *JADWAL KEPULANGAN:*\n` +
      `• Tanggal Pulang: *${formatDateIndo(record.tanggalPulang)}*\n` +
      `• Batas Kembali ke Pondok: *${formatDateIndo(record.tanggalKembali)} (Maksimal 17.00 WIB)*\n\n` +
      `Mohon bimbingan Bapak/Ibu Wali Santri selama di rumah agar ananda tetap menjaga shalat 5 waktu dan mengisi form ceklis liburan yang akan diserahkan saat kembali ke pondok.\n\n` +
      `*Wassalamu'alaikum Warahmatullahi Wabarakatuh*\n` +
      `_Bagian Pengasuhan & Keamanan Santri PP. Babusalam Socah_`;

    let url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    if (cleanPhone && cleanPhone.length >= 9) {
      url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    }
    window.open(url, '_blank');
    showToast('Membuka WhatsApp untuk mengirim surat & form ceklis...');
  };

  const handleCopyText = (record: LeavePermissionRecord) => {
    const checklistSummary = LEAVE_CHECKLIST_ITEMS.map((item, i) => `${i + 1}. ${item}`).join('\n');
    const text = 
      `SURAT IZIN PERPULANGAN SANTRI (SIPS)\n` +
      `PONDOK PESANTREN BABUSALAM SOCAH, BANGKALAN\n` +
      `----------------------------------------\n` +
      `No. Izin     : ${record.id}\n` +
      `Nama Santri  : ${record.nama}\n` +
      `Kelas/Kamar  : ${record.kelas}\n` +
      `No. HP/WA    : ${record.noHp}\n` +
      `Status Laptop: ${record.laptopOption === 'dibawa' ? 'Dibawa Pulang' : 'Tidak Dibawa (Aman di Asrama)'}\n` +
      `Ceklist Baju : Lengkap & Dipacking Rapi [OK]\n` +
      `Ceklist Loker: Bersih & Terkunci Aman [OK]\n` +
      `Tugas Rumah  : ${record.tugasDirumah}\n` +
      `Jadwal Pulang: ${record.tanggalPulang} s/d ${record.tanggalKembali} (Maks. 17.00 WIB)\n\n` +
      `FORM CEKLIS PERPULANGAN (LEMBAR BELAKANG):\n` +
      `${checklistSummary}\n` +
      `----------------------------------------\n` +
      `Status: DISETUJUI PENGASUHAN PP. BABUSALAM SOCAH`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedSuccess(true);
        showToast('Teks Surat Izin & Form Ceklis berhasil disalin!');
        setTimeout(() => setCopiedSuccess(false), 3000);
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedSuccess(true);
      showToast('Teks Surat Izin & Ceklis berhasil disalin!');
      setTimeout(() => setCopiedSuccess(false), 3000);
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      
      {/* TOAST FEEDBACK NOTIFICATION */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-[120] px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white text-xs font-semibold shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 animate-bounce">
          <i className="fa-solid fa-circle-check text-emerald-400 text-sm"></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* MODAL PRINT PREVIEW RESMI */}
      {showPrintModal && viewingRecordForPrint && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh] overflow-hidden my-auto">
            {/* Header Print Preview */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-700 via-teal-700 to-blue-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg">
                  <i className="fa-solid fa-print"></i>
                </div>
                <div>
                  <h3 className="font-bold text-base">Pratinjau Surat Izin & Form Ceklis (2 Lembar)</h3>
                  <p className="text-xs text-emerald-100 font-light">Lembar 1: Surat Izin SIPS • Lembar 2: Form Ceklis 22 Poin Perpulangan</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDirectPrint(viewingRecordForPrint)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-print"></i>
                  <span>Cetak (A4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            {/* Document Body Preview */}
            <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100 dark:bg-slate-950">
              <PrintableLeaveLetter 
                record={viewingRecordForPrint} 
                onPrint={() => handleDirectPrint(viewingRecordForPrint)} 
              />
            </div>

            {/* Footer Toolbar */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Formulir ini mencakup <strong>2 halaman</strong>: Surat Izin (Depan) dan Form Ceklis 22 Kegiatan (Belakang).
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleShareWhatsApp(viewingRecordForPrint)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-brands fa-whatsapp"></i>
                  <span>Kirim ke WA</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectPrint(viewingRecordForPrint)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-print"></i>
                  <span>Cetak 2 Lembar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN MODAL CONTAINER */}
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Tutup Form"
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark text-base"></i>
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/30">
              <i className="fa-solid fa-suitcase-rolling"></i>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold tracking-wider uppercase border border-white/30">
                <i className="fa-solid fa-shield-halved text-[9px]"></i>
                Pengasuhan & Keamanan Santri
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-poppins tracking-tight mt-0.5">
                Formulir Izin Pulang Santri
              </h2>
              <p className="text-xs text-emerald-100 font-light mt-0.5">
                Pondok Pesantren Babusalam Socah, Bangkalan
              </p>
            </div>
          </div>

          {/* 3 Main Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/15 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => { setActiveTab('form'); setSubmittedRecord(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'form' && !submittedRecord
                  ? 'bg-white text-emerald-800 shadow-md font-bold'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <i className="fa-solid fa-pen-to-square"></i>
              Form Perizinan
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('checklist'); setSubmittedRecord(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'checklist'
                  ? 'bg-white text-emerald-800 shadow-md font-bold'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <i className="fa-solid fa-list-check"></i>
              Form Ceklis (22 Poin)
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('history'); setSubmittedRecord(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-emerald-800 shadow-md font-bold'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <i className="fa-solid fa-clock-rotate-left"></i>
              Riwayat Izin ({savedRecords.length})
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* VIEW 1: SUBMITTED SUCCESS / DIGITAL PASS */}
          {submittedRecord ? (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg flex-shrink-0 shadow-md">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <div>
                  <h3 className="font-bold text-emerald-900 dark:text-emerald-300 text-base">
                    Formulir Izin Pulang & Form Ceklis Diterbitkan!
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Data izin pulang (Lembar 1) dan Form Ceklis 22 Kegiatan Liburan (Lembar 2) telah siap dicetak atau dikirimkan ke wali santri.
                  </p>
                </div>
              </div>

              {/* Printable Digital Card */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border-2 border-dashed border-emerald-500/40 dark:border-emerald-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Kartu Izin Pulang Digital
                    </span>
                    <h4 className="font-black text-lg text-slate-900 dark:text-white font-poppins">
                      {submittedRecord.nama}
                    </h4>
                    <p className="text-xs text-slate-500">{submittedRecord.kelas} • No. HP: {submittedRecord.noHp}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold border border-emerald-300 dark:border-emerald-500/40">
                      {submittedRecord.id}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">Status: Disetujui</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status Laptop</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                      <i className={`fa-solid ${submittedRecord.laptopOption === 'dibawa' ? 'fa-laptop text-amber-500' : 'fa-ban text-emerald-500'}`}></i>
                      {submittedRecord.laptopOption === 'dibawa' ? 'Dibawa' : 'Tidak Dibawa'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ceklist Baju & Loker</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                      <i className="fa-solid fa-check-double"></i>
                      Lengkap & Bersih
                    </span>
                  </div>
                </div>

                {/* Tugas Dirumah display */}
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-[11px] mb-1">
                    <i className="fa-solid fa-book-open-reader"></i>
                    Tugas Santri Dirumah (Wajib):
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    "{submittedRecord.tugasDirumah}"
                  </p>
                </div>

                {/* Info Form Ceklis di Lembar Belakang */}
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                      22
                    </div>
                    <div>
                      <strong className="text-emerald-950 dark:text-emerald-300 block font-bold">Form Ceklis Perpulangan Terlampir</strong>
                      <span className="text-[11px] text-emerald-800 dark:text-emerald-400">22 Poin amaliyah & ibadah harian santri di lembar belakang</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('checklist')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    Lihat Ceklis
                  </button>
                </div>

                {/* Jadwal Kepulangan */}
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Jadwal Pulang:</span>
                    <span className="font-semibold">{formatDateIndo(submittedRecord.tanggalPulang)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Batas Kembali ke Pesantren:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatDateIndo(submittedRecord.tanggalKembali)} (17.00 WIB)</span>
                  </div>
                </div>
              </div>

              {/* Actions Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-plus"></i>
                  Isi Formulir Baru
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyText(submittedRecord)}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                    title="Salin rincian surat izin & form ceklis"
                  >
                    <i className={`fa-solid ${copiedSuccess ? 'fa-check text-emerald-500' : 'fa-copy'}`}></i>
                    <span>{copiedSuccess ? 'Tersalin!' : 'Salin Teks'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp(submittedRecord)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    title="Kirim ke WhatsApp wali santri"
                  >
                    <i className="fa-brands fa-whatsapp text-sm"></i>
                    <span>Kirim ke WA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDirectPrint(submittedRecord)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/25 hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    title="Cetak 2 Lembar (Surat Izin SIPS + Form Ceklis 22 Kegiatan)"
                  >
                    <i className="fa-solid fa-print"></i>
                    <span>Cetak 2 Lembar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenPrintPreview(submittedRecord)}
                    className="px-3 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                    title="Pratinjau Surat Resmi & Lembar Belakang"
                  >
                    <i className="fa-solid fa-eye"></i>
                    <span className="hidden sm:inline">Pratinjau</span>
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'checklist' ? (
            /* VIEW 2: FORM CEKLIS PERPULANGAN (22 POIN) PREVIEW & INTERACTIVE CHECK */
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                      LEMBAR BELAKANG
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Form Ceklis Perpulangan Santri (22 Poin)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Ceklis kegiatan & amaliyah harian santri selama liburan di rumah (wajib diparaf oleh wali santri).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const dummyRecord: LeavePermissionRecord = savedRecords[0] || {
                        id: `SIP-${Date.now().toString().slice(-6)}`,
                        nama: nama.trim() || 'Nama Santri',
                        kelas: kelas,
                        noHp: noHp || '-',
                        laptopOption,
                        isBajuChecked: true,
                        isLokerChecked: true,
                        tagihanBelumLunas: 0,
                        tugasDirumah: tugasDirumah,
                        tanggalPulang,
                        tanggalKembali,
                        createdAt: new Date().toISOString(),
                        status: 'Disetujui'
                      };
                      handleDirectPrint(dummyRecord);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-print"></i>
                    <span>Cetak Form Ceklis</span>
                  </button>
                </div>
              </div>

              {/* 22 Items Table Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Daftar 22 Kegiatan Ibadah & Amaliyah Liburan</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {Object.values(interactiveChecks).filter(Boolean).length} dari 22 Selesai
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[45vh] overflow-y-auto">
                  {LEAVE_CHECKLIST_ITEMS.map((itemText, index) => {
                    const no = index + 1;
                    const isChecked = interactiveChecks[no] || false;
                    const cat = getCategoryForActivity(itemText);

                    return (
                      <div
                        key={no}
                        onClick={() => toggleInteractiveCheck(no)}
                        className={`p-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                          isChecked ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isChecked ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {no}
                          </span>
                          <div>
                            <span className={`text-xs sm:text-sm font-semibold block ${
                              isChecked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                            }`}>
                              {itemText}
                            </span>
                            <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase mt-0.5 ${
                              cat === 'ibadah' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                              cat === 'adab' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                              cat === 'hafalan' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300' :
                              'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                            }`}>
                              {cat}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleInteractiveCheck(no);
                            }}
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs transition-all ${
                              isChecked
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-emerald-500'
                            }`}
                          >
                            <i className="fa-solid fa-check text-[11px]"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Form ini otomatis terlampir di <strong>halaman ke-2 (bagian belakang)</strong> saat mencetak surat izin perpulangan santri.</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="text-emerald-600 font-bold hover:underline cursor-pointer"
                >
                  Kembali ke Formulir
                </button>
              </div>
            </div>
          ) : activeTab === 'history' ? (
            /* VIEW 3: HISTORY PERMISSIONS */
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-list-check text-emerald-500"></i>
                  Riwayat Izin Pulang Santri ({savedRecords.length})
                </h3>
                {savedRecords.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Hapus seluruh riwayat izin pulang di perangkat ini?')) {
                        localStorage.removeItem(STORAGE_KEY);
                        setSavedRecords([]);
                        showToast('Riwayat berhasil dibersihkan.');
                      }
                    }}
                    className="text-xs text-rose-500 hover:underline cursor-pointer"
                  >
                    Bersihkan Riwayat
                  </button>
                )}
              </div>

              {savedRecords.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <i className="fa-solid fa-folder-open text-3xl text-slate-300 dark:text-slate-600 mb-2"></i>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Belum ada data izin pulang</p>
                  <p className="text-xs text-slate-400 mt-1">Formulir yang Anda submit akan tersimpan dan tampil di sini.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('form')}
                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 cursor-pointer"
                  >
                    Buat Izin Pulang Sekarang
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {savedRecords.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-emerald-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{item.nama}</span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                            {item.kelas}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                            {item.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          No. HP: {item.noHp} • Laptop: {item.laptopOption === 'dibawa' ? 'Dibawa' : 'Aman di Asrama'} • Ceklist: Selesai [OK]
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Tugas: {item.tugasDirumah} • Termasuk Form Ceklis 22 Poin
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleCopyText(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-xs text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                          title="Salin Teks & Ceklis"
                        >
                          <i className="fa-solid fa-copy text-xs"></i>
                          <span>Salin</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShareWhatsApp(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          title="Kirim ke WhatsApp"
                        >
                          <i className="fa-brands fa-whatsapp text-xs"></i>
                          <span>WA</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectPrint(item)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          title="Cetak Surat Izin & Form Ceklis (2 Lembar)"
                        >
                          <i className="fa-solid fa-print text-xs"></i>
                          <span>Cetak 2 Lembar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* VIEW 4: MAIN FORM PERPULANGAN */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation text-rose-500 text-sm"></i>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. NAMA & KELAS */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-7">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap Santri <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm">
                      <i className="fa-solid fa-user-graduate"></i>
                    </div>
                    <input
                      type="text"
                      required
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Contoh: Muhammad Raihan Al-Fatih"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kelas <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm">
                      <i className="fa-solid fa-school"></i>
                    </div>
                    <select
                      value={kelas}
                      onChange={(e) => setKelas(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer font-medium"
                    >
                      <option value="Kelas VII A">Kelas VII A</option>
                      <option value="Kelas VII B">Kelas VII B</option>
                      <option value="Kelas VIII A">Kelas VIII A</option>
                      <option value="Kelas VIII B">Kelas VIII B</option>
                      <option value="Kelas IX A">Kelas IX A</option>
                      <option value="Kelas IX B">Kelas IX B</option>
                      <option value="Kelas X">Kelas X</option>
                      <option value="Kelas XI">Kelas XI</option>
                      <option value="Kelas XII">Kelas XII</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. NO HP WALI */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor HP / WhatsApp Wali Santri <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm">
                    <i className="fa-brands fa-whatsapp text-emerald-500"></i>
                  </div>
                  <input
                    type="tel"
                    required
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Surat Izin resmi & Form Ceklis 22 Kegiatan dapat langsung dikirimkan ke nomor WhatsApp ini.
                </p>
              </div>

              {/* 3. LAPTOP: DIBIARKAN / DIBAWA */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status Laptop Santri <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLaptopOption('dibawa')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      laptopOption === 'dibawa'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/30'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${laptopOption === 'dibawa' ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        <i className="fa-solid fa-laptop"></i>
                      </div>
                      <span className="font-bold text-xs">Dibawa Pulang</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Laptop dibawa ke rumah atas izin & pengawasan wali.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLaptopOption('tidak_dibawa')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      laptopOption === 'tidak_dibawa'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${laptopOption === 'tidak_dibawa' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        <i className="fa-solid fa-shield-halved"></i>
                      </div>
                      <span className="font-bold text-xs">Tidak Dibawa (Aman)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Disimpan & dikunci di loker / asrama pondok.
                    </p>
                  </button>
                </div>
              </div>

              {/* 4. CEKLIST BAJU & LOKER */}
              <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Ceklist Kerapian & Keamanan Asrama <span className="text-rose-500">*</span>
                </span>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isBajuChecked}
                    onChange={(e) => setIsBajuChecked(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Ceklist Baju:
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 ml-1">
                      Pakaian kotor telah dicuci / dipacking rapi dan tidak ditinggalkan menumpuk di kamar.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isLokerChecked}
                    onChange={(e) => setIsLokerChecked(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Ceklist Loker & Kamar:
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 ml-1">
                      Loker lemari telah dibersihkan, dirapikan, dan digembok terkunci dengan aman.
                    </span>
                  </div>
                </label>
              </div>

              {/* 5. TUGAS DIRUMAH */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tugas Wajib Santri Dirumah
                </label>
                <input
                  type="text"
                  value={tugasDirumah}
                  onChange={(e) => setTugasDirumah(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Otomatis terisi: <em>"{defaultTugas}"</em> (bisa disesuaikan jika ada tugas khusus).
                </p>
              </div>

              {/* 7. JADWAL PULANG & KEMBALI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Pulang
                  </label>
                  <input
                    type="date"
                    value={tanggalPulang}
                    onChange={(e) => setTanggalPulang(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Batas Kembali (Maks 17.00 WIB)
                  </label>
                  <input
                    type="date"
                    value={tanggalKembali}
                    onChange={(e) => setTanggalKembali(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              {/* INFO LAMPIRAN FORM CEKLIS 22 POIN */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    <i className="fa-solid fa-list-check"></i>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Termasuk Form Ceklis Perpulangan (22 Kegiatan)
                    </h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Otomatis dilampirkan pada lembar belakang surat izin saat dicetak.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('checklist')}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-sm border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 cursor-pointer"
                >
                  Lihat 22 Poin
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 sm:py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-file-circle-check"></i>
                      <span>Terbitkan Surat Izin & Ceklis</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
