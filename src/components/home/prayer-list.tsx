import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { PrayerRowData } from '@/hooks/use-prayer-times';
import { PrayerRow } from './prayer-row';

interface PrayerListProps {
  rows: PrayerRowData[];
}

export function PrayerList({ rows }: PrayerListProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {rows.map((row, index) => {
        const prev = rows[index - 1];
        const hideDivider = row.status === 'next' || prev?.status === 'next';
        return (
          <View key={row.name}>
            {index > 0 && !hideDivider && (
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            )}
            <PrayerRow {...row} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.two,
  },
});
