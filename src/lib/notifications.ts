import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { Habit } from '../types';

// expo-notifications eagerly loads its push-token native module (ExpoPushTokenManager)
// on import. On builds where that native code was not compiled in (e.g. no
// `npx expo prebuild` / EAS build yet) importing the package throws and crashes the app.
// We probe the optional native module first (it returns null instead of throwing) and
// only import expo-notifications when the native side is actually linked. Real
// notifications activate automatically once the native module is present.
let notificationsModule: any | null = null;
let resolved = false;

function loadNotifications(): any | null {
  if (resolved) return notificationsModule;
  try {
    if (!requireOptionalNativeModule('ExpoPushTokenManager')) {
      notificationsModule = null;
      resolved = true;
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-notifications');
    void mod.getPermissionsAsync;
    void mod.setNotificationHandler;
    notificationsModule = mod;
  } catch {
    notificationsModule = null;
  }
  resolved = true;
  return notificationsModule;
}

const CHANNEL_ID = 'habit-reminders';

function notificationIdForHabit(habitId: string): string {
  return `habit-reminder-${habitId}`;
}

function parseTime(time: string): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

export async function registerForNotifications(): Promise<boolean> {
  const Notifications = loadNotifications();
  if (!Notifications) return false;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const existing = (await Notifications.getPermissionsAsync()) as any;
    let status: string = existing?.status;
    if (status !== 'granted') {
      const request = (await Notifications.requestPermissionsAsync()) as any;
      status = request?.status;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Habit Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        enableVibrate: true,
      }).catch(() => {});
    }

    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleHabitReminder(habit: Habit): Promise<void> {
  const Notifications = loadNotifications();
  if (!Notifications || !habit.reminderTime) return;
  try {
    const parsed = parseTime(habit.reminderTime);
    if (!parsed) return;

    await Notifications.cancelScheduledNotificationAsync(notificationIdForHabit(habit.id)).catch(
      () => {}
    );

    await Notifications.scheduleNotificationAsync({
      identifier: notificationIdForHabit(habit.id),
      content: {
        title: 'Habit Reminder',
        body: `Time for "${habit.name}" — let's keep the streak alive.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: parsed.hour,
        minute: parsed.minute,
        channelId: CHANNEL_ID,
      },
    });
  } catch {
    // Notifications unavailable in this build; skip silently.
  }
}

export async function cancelHabitReminder(habitId: string): Promise<void> {
  const Notifications = loadNotifications();
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationIdForHabit(habitId)).catch(
      () => {}
    );
  } catch {
    // ignore
  }
}

export async function rescheduleAll(habits: Habit[]): Promise<void> {
  const Notifications = loadNotifications();
  if (!Notifications) return;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (
        typeof notification.identifier === 'string' &&
        notification.identifier.startsWith('habit-reminder-')
      ) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier).catch(
          () => {}
        );
      }
    }
    await Promise.all(habits.map((h) => scheduleHabitReminder(h)));
  } catch {
    // ignore
  }
}
