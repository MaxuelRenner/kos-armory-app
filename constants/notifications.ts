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

export const scheduleCleaningReminders = async (gunName: string): Promise<string[]> => {
  const ids: string[] = [];
  try {
    for (let i = 1; i <= 5; i++) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🧼 Напомняне за почистване (${i}/5)`,
          body: `${gunName} трябва да се почисти след тренировка. Не забравяйте!`,
          data: { gunName, reminderIndex: i },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: i * 60 * 60,
        },
      });
      ids.push(id);
    }
  } catch (e) {
    console.log("Notifications blocked in Expo Go. They will work in the built APK.");
  }
  return ids;
};

export const cancelCleaningReminders = async (notificationIds: string[]) => {
  try {
    for (const id of notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  } catch (e) {}
};

export const scheduleKosRenewalNotification = async (gunName: string, expiryDateStr: string): Promise<string | null> => {
  const expiryDate = new Date(expiryDateStr);
  const notificationDate = new Date(expiryDate);
  notificationDate.setDate(notificationDate.getDate() - 30);

  if (notificationDate <= new Date()) return null;

  try {
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
    return id;
  } catch (e) {
    return null;
  }
};

export const cancelKosNotification = async (notificationId: string | null) => {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch(e) {}
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    return false;
  }
};