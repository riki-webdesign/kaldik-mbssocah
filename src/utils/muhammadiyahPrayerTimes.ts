import { PrayerTime } from '../types';

export interface LocationCoordinates {
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timeZone: number; // UTC offset, e.g., 7 for WIB
}

export const CITIES_COORDINATES: Record<string, LocationCoordinates> = {
  'Socah (Bangkalan)': {
    name: 'Socah, Bangkalan (MBS Babussalam)',
    city: 'Socah (Bangkalan)',
    latitude: -7.0864,
    longitude: 112.7236,
    elevation: 10,
    timeZone: 7
  },
  'Bangkalan': {
    name: 'Kabupaten Bangkalan, Madura',
    city: 'Bangkalan',
    latitude: -7.0311,
    longitude: 112.7483,
    elevation: 15,
    timeZone: 7
  },
  'Surabaya': {
    name: 'Kota Surabaya, Jawa Timur',
    city: 'Surabaya',
    latitude: -7.2575,
    longitude: 112.7521,
    elevation: 5,
    timeZone: 7
  },
  'Yogyakarta': {
    name: 'Kota Yogyakarta (PP Muhammadiyah)',
    city: 'Yogyakarta',
    latitude: -7.7956,
    longitude: 110.3695,
    elevation: 113,
    timeZone: 7
  },
  'Jakarta': {
    name: 'DKI Jakarta',
    city: 'Jakarta',
    latitude: -6.2088,
    longitude: 106.8456,
    elevation: 8,
    timeZone: 7
  },
  'Solo': {
    name: 'Kota Surakarta (Solo)',
    city: 'Solo',
    latitude: -7.5666,
    longitude: 110.8247,
    elevation: 92,
    timeZone: 7
  },
  'Bandung': {
    name: 'Kota Bandung, Jawa Barat',
    city: 'Bandung',
    latitude: -6.9175,
    longitude: 107.6191,
    elevation: 708,
    timeZone: 7
  },
  'Malang': {
    name: 'Kota Malang, Jawa Timur',
    city: 'Malang',
    latitude: -7.9666,
    longitude: 112.6326,
    elevation: 444,
    timeZone: 7
  }
};

/**
 * Derajat ke Radian dan Radian ke Derajat
 */
const rad = (deg: number) => (deg * Math.PI) / 180.0;
const deg = (radian: number) => (radian * 180.0) / Math.PI;

/**
 * Hitung Julian Day dari tanggal Gregorian
 */
function getJulianDay(date: Date): number {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  const day = date.getDate();

  let y = year;
  let m = month;
  if (month <= 2) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);

  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    b -
    1524.5
  );
}

/**
 * Hitung parameter astronomi matahari (Deklinasi & Equation of Time)
 */
function getSunCoordinates(julianDay: number) {
  const d = julianDay - 2451545.0; // Hari sejak J2000.0
  const g = 357.529 + 0.98560028 * d; // Anomali rata-rata
  const q = 280.459 + 0.98564736 * d; // Bujur rata-rata
  const l = q + 1.915 * Math.sin(rad(g)) + 0.020 * Math.sin(rad(2 * g)); // Bujur ekliptika

  const e = 23.439 - 0.00000036 * d; // Kemiringan sumbu bumi (obliquity)

  // Deklinasi Matahari
  const sinDelta = Math.sin(rad(e)) * Math.sin(rad(l));
  const delta = deg(Math.asin(sinDelta));

  // Equation of Time (menit)
  const ra = deg(Math.atan2(Math.cos(rad(e)) * Math.sin(rad(l)), Math.cos(rad(l)))) / 15.0;
  let eot = (q / 15.0 - ra) * 60; // dalam menit

  // Normalisasi eot (-20 s.d +20 menit)
  while (eot > 30) eot -= 1440;
  while (eot < -30) eot += 1440;

  return { delta, eot };
}

/**
 * Format desimal jam (misal: 4.5) menjadi string "04:30"
 */
export function formatHoursToHHMM(decimalHours: number): string {
  let normalized = decimalHours;
  while (normalized < 0) normalized += 24;
  while (normalized >= 24) normalized -= 24;

  const totalMinutes = Math.round(normalized * 60);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Hitung Jadwal Waktu Sholat Berdasarkan Pedoman Majelis Tarjih PP Muhammadiyah
 *
 * Parameter Majelis Tarjih:
 * - Subuh: Sudut depresi matahari -18.0° (Munas Tarjih ke-31)
 * - Terbit / Syuruq: Pusat piringan matahari -1.0°
 * - Dzuhur: Waktu Transit (Zawal) + Ihtiyath
 * - Ashar: Bayangan = 1 + tan|Lintang - Deklinasi|
 * - Maghrib: Sudut matahari -1.0° (Ghurub) + Ihtiyath
 * - Isya: Sudut depresi matahari -18.0° (Syafaq Ahmar) + Ihtiyath
 * - Ihtiyath (Pengaman Waktu): +2 Menit (Kecuali Terbit/Syuruq)
 */
export function calculateMuhammadiyahPrayerTimes(
  date: Date = new Date(),
  coords: LocationCoordinates = CITIES_COORDINATES['Socah (Bangkalan)']
): PrayerTime[] {
  const jd = getJulianDay(date);
  const { delta, eot } = getSunCoordinates(jd);

  const phi = coords.latitude;
  const lambda = coords.longitude;
  const tz = coords.timeZone;

  // Waktu Matahari Melintasi Meridian / Kulminasi Atas (Zawal) dalam Jam Lokal
  const transitTime = 12 + tz - lambda / 15.0 - eot / 60.0;

  // Fungsi pembantu sudut waktu matahari t(h)
  const hourAngle = (h: number): number => {
    const cosT =
      (Math.sin(rad(h)) - Math.sin(rad(phi)) * Math.sin(rad(delta))) /
      (Math.cos(rad(phi)) * Math.cos(rad(delta)));

    if (cosT > 1) return 0; // Matahari tidak pernah mencapai ketinggian h
    if (cosT < -1) return 180; // Matahari selalu di atas ketinggian h
    return deg(Math.acos(cosT));
  };

  const IHTIYATH_HOURS = 2 / 60; // 2 Menit

  // 1. Subuh (-18° sesuai Munas Tarjih ke-31 PP Muhammadiyah)
  const tFajr = hourAngle(-18.0);
  const fajrHours = transitTime - tFajr / 15.0 + IHTIYATH_HOURS;

  // 2. Terbit / Syuruq (-1.0°)
  const tSunrise = hourAngle(-1.0);
  const sunriseHours = transitTime - tSunrise / 15.0;

  // 3. Dzuhur (Zawal + 2 Menit Ihtiyath)
  const dhuhrHours = transitTime + IHTIYATH_HOURS;

  // 4. Ashar (Bayangan = 1 + tan|phi - delta|)
  const deltaPhi = Math.abs(phi - delta);
  const hAsr = deg(Math.atan(1.0 / (1.0 + Math.tan(rad(deltaPhi)))));
  const tAsr = hourAngle(hAsr);
  const asrHours = transitTime + tAsr / 15.0 + IHTIYATH_HOURS;

  // 5. Maghrib (-1.0° Ghurub + 2 Menit Ihtiyath)
  const tMaghrib = hourAngle(-1.0);
  const maghribHours = transitTime + tMaghrib / 15.0 + IHTIYATH_HOURS;

  // 6. Isya (-18.0° Syafaq + 2 Menit Ihtiyath)
  const tIsha = hourAngle(-18.0);
  const ishaHours = transitTime + tIsha / 15.0 + IHTIYATH_HOURS;

  return [
    {
      name: 'Subuh',
      arabicName: 'الفجر',
      time: formatHoursToHHMM(fajrHours),
      icon: 'fa-cloud-moon'
    },
    {
      name: 'Terbit',
      arabicName: 'الشروq',
      time: formatHoursToHHMM(sunriseHours),
      icon: 'fa-sun'
    },
    {
      name: 'Dzuhur',
      arabicName: 'الظهر',
      time: formatHoursToHHMM(dhuhrHours),
      icon: 'fa-sun'
    },
    {
      name: 'Ashar',
      arabicName: 'العصر',
      time: formatHoursToHHMM(asrHours),
      icon: 'fa-cloud-sun'
    },
    {
      name: 'Maghrib',
      arabicName: 'المغرب',
      time: formatHoursToHHMM(maghribHours),
      icon: 'fa-moon'
    },
    {
      name: 'Isya',
      arabicName: 'العشاء',
      time: formatHoursToHHMM(ishaHours),
      icon: 'fa-star-and-crescent'
    }
  ];
}
