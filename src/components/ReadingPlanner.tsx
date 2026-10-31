import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Target } from 'lucide-react';
import { UiLanguage, translateUi } from '../services/i18n';

interface PlannerState {
  dailyAyahGoal: number;
  completedAyahs: number;
  updatedDate: string;
}

const STORAGE_KEY = 'mushaf_reading_planner_v1';

export const ReadingPlanner: React.FC<{ uiLanguage: UiLanguage }> = ({ uiLanguage }) => {
  const today = new Date().toISOString().slice(0, 10);
  const [plan, setPlan] = useState<PlannerState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PlannerState;
        if (parsed.updatedDate === today) return parsed;
        return { ...parsed, completedAyahs: 0, updatedDate: today };
      }
    } catch (error) {
      console.warn('Could not restore reading planner:', error);
    }
    return { dailyAyahGoal: 20, completedAyahs: 0, updatedDate: today };
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(plan)); }
    catch (error) { console.warn('Could not save reading planner:', error); }
  }, [plan]);

  const progress = useMemo(() => Math.min(100, Math.round(plan.completedAyahs / Math.max(1, plan.dailyAyahGoal) * 100)), [plan]);
  const updateGoal = (value: number) => setPlan((current) => ({ ...current, dailyAyahGoal: value }));
  const addAyahs = (value: number) => setPlan((current) => ({ ...current, completedAyahs: Math.max(0, current.completedAyahs + value), updatedDate: today }));

  return (
    <main className="mx-auto max-w-3xl space-y-5 px-4 py-7 pb-32">
      <header className="rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 p-6 text-white shadow-lg">
        <div className="flex items-center gap-3"><CalendarDays className="h-7 w-7 text-amber-300" /><div><p className="text-xs uppercase tracking-widest text-emerald-200">{translateUi(uiLanguage, 'dailyQuranPlan')}</p><h1 className="text-2xl font-extrabold">{translateUi(uiLanguage, 'readingPlannerTitle')}</h1></div></div>
        <p className="mt-3 text-sm text-emerald-100/80">{translateUi(uiLanguage, 'plannerDisclaimer')}</p>
      </header>
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-bold text-stone-900 dark:text-white"><Target className="h-5 w-5 text-emerald-600" />{translateUi(uiLanguage, 'setGoal')}</h2><span className="text-xs text-stone-500">{new Date().toLocaleDateString()}</span></div>
        <label className="mt-5 block text-sm text-stone-600 dark:text-stone-300">{translateUi(uiLanguage, 'ayahsPerDay')}: <strong>{plan.dailyAyahGoal}</strong></label>
        <input type="range" min="1" max="100" step="1" value={plan.dailyAyahGoal} onChange={(event) => updateGoal(Number(event.target.value))} className="mt-2 w-full accent-emerald-600" />
        <div className="mt-5 flex items-end justify-between"><div><p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">{plan.completedAyahs}<span className="text-base font-medium text-stone-500"> / {plan.dailyAyahGoal}</span></p><p className="text-xs text-stone-500">{translateUi(uiLanguage, 'completedToday')}</p></div><span className="text-2xl font-extrabold text-amber-600">{progress}%</span></div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800"><div className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-amber-400 transition-all" style={{ width: `${progress}%` }} /></div>
        <div className="mt-5 flex flex-wrap gap-2">
          {[1,5,10].map((n) => <button key={n} onClick={() => addAyahs(n)} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-600">+{n} {translateUi(uiLanguage, 'addAyah')}</button>)}
          <button onClick={() => setPlan((current) => ({ ...current, completedAyahs: 0, updatedDate: today }))} className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-600 dark:border-stone-700 dark:text-stone-300">{translateUi(uiLanguage, 'resetToday')}</button>
        </div>
        {progress >= 100 && <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="h-5 w-5" />{translateUi(uiLanguage, 'goalComplete')}</p>}
      </section>
      <p className="text-xs leading-relaxed text-stone-500">{translateUi(uiLanguage, 'plannerDisclaimer')}</p>
    </main>
  );
};
