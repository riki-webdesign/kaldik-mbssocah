import React, { useEffect, useState } from 'react';
import { PrayerTime } from '../types';
import {
  calculateMuhammadiyahPrayerTimes,
  CITIES_COORDINATES,
  LocationCoordinates
} from '../utils/muhammadiyahPrayerTimes';

interface PrayerTimesCardProps {
  prayerTimes: PrayerTime[];
  setPrayerTimes: React.Dispatch<React.SetStateAction<PrayerTime[]>>;
}

export const PrayerTimesCard: React.FC<PrayerTimesCardProps> = ({
  prayerTimes,
  setPrayerTimes
}) => {
  const [selectedCityKey, setSelectedCityKey] = useState<string>('Socah (Bangkalan)');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [countdownText, setCountdownText] = useState<string>('');
  const [nextPrayerName, setNextPrayerName] = useState<string | null>(null);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);

  // Recalculate prayer times whenever city or date changes based on Majelis Tarjih Muhammadiyah
  useEffect(() => {
    const coords: LocationCoordinates =
      CITIES_COORDINATES[selectedCityKey] || CITIES_COORDINATES['Socah (Bangkalan)'];
    const dateObj = new Date(selectedDate);
    const calculatedTimes = calculateMuhammadiyahPrayerTimes(dateObj, coords);
    setPrayerTimes(calculatedTimes);
    setIsCalculated(true);
  }, [selectedCityKey, selectedDate, setPrayerTimes]);

  // Live countdown to next prayer calculation
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes();

      let nextPrayer: PrayerTime | null = null;
      let minDiff = 9999;

      prayerTimes.forEach((pt) => {
        const [h, m] = pt.time.split(':').map(Number);
        const pMin = h * 60 + m;
        const diff = pMin - currentMin;
        if (diff > 0 && diff < minDiff) {
          minDiff = diff;
          nextPrayer = pt;
        }
      });

      if (!nextPrayer && prayerTimes.length > 0) {
        // Loop around to tomorrow Subuh
        nextPrayer = prayerTimes[0];
        const [h, m] = nextPrayer.time.split(':').map(Number);
        minDiff = 24 * 60 - currentMin + (h * 60 + m);
      }

      if (nextPrayer) {
        const hoursLeft = Math.floor(minDiff / 60);
        const minsLeft = minDiff % 60;
        setCountdownText(`${nextPrayer.name} dalam ${hoursLeft}j ${minsLeft}m`);
        setNextPrayerName(nextPrayer.name);
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [prayerTimes]);

  const activeLocation =
    CITIES_COORDINATES[selectedCityKey] || CITIES_COORDINATES['Socah (Bangkalan)'];

  return (
    <div className="bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-emerald-950/70 text-slate-900 dark:text-white rounded-2xl p-5 border border-emerald-200 dark:border-emerald-500/30 shadow-lg relative overflow-hidden space-y-4">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-200/50 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl overflow-hidden bg-white dark:bg-slate-800 p-0.5 border border-emerald-200 dark:border-emerald-500/30 shadow-sm flex items-center justify-center">
            <img
              src="https://ik.imagekit.io/sekawanstd/MBS%20SOcah%20%20file/logo%20pondok%20MBS%20socah.png"
              alt="Logo MBS Socah"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-poppins">
                Jadwal Waktu Shalat
              </h3>
              <button
                type="button"
                onClick={() => setShowInfoModal(true)}
                title="Keterangan Pedoman Hisab Majelis Tarjih"
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 text-xs"
              >
                <i className="fa-solid fa-circle-info"></i>
              </button>
            </div>
            <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              {countdownText || 'Pedoman Majelis Tarjih Muhammadiyah'}
            </p>
          </div>
        </div>

        {/* City selector dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCityKey}
            onChange={(e) => setSelectedCityKey(e.target.value)}
            className="bg-white dark:bg-slate-800 text-xs text-emerald-800 dark:text-emerald-300 font-semibold px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
          >
            {Object.keys(CITIES_COORDINATES).map((cKey) => (
              <option key={cKey} value={cKey}>
                {cKey}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Majelis Tarjih Badge / Sub-banner */}
      <div className="px-3 py-1.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-1.5 truncate">
          <i className="fa-solid fa-book-quran text-emerald-600 dark:text-emerald-400 text-xs flex-shrink-0"></i>
          <span className="truncate font-semibold">
            Hisab Majelis Tarjih PP Muhammadiyah (Subuh -18°)
          </span>
        </div>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full">
          Ihtiyath +2m
        </span>
      </div>

      {/* Prayer Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 relative z-10">
        {prayerTimes.map((pt) => {
          const isNext = pt.name === nextPrayerName || pt.isNext;
          return (
            <div
              key={pt.name}
              className={`p-2.5 rounded-xl border transition-all text-center ${
                isNext
                  ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-900 dark:text-white shadow-md shadow-emerald-500/15 scale-105'
                  : 'bg-white/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                <span className="font-semibold">{pt.name}</span>
                <span className="font-serif text-emerald-600 dark:text-emerald-400">{pt.arabicName}</span>
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                {pt.time}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Details */}
      <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-1 relative z-10">
        <span className="flex items-center gap-1 text-[10px]">
          <i className="fa-solid fa-location-dot text-emerald-600 dark:text-emerald-400"></i>
          <span>
            {activeLocation.name} ({activeLocation.latitude}°, {activeLocation.longitude}°)
          </span>
        </span>

        <button
          type="button"
          onClick={() => setShowInfoModal(true)}
          className="text-[10px] text-emerald-700 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
        >
          <i className="fa-solid fa-calculator"></i>
          <span>Pedoman & Detail Hisab</span>
        </button>
      </div>

      {/* Modal Penjelasan Pedoman Hisab Majelis Tarjih */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <i className="fa-solid fa-book-quran"></i>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Pedoman Hisab Waktu Sholat
                  </h4>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Majelis Tarjih & Tajdid PP Muhammadiyah
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30">
                <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                  Keputusan Munas Tarjih ke-31 & Tanfidz PP Muhammadiyah No. 73/KEP/I.0/B/2021:
                </p>
                <p className="mt-1 text-[11px] text-emerald-800 dark:text-emerald-300">
                  Ketinggian matahari awal waktu Subuh ditetapkan pada <strong>-18° (derajat)</strong> di bawah ufuk mar'i (menggantikan kriteria lama -20°).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white block">1. Subuh</span>
                  <span>Sudut matahari: <strong>-18.0°</strong> + Ihtiyath 2m</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white block">2. Terbit / Syuruq</span>
                  <span>Sudut matahari: <strong>-1.0°</strong> (Semi-diameter & Refraksi)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white block">3. Dzuhur</span>
                  <span>Waktu Zawal (Transit) + Ihtiyath 2m</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white block">4. Ashar</span>
                  <span>Bayangan = 1 + tan|φ - δ| + Ihtiyath 2m</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white block">5. Maghrib</span>
                  <span>Sudut matahari: <strong>-1.0°</strong> (Ghurub) + Ihtiyath 2m</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white block">6. Isya</span>
                  <span>Sudut matahari: <strong>-18.0°</strong> (Syafaq Ahmar) + Ihtiyath 2m</span>
                </div>
              </div>

              <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <strong>Koordinat Pusat:</strong> Socah, Bangkalan, Madura (Lintang: {activeLocation.latitude}°, Bujur: {activeLocation.longitude}°, Elevasi: 10 mdpl, WIB / UTC+7).
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
              >
                Tutup Informasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
