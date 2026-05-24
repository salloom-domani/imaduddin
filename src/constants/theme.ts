/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F1A14',
    background: '#F3F1E9',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#D8E6D6',
    textSecondary: '#5A6660',
    // Brand / surfaces
    primary: '#233631',
    primaryText: '#EAF3EC',
    primaryMuted: '#9DBBAE',
    accent: '#B99F6C',
    surface: '#FFFFFF',
    success: '#3F8F5B',
    muted: '#B6BDB6',
    border: '#E2E0D4',
    // Hero + card gradients (sky/sage → pale)
    heroGradientFrom: '#7C9A86',
    heroGradientTo: '#E9E4D4',
    heroText: '#FFFFFF',
    heroTextMuted: '#E8EEE6',
    cardGradientFrom: '#2E5A4A',
    cardGradientTo: '#214538',
  },
  dark: {
    text: '#ECEFE9',
    background: '#0A1410',
    backgroundElement: '#14201A',
    backgroundSelected: '#26392F',
    textSecondary: '#9AA59E',
    // Brand / surfaces
    primary: '#233631',
    primaryText: '#EAF3EC',
    primaryMuted: '#88A597',
    accent: '#C9AE7A',
    surface: '#14201A',
    success: '#5BB07A',
    muted: '#4A554E',
    border: '#243029',
    // Hero + card gradients
    heroGradientFrom: '#1B3128',
    heroGradientTo: '#0A1410',
    heroText: '#FFFFFF',
    heroTextMuted: '#C7D2CB',
    cardGradientFrom: '#16412F',
    cardGradientTo: '#0B271D',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Accent color per prayer, used for the list icon circles. */
export const PrayerColors = {
  Fajr: '#6C5CE7',
  Sunrise: '#E6B800',
  Dhuhr: '#3F8F5B',
  Asr: '#E08A2B',
  Maghrib: '#D6537A',
  Isha: '#2C3E66',
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Stepped type scale, used via ThemedText's `size` prop. */
export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Stepped weight scale, used via ThemedText's `weight` prop. */
export const FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;
