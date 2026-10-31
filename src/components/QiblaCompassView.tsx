import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  MapPin,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Info,
  Sun,
} from 'lucide-react';
import {
  BANGLADESH_DISTRICTS,
  District,
} from '../utils/prayerTimes';
import {
  calculateQiblaDirection,
  calculateDistanceToKaaba,
  getHeadingDeviation,
} from '../utils/qibla';
import { toBanglaNumber } from '../utils/banglaNumbers';

export const QiblaCompassView: React.FC = () => {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('dhaka');
  const [customCoords, setCustomCoords] = useState<{ lat: number; lng: number; nameBn: string } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  
  // Compass heading state (0° to 360°)
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [hasCompassSensor, setHasCompassSensor] = useState<boolean>(false);
  const [manualAdjustment, setManualAdjustment] = useState<number>(0);

  const currentDistrict = useMemo(() => {
    return BANGLADESH_DISTRICTS.find((d) => d.id === selectedDistrictId) || BANGLADESH_DISTRICTS[0];
  }, [selectedDistrictId]);

  const activeLat = customCoords ? customCoords.lat : currentDistrict.lat;
  const activeLng = customCoords ? customCoords.lng : currentDistrict.lng;
  const locationLabel = customCoords ? customCoords.nameBn : `${currentDistrict.nameBn} জেলা`;

  // Calculated Qibla bearing and distance to Kaaba
  const qiblaBearing = useMemo(() => {
    return calculateQiblaDirection(activeLat, activeLng);
  }, [activeLat, activeLng]);

  const distanceKm = useMemo(() => {
    return calculateDistanceToKaaba(activeLat, activeLng);
  }, [activeLat, activeLng]);

  // Combine device sensor heading + manual dial
  const currentHeading = (deviceHeading + manualAdjustment) % 360;
  const deviation = getHeadingDeviation(currentHeading, qiblaBearing);
  const isAligned = Math.abs(deviation) <= 4; // within 4 degrees = perfect alignment

  // Setup device orientation listener for real mobile compass
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // iOS webkitCompassHeading or standard alpha
      let heading = 0;
      if ('webkitCompassHeading' in e && typeof (e as any).webkitCompassHeading === 'number') {
        heading = (e as any).webkitCompassHeading;
        setHasCompassSensor(true);
      } else if (e.alpha !== null) {
        heading = 360 - e.alpha;
        setHasCompassSensor(true);
      }
      setDeviceHeading(Math.round(heading));
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Geolocation trigger
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('আপনার ব্রাউজারে জিপিএস উপলব্ধ নেই।');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          nameBn: 'আমার বর্তমান জিপিএস অবস্থান',
        });
        setGeoLoading(false);
      },
      (err) => {
        console.warn('GPS error:', err);
        setGeoLoading(false);
      },
      { timeout: 8000 }
    );
  };

  // Align directly to Qibla helper button (e.g. for desktop test)
  const handleAutoAlign = () => {
    setManualAdjustment(qiblaBearing);
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6 pb-28 font-bangla space-y-6">
      {/* Location Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 shadow-xs border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              {locationLabel} হতে পবিত্র কাবার কিবলা দিক
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              কিবলার কোণ: <span className="font-bold text-emerald-700 dark:text-emerald-400">{toBanglaNumber(qiblaBearing)}°</span> (উত্তর হতে ঘড়ির কাঁটার দিকে)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={customCoords ? '' : selectedDistrictId}
            onChange={(e) => {
              setCustomCoords(null);
              setSelectedDistrictId(e.target.value);
            }}
            className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="কিবলার জন্য জেলা নির্বাচন করুন"
          >
            {BANGLADESH_DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nameBn}
              </option>
            ))}
          </select>

          <button
            onClick={handleUseGPS}
            disabled={geoLoading}
            className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
            aria-label="জিপিএস দিয়ে সঠিক কিবলা বের করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
            <span>জিপিএস</span>
          </button>
        </div>
      </div>

      {/* Alignment Status Banner */}
      <div
        className={`rounded-2xl p-4 text-center transition-all border flex items-center justify-center gap-2 text-sm sm:text-base font-bold ${
          isAligned
            ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20 animate-pulse'
            : 'bg-amber-50 dark:bg-stone-800 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800/60'
        }`}
      >
        {isAligned ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>মাশাআল্লাহ! আপনি সঠিক কিবলার (পবিত্র কাবা) অভিমুখে আছেন</span>
          </>
        ) : (
          <>
            <RotateCw className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>
              {deviation > 0
                ? `কিবলার দিকে যেতে আরও ${toBanglaNumber(Math.abs(Math.round(deviation)))}° ডানে ঘুরুন`
                : `কিবলার দিকে যেতে আরও ${toBanglaNumber(Math.abs(Math.round(deviation)))}° বামে ঘুরুন`}
            </span>
          </>
        )}
      </div>

      {/* Compass Dial Hero Card */}
      <div className="bg-gradient-to-b from-stone-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-emerald-800/50 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Decorative backdrop rings */}
        <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

        {/* Distance and angle pill */}
        <div className="flex items-center gap-3 text-xs mb-6 z-10">
          <span className="px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700 text-amber-300 font-medium">
            দূরত্ব: {toBanglaNumber(distanceKm.toLocaleString())} কি.মি.
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700 text-emerald-200 font-medium">
            বর্তমান দিক: {toBanglaNumber(currentHeading)}°
          </span>
        </div>

        {/* The Animated SVG Compass Dial */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
          {/* Compass Outer Ring (Rotates inversely with device heading) */}
          <div
            className="absolute inset-0 rounded-full border-4 border-amber-400/30 flex items-center justify-center transition-transform duration-300 ease-out shadow-inner"
            style={{ transform: `rotate(${-currentHeading}deg)` }}
          >
            {/* Degree ticks */}
            <div className="absolute inset-2 rounded-full border border-dashed border-emerald-400/20" />

            {/* Cardinal direction labels */}
            <span className="absolute top-2 font-bold text-sm text-rose-400 font-bangla">উ (North)</span>
            <span className="absolute bottom-2 font-bold text-sm text-stone-300 font-bangla">দ (South)</span>
            <span className="absolute right-2 font-bold text-sm text-stone-300 font-bangla">পূ (East)</span>
            <span className="absolute left-2 font-bold text-sm text-amber-400 font-bangla">প (West)</span>

            {/* Kaaba Direction Marker on the ring */}
            <div
              className="absolute w-full h-full flex flex-col items-center justify-start pointer-events-none"
              style={{ transform: `rotate(${qiblaBearing}deg)` }}
            >
              <div className="w-7 h-7 -mt-3.5 bg-amber-400 text-emerald-950 rounded-lg flex items-center justify-center shadow-lg font-bold text-xs ring-2 ring-white">
                🕋
              </div>
            </div>
          </div>

          {/* Center Needle & Kaaba Pointer */}
          <div
            className="relative z-10 flex flex-col items-center justify-center pointer-events-none transition-transform duration-300 ease-out"
            style={{ transform: `rotate(${qiblaBearing - currentHeading}deg)` }}
          >
            {/* North pointing arrow tip */}
            <div
              className={`w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[60px] drop-shadow-md transition-colors ${
                isAligned ? 'border-b-emerald-400' : 'border-b-amber-400'
              }`}
            />
            {/* Center Pivot Hub */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border-2 border-white shadow-xl flex items-center justify-center text-sm font-bold text-stone-900 my-[-6px]">
              🕋
            </div>
            {/* South pointing tail */}
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[50px] border-t-stone-600/70" />
          </div>
        </div>

        {/* Alignment Guidance */}
        <div className="mt-8 text-center z-10 max-w-sm">
          <p className="text-sm font-semibold text-stone-200">
            {isAligned ? (
              <span className="text-emerald-400">আপনি সরাসরি পবিত্র কাবার মুখোমুখি আছেন।</span>
            ) : (
              <span>কম্পাসের তীরটি গোল গোলকের স্বর্ণালী কাবার সাথে মিলিত করুন।</span>
            )}
          </p>
          <p className="text-xs text-stone-400 mt-1">
            বাংলাদেশে কিবলা সাধারণত পশ্চিম হতে সামান্য উত্তর দিকে (প্রায় ২৭৭°-২৭৮°) অবস্থিত।
          </p>
        </div>

        {/* Simulation / Manual adjustment slider for desktop users */}
        <div className="w-full max-w-md mt-6 pt-5 border-t border-emerald-900/60 z-10">
          <div className="flex items-center justify-between text-xs text-stone-300 mb-2">
            <span>কম্পাস ঘুরিয়ে পরীক্ষা করুন:</span>
            <button
              onClick={handleAutoAlign}
              className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold transition-transform hover:scale-105"
            >
              সরাসরি কিবলায় মেলান
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={manualAdjustment}
            onChange={(e) => setManualAdjustment(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
            aria-label="ম্যানুয়াল কম্পাস ডায়াল ঘূর্ণন"
          />
        </div>
      </div>

      {/* Helpful Direction Finding Tips */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 space-y-3 text-xs text-stone-600 dark:text-stone-300">
        <h4 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-1.5">
          <Info className="w-4 h-4 text-emerald-600" />
          <span>নির্ভুল কিবলা নির্ণয়ের নিয়ম ও সতর্কতা</span>
        </h4>
        <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
          <li>
            <strong className="text-stone-800 dark:text-stone-100">চৌম্বকীয় বিভ্রান্তি এড়ান:</strong> মোবাইল ফোনটিকে ল্যাপটপ, চার্জার, ধাতব টেবিল বা বৈদ্যুতিক তার হতে দূরে সমতল স্থানে রাখুন।
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-100">কম্পাস ক্যালিব্রেশন:</strong> ফোনের সেন্সর সঠিকভাবে কাজ করতে ফোনটিকে হাতের তালুতে নিয়ে বায়ুতে ইংরেজি '৮' (Figure 8) আকৃতিতে কয়েকবার ঘোরান।
          </li>
          <li>
            <strong className="text-stone-800 dark:text-stone-100">সূর্যের অবস্থান দিয়ে যাচাই:</strong> বাংলাদেশে সূর্যাস্তের দিক হলো পশ্চিম। কিবলা পশ্চিম দিগন্ত হতে সামান্য ডান দিকে (উত্তর দিকে প্রায় ৭-৮ ডিগ্রি) হেলে থাকে।
          </li>
        </ul>
      </div>
    </div>
  );
};
