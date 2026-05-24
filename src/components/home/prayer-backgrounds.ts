import type { ImageSourcePropType } from 'react-native';

import type { PrayerName } from '@/lib/prayer-times';

/** Time-of-day mosque scene for each prayer period. */
export const PRAYER_BACKGROUNDS: Record<PrayerName, ImageSourcePropType> = {
  Fajr: require('@/assets/images/backgrounds/fajr.webp'),
  Sunrise: require('@/assets/images/backgrounds/shuruq.webp'),
  Dhuhr: require('@/assets/images/backgrounds/dhur.webp'),
  Asr: require('@/assets/images/backgrounds/asr.webp'),
  Maghrib: require('@/assets/images/backgrounds/maghrib.webp'),
  Isha: require('@/assets/images/backgrounds/isha.webp'),
};
