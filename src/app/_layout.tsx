import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUserStore } from '../store/userStore';
import { COLORS } from '../constants/colors';

export default function RootLayout() {
  const { profile } = useUserStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inTabsGroup = segments[0] === '(tabs)';

    if (!profile.onboarded && inTabsGroup) {
      router.replace('/onboarding');
    } else if (profile.onboarded && segments[0] === 'onboarding') {
      router.replace('/(tabs)');
    }
  }, [profile.onboarded, segments, router]);

  const isDark = profile.theme === 'dark';
  const navBg = isDark ? COLORS.background.dark : COLORS.background.light;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: navBg }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: navBg } }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </View>
    </GestureHandlerRootView>
  );
}
