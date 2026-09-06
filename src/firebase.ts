import { AgendaEvent, Announcement, PrayerTime, PushNotification, AttendanceRecord } from './types';

// =============================================================================
// KONFIGURASI NATIVE REST API (NIAGAHOSTER MYSQL & PHP BACKEND)
// =============================================================================

// Base URL API: Menggunakan path relatif '/api' saat di hosting Niagahoster
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && (window as any).VITE_API_URL) {
    return (window as any).VITE_API_URL;
  }
  return '/api';
};

// Dummy db object untuk kompatibilitas jika ada komponen yang merujuk db
export const db = {};

// Local Storage Cache Keys
export const LOCAL_KEYS = {
  EVENTS: 'kaldik_babusalam_events',
  ANNOUNCEMENTS: 'kaldik_babusalam_announcements',
  PRAYER_TIMES: 'kaldik_babusalam_prayer_times',
  NOTIFICATIONS: 'kaldik_babusalam_notifications',
  ATTENDANCE: 'kaldik_babusalam_attendance',
  AUTH_SESSION: 'kaldik_babusalam_auth_session'
};

// Local Storage Helper Functions
export function getLocalCache<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setLocalCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }
}

export function handleQuotaError(err: unknown): void {
  console.warn('Network or API fallback active.', err);
}

// Helper HTTP Fetch dengan penanganan timeout & JSON parsing
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/${endpoint}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 detik timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options?.headers || {})
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    if (text.trim().startsWith('<')) {
      console.warn('API returned non-JSON/HTML: ' + endpoint);
      return null;
    }
    const json = JSON.parse(text);

    if (json.status === 'success' && json.data !== undefined) {
      return json.data as T;
    }
    return json as T;
  } catch (err: any) {
    console.error(`API Request Failed (${endpoint}):`, err.message);
    return null;
  }
}

// =============================================================================
// REAL-TIME SUBSCRIBERS (POLLING SINKRONISASI UNTUK NIAGAHOSTER)
// =============================================================================

/**
 * Listener Real-time untuk Agenda (Polling + Event Broadcast dari MySQL Niagahoster)
 */
export function subscribeEvents(
  onUpdate: (events: AgendaEvent[]) => void,
  onError?: (err: Error) => void
) {
  // 1. Tampilkan data dari Cache Lokal secara instan
  const initialCache = getLocalCache<AgendaEvent[]>(LOCAL_KEYS.EVENTS, []);
  if (initialCache.length > 0) {
    onUpdate(initialCache);
  }

  const fetchRemote = async () => {
    const remoteData = await fetchApi<AgendaEvent[]>('events.php');
    if (remoteData && Array.isArray(remoteData)) {
      setLocalCache(LOCAL_KEYS.EVENTS, remoteData);
      onUpdate(remoteData);
    }
  };

  // Fetch pertama kali
  fetchRemote();

  // Event listener untuk update langsung saat pengguna melakukan aksi
  const handleDataChange = () => {
    fetchRemote();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('agenda_data_changed', handleDataChange);
  }

  // Polling tiap 8 detik agar pengunjung melihat update terbaru dari admin
  const interval = setInterval(fetchRemote, 8000);

  return () => {
    clearInterval(interval);
    if (typeof window !== 'undefined') {
      window.removeEventListener('agenda_data_changed', handleDataChange);
    }
  };
}

/**
 * Listener Real-time untuk Pengumuman
 */
export function subscribeAnnouncements(
  onUpdate: (announcements: Announcement[]) => void,
  onError?: (err: Error) => void
) {
  const initialCache = getLocalCache<Announcement[]>(LOCAL_KEYS.ANNOUNCEMENTS, []);
  if (initialCache.length > 0) {
    onUpdate(initialCache);
  }

  const fetchRemote = async () => {
    const remoteData = await fetchApi<Announcement[]>('announcements.php');
    if (remoteData && Array.isArray(remoteData)) {
      setLocalCache(LOCAL_KEYS.ANNOUNCEMENTS, remoteData);
      onUpdate(remoteData);
    }
  };

  fetchRemote();
  const interval = setInterval(fetchRemote, 10000);
  return () => clearInterval(interval);
}

/**
 * Listener Real-time untuk Jadwal Shalat
 */
export function subscribePrayerTimes(
  onUpdate: (prayerTimes: PrayerTime[]) => void,
  onError?: (err: Error) => void
) {
  const initialCache = getLocalCache<PrayerTime[]>(LOCAL_KEYS.PRAYER_TIMES, []);
  if (initialCache.length > 0) {
    onUpdate(initialCache);
  }

  const fetchRemote = async () => {
    const remoteData = await fetchApi<PrayerTime[]>('prayer_times.php');
    if (remoteData && Array.isArray(remoteData) && remoteData.length > 0) {
      setLocalCache(LOCAL_KEYS.PRAYER_TIMES, remoteData);
      onUpdate(remoteData);
    }
  };

  fetchRemote();
  const interval = setInterval(fetchRemote, 30000);
  return () => clearInterval(interval);
}

/**
 * Listener Real-time untuk Push Notifications
 */
export function subscribeNotifications(
  onUpdate: (notifs: PushNotification[]) => void,
  onError?: (err: Error) => void
) {
  const initialCache = getLocalCache<PushNotification[]>(LOCAL_KEYS.NOTIFICATIONS, []);
  if (initialCache.length > 0) {
    onUpdate(initialCache);
  }

  const fetchRemote = async () => {
    const remoteData = await fetchApi<PushNotification[]>('notifications.php');
    if (remoteData && Array.isArray(remoteData)) {
      setLocalCache(LOCAL_KEYS.NOTIFICATIONS, remoteData);
      onUpdate(remoteData);
    }
  };

  fetchRemote();
  const interval = setInterval(fetchRemote, 10000);
  return () => clearInterval(interval);
}

/**
 * Listener Real-time untuk Absensi
 */
export function subscribeAttendance(
  onUpdate: (records: AttendanceRecord[]) => void,
  onError?: (err: Error) => void
) {
  const initialCache = getLocalCache<AttendanceRecord[]>(LOCAL_KEYS.ATTENDANCE, []);
  if (initialCache.length > 0) {
    onUpdate(initialCache);
  }

  const fetchRemote = async () => {
    const remoteData = await fetchApi<AttendanceRecord[]>('attendance.php');
    if (remoteData && Array.isArray(remoteData)) {
      setLocalCache(LOCAL_KEYS.ATTENDANCE, remoteData);
      onUpdate(remoteData);
    }
  };

  fetchRemote();
  const interval = setInterval(fetchRemote, 15000);
  return () => clearInterval(interval);
}

// =============================================================================
// REST CRUD OPERATIONS (KONEKSI KEDATABASE MYSQL NIAGAHOSTER)
// =============================================================================

export async function addEventToFirestore(event: AgendaEvent): Promise<void> {
  const res = await fetchApi<any>('events.php', {
    method: 'POST',
    body: JSON.stringify(event)
  });
  if (res === null) {
    if (typeof window !== 'undefined' && window.location.hostname.includes('run.app')) {
      // Fallback for AI Studio Preview
    } else {
      throw new Error('Gagal menghubungi server database API (Response kosong/HTML).');
    }
  } else if (res.status === 'error') {
    throw new Error(res.message || 'Gagal menyimpan agenda');
  }

  const currentEvents = getLocalCache<AgendaEvent[]>(LOCAL_KEYS.EVENTS, []);
  const nextEvents = [event, ...currentEvents.filter((e) => e.id !== event.id)];
  nextEvents.sort((a, b) => (a.startDate > b.startDate ? 1 : -1));
  setLocalCache(LOCAL_KEYS.EVENTS, nextEvents);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('agenda_data_changed'));
  }
}

export async function batchAddEventsToFirestore(events: AgendaEvent[]): Promise<void> {
  for (const evt of events) {
    const res = await fetchApi<any>('events.php', {
      method: 'POST',
      body: JSON.stringify(evt)
    });
    if (res === null) {
    if (typeof window !== 'undefined' && window.location.hostname.includes('run.app')) {
      // Fallback for AI Studio Preview
    } else {
      throw new Error('Gagal menghubungi server database API (Response kosong/HTML).');
    }
  } else if (res.status === 'error') {
    throw new Error(res.message || 'Gagal menyimpan batch agenda');
  }
  }

  const currentEvents = getLocalCache<AgendaEvent[]>(LOCAL_KEYS.EVENTS, []);
  const map = new Map<string, AgendaEvent>();
  currentEvents.forEach((e) => map.set(e.id, e));
  events.forEach((e) => map.set(e.id, e));
  const merged = Array.from(map.values()).sort((a, b) => (a.startDate > b.startDate ? 1 : -1));
  setLocalCache(LOCAL_KEYS.EVENTS, merged);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('agenda_data_changed'));
  }
}

export async function updateEventInFirestore(
  id: string,
  data: Partial<AgendaEvent>
): Promise<void> {
  const res = await fetchApi<any>('events.php', {
    method: 'PUT',
    body: JSON.stringify({ id, ...data })
  });
  if (res && res.status === 'error') throw new Error(res.message || 'Gagal mengubah agenda');

  const currentEvents = getLocalCache<AgendaEvent[]>(LOCAL_KEYS.EVENTS, []);
  const nextEvents = currentEvents.map((e) => (e.id === id ? { ...e, ...data } : e));
  setLocalCache(LOCAL_KEYS.EVENTS, nextEvents);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('agenda_data_changed'));
  }
}

export async function deleteEventFromFirestore(id: string): Promise<void> {
  const res = await fetchApi<any>(`events.php?id=${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (res && res.status === 'error') throw new Error(res.message || 'Gagal menghapus agenda');

  const currentEvents = getLocalCache<AgendaEvent[]>(LOCAL_KEYS.EVENTS, []);
  const nextEvents = currentEvents.filter((e) => e.id !== id);
  setLocalCache(LOCAL_KEYS.EVENTS, nextEvents);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('agenda_data_changed'));
  }
}

export async function addAnnouncementToFirestore(announcement: Announcement): Promise<void> {
  const current = getLocalCache<Announcement[]>(LOCAL_KEYS.ANNOUNCEMENTS, []);
  const next = [announcement, ...current.filter((a) => a.id !== announcement.id)];
  next.sort((a, b) => (a.date < b.date ? 1 : -1));
  setLocalCache(LOCAL_KEYS.ANNOUNCEMENTS, next);

  await fetchApi('announcements.php', {
    method: 'POST',
    body: JSON.stringify(announcement)
  });
}

export async function updateAnnouncementInFirestore(
  id: string,
  data: Partial<Announcement>
): Promise<void> {
  const current = getLocalCache<Announcement[]>(LOCAL_KEYS.ANNOUNCEMENTS, []);
  const next = current.map((a) => (a.id === id ? { ...a, ...data } : a));
  setLocalCache(LOCAL_KEYS.ANNOUNCEMENTS, next);

  await fetchApi('announcements.php', {
    method: 'POST',
    body: JSON.stringify({ id, ...data })
  });
}

export async function deleteAnnouncementFromFirestore(id: string): Promise<void> {
  const current = getLocalCache<Announcement[]>(LOCAL_KEYS.ANNOUNCEMENTS, []);
  const next = current.filter((a) => a.id !== id);
  setLocalCache(LOCAL_KEYS.ANNOUNCEMENTS, next);

  await fetchApi(`announcements.php?id=${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export async function savePrayerTimesToFirestore(prayerTimes: PrayerTime[]): Promise<void> {
  setLocalCache(LOCAL_KEYS.PRAYER_TIMES, prayerTimes);

  await fetchApi('prayer_times.php', {
    method: 'POST',
    body: JSON.stringify(prayerTimes)
  });
}

export async function addNotificationToFirestore(notif: PushNotification): Promise<void> {
  const current = getLocalCache<PushNotification[]>(LOCAL_KEYS.NOTIFICATIONS, []);
  const next = [notif, ...current.filter((n) => n.id !== notif.id)];
  setLocalCache(LOCAL_KEYS.NOTIFICATIONS, next);

  await fetchApi('notifications.php', {
    method: 'POST',
    body: JSON.stringify(notif)
  });
}

export async function markAllNotificationsReadInFirestore(
  notifications: PushNotification[]
): Promise<void> {
  const next = notifications.map((n) => ({ ...n, read: true }));
  setLocalCache(LOCAL_KEYS.NOTIFICATIONS, next);

  await fetchApi('notifications.php', {
    method: 'PUT'
  });
}

export async function addAttendanceRecordToFirestore(
  record: AttendanceRecord
): Promise<void> {
  const current = getLocalCache<AttendanceRecord[]>(LOCAL_KEYS.ATTENDANCE, []);
  const next = [record, ...current.filter((r) => r.id !== record.id)];
  setLocalCache(LOCAL_KEYS.ATTENDANCE, next);

  await fetchApi('attendance.php', {
    method: 'POST',
    body: JSON.stringify(record)
  });
}

export async function seedInitialFirestoreData(
  initialEvents: AgendaEvent[],
  initialAnnouncements: Announcement[],
  initialPrayerTimes: PrayerTime[],
  initialNotifications: PushNotification[]
): Promise<void> {
  // Data dikirim secara lokal atau melalui import database.sql di phpMyAdmin
  const events = getLocalCache<AgendaEvent[]>(LOCAL_KEYS.EVENTS, []);
  if (events.length === 0) {
    setLocalCache(LOCAL_KEYS.EVENTS, initialEvents);
  }
  const anncs = getLocalCache<Announcement[]>(LOCAL_KEYS.ANNOUNCEMENTS, []);
  if (anncs.length === 0) {
    setLocalCache(LOCAL_KEYS.ANNOUNCEMENTS, initialAnnouncements);
  }
  const prayers = getLocalCache<PrayerTime[]>(LOCAL_KEYS.PRAYER_TIMES, []);
  if (prayers.length === 0) {
    setLocalCache(LOCAL_KEYS.PRAYER_TIMES, initialPrayerTimes);
  }
  const notifs = getLocalCache<PushNotification[]>(LOCAL_KEYS.NOTIFICATIONS, []);
  if (notifs.length === 0) {
    setLocalCache(LOCAL_KEYS.NOTIFICATIONS, initialNotifications);
  }
}
