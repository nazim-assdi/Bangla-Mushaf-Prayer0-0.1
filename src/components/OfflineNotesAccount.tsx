import React from 'react';
import { UiLanguage, translateUi } from '../services/i18n';

export const OfflineNotesAccount: React.FC<{ uiLanguage: UiLanguage }> = ({ uiLanguage }) => (
  <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-3">
    <div>
      <h3 className="font-bold text-stone-900 dark:text-white">📝 {translateUi(uiLanguage, 'onlineLogin')}</h3>
      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">অ্যাকাউন্ট বা Firebase প্রয়োজন নেই। আপনার বুকমার্ক, নোট ও পড়ার অগ্রগতি এই ডিভাইসেই সংরক্ষিত থাকবে।</p>
    </div>
    <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
      <strong>Local-only mode</strong>
      <p className="mt-1 text-xs">অন্য ফোনে স্বয়ংক্রিয়ভাবে Sync হবে না। অ্যাপের ডেটা মুছে ফেললে স্থানীয়ভাবে রাখা তথ্য হারাতে পারেন।</p>
    </div>
  </section>
);
