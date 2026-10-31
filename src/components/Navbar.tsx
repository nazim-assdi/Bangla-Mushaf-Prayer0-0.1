import React from 'react';
import { UiLanguage, translateUi } from '../services/i18n';
import { BookOpen, Clock, Compass, Bookmark, Settings, Search, MoreVertical } from 'lucide-react';
import { toBanglaNumber } from '../utils/banglaNumbers';
import { PWAInstallButton } from './PWAInstallButton';
import { AuthButton } from './AuthButton';

export type ActiveTab = 'mushaf' | 'prayer' | 'qibla' | 'dhikr' | 'bookmarks' | 'settings' | 'planner';
export type ThemeMode = 'emerald' | 'dark' | 'sepia' | 'softblue' | 'eyecare';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSurahSearch: () => void;
  onOpenGlobalSearch: () => void;
  onOpenMenu: () => void;
  currentSurahNameBn: string;
  currentSurahId: number;
  uiLanguage: UiLanguage;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSurahSearch,
  onOpenGlobalSearch,
  onOpenMenu,
  currentSurahNameBn,
  currentSurahId,
  uiLanguage,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-emerald-900/95 dark:bg-stone-900/95 backdrop-blur-md text-white border-b border-emerald-800/60 dark:border-stone-800 shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo & Current Surah */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('mushaf')}
              className="flex items-center gap-2.5 text-left group focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-lg p-1"
              aria-label="হোমপেজ ও মুসহাফে ফিরে যান"
            >
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-lg shadow-amber-500/25 ring-1 ring-amber-100/70 transition-transform group-hover:scale-105">
                <svg viewBox="0 0 64 64" role="img" aria-label="Open Quran Kareem emblem" className="h-9 w-9 drop-shadow-sm">
                  <path d="M8 15c9-4 17-2 24 3v34c-7-5-15-7-24-3V15Z" fill="#064e3b" stroke="#fef3c7" strokeWidth="2.4" strokeLinejoin="round"/>
                  <path d="M56 15c-9-4-17-2-24 3v34c7-5 15-7 24-3V15Z" fill="#065f46" stroke="#fef3c7" strokeWidth="2.4" strokeLinejoin="round"/>
                  <path d="M32 18v34M13 22c6-1 11 0 15 3M13 29c6-1 11 0 15 3M51 22c-6-1-11 0-15 3M51 29c-6-1-11 0-15 3" fill="none" stroke="#fcd34d" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="m32 5 2.4 5 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L32 5Z" fill="#fff7d6"/>
                </svg>
              </div>
              <div className="min-w-0 leading-tight">
                <div className="font-serif text-[15px] sm:text-lg font-extrabold tracking-tight text-amber-300">Al-Quran Al-Kareem</div>
                <p className="hidden text-[10px] tracking-[0.16em] text-emerald-100/80 sm:block">READ · REFLECT · REMEMBER</p>
              </div>
            </button>

            {/* Quick Surah selector & global search buttons in header */}
            {activeTab === 'mushaf' && (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={onOpenSurahSearch}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700/80 text-emerald-100 border border-emerald-700/60 text-xs font-bangla transition-colors shadow-inner"
                  aria-label={translateUi(uiLanguage, 'chooseSurah')}
                >
                  <Search className="w-3.5 h-3.5 text-amber-300" />
                  <span>{translateUi(uiLanguage, 'surahLabel')} {uiLanguage === 'bn' ? toBanglaNumber(currentSurahId) : currentSurahId}: {currentSurahNameBn}</span>
                  <span className="text-[10px] bg-emerald-950/60 px-1 rounded text-amber-200">{translateUi(uiLanguage, 'change')}</span>
                </button>

                <button
                  onClick={onOpenGlobalSearch}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs font-bangla transition-colors shadow-sm"
                  aria-label={translateUi(uiLanguage, 'searchQuran')}
                  title={translateUi(uiLanguage, 'searchQuran')}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{translateUi(uiLanguage, 'search')}</span>
                </button>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <PWAInstallButton />
            <AuthButton />
          </div>

          <button onClick={onOpenMenu} className="p-2 rounded-xl bg-amber-400 text-emerald-950 hover:bg-amber-300 shadow-sm" aria-label={translateUi(uiLanguage, 'menu')} title={translateUi(uiLanguage, 'menu')}><MoreVertical className="w-5 h-5" /></button>

          {/* Mobile Quick Action Buttons (PWA Install, Auth, Search & Theme) */}
          <div className="flex sm:hidden items-center gap-1">
            <PWAInstallButton />
            <AuthButton />
            <button
              onClick={onOpenGlobalSearch}
              className="p-2 rounded-lg bg-emerald-800/80 text-amber-300 hover:bg-emerald-700 transition-colors"
              aria-label={translateUi(uiLanguage, 'search')}
              title="খোঁজ করুন"
            >
              <Search className="w-4 h-4" />
            </button>


          </div>
        </div>
      </div>
    </header>
  );
};
