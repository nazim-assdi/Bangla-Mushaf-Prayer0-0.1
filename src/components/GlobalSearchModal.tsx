import React, { useState } from 'react';
import { Search, X, BookOpen, ChevronRight } from 'lucide-react';
import { SURAH_LIST, SurahMeta } from '../data/quranMetadata';
import { toBanglaNumber, toEnglishNumber, toArabicNumber } from '../utils/banglaNumbers';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSurahAndAyah: (surahId: number, ayahNumber?: number) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectSurahAndAyah,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();
  const engNum = toEnglishNumber(trimmed);

  // Filter surahs or match ayah syntax (e.g. "2:255" or "2 255" or "surah 36")
  const results = SURAH_LIST.filter((s) => {
    if (!trimmed) return false;
    const matchId = s.id.toString() === trimmed || s.id.toString() === engNum;
    const matchBn = s.nameBengali.toLowerCase().includes(trimmed) || s.bengaliMeaning.toLowerCase().includes(trimmed);
    const matchEn = s.nameEnglish.toLowerCase().includes(trimmed) || s.englishMeaning.toLowerCase().includes(trimmed);
    const matchAr = s.nameArabic.includes(trimmed);
    return matchId || matchBn || matchEn || matchAr;
  });

  // Check if query is verse syntax like "2:255"
  let parsedSurahId = 0;
  let parsedAyahNum = 0;
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':');
    parsedSurahId = Number(parts[0]);
    parsedAyahNum = Number(parts[1]);
  } else if (trimmed.includes(' ')) {
    const parts = trimmed.split(/\s+/);
    if (!isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
      parsedSurahId = Number(parts[0]);
      parsedAyahNum = Number(parts[1]);
    }
  }

  const directSurahMatch = parsedSurahId >= 1 && parsedSurahId <= 114 ? SURAH_LIST.find((s) => s.id === parsedSurahId) : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-3"
      role="dialog"
      aria-modal="true"
      aria-label="গ্লোবাল কুরআন অনুসন্ধান"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl overflow-hidden border border-emerald-800/30 dark:border-stone-800 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 bg-emerald-900 text-white flex items-center gap-3 border-b border-emerald-800">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="সূরা খুঁজুন (যেমন: বাকারা, ইয়াসীন, আল-মূলক বা ২:২৫৫)..."
            className="w-full bg-transparent text-white placeholder-emerald-300/70 text-sm sm:text-base font-bangla focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-emerald-200 hover:text-white"
              aria-label="মুছে ফেলুন"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-2 font-bangla">
          {!query.trim() ? (
            <div className="py-12 text-center text-stone-500 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto opacity-40 text-emerald-600" />
              <p className="text-sm">যেকোনো সূরার নাম বা নম্বর লিখে খুঁজুন</p>
              <p className="text-xs text-stone-400">উদাহরণ: "ফাতিহা", "18", "2:255" (সূরা বাকারা আয়াত ২৫৫)</p>
            </div>
          ) : (
            <>
              {/* Direct Verse Jump Result if formatted like 2:255 */}
              {directSurahMatch && !isNaN(parsedAyahNum) && parsedAyahNum > 0 && (
                <div
                  onClick={() => {
                    onSelectSurahAndAyah(parsedSurahId, parsedAyahNum);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-400 cursor-pointer hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-400 text-emerald-950 font-bold flex items-center justify-center text-xs">
                      🔍
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 dark:text-white text-sm">
                        সরাসরি যান: সূরা {directSurahMatch.nameBengali} — আয়াত ﴿{toArabicNumber(parsedAyahNum)}﴾
                      </h4>
                      <p className="text-xs text-stone-500">আয়াত নম্বরে ঝাঁপ দিতে ক্লিক করুন</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-600" />
                </div>
              )}

              {results.length === 0 && !directSurahMatch ? (
                <div className="py-12 text-center text-stone-500">
                  <p className="text-sm font-semibold">কোনো ফলাফল পাওয়া যায়নি</p>
                  <p className="text-xs mt-1">বানান পরীক্ষা করে আবার চেষ্টা করুন</p>
                </div>
              ) : (
                results.map((surah) => (
                  <div
                    key={surah.id}
                    onClick={() => {
                      onSelectSurahAndAyah(surah.id);
                      onClose();
                    }}
                    className="p-3.5 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 hover:border-emerald-500 hover:shadow-xs cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-sm font-bangla">
                        {toBanglaNumber(surah.id)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-stone-900 dark:text-white text-sm group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            {surah.nameBengali} ({surah.nameEnglish})
                          </h4>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                          {surah.bengaliMeaning} • {toBanglaNumber(surah.versesCount)} আয়াত • {surah.revelationPlace === 'makkah' ? 'মাক্কী' : 'মাদানী'}
                        </p>
                      </div>
                    </div>

                    <span className="font-arabic text-xl text-emerald-800 dark:text-emerald-300">
                      {surah.nameArabic}
                    </span>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
