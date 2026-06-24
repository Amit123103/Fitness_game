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

    switch (type) {
      case 'PULLUPS':
        // Detecting pullups via Y-axis (vertical movement)
        if (state.current === 'START' && y < baseline) {
          state.current = 'DOWN';
        } else if (state.current === 'DOWN' && y > threshold) {
          state.current = 'UP';
          handleRepetition();
          state.current = 'START';
        }
        break;
      
      case 'PUSHUPS':
        // Detecting pushups via Z or Y depending on phone placement (chest/pocket)
        // Here we assume phone is on the floor/chest: Z-axis change
        if (state.current === 'START' && z < baseline) {
          state.current = 'DOWN';
        } else if (state.current === 'DOWN' && z > threshold) {
          state.current = 'UP';
          handleRepetition();
          state.current = 'START';
        }
        break;

      case 'RUNNING':
        // Simplified: use magnitude peaks to detect steps
        const magnitude = Math.sqrt(accData.x**2 + accData.y**2 + accData.z**2);
        if (magnitude > 1.5) {
          handleRepetition();
        }
        break;
      
      case 'PLANK':
        // Time based - handled separately or via stillness
        break;
    }
  };

  const handleRepetition = () => {
    setCount(prev => prev + 1);
    
    // In-game impact
    addXP(10);
    
    // Physical feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Mapping specific exercises to stats
    if (type === 'PUSHUPS') {
      updateStats({ strength: 0.1 });
      updateQuestProgress('pushups', 1);
    }
    if (type === 'PULLUPS') {
      updateStats({ strength: 0.1, stamina: 0.05 });
      updateQuestProgress('pullups', 1);
    }
    if (type === 'RUNNING') {
      updateStats({ speed: 0.1 });
      updateQuestProgress('running', 10); // 10 meters per step magnitude for simulation
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
