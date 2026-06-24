import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText } from 'moti';
import { Play, Square, Activity, Flame, Zap, Swords } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../styles/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { useFitnessTracking, ExerciseType } from '../../hooks/useFitnessTracking';

const { width } = Dimensions.get('window');

export const WorkoutScreen = () => {
  const [exercise, setExercise] = useState<ExerciseType>('PULLUPS');
  const { count, isActive, startTracking, stopTracking, data } = useFitnessTracking(exercise);

  const exercises: { type: ExerciseType; label: string; icon: any; color: string }[] = [
    { type: 'PULLUPS', label: 'Pullups', icon: Flame, color: COLORS.secondary },
    { type: 'PUSHUPS', label: 'Pushups', icon: Swords, color: COLORS.accent },
    { type: 'RUNNING', label: 'Running', icon: Zap, color: COLORS.primary },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, COLORS.surface]}
        style={styles.background}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Training Zone</Text>
        <Text style={styles.subtitle}>Convert sweat into power</Text>

        <View style={styles.exerciseSelector}>
          {exercises.map((ex) => (
            <TouchableOpacity
              key={ex.type}
              onPress={() => !isActive && setExercise(ex.type)}
              style={[
                styles.exButton,
                exercise === ex.type && { borderColor: ex.color, backgroundColor: 'rgba(255,255,255,0.05)' }
              ]}
              disabled={isActive}
            >
              <ex.icon size={24} color={exercise === ex.type ? ex.color : COLORS.textSecondary} />
              <Text 
                style={[
                  styles.exLabel, 
                  { color: exercise === ex.type ? ex.color : COLORS.textSecondary }
                ]}
              >
                {ex.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.mainTracker}>
          <MotiView
            from={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={exercise}
            style={styles.counterCircle}
          >
            <LinearGradient
              colors={isActive ? [COLORS.primary, COLORS.accent] : [COLORS.surfaceLighter, COLORS.surface]}
              style={styles.circleGradient}
            >
              <Text style={styles.countText}>{count}</Text>
              <Text style={styles.countSubtext}>REPS</Text>
            </LinearGradient>
          </MotiView>
          
          {isActive && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.liveIndicator}
            >
              <Activity size={16} color={COLORS.primary} />
              <Text style={styles.liveText}>TRACKING ACTIVE</Text>
            </MotiView>
          )}
        </View>

        <GlassCard style={styles.sensorCard}>
          <Text style={styles.sensorTitle}>Sensor Feedback</Text>
          <View style={styles.sensorRow}>
            <Text style={styles.sensorData}>X: {data.x.toFixed(2)}</Text>
            <Text style={styles.sensorData}>Y: {data.y.toFixed(2)}</Text>
            <Text style={styles.sensorData}>Z: {data.z.toFixed(2)}</Text>
          </View>
        </GlassCard>

        <TouchableOpacity
          onPress={isActive ? stopTracking : startTracking}
          style={styles.actionButton}
        >
          <LinearGradient
            colors={isActive ? [COLORS.error, '#8B0000'] : [COLORS.primary, COLORS.accent]}
            style={styles.actionGradient}
          >
            {isActive ? (
              <>
                <Square size={24} color="white" fill="white" />
                <Text style={styles.actionText}>FINISH SESSION</Text>
              </>
            ) : (
              <>
                <Play size={24} color="white" fill="white" />
                <Text style={styles.actionText}>BEGIN TRAINING</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  subtitle: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: SPACING.xl,
  },
  exerciseSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.xxl,
  },
  exButton: {
    width: (width - SPACING.lg * 2 - SPACING.md * 2) / 3,
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  exLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
  mainTracker: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterCircle: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  countText: {
    color: COLORS.text,
    fontSize: 80,
    fontWeight: 'bold',
  },
  countSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '900',
    marginTop: -10,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
  },
  liveText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  sensorCard: {
    width: '100%',
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  sensorTitle: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  sensorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sensorData: {
    color: COLORS.text,
    fontSize: 12,
    fontFamily: 'System', // Use monospace if available
  },
  actionButton: {
    width: '100%',
    height: 60,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  actionGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: SPACING.md,
  },
});
