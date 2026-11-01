/**
 * Quran API Service for dynamic word-by-word loading, audio, and multilingual tafsir (Bengali, English, Arabic, Urdu, Hindi, Turkish)
 */
import { QuranAyah, QuranWord, SAMPLE_AYAHS, TafsirContent } from '../data/quranSampleData';
import { MULTI_LANG_TAFSIRS } from '../data/masnunAdhkar';
import { toArabicNumber } from '../utils/banglaNumbers';

export interface Reciter {
  id: string;
  nameBn: string;
  nameEn: string;
  subtext: string;
  audioPrefix: string;
}

export const RECITERS: Reciter[] = [
  {
    id: 'alafasy',
    nameBn: 'মিশারী বিন রশিদ আল-আফাসী',
    nameEn: 'Mishary Rashid Alafasy',
    subtext: 'মুরাত্তাল (সবচেয়ে জনপ্রিয়)',
    audioPrefix: 'https://everyayah.com/data/Alafasy_128kbps',
  },
  {
    id: 'husary',
    nameBn: 'মাহমুদ খলিল আল-হুসারী',
    nameEn: 'Mahmoud Khalil Al-Husary',
    subtext: 'বিশুদ্ধ তাজবীদ ও ধীরগতি',
    audioPrefix: 'https://everyayah.com/data/Husary_128kbps',
  },
  {
    id: 'abdulbasit',
    nameBn: 'আব্দুল বাসিত আব্দুল সামাদ',
    nameEn: 'Abdul Basit Abdul Samad',
    subtext: 'মুরাত্তাল ঐতিহ্যবাহী সুর',
    audioPrefix: 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps',
  },
  {
    id: 'minshawi',
    nameBn: 'মুহাম্মদ সিদ্দিক আল-মিনশাওয়ী',
    nameEn: 'Mohamed Siddiq Al-Minshawi',
    subtext: 'মুরাত্তাল · 128 kbps',
    audioPrefix: 'https://everyayah.com/data/Minshawy_Murattal_128kbps',
  },
  {
    id: 'sudais',
    nameBn: 'আব্দুর রহমান আস-সুদাইস',
    nameEn: 'Abdur-Rahman As-Sudais',
    subtext: 'মুরাত্তাল · 192 kbps',
    audioPrefix: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps',
  },
  {
    id: 'maher',
    nameBn: 'মাহের আল-মুআইকলী',
    nameEn: 'Maher Al-Muaiqly',
    subtext: 'মুরাত্তাল · 128 kbps',
    audioPrefix: 'https://everyayah.com/data/MaherAlMuaiqly128kbps',
  },
  {
    id: 'ayyoub',
    nameBn: 'মুহাম্মদ আইয়ুব',
    nameEn: 'Muhammad Ayyoub',
    subtext: 'মুরাত্তাল · 128 kbps',
    audioPrefix: 'https://everyayah.com/data/Muhammad_Ayyoub_128kbps',
  },
  {
    id: 'ghamdi',
    nameBn: 'সা‘দ আল-গামিদী',
    nameEn: 'Saad Al-Ghamdi',
    subtext: 'মুরাত্তাল · 40 kbps · কম ডেটা',
    audioPrefix: 'https://everyayah.com/data/Ghamadi_40kbps',
  },
  {
    id: 'shuraim',
    nameBn: 'সউদ আশ-শুরাইম',
    nameEn: "Sa'ud ash-Shuraym",
    subtext: 'ইমাম, মসজিদুল হারাম মক্কা',
    audioPrefix: 'https://everyayah.com/data/Saood_ash-Shuraym_128kbps',
  },
];

// In-memory cache to make Quran navigation instantaneous
const versesCache: { [surahId: number]: QuranAyah[] } = {};
const tafsirCache: { [verseKey: string]: TafsirContent[] } = {};

/**
 * Format 3-digit number for audio filenames (e.g. 1 -> "001")
 */
export function padNumber(num: number, size = 3): string {
  let s = num + '';
  while (s.length < size) s = '0' + s;
  return s;
}

export function getAyahAudioUrl(surahId: number, ayahNumber: number, reciterId: string = 'alafasy'): string {
  const reciter = RECITERS.find((r) => r.id === reciterId) || RECITERS[0];
  const sStr = padNumber(surahId, 3);
  const aStr = padNumber(ayahNumber, 3);
  return `${reciter.audioPrefix}/${sStr}${aStr}.mp3`;
}

/**
 * Fetch word-by-word verses for a Surah with fallback to local sample data
 */
export async function fetchSurahVerses(surahId: number, reciterId: string = 'alafasy'): Promise<QuranAyah[]> {
  if (versesCache[surahId] && versesCache[surahId].length > 0) {
    return versesCache[surahId];
  }

  // Check persistent offline storage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const offlineItem = localStorage.getItem(`quran_offline_${surahId}_bn`);
      if (offlineItem) {
        const parsed = JSON.parse(offlineItem);
        if (Array.isArray(parsed) && parsed.length > 0) {
          versesCache[surahId] = parsed;
          return parsed;
        }
      }
    } catch (e) {}
  }

  if (SAMPLE_AYAHS[surahId]) {
    const ayahs = SAMPLE_AYAHS[surahId].map((ayah) => ({
      ...ayah,
      audioUrl: getAyahAudioUrl(surahId, ayah.verseNumber, reciterId),
    }));
    versesCache[surahId] = ayahs;
    return ayahs;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `https://api.quran.com/api/v4/verses/by_chapter/${surahId}?language=bn&words=true&translations=163&word_fields=text_uthmani,location,audio_url&per_page=150`,
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
            translationBn: isVerseMarker ? wordText : (w.translation?.text || ''),
            translationEn: isVerseMarker ? wordText : (w.translation?.text || ''),
            audioUrl: audioPath,
          };
        });

        let bnTranslation = '';
        if (v.translations && v.translations[0]) {
          bnTranslation = v.translations[0].text.replace(/<[^>]*>?/gm, '');
        }

        return {
          id: v.id,
          verseNumber: verseNum,
          verseKey: v.verse_key || `${surahId}:${verseNum}`,
          textUthmani: v.text_uthmani || words.map((w) => w.textUthmani).join(' '),
          translationBn: bnTranslation || 'অনুবাদ লোড হচ্ছে...',
          translationEn: '',
          transliterationBn: '',
          audioUrl: getAyahAudioUrl(surahId, verseNum, reciterId),
          juzNumber: v.juz_number || 1,
          pageNumber: v.page_number || 1,
          words: words.filter((w) => w.textUthmani && w.textUthmani !== '۝'),
        };
      });

      versesCache[surahId] = parsedAyahs;
      return parsedAyahs;
    }
  } catch (err) {
    console.warn(`Could not fetch dynamic verses for Surah ${surahId}:`, err);
  }

  const fallbackAyahs: QuranAyah[] = [
    {
      id: surahId * 1000 + 1,
      verseNumber: 1,
      verseKey: `${surahId}:1`,
      textUthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
      translationBn: 'শুরু করছি পরম করুণাময় ও পরম দয়ালু আল্লাহর নামে।',
      translationEn: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      transliterationBn: 'বিসমিল্লাহির রাহমানির রাহীম',
      audioUrl: getAyahAudioUrl(surahId, 1, reciterId),
      juzNumber: 1,
      pageNumber: 1,
      words: [
        { id: 1, position: 1, textUthmani: 'بِسْمِ', transliterationBn: 'বিসমি', translationBn: 'নামে', translationEn: 'In name', audioUrl: 'https://audio.qurancdn.com/wbw/001_001_001.mp3' },
        { id: 2, position: 2, textUthmani: 'ٱللَّهِ', transliterationBn: 'আল্লাহি', translationBn: 'আল্লাহর', translationEn: 'Allah', audioUrl: 'https://audio.qurancdn.com/wbw/001_001_002.mp3' },
        { id: 3, position: 3, textUthmani: 'ٱلرَّحْمَـٰنِ', transliterationBn: 'আর-রাহমানি', translationBn: 'পরম করুণাময়', translationEn: 'the Merciful', audioUrl: 'https://audio.qurancdn.com/wbw/001_001_003.mp3' },
        { id: 4, position: 4, textUthmani: 'ٱلرَّحِيمِ', transliterationBn: 'আর-রাহীম', translationBn: 'অতি দয়ালু', translationEn: 'the Compassionate', audioUrl: 'https://audio.qurancdn.com/wbw/001_001_004.mp3' },
      ],
    },
  ];
  return fallbackAyahs;
}

/**
 * Fetch Tafsir in multiple languages (Bengali, English, Arabic, Urdu, Hindi, Turkish) for a given verse
 */
export function getBundledTafsir(verseKey: string): TafsirContent[] {
  return tafsirCache[verseKey] || MULTI_LANG_TAFSIRS[verseKey] || [];
}

export async function fetchTafsir(verseKey: string): Promise<TafsirContent[]> {
  if (tafsirCache[verseKey]) {
    return tafsirCache[verseKey];
  }

  if (MULTI_LANG_TAFSIRS[verseKey]) {
    tafsirCache[verseKey] = MULTI_LANG_TAFSIRS[verseKey];
    return MULTI_LANG_TAFSIRS[verseKey];
  }

  // Do not invent tafsir text or attribute generated summaries to named scholars.
  // Only explicitly curated, source-checked entries above are returned.
  return [];
}
