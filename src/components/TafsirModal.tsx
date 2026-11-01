import React, { useState, useEffect } from 'react';
import { X, BookOpen, Copy, Check, Globe, TextQuote } from 'lucide-react';
import { QuranAyah, TafsirContent } from '../data/quranSampleData';
import { fetchTafsir } from '../services/quranApi';
import { toBanglaNumber, toArabicNumber } from '../utils/banglaNumbers';

interface TafsirModalProps {
  isOpen: boolean;
  onClose: () => void;
  ayah: QuranAyah | null;
  surahNameBn: string;
  translationText?: string;
  translationLanguage?: string;
  preloadedTafsirs?: TafsirContent[];
}

export const TafsirModal: React.FC<TafsirModalProps> = ({
  isOpen,
  onClose,
  ayah,
  surahNameBn,
  translationText,
  translationLanguage,
  preloadedTafsirs,
}) => {
  const [tafsirs, setTafsirs] = useState<TafsirContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTafsirIndex, setSelectedTafsirIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [fontSizeOffset, setFontSizeOffset] = useState(0);

  useEffect(() => {
    if (!ayah || !isOpen) return;

    let isMounted = true;
    setSelectedTafsirIndex(0);
    if (preloadedTafsirs && preloadedTafsirs.length > 0) {
      setTafsirs(preloadedTafsirs);
      setLoading(false);
      return;
    }
    setLoading(true);

    fetchTafsir(ayah.verseKey)
      .then((data) => {
        if (isMounted) {
          setTafsirs(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error loading tafsir:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [ayah?.verseKey, isOpen]);

  if (!isOpen || !ayah) return null;

  const currentTafsir = tafsirs[selectedTafsirIndex] || null;

  const handleCopyTafsir = () => {
    if (!currentTafsir) return;
    const textToCopy = `সূরা: ${surahNameBn}, আয়াত: ${toArabicNumber(ayah.verseNumber)}\n\nতাফসীরকারক: ${currentTafsir.nameEn || currentTafsir.nameBn}\n\n${currentTafsir.text}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="তাফসীর ও ব্যাখ্যা"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-emerald-800/30 dark:border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-400 text-emerald-950">
              <TextQuote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-bangla text-base sm:text-lg text-amber-300">
                তাফসীর ও গভীর ব্যাখ্যা
              </h3>
              <p className="text-xs text-emerald-200/80 font-bangla">
                {surahNameBn} — আয়াত ﴿{toArabicNumber(ayah.verseNumber)}﴾
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Font size control */}
            <div className="flex items-center bg-emerald-950/60 rounded-lg p-0.5 border border-emerald-700/50 text-xs text-emerald-200">
              <button
                onClick={() => setFontSizeOffset((prev) => Math.max(-2, prev - 1))}
                className="px-2 py-1 hover:text-white rounded"
                title="ফন্ট ছোট করুন"
                aria-label="ফন্ট ছোট করুন"
              >
                A-
              </button>
              <button
                onClick={() => setFontSizeOffset((prev) => Math.min(4, prev + 1))}
                className="px-2 py-1 hover:text-white rounded"
                title="ফন্ট বড় করুন"
                aria-label="ফন্ট বড় করুন"
              >
                A+
              </button>
            </div>

            <button
              onClick={handleCopyTafsir}
              className="p-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-100 transition-colors"
              title="তাফসীর কপি করুন"
              aria-label="তাফসীর কপি করুন"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-100 transition-colors"
              aria-label="তাফসীর উইন্ডো বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ayah preview card */}
        <div className="p-4 bg-emerald-50/60 dark:bg-stone-800/50 border-b border-emerald-100 dark:border-stone-800">
          <p className="font-arabic text-xl sm:text-2xl text-right text-emerald-950 dark:text-emerald-200 leading-loose mb-2">
            {ayah.textUthmani}
          </p>
          <p className="font-bangla text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            <span className="font-semibold text-emerald-800 dark:text-emerald-400 mr-1.5">{translationLanguage || 'Translation'}:</span>
            {translationText || ayah.translationBn}
          </p>
        </div>

        {/* Tafsir Source Selector Tabs */}
        {tafsirs.length > 0 && (
          <div className="px-4 py-2 bg-stone-100 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-700 flex items-center gap-2 overflow-x-auto text-xs font-bangla">
            <Globe className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            {tafsirs.map((t, idx) => {
              const flag =
                t.language === 'bn'
                  ? '🇧🇩'
                  : t.language === 'en'
                  ? '🇬🇧'
                  : t.language === 'ar'
                  ? '🇸🇦'
                  : t.language === 'ur'
                  ? '🇵🇰'
                  : t.language === 'hi'
                  ? '🇮🇳'
                  : '🇹🇷';
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedTafsirIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg shrink-0 font-medium transition-all flex items-center gap-1.5 ${
                    selectedTafsirIndex === idx
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-600'
                  }`}
                >
                  <span>{flag}</span>
                  <span>{t.nameBn}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tafsir Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-stone-500 font-bangla gap-2">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">তাফসীর লোড হচ্ছে...</p>
            </div>
          ) : currentTafsir ? (
            <div
              className={`leading-relaxed text-stone-800 dark:text-stone-200 ${
                currentTafsir.language === 'ar' || currentTafsir.language === 'ur'
                  ? 'font-arabic text-right'
                  : currentTafsir.language === 'hi'
                  ? 'font-sans'
                  : currentTafsir.language === 'en' || currentTafsir.language === 'tr'
                  ? 'font-serif'
                  : 'font-bangla'
              }`}
              dir={currentTafsir.language === 'ar' || currentTafsir.language === 'ur' ? 'rtl' : 'ltr'}
              style={{ fontSize: `${15 + fontSizeOffset}px` }}
            >
              <div className="mb-3 pb-2 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {currentTafsir.author}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                  {currentTafsir.language === 'bn' && '🇧🇩 বাংলা তাফসীর'}
                  {currentTafsir.language === 'en' && '🇬🇧 English Tafsir'}
                  {currentTafsir.language === 'ar' && '🇸🇦 تفسير عربي'}
                  {currentTafsir.language === 'ur' && '🇵🇰 اردو تفسیر'}
                  {currentTafsir.language === 'hi' && '🇮🇳 हिन्दी तफ़सीर'}
                  {currentTafsir.language === 'tr' && '🇹🇷 Türkçe Tefsir'}
                </span>
              </div>
              <div className="whitespace-pre-line leading-relaxed space-y-3">
                {currentTafsir.text}
              </div>
            </div>
          ) : (
            <p className="text-center text-stone-500 py-8 font-bangla">
              এই আয়াতের জন্য বিস্তারিত তাফসীর বর্তমানে উপলব্ধ নেই।
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 dark:bg-stone-800/60 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs font-bangla text-stone-500 dark:text-stone-400">
          <span>উপরে প্রদর্শিত নির্বাচিত তাফসীরের উৎস ও লেখক দেখুন</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
          >
            ঠিক আছে
          </button>
        </div>
      </div>
    </div>
  );
};
