import test from 'node:test';
import assert from 'node:assert/strict';
import { toBanglaNumber, toEnglishNumber, toArabicNumber, formatDurationToBangla } from './banglaNumbers';
import { calculateQiblaDirection, calculateDistanceToKaaba, getHeadingDeviation } from './qibla';
import { calculatePrayerTimes, BANGLADESH_DISTRICTS } from './prayerTimes';

test('Bengali number conversion works correctly', () => {
  assert.equal(toBanglaNumber(12345), '১২৩৪৫');
  assert.equal(toBanglaNumber(0), '০');
  assert.equal(toBanglaNumber('786'), '৭৮৬');
  assert.equal(toEnglishNumber('১২৩৪৫'), '12345');
});

test('Arabic number conversion for Ayat numbers works correctly', () => {
  assert.equal(toArabicNumber(1), '١');
  assert.equal(toArabicNumber(2), '٢');
  assert.equal(toArabicNumber(7), '٧');
  assert.equal(toArabicNumber(255), '٢٥٥');
  assert.equal(toArabicNumber('286'), '٢٨٦');
  assert.equal(toArabicNumber('১২'), '١٢');
});

test('Duration to Bangla string works', () => {
  assert.equal(formatDurationToBangla(45), '৪৫ মিনিট');
  assert.equal(formatDurationToBangla(75), '১ ঘণ্টা ১৫ মিনিট');
  assert.equal(formatDurationToBangla(120), '২ ঘণ্টা');
});

test('Qibla direction from Dhaka, Bangladesh is approximately 268-270 degrees', () => {
  // Dhaka coordinates: 23.8103° N, 90.4125° E
  const bearing = calculateQiblaDirection(23.8103, 90.4125);
  // Expected Qibla from Dhaka is 277.6°
  assert.ok(bearing >= 275 && bearing <= 280, `Bearing was ${bearing}, expected around 277.6°`);

  // Distance from Dhaka to Mecca is approx 5100-5200 km
  const distance = calculateDistanceToKaaba(23.8103, 90.4125);
  assert.ok(distance >= 5000 && distance <= 5300, `Distance was ${distance} km, expected ~5150 km`);
});

test('Heading deviation logic detects alignment', () => {
  const qibla = 268;
  const devExact = getHeadingDeviation(268, qibla);
  assert.equal(devExact, 0);

  const devNear = getHeadingDeviation(265, qibla);
  assert.equal(devNear, 3);

  const devWrap = getHeadingDeviation(10, 355);
  assert.equal(devWrap, -15);
});

test('Bangladesh districts dataset contains 64 districts with Dhaka', () => {
  assert.ok(BANGLADESH_DISTRICTS.length >= 64, `Found ${BANGLADESH_DISTRICTS.length} districts`);
  const dhaka = BANGLADESH_DISTRICTS.find((d) => d.id === 'dhaka');
  assert.ok(dhaka, 'Dhaka must exist');
  assert.equal(dhaka?.nameBn, 'ঢাকা');
});

test('Prayer times calculate valid chronological order for Dhaka', () => {
  const testDate = new Date('2026-10-26T12:00:00Z');
  const dhaka = BANGLADESH_DISTRICTS.find((d) => d.id === 'dhaka')!;
  const times = calculatePrayerTimes(testDate, dhaka.lat, dhaka.lng, 6);

  assert.ok(times.fajr instanceof Date);
  assert.ok(times.sunrise instanceof Date);
  assert.ok(times.dhuhr instanceof Date);
  assert.ok(times.asr instanceof Date);
  assert.ok(times.maghrib instanceof Date);
  assert.ok(times.isha instanceof Date);

  // Chronological verification: Fajr < Sunrise < Dhuhr < Asr < Maghrib < Isha
  assert.ok(times.fajr.getTime() < times.sunrise.getTime(), 'Fajr must be before Sunrise');
  assert.ok(times.sunrise.getTime() < times.dhuhr.getTime(), 'Sunrise must be before Dhuhr');
  assert.ok(times.dhuhr.getTime() < times.asr.getTime(), 'Dhuhr must be before Asr');
  assert.ok(times.asr.getTime() < times.maghrib.getTime(), 'Asr must be before Maghrib');
  assert.ok(times.maghrib.getTime() < times.isha.getTime(), 'Maghrib must be before Isha');
});
