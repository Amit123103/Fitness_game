import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText } from 'moti';
import { Swords, Flame, Zap, Shield, Trophy, Activity, Target, ChevronRight, Skull, Star, ZapOff, Info } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, useAppTheme } from '../../styles/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { useUserStore } from '../../store/useUserStore';
import { SystemQuestModal } from '../../components/ui/SystemQuestModal';

const { width } = Dimensions.get('window');

export const DashboardScreen = () => {
  const themeColors = useAppTheme() as any;
  const { stats, coins, dailyQuest, questCompleted, isPenaltyActive, name, profileImage, shadowArmy, rank, currentTitle } = useUserStore();
  const navigation = useNavigation<any>();

  const ResourceBar = ({ label, current, max, color, icon: Icon, isMana }: any) => (
    <View style={styles.resourceContainer}>
      <View style={styles.resourceHeader}>
        <View style={styles.resourceLabelRow}>
          <Icon size={12} color={color} style={{ marginRight: 4 }} />
          <Text style={[styles.resourceLabel, { color: themeColors.textSecondary }]}>{label}</Text>
        </View>
        <Text style={[styles.resourceValue, { color: themeColors.text }]}>
          {current} / {max}
        </Text>
      </View>
      <View style={[styles.resourceBarBg, { backgroundColor: `${color}10` }]}>
        <MotiView
          animate={{ 
            width: `${Math.min((current/max)*100, 100)}%`,
            shadowOpacity: isMana ? [0.3, 0.6, 0.3] : 0.3
          }}
          transition={{ 
            type: 'timing', 
            duration: 1000,
            shadowOpacity: isMana ? { loop: true, duration: 2000 } : undefined
          }}
          style={[
            styles.resourceBarFill, 
            { backgroundColor: color },
            isMana && { shadowColor: color, shadowRadius: 5, shadowOffset: { width: 0, height: 0 } }
          ]}
        />
      </View>
    </View>
  );

  const QuestProgressItem = ({ label, current, goal, color, icon: Icon, type }: any) => (
    <TouchableOpacity 
      style={[styles.questProgressItem, { borderBottomColor: themeColors.glassBorder }]}
      onPress={() => navigation.navigate('QuestVision', { exerciseType: type })}
    >
      <View style={[styles.questIconContainer, { backgroundColor: `${color}15` }]}>
        <Icon size={18} color={color} />
      </View>
      <View style={styles.questDetails}>
        <View style={styles.questHeader}>
          <Text style={[styles.questLabel, { color: themeColors.textSecondary }]}>{label}</Text>
          <Text style={[styles.questValue, { color: themeColors.text }]}>{current} / {goal}</Text>
        </View>
        <View style={styles.progressBarBg}>
          <MotiView 
            animate={{ width: `${Math.min((current/goal)*100, 100)}%` }}
            transition={{ type: 'timing', duration: 1000 }}
            style={[styles.progressBarFill, { backgroundColor: color }]} 
          />
        </View>
      </View>
      <ChevronRight size={16} color={themeColors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <SystemQuestModal />
      
      <LinearGradient
        colors={[themeColors.background, themeColors.surface]}
        style={styles.background}
      />

      {/* Scanline Overlay Effect */}
      <View style={styles.scanlineOverlay} pointerEvents="none" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* System Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.header}
        >
          <View style={styles.headerMain}>
            <View style={styles.titleInfo}>
              <View style={[styles.systemBadge, { backgroundColor: 'rgba(255, 255, 255, 0.03)' }]}>
                <View style={styles.pulseDot} />
                <Text style={[styles.systemStatus, { color: themeColors.primary }]}>STATUS: ACTIVE</Text>
              </View>
              <Text style={[styles.rankBadge, { color: themeColors.primary, borderColor: themeColors.primary }]}>
                RANK {useUserStore.getState().rank}
              </Text>
            </View>
            
            <View style={styles.userProfileRow}>
              <View>
                <MotiText 
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 300 }}
                  style={[styles.titleText, { color: themeColors.textSecondary }]}
                >
                  {useUserStore.getState().currentTitle}
                </MotiText>
                <Text style={[styles.nameText, { color: themeColors.text }]}>{name.toUpperCase()}</Text>
              </View>
              
              <TouchableOpacity 
                onPress={() => navigation.navigate('Character')}
                style={styles.profileBtn}
              >
                {profileImage ? (
                  <View style={styles.profileContainer}>
                    <Image source={{ uri: profileImage }} style={styles.profileThumb} />
                    <View style={styles.levelIndicator}>
                      <Text style={styles.levelText}>{stats.level}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.fallbackAvatar}>
                    <Text style={[styles.levelTextLarge, { color: themeColors.primary }]}>{stats.level}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </MotiView>

        {/* Resources Section */}
        <View style={styles.resourcesSection}>
          <ResourceBar 
            label="EXP" 
            current={stats.xp} 
            max={stats.level * 1000} 
            color={(themeColors as any).xp || '#FFD700'} 
            icon={Star} 
          />
          <ResourceBar 
            label="MP" 
            current={stats.mana} 
            max={stats.maxMana} 
            color={(themeColors as any).mana || themeColors.primary} 
            icon={Zap} 
            isMana
          />
        </View>

        {/* Currency Row */}
        <View style={styles.currencyRow}>
          <View style={styles.coinBadge}>
            <Trophy size={14} color={themeColors.warning} />
            <Text style={[styles.coinText, { color: themeColors.text }]}>{coins}</Text>
          </View>
          <TouchableOpacity style={styles.inventoryBtn}>
            <Text style={[styles.inventoryBtnText, { color: themeColors.primary }]}>EQUIPMENT</Text>
          </TouchableOpacity>
        </View>

        {/* Quest Section */}
        <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>[ DAILY QUEST ]</Text>
        <GlassCard style={styles.questCard}>
          {isPenaltyActive ? (
            <View style={styles.penaltyState}>
              <Skull size={32} color={themeColors.error} />
              <Text style={styles.penaltyTitle}>PENALTY ACTIVE</Text>
              <Text style={[styles.penaltyDesc, { color: themeColors.textSecondary }]}>Survival quest initialized. Coins deducted.</Text>
            </View>
          ) : (
            <>
              <View style={styles.questHeaderMain}>
                <Text style={[styles.questMainTitle, { color: themeColors.text }]}>The Preparation of the Weak</Text>
                <View style={[styles.statusTag, questCompleted && styles.completedTag]}>
                  <Text style={styles.statusTagText}>{questCompleted ? 'COMPLETED' : 'IN PROGRESS'}</Text>
                </View>
              </View>
              
              <QuestProgressItem 
                label="Daily Pushups" 
                current={dailyQuest.pushups.current} 
                goal={dailyQuest.pushups.goal} 
                color={themeColors.secondary} 
                icon={Flame}
                type="PUSHUPS"
              />
              <QuestProgressItem 
                label="Daily Pullups" 
                current={dailyQuest.pullups.current} 
                goal={dailyQuest.pullups.goal} 
                color={themeColors.accent} 
                icon={Swords}
                type="PULLUPS"
              />
              <QuestProgressItem 
                label="Running (meters)" 
                current={dailyQuest.running.current} 
                goal={dailyQuest.running.goal} 
                color={themeColors.primary} 
                icon={Target}
                type="RUNNING"
              />
            </>
          )}
        </GlassCard>

        {/* Combat Stats */}
        <View style={styles.statsHeaderSection}>
          <Text style={styles.sectionTitle}>[ ABILITIES ]</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Character')}>
            <Text style={styles.viewMoreText}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <AbilityItem label="STR" value={stats.strength} color={themeColors.secondary} icon={Flame} />
          <AbilityItem label="SPD" value={stats.speed} color={themeColors.primary} icon={Zap} />
          <AbilityItem label="STM" value={stats.stamina} color={themeColors.accent} icon={Activity} />
          <AbilityItem label="DEF" value={stats.defense} color={themeColors.success} icon={Shield} />
        </View>

        {/* Shadow Army Preview */}
        {shadowArmy.length > 0 && (
          <View style={styles.shadowArmySection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>[ SHADOW ARMY ]</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ShadowArmy')}>
                <Text style={styles.viewMoreText}>MANAGE</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shadowList}>
              {shadowArmy.map((shadow) => (
                <TouchableOpacity 
                  key={shadow.id} 
                  style={[styles.shadowItem, { borderColor: themeColors.glassBorder }]}
                  onPress={() => navigation.navigate('ShadowDetails', { shadowId: shadow.id })}
                >
                  <LinearGradient
                    colors={['rgba(160, 32, 240, 0.1)', 'rgba(0, 0, 0, 0.4)']}
                    style={styles.shadowGradient}
                  >
                    <Image source={{ uri: shadow.icon }} style={styles.shadowIcon} />
                    <View style={styles.shadowInfo}>
                      <Text style={styles.shadowName} numberOfLines={1}>{shadow.name}</Text>
                      <Text style={[styles.shadowRank, { color: themeColors.accent }]}>{shadow.rank}-RANK</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent System Alerts Log */}
        <View style={styles.systemLogSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>[ RECENT SYSTEM ALERTS ]</Text>
          <GlassCard style={styles.logCard}>
            <View style={styles.logEntry}>
              <Info size={14} color={themeColors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.logText}>Daily Quest: Physical Preparation initialized.</Text>
            </View>
            {questCompleted && (
              <View style={styles.logEntry}>
                <Trophy size={14} color={themeColors.warning} style={{ marginRight: 8 }} />
                <Text style={styles.logText}>Quest reward: +200 Gold, +500 EXP obtained.</Text>
              </View>
            )}
            <View style={styles.logEntry}>
              <Activity size={14} color={themeColors.secondary} style={{ marginRight: 8 }} />
              <Text style={styles.logText}>Health status: STABLE. Ready for combat.</Text>
            </View>
          </GlassCard>
        </View>

        {/* AI Vision CTA */}
        <TouchableOpacity 
          style={styles.visionButton}
          onPress={() => navigation.navigate('QuestVision', { exerciseType: 'PUSHUPS' })}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.visionGradient}
          >
            <Target size={24} color="white" />
            <Text style={styles.visionText}>INITIALIZE AI VISION TRACKING</Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const AbilityItem = ({ label, value, color, icon: Icon }: any) => (
  <View style={[styles.abilityBox, { borderColor: `${color}30` }]}>
    <View style={[styles.abilityIconCircle, { backgroundColor: `${color}10` }]}>
      <Icon size={12} color={color} />
    </View>
    <Text style={[styles.abilityLabel, { color }]}>{label}</Text>
    <Text style={styles.abilityValue}>{value}</Text>
    <View style={[styles.abilityIndicator, { backgroundColor: color }]} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  scanlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 10,
    opacity: 0.03,
    // Note: In a real app we might use a repeating gradient or image
    borderBottomWidth: 1,
    borderBottomColor: '#FFF',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: SPACING.lg,
    marginTop: SPACING.md,
  },
  headerMain: {
    width: '100%',
  },
  titleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  systemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },
  systemStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  rankBadge: {
    fontSize: 12,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderRadius: 2,
    letterSpacing: 1,
  },
  userProfileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  nameText: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },
  profileBtn: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'visible',
  },
  profileContainer: {
    position: 'relative',
  },
  profileThumb: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  levelIndicator: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  levelText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
  },
  fallbackAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  levelTextLarge: {
    fontSize: 24,
    fontWeight: '900',
  },
  resourcesSection: {
    marginBottom: SPACING.lg,
  },
  resourceContainer: {
    marginBottom: SPACING.md,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  resourceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  resourceValue: {
    fontSize: 10,
    fontWeight: '600',
  },
  resourceBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  resourceBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 204, 0, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 204, 0, 0.2)',
  },
  coinText: {
    marginLeft: 8,
    fontWeight: '900',
    fontSize: 12,
  },
  inventoryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  inventoryBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    marginBottom: SPACING.md,
    letterSpacing: 2,
  },
  questCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    backgroundColor: 'rgba(0, 240, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  questHeaderMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  questMainTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  statusTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,
  },
  completedTag: {
    backgroundColor: 'rgba(0, 255, 65, 0.1)',
    borderColor: 'rgba(0, 255, 65, 0.2)',
    borderWidth: 1,
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  questProgressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  questIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  questDetails: {
    flex: 1,
    marginRight: SPACING.md,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  questLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  questValue: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  abilityBox: {
    width: (width - SPACING.lg * 2 - SPACING.md * 3) / 4,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 4,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  abilityIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  abilityLabel: {
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: 1,
  },
  abilityValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  abilityIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.5,
  },
  shadowArmySection: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewMoreText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  shadowList: {
    paddingLeft: 2,
  },
  shadowItem: {
    width: 100,
    height: 120,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  shadowGradient: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadowIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  shadowInfo: {
    alignItems: 'center',
  },
  shadowName: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  shadowRank: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  systemLogSection: {
    marginBottom: SPACING.xl,
  },
  logCard: {
    padding: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  logEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    opacity: 0.8,
  },
  logText: {
    color: '#A0A0B0',
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  visionButton: {
    height: 56,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  visionGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  visionText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '900',
    marginLeft: SPACING.md,
    letterSpacing: 2,
  },
  penaltyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  penaltyTitle: {
    color: COLORS.error,
    fontSize: 20,
    fontWeight: '900',
    marginTop: SPACING.md,
    letterSpacing: 3,
  },
  penaltyDesc: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
});

