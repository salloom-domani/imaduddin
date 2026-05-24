import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { readLocationCache } from './location-cache';
import { type Coords, formatPrayerTime, getPrayerTimes, type PrayerName } from './prayer-times';

const ANDROID_CHANNEL_ID = 'prayer-times';

/** Prayers that get a notification. Sunrise is excluded — not a prayer. */
const NOTIFIED_PRAYERS: readonly PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

/**
 * How far ahead to schedule. The background task is best-effort on both
 * platforms, so the queue has to survive a stretch of the app never being
 * opened. iOS caps pending local notifications at 64; five prayers a day puts
 * the hard ceiling at 12 days, and 10 leaves room for the test notification.
 */
const DEFAULT_DAYS = 10;

/** Prayers landing closer together than this are treated as the same moment. */
const DEDUPE_MS = 60_000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Pulls a Date out of whichever trigger shape the platform reports, else null. */
export function triggerDate(trigger: Notifications.NotificationTrigger | null): Date | null {
  if (!trigger || typeof trigger !== 'object') return null;
  const value = (trigger as { value?: unknown; date?: unknown }).value ?? (trigger as { date?: unknown }).date;
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'string') return new Date(value);
  return null;
}

async function runSetup(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  let granted = settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (!granted) {
    const req = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: false },
    });
    granted = req.granted || req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  }
  if (!granted) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Prayer times',
      importance: Notifications.AndroidImportance.HIGH,
      // Omit `sound` to use the system default; a string here means a bundled
      // custom sound file that must be registered in the config plugin.
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  return true;
}

let setupPromise: Promise<boolean> | null = null;

/**
 * Requests permission and creates the Android channel, at most once per launch.
 * Memoised on success — this runs on every foreground, and re-prompting or
 * rewriting the channel each time is wasted work (channel importance and
 * vibration are immutable after creation anyway). A denial is not cached, so a
 * later call still picks up a permission granted from system settings.
 */
async function ensureNotificationSetup(): Promise<boolean> {
  if (!setupPromise) setupPromise = runSetup();
  try {
    const ok = await setupPromise;
    if (!ok) setupPromise = null;
    return ok;
  } catch {
    setupPromise = null;
    return false;
  }
}

interface ScheduledPrayer {
  name: PrayerName;
  time: Date;
}

/**
 * Every notifiable prayer in the next `days` days, ascending and deduped.
 *
 * The per-day lists have to be flattened and re-sorted rather than emitted in
 * order: at high latitudes adhan pushes Isha past midnight, so a day's Isha can
 * land *after* the following day's Fajr. In London in June both fall at 01:02,
 * half a second apart — without this they schedule as two notifications.
 */
function upcomingPrayers(coords: Coords, days: number): ScheduledPrayer[] {
  const now = Date.now();
  const found: ScheduledPrayer[] = [];

  for (let d = 0; d < days; d++) {
    const day = new Date();
    day.setDate(day.getDate() + d);
    for (const entry of getPrayerTimes(coords, day)) {
      if (!NOTIFIED_PRAYERS.includes(entry.name)) continue;
      const t = entry.time.getTime();
      // adhan can hand back an Invalid Date at extreme latitudes; NaN would
      // slip past a plain `<= now` check and schedule a broken trigger.
      if (!Number.isFinite(t) || t <= now) continue;
      found.push(entry as ScheduledPrayer);
    }
  }

  found.sort((a, b) => a.time.getTime() - b.time.getTime());

  const deduped: ScheduledPrayer[] = [];
  for (const prayer of found) {
    const previous = deduped[deduped.length - 1];
    if (!previous || prayer.time.getTime() - previous.time.getTime() >= DEDUPE_MS) {
      deduped.push(prayer);
    } else if (prayer.name === 'Fajr') {
      // Isha and the next Fajr coincide under the middle-of-the-night rule.
      // Only one notification can fire; Fajr is the one worth waking for.
      deduped[deduped.length - 1] = prayer;
    }
  }
  return deduped;
}

/** True when the pending queue already matches `prayers` exactly. */
function alreadyScheduled(
  pending: Notifications.NotificationRequest[],
  prayers: ScheduledPrayer[],
): boolean {
  if (pending.length !== prayers.length) return false;
  const times = pending
    .map((request) => triggerDate(request.trigger)?.getTime())
    .filter((t): t is number => t !== undefined && Number.isFinite(t))
    .sort((a, b) => a - b);
  if (times.length !== prayers.length) return false;
  return prayers.every((prayer, i) => Math.abs(times[i] - prayer.time.getTime()) < 1000);
}

async function runSchedule(coords: Coords | undefined, days: number): Promise<number> {
  const ok = await ensureNotificationSetup();
  if (!ok) return 0;

  // Prefer live coords from the caller. The cache is the fallback for entry
  // points that have none (app launch, background task) — but it lags a fresh
  // fix, so passing coords is what keeps notifications and the UI in agreement.
  const resolved = coords ?? (await readLocationCache())?.coords;
  if (!resolved) return 0;

  const prayers = upcomingPrayers(resolved, days);

  // Cancelling and re-adding re-queues every OS alarm, which on Android resets
  // each one's position in the batching window. Foregrounding the app almost
  // never changes the schedule, so check before touching anything.
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  if (alreadyScheduled(pending, prayers)) return prayers.length;

  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const prayer of prayers) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${prayer.name} prayer`,
        body: `It's time for ${prayer.name} — ${formatPrayerTime(prayer.time)}`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: prayer.time,
        channelId: ANDROID_CHANNEL_ID,
      },
    });
  }
  return prayers.length;
}

let queue: Promise<unknown> = Promise.resolve();

/**
 * Schedules notifications for upcoming prayers, replacing any existing queue.
 * Pass `coords` when the caller has a live fix; otherwise the cached location
 * is used. No-ops when the pending queue is already correct.
 *
 * Runs are serialised. The layout mount, the AppState `active` event and a
 * fresh GPS fix all call this within a second of each other on a cold start,
 * and concurrent runs would interleave `cancelAll` with each other's writes —
 * leaving a truncated or duplicated queue.
 */
export function schedulePrayerNotifs(coords?: Coords, days = DEFAULT_DAYS): Promise<number> {
  const run = queue.then(() => runSchedule(coords, days));
  queue = run.catch(() => {});
  return run;
}
