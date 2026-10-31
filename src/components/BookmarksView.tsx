import React, { useState } from 'react';
import { Bookmark, BookOpen, Heart, Sparkles, ChevronRight, Share2, Trash2 } from 'lucide-react';
import { toBanglaNumber, toArabicNumber } from '../utils/banglaNumbers';
import { SURAH_LIST } from '../data/quranMetadata';
import { UiLanguage, formatUiNumber, translateUi } from '../services/i18n';

interface BookmarkItem {
  verseKey: string;
  surahNameBn: string;
  ayahNumber: number;
  addedAt: string;
}

interface BookmarksViewProps {
  bookmarks: BookmarkItem[];
  onRemoveBookmark: (verseKey: string) => void;
  onNavigateToAyah: (surahId: number, ayahNumber: number) => void;
  lastRead: { surahId: number; ayahNumber: number; surahNameBn: string } | null;
  uiLanguage: UiLanguage;
}

const RABBANA_DUAS = [
  {
    id: 1,
    arabic: 'رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا حَسَنَةًۭ وَفِى ٱلْـَٔاخِرَةِ حَسَنَةًۭ وَقِنَا عَذَابَ ٱلنَّارِ',
    banglaMeaning: 'হে আমাদের প্রতিপালক! আমাদের ইহকালে কল্যাণ দিন এবং পরকালেও কল্যাণ দিন এবং আমাদের জাহান্নামের আযাব থেকে রক্ষা করুন।',
    reference: 'সূরা আল-বাকারা, ২:২০১',
    surahId: 2,
    ayahNumber: 201,
  },
  {
    id: 2,
    arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ ٱلْوَهَّابُ',
    banglaMeaning: 'হে আমাদের পালনকর্তা! সরল পথ প্রদর্শনের পর আমাদের অন্তরকে সত্যলঙ্ঘনকারী করবেন না এবং আপনার নিকট থেকে আমাদের বিশেষ রহমত দান করুন। নিশ্চয় আপনিই মহাদাতা।',
    reference: 'সূরা আলে-ইমরান, ৩:৮',
    surahId: 3,
    ayahNumber: 8,
  },
  {
    id: 3,
    arabic: 'رَبَّنَا ظَلَمْنَآ أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ ٱلْخَـٰسِرِينَ',
    banglaMeaning: 'হে আমাদের প্রতিপালক! আমরা নিজেদের ওপর অবিচার করেছি; আপনি যদি আমাদের ক্ষমা না করেন এবং আমাদের প্রতি দয়া না করেন, তবে অবশ্যই আমরা ক্ষতিগ্রস্তদের অন্তর্ভুক্ত হয়ে যাব।',
    reference: 'সূরা আল-আরাফ, ৭:২৩',
    surahId: 7,
    ayahNumber: 23,
  },
  {
    id: 4,
    arabic: 'رَبِّ ٱجْعَلْنِى مُقِيمَ ٱلصَّلَوٰةِ وَمِن ذُرِّيَّتِى ۚ رَبَّنَا وَتَقَبَّلْ دُعَآءِ',
    banglaMeaning: 'হে আমার পালনকর্তা! আমাকে নামাজ কায়েমকারী করুন এবং আমার সন্তানদের মধ্য থেকেও। হে আমাদের প্রতিপালক! আমার দোয়া কবুল করুন।',
    reference: 'সূরা ইবরাহীম, ১৪:৪০',
    surahId: 14,
    ayahNumber: 40,
  },
  {
    id: 5,
    arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَٰجِنَا وَذُرِّيَّـٰتِنَا قُرَّةَ أَعْيُنٍۢ وَٱجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    banglaMeaning: 'হে আমাদের প্রতিপালক! আমাদের স্ত্রী ও সন্তানদের মধ্য থেকে আমাদের চক্ষুজুড়ানো নয়নমণি দান করুন এবং আমাদের মুত্তাকীদের নেতা করুন।',
    reference: 'সূরা আল-ফুরকান, ২৫:৭৪',
    surahId: 25,
    ayahNumber: 74,
  },
];

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  onRemoveBookmark,
  onNavigateToAyah,
  lastRead,
  uiLanguage,
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'duas' | 'recommended'>('bookmarks');

  const recommendedSurahs = [
    { id: 67, nameBn: 'সূরা আল-মুলক', note: 'প্রতি রাতে ঘুমানোর পূর্বে তিলাওয়াত (কবরের আযাব হতে রক্ষাকারী)' },
    { id: 18, nameBn: 'সূরা আল-কাহফ', note: 'প্রতি জুমুআর দিনে পাঠের বিশেষ ফজিলত' },
    { id: 36, nameBn: 'সূরা ইয়াসীন', note: 'কুরআনের হৃৎপিণ্ড — প্রতিদিন সকালে তিলাওয়াত' },
    { id: 55, nameBn: 'সূরা আর-রহমান', note: 'কুরআনের সৌন্দর্য — অসীম নিয়ামতের কৃতজ্ঞতা' },
    { id: 56, nameBn: 'সূরা আল-ওয়াক্বিয়া', note: 'মাগরিব বা এশার পর পাঠের বিশেষ বারাকাহ' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 pb-28 font-bangla space-y-6">
      {/* Last Read Continue Bar */}
      {lastRead && (
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-2xl p-4 sm:p-5 shadow-md flex items-center justify-between gap-4 border border-emerald-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-emerald-200">{translateUi(uiLanguage, 'readingProgress')}</p>
              <h3 className="text-base sm:text-lg font-bold text-amber-300">
                Surah {lastRead.surahNameBn} — Ayah ﴿{toArabicNumber(lastRead.ayahNumber)}﴾
              </h3>
            </div>
          </div>

          <button
            onClick={() => onNavigateToAyah(lastRead.surahId, lastRead.ayahNumber)}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-transform hover:scale-105 shadow-sm"
          >
            <span>Continue reading</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'bookmarks'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>বুকমার্ক করা আয়াত ({formatUiNumber(bookmarks.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('duas')}
          className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'duas'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>কুরআনের রাব্বানা দোয়া</span>
        </button>

        <button
          onClick={() => setActiveTab('recommended')}
          className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'recommended'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          <span>দৈনিক গুরুত্বপূর্ণ সূরা</span>
        </button>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === 'bookmarks' ? (
        <div>
          {bookmarks.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 mx-auto flex items-center justify-center">
                <Bookmark className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-stone-800 dark:text-stone-200">
                কোনো বুকমার্ক সংরক্ষিত নেই
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                মুসহাফ পড়ার সময় যেকোনো আয়াতের ওপরের বুকমার্ক আইকনে ক্লিক করে সংরক্ষণ করতে পারবেন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {bookmarks.map((bm) => {
                const [sId, aNum] = bm.verseKey.split(':').map(Number);
                return (
                  <div
                    key={bm.verseKey}
                    className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between gap-3 group hover:border-emerald-500 transition-all"
                  >
                    <div
                      onClick={() => onNavigateToAyah(sId, aNum)}
                      className="cursor-pointer flex items-center gap-3 flex-1"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-arabic font-bold text-base">
                        {toArabicNumber(aNum)}
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 dark:text-white text-sm group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          সূরা {bm.surahNameBn}
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          আয়াত ﴿{toArabicNumber(aNum)}﴾
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onNavigateToAyah(sId, aNum)}
                        className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors"
                        title="পড়ুন"
                        aria-label="পড়ুন"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemoveBookmark(bm.verseKey)}
                        className="p-2 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="বুকমার্ক মুছুন"
                        aria-label="বুকমার্ক মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === 'duas' ? (
        <div className="space-y-4">
          {RABBANA_DUAS.map((dua) => (
            <div
              key={dua.id}
              className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-400 font-semibold border-b border-stone-100 dark:border-stone-800 pb-2">
                <span>দোয়া নম্বর: {formatUiNumber(dua.id)}</span>
                <span className="text-stone-500 dark:text-stone-400">{dua.reference}</span>
              </div>

              <p className="font-arabic text-xl sm:text-2xl text-right text-emerald-950 dark:text-emerald-200 leading-loose" dir="rtl">
                {dua.arabic}
              </p>

              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-bangla-serif leading-relaxed">
                <strong className="text-emerald-800 dark:text-emerald-400">অর্থ:</strong> {uiLanguage === 'bn' ? dua.banglaMeaning : translateUi(uiLanguage, 'noTranslationAvailable')}
              </p>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => onNavigateToAyah(dua.surahId, dua.ayahNumber)}
                  className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-bold"
                >
                  <span>কুরআনে সরাসরি দেখুন</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Recommended Daily Surahs */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recommendedSurahs.map((rec) => {
            const surah = SURAH_LIST.find((s) => s.id === rec.id)!;
            return (
              <div
                key={rec.id}
                onClick={() => onNavigateToAyah(rec.id, 1)}
                className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                      সূরা {formatUiNumber(rec.id)}
                    </span>
                    <span className="font-arabic text-xl text-emerald-800 dark:text-emerald-300">
                      {surah.nameArabic}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-stone-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {uiLanguage === 'bn' ? rec.nameBn : surah.nameEnglish}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    {surah.bengaliMeaning} • {formatUiNumber(surah.versesCount)} আয়াত
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                  <span className="text-amber-700 dark:text-amber-300 font-medium">
                    {uiLanguage === 'bn' ? rec.note : ''}
                  </span>
                  <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
