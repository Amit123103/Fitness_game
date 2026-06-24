import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { DialogueOverlay } from './src/components/ui/DialogueOverlay';
import { useAppTheme } from './src/styles/theme';
import { useUserStore } from './src/store/useUserStore';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
export default function App() {
  const themeColors = useAppTheme();
  const themeMode = useUserStore((state) => state.systemSettings.themeMode);
  
  return (
    <SafeAreaProvider style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style={themeMode === 'DARK' ? 'light' : 'dark'} />
      <RootNavigator />
      <DialogueOverlay />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
