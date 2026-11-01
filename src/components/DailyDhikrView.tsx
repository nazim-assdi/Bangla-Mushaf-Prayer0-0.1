/**
 * Comprehensive Masnun Adhkar & Daily Tasbih component
 * Includes morning, evening, after-salah, sleep/wake, protection, and repentance adhkar
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UiLanguage, formatUiNumber, translateUi } from '../services/i18n';
import {
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Search,
  Check,
  Copy,
  BookOpen,
  List,
  Layers,
  ArrowRight,
  Sun,
  Moon,
  Info,
} from 'lucide-react';
import { toArabicNumber } from '../utils/banglaNumbers';
import {
  MASNUN_ADHKAAR,
  ADHKAR_CATEGORIES,
  AdhkarCategory,
  MasnunDhikr,
} from '../data/masnunAdhkar';
import { useAuth } from '../context/AuthContext';
import { saveDhikrProgress } from '../services/firebase';
import { saveDhikrToCloudSQL } from '../services/apiSync';

export const DailyDhikrView: React.FC<{ uiLanguage: UiLanguage }> = ({ uiLanguage }) => {
  const [selectedCategory, setSelectedCategory] = useState<AdhkarCategory>('morning');
  const [selectedId, setSelectedId] = useState<string>(() => {
    const morningFirst = MASNUN_ADHKAAR.find((d) => d.categoryId === 'morning');
    return morningFirst ? morningFirst.id : MASNUN_ADHKAAR[0].id;
  });
  const [viewMode, setViewMode] = useState<'counter' | 'list'>('counter');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { user } = useAuth();
  const [counts, setCounts] = useState<{ [key: string]: number }>(() => {
    try {
      const saved = localStorage.getItem('bangla_mushaf_masnun_counts_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem('bangla_mushaf_masnun_counts_v2', JSON.stringify(counts));
    } catch (e) {}
  }, [counts]);

  const handleIncrement = (dhikrId?: string) => {
    const targetId = dhikrId || currentDhikr.id;
    const targetDhikr = MASNUN_ADHKAAR.find((d) => d.id === targetId) || currentDhikr;
    const prevCount = counts[targetId] || 0;
    const newCount = prevCount + 1;
    const reached = newCount === targetDhikr.targetCount;

    playTapSound(reached);
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(reached ? [50, 40, 80] : 35);
      } catch (e) {}
    }

    setCounts((prev) => ({
      ...prev,
      [targetId]: newCount,
    }));

    if (user) {
      const numericId = parseInt(targetId.replace(/\D/g, ''), 10) || 1;
      saveDhikrProgress(user.uid, numericId, newCount, targetDhikr.targetCount, reached);
      saveDhikrToCloudSQL(user, {
        dhikrId: numericId,
        count: newCount,
        target: targetDhikr.targetCount,
        completed: reached,
      });
    }

    // Auto-advance to next dhikr in current category if target just reached
    if (reached && autoAdvance && !dhikrId) {
      const currentIndex = filteredAdhkar.findIndex((d) => d.id === targetId);
      if (currentIndex >= 0 && currentIndex < filteredAdhkar.length - 1) {
        setTimeout(() => {
          setSelectedId(filteredAdhkar[currentIndex + 1].id);
        }, 350);
      }
    }
  };

  const handleReset = (id?: string) => {
    const target = id || currentDhikr.id;
    const targetDhikr = MASNUN_ADHKAAR.find((d) => d.id === target) || currentDhikr;
    setCounts((prev) => ({
      ...prev,
      [target]: 0,
    }));

    if (user) {
      const numericId = parseInt(target.replace(/\D/g, ''), 10) || 1;
      saveDhikrProgress(user.uid, numericId, 0, targetDhikr.targetCount, false);
      saveDhikrToCloudSQL(user, {
        dhikrId: numericId,
        count: 0,
        target: targetDhikr.targetCount,
        completed: false,
      });
    }
  };

  // Filtered adhkar based on category & search
  const filteredAdhkar = useMemo(() => {
    let list = MASNUN_ADHKAAR;
    if (selectedCategory !== 'all') {
      list = list.filter((d) => d.categoryId === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.titleBn.toLowerCase().includes(q) ||
          d.meaningBn.toLowerCase().includes(q) ||
          d.transliterationBn.toLowerCase().includes(q) ||
          d.arabic.includes(q)
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  // Ensure selectedId is valid within current view
  const currentDhikr = useMemo(() => {
    const found = MASNUN_ADHKAAR.find((d) => d.id === selectedId);
    if (found) return found;
    return filteredAdhkar[0] || MASNUN_ADHKAAR[0];
  }, [selectedId, filteredAdhkar]);

  const currentCount = counts[currentDhikr.id] || 0;
  const progressPercent = Math.min(100, Math.round((currentCount / currentDhikr.targetCount) * 100));
  const isGoalReached = currentCount >= currentDhikr.targetCount;

  // Audio effect generator
  const playTapSound = (isFinish: boolean = false) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (isFinish) {
        // Higher chime on goal completion
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(620, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      }
    } catch (e) {}
  };

  const handleResetAllCategory = () => {
    if (window.confirm('আপনি কি এই ক্যাটেগরির সকল আযকারের গণনা ০ করতে চান?')) {
      const resetMap = { ...counts };
      filteredAdhkar.forEach((d) => {
        resetMap[d.id] = 0;
      });
      setCounts(resetMap);
    }
  };

  const handleCopy = (dhikr: MasnunDhikr, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const text = `${dhikr.titleBn} (${dhikr.categoryBn})\n\n${dhikr.arabic}\n\nউচ্চারণ: ${dhikr.transliterationBn}\n\nঅর্থ: ${uiLanguage === 'bn' ? dhikr.meaningBn : translateUi(uiLanguage, 'noTranslationAvailable')}\n\nফজিলত: ${uiLanguage === 'bn' ? dhikr.virtueBn : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(dhikr.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNext = () => {
    const idx = filteredAdhkar.findIndex((d) => d.id === currentDhikr.id);
    if (idx >= 0 && idx < filteredAdhkar.length - 1) {
      setSelectedId(filteredAdhkar[idx + 1].id);
    }
  };

  const handlePrev = () => {
    const idx = filteredAdhkar.findIndex((d) => d.id === currentDhikr.id);
    if (idx > 0) {
      setSelectedId(filteredAdhkar[idx - 1].id);
    }
  };

  // Quick stats
  const completedInCurrentCategory = filteredAdhkar.filter(
    (d) => (counts[d.id] || 0) >= d.targetCount
  ).length;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 pb-28 font-bangla space-y-6">
      {/* Hero Banner with Day / Evening Context */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-emerald-700/80 relative overflow-hidden">
        <div className="absolute right-2 -top-10 w-44 h-44 rounded-full bg-amber-400/10 pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-emerald-500/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-amber-400/30 text-amber-300 text-xs mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>হিসনুল মুসলিম • সহীহ মাসনুন আযকার</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              সকাল-সন্ধ্যা ও প্রাত্যহিক আযকার
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200 mt-1">
              "অতএব তোমরা আমাকে স্মরণ করো, আমিও তোমাদের স্মরণ করব।" (সূরা বাকারা: ﴿١٥٢﴾)
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-emerald-950/80 p-1 rounded-xl border border-emerald-700/60 text-xs">
              <button
                onClick={() => setViewMode('counter')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 font-semibold ${
                  viewMode === 'counter'
                    ? 'bg-amber-400 text-emerald-950 shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
                title="তাসবীহ কাউন্টার ভিউ"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">কাউন্টার</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 font-semibold ${
                  viewMode === 'list'
                    ? 'bg-amber-400 text-emerald-950 shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
                title="সকল আযকার তালিকা ভিউ"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">তালিকা</span>
              </button>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-amber-300 border border-emerald-700/60 transition-colors"
              title={soundEnabled ? 'সাউন্ড বন্ধ করুন' : 'সাউন্ড চালু করুন'}
              aria-label="সাউন্ড কন্ট্রোল"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
            </button>
          </div>
        </div>

        {/* Quick Progress Banner */}
        <div className="mt-5 pt-3 border-t border-emerald-700/60 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <span>ক্যাটেগরি সম্পন্ন:</span>
            <span className="font-bold text-amber-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-700">
              {formatUiNumber(completedInCurrentCategory, uiLanguage)} / {formatUiNumber(filteredAdhkar.length, uiLanguage)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs select-none">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                className="rounded accent-amber-400"
              />
              <span>লক্ষ্য পূরণে অটো-পরবর্তী</span>
            </label>
            <button
              onClick={handleResetAllCategory}
              className="text-emerald-300 hover:text-amber-300 underline text-xs"
            >
              সব রিসেট
            </button>
          </div>
        </div>
      </div>

      {/* Categories Horizontal Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs sm:text-sm font-semibold">
        {ADHKAR_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const countInCat =
            cat.id === 'all'
              ? MASNUN_ADHKAAR.length
              : MASNUN_ADHKAAR.filter((d) => d.categoryId === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                // Also select the first dhikr of the category
                const first =
                  cat.id === 'all'
                    ? MASNUN_ADHKAAR[0]
                    : MASNUN_ADHKAAR.find((d) => d.categoryId === cat.id) || MASNUN_ADHKAAR[0];
                setSelectedId(first.id);
              }}
              className={`px-3.5 py-2 rounded-2xl shrink-0 font-medium transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-emerald-700 text-white border-emerald-600 shadow-md scale-102'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              
              <span>{cat.nameBn}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-emerald-950 text-amber-300'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                }`}
              >
                {formatUiNumber(countInCat, uiLanguage)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="আযকার খুঁজুন (যেমন: সাইয়্যিদুল ইস্তিগফার, আয়াতুল কুরসী, বিসমিল্লাহিল্লাযী, তাসবীহ)..."
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white placeholder-stone-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            ✕
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: Focused Interactive Tasbih Counter */}
      {/* ========================================================================= */}
      {viewMode === 'counter' ? (
        <div className="space-y-4">
          {/* Adhkar Quick Selector Pills within category */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {filteredAdhkar.map((d, index) => {
              const isSelected = d.id === currentDhikr.id;
              const count = counts[d.id] || 0;
              const done = count >= d.targetCount;

              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  className={`px-3 py-2 rounded-xl shrink-0 font-medium transition-all flex items-center gap-2 border text-xs ${
                    isSelected
                      ? 'bg-amber-400 text-emerald-950 border-amber-500 font-bold shadow-md scale-102'
                      : done
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-emerald-400'
                  }`}
                >
                  {done && <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                  <span>
                    {formatUiNumber(index + 1, uiLanguage)}. {d.titleBn.split('(')[0]}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected
                        ? 'bg-emerald-950 text-amber-300'
                        : done
                        ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-950 dark:text-emerald-200'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                    }`}
                  >
                    {formatUiNumber(count, uiLanguage)}/{formatUiNumber(d.targetCount, uiLanguage)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Counter Card */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-8 shadow-xl border border-stone-200 dark:border-stone-800 text-center space-y-6 relative overflow-hidden">
            {/* Top Navigation & Status */}
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <button
                onClick={handlePrev}
                disabled={filteredAdhkar.findIndex((d) => d.id === currentDhikr.id) <= 0}
                className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-1 text-xs font-semibold"
                aria-label="পূর্ববর্তী আযকার"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">পূর্ববর্তী</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  {currentDhikr.categoryBn}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                  লক্ষ্য: {formatUiNumber(currentDhikr.targetCount, uiLanguage)} বার
                </span>
              </div>

              <button
                onClick={handleNext}
                disabled={
                  filteredAdhkar.findIndex((d) => d.id === currentDhikr.id) >=
                  filteredAdhkar.length - 1
                }
                className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-1 text-xs font-semibold"
                aria-label="পরবর্তী আযকার"
              >
                <span className="hidden sm:inline">পরবর্তী</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Dhikr Content Area */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white text-left">
                  {currentDhikr.titleBn}
                </h2>
                <button
                  onClick={(e) => handleCopy(currentDhikr, e)}
                  className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-emerald-600 transition-colors"
                  title="আযকার কপি করুন"
                  aria-label="কপি করুন"
                >
                  {copiedId === currentDhikr.id ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Arabic Calligraphy Text */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#faf7ee] dark:bg-stone-950/60 border border-amber-200/50 dark:border-stone-800 shadow-inner">
                <p
                  className="font-arabic text-2xl sm:text-3xl text-emerald-950 dark:text-emerald-200 leading-loose text-center"
                  dir="rtl"
                >
                  {currentDhikr.arabic}
                </p>
              </div>

              {/* Transliteration */}
              {uiLanguage === 'bn' && currentDhikr.transliterationBn && (
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 italic text-left bg-stone-50 dark:bg-stone-800/40 p-2.5 rounded-xl border border-stone-200/60 dark:border-stone-800/60">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-400 mr-1 not-italic">
                    উচ্চারণ:
                  </span>
                  {currentDhikr.transliterationBn}
                </p>
              )}

              {/* Meaning */}
              <p className="text-xs sm:text-sm font-medium text-emerald-900 dark:text-emerald-300 text-left leading-relaxed">
                <span className="font-bold text-stone-800 dark:text-stone-200 mr-1">অর্থ:</span>
                {uiLanguage === 'bn' ? currentDhikr.meaningBn : translateUi(uiLanguage, 'noTranslationAvailable')}
              </p>
            </div>

            {/* Giant Interactive Tasbih Button */}
            <div className="py-2 flex flex-col items-center justify-center">
              <button
                onClick={() => handleIncrement()}
                className={`w-52 h-52 sm:w-60 sm:h-60 rounded-full text-white shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all border-4 cursor-pointer focus:outline-none ${
                  isGoalReached
                    ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 border-amber-300 ring-4 ring-amber-400/40 shadow-amber-400/20'
                    : 'bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-950 border-amber-400/80 shadow-emerald-700/30'
                }`}
                aria-label="তাসবীহ গণনা করতে ট্যাপ করুন"
              >
                <span className="text-5xl sm:text-7xl font-black font-bangla text-amber-300 drop-shadow-md">
                  {formatUiNumber(currentCount, uiLanguage)}
                </span>
                <span className="text-xs sm:text-sm text-emerald-100 font-medium mt-1 tracking-wide">
                  {isGoalReached ? 'মাশাআল্লাহ! লক্ষ্য পূর্ণ হয়েছে ✨' : 'ট্যাপ করে গণনা করুন 📿'}
                </span>
                <span className="text-[11px] text-amber-200/90 mt-0.5">
                  লক্ষ্য: {formatUiNumber(currentDhikr.targetCount, uiLanguage)} বার
                </span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto space-y-1.5">
              <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
                <span>সম্পন্ন হার</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {formatUiNumber(progressPercent, uiLanguage)}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden border border-stone-200/60 dark:border-stone-700/60">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Virtue & Reset Footnote */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-stone-100 dark:border-stone-800 text-left">
              <div className="max-w-md text-xs text-stone-600 dark:text-stone-300 space-y-1">
                <p>
                  <strong className="text-emerald-800 dark:text-emerald-400">ফজিলত: </strong>
                  {currentDhikr.virtueBn}
                </p>
                {currentDhikr.source && (
                  <p className="text-[11px] text-stone-400">সূত্র: {currentDhikr.source}</p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleReset()}
                  className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-stone-600 dark:text-stone-300 transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
                  title="এই আযকারের গণনা রিসেট করুন"
                  aria-label="রিসেট"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>রিসেট</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW MODE 2: Comprehensive All Adhkar List Cards                          */
        /* ========================================================================= */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>
              মোট আযকার: {formatUiNumber(filteredAdhkar.length, uiLanguage)} টি (ক্যাটেগরি: {selectedCategory === 'all' ? 'সকল' : ADHKAR_CATEGORIES.find((c) => c.id === selectedCategory)?.nameBn})
            </span>
            <button
              onClick={handleResetAllCategory}
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold"
            >
              সব রিসেট করুন
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredAdhkar.map((dhikr, idx) => {
              const count = counts[dhikr.id] || 0;
              const isDone = count >= dhikr.targetCount;
              const isSelected = dhikr.id === currentDhikr.id;

              return (
                <div
                  key={dhikr.id}
                  className={`rounded-2xl p-5 border transition-all ${
                    isDone
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-400/80 shadow-xs'
                      : isSelected
                      ? 'bg-white dark:bg-stone-900 border-amber-400 shadow-md ring-1 ring-amber-400'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-xs hover:border-emerald-400'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {formatUiNumber(idx + 1, uiLanguage)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white">
                          {dhikr.titleBn}
                        </h3>
                        <p className="text-[11px] text-stone-400">{dhikr.categoryBn}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleCopy(dhikr, e)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 transition-colors"
                        title="কপি করুন"
                      >
                        {copiedId === dhikr.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedId(dhikr.id);
                          setViewMode('counter');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-emerald-600 hover:text-white text-stone-700 dark:text-stone-300 text-xs font-semibold transition-colors flex items-center gap-1"
                        title="কাউন্টারে খুলুন"
                      >
                        <span>কাউন্টার</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Arabic Text */}
                  <div className="p-3.5 rounded-xl bg-[#faf7ee] dark:bg-stone-950/40 border border-amber-200/40 dark:border-stone-800/80 mb-3">
                    <p className="font-arabic text-xl sm:text-2xl text-emerald-950 dark:text-emerald-200 text-right leading-loose" dir="rtl">
                      {dhikr.arabic}
                    </p>
                  </div>

                  {/* Transliteration & Meaning */}
                  {uiLanguage === 'bn' && dhikr.transliterationBn && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 italic mb-2 leading-relaxed">
                      <strong>উচ্চারণ: </strong>
                      {dhikr.transliterationBn}
                    </p>
                  )}

                  <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 mb-3 leading-relaxed">
                    <strong className="text-emerald-800 dark:text-emerald-400">অর্থ: </strong>
                    {dhikr.meaningBn}
                  </p>

                  <p className="text-[11px] text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800 mb-4">
                    <strong>ফজিলত: </strong>
                    {dhikr.virtueBn}
                  </p>

                  {/* Inline Counter Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">গণনা:</span>
                      <span className="font-bold text-base font-bangla text-emerald-700 dark:text-emerald-400">
                        {formatUiNumber(count, uiLanguage)} / {formatUiNumber(dhikr.targetCount, uiLanguage)} বার
                      </span>
                      {isDone && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                          সম্পন্ন ✓
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReset(dhikr.id)}
                        className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-rose-500 transition-colors"
                        title="রিসেট"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleIncrement(dhikr.id)}
                        className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-transform active:scale-95 shadow-sm flex items-center gap-1.5 ${
                          isDone
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-amber-400 text-emerald-950 hover:bg-amber-300'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>+১ ট্যাপ</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
