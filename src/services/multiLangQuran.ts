/**
 * Multi-language Quran Service supporting Bengali, English, Arabic, Hindi, Urdu, and Turkish translations and tafsirs
 */
import { QuranAyah, QuranWord, SAMPLE_AYAHS, TafsirContent } from '../data/quranSampleData';
import { padNumber, getAyahAudioUrl } from './quranApi';
import { toArabicNumber } from '../utils/banglaNumbers';

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

  // Check persistent offline storage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const offlineItem = localStorage.getItem(`quran_offline_${cacheKey}`);
      if (offlineItem) {
        const parsed = JSON.parse(offlineItem);
        if (Array.isArray(parsed) && parsed.length > 0) {
          multiLangCache[cacheKey] = parsed;
          return parsed;
        }
      }
    } catch (e) {
      // ignore JSON or quota errors
    }
  }

  const langMeta = QURAN_LANGUAGES.find((l) => l.code === lang) || QURAN_LANGUAGES[0];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `https://api.quran.com/api/v4/verses/by_chapter/${surahId}?language=${lang}&words=true&translations=${langMeta.translationId}&word_fields=text_uthmani,location,audio_url&per_page=150`,
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

      multiLangCache[cacheKey] = parsedAyahs;
      // Persist in localStorage for permanent offline use
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(`quran_offline_${cacheKey}`, JSON.stringify(parsedAyahs));
        } catch (e) {
          // ignore quota limits
        }
      }
      return parsedAyahs;
    }
  } catch (err) {
    console.warn(`Could not fetch multi-lang verses for Surah ${surahId} in ${lang}:`, err);
  }

  // Offline fallback to SAMPLE_AYAHS if available
  if (SAMPLE_AYAHS[surahId]) {
    return SAMPLE_AYAHS[surahId];
  }

  // Generic fallback via quranApi
  const baseAyahs = await import('../services/quranApi').then((m) => m.fetchSurahVerses(surahId, reciterId));
  return baseAyahs;
}
