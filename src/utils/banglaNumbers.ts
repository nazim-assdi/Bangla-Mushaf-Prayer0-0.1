/**
 * Utilities for converting numbers and formatting time in Bengali
 */

const banglaDigits: { [key: string]: string } = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

const englishDigits: { [key: string]: string } = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

export function toBanglaNumber(input: number | string): string {
  if (input === null || input === undefined) return '';
  const str = input.toString();
  return str.replace(/[0-9]/g, (digit) => banglaDigits[digit] || digit);
}

export function toEnglishNumber(input: string): string {
  if (!input) return '';
  return input.replace(/[০-৯]/g, (digit) => englishDigits[digit] || digit);
}

const arabicDigits: { [key: string]: string } = {
  '0': '٠',
  '1': '١',
  '2': '٢',
  '3': '٣',
  '4': '٤',
  '5': '٥',
  '6': '٦',
  '7': '٧',
  '8': '٨',
  '9': '٩',
};

export function toArabicNumber(input: number | string): string {
  if (input === null || input === undefined) return '';
  const str = input.toString();
  const normalized = toEnglishNumber(str);
  return normalized.replace(/[0-9]/g, (digit) => arabicDigits[digit] || digit);
}

export function formatDurationToBangla(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);

  if (hours > 0 && minutes > 0) {
    return `${toBanglaNumber(hours)} ঘণ্টা ${toBanglaNumber(minutes)} মিনিট`;
  } else if (hours > 0) {
    return `${toBanglaNumber(hours)} ঘণ্টা`;
  } else {
    return `${toBanglaNumber(minutes)} মিনিট`;
  }
}
