import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Trophy } from 'lucide-react-native';

export const BuzzerQuestScreen = () => {
  const [completed, setCompleted] = useState(false);
  const navigation = useNavigation<any>();

  const handleBuzzerPress = () => {
    setCompleted(true);
    // Here we would normally make an API call to log the quest completion
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {!completed ? (
          <>
            <Text style={styles.title}>Daily Quest Active!</Text>
            <Text style={styles.questText}>Did you complete your 10,000 steps today?</Text>
            
            <TouchableOpacity style={styles.buzzer} onPress={handleBuzzerPress}>
              <View style={styles.buzzerInner}>
                <Text style={styles.buzzerText}>YES!</Text>
                <Text style={styles.buzzerSubtext}>PRESS BUZZER</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelText}>Not Yet</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.successContainer}>
            <Trophy size={80} color="#00F0FF" />
            <Text style={styles.successTitle}>Quest Completed!</Text>
            <Text style={styles.successSubtitle}>You've earned 50 XP and 20 Coins.</Text>
            <TouchableOpacity 
              style={styles.doneBtn} 
              onPress={() => navigation.navigate('Main')}
            >
              <Text style={styles.doneBtnText}>Return to Dashboard</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#13141C',
  },
  content: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#FF5722',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  questText: {
    fontSize: 22,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 60,
    lineHeight: 30,
  },
  buzzer: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#ff1744',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#ff1744',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    marginBottom: 40,
    borderWidth: 10,
    borderColor: '#d50000',
  },
  buzzerInner: {
    alignItems: 'center',
  },
  buzzerText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFF',
  },
  buzzerSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 'bold',
    marginTop: 5,
  },
  cancelBtn: {
    padding: 15,
  },
  cancelText: {
    color: '#A0A0B0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 32,
    color: '#00F0FF',
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 18,
    color: '#A0A0B0',
    marginBottom: 40,
  },
  doneBtn: {
    backgroundColor: '#00F0FF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  doneBtnText: {
    color: '#13141C',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
