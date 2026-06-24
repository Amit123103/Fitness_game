import { View, Text, StyleSheet, Dimensions, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { MotiView, MotiText } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Target, Activity, Zap, CheckCircle, ChevronLeft, Skull } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../styles/theme';
import { useFitnessTracking, ExerciseType } from '../../hooks/useFitnessTracking';
import { useUserStore } from '../../store/useUserStore';
import { AIBodyTracker } from '../../components/fitness/AIBodyTracker';

const { width, height } = Dimensions.get('window');

export const QuestVisionScreen = ({ navigation, route }: any) => {
  const { exerciseType } = route.params || { exerciseType: 'PUSHUPS' };
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [flashOpacity] = useState(new Animated.Value(0));
  const [intensity, setIntensity] = useState(0);
  const [lastRepTime, setLastRepTime] = useState(Date.now());
  const normalizedType = exerciseType === 'PULLUPS' ? 'pullups' : exerciseType === 'PUSHUPS' ? 'pushups' : 'running';
  const { count, isActive, startTracking, stopTracking, incrementCount } = useFitnessTracking(exerciseType as ExerciseType);
  const { dailyQuest, questCompleted } = useUserStore();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) return <View style={styles.container} />;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  const handleRepDetected = () => {
    if (isActive) {
      incrementCount();
      triggerFlash();
      updateIntensity();
    }
  };

  const triggerFlash = () => {
    Animated.sequence([
      Animated.timing(flashOpacity, { toValue: 0.15, duration: 100, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const updateIntensity = () => {
    const now = Date.now();
    const diff = now - lastRepTime;
    setLastRepTime(now);
    
    // Calculate intensity based on rep speed (higher intensity for faster reps)
    const newIntensity = Math.max(0, Math.min(100, 100 - (diff / 50))); 
    setIntensity(newIntensity);
  };

  const currentQuest = dailyQuest[normalizedType as keyof typeof dailyQuest];

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.flashOverlay, { opacity: flashOpacity }]} pointerEvents="none" />
      <View style={styles.scanlineOverlay} pointerEvents="none" />

      <View style={styles.content}>
        {isActive ? (
          <AIBodyTracker 
            mode={exerciseType as any} 
            onRepDetected={handleRepDetected} 
          />
        ) : (
          <View style={styles.cameraPlaceholder}>
            <LinearGradient colors={['#050505', '#111']} style={StyleSheet.absoluteFill} />
            <Target size={64} color="rgba(255,255,255,0.05)" />
          </View>
        )}
        
        <View style={styles.hudOverlay}>
          <View style={styles.hudContainer}>
            
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <ChevronLeft size={24} color="white" />
              </TouchableOpacity>
              
              <View style={styles.diagnosticContainer}>
                <View style={styles.statusBadge}>
                  <MotiView
                    animate={{ opacity: isActive ? [1, 0.4, 1] : 1 }}
                    transition={{ loop: true, duration: 1000 }}
                    style={[styles.dot, { backgroundColor: isActive ? COLORS.success : COLORS.textSecondary }]}
                  />
                  <Text style={[styles.statusText, { color: isActive ? COLORS.success : COLORS.textSecondary }]}>
                    {isActive ? 'VISION ACTIVE' : 'SYSTEM STANDBY'}
                  </Text>
                </View>
                {isActive && (
                  <View style={styles.intensityRow}>
                    <Zap size={10} color={COLORS.primary} />
                    <View style={styles.intensityBarBg}>
                      <MotiView 
                        animate={{ width: `${intensity}%` }} 
                        style={[styles.intensityFill, { backgroundColor: COLORS.primary }]} 
                      />
                    </View>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.sightContainer}>
              <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isActive ? 1 : 0.3, scale: isActive ? 1.1 : 1 }}
                style={styles.sight}
              >
                <View style={styles.hexBorder}>
                   <Target size={140} color="rgba(0, 240, 255, 0.2)" strokeWidth={0.5} />
                </View>
                
                <View style={[styles.techCorner, styles.topL, { borderColor: COLORS.primary }]} />
                <View style={[styles.techCorner, styles.topR, { borderColor: COLORS.primary }]} />
                <View style={[styles.techCorner, styles.botL, { borderColor: COLORS.primary }]} />
                <View style={[styles.techCorner, styles.botR, { borderColor: COLORS.primary }]} />
                
                {isActive && (
                   <MotiView
                     animate={{ opacity: [0.2, 0.5, 0.2], rotate: '360deg' }}
                     transition={{ opacity: { loop: true, duration: 2000 }, rotate: { loop: true, duration: 10000, type: 'timing' } }}
                     style={styles.rotationCircle}
                   />
                )}
              </MotiView>
            </View>

            {/* Tracking Data Panel */}
            <View style={styles.bottomPanel}>
              <BlurView intensity={30} style={styles.dataCard}>
                <View style={styles.dataHeader}>
                  <Activity size={20} color={COLORS.primary} />
                  <Text style={styles.dataTitle}>{exerciseType} TRACKING</Text>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>COUNT</Text>
                    <MotiText 
                      key={count}
                      from={{ scale: 1.5 }}
                      animate={{ scale: 1 }}
                      style={styles.statValue}
                    >
                      {count}
                    </MotiText>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>QUEST PROGRESS</Text>
                    <Text style={styles.statValue}>
                      {currentQuest.current}/{currentQuest.goal}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBg}>
                    <MotiView 
                      animate={{ width: `${Math.min((currentQuest.current / currentQuest.goal) * 100, 100)}%` }}
                      style={styles.progressFill}
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={isActive ? stopTracking : startTracking}
                  style={styles.actionBtn}
                >
                  <LinearGradient
                    colors={isActive ? [COLORS.error, '#8B0000'] : [COLORS.primary, COLORS.accent]}
                    style={styles.btnGradient}
                  >
                    <Text style={styles.btnText}>{isActive ? 'STOP SYSTEM' : 'INITIALIZE TRACKING'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </BlurView>
            </View>

          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.success,
    zIndex: 100,
  },
  scanlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 90,
    opacity: 0.05,
    borderBottomWidth: 1,
    borderBottomColor: '#FFF',
  },
  content: {
    flex: 1,
  },
  hudOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#050505',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hudContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  diagnosticContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginLeft: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  intensityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 4,
    borderRadius: 2,
    width: 100,
  },
  intensityBarBg: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 6,
    borderRadius: 1,
    overflow: 'hidden',
  },
  intensityFill: {
    height: '100%',
  },
  sightContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sight: {
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  hexBorder: {
    width: 200,
    height: 200,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
  },
  techCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 2,
  },
  topL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  botL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  botR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  rotationCircle: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.1)',
    borderStyle: 'dashed',
  },
  bottomPanel: {
    marginBottom: SPACING.xl,
  },
  dataCard: {
    padding: SPACING.lg,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  dataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dataTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataTitle: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 8,
    letterSpacing: 1.5,
  },
  secretGiftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 204, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 204, 0, 0.3)',
  },
  secretGiftText: {
    color: COLORS.warning,
    fontSize: 8,
    fontWeight: '900',
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: 1,
  },
  countContainer: {
    height: 40,
    justifyContent: 'center',
  },
  statValue: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressSection: {
    marginBottom: SPACING.xl,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabelText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  progressLabelValue: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },
  progressBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  actionBtn: {
    height: 52,
    borderRadius: 4,
    overflow: 'hidden',
  },
  btnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
