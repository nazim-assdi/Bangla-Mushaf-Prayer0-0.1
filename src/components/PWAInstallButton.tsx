import React, { useState } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs transition-transform hover:scale-105 shadow-sm"
        title="অ্যাপটি ইন্সটল করুন (অফলাইন ব্যবহারের জন্য)"
        aria-label="ইন্সটল অ্যাপ"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">ইন্সটল করুন</span>
        <span className="sm:hidden">ইন্সটল</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-amber-300 border border-amber-400/30 text-xs font-semibold transition-colors"
          title="আইফোনে অফলাইনে ইন্সটল করুন"
          aria-label="আইফোনে ইন্সটল"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">iOS ইন্সটল</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
            role="dialog"
            aria-modal="true"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 p-6 shadow-2xl border border-stone-200 dark:border-stone-800 font-bangla space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-stone-900 dark:text-white">
                    আইফোনে অ্যাপ ইন্সটল
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                <p className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    ১
                  </span>
                  <span>
                    Safari ব্রাউজারের নিচে থাকা <strong>Share (শেয়ার)</strong> আইকনে চাপ দিন।
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    ২
                  </span>
                  <span>
                    নিচে স্ক্রোল করে <strong>Add to Home Screen (হোম স্ক্রিনে যোগ করুন)</strong> নির্বাচন করুন।
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    ৩
                  </span>
                  <span>
                    উপরে <strong>Add</strong> বাটনে ক্লিক করলেই ইন্টারনেট ছাড়াও সরাসরি অ্যাপ হিসেবে চলবে!
                  </span>
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors"
              >
                বুঝেছি
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
