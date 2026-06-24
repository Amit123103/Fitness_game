import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Trophy, Users, Star, Flame, Zap, CheckCircle } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../styles/theme';
import { GlassCard } from '../../components/ui/GlassCard';

const { width } = Dimensions.get('window');

const LEADERBOARD_DATA = [
  { id: '1', name: 'Zane_Warrior', level: 45, reps: 1250, avatar: 'Z' },
  { id: '2', name: 'GymGod_99', level: 42, reps: 1100, avatar: 'G' },
  { id: '3', name: 'Slayer_X', level: 38, reps: 980, avatar: 'S' },
  { id: '4', name: 'FitnessKing', level: 35, reps: 850, avatar: 'F' },
  { id: '5', name: 'RisingSun', level: 30, reps: 720, avatar: 'R' },
];

const DAILY_CHALLENGES = [
  { id: '1', title: 'Dawn Squats', description: 'Complete 30 squats before 9 AM', reward: '50 Coins', done: true },
  { id: '2', title: 'Iron Lung', description: 'Run for 15 minutes without stopping', reward: '100 XP', done: false },
  { id: '3', title: 'Titan Pushups', description: 'Complete 50 pushups', reward: '1 Skill Point', done: false },
];

export const SocialScreen = () => {
  const [tab, setTab] = useState<'LEADERBOARD' | 'CHALLENGES'>('LEADERBOARD');

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, COLORS.surface]}
        style={styles.background}
      />

      <View style={styles.content}>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            onPress={() => setTab('LEADERBOARD')}
            style={[styles.tabButton, tab === 'LEADERBOARD' && styles.activeTab]}
          >
            <Trophy size={18} color={tab === 'LEADERBOARD' ? COLORS.primary : COLORS.textSecondary} />
            <Text style={[styles.tabText, tab === 'LEADERBOARD' && styles.activeTabText]}>RANKINGS</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setTab('CHALLENGES')}
            style={[styles.tabButton, tab === 'CHALLENGES' && styles.activeTab]}
          >
            <Star size={18} color={tab === 'CHALLENGES' ? COLORS.primary : COLORS.textSecondary} />
            <Text style={[styles.tabText, tab === 'CHALLENGES' && styles.activeTabText]}>CHALLENGES</Text>
          </TouchableOpacity>
        </View>

        {tab === 'LEADERBOARD' ? (
          <MotiView 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.listContainer}
          >
            <FlatList
              data={LEADERBOARD_DATA}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.scroll}
              renderItem={({ item, index }) => (
                <GlassCard style={styles.rankCard}>
                  <View style={styles.rankRow}>
                    <Text style={[styles.rankNumber, index < 3 && { color: COLORS.warning }]}>#{index + 1}</Text>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{item.avatar}</Text>
                    </View>
                    <View style={styles.rankInfo}>
                      <Text style={styles.rankName}>{item.name}</Text>
                      <Text style={styles.rankDetails}>Lvl {item.level} • {item.reps} Reps</Text>
                    </View>
                    {index === 0 && <Trophy size={24} color={COLORS.warning} />}
                  </View>
                </GlassCard>
              )}
            />
          </MotiView>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll}>
            {DAILY_CHALLENGES.map((challenge, index) => (
              <MotiView 
                key={challenge.id}
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 100 }}
              >
                <GlassCard style={[styles.challengeCard, challenge.done && styles.completedCard]}>
                  <View style={styles.challengeHeader}>
                    <View style={styles.challengeTitleGroup}>
                      {challenge.done ? (
                        <CheckCircle size={20} color={COLORS.success} />
                      ) : (
                        <Flame size={20} color={COLORS.primary} />
                      )}
                      <Text style={[styles.challengeTitle, challenge.done && styles.completedText]}>
                        {challenge.title}
                      </Text>
                    </View>
                    <View style={styles.rewardBadge}>
                      <Text style={styles.rewardText}>{challenge.reward}</Text>
                    </View>
                  </View>
                  <Text style={styles.challengeDesc}>{challenge.description}</Text>
                </GlassCard>
              </MotiView>
            ))}
          </ScrollView>
        )}
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
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
    marginBottom: SPACING.xl,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    borderRadius: BORDER_RADIUS.md,
  },
  activeTab: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
    letterSpacing: 1,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  listContainer: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 40,
  },
  rankCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankNumber: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    width: 30,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLighter,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: SPACING.md,
  },
  avatarText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  rankDetails: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  challengeCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  challengeTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: SPACING.md,
  },
  rewardBadge: {
    backgroundColor: 'rgba(255, 204, 0, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  rewardText: {
    color: COLORS.warning,
    fontSize: 10,
    fontWeight: 'bold',
  },
  challengeDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  completedCard: {
    opacity: 0.6,
    borderColor: COLORS.success,
  },
  completedText: {
    color: COLORS.success,
    textDecorationLine: 'line-through',
  },
});
