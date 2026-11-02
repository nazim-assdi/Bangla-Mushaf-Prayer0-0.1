import React, { useEffect, useMemo, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Compass, MapPin, RefreshCw, CheckCircle2, AlertTriangle, Info, Smartphone } from 'lucide-react';
import { BANGLADESH_DISTRICTS } from '../utils/prayerTimes';
import { calculateQiblaDirection, calculateDistanceToKaaba, getHeadingDeviation } from '../utils/qibla';
import { UiLanguage, formatUiNumber, translateUi } from '../services/i18n';

type Coordinates = { lat: number; lng: number; nameBn: string; accuracy?: number };

export const QiblaCompassView: React.FC<{ uiLanguage: UiLanguage }> = ({ uiLanguage }) => {
  const [selectedDistrictId, setSelectedDistrictId] = useState(() => {
    const saved = localStorage.getItem('mushaf_qibla_district');
    return saved && BANGLADESH_DISTRICTS.some((district) => district.id === saved) ? saved : 'dhaka';
  });
  const [customCoords, setCustomCoords] = useState<Coordinates | null>(() => {
    try { const saved = localStorage.getItem('mushaf_gps_location'); return saved ? JSON.parse(saved) as Coordinates : null; } catch { return null; }
  });
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [sensorError, setSensorError] = useState('');

  useEffect(() => {
    localStorage.setItem('mushaf_qibla_district', selectedDistrictId);
  }, [selectedDistrictId]);

  const currentDistrict = useMemo(
    () => BANGLADESH_DISTRICTS.find((district) => district.id === selectedDistrictId) || BANGLADESH_DISTRICTS[0],
    [selectedDistrictId]
  );
  const activeLat = customCoords?.lat ?? currentDistrict.lat;
  const activeLng = customCoords?.lng ?? currentDistrict.lng;
  const locationLabel = customCoords?.nameBn ?? (uiLanguage === 'bn' ? `${currentDistrict.nameBn} জেলা` : `${currentDistrict.nameEn} · ${translateUi(uiLanguage, 'districtFallback')}`);
  const qiblaBearing = useMemo(() => calculateQiblaDirection(activeLat, activeLng), [activeLat, activeLng]);
  const distanceKm = useMemo(() => calculateDistanceToKaaba(activeLat, activeLng), [activeLat, activeLng]);
  const deviation = deviceHeading === null ? null : getHeadingDeviation(deviceHeading, qiblaBearing);
  const isAligned = deviation !== null && Math.abs(deviation) <= 5;

  const handleOrientation = (event: DeviceOrientationEvent) => {
    const iosHeading = (event as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
    if (typeof iosHeading === 'number' && Number.isFinite(iosHeading)) {
      setDeviceHeading((iosHeading + 360) % 360);
      setSensorError('');
      return;
    }
    // Only trust the standard alpha value when the browser marks it as absolute.
    if (event.absolute && event.alpha !== null && Number.isFinite(event.alpha)) {
      const screenAngle = window.screen.orientation?.angle ?? 0;
      const heading = (360 - event.alpha + screenAngle + 360) % 360;
      setDeviceHeading(heading);
      setSensorError('');
    }
  };

  const enableCompass = async () => {
    setSensorError('');
    try {
      const orientationApi = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };
      if (typeof orientationApi.requestPermission === 'function') {
        const permission = await orientationApi.requestPermission();
        if (permission !== 'granted') {
          setSensorError('কম্পাস ব্যবহারের অনুমতি দেওয়া হয়নি। ফোনের Settings থেকে Motion/Sensor permission চালু করুন।');
          return;
        }
      }
      if (!('DeviceOrientationEvent' in window)) {
        setSensorError('এই ডিভাইসে ব্রাউজার কম্পাস সেন্সর পাওয়া যায়নি।');
        return;
      }
      setSensorError('ফোনটি সমতল করে ধরে ধীরে ধীরে ৮ আকৃতিতে ঘুরিয়ে কম্পাস ক্যালিব্রেট করুন।');
    } catch {
      setSensorError('কম্পাস চালু করা যায়নি। ব্রাউজারের সেন্সর অনুমতি পরীক্ষা করুন।');
    }
  };

  useEffect(() => {
    const listener = (event: DeviceOrientationEvent) => handleOrientation(event);
    window.addEventListener('deviceorientation', listener, true);
    window.addEventListener('deviceorientationabsolute' as keyof WindowEventMap, listener as EventListener, true);
    return () => {
      window.removeEventListener('deviceorientation', listener, true);
      window.removeEventListener('deviceorientationabsolute' as keyof WindowEventMap, listener as EventListener, true);
    };
  }, []);

  const handleUseGPS = async () => {
    if (Capacitor.isNativePlatform()) {
      setGeoLoading(true);
      setGeoError('');
      try {
        let permission = await Geolocation.checkPermissions();
        if (permission.location !== 'granted') permission = await Geolocation.requestPermissions();
        if (permission.location !== 'granted') throw new Error('Location permission দেওয়া হয়নি। Android Settings থেকে অনুমতি দিন।');
        const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
        setCustomCoords({ lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy, nameBn: uiLanguage === 'bn' ? 'বর্তমান GPS অবস্থান' : 'Current GPS location' });
      } catch (error) {
        setGeoError(error instanceof Error ? error.message : 'GPS অবস্থান পাওয়া যায়নি।');
      } finally { setGeoLoading(false); }
      return;
    }
    if (!navigator.geolocation) {
      setGeoError('এই ডিভাইসে GPS/Location সুবিধা পাওয়া যায়নি।');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCustomCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          nameBn: uiLanguage === 'bn' ? 'বর্তমান GPS অবস্থান' : 'Current GPS location',
        });
        setGeoLoading(false);
      },
      (error) => {
        const messages: Record<number, string> = {
          1: 'Location permission বন্ধ আছে। ফোনের Settings থেকে অনুমতি দিন।',
          2: 'GPS অবস্থান পাওয়া যায়নি। Location চালু করে খোলা জায়গায় চেষ্টা করুন।',
          3: 'GPS পেতে সময় শেষ হয়েছে। আবার চেষ্টা করুন।',
        };
        setGeoError(messages[error.code] || 'GPS অবস্থান পাওয়া যায়নি।');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
  };

  const shownHeading = deviceHeading === null ? 0 : deviceHeading;

  return (
    <div className="qibla-screen mx-auto w-full max-w-5xl px-3 py-4 pb-28 font-bangla sm:px-5 sm:py-6">
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <Compass className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-stone-900 dark:text-white">{locationLabel} · {translateUi(uiLanguage, 'qiblaDirection')}</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              উত্তর থেকে ঘড়ির কাঁটার দিকে {formatUiNumber(qiblaBearing, uiLanguage)}° · কাবা পর্যন্ত {formatUiNumber(Math.round(distanceKm), uiLanguage)} কিমি
            </p>
            {customCoords?.accuracy && <p className="text-[11px] text-stone-500">{translateUi(uiLanguage, 'gpsAccuracy')}: {Math.round(customCoords.accuracy)} মিটার</p>}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={customCoords ? '' : selectedDistrictId}
            onChange={(event) => { setCustomCoords(null); setSelectedDistrictId(event.target.value); }}
            className="min-h-10 min-w-0 rounded-xl border border-stone-200 bg-stone-100 px-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            aria-label={translateUi(uiLanguage, 'districtFallback')}
          >
            {BANGLADESH_DISTRICTS.map((district) => <option key={district.id} value={district.id}>{uiLanguage === 'bn' ? district.nameBn : district.nameEn}</option>)}
          </select>
          <button onClick={handleUseGPS} disabled={geoLoading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${geoLoading ? 'animate-spin' : ''}`} />
            {geoLoading ? 'GPS খোঁজা হচ্ছে…' : 'সঠিক GPS নিন'}
          </button>
        </div>
      </div>

      {(geoError || sensorError) && (
        <div role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{geoError || sensorError}</span>
        </div>
      )}

      <div className="rounded-3xl border border-emerald-800/50 bg-gradient-to-b from-stone-950 via-emerald-950 to-stone-950 px-4 py-6 text-white shadow-xl sm:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="rounded-full border border-emerald-700 bg-emerald-900/70 px-3 py-1.5 text-amber-200">কিবলা {formatUiNumber(qiblaBearing, uiLanguage)}°</span>
          <span className="rounded-full border border-emerald-700 bg-emerald-900/70 px-3 py-1.5 text-emerald-100">
            {deviceHeading === null ? 'কম্পাস সেন্সর অপেক্ষমাণ' : `ফোনের দিক ${formatUiNumber(Math.round(deviceHeading), uiLanguage)}°`}
          </span>
        </div>

        <div className="relative mx-auto flex aspect-square w-full max-w-[300px] items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[5px] border-amber-400/50 shadow-[inset_0_0_35px_rgba(16,185,129,0.15)]" style={{ transform: `rotate(${-shownHeading}deg)` }}>
            <div className="absolute inset-3 rounded-full border border-dashed border-emerald-300/40" />
            <span className="absolute left-1/2 top-3 -translate-x-1/2 font-bold text-rose-300">উত্তর</span>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-stone-300">দক্ষিণ</span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300">পূর্ব</span>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300">পশ্চিম</span>
            <div className="absolute inset-0 flex justify-center" style={{ transform: `rotate(${qiblaBearing}deg)` }}>
              <span className="mt-1 rounded-md border border-amber-300/70 bg-amber-300/15 px-2 py-1 text-[10px] font-bold tracking-widest text-amber-200">QIBLA</span>
            </div>
          </div>
          <div className="relative z-10 flex flex-col items-center" style={{ transform: `rotate(${qiblaBearing - shownHeading}deg)` }}>
            <div className="h-0 w-0 border-b-[76px] border-l-[17px] border-r-[17px] border-l-transparent border-r-transparent border-b-amber-400 drop-shadow-lg" />
            <div className="h-4 w-4 rounded-full border-2 border-white bg-amber-500" />
            <div className="h-0 w-0 border-l-[10px] border-r-[10px] border-t-[45px] border-l-transparent border-r-transparent border-t-stone-500" />
          </div>
        </div>

        <div className="mt-5 text-center">
          {deviation === null ? (
            <p className="text-sm text-amber-200">কম্পাস চালু করে ফোন ঘোরান; সেন্সর ছাড়া সঠিক alignment দেখানো সম্ভব নয়।</p>
          ) : isAligned ? (
            <p className="flex items-center justify-center gap-2 font-bold text-emerald-300"><CheckCircle2 className="h-5 w-5" /> কিবলার দিকে প্রায় সোজা</p>
          ) : (
            <p className="font-semibold text-amber-200">{deviation > 0 ? 'ডানে' : 'বামে'} আরও {formatUiNumber(Math.abs(Math.round(deviation)), uiLanguage)}° ঘোরান</p>
          )}
          <p className="mt-2 text-xs text-emerald-100/70">ফোন সমতল রাখুন এবং ধাতব বস্তু, চুম্বক ও বৈদ্যুতিক যন্ত্র থেকে দূরে থাকুন।</p>
        </div>

        <div className="mt-6 flex justify-center">
          <button onClick={enableCompass} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 font-bold text-emerald-950 shadow hover:bg-amber-300">
            <Smartphone className="h-4 w-4" /> কম্পাস চালু / অনুমতি দিন
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
        <h3 className="mb-2 flex items-center gap-2 font-bold text-stone-900 dark:text-white"><Info className="h-4 w-4 text-emerald-600" /> নির্ভুলতার জন্য</h3>
        <ul className="list-disc space-y-1.5 pl-5 text-xs leading-relaxed">
          <li>প্রথমে GPS দিয়ে বর্তমান অবস্থান নিন; জেলা নির্বাচন শুধু আনুমানিক অবস্থান।</li>
          <li>ফোনকে সমতল রেখে Figure-8 আকারে কয়েকবার ঘুরিয়ে সেন্সর ক্যালিব্রেট করুন।</li>
          <li>কম্পাসের ফল ফোনের সেন্সর ও স্থানীয় চৌম্বকীয় প্রভাবের ওপর নির্ভরশীল; প্রয়োজনে মানচিত্র/বিশ্বস্ত কম্পাস দিয়ে যাচাই করুন।</li>
        </ul>
      </div>
    </div>
  );
};
