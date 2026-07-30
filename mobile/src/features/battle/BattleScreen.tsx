import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ImageBackground,
  Image,
  Modal,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import {
  Swords,
  Heart,
  Shield,
  Zap,
  AlertCircle,
  ChevronLeft,
  Award,
  Skull,
  Ghost,
  Users,
  Sparkles,
  Flame,
  Crown,
  CheckCircle2,
  X,
  Volume2,
  Crosshair,
  Trophy,
  Activity,
  Target,
  BarChart2
} from 'lucide-react-native';

import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, useAppTheme } from '../../styles/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { useBattleStore } from '../../store/useBattleStore';
import { useUserStore, WarriorRank, Shadow } from '../../store/useUserStore';
import { SKILLS_DATA } from '../../constants/skills';
import { SHADOW_TEMPLATES } from '../../constants/shadows';

const { width, height } = Dimensions.get('window');

// 8K Photorealistic Arena Backdrops & Boss Sprites
export const ARENA_BACKDROPS: Record<string, any> = {
  DEFAULT: require('../../../assets/arena/gate_dungeon.png'),
  RED: require('../../../assets/arena/red_gate.png'),
  THRONE: require('../../../assets/arena/monarch_throne.png'),
};

export const ENEMY_BOSS_SPRITES: Record<string, any> = {
  'slime king': require('../../../assets/bosses/slime_king.png'),
  'goblin warlord karg': require('../../../assets/bosses/goblin_warlord.png'),
  'glacial wyrm veth': require('../../../assets/bosses/glacial_wyrm.png'),
  'high demon general baruka': require('../../../assets/bosses/demon_general.png'),
  'sovereign dragon monarch': require('../../../assets/bosses/sovereign_dragon.png'),
};

const getBossSpriteByRank = (enemyName?: string, rank?: WarriorRank) => {
  if (enemyName && ENEMY_BOSS_SPRITES[enemyName.toLowerCase()]) {
    return ENEMY_BOSS_SPRITES[enemyName.toLowerCase()];
  }
  if (!rank) return ENEMY_BOSS_SPRITES['slime king'];
  if (rank === 'E' || rank === 'D') return ENEMY_BOSS_SPRITES['slime king'];
  if (rank === 'C' || rank === 'B') return ENEMY_BOSS_SPRITES['goblin warlord karg'];
  if (rank === 'A') return ENEMY_BOSS_SPRITES['glacial wyrm veth'];
  if (rank === 'S' || rank === 'S+') return ENEMY_BOSS_SPRITES['high demon general baruka'];
  return ENEMY_BOSS_SPRITES['sovereign dragon monarch'];
};

const DiagnosticBar = ({ current, max, color, label, icon: Icon }: any) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  return (
    <View style={styles.diagBarContainer}>
      <View style={styles.diagBarHeader}>
        <View style={styles.diagBarLeft}>
          <Icon size={11} color={color} />
          <Text style={[styles.diagBarLabel, { color }]}>{label}</Text>
        </View>
        <Text style={[styles.diagBarValue, { color }]}>{Math.round(current)} / {max}</Text>
      </View>
      <View style={styles.diagBarTrack}>
        <MotiView
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'timing', duration: 400 }}
          style={[styles.diagBarFill, { backgroundColor: color }]}
        />
      </View>
    </View>
  );
};

const RankSelector = ({ onSelect }: { onSelect: (rank: WarriorRank) => void }) => {
  const themeColors = useAppTheme();
  const ranks: WarriorRank[] = ['E', 'D', 'C', 'B', 'A', 'S', 'S+', 'S++', 'S+++', 'INFINITE'];

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={styles.selectorContainer}
    >
      <View style={styles.selectorHeaderBox}>
        <Swords size={28} color={themeColors.primary} style={{ marginBottom: 6 }} />
        <Text style={[styles.selectorTitle, { color: themeColors.text }]}>SOLO LEVELING ARENA</Text>
        <Text style={styles.selectorSubtitle}>Select Gate Rank to Enter Visual Combat Stage</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ width: '100%' }}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 130 }}
      >
        <View style={styles.rankGrid}>
          {ranks.map((r) => (
            <TouchableOpacity
              key={r}
              activeOpacity={0.8}
              style={[styles.rankItem, { borderColor: themeColors.glassBorder, backgroundColor: themeColors.surface }]}
              onPress={() => onSelect(r)}
            >
              <LinearGradient colors={['rgba(0, 240, 255, 0.12)', 'transparent']} style={StyleSheet.absoluteFill} />
              <Text style={[styles.rankItemText, { color: themeColors.primary, fontSize: r.length > 3 ? 18 : 26 }]}>{r}</Text>
              <Text style={[styles.rankSubtext, { color: themeColors.textSecondary }]}>GATE RANK</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.selectorHint, { color: themeColors.textSecondary }]}>Warning: S-Rank Gates contain lethal Monarch Entities.</Text>
      </ScrollView>
    </MotiView>
  );
};

export const BattleScreen = () => {
  const themeColors = useAppTheme();
  const { stats, unlockedSkills, shadowArmy, addXP, addCoins, extractShadow, updateStats, rank: userRank } = useUserStore();
  const {
    player, enemy, initBattle, playerAttack, playerDefend, playerSkill, summonShadow, extractShadowAttempt,
    turn, isBattleOver, winner, battleLog, calculateRewards, resetBattle, currentRank, canExtract, summonedShadows, enemyAttack
  } = useBattleStore();

  const [showSkills, setShowSkills] = useState(false);
  const [showSummons, setShowSummons] = useState(false);
  const [battleInitiated, setBattleInitiated] = useState(false);
  const [combatMode, setCombatMode] = useState<'ACTION' | 'TURN'>('ACTION');

  // Real-Time Visual Combat FX & Evasion States
  const [isSlashing, setIsSlashing] = useState(false);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [isDomainActive, setIsDomainActive] = useState(false);
  const [floatingDamage, setFloatingDamage] = useState<{ id: number; val: string; isCrit: boolean } | null>(null);
  const [isAriseAnimation, setIsAriseAnimation] = useState(false);

  // Real-Time Action Mechanics States
  const [comboCount, setComboCount] = useState<number>(0);
  const [bossStunProgress, setBossStunProgress] = useState<number>(0);
  const [isBossStunned, setIsBossStunned] = useState<boolean>(false);
  const [isDodging, setIsDodging] = useState<boolean>(false);
  const [dodgeMessage, setDodgeMessage] = useState<string | null>(null);
  const [bossTelegraph, setBossTelegraph] = useState<number>(0);
  const [isBossCharging, setIsBossCharging] = useState<boolean>(false);

  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Real-Time Boss Attack Telegraph Loop
  useEffect(() => {
    if (!battleInitiated || isBattleOver || combatMode !== 'ACTION') return;

    const bossInterval = setInterval(() => {
      if (!isBossCharging && !isBossStunned && !isBattleOver) {
        setIsBossCharging(true);
        setBossTelegraph(0);
      }
    }, 4500);

    return () => clearInterval(bossInterval);
  }, [battleInitiated, isBattleOver, combatMode, isBossCharging, isBossStunned]);

  // Boss Attack Charge Progress Effect
  useEffect(() => {
    if (!isBossCharging || isBattleOver || isBossStunned) return;

    const chargeTimer = setInterval(() => {
      setBossTelegraph((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    return () => clearInterval(chargeTimer);
  }, [isBossCharging, isBattleOver, isBossStunned]);

  // Handle Boss Telegraph Completion Side-Effects Safely Outside Render
  useEffect(() => {
    if (bossTelegraph >= 100 && isBossCharging) {
      setIsBossCharging(false);
      setBossTelegraph(0);

      if (isDodging) {
        setDodgeMessage('💨 PERFECT DODGE!');
        setTimeout(() => setDodgeMessage(null), 1000);
      } else {
        triggerCameraShake();
        enemyAttack();
      }
    }
  }, [bossTelegraph, isBossCharging, isDodging, enemyAttack]);

  const handleStartBattle = (rank: WarriorRank) => {
    initBattle(stats, rank);
    setBattleInitiated(true);
    setIsDomainActive(false);
    setIsAriseAnimation(false);
    setComboCount(0);
    setBossStunProgress(0);
    setIsBossStunned(false);
  };

  const triggerCameraShake = () => {
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 350);
  };

  // LIGHT STRIKE / COMBO ATTACK
  const handleExecuteAttack = () => {
    if (isBattleOver) return;

    setIsSlashing(true);
    triggerCameraShake();
    setTimeout(() => setIsSlashing(false), 450);

    const newCombo = comboCount + 1;
    setComboCount(newCombo);

    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => setComboCount(0), 2200);

    const newStun = bossStunProgress + 15;
    if (newStun >= 100 && !isBossStunned) {
      setIsBossStunned(true);
      setBossStunProgress(100);
      setDodgeMessage('💫 BOSS STUNNED! (2X CRIT DAMAGE)');
      setTimeout(() => {
        setIsBossStunned(false);
        setBossStunProgress(0);
        setDodgeMessage(null);
      }, 3500);
    } else if (!isBossStunned) {
      setBossStunProgress(newStun);
    }

    const comboMult = 1 + Math.min(2.0, newCombo * 0.15);
    const stunMult = isBossStunned ? 2.0 : 1.0;
    const dmg = Math.round((stats.strength * 1.6 + Math.random() * 25) * comboMult * stunMult);

    setFloatingDamage({ id: Date.now(), val: `-${dmg} ${newCombo > 2 ? `${newCombo}x COMBO!` : 'HIT!'}`, isCrit: isBossStunned || newCombo > 3 });
    setTimeout(() => setFloatingDamage(null), 1000);

    playerAttack();
  };

  const handlePerformDodge = () => {
    if (isDodging || isBattleOver) return;
    setIsDodging(true);
    setDodgeMessage('💨 DODGE POSITION ACTIVE');
    setTimeout(() => {
      setIsDodging(false);
      setDodgeMessage(null);
    }, 800);
  };

  const handlePerformParry = () => {
    if (isBattleOver) return;
    triggerCameraShake();

    if (isBossCharging) {
      setIsBossCharging(false);
      setBossTelegraph(0);
      setBossStunProgress((prev) => Math.min(100, prev + 35));
      setDodgeMessage('🛡️ PERFECT PARRY! BOSS COUNTERED!');
      setTimeout(() => setDodgeMessage(null), 1200);
      playerAttack();
    } else {
      playerDefend();
    }
  };

  const handleUsePotion = (type: 'HP' | 'MP') => {
    if (type === 'HP') {
      updateStats({ stamina: stats.stamina + 2 });
      Alert.alert('🧪 HP Potion Consumed', 'Restored health energy!');
    } else {
      updateStats({ mana: Math.min(stats.maxMana, stats.mana + 50) });
      Alert.alert('🧪 MP Elixir Consumed', 'Restored +50 Mana!');
    }
  };

  const handleExecuteSkill = (skillId: string) => {
    if (isBattleOver) return;
    setIsDomainActive(true);
    triggerCameraShake();
    setIsSlashing(true);
    setTimeout(() => setIsSlashing(false), 600);
    playerSkill(skillId);
    setShowSkills(false);
  };

  const handleSummonShadowUnit = (shadow: Shadow) => {
    if (isBattleOver) return;
    summonShadow(shadow);
    setShowSummons(false);
    triggerCameraShake();
  };

  const handleArise = () => {
    setIsAriseAnimation(true);
    triggerCameraShake();

    setTimeout(() => {
      const success = extractShadowAttempt();
      if (success && enemy) {
        const template = SHADOW_TEMPLATES.find(t => t.enemyName.toLowerCase() === enemy.name.toLowerCase()) || {
          enemyName: enemy.name,
          shadowName: `${enemy.name.toUpperCase()} SHADOW`,
          rank: enemy.rank,
          baseDamage: Math.max(25, Math.floor(enemy.attack * 0.8)),
          ability: 'Monarch Loyalty: Grants bonus attack damage in battle.',
          manaCost: 30,
          icon: 'Ghost',
          color: '#A020F0'
        };

        extractShadow({
          id: `shadow_${Date.now()}`,
          name: template.shadowName,
          rank: template.rank,
          level: 1,
          baseDamage: template.baseDamage,
          ability: template.ability,
          manaCost: template.manaCost,
          icon: template.icon
        });
      }
      setIsAriseAnimation(false);
    }, 1500);
  };

  const handleNextBattle = () => {
    if (winner === 'PLAYER') {
      const rewards = calculateRewards();
      addXP(rewards.xp);
      addCoins(rewards.coins);
    }
    initBattle(stats, currentRank);
    setIsDomainActive(false);
    setIsAriseAnimation(false);
    setComboCount(0);
    setBossStunProgress(0);
  };

  const handleRetreat = () => {
    resetBattle();
    setBattleInitiated(false);
  };

  if (!battleInitiated || !player || !enemy) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <RankSelector onSelect={handleStartBattle} />
      </SafeAreaView>
    );
  }

  const arenaBackdrop = currentRank === 'S' || currentRank === 'S+' || currentRank === 'S++'
    ? ARENA_BACKDROPS.THRONE
    : currentRank === 'A' || currentRank === 'B'
    ? ARENA_BACKDROPS.RED
    : ARENA_BACKDROPS.DEFAULT;

  const bossSprite = getBossSpriteByRank(enemy.name, enemy.rank);

  return (
    <SafeAreaView style={styles.container}>
      {/* CAMERA SHAKE STAGE WRAPPER */}
      <MotiView
        animate={{
          translateX: isScreenShaking ? [0, -12, 12, -8, 8, 0] : 0,
          translateY: isScreenShaking ? [0, 8, -8, 4, -4, 0] : 0,
        }}
        transition={{ type: 'timing', duration: 300 }}
        style={{ flex: 1 }}
      >
        {/* 8K PHOTOREALISTIC ARENA BACKDROP */}
        <ImageBackground source={arenaBackdrop} style={styles.stageBg} resizeMode="cover">
          <LinearGradient
            colors={['rgba(10, 12, 20, 0.85)', 'rgba(10, 12, 20, 0.25)', 'rgba(10, 12, 20, 0.95)']}
            style={styles.stageVignette}
          />

          {/* MONARCH DOMAIN OVERLAY */}
          {isDomainActive && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              style={[StyleSheet.absoluteFill, { backgroundColor: '#A020F0' }]}
            />
          )}

          {/* STAGE CONTENT WRAPPER WITH FLEX SPACE-BETWEEN FOR PERFECT ALIGNMENT */}
          <View style={styles.stageContentWrapper}>
            {/* TOP ZONE: HEADER & TELEGRAPH CHARGE BAR */}
            <View style={styles.topZone}>
              <View style={styles.topCombatHeader}>
                <TouchableOpacity style={styles.retreatBtn} onPress={handleRetreat}>
                  <ChevronLeft size={16} color="white" />
                  <Text style={styles.retreatBtnText}>RETREAT</Text>
                </TouchableOpacity>

                <View style={styles.headerRightRow}>
                  <TouchableOpacity
                    style={styles.modeToggleBtn}
                    onPress={() => setCombatMode(combatMode === 'ACTION' ? 'TURN' : 'ACTION')}
                  >
                    <Activity size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.modeToggleText}>
                      {combatMode === 'ACTION' ? '⚡ ACTION MODE' : '📋 TURN MODE'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* REAL-TIME BOSS ATTACK TELEGRAPH CHARGE BAR */}
              {isBossCharging && combatMode === 'ACTION' && (
                <MotiView
                  from={{ opacity: 0, translateY: -5 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  style={styles.telegraphAlertBox}
                >
                  <View style={styles.telegraphHeaderRow}>
                    <Flame size={12} color="#FF0055" />
                    <Text style={styles.telegraphTitle}>⚠️ BOSS CHARGING POWER ATTACK!</Text>
                  </View>
                  <View style={styles.telegraphTrack}>
                    <View style={[styles.telegraphFill, { width: `${bossTelegraph}%` }]} />
                  </View>
                </MotiView>
              )}

              {/* DODGE / PARRY ALERT BADGE */}
              {dodgeMessage && (
                <MotiView
                  from={{ opacity: 0, translateY: -5 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  style={styles.dodgeMessageBadge}
                >
                  <Text style={styles.dodgeMessageText}>{dodgeMessage}</Text>
                </MotiView>
              )}
            </View>

            {/* MIDDLE ZONE: VISUAL COMBAT STAGE (HUNTER VS BOSS) */}
            <View style={styles.visualStageContainer}>
              {/* LEFT FIGHTER: FULL SHADOW MONARCH CHARACTER BODY */}
              <MotiView
                animate={{
                  scale: turn === 'PLAYER' ? [1, 1.05, 1] : 1,
                }}
                style={styles.hunterFighterSide}
              >
                {/* Combo Counter Badge */}
                {comboCount > 0 && (
                  <MotiView
                    from={{ scale: 0.8 }}
                    animate={{ scale: 1.1 }}
                    style={styles.comboCounterBadge}
                  >
                    <Text style={styles.comboCounterText}>🔥 {comboCount}x COMBO</Text>
                  </MotiView>
                )}

                {/* FULL-BODY SHADOW MONARCH CHARACTER VISUAL FRAME */}
                <View style={[styles.hunterBodyCard, isDodging && { borderColor: '#00FF41' }]}>
                  <LinearGradient
                    colors={['rgba(160, 32, 240, 0.4)', 'rgba(0, 240, 255, 0.2)']}
                    style={styles.hunterBodyGradient}
                  >
                    {/* Glowing Monarch Crown & Eye Aura Header */}
                    <MotiView
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ loop: true, duration: 1500 }}
                      style={styles.monarchCrownHeader}
                    >
                      <Crown size={24} color="#00F0FF" />
                    </MotiView>

                    {/* Character Body Silhouette Visual */}
                    <View style={styles.monarchBodyGraphic}>
                      <Ghost size={36} color="#A020F0" />
                      <View style={styles.daggerGraphicRow}>
                        <Swords size={18} color="#00F0FF" />
                      </View>
                    </View>

                    <Text style={styles.monarchTitleText}>SUNG JIN-WOO</Text>
                  </LinearGradient>
                </View>

                <Text style={styles.hunterRankTag}>[{userRank}-RANK MONARCH]</Text>

                {/* VISUAL SHADOW ARMY STANDING IN FORMATION */}
                <View style={styles.visualShadowArmyFormation}>
                  {summonedShadows.map((s) => (
                    <MotiView
                      key={s.id}
                      from={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.9 }}
                      style={styles.shadowSoldierVisual}
                    >
                      <Ghost size={12} color="#A020F0" />
                      <Text style={styles.shadowSoldierName}>{s.name.split(' ')[0]}</Text>
                    </MotiView>
                  ))}
                </View>
              </MotiView>

              {/* CENTER COMBAT FX & FLOATING DAMAGE */}
              <View style={styles.centerFxCanvas}>
                {isSlashing && (
                  <MotiView
                    from={{ scale: 0.5, opacity: 0, rotate: '-45deg' }}
                    animate={{ scale: 1.6, opacity: 1, rotate: '15deg' }}
                    exit={{ opacity: 0 }}
                    style={styles.slashFxOverlay}
                  >
                    <Text style={styles.slashFxText}>⚡⚔️</Text>
                  </MotiView>
                )}

                {floatingDamage && (
                  <MotiView
                    from={{ translateY: 0, opacity: 1, scale: 1.2 }}
                    animate={{ translateY: -60, opacity: 0, scale: 1 }}
                    transition={{ type: 'timing', duration: 1000 }}
                    style={styles.damagePopup}
                  >
                    <Text style={styles.damagePopupText}>{floatingDamage.val}</Text>
                  </MotiView>
                )}
              </View>

              {/* RIGHT FIGHTER: PHOTOREALISTIC ENEMY BOSS SPRITE */}
              <MotiView
                animate={{
                  scale: isBossStunned ? [1, 0.95, 1] : turn === 'ENEMY' ? [1, 1.08, 1] : 1,
                }}
                style={styles.bossFighterSide}
              >
                <View style={[styles.bossSpriteFrame, isBossStunned && { borderColor: '#FFD700' }]}>
                  <Image source={bossSprite} style={styles.bossSpriteImage} resizeMode="cover" />
                  <View style={styles.targetReticle}>
                    <Crosshair size={22} color="#FF0055" />
                  </View>
                </View>

                {/* Boss Stun Break Bar */}
                <View style={styles.bossStunBarTrack}>
                  <View style={[styles.bossStunBarFill, { width: `${bossStunProgress}%` }]} />
                </View>

                <View style={styles.bossMetaBadge}>
                  <Text style={styles.bossRankText}>[{enemy.rank}-RANK BOSS]</Text>
                  <Text style={styles.bossNameText}>{enemy.name.toUpperCase()}</Text>
                </View>
              </MotiView>
            </View>

            {/* BOTTOM ZONE: VITALS & ACTION CONTROL BAR (CLEAR OF TAB BAR) */}
            <View style={styles.bottomControlsZone}>
              {/* VITALS & COMBAT STATS HUD */}
              <View style={styles.vitalsContainer}>
                <GlassCard style={styles.vitalsGlass}>
                  <View style={styles.vitalsRow}>
                    <View style={{ flex: 1.2, marginRight: 4 }}>
                      <DiagnosticBar current={player.hp} max={player.maxHp} color={COLORS.success} label="HUNTER HP" icon={Heart} />
                      <DiagnosticBar current={player.mana} max={player.maxMana} color={COLORS.primary} label="MANA" icon={Zap} />
                    </View>

                    {/* Quick Potion Belt */}
                    <View style={styles.potionBeltRow}>
                      <TouchableOpacity style={styles.potionBtn} onPress={() => handleUsePotion('HP')}>
                        <Text style={styles.potionIconText}>🧪</Text>
                        <Text style={styles.potionLabel}>+HP</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.potionBtn} onPress={() => handleUsePotion('MP')}>
                        <Text style={styles.potionIconText}>🧪</Text>
                        <Text style={styles.potionLabel}>+MP</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1.2, marginLeft: 4 }}>
                      <DiagnosticBar current={enemy.hp} max={enemy.maxHp} color={COLORS.secondary} label="BOSS HP" icon={Skull} />
                    </View>
                  </View>

                  {/* REAL-TIME COMBAT DETAILS HUD */}
                  <View style={styles.combatDetailsRow}>
                    <View style={styles.combatDetailCol}>
                      <Text style={styles.combatDetailLabel}>⚔️ ATK: <Text style={{ color: COLORS.primary }}>{Math.round(15 + stats.strength * 1.5)}</Text></Text>
                      <Text style={styles.combatDetailLabel}>🛡️ DEF: <Text style={{ color: COLORS.success }}>{Math.round(10 + stats.defense)}</Text></Text>
                    </View>
                    <View style={styles.combatDetailColCenter}>
                      <Text style={styles.combatDetailLabel}>🔥 COMBO: <Text style={{ color: '#FFD700' }}>{comboCount}x</Text></Text>
                    </View>
                    <View style={styles.combatDetailCol}>
                      <Text style={styles.combatDetailLabel}>👹 BOSS ATK: <Text style={{ color: COLORS.secondary }}>{enemy.attack}</Text></Text>
                      <Text style={styles.combatDetailLabel}>💫 STUN: <Text style={{ color: '#FFD700' }}>{bossStunProgress}%</Text></Text>
                    </View>
                  </View>
                </GlassCard>
              </View>

              {/* ACTION CONTROLS DASHBOARD */}
              <View style={styles.controlsContainer}>
                {!isBattleOver ? (
                  <GlassCard style={styles.controlsGlass}>
                    <View style={styles.mainActionsRow}>
                      {/* Primary Shadow Slash Attack */}
                      <TouchableOpacity
                        style={styles.primaryAttackBtn}
                        onPress={handleExecuteAttack}
                      >
                        <LinearGradient colors={['#FF0055', '#A020F0']} style={styles.attackGradient}>
                          <Swords size={18} color="white" />
                          <Text style={styles.attackBtnText}>LIGHT STRIKE</Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      {/* Dodge Action */}
                      <TouchableOpacity
                        style={styles.evasionActionBtn}
                        onPress={handlePerformDodge}
                      >
                        <Text style={styles.evasionBtnIcon}>💨</Text>
                        <Text style={styles.subActionText}>DODGE</Text>
                      </TouchableOpacity>

                      {/* Parry Stance */}
                      <TouchableOpacity
                        style={styles.evasionActionBtn}
                        onPress={handlePerformParry}
                      >
                        <Shield size={16} color={COLORS.primary} />
                        <Text style={styles.subActionText}>PARRY</Text>
                      </TouchableOpacity>

                      {/* Monarch Skills */}
                      <TouchableOpacity
                        style={styles.subActionBtn}
                        onPress={() => setShowSkills(true)}
                      >
                        <Zap size={16} color="#FFD700" />
                        <Text style={styles.subActionText}>SKILLS</Text>
                      </TouchableOpacity>

                      {/* Shadow Army */}
                      <TouchableOpacity
                        style={styles.subActionBtn}
                        onPress={() => setShowSummons(true)}
                      >
                        <Users size={16} color="#00FF41" />
                        <Text style={styles.subActionText}>ARMY ({shadowArmy.length})</Text>
                      </TouchableOpacity>
                    </View>
                  </GlassCard>
                ) : (
                  /* VICTORY & ARISE EXTRACTION DASHBOARD */
                  <GlassCard style={styles.victoryGlass}>
                    <View style={styles.victoryHeader}>
                      <Trophy size={24} color={winner === 'PLAYER' ? COLORS.xp : COLORS.secondary} />
                      <Text style={[styles.victoryTitleText, { color: winner === 'PLAYER' ? COLORS.xp : COLORS.secondary }]}>
                        {winner === 'PLAYER' ? 'VICTORY ACHIEVED!' : 'HUNTER DEFEATED!'}
                      </Text>
                    </View>

                    {winner === 'PLAYER' ? (
                      <View style={styles.victoryActionsRow}>
                        {canExtract && (
                          <TouchableOpacity style={styles.ariseBtn} onPress={handleArise}>
                            <LinearGradient colors={['#A020F0', '#6200EE']} style={styles.ariseGradient}>
                              <Sparkles size={18} color="white" />
                              <Text style={styles.ariseBtnText}>"ARISE!" (EXTRACT SHADOW)</Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity style={styles.nextBattleBtn} onPress={handleNextBattle}>
                          <LinearGradient colors={['#00FF41', '#00B32C']} style={styles.ariseGradient}>
                            <Text style={styles.nextBattleText}>NEXT EXPEDITION</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.retreatDefeatBtn} onPress={handleRetreat}>
                        <Text style={styles.retreatDefeatText}>RETURN TO BASE</Text>
                      </TouchableOpacity>
                    )}
                  </GlassCard>
                )}
              </View>
            </View>
          </View>
        </ImageBackground>
      </MotiView>

      {/* ARISE SHADOW EXTRACTION CINEMATIC OVERLAY */}
      {isAriseAnimation && (
        <Modal transparent animationType="fade" visible={isAriseAnimation}>
          <View style={styles.ariseModalContainer}>
            <LinearGradient colors={['rgba(160, 32, 240, 0.95)', 'rgba(10, 12, 20, 0.98)']} style={StyleSheet.absoluteFill} />
            <MotiView
              from={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ loop: true, duration: 1000 }}
              style={styles.ariseTitleBox}
            >
              <Ghost size={80} color="#A020F0" />
              <Text style={styles.ariseCinematicText}>" A R I S E !"</Text>
              <Text style={styles.ariseSubText}>EXTRACTING SHADOW SOLDIER FROM DEFEATED MONARCH...</Text>
            </MotiView>
          </View>
        </Modal>
      )}

      {/* SKILLS MODAL */}
      <Modal visible={showSkills} transparent animationType="slide" onRequestClose={() => setShowSkills(false)}>
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>MONARCH SKILLS</Text>
              <TouchableOpacity onPress={() => setShowSkills(false)}>
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {SKILLS_DATA.map((skill) => {
                const isUnlocked = unlockedSkills[skill.id] > 0;
                return (
                  <TouchableOpacity
                    key={skill.id}
                    disabled={!isUnlocked}
                    style={[styles.skillRowItem, !isUnlocked && { opacity: 0.4 }]}
                    onPress={() => handleExecuteSkill(skill.id)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.skillRowTitle}>{skill.name}</Text>
                      <Text style={styles.skillRowDesc}>{skill.description}</Text>
                    </View>
                    <Text style={styles.skillManaText}>{skill.manaCost} MP</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </GlassCard>
        </View>
      </Modal>

      {/* SHADOW ARMY SUMMON MODAL */}
      <Modal visible={showSummons} transparent animationType="slide" onRequestClose={() => setShowSummons(false)}>
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SUMMON SHADOW SOLDIERS</Text>
              <TouchableOpacity onPress={() => setShowSummons(false)}>
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {shadowArmy.map((shadow) => (
                <TouchableOpacity
                  key={shadow.id}
                  style={styles.shadowRowItem}
                  onPress={() => handleSummonShadowUnit(shadow)}
                >
                  <Ghost size={24} color="#A020F0" style={{ marginRight: SPACING.md }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.shadowRowTitle}>{shadow.name}</Text>
                    <Text style={styles.shadowRowSub}>DMG: {shadow.baseDamage} • MP Cost: {shadow.manaCost}</Text>
                  </View>
                  <Text style={styles.summonTag}>SUMMON</Text>
                </TouchableOpacity>
              ))}

              {shadowArmy.length === 0 && (
                <Text style={styles.noShadowsText}>No Shadow Soldiers extracted yet. Defeat bosses and tap "Arise" to build your army!</Text>
              )}
            </ScrollView>
          </GlassCard>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F111A',
  },
  stageBg: {
    flex: 1,
    width: '100%',
  },
  stageVignette: {
    ...StyleSheet.absoluteFillObject,
  },
  stageContentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 85,
  },
  topZone: {
    width: '100%',
  },
  bottomControlsZone: {
    width: '100%',
  },
  topCombatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
  },
  retreatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  retreatBtnText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.18)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
  },
  modeToggleText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  telegraphAlertBox: {
    marginHorizontal: SPACING.md,
    marginTop: 4,
    backgroundColor: 'rgba(255, 0, 85, 0.25)',
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#FF0055',
  },
  telegraphHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  telegraphTitle: {
    color: '#FF0055',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  telegraphTrack: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  telegraphFill: {
    height: '100%',
    backgroundColor: '#FF0055',
  },
  dodgeMessageBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 255, 65, 0.25)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
    marginTop: 2,
  },
  dodgeMessageText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: 'bold',
  },
  /* VISUAL COMBAT STAGE */
  visualStageContainer: {
    height: 180,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    position: 'relative',
  },
  hunterFighterSide: {
    alignItems: 'center',
    width: 105,
  },
  comboCounterBadge: {
    backgroundColor: '#FF0055',
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
    marginBottom: 2,
  },
  comboCounterText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
  /* FULL-BODY SHADOW MONARCH CHARACTER CARD */
  hunterBodyCard: {
    width: 85,
    height: 105,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: '#00F0FF',
    overflow: 'hidden',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 8,
  },
  hunterBodyGradient: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  monarchCrownHeader: {
    marginTop: 2,
  },
  monarchBodyGraphic: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  daggerGraphicRow: {
    marginTop: -8,
  },
  monarchTitleText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  hunterRankTag: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 2,
  },
  visualShadowArmyFormation: {
    marginTop: 2,
  },
  shadowSoldierVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(160, 32, 240, 0.25)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.round,
    marginBottom: 2,
  },
  shadowSoldierName: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  centerFxCanvas: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  slashFxOverlay: {
    position: 'absolute',
  },
  slashFxText: {
    fontSize: 60,
  },
  damagePopup: {
    position: 'absolute',
    top: '30%',
  },
  damagePopupText: {
    color: '#FF0055',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'black',
    textShadowRadius: 6,
  },
  bossFighterSide: {
    alignItems: 'center',
    width: 105,
  },
  bossSpriteFrame: {
    width: 90,
    height: 105,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: '#FF0055',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#FF0055',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 8,
  },
  bossSpriteImage: {
    width: '100%',
    height: '100%',
  },
  bossStunBarTrack: {
    width: 90,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  bossStunBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  targetReticle: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  bossMetaBadge: {
    alignItems: 'center',
    marginTop: 2,
  },
  bossRankText: {
    color: '#FF0055',
    fontSize: 8,
    fontWeight: 'bold',
  },
  bossNameText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
  /* VITALS & COMBAT DETAILS HUD */
  vitalsContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  vitalsGlass: {
    padding: 10,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(18, 22, 36, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    minHeight: 75,
  },
  vitalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  potionBeltRow: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  potionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    marginVertical: 1,
  },
  potionIconText: {
    fontSize: 11,
  },
  potionLabel: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: 'bold',
  },
  combatDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  combatDetailCol: {
    flex: 1,
  },
  combatDetailColCenter: {
    alignItems: 'center',
  },
  combatDetailLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  diagBarContainer: {
    marginBottom: 3,
  },
  diagBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  diagBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diagBarLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  diagBarValue: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  diagBarTrack: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  diagBarFill: {
    height: '100%',
  },
  /* CONTROLS DASHBOARD */
  controlsContainer: {
    paddingHorizontal: SPACING.md,
  },
  controlsGlass: {
    padding: 10,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: 'rgba(18, 22, 36, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    minHeight: 65,
    justifyContent: 'center',
  },
  mainActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryAttackBtn: {
    flex: 1.5,
    marginRight: 6,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    height: 48,
  },
  attackGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 8,
  },
  attackBtnText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  evasionActionBtn: {
    backgroundColor: 'rgba(0, 255, 65, 0.18)',
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#00FF41',
    height: 48,
    minWidth: 54,
  },
  evasionBtnIcon: {
    fontSize: 14,
  },
  subActionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    height: 48,
    minWidth: 54,
  },
  subActionText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
  },
  /* VICTORY & ARISE SHEET */
  victoryGlass: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
  },
  victoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  victoryTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  victoryActionsRow: {
    width: '100%',
  },
  ariseBtn: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  ariseGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
  },
  ariseBtnText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  nextBattleBtn: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  nextBattleText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  retreatDefeatBtn: {
    backgroundColor: 'rgba(255, 0, 85, 0.3)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  retreatDefeatText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  /* ARISE CINEMATIC MODAL */
  ariseModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ariseTitleBox: {
    alignItems: 'center',
  },
  ariseCinematicText: {
    color: '#A020F0',
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginVertical: SPACING.md,
    textShadowColor: 'white',
    textShadowRadius: 10,
  },
  ariseSubText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  /* RANK SELECTOR STYLES */
  selectorContainer: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  selectorHeaderBox: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    marginTop: SPACING.md,
  },
  selectorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  selectorSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  rankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  rankItem: {
    width: (width - 60) / 2,
    height: 90,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: SPACING.xs + 2,
    overflow: 'hidden',
  },
  rankItemText: {
    fontWeight: 'bold',
  },
  rankSubtext: {
    fontSize: 10,
    marginTop: 2,
  },
  selectorHint: {
    fontSize: 11,
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
  /* MODAL LIST STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalContent: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: '#161926',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  skillRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  skillRowTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  skillRowDesc: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  skillManaText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  shadowRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(160, 32, 240, 0.15)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  shadowRowTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  shadowRowSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  summonTag: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: 'bold',
  },
  noShadowsText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
});
