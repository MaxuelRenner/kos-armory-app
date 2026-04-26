/**
 * Calculates the KOS permit expiration and the required notification date.
 * Notification threshold: 30 days before expiry (changed from 35).
 */
export const calculateKOSDates = (registrationDateStr: string) => {
  const regDate = new Date(registrationDateStr);

  // 1. Expiration = registration + 5 years
  const expirationDate = new Date(regDate);
  expirationDate.setFullYear(expirationDate.getFullYear() + 5);

  // 2. Notification = 30 days before expiry (was 35, now 30 per feedback)
  const notificationDate = new Date(expirationDate);
  notificationDate.setDate(notificationDate.getDate() - 30);

  return {
    expirationDate,
    notificationDate,
    formattedExpiration: expirationDate.toLocaleDateString('bg-BG'),
    formattedNotification: notificationDate.toLocaleDateString('bg-BG'),
  };
};

/**
 * Returns the KOS status for a gun based on its expiry date.
 * Handles both ISO (YYYY-MM-DD) and Bulgarian (DD.MM.YYYY) date formats.
 */
export type KosStatus = 'good' | 'warning' | 'danger';

export function getKosStatus(expiryDateStr: string): KosStatus {
  let expiry: Date;

  if (expiryDateStr.includes('-')) {
    expiry = new Date(expiryDateStr);
  } else {
    const [day, month, year] = expiryDateStr.split('.').map(Number);
    expiry = new Date(year, month - 1, day);
  }

  const now = new Date();
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0)   return 'danger';   // expired
  if (daysLeft <= 30) return 'warning';  // expiring within 30 days
  return 'good';
}
