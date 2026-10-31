import React from 'react';
import { Type, Volume2, Eye, Info, Sparkles, Moon, Sun, Check } from 'lucide-react';
import { RECITERS } from '../services/quranApi';
import { toBanglaNumber } from '../utils/banglaNumbers';
import { ThemeMode } from './Navbar';

interface SettingsModalProps {
  arabicFontSize: number;
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
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  arabicFontSize,
  setArabicFontSize,
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
}) => {
  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-6 pb-28 font-bangla space-y-6">
      <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
        <h2 className="text-xl font-bold text-stone-900 dark:text-white">
          অ্যাপ ও তিলাওয়াত সেটিংস
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          আপনার পছন্দমত ফন্ট সাইজ, অডিও তেলাওয়াতকারী ও ডিসপ্লে কাস্টমাইজ করুন
        </p>
      </div>

      {/* Theme Selection */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 space-y-3">
        <label className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>কালার থিম (দৃশ্যরূপ)</span>
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
            <span>বাংলা অনুবাদের ফন্ট সাইজ:</span>
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
            aria-label="বাংলা ফন্ট সাইজ"
          />
          <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-xl text-center">
            <span className="font-bangla text-stone-800 dark:text-stone-200" style={{ fontSize: `${banglaFontSize}px` }}>
              সমস্ত প্রশংসা বিশ্বজগতের প্রতিপালক আল্লাহরই জন্য।
            </span>
          </div>
        </div>
      </div>

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
              বাংলা উচ্চারণ (Transliteration)
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
