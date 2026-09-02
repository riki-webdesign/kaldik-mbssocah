-- =============================================================================
-- STRUKTUR DATABASE MYSQL UNTUK PONDOK PESANTREN BABUSALAM SOCAH
-- Import file ini di phpMyAdmin cPanel Niagahoster Anda
-- =============================================================================

CREATE TABLE IF NOT EXISTS `events` (
  `id` VARCHAR(100) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` ENUM('formal', 'diniyah', 'ibadah', 'asrama') NOT NULL DEFAULT 'formal',
  `startDate` DATE NOT NULL,
  `endDate` DATE NULL,
  `startTime` VARCHAR(20) NULL,
  `endTime` VARCHAR(20) NULL,
  `location` VARCHAR(255) NOT NULL DEFAULT 'Pondok Pesantren Babusalam Socah',
  `description` TEXT NULL,
  `speakerOrTeacher` VARCHAR(255) NULL,
  `isDone` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `announcements` (
  `id` VARCHAR(100) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` ENUM('Penting', 'Akademik', 'Kegiatan', 'Informasi') NOT NULL DEFAULT 'Informasi',
  `date` VARCHAR(50) NOT NULL,
  `content` TEXT NOT NULL,
  `author` VARCHAR(255) NOT NULL DEFAULT 'Sekretariat Pesantren',
  `isImportant` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `prayer_times` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `arabicName` VARCHAR(100) NOT NULL,
  `time` VARCHAR(20) NOT NULL,
  `icon` VARCHAR(100) NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(100) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `timestamp` VARCHAR(100) NOT NULL,
  `read` TINYINT(1) NOT NULL DEFAULT 0,
  `category` VARCHAR(50) NOT NULL DEFAULT 'system',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `attendance` (
  `id` VARCHAR(100) PRIMARY KEY,
  `santriName` VARCHAR(255) NOT NULL,
  `nis` VARCHAR(50) NOT NULL,
  `className` VARCHAR(100) NOT NULL,
  `status` ENUM('Hadir', 'Izin', 'Sakit', 'Alpha') NOT NULL DEFAULT 'Hadir',
  `date` DATE NOT NULL,
  `activityName` VARCHAR(255) NOT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- DATA AWAL (SEED DATA) JADWAL & AGENDA UTAMA PESANTREN BABUSALAM SOCAH
-- =============================================================================

INSERT IGNORE INTO `events` (`id`, `title`, `category`, `startDate`, `startTime`, `endTime`, `location`, `description`, `speakerOrTeacher`, `isDone`) VALUES
('evt-today-1', 'Shalat Subuh Berjamaah & Tahfizh Al-Qur\'an', 'ibadah', CURDATE(), '04:15', '05:30', 'Masjid Utama Babusalam Socah', 'Kajian rutin ba\'da Subuh dan setoran hafalan Al-Qur\'an bersama Ust. M. Syukri, Lc.', 'Ust. M. Syukri, Lc.', 1),
('evt-today-2', 'KBM Formal & Diniyah Babusalam Socah', 'formal', CURDATE(), '07:00', '12:00', 'Gedung Kelas Babusalam Socah', 'Pembelajaran KBM formal dan terintegrasi nilai kepesantrenan.', 'Dewan Guru & Ustadz', 1),
('evt-today-3', 'Shalat Dzuhur Berjamaah', 'ibadah', CURDATE(), '12:00', '12:45', 'Masjid Utama Babusalam Socah', 'Diikuti wirid bersama dan kultum singkat oleh Santri Organisasi Santri Babusalam Socah.', 'Tim Pembina Diniyah', 0),
('evt-today-4', 'Madrasah Diniyah: Kitab Fathul Qarib (Fiqih)', 'diniyah', CURDATE(), '13:30', '15:00', 'Aula Pesantren Babusalam Socah', 'Membahas bab Thaharah dan Hukum Bersuci.', 'Ust. Ahmad Dahlan, S.Pd.I.', 0),
('evt-today-5', 'Shalat Ashar & Murojaah Al-Qur\'an', 'ibadah', CURDATE(), '15:15', '16:00', 'Masjid Utama Babusalam Socah', 'Simakan hafalan Quran pasangan santri.', 'Tim Tahfidz', 0),
('evt-today-6', 'Shalat Maghrib, Isya & Pembacaan Dzikir', 'ibadah', CURDATE(), '17:50', '19:45', 'Masjid Utama Babusalam Socah', 'Maghrib berjamaah dilanjutkan pembacaan dzikir dan Shalat Isya.', NULL, 0),
('kaldik-jul-1', 'Hari Pertama Tahun Pelajaran 2026/2027', 'formal', '2026-07-13', '07:00', '12:00', 'Kampus Babusalam Socah', 'Pembukaan resmi awal tahun pelajaran baru 2026/2027 Pondok Pesantren Babusalam Socah.', 'Kepala Sekolah & Pengasuh', 0),
('kaldik-aug-1', 'Peringatan HUT Kemerdekaan RI ke-81', 'formal', '2026-08-17', '07:00', '11:00', 'Lapangan Utama Babusalam', 'Upacara bendera dan Porseni Santri memperingati HUT RI.', 'Pengasuh & Santri', 0),
('kaldik-sep-1', 'Peringatan Maulid Nabi Muhammad SAW', 'ibadah', '2026-09-15', '19:30', '22:00', 'Masjid Utama Babusalam', 'Pembacaan Diba\'i, Tausiyah Agama, dan Santunan Anak Yatim.', 'KH. Achmad Zaini', 0);

INSERT IGNORE INTO `announcements` (`id`, `title`, `category`, `date`, `content`, `author`, `isImportant`) VALUES
('anc-1', 'Jadwal Pulang Santri Bulanan Agustus 2026', 'Penting', '2026-08-15', 'Diberitahukan kepada seluruh wali santri bahwa jadwal kepulangan bulanan santri akan dilaksanakan mulai hari Jumat setelah Shalat Ashar. Penjemputan wajib menyertakan kartu mahram.', 'Sekretariat Pesantren', 1),
('anc-2', 'Pelaksanaan Ujian Diniyah Semester Ganjil', 'Akademik', '2026-08-20', 'Ujian Syafahi (Lisan) dan Tahriri (Tulis) Kitab Kuning Diniyah Babusalam Socah akan dimulai tanggal 10 Desember 2026. Mohon para santri memaksimalkan murojaah.', 'Bagian Kurikulum Diniyah', 0),
('anc-3', 'Pendaftaran Ekstrakurikuler Pencak Silat & Habaib Choir', 'Kegiatan', '2026-08-22', 'Pendaftaran kegiatan ekstrakurikuler santri semester ganjil telah dibuka melalui pengurus asrama masing-masing.', 'Pengurus Ekstrakurikuler', 0);

INSERT IGNORE INTO `prayer_times` (`id`, `name`, `arabicName`, `time`, `icon`) VALUES
(1, 'Subuh', 'الفجر', '04:18', 'fa-regular fa-sun'),
(2, 'Terbit', 'الشروق', '05:32', 'fa-solid fa-sun'),
(3, 'Dzuhur', 'الظهر', '11:38', 'fa-solid fa-sun-plant-wilt'),
(4, 'Ashar', 'العصر', '14:56', 'fa-solid fa-cloud-sun'),
(5, 'Maghrib', 'المغرب', '17:39', 'fa-solid fa-moon'),
(6, 'Isya', 'العشاء', '18:49', 'fa-solid fa-star-and-crescent');
