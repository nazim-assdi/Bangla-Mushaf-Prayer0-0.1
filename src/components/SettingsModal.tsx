import React, { useEffect, useState } from 'react';
import { Type, Volume2, Eye, Info, Sparkles, Moon, Sun, Check } from 'lucide-react';
import { RECITERS } from '../services/quranApi';
import { toBanglaNumber } from '../utils/banglaNumbers';
import { ThemeMode } from './Navbar';
import { OfflineNotesAccount } from './OfflineNotesAccount';
import { OfflineQuranDownload } from './OfflineQuranDownload';
import { UI_LANGUAGES, UiLanguage, translateUi } from '../services/i18n';
import { ARABIC_FONTS } from '../services/arabicFonts';

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
    const onVisibility = () => { if (document.visibilityState === 'visible' && !lock) void acquire(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      if (lock) void lock.release();
    };
  }, [keepScreenAwake]);

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-6 pb-28 font-bangla space-y-6">
      <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
        <h2 className="text-xl font-bold text-stone-900 dark:text-white">
          {translateUi(uiLanguage, 'settings')}
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          আপনার পছন্দমত ফন্ট সাইজ, অডিও তেলাওয়াতকারী ও ডিসপ্লে কাস্টমাইজ করুন
        </p>
      </div>

      <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-3">
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

      <OfflineNotesAccount />

      <OfflineQuranDownload uiLanguage={uiLanguage} />

      {/* Theme Selection */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 space-y-3">
        <label className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{translateUi(uiLanguage, 'theme')} (Display)</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('emerald')}
            className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              theme === 'emerald'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500 font-bold'
                : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-emerald-700 border border-emerald-500 shadow-xs" />
            <span className="text-xs">সবুজ মুসহাফ</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              theme === 'dark'
                ? 'border-emerald-500 bg-stone-800 text-white ring-2 ring-emerald-500 font-bold'
                : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-stone-950 border border-stone-700 shadow-xs" />
            <span className="text-xs">নাইট মোড</span>
          </button>

          <button
            onClick={() => setTheme('sepia')}
            className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              theme === 'sepia'
                ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500 font-bold'
                : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-[#f4ece1] border border-amber-300 shadow-xs" />
            <span className="text-xs">সেপিয়া পাতা</span>
          </button>

          <button
            onClick={() => setTheme('softblue')}
            className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              theme === 'softblue'
                ? 'border-cyan-500 bg-slate-800 text-cyan-200 ring-2 ring-cyan-400 font-bold'
                : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-slate-900 border border-cyan-500 shadow-xs" />
            <span className="text-xs">নরম নীল (Soft Blue)</span>
          </button>

          <button
            onClick={() => setTheme('eyecare')}
            className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              theme === 'eyecare'
                ? 'border-emerald-400 bg-[#1b2a22] text-[#d4ebd0] ring-2 ring-emerald-400 font-bold'
                : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-[#1b2a22] border border-emerald-400 shadow-xs" />
            <span className="text-xs">আইকেয়ার (Eye Care)</span>
          </button>
        </div>
      </div>

      {/* Font Size Adjusters */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 space-y-5">
        <label className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <Type className="w-4 h-4 text-emerald-600" />
          <span>ফন্ট সাইজ পরিবর্তন</span>
        </label>

        {/* Arabic Font Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-stone-600 dark:text-stone-400">
            <span>আরবি ফন্ট সাইজ:</span>
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
              সমস্ত প্রশংসা বিশ্বজগতের প্রতিপালক আল্লাহরই জন্য।
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
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 space-y-4">
        <label className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-emerald-600" />
          <span>পছন্দের ক্বারী (তেলাওয়াতকারী)</span>
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
                    {r.nameBn}
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

      {/* Visibility Toggles */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 space-y-3">
        <label className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-600" />
          <span>দৃশ্যমান অপশনসমূহ</span>
        </label>

        <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800">
          <div>
            <span className="font-semibold text-xs text-stone-900 dark:text-white">
              Transliteration
            </span>
            <p className="text-[11px] text-stone-500">শব্দে শব্দে বাংলা উচ্চারণ প্রদর্শন</p>
          </div>
          <button
            onClick={() => setShowTransliteration(!showTransliteration)}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
              showTransliteration ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
            }`}
            aria-label="বাংলা উচ্চারণ টগল"
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
              বাংলা পূর্ণ অনুবাদ
            </span>
            <p className="text-[11px] text-stone-500">আয়াতের নিচে পূর্ণ অনুবাদ প্রদর্শন</p>
          </div>
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
              showTranslation ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
            }`}
            aria-label="বাংলা অনুবাদ টগল"
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
            <p className="text-sm font-bold text-stone-900 dark:text-white">স্ক্রিন সবসময় চালু রাখুন</p>
            <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">চালু করলে কুরআন পড়ার সময় স্ক্রিন ঘুমাবে না। বন্ধ করলে স্বাভাবিক নিয়মে স্ক্রিন বন্ধ হবে।</p>
          </div>
          <button type="button" role="switch" aria-checked={keepScreenAwake} onClick={() => setKeepScreenAwake((value) => !value)} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${keepScreenAwake ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${keepScreenAwake ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        {wakeLockError && <p className="text-[11px] text-amber-700 dark:text-amber-300">{wakeLockError}</p>}
      </div>

      {/* About Box */}
      <div className="bg-emerald-50 dark:bg-stone-900 rounded-2xl p-5 border border-emerald-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 space-y-2">
        <h4 className="font-bold text-stone-900 dark:text-white text-sm">
          কুরআনুল কারীম (বাংলা শব্দে শব্দে মুসহাফ)
        </h4>
        <p className="leading-relaxed">
          এই অ্যাপ্লিকেশনটি বাংলাভাষী মুসলিমদের জন্য শব্দে শব্দে কুরআনের অর্থ ও উচ্চারণ শিক্ষা, উচ্চমানের অডিও তিলাওয়াত, বহুভাষিক প্রামাণ্য তাফসীর এবং বাংলাদেশের ৬৪ জেলার নির্ভুল নামাজের সময় ও কিবলা কম্পাস প্রদানের উদ্দেশ্যে তৈরি করা হয়েছে।
        </p>
        <p className="text-stone-400 pt-1">
          কুরআন ডাটা: Quran.com API v4 এবং তাফসীর ইবনে কাসীর।
        </p>
      </div>
    </div>
  );
};
