import React, { useEffect, useState } from 'react';
import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_EVENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PRAYER_TIMES,
  getRelativeDate
} from './data/mockData';
import {
  AgendaEvent,
  Announcement,
  AttendanceRecord,
  PrayerTime,
  PushNotification,
  UserRole
} from './types';
import {
  subscribeEvents,
  subscribeAnnouncements,
  subscribePrayerTimes,
  subscribeNotifications,
  subscribeAttendance,
  addEventToFirestore,
  batchAddEventsToFirestore,
  updateEventInFirestore,
  deleteEventFromFirestore,
  addAnnouncementToFirestore,
  updateAnnouncementInFirestore,
  deleteAnnouncementFromFirestore,
  savePrayerTimesToFirestore,
  addNotificationToFirestore,
  markAllNotificationsReadInFirestore,
  seedInitialFirestoreData,
  getLocalCache,
  setLocalCache,
  LOCAL_KEYS
} from './firebase';

// Components
import { AddEventModal } from './components/AddEventModal';
import { EditEventModal } from './components/EditEventModal';
import { AnnouncementCard } from './components/AnnouncementCard';
import { CalendarView } from './components/CalendarView';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardSidebar } from './components/DashboardSidebar';
import { EventDetailModal } from './components/EventDetailModal';
import { Homepage } from './components/Homepage';
import { LeavePermissionModal } from './components/LeavePermissionModal';
import { LoginModal } from './components/LoginModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Navbar } from './components/Navbar';
import { NotificationDrawer } from './components/NotificationDrawer';
import { PrayerTimesCard } from './components/PrayerTimesCard';
import { RealtimeManagement } from './components/RealtimeManagement';
import { TodayAgendaCard } from './components/TodayAgendaCard';
import { SettingsView } from './components/SettingsView';

export default function App() {
  // Authentication & Persistent Session State
  const [authSession, setAuthSession] = useState<{ isLoggedIn: boolean; role: UserRole; email: string } | null>(() =>
    getLocalCache<{ isLoggedIn: boolean; role: UserRole; email: string } | null>(LOCAL_KEYS.AUTH_SESSION, null)
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => Boolean(authSession?.isLoggedIn));
  const [userRole, setUserRole] = useState<UserRole>(() => (authSession?.isLoggedIn ? authSession.role : 'santri'));

  // Navigation & View State
  const [currentView, setCurrentView] = useState<'home' | 'dashboard'>('home');
  const [activeTab, setActiveTab] = useState<'beranda' | 'kalender' | 'agenda' | 'pengumuman' | 'realtime' | 'pengaturan'>('beranda');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // Dark mode (Automatic system preference default + manual toggle)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Core Reactive Data States with Local Cache Initializer
  const [events, setEvents] = useState<AgendaEvent[]>(() =>
    getLocalCache<AgendaEvent[]>(LOCAL_KEYS.EVENTS, [])
  );
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>(() =>
    getLocalCache<PrayerTime[]>(LOCAL_KEYS.PRAYER_TIMES, INITIAL_PRAYER_TIMES)
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    getLocalCache<Announcement[]>(LOCAL_KEYS.ANNOUNCEMENTS, [])
  );
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() =>
    getLocalCache<AttendanceRecord[]>(LOCAL_KEYS.ATTENDANCE, INITIAL_ATTENDANCE)
  );
  const [notifications, setNotifications] = useState<PushNotification[]>(() =>
    getLocalCache<PushNotification[]>(LOCAL_KEYS.NOTIFICATIONS, [])
  );

  // Seed and Setup Realtime Firestore Listeners
  useEffect(() => {
    // Seed initial data if Firestore collections are empty
    seedInitialFirestoreData(
      INITIAL_EVENTS,
      INITIAL_ANNOUNCEMENTS,
      INITIAL_PRAYER_TIMES,
      INITIAL_NOTIFICATIONS
    );

    // Subscribe to Events
    const unsubEvents = subscribeEvents(
      (firestoreEvents) => {
        setEvents(firestoreEvents);
        setIsFirebaseConnected(true);
      },
      () => setIsFirebaseConnected(false)
    );

    // Subscribe to Announcements
    const unsubAnnouncements = subscribeAnnouncements(
      (firestoreAncs) => {
        setAnnouncements(firestoreAncs);
      },
      () => setIsFirebaseConnected(false)
    );

    // Subscribe to Prayer Times
    const unsubPrayerTimes = subscribePrayerTimes(
      (firestorePT) => {
        if (firestorePT.length > 0) {
          setPrayerTimes(firestorePT);
        }
      }
    );

    // Subscribe to Notifications
    const unsubNotifs = subscribeNotifications(
      (firestoreNotifs) => {
        setNotifications(firestoreNotifs);
      }
    );

    // Subscribe to Attendance
    const unsubAttendance = subscribeAttendance(
      (firestoreAttendance) => {
        setAttendance(firestoreAttendance);
      }
    );

    return () => {
      unsubEvents();
      unsubAnnouncements();
      unsubPrayerTimes();
      unsubNotifs();
      unsubAttendance();
    };
  }, []);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedEditEvent, setSelectedEditEvent] = useState<AgendaEvent | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [selectedDetailEvent, setSelectedDetailEvent] = useState<AgendaEvent | null>(null);

  // Filter Today's Events (including multi-day events that span today)
  const todayStr = getRelativeDate(0);
  const todayEvents = events.filter((e) => {
    const endStr = e.endDate || e.startDate;
    return todayStr >= e.startDate && todayStr <= endStr;
  });

  // Real-time Agenda Event Handlers with Firebase & Local Storage Fallback
  const handleAddEvent = async (newEvt: AgendaEvent) => {
    if (!isLoggedIn || (userRole !== 'admin_utama' && userRole !== 'ustadz')) {
      alert('Akses Ditolak: Hanya Admin yang dapat menambah agenda.');
      return;
    }

    // Save to Firestore
    try {
      await addEventToFirestore(newEvt);
      
      setEvents((prev) => {
        const next = [newEvt, ...prev];
        setLocalCache(LOCAL_KEYS.EVENTS, next);
        return next;
      });

      // Push automated notification
      const newNotif: PushNotification = {
        id: `notif-${Date.now()}`,
        title: 'Agenda Baru Ditambahkan',
        message: `"${newEvt.title}" dijadwalkan pada ${newEvt.startDate} pukul ${newEvt.startTime}`,
        timestamp: 'Baru saja',
        read: false,
        category: newEvt.category
      };
      setNotifications((prev) => {
        const next = [newNotif, ...prev];
        setLocalCache(LOCAL_KEYS.NOTIFICATIONS, next);
        return next;
      });

      try {
        await addNotificationToFirestore(newNotif);
      } catch (err) {
        console.error('Error adding notif to Firestore:', err);
      }
    } catch (err: any) {
      console.error('Error adding event to Firestore:', err);
      alert('Gagal menyimpan agenda ke database MySQL.\nPastikan pengaturan database di file config.php Anda sudah benar.\n\nDetail: ' + err.message);
    }
  };

  const handleUpdateEvent = async (updatedEvt: AgendaEvent) => {
    if (!isLoggedIn || (userRole !== 'admin_utama' && userRole !== 'ustadz')) {
      alert('Akses Ditolak: Hanya Admin yang dapat mengubah agenda.');
      return;
    }

    setEvents((prev) => {
      const next = prev.map((e) => (e.id === updatedEvt.id ? updatedEvt : e));
      setLocalCache(LOCAL_KEYS.EVENTS, next);
      return next;
    });

    // Update in Firestore
    try {
      await updateEventInFirestore(updatedEvt.id, updatedEvt);
    } catch (err) {
      console.error('Error updating event in Firestore:', err);
    }

    // Update selectedDetailEvent if it's currently open
    if (selectedDetailEvent && selectedDetailEvent.id === updatedEvt.id) {
      setSelectedDetailEvent(updatedEvt);
    }

    // Push notification for updated event
    const newNotif: PushNotification = {
      id: `notif-${Date.now()}`,
      title: 'Agenda Diperbarui',
      message: `Perubahan jadwal pada agenda "${updatedEvt.title}" berhasil disimpan.`,
      timestamp: 'Baru saja',
      read: false,
      category: updatedEvt.category
    };
    setNotifications((prev) => {
      const next = [newNotif, ...prev];
      setLocalCache(LOCAL_KEYS.NOTIFICATIONS, next);
      return next;
    });

    try {
      await addNotificationToFirestore(newNotif);
    } catch (err) {
      console.error('Error adding notif to Firestore:', err);
    }
  };

  const handleOpenEditEvent = (event: AgendaEvent) => {
    if (!isLoggedIn || (userRole !== 'admin_utama' && userRole !== 'ustadz')) {
      setIsLoginModalOpen(true);
      return;
    }
    setSelectedEditEvent(event);
    setIsEditModalOpen(true);
    setSelectedDetailEvent(null);
  };

  const handleUpdateAnnouncement = async (updatedAnc: Announcement) => {
    setAnnouncements((prev) => {
      const next = prev.map((a) => (a.id === updatedAnc.id ? updatedAnc : a));
      setLocalCache(LOCAL_KEYS.ANNOUNCEMENTS, next);
      return next;
    });

    try {
      await updateAnnouncementInFirestore(updatedAnc.id, updatedAnc);
    } catch (err) {
      console.error('Error updating announcement in Firestore:', err);
    }

    const newNotif: PushNotification = {
      id: `notif-anc-${Date.now()}`,
      title: 'Pengumuman Diperbarui',
      message: `Informasi "${updatedAnc.title}" berhasil diperbarui.`,
      timestamp: 'Baru saja',
      read: false,
      category: 'system'
    };
    setNotifications((prev) => {
      const next = [newNotif, ...prev];
      setLocalCache(LOCAL_KEYS.NOTIFICATIONS, next);
      return next;
    });

    try {
      await addNotificationToFirestore(newNotif);
    } catch (err) {
      console.error('Error adding notif to Firestore:', err);
    }
  };

  const handleBatchAddEvents = async (newEvts: AgendaEvent[]) => {
    try {
      await batchAddEventsToFirestore(newEvts);
      
      setEvents((prev) => {
        const next = [...newEvts, ...prev];
        setLocalCache(LOCAL_KEYS.EVENTS, next);
        return next;
      });

      const newNotif: PushNotification = {
        id: `notif-${Date.now()}`,
        title: 'Import Kalender Massal Berhasil',
        message: `Admin Utama mengimpor ${newEvts.length} agenda ke dalam Kalender Akademik.`,
        timestamp: 'Baru saja',
        read: false,
        category: 'system'
      };
      setNotifications((prev) => {
        const next = [newNotif, ...prev];
        setLocalCache(LOCAL_KEYS.NOTIFICATIONS, next);
        return next;
      });

      try {
        await addNotificationToFirestore(newNotif);
      } catch (err) {
        console.error('Error adding notif to server:', err);
      }
    } catch (err: any) {
      console.error('Error batch adding to server:', err);
      alert('Gagal mengimpor jadwal masal ke server.\n\nDetail: ' + err.message);
    }
  };

  const handleAddAnnouncement = async (newAnc: Announcement) => {
    setAnnouncements((prev) => {
      const next = [newAnc, ...prev];
      setLocalCache(LOCAL_KEYS.ANNOUNCEMENTS, next);
      return next;
    });

    try {
      await addAnnouncementToFirestore(newAnc);
    } catch (err) {
      console.error('Error adding announcement to Firestore:', err);
    }

    const newNotif: PushNotification = {
      id: `notif-anc-${Date.now()}`,
      title: 'Pengumuman Baru Diterbitkan',
      message: `"${newAnc.title}" dipublikasikan oleh ${newAnc.author}`,
      timestamp: 'Baru saja',
      read: false,
      category: 'system'
    };
    setNotifications((prev) => {
      const next = [newNotif, ...prev];
      setLocalCache(LOCAL_KEYS.NOTIFICATIONS, next);
      return next;
    });

    try {
      await addNotificationToFirestore(newNotif);
    } catch (err) {
      console.error('Error adding notif to Firestore:', err);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setAnnouncements((prev) => {
      const next = prev.filter((a) => a.id !== id);
      setLocalCache(LOCAL_KEYS.ANNOUNCEMENTS, next);
      return next;
    });
    try {
      await deleteAnnouncementFromFirestore(id);
    } catch (err) {
      console.error('Error deleting announcement from Firestore:', err);
    }
  };

  const handleToggleDone = async (eventId: string) => {
    if (!isLoggedIn || (userRole !== 'admin_utama' && userRole !== 'ustadz')) {
      alert('Akses Ditolak: Hanya Admin yang dapat memperbarui status agenda.');
      return;
    }
    const target = events.find((e) => e.id === eventId);
    if (!target) return;
    const newDoneState = !target.isDone;

    try {
      await updateEventInFirestore(eventId, { isDone: newDoneState });
      
      setEvents((prev) => {
        const next = prev.map((e) => (e.id === eventId ? { ...e, isDone: newDoneState } : e));
        setLocalCache(LOCAL_KEYS.EVENTS, next);
        return next;
      });
    } catch (err: any) {
      console.error('Error updating done status:', err);
      alert('Gagal mengubah status agenda.\n\nDetail: ' + err.message);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!isLoggedIn || (userRole !== 'admin_utama' && userRole !== 'ustadz')) {
      alert('Akses Ditolak: Hanya Admin yang dapat menghapus agenda.');
      return;
    }
    
    try {
      await deleteEventFromFirestore(eventId);
      
      setEvents((prev) => {
        const next = prev.filter((e) => e.id !== eventId);
        setLocalCache(LOCAL_KEYS.EVENTS, next);
        return next;
      });
    } catch (err: any) {
      console.error('Error deleting event from server:', err);
      alert('Gagal menghapus agenda dari server.\n\nDetail: ' + err.message);
    }
  };

  const handleUpdatePrayerTimes = async (newTimes: PrayerTime[]) => {
    setPrayerTimes(newTimes);
    setLocalCache(LOCAL_KEYS.PRAYER_TIMES, newTimes);
    try {
      await savePrayerTimesToFirestore(newTimes);
    } catch (err) {
      console.error('Error saving prayer times to Firestore:', err);
    }
  };

  const handleMarkAllNotifsRead = async () => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      setLocalCache(LOCAL_KEYS.NOTIFICATIONS, next);
      return next;
    });
    try {
      await markAllNotificationsReadInFirestore(notifications);
    } catch (err) {
      console.error('Error marking notifs as read:', err);
    }
  };

  const handleLoginSuccess = (role: UserRole) => {
    setIsLoggedIn(true);
    setUserRole(role);
    const session = { isLoggedIn: true, role, email: 'cvsekawancoc@gmail.com' };
    setAuthSession(session);
    setLocalCache(LOCAL_KEYS.AUTH_SESSION, session);
    setCurrentView('dashboard');
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('santri');
    setAuthSession(null);
    try {
      localStorage.removeItem(LOCAL_KEYS.AUTH_SESSION);
    } catch (e) {
      console.error('Error removing auth session:', e);
    }
    setCurrentView('home');
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-poppins">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        userRole={userRole}
        setUserRole={setUserRole}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenLeaveModal={() => setIsLeaveModalOpen(true)}
      />

      {/* Main Page Router */}
      {currentView === 'home' ? (
        <Homepage
          onEnterDashboard={() => setCurrentView('dashboard')}
          prayerTimes={prayerTimes}
          todayEvents={todayEvents}
          allEvents={events}
          isLoggedIn={isLoggedIn}
          userRole={userRole}
          onLogout={handleLogout}
          onOpenLeaveModal={() => setIsLeaveModalOpen(true)}
          onSelectEvent={(evt) => setSelectedDetailEvent(evt)}
          onEditEvent={handleOpenEditEvent}
          onDeleteEvent={handleDeleteEvent}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      ) : (
        /* Dashboard Layout (Inspired by Image 2 reference style) */
        <div className="flex min-h-[calc(100vh-4rem)]">
          {/* Left Sidebar (260px wide) */}
          <DashboardSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userRole={userRole}
            setUserRole={setUserRole}
            onNavigateHome={() => setCurrentView('home')}
            onLogout={handleLogout}
            isOpenMobile={isMobileSidebarOpen}
            setIsOpenMobile={setIsMobileSidebarOpen}
            unreadNotifCount={unreadNotifCount}
            onOpenLeaveModal={() => setIsLeaveModalOpen(true)}
          />

          {/* Main Dashboard Workspace Content */}
          <main className="flex-1 lg:pl-[260px] flex flex-col min-w-0 transition-all duration-300">
            {/* Top Header */}
            <DashboardHeader
              activeTab={activeTab}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onOpenNotifDrawer={() => setIsNotifDrawerOpen(true)}
              onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
              unreadNotifCount={unreadNotifCount}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              userRole={userRole}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            {/* Cloud Sync Status Banner */}
            <div className="px-4 sm:px-6 lg:px-8 pt-4 max-w-7xl w-full mx-auto">
              <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900 text-white border border-emerald-500/40 shadow-sm text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="font-semibold text-emerald-300">Firebase Firestore Real-time Cloud Active</span>
                  <span className="hidden sm:inline text-slate-400">|</span>
                  <span className="hidden sm:inline text-slate-300 text-[11px]">
                    Perubahan data dari Admin disinkronkan langsung ke seluruh perangkat santri & ustadz
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  <i className="fa-solid fa-cloud-bolt"></i>
                  <span>Live Sync</span>
                </div>
              </div>
            </div>

            {/* Dashboard Content Container */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
              
              {/* TAB 1: BERANDA (2-Column Grid: 65% FullCalendar, 35% Right Sidebar Widgets) */}
              {activeTab === 'beranda' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column (65% width ~ 8 cols) */}
                  <div className="lg:col-span-8 space-y-6">
                    <CalendarView
                      events={events}
                      onSelectEvent={(evt) => setSelectedDetailEvent(evt)}
                      onOpenAddModal={() => setIsAddModalOpen(true)}
                      searchQuery={searchQuery}
                      userRole={userRole}
                      isLoggedIn={isLoggedIn}
                    />
                  </div>

                  {/* Right Column (35% width ~ 4 cols) */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* Waktu Shalat Widget */}
                    <PrayerTimesCard
                      prayerTimes={prayerTimes}
                      setPrayerTimes={handleUpdatePrayerTimes}
                    />

                    {/* Today's Agenda Checklist */}
                    <TodayAgendaCard
                      events={todayEvents}
                      onToggleDone={handleToggleDone}
                      onSelectEvent={(evt) => setSelectedDetailEvent(evt)}
                      onOpenAddModal={() => setIsAddModalOpen(true)}
                      onEditEvent={handleOpenEditEvent}
                      onDeleteEvent={handleDeleteEvent}
                      userRole={userRole}
                      isLoggedIn={isLoggedIn}
                    />

                    {/* Pengumuman Widget */}
                    <AnnouncementCard
                      announcements={announcements}
                      userRole={userRole}
                      isLoggedIn={isLoggedIn}
                      onAddAnnouncement={handleAddAnnouncement}
                      onDeleteAnnouncement={handleDeleteAnnouncement}
                      onUpdateAnnouncement={handleUpdateAnnouncement}
                    />
                  </div>

                </div>
              )}

              {/* TAB 2: KALENDER UTAMA */}
              {activeTab === 'kalender' && (
                <div className="space-y-6">
                  <CalendarView
                    events={events}
                    onSelectEvent={(evt) => setSelectedDetailEvent(evt)}
                    onOpenAddModal={() => setIsAddModalOpen(true)}
                    searchQuery={searchQuery}
                    userRole={userRole}
                    isLoggedIn={isLoggedIn}
                  />
                </div>
              )}

              {/* TAB 3: AGENDA SAYA */}
              {activeTab === 'agenda' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7">
                    <TodayAgendaCard
                      events={events}
                      onToggleDone={handleToggleDone}
                      onSelectEvent={(evt) => setSelectedDetailEvent(evt)}
                      onOpenAddModal={() => setIsAddModalOpen(true)}
                      onEditEvent={handleOpenEditEvent}
                      onDeleteEvent={handleDeleteEvent}
                      userRole={userRole}
                      isLoggedIn={isLoggedIn}
                    />
                  </div>
                  <div className="lg:col-span-5">
                    <PrayerTimesCard
                      prayerTimes={prayerTimes}
                      setPrayerTimes={handleUpdatePrayerTimes}
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: PENGUMUMAN */}
              {activeTab === 'pengumuman' && (
                <div className="space-y-6">
                  <AnnouncementCard
                    announcements={announcements}
                    userRole={userRole}
                    isLoggedIn={isLoggedIn}
                    onAddAnnouncement={handleAddAnnouncement}
                    onDeleteAnnouncement={handleDeleteAnnouncement}
                    onUpdateAnnouncement={handleUpdateAnnouncement}
                  />
                </div>
              )}

              {/* TAB 5: MANAJEMEN REAL-TIME & API */}
              {activeTab === 'realtime' && (
                <RealtimeManagement
                  events={events}
                  setEvents={setEvents}
                  prayerTimes={prayerTimes}
                  setPrayerTimes={setPrayerTimes}
                  announcements={announcements}
                  setAnnouncements={setAnnouncements}
                  attendance={attendance}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                  userRole={userRole}
                  isLoggedIn={isLoggedIn}
                  onDeleteEventFromDb={handleDeleteEvent}
                  onDeleteAnnouncementFromDb={handleDeleteAnnouncement}
                  onEditEvent={handleOpenEditEvent}
                />
              )}

              {/* TAB 7: PENGATURAN */}
              {activeTab === 'pengaturan' && (
                <SettingsView
                  userRole={userRole}
                  isDarkMode={isDarkMode}
                  toggleDarkMode={toggleDarkMode}
                />
              )}

            </div>
          </main>
        </div>
      )}

      {/* Global Modals & Push Notification Drawers */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEvent={handleAddEvent}
        onAddBatchEvents={handleBatchAddEvents}
      />

      <EditEventModal
        isOpen={isEditModalOpen}
        event={selectedEditEvent}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEditEvent(null);
        }}
        onUpdateEvent={handleUpdateEvent}
        onDeleteEvent={handleDeleteEvent}
      />

      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        setNotifications={setNotifications}
        onMarkAllRead={handleMarkAllNotifsRead}
      />

      <EventDetailModal
        event={selectedDetailEvent}
        onClose={() => setSelectedDetailEvent(null)}
        onToggleDone={handleToggleDone}
        onDeleteEvent={handleDeleteEvent}
        onEditEvent={handleOpenEditEvent}
        userRole={userRole}
        isLoggedIn={isLoggedIn}
      />

      {/* Pop Up Formulir Izin Pulang Santri */}
      <LeavePermissionModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSubmitSuccess={(record) => {
          const newNotif: PushNotification = {
            id: `notif-leave-${Date.now()}`,
            title: 'Izin Pulang Santri Terbit',
            message: `Surat izin ${record.id} untuk ${record.nama} (${record.kelas}) telah diverifikasi & disetujui.`,
            timestamp: 'Baru saja',
            read: false,
            category: 'asrama'
          };
          setNotifications((prev) => [newNotif, ...prev]);
          addNotificationToFirestore(newNotif).catch(console.error);
        }}
      />

      {/* Mobile Bottom Navigation (only visible on home view & mobile screens) */}
      {currentView === 'home' && (
        <MobileBottomNav 
          isHidden={isLeaveModalOpen || isLoginModalOpen || isAddModalOpen || isNotifDrawerOpen || Boolean(selectedDetailEvent)}
          onOpenLeaveModal={() => setIsLeaveModalOpen(true)}
          isLoggedIn={isLoggedIn}
          onEnterDashboard={() => setCurrentView('dashboard')}
        />
      )}
    </div>
  );
}
