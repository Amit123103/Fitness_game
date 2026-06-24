import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MotiView, MotiText } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Skull, AlertTriangle, ZapOff, Coins } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../styles/theme';
import { useUserStore } from '../../store/useUserStore';
import { useSystemAlarm } from '../../hooks/useSystemAlarm';

const { width, height } = Dimensions.get('window');

export const PenaltyOverlay = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const navigation = useNavigation<any>();
  const { playAlarm, stopAlarm } = useSystemAlarm();
  const shakeAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      playAlarm();
      startShake();
    } else {
      stopAlarm();
    }
  }, [visible]);

  const startShake = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ])
    ).start();
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView intensity={90} style={styles.container}>
        <Animated.View style={[styles.content, { transform: [{ translateX: shakeAnim }] }]}>
          <LinearGradient
            colors={['rgba(255, 0, 0, 0.2)', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          
          <MotiView
            from={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' }}
            style={styles.header}
          >
            <Skull size={80} color={COLORS.error} />
            <MotiView
              animate={{ opacity: [1, 0, 1] }}
              transition={{ loop: true, duration: 200, type: 'timing' }}
            >
              <Text style={styles.warningTitle}>[ SYSTEM PENALTY ]</Text>
            </MotiView>
          </MotiView>

          <View style={styles.infoBox}>
            <Text style={styles.description}>
              YOU HAVE FAILED TO COMPLETE THE DAILY QUEST.
            </Text>
            <View style={styles.divider} />
            <Text style={styles.survivalTitle}>SURVIVAL QUEST INITIALIZED</Text>
            
            <MotiView 
              from={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ loop: true, duration: 1000 }}
              style={styles.deductionContainer}
            >
              <Coins size={32} color={COLORS.error} />
              <Text style={styles.deductionText}>- 500 RUPEES</Text>
            </MotiView>
          </View>

          <MotiView
            from={{ translateY: 50, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ delay: 1000 }}
            style={styles.bottomSection}
          >
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => {
                onClose();
                navigation.navigate('SurvivalQuest');
              }}
            >
              <LinearGradient
                colors={['#FF0000', '#8B0000']}
                style={styles.btnGradient}
              >
                <Text style={styles.btnText}>CONFIRM PENALTY</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.hint}>Failure to survive the penalty will result in further stagnation.</Text>
          </MotiView>
        </Animated.View>
      </BlurView>

      {/* Glitch Overlays */}
      <View style={[styles.glitchLine, { top: '30%', backgroundColor: 'rgba(255,0,0,0.3)' }]} />
      <View style={[styles.glitchLine, { top: '70%', backgroundColor: 'rgba(255,0,0,0.2)' }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: width * 0.85,
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.error,
    ...SHADOWS.neonSecondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  warningTitle: {
    color: COLORS.error,
    fontSize: 24,
    fontWeight: '900',
    marginTop: SPACING.md,
    letterSpacing: 4,
  },
  infoBox: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  description: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    width: 100,
    backgroundColor: 'rgba(255,0,0,0.3)',
    marginVertical: SPACING.lg,
  },
  survivalTitle: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: SPACING.xl,
  },
  deductionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deductionText: {
    color: COLORS.error,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 1,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
  },
  actionBtn: {
    width: '100%',
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  btnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
  hint: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  glitchLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
});
