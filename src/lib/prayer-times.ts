import { CalculationMethod, type CalculationParameters, Coordinates, PrayerTimes } from 'adhan';

export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface PrayerEntry {
  name: PrayerName;
  time: Date;
}

export interface Coords {
  latitude: number;
  longitude: number;
}

/**
 * Calculation method. Muslim World League is a sane global default;
 * lift this into user settings later (Prayer Times Settings screen).
 */
function calculationParams(): CalculationParameters {
  return CalculationMethod.MuslimWorldLeague();
}

/** Compute the six daily prayer entries for a given location and calendar day. */
export function getPrayerTimes(coords: Coords, date: Date = new Date()): PrayerEntry[] {
  const location = new Coordinates(coords.latitude, coords.longitude);
  const pt = new PrayerTimes(location, date, calculationParams());
  return [
    { name: 'Fajr', time: pt.fajr },
    { name: 'Sunrise', time: pt.sunrise },
    { name: 'Dhuhr', time: pt.dhuhr },
    { name: 'Asr', time: pt.asr },
    { name: 'Maghrib', time: pt.maghrib },
    { name: 'Isha', time: pt.isha },
  ];
}

/** Format a prayer time as a locale 12-hour clock, e.g. "01:00 PM". */
export function formatPrayerTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}
