import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { MapPin, Lock, Info, ChevronRight } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../styles/theme';
import { GlassCard } from '../../components/ui/GlassCard';

const REGIONS = [
  { 
    id: 'village', 
    name: 'Silverleaf Village', 
    description: 'A peaceful start. Training dummies and low-level slimes.',
    difficulty: 'Easy',
    unlocked: true,
    color: '#00FF41'
  },
  { 
    id: 'forest', 
    name: 'Whispering Woods', 
    description: 'Dense trees and ancient ruins. Beware of goblins.',
    difficulty: 'Medium',
    unlocked: false,
    color: '#00F0FF'
  },
  { 
    id: 'dungeon', 
    name: 'The Abyss', 
    description: 'The final challenge. Face the Dragon Lord.',
    difficulty: 'Hard',
    unlocked: false,
    color: '#FF0055'
  }
];

export const MapScreen = () => {
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, COLORS.surface]}
        style={styles.background}
      />

      <View style={styles.content}>
        <Text style={styles.title}>World Map</Text>
        <Text style={styles.subtitle}>Choose your destination</Text>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {REGIONS.map((region, index) => (
            <MotiView
              key={region.id}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: index * 100 }}
            >
              <TouchableOpacity
                onPress={() => region.unlocked && setSelectedRegion(region)}
                activeOpacity={0.8}
                style={[
                  styles.regionCard,
                  !region.unlocked && styles.lockedCard,
                  selectedRegion?.id === region.id && { borderColor: region.color, borderWidth: 2 }
                ]}
              >
                <GlassCard style={styles.glassInner}>
                  <View style={styles.cardHeader}>
                    <View style={styles.titleGroup}>
                      <MapPin size={20} color={region.unlocked ? region.color : COLORS.textSecondary} />
                      <Text style={[styles.regionName, !region.unlocked && { color: COLORS.textSecondary }]}>
                        {region.name}
                      </Text>
                    </View>
                    {!region.unlocked && <Lock size={16} color={COLORS.textSecondary} />}
                  </View>
                  
                  {region.unlocked && (
                    <>
                      <Text style={styles.regionDesc}>{region.description}</Text>
                      <View style={styles.difficultyBadge}>
                        <Text style={[styles.diffText, { color: region.color }]}>DIFFICULTY: {region.difficulty}</Text>
                      </View>
                    </>
                  )}
                  
                  {!region.unlocked && (
                    <Text style={styles.unlockText}>Requires Level 5 to unlock</Text>
                  )}
                </GlassCard>
              </TouchableOpacity>
            </MotiView>
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={[styles.travelBtn, !selectedRegion?.unlocked && styles.disabledBtn]}
          disabled={!selectedRegion?.unlocked}
        >
          <LinearGradient
            colors={[selectedRegion?.color || COLORS.primary, COLORS.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.travelGradient}
          >
            <Text style={styles.travelBtnText}>TRAVEL TO {selectedRegion?.name.toUpperCase()}</Text>
            <ChevronRight size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
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
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: SPACING.md,
  },
  subtitle: {
    color: COLORS.primary,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: SPACING.xl,
  },
  scroll: {
    paddingBottom: 100,
  },
  regionCard: {
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  lockedCard: {
    opacity: 0.6,
  },
  glassInner: {
    padding: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  regionName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: SPACING.md,
  },
  regionDesc: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    alignSelf: 'flex-start',
  },
  diffText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  unlockText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  travelBtn: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: SPACING.lg,
    right: SPACING.lg,
    height: 60,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    elevation: 5,
  },
  travelGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  travelBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: SPACING.sm,
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
