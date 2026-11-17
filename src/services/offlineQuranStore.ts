import type { QuranAyah } from '../data/quranSampleData';

const DB_NAME = 'bangla-mushaf-offline';
const STORE_NAME = 'surahs';
const DB_VERSION = 1;

let databasePromise: Promise<IDBDatabase> | null = null;

/**
 * Reuse one IndexedDB connection for the lifetime of the app.
 * Opening and closing the database for every chapter made the initial offline
 * download unnecessarily slow and created avoidable connection churn.
 */
function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('এই ডিভাইসে অফলাইন স্টোরেজ সমর্থিত নয়।'));
  }

  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          databasePromise = null;
        };
        resolve(db);
      };

      request.onerror = () => {
        databasePromise = null;
        reject(request.error || new Error('Offline database could not be opened.'));
      };

      request.onblocked = () => {
        databasePromise = null;
        reject(new Error('Offline database is busy. Close other app windows and try again.'));
      };
    });
  }

  return databasePromise;
}

export async function getOfflineSurah(surahId: number, language: string): Promise<QuranAyah[] | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    let request: IDBRequest;
    try {
      request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(`${language}:${surahId}`);
    } catch (error) {
      reject(error);
      return;
    }

    request.onsuccess = () => {
      const ayahs = request.result?.ayahs;
      resolve(Array.isArray(ayahs) ? ayahs as QuranAyah[] : null);
    };
    request.onerror = () => reject(request.error || new Error('Offline chapter could not be read.'));
  });
}

export async function saveOfflineSurah(surahId: number, language: string, ayahs: QuranAyah[]): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    let transaction: IDBTransaction;
    try {
      transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put({
        key: `${language}:${surahId}`,
        surahId,
        language,
        ayahs,
        savedAt: Date.now(),
      });
    } catch (error) {
      reject(error);
      return;
    }

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('Offline chapter could not be saved.'));
    transaction.onabort = () => reject(transaction.error || new Error('Offline save was cancelled.'));
  });
}

export async function deleteOfflineSurah(surahId: number, language: string): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    let transaction: IDBTransaction;
    try {
      transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(`${language}:${surahId}`);
    } catch (error) {
      reject(error);
      return;
    }

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('Offline chapter could not be deleted.'));
    transaction.onabort = () => reject(transaction.error || new Error('Offline delete was cancelled.'));
  });
}

export async function deleteOfflineLanguage(language: string): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    let transaction: IDBTransaction;
    try {
      transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        (request.result as IDBValidKey[])
          .filter((key) => typeof key === 'string' && key.startsWith(`${language}:`))
          .forEach((key) => store.delete(key));
      };
      request.onerror = () => transaction.abort();
    } catch (error) {
      reject(error);
      return;
    }

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('Offline language could not be deleted.'));
    transaction.onabort = () => reject(transaction.error || new Error('Offline delete was cancelled.'));
  });
}

export async function getOfflineSurahCount(language: string): Promise<number> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    let request: IDBRequest;
    try {
      request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAllKeys();
    } catch (error) {
      reject(error);
      return;
    }

    request.onsuccess = () => {
      const keys = request.result as IDBValidKey[];
      resolve(keys.filter((key) => typeof key === 'string' && key.startsWith(`${language}:`)).length);
    };
    request.onerror = () => reject(request.error || new Error('Offline library could not be checked.'));
  });
}
