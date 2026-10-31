import React, { useState } from 'react';
import { LogIn, LogOut, Cloud, CloudCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthButton: React.FC = () => {
  const { user, loading, signIn, signOutUser } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-lg bg-emerald-800/40 animate-pulse flex items-center justify-center">
        <Cloud className="w-3.5 h-3.5 text-emerald-300/50" />
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={signIn}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-amber-200 border border-emerald-700/60 text-xs font-bangla transition-colors shadow-sm"
        title="গুগল দিয়ে সাইন ইন করে বুকমার্ক ও অগ্রগতি সিঙ্ক করুন"
        aria-label="গুগল সাইন ইন"
      >
        <LogIn className="w-3.5 h-3.5 text-amber-300" />
        <span className="hidden md:inline">সাইন ইন</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-emerald-800/60 border border-emerald-700/50 transition-colors"
        aria-label="ইউজার অ্যাকাউন্ট মেনু"
        title={`${user.displayName || 'ইউজার'} - ক্লাউড সিঙ্ক চালু`}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-7 h-7 rounded-full object-cover border border-amber-400"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-amber-400 text-emerald-950 font-bold flex items-center justify-center text-xs">
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
          </div>
        )}
        <CloudCheck className="w-3.5 h-3.5 text-emerald-300 hidden sm:block" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 py-3 px-3 z-50 font-bangla text-stone-800 dark:text-stone-200 animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-stone-100 dark:border-stone-800">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-9 h-9 rounded-full object-cover border border-amber-400"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-amber-400 text-emerald-950 font-bold flex items-center justify-center text-sm">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="font-bold text-xs truncate text-stone-900 dark:text-white">
                  {user.displayName || 'কুরআন পাঠক'}
                </p>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="py-2 space-y-1">
              <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
                <CloudCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>ক্লাউড ফায়ারবেস সিঙ্ক সক্রিয়</span>
              </div>
              <p className="text-[10px] text-stone-400 px-2 leading-relaxed">
                আপনার বুকমার্ক, শেষ পাঠ এবং তাসবীহ গণনা সব ডিভাইসে স্বয়ংক্রিয়ভাবে সিঙ্ক হচ্ছে।
              </p>
            </div>

            <button
              onClick={() => {
                setShowMenu(false);
                signOutUser();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors mt-1 font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট করুন</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
