export type GunStatus = 'good' | 'warning' | 'danger';
export type GunType = 'Пистолет' | 'Карабина' | 'Ловна пушка' | 'Друго';

export interface GunRecord {
  id: string;
  name: string;
  manufacturer: string;
  type: GunType;
  caliber: string;
  caliberMm: number; // numeric mm for sorting
  weight: string;
  barrelLength: string;
  capacity: string;
  serial: string;
  kosRegistrationDate: string;
  kosExpiryDate: string;
  kosStatus: GunStatus;
  lastCleaned: string;
  lastRangeDay: string;
  roundsFired: number;
  imageColor: string; // fallback card color
  notes: string;
}

export const MOCK_GUNS: GunRecord[] = [
  {
    id: '1',
    name: 'Макаров ПМ',
    manufacturer: 'ИЖ / Макаров',
    type: 'Пистолет',
    caliber: '9×18мм Макаров',
    caliberMm: 9,
    weight: '730 г',
    barrelLength: '93.5 мм',
    capacity: '8+1',
    serial: 'МК-4471-БГ',
    kosRegistrationDate: '12.03.2022',
    kosExpiryDate: '12.03.2027',
    kosStatus: 'good',
    lastCleaned: '18.04.2026',
    lastRangeDay: '20.04.2026',
    roundsFired: 1240,
    imageColor: '#2A3F5A',
    notes: 'Основно оръжие за самоотбрана. Носен ежедневно.',
  },
  {
    id: '2',
    name: 'CZ 75 B',
    manufacturer: 'Česká zbrojovka',
    type: 'Пистолет',
    caliber: '9×19мм Парабелум',
    caliberMm: 9,
    weight: '1000 г',
    barrelLength: '114 мм',
    capacity: '16+1',
    serial: 'CZ-75B-009321',
    kosRegistrationDate: '05.06.2020',
    kosExpiryDate: '05.06.2025',
    kosStatus: 'danger',
    lastCleaned: '01.03.2026',
    lastRangeDay: '15.03.2026',
    roundsFired: 3870,
    imageColor: '#3A2A2A',
    notes: 'Тренировъчно оръжие. КОС е изтекъл – спешно подновяване!',
  },
  {
    id: '3',
    name: 'Мосин-Нагант',
    manufacturer: 'Ижевски завод',
    type: 'Карабина',
    caliber: '7.62×54ммR',
    caliberMm: 7.62,
    weight: '4000 г',
    barrelLength: '730 мм',
    capacity: '5+1',
    serial: 'MN-1942-ИЖ-77431',
    kosRegistrationDate: '22.11.2023',
    kosExpiryDate: '22.11.2025',
    kosStatus: 'warning',
    lastCleaned: '10.02.2026',
    lastRangeDay: '10.02.2026',
    roundsFired: 420,
    imageColor: '#2A3A2A',
    notes: 'Колекционерски екземпляр от 1942 г. КОС изтича скоро.',
  },
  {
    id: '4',
    name: 'Ремингтън 870',
    manufacturer: 'Remington Arms',
    type: 'Ловна пушка',
    caliber: '12/76 (Магнум)',
    caliberMm: 18.5,
    weight: '3600 г',
    barrelLength: '711 мм',
    capacity: '4+1',
    serial: 'REM870-W3847264',
    kosRegistrationDate: '15.01.2024',
    kosExpiryDate: '15.01.2029',
    kosStatus: 'good',
    lastCleaned: '22.04.2026',
    lastRangeDay: '22.04.2026',
    roundsFired: 890,
    imageColor: '#3A2A1A',
    notes: 'Ловно оръжие. Поддържа се в отлично състояние.',
  },
];

export const KOS_DOCUMENTS = [
  {
    id: 'd1',
    title: 'Заявление по образец',
    description: 'Попълнено заявление за подновяване на разрешително (КОС форма)',
    required: true,
  },
  {
    id: 'd2',
    title: 'Лична карта',
    description: 'Копие на лична карта на притежателя',
    required: true,
  },
  {
    id: 'd3',
    title: 'Медицинско удостоверение',
    description: 'Свидетелство от психиатър и ОПЛ за психична годност',
    required: true,
  },
  {
    id: 'd4',
    title: 'Свидетелство за съдимост',
    description: 'Официален документ от съда за чисто съдебно минало',
    required: true,
  },
  {
    id: 'd5',
    title: 'Фотографии',
    description: '2 броя паспортни снимки (3.5 × 4.5 см)',
    required: true,
  },
  {
    id: 'd6',
    title: 'Документ за оръжието',
    description: 'Предишно разрешително/КОС, паспорт на оръжието или фактура за покупка',
    required: true,
  },
  {
    id: 'd7',
    title: 'Платена държавна такса',
    description: 'Квитанция за платена такса в МВР (по тарифата на ЗМВР)',
    required: true,
  },
];

export function getStatusLabel(status: GunStatus): string {
  switch (status) {
    case 'good': return 'ВАЛИДЕН КОС';
    case 'warning': return 'ИЗТИЧА СКОРО';
    case 'danger': return 'ИЗТЕКЪЛ КОС';
  }
}

export function getDaysUntilExpiry(expiryDateStr: string): number {
  const [day, month, year] = expiryDateStr.split('.').map(Number);
  const expiry = new Date(year, month - 1, day);
  const now = new Date();
  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
