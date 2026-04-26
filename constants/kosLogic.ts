/**
 * Calculates the KOS permit expiration and the required notification date.
 * @param registrationDateStr - The KOS registration date (e.g., '2024-04-25')
 * @returns Object containing exact JavaScript Date objects for Expiration and Notification
 */
export const calculateKOSDates = (registrationDateStr: string) => {
    const regDate = new Date(registrationDateStr);
  
    // 1. Calculate Expiration: Add exactly 5 years
    const expirationDate = new Date(regDate);
    expirationDate.setFullYear(expirationDate.getFullYear() + 5);
  
    // 2. Calculate Notification: Subtract exactly 5 weeks (35 days) from expiration
    const notificationDate = new Date(expirationDate);
    notificationDate.setDate(notificationDate.getDate() - 35);
  
    return {
      expirationDate,
      notificationDate,
      // Formatted strings for easy UI rendering
      formattedExpiration: expirationDate.toLocaleDateString('bg-BG'),
      formattedNotification: notificationDate.toLocaleDateString('bg-BG')
    };
  };