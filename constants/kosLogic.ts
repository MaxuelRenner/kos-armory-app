export const calculateKOSDates = (registrationDateStr: string) => {
  const regDate = new Date(registrationDateStr);
  const expirationDate = new Date(regDate);
  expirationDate.setFullYear(expirationDate.getFullYear() + 5);
  const notificationDate = new Date(expirationDate);
  notificationDate.setDate(notificationDate.getDate() - 30);
  return {
    expirationDate,
    notificationDate,
    formattedExpiration: expirationDate.toLocaleDateString('bg-BG'),
    formattedNotification: notificationDate.toLocaleDateString('bg-BG'),
  };
};

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
  if (daysLeft < 0)   return 'danger';
  if (daysLeft <= 30) return 'warning';
  return 'good';
}

export type GunStatus = 'good' | 'warning' | 'danger';
export function getStatusLabel(status: GunStatus): string {
  switch (status) {
    case 'good': return 'Валидно разрешително';
    case 'warning': return 'За подновяване';
    case 'danger': return 'Изтекло разрешително';
  }
}

export function getDaysUntilExpiry(expiryDateStr: string): number {
  let expiry: Date;
  if (expiryDateStr.includes('-')) {
    expiry = new Date(expiryDateStr);
  } else {
    const [day, month, year] = expiryDateStr.split('.').map(Number);
    expiry = new Date(year, month - 1, day);
  }
  const now = new Date();
  const diff = new Date(expiry.toDateString()).getTime() - new Date(now.toDateString()).getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}