import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { HomeHeader } from './home-header';

interface HeroGreetingProps {
  label: string;
  gregorian: string;
  hijri: string;
  topInset: number;
  loading: boolean;
  /** Time-of-day scene rendered behind the greeting. */
  background: ImageSourcePropType;
}

export function HeroGreeting({
  label,
  gregorian,
  hijri,
  topInset,
  loading,
  background,
}: HeroGreetingProps) {
  const theme = useTheme();
  const dateLine = hijri ?? gregorian;

  return (
    <View style={styles.hero}>
      <Image source={background} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
      {/* Dark scrim keeps white text legible across bright + dark scenes. */}
      <LinearGradient
        colors={['rgba(8,20,15,0.25)', 'rgba(8,20,15,0.65)']}
        style={StyleSheet.absoluteFill}
      />
      {/* Bottom fade dissolves the scene into the page so there's no hard edge. */}
      <LinearGradient
        colors={['transparent', theme.background]}
        style={styles.bottomFade}
        pointerEvents="none"
      />

      <View style={[styles.content, { paddingTop: topInset + Spacing.three }]}>
        <HomeHeader color={theme.heroText} />

        {/* <View style={styles.greetingBlock}> */}
        {/*   <ThemedText type="subtitle" style={{ color: theme.heroText }}> */}
        {/*     As-salamu alaykum */}
        {/*   </ThemedText> */}
        {/*   <ThemedText type="small" style={{ color: theme.heroTextMuted }}>May Allah bless your day</ThemedText> */}
        {/* </View> */}

        <View style={styles.metaBlock}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change location"
            style={({ pressed }) => [styles.locationRow, pressed && styles.pressed]}>
            <Ionicons name="location-outline" size={16} color={theme.text} />
            <ThemedText size="sm" weight="bold" style={{ color: theme.text }}>
              {loading ? 'Locating…' : label}
            </ThemedText>
            {/* <Ionicons name="chevron-down" size={14} color={theme.heroText} /> */}
          </Pressable>
          <ThemedText size="xs" style={{ color: theme.textSecondary }}>
            {dateLine}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const FADE_HEIGHT = 100;

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    overflow: 'hidden',
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: FADE_HEIGHT,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  greetingBlock: {
    gap: Spacing.half,
  },
  metaBlock: {
    marginTop: "auto",
    marginBottom: Spacing.three,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  pressed: {
    opacity: 0.6,
  },
});
