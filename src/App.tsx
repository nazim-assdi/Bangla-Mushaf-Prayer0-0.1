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
import { SideMenu } from './components/SideMenu';
import { SURAH_LIST } from './data/quranMetadata';
import { QuranLanguage } from './services/multiLangQuran';
import { UiLanguage, translateUi } from './services/i18n';
import { LanguageSelectionScreen } from './components/LanguageSelectionScreen';
import { ReadingPlanner } from './components/ReadingPlanner';
import { ARABIC_FONTS } from './services/arabicFonts';
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
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<boolean>(false);

  // Settings & display state
  const [theme, setTheme] = useState<ThemeMode>('emerald');
  const [arabicFontSize, setArabicFontSize] = useState<number>(28);
  const [arabicFontId, setArabicFontId] = useState<string>(() => localStorage.getItem('mushaf_arabic_font') || 'noto-naskh');
  const [mushafPageStyle, setMushafPageStyle] = useState<string>(() => localStorage.getItem('mushaf_page_style') || 'classic');
  const [banglaFontSize, setBanglaFontSize] = useState<number>(15);
  const [showTransliteration, setShowTransliteration] = useState<boolean>(() => localStorage.getItem('mushaf_ui_language') === 'bn');
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [selectedReciterId, setSelectedReciterId] = useState<string>('alafasy');
  const [currentLanguage, setCurrentLanguage] = useState<QuranLanguage>(() => {
    const saved = localStorage.getItem('mushaf_quran_language');
    if (saved === 'bn' || saved === 'en' || saved === 'hi' || saved === 'ur' || saved === 'tr') return saved;
    const ui = localStorage.getItem('mushaf_ui_language');
    return ui === 'bn' || ui === 'hi' || ui === 'ur' || ui === 'tr' ? ui : 'en';
  });
  const [uiLanguage, setUiLanguage] = useState<UiLanguage | null>(() => {
    const saved = localStorage.getItem('mushaf_ui_language');
    return saved === 'bn' || saved === 'en' || saved === 'ar' || saved === 'hi' || saved === 'ur' || saved === 'tr' ? saved : null;
  });
  const [languageDraft, setLanguageDraft] = useState<UiLanguage>('en');
  const { user } = useAuth();

  // Bookmarks & last read state with localStorage sync
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem('bangla_mushaf_bookmarks');
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed as BookmarkItem[];
      }
    } catch (e) {
      console.warn('Could not restore saved bookmarks:', e);
    }
    // Start with an empty list. Demo bookmarks must never appear as real user data.
    return [];
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

  // Firestore is the source of truth for a signed-in account.
  // Always apply snapshots, including empty ones, so another account's local data
  // can never be copied into this account or resurrect deleted bookmarks.
  useEffect(() => {
    if (!user) return;

    void syncUserToCloudSQL(user);
    const unsubscribe = subscribeToBookmarks(user.uid, (remoteBookmarks) => {
      setBookmarks(remoteBookmarks);
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

  useEffect(() => {
    if (!uiLanguage) return;
    const root = document.documentElement;
    root.lang = uiLanguage;
    root.dir = uiLanguage === 'ar' || uiLanguage === 'ur' ? 'rtl' : 'ltr';
    localStorage.setItem('mushaf_ui_language', uiLanguage);
  }, [uiLanguage]);

  const handleUiLanguageChange = (language: UiLanguage) => {
    setUiLanguage(language);
    setLanguageDraft(language);
    localStorage.setItem('mushaf_ui_language', language);
    if (!localStorage.getItem('mushaf_quran_language')) {
      const translationLanguage: QuranLanguage = language === 'ar' ? 'en' : language;
      setCurrentLanguage(translationLanguage);
      localStorage.setItem('mushaf_quran_language', translationLanguage);
    }
  };

  useEffect(() => {
    const font = ARABIC_FONTS.find((item) => item.id === arabicFontId) ?? ARABIC_FONTS[0];
    document.documentElement.style.setProperty('--font-arabic', `${font.family}, serif`);
    localStorage.setItem('mushaf_arabic_font', font.id);
  }, [arabicFontId]);

  useEffect(() => {
    document.documentElement.dataset.mushafStyle = mushafPageStyle;
    localStorage.setItem('mushaf_page_style', mushafPageStyle);
  }, [mushafPageStyle]);

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

  const handleQuranLanguageChange = (language: QuranLanguage) => {
    setCurrentLanguage(language);
    localStorage.setItem('mushaf_quran_language', language);
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
        onOpenMenu={() => setIsSideMenuOpen(true)}
        currentSurahNameBn={currentSurah.nameBengali}
        currentSurahId={currentSurahId}
        uiLanguage={uiLanguage}
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
            onSelectLanguage={handleQuranLanguageChange}
            uiLanguage={uiLanguage}
          />
        )}

        {activeTab === 'prayer' && <PrayerTimesView uiLanguage={uiLanguage} />}

        {activeTab === 'qibla' && <QiblaCompassView uiLanguage={uiLanguage} />}

        {activeTab === 'dhikr' && <DailyDhikrView uiLanguage={uiLanguage} />}

        {activeTab === 'planner' && <ReadingPlanner uiLanguage={uiLanguage} />}

        {activeTab === 'bookmarks' && (
          <BookmarksView
            bookmarks={bookmarks}
            onRemoveBookmark={handleRemoveBookmark}
            onNavigateToAyah={handleSelectSurah}
            lastRead={lastRead}
            uiLanguage={uiLanguage}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsModal
            arabicFontSize={arabicFontSize}
            setArabicFontSize={setArabicFontSize}
            arabicFontId={arabicFontId}
            setArabicFontId={setArabicFontId}
            mushafPageStyle={mushafPageStyle}
            setMushafPageStyle={setMushafPageStyle}
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
            uiLanguage={uiLanguage}
            onUiLanguageChange={handleUiLanguageChange}
          />
        )}
      </main>

      {/* Main side menu */}
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        onSearch={() => { setIsSideMenuOpen(false); setIsGlobalSearchOpen(true); }}
        onSettings={() => { setIsSideMenuOpen(false); setActiveTab('settings'); }}
        onPrayer={() => { setIsSideMenuOpen(false); setActiveTab('prayer'); }}
        onBookmarks={() => { setIsSideMenuOpen(false); setActiveTab('bookmarks'); }}
        onGoToAyah={() => { setIsSideMenuOpen(false); setIsSurahDrawerOpen(true); }}
        uiLanguage={uiLanguage}
      />

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

      {/* Primary mobile navigation: seven destinations */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-emerald-900/10 bg-white/95 px-1 py-2 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-stone-700 dark:bg-stone-950/95" aria-label="Main navigation">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-1 overflow-x-auto">
          <button onClick={() => setActiveTab('mushaf')} className={`flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] ${activeTab === 'mushaf' ? 'font-bold text-emerald-700 dark:text-emerald-300' : 'text-stone-500'}`}><span className="text-lg">📖</span><span>{translateUi(uiLanguage, 'home')}</span></button>
          <button onClick={() => setActiveTab('qibla')} className={`flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] ${activeTab === 'qibla' ? 'font-bold text-emerald-700 dark:text-emerald-300' : 'text-stone-500'}`}><span className="text-lg">🕋</span><span>{translateUi(uiLanguage, 'qibla')}</span></button>
          <button onClick={() => setActiveTab('prayer')} className={`flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] ${activeTab === 'prayer' ? 'font-bold text-emerald-700 dark:text-emerald-300' : 'text-stone-500'}`}><span className="text-lg">🕌</span><span>{translateUi(uiLanguage, 'salat')}</span></button>
          <button onClick={() => setActiveTab('dhikr')} className={`flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] ${activeTab === 'dhikr' ? 'font-bold text-emerald-700 dark:text-emerald-300' : 'text-stone-500'}`}><span className="text-lg">📿</span><span>{translateUi(uiLanguage, 'adhkar')}</span></button>
          <button onClick={() => setActiveTab('planner')} className="flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] text-stone-500"><span className="text-lg">🗓️</span><span>{translateUi(uiLanguage, 'planner')}</span></button>
          <button onClick={() => setIsGlobalSearchOpen(true)} className="flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] text-stone-500"><span className="text-lg">🔎</span><span>{translateUi(uiLanguage, 'topicAyah')}</span></button>
          <button onClick={() => setActiveTab('bookmarks')} className={`flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] ${activeTab === 'bookmarks' ? 'font-bold text-emerald-700 dark:text-emerald-300' : 'text-stone-500'}`}><span className="text-lg">📚</span><span>{translateUi(uiLanguage, 'library')}</span></button>
        </div>
      </nav>
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
