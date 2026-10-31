import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin,
  Clock,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Compass,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Utensils,
  Volume2,
} from 'lucide-react';
import {
  BANGLADESH_DISTRICTS,
  calculatePrayerTimes,
  formatTimeBn,
  formatTimeEn,
  getWaqtsStatus,
  District,
  PrayerTimeConfig,
  CALCULATION_METHODS,
} from '../utils/prayerTimes';
import { toBanglaNumber, formatDurationToBangla } from '../utils/banglaNumbers';

export const PrayerTimesView: React.FC = () => {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('dhaka');
  const [customCoords, setCustomCoords] = useState<{ lat: number; lng: number; nameBn: string; accuracy?: number } | null>(null);
  const [geoError, setGeoError] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [asrJuristic, setAsrJuristic] = useState<'hanafi' | 'shafii'>('hanafi');
  const [calculationMethod, setCalculationMethod] = useState<string>('Karachi');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [gpsLive, setGpsLive] = useState(false);
  const [lastGpsUpdate, setLastGpsUpdate] = useState<Date | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Update clock every 30 seconds for live countdown
  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 10000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => () => {
    if (watchIdRef.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchIdRef.current);
  }, []);

  const currentDistrict = useMemo(() => {
    return BANGLADESH_DISTRICTS.find((d) => d.id === selectedDistrictId) || BANGLADESH_DISTRICTS[0];
  }, [selectedDistrictId]);

  const activeLat = customCoords ? customCoords.lat : currentDistrict.lat;
  const activeLng = customCoords ? customCoords.lng : currentDistrict.lng;
  const locationLabel = customCoords ? customCoords.nameBn : `${currentDistrict.nameBn} জেলা (${currentDistrict.divisionBn} বিভাগ)`;

  const timezoneOffsetHours = -currentTime.getTimezoneOffset() / 60;
  const timezoneLabel = 'UTC' + (timezoneOffsetHours >= 0 ? '+' : '') + timezoneOffsetHours;

  const config: PrayerTimeConfig = {
    fajrAngle: CALCULATION_METHODS[calculationMethod]?.fajrAngle || 18,
    ishaAngle: CALCULATION_METHODS[calculationMethod]?.ishaAngle || 18,
    asrJuristic,
  };

  const prayerTimes = useMemo(() => {
    return calculatePrayerTimes(currentTime, activeLat, activeLng, timezoneOffsetHours, config);
  }, [currentTime, activeLat, activeLng, timezoneOffsetHours, asrJuristic, calculationMethod]);

  const waqts = useMemo(() => {
    return getWaqtsStatus(prayerTimes, currentTime);
  }, [prayerTimes, currentTime]);

  // Find next waqt and countdown
  const nextWaqt = waqts.find((w) => w.isNext) || waqts[0];
  const minutesUntilNext = Math.max(0, Math.round((nextWaqt.time.getTime() - currentTime.getTime()) / 60000));

  // Start continuous GPS updates only after the user grants permission.
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setGeoError('আপনার ব্রাউজারে GPS উপলব্ধ নেই।');
      return;
    }
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    setGeoLoading(true);
    setGeoError('');
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setCustomCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          nameBn: 'আমার বর্তমান GPS অবস্থান',
        });
        setLastGpsUpdate(new Date(pos.timestamp));
        setGpsLive(true);
        setGeoLoading(false);
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'Location permission বন্ধ আছে। ফোন/ব্রাউজারের Settings থেকে অনুমতি দিন।',
          2: 'GPS অবস্থান পাওয়া যায়নি। Location চালু করে আবার চেষ্টা করুন।',
          3: 'GPS পেতে সময় শেষ হয়েছে। খোলা জায়গায় আবার চেষ্টা করুন।',
        };
        setGeoError(messages[err.code] || 'GPS অবস্থান পাওয়া যায়নি।');
        setGeoLoading(false);
        setGpsLive(false);
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 30000 }
    );
  };

  const handleSelectDistrict = (districtId: string) => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsLive(false);
    setLastGpsUpdate(null);
    setCustomCoords(null);
    setSelectedDistrictId(districtId);
  };

  // Group districts by division for tidy dropdown
  const divisions = ['ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ'];

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-4 pb-28 font-bangla sm:px-5 sm:py-6 space-y-5">
      {/* Location Selector Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              {locationLabel}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              অক্ষাংশ: {toBanglaNumber(activeLat.toFixed(4))}°, দ্রাঘিমাংশ: {toBanglaNumber(activeLng.toFixed(4))}° ({timezoneLabel}){customCoords?.accuracy ? ` · GPS ±${Math.round(customCoords.accuracy)}m` : ''}{lastGpsUpdate ? ` · আপডেট ${lastGpsUpdate.toLocaleTimeString('bn-BD')}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 64 Districts Dropdown */}
          <select
            value={customCoords ? '' : selectedDistrictId}
            onChange={(e) => handleSelectDistrict(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="জেলা নির্বাচন করুন"
          >
            {divisions.map((div) => (
              <optgroup key={div} label={`${div} বিভাগ`}>
                {BANGLADESH_DISTRICTS.filter((d) => d.divisionBn === div).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nameBn} ({d.nameEn})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          {/* GPS Button */}
          <button
            onClick={handleUseGPS}
            disabled={geoLoading}
            className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
            aria-label="আমার জিপিএস লোকেশন ব্যবহার করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
            <span>{geoLoading ? 'খোঁজা হচ্ছে...' : gpsLive ? 'GPS Live চালু' : 'লাইভ GPS চালু করুন'}</span>
          </button>
        </div>
      </div>

      {gpsLive && <p className="-mt-3 text-xs text-emerald-700 dark:text-emerald-300">আপনার অবস্থান পরিবর্তন হলে নামাজের সময় স্বয়ংক্রিয়ভাবে পুনরায় হিসাব হবে। লাইভ GPS বন্ধ করতে জেলা নির্বাচন করুন।</p>}

      {geoError && <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{geoError}</div>}

      {/* Hero Next Prayer Countdown Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-700/60">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-amber-400/30 text-amber-300 text-xs mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>পরবর্তী ওয়াক্ত</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-300 mb-1">
              {nextWaqt.nameBn} ({nextWaqt.nameAr})
            </h1>
            <p className="text-xl sm:text-2xl text-emerald-100 font-medium">
              শুরুর সময়: {nextWaqt.timeFormattedBn}
            </p>

            <div className="mt-4 flex items-center gap-2 bg-emerald-950/60 px-4 py-2 rounded-xl border border-emerald-700/50 w-fit">
              <span className="text-stone-300 text-xs">আর বাকি আছে:</span>
              <span className="text-amber-300 font-bold text-base">
                {formatDurationToBangla(minutesUntilNext)}
              </span>
            </div>
          </div>

          {/* Fasting (Sehri & Iftar) Info Box */}
          <div className="w-full md:w-auto bg-white/10 dark:bg-black/30 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 text-center min-w-[240px]">
            <div className="flex items-center justify-center gap-1.5 text-amber-300 text-xs font-bold mb-3">
              <Utensils className="w-4 h-4" />
              <span>আজকের সেহরি ও ইফতার (রোজা)</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-2.5 rounded-xl bg-black/20 border border-white/10">
                <p className="text-[11px] text-emerald-200">সেহরি শেষ (ফজর)</p>
                <p className="text-base font-bold text-white mt-0.5">
                  {formatTimeBn(prayerTimes.sehriEnd)}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-black/20 border border-white/10">
                <p className="text-[11px] text-amber-200">ইফতার (মাগরিব)</p>
                <p className="text-base font-bold text-amber-300 mt-0.5">
                  {formatTimeBn(prayerTimes.maghrib)}
                </p>
              </div>
            </div>

            <p className="text-[10px] text-emerald-200/80 mt-2">
              সতর্কতামূলক সেহরি শেষ ফজর ওয়াক্তের ১০ মিনিট পূর্বে
            </p>
          </div>
        </div>
      </div>

      {/* 6 Main Waqt Cards Grid */}
      <div>
        <h3 className="text-base font-bold text-stone-900 dark:text-white mb-3 flex items-center gap-2">
          <span>৫ ওয়াক্ত নামাজের নির্ধারিত সময়সূচী</span>
          <span className="text-xs font-normal text-stone-500">
            ({currentTime.toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })})
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {waqts.map((waqt) => {
            const getIcon = () => {
              switch (waqt.key) {
                case 'fajr':
                  return <Sunrise className="w-5 h-5 text-indigo-500" />;
                case 'sunrise':
                  return <Sun className="w-5 h-5 text-amber-500" />;
                case 'dhuhr':
                  return <Sun className="w-5 h-5 text-yellow-500" />;
                case 'asr':
                  return <Sun className="w-5 h-5 text-orange-500" />;
                case 'maghrib':
                  return <Sunset className="w-5 h-5 text-rose-500" />;
                case 'isha':
                  return <Moon className="w-5 h-5 text-indigo-600" />;
              }
            };

            return (
              <div
                key={waqt.key}
                className={`p-4 rounded-2xl border transition-all ${
                  waqt.isCurrent
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500 shadow-md'
                    : waqt.isNext
                    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-400 ring-1 ring-amber-400'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800">
                      {getIcon()}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 dark:text-white text-base">
                        {waqt.nameBn}
                      </h4>
                      <p className="text-[11px] text-stone-400 font-arabic">
                        {waqt.nameAr}
                      </p>
                    </div>
                  </div>

                  {waqt.isCurrent ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] animate-pulse">
                      চলমান ওয়াক্ত
                    </span>
                  ) : waqt.isNext ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-bold text-[10px]">
                      পরবর্তী
                    </span>
                  ) : waqt.isPassed ? (
                    <span className="text-stone-400 text-xs">অতিবাহিত</span>
                  ) : null}
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                    {waqt.timeFormattedBn}
                  </span>
                  <span className="text-xs text-stone-400">
                    {waqt.timeFormattedEn}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extra Nafal Times: Ishraq & Tahajjud */}
      <div className="bg-stone-50 dark:bg-stone-900/60 rounded-2xl p-4 border border-stone-200 dark:border-stone-800">
        <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
          নফল ইবাদতের বিশেষ সময়সমূহ
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between">
            <div>
              <p className="font-bold text-stone-800 dark:text-stone-200">ইশরাক ও চাশতের ওয়াক্ত</p>
              <p className="text-[11px] text-stone-500">সূর্যোদয়ের ১৫ মিনিট পর শুরু</p>
            </div>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
              {formatTimeBn(prayerTimes.ishraq)} হতে
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between">
            <div>
              <p className="font-bold text-stone-800 dark:text-stone-200">তাহাজ্জুদ নামাজের উত্তম সময়</p>
              <p className="text-[11px] text-stone-500">রাতের শেষ তৃতীয়াংশ</p>
            </div>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
              {formatTimeBn(prayerTimes.tahajjud)} হতে ফজর পর্যন্ত
            </span>
          </div>
        </div>
      </div>

      {/* Calculation Settings Options */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Asr Juristic School Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-stone-600 dark:text-stone-400 font-medium">আসর মাযহাব:</span>
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setAsrJuristic('hanafi')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                asrJuristic === 'hanafi'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-stone-700 dark:text-stone-300'
              }`}
            >
              হানাফী (দ্বিগুণ ছায়া)
            </button>
            <button
              onClick={() => setAsrJuristic('shafii')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                asrJuristic === 'shafii'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-stone-700 dark:text-stone-300'
              }`}
            >
              শাফেয়ী / হাম্বলী
            </button>
          </div>
        </div>

        {/* Calculation method */}
        <div className="flex items-center gap-2">
          <span className="text-stone-600 dark:text-stone-400 font-medium">পদ্ধতি:</span>
          <select
            value={calculationMethod}
            onChange={(e) => setCalculationMethod(e.target.value)}
            className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-none"
            aria-label="নামাজ গণনার পদ্ধতি"
          >
            {Object.keys(CALCULATION_METHODS).map((k) => (
              <option key={k} value={k}>
                {CALCULATION_METHODS[k].name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
