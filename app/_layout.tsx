import { Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_700Bold, Inter_900Black } from '@expo-google-fonts/inter';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import "../global.css";
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { registerForPushNotificationsAsync } from '../services/notifications';
import { AIProvider } from '../contexts/AIContext';
import { registerBackgroundHandler } from '../services/focusNotification';

// Register notifee background handler (must be outside component)
registerBackgroundHandler();

SplashScreen.preventAutoHideAsync();

import { AnimatedSplashScreen } from '../components/AnimatedSplashScreen';
import { useState } from 'react';

// ... imports

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_900Black,
  });

  const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    if (loaded || error) {
      // Hide the native splash screen as soon as fonts are loaded
      // so we can show our custom animated one.
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  if (!splashAnimationFinished) {
    return (
      <AnimatedSplashScreen
        onFinish={() => setSplashAnimationFinished(true)}
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AIProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(focus)" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
          <Stack.Screen name="focus-zone" options={{ headerShown: false }} />
          <Stack.Screen name="war-path" options={{ headerShown: false }} />
          <Stack.Screen name="tactical-plan" options={{ presentation: 'modal', headerTitle: 'Tactical Plan' }} />
          <Stack.Screen name="shiny-object" options={{ presentation: 'modal', headerTitle: 'Shiny Object Detector' }} />
        </Stack>
      </AIProvider>
    </GestureHandlerRootView>
  );
}
