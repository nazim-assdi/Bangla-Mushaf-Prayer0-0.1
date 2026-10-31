import React, { useEffect, useState } from 'react';
import { CheckCircle2, Download, HardDrive, LoaderCircle } from 'lucide-react';
import { downloadFullQuranOffline } from '../services/multiLangQuran';
import { getOfflineSurahCount } from '../services/offlineQuranStore';

export const OfflineQuranDownload: React.FC = () => {
  const [saved, setSaved] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getOfflineSurahCount('bn').then(setSaved).catch(() => setSaved(0));
  }, []);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    setMessage('ডাউনলোড শুরু হচ্ছে…');
    setCompleted(saved);
    try {
      await downloadFullQuranOffline('bn', (done, total) => {
        setCompleted(done);
        setSaved(done);
        setMessage(`${done} / ${total} সূরা সংরক্ষিত`);
      });
      setMessage('সম্পূর্ণ কুরআন অফলাইনে সংরক্ষিত হয়েছে।');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'ডাউনলোড সম্পন্ন হয়নি। আবার চেষ্টা করুন।');
    } finally {
      setDownloading(false);
    }
  };

  const percent = Math.round((completed / 114) * 100);

  return (
    <section className="mx-auto w-full max-w-7xl px-3 sm:px-6 mb-4 font-bangla">
      <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-white">কুরআন অফলাইনে সংরক্ষণ</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">আরবি আয়াত ও বাংলা অনুবাদ · ১১৪টি সূরা</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || saved === 114}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : saved === 114 ? <CheckCircle2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
            {downloading ? 'ডাউনলোড হচ্ছে…' : saved === 114 ? 'সম্পূর্ণ সংরক্ষিত' : saved > 0 ? 'বাকি সূরা ডাউনলোড' : 'সম্পূর্ণ কুরআন ডাউনলোড'}
          </button>
        </div>
        {(downloading || saved > 0 || message) && (
          <div className="mt-3">
            <div className="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
              <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-xs text-stone-600 dark:text-stone-300" aria-live="polite">
              {message || `${saved} / 114 সূরা এই ডিভাইসে সংরক্ষিত`}
            </p>
          </div>
        )}
        <p className="mt-2 text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
          প্রথমবার ডাউনলোডে ইন্টারনেট ও পর্যাপ্ত স্টোরেজ লাগবে। তিলাওয়াতের অডিও আলাদাভাবে অফলাইনে সংরক্ষিত হয় না।
        </p>
      </div>
    </section>
  );
};
