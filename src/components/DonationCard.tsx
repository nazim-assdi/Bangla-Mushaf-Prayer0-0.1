import React, { useState } from 'react';
import { Copy, Heart, Check } from 'lucide-react';

export const DonationCard: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  };

  return (
    <section className="relative mt-5 overflow-hidden rounded-3xl border border-rose-200/80 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-5 shadow-lg dark:border-rose-900/50 dark:from-stone-900 dark:via-stone-900 dark:to-rose-950/30">
      <div aria-hidden="true" className="pointer-events-none absolute -right-4 -top-5 text-6xl opacity-15">🌸</div>
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-5 -left-3 text-6xl opacity-15">🌺</div>
      <div className="relative">
        <div className="mb-2 flex items-center gap-2 text-rose-700 dark:text-rose-300">
          <Heart className="h-5 w-5 fill-current" />
          <span className="text-xs font-bold tracking-widest">SUPPORT THIS PROJECT</span>
        </div>
        <h3 className="font-bangla text-xl font-extrabold text-stone-900 dark:text-white">🌷 কুরআন সেবায় সহযোগিতা করুন</h3>
        <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-stone-300">আপনার অনুদান অ্যাপের উন্নয়ন, নির্ভরযোগ্য কনটেন্ট ও বিনামূল্যে কুরআন সেবা চালু রাখতে সহায়তা করবে। অনুদান সম্পূর্ণ স্বেচ্ছামূলক।</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-pink-200 bg-white/80 p-4 dark:border-stone-700 dark:bg-stone-800/70">
            <p className="text-xs font-semibold text-pink-700 dark:text-pink-300">বিকাশ · Personal</p>
            <p className="mt-1 text-lg font-extrabold tracking-wide text-stone-900 dark:text-white">01602859957</p>
            <button type="button" onClick={() => copy('01602859957', 'bkash')} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-pink-600 px-3 py-2 text-xs font-bold text-white hover:bg-pink-700">
              {copied === 'bkash' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied === 'bkash' ? 'কপি হয়েছে' : 'নম্বর কপি করুন'}
            </button>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-white/80 p-4 dark:border-stone-700 dark:bg-stone-800/70">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Dutch-Bangla Bank · Account</p>
            <p className="mt-1 break-all text-lg font-extrabold tracking-wide text-stone-900 dark:text-white">3001030620034</p>
            <button type="button" onClick={() => copy('3001030620034', 'dbbl')} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold text-white hover:bg-amber-700">
              {copied === 'dbbl' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied === 'dbbl' ? 'কপি হয়েছে' : 'অ্যাকাউন্ট কপি করুন'}
            </button>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-stone-500 dark:text-stone-400">অনুদান পাঠানোর আগে প্রাপকের তথ্য যাচাই করে নিন। এই অ্যাপ কোনো পেমেন্ট স্বয়ংক্রিয়ভাবে গ্রহণ বা যাচাই করে না।</p>
      </div>
    </section>
  );
};
