export interface LeaveChecklistItem {
  no: number;
  activity: string;
  category: 'ibadah' | 'adab' | 'akademik' | 'hafalan';
}

export const LEAVE_CHECKLIST_ITEMS: string[] = [
  'Melaksanakan Solat Duhur',
  'Melaksanakan Solat Asar',
  'Membantu Orang Tua Membersihkan Rumah',
  'Melaksanakan Solat Maghrib',
  "Melaksanakan Solat Isya'",
  'Belajar / Menyelesaikan Tugas Jurnal',
  'Melaksanakan Tahajjud',
  'Melaksanakan Solat Subuh',
  'Murajaah Hafalan',
  'Membantu orang tua',
  'Melaksanakan Solat Duhur',
  'Melaksanakan Solat Asar',
  'Membantu Orang Tua',
  'Melaksanakan Solat Maghrib',
  "Melaksanakan Solat Isya'",
  'Belajar / Mengerjakan Tugas Jurnal',
  'Solat Tahajjud',
  'Solat Subuh',
  'Murajaah Hafalan',
  'Membantu Orang Tua',
  'Melaksanakan Solat Zuhur',
  'Melaksanakan Solat Asar'
];

export const getCategoryForActivity = (activity: string): 'ibadah' | 'adab' | 'akademik' | 'hafalan' => {
  const lower = activity.toLowerCase();
  if (lower.includes('solat') || lower.includes('tahajjud')) return 'ibadah';
  if (lower.includes('membantu') || lower.includes('orang tua') || lower.includes('membersihkan')) return 'adab';
  if (lower.includes('hafalan') || lower.includes('murajaah')) return 'hafalan';
  return 'akademik';
};
