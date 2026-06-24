import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Vibration } from 'react-native';
import { BlurView } from 'expo-blur';
import { MotiView, AnimatePresence } from 'moti';
import { AlertCircle, ChevronRight, Zap, Skull } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../styles/theme';
import { useUserStore } from '../../store/useUserStore';
import { PenaltyOverlay } from './PenaltyOverlay';
import { useSystemAlarm } from '../../hooks/useSystemAlarm';

const { width, height } = Dimensions.get('window');

export const SystemQuestModal = () => {
  const { dailyQuest, questCompleted, isPenaltyActive, resetQuest, triggerPenalty } = useUserStore();
  const [visible, setVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600 * 24); // 24 hours in seconds

  useEffect(() => {
    // Show quest modal if not completed today
    const today = new Date().toDateString();
    const lastDate = useUserStore.getState().lastQuestDate;
    
    if (lastDate !== today && !visible) {
      setVisible(true);
      // Trigger penalty if quest was missed (simulated check)
      if (lastDate && lastDate !== today && !questCompleted) {
        triggerPenalty();
      }
    }
  }, []);

  const startAlarm = async () => {
    // Vibrate to simulate "irritating alarm"
    Vibration.vibrate([500, 500, 500], true);
    // In a real app, we would play a loud 'System Alert' sound here
  };

  const stopAlarm = () => {
    Vibration.cancel();
  };

  const handleAccept = () => {
    stopAlarm();
    setVisible(false);
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={{ flex: 1 }}>
        {!isPenaltyActive ? (
          <BlurView intensity={80} style={styles.container}>
            <MotiView
              from={{ opacity: 0, scale: 0.8, translateY: 50 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              style={styles.modalContent}
            >
              <LinearGradient
                colors={['#1E2130', '#0A0B10']}
                style={styles.gradient}
              >
                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.emergencyGlow} />
                  <AlertCircle size={32} color={COLORS.error} />
                  <MotiView
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ loop: true, duration: 1000 }}
                  >
                    <Text style={styles.warningText}>[ SYSTEM WARNING ]</Text>
                  </MotiView>
                </View>

                {/* Notification Title */}
                <Text style={styles.title}>Quest: Prepare to become strong</Text>
                <Text style={styles.subtitle}>Daily Quest: The Preparation of the Weak</Text>

                {/* Quest Details */}
                <View style={styles.questList}>
                  <QuestItem label="Pushups" target={dailyQuest.pushups.goal} />
                  <QuestItem label="Pullups" target={dailyQuest.pullups.goal} />
                  <QuestItem label="Running" target={`${dailyQuest.running.goal / 1000}km`} />
                </View>

                {/* Penalty Warning */}
                <View style={styles.penaltyContainer}>
                  <Skull size={16} color={COLORS.textSecondary} />
                  <Text style={styles.penaltyText}>
                    Warning: Failure to complete this daily quest will result in a Penalty.
                  </Text>
                </View>

                {/* Action Buttons */}
                <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.btnGradient}
                  >
                    <Text style={styles.btnText}>ACCEPT</Text>
                    <ChevronRight size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>

              </LinearGradient>
            </MotiView>
          </BlurView>
        ) : (
          <PenaltyOverlay visible={isPenaltyActive} onClose={() => resetQuest()} />
        )}
      </View>
    </Modal>
  );
};

const QuestItem = ({ label, target }: { label: string; target: string | number }) => (
  <View style={styles.questItem}>
    <Zap size={16} color={COLORS.primary} />
    <Text style={styles.questLabel}>{label}</Text>
    <View style={styles.dots} />
    <Text style={styles.questTarget}>{target}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 85, 0.3)',
    ...SHADOWS.neonSecondary,
  },
  gradient: {
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  emergencyGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: COLORS.error,
    borderRadius: 30,
    opacity: 0.2,
  },
  warningText: {
    color: COLORS.error,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: SPACING.md,
    letterSpacing: 2,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.primary,
    fontSize: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xxl,
  },
  questList: {
    marginBottom: SPACING.xxl,
  },
  questItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  questLabel: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: SPACING.md,
  },
  dots: {
    flex: 1,
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: SPACING.md,
    borderStyle: 'dashed',
  },
  questTarget: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  penaltyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
  },
  penaltyText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  acceptButton: {
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.neonPrimary,
  },
  btnGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginRight: SPACING.sm,
  },
});
