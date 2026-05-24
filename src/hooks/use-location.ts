import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import { readLocationCache, writeLocationCache } from '@/lib/location-cache';
import { schedulePrayerNotifs } from '@/lib/notifications';
import type { Coords } from '@/lib/prayer-times';

const LONDON: Coords = { latitude: 51.5074, longitude: -0.1278 };
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export interface LocationState {
  coords: Coords;
  label: string;
  loading: boolean;
  fallback: boolean;
}

async function reverseLabel(coords: Coords): Promise<string> {
  try {
    const [address] = await Location.reverseGeocodeAsync(coords);
    if (!address) return 'Current location';
    const city = address.city ?? address.subregion ?? address.region;
    const country = address.isoCountryCode ?? address.country;
    return [city, country].filter(Boolean).join(', ') || 'Current location';
  } catch {
    return 'Current location';
  }
}

/**
 * Tiered location resolution for instant first paint:
 *   1. AsyncStorage cache (last known good)
 *   2. OS last-known position
 *   3. Fresh GPS fix
 * Each tier upgrades the previous. Falls back to London on denial.
 */
export function useLocation(): LocationState {
  const [state, setState] = useState<LocationState>({
    coords: LONDON,
    label: 'London, UK',
    loading: true,
    fallback: true,
  });

  useEffect(() => {
    let active = true;

    (async () => {
      const cached = await readLocationCache();
      if (active && cached) {
        setState({ coords: cached.coords, label: cached.label, loading: false, fallback: false });
      }

      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) {
          if (active && !cached) setState((s) => ({ ...s, loading: false }));
          return;
        }

        if (!cached) {
          const last = await Location.getLastKnownPositionAsync();
          if (active && last) {
            const lastCoords: Coords = {
              latitude: last.coords.latitude,
              longitude: last.coords.longitude,
            };
            setState({
              coords: lastCoords,
              label: 'Current location',
              loading: false,
              fallback: false,
            });
          }
        }

        const fresh = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const coords: Coords = {
          latitude: fresh.coords.latitude,
          longitude: fresh.coords.longitude,
        };

        const stale =
          !cached ||
          Date.now() - cached.savedAt > CACHE_TTL_MS ||
          Math.abs(cached.coords.latitude - coords.latitude) > 0.05 ||
          Math.abs(cached.coords.longitude - coords.longitude) > 0.05;

        const label = stale ? await reverseLabel(coords) : cached!.label;

        if (active) setState({ coords, label, loading: false, fallback: false });
        writeLocationCache({ coords, label, savedAt: Date.now() });
        schedulePrayerNotifs(coords).catch(() => {});
      } catch {
        if (active && !cached) setState((s) => ({ ...s, loading: false }));
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return state;
}
