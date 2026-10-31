/**
 * Astronomical Prayer Times Calculator with full Bangladesh Districts and Global Coordinates
 */

export interface PrayerTimeConfig {
  fajrAngle: number;
  ishaAngle: number;
  asrJuristic: 'hanafi' | 'shafii'; // Hanafi = 2x shadow, Shafi'i = 1x shadow
}

export const CALCULATION_METHODS: { [key: string]: { name: string; fajrAngle: number; ishaAngle: number } } = {
  Karachi: {
    name: 'করাচী (ইসলামিক সায়েন্সেস - বাংলাদেশ/ভারত/পাকিস্তান)',
    fajrAngle: 18,
    ishaAngle: 18,
  },
  MWL: {
    name: 'মুসলিম ওয়ার্ল্ড লীগ (মক্কা)',
    fajrAngle: 18,
    ishaAngle: 17,
  },
  UmmAlQura: {
    name: 'উম্মুল কুরা (মক্কা)',
    fajrAngle: 18.5,
    ishaAngle: 19, // 90 min after Maghrib
  },
  ISNA: {
    name: 'উত্তর আমেরিকা (ISNA)',
    fajrAngle: 15,
    ishaAngle: 15,
  },
};

export interface District {
  id: string;
  nameBn: string;
  nameEn: string;
  divisionBn: string;
  divisionEn: string;
  lat: number;
  lng: number;
}

export const BANGLADESH_DISTRICTS: District[] = [
  // Dhaka Division
  { id: 'dhaka', nameBn: 'ঢাকা', nameEn: 'Dhaka', divisionBn: 'ঢাকা', divisionEn: 'Dhaka', lat: 23.8103, lng: 90.4125 },
  { id: 'gazipur', nameBn: 'গাজীপুর', nameEn: 'Gazipur', divisionBn: 'ঢাকা', divisionEn: 'Dhaka', lat: 24.0022, lng: 90.4264 },
  { id: 'narayanganj', nameBn: 'নারায়ণগঞ্জ', nameEn: 'Narayanganj', divisionBn: 'ঢাকা', divisionEn: 'Dhaka', lat: 23.6238, lng: 90.5000 },
  { id: 'tangail', nameBn: 'টাঙ্গাইল', nameEn: 'Tangail', divisionBn: 'ঢাকা', divisionEn: 'Dhaka', lat: 24.2513, lng: 89.9167 },
  { id: 'faridpur', nameBn: 'ফরিদপুর', nameEn: 'Faridpur', divisionBn: 'ঢাকা', divisionEn: 'Dhaka', lat: 23.6070, lng: 89.8429 },
  { id: 'manikganj', nameBn: 'মানিকগঞ্জ', nameEn: 'Manikganj', divisionBn: 'ঢাকা', divisionEn: 'Dhaka', lat: 23.8644, lng: 90.0047 },
  { id: 'munshiganj', nameBn: 'মুন্সীগঞ্জ', nameEn: 'Munshiganj', divisionBn: 'ঢাকা', divisionEn: 'Dhaka', lat: 23.5422, lng: 90.5305 },
  { id: 'narsingdi', nameBn: 'নরসিংদী', nameEn: 'Narsingdi', divisionBn: 'ঢাকা', divisionEn: 'Dhaka', lat: 23.9197, lng: 90.7202 },
  { id: 'gopalganj', nameBn: 'গোপালগঞ্জ', nameEn: 'Gopalganj', divisionBn: 'ঢাকা', divisionEn: 'Dhaka', lat: 23.0051, lng: 89.8267 },
  { id: 'madaripur', nameBn: 'মাদারীপুর', nameEn: 'Madaripur', divisionBn: 'ঢাকা', divisionEn: 'Dhaka', lat: 23.1641, lng: 90.1897 },
  { id: 'shariatpur', nameBn: 'শরীয়তপুর', nameEn: 'Shariatpur', divisionBn: 'ঢাকা', divisionEn: 'Dhaka', lat: 23.2423, lng: 90.4348 },
  { id: 'rajbari', nameBn: 'রাজবাড়ী', nameEn: 'Rajbari', divisionBn: 'ঢাকা', divisionEn: 'Dhaka', lat: 23.7574, lng: 89.6445 },
  { id: 'kishoreganj', nameBn: 'কিশোরগঞ্জ', nameEn: 'Kishoreganj', divisionBn: 'ঢাকা', divisionEn: 'Dhaka', lat: 24.4449, lng: 90.7766 },

  // Chattogram Division
  { id: 'chattogram', nameBn: 'চট্টগ্রাম', nameEn: 'Chattogram', divisionBn: 'চট্টগ্রাম', divisionEn: 'Chattogram', lat: 22.3569, lng: 91.7832 },
  { id: 'coxsbazar', nameBn: 'কক্সবাজার', nameEn: "Cox's Bazar", divisionBn: 'চট্টগ্রাম', divisionEn: 'Chattogram', lat: 21.4272, lng: 92.0058 },
  { id: 'cumilla', nameBn: 'কুমিল্লা', nameEn: 'Cumilla', divisionBn: 'চট্টগ্রাম', divisionEn: 'Chattogram', lat: 23.4682, lng: 91.1788 },
  { id: 'feni', nameBn: 'ফেনী', nameEn: 'Feni', divisionBn: 'চট্টগ্রাম', divisionEn: 'Chattogram', lat: 23.0186, lng: 91.3966 },
  { id: 'brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', nameEn: 'Brahmanbaria', divisionBn: 'চট্টগ্রাম', divisionEn: 'Chattogram', lat: 23.9571, lng: 91.1119 },
  { id: 'chandpur', nameBn: 'চাঁদপুর', nameEn: 'Chandpur', divisionBn: 'চট্টগ্রাম', divisionEn: 'Chattogram', lat: 23.2333, lng: 90.6667 },
  { id: 'noakhali', nameBn: 'নোয়াখালী', nameEn: 'Noakhali', divisionBn: 'চট্টগ্রাম', divisionEn: 'Chattogram', lat: 22.8696, lng: 91.0994 },
  { id: 'lakshmipur', nameBn: 'লক্ষ্মীপুর', nameEn: 'Lakshmipur', divisionBn: 'চট্টগ্রাম', divisionEn: 'Chattogram', lat: 22.9425, lng: 90.8412 },
  { id: 'rangamati', nameBn: 'রাঙ্গামাটি', nameEn: 'Rangamati', divisionBn: 'চট্টগ্রাম', divisionEn: 'Chattogram', lat: 22.6533, lng: 92.1753 },
  { id: 'khagrachhari', nameBn: 'খাগড়াছড়ি', nameEn: 'Khagrachhari', divisionBn: 'চট্টগ্রাম', divisionEn: 'Chattogram', lat: 23.1193, lng: 91.9847 },
  { id: 'bandarban', nameBn: 'বান্দরবান', nameEn: 'Bandarban', divisionBn: 'চট্টগ্রাম', divisionEn: 'Chattogram', lat: 22.1953, lng: 92.2184 },

  // Sylhet Division
  { id: 'sylhet', nameBn: 'সিলেট', nameEn: 'Sylhet', divisionBn: 'সিলেট', divisionEn: 'Sylhet', lat: 24.8949, lng: 91.8687 },
  { id: 'moulvibazar', nameBn: 'মৌলভীবাজার', nameEn: 'Moulvibazar', divisionBn: 'সিলেট', divisionEn: 'Sylhet', lat: 24.4829, lng: 91.7774 },
  { id: 'habiganj', nameBn: 'হবিগঞ্জ', nameEn: 'Habiganj', divisionBn: 'সিলেট', divisionEn: 'Sylhet', lat: 24.3749, lng: 91.4155 },
  { id: 'sunamganj', nameBn: 'সুনামগঞ্জ', nameEn: 'Sunamganj', divisionBn: 'সিলেট', divisionEn: 'Sylhet', lat: 25.0658, lng: 91.3950 },

  // Rajshahi Division
  { id: 'rajshahi', nameBn: 'রাজশাহী', nameEn: 'Rajshahi', divisionBn: 'রাজশাহী', divisionEn: 'Rajshahi', lat: 24.3636, lng: 88.6241 },
  { id: 'bogura', nameBn: 'বগুড়া', nameEn: 'Bogura', divisionBn: 'রাজশাহী', divisionEn: 'Rajshahi', lat: 24.8465, lng: 89.3770 },
  { id: 'pabna', nameBn: 'পাবনা', nameEn: 'Pabna', divisionBn: 'রাজশাহী', divisionEn: 'Rajshahi', lat: 24.0064, lng: 89.2372 },
  { id: 'sirajganj', nameBn: 'সিরাজগঞ্জ', nameEn: 'Sirajganj', divisionBn: 'রাজশাহী', divisionEn: 'Rajshahi', lat: 24.4534, lng: 89.7008 },
  { id: 'naogaon', nameBn: 'নওগাঁ', nameEn: 'Naogaon', divisionBn: 'রাজশাহী', divisionEn: 'Rajshahi', lat: 24.7936, lng: 88.9318 },
  { id: 'natore', nameBn: 'নাটোর', nameEn: 'Natore', divisionBn: 'রাজশাহী', divisionEn: 'Rajshahi', lat: 24.4206, lng: 89.0003 },
  { id: 'chapainawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', nameEn: 'Chapainawabganj', divisionBn: 'রাজশাহী', divisionEn: 'Rajshahi', lat: 24.5965, lng: 88.2775 },
  { id: 'joypurhat', nameBn: 'জয়পুরহাট', nameEn: 'Joypurhat', divisionBn: 'রাজশাহী', divisionEn: 'Rajshahi', lat: 25.1015, lng: 89.0277 },

  // Khulna Division
  { id: 'khulna', nameBn: 'খুলনা', nameEn: 'Khulna', divisionBn: 'খুলনা', divisionEn: 'Khulna', lat: 22.8456, lng: 89.5403 },
  { id: 'jashore', nameBn: 'যশোর', nameEn: 'Jashore', divisionBn: 'খুলনা', divisionEn: 'Khulna', lat: 23.1664, lng: 89.2081 },
  { id: 'kushtia', nameBn: 'কুষ্টিয়া', nameEn: 'Kushtia', divisionBn: 'খুলনা', divisionEn: 'Khulna', lat: 23.9013, lng: 89.1205 },
  { id: 'satkhira', nameBn: 'সাতক্ষীরা', nameEn: 'Satkhira', divisionBn: 'খুলনা', divisionEn: 'Khulna', lat: 22.7185, lng: 89.0705 },
  { id: 'bagerhat', nameBn: 'বাগেরহাট', nameEn: 'Bagerhat', divisionBn: 'খুলনা', divisionEn: 'Khulna', lat: 22.6516, lng: 89.7859 },
  { id: 'chuadanga', nameBn: 'চুয়াডাঙ্গা', nameEn: 'Chuadanga', divisionBn: 'খুলনা', divisionEn: 'Khulna', lat: 23.6402, lng: 88.8418 },
  { id: 'jhenaidah', nameBn: 'ঝিনাইদহ', nameEn: 'Jhenaidah', divisionBn: 'খুলনা', divisionEn: 'Khulna', lat: 23.5448, lng: 89.1539 },
  { id: 'magura', nameBn: 'মাগুরা', nameEn: 'Magura', divisionBn: 'খুলনা', divisionEn: 'Khulna', lat: 23.4873, lng: 89.4198 },
  { id: 'meherpur', nameBn: 'মেহেরপুর', nameEn: 'Meherpur', divisionBn: 'খুলনা', divisionEn: 'Khulna', lat: 23.7622, lng: 88.6318 },
  { id: 'narail', nameBn: 'নড়াইল', nameEn: 'Narail', divisionBn: 'খুলনা', divisionEn: 'Khulna', lat: 23.1725, lng: 89.5127 },

  // Barishal Division
  { id: 'barishal', nameBn: 'বরিশাল', nameEn: 'Barishal', divisionBn: 'বরিশাল', divisionEn: 'Barishal', lat: 22.7010, lng: 90.3535 },
  { id: 'bhola', nameBn: 'ভোলা', nameEn: 'Bhola', divisionBn: 'বরিশাল', divisionEn: 'Barishal', lat: 22.6859, lng: 90.6481 },
  { id: 'patuakhali', nameBn: 'পটুয়াখালী', nameEn: 'Patuakhali', divisionBn: 'বরিশাল', divisionEn: 'Barishal', lat: 22.3596, lng: 90.3299 },
  { id: 'pirojpur', nameBn: 'পিরোজপুর', nameEn: 'Pirojpur', divisionBn: 'বরিশাল', divisionEn: 'Barishal', lat: 22.5841, lng: 89.9720 },
  { id: 'barguna', nameBn: 'বরগুনা', nameEn: 'Barguna', divisionBn: 'বরিশাল', divisionEn: 'Barishal', lat: 22.0953, lng: 90.0772 },
  { id: 'jhalakathi', nameBn: 'ঝালকাঠি', nameEn: 'Jhalakathi', divisionBn: 'বরিশাল', divisionEn: 'Barishal', lat: 22.6406, lng: 90.1987 },

  // Rangpur Division
  { id: 'rangpur', nameBn: 'রংপুর', nameEn: 'Rangpur', divisionBn: 'রংপুর', divisionEn: 'Rangpur', lat: 25.7439, lng: 89.2752 },
  { id: 'dinajpur', nameBn: 'দিনাজপুর', nameEn: 'Dinajpur', divisionBn: 'রংপুর', divisionEn: 'Rangpur', lat: 25.6217, lng: 88.6354 },
  { id: 'gaibandha', nameBn: 'গাইবান্ধা', nameEn: 'Gaibandha', divisionBn: 'রংপুর', divisionEn: 'Rangpur', lat: 25.3288, lng: 89.5407 },
  { id: 'kurigram', nameBn: 'কুড়িগ্রাম', nameEn: 'Kurigram', divisionBn: 'রংপুর', divisionEn: 'Rangpur', lat: 25.8054, lng: 89.6362 },
  { id: 'lalmonirhat', nameBn: 'লালমনিরহাট', nameEn: 'Lalmonirhat', divisionBn: 'রংপুর', divisionEn: 'Rangpur', lat: 25.9923, lng: 89.2847 },
  { id: 'nilphamari', nameBn: 'নীলফামারী', nameEn: 'Nilphamari', divisionBn: 'রংপুর', divisionEn: 'Rangpur', lat: 25.9318, lng: 88.8560 },
  { id: 'panchagarh', nameBn: 'পঞ্চগড়', nameEn: 'Panchagarh', divisionBn: 'রংপুর', divisionEn: 'Rangpur', lat: 26.3411, lng: 88.5541 },
  { id: 'thakurgaon', nameBn: 'ঠাকুরগাঁও', nameEn: 'Thakurgaon', divisionBn: 'রংপুর', divisionEn: 'Rangpur', lat: 26.0337, lng: 88.4617 },

  // Mymensingh Division
  { id: 'mymensingh', nameBn: 'ময়মনসিংহ', nameEn: 'Mymensingh', divisionBn: 'ময়মনসিংহ', divisionEn: 'Mymensingh', lat: 24.7471, lng: 90.4203 },
  { id: 'jamalpur', nameBn: 'জামালপুর', nameEn: 'Jamalpur', divisionBn: 'ময়মনসিংহ', divisionEn: 'Mymensingh', lat: 24.9375, lng: 89.9378 },
  { id: 'netrokona', nameBn: 'নেত্রকোণা', nameEn: 'Netrokona', divisionBn: 'ময়মনসিংহ', divisionEn: 'Mymensingh', lat: 24.8709, lng: 90.7279 },
  { id: 'sherpur', nameBn: 'শেরপুর', nameEn: 'Sherpur', divisionBn: 'ময়মনসিংহ', divisionEn: 'Mymensingh', lat: 25.0205, lng: 90.0153 },
];

export interface PrayerTimesResult {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  sunset: Date;
  maghrib: Date;
  isha: Date;
  sehriEnd: Date;
  ishraq: Date;
  tahajjud: Date;
}

export interface WaqtInfo {
  key: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  nameBn: string;
  nameEn: string;
  nameAr: string;
  time: Date;
  timeFormattedBn: string;
  timeFormattedEn: string;
  isPassed: boolean;
  isCurrent: boolean;
  isNext: boolean;
}

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/**
 * Calculates prayer times for a given date, lat, lng, and timezone offset
 */
export function calculatePrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  timezoneOffsetHours: number = 6, // Bangladesh is UTC+6
  config: PrayerTimeConfig = { fajrAngle: 18, ishaAngle: 18, asrJuristic: 'hanafi' }
): PrayerTimesResult {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Julian Day
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jd =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  const d = jd - 2451545.0; // days since J2000.0

  // Mean anomaly of the Sun
  const g = (357.529 + 0.98560028 * d) % 360;
  // Mean longitude of the Sun
  const q = (280.459 + 0.98564736 * d) % 360;
  // Geocentric apparent ecliptic longitude
  const L = (q + 1.915 * Math.sin(rad(g)) + 0.02 * Math.sin(rad(2 * g))) % 360;

  // Mean obliquity of the ecliptic
  const e = 23.439 - 0.00000036 * d;

  // Declination of the Sun
  const declination = deg(Math.asin(Math.sin(rad(e)) * Math.sin(rad(L))));

  // Equation of Time in minutes
  const RA = deg(Math.atan2(Math.cos(rad(e)) * Math.sin(rad(L)), Math.cos(rad(L)))) / 15;
  const eqTime = (q / 15 - RA) * 60; // in minutes

  // Solar noon (Dhuhr) in fractional hours
  const dhuhrHour = 12 + timezoneOffsetHours - lng / 15 - eqTime / 60;

  // Hour angle for twilight / angles
  const hourAngle = (angle: number): number => {
    const cosHA =
      (-Math.sin(rad(angle)) - Math.sin(rad(lat)) * Math.sin(rad(declination))) /
      (Math.cos(rad(lat)) * Math.cos(rad(declination)));
    if (cosHA > 1) return 0; // Sun never rises
    if (cosHA < -1) return 180; // Sun never sets
    return deg(Math.acos(cosHA));
  };

  // Sunrise/Sunset angle is ~0.833° below horizon due to refraction and sun radius
  const sunAngle = 0.833;
  const haSunrise = hourAngle(sunAngle);

  // Fajr & Isha hour angles
  const haFajr = hourAngle(config.fajrAngle);
  const haIsha = hourAngle(config.ishaAngle);

  // Asr shadow angle calculation
  const shadowFactor = config.asrJuristic === 'hanafi' ? 2 : 1;
  const asrAlt = deg(Math.atan(1 / (shadowFactor + Math.tan(rad(Math.abs(lat - declination))))));
  const haAsr = hourAngle(-asrAlt);

  const fajrHour = dhuhrHour - haFajr / 15;
  const sunriseHour = dhuhrHour - haSunrise / 15;
  const asrHour = dhuhrHour + haAsr / 15;
  const sunsetHour = dhuhrHour + haSunrise / 15;
  const maghribHour = sunsetHour;
  const ishaHour = dhuhrHour + haIsha / 15;

  const toDate = (fractionalHours: number): Date => {
    const result = new Date(date);
    let totalMinutes = Math.round(fractionalHours * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    result.setHours(hours, minutes, 0, 0);
    return result;
  };

  const fajr = toDate(fajrHour);
  const sunrise = toDate(sunriseHour);
  const dhuhr = toDate(dhuhrHour);
  const asr = toDate(asrHour);
  const sunset = toDate(sunsetHour);
  const maghrib = toDate(maghribHour);
  const isha = toDate(ishaHour);

  // Sehri ends 10 mins before Fajr
  const sehriEnd = new Date(fajr.getTime() - 10 * 60000);
  // Ishraq is 15 mins after Sunrise
  const ishraq = new Date(sunrise.getTime() + 15 * 60000);
  // Tahajjud best time: last third of night (between Maghrib and Fajr)
  const nightDurationMs = fajr.getTime() + 24 * 3600000 - maghrib.getTime();
  const tahajjud = new Date(maghrib.getTime() + (2 / 3) * nightDurationMs);

  return {
    fajr,
    sunrise,
    dhuhr,
    asr,
    sunset,
    maghrib,
    isha,
    sehriEnd,
    ishraq,
    tahajjud,
  };
}

export function formatTimeBn(d: Date): string {
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const isPm = hours >= 12;
  hours = hours % 12 || 12;

  const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const hStr = `${hours}`;

  const periodBn = isPm ? 'অপরাহ্ন' : 'পূর্বাহ্ন';
  // Standard everyday Bangla prayer format (যেমন: ভোর ৫:১২, দুপুর ১২:১৫, বিকেল ৪:২৫ ইত্যাদি)
  let timeOfDayBn = '';
  const fullHour = d.getHours();
  if (fullHour >= 4 && fullHour < 6) timeOfDayBn = 'ভোর ';
  else if (fullHour >= 6 && fullHour < 12) timeOfDayBn = 'সকাল ';
  else if (fullHour >= 12 && fullHour < 15) timeOfDayBn = 'দুপুর ';
  else if (fullHour >= 15 && fullHour < 18) timeOfDayBn = 'বিকেল ';
  else if (fullHour >= 18 && fullHour < 20) timeOfDayBn = 'সন্ধ্যা ';
  else timeOfDayBn = 'রাত ';

  import('./banglaNumbers').then;
  // Use simple digit replacer
  const bnDigits: { [k: string]: string } = {
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
  const toBn = (s: string) => s.replace(/\d/g, (x) => bnDigits[x] || x);

  return `${timeOfDayBn}${toBn(hStr)}:${toBn(mStr)}`;
}

export function formatTimeEn(d: Date): string {
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${mStr} ${ampm}`;
}

export function getWaqtsStatus(times: PrayerTimesResult, now: Date = new Date()): WaqtInfo[] {
  const nowMs = now.getTime();

  const mainWaqts: {
    key: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    nameBn: string;
    nameEn: string;
    nameAr: string;
    time: Date;
  }[] = [
    { key: 'fajr', nameBn: 'ফজর', nameEn: 'Fajr', nameAr: 'الفجر', time: times.fajr },
    { key: 'sunrise', nameBn: 'সূর্যোদয়', nameEn: 'Sunrise', nameAr: 'الشروق', time: times.sunrise },
    { key: 'dhuhr', nameBn: 'যোহর', nameEn: 'Dhuhr', nameAr: 'الظهر', time: times.dhuhr },
    { key: 'asr', nameBn: 'আসর', nameEn: 'Asr', nameAr: 'العصر', time: times.asr },
    { key: 'maghrib', nameBn: 'মাগরিব', nameEn: 'Maghrib', nameAr: 'المغرب', time: times.maghrib },
    { key: 'isha', nameBn: 'ইশা', nameEn: 'Isha', nameAr: 'العشاء', time: times.isha },
  ];

  // After Isha, the next Fajr belongs to the following local day.
  if (nowMs >= mainWaqts[5].time.getTime()) {
    mainWaqts[0].time = new Date(mainWaqts[0].time.getTime() + 24 * 60 * 60 * 1000);
  }

  // Determine current active prayer
  let currentIndex = -1;
  for (let i = 0; i < mainWaqts.length; i++) {
    if (nowMs >= mainWaqts[i].time.getTime()) {
      currentIndex = i;
    }
  }

  // Next prayer
  const nextIndex = (currentIndex + 1) % mainWaqts.length;

  return mainWaqts.map((item, idx) => ({
    ...item,
    timeFormattedBn: formatTimeBn(item.time),
    timeFormattedEn: formatTimeEn(item.time),
    isPassed: nowMs >= item.time.getTime(),
    isCurrent: idx === currentIndex,
    isNext: idx === nextIndex,
  }));
}
