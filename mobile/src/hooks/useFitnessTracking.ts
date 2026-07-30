import { useState, useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../store/useUserStore';

export type ExerciseType = 'PUSHUPS' | 'PULLUPS' | 'RUNNING' | 'PLANK';

interface FitnessStats {
  count: number;
  isActive: boolean;
}

export const useFitnessTracking = (type: ExerciseType) => {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [count, setCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const { addXP, updateStats, updateQuestProgress } = useUserStore();
  
  const lastY = useRef(0);
  const state = useRef<'START' | 'DOWN' | 'UP'>('START');
  const threshold = 1.2; // Adjust based on testing
  const baseline = 0.8;

  useEffect(() => {
    let subscription: any;

    if (isActive) {
      Accelerometer.setUpdateInterval(100);
      subscription = Accelerometer.addListener(accelerometerData => {
        setData(accelerometerData);
        processExercise(accelerometerData);
      });
    }

    return () => {
      subscription && subscription.remove();
    };
  }, [isActive, type]);

  const processExercise = (accData: { x: number, y: number, z: number }) => {
    const { y, z } = accData;
    const normalizedType = type.toUpperCase();

    switch (normalizedType) {
      case 'PULLUPS':
        if (state.current === 'START' && y < baseline) {
          state.current = 'DOWN';
        } else if (state.current === 'DOWN' && y > threshold) {
          state.current = 'UP';
          handleRepetition();
          state.current = 'START';
        }
        break;
      
      case 'PUSHUPS':
      case 'SQUATS':
        if (state.current === 'START' && z < baseline) {
          state.current = 'DOWN';
        } else if (state.current === 'DOWN' && z > threshold) {
          state.current = 'UP';
          handleRepetition();
          state.current = 'START';
        }
        break;

      case 'RUNNING':
        const magnitude = Math.sqrt(accData.x**2 + accData.y**2 + accData.z**2);
        if (magnitude > 1.5) {
          handleRepetition();
        }
        break;
      
      case 'PLANK':
        break;
    }
  };

  const handleRepetition = () => {
    setCount(prev => prev + 1);
    
    // In-game impact
    addXP(10);
    
    // Physical feedback
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}
    
    const normalizedType = type.toUpperCase();
    // Mapping specific exercises to stats
    if (normalizedType === 'PUSHUPS') {
      updateStats({ strength: 0.1 });
      updateQuestProgress('pushups', 1);
    }
    if (normalizedType === 'SQUATS' || normalizedType === 'PULLUPS') {
      updateStats({ stamina: 0.1 });
      updateQuestProgress('pullups', 1);
    }
    if (normalizedType === 'RUNNING') {
      updateStats({ speed: 0.1 });
      updateQuestProgress('running', 10);
    }
  };

  const startTracking = () => {
    setCount(0);
    setIsActive(true);
  };

  const stopTracking = () => {
    setIsActive(false);
  };

  return {
    data,
    count,
    isActive,
    startTracking,
    stopTracking,
    incrementCount: handleRepetition
  };
};
