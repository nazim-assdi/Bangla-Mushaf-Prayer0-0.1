import { getDatePartsInTimeZone, getTimeZoneOffsetHours } from './worldTimeZone';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications, type LocalNotificationSchema } from '@capacitor/local-notifications';
import { calculatePrayerTimes } from '../utils/prayerTimes';

const ID_START = 1_000_000_000;
const ID_END = 1_100_000_000;
const CHANNEL_ID = 'prayer-time-alerts';

export interface PrayerAlertOptions {
  prayerAlerts: boolean;
  makruhAlerts: boolean;
  latitude: number;
  longitude: number;
  calculationMethod: string;
  asrJuristic: 'hanafi' | 'shafii';
  timeZoneId?: string;
}

/** Schedules the next seven days on Android/iOS; native alarms survive app closure. */
export async function schedulePrayerAlerts(options: PrayerAlertOptions, requestPermission = true, openExactAlarmSettings = true): Promise<{ scheduled: number; exactAlarm: string }> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('অ্যাপের ব্যাকগ্রাউন্ড অ্যালার্ম Android/iOS APK-তে ব্যবহার করতে হবে।');
  }

  let permission = await LocalNotifications.checkPermissions();
  if (permission.display !== 'granted' && requestPermission) permission = await LocalNotifications.requestPermissions();
  if (permission.display !== 'granted') throw new Error('নোটিফিকেশন অনুমতি দেওয়া হয়নি।');

  let exactAlarm = 'not-applicable';
  try {
    const exact = await LocalNotifications.checkExactNotificationSetting();
    exactAlarm = exact.exact_alarm;
    if (exact.exact_alarm !== 'granted' && openExactAlarmSettings) {
      await LocalNotifications.changeExactNotificationSetting();
      const after = await LocalNotifications.checkExactNotificationSetting();
      exactAlarm = after.exact_alarm;
    }
  } catch {
    exactAlarm = 'unavailable';
  }

  await LocalNotifications.createChannel({
    id: CHANNEL_ID,
    name: 'নামাজের সময় ও সতর্কতা',
    description: 'নামাজ শুরু এবং মাকরুহ সময়ের স্থানীয় অ্যালার্ম',
    importance: 5,
    vibration: true,
  });

  const pending = await LocalNotifications.getPending();
  const oldManaged = pending.notifications.filter(n => n.id >= ID_START && n.id < ID_END);
  if (oldManaged.length) {
    await LocalNotifications.cancel({ notifications: oldManaged.map(n => ({ id: n.id })) });
  }

  const notifications: LocalNotificationSchema[] = [];
  const now = new Date();
  const methodAngles: Record<string, { fajrAngle: number; ishaAngle: number }> = {
    Karachi: { fajrAngle: 18, ishaAngle: 18 },
    MWL: { fajrAngle: 18, ishaAngle: 17 },
    UmmAlQura: { fajrAngle: 18.5, ishaAngle: 19 },
    ISNA: { fajrAngle: 15, ishaAngle: 15 },
  };
  const angles = methodAngles[options.calculationMethod] || methodAngles.Karachi;
  const timezoneOffsetHours = options.timeZoneId
    ? getTimeZoneOffsetHours(now, options.timeZoneId)
    : -now.getTimezoneOffset() / 60;

  for (let day = 0; day < 7; day++) {
    const date = new Date(now.getTime() + day * 86400000);
    const dayOffset = options.timeZoneId ? getTimeZoneOffsetHours(date, options.timeZoneId) : timezoneOffsetHours;
    const times = calculatePrayerTimes(date, options.latitude, options.longitude, dayOffset, {
      ...angles,
      asrJuristic: options.asrJuristic,
    }, options.timeZoneId);
    const localDate = options.timeZoneId ? getDatePartsInTimeZone(date, options.timeZoneId) : { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
    const dateKey = Number(localDate.year.toString() + String(localDate.month).padStart(2, '0') + String(localDate.day).padStart(2, '0'));
    const add = (index: number, at: Date, title: string, body: string) => {
      if (at.getTime() <= now.getTime()) return;
      notifications.push({
        id: ID_START + (dateKey % 10_000_000) * 10 + index,
        title,
        body: body + ' · নির্ধারিত সময়: ' + at.toLocaleString('bn-BD', options.timeZoneId ? { timeZone: options.timeZoneId } : undefined),
        channelId: CHANNEL_ID,
        schedule: { at, allowWhileIdle: true },
        extra: { kind: 'prayer-alert', timestamp: at.toISOString() },
      });
    };

    if (options.prayerAlerts) {
      add(0, times.fajr, 'ফজরের ওয়াক্ত শুরু', 'ফজরের নামাজের সময় হয়েছে।');
      add(1, times.dhuhr, 'যোহরের ওয়াক্ত শুরু', 'যোহরের নামাজের সময় হয়েছে।');
      add(2, times.asr, 'আসরের ওয়াক্ত শুরু', 'আসরের নামাজের সময় হয়েছে।');
      add(3, times.maghrib, 'মাগরিবের ওয়াক্ত শুরু', 'মাগরিবের নামাজের সময় হয়েছে।');
      add(4, times.isha, 'ইশার ওয়াক্ত শুরু', 'ইশার নামাজের সময় হয়েছে।');
    }
    if (options.makruhAlerts) {
      add(5, times.sunrise, 'সূর্যোদয়ের সময় সতর্কতা', 'সূর্যোদয়ের নিষিদ্ধ সময় শুরু হয়েছে—নামাজের বিধান মেনে চলুন।');
      add(6, new Date(times.dhuhr.getTime() - 5 * 60_000), 'যাওয়াল সময়ের সতর্কতা', 'মধ্যাহ্ন/যাওয়াল সময় আসন্ন। এই সতর্কতা স্থানীয় আলেমের সময়সূচির সঙ্গে মিলিয়ে নিন।');
      add(7, times.sunset, 'সূর্যাস্তের সময় সতর্কতা', 'সূর্যাস্তের নিষিদ্ধ সময় শুরু হয়েছে—নামাজের বিধান মেনে চলুন।');
    }
  }

  if (notifications.length) await LocalNotifications.schedule({ notifications });
  return { scheduled: notifications.length, exactAlarm };
}

export async function cancelPrayerAlerts(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const pending = await LocalNotifications.getPending();
  const managed = pending.notifications.filter(n => n.id >= ID_START && n.id < ID_END);
  if (managed.length) await LocalNotifications.cancel({ notifications: managed.map(n => ({ id: n.id })) });
}


/**
 * Refreshes saved alerts after app relaunch or a location/method change,
 * but never prompts for permissions or opens Android settings automatically.
 */
export async function refreshPrayerAlertsIfPermitted(options: PrayerAlertOptions): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  if (!options.prayerAlerts && !options.makruhAlerts) {
    await cancelPrayerAlerts();
    return true;
  }
  const permission = await LocalNotifications.checkPermissions();
  if (permission.display !== 'granted') return false;
  await schedulePrayerAlerts(options, false, false);
  return true;
}
