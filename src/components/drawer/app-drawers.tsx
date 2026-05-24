import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { NotificationsPanel } from './notifications-panel';
import { SettingsPanel } from './settings-panel';

type Side = 'left' | 'right' | null;

interface AppDrawersApi {
  /** Slide in the settings sidebar (left). */
  openSettings: () => void;
  /** Slide in the scheduled-notifications sidebar (right). */
  openNotifications: () => void;
  close: () => void;
}

const AppDrawersContext = createContext<AppDrawersApi | null>(null);

/** Hook for opening either side drawer from anywhere in the tree. */
export function useAppDrawers(): AppDrawersApi {
  const ctx = useContext(AppDrawersContext);
  if (!ctx) throw new Error('useAppDrawers must be used within <AppDrawersProvider>');
  return ctx;
}

/** Fixed-duration glide so tap and swipe-release always animate identically. */
const TIMING = { duration: 280, easing: Easing.out(Easing.cubic) };
const FLING_VELOCITY = 500;

const clamp = (v: number) => {
  'worklet';
  return Math.min(1, Math.max(0, v));
};

/**
 * Two hand-rolled reanimated drawers — settings on the left, scheduled
 * notifications on the right. A single pan tracks the finger: swipe right opens
 * the left drawer, swipe left opens the right one; whichever is open closes the
 * same way. Tap/swipe and the header buttons share one consistent animation.
 */
export function AppDrawersProvider({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const leftWidth = Math.min(width * 0.82, 360);
  const rightWidth = Math.min(width * 0.85, 380);

  // 0 = closed, 1 = open, per side, on the UI thread.
  const pL = useSharedValue(0);
  const pR = useSharedValue(0);
  const startL = useSharedValue(0);
  const startR = useSharedValue(0);
  // 0 = undecided, 1 = left, 2 = right — which drawer the active pan controls.
  const active = useSharedValue(0);
  const [side, setSide] = useState<Side>(null);

  const api = useMemo<AppDrawersApi>(
    () => ({
      openSettings: () => {
        setSide('left');
        pR.value = withTiming(0, TIMING);
        pL.value = withTiming(1, TIMING);
      },
      openNotifications: () => {
        setSide('right');
        pL.value = withTiming(0, TIMING);
        pR.value = withTiming(1, TIMING);
      },
      close: () => {
        setSide(null);
        pL.value = withTiming(0, TIMING);
        pR.value = withTiming(0, TIMING);
      },
    }),
    [pL, pR],
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-15, 15])
        .failOffsetY([-15, 15])
        .onBegin(() => {
          if (pL.value > 0.001) {
            active.value = 1;
            startL.value = pL.value;
          } else if (pR.value > 0.001) {
            active.value = 2;
            startR.value = pR.value;
          } else {
            active.value = 0;
            startL.value = 0;
            startR.value = 0;
          }
        })
        .onChange((e) => {
          if (active.value === 0) {
            if (e.translationX > 0) active.value = 1;
            else if (e.translationX < 0) active.value = 2;
            else return;
          }
          if (active.value === 1) pL.value = clamp(startL.value + e.translationX / leftWidth);
          else pR.value = clamp(startR.value - e.translationX / rightWidth);
        })
        .onEnd((e) => {
          if (active.value === 1) {
            const open =
              e.velocityX > FLING_VELOCITY ? true : e.velocityX < -FLING_VELOCITY ? false : pL.value > 0.5;
            pL.value = withTiming(open ? 1 : 0, TIMING);
            runOnJS(setSide)(open ? 'left' : null);
          } else if (active.value === 2) {
            const open =
              e.velocityX < -FLING_VELOCITY ? true : e.velocityX > FLING_VELOCITY ? false : pR.value > 0.5;
            pR.value = withTiming(open ? 1 : 0, TIMING);
            runOnJS(setSide)(open ? 'right' : null);
          }
          active.value = 0;
        }),
    [active, leftWidth, pL, pR, rightWidth, startL, startR],
  );

  const pageStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pL.value * leftWidth - pR.value * rightWidth }],
  }));
  const leftPanelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (pL.value - 1) * leftWidth }],
  }));
  const rightPanelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - pR.value) * rightWidth }],
  }));
  const dimStyle = useAnimatedStyle(() => ({
    opacity: Math.max(pL.value, pR.value) * 0.4,
    transform: [{ translateX: pL.value * leftWidth - pR.value * rightWidth }],
  }));

  return (
    <AppDrawersContext.Provider value={api}>
      <GestureDetector gesture={pan}>
        <View style={styles.root}>
          <Animated.View style={[styles.left, { width: leftWidth }, leftPanelStyle]}>
            <SettingsPanel onClose={api.close} />
          </Animated.View>

          <Animated.View style={[styles.right, { width: rightWidth }, rightPanelStyle]}>
            <NotificationsPanel active={side === 'right'} onClose={api.close} />
          </Animated.View>

          <Animated.View style={[StyleSheet.absoluteFill, pageStyle]}>{children}</Animated.View>

          {/* Visual scrim — never eats touches. */}
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.dim, dimStyle]} />

          {/* Tap-to-close layer over the visible page only, while a drawer is open. */}
          {side && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close menu"
              onPress={api.close}
              style={[
                styles.closeArea,
                side === 'left' ? { left: leftWidth, right: 0 } : { left: 0, right: rightWidth },
              ]}
            />
          )}
        </View>
      </GestureDetector>
    </AppDrawersContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  left: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
  right: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
  },
  dim: {
    backgroundColor: '#000',
  },
  closeArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
});
