import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PrayerColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatPrayerTime, type PrayerName } from '@/lib/prayer-times';
import type { PrayerRowData } from '@/hooks/use-prayer-times';

const PRAYER_ICON: Record<PrayerName, React.ComponentProps<typeof Ionicons>['name']> = {
  Fajr: 'moon',
  Sunrise: 'partly-sunny',
  Dhuhr: 'sunny',
  Asr: 'sunny',
  Maghrib: 'cloudy-night',
  Isha: 'moon',
};

export function PrayerRow({ name, time, status }: PrayerRowData) {
  const theme = useTheme();
  const isNext = status === 'next';

  const statusIcon = (() => {
    if (status === 'passed') {
      return <Ionicons name="checkmark-circle" size={22} color={theme.success} />;
    }
    if (isNext) {
      return <Ionicons name="time-outline" size={22} color={theme.accent} />;
    }
    return <Ionicons name="remove-circle-outline" size={22} color={theme.muted} />;
  })();

  return (
    <View
      style={[styles.row, isNext && { backgroundColor: theme.backgroundSelected }]}>
      <View style={[styles.iconCircle, { backgroundColor: PrayerColors[name] }]}>
        <Ionicons name={PRAYER_ICON[name]} size={18} color="#FFFFFF" />
      </View>
      <ThemedText size="sm" weight="bold" style={styles.name}>
        {name}
      </ThemedText>
      <ThemedText size="sm" themeColor="textSecondary" style={styles.time}>
        {formatPrayerTime(time)}
      </ThemedText>
      {statusIcon}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    flex: 1,
    fontSize: 16,
  },
  time: {
    fontSize: 15,
  },
});
