import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import { AppState, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppDrawersProvider } from '@/components/drawer/app-drawers';
import { schedulePrayerNotifs } from '@/lib/notifications';
import { registerPrayerNotifsTask } from '@/tasks/prayer-notifs-task';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    registerPrayerNotifsTask().catch(() => {});
    schedulePrayerNotifs().catch(() => {});

    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') schedulePrayerNotifs().catch(() => {});
    });
    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AppDrawersProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AppDrawersProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
