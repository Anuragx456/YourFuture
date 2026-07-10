import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../store/userStore';
import { COLORS } from '../constants/colors';

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { profile } = useUserStore();
  const isDark = profile.theme === 'dark';
  const primary = isDark ? '#f8fafc' : (profile.primaryColor || COLORS.primary);

  const pillBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const activeBg = isDark ? '#3A3A3C' : 'rgba(0, 0, 0, 0.06)';
  const activeLabel = isDark ? '#FFFFFF' : '#000000';
  const inactiveLabel = isDark ? 'rgba(235, 235, 245, 0.65)' : 'rgba(0, 0, 0, 0.45)';
  const shadow = isDark
    ? {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 14,
        elevation: 16,
      }
    : {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 6,
      };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: Math.max(insets.bottom, 10),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: pillBg,
          borderRadius: 50,
                paddingVertical: 5,
                paddingHorizontal: 6,
          gap: 3,
          ...shadow,
        }}
      >
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
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 16,
                paddingVertical: 16 ,
                borderRadius: 50,
                gap: 5,
                backgroundColor: isFocused ? activeBg : 'transparent',
              }}
            >
              {isFocused && options.tabBarIcon ? (
                <View style={{ width: 25, height: 22, alignItems: 'center', justifyContent: 'center' }}>
                  {options.tabBarIcon({ focused: true, color: activeLabel, size: 18 })}
                </View>
              ) : null}

              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  letterSpacing: 0.1,
                  color: isFocused ? activeLabel : inactiveLabel,
                }}
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
