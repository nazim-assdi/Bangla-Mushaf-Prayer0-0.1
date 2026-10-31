import React, { useState, useMemo } from 'react';
import { X, Search, Sparkles, MapPin, Hash, BookOpen } from 'lucide-react';
import { SURAH_LIST, JUZ_LIST, SurahMeta } from '../data/quranMetadata';
import { toBanglaNumber, toEnglishNumber, toArabicNumber } from '../utils/banglaNumbers';

interface SurahDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSurahId: number;
  onSelectSurah: (surahId: number, targetAyah?: number) => void;
}

type TabType = 'all' | 'popular' | 'makki' | 'madani' | 'juz';

export const SurahDrawer: React.FC<SurahDrawerProps> = ({
  isOpen,
  onClose,
  currentSurahId,
  onSelectSurah,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');

  // Filter surahs based on tab & search
  const filteredSurahs = useMemo(() => {
    let list = SURAH_LIST;

    if (activeTab === 'popular') {
      list = list.filter((s) => s.isPopular);
    } else if (activeTab === 'makki') {
      list = list.filter((s) => s.revelationPlace === 'makkah');
    } else if (activeTab === 'madani') {
      list = list.filter((s) => s.revelationPlace === 'madinah');
    }

    if (!searchQuery.trim()) return list;

    const query = searchQuery.trim().toLowerCase();
    const queryEnNum = toEnglishNumber(query);

    return list.filter((s) => {
      const matchId = s.id.toString() === query || s.id.toString() === queryEnNum;
      const matchBn = s.nameBengali.toLowerCase().includes(query) || s.bengaliMeaning.toLowerCase().includes(query);
      const matchEn = s.nameEnglish.toLowerCase().includes(query) || s.englishMeaning.toLowerCase().includes(query);
      const matchAr = s.nameArabic.includes(query);
      return matchId || matchBn || matchEn || matchAr;
    });
  }, [activeTab, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-label="সূরা ও পারা নির্বাচন করুন"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-stone-50 dark:bg-stone-900 h-full flex flex-col shadow-2xl border-l border-emerald-800/20 dark:border-stone-800 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 bg-emerald-900 text-white border-b border-emerald-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold font-bangla text-amber-300">সূরা ও পারা নির্বাচন</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-100 transition-colors"
              aria-label="তালিকা বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-emerald-300 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="সূরা খুঁজুন (যেমন: ফাতিহা, বাকারা, ৩৬)..."
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-emerald-950/70 border border-emerald-700/60 text-white placeholder-emerald-300/60 text-sm font-bangla focus:outline-none focus:ring-2 focus:ring-amber-400"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-xs text-emerald-300 hover:text-white"
                aria-label="অনুসন্ধান মুছুন"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-xs font-bangla scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-md shrink-0 transition-colors ${
                activeTab === 'all'
                  ? 'bg-amber-400 text-emerald-950 font-bold'
                  : 'bg-emerald-800/80 text-emerald-100 hover:bg-emerald-700'
              }`}
            >
              সকল ১১৪ সূরা
            </button>
            <button
              onClick={() => setActiveTab('popular')}
              className={`px-2.5 py-1 rounded-md shrink-0 transition-colors flex items-center gap-1 ${
                activeTab === 'popular'
                  ? 'bg-amber-400 text-emerald-950 font-bold'
                  : 'bg-emerald-800/80 text-emerald-100 hover:bg-emerald-700'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              জনপ্রিয় সূরা
            </button>
            <button
              onClick={() => setActiveTab('juz')}
              className={`px-2.5 py-1 rounded-md shrink-0 transition-colors ${
                activeTab === 'juz'
                  ? 'bg-amber-400 text-emerald-950 font-bold'
                  : 'bg-emerald-800/80 text-emerald-100 hover:bg-emerald-700'
              }`}
            >
              ৩০ পারা
            </button>
            <button
              onClick={() => setActiveTab('makki')}
              className={`px-2.5 py-1 rounded-md shrink-0 transition-colors ${
                activeTab === 'makki'
                  ? 'bg-amber-400 text-emerald-950 font-bold'
                  : 'bg-emerald-800/80 text-emerald-100 hover:bg-emerald-700'
              }`}
            >
              মাক্কী
            </button>
            <button
              onClick={() => setActiveTab('madani')}
              className={`px-2.5 py-1 rounded-md shrink-0 transition-colors ${
                activeTab === 'madani'
                  ? 'bg-amber-400 text-emerald-950 font-bold'
                  : 'bg-emerald-800/80 text-emerald-100 hover:bg-emerald-700'
              }`}
            >
              মাদানী
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {activeTab === 'juz' ? (
            /* 30 Juz List */
            <div className="space-y-2">
              {JUZ_LIST.map((juz) => (
                <button
                  key={juz.juzNumber}
                  onClick={() => {
                    onSelectSurah(juz.startSurahId, juz.startAyah);
                    onClose();
                  }}
                  className="w-full p-3 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 hover:border-emerald-500 hover:shadow-md transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center font-bangla text-sm">
                      {toBanglaNumber(juz.juzNumber)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-900 dark:text-white font-bangla text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {juz.nameBengali}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-bangla">
                        শুরু: সূরা {toBanglaNumber(juz.startSurahId)}, আয়াত ﴿{toArabicNumber(juz.startAyah)}﴾
                      </p>
                    </div>
                  </div>
                  <span className="font-arabic text-lg text-emerald-700 dark:text-emerald-400">
                    {juz.nameArabic}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            /* Surahs List */
            <>
              {filteredSurahs.length === 0 ? (
                <div className="p-8 text-center text-stone-500 dark:text-stone-400 font-bangla">
                  <p className="text-base font-semibold">কোনো সূরা খুঁজে পাওয়া যায়নি</p>
                  <p className="text-xs mt-1">দয়া করে নাম অথবা নম্বর সঠিকভাবে লিখুন</p>
                </div>
              ) : (
                filteredSurahs.map((surah) => {
                  const isSelected = surah.id === currentSurahId;
                  return (
                    <button
                      key={surah.id}
                      onClick={() => {
                        onSelectSurah(surah.id);
                        onClose();
                      }}
                      className={`w-full p-3 rounded-xl transition-all flex items-center justify-between text-left border ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500 shadow-xs'
                          : 'bg-white dark:bg-stone-800/80 border-stone-200 dark:border-stone-700/80 hover:border-emerald-400 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Surah Number Badge */}
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm font-bangla shrink-0 ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200'
                          }`}
                        >
                          {toBanglaNumber(surah.id)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4
                              className={`font-semibold font-bangla text-sm ${
                                isSelected
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : 'text-stone-900 dark:text-stone-100'
                              }`}
                            >
                              {surah.nameBengali}
                            </h4>
                            <span className="text-[10px] text-stone-400 dark:text-stone-500">
                              ({surah.nameEnglish})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-bangla mt-0.5">
                            <span className="text-stone-600 dark:text-stone-300 font-medium">
                              {surah.bengaliMeaning}
                            </span>
                            <span>•</span>
                            <span>{toBanglaNumber(surah.versesCount)} আয়াত</span>
                            <span>•</span>
                            <span className="text-[11px] px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-700/60 text-stone-600 dark:text-stone-300">
                              {surah.revelationPlace === 'makkah' ? 'মাক্কী' : 'মাদানী'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Arabic Calligraphy Name */}
                      <span className="font-arabic text-xl text-emerald-800 dark:text-emerald-300 text-right pr-1">
                        {surah.nameArabic}
                      </span>
                    </button>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
