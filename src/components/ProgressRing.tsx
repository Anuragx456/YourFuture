import React from 'react';
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
}

export default function ProgressRing({ progress, size = 60, strokeWidth = 8, color }: ProgressRingProps) {
  const { profile } = useUserStore();
  const isDark = profile.theme === 'dark';
  const primary = color || (isDark ? '#f8fafc' : (profile.primaryColor || COLORS.primary));
  const textMuted = isDark ? COLORS.text.mutedDark : COLORS.text.mutedLight;
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const animatedProgress = useSharedValue(0);

  React.useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 800,
      easing: Easing.out(Easing.cubic)
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9'}
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
}
