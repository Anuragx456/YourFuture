import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { useAppTheme } from '../lib/theme';

interface BrandGlyphProps {
  /** Outer badge size in dp. */
  size?: number;
  /** Badge fill. */
  badgeColor?: string;
  /** Glyph fill. */
  glyphColor?: string;
  /** Override badge corner radius. */
  radius?: number;
}

/** The Your Future mark: a four-point sparkle inside a rounded-square badge. */
export default function BrandGlyph({
  size = 32,
  badgeColor,
  glyphColor,
  radius,
}: BrandGlyphProps) {
  const t = useAppTheme();
  const badgeFill = badgeColor ?? (t.isDark ? COLORS.text.dark : COLORS.background.dark);
  const glyphFill = glyphColor ?? (t.isDark ? COLORS.background.dark : COLORS.text.dark);

  const glyph = size * 0.52;
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: radius ?? size * 0.28,
          backgroundColor: badgeFill,
        },
      ]}
      accessibilityRole="image"
      accessibilityLabel="Your Future"
    >
      <Svg width={glyph} height={glyph} viewBox="0 0 24 24">
        <Path
          d="M12 1.5 C12 7.2 16.8 12 22.5 12 C16.8 12 12 16.8 12 22.5 C12 16.8 7.2 12 1.5 12 C7.2 12 12 7.2 12 1.5 Z"
          fill={glyphFill}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
