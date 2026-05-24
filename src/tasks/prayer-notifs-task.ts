import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

import { schedulePrayerNotifs } from '@/lib/notifications';

const PRAYER_NOTIFS_TASK = 'imaduddin.schedule-prayer-notifs';

/** Bump whenever the registration options below change. */
const OPTIONS_VERSION = 2;
const VERSIONED_TASK = `${PRAYER_NOTIFS_TASK}.v${OPTIONS_VERSION}`;

TaskManager.defineTask(VERSIONED_TASK, async () => {
  try {
    // No coords here — the task falls back to the cached location.
    await schedulePrayerNotifs();
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

/**
 * Registers the daily scheduler. `minimumInterval` is in minutes and is only a
 * hint: Android's WorkManager enforces a 15 minute floor and its own
 * constraints, and iOS BGTaskScheduler may skip days entirely. We compensate by
 * also rescheduling on app foreground and scheduling well past the next run.
 */
export async function registerPrayerNotifsTask(): Promise<void> {
  // registerTaskAsync silently returns early for an already-registered task, so
  // options can never be updated in place. Retiring the old identifier is what
  // makes an options change actually reach an existing install.
  for (let v = 1; v < OPTIONS_VERSION; v++) {
    const stale = v === 1 ? PRAYER_NOTIFS_TASK : `${PRAYER_NOTIFS_TASK}.v${v}`;
    if (await TaskManager.isTaskRegisteredAsync(stale)) {
      await BackgroundTask.unregisterTaskAsync(stale).catch(() => {});
    }
  }

  if (await TaskManager.isTaskRegisteredAsync(VERSIONED_TASK)) return;
  await BackgroundTask.registerTaskAsync(VERSIONED_TASK, {
    minimumInterval: 60 * 12,
  });
}
