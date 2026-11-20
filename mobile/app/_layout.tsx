import { useEffect } from 'react';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { PublicThemePalette } from '../src/constants/Colors';
import { ThemeProvider as CustomThemeProvider, useAppTheme } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { FavoritesProvider } from '../src/context/FavoritesContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  anchor: 'index',
};

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <CustomThemeProvider>
      <AuthProvider>
        <FavoritesProvider>
          <RootLayoutNav />
        </FavoritesProvider>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

function RootLayoutNav() {
  const pathname = usePathname();
  const { isDark, colors } = useAppTheme();

  const isPublicRoute =
    pathname === '/' ||
    pathname === '/landing' ||
    pathname === '/login' ||
    pathname === '/register';

  const activeIsDark = isPublicRoute ? true : isDark;
  const activeBackground = isPublicRoute ? PublicThemePalette.background : colors.background;

  return (
    <>
      <StatusBar style={activeIsDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { flex: 1, width: '100%', backgroundColor: activeBackground },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="landing" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="event/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="checkout" options={{ headerShown: false }} />
        <Stack.Screen name="order/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="payment/finish" options={{ headerShown: false }} />
        <Stack.Screen name="payment/unfinish" options={{ headerShown: false }} />
        <Stack.Screen name="payment/error" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="favorites" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="officer" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
