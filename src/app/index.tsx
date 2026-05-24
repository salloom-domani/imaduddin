import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeroGreeting } from '@/components/home/hero-greeting';
import { PRAYER_BACKGROUNDS } from '@/components/home/prayer-backgrounds';
import { NextPrayerCard } from '@/components/home/next-prayer-card';
import { PrayerList } from '@/components/home/prayer-list';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePrayerTimes } from '@/hooks/use-prayer-times';
import { formatGregorian, formatHijri } from '@/lib/dates';

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { rows, next, current, countdown, progress, label, loading, now } = usePrayerTimes();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background, paddingBottom: insets.bottom + Spacing.four }]}>
      <HeroGreeting
        label={label}
        gregorian={formatGregorian(now)}
        hijri={formatHijri(now)}
        topInset={insets.top}
        loading={loading}
        background={PRAYER_BACKGROUNDS[current]}
      />

      <View style={styles.content}>
        {next && (
          <NextPrayerCard
            name={next.name}
            time={next.time}
            countdown={countdown}
            progress={progress}
          />
        )}
        <PrayerList rows={rows} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
});
