import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const NotificationSettingsScreen = () => {
  const navigation = useNavigation();
  const [selectedMinutes, setSelectedMinutes] = useState<number>(1); // e.g., 1 minute from now for testing

  const scheduleNotification = async () => {
    Alert.alert('Notice', 'Push notifications have been disabled to support Expo Go.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Quest Notifications</Text>
        <Text style={styles.subtitle}>Set a delay (in minutes) to receive your next quest for testing purposes.</Text>
        
        <View style={styles.buttonRow}>
          {[1, 5, 10, 60].map((min) => (
            <TouchableOpacity 
              key={min}
              style={[styles.timeBtn, selectedMinutes === min && styles.timeBtnActive]}
              onPress={() => setSelectedMinutes(min)}
            >
              <Text style={[styles.timeText, selectedMinutes === min && styles.timeTextActive]}>
                {min} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={scheduleNotification}>
          <Text style={styles.saveBtnText}>Schedule Quest Reminder</Text>
        </TouchableOpacity>
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
  },
  title: {
    fontSize: 28,
    color: '#00F0FF',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#A0A0B0',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  timeBtn: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#1E2130',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timeBtnActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    borderColor: '#00F0FF',
  },
  timeText: {
    color: '#A0A0B0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeTextActive: {
    color: '#00F0FF',
  },
  saveBtn: {
    backgroundColor: '#00F0FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#13141C',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
