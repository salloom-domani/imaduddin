import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { type PrayerName } from '@/lib/prayer-times';

interface NextPrayerCardProps {
  name: PrayerName;
  time: Date;
  countdown: string;
  progress: number;
}

const TIME_OF_DAY_ICON: Record<PrayerName, React.ComponentProps<typeof Ionicons>['name']> = {
  Fajr: 'moon',
  Sunrise: 'partly-sunny',
  Dhuhr: 'sunny',
  Asr: 'sunny',
  Maghrib: 'partly-sunny',
  Isha: 'moon',
};

/** One countdown glyph. Digits roll on change; separators stay put. */
function Glyph({ char, color }: { char: string; color: string }) {
  if (!/\d/.test(char)) {
    return <ThemedText style={[styles.countdown, { color }]}>{char}</ThemedText>;
  }
  return (
    <View style={styles.digitBox}>
      {/* keyed by value → swaps (animates) only when this digit changes */}
      <Animated.Text
        key={char}
        entering={FadeInUp.duration(220)}
        exiting={FadeOutDown.duration(220)}
        style={[styles.countdown, styles.digit, { color }]}>
        {char}
      </Animated.Text>
    </View>
  );
}

export function NextPrayerCard({ name, countdown }: NextPrayerCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Ionicons
        name={TIME_OF_DAY_ICON[name]}
        size={200}
        color={theme.accent}
        style={styles.bgIcon}
        pointerEvents="none"
      />

      <View style={styles.counter}>
        {countdown.split('').map((char, i) => (
          <Glyph key={i} char={char} color={theme.text} />
        ))}
      </View>
      <ThemedText size="lg" themeColor="textSecondary">
        until{' '}
        <ThemedText size="xxl" weight="bold" style={{ color: theme.accent }}>
          {name}
        </ThemedText>
      </ThemedText>
    </View>
  );
}

const DIGIT_HEIGHT = 40;
const DIGIT_WIDTH = 26;

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.one,
    alignItems: 'center',
    overflow: 'hidden',
  },
  bgIcon: {
    position: 'absolute',
    left: -50,
    bottom: -50,
    opacity: 0.07,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  digitBox: {
    height: DIGIT_HEIGHT,
    width: DIGIT_WIDTH,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    position: 'absolute',
    textAlign: 'center',
  },
  countdown: {
    fontSize: 48,
    lineHeight: DIGIT_HEIGHT,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
