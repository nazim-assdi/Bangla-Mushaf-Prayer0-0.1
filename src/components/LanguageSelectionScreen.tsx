import React from 'react';
import { UI_LANGUAGES, UiLanguage, translateUi } from '../services/i18n';

interface LanguageSelectionScreenProps {
  selectedLanguage: UiLanguage;
  onSelect: (language: UiLanguage) => void;
  onContinue: () => void;
  firstLaunch?: boolean;
}

export const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({ selectedLanguage, onSelect, onContinue, firstLaunch = false }) => {
  const selected = UI_LANGUAGES.find((item) => item.code === selectedLanguage) ?? UI_LANGUAGES[1];
  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-950 px-5 py-10 text-white" dir={selected.dir}>
      <div className="mx-auto flex min-h-[80dvh] w-full max-w-xl flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-200/40 bg-amber-300/10 text-5xl">📖</div>
          <p className="text-xs font-semibold tracking-[0.24em] text-amber-300">AL-QURAN AL-KAREEM</p>
          <h1 className="mt-3 text-2xl font-extrabold">{translateUi(selectedLanguage, 'chooseLanguage')}</h1>
          <p className="mt-2 text-sm text-emerald-100/75">{translateUi(selectedLanguage, 'welcome')}</p>
          <p className="mt-2 text-xs text-emerald-100/55">Select your preferred app language</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {UI_LANGUAGES.map((language) => (
            <button key={language.code} type="button" onClick={() => onSelect(language.code)} aria-pressed={selectedLanguage === language.code}
              className={`min-h-20 rounded-2xl border p-4 text-center transition ${selectedLanguage === language.code ? 'border-amber-300 bg-amber-300 text-emerald-950 shadow-lg' : 'border-white/15 bg-white/5 text-white hover:bg-white/10'}`}>
              <span className="block text-xl font-bold" lang={language.code}>{language.nativeName}</span>
              <span className="mt-1 block text-[11px] opacity-75">{language.name}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={onContinue} className="mt-7 min-h-12 rounded-2xl bg-amber-400 px-5 py-3 font-extrabold text-emerald-950 shadow-lg hover:bg-amber-300">
          {translateUi(selectedLanguage, 'continue')}
        </button>
        {!firstLaunch && <p className="mt-4 text-center text-xs text-emerald-100/50">Your Quran text and translation download choices are managed separately.</p>}
      </div>
    </main>
  );
};
