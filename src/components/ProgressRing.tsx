import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useUserStore } from '../store/userStore';
import { COLORS } from '../constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  labelColor?: string;
  labelSize?: number;
}

export default function ProgressRing({ progress, size = 60, strokeWidth = 8, color, trackColor, label, labelColor, labelSize }: ProgressRingProps) {
  const { profile } = useUserStore();
  const isDark = profile.theme === 'dark';
  const primary = color || (isDark ? '#f8fafc' : (profile.primaryColor || COLORS.primary));
  const track = trackColor || (isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9');

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const animatedProgress = useSharedValue(0);

  React.useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 800,
      easing: Easing.out(Easing.cubic)
    });
  }, [progress, animatedProgress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const svgStyle = { transform: [{ rotate: '-90deg' as const }] };

  const ring = (
    <Svg width={size} height={size} style={svgStyle} pointerEvents="none">
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={track}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={primary}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        animatedProps={animatedProps}
        strokeLinecap="round"
      />
    </Svg>
  );

  if (!label) return ring;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {ring}
      <View style={styles.center}>
        <Text
          style={[
            styles.label,
            {
              color: labelColor || primary,
              fontSize: labelSize || size * 0.24,
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
  },
});
