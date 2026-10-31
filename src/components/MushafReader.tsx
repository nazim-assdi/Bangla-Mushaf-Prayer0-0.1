import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  Volume2,
  BookOpen,
  Bookmark,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Sparkles,
  Globe,
} from 'lucide-react';
import { QuranAyah, QuranWord } from '../data/quranSampleData';
import { SURAH_LIST } from '../data/quranMetadata';
import { RECITERS, getBundledTafsir } from '../services/quranApi';
import { QURAN_LANGUAGES, QuranLanguage, fetchVersesByLanguage } from '../services/multiLangQuran';
import { toBanglaNumber, toArabicNumber } from '../utils/banglaNumbers';
import { TafsirModal } from './TafsirModal';
import { AyahStudyTools } from './AyahStudyTools';
import { UiLanguage, translateUi } from '../services/i18n';

export type ViewMode = 'wbw' | 'verse' | 'mushaf';

interface MushafReaderProps {
  surahId: number;
  onSelectSurah: (id: number) => void;
  onOpenSurahList: () => void;
  bookmarks: string[];
  onToggleBookmark: (verseKey: string, surahNameBn: string, ayahNumber: number) => void;
  arabicFontSize: number;
  banglaFontSize: number;
  showTransliteration: boolean;
  showTranslation: boolean;
  selectedReciterId: string;
  onSelectReciter: (id: string) => void;
  currentLanguage: QuranLanguage;
  onSelectLanguage: (lang: QuranLanguage) => void;
  uiLanguage: UiLanguage;
}

export const MushafReader: React.FC<MushafReaderProps> = ({
  surahId,
  onSelectSurah,
  onOpenSurahList,
  bookmarks,
  onToggleBookmark,
  arabicFontSize,
  banglaFontSize,
  showTransliteration,
  showTranslation,
  selectedReciterId,
  onSelectReciter,
  currentLanguage,
  onSelectLanguage,
  uiLanguage,
}) => {
  const [ayahs, setAyahs] = useState<QuranAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('wbw');

  // Tafsir modal state
  const [tafsirAyah, setTafsirAyah] = useState<QuranAyah | null>(null);
  const [isTafsirOpen, setIsTafsirOpen] = useState(false);

  // Audio player state
  const [playingAyahKey, setPlayingAyahKey] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordId, setActiveWordId] = useState<number | null>(null);
  const [hifzRepeatCount, setHifzRepeatCount] = useState<number>(1);
  const [currentRepeat, setCurrentRepeat] = useState<number>(1);
  const [copiedAyahKey, setCopiedAyahKey] = useState<string | null>(null);
  const [studyRecords, setStudyRecords] = useState<Record<string, { read: boolean; note: string }>>({});
  const [readerZoom, setReaderZoom] = useState(1);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const pinchStartRef = useRef<{ distance: number; zoom: number } | null>(null);
  const getTouchDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const studyStorageKey = 'mushaf_ayah_study_v1';

  useEffect(() => {
    try {
      const stored = localStorage.getItem(studyStorageKey);
      setStudyRecords(stored ? JSON.parse(stored) : {});
    } catch (error) {
      console.warn('Could not restore reading notes:', error);
      setStudyRecords({});
    }
  }, [studyStorageKey]);

  const updateStudyRecord = (verseKey: string, patch: Partial<{ read: boolean; note: string }>) => {
    setStudyRecords((previous) => {
      const next = { ...previous, [verseKey]: { read: previous[verseKey]?.read ?? false, note: previous[verseKey]?.note ?? '', ...patch } };
      try { localStorage.setItem(studyStorageKey, JSON.stringify(next)); } catch (error) { console.warn('Could not save reading notes:', error); }
      return next;
    });
  };

  const readCount = ayahs.filter((ayah) => studyRecords[ayah.verseKey]?.read).length;

  const mushafPages = useMemo(() => {
    const pages = new Map<number, QuranAyah[]>();
    ayahs.forEach((ayah) => {
      const page = ayah.pageNumber || 0;
      const existing = pages.get(page) || [];
      existing.push(ayah);
      pages.set(page, existing);
    });
    return Array.from(pages.entries()).sort((a, b) => a[0] - b[0]);
  }, [ayahs]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordAudioRef = useRef<HTMLAudioElement | null>(null);

  const currentSurah = SURAH_LIST.find((s) => s.id === surahId) || SURAH_LIST[0];

  // Fetch verses whenever surahId or language changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setPlayingAyahKey(null);
    }

    fetchVersesByLanguage(surahId, currentLanguage, selectedReciterId)
      .then((data) => {
        if (isMounted) {
          setAyahs(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load verses in language:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [surahId, currentLanguage, selectedReciterId]);

  // Handle play/pause of full Ayah audio
  const handlePlayAyah = (ayah: QuranAyah) => {
    if (playingAyahKey === ayah.verseKey && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    setPlayingAyahKey(ayah.verseKey);
    setCurrentRepeat(1);

    if (audioRef.current) {
      audioRef.current.src = ayah.audioUrl;
      audioRef.current.playbackRate = 1;
      audioRef.current.play().catch((e) => console.warn('Audio play error:', e));
      setIsPlaying(true);
    }
  };

  const handleAyahAudioEnded = () => {
    if (currentRepeat < hifzRepeatCount) {
      setCurrentRepeat((prev) => prev + 1);
      audioRef.current?.play();
      return;
    }

    if (playingAyahKey) {
      const currentIndex = ayahs.findIndex((a) => a.verseKey === playingAyahKey);
      if (currentIndex >= 0 && currentIndex < ayahs.length - 1) {
        const nextAyah = ayahs[currentIndex + 1];
        handlePlayAyah(nextAyah);
      } else {
        setIsPlaying(false);
        setPlayingAyahKey(null);
      }
    }
  };

  const handlePlayWord = (word: QuranWord, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!word.audioUrl) return;

    setActiveWordId(word.id);
    if (!wordAudioRef.current) {
      wordAudioRef.current = new Audio();
    }
    wordAudioRef.current.src = word.audioUrl;
    wordAudioRef.current.play().catch((err) => console.warn('Word audio error:', err));
    wordAudioRef.current.onended = () => {
      setActiveWordId(null);
    };
  };

  const handleCopyAyah = (ayah: QuranAyah) => {
    const text = `${ayah.textUthmani}\n\nTranslation (${currentLanguage.toUpperCase()}): ${
      ayah.translationBn || (ayah as any).translationEn || (ayah as any).translationHi || (ayah as any).translationUr || (ayah as any).translationTr || ''
    }\n\n[Surah ${currentSurah.nameBengali}: ${toArabicNumber(ayah.verseNumber)}]`;
    navigator.clipboard.writeText(text);
    setCopiedAyahKey(ayah.verseKey);
    setTimeout(() => setCopiedAyahKey(null), 2000);
  };

  const handlePrevSurah = () => {
    if (surahId > 1) onSelectSurah(surahId - 1);
  };

  const handleNextSurah = () => {
    if (surahId < 114) onSelectSurah(surahId + 1);
  };

  const handleReaderTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      touchStartRef.current = null;
      pinchStartRef.current = { distance: getTouchDistance(event.touches), zoom: readerZoom };
    } else if (event.touches.length === 1) {
      touchStartRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      pinchStartRef.current = null;
    }
  };
  const handleReaderTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2 && pinchStartRef.current) {
      event.preventDefault();
      const ratio = getTouchDistance(event.touches) / Math.max(1, pinchStartRef.current.distance);
      setReaderZoom(Math.min(1.6, Math.max(0.8, pinchStartRef.current.zoom * ratio)));
    }
  };
  const handleReaderTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length > 0) return;
    if (touchStartRef.current && event.changedTouches.length) {
      const dx = event.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = event.changedTouches[0].clientY - touchStartRef.current.y;
      if (Math.abs(dx) > 95 && Math.abs(dx) > Math.abs(dy) * 1.25) {
        if (dx < 0) handleNextSurah();
        else handlePrevSurah();
      }
    }
    touchStartRef.current = null;
    pinchStartRef.current = null;
  };

  // Helper to extract correct translation string based on current language
  const getAyahTranslation = (ayah: any) => {
    if (currentLanguage === 'en') return ayah.translationEn || ayah.translationBn;
    if (currentLanguage === 'hi') return ayah.translationHi || ayah.translationBn;
    if (currentLanguage === 'ur') return ayah.translationUr || ayah.translationBn;
    if (currentLanguage === 'tr') return ayah.translationTr || ayah.translationBn;
    return ayah.translationBn;
  };

  // Helper to extract word-by-word translation in selected language
  const getWordTranslation = (word: QuranWord): string => {
    if (currentLanguage === 'en') return word.translationEn || word.translationBn;
    if (currentLanguage === 'hi') return word.translationHi || word.translationEn || word.translationBn;
    if (currentLanguage === 'ur') return word.translationUr || word.translationEn || word.translationBn;
    if (currentLanguage === 'tr') return word.translationTr || word.translationEn || word.translationBn;
    return word.translationBn || word.translationEn;
  };

  const langMeta = QURAN_LANGUAGES.find((l) => l.code === currentLanguage) || QURAN_LANGUAGES[0];

  return (
    <div className="min-h-screen w-full min-w-0 pb-32 pt-2 px-3 sm:px-5 max-w-7xl mx-auto font-bangla touch-pan-y" style={{ zoom: readerZoom }} onTouchStart={handleReaderTouchStart} onTouchMove={handleReaderTouchMove} onTouchEnd={handleReaderTouchEnd}>
      <audio
        ref={audioRef}
        onEnded={handleAyahAudioEnded}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      {/* Surah Banner & Navigation Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-5 sm:p-7 shadow-lg relative overflow-hidden mb-5 border border-emerald-700/50">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full border-8 border-amber-400/10 pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full border-6 border-emerald-500/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <button
            onClick={handlePrevSurah}
            disabled={surahId <= 1}
            className={`p-2 rounded-xl border border-emerald-700/60 bg-emerald-950/40 text-emerald-200 transition-colors flex items-center gap-1 text-xs ${
              surahId <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-emerald-700 hover:text-white'
            }`}
            aria-label={translateUi(uiLanguage, 'previousSurah')}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{translateUi(uiLanguage, 'previousSurah')}</span>
          </button>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-amber-400/30 text-amber-300 text-xs mb-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{translateUi(uiLanguage, 'surahNumber')}: {toBanglaNumber(currentSurah.id)}</span>
              <span>•</span>
              <span>{currentSurah.revelationPlace === 'makkah' ? translateUi(uiLanguage, 'revelationMakkah') : translateUi(uiLanguage, 'revelationMadinah')}</span>
              <span>•</span>
              <span>{toBanglaNumber(currentSurah.versesCount)} {translateUi(uiLanguage, 'verses')}</span>
            </div>

            <div className="flex flex-col items-center">
              <h1 className="font-arabic text-3xl sm:text-5xl text-amber-300 drop-shadow-sm mb-1">
                سُورَةُ {currentSurah.nameArabic}
              </h1>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                সূরা {currentSurah.nameBengali} ({currentSurah.nameEnglish})
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200 mt-0.5">
                অর্থ: <span className="text-amber-200 font-medium">{currentSurah.bengaliMeaning}</span>
              </p>
            </div>

            <button
              onClick={onOpenSurahList}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs transition-transform hover:scale-105 shadow-sm"
              aria-label={translateUi(uiLanguage, 'chooseSurah')}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{translateUi(uiLanguage, 'chooseAnotherSurah')}</span>
            </button>
          </div>

          <button
            onClick={handleNextSurah}
            disabled={surahId >= 114}
            className={`p-2 rounded-xl border border-emerald-700/60 bg-emerald-950/40 text-emerald-200 transition-colors flex items-center gap-1 text-xs ${
              surahId >= 114 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-emerald-700 hover:text-white'
            }`}
            aria-label={translateUi(uiLanguage, 'nextSurah')}
          >
            <span className="hidden sm:inline">{translateUi(uiLanguage, 'nextSurah')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <section className="mb-5 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900" aria-label="Reading progress">
        <div className="flex items-center justify-between gap-3">
          <div><h3 className="font-bold text-stone-900 dark:text-white">{translateUi(uiLanguage, 'readingProgress')}</h3><p className="text-xs text-stone-500 dark:text-stone-400">এই সূরার কতটি আয়াত পড়েছেন তা চিহ্নিত করুন</p></div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{readCount}/{currentSurah.versesCount}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800"><div className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-amber-400 transition-all" style={{ width: `${Math.round(readCount / currentSurah.versesCount * 100)}%` }} /></div>
      </section>

      {/* Reading Controls Toolbar & Language Selector */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-3 shadow-xs border border-stone-200 dark:border-stone-800 mb-5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* View Mode Toggle */}
        <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-lg border border-stone-200 dark:border-stone-700">
          <button
            onClick={() => setViewMode('wbw')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              viewMode === 'wbw'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-700 dark:text-stone-300 hover:text-emerald-700'
            }`}
          >
            🔤 {translateUi(uiLanguage, 'wordByWord')}
          </button>
          <button
            onClick={() => setViewMode('verse')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              viewMode === 'verse'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-700 dark:text-stone-300 hover:text-emerald-700'
            }`}
          >
            📄 {translateUi(uiLanguage, 'fullVerse')}
          </button>
          <button
            onClick={() => setViewMode('mushaf')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              viewMode === 'mushaf'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-700 dark:text-stone-300 hover:text-emerald-700'
            }`}
          >
            📖 {translateUi(uiLanguage, 'mushafPage')}
          </button>
        </div>

        {/* Multi-Language Selector */}
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
          <select
            value={currentLanguage}
            onChange={(e) => onSelectLanguage(e.target.value as QuranLanguage)}
            className="px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            aria-label={translateUi(uiLanguage, 'translation')}
          >
            {QURAN_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeName} ({l.name})
              </option>
            ))}
          </select>
        </div>

        {/* Reciter & Repeat */}
        <div className="flex items-center gap-3">
          <select
            value={selectedReciterId}
            onChange={(e) => onSelectReciter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-none"
            aria-label="কারী নির্বাচন"
          >
            {RECITERS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nameBn}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-lg border border-stone-200 dark:border-stone-700">
            <Repeat className="w-3.5 h-3.5 text-emerald-600" />
            <select
              value={hifzRepeatCount}
              onChange={(e) => setHifzRepeatCount(Number(e.target.value))}
              className="bg-transparent font-bold text-emerald-700 dark:text-emerald-400 focus:outline-none"
              aria-label="পুনরাবৃত্তি"
            >
              <option value="1">১ বার</option>
              <option value="3">৩ বার</option>
              <option value="5">৫ বার</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bismillah Header */}
      {surahId !== 9 && (
        <div className="bg-emerald-50/70 dark:bg-stone-900/60 border border-emerald-200/60 dark:border-stone-800 rounded-2xl p-6 text-center my-6 shadow-xs">
          <p className="font-arabic text-2xl sm:text-4xl text-emerald-950 dark:text-emerald-300 leading-loose">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2">
            পরম করুণাময় ও অসীম দয়ালু আল্লাহর নামে শুরু করছি ({langMeta.nativeName})
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-stone-500">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-base font-semibold">কুরআনের আয়াত ও শব্দার্থ লোড হচ্ছে ({langMeta.nativeName})...</p>
        </div>
      ) : ayahs.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-xl border border-stone-200">
          <p>আয়াত লোড করা সম্ভব হয়নি।</p>
        </div>
      ) : viewMode === 'mushaf' ? (
        <div className="space-y-5">
          {mushafPages.map(([pageNumber, pageAyahs]) => (
            <article key={pageNumber} className="mushaf-page mx-auto w-full max-w-3xl rounded-2xl p-5 sm:p-8">
              <div className="mb-4 flex items-center justify-between border-b border-current/15 pb-2 text-[10px] font-semibold opacity-60">
                <span>{currentSurah.nameEnglish}</span>
                <span>Mushaf page {pageNumber || '—'}</span>
              </div>
              <div className="text-justify font-arabic leading-[3.4rem] sm:leading-[4rem]" style={{ fontSize: `${arabicFontSize + 6}px` }} dir="rtl">
                {pageAyahs.map((ayah) => {
                  const isPlaying = playingAyahKey === ayah.verseKey;
                  return (
                    <span key={ayah.id} className={`inline cursor-pointer rounded px-1 py-0.5 transition-colors ${isPlaying ? 'bg-amber-300/50 text-emerald-950' : 'hover:bg-amber-100/50 dark:hover:bg-stone-800'}`} onClick={() => handlePlayAyah(ayah)}>
                      {ayah.textUthmani}{' '}
                      <span className="mx-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-current/40 align-middle text-sm font-bold">
                        {toArabicNumber(ayah.verseNumber)}
                      </span>{' '}
                    </span>
                  );
                })}
              </div>
              <div className="mt-4 border-t border-current/15 pt-2 text-center text-[10px] opacity-50">Page {pageNumber || '—'} · {pageAyahs.length} verses in this chapter</div>
            </article>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {ayahs.map((ayah) => {
            const isPlayingThisAyah = playingAyahKey === ayah.verseKey && isPlaying;
            const isBookmarked = bookmarks.includes(ayah.verseKey);
            const translationText = getAyahTranslation(ayah);
            const availableTafsirs = getBundledTafsir(ayah.verseKey);

            return (
              <div
                key={ayah.id}
                id={`ayah-${ayah.verseNumber}`}
                className={`rounded-2xl transition-all duration-200 border ${
                  isPlayingThisAyah
                    ? 'bg-amber-50/70 dark:bg-emerald-950/20 border-amber-400 dark:border-emerald-600 shadow-md ring-1 ring-amber-400'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800/90 hover:border-emerald-300 dark:hover:border-stone-700 shadow-xs'
                }`}
              >
                {/* Header Bar */}
                <div className="px-4 py-2.5 bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 rounded-t-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-sm font-arabic shadow-xs">
                      {toArabicNumber(ayah.verseNumber)}
                    </div>
                    <span className="text-stone-500 dark:text-stone-400 font-medium">
                      {currentSurah.nameBengali} • আয়াত ﴿{toArabicNumber(ayah.verseNumber)}﴾ ({langMeta.nativeName})
                    </span>
                    {isPlayingThisAyah && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-bold text-[10px] animate-pulse">
                        বাজছে
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePlayAyah(ayah)}
                      className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                        isPlayingThisAyah
                          ? 'bg-amber-400 text-emerald-950 font-bold'
                          : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-emerald-600 hover:text-white'
                      }`}
                      aria-label="অডিও শুনুন"
                    >
                      {isPlayingThisAyah ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{translateUi(uiLanguage, 'listen')}</span>
                    </button>

                    {availableTafsirs.length > 0 && (
                      <button
                        onClick={() => {
                          setTafsirAyah(ayah);
                          setIsTafsirOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-emerald-600 hover:text-white transition-colors flex items-center gap-1"
                        aria-label={translateUi(uiLanguage, 'tafsir')}
                      >
                        <BookOpen className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span className="hidden sm:inline">{translateUi(uiLanguage, 'tafsir')}</span>
                      </button>
                    )}

                    <button
                      onClick={() => onToggleBookmark(ayah.verseKey, currentSurah.nameBengali, ayah.verseNumber)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isBookmarked
                          ? 'bg-amber-500 text-white'
                          : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-amber-500 hover:text-white'
                      }`}
                      aria-label={translateUi(uiLanguage, 'bookmark')}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleCopyAyah(ayah)}
                      className="p-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-emerald-600 hover:text-white transition-colors"
                      aria-label={translateUi(uiLanguage, 'copy')}
                    >
                      {copiedAyahKey === ayah.verseKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="px-4 sm:px-6"><AyahStudyTools read={!!studyRecords[ayah.verseKey]?.read} note={studyRecords[ayah.verseKey]?.note ?? ''} onToggleRead={() => updateStudyRecord(ayah.verseKey, { read: !studyRecords[ayah.verseKey]?.read })} onNoteChange={(note) => updateStudyRecord(ayah.verseKey, { note })} /></div>

                {/* Body Content */}
                <div className="p-4 sm:p-6 space-y-4">
                  {viewMode === 'wbw' && ayah.words && ayah.words.length > 0 ? (
                    <div>
                      {/* Word by word cards (Right-to-Left / ডানে থেকে বাঁ দিক flow) */}
                      <div className="flex flex-wrap justify-start gap-2.5 sm:gap-3 py-2" dir="rtl">
                        {ayah.words.map((word) => {
                          const isWordActive = activeWordId === word.id;
                          return (
                            <div
                              key={word.id}
                              onClick={(e) => handlePlayWord(word, e)}
                              className={`group cursor-pointer rounded-xl p-2.5 border transition-all text-center flex flex-col items-center min-w-[70px] sm:min-w-[85px] ${
                                isWordActive
                                  ? 'bg-amber-300 dark:bg-amber-500/20 border-amber-500 ring-2 ring-amber-400 scale-105 shadow-md'
                                  : 'bg-stone-50 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700/80 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-stone-800'
                              }`}
                            >
                              <span
                                className="font-arabic text-emerald-950 dark:text-emerald-200 font-semibold mb-1 group-hover:text-emerald-700 dark:group-hover:text-amber-300 transition-colors"
                                style={{ fontSize: `${arabicFontSize}px` }}
                                dir="rtl"
                              >
                                {word.textUthmani}
                              </span>

                              {showTransliteration && word.transliterationBn && (
                                <span className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 leading-tight" dir="ltr">
                                  {word.transliterationBn}
                                </span>
                              )}

                              <span
                                className="text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-400 mt-1 leading-tight"
                                dir={currentLanguage === 'ur' ? 'rtl' : 'ltr'}
                              >
                                {getWordTranslation(word)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {showTranslation && translationText && (
                        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                          <p
                            className="text-stone-800 dark:text-stone-200 leading-relaxed font-serif"
                            style={{ fontSize: `${banglaFontSize}px` }}
                          >
                            <span className="font-semibold text-emerald-800 dark:text-emerald-400 mr-1.5">
                              ({langMeta.nativeName}) {translateUi(uiLanguage, 'translation')}:
                            </span>
                            {translationText}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p
                        className="font-arabic text-right text-emerald-950 dark:text-emerald-200 leading-loose"
                        style={{ fontSize: `${arabicFontSize + 4}px` }}
                        dir="rtl"
                      >
                        {ayah.textUthmani}
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-amber-600/70 text-amber-700 dark:text-amber-400 text-sm mx-2 align-middle font-arabic font-bold">
                          {toArabicNumber(ayah.verseNumber)}
                        </span>
                      </p>

                      {showTranslation && translationText && (
                        <p
                          className="text-stone-800 dark:text-stone-200 leading-relaxed font-serif pt-1"
                          style={{ fontSize: `${banglaFontSize}px` }}
                        >
                          <span className="font-semibold text-emerald-800 dark:text-emerald-400 mr-1.5">
                            ({langMeta.nativeName}):
                          </span>
                          {translationText}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                  {availableTafsirs.length > 0 && (
                    <section className="mx-4 mb-4 rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">{translateUi(uiLanguage, 'tafsir')} · {availableTafsirs[0].nameBn}</h4>
                        <button type="button" onClick={() => { setTafsirAyah(ayah); setIsTafsirOpen(true); }} className="text-xs font-bold text-emerald-700 underline dark:text-emerald-300">View</button>
                      </div>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-stone-700 dark:text-stone-200">{availableTafsirs[0].text}</p>
                    </section>
                  )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Audio Controller */}
      {playingAyahKey && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl bg-emerald-900 text-white rounded-2xl shadow-2xl p-3 border border-emerald-700/80 z-30 flex items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
              <Volume2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-sm text-amber-300">
                {currentSurah.nameBengali} — আয়াত ﴿{toArabicNumber(playingAyahKey.split(':')[1])}﴾
              </p>
              <p className="text-xs text-emerald-200">
                কারী: {RECITERS.find((r) => r.id === selectedReciterId)?.nameBn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (audioRef.current) {
                  if (isPlaying) audioRef.current.pause();
                  else audioRef.current.play();
                }
              }}
              className="p-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-emerald-950 transition-colors shadow-md"
              aria-label="Play/Pause"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={() => {
                if (audioRef.current) audioRef.current.pause();
                setPlayingAyahKey(null);
                setIsPlaying(false);
              }}
              className="p-2 text-emerald-300 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <TafsirModal
        isOpen={isTafsirOpen}
        onClose={() => setIsTafsirOpen(false)}
        ayah={tafsirAyah}
        surahNameBn={currentSurah.nameBengali}
      />
    </div>
  );
};
