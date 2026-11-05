import React from 'react';
import { UiLanguage, translateUi } from '../services/i18n';
import { BookOpen, Clock, Compass, Bookmark, Settings, Search, MoreVertical } from 'lucide-react';
import { toBanglaNumber } from '../utils/banglaNumbers';
import { PWAInstallButton } from './PWAInstallButton';

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
    <header className="sticky top-0 z-40 bg-[#082f3b]/95 dark:bg-[#082f3b]/95 backdrop-blur-xl text-white border-b border-amber-300/20 shadow-xl transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-[4.5rem] gap-2">
          
          {/* Logo & Current Surah */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('mushaf')}
              className="flex items-center gap-2.5 text-left group focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-lg p-1"
              aria-label="হোমপেজ ও মুসহাফে ফিরে যান"
            >
              <img src="/icon.svg" alt="Al Quran & Prayer app logo" className="h-11 w-11 shrink-0 rounded-2xl shadow-xl ring-2 ring-amber-300/50 transition-transform group-hover:scale-105" />
              <div className="min-w-0 leading-tight">
                <div className="font-serif text-[15px] sm:text-lg font-extrabold tracking-tight text-[#f0cf8b]">Al Quran &amp; Prayer</div>
                <p className="hidden text-[10px] tracking-[0.16em] text-cyan-100/80 sm:block">QURAN · PRAYER · PEACE</p>
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
          </div>

          <button onClick={onOpenMenu} className="p-2 rounded-xl bg-amber-400 text-emerald-950 hover:bg-amber-300 shadow-sm" aria-label={translateUi(uiLanguage, 'menu')} title={translateUi(uiLanguage, 'menu')}><MoreVertical className="w-5 h-5" /></button>

          {/* Mobile Quick Actions */}
          <div className="flex sm:hidden items-center gap-1">
            <PWAInstallButton />
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
