import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  Dimensions, 
  Alert,
  ImageBackground,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useNavigation } from '@react-navigation/native';
import { 
  MapPin, 
  Lock, 
  ChevronRight, 
  Shield, 
  Zap, 
  Swords, 
  Flame, 
  Skull, 
  Compass, 
  Crosshair, 
  CheckCircle2, 
  X, 
  Activity, 
  Eye, 
  Trophy,
  Award,
  Sparkles,
  List,
  Map as MapIcon,
  Globe,
  Radio,
  Navigation
} from 'lucide-react-native';

import { COLORS, SPACING, BORDER_RADIUS } from '../../styles/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { useUserStore } from '../../store/useUserStore';
import { RegionVirtualWorldModal, REGION_IMAGES, BOSS_IMAGES, GateTier } from './RegionVirtualWorldModal';

const { width } = Dimensions.get('window');

export interface RegionData {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Epic' | 'Legendary';
  minLevel: number;
  color: string;
  accentColor: string;
  nodePos: { x: number; y: number };
  bossName: string;
  bossIcon: string;
  enemies: string[];
  recStats: { strength: number; defense: number; stamina: number };
  rewards: { xp: number; coins: number; shadowChance: string };
  specialEvent?: string;
}

const REGIONS: RegionData[] = [
  {
    id: 'village',
    name: 'Silverleaf Village',
    subtitle: 'Beginner Sanctuary & Training Grounds',
    description: 'A peaceful starting haven surrounded by lush meadows. Practice basic combat against training dummies and low-level slimes.',
    difficulty: 'Easy',
    minLevel: 1,
    color: '#00FF41',
    accentColor: '#003B10',
    nodePos: { x: 50, y: 40 },
    bossName: 'Slime King & Practice Golems',
    bossIcon: '🧪',
    enemies: ['Grass Slime', 'Wood Golem', 'Stray Goblin'],
    recStats: { strength: 10, defense: 10, stamina: 10 },
    rewards: { xp: 150, coins: 80, shadowChance: '5% (E-Rank)' },
  },
  {
    id: 'forest',
    name: 'Whispering Woods',
    subtitle: 'Ancient Ruins & Goblin Hideouts',
    description: 'Dense dark canopy hiding goblin outposts and forgotten magic shrines. Beware of ambush packs deep in the woods.',
    difficulty: 'Medium',
    minLevel: 5,
    color: '#00F0FF',
    accentColor: '#003B46',
    nodePos: { x: 22, y: 130 },
    bossName: 'Goblin Warlord Karg',
    bossIcon: '👺',
    enemies: ['Goblin Scout', 'Treant Sentinel', 'Shadow Wolf'],
    recStats: { strength: 25, defense: 20, stamina: 25 },
    rewards: { xp: 450, coins: 250, shadowChance: '15% (D-Rank)' },
    specialEvent: '⚡ RED GATE DETECTED! +50% EXP BONUS',
  },
  {
    id: 'caverns',
    name: 'Frostpeak Caverns',
    subtitle: 'Glacial Pass & Frozen Vaults',
    description: 'Treacherous subterranean ice caves. Sub-zero blizzards test hunter stamina and elemental resistance.',
    difficulty: 'Hard',
    minLevel: 12,
    color: '#0088FF',
    accentColor: '#002046',
    nodePos: { x: 78, y: 220 },
    bossName: 'Glacial Wyrm Veth',
    bossIcon: '🐉',
    enemies: ['Ice Golem', 'Frost Wraith', 'Crystal Spider'],
    recStats: { strength: 45, defense: 40, stamina: 45 },
    rewards: { xp: 1200, coins: 650, shadowChance: '25% (C-Rank)' },
  },
  {
    id: 'citadel',
    name: 'Monarch Citadel',
    subtitle: 'High Demon Fortress & War Gate',
    description: 'A towering obsidian fortress where demonic warlords assemble their legion. Only seasoned hunters dare cross.',
    difficulty: 'Epic',
    minLevel: 25,
    color: '#FF0055',
    accentColor: '#460017',
    nodePos: { x: 25, y: 310 },
    bossName: 'High Demon General Baruka',
    bossIcon: '👹',
    enemies: ['Demon Knight', 'Hellhound', 'Blood Mage'],
    recStats: { strength: 80, defense: 75, stamina: 80 },
    rewards: { xp: 3500, coins: 2000, shadowChance: '45% (B/A-Rank)' },
    specialEvent: '🔥 WORLD BOSS RAID ACTIVE',
  },
  {
    id: 'abyss',
    name: 'The Cosmic Abyss',
    subtitle: 'Sovereign Realm & Void Gateway',
    description: 'The infinite space beyond reality. Face cosmic dragons and the supreme Monarch of Shadows in ultimate combat.',
    difficulty: 'Legendary',
    minLevel: 50,
    color: '#A020F0',
    accentColor: '#2C0046',
    nodePos: { x: 65, y: 400 },
    bossName: 'Sovereign Dragon Monarch',
    bossIcon: '🌌',
    enemies: ['Void Archon', 'Cosmic Drake', 'Shadow General'],
    recStats: { strength: 150, defense: 140, stamina: 150 },
    rewards: { xp: 10000, coins: 7500, shadowChance: '75% (S-Rank)' },
  },
];

const BROADCAST_MESSAGES = [
  '⚡ [SYSTEM]: Red Gate active in Whispering Woods! (+50% EXP Bonus)',
  '⚔️ [Hunter Sung_V]: Defeated Frost Wyrm in Frostpeak S-Rank Gate Raid!',
  '🐉 [WORLD EVENT]: Monarch Dragon World Boss spawning in 10 minutes!',
  '✨ [ASSOCIATION]: Double Coins active across all Regional Expeditions!'
];

export const MapScreen = () => {
  const navigation = useNavigation<any>();
  const stats = useUserStore((state) => state.stats);
  const rank = useUserStore((state) => state.rank);

  const [currentLocationId, setCurrentLocationId] = useState<string>('village');
  const [selectedRegion, setSelectedRegion] = useState<RegionData>(REGIONS[0]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isVirtualWorldVisible, setIsVirtualWorldVisible] = useState<boolean>(false);
  const [isTeleportMenuVisible, setIsTeleportMenuVisible] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'NODE' | 'LIST'>('NODE');
  const [broadcastIdx, setBroadcastIdx] = useState<number>(0);

  const playerLevel = stats.level || 1;

  useEffect(() => {
    const timer = setInterval(() => {
      setBroadcastIdx((prev) => (prev + 1) % BROADCAST_MESSAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenRegionDetails = (region: RegionData) => {
    setSelectedRegion(region);
    setIsModalVisible(true);
  };

  const handleLaunchVirtualWorld = (region: RegionData) => {
    if (playerLevel < region.minLevel) {
      Alert.alert('Region Locked', `You must reach Level ${region.minLevel} to explore this virtual world.`);
      return;
    }
    setSelectedRegion(region);
    setIsModalVisible(false);
    setIsVirtualWorldVisible(true);
  };

  const handleTeleportToBase = (region: RegionData) => {
    if (playerLevel < region.minLevel) {
      Alert.alert('Teleport Failed', `Reach Level ${region.minLevel} to unlock teleportation to ${region.name}.`);
      return;
    }
    setCurrentLocationId(region.id);
    setSelectedRegion(region);
    setIsTeleportMenuVisible(false);

    // Smoothly launch the 8K Virtual World Viewport after Warp modal closes
    setTimeout(() => {
      setIsVirtualWorldVisible(true);
    }, 150);
  };

  const handleTravelToMode = (mode: 'ARENA' | 'TRAINING' | 'SURVIVAL' | 'VISION', gateTier: GateTier = 'BLUE') => {
    if (playerLevel < selectedRegion.minLevel) {
      Alert.alert('Access Denied', `Reach Level ${selectedRegion.minLevel} to enter ${selectedRegion.name}.`);
      return;
    }
    setIsModalVisible(false);
    setIsVirtualWorldVisible(false);

    switch (mode) {
      case 'ARENA':
        navigation.navigate('Arena', { gateTier });
        break;
      case 'TRAINING':
        navigation.navigate('Training', { gateTier });
        break;
      case 'SURVIVAL':
        navigation.navigate('SurvivalQuest', { gateTier });
        break;
      case 'VISION':
        navigation.navigate('QuestVision', { gateTier });
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.background, '#141724', COLORS.surface]} style={styles.background} />

      {/* Header Bar */}
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>WORLD MAP</Text>
          <View style={styles.rankBadge}>
            <Sparkles size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.rankBadgeText}>{rank}-RANK HUNTER</Text>
            <Text style={styles.lvlText}> • LVL {playerLevel}</Text>
          </View>
        </View>

        {/* Fast Teleport Waypoint Button & View Toggle */}
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.teleportWarpBtn}
            onPress={() => setIsTeleportMenuVisible(true)}
          >
            <Navigation size={15} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.teleportWarpBtnText}>WARP</Text>
          </TouchableOpacity>

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'NODE' && styles.toggleBtnActive]}
              onPress={() => setViewMode('NODE')}
            >
              <MapIcon size={16} color={viewMode === 'NODE' ? COLORS.background : COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'LIST' && styles.toggleBtnActive]}
              onPress={() => setViewMode('LIST')}
            >
              <List size={16} color={viewMode === 'LIST' ? COLORS.background : COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Cycling Live Hunter Raid Broadcast Ticker */}
      <MotiView 
        key={broadcastIdx}
        from={{ opacity: 0, translateY: -8 }} 
        animate={{ opacity: 1, translateY: 0 }}
        style={styles.eventBanner}
      >
        <LinearGradient
          colors={['rgba(255, 0, 85, 0.25)', 'rgba(160, 32, 240, 0.25)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.eventBannerGradient}
        >
          <Radio size={16} color="#FF0055" style={{ marginRight: SPACING.xs }} />
          <Text style={styles.eventBannerText} numberOfLines={1}>
            {BROADCAST_MESSAGES[broadcastIdx]}
          </Text>
        </LinearGradient>
      </MotiView>

      {/* Main Content (NODE MAP or LIST VIEW) */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {viewMode === 'NODE' ? (
          <View style={styles.nodeMapContainer}>
            <View style={styles.gridOverlay} />

            <View style={styles.pathwaySvgContainer}>
              <View style={[styles.nodeLine, { top: 70, left: '36%', width: 2, height: 75, transform: [{ rotate: '-35deg' }] }]} />
              <View style={[styles.nodeLine, { top: 165, left: '50%', width: 2, height: 75, transform: [{ rotate: '40deg' }] }]} />
              <View style={[styles.nodeLine, { top: 255, left: '51%', width: 2, height: 75, transform: [{ rotate: '-45deg' }] }]} />
              <View style={[styles.nodeLine, { top: 345, left: '45%', width: 2, height: 75, transform: [{ rotate: '30deg' }] }]} />
            </View>

            {REGIONS.map((region, index) => {
              const isUnlocked = playerLevel >= region.minLevel;
              const isCurrent = currentLocationId === region.id;
              const isSelected = selectedRegion.id === region.id;

              return (
                <MotiView
                  key={region.id}
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 120 }}
                  style={[
                    styles.nodeWrapper,
                    { left: `${region.nodePos.x}%`, top: region.nodePos.y }
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleOpenRegionDetails(region)}
                    style={styles.nodeTouchArea}
                  >
                    {isCurrent && (
                      <MotiView
                        from={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 1.4, opacity: 0 }}
                        transition={{ loop: true, duration: 1600 }}
                        style={[styles.pulseRing, { borderColor: region.color }]}
                      />
                    )}

                    <View
                      style={[
                        styles.nodePin,
                        { borderColor: isUnlocked ? region.color : COLORS.textSecondary },
                        isUnlocked && { shadowColor: region.color },
                        isCurrent && styles.nodePinCurrent
                      ]}
                    >
                      <LinearGradient
                        colors={[
                          isUnlocked ? region.color : '#3A3E54',
                          isUnlocked ? region.accentColor : '#1E2130'
                        ]}
                        style={styles.nodeGradient}
                      >
                        {isUnlocked ? (
                          <MapPin size={22} color="white" />
                        ) : (
                          <Lock size={18} color={COLORS.textSecondary} />
                        )}
                      </LinearGradient>
                    </View>

                    <View style={[styles.nodeLabelCard, isSelected && { borderColor: region.color }]}>
                      <Text style={[styles.nodeTitle, !isUnlocked && { color: COLORS.textSecondary }]}>
                        {region.name}
                      </Text>

                      <View style={styles.nodeMetaRow}>
                        {isCurrent ? (
                          <Text style={[styles.nodeMetaBadge, { color: COLORS.success }]}>📍 CURRENT BASE</Text>
                        ) : isUnlocked ? (
                          <Text style={[styles.nodeMetaBadge, { color: region.color }]}>{region.difficulty}</Text>
                        ) : (
                          <Text style={styles.nodeMetaLock}>Req. Lvl {region.minLevel}</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </MotiView>
              );
            })}
          </View>
        ) : (
          /* CARD LIST VIEW WITH PHOTOREALISTIC AAA THUMBNAILS */
          <View style={styles.listViewContainer}>
            {REGIONS.map((region, index) => {
              const isUnlocked = playerLevel >= region.minLevel;
              const isCurrent = currentLocationId === region.id;
              const levelProgress = Math.min(1, playerLevel / region.minLevel);

              return (
                <MotiView
                  key={region.id}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ delay: index * 100 }}
                >
                  <TouchableOpacity
                    onPress={() => handleOpenRegionDetails(region)}
                    activeOpacity={0.85}
                    style={[
                      styles.regionCard,
                      !isUnlocked && styles.lockedCard,
                      selectedRegion.id === region.id && { borderColor: region.color, borderWidth: 2 }
                    ]}
                  >
                    <ImageBackground
                      source={REGION_IMAGES[region.id] || REGION_IMAGES.village}
                      style={styles.cardBgImage}
                      imageStyle={{ borderRadius: BORDER_RADIUS.lg }}
                    >
                      <LinearGradient
                        colors={['rgba(15, 17, 26, 0.7)', 'rgba(15, 17, 26, 0.95)']}
                        style={styles.cardGradientOverlay}
                      >
                        <GlassCard style={styles.glassInner}>
                          <View style={styles.cardHeader}>
                            <View style={styles.titleGroup}>
                              <View
                                style={[
                                  styles.iconBadge,
                                  { backgroundColor: isUnlocked ? `${region.color}25` : 'rgba(255,255,255,0.05)' }
                                ]}
                              >
                                <MapPin size={22} color={isUnlocked ? region.color : COLORS.textSecondary} />
                              </View>
                              <View style={{ marginLeft: SPACING.md }}>
                                <Text style={[styles.regionName, !isUnlocked && { color: COLORS.textSecondary }]}>
                                  {region.name}
                                </Text>
                                <Text style={styles.regionSub}>{region.subtitle}</Text>
                              </View>
                            </View>

                            {isCurrent && (
                              <View style={styles.currentBadge}>
                                <Text style={styles.currentBadgeText}>BASE</Text>
                              </View>
                            )}

                            {!isUnlocked && <Lock size={18} color={COLORS.textSecondary} />}
                          </View>

                          <Text style={styles.regionDesc} numberOfLines={2}>
                            {region.description}
                          </Text>

                          <View style={styles.cardFooter}>
                            {isUnlocked ? (
                              <View style={styles.difficultyBadge}>
                                <Text style={[styles.diffText, { color: region.color }]}>
                                  DIFFICULTY: {region.difficulty.toUpperCase()}
                                </Text>
                              </View>
                            ) : (
                              <View style={styles.lockProgressContainer}>
                                <Text style={styles.unlockText}>Requires Level {region.minLevel}</Text>
                                <View style={styles.progressBarTrack}>
                                  <View style={[styles.progressBarFill, { width: `${levelProgress * 100}%` }]} />
                                </View>
                              </View>
                            )}

                            <View style={styles.inspectBtn}>
                              <Text style={styles.inspectBtnText}>EXPLORE 8K REGION</Text>
                              <ChevronRight size={14} color={COLORS.primary} />
                            </View>
                          </View>
                        </GlassCard>
                      </LinearGradient>
                    </ImageBackground>
                  </TouchableOpacity>
                </MotiView>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* QUICK TRAVEL & VIRTUAL WORLD FOOTER BAR */}
      <View style={styles.footerContainer}>
        <GlassCard style={styles.footerGlass}>
          <View style={styles.footerLeft}>
            <Compass size={22} color={selectedRegion.color} />
            <View style={{ marginLeft: SPACING.sm }}>
              <Text style={styles.footerRegionTitle}>{selectedRegion.name}</Text>
              <Text style={styles.footerRegionMeta}>
                {playerLevel >= selectedRegion.minLevel ? selectedRegion.difficulty : `Locked (Lvl ${selectedRegion.minLevel})`}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.travelBtn, playerLevel < selectedRegion.minLevel && styles.disabledBtn]}
            onPress={() => handleLaunchVirtualWorld(selectedRegion)}
          >
            <LinearGradient
              colors={[
                playerLevel >= selectedRegion.minLevel ? selectedRegion.color : '#3A3E54',
                playerLevel >= selectedRegion.minLevel ? selectedRegion.accentColor : '#1E2130'
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.travelGradient}
            >
              <Globe size={16} color="white" style={{ marginRight: 6 }} />
              <Text style={styles.travelBtnText}>EXPLORE REGION</Text>
              <ChevronRight size={18} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </GlassCard>
      </View>

      {/* FAST TELEPORT WAYPOINT MODAL */}
      <Modal
        visible={isTeleportMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsTeleportMenuVisible(false)}
      >
        <View style={styles.teleportModalOverlay}>
          <GlassCard style={styles.teleportCard}>
            <View style={styles.teleportHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Navigation size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                <Text style={styles.teleportTitle}>INSTANT WARP WAYPOINTS</Text>
              </View>
              <TouchableOpacity onPress={() => setIsTeleportMenuVisible(false)}>
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.teleportSubtitle}>Select an unlocked regional waypoint to warp instantly:</Text>

            <ScrollView style={{ maxHeight: 300, marginVertical: SPACING.md }}>
              {REGIONS.map((region) => {
                const isUnlocked = playerLevel >= region.minLevel;
                const isCurrent = currentLocationId === region.id;

                return (
                  <TouchableOpacity
                    key={region.id}
                    disabled={!isUnlocked}
                    style={[
                      styles.teleportOptionRow,
                      !isUnlocked && { opacity: 0.5 },
                      isCurrent && { borderColor: COLORS.success, borderWidth: 1 }
                    ]}
                    onPress={() => handleTeleportToBase(region)}
                  >
                    <MapPin size={18} color={isUnlocked ? region.color : COLORS.textSecondary} />
                    <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                      <Text style={styles.teleportRegionName}>{region.name}</Text>
                      <Text style={styles.teleportRegionSub}>{isUnlocked ? `Difficulty: ${region.difficulty}` : `Req. Level ${region.minLevel}`}</Text>
                    </View>

                    {isUnlocked ? (
                      <View style={[styles.warpTag, isCurrent && { backgroundColor: 'rgba(0, 255, 65, 0.2)' }]}>
                        <Text style={[styles.warpTagText, isCurrent && { color: COLORS.success }]}>
                          {isCurrent ? 'EXPLORE BASE ⚡' : 'WARP & EXPLORE ⚡'}
                        </Text>
                      </View>
                    ) : (
                      <Lock size={16} color={COLORS.textSecondary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </GlassCard>
        </View>
      </Modal>

      {/* REGION DETAIL MODAL */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleGroup}>
                <Text style={styles.modalBossIcon}>{selectedRegion.bossIcon}</Text>
                <View>
                  <Text style={styles.modalTitle}>{selectedRegion.name}</Text>
                  <Text style={styles.modalSubTitle}>{selectedRegion.subtitle}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <ImageBackground
                source={REGION_IMAGES[selectedRegion.id] || REGION_IMAGES.village}
                style={styles.modalBannerImage}
                imageStyle={{ borderRadius: BORDER_RADIUS.lg }}
              >
                <LinearGradient
                  colors={['rgba(15, 17, 26, 0.4)', 'rgba(15, 17, 26, 0.95)']}
                  style={styles.regionBannerGradient}
                >
                  <View style={styles.bannerRow}>
                    <View style={styles.bannerTag}>
                      <Text style={[styles.bannerTagText, { color: selectedRegion.color }]}>
                        DIFFICULTY: {selectedRegion.difficulty}
                      </Text>
                    </View>
                    <Text style={styles.minLvlBadge}>REQ LVL {selectedRegion.minLevel}</Text>
                  </View>
                  <Text style={styles.modalDesc}>{selectedRegion.description}</Text>
                </LinearGradient>
              </ImageBackground>

              {/* VIRTUAL WORLD LAUNCH BUTTON */}
              <TouchableOpacity
                style={styles.virtualWorldLaunchBtn}
                onPress={() => handleLaunchVirtualWorld(selectedRegion)}
              >
                <LinearGradient colors={[selectedRegion.color, selectedRegion.accentColor]} style={styles.virtualWorldLaunchGradient}>
                  <Globe size={22} color="white" />
                  <Text style={styles.virtualWorldLaunchText}>EXPLORE 8K VIRTUAL WORLD</Text>
                  <ChevronRight size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>

              {/* Boss & Enemy Roster */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>AREA BOSS & ENEMIES</Text>
                <View style={styles.bossCard}>
                  <View style={styles.modalBossPortraitBox}>
                    <Image
                      source={BOSS_IMAGES[selectedRegion.id] || BOSS_IMAGES.village}
                      style={styles.modalBossPortraitImg}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(15, 17, 26, 0.9)']}
                      style={styles.modalBossOverlay}
                    >
                      <Text style={styles.bossNameText}>👹 Boss: {selectedRegion.bossName}</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.enemyPillsRow}>
                    {selectedRegion.enemies.map((enemy, idx) => (
                      <View key={idx} style={styles.enemyPill}>
                        <Skull size={12} color={COLORS.secondary} style={{ marginRight: 4 }} />
                        <Text style={styles.enemyPillText}>{enemy}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <Text style={styles.sectionHeader}>CHOOSE REGIONAL EXPEDITION</Text>

              <TouchableOpacity
                style={styles.actionLaunchBtn}
                onPress={() => handleTravelToMode('ARENA')}
              >
                <LinearGradient colors={['#FF0055', '#A020F0']} style={styles.actionLaunchGradient}>
                  <Swords size={20} color="white" />
                  <Text style={styles.actionLaunchText}>ENTER GATE RAID (ARENA)</Text>
                  <ChevronRight size={18} color="white" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionLaunchBtn}
                onPress={() => handleTravelToMode('TRAINING')}
              >
                <LinearGradient colors={['#00F0FF', '#0072FF']} style={styles.actionLaunchGradient}>
                  <Activity size={20} color="white" />
                  <Text style={styles.actionLaunchText}>START REGIONAL WORKOUT</Text>
                  <ChevronRight size={18} color="white" />
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.dualLaunchRow}>
                <TouchableOpacity
                  style={[styles.dualLaunchBtn, { flex: 1, marginRight: SPACING.xs }]}
                  onPress={() => handleTravelToMode('SURVIVAL')}
                >
                  <LinearGradient colors={['#00FF41', '#00B32C']} style={styles.actionLaunchGradient}>
                    <Shield size={16} color="white" />
                    <Text style={styles.smallLaunchText}>SURVIVAL GATE</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dualLaunchBtn, { flex: 1, marginLeft: SPACING.xs }]}
                  onPress={() => handleTravelToMode('VISION')}
                >
                  <LinearGradient colors={['#A020F0', '#6200EE']} style={styles.actionLaunchGradient}>
                    <Eye size={16} color="white" />
                    <Text style={styles.smallLaunchText}>AR VISION QUEST</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </GlassCard>
        </View>
      </Modal>

      {/* FULL-SCREEN REALISTIC VIRTUAL WORLD EXPLORATION MODAL */}
      <RegionVirtualWorldModal
        visible={isVirtualWorldVisible}
        region={selectedRegion}
        onClose={() => setIsVirtualWorldVisible(false)}
        onNavigateMode={handleTravelToMode}
      />
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
    bottom: 0,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rankBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  lvlText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teleportWarpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
    marginRight: SPACING.xs,
  },
  teleportWarpBtnText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BORDER_RADIUS.md,
    padding: 3,
  },
  toggleBtn: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
  },
  eventBanner: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  eventBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
  },
  eventBannerText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: 'bold',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  nodeMapContainer: {
    minHeight: 520,
    position: 'relative',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.05)',
    borderRadius: BORDER_RADIUS.lg,
  },
  pathwaySvgContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  nodeLine: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 240, 255, 0.3)',
  },
  nodeWrapper: {
    position: 'absolute',
    transform: [{ translateX: -40 }],
  },
  nodeTouchArea: {
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    top: -6,
  },
  nodePin: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 8,
  },
  nodePinCurrent: {
    borderWidth: 3,
    borderColor: '#00FF41',
  },
  nodeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeLabelCard: {
    backgroundColor: 'rgba(20, 23, 36, 0.92)',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginTop: SPACING.xs,
    alignItems: 'center',
    minWidth: 120,
  },
  nodeTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  nodeMetaRow: {
    marginTop: 2,
  },
  nodeMetaBadge: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  nodeMetaLock: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontStyle: 'italic',
  },
  listViewContainer: {
    paddingHorizontal: SPACING.lg,
  },
  regionCard: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  cardBgImage: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  cardGradientOverlay: {
    borderRadius: BORDER_RADIUS.lg,
  },
  lockedCard: {
    opacity: 0.65,
  },
  glassInner: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  regionName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  regionSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  currentBadge: {
    backgroundColor: 'rgba(0, 255, 65, 0.2)',
    paddingHorizontal: SPACING.xs + 4,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.xs,
  },
  currentBadgeText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: 'bold',
  },
  regionDesc: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
    marginVertical: SPACING.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.round,
  },
  diffText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  lockProgressContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  unlockText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginBottom: 3,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  inspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inspectBtnText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: 2,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 85,
    left: SPACING.md,
    right: SPACING.md,
  },
  footerGlass: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.xl,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  footerRegionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  footerRegionMeta: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  travelBtn: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  travelGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 4,
  },
  travelBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: SPACING.xs,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  /* TELEPORT MODAL STYLES */
  teleportModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  teleportCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: '#161926',
  },
  teleportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teleportTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  teleportSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  teleportOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  teleportRegionName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  teleportRegionSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  activeBaseTag: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: 'bold',
  },
  warpTag: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.round,
  },
  warpTagText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '85%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: SPACING.lg,
    backgroundColor: '#161926',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalBossIcon: {
    fontSize: 28,
    marginRight: SPACING.sm,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalSubTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  modalScroll: {
    marginBottom: SPACING.sm,
  },
  modalBannerImage: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  regionBannerGradient: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  bannerTag: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
  },
  bannerTagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  minLvlBadge: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalDesc: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 19,
  },
  virtualWorldLaunchBtn: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  virtualWorldLaunchGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  virtualWorldLaunchText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: SPACING.sm,
  },
  sectionContainer: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  bossCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 85, 0.2)',
  },
  bossNameText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  enemyPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  enemyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 85, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.xs,
    marginTop: SPACING.xs,
  },
  enemyPillText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  actionLaunchBtn: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  actionLaunchGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  actionLaunchText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: SPACING.sm,
  },
  dualLaunchRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  dualLaunchBtn: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  smallLaunchText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  modalBossPortraitBox: {
    height: 120,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
    position: 'relative',
  },
  modalBossPortraitImg: {
    width: '100%',
    height: '100%',
  },
  modalBossOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: SPACING.xs + 4,
  },
});
