import React, { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Search, Volume2, X, Star } from 'lucide-react';
import { ARABIC_BANGLA_DICTIONARY, DictionaryEntry } from '../data/arabicBanglaDictionary';

interface Props { onClose: () => void }

const normalizeArabic = (value: string) => value.normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').trim().toLowerCase();
const normalizeText = (value: string) => value.normalize('NFKC').trim().toLocaleLowerCase('bn');

export const ArabicBanglaDictionary: React.FC<Props> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'all' | 'arabic' | 'bangla'>('all');
  const [category, setCategory] = useState('সব');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('mushaf_dictionary_favorites') || '[]'); } catch { return []; }
  });
  const categories = useMemo(() => ['সব', ...Array.from(new Set(ARABIC_BANGLA_DICTIONARY.map(x => x.category)))], []);
  const results = useMemo(() => {
    const qAr = normalizeArabic(query);
    const qBn = normalizeText(query);
    return ARABIC_BANGLA_DICTIONARY.filter((entry) => {
      const categoryMatch = category === 'সব' || entry.category === category;
      const textMatch = !query.trim() || (
        (mode !== 'bangla' && (normalizeArabic(entry.arabic).includes(qAr) || entry.arabic.includes(query.trim()))) ||
        (mode !== 'arabic' && (normalizeText(entry.bn).includes(qBn) || normalizeText(entry.detail).includes(qBn)))
      );
      return categoryMatch && textMatch;
    }).slice(0, 100);
  }, [query, mode, category]);
  const speak = (entry: DictionaryEntry) => {
    if (typeof window.speechSynthesis === 'undefined') { window.alert('এই ডিভাইসে আরবি উচ্চারণ সুবিধা পাওয়া যাচ্ছে না।'); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(entry.arabic);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.78;
    window.speechSynthesis.speak(utterance);
  };
  const toggleFavorite = (entry: DictionaryEntry) => {
    const next = favorites.includes(entry.arabic) ? favorites.filter(x => x !== entry.arabic) : [...favorites, entry.arabic];
    setFavorites(next);
    localStorage.setItem('mushaf_dictionary_favorites', JSON.stringify(next));
  };
  return (
    <div className="fixed inset-0 z-[95] flex flex-col bg-[#faf8f2] text-stone-900 dark:bg-stone-950 dark:text-stone-100" role="dialog" aria-modal="true" aria-label="Offline Arabic Bangla Dictionary">
      <header className="shrink-0 bg-gradient-to-r from-emerald-950 to-emerald-800 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] text-white shadow-lg">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button onClick={onClose} className="rounded-xl bg-white/10 p-2" aria-label="বন্ধ করুন"><ArrowLeft className="h-5 w-5" /></button>
          <div className="min-w-0 flex-1"><p className="text-[10px] tracking-widest text-emerald-200">OFFLINE • NO INTERNET REQUIRED</p><h2 className="text-xl font-extrabold">আরবি–বাংলা অভিধান</h2></div>
          <BookOpen className="h-6 w-6 text-amber-200" />
          <button onClick={onClose} className="rounded-xl p-2 text-white/70" aria-label="বন্ধ"><X className="h-5 w-5" /></button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-3 py-4 pb-10">
        <div className="rounded-2xl border border-emerald-200 bg-white p-3 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 dark:border-stone-700">
            <Search className="h-5 w-5 shrink-0 text-stone-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="আরবি বা বাংলা শব্দ লিখুন..." className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none placeholder:text-stone-400" />
            {query && <button onClick={() => setQuery('')} className="p-1 text-stone-400" aria-label="মুছুন"><X className="h-4 w-4" /></button>}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {([{id:'all',label:'সব খুঁজুন'},{id:'arabic',label:'আরবি → বাংলা'},{id:'bangla',label:'বাংলা → আরবি'}] as const).map(item => <button key={item.id} onClick={() => setMode(item.id)} className={`rounded-lg px-2 py-2 text-xs font-bold ${mode===item.id?'bg-emerald-700 text-white':'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'}`}>{item.label}</button>)}
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{categories.map(item => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${category===item?'border-amber-500 bg-amber-100 font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-100':'border-stone-200 text-stone-600 dark:border-stone-700 dark:text-stone-300'}`}>{item}</button>)}</div>
        </div>
        <div className="my-3 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400"><span>{results.length}টি শব্দ দেখানো হচ্ছে</span><span>{ARABIC_BANGLA_DICTIONARY.length}টি অফলাইন এন্ট্রি</span></div>
        {results.length ? <div className="space-y-2">{results.map((entry, index) => <article key={entry.arabic} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-start gap-3"><div className="min-w-0 flex-1"><p dir="rtl" className="text-right font-arabic text-3xl leading-relaxed text-emerald-800 dark:text-emerald-300">{entry.arabic}</p><h3 className="mt-1 text-lg font-extrabold">{entry.bn}</h3><p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{entry.detail}</p><span className="mt-2 inline-block rounded-full bg-stone-100 px-2 py-1 text-[10px] text-stone-500 dark:bg-stone-800 dark:text-stone-400">{entry.category}</span></div><div className="flex shrink-0 flex-col gap-2"><button onClick={() => speak(entry)} className="rounded-xl bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" aria-label="উচ্চারণ শুনুন"><Volume2 className="h-5 w-5" /></button><button onClick={() => toggleFavorite(entry)} className={`rounded-xl p-2 ${favorites.includes(entry.arabic)?'bg-amber-100 text-amber-700':'bg-stone-100 text-stone-500 dark:bg-stone-800'}`} aria-label="প্রিয় শব্দে রাখুন"><Star className="h-5 w-5" fill={favorites.includes(entry.arabic)?'currentColor':'none'} /></button></div></div>
        </article>)}</div> : <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500 dark:border-stone-700">এই শব্দটি পাওয়া যায়নি। বানান পরিবর্তন করে আবার খুঁজুন।</div>}
        <p className="mt-5 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">দ্রষ্টব্য: এটি কুরআনিক ও প্রচলিত আরবি শব্দের একটি প্রাথমিক অফলাইন শব্দভান্ডার। আরবি শব্দের অর্থ বাক্য ও প্রসঙ্গ অনুযায়ী বদলাতে পারে; কুরআনের পূর্ণ তাফসিরের বিকল্প নয়। উচ্চারণ ডিভাইসের Arabic Text-to-Speech সুবিধার ওপর নির্ভরশীল।</p>
      </main>
    </div>
  );
};
