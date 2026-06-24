import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, FlatList, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import { Swords, Heart, Shield, Zap, AlertCircle, ChevronLeft, Award, Skull, Ghost, Users } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, useAppTheme } from '../../styles/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { useBattleStore } from '../../store/useBattleStore';
import { useUserStore, WarriorRank } from '../../store/useUserStore';
import { SKILLS_DATA } from '../../constants/skills';
import { SHADOW_TEMPLATES } from '../../constants/shadows';

const { width } = Dimensions.get('window');

const DiagnosticBar = ({ current, max, color, label, icon: Icon }: any) => {
  const percentage = Math.min(100, (current / max) * 100);
  return (
    <View style={styles.diagBarContainer}>
      <View style={styles.diagBarHeader}>
        <View style={styles.diagBarLeft}>
          <Icon size={12} color={color} />
          <Text style={[styles.diagBarLabel, { color }]}>{label}_STORAGE</Text>
        </View>
        <Text style={[styles.diagBarValue, { color }]}>{Math.round(current)} / {max}</Text>
      </View>
      <View style={styles.diagBarTrack}>
        <MotiView
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'timing', duration: 1000 }}
          style={[styles.diagBarFill, { backgroundColor: color }]}
        />
        <View style={[styles.diagBarMarker, { left: '30%' }]} />
        <View style={[styles.diagBarMarker, { left: '60%' }]} />
      </View>
    </View>
  );
};

const RankSelector = ({ onSelect }: { onSelect: (rank: WarriorRank) => void }) => {
  const themeColors = useAppTheme();
  const ranks: WarriorRank[] = ['E', 'D', 'C', 'B', 'A', 'S'];
  
  return (
    <MotiView 
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={styles.selectorContainer}
    >
      <Text style={[styles.selectorTitle, { color: themeColors.text }]}>SELECT ARENA RANK</Text>
      <View style={styles.rankGrid}>
        {ranks.map((r) => (
          <TouchableOpacity 
            key={r} 
            style={[styles.rankItem, { borderColor: themeColors.glassBorder, backgroundColor: themeColors.surface }]}
            onPress={() => onSelect(r)}
          >
            <Text style={[styles.rankItemText, { color: themeColors.primary }]}>{r}</Text>
            <Text style={[styles.rankSubtext, { color: themeColors.textSecondary }]}>RANK</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[styles.selectorHint, { color: themeColors.textSecondary }]}>Warning: Higher ranks contain lethal entities.</Text>
    </MotiView>
  );
};

export const BattleScreen = () => {
  const themeColors = useAppTheme();
  const { stats, unlockedSkills, shadowArmy, addXP, addCoins, extractShadow } = useUserStore();
  const { 
    player, enemy, initBattle, playerAttack, playerDefend, playerSkill, summonShadow, extractShadowAttempt,
    turn, isBattleOver, winner, battleLog, calculateRewards, resetBattle, currentRank, canExtract, summonedShadows
  } = useBattleStore();

  const [showSkills, setShowSkills] = useState(false);
  const [showSummons, setShowSummons] = useState(false);
  const [battleInitiated, setBattleInitiated] = useState(false);

  const handleStartBattle = (rank: WarriorRank) => {
    initBattle(stats, rank);
    setBattleInitiated(true);
  };

  const handleVictory = () => {
    const rewards = calculateRewards();
    addXP(rewards.xp);
    addCoins(rewards.coins);
    resetBattle();
    setBattleInitiated(false);
  };

  const handleDefeat = () => {
    resetBattle();
    setBattleInitiated(false);
  };

  const handleArise = () => {
    const success = extractShadowAttempt();
    if (success && enemy) {
      const template = SHADOW_TEMPLATES.find(t => t.enemyName === enemy.name);
      if (template) {
        extractShadow({
          id: `${template.shadowName}_${Date.now()}`,
          name: template.shadowName,
          rank: template.rank,
          level: 1,
          baseDamage: template.baseDamage,
          ability: template.ability,
          manaCost: template.manaCost,
          icon: template.icon
        });
      }
    }
  };

  if (!battleInitiated || !player || !enemy) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <RankSelector onSelect={handleStartBattle} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]}>
      <View style={styles.scanlineOverlay} />
      <View style={styles.battleHUD}>
        {/* Top Header */}
        <View style={styles.hudHeader}>
          <Text style={styles.hudStatus}>[ STATUS: COMBAT_ENGAGED ]</Text>
          <View style={styles.hudDivider} />
        </View>

        <View style={styles.content}>
          {/* Enemy Section */}
          <MotiView 
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.entityHUD}
          >
            <View style={styles.entityInfoRow}>
              <View style={styles.targetIndicator}>
                <View style={styles.targetCornerTL} />
                <View style={styles.targetCornerBR} />
                <Text style={styles.targetText}>TARGET ACQUIRED</Text>
              </View>
              <View style={styles.entityNameBox}>
                <Text style={styles.entityRank}>[{enemy?.rank}-RANK]</Text>
                <Text style={styles.entityName}>{enemy?.name}</Text>
              </View>
            </View>

            <View style={styles.artBox}>
               <MotiView
                animate={{ 
                  scale: turn === 'ENEMY' ? [1, 1.1, 1] : 1,
                  opacity: turn === 'ENEMY' ? [0.8, 1, 0.8] : 0.8
                }}
                transition={{ loop: true, type: 'timing', duration: 2000 }}
                style={[styles.artGlow, { backgroundColor: `${themeColors.secondary}20` }]}
               />
               <MotiView
                 animate={{ translateY: turn === 'ENEMY' ? [0, -10, 0] : 0 }}
                 transition={{ loop: true, type: 'timing', duration: 1500 }}
               >
                 <Skull size={100} color={themeColors.secondary} />
               </MotiView>
            </View>

            <DiagnosticBar current={enemy?.hp || 0} max={enemy?.maxHp || 100} color={themeColors.secondary} label="VITAL" icon={Heart} />
          </MotiView>

          {/* Player Section */}
          <MotiView 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.playerHUD}
          >
            <View style={styles.playerStatsGrid}>
               <DiagnosticBar current={player?.hp || 0} max={player?.maxHp || 100} color={themeColors.success} label="HEALTH" icon={Heart} />
               <DiagnosticBar current={player?.mana || 0} max={player?.maxMana || 100} color={themeColors.primary} label="MANA" icon={Zap} />
            </View>
            
            <View style={styles.playerAvatarRow}>
              <View style={styles.summonedUnits}>
                 {summonedShadows.map((s) => (
                   <MotiView 
                     key={s.id} 
                     from={{ opacity: 0, scale: 0 }} 
                     animate={{ opacity: 1, scale: 1 }}
                     style={styles.unitPill}
                   >
                     <LinearGradient colors={['#A020F0', 'transparent']} style={StyleSheet.absoluteFill} />
                     <Ghost size={10} color="white" />
                   </MotiView>
                 ))}
                 {summonedShadows.length === 0 && <Text style={styles.noUnitsText}>NO SHADOWS ACTIVE</Text>}
              </View>
              <View style={styles.playerBadge}>
                 <Text style={styles.playerRole}>MONARCH</Text>
                 <Shield size={32} color={themeColors.primary} />
              </View>
            </View>
          </MotiView>

        {/* Action Center */}
        <View style={styles.commandCenter}>
          <View style={styles.alertHeader}>
             <AlertCircle size={10} color={themeColors.textSecondary} />
             <Text style={styles.alertTitle}>SYSTEM_ALERTS</Text>
          </View>
          
          <ScrollView 
            style={styles.logContainer}
            ref={(ref) => ref?.scrollToEnd({ animated: true })}
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            {battleLog.map((log, i) => {
              const isPlayer = log.includes('Warrior') || log.includes('extracted');
              const isEnemy = enemy && log.includes(enemy.name);
              const isCritical = log.includes('extracted') || log.includes('KO');
              
              return (
                <View key={i} style={styles.logLine}>
                  <Text style={styles.logTime}>[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</Text>
                  <Text style={[
                      styles.logText, 
                      { color: isCritical ? themeColors.accent : isPlayer ? themeColors.primary : isEnemy ? themeColors.secondary : themeColors.textSecondary }
                    ]}>
                    {` > ${log.toUpperCase()}`}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.controls}>
            {canExtract ? (
               <TouchableOpacity 
                  style={[styles.ariseButton, { borderColor: '#A020F0' }]}
                  onPress={handleArise}
                >
                  <LinearGradient
                    colors={['#A020F0', '#000']}
                    style={styles.btnGradient}
                  >
                    <Skull size={24} color="white" />
                    <Text style={[styles.btnText, { fontSize: 24 }]}>ARISE.</Text>
                  </LinearGradient>
                </TouchableOpacity>
            ) : isBattleOver ? (
               <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={winner === 'PLAYER' ? handleVictory : handleDefeat}
                >
                  <LinearGradient
                    colors={winner === 'PLAYER' ? [themeColors.success, themeColors.primary] : [themeColors.secondary, '#000']}
                    style={styles.btnGradient}
                  >
                    <Award size={20} color="white" />
                    <Text style={styles.btnText}>{winner === 'PLAYER' ? 'CLAIM REWARDS' : 'RETURN TO HUB'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
            ) : showSkills ? (
               <View style={styles.skillsPalette}>
                 {SKILLS_DATA.filter(s => unlockedSkills[s.id]).length > 0 ? (
                   <FlatList
                    horizontal
                    data={SKILLS_DATA.filter(s => unlockedSkills[s.id])}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={[styles.crystalBtn, { borderColor: item.color }]}
                        onPress={() => {
                          playerSkill(item);
                          setShowSkills(false);
                        }}
                        disabled={player && player.mana < item.manaCost}
                      >
                        <item.icon size={20} color={player && player.mana >= item.manaCost ? item.color : '#555'} />
                        <View style={styles.crystalOverlay} />
                        <Text style={styles.crystalCost}>{item.manaCost}MP</Text>
                      </TouchableOpacity>
                    )}
                   />
                 ) : (
                   <Text style={{ color: themeColors.textSecondary, alignSelf: 'center' }}>No skills awakened...</Text>
                 )}
                 <TouchableOpacity onPress={() => setShowSkills(false)} style={styles.backBtn}>
                    <ChevronLeft size={20} color={themeColors.textSecondary} />
                 </TouchableOpacity>
               </View>
            ) : showSummons ? (
              <View style={styles.skillsPalette}>
                 {shadowArmy.length > 0 ? (
                    <FlatList
                     horizontal
                     data={shadowArmy}
                     keyExtractor={(item) => item.id}
                     renderItem={({ item }) => (
                       <TouchableOpacity 
                         style={[styles.crystalBtn, { borderColor: '#A020F0' }]}
                         onPress={() => {
                           summonShadow(item);
                           setShowSummons(false);
                         }}
                         disabled={player && (player.mana < item.manaCost || summonedShadows.some(s => s.id === item.id))}
                       >
                         <Ghost size={20} color={player && player.mana >= item.manaCost ? '#A020F0' : '#333'} />
                         <View style={styles.crystalOverlay} />
                         <Text style={styles.crystalCost}>{item.manaCost}MP</Text>
                       </TouchableOpacity>
                     )}
                    />
                 ) : (
                   <Text style={{ color: themeColors.textSecondary, alignSelf: 'center', flex: 1, textAlign: 'center' }}>No shadows in extraction manifest.</Text>
                 )}
                 <TouchableOpacity onPress={() => setShowSummons(false)} style={styles.backBtn}>
                    <ChevronLeft size={20} color={themeColors.textSecondary} />
                 </TouchableOpacity>
               </View>
            ) : (
              <View style={styles.actionRow}>
                <ActionBtn 
                  icon={Swords} 
                  label="ATTACK" 
                  color={themeColors.secondary} 
                  onPress={playerAttack} 
                  disabled={turn !== 'PLAYER'}
                />
                <ActionBtn 
                  icon={Shield} 
                  label="DEFEND" 
                  color={themeColors.success} 
                  onPress={playerDefend} 
                  disabled={turn !== 'PLAYER'}
                />
                <ActionBtn 
                  icon={Zap} 
                  label="SKILLS" 
                  color={themeColors.primary} 
                  onPress={() => setShowSkills(true)} 
                  disabled={turn !== 'PLAYER'}
                />
                <ActionBtn 
                  icon={Users} 
                  label="ARISE" 
                  color="#A020F0" 
                  onPress={() => setShowSummons(true)} 
                  disabled={turn !== 'PLAYER'}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  </SafeAreaView>
);
};

const ActionBtn = ({ icon: Icon, label, color, onPress, disabled }: any) => (
  <TouchableOpacity 
    onPress={onPress} 
    disabled={disabled}
    style={[styles.actionBtn, { borderColor: color, opacity: disabled ? 0.3 : 1 }]}
  >
    <Icon size={20} color={color} />
    <Text style={[styles.actionBtnLabel, { color }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  scanlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 100,
    opacity: 0.03,
    borderBottomWidth: 1,
    borderBottomColor: '#FFF',
  },
  battleHUD: {
    flex: 1,
    padding: SPACING.lg,
  },
  hudHeader: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  hudStatus: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  hudDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 8,
    width: '40%',
  },
  content: {
    flex: 1,
  },
  entityHUD: {
    marginBottom: SPACING.xxl,
  },
  entityInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  targetIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'relative',
  },
  targetCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 10,
    height: 10,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: COLORS.secondary,
  },
  targetCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: COLORS.secondary,
  },
  targetText: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  entityNameBox: {
    alignItems: 'flex-end',
  },
  entityRank: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  entityName: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  artBox: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  artGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  diagBarContainer: {
    width: '100%',
    marginBottom: SPACING.sm,
  },
  diagBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  diagBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  diagBarLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  diagBarValue: {
    fontSize: 9,
    fontWeight: '900',
  },
  diagBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  diagBarFill: {
    height: '100%',
  },
  diagBarMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  playerHUD: {
    marginTop: 'auto',
  },
  playerStatsGrid: {
    marginBottom: SPACING.lg,
  },
  playerAvatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  summonedUnits: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  unitPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(160, 32, 240, 0.4)',
  },
  noUnitsText: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.2)',
    fontWeight: '900',
    letterSpacing: 1,
  },
  playerBadge: {
    alignItems: 'center',
    gap: 4,
  },
  playerRole: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  commandCenter: {
    height: 300,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginTop: SPACING.xl,
    padding: SPACING.md,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  alertTitle: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },
  logContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4,
    padding: 8,
  },
  logLine: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  logTime: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.15)',
    fontFamily: 'System',
  },
  logText: {
    fontSize: 10,
    fontWeight: 'bold',
    flex: 1,
  },
  controls: {
    marginTop: 12,
    height: 70,
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    height: 54,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  actionBtnLabel: {
    fontSize: 8,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: 1,
  },
  skillsPalette: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
  },
  crystalBtn: {
    width: 60,
    height: 54,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  crystalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  crystalCost: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    fontSize: 7,
    color: 'white',
    fontWeight: '900',
  },
  selectorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  selectorTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: SPACING.xxl,
  },
  rankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  rankItem: {
    width: (width - 100) / 3,
    aspectRatio: 0.8,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankItemText: {
    fontSize: 32,
    fontWeight: '900',
  },
  rankSubtext: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 4,
  },
  selectorHint: {
    marginTop: SPACING.xxl,
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  ariseButton: {
    height: 60,
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden',
  },
  actionButton: {
    height: 50,
    borderRadius: 4,
    overflow: 'hidden',
  },
  btnGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 12,
    letterSpacing: 4,
  },
  backBtn: {
    padding: 10,
  },
});
