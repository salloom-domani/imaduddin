import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Coords } from './prayer-times';

export const LOCATION_CACHE_KEY = 'location.cache.v1';

export interface CachedLocation {
  coords: Coords;
  label: string;
  savedAt: number;
}

export async function readLocationCache(): Promise<CachedLocation | null> {
  try {
    const raw = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedLocation;
    if (typeof parsed?.coords?.latitude !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeLocationCache(value: CachedLocation): void {
  AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(value)).catch(() => {});
}
