import type { QuranAyah } from '../data/quranSampleData';

const DB_NAME = 'bangla-mushaf-offline';
const STORE_NAME = 'surahs';
const DB_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('এই ডিভাইসে অফলাইন স্টোরেজ সমর্থিত নয়।'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Offline database could not be opened.'));
  });
}

export async function getOfflineSurah(surahId: number, language: string): Promise<QuranAyah[] | null> {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(`${language}:${surahId}`);
      request.onsuccess = () => resolve(request.result?.ayahs ?? null);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function saveOfflineSurah(surahId: number, language: string, ayahs: QuranAyah[]): Promise<void> {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put({
        key: `${language}:${surahId}`,
        surahId,
        language,
        ayahs,
        savedAt: Date.now(),
      });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('Offline save was cancelled.'));
    });
  } finally {
    db.close();
  }
}

export async function getOfflineSurahCount(language: string): Promise<number> {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAllKeys();
      request.onsuccess = () => resolve((request.result as string[]).filter((key) => key.startsWith(`${language}:`)).length);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}
