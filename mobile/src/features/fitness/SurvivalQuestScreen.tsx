import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Bug, Activity, Clock, AlertTriangle, Skull, ShieldAlert } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../styles/theme';
import { useUserStore } from '../../store/useUserStore';

const { width, height } = Dimensions.get('window');

// Survival Duration in seconds
const SURVIVAL_DURATION = 120;

export const SurvivalQuestScreen = () => {
  const navigation = useNavigation<any>();
  const { resetQuest } = useUserStore();
  
  const [timeLeft, setTimeLeft] = useState(SURVIVAL_DURATION);
  const [vitality, setVitality] = useState(100);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [entities, setEntities] = useState<{ id: number; x: number; y: number }[]>([]);
  
  const heatHazeAnim = useRef(new Animated.Value(0)).current;

  // Timer & Vitality Depletion
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleVictory();
          return 0;
        }
        return prev - 1;
      });

      setVitality((prev) => {
        const next = prev - 0.5;
        if (next <= 0) {
          clearInterval(timer);
          handleGameOver();
          return 0;
        }
        return next;
      });

      // Randomized Entity Spawning
      if (Math.random() > 0.8) {
        spawnEntity();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Heat Haze Animation Loop
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(heatHazeAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(heatHazeAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const spawnEntity = () => {
    const newEntity = {
      id: Date.now(),
      x: Math.random() * (width - 40),
      y: Math.random() * (height - 200),
    };
    setEntities((prev) => [...prev, newEntity]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setEntities((prev) => prev.filter((e) => e.id !== newEntity.id));
    }, 3000);
  };

  const replenishVitality = () => {
    setVitality((prev) => Math.min(100, prev + 5));
  };

  const handleGameOver = () => {
    setIsGameOver(true);
  };

  const handleVictory = () => {
    setIsVictory(true);
  };

  const resolvePenalty = () => {
    resetQuest();
    navigation.navigate('Dashboard');
  };

  const retryPenalty = () => {
    navigation.replace('SurvivalQuest');
  };

  // Simulated 4-hour countdown
  const formatHourTimer = () => {
    const totalSeconds = (timeLeft / SURVIVAL_DURATION) * 4 * 3600;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isGameOver || isVictory) {
    return (
      <View style={styles.resultOverlay}>
        <LinearGradient
          colors={isVictory ? ['#00F0FF', '#000'] : ['#F00', '#000']}
          style={StyleSheet.absoluteFill}
        />
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.resultContent}
        >
          <Text style={[styles.resultTitle, { color: isVictory ? COLORS.primary : COLORS.error }]}>
            {isVictory ? 'QUEST CLEARED' : 'YOU DIED'}
          </Text>
          <Text style={styles.resultDesc}>
            {isVictory 
              ? 'Penalty has been lifted. Vitals stabilized.' 
              : 'Stagnation is death. The System is disappointed.'}
          </Text>
          
          <TouchableOpacity 
            style={[styles.resultBtn, { backgroundColor: isVictory ? COLORS.primary : COLORS.error }]} 
            onPress={isVictory ? resolvePenalty : retryPenalty}
          >
            <Text style={styles.resultBtnText}>{isVictory ? 'RETURN TO HUB' : 'RETRY SURVIVAL'}</Text>
          </TouchableOpacity>
        </MotiView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Desert Gradient */}
      <LinearGradient
        colors={['#EDC9AF', '#8B4513', '#000']}
        style={StyleSheet.absoluteFill}
      />

      {/* Heat Haze Effect Overlay */}
      <Animated.View 
        style={[
          styles.heatHaze,
          {
            transform: [
              { skewX: heatHazeAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '2deg'] }) },
              { scale: heatHazeAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] }) }
            ],
            opacity: 0.3
          }
        ]}
      >
        <LinearGradient colors={['rgba(255,165,0,0.1)', 'transparent']} style={StyleSheet.absoluteFill} />
      </Animated.View>

      {/* Sandstorm Effect */}
      <MotiView
        from={{ translateX: -width }}
        animate={{ translateX: width }}
        transition={{ loop: true, duration: 3000, type: 'timing' }}
        style={styles.sandstorm}
      />

      {/* HUD Header */}
      <View style={styles.hudHeader}>
        <View style={styles.timerBox}>
          <Clock size={16} color="white" />
          <Text style={styles.timerText}>{formatHourTimer()}</Text>
        </View>
        <Text style={styles.warningAlert}>[ PENALTY: SURVIVAL_QUEST ]</Text>
      </View>

      {/* Physicality/Vitality Meter */}
      <View style={styles.vitalityContainer}>
        <View style={styles.vitalityHeader}>
           <Activity size={12} color="#FFF" />
           <Text style={styles.vitalityLabel}>PHYSICALITY MANIFESTATION</Text>
           <Text style={styles.vitalityValue}>{Math.round(vitality)}%</Text>
        </View>
        <View style={styles.vitalityTrack}>
          <MotiView
            animate={{ width: `${vitality}%` }}
            style={[styles.vitalityFill, { backgroundColor: vitality < 30 ? COLORS.error : '#FFD700' }]}
          />
        </View>
        <Text style={styles.hint}>TAP SCREEN TO GENERATE STAMINA</Text>
      </View>

      {/* Interactive Entities Layer */}
      <View style={styles.playArea}>
        <AnimatePresence>
          {entities.map((entity) => (
            <MotiView
              key={entity.id}
              from={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1.5 }}
              exit={{ opacity: 0, scale: 2 }}
              style={[styles.entity, { left: entity.x, top: entity.y }]}
            >
              <Bug size={32} color="#000" />
            </MotiView>
          ))}
        </AnimatePresence>
      </View>

      {/* Main Interaction Area */}
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={replenishVitality} 
        style={styles.interactionLayer}
      >
        <MotiView
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ loop: true, duration: 4000 }}
          style={styles.interactionGlow}
        />
        <View style={styles.interactionCenter}>
           <ShieldAlert size={60} color="rgba(255,255,255,0.2)" />
        </View>
      </TouchableOpacity>

      {/* System Error Logs */}
      <View style={styles.systemLogs}>
         <MotiText animate={{ opacity: [1, 0.5, 1] }} transition={{ loop: true }} style={styles.logLine}>
            {'>'} SYSTEM ERROR: STAGNATION DETECTED
         </MotiText>
         <Text style={styles.logLine}>{`> TEMPERATURE: 55°C (131°F)`}</Text>
         <Text style={styles.logLine}>{`> MOVEMENT REQUIRED TO MAINTAIN CIRCULATION`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B4513',
  },
  heatHaze: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  sandstorm: {
    position: 'absolute',
    width: width * 2,
    height: '100%',
    backgroundColor: 'rgba(237, 201, 175, 0.1)',
    zIndex: 2,
  },
  hudHeader: {
    marginTop: 60,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  timerText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'System',
  },
  warningAlert: {
    color: COLORS.error,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  vitalityContainer: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    zIndex: 10,
  },
  vitalityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vitalityLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginLeft: 6,
    flex: 1,
  },
  vitalityValue: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  vitalityTrack: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  vitalityFill: {
    height: '100%',
  },
  hint: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 8,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: 'bold',
  },
  playArea: {
    flex: 1,
    zIndex: 5,
  },
  entity: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interactionLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interactionGlow: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#FFD700',
    opacity: 0.1,
  },
  interactionCenter: {
    position: 'absolute',
    opacity: 0.5,
  },
  systemLogs: {
    padding: SPACING.xl,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  logLine: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 1,
  },
  resultOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContent: {
    width: width * 0.8,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 5,
    marginBottom: SPACING.xl,
  },
  resultDesc: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: SPACING.xxl,
  },
  resultBtn: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 4,
  },
  resultBtnText: {
    color: 'white',
    fontWeight: '900',
    letterSpacing: 2,
  },
});
