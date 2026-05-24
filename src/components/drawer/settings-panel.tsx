import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface SettingsRow {
  icon: IconName;
  label: string;
}

const ROWS: SettingsRow[] = [
  { icon: 'location-outline', label: 'Location' },
  { icon: 'notifications-outline', label: 'Notifications' },
  { icon: 'time-outline', label: 'Calculation method' },
  { icon: 'color-palette-outline', label: 'Appearance' },
  { icon: 'information-circle-outline', label: 'About' },
];

/** Contents of the left settings sidebar. */
export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: theme.backgroundElement,
          borderRightColor: theme.border,
          paddingTop: insets.top + Spacing.three,
          paddingBottom: insets.bottom + Spacing.three,
          paddingLeft: insets.left + Spacing.four,
        },
      ]}>
      <ThemedText size="xl" weight="bold" style={{ color: theme.text }}>
        Settings
      </ThemedText>

      <View style={styles.rows}>
        {ROWS.map((row) => (
          <Pressable
            key={row.label}
            accessibilityRole="button"
            accessibilityLabel={row.label}
            onPress={onClose}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <Ionicons name={row.icon} size={22} color={theme.textSecondary} />
            <ThemedText size="md" style={{ color: theme.text }}>
              {row.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingRight: Spacing.three,
    gap: Spacing.five,
  },
  rows: {
    gap: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  pressed: {
    opacity: 0.6,
  },
});
