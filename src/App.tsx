import React, { useState, useEffect } from 'react';
import { TabType, PublicConfig, Announcement, ScheduleItem } from './types';
import { DEFAULT_CONFIG } from './data/defaultConfig';
import { ApiService } from './services/api';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ActionCards } from './components/ActionCards';
import { AboutSection } from './components/AboutSection';
import { AnnouncementsSection } from './components/AnnouncementsSection';
import { ScheduleSection } from './components/ScheduleSection';
import { CriteriaSection } from './components/CriteriaSection';
import { Footer } from './components/Footer';
import { ExamPage } from './pages/ExamPage';
import { ScorePage } from './pages/ScorePage';
import { CertificatePage } from './pages/CertificatePage';
import { AdminPanelModal } from './components/AdminPanelModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [config, setConfig] = useState<PublicConfig>(DEFAULT_CONFIG);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const applyData = (data: { config: PublicConfig; announcements: Announcement[]; schedule: ScheduleItem[] }) => {
      if (!isMounted) return;
      setConfig(data.config);
      setAnnouncements(data.announcements);
      setSchedule(data.schedule);

      if (data.config.REGISTRATION_DEADLINE) {
        const deadline = new Date(data.config.REGISTRATION_DEADLINE).getTime();
        const now = new Date().getTime();
        setIsExpired(now > deadline || !data.config.REGISTRATION_OPEN);
      }
    };

    async function loadData() {
      setIsLoading(true);
      try {
        const data = await ApiService.fetchServerData();
        applyData(data);
      } catch (err) {
        console.error('Error initializing THAI WSK 2026 data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    // 1. Instant sync from BroadcastChannel (cross-tab on same device)
    ApiService.onSync((data) => {
      applyData(data);
    });

    // 2. High-frequency real-time polling across separate electronic devices (every 3.5s)
    const syncInterval = setInterval(() => {
      ApiService.fetchServerData()
        .then(applyData)
        .catch(() => {});
    }, 3500);

    // 3. Immediate sync on window focus and tab visibility change (e.g. user opens phone or switches apps)
    const handleRecheck = () => {
      ApiService.fetchServerData()
        .then(applyData)
        .catch(() => {});
    };

    window.addEventListener('focus', handleRecheck);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleRecheck();
      }
    });

    // 4. LocalStorage cross-tab event listener
    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith('thai_wsk_')) {
        handleRecheck();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleRecheck);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleSaveAll = (
    updatedConfig: PublicConfig,
    updatedAnnouncements: Announcement[],
    updatedSchedule: ScheduleItem[]
  ) => {
    setConfig(updatedConfig);
    setAnnouncements(updatedAnnouncements);
    setSchedule(updatedSchedule);

    if (updatedConfig.REGISTRATION_DEADLINE) {
      const deadline = new Date(updatedConfig.REGISTRATION_DEADLINE).getTime();
      const now = new Date().getTime();
      setIsExpired(now > deadline || !updatedConfig.REGISTRATION_OPEN);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FD] text-[#30283A] font-sans antialiased selection:bg-[#7043A6] selection:text-white">
      
      {/* Sticky Header with Drawer containing 'สำหรับแอดมิน' */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <>
            {/* Hero Section */}
            <Hero
              config={config}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              isExpired={isExpired}
              onStatusChange={(expired) => setIsExpired(expired)}
            />

            {/* Action Cards */}
            <ActionCards
              config={config}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              isExpired={isExpired}
            />

            {/* About Project & Academic Objectives */}
            <AboutSection config={config} />

            {/* Award Criteria & Scoring Rules */}
            <CriteriaSection config={config} />

            {/* Schedule & Event Timeline */}
            <ScheduleSection schedule={schedule} />

            {/* Published Announcements */}
            <AnnouncementsSection announcements={announcements} />
          </>
        )}

        {currentTab === 'exam' && (
          <ExamPage config={config} isExpired={isExpired} />
        )}

        {currentTab === 'scores' && (
          <ScorePage
            config={config}
            onNavigateToCertificate={() => {
              setCurrentTab('certificate');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'certificate' && (
          <CertificatePage config={config} />
        )}
      </main>

      {/* Academic Footer with School Info & Developer Credits */}
      <Footer config={config} />

      {/* Admin Panel Modal (เข้าสู่ระบบด้วย THAIWSK44230 / wskthai44230) */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        config={config}
        announcements={announcements}
        schedule={schedule}
        onSaveAll={handleSaveAll}
      />

    </div>
  );
}
