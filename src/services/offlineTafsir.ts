export interface TafsirResource {
  id: number;
  name: string;
  author: string;
  languageCode: string;
  languageName: string;
}

export const TAFSIR_RESOURCES: TafsirResource[] = [
  { id: 169, name: 'Ibn Kathir (Abridged)', author: 'Hafiz Ibn Kathir', languageCode: 'en', languageName: 'English' },
  { id: 168, name: "Ma'arif al-Qur'an", author: 'Mufti Muhammad Shafi', languageCode: 'en', languageName: 'English' },
  { id: 381, name: 'Tafsir Fathul Majid', author: 'AbdulRahman Bin Hasan Al-Alshaikh', languageCode: 'bn', languageName: 'Bengali' },
  { id: 165, name: 'Tafsir Ahsanul Bayaan', author: 'Bayaan Foundation', languageCode: 'bn', languageName: 'Bengali' },
  { id: 166, name: 'Tafsir Abu Bakr Zakaria', author: 'King Fahd Quran Printing Complex', languageCode: 'bn', languageName: 'Bengali' },
  { id: 164, name: 'Tafseer Ibn Kathir', author: 'Tawheed Publication', languageCode: 'bn', languageName: 'Bengali' },
  { id: 16, name: 'Tafsir Muyassar', author: 'المیسر', languageCode: 'ar', languageName: 'Arabic' },
  { id: 14, name: 'Tafsir Ibn Kathir', author: 'Hafiz Ibn Kathir', languageCode: 'ar', languageName: 'Arabic' },
  { id: 157, name: 'Fi Zilal al-Quran', author: 'Sayyid Ibrahim Qutb', languageCode: 'ur', languageName: 'Urdu' },
  { id: 160, name: 'Tafsir Ibn Kathir', author: 'Hafiz Ibn Kathir', languageCode: 'ur', languageName: 'Urdu' },
  { id: 170, name: "Al-Sa'di", author: 'Saddi', languageCode: 'ru', languageName: 'Russian' },
  { id: 804, name: 'Rebar Kurdish Tafsir', author: 'Rebar Kurdish Tafsir', languageCode: 'ku', languageName: 'Kurdish' },
];

export interface OfflineTafsirRecord {
  key: string;
  resourceId: number;
  resourceName: string;
  authorName: string;
  languageCode: string;
  languageName: string;
  surahId: number;
  verseKey: string;
  text: string;
}

const DB_NAME = 'mushaf-tafsir-library-v1';
const STORE_NAME = 'tafsir_entries';

function openTafsirDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('resourceId', 'resourceId', { unique: false });
        store.createIndex('surahId', 'surahId', { unique: false });
        store.createIndex('verseKey', 'verseKey', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function saveTafsirRecords(records: OfflineTafsirRecord[]): Promise<void> {
  if (!records.length) return Promise.resolve();
  return openTafsirDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    records.forEach((record) => store.put(record));
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  }));
}

function stripMarkup(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

export async function downloadTafsirResource(
  resourceId: number,
  onProgress?: (progress: { surah: number; total: number; entries: number }) => void,
): Promise<number> {
  const resource = TAFSIR_RESOURCES.find((item) => item.id === resourceId);
  if (!resource) throw new Error('Unknown tafsir resource');
  let totalEntries = 0;

  for (let surahId = 1; surahId <= 114; surahId += 1) {
    const chapterRecords: OfflineTafsirRecord[] = [];
    let page = 1;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      let response: Response;
      try {
        response = await fetch(
          `https://api.quran.com/api/v4/verses/by_chapter/${surahId}?tafsirs=${resourceId}&per_page=50&page=${page}`,
          { signal: controller.signal },
        );
      } finally {
        clearTimeout(timeoutId);
      }
      if (!response.ok) throw new Error(`Tafsir API error: HTTP ${response.status}`);
      const data = await response.json();
      const verses = Array.isArray(data.verses) ? data.verses : [];
      if (!verses.length) break;

      for (const verse of verses) {
        const tafsir = Array.isArray(verse.tafsirs)
          ? verse.tafsirs.find((item: any) => Number(item.id) === resourceId)
          : null;
        const text = tafsir?.text ? stripMarkup(String(tafsir.text)) : '';
        if (!text) continue;
        chapterRecords.push({
          key: `${resourceId}:${verse.verse_key}`,
          resourceId,
          resourceName: resource.name,
          authorName: resource.author,
          languageCode: resource.languageCode,
          languageName: resource.languageName,
          surahId,
          verseKey: String(verse.verse_key),
          text,
        });
      }

      if (data.pagination?.next_page) page = data.pagination.next_page;
      else if (verses.length === 50) page += 1;
      else break;
    }

    await saveTafsirRecords(chapterRecords);
    totalEntries += chapterRecords.length;
    onProgress?.({ surah: surahId, total: 114, entries: totalEntries });
  }

  if (totalEntries === 0) throw new Error('No tafsir entries were returned for this resource');
  return totalEntries;
}

export async function getOfflineTafsirForSurah(surahId: number): Promise<OfflineTafsirRecord[]> {
  const db = await openTafsirDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).index('surahId').getAll(surahId);
    request.onsuccess = () => { db.close(); resolve(request.result as OfflineTafsirRecord[]); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

export async function getOfflineTafsirCount(resourceId: number): Promise<number> {
  const db = await openTafsirDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).index('resourceId').count(resourceId);
    request.onsuccess = () => { db.close(); resolve(request.result); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

export async function clearOfflineTafsirResource(resourceId: number): Promise<void> {
  const db = await openTafsirDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const index = tx.objectStore(STORE_NAME).index('resourceId');
    const request = index.openCursor(IDBKeyRange.only(resourceId));
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) { cursor.delete(); cursor.continue(); }
    };
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  });
}
