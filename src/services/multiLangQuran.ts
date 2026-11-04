/**
 * Quran translation service using approved Quran.com translation resources across 63 languages
 */
import { QuranAyah, QuranWord, TafsirContent } from '../data/quranSampleData';
import { SURAH_LIST } from '../data/quranMetadata';
import { padNumber, getAyahAudioUrl } from './quranApi';
import { toArabicNumber } from '../utils/banglaNumbers';
import { getOfflineSurah, saveOfflineSurah } from './offlineQuranStore';

export type QuranLanguage =
  | 'bn' | 'en' | 'hi' | 'ur' | 'tr' | 'es' | 'fr' | 'bs' | 'ru' | 'ml'
  | 'id' | 'uz' | 'nl' | 'de' | 'tg' | 'ta' | 'ja' | 'it' | 'vi' | 'zh'
  | 'fa' | 'bg' | 'pt' | 'ro' | 'sw' | 'kk' | 'th' | 'tl' | 'as' | 'ko'
  | 'so' | 'az' | 'ku' | 'dv' | 'ms' | 'prs' | 'zgh' | 'am' | 'ce' | 'cs'
  | 'fi' | 'gu' | 'he' | 'kn' | 'lg' | 'mr' | 'ne' | 'no' | 'om' | 'pl'
  | 'ps' | 'rw' | 'sd' | 'si' | 'sv' | 'te' | 'tt' | 'ug' | 'uk' | 'sq'
  | 'yo' | 'ha' | 'km' | 'bm' | 'mrn' | 'yuw';

export interface LanguageMeta {
  code: QuranLanguage;
  name: string;
  nativeName: string;
  translationId: number;
}

export const QURAN_LANGUAGES: LanguageMeta[] = [
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', translationId: 163 },
  { code: 'en', name: 'English', nativeName: 'English', translationId: 20 },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', translationId: 122 },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', translationId: 234 },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', translationId: 77 },
  { code: 'es', name: 'Spanish', nativeName: 'Español', translationId: 83 },
  { code: 'fr', name: 'French', nativeName: 'Français', translationId: 31 },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski', translationId: 126 },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', translationId: 45 },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', translationId: 37 },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', translationId: 33 },
  { code: 'uz', name: 'Uzbek', nativeName: 'O‘zbek', translationId: 127 },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', translationId: 144 },
  { code: 'de', name: 'German', nativeName: 'Deutsch', translationId: 27 },
  { code: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ', translationId: 74 },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', translationId: 133 },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', translationId: 35 },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', translationId: 153 },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', translationId: 220 },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '中文', translationId: 109 },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', translationId: 29 },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', translationId: 237 },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', translationId: 43 },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', translationId: 44 },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', translationId: 49 },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша', translationId: 113 },
  { code: 'th', name: 'Thai', nativeName: 'ภาษาไทย', translationId: 51 },
  { code: 'tl', name: 'Tagalog', nativeName: 'Filipino', translationId: 211 },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', translationId: 120 },
  { code: 'ko', name: 'Korean', nativeName: '한국어', translationId: 36 },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', translationId: 46 },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan dili', translationId: 75 },
  { code: 'ku', name: 'Kurdish', nativeName: 'Kurdî', translationId: 81 },
  { code: 'dv', name: 'Divehi', nativeName: 'ދިވެހި', translationId: 86 },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', translationId: 39 },
  { code: 'prs', name: 'Dari', nativeName: 'دری', translationId: 785 },
  { code: 'zgh', name: 'Amazigh', nativeName: 'Tamaziɣt', translationId: 236 },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', translationId: 87 },
  { code: 'ce', name: 'Chechen', nativeName: 'Нохчийн мотт', translationId: 106 },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', translationId: 26 },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', translationId: 30 },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', translationId: 225 },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', translationId: 233 },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', translationId: 771 },
  { code: 'lg', name: 'Ganda', nativeName: 'Luganda', translationId: 232 },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', translationId: 226 },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', translationId: 108 },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', translationId: 41 },
  { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo', translationId: 111 },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', translationId: 42 },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو', translationId: 118 },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', translationId: 774 },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', translationId: 238 },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', translationId: 228 },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', translationId: 48 },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', translationId: 227 },
  { code: 'tt', name: 'Tatar', nativeName: 'Татарча', translationId: 53 },
  { code: 'ug', name: 'Uyghur', nativeName: 'ئۇيغۇرچە', translationId: 76 },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', translationId: 217 },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip', translationId: 89 },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', translationId: 125 },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', translationId: 32 },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ', translationId: 128 },
  { code: 'bm', name: 'Bambara', nativeName: 'Bamanankan', translationId: 795 },
  { code: 'mrn', name: 'Maranao', nativeName: 'Mëranaw', translationId: 38 },
  { code: 'yuw', name: 'Yau', nativeName: 'Yau', translationId: 798 },
];

const multiLangCache: { [key: string]: QuranAyah[] } = {};

export function clearOfflineLanguageCache(lang: QuranLanguage): void {
  Object.keys(multiLangCache).forEach((key) => {
    if (key.endsWith(`_${lang}`)) delete multiLangCache[key];
  });
}

export async function downloadFullQuranOffline(
  lang: QuranLanguage,
  onProgress?: (completed: number, total: number) => void
): Promise<void> {
  const total = 114;
  let completed = 0;
  onProgress?.(completed, total);
  for (let surahId = 1; surahId <= total; surahId += 1) {
    const expected = SURAH_LIST.find((surah) => surah.id === surahId)?.versesCount;
    const cached = await getOfflineSurah(surahId, lang);
    if (cached && expected && cached.length === expected) {
      completed += 1;
    } else {
      await fetchVersesByLanguage(surahId, lang);
      completed += 1;
    }
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
  const expectedVerseCount = SURAH_LIST.find((surah) => surah.id === surahId)?.versesCount;
  if (multiLangCache[cacheKey] && multiLangCache[cacheKey].length === expectedVerseCount) {
    return multiLangCache[cacheKey].map((ayah) => ({ ...ayah, audioUrl: getAyahAudioUrl(surahId, ayah.verseNumber, reciterId) }));
  }

  // IndexedDB has enough room for the complete Quran and is preferred over localStorage.
  const offlineItem = await getOfflineSurah(surahId, lang).catch(() => null);
  if (offlineItem && offlineItem.length === expectedVerseCount) {
    multiLangCache[cacheKey] = offlineItem;
    return offlineItem.map((ayah) => ({ ...ayah, audioUrl: getAyahAudioUrl(surahId, ayah.verseNumber, reciterId) }));
  }

  const langMeta = QURAN_LANGUAGES.find((l) => l.code === lang) || QURAN_LANGUAGES[0];

  try {
    // Quran.com limits paginated verse responses to 50 records per request.
    // Fetch every page so long surahs are never silently truncated.
    const allVerses: any[] = [];
    let page = 1;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      let response: Response;
      try {
        response = await fetch(
          `https://api.quran.com/api/v4/verses/by_chapter/${surahId}?language=${lang}&words=true&translations=${langMeta.translationId}&word_fields=text_uthmani,translation,transliteration,location,audio_url&per_page=50&page=${page}`,
          { signal: controller.signal }
        );
      } finally {
        clearTimeout(timeoutId);
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const pageData = await response.json();
      const pageVerses = Array.isArray(pageData.verses) ? pageData.verses : [];
      if (pageVerses.length === 0) break;
      allVerses.push(...pageVerses);
      if (pageData.pagination?.next_page) {
        page = pageData.pagination.next_page;
      } else if (pageVerses.length === 50) {
        page += 1;
      } else {
        break;
      }
    }
    const data = { verses: allVerses };

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
            translationText: isVerseMarker ? '' : rawText,
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
          translationText: translatedText,
          transliterationBn: '',
          audioUrl: getAyahAudioUrl(surahId, verseNum, reciterId),
          juzNumber: v.juz_number || 1,
          pageNumber: v.page_number || 1,
          words: words.filter((w) => w.textUthmani && w.textUthmani !== '۝'),
          // Attach multi-lang translation property dynamically
          ...(lang === 'hi' ? { translationHi: translatedText } : {}),
          ...(lang === 'ur' ? { translationUr: translatedText } : {}),
          ...(lang === 'tr' ? { translationTr: translatedText } : {}),
        } as any;
      });

      if (!expectedVerseCount || parsedAyahs.length !== expectedVerseCount) {
        throw new Error(`সূরা ${surahId}-এর সম্পূর্ণ আয়াত পাওয়া যায়নি (${parsedAyahs.length}/${expectedVerseCount ?? 'unknown'}).`);
      }
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
