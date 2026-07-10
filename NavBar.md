# Custom Pill-Shaped Floating Bottom Tab Bar

A reusable, pill-shaped bottom tab bar for React Native / Expo apps using `@react-navigation/bottom-tabs`.

## Overview

Two components work together:

| File | Purpose |
|------|---------|
| `DynamicNavBar.tsx` | Creates a `BottomTabNavigator` with 4 screens and wires in the custom tab bar |
| `CustomTabBar.tsx` | The visual pill-shaped tab bar component (floating, dark, iOS/Android shadows) |

## Project Structure

```
src/
├── app/
│   └── _layout.tsx          # Expo Router root layout
│   └── App.tsx              # Entry point — renders TabNavigator
├── components/
│   ├── CustomTabBar.tsx      # The pill-shaped tab bar UI
│   ├── PhotosScreen.tsx      # Tab screen 1
│   ├── CollectionsScreen.tsx # Tab screen 2
│   ├── CreateScreen.tsx      # Tab screen 3
│   └── BackupScreen.tsx      # Tab screen 4
└── navigator/
    └── tabs/
        └── DynamicNavBar.tsx  # Tab navigator wrapper
```

## Installation

```bash
npm install @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @expo/vector-icons
```

## Usage

### 1. Wrap the app in NavigationContainer

For apps without Expo Router, wrap with `NavigationContainer`. With Expo Router, the router handles this automatically.

### 2. Render the TabNavigator

```tsx
import TabNavigator from '@/navigator/tabs/DynamicNavBar';

export default function App() {
  return <TabNavigator />;
}
```

### 3. Register tabs in DynamicNavBar.tsx

Add or remove screens in the `Tab.Navigator`:

```tsx
const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Photos"
        component={PhotosScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="images" color={color} size={size} /> }}
      />
      {/* Add more Tab.Screen entries here */}
    </Tab.Navigator>
  );
}
```

### 4. CustomTabBar component (copy to your project)

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.pill}>
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
              style={[styles.tab, isFocused && styles.tabActive]}
            >
              {isFocused && options.tabBarIcon ? (
                <View style={styles.iconWrap}>
                  {options.tabBarIcon({ focused: true, color: '#FFFFFF', size: 16 })}
                </View>
              ) : null}

              <Text
                style={[styles.label, isFocused ? styles.labelActive : styles.labelInactive]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Search"
        >
          <Ionicons name="search" size={17} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
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
    backgroundColor: '#1C1C1E',
    borderRadius: 50,
    paddingVertical: 5,
    paddingHorizontal: 5,
    gap: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 50,
    gap: 5,
  },
  tabActive: {
    backgroundColor: '#3A3A3C',
  },
  iconWrap: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 14, fontWeight: '500', letterSpacing: 0.1 },
  labelActive: { color: '#FFFFFF' },
  labelInactive: { color: 'rgba(235, 235, 245, 0.65)' },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#3A3A3C',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
});
```

## How It Works

1. **DynamicNavBar** creates a `BottomTabNavigator` and passes a custom `tabBar` render function
2. React Navigation calls `CustomTabBar` with `BottomTabBarProps` (`state`, `descriptors`, `navigation`)
3. `state.routes` contains the tab definitions; `state.index` tracks which tab is focused
4. The focused tab renders icon + label inside a highlighted pill
5. Unfocused tabs render label only
6. A circular search button sits on the far right

## Styling Reference

| Token | Value |
|-------|-------|
| Pill background | `#1C1C1E` |
| Active tab background | `#3A3A3C` |
| Active label color | `#FFFFFF` |
| Inactive label color | `rgba(235, 235, 245, 0.65)` |
| Action button background | `#3A3A3C` |
| Pill border radius | `50` |
| iOS shadow | `#000000`, offset `(0,6)`, opacity `0.45`, radius `14` |
| Android elevation | `16` |

## Common Error: "Cannot read property 'index' of undefined"

**Cause**: `CustomTabBar` is rendered without a navigation context (i.e., not inside a `NavigationContainer` or `Tab.Navigator`). The `state` prop is undefined.

**Fix**: Make sure `CustomTabBar` is only rendered as the `tabBar` prop of a `Tab.Navigator`:

```tsx
<Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
```