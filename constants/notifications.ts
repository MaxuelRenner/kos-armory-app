import * as Notifications from 'expo-notifications';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);
// Tells the app how to handle notifications when the app is currently open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true, // <-- Fixed Error 1
    shouldShowList: true,   // <-- Fixed Error 1
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * TRIGGER A: Schedule the 5-hour cleaning reminder
 * @param gunName - Name of the firearm (e.g., 'Glock 19')
 * @returns string - The unique notification ID. You MUST save this (either in Supabase or local state) to cancel it later.
 */
export const scheduleCleaningReminder = async (gunName: string): Promise<string> => {
  // 5 hours = 18,000 seconds
  const triggerInSeconds = 5 * 60 * 60; 

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🧼 Maintenance Reminder',
      body: `It has been 5 hours since your range day. Time to clean your ${gunName} to maintain KOS compliance.`,
      data: { gunName },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, // <-- Fixed Error 2
      seconds: triggerInSeconds,
    },
  });

  return notificationId;
};

/**
 * TRIGGER B: Cancel the specific scheduled notification
 * @param notificationId - The ID returned from scheduleCleaningReminder
 */
export const cancelCleaningReminder = async (notificationId: string | null) => {
  if (!notificationId) {
    console.warn("No notification ID provided to cancel.");
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(notificationId);
  console.log(`Successfully cancelled cleaning reminder ID: ${notificationId}`);
};