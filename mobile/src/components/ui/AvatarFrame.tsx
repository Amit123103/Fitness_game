import React from 'react';
import { View, StyleSheet, Image, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { COLORS, SHADOWS, BORDER_RADIUS } from '../../styles/theme';

interface AvatarFrameProps {
  source: any;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const AvatarFrame: React.FC<AvatarFrameProps> = ({ source, size = 150, style }) => {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Outer Glow / Border */}
      <MotiView
        from={{ scale: 0.95, opacity: 0.5 }}
        animate={{ scale: 1.05, opacity: 0.8 }}
        transition={{
          type: 'timing',
          duration: 2000,
          loop: true,
        }}
        style={[
          styles.glowBorder,
          { borderRadius: size / 2, width: size + 4, height: size + 4 }
        ]}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.accent, COLORS.secondary]}
          style={styles.gradient}
        />
      </MotiView>

      {/* Frame Container */}
      <View style={[styles.frame, { borderRadius: size / 2 }]}>
        <Image 
          source={source} 
          style={[styles.image, { width: size, height: size }]} 
          resizeMode="cover"
        />
        
        {/* Glass Overlay Effect */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)']}
          style={styles.overlay}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...SHADOWS.neonPrimary,
  },
  glowBorder: {
    position: 'absolute',
    padding: 2,
    zIndex: -1,
  },
  gradient: {
    flex: 1,
    borderRadius: 999,
  },
  frame: {
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  image: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
  },
});
