import React, { useState } from 'react';
import { BookCheck, NotebookPen, Save } from 'lucide-react';
import { UiLanguage, translateUi } from '../services/i18n';

interface AyahStudyToolsProps {
  read: boolean;
  note: string;
  onToggleRead: () => void;
  onNoteChange: (value: string) => void;
  uiLanguage: UiLanguage;
}

export const AyahStudyTools: React.FC<AyahStudyToolsProps> = ({ read, note, onToggleRead, onNoteChange, uiLanguage }) => {
  const [editing, setEditing] = useState(false);
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3 dark:border-stone-800">
      <button type="button" onClick={onToggleRead} className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${read ? 'bg-emerald-700 text-white' : 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'}`}>
        <BookCheck className="h-4 w-4" />{read ? translateUi(uiLanguage, 'readDone') : translateUi(uiLanguage, 'markRead')}
      </button>
      <button type="button" onClick={() => setEditing((value) => !value)} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-amber-200 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-300 dark:hover:bg-amber-950/30">
        <NotebookPen className="h-4 w-4" />{editing ? translateUi(uiLanguage, 'noteClose') : note ? translateUi(uiLanguage, 'noteView') : translateUi(uiLanguage, 'noteWrite')}
      </button>
      {editing && (
        <div className="w-full">
          <textarea value={note} onChange={(event) => onNoteChange(event.target.value)} rows={3} maxLength={2000} placeholder={translateUi(uiLanguage, 'notePlaceholder')} className="w-full rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-sm text-stone-800 outline-none focus:ring-2 focus:ring-amber-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100" />
          <p className="mt-1 flex items-center gap-1 text-[11px] text-stone-500"><Save className="h-3 w-3" />{translateUi(uiLanguage, 'noteSavedLocally')} · {note.length}/2000</p>
        </div>
      )}
    </div>
  );
};
