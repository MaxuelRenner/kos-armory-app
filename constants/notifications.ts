import * as Notifications from 'expo-notifications';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── CLEANING REMINDERS ───────────────────────────────────────────────────────
// Schedules up to 5 hourly reminders after a range day.
// Call this when the user logs a range day.
// Save the returned IDs in Supabase (cleaning_notification_ids column) so you
// can cancel them all when the user marks the gun as cleaned.

export const scheduleCleaningReminders = async (gunName: string): Promise<string[]> => {
  const ids: string[] = [];

  for (let i = 1; i <= 5; i++) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🧼 Напомняне за почистване (${i}/5)`,
        body: `${gunName} трябва да се почисти след тренировка. Не забравяйте!`,
        data: { gunName, reminderIndex: i },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: i * 60 * 60, // 1h, 2h, 3h, 4h, 5h after range day
      },
    });
    ids.push(id);
  }

  return ids; // Save these to Supabase: firearms.cleaning_notification_ids
};

// Cancel all pending cleaning reminders (call this when user marks gun as cleaned)
export const cancelCleaningReminders = async (notificationIds: string[]) => {
  for (const id of notificationIds) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
};

// ─── KOS RENEWAL NOTIFICATION ─────────────────────────────────────────────────
// Schedule ONE notification 30 days before the KOS expiry date.
// Call this when a gun is added or KOS date is updated.

export const scheduleKosRenewalNotification = async (
  gunName: string,
  expiryDateStr: string // ISO format: YYYY-MM-DD
): Promise<string | null> => {
  const expiryDate = new Date(expiryDateStr);
  const notificationDate = new Date(expiryDate);
  notificationDate.setDate(notificationDate.getDate() - 30); // 30 days before

  // Don't schedule if the notification date is already in the past
  if (notificationDate <= new Date()) {
    console.log(`KOS notification for ${gunName} skipped — date already passed`);
    return null;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚠ КОС Разрешително изтича',
      body: `Разрешителното за ${gunName} изтича след 30 дни. Подгответе документите за подновяване.`,
      data: { gunName, type: 'kos_renewal' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: notificationDate,
    },
  });

  return id; // Save to Supabase: firearms.kos_notification_id
};

// Cancel KOS renewal notification (call when gun is deleted or KOS date changes)
export const cancelKosNotification = async (notificationId: string | null) => {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

// ─── REQUEST PERMISSIONS ──────────────────────────────────────────────────────
// Call this once on app startup (in _layout.tsx useEffect)
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};
