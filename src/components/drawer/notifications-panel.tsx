import Ionicons from '@expo/vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { triggerDate } from '@/lib/notifications';

interface NotificationsPanelProps {
  /** True while the drawer is open, so the list refetches each time it shows. */
  active: boolean;
  onClose: () => void;
}

const timeFmt = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

/** Right sidebar listing every pending scheduled notification. */
export function NotificationsPanel({ active, onClose }: NotificationsPanelProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Notifications.NotificationRequest[]>([]);

  const refresh = useCallback(async () => {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    scheduled.sort((a, b) => (triggerDate(a.trigger)?.getTime() ?? 0) - (triggerDate(b.trigger)?.getTime() ?? 0));
    setItems(scheduled);
  }, []);

  useEffect(() => {
    if (active) refresh().catch(() => {});
  }, [active, refresh]);

  const clearAll = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    setItems([]);
  }, []);

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: theme.backgroundElement,
          borderLeftColor: theme.border,
          paddingTop: insets.top + Spacing.three,
          paddingRight: insets.right + Spacing.four,
        },
      ]}>
      <View style={styles.header}>
        <ThemedText size="xl" weight="bold" style={{ color: theme.text }}>
          Scheduled
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Refresh"
          onPress={() => refresh().catch(() => {})}
          hitSlop={Spacing.two}
          style={({ pressed }) => pressed && styles.pressed}>
          <Ionicons name="refresh" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + Spacing.three }]}
        showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <ThemedText size="sm" style={{ color: theme.textSecondary }}>
            No notifications scheduled.
          </ThemedText>
        ) : (
          items.map((item) => {
            const when = triggerDate(item.trigger);
            return (
              <View key={item.identifier} style={[styles.item, { borderBottomColor: theme.border }]}>
                <ThemedText size="md" weight="semibold" style={{ color: theme.text }} numberOfLines={1}>
                  {item.content.title ?? 'Notification'}
                </ThemedText>
                {item.content.body ? (
                  <ThemedText size="sm" style={{ color: theme.textSecondary }} numberOfLines={2}>
                    {item.content.body}
                  </ThemedText>
                ) : null}
                {when ? (
                  <ThemedText size="xs" style={{ color: theme.textSecondary }}>
                    {timeFmt.format(when)}
                  </ThemedText>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>

      {items.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel all notifications"
          onPress={() => {
            clearAll().catch(() => {});
            onClose();
          }}
          style={({ pressed }) => [styles.clear, pressed && styles.pressed]}>
          <Ionicons name="trash-outline" size={18} color={theme.text} />
          <ThemedText size="sm" weight="semibold" style={{ color: theme.text }}>
            Cancel all
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    borderLeftWidth: StyleSheet.hairlineWidth,
    paddingLeft: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  list: {
    gap: Spacing.three,
  },
  item: {
    gap: Spacing.half,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  clear: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  pressed: {
    opacity: 0.6,
  },
});
