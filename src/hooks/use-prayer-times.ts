import { useEffect, useMemo, useState } from 'react';

import { getPrayerTimes, type PrayerEntry, type PrayerName } from '@/lib/prayer-times';
import { useLocation } from './use-location';

export type PrayerStatus = 'passed' | 'next' | 'upcoming';

export interface PrayerRowData extends PrayerEntry {
  status: PrayerStatus;
}

export interface PrayerTimesState {
  loading: boolean;
  label: string;
  fallback: boolean;
  now: Date;
  rows: PrayerRowData[];
  /** The upcoming prayer (may be tomorrow's Fajr after Isha). */
  next: PrayerEntry | null;
  /** The current period (last prayer that has started); 'Isha' overnight. */
  current: PrayerName;
  countdown: string;
  countdownSeconds: number;
  /** Fraction elapsed from the previous prayer to the next, 0..1. */
  progress: number;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatCountdown(ms: number): { text: string; seconds: number } {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return { text: `${pad(h)}:${pad(m)}:${pad(s)}`, seconds };
}

/**
 * Computes today's prayer rows plus a live countdown / progress toward the
 * next prayer. Ticks every second. Handles the wrap across midnight (before
 * Fajr uses yesterday's Isha; after Isha targets tomorrow's Fajr).
 */
export function usePrayerTimes(): PrayerTimesState {
  const { coords, label, loading, fallback } = useLocation();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dayKey = now.toDateString();

  const { today, tomorrowFajr, yesterdayIsha } = useMemo(() => {
    const today = getPrayerTimes(coords, now);

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFajr = getPrayerTimes(coords, tomorrow)[0];

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEntries = getPrayerTimes(coords, yesterday);
    const yesterdayIsha = yesterdayEntries[yesterdayEntries.length - 1];

    return { today, tomorrowFajr, yesterdayIsha };
    // Recompute only when location or calendar day changes, not every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords.latitude, coords.longitude, dayKey]);

  return useMemo(() => {
    const t = now.getTime();

    const nextIndex = today.findIndex((e) => e.time.getTime() > t);
    const next: PrayerEntry = nextIndex === -1 ? tomorrowFajr : today[nextIndex];

    // Previous boundary for the progress arc.
    let previousTime: number;
    if (nextIndex === -1) {
      previousTime = today[today.length - 1].time.getTime();
    } else if (nextIndex === 0) {
      previousTime = yesterdayIsha.time.getTime();
    } else {
      previousTime = today[nextIndex - 1].time.getTime();
    }

    const span = next.time.getTime() - previousTime;
    const progress = span > 0 ? Math.min(1, Math.max(0, (t - previousTime) / span)) : 0;

    const { text, seconds } = formatCountdown(next.time.getTime() - t);

    // Active period: last prayer that has started; overnight falls back to Isha.
    const current: PrayerName =
      nextIndex === -1 ? 'Isha' : nextIndex === 0 ? 'Isha' : today[nextIndex - 1].name;

    const nextName: PrayerName | null = nextIndex === -1 ? null : next.name;
    const rows: PrayerRowData[] = today.map((entry) => ({
      ...entry,
      status:
        entry.time.getTime() <= t ? 'passed' : entry.name === nextName ? 'next' : 'upcoming',
    }));

    return {
      loading,
      label,
      fallback,
      now,
      rows,
      next,
      current,
      countdown: text,
      countdownSeconds: seconds,
      progress,
    };
  }, [now, today, tomorrowFajr, yesterdayIsha, loading, label, fallback]);
}
