import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageSquare, ArrowRight } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../styles/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { useStoryStore, DialogueNode } from '../../store/useStoryStore';

const { width, height } = Dimensions.get('window');

export const DialogueOverlay = () => {
  const { currentDialogue, makeChoice, endDialogue } = useStoryStore();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (currentDialogue) {
      setDisplayedText('');
      setIsTyping(true);
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(prev => prev + currentDialogue.text[i]);
        i++;
        if (i >= currentDialogue.text.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [currentDialogue]);

  if (!currentDialogue) return null;

  return (
    <View style={styles.overlay}>
      <MotiView
        from={{ opacity: 0, translateY: 100 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: 100 }}
        style={styles.container}
      >
        {/* Character Portrait (Mock) */}
        <View style={styles.speakerContainer}>
          <GlassCard style={styles.portraitCard}>
            <View style={styles.portraitPlaceholder}>
              <Text style={styles.portraitText}>{currentDialogue.speaker[0]}</Text>
            </View>
          </GlassCard>
          <View style={styles.speakerBadge}>
            <Text style={styles.speakerName}>{currentDialogue.speaker}</Text>
          </View>
        </View>

        <GlassCard style={styles.dialogueCard}>
          <Text style={styles.dialogueText}>{displayedText}</Text>
          
          <View style={styles.choiceContainer}>
            {!isTyping && currentDialogue.choices ? (
              currentDialogue.choices.map((choice, index) => (
                <MotiView
                  key={index}
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 100 }}
                  style={styles.choiceWrapper}
                >
                  <TouchableOpacity
                    style={styles.choiceButton}
                    onPress={() => makeChoice(choice)}
                  >
                    <LinearGradient
                      colors={choice.alignmentChange && choice.alignmentChange > 0 ? [COLORS.primary, '#0072FF'] : [COLORS.secondary, '#8B0000']}
                      style={styles.choiceGradient}
                    >
                      <Text style={styles.choiceText}>{choice.text}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </MotiView>
              ))
            ) : !isTyping && (
              <TouchableOpacity onPress={endDialogue} style={styles.nextButton}>
                <Text style={styles.nextText}>CONTINUE</Text>
                <ArrowRight size={16} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
        </GlassCard>
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    padding: SPACING.lg,
    zIndex: 1000,
  },
  container: {
    width: '100%',
    paddingBottom: 40,
  },
  speakerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: -20,
    zIndex: 1,
    paddingLeft: SPACING.md,
  },
  portraitCard: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 4,
  },
  portraitPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.surfaceLighter,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  portraitText: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: 'bold',
  },
  speakerBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginLeft: SPACING.md,
    marginBottom: 10,
  },
  speakerName: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  dialogueCard: {
    minHeight: 180,
    padding: SPACING.xl,
    paddingTop: 30,
  },
  dialogueText: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  choiceContainer: {
    gap: SPACING.md,
  },
  choiceWrapper: {
    width: '100%',
  },
  choiceButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  choiceGradient: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  choiceText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  nextText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginRight: SPACING.sm,
    letterSpacing: 1,
  },
});
