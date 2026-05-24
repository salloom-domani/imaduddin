import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useAppDrawers } from '@/components/drawer/app-drawers';
import { Spacing } from '@/constants/theme';

interface HomeHeaderProps {
  /** Icon/tint color (white over the hero gradient). */
  color: string;
  style?: StyleProp<ViewStyle>
}

/** Top bar: menu opens settings (left drawer), bell opens scheduled notifications (right drawer). */
export function HomeHeader({ color, style }: HomeHeaderProps) {
  const drawers = useAppDrawers();
  return (
    <View style={[styles.row, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        onPress={drawers.openSettings}
        hitSlop={Spacing.two}
        style={({ pressed }) => pressed && styles.pressed}>
        <Ionicons name="menu" size={28} color={color} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Scheduled notifications"
        onPress={drawers.openNotifications}
        hitSlop={Spacing.two}
        style={({ pressed }) => pressed && styles.pressed}>
        <Ionicons name="notifications-outline" size={24} color={color} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
