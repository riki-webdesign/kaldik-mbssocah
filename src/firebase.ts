import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { AgendaEvent, Announcement, PrayerTime, PushNotification, AttendanceRecord } from './types';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom databaseId if configured
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Firestore Collections Names
const EVENTS_COLLECTION = 'events';
const ANNOUNCEMENTS_COLLECTION = 'announcements';
const PRAYER_TIMES_COLLECTION = 'prayer_times';
const NOTIFICATIONS_COLLECTION = 'notifications';
const ATTENDANCE_COLLECTION = 'attendance';
const SYSTEM_META_COLLECTION = 'system_meta';
const SEED_META_DOC = 'seed_status';

// Local Storage Cache Keys
export const LOCAL_KEYS = {
  EVENTS: 'kaldik_babusalam_events',
  ANNOUNCEMENTS: 'kaldik_babusalam_announcements',
  PRAYER_TIMES: 'kaldik_babusalam_prayer_times',
  NOTIFICATIONS: 'kaldik_babusalam_notifications',
  ATTENDANCE: 'kaldik_babusalam_attendance',
  AUTH_SESSION: 'kaldik_babusalam_auth_session'
};

// Queue for pending writes when offline/quota exhausted
let pendingWrites: Array<() => Promise<void>> = [];
let isRetrying = false;

async function processPendingWrites() {
  if (isRetrying || pendingWrites.length === 0) return;
  isRetrying = true;
  
  const writesToProcess = [...pendingWrites];
  pendingWrites = [];
  
  for (const write of writesToProcess) {
    try {
      await write();
    } catch (err) {
      console.warn('Retry failed, requeuing...', err);
      pendingWrites.push(write);
    }
  }
  isRetrying = false;
}

// Periodically attempt to clear the queue
if (typeof window !== 'undefined') {
  setInterval(processPendingWrites, 30000); // every 30 seconds
  window.addEventListener('online', processPendingWrites);
}

export function handleQuotaError(err: unknown, retryAction?: () => Promise<void>): void {
  console.warn('Firestore fallback invoked or offline mode active. Saving to local queue.', err);
  if (retryAction) {
    pendingWrites.push(retryAction);
  }
}

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

/**
 * Realtime listener for Agenda Events from Firebase Cloud Firestore
 */
export function subscribeEvents(
  onUpdate: (events: AgendaEvent[]) => void,
  onError?: (err: Error) => void
) {
  const q = collection(db, EVENTS_COLLECTION);
  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snapshot) => {
      const items: AgendaEvent[] = [];
      snapshot.forEach((docSnap) => {
        // Exclude purged items
        if (docSnap.id !== 'kaldik-agu-3') {
          items.push({ ...(docSnap.data() as AgendaEvent), id: docSnap.id });
        }
      });
      items.sort((a, b) => (a.startDate > b.startDate ? 1 : -1));
      setLocalCache(LOCAL_KEYS.EVENTS, items);
      onUpdate(items);
      
      // If we receive successful updates, try to process pending writes
      if (!snapshot.metadata.fromCache) {
         processPendingWrites();
      }
    },
    (err) => {
      handleQuotaError(err);
      const cached = getLocalCache<AgendaEvent[]>(LOCAL_KEYS.EVENTS, []);
      if (cached.length > 0) {
        onUpdate(cached);
      }
      if (onError) onError(err);
    }
  );
}

/**
 * Realtime listener for Announcements from Firebase Cloud Firestore
 */
export function subscribeAnnouncements(
  onUpdate: (announcements: Announcement[]) => void,
  onError?: (err: Error) => void
) {
  const q = collection(db, ANNOUNCEMENTS_COLLECTION);
  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snapshot) => {
      const items: Announcement[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as Announcement), id: docSnap.id });
      });
      items.sort((a, b) => (a.date < b.date ? 1 : -1));
      setLocalCache(LOCAL_KEYS.ANNOUNCEMENTS, items);
      onUpdate(items);
    },
    (err) => {
      handleQuotaError(err);
      const cached = getLocalCache<Announcement[]>(LOCAL_KEYS.ANNOUNCEMENTS, []);
      if (cached.length > 0) {
        onUpdate(cached);
      }
      if (onError) onError(err);
    }
  );
}

/**
 * Realtime listener for Prayer Times
 */
export function subscribePrayerTimes(
  onUpdate: (prayerTimes: PrayerTime[]) => void,
  onError?: (err: Error) => void
) {
  const q = collection(db, PRAYER_TIMES_COLLECTION);
  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snapshot) => {
      const items: PrayerTime[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as PrayerTime);
      });
      if (items.length > 0) {
        setLocalCache(LOCAL_KEYS.PRAYER_TIMES, items);
        onUpdate(items);
      }
    },
    (err) => {
      handleQuotaError(err);
      const cached = getLocalCache<PrayerTime[]>(LOCAL_KEYS.PRAYER_TIMES, []);
      if (cached.length > 0) {
        onUpdate(cached);
      }
      if (onError) onError(err);
    }
  );
}

/**
 * Realtime listener for Push Notifications
 */
export function subscribeNotifications(
  onUpdate: (notifs: PushNotification[]) => void,
  onError?: (err: Error) => void
) {
  const q = collection(db, NOTIFICATIONS_COLLECTION);
  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snapshot) => {
      const items: PushNotification[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as PushNotification), id: docSnap.id });
      });
      setLocalCache(LOCAL_KEYS.NOTIFICATIONS, items);
      onUpdate(items);
    },
    (err) => {
      handleQuotaError(err);
      const cached = getLocalCache<PushNotification[]>(LOCAL_KEYS.NOTIFICATIONS, []);
      if (cached.length > 0) {
        onUpdate(cached);
      }
      if (onError) onError(err);
    }
  );
}

/**
 * Realtime listener for Attendance
 */
export function subscribeAttendance(
  onUpdate: (records: AttendanceRecord[]) => void,
  onError?: (err: Error) => void
) {
  const q = collection(db, ATTENDANCE_COLLECTION);
  return onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snapshot) => {
      const items: AttendanceRecord[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as AttendanceRecord), id: docSnap.id });
      });
      setLocalCache(LOCAL_KEYS.ATTENDANCE, items);
      onUpdate(items);
    },
    (err) => {
      handleQuotaError(err);
      const cached = getLocalCache<AttendanceRecord[]>(LOCAL_KEYS.ATTENDANCE, []);
      if (cached.length > 0) {
        onUpdate(cached);
      }
      if (onError) onError(err);
    }
  );
}

// ==========================================
// MASTER ONLINE CRUD OPERATIONS (Firebase Firestore with Safe Fallback)
// ==========================================

export async function addEventToFirestore(event: AgendaEvent): Promise<void> {
  const currentEvents = getLocalCache<AgendaEvent[]>(LOCAL_KEYS.EVENTS, []);
  const nextEvents = [event, ...currentEvents.filter((e) => e.id !== event.id)];
  nextEvents.sort((a, b) => (a.startDate > b.startDate ? 1 : -1));
  setLocalCache(LOCAL_KEYS.EVENTS, nextEvents);

  const performWrite = async () => {
    const docRef = doc(db, EVENTS_COLLECTION, event.id);
    await setDoc(docRef, event);
  };

  try {
    await performWrite();
  } catch (err) {
    handleQuotaError(err, performWrite);
  }
}

export async function batchAddEventsToFirestore(events: AgendaEvent[]): Promise<void> {
  const currentEvents = getLocalCache<AgendaEvent[]>(LOCAL_KEYS.EVENTS, []);
  const map = new Map<string, AgendaEvent>();
  currentEvents.forEach((e) => map.set(e.id, e));
  events.forEach((e) => map.set(e.id, e));
  const merged = Array.from(map.values()).sort((a, b) => (a.startDate > b.startDate ? 1 : -1));
  setLocalCache(LOCAL_KEYS.EVENTS, merged);

  const performWrite = async () => {
    const chunkSize = 200;
    for (let i = 0; i < events.length; i += chunkSize) {
      const chunk = events.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((evt) => {
        const docRef = doc(db, EVENTS_COLLECTION, evt.id);
        batch.set(docRef, evt);
      });
      await batch.commit();
    }
  };

  try {
    await performWrite();
  } catch (err) {
    handleQuotaError(err, performWrite);
  }
}

export async function updateEventInFirestore(
  id: string,
  data: Partial<AgendaEvent>
): Promise<void> {
  const currentEvents = getLocalCache<AgendaEvent[]>(LOCAL_KEYS.EVENTS, []);
  const nextEvents = currentEvents.map((e) => (e.id === id ? { ...e, ...data } : e));
  setLocalCache(LOCAL_KEYS.EVENTS, nextEvents);

  const performWrite = async () => {
    const docRef = doc(db, EVENTS_COLLECTION, id);
    await setDoc(docRef, data, { merge: true });
  };

  try {
    await performWrite();
  } catch (err) {
    handleQuotaError(err, performWrite);
  }
}

export async function deleteEventFromFirestore(id: string): Promise<void> {
  const currentEvents = getLocalCache<AgendaEvent[]>(LOCAL_KEYS.EVENTS, []);
  const nextEvents = currentEvents.filter((e) => e.id !== id);
  setLocalCache(LOCAL_KEYS.EVENTS, nextEvents);

  const performWrite = async () => {
    const docRef = doc(db, EVENTS_COLLECTION, id);
    await deleteDoc(docRef);
  };

  try {
    await performWrite();
  } catch (err) {
    handleQuotaError(err, performWrite);
  }
}

export async function addAnnouncementToFirestore(announcement: Announcement): Promise<void> {
  const current = getLocalCache<Announcement[]>(LOCAL_KEYS.ANNOUNCEMENTS, []);
  const next = [announcement, ...current.filter((a) => a.id !== announcement.id)];
  next.sort((a, b) => (a.date < b.date ? 1 : -1));
  setLocalCache(LOCAL_KEYS.ANNOUNCEMENTS, next);

  const performWrite = async () => {
    const docRef = doc(db, ANNOUNCEMENTS_COLLECTION, announcement.id);
    await setDoc(docRef, announcement);
  };

  try {
    await performWrite();
  } catch (err) {
    handleQuotaError(err, performWrite);
  }
}

export async function updateAnnouncementInFirestore(
  id: string,
  data: Partial<Announcement>
): Promise<void> {
  const current = getLocalCache<Announcement[]>(LOCAL_KEYS.ANNOUNCEMENTS, []);
  const next = current.map((a) => (a.id === id ? { ...a, ...data } : a));
  setLocalCache(LOCAL_KEYS.ANNOUNCEMENTS, next);

  const performWrite = async () => {
    const docRef = doc(db, ANNOUNCEMENTS_COLLECTION, id);
    await setDoc(docRef, data, { merge: true });
  };

  try {
    await performWrite();
  } catch (err) {
    handleQuotaError(err, performWrite);
  }
}

export async function deleteAnnouncementFromFirestore(id: string): Promise<void> {
  const current = getLocalCache<Announcement[]>(LOCAL_KEYS.ANNOUNCEMENTS, []);
  const next = current.filter((a) => a.id !== id);
  setLocalCache(LOCAL_KEYS.ANNOUNCEMENTS, next);

  const performWrite = async () => {
    const docRef = doc(db, ANNOUNCEMENTS_COLLECTION, id);
    await deleteDoc(docRef);
  };

  try {
    await performWrite();
  } catch (err) {
    handleQuotaError(err, performWrite);
  }
}

export async function savePrayerTimesToFirestore(prayerTimes: PrayerTime[]): Promise<void> {
  setLocalCache(LOCAL_KEYS.PRAYER_TIMES, prayerTimes);

  const performWrite = async () => {
    const batch = writeBatch(db);
    prayerTimes.forEach((pt, index) => {
      const docRef = doc(db, PRAYER_TIMES_COLLECTION, `prayer-${index}`);
      batch.set(docRef, pt);
    });
    await batch.commit();
  };

  try {
    await performWrite();
  } catch (err) {
    handleQuotaError(err, performWrite);
  }
}

export async function addNotificationToFirestore(notif: PushNotification): Promise<void> {
  const current = getLocalCache<PushNotification[]>(LOCAL_KEYS.NOTIFICATIONS, []);
  const next = [notif, ...current.filter((n) => n.id !== notif.id)];
  setLocalCache(LOCAL_KEYS.NOTIFICATIONS, next);

  const performWrite = async () => {
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, notif.id);
    await setDoc(docRef, notif);
  };

  try {
    await performWrite();
  } catch (err) {
    handleQuotaError(err, performWrite);
  }
}

export async function markAllNotificationsReadInFirestore(
  notifications: PushNotification[]
): Promise<void> {
  const next = notifications.map((n) => ({ ...n, read: true }));
  setLocalCache(LOCAL_KEYS.NOTIFICATIONS, next);

  const performWrite = async () => {
    const batch = writeBatch(db);
    notifications.forEach((n) => {
      if (!n.read) {
        const docRef = doc(db, NOTIFICATIONS_COLLECTION, n.id);
        batch.update(docRef, { read: true });
      }
    });
    await batch.commit();
  };

  try {
    await performWrite();
  } catch (err) {
    handleQuotaError(err, performWrite);
  }
}

export async function addAttendanceRecordToFirestore(
  record: AttendanceRecord
): Promise<void> {
  const current = getLocalCache<AttendanceRecord[]>(LOCAL_KEYS.ATTENDANCE, []);
  const next = [record, ...current.filter((r) => r.id !== record.id)];
  setLocalCache(LOCAL_KEYS.ATTENDANCE, next);

  const performWrite = async () => {
    const docRef = doc(db, ATTENDANCE_COLLECTION, record.id);
    await setDoc(docRef, record);
  };

  try {
    await performWrite();
  } catch (err) {
    handleQuotaError(err, performWrite);
  }
}

/**
 * Seed initial mock data into Firestore ONCE when first initialized.
 * Checks server metadata document in Firestore first.
 */
export async function seedInitialFirestoreData(
  initialEvents: AgendaEvent[],
  initialAnnouncements: Announcement[],
  initialPrayerTimes: PrayerTime[],
  initialNotifications: PushNotification[]
): Promise<void> {
  try {
    const seedDocRef = doc(db, SYSTEM_META_COLLECTION, SEED_META_DOC);
    const seedDocSnap = await getDoc(seedDocRef);

    if (seedDocSnap.exists() && seedDocSnap.data()?.isSeeded) {
      return;
    }

    const eventsSnapshot = await getDocs(collection(db, EVENTS_COLLECTION));
    if (!eventsSnapshot.empty) {
      await setDoc(seedDocRef, {
        isSeeded: true,
        seededAt: new Date().toISOString(),
        version: '1.0.0'
      });
      return;
    }

    const batch = writeBatch(db);

    initialEvents.forEach((evt) => {
      if (evt.id !== 'kaldik-agu-3') {
        const docRef = doc(db, EVENTS_COLLECTION, evt.id);
        batch.set(docRef, evt);
      }
    });

    initialAnnouncements.forEach((anc) => {
      const docRef = doc(db, ANNOUNCEMENTS_COLLECTION, anc.id);
      batch.set(docRef, anc);
    });

    initialPrayerTimes.forEach((pt, idx) => {
      const docRef = doc(db, PRAYER_TIMES_COLLECTION, `prayer-${idx}`);
      batch.set(docRef, pt);
    });

    initialNotifications.forEach((n) => {
      const docRef = doc(db, NOTIFICATIONS_COLLECTION, n.id);
      batch.set(docRef, n);
    });

    batch.set(seedDocRef, {
      isSeeded: true,
      seededAt: new Date().toISOString(),
      version: '1.0.0'
    });

    await batch.commit();
  } catch (err) {
    handleQuotaError(err);
  }
}
