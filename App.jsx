// ─── App.jsx ───────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { View, I18nManager, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TrackPlayer from 'react-native-track-player';

import { useStore } from './src/store/useStore';
import { useMediaLibrary } from './src/hooks/useMediaLibrary';
import { setupPlayer } from './src/hooks/useAudioPlayer';
import { THEMES } from './src/constants/themes';

import { HomeScreen } from './src/screens/HomeScreen';
import { NowPlayingScreen } from './src/screens/NowPlayingScreen';
import { LyricsScreen } from './src/screens/LyricsScreen';
import { EqualizerScreen } from './src/screens/EqualizerScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { PlaytimeScreen } from './src/screens/PlaytimeScreen';
import { PermissionScreen } from './src/screens/PermissionScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// ── Drawer Navigator (main screens with side menu) ──
function DrawerNav() {
  const { settings } = useStore();
  const theme = THEMES[settings.theme] || THEMES.purple;

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.bgCard,
          width: 280,
        },
        drawerActiveTintColor: theme.primaryLight,
        drawerInactiveTintColor: theme.textMuted,
        drawerLabelStyle: { fontWeight: '700', fontSize: 14 },
        drawerItemStyle: { borderRadius: 10 },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'SWVM' }} />
      <Drawer.Screen name="Playtime" component={PlaytimeScreen} options={{ title: '📊 Playtime' }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: '⚙️ Settings' }} />
    </Drawer.Navigator>
  );
}

// ── Root Stack ──
function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={DrawerNav} />
      <Stack.Screen
        name="NowPlaying"
        component={NowPlayingScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      <Stack.Screen name="Lyrics" component={LyricsScreen} />
      <Stack.Screen name="Equalizer" component={EqualizerScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [showPerm, setShowPerm] = useState(false);
  const { settings, hydrate, setSongs, mergeSongsMeta } = useStore();
  const theme = THEMES[settings?.theme] || THEMES.purple;
  const { checkPermission, scanLibrary } = useMediaLibrary();

  useEffect(() => {
    async function init() {
      // 1. Setup TrackPlayer
      await setupPlayer();

      // 2. Hydrate saved data
      await hydrate();

      // 3. Check media permission
      const hasPerm = await checkPermission();

      if (hasPerm) {
        // Auto-scan
        const songs = await scanLibrary();
        setSongs(songs);
        setReady(true);
      } else {
        // Show permission screen
        setShowPerm(true);
        setReady(true);
      }
    }
    init();
  }, []);

  if (!ready) {
    return (
      <View style={[styles.splash, { backgroundColor: '#07070F' }]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (showPerm) {
    return (
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PermissionScreen onDone={() => setShowPerm(false)} />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: theme.primary,
              background: theme.bg,
              card: theme.bgCard,
              text: theme.text,
              border: theme.border,
              notification: theme.primary,
            },
          }}
        >
          <RootStack />
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
