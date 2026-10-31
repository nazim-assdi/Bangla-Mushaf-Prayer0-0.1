import React from 'react';
import { useAuth } from '../context/AuthContext';

export const OfflineNotesAccount: React.FC = () => {
  const { user, loading, signIn, signOutUser } = useAuth();

  return (
    <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-3">
      <div>
        <h3 className="font-bold text-stone-900 dark:text-white">📝 অনলাইন অ্যাকাউন্ট</h3>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">লগইন করতে ইন্টারনেট লাগবে। লগইন না করেও কুরআন পড়া, নোট লেখা ও সংরক্ষণ সম্পূর্ণ অফলাইনে করা যাবে।</p>
      </div>
      {loading ? (
        <p className="text-sm text-stone-500">অ্যাকাউন্টের অবস্থা যাচাই হচ্ছে…</p>
      ) : user ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-emerald-800 dark:text-emerald-300">লগইন করা আছে: <strong>{user.displayName || user.email || 'Google account'}</strong></p>
          <button type="button" onClick={() => void signOutUser()} className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold dark:border-stone-700">লগআউট</button>
        </div>
      ) : (
        <button type="button" onClick={() => void signIn()} className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white">Google দিয়ে অনলাইনে লগইন করুন</button>
      )}
      <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">নোট এই ডিভাইসে অফলাইনে সংরক্ষিত থাকে। অনলাইন লগইন চালু আছে; নোটের ক্লাউড ব্যাকআপ/অন্য ডিভাইসে সিঙ্ক আলাদা ফিচার এবং এখনো সক্রিয় নয়।</p>
    </section>
  );
};
