import React, { useEffect, useRef, useState } from 'react';
import { Platform, View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../lib/theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInRight,
} from 'react-native-reanimated';

/**
 * Visual slot layout of the tab bar:
 * 0: Home    1: Habits    2: Add (+)    3: Predict    4: Profile
 *
 * The plus button is not a real tab; it opens the add-habit form.
 * This map converts the active route index to its visual slot.
 */
const SLOT_FOR_ROUTE = [0, 1, 3, 4];

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const t = useAppTheme();
  const router = useRouter();

  const containerRef = useRef<View>(null);
  const tabRefs = useRef<(React.ComponentRef<typeof Pressable> | null)[]>([]);
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const [layoutsReady, setLayoutsReady] = useState(false);

  useEffect(() => {
    const activeSlot = SLOT_FOR_ROUTE[state.index] ?? state.index;
    const tab = tabRefs.current[activeSlot];
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

  const barStyle = [
    styles.bar,
    {
      backgroundColor: t.card,
      borderTopColor: t.borderOnBg,
    },
  ];
  const indicatorBaseStyle = [styles.indicator, { backgroundColor: t.accent }, indicatorStyle];
  const bottomPad = Platform.OS === 'android' ? Math.max(insets.bottom, 12) : Math.max(insets.bottom, 8);

  const renderTab = (route: (typeof state.routes)[number], index: number, slot: number) => {
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
      <Pressable
        key={route.key}
        ref={(el) => {
          tabRefs.current[slot] = el;
        }}
        onLayout={() => setLayoutsReady(true)}
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.tab}
      >
        {isFocused && options.tabBarIcon ? (
          <Animated.View entering={FadeInRight.duration(180)} style={styles.iconWrap}>
            {options.tabBarIcon({ focused: true, color: t.onAccent, size: 18 })}
          </Animated.View>
        ) : null}

        <Text
          style={[styles.label, { color: isFocused ? t.onAccent : t.mutedOnBg }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  const PlusButton = () => (
    <Pressable
      onPress={() => router.push('/(tabs)/habits?add=true')}
      style={styles.plusBtn}
      accessibilityLabel="Add habit"
    >
      <View
        style={[
          styles.plusCircle,
          {
            backgroundColor: t.accent,
            shadowColor: '#000',
            shadowOpacity: t.isDark ? 0.4 : 0.2,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
          },
        ]}
      >
        <Ionicons name="add" size={28} color={t.onAccent} />
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingBottom: bottomPad }]}>
      <View ref={containerRef} style={barStyle}>
        <Animated.View pointerEvents="none" style={indicatorBaseStyle} />

        {renderTab(state.routes[0], 0, 0)}
        {renderTab(state.routes[1], 1, 1)}
        <PlusButton key="plus" />
        {renderTab(state.routes[2], 2, 3)}
        {renderTab(state.routes[3], 3, 4)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 6,
    gap: 2,
  },
  indicator: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    left: 0,
    borderRadius: 50,
    zIndex: 0,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 14,
    borderRadius: 50,
    gap: 6,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  iconWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  plusBtn: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  plusCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10,
  },
});
