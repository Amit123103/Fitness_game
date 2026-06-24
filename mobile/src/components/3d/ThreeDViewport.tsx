import React, { Suspense } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei/native';
import { ProceduralWarrior } from './ProceduralWarrior';
import { COLORS } from '../../styles/theme';

export const ThreeDViewport = ({ level }: { level?: number }) => {
  return (
    <View style={styles.container}>
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 1, 4]} fov={50} />
          
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color={COLORS.primary} />
          <pointLight position={[-10, 5, -10]} intensity={1} color={COLORS.secondary} />
          <directionalLight position={[0, 5, 5]} intensity={0.5} />

          <ProceduralWarrior level={level} />
          
          <OrbitControls 
            enablePan={false} 
            enableZoom={false} 
            minPolarAngle={Math.PI / 3} 
            maxPolarAngle={Math.PI / 1.5} 
          />
        </Suspense>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 350,
    backgroundColor: 'transparent',
  },
});
