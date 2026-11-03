import React, { useEffect, useState } from 'react';
import { Type, Volume2, Eye, Info, Sparkles, Moon, Sun, Check } from 'lucide-react';
import { RECITERS } from '../services/quranApi';
import { toBanglaNumber } from '../utils/banglaNumbers';
import { ThemeMode } from './Navbar';
import { OfflineNotesAccount } from './OfflineNotesAccount';
import { OfflineQuranDownload } from './OfflineQuranDownload';
import { OfflineTafsirDownload } from './OfflineTafsirDownload';
import { UI_LANGUAGES, UiLanguage, translateUi } from '../services/i18n';
import { ARABIC_FONTS } from '../services/arabicFonts';
import { DonationCard } from './DonationCard';

interface SettingsModalProps {
  arabicFontSize: number;
  arabicFontId: string;
  setArabicFontId: (id: string) => void;
  mushafPageStyle: string;
  setMushafPageStyle: (style: string) => void;
  setArabicFontSize: (size: number) => void;
  banglaFontSize: number;
  setBanglaFontSize: (size: number) => void;
  showTransliteration: boolean;
  setShowTransliteration: (show: boolean) => void;
  showTranslation: boolean;
  setShowTranslation: (show: boolean) => void;
  selectedReciterId: string;
  setSelectedReciterId: (id: string) => void;
  audioPlaybackSpeed: number;
  setAudioPlaybackSpeed: (speed: number) => void;
  autoPlayNextAyah: boolean;
  setAutoPlayNextAyah: (enabled: boolean) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  uiLanguage: UiLanguage;
  onUiLanguageChange: (language: UiLanguage) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  arabicFontSize,
  setArabicFontSize,
  arabicFontId,
  setArabicFontId,
  mushafPageStyle,
  setMushafPageStyle,
  banglaFontSize,
  setBanglaFontSize,
  showTransliteration,
  setShowTransliteration,
  showTranslation,
  setShowTranslation,
  selectedReciterId,
  setSelectedReciterId,
  audioPlaybackSpeed,
  setAudioPlaybackSpeed,
  autoPlayNextAyah,
  setAutoPlayNextAyah,
  theme,
  setTheme,
  uiLanguage,
  onUiLanguageChange,
}) => {
  const [keepScreenAwake, setKeepScreenAwake] = useState<boolean>(() => localStorage.getItem('mushaf_keep_screen_awake') === 'true');
  const [wakeLockError, setWakeLockError] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('mushaf_keep_screen_awake', String(keepScreenAwake));
    if (!keepScreenAwake) return;
    let lock: { release: () => Promise<void> } | null = null;
    let cancelled = false;
    const acquire = async () => {
      try {
        const wakeLockApi = (navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock;
        if (!wakeLockApi) {
          setWakeLockError('এই ব্রাউজার/ডিভাইসে Screen Wake Lock সমর্থিত নয়।');
          return;
        }
        lock = await wakeLockApi.request('screen');
        if (cancelled && lock) await lock.release();
        else setWakeLockError('');
      } catch {
        setWakeLockError('স্ক্রিন চালু রাখার অনুমতি পাওয়া যায়নি।');
      }
    };
    void acquire();
    const onVisibility = () => {
      if (document.visibilityState === 'hidden' && lock) {
        const previousLock = lock;
        lock = null;
        void previousLock.release();
      } else if (document.visibilityState === 'visible' && !lock) {
        void acquire();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      if (lock) void lock.release();
    };
  }, [keepScreenAwake]);

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-3 py-5 pb-28 font-bangla sm:px-6 sm:py-6">
      <header className="relative isolate overflow-hidden rounded-3xl border border-emerald-800/20 bg-gradient-to-br from-[#064e3b] via-[#0b6b50] to-[#123f3a] p-5 text-white shadow-lg shadow-emerald-950/10 sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full border border-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-1 -top-5 h-28 w-28 rounded-full border border-amber-200/15" />
        <div className="relative flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10"><Eye className="h-5 w-5 text-amber-200" /></span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-100/80">PERSONALIZE YOUR MUSHAF</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{translateUi(uiLanguage, 'settings')}</h2>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-emerald-50/85">পাঠের ধরন, ভাষা, ফন্ট, অডিও ও স্ক্রিনের অভিজ্ঞতা নিজের মতো সাজিয়ে নিন।</p>
          </div>
        </div>
        <nav aria-label="Settings sections" className="relative mt-5 flex gap-2 overflow-x-auto pb-1 text-[11px] font-bold">
          <a href="#settings-language" className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20">ভাষা</a>
          <a href="#settings-theme" className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20">থিম</a>
          <a href="#settings-font" className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20">ফন্ট</a>
          <a href="#settings-reciter" className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20">তিলাওয়াত</a>
          <a href="#settings-reading" className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20">পাঠের অপশন</a>
          <a href="#settings-about" className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20">সম্পর্কে</a>
        </nav>
      </header>

      <section id="settings-language" className="scroll-mt-4 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-3">
        <h3 className="font-bold text-stone-900 dark:text-white">{translateUi(uiLanguage, 'language')}</h3>
        <p className="text-xs text-stone-500 dark:text-stone-400">{translateUi(uiLanguage, 'languageHelp')}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {UI_LANGUAGES.map((language) => (
            <button key={language.code} type="button" onClick={() => onUiLanguageChange(language.code)}
              aria-pressed={uiLanguage === language.code}
              className={`rounded-xl border px-3 py-3 text-left transition ${uiLanguage === language.code ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100' : 'border-stone-200 text-stone-700 dark:border-stone-700 dark:text-stone-200'}`}>
              <span className="block font-bold">{language.nativeName}</span>
              <span className="text-[11px] opacity-70">{language.name}</span>
            </button>
          ))}
        </div>
      </section>

      <OfflineNotesAccount uiLanguage={uiLanguage} />

      <OfflineQuranDownload uiLanguage={uiLanguage} />

      <OfflineTafsirDownload uiLanguage={uiLanguage} />

      {/* Premium theme gallery */}
      <section id="settings-theme" className="scroll-mt-4 relative isolate overflow-hidden rounded-[1.75rem] border border-amber-300/50 bg-gradient-to-br from-[#fffdf7] via-[#f8f4e9] to-[#efe6d2] p-4 shadow-xl shadow-stone-900/10 dark:border-stone-700 dark:from-[#211e19] dark:via-[#191713] dark:to-[#12110f] sm:p-5 space-y-5">
        <div className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full border border-amber-500/15" />
        <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full border border-amber-500/15" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-100/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              <Sparkles className="h-3 w-3" /> Reading atmosphere
            </span>
            <h3 className="text-lg font-extrabold tracking-tight text-stone-900 dark:text-stone-50">{translateUi(uiLanguage, 'theme')}</h3>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-stone-600 dark:text-stone-400">প্রতিটি থিমে রঙ, কনট্রাস্ট ও পড়ার পরিবেশের আলাদা সমন্বয়</p>
          </div>
          <span className="shrink-0 rounded-xl border border-stone-300/70 bg-white/70 px-3 py-2 text-center shadow-sm dark:border-stone-700 dark:bg-stone-900/70">
            <span className="block text-lg font-black leading-none text-stone-900 dark:text-white">05</span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-wider text-stone-500">Themes</span>
          </span>
        </div>

        <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3">
          {([
            { id: 'emerald', name: translateUi(uiLanguage, 'greenMushaf'), note: 'Classic Islamic', outer: 'bg-[#f7f5eb]', header: 'bg-[#075b45]', panel: 'bg-white', accent: 'bg-[#d9ad55]', ink: 'text-[#174b3c]', border: 'border-[#c9d9c9]', swatches: ['#075b45','#f7f5eb','#d9ad55'], caption: 'Balanced · Traditional' },
            { id: 'dark', name: translateUi(uiLanguage, 'nightMode'), note: 'Midnight · Gold', outer: 'bg-[#171511]', header: 'bg-[#29231b]', panel: 'bg-[#332c22]', accent: 'bg-[#d9b66e]', ink: 'text-[#f7e7bd]', border: 'border-[#66543a]', swatches: ['#171511','#332c22','#d9b66e'], caption: 'Low light · Warm' },
            { id: 'sepia', name: translateUi(uiLanguage, 'sepiaPage'), note: 'Warm parchment', outer: 'bg-[#eee1ca]', header: 'bg-[#8a7354]', panel: 'bg-[#f8efde]', accent: 'bg-[#b58a4d]', ink: 'text-[#59452f]', border: 'border-[#c9ad82]', swatches: ['#8a7354','#eee1ca','#b58a4d'], caption: 'Paper · Heritage' },
            { id: 'softblue', name: translateUi(uiLanguage, 'softBlue'), note: 'Ocean · Calm', outer: 'bg-[#101d32]', header: 'bg-[#1c3555]', panel: 'bg-[#233c5c]', accent: 'bg-[#82c9dc]', ink: 'text-[#e0f3ff]', border: 'border-[#476987]', swatches: ['#101d32','#233c5c','#82c9dc'], caption: 'Cool · Focus' },
            { id: 'eyecare', name: translateUi(uiLanguage, 'eyeCare'), note: 'Forest · Eye care', outer: 'bg-[#17271f]', header: 'bg-[#294637]', panel: 'bg-[#22392d]', accent: 'bg-[#a7c58e]', ink: 'text-[#e0efd9]', border: 'border-[#55765d]', swatches: ['#17271f','#22392d','#a7c58e'], caption: 'Nature · Calm' },
          ] as const).map((item) => {
            const selected = theme === item.id;
            return (
              <button key={item.id} type="button" onClick={() => setTheme(item.id)} aria-pressed={selected}
                className={`group relative rounded-2xl border p-2 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-950 ${selected ? 'border-amber-500 bg-amber-50/80 shadow-lg shadow-amber-900/10 ring-2 ring-amber-400/40 dark:bg-amber-950/20' : 'border-stone-200/90 bg-white/70 hover:border-amber-300 dark:border-stone-700 dark:bg-stone-900/60 dark:hover:border-amber-700'}`}>
                <div className={`overflow-hidden rounded-xl border shadow-inner ${item.border} ${item.outer}`}>
                  <div className={`flex h-6 items-center justify-between px-2.5 ${item.header}`}>
                    <span className="flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-white/80"/><span className="h-1 w-1 rounded-full bg-white/50"/><span className="h-1 w-1 rounded-full bg-white/30"/></span>
                    <span className="h-1 w-8 rounded-full bg-white/50"/>
                  </div>
                  <div className="space-y-2 p-2.5">
                    <div className={`rounded-lg border border-current/10 p-2 ${item.panel}`}>
                      <div className="mb-1 flex items-center justify-between"><span className={`h-1.5 w-12 rounded-full ${item.accent}`}/><span className={`h-1.5 w-1.5 rounded-full ${item.accent}`}/></div>
                      <div className={`h-1 w-full rounded-full opacity-30 ${item.ink} bg-current`}/>
                      <div className={`mt-1 h-1 w-4/5 rounded-full opacity-20 ${item.ink} bg-current`}/>
                    </div>
                    <div className="py-1 text-center">
                      <span className={`font-arabic text-[22px] leading-none ${item.ink}`} dir="rtl">بِسْمِ اللَّهِ</span>
                      <span className={`mt-1 block text-[8px] opacity-75 ${item.ink}`}>In the name of Allah</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`h-1.5 flex-1 rounded-full ${item.accent}`}/>
                      <span className={`h-1.5 flex-1 rounded-full opacity-30 ${item.ink} bg-current`}/>
                      <span className={`h-1.5 flex-1 rounded-full opacity-30 ${item.ink} bg-current`}/>
                    </div>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-1 px-0.5 pt-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-extrabold text-stone-900 dark:text-stone-100">{item.name}</span>
                    <span className="mt-0.5 block truncate text-[9px] text-stone-500 dark:text-stone-400">{item.caption}</span>
                  </span>
                  {selected && <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm"><Check className="h-3.5 w-3.5" /></span>}
                </div>
                <div className="mt-2 flex items-center gap-1 px-0.5">
                  {item.swatches.map((color) => <span key={color} className="h-2.5 flex-1 rounded-full border border-black/5" style={{ backgroundColor: color }} />)}
                </div>
                {selected && <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-white shadow">Active</span>}
              </button>
            );
          })}
        </div>
        <div className="relative flex items-start gap-2 rounded-xl border border-emerald-900/10 bg-emerald-50/80 p-3 dark:border-emerald-800/40 dark:bg-emerald-950/30">
          <Eye className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300"/>
          <p className="text-[11px] leading-relaxed text-emerald-950 dark:text-emerald-100">থিম নির্বাচন করলেই সঙ্গে সঙ্গে পরিবর্তন হবে এবং আপনার ডিভাইসে সংরক্ষিত থাকবে। আরবি কুরআনের মূল লেখা ও অনুবাদের বিষয়বস্তু অপরিবর্তিত থাকবে।</p>
        </div>
      </section>

      {/* Font Size Adjusters */}
      <div id="settings-font" className="scroll-mt-4 bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 space-y-5">
        <label className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <Type className="w-4 h-4 text-emerald-600" />
          <span>{translateUi(uiLanguage, 'fontSizeSettings')}</span>
        </label>

        {/* Arabic Font Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-stone-600 dark:text-stone-400">
            <span>{translateUi(uiLanguage, 'arabicFont')}:</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              {toBanglaNumber(arabicFontSize)} পিক্সেল
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="42"
            value={arabicFontSize}
            onChange={(e) => setArabicFontSize(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
            aria-label="আরবি ফন্ট সাইজ"
          />
          <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-xl text-center">
            <span className="font-arabic text-emerald-950 dark:text-emerald-300" style={{ fontSize: `${arabicFontSize}px` }}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </span>
          </div>
        </div>

        {/* Bengali Font Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-stone-600 dark:text-stone-400">
            <span>{translateUi(uiLanguage, 'translationFont')}:</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              {toBanglaNumber(banglaFontSize)} পিক্সেল
            </span>
          </div>
          <input
            type="range"
            min="13"
            max="26"
            value={banglaFontSize}
            onChange={(e) => setBanglaFontSize(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
            aria-label={translateUi(uiLanguage, 'translationFont')}
          />
          <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-xl text-center">
            <span className="font-bangla text-stone-800 dark:text-stone-200" style={{ fontSize: `${banglaFontSize}px` }}>
              {translateUi(uiLanguage, 'translationPreview')}
            </span>
          </div>
        </div>
      </div>

      {/* Bundled Arabic font selector */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-3">
        <h3 className="font-bold text-stone-900 dark:text-white">Arabic Mushaf Font · 10 fonts</h3>
        <p className="text-xs text-stone-500 dark:text-stone-400">Fonts are bundled with the app, so the selected typeface is available offline.</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ARABIC_FONTS.map((font) => (
            <button key={font.id} type="button" onClick={() => setArabicFontId(font.id)} aria-pressed={arabicFontId === font.id}
              className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition ${arabicFontId === font.id ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' : 'border-stone-200 dark:border-stone-700'}`}>
              <span className="min-w-0"><span className="block text-sm font-semibold text-stone-900 dark:text-white">{font.name}</span><span className="text-[10px] text-stone-500 uppercase">{font.style}</span></span>
              <span className="shrink-0 text-2xl text-emerald-900 dark:text-emerald-200" style={{ fontFamily: font.family }} dir="rtl">بِسْمِ اللَّهِ</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-3">
        <h3 className="font-bold text-stone-900 dark:text-white">Mushaf page appearance · 10 styles</h3>
        <p className="text-xs text-stone-500 dark:text-stone-400">These options change page appearance only. They do not change Quran text, recitation, script edition or riwayah.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">          <button key="classic" type="button" onClick={() => setMushafPageStyle('classic')} aria-pressed={mushafPageStyle === 'classic'} className={`rounded-xl border p-3 text-left text-xs font-semibold transition ${mushafPageStyle === 'classic' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100' : 'border-stone-200 text-stone-700 dark:border-stone-700 dark:text-stone-200'}`}><span className="mb-2 block h-7 rounded-lg border border-current/20 bg-gradient-to-r from-amber-50 to-emerald-100 dark:from-stone-800 dark:to-emerald-950" />Classic</button>
          <button key="madinah" type="button" onClick={() => setMushafPageStyle('madinah')} aria-pressed={mushafPageStyle === 'madinah'} className={`rounded-xl border p-3 text-left text-xs font-semibold transition ${mushafPageStyle === 'madinah' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100' : 'border-stone-200 text-stone-700 dark:border-stone-700 dark:text-stone-200'}`}><span className="mb-2 block h-7 rounded-lg border border-current/20 bg-gradient-to-r from-amber-50 to-emerald-100 dark:from-stone-800 dark:to-emerald-950" />Madinah page</button>
          <button key="indopak" type="button" onClick={() => setMushafPageStyle('indopak')} aria-pressed={mushafPageStyle === 'indopak'} className={`rounded-xl border p-3 text-left text-xs font-semibold transition ${mushafPageStyle === 'indopak' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100' : 'border-stone-200 text-stone-700 dark:border-stone-700 dark:text-stone-200'}`}><span className="mb-2 block h-7 rounded-lg border border-current/20 bg-gradient-to-r from-amber-50 to-emerald-100 dark:from-stone-800 dark:to-emerald-950" />Indo-Pak frame</button>
          <button key="minimal" type="button" onClick={() => setMushafPageStyle('minimal')} aria-pressed={mushafPageStyle === 'minimal'} className={`rounded-xl border p-3 text-left text-xs font-semibold transition ${mushafPageStyle === 'minimal' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100' : 'border-stone-200 text-stone-700 dark:border-stone-700 dark:text-stone-200'}`}><span className="mb-2 block h-7 rounded-lg border border-current/20 bg-gradient-to-r from-amber-50 to-emerald-100 dark:from-stone-800 dark:to-emerald-950" />Minimal</button>
          <button key="parchment" type="button" onClick={() => setMushafPageStyle('parchment')} aria-pressed={mushafPageStyle === 'parchment'} className={`rounded-xl border p-3 text-left text-xs font-semibold transition ${mushafPageStyle === 'parchment' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100' : 'border-stone-200 text-stone-700 dark:border-stone-700 dark:text-stone-200'}`}><span className="mb-2 block h-7 rounded-lg border border-current/20 bg-gradient-to-r from-amber-50 to-emerald-100 dark:from-stone-800 dark:to-emerald-950" />Parchment</button>
          <button key="sepia" type="button" onClick={() => setMushafPageStyle('sepia')} aria-pressed={mushafPageStyle === 'sepia'} className={`rounded-xl border p-3 text-left text-xs font-semibold transition ${mushafPageStyle === 'sepia' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100' : 'border-stone-200 text-stone-700 dark:border-stone-700 dark:text-stone-200'}`}><span className="mb-2 block h-7 rounded-lg border border-current/20 bg-gradient-to-r from-amber-50 to-emerald-100 dark:from-stone-800 dark:to-emerald-950" />Sepia</button>
          <button key="night" type="button" onClick={() => setMushafPageStyle('night')} aria-pressed={mushafPageStyle === 'night'} className={`rounded-xl border p-3 text-left text-xs font-semibold transition ${mushafPageStyle === 'night' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100' : 'border-stone-200 text-stone-700 dark:border-stone-700 dark:text-stone-200'}`}><span className="mb-2 block h-7 rounded-lg border border-current/20 bg-gradient-to-r from-amber-50 to-emerald-100 dark:from-stone-800 dark:to-emerald-950" />Night</button>
          <button key="emerald" type="button" onClick={() => setMushafPageStyle('emerald')} aria-pressed={mushafPageStyle === 'emerald'} className={`rounded-xl border p-3 text-left text-xs font-semibold transition ${mushafPageStyle === 'emerald' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100' : 'border-stone-200 text-stone-700 dark:border-stone-700 dark:text-stone-200'}`}><span className="mb-2 block h-7 rounded-lg border border-current/20 bg-gradient-to-r from-amber-50 to-emerald-100 dark:from-stone-800 dark:to-emerald-950" />Emerald</button>
          <button key="blue" type="button" onClick={() => setMushafPageStyle('blue')} aria-pressed={mushafPageStyle === 'blue'} className={`rounded-xl border p-3 text-left text-xs font-semibold transition ${mushafPageStyle === 'blue' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100' : 'border-stone-200 text-stone-700 dark:border-stone-700 dark:text-stone-200'}`}><span className="mb-2 block h-7 rounded-lg border border-current/20 bg-gradient-to-r from-amber-50 to-emerald-100 dark:from-stone-800 dark:to-emerald-950" />Soft blue</button>
          <button key="high-contrast" type="button" onClick={() => setMushafPageStyle('high-contrast')} aria-pressed={mushafPageStyle === 'high-contrast'} className={`rounded-xl border p-3 text-left text-xs font-semibold transition ${mushafPageStyle === 'high-contrast' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100' : 'border-stone-200 text-stone-700 dark:border-stone-700 dark:text-stone-200'}`}><span className="mb-2 block h-7 rounded-lg border border-current/20 bg-gradient-to-r from-amber-50 to-emerald-100 dark:from-stone-800 dark:to-emerald-950" />High contrast</button>
        </div>
      </section>

      {/* Reciter Picker */}
      <div id="settings-reciter" className="scroll-mt-4 bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 space-y-4">
        <label className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-emerald-600" />
          <span>{translateUi(uiLanguage, 'reciter')}</span>
        </label>

        <div className="space-y-2">
          {RECITERS.map((r) => {
            const isSelected = selectedReciterId === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedReciterId(r.id)}
                className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 hover:border-emerald-400'
                }`}
              >
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-white text-sm">
                    {uiLanguage === 'bn' ? r.nameBn : r.nameEn}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {r.nameEn} • {r.subtext}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-white">অডিও প্লেব্যাক সেটিংস</h3>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">তিলাওয়াতের গতি এবং আয়াত শেষে পরবর্তী আয়াত চালানোর নিয়ম নির্ধারণ করুন।</p>
        </div>
        <label className="flex items-center justify-between gap-4 rounded-xl bg-stone-50 p-3 dark:bg-stone-800">
          <span><span className="block text-sm font-semibold text-stone-900 dark:text-white">তিলাওয়াতের গতি</span><span className="text-xs text-stone-500">ধীর বা স্বাভাবিক গতিতে শুনুন</span></span>
          <select value={audioPlaybackSpeed} onChange={(event) => setAudioPlaybackSpeed(Number(event.target.value))} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-bold text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-white" aria-label="তিলাওয়াতের গতি">
            <option value="0.75">০.৭৫x</option><option value="0.9">০.৯x</option><option value="1">১.০x</option><option value="1.1">১.১x</option><option value="1.25">১.২৫x</option><option value="1.5">১.৫x</option>
          </select>
        </label>
        <div className="flex items-center justify-between gap-4 rounded-xl bg-stone-50 p-3 dark:bg-stone-800">
          <span><span className="block text-sm font-semibold text-stone-900 dark:text-white">পরবর্তী আয়াত স্বয়ংক্রিয় চালু</span><span className="text-xs text-stone-500">একটি আয়াত শেষ হলে পরেরটি চালু হবে</span></span>
          <button type="button" role="switch" aria-checked={autoPlayNextAyah} onClick={() => setAutoPlayNextAyah((value) => !value)} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${autoPlayNextAyah ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${autoPlayNextAyah ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </section>

      {/* Visibility Toggles */}
      <div id="settings-reading" className="scroll-mt-4 bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 space-y-3">
        <label className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-600" />
          <span>{translateUi(uiLanguage, 'visibilityOptions')}</span>
        </label>

        <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800">
          <div>
            <span className="font-semibold text-xs text-stone-900 dark:text-white">
              Transliteration
            </span>
            <p className="text-[11px] text-stone-500">Show transliteration when available</p>
          </div>
          <button
            onClick={() => setShowTransliteration(!showTransliteration)}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
              showTransliteration ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
            }`}
            aria-label="Toggle transliteration"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                showTransliteration ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800">
          <div>
            <span className="font-semibold text-xs text-stone-900 dark:text-white">
              {translateUi(uiLanguage, 'translation')}
            </span>
            <p className="text-[11px] text-stone-500">Display the selected translation below each ayah</p>
          </div>
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
              showTranslation ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
            }`}
            aria-label="Toggle translation"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                showTranslation ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Keep screen awake */}
      <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-white via-amber-50/70 to-emerald-50/80 p-5 shadow-sm dark:border-emerald-900 dark:from-stone-900 dark:via-stone-900 dark:to-emerald-950/50 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-stone-900 dark:text-white">{translateUi(uiLanguage, 'screenAwake')}</p>
            <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">{translateUi(uiLanguage, 'screenAwakeDescription')}</p>
          </div>
          <button type="button" role="switch" aria-checked={keepScreenAwake} onClick={() => setKeepScreenAwake((value) => !value)} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${keepScreenAwake ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${keepScreenAwake ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        {wakeLockError && <p className="text-[11px] text-amber-700 dark:text-amber-300">{wakeLockError}</p>}
      </div>

      <div id="donation-card" className="scroll-mt-4"><DonationCard /></div>

      {/* About Box */}
      <section id="settings-about" className="scroll-mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-xs text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 space-y-2">
        <h4 className="text-sm font-bold text-stone-900 dark:text-white">{translateUi(uiLanguage, 'aboutApp')}</h4>
        <p className="leading-relaxed">{translateUi(uiLanguage, 'aboutDescription')}</p>
        <p className="border-t border-stone-200 pt-2 text-stone-500 dark:border-stone-800 dark:text-stone-400">{translateUi(uiLanguage, 'sourceNote')}</p>
      </section>
    </div>
  );
};
