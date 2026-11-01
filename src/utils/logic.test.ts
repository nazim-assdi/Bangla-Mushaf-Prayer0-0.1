import test from 'node:test';
import assert from 'node:assert/strict';
import { toBanglaNumber, toEnglishNumber, toArabicNumber, formatDurationToBangla } from './banglaNumbers';
import { calculateQiblaDirection, calculateDistanceToKaaba, getHeadingDeviation } from './qibla';
import { calculatePrayerTimes, BANGLADESH_DISTRICTS, getWaqtsStatus, formatTimeEn } from './prayerTimes';
import { getTimeZoneForCoordinates, getTimeZoneOffsetHours, getDatePartsInTimeZone } from '../services/worldTimeZone';

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

test('Qibla direction from Dhaka, Bangladesh is approximately 277.6 degrees', () => {
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

test('Dhaka prayer times stay in realistic Bangladesh clock-time ranges', () => {
  const testDate = new Date('2026-10-26T12:00:00Z');
  const dhaka = BANGLADESH_DISTRICTS.find((d) => d.id === 'dhaka')!;
  const times = calculatePrayerTimes(testDate, dhaka.lat, dhaka.lng, 6);
  // Regression guard: right ascension must be normalized before calculating
  // equation of time; otherwise prayer times can shift by almost 24 hours.
  assert.ok(times.fajr.getHours() >= 4 && times.fajr.getHours() <= 5, `Fajr hour: ${times.fajr.getHours()}`);
  assert.ok(times.sunrise.getHours() >= 5 && times.sunrise.getHours() <= 6, `Sunrise hour: ${times.sunrise.getHours()}`);
  assert.ok(times.dhuhr.getHours() >= 11 && times.dhuhr.getHours() <= 12, `Dhuhr hour: ${times.dhuhr.getHours()}`);
  assert.ok(times.asr.getHours() >= 15 && times.asr.getHours() <= 16, `Asr hour: ${times.asr.getHours()}`);
  assert.ok(times.maghrib.getHours() >= 17 && times.maghrib.getHours() <= 18, `Maghrib hour: ${times.maghrib.getHours()}`);
  assert.ok(times.isha.getHours() >= 18 && times.isha.getHours() <= 19, `Isha hour: ${times.isha.getHours()}`);
});

test('GPS world time zones apply local date, local clock and daylight saving rules', () => {
  const instant = new Date('2026-07-15T16:00:00.000Z');
  assert.equal(getTimeZoneOffsetHours(instant, 'Asia/Dhaka'), 6);
  assert.equal(getTimeZoneOffsetHours(instant, 'America/New_York'), -4);
  assert.equal(getTimeZoneOffsetHours(new Date('2026-01-15T16:00:00.000Z'), 'America/New_York'), -5);
  assert.deepEqual(getDatePartsInTimeZone(instant, 'America/Los_Angeles'), { year: 2026, month: 7, day: 15 });

  const newYork = calculatePrayerTimes(
    instant, 40.7128, -74.0060, -4,
    { fajrAngle: 18, ishaAngle: 18, asrJuristic: 'hanafi' },
    'America/New_York',
  );
  const localDhuhr = formatTimeEn(newYork.dhuhr, 'America/New_York');
  assert.match(localDhuhr, /^12:|^1:00 PM|^1:01 PM|^1:02 PM|^1:03 PM/);
  assert.ok(newYork.fajr.getTime() < newYork.sunrise.getTime());
  assert.ok(newYork.sunrise.getTime() < newYork.dhuhr.getTime());
});

test('Next prayer after Isha is tomorrow Fajr, not a passed Fajr today', () => {
  const today = new Date(2026, 9, 26, 12, 0, 0);
  const dhaka = BANGLADESH_DISTRICTS.find((d) => d.id === 'dhaka')!;
  const times = calculatePrayerTimes(today, dhaka.lat, dhaka.lng, 6);
  const afterIsha = new Date(times.isha.getTime() + 30 * 60000);
  const waqts = getWaqtsStatus(times, afterIsha);
  const next = waqts.find((waqt) => waqt.isNext);
  assert.equal(next?.key, 'fajr');
  assert.ok(next!.time.getTime() > afterIsha.getTime(), 'Next Fajr must be in the future');
});

test('Next prayer after Fajr skips sunrise and current Fajr ends at sunrise', () => {
  const today = new Date(2026, 9, 26, 12, 0, 0);
  const dhaka = BANGLADESH_DISTRICTS.find((d) => d.id === 'dhaka')!;
  const times = calculatePrayerTimes(today, dhaka.lat, dhaka.lng, 6);

  const duringFajr = getWaqtsStatus(times, new Date(times.fajr.getTime() + 30 * 60000));
  assert.equal(duringFajr.find((waqt) => waqt.isCurrent)?.key, 'fajr');
  assert.equal(duringFajr.find((waqt) => waqt.isNext)?.key, 'dhuhr');

  const afterSunrise = getWaqtsStatus(times, new Date(times.sunrise.getTime() + 30 * 60000));
  assert.equal(afterSunrise.find((waqt) => waqt.isNext)?.key, 'dhuhr');
  assert.equal(afterSunrise.some((waqt) => waqt.isCurrent), false);
});

test('Isha remains the current night interval before Fajr', () => {
  const today = new Date(2026, 9, 26, 12, 0, 0);
  const dhaka = BANGLADESH_DISTRICTS.find((d) => d.id === 'dhaka')!;
  const times = calculatePrayerTimes(today, dhaka.lat, dhaka.lng, 6);
  const beforeFajr = new Date(times.fajr.getTime() - 30 * 60000);
  const waqts = getWaqtsStatus(times, beforeFajr);
  assert.equal(waqts.find((waqt) => waqt.isCurrent)?.key, 'isha');
  assert.equal(waqts.find((waqt) => waqt.isNext)?.key, 'fajr');
});
