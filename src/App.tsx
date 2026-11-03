/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { getTimeZoneForCoordinates } from './services/worldTimeZone';
import { BookOpen, Compass, Clock3, CircleDot, CalendarDays, Search, Bookmark } from 'lucide-react';
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
import { QURAN_LANGUAGES, QuranLanguage } from './services/multiLangQuran';
import { UiLanguage, translateUi } from './services/i18n';
import { LanguageSelectionScreen } from './components/LanguageSelectionScreen';
import { ReadingPlanner } from './components/ReadingPlanner';
import { ARABIC_FONTS } from './services/arabicFonts';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ArabicBanglaDictionary } from './components/ArabicBanglaDictionary';

interface BookmarkItem {
  id?: string;
  verseKey: string;
  surahNameBn: string;
  ayahNumber: number;
  addedAt: string;
}

function AppContent() {
  const isElectronDesktop = typeof navigator !== 'undefined' && /Electron/i.test(navigator.userAgent);
  const [activeTab, setActiveTab] = useState<ActiveTab>('mushaf');
  useEffect(() => { if (isElectronDesktop && activeTab === 'qibla') setActiveTab('mushaf'); }, [isElectronDesktop, activeTab]);
  const [currentSurahId, setCurrentSurahId] = useState<number>(1);
  const [isSurahDrawerOpen, setIsSurahDrawerOpen] = useState<boolean>(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<boolean>(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState<boolean>(false);

  useEffect(() => {
    const openDictionary = () => setIsDictionaryOpen(true);
    const openDonation = () => {
      setActiveTab('settings');
      window.setTimeout(() => document.getElementById('donation-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 180);
    };
    window.addEventListener('mushaf:open-dictionary', openDictionary);
    window.addEventListener('mushaf:open-donation', openDonation);
    return () => {
      window.removeEventListener('mushaf:open-dictionary', openDictionary);
      window.removeEventListener('mushaf:open-donation', openDonation);
    };
  }, []);

  // Settings & display state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('mushaf_theme');
    return saved === 'dark' || saved === 'sepia' || saved === 'softblue' || saved === 'eyecare' ? saved : 'emerald';
  });
  const [arabicFontSize, setArabicFontSize] = useState<number>(() => Number(localStorage.getItem('mushaf_arabic_font_size')) || 28);
  const [arabicFontId, setArabicFontId] = useState<string>(() => localStorage.getItem('mushaf_arabic_font') || 'noto-naskh');
  const [mushafPageStyle, setMushafPageStyle] = useState<string>(() => localStorage.getItem('mushaf_page_style') || 'classic');
  const [banglaFontSize, setBanglaFontSize] = useState<number>(() => Number(localStorage.getItem('mushaf_translation_font_size')) || 15);
  const [showTransliteration, setShowTransliteration] = useState<boolean>(() => {
    const saved = localStorage.getItem('mushaf_show_transliteration');
    return saved === null ? localStorage.getItem('mushaf_ui_language') === 'bn' : saved === 'true';
  });
  const [showTranslation, setShowTranslation] = useState<boolean>(() => localStorage.getItem('mushaf_show_translation') !== 'false');
  const [selectedReciterId, setSelectedReciterId] = useState<string>(() => localStorage.getItem('mushaf_selected_reciter') || 'alafasy');
  const [audioPlaybackSpeed, setAudioPlaybackSpeed] = useState<number>(() => Number(localStorage.getItem('mushaf_audio_speed')) || 1);
  const [autoPlayNextAyah, setAutoPlayNextAyah] = useState<boolean>(() => localStorage.getItem('mushaf_auto_next_ayah') !== 'false');
  const [currentLanguage, setCurrentLanguage] = useState<QuranLanguage>(() => {
    const saved = localStorage.getItem('mushaf_quran_language');
    if (saved && QURAN_LANGUAGES.some((item) => item.code === saved)) return saved as QuranLanguage;
    const ui = localStorage.getItem('mushaf_ui_language');
    return ui && QURAN_LANGUAGES.some((item) => item.code === ui) ? ui as QuranLanguage : 'en';
  });
  const [uiLanguage, setUiLanguage] = useState<UiLanguage | null>(() => {
    const saved = localStorage.getItem('mushaf_ui_language');
    return saved === 'bn' || saved === 'en' || saved === 'ar' || saved === 'hi' || saved === 'ur' || saved === 'tr' ? saved : null;
  });
  const [languageDraft, setLanguageDraft] = useState<UiLanguage>('en');

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

  // Android first-run location permission: Android will show its own permission dialog.
  // Permission is never silently granted; users can still enable GPS later from Prayer Times.
  useEffect(() => {
    if (!uiLanguage || Capacitor.getPlatform() !== 'android') return;
    if (localStorage.getItem('mushaf_android_location_prompted') === 'true') return;
    localStorage.setItem('mushaf_android_location_prompted', 'true');
    const requestLocation = async () => {
      try {
        let permission = await Geolocation.checkPermissions();
        if (permission.location !== 'granted') permission = await Geolocation.requestPermissions();
        if (permission.location !== 'granted') return;
        const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 });
        const point = { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy, nameBn: 'বর্তমান GPS অবস্থান' };
        localStorage.setItem('mushaf_gps_location', JSON.stringify(point));
        try {
          const zone = await getTimeZoneForCoordinates(point.lat, point.lng);
          localStorage.setItem('mushaf_gps_timezone', zone);
        } catch (error) {
          console.warn('Could not detect local time zone; using device time zone.', error);
        }
      } catch (error) {
        console.warn('Android location permission/location was not granted:', error);
      }
    };
    void requestLocation();
  }, [uiLanguage]);

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
    const firstLaunch = !localStorage.getItem('mushaf_ui_language');
    if (firstLaunch) setShowTransliteration(language === 'bn');
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

  useEffect(() => {
    localStorage.setItem('mushaf_theme', theme);
    localStorage.setItem('mushaf_arabic_font_size', String(arabicFontSize));
    localStorage.setItem('mushaf_translation_font_size', String(banglaFontSize));
    localStorage.setItem('mushaf_show_transliteration', String(showTransliteration));
    localStorage.setItem('mushaf_show_translation', String(showTranslation));
    localStorage.setItem('mushaf_selected_reciter', selectedReciterId);
    localStorage.setItem('mushaf_audio_speed', String(audioPlaybackSpeed));
    localStorage.setItem('mushaf_auto_next_ayah', String(autoPlayNextAyah));
    localStorage.setItem('mushaf_quran_language', currentLanguage);
  }, [theme, arabicFontSize, banglaFontSize, showTransliteration, showTranslation, selectedReciterId, currentLanguage, audioPlaybackSpeed, autoPlayNextAyah]);

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
    } else {
      const newBookmark: BookmarkItem = {
        id: bookmarkId,
        verseKey,
        surahNameBn,
        ayahNumber,
        addedAt: new Date().toISOString(),
      };
      setBookmarks((prev) => [newBookmark, ...prev]);
    }
  };

  const handleRemoveBookmark = (verseKey: string) => {
    setBookmarks((prev) => prev.filter((b) => b.verseKey !== verseKey));
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

  if (!uiLanguage) {
    return <LanguageSelectionScreen selectedLanguage={languageDraft} onSelect={setLanguageDraft} onContinue={() => handleUiLanguageChange(languageDraft)} firstLaunch />;
  }
  const activeUiLanguage: UiLanguage = uiLanguage;

  return (
    <div
      className={`app-shell min-h-screen transition-colors duration-300 ${
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
        currentSurahNameBn={activeUiLanguage === 'bn' ? currentSurah.nameBengali : currentSurah.nameEnglish}
        currentSurahId={currentSurahId}
        uiLanguage={activeUiLanguage}
      />

      {/* Offline Status Banner */}
      <OfflineIndicator />

      {/* Main View Area */}
      <main className="transition-all" data-active-screen={activeTab}>
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
            audioPlaybackSpeed={audioPlaybackSpeed}
            autoPlayNextAyah={autoPlayNextAyah}
            currentLanguage={currentLanguage}
            onSelectLanguage={handleQuranLanguageChange}
            uiLanguage={activeUiLanguage}
          />
        )}

        {activeTab === 'prayer' && <PrayerTimesView uiLanguage={activeUiLanguage} />}

        {activeTab === 'qibla' && !isElectronDesktop && <QiblaCompassView uiLanguage={activeUiLanguage} />}

        {activeTab === 'dhikr' && <DailyDhikrView uiLanguage={activeUiLanguage} />}

        {activeTab === 'planner' && <ReadingPlanner uiLanguage={activeUiLanguage} />}

        {activeTab === 'bookmarks' && (
          <BookmarksView
            bookmarks={bookmarks}
            onRemoveBookmark={handleRemoveBookmark}
            onNavigateToAyah={handleSelectSurah}
            lastRead={lastRead}
            uiLanguage={activeUiLanguage}
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
            audioPlaybackSpeed={audioPlaybackSpeed}
            setAudioPlaybackSpeed={setAudioPlaybackSpeed}
            autoPlayNextAyah={autoPlayNextAyah}
            setAutoPlayNextAyah={setAutoPlayNextAyah}
            theme={theme}
            setTheme={setTheme}
            uiLanguage={activeUiLanguage}
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
        uiLanguage={activeUiLanguage}
      />

      {isDictionaryOpen && <ArabicBanglaDictionary onClose={() => setIsDictionaryOpen(false)} />}

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
          <button onClick={() => setActiveTab('mushaf')} className={`flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] transition-all ${activeTab === 'mushaf' ? 'font-bold text-emerald-700 dark:text-emerald-300' : 'text-stone-500'}`}><BookOpen className="h-5 w-5" /><span>{translateUi(activeUiLanguage, 'home')}</span></button>
          {!isElectronDesktop && <button onClick={() => setActiveTab('qibla')} className={`flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] ${activeTab === 'qibla' ? 'font-bold text-emerald-700 dark:text-emerald-300' : 'text-stone-500'}`}><Compass className="h-5 w-5" /><span>{translateUi(activeUiLanguage, 'qibla')}</span></button>}
          <button onClick={() => setActiveTab('prayer')} className={`flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] ${activeTab === 'prayer' ? 'font-bold text-emerald-700 dark:text-emerald-300' : 'text-stone-500'}`}><Clock3 className="h-5 w-5" /><span>{translateUi(activeUiLanguage, 'salat')}</span></button>
          <button onClick={() => setActiveTab('dhikr')} className={`flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] ${activeTab === 'dhikr' ? 'font-bold text-emerald-700 dark:text-emerald-300' : 'text-stone-500'}`}><CircleDot className="h-5 w-5" /><span>{translateUi(activeUiLanguage, 'adhkar')}</span></button>
          <button onClick={() => setActiveTab('planner')} className={`flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] ${activeTab === 'planner' ? 'font-bold text-emerald-700 dark:text-emerald-300' : 'text-stone-500'}`}><CalendarDays className="h-5 w-5" /><span>{translateUi(activeUiLanguage, 'planner')}</span></button>
          <button onClick={() => setIsGlobalSearchOpen(true)} className="flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] text-stone-500"><Search className="h-5 w-5" /><span>{translateUi(activeUiLanguage, 'topicAyah')}</span></button>
          <button onClick={() => setActiveTab('bookmarks')} className={`flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] ${activeTab === 'bookmarks' ? 'font-bold text-emerald-700 dark:text-emerald-300' : 'text-stone-500'}`}><Bookmark className="h-5 w-5" /><span>{translateUi(activeUiLanguage, 'library')}</span></button>
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
