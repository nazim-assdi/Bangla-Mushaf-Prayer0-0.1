import React, { useEffect, useState } from 'react';
import { CheckCircle2, Download, HardDrive, LoaderCircle, Trash2, Flower2, ChevronDown } from 'lucide-react';
import { clearOfflineLanguageCache, downloadFullQuranOffline, QURAN_LANGUAGES, QuranLanguage } from '../services/multiLangQuran';
import { deleteOfflineLanguage, getOfflineSurahCount } from '../services/offlineQuranStore';
import { UiLanguage, translateUi } from '../services/i18n';

const languageNote: Partial<Record<QuranLanguage, string>> = {
  bn: 'বাংলা অনুবাদ', en: 'English translation', hi: 'हिन्दी अनुवाद', ur: 'اردو ترجمہ', tr: 'Türkçe meal',
};

export const OfflineQuranDownload: React.FC<{ uiLanguage: UiLanguage }> = ({ uiLanguage }) => {
  const [saved, setSaved] = useState<Record<string, number>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [selectedLanguage, setSelectedLanguage] = useState<QuranLanguage>('bn');
  const [downloading, setDownloading] = useState<QuranLanguage | null>(null);
  const [message, setMessage] = useState('');

  const refreshCounts = async () => {
    const counts: Record<string, number> = {};
    await Promise.all(QURAN_LANGUAGES.map(async (lang) => { counts[lang.code] = await getOfflineSurahCount(lang.code).catch(() => 0); }));
    setSaved(counts);
  };
  useEffect(() => { void refreshCounts(); }, []);

  const handleDownload = async () => {
    const lang = selectedLanguage;
    if (downloading) return;
    setDownloading(lang);
    setMessage(`${QURAN_LANGUAGES.find((item) => item.code === lang)?.nativeName} ডাউনলোড হচ্ছে…`);
    try {
      await downloadFullQuranOffline(lang, (done) => {
        setProgress((current) => ({ ...current, [lang]: done }));
        setSaved((current) => ({ ...current, [lang]: done }));
      });
      setMessage(`${QURAN_LANGUAGES.find((item) => item.code === lang)?.nativeName} সম্পূর্ণ সংরক্ষিত হয়েছে।`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'ডাউনলোড সম্পন্ন হয়নি। আবার চেষ্টা করুন।');
      await refreshCounts();
    } finally { setDownloading(null); }
  };

  const handleDelete = async () => {
    const lang = selectedLanguage;
    const name = QURAN_LANGUAGES.find((item) => item.code === lang)?.nativeName;
    if (!window.confirm(`${name} ভাষার অফলাইন কনটেন্ট মুছে ফেলবেন?`)) return;
    try {
      await deleteOfflineLanguage(lang);
      clearOfflineLanguageCache(lang);
      setSaved((current) => ({ ...current, [lang]: 0 }));
      setProgress((current) => ({ ...current, [lang]: 0 }));
      setMessage('নির্বাচিত ভাষার অফলাইন কনটেন্ট মুছে ফেলা হয়েছে।');
    } catch { setMessage('মুছে ফেলা যায়নি। আবার চেষ্টা করুন।'); }
  };

  const selected = QURAN_LANGUAGES.find((lang) => lang.code === selectedLanguage) || QURAN_LANGUAGES[0];
  const count = saved[selectedLanguage] || 0;
  const percent = Math.min(100, Math.round(((progress[selectedLanguage] ?? count) / 114) * 100));
  const isBusy = downloading === selectedLanguage;
  const totalSaved = Object.values(saved).reduce((sum, value) => sum + value, 0);

  return (
    <section className="mx-auto mb-5 w-full max-w-7xl px-3 sm:px-6 font-bangla">
      <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-4 shadow-md dark:border-stone-800 dark:from-stone-900 dark:via-stone-900 dark:to-emerald-950/40 sm:p-5">
        <div aria-hidden="true" className="pointer-events-none absolute -right-3 -top-4 text-6xl opacity-10">🌼</div>
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"><HardDrive className="h-6 w-6" /></div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-extrabold text-stone-900 dark:text-white">🌸 {translateUi(uiLanguage, 'offlineLibrary')}</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400">{translateUi(uiLanguage, 'downloadHint')}</p>
            </div>
            <span className="hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 sm:inline-flex"><Flower2 className="mr-1 h-3.5 w-3.5" />{totalSaved} {translateUi(uiLanguage, 'savedCount')}</span>
          </div>
          <div className="mt-4 rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm dark:border-stone-700 dark:bg-stone-800/80">
            <label htmlFor="offline-quran-language" className="mb-2 block text-sm font-bold text-stone-900 dark:text-white">ডাউনলোডের ভাষা নির্বাচন করুন</label>
            <div className="relative">
              <select id="offline-quran-language" value={selectedLanguage} onChange={(event) => setSelectedLanguage(event.target.value as QuranLanguage)} disabled={!!downloading} className="min-h-12 w-full appearance-none rounded-xl border border-emerald-200 bg-white px-4 pr-10 text-sm font-semibold text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 dark:border-stone-600 dark:bg-stone-900 dark:text-white">
                {QURAN_LANGUAGES.map((lang) => <option key={lang.code} value={lang.code}>{lang.nativeName} — {languageNote[lang.code] || lang.name}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-stone-700 dark:text-stone-200">{selected.nativeName}</span>
              <span className="rounded-full bg-emerald-50 px-2 py-1 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{count}/114</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-700"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all" style={{ width: `${percent}%` }} /></div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => void handleDownload()} disabled={!!downloading || count === 114} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50">
                {isBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : count === 114 ? <CheckCircle2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                {isBusy ? translateUi(uiLanguage, 'downloading') : count === 114 ? translateUi(uiLanguage, 'saved') : count ? translateUi(uiLanguage, 'resumeDownload') : translateUi(uiLanguage, 'download')}
              </button>
              <button type="button" onClick={() => void handleDelete()} disabled={!!downloading || count === 0} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40" aria-label={`${selected.nativeName} ${translateUi(uiLanguage, 'delete')}`} title={translateUi(uiLanguage, 'delete')}><Trash2 className="h-4 w-4" />{translateUi(uiLanguage, 'delete')}</button>
            </div>
          </div>
          <p className="mt-3 text-xs text-stone-600 dark:text-stone-300" aria-live="polite">{message || translateUi(uiLanguage, 'downloadHint')}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">প্রথম ডাউনলোডে ইন্টারনেট ও পর্যাপ্ত স্টোরেজ লাগবে। অডিও আলাদাভাবে ডাউনলোড হয় না। আরবি মূল পাঠ আলাদা; এই তালিকায় শুধু অনুবাদের রিসোর্স রাখা হয়েছে।</p>
        </div>
      </div>
    </section>
  );
};
