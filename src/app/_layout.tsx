import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useUserStore } from '../store/userStore';

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
  }, [profile.onboarded, segments]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style={profile.theme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
