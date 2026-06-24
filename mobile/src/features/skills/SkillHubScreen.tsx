import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import { ChevronLeft, Zap, Flame, Shield, Swords, Info, ArrowUp } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, useAppTheme } from '../../styles/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { useUserStore } from '../../store/useUserStore';
import { SKILLS_DATA } from '../../constants/skills';

const { width } = Dimensions.get('window');

export const SkillHubScreen = () => {
  const navigation = useNavigation();
  const themeColors = useAppTheme() as any;
  const { stats, skillPoints, unlockedSkills, upgradeSkill, unlockSkill } = useUserStore();
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'ATTACK' | 'DEFENSE' | 'SPECIAL'>('ALL');

  const filteredSkills = SKILLS_DATA.filter(s => 
    activeCategory === 'ALL' || s.category.toUpperCase() === activeCategory
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <LinearGradient
        colors={[themeColors.background, themeColors.surface]}
        style={styles.background}
      />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color={themeColors.text} />
          </TouchableOpacity>
          <View style={[styles.spBadge, { borderColor: themeColors.primary }]}>
             <Text style={[styles.spValue, { color: themeColors.primary }]}>{skillPoints} SP</Text>
          </View>
        </View>
        
        <View style={styles.headerMain}>
          <View style={styles.systemBadge}>
            <View style={styles.pulseDot} />
            <Text style={[styles.systemStatus, { color: themeColors.primary }]}>MONARCH PROTOCOL</Text>
          </View>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>SKILL EVOLUTION</Text>
        </View>
      </View>

      <View style={styles.biometricHUD}>
        <View style={styles.bioItem}>
           <Text style={[styles.bioLabel, { color: themeColors.textSecondary }]}>MANA CAPACITY</Text>
           <View style={styles.bioValueRow}>
              <Zap size={14} color={themeColors.primary} />
              <Text style={[styles.bioValue, { color: themeColors.primary }]}>{stats.maxMana} MP</Text>
           </View>
        </View>
        <View style={styles.bioDivider} />
        <View style={styles.bioItem}>
           <Text style={[styles.bioLabel, { color: themeColors.textSecondary }]}>MASTERY RANK</Text>
           <View style={styles.bioValueRow}>
              <ArrowUp size={14} color={themeColors.secondary} />
              <Text style={[styles.bioValue, { color: themeColors.secondary }]}>LEVEL {stats.level}</Text>
           </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={{ paddingHorizontal: SPACING.md }}>
        {['ALL', 'ATTACK', 'DEFENSE', 'SPECIAL'].map((cat) => (
          <TouchableOpacity 
            key={cat} 
            onPress={() => setActiveCategory(cat as any)}
            style={[
              styles.catBtn, 
              activeCategory === cat && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
            ]}
          >
            <Text style={[styles.catBtnText, { color: activeCategory === cat ? '#000' : themeColors.textSecondary }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredSkills.map((skill, index) => {
          const level = unlockedSkills[skill.id] || 0;
          const isUnlocked = level > 0;
          const canAfford = skillPoints >= (isUnlocked ? 1 : skill.cost);
          
          return (
            <MotiView
              key={skill.id}
              from={{ opacity: 0, scale: 0.95, translateY: 10 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              transition={{ delay: index * 50 }}
            >
              <GlassCard style={[styles.skillCard, isUnlocked && { borderColor: `${skill.color}50` }]}>
                {!isUnlocked && <View style={styles.lockedOverlay} />}
                
                <View style={styles.skillMain}>
                  <View style={[styles.crystalContainer, { borderColor: isUnlocked ? skill.color : 'rgba(255,255,255,0.05)' }]}>
                    <LinearGradient
                      colors={isUnlocked ? [`${skill.color}30`, 'transparent'] : ['rgba(255,255,255,0.02)', 'transparent']}
                      style={styles.crystalGradient}
                    >
                      <skill.icon size={28} color={isUnlocked ? skill.color : 'rgba(255,255,255,0.1)'} />
                    </LinearGradient>
                  </View>

                  <View style={styles.skillInfo}>
                    <View style={styles.skillTitleRow}>
                      <Text style={[styles.skillName, { color: isUnlocked ? '#FFF' : 'rgba(255,255,255,0.3)' }]}>{skill.name}</Text>
                      {isUnlocked && (
                         <View style={[styles.lvlPill, { backgroundColor: `${skill.color}20` }]}>
                            <Text style={[styles.lvlText, { color: skill.color }]}>LV. {level}</Text>
                         </View>
                      )}
                    </View>
                    
                    <Text style={[styles.skillDesc, { color: isUnlocked ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }]} numberOfLines={2}>
                      {skill.description}
                    </Text>

                    <View style={styles.skillStats}>
                      <View style={styles.skillStatItem}>
                        <Zap size={10} color={themeColors.primary} />
                        <Text style={[styles.skillStatText, { color: themeColors.primary }]}>{skill.manaCost}MP</Text>
                      </View>
                      {isUnlocked && (
                        <View style={styles.skillStatItem}>
                          <Swords size={10} color={themeColors.secondary} />
                          <Text style={[styles.skillStatText, { color: themeColors.secondary }]}>PWR: {skill.baseDamage + (level * 5)}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Progress Mini Bar */}
                {isUnlocked && (
                   <View style={styles.skillMasteryBarBg}>
                      <MotiView 
                        animate={{ width: `${(level / 10) * 100}%` }}
                        style={[styles.skillMasteryBarFill, { backgroundColor: skill.color }]} 
                      />
                   </View>
                )}

                <View style={styles.skillActions}>
                   <TouchableOpacity 
                      style={[
                        styles.actionButton, 
                        { backgroundColor: isUnlocked ? 'rgba(255,255,255,0.05)' : themeColors.primary },
                        !canAfford && styles.disabledAction
                      ]}
                      onPress={() => isUnlocked ? upgradeSkill(skill.id) : unlockSkill(skill.id)}
                      disabled={!canAfford || (isUnlocked && level >= 10)}
                    >
                      <ArrowUp size={14} color={isUnlocked ? themeColors.primary : '#000'} />
                      <Text style={[styles.actionButtonText, { color: isUnlocked ? themeColors.primary : '#000' }]}>
                        {isUnlocked ? `UPGRADE` : `AWAKEN (${skill.cost} SP)`}
                      </Text>
                   </TouchableOpacity>
                </View>
              </GlassCard>
            </MotiView>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  spBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  spValue: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerMain: {
    marginBottom: SPACING.md,
  },
  systemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  systemStatus: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },
  biometricHUD: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: SPACING.md,
  },
  bioItem: {
    flex: 1,
    alignItems: 'center',
  },
  bioLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },
  bioValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bioValue: {
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 6,
  },
  bioDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  categoryScroll: {
    maxHeight: 40,
    marginVertical: SPACING.md,
  },
  catBtn: {
    paddingHorizontal: 16,
    height: 32,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catBtnText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 60,
  },
  skillCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 1,
  },
  skillMain: {
    flexDirection: 'row',
    zIndex: 2,
  },
  crystalContainer: {
    width: 60,
    height: 60,
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden',
  },
  crystalGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  skillTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  lvlPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  lvlText: {
    fontSize: 8,
    fontWeight: '900',
  },
  skillDesc: {
    fontSize: 11,
    lineHeight: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  skillStats: {
    flexDirection: 'row',
    gap: 12,
  },
  skillStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  skillStatText: {
    fontSize: 9,
    fontWeight: '900',
  },
  skillMasteryBarBg: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 1,
    marginTop: SPACING.md,
    overflow: 'hidden',
    zIndex: 2,
  },
  skillMasteryBarFill: {
    height: '100%',
  },
  skillActions: {
    marginTop: SPACING.md,
    zIndex: 2,
  },
  actionButton: {
    height: 36,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  disabledAction: {
    opacity: 0.3,
  },
  actionButtonText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
