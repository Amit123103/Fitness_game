import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { 
  ChevronLeft, Phone, Volume2, Palette, ShieldCheck, 
  Info, Cpu, Bell, Activity, Lock, Share2
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, useAppTheme } from '../../styles/theme';
import { useUserStore } from '../../store/useUserStore';
import { GlassCard } from '../../components/ui/GlassCard';

const { width } = Dimensions.get('window');

export const SettingsScreen = () => {
  const navigation = useNavigation();
  const themeColors = useAppTheme();
  const { systemSettings, updateSettings } = useUserStore();

  const SettingToggle = ({ label, value, onToggle, icon: Icon, color }: any) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
          <Icon size={20} color={color} />
        </View>
        <Text style={[styles.settingLabel, { color: themeColors.text }]}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#2A2D3E', true: color }}
        thumbColor={value ? '#FFF' : '#A0A0B0'}
      />
    </View>
  );

  const ThemeOption = ({ type, color }: { type: 'CYAN' | 'RED' | 'PURPLE', color: string }) => (
    <TouchableOpacity 
      style={[
        styles.themeOption, 
        { borderColor: systemSettings.theme === type ? color : 'transparent' }
      ]}
      onPress={() => updateSettings({ theme: type })}
    >
      <View style={[styles.themeCircle, { backgroundColor: color }]} />
      <Text style={[styles.themeLabel, { color: themeColors.textSecondary }, systemSettings.theme === type && { color }]}>{type}</Text>
    </TouchableOpacity>
  );

  const ModeOption = ({ mode, label, icon: Icon }: { mode: 'DARK' | 'LIGHT' | 'NATURAL', label: string, icon: any }) => (
    <TouchableOpacity 
      style={[
        styles.modeOption, 
        systemSettings.themeMode === mode && { borderColor: themeColors.primary, backgroundColor: 'rgba(255,255,255,0.05)' }
      ]}
      onPress={() => updateSettings({ themeMode: mode })}
    >
      <Icon size={24} color={systemSettings.themeMode === mode ? themeColors.primary : themeColors.textSecondary} />
      <Text style={[styles.modeOptionLabel, { color: systemSettings.themeMode === mode ? themeColors.primary : themeColors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <LinearGradient
        colors={[themeColors.background, themeColors.surface]}
        style={styles.background}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>System Configuration</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* System Diagnostics */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
        >
          <GlassCard style={[styles.diagnosticCard, { borderColor: `${themeColors.primary}33` }]}>
            <View style={styles.diagnosticHeader}>
              <Cpu size={16} color={themeColors.primary} />
              <Text style={[styles.diagnosticTitle, { color: themeColors.primary }]}>SYSTEM STATUS: OPTIMAL</Text>
            </View>
            <View style={styles.diagnosticGrid}>
              <View style={styles.diagItem}>
                <Text style={styles.diagLabel}>CORE VERS</Text>
                <Text style={[styles.diagValue, { color: themeColors.text }]}>v2.0.4-β</Text>
              </View>
              <View style={styles.diagItem}>
                <Text style={styles.diagLabel}>LATENCY</Text>
                <Text style={[styles.diagValue, { color: themeColors.success }]}>14ms</Text>
              </View>
            </View>
          </GlassCard>
        </MotiView>

        {/* Appearance Mode Section */}
        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Appearance Mode</Text>
        <GlassCard style={styles.settingsCard}>
           <View style={styles.modeGrid}>
             <ModeOption mode="DARK" label="Dark" icon={Activity} />
             <ModeOption mode="LIGHT" label="Light" icon={Activity} />
             <ModeOption mode="NATURAL" label="Natural" icon={Activity} />
           </View>
        </GlassCard>

        {/* Audio & Haptic Section */}
        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Audio & Haptics</Text>
        <GlassCard style={styles.settingsCard}>
          <SettingToggle 
            label="Haptic Feedback" 
            value={systemSettings.haptics} 
            onToggle={(v: boolean) => updateSettings({ haptics: v })}
            icon={Activity}
            color={themeColors.primary}
          />
          <SettingToggle 
            label="System Alerts" 
            value={systemSettings.sounds} 
            onToggle={(v: boolean) => updateSettings({ sounds: v })}
            icon={Volume2}
            color={themeColors.secondary}
          />
        </GlassCard>

        {/* Display & Interface */}
        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>System Interface</Text>
        <GlassCard style={styles.settingsCard}>
          <View style={styles.themeHeader}>
            <Palette size={20} color={themeColors.primary} />
            <Text style={[styles.themeTitle, { color: themeColors.text }]}>Accent Color Flux</Text>
          </View>
          <View style={styles.themeGrid}>
            <ThemeOption type="CYAN" color="#00F0FF" />
            <ThemeOption type="RED" color="#FF0055" />
            <ThemeOption type="PURPLE" color="#A020F0" />
          </View>
        </GlassCard>

        {/* Privacy & Security */}
        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Identity & Security</Text>
        <GlassCard style={styles.settingsCard}>
          <SettingToggle 
            label="Stealth Mode (Privacy)" 
            value={systemSettings.privacyMode} 
            onToggle={(v: boolean) => updateSettings({ privacyMode: v })}
            icon={Lock}
            color={themeColors.success}
          />
          <TouchableOpacity style={styles.actionBtn}>
            <View style={styles.actionMain}>
              <Share2 size={20} color={themeColors.textSecondary} />
              <Text style={[styles.actionText, { color: themeColors.text }]}>Sync Health Cloud</Text>
            </View>
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveText}>OFFLINE</Text>
            </View>
          </TouchableOpacity>
        </GlassCard>

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: themeColors.textSecondary }]}>SYSTEM ARCHITECTURE BY THE CREATORS</Text>
          <Text style={styles.copyrightText}>© 2026 RISE OF THE WARRIOR</Text>
        </View>
      </ScrollView>
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
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  backBtn: {
    padding: 8,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  diagnosticCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
  },
  diagnosticHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  diagnosticTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: 2,
  },
  diagnosticGrid: {
    flexDirection: 'row',
  },
  diagItem: {
    marginRight: SPACING.xl,
  },
  diagLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  diagValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  settingsCard: {
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  modeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  modeOption: {
    width: (width - SPACING.lg * 2 - SPACING.md * 4) / 3,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modeOptionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 8,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    marginTop: 8,
  },
  themeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  themeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  themeOption: {
    width: (width - SPACING.lg * 2 - SPACING.md * 4) / 3,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    borderWidth: 1,
  },
  themeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 8,
  },
  themeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    marginLeft: 12,
  },
  inactiveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
  },
  inactiveText: {
    color: '#A0A0B0',
    fontSize: 8,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  versionText: {
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 4,
  },
  copyrightText: {
    color: 'rgba(128,128,128,0.2)',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
