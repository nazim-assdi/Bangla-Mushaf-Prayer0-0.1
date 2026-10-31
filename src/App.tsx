/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab, ThemeMode } from './components/Navbar';
import { MushafReader } from './components/MushafReader';
import { SurahDrawer } from './components/SurahDrawer';
import { PrayerTimesView } from './components/PrayerTimesView';
import { QiblaCompassView } from './components/QiblaCompassView';
import { BookmarksView } from './components/BookmarksView';
import { SettingsModal } from './components/SettingsModal';
import { DailyDhikrView } from './components/DailyDhikrView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { SURAH_LIST } from './data/quranMetadata';
import { QuranLanguage } from './services/multiLangQuran';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  saveBookmarkToFirestore,
  deleteBookmarkFromFirestore,
  subscribeToBookmarks,
  saveUserProfile,
  subscribeToUserProfile,
} from './services/firebase';
import {
  syncUserToCloudSQL,
  syncSettingsToCloudSQL,
  addBookmarkToCloudSQL,
  deleteBookmarkFromCloudSQL,
} from './services/apiSync';

interface BookmarkItem {
  id?: string;
  verseKey: string;
  surahNameBn: string;
  ayahNumber: number;
  addedAt: string;
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('mushaf');
  const [currentSurahId, setCurrentSurahId] = useState<number>(1);
  const [isSurahDrawerOpen, setIsSurahDrawerOpen] = useState<boolean>(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);

  // Settings & display state
  const [theme, setTheme] = useState<ThemeMode>('emerald');
  const [arabicFontSize, setArabicFontSize] = useState<number>(28);
  const [banglaFontSize, setBanglaFontSize] = useState<number>(15);
  const [showTransliteration, setShowTransliteration] = useState<boolean>(true);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [selectedReciterId, setSelectedReciterId] = useState<string>('alafasy');
  const [currentLanguage, setCurrentLanguage] = useState<QuranLanguage>('bn');
  const { user } = useAuth();

  // Bookmarks & last read state with localStorage sync
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem('bangla_mushaf_bookmarks');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: '1_1', verseKey: '1:1', surahNameBn: 'আল-ফাতিহা', ayahNumber: 1, addedAt: new Date().toISOString() },
      { id: '112_1', verseKey: '112:1', surahNameBn: 'আল-ইখলাস', ayahNumber: 1, addedAt: new Date().toISOString() },
    ];
  });

  const [lastRead, setLastRead] = useState<{
    surahId: number;
    ayahNumber: number;
    surahNameBn: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('bangla_mushaf_last_read');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { surahId: 1, ayahNumber: 1, surahNameBn: 'আল-ফাতিহা' };
  });

  // Real-time Firestore sync and Cloud SQL sync when user is signed in
  useEffect(() => {
    if (!user) return;
    syncUserToCloudSQL(user);
    const unsubscribe = subscribeToBookmarks(user.uid, (remoteBookmarks) => {
      if (remoteBookmarks && remoteBookmarks.length > 0) {
        setBookmarks(remoteBookmarks);
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserProfile(user.uid, (profile) => {
      if (profile) {
        if (profile.theme) setTheme(profile.theme as ThemeMode);
        if (profile.arabicFontSize) setArabicFontSize(profile.arabicFontSize);
        if (profile.banglaFontSize) setBanglaFontSize(profile.banglaFontSize);
        if (profile.selectedReciterId) setSelectedReciterId(profile.selectedReciterId);
        if (profile.currentLanguage) setCurrentLanguage(profile.currentLanguage as QuranLanguage);
        if (profile.lastRead) setLastRead(profile.lastRead);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Sync to Firestore and Cloud SQL on user settings and last read changes
  useEffect(() => {
    if (user && lastRead) {
      saveUserProfile(user.uid, {
        lastRead,
        theme,
        arabicFontSize,
        banglaFontSize,
        selectedReciterId,
        currentLanguage,
      });
      syncSettingsToCloudSQL(user, {
        theme,
        arabicFontSize,
        banglaFontSize,
        selectedReciterId,
        currentLanguage,
        lastReadSurahId: lastRead.surahId,
        lastReadAyahNumber: lastRead.ayahNumber,
        lastReadSurahNameBn: lastRead.surahNameBn,
      });
    }
  }, [lastRead, theme, arabicFontSize, banglaFontSize, selectedReciterId, currentLanguage, user]);

  useEffect(() => {
    try {
      localStorage.setItem('bangla_mushaf_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {}
  }, [bookmarks]);

  useEffect(() => {
    if (lastRead) {
      try {
        localStorage.setItem('bangla_mushaf_last_read', JSON.stringify(lastRead));
      } catch (e) {}
    }
  }, [lastRead]);

  // Handle theme classes on html
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'sepia', 'softblue', 'eyecare');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'sepia') {
      root.classList.add('sepia');
    } else if (theme === 'softblue') {
      root.classList.add('dark', 'softblue');
    } else if (theme === 'eyecare') {
      root.classList.add('dark', 'eyecare');
    }
  }, [theme]);

  const currentSurah = SURAH_LIST.find((s) => s.id === currentSurahId) || SURAH_LIST[0];

  const handleToggleBookmark = (verseKey: string, surahNameBn: string, ayahNumber: number) => {
    const exists = bookmarks.some((b) => b.verseKey === verseKey);
    const bookmarkId = verseKey.replace(':', '_');
    if (exists) {
      setBookmarks((prev) => prev.filter((b) => b.verseKey !== verseKey));
      if (user) {
        deleteBookmarkFromFirestore(user.uid, bookmarkId);
        deleteBookmarkFromCloudSQL(user, verseKey);
      }
    } else {
      const newBookmark: BookmarkItem = {
        id: bookmarkId,
        verseKey,
        surahNameBn,
        ayahNumber,
        addedAt: new Date().toISOString(),
      };
      setBookmarks((prev) => [newBookmark, ...prev]);
      if (user) {
        saveBookmarkToFirestore(user.uid, {
          id: bookmarkId,
          userId: user.uid,
          verseKey,
          surahNameBn,
          ayahNumber,
          addedAt: newBookmark.addedAt,
        });
        addBookmarkToCloudSQL(user, {
          verseKey,
          surahNameBn,
          ayahNumber,
          addedAt: newBookmark.addedAt,
        });
      }
    }
  };

  const handleRemoveBookmark = (verseKey: string) => {
    setBookmarks((prev) => prev.filter((b) => b.verseKey !== verseKey));
    if (user) {
      deleteBookmarkFromFirestore(user.uid, verseKey.replace(':', '_'));
      deleteBookmarkFromCloudSQL(user, verseKey);
    }
  };

  const handleSelectSurah = (surahId: number, targetAyah?: number) => {
    setCurrentSurahId(surahId);
    setActiveTab('mushaf');

    const s = SURAH_LIST.find((item) => item.id === surahId);
    if (s) {
      setLastRead({
        surahId,
        ayahNumber: targetAyah || 1,
        surahNameBn: s.nameBengali,
      });
    }

    if (targetAyah) {
      setTimeout(() => {
        const el = document.getElementById(`ayah-${targetAyah}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-stone-950 text-stone-100'
          : theme === 'sepia'
          ? 'bg-[#f4ece1] text-stone-900'
          : theme === 'softblue'
          ? 'bg-slate-900 text-slate-100'
          : theme === 'eyecare'
          ? 'bg-[#1b2a22] text-[#d4ebd0]'
          : 'bg-[#faf8f2] text-stone-900'
      }`}
    >
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSurahSearch={() => setIsSurahDrawerOpen(true)}
        onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
        currentSurahNameBn={currentSurah.nameBengali}
        currentSurahId={currentSurahId}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Offline Status Banner */}
      <OfflineIndicator />

      {/* Main View Area */}
      <main className="transition-all">
        {activeTab === 'mushaf' && (
          <MushafReader
            surahId={currentSurahId}
            onSelectSurah={handleSelectSurah}
            onOpenSurahList={() => setIsSurahDrawerOpen(true)}
            bookmarks={bookmarks.map((b) => b.verseKey)}
            onToggleBookmark={handleToggleBookmark}
            arabicFontSize={arabicFontSize}
            banglaFontSize={banglaFontSize}
            showTransliteration={showTransliteration}
            showTranslation={showTranslation}
            selectedReciterId={selectedReciterId}
            onSelectReciter={setSelectedReciterId}
            currentLanguage={currentLanguage}
            onSelectLanguage={setCurrentLanguage}
          />
        )}

        {activeTab === 'prayer' && <PrayerTimesView />}

        {activeTab === 'qibla' && <QiblaCompassView />}

        {activeTab === 'dhikr' && <DailyDhikrView />}

        {activeTab === 'bookmarks' && (
          <BookmarksView
            bookmarks={bookmarks}
            onRemoveBookmark={handleRemoveBookmark}
            onNavigateToAyah={handleSelectSurah}
            lastRead={lastRead}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsModal
            arabicFontSize={arabicFontSize}
            setArabicFontSize={setArabicFontSize}
            banglaFontSize={banglaFontSize}
            setBanglaFontSize={setBanglaFontSize}
            showTransliteration={showTransliteration}
            setShowTransliteration={setShowTransliteration}
            showTranslation={showTranslation}
            setShowTranslation={setShowTranslation}
            selectedReciterId={selectedReciterId}
            setSelectedReciterId={setSelectedReciterId}
            theme={theme}
            setTheme={setTheme}
          />
        )}
      </main>

      {/* Surah & Juz Selection Drawer Modal */}
      <SurahDrawer
        isOpen={isSurahDrawerOpen}
        onClose={() => setIsSurahDrawerOpen(false)}
        currentSurahId={currentSurahId}
        onSelectSurah={handleSelectSurah}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onSelectSurahAndAyah={handleSelectSurah}
      />

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 sm:hidden flex items-center justify-around py-2 px-1 text-[11px] font-bangla shadow-lg">
        <button
          onClick={() => setActiveTab('mushaf')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
            activeTab === 'mushaf'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <span>📖</span>
          <span>মুসহাফ</span>
        </button>

        <button
          onClick={() => setActiveTab('prayer')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
            activeTab === 'prayer'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <span>⏰</span>
          <span>নামাজ</span>
        </button>

        <button
          onClick={() => setActiveTab('qibla')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
            activeTab === 'qibla'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <span>🕋</span>
          <span>কিবলা</span>
        </button>

        <button
          onClick={() => setActiveTab('dhikr')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
            activeTab === 'dhikr'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <span>📿</span>
          <span>যিকির</span>
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
            activeTab === 'bookmarks'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <span>⭐</span>
          <span>সংরক্ষিত</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
            activeTab === 'settings'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <span>⚙️</span>
          <span>সেটিংস</span>
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
