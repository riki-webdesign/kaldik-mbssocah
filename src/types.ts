export type EventCategory = 'formal' | 'diniyah' | 'ibadah' | 'asrama';

export type UserRole = 'admin_utama' | 'ustadz' | 'santri';

export interface AgendaEvent {
  id: string;
  title: string;
  category: EventCategory;
  startDate: string; // ISO date string YYYY-MM-DD
  endDate?: string;
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  location: string;
  description: string;
  allDay?: boolean;
  speakerOrTeacher?: string;
  isDone?: boolean;
}

export interface PrayerTime {
  name: string;
  arabicName: string;
  time: string; // HH:mm
  isNext?: boolean;
  isPassed?: boolean;
  icon: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'Penting' | 'Akademik' | 'Kegiatan' | 'Informasi';
  date: string;
  content: string;
  author: string;
  isImportant?: boolean;
}

export interface AttendanceRecord {
  id: string;
  santriName: string;
  nis: string;
  className: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';
  date: string;
  activityName: string;
  notes?: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: EventCategory | 'system';
}

export interface LeavePermissionRecord {
  id: string;
  nama: string;
  kelas: string;
  noHp: string;
  laptopOption: 'dibawa' | 'tidak_dibawa';
  isBajuChecked: boolean;
  isLokerChecked: boolean;
  tagihanBelumLunas: number;
  tugasDirumah: string;
  tanggalPulang?: string;
  tanggalKembali?: string;
  alasanPulang?: string;
  createdAt: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
}
