import type { QuranAyah } from '../data/quranSampleData';

export interface QuranIntegrityResult {
  valid: boolean;
  expected: number;
  actual: number;
  reason?: 'invalid-count' | 'invalid-sequence' | 'missing-arabic' | 'missing-translation';
}

/**
 * Reject incomplete or misordered chapter payloads before they enter the
 * persistent offline Quran library. This is a structural integrity check,
 * not a scholarly verification of the source text or translation.
 */
export function validateQuranSurah(
  ayahs: QuranAyah[],
  surahId: number,
  expectedVerseCount: number,
  requireTranslation = true,
): QuranIntegrityResult {
  const actual = Array.isArray(ayahs) ? ayahs.length : 0;
  const result = (valid: boolean, reason?: QuranIntegrityResult['reason']): QuranIntegrityResult =>
    ({ valid, expected: expectedVerseCount, actual, ...(reason ? { reason } : {}) });

  if (!Array.isArray(ayahs) || expectedVerseCount <= 0 || actual !== expectedVerseCount) {
    return result(false, 'invalid-count');
  }

  for (let index = 0; index < ayahs.length; index += 1) {
    const ayah = ayahs[index];
    const expectedNumber = index + 1;
    if (!ayah || ayah.verseNumber !== expectedNumber || ayah.verseKey !== `${surahId}:${expectedNumber}`) {
      return result(false, 'invalid-sequence');
    }
    if (typeof ayah.textUthmani !== 'string' || ayah.textUthmani.trim().length === 0) {
      return result(false, 'missing-arabic');
    }
    if (requireTranslation) {
      const translation = ayah.translationText || ayah.translationBn || ayah.translationEn ||
        ayah.translationUr || ayah.translationHi || ayah.translationTr;
      if (typeof translation !== 'string' || translation.trim().length === 0) {
        return result(false, 'missing-translation');
      }
    }
  }

  return result(true);
}
