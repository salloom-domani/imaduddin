import { Text, type TextProps } from 'react-native';

import { FontSize, FontWeight, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  /** Step from the FontSize scale. */
  size?: keyof typeof FontSize;
  /** Step from the FontWeight scale. */
  weight?: keyof typeof FontWeight;
  themeColor?: ThemeColor;
};

export function ThemedText({
  style,
  size = 'md',
  weight = 'medium',
  themeColor,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();
  const fontSize = FontSize[size];

  return (
    <Text
      style={[
        {
          color: theme[themeColor ?? 'text'],
          fontSize,
          // lineHeight: Math.round(fontSize * 1.3),
          fontWeight: FontWeight[weight],
        },
        style,
      ]}
      {...rest}
    />
  );
}
