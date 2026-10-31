import React from 'react';
import { BookOpen, Clock, Compass, Bookmark, Settings, Search, Moon, Sun, Sparkles } from 'lucide-react';
import { toBanglaNumber } from '../utils/banglaNumbers';
import { PWAInstallButton } from './PWAInstallButton';
import { AuthButton } from './AuthButton';

export type ActiveTab = 'mushaf' | 'prayer' | 'qibla' | 'dhikr' | 'bookmarks' | 'settings';
export type ThemeMode = 'emerald' | 'dark' | 'sepia' | 'softblue' | 'eyecare';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSurahSearch: () => void;
  onOpenGlobalSearch: () => void;
  currentSurahNameBn: string;
  currentSurahId: number;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSurahSearch,
  onOpenGlobalSearch,
  currentSurahNameBn,
  currentSurahId,
  theme,
  setTheme,
}) => {
  const toggleTheme = () => {
    if (theme === 'emerald') setTheme('dark');
    else if (theme === 'dark') setTheme('sepia');
    else if (theme === 'sepia') setTheme('softblue');
    else if (theme === 'softblue') setTheme('eyecare');
    else setTheme('emerald');
  };

  const themeLabel =
    theme === 'emerald'
      ? 'সবুজ মোড'
      : theme === 'dark'
      ? 'নাইট মোড'
      : theme === 'sepia'
      ? 'সেপিয়া মোড'
      : theme === 'softblue'
      ? 'নরম নীল (Soft Blue)'
      : 'আইকেয়ার (Eye Care)';

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-emerald-950 stroke-[2.2]" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight font-bangla text-amber-300">কুরআনুল কারীম</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-800 text-emerald-200 border border-emerald-700/60 font-bangla">বাংলা</span>
                </div>
                <p className="text-xs text-emerald-200/80 hidden sm:block font-bangla">শব্দে শব্দে অর্থ ও তাফসীর</p>
              </div>
            </button>

            {/* Quick Surah selector & global search buttons in header */}
            {activeTab === 'mushaf' && (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={onOpenSurahSearch}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700/80 text-emerald-100 border border-emerald-700/60 text-xs font-bangla transition-colors shadow-inner"
                  aria-label="সূরা পরিবর্তন করুন"
                >
                  <Search className="w-3.5 h-3.5 text-amber-300" />
                  <span>সূরা {toBanglaNumber(currentSurahId)}: {currentSurahNameBn}</span>
                  <span className="text-[10px] bg-emerald-950/60 px-1 rounded text-amber-200">বদলান</span>
                </button>

                <button
                  onClick={onOpenGlobalSearch}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs font-bangla transition-colors shadow-sm"
                  aria-label="সার্চ বা খোঁজ করুন"
                  title="কুরআনে অনুসন্ধান"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>খোঁজ করুন</span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden sm:flex items-center gap-1 sm:gap-1.5" aria-label="প্রধান নেভিগেশন">
            <button
              onClick={() => setActiveTab('mushaf')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'mushaf'
                  ? 'bg-amber-400 text-emerald-950 font-bold shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
              aria-label="মুসহাফ পাঠ"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline font-bangla">মুসহাফ</span>
            </button>

            <button
              onClick={() => setActiveTab('prayer')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'prayer'
                  ? 'bg-amber-400 text-emerald-950 font-bold shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
              aria-label="নামাজের সময়সূচী"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline font-bangla">নামাজের সময়</span>
            </button>

            <button
              onClick={() => setActiveTab('qibla')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'qibla'
                  ? 'bg-amber-400 text-emerald-950 font-bold shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
              aria-label="কিবলা কম্পাস"
            >
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline font-bangla">কিবলা</span>
            </button>

            <button
              onClick={() => setActiveTab('dhikr')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'dhikr'
                  ? 'bg-amber-400 text-emerald-950 font-bold shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
              aria-label="দৈনিক যিকির ও তাসবীহ"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline font-bangla">যিকির</span>
            </button>

            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'bookmarks'
                  ? 'bg-amber-400 text-emerald-950 font-bold shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
              aria-label="সংরক্ষিত আয়াত ও দোয়া"
            >
              <Bookmark className="w-4 h-4" />
              <span className="hidden md:inline font-bangla">সংরক্ষিত</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-amber-400 text-emerald-950 font-bold shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
              aria-label="অ্যাপ সেটিংস"
              title="সেটিংস"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Quick theme cycle button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-amber-200 hover:bg-emerald-800/60 transition-colors ml-0.5"
              aria-label={`থিম পরিবর্তন করুন (বর্তমান: ${themeLabel})`}
              title={`থিম পরিবর্তন (${themeLabel})`}
            >
              {theme === 'emerald' ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : theme === 'dark' ? (
                <Moon className="w-4 h-4 text-cyan-300" />
              ) : theme === 'sepia' ? (
                <span className="text-[11px] font-bold font-bangla px-1.5 py-0.5 bg-amber-800/80 text-amber-200 rounded">সেপিয়া</span>
              ) : theme === 'softblue' ? (
                <span className="text-[11px] font-bold font-bangla px-1.5 py-0.5 bg-cyan-900/80 text-cyan-200 rounded">নরম নীল</span>
              ) : (
                <span className="text-[11px] font-bold font-bangla px-1.5 py-0.5 bg-[#1b2a22] text-[#a7f3d0] border border-emerald-500/50 rounded">আইকেয়ার</span>
              )}
            </button>

            {/* PWA Install Action */}
            <PWAInstallButton />

            {/* Cloud Auth / Sync */}
            <AuthButton />
          </nav>

          {/* Mobile Quick Action Buttons (PWA Install, Auth, Search & Theme) */}
          <div className="flex sm:hidden items-center gap-1">
            <PWAInstallButton />
            <AuthButton />
            <button
              onClick={onOpenGlobalSearch}
              className="p-2 rounded-lg bg-emerald-800/80 text-amber-300 hover:bg-emerald-700 transition-colors"
              aria-label="খোঁজ করুন"
              title="খোঁজ করুন"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-emerald-800/80 text-amber-200 hover:bg-emerald-700 transition-colors"
              aria-label={`থিম পরিবর্তন (${themeLabel})`}
              title={`থিম: ${themeLabel}`}
            >
              {theme === 'emerald' ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : theme === 'dark' ? (
                <Moon className="w-4 h-4 text-cyan-300" />
              ) : (
                <Sparkles className="w-4 h-4 text-emerald-300" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
