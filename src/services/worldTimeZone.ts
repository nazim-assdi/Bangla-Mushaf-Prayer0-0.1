export interface WorldLocationTimeZone {
  timeZone: string;
  source: 'gps' | 'device';
}

/**
 * Resolve the IANA time zone at GPS coordinates.
 * Open-Meteo returns the Olson/IANA identifier (including DST rules) and
 * requires no API key. Device time zone is deliberately not assumed to match
 * GPS when the user is travelling.
 */
export async function getTimeZoneForCoordinates(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<string> {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error('GPS coordinates are invalid.');
  }

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('current', 'temperature_2m');
  url.searchParams.set('timezone', 'auto');

  const response = await fetch(url.toString(), { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('World time-zone service is unavailable.');
  const data = await response.json() as { timezone?: unknown };
  if (typeof data.timezone !== 'string' || !data.timezone) {
    throw new Error('GPS location time zone could not be identified.');
  }
  // Validate the identifier in this runtime before persisting it.
  new Intl.DateTimeFormat('en-US', { timeZone: data.timezone }).format(new Date());
  return data.timezone;
}

/** Offset east of UTC, in hours, at this instant in the requested IANA zone. */
export function getTimeZoneOffsetHours(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(
    Number(values.year), Number(values.month) - 1, Number(values.day),
    Number(values.hour), Number(values.minute), Number(values.second),
  );
  return (asUtc - Math.floor(instant.getTime() / 1000) * 1000) / 3_600_000;
}

export function getDatePartsInTimeZone(instant: Date, timeZone: string): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: 'numeric', day: 'numeric',
  }).formatToParts(instant);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { year: Number(values.year), month: Number(values.month), day: Number(values.day) };
}

export function formatDateInTimeZone(instant: Date, timeZone: string, locale = 'bn-BD'): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).format(instant);
}
