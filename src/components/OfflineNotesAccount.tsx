import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UiLanguage, translateUi } from '../services/i18n';

export const OfflineNotesAccount: React.FC<{ uiLanguage: UiLanguage }> = ({ uiLanguage }) => {
  const { user, loading, signIn, signOutUser } = useAuth();

  return (
    <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-3">
      <div>
        <h3 className="font-bold text-stone-900 dark:text-white">📝 {translateUi(uiLanguage, 'onlineLogin')}</h3>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{translateUi(uiLanguage, 'loginHelp')}</p>
      </div>
      {loading ? (
        <p className="text-sm text-stone-500">{translateUi(uiLanguage, 'accountChecking')}</p>
      ) : user ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-emerald-800 dark:text-emerald-300">{translateUi(uiLanguage, 'signedIn')}: <strong>{user.displayName || user.email || 'Google account'}</strong></p>
          <button type="button" onClick={() => void signOutUser()} className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold dark:border-stone-700">{translateUi(uiLanguage, 'signOut')}</button>
        </div>
      ) : (
        <button type="button" onClick={() => void signIn()} className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white">{translateUi(uiLanguage, 'googleSignIn')}</button>
      )}
      <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">{translateUi(uiLanguage, 'cloudSyncNote')}</p>
    </section>
  );
};
