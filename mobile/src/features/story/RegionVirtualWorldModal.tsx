import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ImageBackground,
  Image,
  Dimensions,
  ScrollView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import {
  X,
  Compass,
  Zap,
  Swords,
  Shield,
  Activity,
  Eye,
  Sparkles,
  Flame,
  Skull,
  Award,
  ChevronRight,
  Crosshair,
  Radio,
  MapPin,
  CheckCircle2,
  Gift,
  Trophy,
  Sliders,
  Layers,
  ChevronDown
} from 'lucide-react-native';

import { COLORS, SPACING, BORDER_RADIUS } from '../../styles/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { useUserStore } from '../../store/useUserStore';
import { RegionData } from './MapScreen';

const { width, height } = Dimensions.get('window');

// Local Photorealistic AAA Assets
export const REGION_IMAGES: Record<string, any> = {
  village: require('../../../assets/regions/village.png'),
  forest: require('../../../assets/regions/forest.png'),
  caverns: require('../../../assets/regions/caverns.png'),
  citadel: require('../../../assets/regions/citadel.png'),
  abyss: require('../../../assets/regions/abyss.png'),
};

export const BOSS_IMAGES: Record<string, any> = {
  village: require('../../../assets/bosses/slime_king.png'),
  forest: require('../../../assets/bosses/goblin_warlord.png'),
  caverns: require('../../../assets/bosses/glacial_wyrm.png'),
  citadel: require('../../../assets/bosses/demon_general.png'),
  abyss: require('../../../assets/bosses/sovereign_dragon.png'),
};

export type GateTier = 'BLUE' | 'PURPLE' | 'RED';

interface POI {
  id: string;
  type: 'BOSS' | 'MANA' | 'RUNE' | 'TRAINING' | 'PORTAL' | 'SECRET_CHEST';
  title: string;
  subtitle: string;
  x: number;
  y: number;
  icon: string;
  color: string;
}

interface RegionalQuest {
  id: string;
  title: string;
  reward: { xp: number; coins: number };
  completed: boolean;
  claimed: boolean;
}

interface RegionVirtualWorldModalProps {
  visible: boolean;
  region: RegionData;
  onClose: () => void;
  onNavigateMode: (mode: 'ARENA' | 'TRAINING' | 'SURVIVAL' | 'VISION', gateTier: GateTier) => void;
}

const REGION_ATMOSPHERES: Record<string, { weather: string; buff: string; color: string; vfxIcon: string }> = {
  village: {
    weather: '☀️ GOLDEN SUNSHINE • GENTLE BREEZE',
    buff: '⚡ MANA REGEN +20% • BEGINNER PROTECTION ACTIVE',
    color: '#00FF41',
    vfxIcon: '✨'
  },
  forest: {
    weather: '⚡ MYSTICAL MANA STORM • RED GATE ACTIVE',
    buff: '🔥 EXP MULTIPLIER +50% • GOBLIN AMBUSH CHANCE +25%',
    color: '#00F0FF',
    vfxIcon: '🌿'
  },
  caverns: {
    weather: '❄️ SUB-ZERO BLIZZARD • ICE CRYSTAL HAIL',
    buff: '🛡️ FROST RESISTANCE TEST • DEFENSE BUFF +15%',
    color: '#0088FF',
    vfxIcon: '❄️'
  },
  citadel: {
    weather: '🔥 VOLCANIC MAGMA RAIN • DEMON EMBER STORM',
    buff: '⚔️ ATK DAMAGE +30% • MANA CONSUMPTION +10%',
    color: '#FF0055',
    vfxIcon: '🔥'
  },
  abyss: {
    weather: '🌌 COSMIC NEBULA SHIFT • VOID DISTORTION',
    buff: '✨ ALL STATS +50% • SOVEREIGN SHADOW AWAKENING',
    color: '#A020F0',
    vfxIcon: '🌌'
  }
};

const GET_POIS = (regionId: string, bossName: string): POI[] => [
  {
    id: 'poi_boss',
    type: 'BOSS',
    title: `Boss Altar: ${bossName}`,
    subtitle: 'Challenge Regional Dominator in Gate Raid',
    x: 48,
    y: 35,
    icon: '👹',
    color: '#FF0055'
  },
  {
    id: 'poi_mana',
    type: 'MANA',
    title: 'Bioluminescent Mana Node',
    subtitle: 'Harvest pure ambient mana & coins',
    x: 20,
    y: 52,
    icon: '💎',
    color: '#00F0FF'
  },
  {
    id: 'poi_rune',
    type: 'RUNE',
    title: 'Ancient Sovereign Obelisk',
    subtitle: 'Inspect rune markings for stat empowerment',
    x: 72,
    y: 45,
    icon: '📜',
    color: '#A020F0'
  },
  {
    id: 'poi_training',
    type: 'TRAINING',
    title: 'Warrior Battle Grounds',
    subtitle: 'Initiate workout & rep tracking expedition',
    x: 32,
    y: 70,
    icon: '🏋️',
    color: '#00FF41'
  },
  {
    id: 'poi_portal',
    type: 'PORTAL',
    title: 'Dimensional Gate Portal',
    subtitle: 'Enter AR Vision Quest or Survival Gate',
    x: 78,
    y: 72,
    icon: '🌀',
    color: '#FFD700'
  },
  {
    id: 'poi_secret_chest',
    type: 'SECRET_CHEST',
    title: 'Hidden Sovereign Treasure Vault',
    subtitle: 'Secret hidden chest discovered in the landscape',
    x: 110,
    y: 58,
    icon: '🎁',
    color: '#FFD700'
  }
];

export const RegionVirtualWorldModal: React.FC<RegionVirtualWorldModalProps> = ({
  visible,
  region,
  onClose,
  onNavigateMode
}) => {
  const addCoins = useUserStore((state) => state.addCoins);
  const addXP = useUserStore((state) => state.addXP);
  const updateStats = useUserStore((state) => state.updateStats);
  const stats = useUserStore((state) => state.stats);

  const [selectedGateTier, setSelectedGateTier] = useState<GateTier>('BLUE');
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [harvestedPOIs, setHarvestedPOIs] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'EXPLORE' | 'QUESTS'>('EXPLORE');

  const [regionalQuests, setRegionalQuests] = useState<RegionalQuest[]>([
    {
      id: 'q1',
      title: `Scout ${region.name} Perimeter`,
      reward: { xp: 250, coins: 150 },
      completed: true,
      claimed: false,
    },
    {
      id: 'q2',
      title: `Defeat ${region.bossName}`,
      reward: { xp: 800, coins: 500 },
      completed: false,
      claimed: false,
    },
    {
      id: 'q3',
      title: 'Harvest Regional Mana Deposit',
      reward: { xp: 400, coins: 200 },
      completed: false,
      claimed: false,
    }
  ]);

  const atmosphere = REGION_ATMOSPHERES[region.id] || REGION_ATMOSPHERES.village;
  const pois = GET_POIS(region.id, region.bossName);

  const getTierMultiplier = (): number => {
    switch (selectedGateTier) {
      case 'PURPLE': return 1.8;
      case 'RED': return 3.0;
      default: return 1.0;
    }
  };

  const handleClaimQuest = (questId: string) => {
    setRegionalQuests(prev => prev.map(q => {
      if (q.id === questId && q.completed && !q.claimed) {
        addXP(q.reward.xp);
        addCoins(q.reward.coins);
        Alert.alert('🎉 Quest Claimed!', `+${q.reward.xp} XP & +${q.reward.coins} Coins added to inventory!`);
        return { ...q, claimed: true };
      }
      return q;
    }));
  };

  const handleClaimManaNode = (poiId: string) => {
    if (harvestedPOIs[poiId]) {
      Alert.alert('Depleted', 'This Mana Node is depleted. Recharges during next gate cycle.');
      return;
    }
    const bonusCoins = Math.round(150 * getTierMultiplier());
    addCoins(bonusCoins);
    updateStats({ mana: Math.min(stats.maxMana, stats.mana + 50) });
    setHarvestedPOIs((prev) => ({ ...prev, [poiId]: true }));
    setRegionalQuests(prev => prev.map(q => q.id === 'q3' ? { ...q, completed: true } : q));

    Alert.alert('💎 Mana Harvested!', `+${bonusCoins} Coins & +50 Mana added to inventory!`);
    setSelectedPOI(null);
  };

  const handleInspectRune = () => {
    updateStats({ strength: stats.strength + 2 });
    Alert.alert('📜 Sovereign Rune Activated!', 'The ancient obelisk empowers your spirit: STRENGTH +2 permanently!');
    setSelectedPOI(null);
  };

  const handleClaimSecretChest = (poiId: string) => {
    if (harvestedPOIs[poiId]) {
      Alert.alert('Already Opened', 'You have already looted this Royal Vault.');
      return;
    }
    const coins = Math.round(500 * getTierMultiplier());
    addCoins(coins);
    addXP(300);
    setHarvestedPOIs((prev) => ({ ...prev, [poiId]: true }));
    Alert.alert('🎁 Royal Vault Unlocked!', `Congratulations! You found a hidden vault containing +${coins} Coins & +300 XP!`);
    setSelectedPOI(null);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>

        {/* TOP HUD BAR */}
        <View style={styles.topHudContainer}>
          <GlassCard style={styles.hudCard}>
            <View style={styles.hudRow}>
              <View style={styles.hudLeft}>
                <Compass size={18} color={region.color} style={{ marginRight: 6 }} />
                <View>
                  <Text style={styles.hudRegionTitle}>{region.name.toUpperCase()}</Text>
                  <Text style={styles.hudCoords}>COORD: N 44° 12' • SECTOR {region.minLevel}</Text>
                </View>
              </View>

              {/* Tab Selector: EXPLORE vs QUESTS */}
              <View style={styles.tabToggleRow}>
                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'EXPLORE' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('EXPLORE')}
                >
                  <Text style={[styles.tabBtnText, activeTab === 'EXPLORE' && styles.tabBtnTextActive]}>MAP</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'QUESTS' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('QUESTS')}
                >
                  <Text style={[styles.tabBtnText, activeTab === 'QUESTS' && styles.tabBtnTextActive]}>QUESTS</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.exitBtn} onPress={onClose}>
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* GATE RANK TIER SELECTOR */}
            <View style={styles.tierSelectorRow}>
              <Text style={styles.tierLabel}>GATE RANK TIER:</Text>
              <View style={styles.tierPillsContainer}>
                <TouchableOpacity
                  style={[styles.tierPill, selectedGateTier === 'BLUE' && styles.tierPillBlue]}
                  onPress={() => setSelectedGateTier('BLUE')}
                >
                  <Text style={[styles.tierPillText, selectedGateTier === 'BLUE' && { color: 'white' }]}>🔵 BLUE</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tierPill, selectedGateTier === 'PURPLE' && styles.tierPillPurple]}
                  onPress={() => setSelectedGateTier('PURPLE')}
                >
                  <Text style={[styles.tierPillText, selectedGateTier === 'PURPLE' && { color: 'white' }]}>🟣 PURPLE (1.8x)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tierPill, selectedGateTier === 'RED' && styles.tierPillRed]}
                  onPress={() => setSelectedGateTier('RED')}
                >
                  <Text style={[styles.tierPillText, selectedGateTier === 'RED' && { color: 'white' }]}>🔴 RED (3.0x)</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Environmental Weather & Atmosphere Bar */}
            <View style={styles.weatherBar}>
              <Radio size={14} color={atmosphere.color} style={{ marginRight: 6 }} />
              <Text style={[styles.weatherText, { color: atmosphere.color }]}>
                {atmosphere.weather}
              </Text>
            </View>
          </GlassCard>
        </View>

        {activeTab === 'EXPLORE' ? (
          /* PANORAMIC SWIPEABLE LANDSCAPE CANVAS WITH ANIMATED ENVIRONMENTAL VFX */
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{ width: width * 1.45, height }}
            style={{ flex: 1 }}
          >
            <ImageBackground
              source={REGION_IMAGES[region.id] || REGION_IMAGES.village}
              style={{ width: width * 1.45, height: '100%' }}
              resizeMode="cover"
            >
              {/* Filmic Vignette Dark Gradients */}
              <LinearGradient
                colors={['rgba(10, 12, 20, 0.95)', 'rgba(10, 12, 20, 0.15)', 'rgba(10, 12, 20, 0.95)']}
                style={styles.vignetteGradient}
              />

              {/* DYNAMIC ENVIRONMENTAL ANIMATED VFX PARTICLES */}
              <MotiView
                from={{ translateY: -20, opacity: 0.3 }}
                animate={{ translateY: 20, opacity: 0.8 }}
                transition={{ loop: true, duration: 2500, type: 'timing' }}
                style={[styles.vfxParticleLayer, { top: 180, left: '20%' }]}
              >
                <Text style={styles.vfxIconText}>{atmosphere.vfxIcon}</Text>
              </MotiView>

              <MotiView
                from={{ translateY: 20, opacity: 0.4 }}
                animate={{ translateY: -20, opacity: 0.9 }}
                transition={{ loop: true, duration: 3000, type: 'timing' }}
                style={[styles.vfxParticleLayer, { top: 260, left: '65%' }]}
              >
                <Text style={styles.vfxIconText}>{atmosphere.vfxIcon}</Text>
              </MotiView>

              <MotiView
                from={{ translateY: -15, opacity: 0.2 }}
                animate={{ translateY: 15, opacity: 0.7 }}
                transition={{ loop: true, duration: 2200, type: 'timing' }}
                style={[styles.vfxParticleLayer, { top: 380, left: '85%' }]}
              >
                <Text style={styles.vfxIconText}>{atmosphere.vfxIcon}</Text>
              </MotiView>

              {/* INTERACTIVE POI HOTSPOTS ON THE VIRTUAL LANDSCAPE */}
              <View style={styles.viewportHotspotCanvas}>
                {pois.map((poi) => {
                  const isHarvested = harvestedPOIs[poi.id];

                  return (
                    <MotiView
                      key={poi.id}
                      from={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={[styles.poiWrapper, { left: `${poi.x}%`, top: `${poi.y}%` }]}
                    >
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.poiTouchArea}
                        onPress={() => setSelectedPOI(poi)}
                      >
                        {/* Glowing Pulse Ring around Hotspot */}
                        <MotiView
                          from={{ scale: 1, opacity: 0.9 }}
                          animate={{ scale: 1.5, opacity: 0 }}
                          transition={{ loop: true, duration: 1800 }}
                          style={[styles.poiPulseRing, { borderColor: poi.color }]}
                        />

                        {/* POI Hotspot Core Badge */}
                        <View style={[styles.poiBadge, { borderColor: poi.color }, isHarvested && { opacity: 0.5 }]}>
                          <Text style={styles.poiIconText}>{poi.icon}</Text>
                        </View>

                        {/* Label Tag */}
                        <View style={styles.poiLabelTag}>
                          <Text style={styles.poiLabelTitle}>{poi.title}</Text>
                        </View>
                      </TouchableOpacity>
                    </MotiView>
                  );
                })}
              </View>

              {/* PANORAMIC SWIPE TIP BADGE */}
              <View style={styles.swipeTipBadge}>
                <ChevronRight size={14} color={COLORS.primary} />
                <Text style={styles.swipeTipText}>Swipe left/right to discover hidden secret vaults</Text>
              </View>
            </ImageBackground>
          </ScrollView>
        ) : (
          /* REGIONAL QUESTS VIEW */
          <ScrollView contentContainerStyle={styles.questsContainer}>
            <Text style={styles.questsHeaderTitle}>REGIONAL OBJECTIVES & BOUNTIES</Text>
            {regionalQuests.map((quest) => (
              <GlassCard key={quest.id} style={styles.questCard}>
                <View style={styles.questRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.questTitleText}>{quest.title}</Text>
                    <View style={styles.questRewardRow}>
                      <Sparkles size={14} color={COLORS.xp} style={{ marginRight: 4 }} />
                      <Text style={styles.questRewardText}>+{quest.reward.xp} XP</Text>
                      <Trophy size={14} color={COLORS.warning} style={{ marginLeft: 8, marginRight: 4 }} />
                      <Text style={styles.questRewardText}>+{quest.reward.coins} Coins</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    disabled={!quest.completed || quest.claimed}
                    style={[
                      styles.claimQuestBtn,
                      quest.claimed && styles.claimedQuestBtn,
                      !quest.completed && styles.lockedQuestBtn
                    ]}
                    onPress={() => handleClaimQuest(quest.id)}
                  >
                    <Text style={styles.claimQuestBtnText}>
                      {quest.claimed ? 'CLAIMED' : quest.completed ? 'CLAIM' : 'IN PROGRESS'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}
          </ScrollView>
        )}

        {/* BOTTOM CONTROLS & EVENT PROMPT */}
        <View style={styles.bottomHudContainer}>
          <GlassCard style={styles.bottomGlass}>
            <View style={styles.bottomRow}>
              <View style={styles.exploreBadge}>
                <Sparkles size={14} color={region.color} style={{ marginRight: 4 }} />
                <Text style={styles.exploreBadgeText}>
                  {selectedGateTier} GATE ({(getTierMultiplier() * 100).toFixed(0)}% EXP/LOOT)
                </Text>
              </View>
              <Text style={styles.tapTipText}>Tap hotspots or swipe panorama</Text>
            </View>
          </GlassCard>
        </View>

        {/* POI INTERACTION DETAIL SHEET WITH PHOTOREALISTIC 8K BOSS PORTRAIT */}
        {selectedPOI && (
          <View style={styles.poiSheetOverlay}>
            <GlassCard style={styles.poiSheetCard}>
              <View style={styles.sheetHeader}>
                <View style={styles.sheetTitleRow}>
                  <Text style={styles.sheetIcon}>{selectedPOI.icon}</Text>
                  <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                    <Text style={styles.sheetTitle}>{selectedPOI.title}</Text>
                    <Text style={styles.sheetSubtitle}>{selectedPOI.subtitle}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setSelectedPOI(null)}>
                  <X size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Action Triggers depending on POI type */}
              {selectedPOI.type === 'BOSS' && (
                <View style={styles.poiActionContent}>
                  {/* PHOTOREALISTIC AAA BOSS PORTRAIT CARD */}
                  <View style={styles.bossPortraitContainer}>
                    <Image
                      source={BOSS_IMAGES[region.id] || BOSS_IMAGES.village}
                      style={styles.bossPortraitImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(15, 17, 26, 0.95)']}
                      style={styles.bossPortraitOverlay}
                    >
                      <View style={styles.bossBadgeRow}>
                        <View style={styles.bossLvlBadge}>
                          <Skull size={12} color="#FF0055" style={{ marginRight: 4 }} />
                          <Text style={styles.bossLvlText}>BOSS LVL {region.minLevel * 2}</Text>
                        </View>
                        <Text style={styles.bossNameBadge}>{region.bossName.toUpperCase()}</Text>
                      </View>
                    </LinearGradient>
                  </View>

                  <Text style={styles.poiDescText}>
                    The regional boss {region.bossName} awaits in the {selectedGateTier} Gate Raid. Defeating this boss yields {getTierMultiplier()}x bonus XP and rare Shadow Extraction chances!
                  </Text>

                  <TouchableOpacity
                    style={styles.sheetLaunchBtn}
                    onPress={() => {
                      setSelectedPOI(null);
                      onNavigateMode('ARENA', selectedGateTier);
                    }}
                  >
                    <LinearGradient colors={['#FF0055', '#A020F0']} style={styles.sheetLaunchGradient}>
                      <Swords size={20} color="white" />
                      <Text style={styles.sheetLaunchBtnText}>CHALLENGE BOSS IN {selectedGateTier} GATE</Text>
                      <ChevronRight size={18} color="white" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {selectedPOI.type === 'MANA' && (
                <View style={styles.poiActionContent}>
                  <Text style={styles.poiDescText}>
                    A dense concentration of ambient mana. Tap below to harvest energy crystals for your inventory!
                  </Text>
                  <TouchableOpacity
                    style={styles.sheetLaunchBtn}
                    onPress={() => handleClaimManaNode(selectedPOI.id)}
                  >
                    <LinearGradient colors={['#00F0FF', '#0072FF']} style={styles.sheetLaunchGradient}>
                      <Sparkles size={20} color="white" />
                      <Text style={styles.sheetLaunchBtnText}>HARVEST MANA (+{Math.round(150 * getTierMultiplier())} COINS)</Text>
                      <ChevronRight size={18} color="white" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {selectedPOI.type === 'RUNE' && (
                <View style={styles.poiActionContent}>
                  <Text style={styles.poiDescText}>
                    An ancient Monarch rune carved into obsidian stone. Absorbing its power permanently grants +2 Strength!
                  </Text>
                  <TouchableOpacity
                    style={styles.sheetLaunchBtn}
                    onPress={handleInspectRune}
                  >
                    <LinearGradient colors={['#A020F0', '#6200EE']} style={styles.sheetLaunchGradient}>
                      <Zap size={20} color="white" />
                      <Text style={styles.sheetLaunchBtnText}>ABSORB RUNE POWER (+2 STR)</Text>
                      <ChevronRight size={18} color="white" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {selectedPOI.type === 'SECRET_CHEST' && (
                <View style={styles.poiActionContent}>
                  <Text style={styles.poiDescText}>
                    A rare royal treasure vault hidden in the landscape! Open to claim massive coins & XP rewards!
                  </Text>
                  <TouchableOpacity
                    style={styles.sheetLaunchBtn}
                    onPress={() => handleClaimSecretChest(selectedPOI.id)}
                  >
                    <LinearGradient colors={['#FFD700', '#FF8800']} style={styles.sheetLaunchGradient}>
                      <Gift size={20} color="white" />
                      <Text style={styles.sheetLaunchBtnText}>UNLOCK SECRET VAULT (+{Math.round(500 * getTierMultiplier())} COINS)</Text>
                      <ChevronRight size={18} color="white" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {selectedPOI.type === 'TRAINING' && (
                <View style={styles.poiActionContent}>
                  <Text style={styles.poiDescText}>
                    Initiate a physical workout session in this region to level up your hunter stats and earn coins!
                  </Text>
                  <TouchableOpacity
                    style={styles.sheetLaunchBtn}
                    onPress={() => {
                      setSelectedPOI(null);
                      onNavigateMode('TRAINING', selectedGateTier);
                    }}
                  >
                    <LinearGradient colors={['#00FF41', '#00B32C']} style={styles.sheetLaunchGradient}>
                      <Activity size={20} color="white" />
                      <Text style={styles.sheetLaunchBtnText}>START WORKOUT SESSION ({selectedGateTier} TIER)</Text>
                      <ChevronRight size={18} color="white" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {selectedPOI.type === 'PORTAL' && (
                <View style={styles.poiActionContent}>
                  <Text style={styles.poiDescText}>
                    Step through the dimensional portal into AR Vision Quest or Survival Gate Raids!
                  </Text>
                  <View style={styles.dualLaunchRow}>
                    <TouchableOpacity
                      style={[styles.sheetLaunchBtn, { flex: 1, marginRight: 4 }]}
                      onPress={() => {
                        setSelectedPOI(null);
                        onNavigateMode('SURVIVAL', selectedGateTier);
                      }}
                    >
                      <LinearGradient colors={['#00FF41', '#0088FF']} style={styles.sheetLaunchGradient}>
                        <Shield size={16} color="white" />
                        <Text style={[styles.sheetLaunchBtnText, { fontSize: 11 }]}>SURVIVAL</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.sheetLaunchBtn, { flex: 1, marginLeft: 4 }]}
                      onPress={() => {
                        setSelectedPOI(null);
                        onNavigateMode('VISION', selectedGateTier);
                      }}
                    >
                      <LinearGradient colors={['#A020F0', '#FF0055']} style={styles.sheetLaunchGradient}>
                        <Eye size={16} color="white" />
                        <Text style={[styles.sheetLaunchBtnText, { fontSize: 11 }]}>AR VISION</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </GlassCard>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F111A',
  },
  vignetteGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  vfxParticleLayer: {
    position: 'absolute',
    zIndex: 2,
  },
  vfxIconText: {
    fontSize: 22,
    opacity: 0.8,
  },
  topHudContainer: {
    position: 'absolute',
    top: SPACING.xl + 10,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 10,
  },
  hudCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: 'rgba(15, 17, 26, 0.88)',
  },
  hudRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hudLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  hudRegionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1.1,
  },
  hudCoords: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.sm,
    padding: 2,
    marginRight: SPACING.sm,
  },
  tabBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabBtnText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabBtnTextActive: {
    color: COLORS.background,
  },
  exitBtn: {
    padding: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.round,
  },
  tierSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  tierLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: SPACING.xs,
  },
  tierPillsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  tierPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: SPACING.xs + 4,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.round,
  },
  tierPillText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  tierPillBlue: {
    backgroundColor: '#0088FF',
  },
  tierPillPurple: {
    backgroundColor: '#A020F0',
  },
  tierPillRed: {
    backgroundColor: '#FF0055',
  },
  weatherBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs + 2,
  },
  weatherText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  viewportHotspotCanvas: {
    flex: 1,
    position: 'relative',
  },
  poiWrapper: {
    position: 'absolute',
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  poiTouchArea: {
    alignItems: 'center',
  },
  poiPulseRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    top: -5,
  },
  poiBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: 'rgba(15, 17, 26, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  poiIconText: {
    fontSize: 18,
  },
  poiLabelTag: {
    backgroundColor: 'rgba(15, 17, 26, 0.92)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginTop: 4,
  },
  poiLabelTitle: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  swipeTipBadge: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  swipeTipText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  /* QUESTS VIEW */
  questsContainer: {
    paddingTop: 180,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 120,
  },
  questsHeaderTitle: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginBottom: SPACING.md,
  },
  questCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(30, 33, 48, 0.9)',
  },
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questTitleText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  questRewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questRewardText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  claimQuestBtn: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.md,
  },
  claimedQuestBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  lockedQuestBtn: {
    backgroundColor: 'rgba(255, 0, 85, 0.2)',
  },
  claimQuestBtnText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  /* BOTTOM HUD */
  bottomHudContainer: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 10,
  },
  bottomGlass: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: 'rgba(15, 17, 26, 0.85)',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exploreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exploreBadgeText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: 'bold',
  },
  tapTipText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontStyle: 'italic',
  },
  /* POI SHEET */
  poiSheetOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
    zIndex: 20,
  },
  poiSheetCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: '#161926',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sheetIcon: {
    fontSize: 32,
  },
  sheetTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  sheetSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  sheetCloseBtn: {
    padding: SPACING.xs,
  },
  poiActionContent: {
    marginTop: SPACING.xs,
  },
  bossPortraitContainer: {
    height: 140,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    position: 'relative',
  },
  bossPortraitImage: {
    width: '100%',
    height: '100%',
  },
  bossPortraitOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: SPACING.md,
  },
  bossBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bossLvlBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 85, 0.3)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
  },
  bossLvlText: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  bossNameBadge: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  poiDescText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: SPACING.md,
  },
  sheetLaunchBtn: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.xs,
  },
  sheetLaunchGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  sheetLaunchBtnText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    marginHorizontal: SPACING.sm,
  },
  dualLaunchRow: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
});
