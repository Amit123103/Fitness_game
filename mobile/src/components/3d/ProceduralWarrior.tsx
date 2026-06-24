import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

export const ProceduralWarrior = ({ level = 1 }: { level?: number }) => {
  const group = useRef<THREE.Group>(null!);
  
  // Animation: Slight hover and rotation
  useFrame((state) => {
    // r3f state clock is standard, using elapsedTime directly from state
    const t = state.clock.elapsedTime;
    group.current.position.y = Math.sin(t) * 0.1;
    group.current.rotation.y = Math.sin(t * 0.5) * 0.2;
  });

  const glowIntensity = Math.min(0.5 + level * 0.1, 2);
  const primaryColor = new THREE.Color('#00F0FF');
  const accentColor = new THREE.Color('#FF0055');

  return (
    <group ref={group}>
      {/* Head */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial 
          color="#1E2130" 
          roughness={0.1} 
          metalness={0.8} 
        />
      </mesh>
      
      {/* Visor / Eyes (Glowing) */}
      <mesh position={[0, 1.55, 0.2]}>
        <boxGeometry args={[0.3, 0.1, 0.1]} />
        <meshStandardMaterial 
          emissive={primaryColor} 
          emissiveIntensity={glowIntensity * 2} 
          toneMapped={false}
        />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.7, 1, 0.4]} />
        <meshStandardMaterial 
          color="#2A2D3E" 
          roughness={0.2} 
          metalness={0.9} 
        />
      </mesh>

      {/* glowing core */}
      <mesh position={[0, 0.9, 0.25]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          emissive={accentColor} 
          emissiveIntensity={glowIntensity}
          toneMapped={false}
        />
      </mesh>

      {/* Arms */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.5, 1.1, 0]}>
          <mesh position={[0, -0.3, 0]}>
            <capsuleGeometry args={[0.1, 0.6, 4, 8]} />
            <meshStandardMaterial color="#1E2130" metalness={0.8} />
          </mesh>
          {/* Shoulder Pads */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.3, 0.2, 0.3]} />
            <meshStandardMaterial 
              emissive={primaryColor} 
              emissiveIntensity={glowIntensity * 0.5} 
            />
          </mesh>
        </group>
      ))}

      {/* Legs */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.25, 0.3, 0]}>
          <mesh position={[0, -0.4, 0]}>
            <capsuleGeometry args={[0.12, 0.8, 4, 8]} />
            <meshStandardMaterial color="#1E2130" metalness={0.8} />
          </mesh>
          {/* Knee Glow */}
          <mesh position={[0, -0.3, 0.12]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial 
              emissive={primaryColor} 
              emissiveIntensity={glowIntensity} 
            />
          </mesh>
        </group>
      ))}

      {/* Base Platform */}
      <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.8, 1, 0.1, 32]} />
        <meshStandardMaterial 
          color="#000000" 
          emissive={primaryColor} 
          emissiveIntensity={0.2} 
        />
      </mesh>
    </group>
  );
};
