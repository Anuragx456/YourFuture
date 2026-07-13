import React, { useEffect, useRef, useState } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../store/userStore';
import { COLORS } from '../constants/colors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInRight,
} from 'react-native-reanimated';

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { profile } = useUserStore();
  const isDark = profile.theme === 'dark';
  const accent = profile.primaryColor || profile.accentColor || COLORS.primary;

  const pillBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const activeBg = isDark ? '#3A3A3C' : 'rgba(0, 0, 0, 0.06)';
  const activeLabel = accent;
  const inactiveLabel = isDark ? 'rgba(235, 235, 245, 0.65)' : 'rgba(0, 0, 0, 0.45)';
  const shadow = isDark
    ? { boxShadow: '0 6px 14px rgba(0, 0, 0, 0.45)' }
    : { boxShadow: '0 3px 8px rgba(0, 0, 0, 0.12)' };

  const containerRef = useRef<View>(null);
  const tabRefs = useRef<(React.ElementRef<typeof TouchableOpacity> | null)[]>([]);
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const [layoutsReady, setLayoutsReady] = useState(false);

  useEffect(() => {
    const tab = tabRefs.current[state.index];
    const container = containerRef.current;
    if (!tab || !container) return;
    tab.measure((_fx: number, _fy: number, width: number, _h: number, pageX: number) => {
      container.measure((_cx: number, _cy: number, _cw: number, _ch: number, cPageX: number) => {
        indicatorX.value = withSpring(pageX - cPageX);
        indicatorWidth.value = withSpring(width);
      });
    });
  }, [state.index, layoutsReady, indicatorX, indicatorWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  const pillStyle = [styles.pill, { backgroundColor: pillBg, ...shadow }];
  const indicatorBaseStyle = [styles.indicator, { backgroundColor: activeBg }, indicatorStyle];
  const bottomPad = Platform.OS === 'android' ? Math.max(insets.bottom, 48) : Math.max(insets.bottom, 10);

  return (
    <View style={[styles.container, { paddingBottom: bottomPad }]}>
      <View ref={containerRef} style={pillStyle}>
        <Animated.View pointerEvents="none" style={indicatorBaseStyle} />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const label: string =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : (options.title ?? route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TouchableOpacity
              key={route.key}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              onLayout={() => setLayoutsReady(true)}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.8}
              style={styles.tab}
            >
              {isFocused && options.tabBarIcon ? (
                <Animated.View entering={FadeInRight.duration(180)} style={styles.iconWrap}>
                  {options.tabBarIcon({ focused: true, color: activeLabel, size: 18 })}
                </Animated.View>
              ) : null}

              <Text
                style={[styles.label, { color: isFocused ? activeLabel : inactiveLabel }]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    paddingVertical: 5,
    paddingHorizontal: 6,
    gap: 3,
  },
  indicator: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    left: 0,
    borderRadius: 50,
    zIndex: 0,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 50,
    gap: 5,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  iconWrap: {
    width: 25,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});
