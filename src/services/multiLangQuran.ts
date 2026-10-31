/**
 * Multi-language Quran Service supporting Bengali, English, Arabic, Hindi, Urdu, and Turkish translations and tafsirs
 */
import { QuranAyah, QuranWord, SAMPLE_AYAHS, TafsirContent } from '../data/quranSampleData';
import { padNumber, getAyahAudioUrl } from './quranApi';
import { toArabicNumber } from '../utils/banglaNumbers';
import { getOfflineSurah, saveOfflineSurah, getOfflineSurahCount } from './offlineQuranStore';

export type QuranLanguage = 'bn' | 'en' | 'ar' | 'hi' | 'ur' | 'tr';

export interface LanguageMeta {
  code: QuranLanguage;
  name: string;
  nativeName: string;
  translationId: number; // Quran.com API translation resource ID
}

export const QURAN_LANGUAGES: LanguageMeta[] = [
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', translationId: 163 },
  { code: 'en', name: 'English', nativeName: 'English', translationId: 131 }, // Sahih International
  { code: 'ar', name: 'Arabic', nativeName: 'العربية (التفسير الميسر)', translationId: 16 }, // Tafsir Al-Muyassar
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', translationId: 122 }, // Suhel Farooq Khan
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', translationId: 97 }, // Jalandhry
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', translationId: 77 }, // Diyanet İşleri
];

const multiLangCache: { [key: string]: QuranAyah[] } = {};

export async function downloadFullQuranOffline(
  lang: QuranLanguage,
  onProgress?: (completed: number, total: number) => void
): Promise<void> {
  const total = 114;
  let completed = await getOfflineSurahCount(lang);
  onProgress?.(completed, total);
  for (let surahId = 1; surahId <= total; surahId += 1) {
    const cached = await getOfflineSurah(surahId, lang);
    if (!cached || cached.length === 0) {
      await fetchVersesByLanguage(surahId, lang);
    }
    completed += 1;
    onProgress?.(completed, total);
  }
}

/**
 * Fetch verses with translation in the specified language
 */
export async function fetchVersesByLanguage(
  surahId: number,
  lang: QuranLanguage,
  reciterId: string = 'alafasy'
): Promise<QuranAyah[]> {
  const cacheKey = `${surahId}_${lang}`;
  if (multiLangCache[cacheKey] && multiLangCache[cacheKey].length > 0) {
    return multiLangCache[cacheKey];
  }

  // IndexedDB has enough room for the complete Quran and is preferred over localStorage.
  const offlineItem = await getOfflineSurah(surahId, lang).catch(() => null);
  if (offlineItem && offlineItem.length > 0) {
    multiLangCache[cacheKey] = offlineItem;
    return offlineItem;
  }

  const langMeta = QURAN_LANGUAGES.find((l) => l.code === lang) || QURAN_LANGUAGES[0];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `https://api.quran.com/api/v4/verses/by_chapter/${surahId}?language=${lang}&words=true&translations=${langMeta.translationId}&word_fields=text_uthmani,location,audio_url&per_page=300`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.verses && Array.isArray(data.verses)) {
      const parsedAyahs: QuranAyah[] = data.verses.map((v: any) => {
        const verseNum = v.verse_number;
        const words: QuranWord[] = (v.words || []).map((w: any, index: number) => {
          const audioPath = w.audio_url ? `https://audio.qurancdn.com/${w.audio_url}` : '';
          const rawText = w.translation?.text || '';
          const isVerseMarker = w.char_type_name === 'end' || /^[0-9٠-٩০-৯()]+$/.test(rawText.trim());
          const wordText = isVerseMarker ? `﴿${toArabicNumber(verseNum)}﴾` : rawText;
          return {
            id: w.id || index + 1,
            position: w.position || index + 1,
            textUthmani: isVerseMarker ? toArabicNumber(verseNum) : (w.text_uthmani || w.text || ''),
            transliterationBn: isVerseMarker ? '' : (w.transliteration?.text || ''),
            translationBn: lang === 'bn' ? wordText : (isVerseMarker ? wordText : (w.translation?.text || '')),
            translationEn: lang === 'en' ? wordText : (isVerseMarker ? wordText : ''),
            translationUr: lang === 'ur' ? wordText : (isVerseMarker ? wordText : undefined),
            translationHi: lang === 'hi' ? wordText : (isVerseMarker ? wordText : undefined),
            translationTr: lang === 'tr' ? wordText : (isVerseMarker ? wordText : undefined),
            audioUrl: audioPath,
          };
        });

        let translatedText = '';
        if (v.translations && v.translations[0]) {
          translatedText = v.translations[0].text.replace(/<[^>]*>?/gm, '');
        }

        // Map translation field based on language
        return {
          id: v.id,
          verseNumber: verseNum,
          verseKey: v.verse_key || `${surahId}:${verseNum}`,
          textUthmani: v.text_uthmani || words.map((w) => w.textUthmani).join(' '),
          translationBn: lang === 'bn' ? translatedText : '',
          translationEn: lang === 'en' ? translatedText : '',
          transliterationBn: '',
          audioUrl: getAyahAudioUrl(surahId, verseNum, reciterId),
          juzNumber: v.juz_number || 1,
          pageNumber: v.page_number || 1,
          words: words.filter((w) => w.textUthmani && w.textUthmani !== '۝'),
          // Attach multi-lang translation property dynamically
          ...(lang === 'hi' ? { translationHi: translatedText } : {}),
          ...(lang === 'ur' ? { translationUr: translatedText } : {}),
          ...(lang === 'tr' ? { translationTr: translatedText } : {}),
          ...(lang === 'ar' ? { tafsirAr: translatedText } : {}),
        } as any;
      });

      if (parsedAyahs.length === 0) throw new Error('The Quran API returned no verses.');
      multiLangCache[cacheKey] = parsedAyahs;
      await saveOfflineSurah(surahId, lang, parsedAyahs);
      return parsedAyahs;
    }
  } catch (err) {
    console.warn(`Could not fetch multi-lang verses for Surah ${surahId} in ${lang}:`, err);
  }

  // Never substitute partial/sample text for a complete Quran chapter.
  // The reader can now show a clear unavailable state instead of misleading content.
  throw new Error(`সূরা ${surahId} লোড করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।`);
}
