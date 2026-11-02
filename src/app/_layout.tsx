import {
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { DevanagariFonts } from '@/components/devanagari-fonts';
import { StoreProvider } from '@/store/store';
import { color } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Devanagari fonts load only when someone switches to Hindi (see DevanagariFonts).
  const [loaded, error] = useFonts({
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  // On the web, paint straight away and let fonts swap in; native waits behind the splash.
  if (!loaded && !error && Platform.OS !== 'web') return null;

  return (
    <StoreProvider>
      <DevanagariFonts />
      <StatusBar style="dark" />
      <View style={styles.outer}>
        <View style={styles.inner}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: color.paper },
              animation: 'slide_from_right',
            }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="deal/[id]" />
            <Stack.Screen name="shop/[id]" />
            <Stack.Screen name="search" options={{ animation: 'fade' }} />
          </Stack>
        </View>
      </View>
    </StoreProvider>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#EFE4D6' : color.paper,
    alignItems: 'center',
  },
  inner: { flex: 1, width: '100%', maxWidth: 480, backgroundColor: color.paper, overflow: 'hidden' },
});
