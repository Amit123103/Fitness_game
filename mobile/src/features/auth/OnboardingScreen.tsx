import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MotiView } from 'moti';

export const OnboardingScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          style={styles.logoContainer}
        >
          <Image 
            source={require('../../../assets/icon.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </MotiView>

        <Text style={styles.title}>RISE OF THE WARRIOR</Text>
        <Text style={styles.subtitle}>
          Turn your daily workouts into epic battles! Level up, fight monsters, and conquer quests.
        </Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#13141C',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00F0FF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#A0A0B0',
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    padding: 20,
  },
  button: {
    backgroundColor: '#00F0FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#13141C',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
