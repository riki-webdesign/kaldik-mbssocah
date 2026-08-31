import { AgendaEvent, Announcement, AttendanceRecord, PrayerTime, PushNotification } from '../types';
import { calculateMuhammadiyahPrayerTimes } from '../utils/muhammadiyahPrayerTimes';

// Helper to generate YYYY-MM-DD for relative days
export const getRelativeDate = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

// =========================================================================
// AGENDAS & KALENDER AKADEMIK PONDOK PESANTREN BABUSALAM SOCAH (TAHUN PELAJARAN 2026/2027)
// Berdasarkan Dokumen Resmi Kalender Pendidikan & Kegiatan Kekhususan
// =========================================================================
export const INITIAL_EVENTS: AgendaEvent[] = [
  // --- AGENDA HARIAN BOARDING (HARI INI) ---
  {
    id: 'evt-today-1',
    title: 'Shalat Subuh Berjamaah & Tahfizh Al-Qur\'an',
    category: 'ibadah',
    startDate: getRelativeDate(0),
    startTime: '04:15',
    endTime: '05:30',
    location: 'Masjid Utama Babusalam Socah',
    description: 'Kajian rutin ba\'da Subuh dan setoran hafalan Al-Qur\'an bersama Ust. M. Syukri, Lc.',
    speakerOrTeacher: 'Ust. M. Syukri, Lc.',
    isDone: true
  },
  {
    id: 'evt-today-2',
    title: 'KBM Formal & Diniyah Babusalam Socah',
    category: 'formal',
    startDate: getRelativeDate(0),
    startTime: '07:00',
    endTime: '12:00',
    location: 'Gedung Kelas Babusalam Socah',
    description: 'Pembelajaran KBM formal dan terintegrasi nilai kepesantrenan.',
    speakerOrTeacher: 'Dewan Guru & Ustadz',
    isDone: true
  },
  {
    id: 'evt-today-3',
    title: 'Shalat Dzuhur Berjamaah',
    category: 'ibadah',
    startDate: getRelativeDate(0),
    startTime: '12:00',
    endTime: '12:45',
    location: 'Masjid Utama Babusalam Socah',
    description: 'Diikuti wirid bersama dan kultum singkat oleh Santri Organisasi Santri Babusalam Socah.',
    speakerOrTeacher: 'Tim Pembina Diniyah',
    isDone: false
  },
  {
    id: 'evt-today-4',
    title: 'Madrasah Diniyah: Kitab Fathul Qarib (Fiqih)',
    category: 'diniyah',
    startDate: getRelativeDate(0),
    startTime: '13:30',
    endTime: '15:00',
    location: 'Aula Pesantren Babusalam Socah',
    description: 'Membahas bab Thaharah dan Hukum Bersuci.',
    speakerOrTeacher: 'Ust. Ahmad Dahlan, S.Pd.I.',
    isDone: false
  },
  {
    id: 'evt-today-5',
    title: 'Shalat Ashar & Murojaah Al-Qur\'an',
    category: 'ibadah',
    startDate: getRelativeDate(0),
    startTime: '15:15',
    endTime: '16:00',
    location: 'Masjid Utama Babusalam Socah',
    description: 'Simakan hafalan Quran pasangan santri.',
    speakerOrTeacher: 'Tim Tahfidz',
    isDone: false
  },
  {
    id: 'evt-today-6',
    title: 'Shalat Maghrib, Isya & Pembacaan Dzikir',
    category: 'ibadah',
    startDate: getRelativeDate(0),
    startTime: '17:50',
    endTime: '19:45',
    location: 'Masjid Utama Babusalam Socah',
    description: 'Maghrib berjamaah dilanjutkan pembacaan dzikir dan Shalat Isya.',
    isDone: false
  },

  // --- SEMESTER GANJIL 2026/2027 ---
  // Juli 2026
  {
    id: 'kaldik-jul-1',
    title: 'Hari Pertama Tahun Pelajaran 2026/2027',
    category: 'formal',
    startDate: '2026-07-13',
    startTime: '07:00',
    endTime: '12:00',
    location: 'Kampus Babusalam Socah',
    description: 'Pembukaan resmi awal tahun pelajaran baru 2026/2027 Pondok Pesantren Babusalam Socah (Hari Efektif Juli: 17 hari).',
    speakerOrTeacher: 'Kepala Sekolah & Pengasuh'
  },
  {
    id: 'kaldik-jul-2',
    title: 'Masa Pengenalan Lingkungan Sekolah (MPLS)',
    category: 'formal',
    startDate: '2026-07-14',
    endDate: '2026-07-18',
    startTime: '07:00',
    endTime: '15:00',
    location: 'Kampus Babusalam Socah',
    description: 'Orientasi pengenalan kedisiplinan boarding, keorganisasian, dan budaya pesantren.',
    speakerOrTeacher: 'Panitia MPLS & OSIS'
  },
  {
    id: 'kaldik-jul-3',
    title: 'Jadwal Pulang Santri Bulanan (Juli 2026)',
    category: 'asrama',
    startDate: '2026-07-31',
    endDate: '2026-08-02',
    startTime: '14:00',
    endTime: '17:00',
    location: 'Asrama Babusalam Socah',
    description: 'Jadwal penjemputan santri bulanan (Jumat-Sabtu-Minggu sore kembali ke asrama).'
  },

  // Agustus 2026
  {
    id: 'kaldik-agu-1',
    title: 'Jadwal Pulang Santri (Dekat HUT RI)',
    category: 'asrama',
    startDate: '2026-08-14',
    endDate: '2026-08-16',
    startTime: '14:00',
    endTime: '17:00',
    location: 'Asrama Babusalam Socah',
    description: 'Jadwal pulang santri bulanan berdekatan dengan Hari Kemerdekaan RI (Minggu sore kembali).'
  },
  {
    id: 'kaldik-agu-2',
    title: 'Peringatan HUT Kemerdekaan RI ke-81',
    category: 'formal',
    startDate: '2026-08-17',
    startTime: '07:00',
    endTime: '11:00',
    location: 'Lapangan Utama Babusalam Socah',
    description: 'Upacara bendera peringatan Kemerdekaan RI dan atraksi kemerdekaan santri.'
  },

  // September 2026
  {
    id: 'kaldik-sep-1',
    title: 'Ujian Level Nahwu & Shorrof Tahap I',
    category: 'diniyah',
    startDate: '2026-09-14',
    endDate: '2026-09-19',
    startTime: '08:00',
    endTime: '12:00',
    location: 'Aula Diniyah Babusalam Socah',
    description: 'Kegiatan Kekhususan Babusalam Socah: Evaluasi pemahaman matan kitab Nahwu & Shorrof Tahap I.',
    speakerOrTeacher: 'Tim Penguji Diniyah'
  },
  {
    id: 'kaldik-sep-2',
    title: 'Jadwal Pulang Santri Bulanan (September 2026)',
    category: 'asrama',
    startDate: '2026-09-25',
    endDate: '2026-09-27',
    startTime: '14:00',
    endTime: '17:00',
    location: 'Asrama Babusalam Socah',
    description: 'Perizinan pulang bulanan santri (Jumat-Sabtu-Minggu sore kembali ke asrama).'
  },

  // Oktober 2026
  {
    id: 'kaldik-okt-1',
    title: 'Kegiatan Tengah Semester (PORSENI)',
    category: 'formal',
    startDate: '2026-10-05',
    endDate: '2026-10-10',
    startTime: '07:30',
    endTime: '15:00',
    location: 'Kampus Babusalam Socah',
    description: 'Pekan Olahraga dan Seni antar kelas & asrama santri Babusalam Socah.'
  },
  {
    id: 'kaldik-okt-2',
    title: 'Jadwal Pulang Santri Bulanan (Oktober 2026)',
    category: 'asrama',
    startDate: '2026-10-16',
    endDate: '2026-10-18',
    startTime: '14:00',
    endTime: '17:00',
    location: 'Asrama Babusalam Socah',
    description: 'Jadwal kepulangan santri rutin bulanan.'
  },
  {
    id: 'kaldik-okt-3',
    title: 'Outbound & Outing Class Tahap I (Seni, Budaya, & Bahasa)',
    category: 'asrama',
    startDate: '2026-10-26',
    endDate: '2026-10-27',
    startTime: '07:00',
    endTime: '16:00',
    location: 'Lokasi Ekowisata & Cagar Budaya',
    description: 'Kegiatan Kekhususan Babusalam Socah: Pembelajaran lapangan seni, budaya, dan praktik bahasa.'
  },

  // November 2026
  {
    id: 'kaldik-nov-1',
    title: 'Jadwal Pulang Santri Bulanan (November 2026)',
    category: 'asrama',
    startDate: '2026-11-13',
    endDate: '2026-11-15',
    startTime: '14:00',
    endTime: '17:00',
    location: 'Asrama Babusalam Socah',
    description: 'Perizinan kepulangan santri ke rumah.'
  },
  {
    id: 'kaldik-nov-2',
    title: 'Ujian Level Nahwu & Shorrof Tahap II (Awal Pelaksanaan)',
    category: 'diniyah',
    startDate: '2026-11-30',
    endDate: '2026-12-05',
    startTime: '08:00',
    endTime: '12:00',
    location: 'Aula Diniyah Babusalam Socah',
    description: 'Kegiatan Kekhususan Babusalam Socah: Evaluasi kelulusan level Nahwu & Shorrof Tahap II.'
  },

  // Desember 2026
  {
    id: 'kaldik-des-1',
    title: 'Asesmen / Penilaian Semester Ganjil (SAS)',
    category: 'formal',
    startDate: '2026-12-07',
    endDate: '2026-12-12',
    startTime: '07:30',
    endTime: '12:00',
    location: 'Gedung Sekolah Babusalam Socah',
    description: 'Ujian Akhir Semester Ganjil mata pelajaran formal & kepesantrenan.'
  },
  {
    id: 'kaldik-des-2',
    title: 'Festival Seni dan Kreativitas Semester Ganjil',
    category: 'asrama',
    startDate: '2026-12-14',
    endDate: '2026-12-15',
    startTime: '08:00',
    endTime: '22:00',
    location: 'Panggung Utama Babusalam Socah',
    description: 'Kegiatan Kekhususan Babusalam Socah: Panggung gembira, pentas drama 3 bahasa, dan pameran karya.'
  },
  {
    id: 'kaldik-des-3',
    title: 'Pembagian Rapor Semester Ganjil',
    category: 'formal',
    startDate: '2026-12-23',
    startTime: '08:00',
    endTime: '12:00',
    location: 'Aula Babusalam Socah',
    description: 'Penyerahan Laporan Hasil Belajar (LHB) akademik formal & kepesantrenan kepada wali santri.'
  },
  {
    id: 'kaldik-des-4',
    title: 'Libur Semester Ganjil & Pulang Santri',
    category: 'asrama',
    startDate: '2026-12-24',
    endDate: '2027-01-02',
    startTime: '08:00',
    endTime: '17:00',
    location: 'Asrama Babusalam Socah',
    description: 'Libur panjang semester ganjil menyatu dengan Cuti Bersama & Libur Natal.'
  },

  // --- SEMESTER GENAP 2026/2027 ---
  // Januari 2027
  {
    id: 'kaldik-jan-1',
    title: 'Awal Pembelajaran Semester Genap',
    category: 'formal',
    startDate: '2027-01-04',
    startTime: '07:00',
    endTime: '12:00',
    location: 'Babusalam Socah',
    description: 'Permulaan KBM semester genap tahun pelajaran 2026/2027 (Hari Efektif Januari: 23 hari).'
  },
  {
    id: 'kaldik-jan-2',
    title: 'Libur Isra Mikraj Nabi Muhammad SAW',
    category: 'ibadah',
    startDate: '2027-01-05',
    startTime: '00:00',
    endTime: '23:59',
    location: 'Kampus Babusalam Socah',
    description: 'Libur keagamaan peringatan Isra Mikraj.'
  },
  {
    id: 'kaldik-jan-3',
    title: 'Jadwal Pulang Santri Bulanan (Januari 2027)',
    category: 'asrama',
    startDate: '2027-01-29',
    endDate: '2027-01-31',
    startTime: '14:00',
    endTime: '17:00',
    location: 'Asrama Babusalam Socah',
    description: 'Kepulangan santri bulanan semester genap.'
  },

  // Februari 2027
  {
    id: 'kaldik-feb-1',
    title: 'Outbound & Outing Class Tahap II (Seni, Budaya, & Bahasa)',
    category: 'asrama',
    startDate: '2027-02-01',
    endDate: '2027-02-02',
    startTime: '07:00',
    endTime: '16:00',
    location: 'Destinasi Outbound & Edukasi',
    description: 'Kegiatan Kekhususan Babusalam Socah: Outbound kepemimpinan & penguatan bahasa.'
  },
  {
    id: 'kaldik-feb-2',
    title: 'Jadwal Pulang Santri (Dekat Libur Imlek)',
    category: 'asrama',
    startDate: '2027-02-05',
    endDate: '2027-02-07',
    startTime: '14:00',
    endTime: '17:00',
    location: 'Asrama Babusalam Socah',
    description: 'Jadwal pulang santri berdekatan dengan libur nasional Imlek.'
  },
  {
    id: 'kaldik-feb-3',
    title: 'Kegiatan Permulaan Puasa (KPP) Ramadhan',
    category: 'diniyah',
    startDate: '2027-02-08',
    endDate: '2027-02-10',
    startTime: '08:00',
    endTime: '15:00',
    location: 'Masjid & Aula Babusalam Socah',
    description: 'Pembekalan ibadah puasa, tarawih, dan pasantren kilat Ramadhan.'
  },

  // Maret 2027
  {
    id: 'kaldik-mar-1',
    title: 'Ujian Level Nahwu & Shorrof Tahap III',
    category: 'diniyah',
    startDate: '2027-03-01',
    endDate: '2027-03-06',
    startTime: '08:00',
    endTime: '12:00',
    location: 'Aula Diniyah Babusalam Socah',
    description: 'Kegiatan Kekhususan Babusalam Socah: Pengujian matan gramatika Bahasa Arab Tahap III.'
  },
  {
    id: 'kaldik-mar-2',
    title: 'Libur Idul Fitri 1448 H & Pulang Santri',
    category: 'asrama',
    startDate: '2027-03-08',
    endDate: '2027-03-13',
    startTime: '08:00',
    endTime: '17:00',
    location: 'Asrama Babusalam Socah',
    description: 'Libur nasional Idul Fitri 1448 H, Hari Raya Nyepi, dan Cuti Bersama sekaligus kepulangan santri.'
  },

  // April 2027
  {
    id: 'kaldik-apr-1',
    title: 'Jadwal Pulang Santri Bulanan (April 2027)',
    category: 'asrama',
    startDate: '2027-04-09',
    endDate: '2027-04-11',
    startTime: '14:00',
    endTime: '17:00',
    location: 'Asrama Babusalam Socah',
    description: 'Jadwal perizinan pulang bulanan santri.'
  },
  {
    id: 'kaldik-apr-2',
    title: 'Sumatif Akhir Jenjang (SAJ) Tingkat Akhir',
    category: 'formal',
    startDate: '2027-04-19',
    endDate: '2027-04-24',
    startTime: '07:30',
    endTime: '12:30',
    location: 'Ruang Ujian Babusalam Socah',
    description: 'Ujian kelulusan akhir jenjang untuk santri kelas tingkat akhir Babusalam Socah.'
  },

  // Mei 2027
  {
    id: 'kaldik-mei-1',
    title: 'Sumatif Akhir Jenjang (SAJ) Ujian Sekolah',
    category: 'formal',
    startDate: '2027-05-10',
    endDate: '2027-05-15',
    startTime: '07:30',
    endTime: '12:00',
    location: 'Gedung Sekolah Babusalam Socah',
    description: 'Ujian asesmen sumatif akhir tahun ajaran.'
  },
  {
    id: 'kaldik-mei-2',
    title: 'Jadwal Pulang Santri (Dekat Hari Raya Waisak)',
    category: 'asrama',
    startDate: '2027-05-21',
    endDate: '2027-05-23',
    startTime: '14:00',
    endTime: '17:00',
    location: 'Asrama Babusalam Socah',
    description: 'Pulang santri bulanan mendekati Libur Waisak.'
  },
  {
    id: 'kaldik-mei-3',
    title: 'Ujian Level Nahwu & Shorrof Tahap IV (Final)',
    category: 'diniyah',
    startDate: '2027-05-24',
    endDate: '2027-05-29',
    startTime: '08:00',
    endTime: '12:00',
    location: 'Aula Diniyah Babusalam Socah',
    description: 'Kegiatan Kekhususan Babusalam Socah: Evaluasi kelulusan tingkat akhir Nahwu & Shorrof.'
  },

  // Juni 2027
  {
    id: 'kaldik-jun-1',
    title: 'Festival Seni dan Kreativitas Semester Genap',
    category: 'asrama',
    startDate: '2027-06-01',
    endDate: '2027-06-02',
    startTime: '08:00',
    endTime: '22:00',
    location: 'Panggung Utama Babusalam Socah',
    description: 'Kegiatan Kekhususan Babusalam Socah: Gelar karya santri dan panggung seni akhir tahun.'
  },
  {
    id: 'kaldik-jun-2',
    title: 'Jadwal Pulang Santri (Dekat Tahun Baru Hijriah)',
    category: 'asrama',
    startDate: '2027-06-04',
    endDate: '2027-06-06',
    startTime: '14:00',
    endTime: '17:00',
    location: 'Asrama Babusalam Socah',
    description: 'Kepulangan santri mendekati Peringatan Tahun Baru Islam 1449 H.'
  },
  {
    id: 'kaldik-jun-3',
    title: 'Outbound & Outing Class Tahap III (Seni, Budaya, & Bahasa)',
    category: 'asrama',
    startDate: '2027-06-14',
    endDate: '2027-06-15',
    startTime: '07:00',
    endTime: '16:00',
    location: 'Destinasi Edukasi Wisata',
    description: 'Kegiatan Kekhususan Babusalam Socah: Outbound pamungkas tahun ajaran.'
  },
  {
    id: 'kaldik-jun-4',
    title: 'Ihtifal Takrimil Huffazh & Haflah Akhirussanah',
    category: 'diniyah',
    startDate: '2027-06-16',
    endDate: '2027-06-17',
    startTime: '08:00',
    endTime: '13:00',
    location: 'Masjid & Lapangan Utama Babusalam Socah',
    description: 'Kegiatan Kekhususan Babusalam Socah: Wisuda penghafal Al-Qur\'an, wisuda kelulusan santri, dan panggung kenaikan kelas.'
  },
  {
    id: 'kaldik-jun-5',
    title: 'Akhir Semester Genap & Pembagian Rapor',
    category: 'formal',
    startDate: '2027-06-19',
    startTime: '08:00',
    endTime: '12:00',
    location: 'Aula Babusalam Socah',
    description: 'Penyerahan Rapor Hasil Belajar Semester Genap T.P. 2026/2027.'
  },
  {
    id: 'kaldik-jun-6',
    title: 'Libur Panjang Semester Genap T.P. 2026/2027',
    category: 'asrama',
    startDate: '2027-06-21',
    endDate: '2027-07-10',
    startTime: '08:00',
    endTime: '17:00',
    location: 'Asrama Babusalam Socah',
    description: 'Libur kenaikan kelas dan akhir tahun pelajaran 2026/2027.'
  },
  {
    id: 'kaldik-jul-next',
    title: 'Awal Tahun Pelajaran Baru 2027/2028',
    category: 'formal',
    startDate: '2027-07-12',
    startTime: '07:00',
    endTime: '12:00',
    location: 'Babusalam Socah',
    description: 'Permulaan KBM Tahun Pelajaran Baru 2027/2028.'
  }
];

export const INITIAL_PRAYER_TIMES: PrayerTime[] = calculateMuhammadiyahPrayerTimes(new Date());

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc-1',
    title: 'Penerbitan Resmi Kalender Pendidikan & Kegiatan Kekhususan T.P. 2026/2027',
    category: 'Penting',
    date: getRelativeDate(0),
    content: 'Diberitahukan kepada seluruh ustadz, santri, dan wali santri Pondok Pesantren Babusalam Socah bahwa Kalender Pendidikan Terpadu dan Kegiatan Kekhususan Tahun Pelajaran 2026/2027 telah ditetapkan secara resmi. Dokumen ini memuat jadwal Ujian Level Nahwu & Shorrof, Outbound 3 Bahasa, Festival Seni, Ihtifal Takrimil Huffazh, serta Kalender Pulang Santri Bulanan.',
    author: 'Panitia Kurikulum & Pengasuhan Babusalam Socah',
    isImportant: true
  },
  {
    id: 'anc-2',
    title: 'Aturan & Ketentuan Jadwal Pulang Santri Bulanan',
    category: 'Informasi',
    date: getRelativeDate(-1),
    content: 'Jadwal Pulang Santri dilaksanakan rutin setiap bulan selama 3 hari (Jumat, Sabtu, dan Minggu sore pukul 17.00 WIB santri wajib kembali ke asrama). Jadwal kepulangan diselaraskan dengan momen libur nasional & keagamaan seperti HUT RI, Imlek, Idul Fitri, Waisak, dan Tahun Baru Hijriah.',
    author: 'Pengurus Asrama Babusalam Socah',
    isImportant: false
  },
  {
    id: 'anc-3',
    title: 'Pelaksanaan Ujian Level Nahwu & Shorrof (4 Tahap Setahun)',
    category: 'Akademik',
    date: getRelativeDate(-2),
    content: 'Sebagai program Kegiatan Kekhususan Babusalam Socah, Ujian Level Nahwu & Shorrof diselenggarakan 4 kali dalam setahun (tiap 3 bulan). Tahap I: 14-19 Sep 2026, Tahap II: 30 Nov-5 Des 2026, Tahap III: 1-6 Mar 2027, dan Tahap IV: 24-29 Mei 2027. Mohon para santri mempersiapkan hafalan matan kitab.',
    author: 'Bagian Madrasah Diniyah Babusalam Socah',
    isImportant: true
  },
  {
    id: 'anc-4',
    title: 'Program Outbound & Outing Class (Seni, Budaya, dan Bahasa)',
    category: 'Kegiatan',
    date: getRelativeDate(-3),
    content: 'Outbound & Outing Class diselenggarakan 3 kali setahun (tiap 4 bulan sekali). Tahap I: 26-27 Okt 2026, Tahap II: 1-2 Feb 2027, dan Tahap III: 14-15 Juni 2027 guna mengasah ketangkasan, seni budaya, dan keberanian bahasa Arab/Inggris santri.',
    author: 'Departemen Bahasa & Ekstrakurikuler',
    isImportant: false
  },
  {
    id: 'anc-5',
    title: 'Agenda Puncak Ihtifal Takrimil Huffazh & Wisuda Kelulusan 2027',
    category: 'Penting',
    date: getRelativeDate(-4),
    content: 'Acara Puncak Ihtifal Takrimil Huffazh (Wisuda Penghafal Al-Qur\'an) akan diselenggarakan pada tanggal 16 s.d. 17 Juni 2027 menjelang akhir tahun pelajaran, bersamaan dengan purna santri dan panggung Haflah Akhirussanah.',
    author: 'Lembaga Tahfidz & Pengasuhan Babusalam Socah',
    isImportant: true
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_NOTIFICATIONS: PushNotification[] = [
  {
    id: 'notif-1',
    title: 'Kalender Pendidikan 2026/2027 Terbit',
    message: 'Admin Utama telah memperbarui seluruh jadwal kegiatan kekhususan dan KBM semester ganjil/genap.',
    timestamp: 'Baru saja',
    read: false,
    category: 'formal'
  },
  {
    id: 'notif-2',
    title: 'Ujian Level Nahwu & Shorrof Tahap I',
    message: 'Jadwal pengujian dilaksanakan pada 14 s.d. 19 September 2026. Persiapkan hafalan matan.',
    timestamp: '1 jam yang lalu',
    read: false,
    category: 'diniyah'
  },
  {
    id: 'notif-3',
    title: 'Pengumuman Pulang Santri Bulanan',
    message: 'Jadwal perizinan penjemputan santri telah disesuaikan dengan kalender akademik resmi.',
    timestamp: 'Yesterday',
    read: true,
    category: 'asrama'
  }
];
