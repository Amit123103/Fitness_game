import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import { 
  Flame, Zap, Shield, Swords, Lock, Check, ChevronRight, 
  User, Settings, Edit2, Camera, Save, X, Skull, Users 
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, useAppTheme } from '../../styles/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { ThreeDViewport } from '../../components/3d/ThreeDViewport';
import { useUserStore } from '../../store/useUserStore';
import { SKILLS_DATA } from '../../constants/skills';

const { width } = Dimensions.get('window');



export const CharacterScreen = () => {
  const navigation = useNavigation<any>();
  const themeColors = useAppTheme();
  const { 
    stats, coins, skillPoints, unlockedSkills, unlockSkill, upgradeSkill,
    name, profileImage, dailyQuest, updateProfile, updateQuestGoal,
    rank, currentTitle, titles, equipTitle, bio
  } = useUserStore();
  
  const [activeTab, setActiveTab ] = useState<'STATS' | 'SKILLS' | 'ARMY' | 'PROFILE'>('STATS');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [editedBio, setEditedBio] = useState(bio);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [showTitlePicker, setShowTitlePicker] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateProfile({ profileImage: result.assets[0].uri });
    }
  };

  const saveProfile = () => {
    updateProfile({ name: editedName, bio: editedBio });
    setIsEditing(false);
  };

  const StatProgress = ({ label, value, max, color, icon: Icon }: any) => (
    <View style={styles.statProgressContainer}>
      <View style={styles.statInfo}>
        <View style={styles.statLabelRow}>
          <Icon size={16} color={color} />
          <Text style={[styles.statLabelText, { color: themeColors.textSecondary }]}>{label}</Text>
        </View>
        <Text style={[styles.statValueText, { color }]}>{value}</Text>
      </View>
      <View style={styles.progressBg}>
        <MotiView
          from={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ type: 'timing', duration: 1000 }}
          style={[styles.progressFill, { backgroundColor: color }]}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <LinearGradient
        colors={[themeColors.background, themeColors.surface]}
        style={styles.background}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* 3D Character Viewport Section */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.header}
        >
          <ThreeDViewport level={stats.level} />
          <View style={styles.charIdentity}>
            {/* Rank Badge */}
            <MotiView 
              from={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={[styles.rankBadge, { borderColor: themeColors.primary, backgroundColor: themeColors.surface }]}
            >
              <Text style={[styles.rankText, { color: themeColors.primary }]}>{rank}</Text>
            </MotiView>

            <View style={styles.nameRow}>
              {isEditing ? (
                <TextInput
                  style={[styles.nameInput, { color: themeColors.primary, borderBottomColor: themeColors.primary }]}
                  value={editedName}
                  onChangeText={setEditedName}
                  autoFocus
                />
              ) : (
                <Text style={[styles.charName, { color: themeColors.text }]}>{name}</Text>
              )}
              <TouchableOpacity onPress={isEditing ? saveProfile : () => setIsEditing(true)}>
                {isEditing ? <Save size={20} color={themeColors.success} /> : <Edit2 size={20} color={themeColors.primary} />}
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.activeTitleText, { color: themeColors.textSecondary }]}>[ {currentTitle} ]</Text>

            {isEditing ? (
               <TextInput
                  style={[styles.bioInput, { color: themeColors.text }]}
                  value={editedBio}
                  onChangeText={setEditedBio}
                  placeholder="System Bio..."
                  placeholderTextColor={themeColors.textSecondary}
                  multiline
                />
            ) : (
                <Text style={[styles.charLevel, { color: themeColors.primary }]}>{rank}-RANK WARRIOR • LEVEL {stats.level}</Text>
            )}
          </View>
        </MotiView>

        {/* Tab Selection */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            onPress={() => setActiveTab('STATS')}
            style={[styles.tab, activeTab === 'STATS' && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === 'STATS' && styles.activeTabText]}>STATS</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('SKILLS')}
            style={[styles.tab, activeTab === 'SKILLS' && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === 'SKILLS' && styles.activeTabText]}>SKILLS</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('ARMY')}
            style={[styles.tab, activeTab === 'ARMY' && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === 'ARMY' && styles.activeTabText]}>ARMY</Text>
          </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab('PROFILE')}
              style={[
                styles.tab, 
                activeTab === 'PROFILE' && { backgroundColor: themeColors.surfaceLighter, borderColor: themeColors.primary, borderBottomWidth: 2 }
              ]}
            >
              <Text style={[
                styles.tabText, 
                { color: activeTab === 'PROFILE' ? themeColors.primary : themeColors.textSecondary }
              ]}>PROFILE</Text>
            </TouchableOpacity>
          </View>
  
          <AnimatePresence>
            {activeTab === 'STATS' ? (
              <MotiView
                key="stats"
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{ opacity: 0, translateX: 20 }}
                style={styles.tabContent}
              >
                <GlassCard style={styles.statsCard}>
                  <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Combat Prowess</Text>
                  <StatProgress label="STRENGTH" value={stats.strength} max={100} color={themeColors.secondary} icon={Flame} />
                  <StatProgress label="STAMINA" value={stats.stamina} max={100} color={themeColors.accent} icon={Swords} />
                  <StatProgress label="SPEED" value={stats.speed} max={100} color={themeColors.primary} icon={Zap} />
                  <StatProgress label="DEFENSE" value={stats.defense} max={100} color={themeColors.success} icon={Shield} />
                  <StatProgress label="MANA" value={stats.mana} max={stats.maxMana} color={themeColors.info || '#00C2FF'} icon={Zap} />
                </GlassCard>
  
                <View style={styles.secondaryStatsRow}>
                  <GlassCard style={styles.smallCard}>
                    <Text style={[styles.smallLabel, { color: themeColors.textSecondary }]}>COINS</Text>
                    <Text style={[styles.smallValue, { color: themeColors.warning }]}>{coins}</Text>
                  </GlassCard>
                  <GlassCard style={styles.smallCard}>
                    <Text style={[styles.smallLabel, { color: themeColors.textSecondary }]}>XP GAIN</Text>
                    <Text style={[styles.smallValue, { color: themeColors.primary }]}>+15%</Text>
                  </GlassCard>
                  <GlassCard style={styles.smallCard}>
                    <Text style={[styles.smallLabel, { color: themeColors.textSecondary }]}>ARMY SIZE</Text>
                    <Text style={[styles.smallValue, { color: '#A020F0' }]}>{useUserStore.getState().shadowArmy.length}</Text>
                  </GlassCard>
                </View>
  
                {/* System Details Navigation */}
                <TouchableOpacity 
                  style={[styles.settingsNavBtn, { borderColor: themeColors.glassBorder }]}
                  onPress={() => navigation.navigate('AdvancedSettings')}
                >
                  <LinearGradient
                    colors={[`${themeColors.primary}15`, `${themeColors.accent}15`]}
                    style={styles.settingsNavGradient}
                  >
                    <View style={styles.settingsNavContent}>
                      <Settings size={24} color={themeColors.primary} />
                      <View style={styles.settingsNavTextWrapper}>
                        <Text style={[styles.settingsNavTitle, { color: themeColors.text }]}>SYSTEM CONFIGURATION</Text>
                        <Text style={[styles.settingsNavDesc, { color: themeColors.textSecondary }]}>Haptics, Displays, and Core Flux</Text>
                      </View>
                    </View>
                    <ChevronRight size={20} color={themeColors.primary} />
                  </LinearGradient>
                </TouchableOpacity>
              </MotiView>
            ) : activeTab === 'ARMY' ? (
              <MotiView
                key="army"
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{ opacity: 0, translateX: 20 }}
                style={styles.tabContent}
              >
                 <GlassCard style={[styles.armyIntroCard, { borderColor: '#A020F0' }]}>
                    <Skull size={32} color="#A020F0" style={{ marginBottom: 12 }} />
                    <Text style={[styles.sectionTitle, { color: '#FFF' }]}>The Shadow Sovereign</Text>
                    <Text style={[styles.armyDesc, { color: themeColors.textSecondary }]}>
                      Command the souls of the defeated. Your shadows provide mystical support on the battlefield, dealing extra damage and shielding you from harm.
                    </Text>
                    
                    <View style={styles.armyStats}>
                       <View style={styles.armyStatItem}>
                          <Text style={styles.armyStatLabel}>TOTAL SHADOWS</Text>
                          <Text style={[styles.armyStatValue, { color: '#A020F0' }]}>{useUserStore.getState().shadowArmy.length}</Text>
                       </View>
                       <View style={styles.armyStatItem}>
                          <Text style={styles.armyStatLabel}>MASTERY LEVEL</Text>
                          <Text style={[styles.armyStatValue, { color: themeColors.primary }]}>Sovereign</Text>
                       </View>
                    </View>

                    <TouchableOpacity 
                      style={[styles.advancedHubBtn, { borderColor: '#A020F0', marginTop: 20 }]}
                      onPress={() => navigation.navigate('ShadowArmy')}
                    >
                      <LinearGradient
                        colors={['rgba(160, 32, 240, 0.2)', 'rgba(0,0,0,0.4)']}
                        style={styles.advancedHubGradient}
                      >
                         <Users size={20} color="#A020F0" />
                         <Text style={[styles.advancedHubText, { color: '#FFF' }]}>OPEN SOVEREIGN COMMAND</Text>
                         <ChevronRight size={18} color="#A020F0" />
                      </LinearGradient>
                    </TouchableOpacity>
                 </GlassCard>
              </MotiView>
            ) : activeTab === 'SKILLS' ? (
              <MotiView
                key="skills"
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{ opacity: 0, translateX: 20 }}
                style={styles.tabContent}
              >
                <View style={styles.skillHeader}>
                  <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Skill Progression</Text>
                  <GlassCard style={[styles.pointsBadge, { borderColor: themeColors.primary }]}>
                    <Text style={[styles.pointsValue, { color: themeColors.primary }]}>{skillPoints} SP</Text>
                  </GlassCard>
                </View>
  
                {SKILLS_DATA.map((skill, index) => {
                  const skillLevel = unlockedSkills[skill.id] || 0;
                  const isUnlocked = skillLevel > 0;
                  const canAfford = skillPoints >= skill.cost;
                  const Icon = skill.icon;
  
                  return (
                    <GlassCard key={skill.id} style={[styles.skillCard, isUnlocked && { borderColor: skill.color }]}>
                      <View style={styles.skillMain}>
                        <View style={[styles.skillIconContainer, { backgroundColor: `${skill.color}15` }]}>
                          <Icon size={24} color={isUnlocked || canAfford ? skill.color : themeColors.textSecondary} />
                        </View>
                        <View style={styles.skillInfo}>
                          <View style={styles.skillHeaderRow}>
                            <Text style={[styles.skillName, { color: themeColors.text }]}>{skill.name}</Text>
                            {isUnlocked && <Text style={[styles.skillLevelTag, { color: skill.color }]}>LVL {skillLevel}</Text>}
                          </View>
                          <Text style={[styles.skillDesc, { color: themeColors.textSecondary }]} numberOfLines={1}>{skill.description}</Text>
                          <Text style={[styles.manaCostText, { color: themeColors.primary }]}>{skill.manaCost} MP</Text>
                        </View>
                        <TouchableOpacity 
                          onPress={() => isUnlocked ? upgradeSkill(skill.id) : unlockSkill(skill.id)}
                          disabled={(!isUnlocked && !canAfford) || (isUnlocked && skillLevel >= 10)}
                          style={[
                            styles.skillAction,
                            isUnlocked && { backgroundColor: `${themeColors.success}20`, borderColor: themeColors.success },
                            !isUnlocked && !canAfford && { opacity: 0.5 }
                          ]}
                        >
                          {isUnlocked ? <Zap size={18} color={themeColors.primary} /> : <Lock size={18} color={canAfford ? themeColors.primary : themeColors.textSecondary} />}
                        </TouchableOpacity>
                      </View>
                    </GlassCard>
                  );
                })}

                <TouchableOpacity 
                  style={[styles.advancedHubBtn, { borderColor: themeColors.primary }]}
                  onPress={() => navigation.navigate('SkillHub')}
                >
                  <LinearGradient
                    colors={[`${themeColors.primary}20`, `${themeColors.accent}20`]}
                    style={styles.advancedHubGradient}
                  >
                    <Swords size={20} color={themeColors.primary} />
                    <Text style={[styles.advancedHubText, { color: themeColors.text }]}>OPEN MONARCH SKILL HUB</Text>
                    <ChevronRight size={18} color={themeColors.primary} />
                  </LinearGradient>
                </TouchableOpacity>
              </MotiView>
            ) : (
              <MotiView
                key="profile"
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{ opacity: 0, translateX: 20 }}
                style={styles.tabContent}
              >
                <GlassCard style={styles.bioCard}>
                  <Text style={[styles.bioLabel, { color: themeColors.primary }]}>WARRIOR BIO</Text>
                  <Text style={[styles.bioText, { color: themeColors.text }]}>{bio}</Text>
                </GlassCard>
  
                {/* Profile Photo Section */}
                <GlassCard style={styles.profilePhotoCard}>
                  <View style={[styles.photoContainer, { borderColor: themeColors.primary }]}>
                    {profileImage ? (
                      <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <User size={40} color={themeColors.textSecondary} />
                      </View>
                    )}
                    <TouchableOpacity style={[styles.cameraBtn, { backgroundColor: themeColors.primary }]} onPress={pickImage}>
                      <Camera size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.photoLabel, { color: themeColors.textSecondary }]}>AWAKENED WARRIOR AVATAR</Text>
                </GlassCard>
  
                {/* Title Selector */}
                <GlassCard style={styles.titlesCard}>
                   <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Identity Titles</Text>
                    <TouchableOpacity onPress={() => setShowTitlePicker(!showTitlePicker)}>
                       <ChevronRight size={18} color={themeColors.primary} style={{ transform: [{ rotate: showTitlePicker ? '90deg' : '0deg' }] }} />
                    </TouchableOpacity>
                  </View>
                  
                  {showTitlePicker ? (
                    <View style={styles.titlePickerList}>
                      {titles.map(t => (
                        <TouchableOpacity 
                          key={t} 
                          style={[
                            styles.titleOption, 
                            currentTitle === t && { backgroundColor: `${themeColors.primary}10`, borderRadius: 4 }
                          ]}
                          onPress={() => equipTitle(t)}
                        >
                          <Text style={[styles.titleOptionText, { color: themeColors.textSecondary }, currentTitle === t && { color: themeColors.primary }]}>
                            {t}
                          </Text>
                          {currentTitle === t && <Check size={14} color={themeColors.primary} />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <Text style={[styles.currentTitleSubtext, { color: themeColors.textSecondary }]}>Selected: {currentTitle}</Text>
                  )}
                </GlassCard>
  
                {/* Quest Goal Customization */}
                <GlassCard style={styles.goalsCard}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>System Quests</Text>
                    <TouchableOpacity onPress={() => setIsEditingGoals(!isEditingGoals)}>
                       {isEditingGoals ? <Check size={18} color={themeColors.success} /> : <Settings size={18} color={themeColors.primary} />}
                    </TouchableOpacity>
                  </View>
                  
                  <GoalEditorItem 
                    label="Daily Pushups" 
                    value={dailyQuest.pushups.goal} 
                    onChange={(v: number) => updateQuestGoal('pushups', v)} 
                    isEditing={isEditingGoals}
                    accent={themeColors.primary}
                    text={themeColors.text}
                    secondaryText={themeColors.textSecondary}
                  />
                  <GoalEditorItem 
                    label="Daily Pullups" 
                    value={dailyQuest.pullups.goal} 
                    onChange={(v: number) => updateQuestGoal('pullups', v)} 
                    isEditing={isEditingGoals}
                    accent={themeColors.primary}
                    text={themeColors.text}
                    secondaryText={themeColors.textSecondary}
                  />
                  <GoalEditorItem 
                    label="Daily Running" 
                    value={dailyQuest.running.goal} 
                    onChange={(v: number) => updateQuestGoal('running', v)} 
                    isEditing={isEditingGoals}
                    accent={themeColors.primary}
                    text={themeColors.text}
                    secondaryText={themeColors.textSecondary}
                  />
                </GlassCard>
              </MotiView>
            )}
          </AnimatePresence>
      </ScrollView>
    </SafeAreaView>
  );
};

const GoalEditorItem = ({ label, value, onChange, isEditing, accent, text, secondaryText }: any) => (
  <View style={[styles.goalItem, { borderBottomColor: 'rgba(255,255,255,0.05)' }]}>
    <Text style={[styles.goalLabel, { color: secondaryText }]}>{label}</Text>
    {isEditing ? (
      <TextInput
        style={[styles.goalInput, { backgroundColor: 'rgba(255,255,255,0.05)', color: text }]}
        value={value.toString()}
        onChangeText={(v) => onChange(parseInt(v) || 0)}
        keyboardType="numeric"
      />
    ) : (
      <Text style={[styles.goalValue, { color: accent }]}>{value}</Text>
    )}
  </View>
);

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
  scroll: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  charIdentity: {
    marginTop: -40,
    alignItems: 'center',
    width: '100%',
  },
  rankBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 8,
    ...SHADOWS.neonPrimary,
  },
  rankText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  charName: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginRight: 10,
  },
  activeTitleText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  nameInput: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    padding: 0,
    marginRight: 10,
    minWidth: 150,
    textAlign: 'center',
  },
  bioInput: {
    color: COLORS.text,
    fontSize: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    width: '90%',
    textAlign: 'center',
    minHeight: 60,
  },
  charLevel: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 8,
    letterSpacing: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  activeTab: {
    backgroundColor: COLORS.surfaceLighter,
    ...SHADOWS.neonPrimary,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  tabContent: {
    flex: 1,
  },
  bioCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  bioLabel: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  bioText: {
    color: '#FFF',
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  statsCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statProgressContainer: {
    marginBottom: SPACING.lg,
  },
  statInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabelText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statValueText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  secondaryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallCard: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    padding: SPACING.md,
    alignItems: 'center',
  },
  smallLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  smallValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  pointsBadge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  pointsValue: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  skillCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  skillMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  skillInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  skillName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skillDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  skillHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  skillLevelTag: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  manaCostText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
  },
  skillAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  skillUnlocked: {
    backgroundColor: 'rgba(0, 255, 65, 0.1)',
    borderColor: COLORS.success,
  },
  skillLocked: {
    opacity: 0.5,
  },
  titlesCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  titlePickerList: {
    marginTop: 8,
  },
  titleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  activeTitleOption: {
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  titleOptionText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  currentTitleSubtext: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  profilePhotoCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    position: 'relative',
    ...SHADOWS.neonPrimary,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  photoLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  goalsCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  goalLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  goalValue: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    textAlign: 'right',
    minWidth: 60,
  },
  armyIntroCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
  },
  armyDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  armyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  armyStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  armyStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  armyStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  advancedHubBtn: {
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.neonPrimary,
  },
  advancedHubGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  advancedHubText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  settingsNavBtn: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  settingsNavGradient: {
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsNavContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsNavTextWrapper: {
    marginLeft: SPACING.md,
  },
  settingsNavTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  settingsNavDesc: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
});
