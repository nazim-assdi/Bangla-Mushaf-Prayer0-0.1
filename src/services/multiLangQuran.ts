/**
 * Multi-language Quran service with memory + IndexedDB caching.
 * Duplicate requests for the same chapter are shared, while reciter audio URLs
 * are derived at playback time so changing reciters never reloads Quran text.
 */
import { QuranAyah, QuranWord } from '../data/quranSampleData';
import { SURAH_LIST } from '../data/quranMetadata';
import { getAyahAudioUrl } from './quranApi';
import { toArabicNumber } from '../utils/banglaNumbers';
import { getOfflineSurah, getOfflineSurahCount, saveOfflineSurah } from './offlineQuranStore';

export type QuranLanguage = 'bn' | 'en' | 'ar' | 'hi' | 'ur' | 'tr';

export interface LanguageMeta {
  code: QuranLanguage;
  name: string;
  nativeName: string;
  translationId: number;
}

export const QURAN_LANGUAGES: LanguageMeta[] = [
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', translationId: 163 },
  { code: 'en', name: 'English', nativeName: 'English', translationId: 131 },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية (التفسير الميسر)', translationId: 16 },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', translationId: 122 },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', translationId: 97 },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', translationId: 77 },
];

const multiLangCache: Record<string, QuranAyah[]> = {};
const persistedCacheKeys = new Set<string>();
const inFlightLoads = new Map<string, Promise<QuranAyah[]>>();

let bengaliAutoDownloadPromise: Promise<void> | null = null;
let bengaliAutoDownloadComplete = false;

export function clearOfflineLanguageCache(lang: QuranLanguage): void {
  Object.keys(multiLangCache).forEach((key) => {
    if (key.endsWith(`_${lang}`)) {
      delete multiLangCache[key];
      persistedCacheKeys.delete(key);
    }
  });
  if (lang === 'bn') bengaliAutoDownloadComplete = false;
}

function expectedAyahCount(surahId: number): number | undefined {
  return SURAH_LIST.find((surah) => surah.id === surahId)?.versesCount;
}

function withReciterAudio(ayahs: QuranAyah[], surahId: number, reciterId: string): QuranAyah[] {
  return ayahs.map((ayah) => ({
    ...ayah,
    audioUrl: getAyahAudioUrl(surahId, ayah.verseNumber, reciterId),
  }));
}

export async function downloadFullQuranOffline(
  lang: QuranLanguage,
  onProgress?: (completed: number, total: number) => void
): Promise<void> {
  const total = SURAH_LIST.length;
  const batchSize = 3;
  let completed = 0;
  onProgress?.(completed, total);

  // A small bounded batch is faster than 114 serial requests without flooding
  // the Quran API or creating too many simultaneous IndexedDB writes.
  for (let start = 0; start < total; start += batchSize) {
    const batch = SURAH_LIST.slice(start, start + batchSize);
    await Promise.all(batch.map(async (surah) => {
      const cached = await getOfflineSurah(surah.id, lang).catch(() => null);
      if (cached && cached.length === surah.versesCount) return;

      await fetchVersesByLanguage(surah.id, lang);

      // A chapter is counted as downloaded only after IndexedDB confirms persistence.
      const saved = await getOfflineSurah(surah.id, lang).catch(() => null);
      if (!saved || saved.length !== surah.versesCount) {
        throw new Error(`সূরা ${surah.id} ডিভাইসে সংরক্ষণ করা যায়নি। স্টোরেজ খালি করে আবার চেষ্টা করুন।`);
      }
    }));

    completed += batch.length;
    onProgress?.(completed, total);
  }
}

/**
 * Automatically cache Bengali Quran once, quietly and resumably.
 * A single IndexedDB count check is used on later launches.
 */
export function ensureDefaultOfflineQuranDownloaded(): Promise<void> {
  if (bengaliAutoDownloadComplete) return Promise.resolve();
  if (bengaliAutoDownloadPromise) return bengaliAutoDownloadPromise;

  bengaliAutoDownloadPromise = getOfflineSurahCount('bn')
    .then(async (savedCount) => {
      if (savedCount < SURAH_LIST.length) await downloadFullQuranOffline('bn');
      bengaliAutoDownloadComplete = true;
    })
    .finally(() => {
      bengaliAutoDownloadPromise = null;
    });

  return bengaliAutoDownloadPromise;
}

async function loadSurahData(surahId: number, lang: QuranLanguage): Promise<QuranAyah[]> {
  const cacheKey = `${surahId}_${lang}`;
  const expectedCount = expectedAyahCount(surahId);
  if (!expectedCount) throw new Error(`অজানা সূরা নম্বর: ${surahId}`);

  const offlineItem = await getOfflineSurah(surahId, lang).catch(() => null);
  if (offlineItem && offlineItem.length === expectedCount) {
    multiLangCache[cacheKey] = offlineItem;
    persistedCacheKeys.add(cacheKey);
    return offlineItem;
  }

  const language = QURAN_LANGUAGES.find((item) => item.code === lang) || QURAN_LANGUAGES[0];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  let data: any;
  try {
    const response = await fetch(
      `https://api.quran.com/api/v4/verses/by_chapter/${surahId}?language=${lang}&words=true&translations=${language.translationId}&word_fields=text_uthmani,location,audio_url&per_page=300`,
      { signal: controller.signal }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    data = await response.json();
  } finally {
    clearTimeout(timeoutId);
  }

  if (!Array.isArray(data?.verses)) {
    throw new Error(`সূরা ${surahId}-এর আয়াত পাওয়া যায়নি।`);
  }

  const parsedAyahs: QuranAyah[] = data.verses.map((verse: any) => {
    const verseNumber = Number(verse.verse_number);
    const words: QuranWord[] = (Array.isArray(verse.words) ? verse.words : []).map((word: any, index: number) => {
      const rawTranslation = word.translation?.text || '';
      const isVerseMarker = word.char_type_name === 'end' || /^[0-9٠-٩০-৯()]+$/.test(rawTranslation.trim());
      const markerText = isVerseMarker ? `﴿${toArabicNumber(verseNumber)}﴾` : rawTranslation;
      return {
        id: word.id || index + 1,
        position: word.position || index + 1,
        textUthmani: isVerseMarker ? toArabicNumber(verseNumber) : (word.text_uthmani || word.text || ''),
        transliterationBn: isVerseMarker ? '' : (word.transliteration?.text || ''),
        translationBn: lang === 'bn' || isVerseMarker ? markerText : '',
        translationEn: lang === 'en' || isVerseMarker ? markerText : '',
        translationUr: lang === 'ur' || isVerseMarker ? markerText : undefined,
        translationHi: lang === 'hi' || isVerseMarker ? markerText : undefined,
        translationTr: lang === 'tr' || isVerseMarker ? markerText : undefined,
        audioUrl: word.audio_url ? `https://audio.qurancdn.com/${word.audio_url}` : '',
      };
    });

    const rawTranslation = verse.translations?.[0]?.text || '';
    const translatedText = rawTranslation.replace(/<[^>]*>?/gm, '');
    return {
      id: verse.id,
      verseNumber,
      verseKey: verse.verse_key || `${surahId}:${verseNumber}`,
      textUthmani: verse.text_uthmani || words.map((word) => word.textUthmani).join(' '),
      translationBn: lang === 'bn' ? translatedText : '',
      translationEn: lang === 'en' ? translatedText : '',
      transliterationBn: '',
      audioUrl: getAyahAudioUrl(surahId, verseNumber, 'alafasy'),
      juzNumber: verse.juz_number || 1,
      pageNumber: verse.page_number || 1,
      words: words.filter((word) => word.textUthmani && word.textUthmani !== '۝'),
      ...(lang === 'hi' ? { translationHi: translatedText } : {}),
      ...(lang === 'ur' ? { translationUr: translatedText } : {}),
      ...(lang === 'tr' ? { translationTr: translatedText } : {}),
      ...(lang === 'ar' ? { tafsirAr: translatedText } : {}),
    } as QuranAyah;
  });

  if (parsedAyahs.length !== expectedCount || parsedAyahs.some((ayah) => !ayah.textUthmani || !Number.isFinite(ayah.verseNumber))) {
    throw new Error(`সূরা ${surahId}-এর সম্পূর্ণ আয়াত পাওয়া যায়নি (${parsedAyahs.length}/${expectedCount})।`);
  }

  // Keep the online reader usable even when browser storage is full or unavailable.
  multiLangCache[cacheKey] = parsedAyahs;
  try {
    await saveOfflineSurah(surahId, lang, parsedAyahs);
    persistedCacheKeys.add(cacheKey);
  } catch (error) {
    console.warn(`Could not cache Surah ${surahId} offline:`, error);
  }

  return parsedAyahs;
}

/**
 * Fetch verses with request de-duplication and reciter-specific audio URLs.
 */
export async function fetchVersesByLanguage(
  surahId: number,
  lang: QuranLanguage,
  reciterId: string = 'alafasy'
): Promise<QuranAyah[]> {
  const cacheKey = `${surahId}_${lang}`;
  const expectedCount = expectedAyahCount(surahId);

  const cached = multiLangCache[cacheKey];
  if (cached && cached.length === expectedCount) {
    if (!persistedCacheKeys.has(cacheKey)) {
      try {
        await saveOfflineSurah(surahId, lang, cached);
        persistedCacheKeys.add(cacheKey);
      } catch (error) {
        console.warn(`Could not cache Surah ${surahId} offline:`, error);
      }
    }
    return withReciterAudio(cached, surahId, reciterId);
  }

  let pending = inFlightLoads.get(cacheKey);
  if (!pending) {
    pending = loadSurahData(surahId, lang);
    inFlightLoads.set(cacheKey, pending);
  }

  try {
    const ayahs = await pending;
    return withReciterAudio(ayahs, surahId, reciterId);
  } catch (error) {
    console.warn(`Could not fetch Surah ${surahId} in ${lang}:`, error);
    throw new Error(`সূরা ${surahId} লোড করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।`);
  } finally {
    if (inFlightLoads.get(cacheKey) === pending) inFlightLoads.delete(cacheKey);
  }
}
