import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { THEMES, BORDER_RADIUS, useAppTheme } from '../../styles/theme';
import { useUserStore } from '../../store/useUserStore';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, intensity = 20 }) => {
  const themeColors = useAppTheme();
  const themeMode = useUserStore((state) => state.systemSettings.themeMode);
  
  return (
    <View style={[
      styles.container, 
      { 
        borderColor: themeColors.glassBorder, 
        backgroundColor: themeColors.glassBackground 
      },
      style
    ]}>
      <BlurView 
        intensity={intensity} 
        tint={themeMode === 'DARK' ? 'dark' : 'light'} 
        style={styles.blur}
      >
        <View style={styles.content}>
          {children}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  blur: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
});
