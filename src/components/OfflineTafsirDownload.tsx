import React, { useCallback, useEffect, useState } from 'react';
import { Download, Trash2, BookOpen } from 'lucide-react';
import { UiLanguage, translateUi } from '../services/i18n';
import { TAFSIR_RESOURCES, clearOfflineTafsirResource, downloadTafsirResource, getOfflineTafsirCount } from '../services/offlineTafsir';

interface TafsirProgress {
  surah: number;
  total: number;
  entries: number;
}

export const OfflineTafsirDownload: React.FC<{ uiLanguage: UiLanguage }> = ({ uiLanguage }) => {
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [activeId, setActiveId] = useState<number | null>(null);
  const [progress, setProgress] = useState<TafsirProgress | null>(null);
  const [message, setMessage] = useState('');

  const refreshCounts = useCallback(async () => {
    const entries = await Promise.all(TAFSIR_RESOURCES.map(async (resource) => [resource.id, await getOfflineTafsirCount(resource.id)] as const));
    setCounts(Object.fromEntries(entries));
  }, []);

  useEffect(() => { void refreshCounts(); }, [refreshCounts]);

  const handleDownload = async (resourceId: number) => {
    setActiveId(resourceId);
    setProgress({ surah: 0, total: 114, entries: 0 });
    setMessage('');
    try {
      const count = await downloadTafsirResource(resourceId, setProgress);
      setCounts((current) => ({ ...current, [resourceId]: count }));
      setMessage(translateUi(uiLanguage, 'tafsirDownloadDone'));
    } catch (error) {
      console.error('Offline tafsir download failed:', error);
      setMessage(translateUi(uiLanguage, 'tafsirDownloadError'));
    } finally {
      setActiveId(null);
      setProgress(null);
      await refreshCounts();
    }
  };

  const handleDelete = async (resourceId: number) => {
    const confirmed = window.confirm(translateUi(uiLanguage, 'deleteTafsir') + '?');
    if (!confirmed) return;
    try {
      await clearOfflineTafsirResource(resourceId);
      await refreshCounts();
    } catch (error) {
      console.error('Could not clear offline tafsir:', error);
      setMessage(translateUi(uiLanguage, 'tafsirDownloadError'));
    }
  };

  return (
    <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-3">
      <h3 className="flex items-center gap-2 font-bold text-stone-900 dark:text-white"><BookOpen className="h-5 w-5 text-amber-600" />{translateUi(uiLanguage, 'offlineTafsir')}</h3>
      <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">{translateUi(uiLanguage, 'tafsirDownloadHelp')}</p>
      <div className="space-y-2">
        {TAFSIR_RESOURCES.map((resource) => {
          const count = counts[resource.id] || 0;
          const isActive = activeId === resource.id;
          return (
            <div key={resource.id} className="rounded-xl border border-stone-200 p-3 dark:border-stone-700">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stone-900 dark:text-white">{resource.name}</p>
                  <p className="text-[11px] text-stone-500">{resource.author} · {resource.languageName}</p>
                  {count > 0 && <p className="mt-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">{translateUi(uiLanguage, 'tafsirSaved')} · {count.toLocaleString()}</p>}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" disabled={activeId !== null} onClick={() => void handleDownload(resource.id)} className="flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
                    <Download className="h-3.5 w-3.5" />{isActive ? translateUi(uiLanguage, 'tafsirDownloading') : translateUi(uiLanguage, 'downloadTafsir')}
                  </button>
                  {count > 0 && <button type="button" disabled={activeId !== null} onClick={() => void handleDelete(resource.id)} aria-label={translateUi(uiLanguage, 'deleteTafsir')} className="rounded-lg border border-stone-300 p-2 text-stone-600 dark:border-stone-700 dark:text-stone-300"><Trash2 className="h-4 w-4" /></button>}
                </div>
              </div>
              {isActive && progress && (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[10px] text-stone-500"><span>{translateUi(uiLanguage, 'tafsirDownloading')}</span><span>{progress.surah}/114 · {progress.entries}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800"><div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${progress.surah / 114 * 100}%` }} /></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">{translateUi(uiLanguage, 'tafsirStorageNote')}</p>
      {message && <p role="status" className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{message}</p>}
    </section>
  );
};
