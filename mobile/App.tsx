import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { DialogueOverlay } from './src/components/ui/DialogueOverlay';
import { useAppTheme } from './src/styles/theme';
import { useUserStore } from './src/store/useUserStore';

LogBox.ignoreLogs(['THREE.WARNING: Multiple instances of Three.js being imported']);

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
