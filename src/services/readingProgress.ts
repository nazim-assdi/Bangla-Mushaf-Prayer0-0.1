const STORAGE_KEY = 'mushaf_reading_activity_v1';
type ReadingActivity = Record<string, string[]>;

/** Local calendar date (not UTC), so daily goals follow the user's device timezone. */
export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function readActivity(): ReadingActivity {
  if (typeof localStorage === 'undefined') return {};
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>)
        .filter(([date, keys]) => /^\d{4}-\d{2}-\d{2}$/.test(date) &&
          Array.isArray(keys) && keys.every((key) => typeof key === 'string'))
        .map(([date, keys]) => [date, Array.from(new Set(keys as string[]))]),
    );
  } catch {
    return {};
  }
}

function saveActivity(activity: ReadingActivity): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const retainedDates = Object.keys(activity).sort().slice(-400);
    const compact = Object.fromEntries(retainedDates.map((date) => [date, activity[date]]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compact));
  } catch (error) {
    console.warn('Could not save local Quran reading activity:', error);
  }
}

export function getDailyReadCount(date: Date = new Date()): number {
  return readActivity()[getLocalDateKey(date)]?.length ?? 0;
}

/** Counts each ayah once per local day, even if it is marked read repeatedly. */
export function recordAyahRead(verseKey: string, date: Date = new Date()): number {
  if (!/^\d{1,3}:\d{1,3}$/.test(verseKey)) return getDailyReadCount(date);
  const activity = readActivity();
  const dateKey = getLocalDateKey(date);
  const todaysKeys = activity[dateKey] ?? [];
  if (todaysKeys.includes(verseKey)) return todaysKeys.length;

  activity[dateKey] = [...todaysKeys, verseKey];
  saveActivity(activity);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mushaf:reading-progress-updated', {
      detail: { date: dateKey, completedAyahs: activity[dateKey].length },
    }));
  }
  return activity[dateKey].length;
}

/** A streak remains alive during today until the day ends, even before today's first read. */
export function getReadingStreak(date: Date = new Date()): number {
  const activity = readActivity();
  const cursor = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (!activity[getLocalDateKey(cursor)]?.length) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (streak < 400 && activity[getLocalDateKey(cursor)]?.length) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}


/** Reset today's counted reading activity without touching ayah notes or read markers. */
export function clearDailyReadActivity(date: Date = new Date()): void {
  const activity = readActivity();
  const dateKey = getLocalDateKey(date);
  delete activity[dateKey];
  saveActivity(activity);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mushaf:reading-progress-updated', {
      detail: { date: dateKey, completedAyahs: 0 },
    }));
  }
}
