import React, { useEffect, useState } from 'react';
import { createOfflineNoteAccount, getOfflineNoteUser, loginOfflineNoteAccount, logoutOfflineNoteAccount } from '../services/offlineNotesAuth';

export const OfflineNotesAccount: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeUser, setActiveUser] = useState<string | null>(() => getOfflineNoteUser());
  const [mode, setMode] = useState<'login' | 'create'>('create');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const refresh = () => setActiveUser(getOfflineNoteUser());
    window.addEventListener('mushaf-offline-note-account-change', refresh);
    return () => window.removeEventListener('mushaf-offline-note-account-change', refresh);
  }, []);

  const submit = async () => {
    setBusy(true); setMessage('');
    try {
      if (mode === 'create') await createOfflineNoteAccount(username, password);
      else await loginOfflineNoteAccount(username, password);
      setActiveUser(getOfflineNoteUser());
      setPassword('');
      setMessage('এই ডিভাইসে অফলাইন অ্যাকাউন্ট চালু হয়েছে।');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'অ্যাকাউন্ট চালু করা যায়নি।');
    } finally { setBusy(false); }
  };

  return (
    <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-3">
      <div>
        <h3 className="font-bold text-stone-900 dark:text-white">📝 অফলাইন নোট অ্যাকাউন্ট</h3>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">ইন্টারনেট ছাড়াই এই ফোনে অ্যাকাউন্ট তৈরি ও লগইন করুন। নোট ও পড়ার তথ্য ডিভাইসেই থাকবে।</p>
      </div>
      {activeUser ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-emerald-800 dark:text-emerald-300">লগইন করা আছে: <strong>{activeUser}</strong></p>
          <button type="button" onClick={() => { logoutOfflineNoteAccount(); setMessage('লগআউট হয়েছে।'); }} className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold dark:border-stone-700">লগআউট</button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setMode('create'); setMessage(''); }} className={`rounded-lg px-3 py-2 text-xs font-bold ${mode === 'create' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'}`}>নতুন অ্যাকাউন্ট</button>
            <button type="button" onClick={() => { setMode('login'); setMessage(''); }} className={`rounded-lg px-3 py-2 text-xs font-bold ${mode === 'login' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'}`}>লগইন</button>
          </div>
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" placeholder="ইউজারনেম" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm dark:border-stone-700 dark:bg-stone-800 dark:text-white" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete={mode === 'create' ? 'new-password' : 'current-password'} placeholder="পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm dark:border-stone-700 dark:bg-stone-800 dark:text-white" />
          <button type="button" disabled={busy} onClick={() => void submit()} className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? 'অপেক্ষা করুন…' : mode === 'create' ? 'অফলাইন অ্যাকাউন্ট তৈরি করুন' : 'অফলাইনে লগইন করুন'}</button>
        </>
      )}
      {message && <p role="status" className="text-xs text-emerald-700 dark:text-emerald-300">{message}</p>}
      <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">সীমাবদ্ধতা: এটি শুধু এই ডিভাইসের স্থানীয় অ্যাকাউন্ট—অন্য ফোনে নোট সিঙ্ক হবে না। অ্যাপের ডেটা মুছে ফেললে অ্যাকাউন্ট ও নোট হারাতে পারে; ব্যাকআপ/রিস্টোর আলাদা করে যোগ করতে হবে।</p>
    </section>
  );
};
