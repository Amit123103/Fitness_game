import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import { ChevronLeft, Zap, Shield, Swords, ArrowUp, Info, Skull } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, useAppTheme } from '../../styles/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { useUserStore } from '../../store/useUserStore';

const { width } = Dimensions.get('window');

export const ShadowArmyScreen = () => {
  const navigation = useNavigation();
  const themeColors = useAppTheme() as any;
  const { shadowArmy, skillPoints, upgradeShadow, stats } = useUserStore();
  
  const totalMPCost = shadowArmy.reduce((acc, s) => acc + s.manaCost, 0);
  const totalATK = shadowArmy.reduce((acc, s) => acc + s.baseDamage, 0);
  const renderShadowCard = ({ item, index }: any) => {
    const isSRank = item.rank === 'S';
    const canUpgrade = skillPoints >= (item.level * 2);
    
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.9, translateX: -20 }}
        animate={{ opacity: 1, scale: 1, translateX: 0 }}
        transition={{ delay: index * 100 }}
      >
        <GlassCard style={[
          styles.shadowCard, 
          { borderColor: isSRank ? themeColors.accent : 'rgba(255,255,255,0.05)' },
          isSRank && SHADOWS.neonSecondary
        ]}>
          <LinearGradient
            colors={isSRank ? ['rgba(160, 32, 240, 0.15)', 'rgba(0, 0, 0, 0.8)'] : ['rgba(255, 255, 255, 0.03)', 'rgba(0, 0, 0, 0.6)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={styles.shadowBaseInfo}>
                <View style={[styles.rankBadgeContainer, { backgroundColor: isSRank ? `${themeColors.accent}20` : 'rgba(255,255,255,0.05)' }]}>
                  <Text style={[styles.shadowRank, { color: isSRank ? themeColors.accent : themeColors.textSecondary }]}>
                    {item.rank}-RANK
                  </Text>
                </View>
                <Text style={[styles.shadowName, { color: themeColors.text }]}>{item.name}</Text>
              </View>
              <View style={[styles.levelBadge, { backgroundColor: `${themeColors.primary}15` }]}>
                <Text style={[styles.levelText, { color: themeColors.primary }]}>LV. {item.level}</Text>
              </View>
            </View>

            <View style={styles.attributeGrid}>
              <View style={styles.attrItem}>
                <Swords size={12} color={themeColors.secondary} />
                <Text style={[styles.attrLabel, { color: themeColors.textSecondary }]}>POWER</Text>
                <Text style={styles.attrValue}>{item.baseDamage}</Text>
              </View>
              <View style={styles.attrItem}>
                <Zap size={12} color={themeColors.primary} />
                <Text style={[styles.attrLabel, { color: themeColors.textSecondary }]}>MP COST</Text>
                <Text style={styles.attrValue}>{item.manaCost}</Text>
              </View>
              <View style={styles.attrItem}>
                <Shield size={12} color={themeColors.success} />
                <Text style={[styles.attrLabel, { color: themeColors.textSecondary }]}>REGEN</Text>
                <Text style={styles.attrValue}>FAST</Text>
              </View>
            </View>

            <View style={styles.powerBarContainer}>
               <View style={styles.powerBarBg}>
                  <MotiView 
                    animate={{ width: `${(item.baseDamage / 1000) * 100}%` }}
                    style={[styles.powerBarFill, { backgroundColor: isSRank ? themeColors.accent : themeColors.secondary }]} 
                  />
               </View>
            </View>

            <View style={styles.cardActions}>
              <View style={styles.abilityInfo}>
                <Info size={12} color={themeColors.textSecondary} />
                <Text style={styles.abilityText} numberOfLines={1}>{item.ability}</Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.upgradeBtn, !canUpgrade && styles.disabledBtn]}
                onPress={() => upgradeShadow(item.id)}
                disabled={!canUpgrade || item.level >= 10}
              >
                <ArrowUp size={14} color="white" />
                <Text style={styles.upgradeText}>ENHANCE</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </GlassCard>
      </MotiView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <LinearGradient
        colors={[themeColors.background, '#000']}
        style={styles.background}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={28} color={themeColors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeColors.text }]}>SHADOW SOVEREIGN</Text>
        <View style={styles.spBadge}>
           <Text style={styles.spText}>{skillPoints} SP</Text>
        </View>
      </View>

      <View style={styles.monarchHUD}>
        <View style={styles.hudBackground}>
           <LinearGradient 
             colors={['rgba(160, 32, 240, 0.05)', 'transparent']} 
             style={StyleSheet.absoluteFill} 
           />
           <View style={styles.scanline} />
        </View>

        <View style={styles.hudLeft}>
           <Text style={styles.hudLabel}>ARMY CAPACITY</Text>
           <Text style={[styles.hudValue, { color: themeColors.accent }]}>{shadowArmy.length}</Text>
        </View>

        <View style={styles.hudCenter}>
           <View style={styles.manaUsageContainer}>
              <Text style={styles.hudLabel}>EST. MANA CONSUMPTION</Text>
              <View style={styles.manaUsageRow}>
                 <Zap size={14} color={themeColors.primary} />
                 <Text style={[styles.manaUsageValue, { color: themeColors.primary }]}>{totalMPCost} / {stats.mana}</Text>
              </View>
              <View style={styles.miniManaBarBg}>
                 <MotiView 
                   animate={{ width: `${Math.min((totalMPCost / stats.mana) * 100, 100)}%` }}
                   style={[styles.miniManaBarFill, { backgroundColor: themeColors.primary }]} 
                 />
              </View>
           </View>
        </View>

        <View style={styles.hudRight}>
           <Text style={styles.hudLabel}>TOTAL ATK</Text>
           <Text style={[styles.hudValue, { color: themeColors.secondary }]}>{totalATK}</Text>
        </View>
      </View>

      {shadowArmy.length > 0 ? (
        <FlatList
          data={shadowArmy}
          renderItem={renderShadowCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Skull size={64} color="rgba(160, 32, 240, 0.2)" />
          <Text style={styles.emptyTitle}>THE ABYSS IS EMPTY</Text>
          <Text style={styles.emptyDesc}>Defeat high-ranking bosses to extract their shadows.</Text>
          <TouchableOpacity 
            style={styles.arenaBtn}
            onPress={() => (navigation as any).navigate('Main', { screen: 'Arena' })}
          >
            <Text style={styles.arenaBtnText}>ENTER ARENA</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
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
  title: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  spBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  spText: {
    fontSize: 12,
    fontWeight: '900',
  },
  monarchHUD: {
    flexDirection: 'row',
    height: 100,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(160, 32, 240, 0.2)',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  hudBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  scanline: {
    height: 1,
    backgroundColor: 'rgba(160, 32, 240, 0.2)',
    width: '100%',
    position: 'absolute',
    top: '30%',
  },
  hudLeft: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.05)',
  },
  hudCenter: {
    flex: 2,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  hudRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.05)',
  },
  hudLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    marginBottom: 4,
    textAlign: 'center',
  },
  hudValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  manaUsageContainer: {
    width: '100%',
  },
  manaUsageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  manaUsageValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  miniManaBarBg: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  miniManaBarFill: {
    height: '100%',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40,
  },
  shadowCard: {
    marginBottom: SPACING.lg,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardGradient: {
    padding: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  shadowBaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 2,
    marginRight: 10,
  },
  shadowRank: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  shadowName: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '900',
  },
  attributeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  attrItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attrLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  attrValue: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
  },
  powerBarContainer: {
    marginBottom: SPACING.lg,
  },
  powerBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  powerBarFill: {
    height: '100%',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  abilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.md,
  },
  abilityText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  upgradeBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.3,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  upgradeText: {
    color: 'black',
    fontWeight: '900',
    fontSize: 10,
    marginLeft: 4,
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
    marginTop: SPACING.xl,
    letterSpacing: 3,
  },
  emptyDesc: {
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: SPACING.xl,
    fontWeight: '500',
  },
  arenaBtn: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A020F0',
    backgroundColor: 'rgba(160, 32, 240, 0.1)',
  },
  arenaBtnText: {
    color: '#A020F0',
    fontWeight: '900',
    letterSpacing: 2,
    fontSize: 12,
  },
});
