import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebaseConfig';
import api from '../../services/api';
import { useUserStore } from '../../store/useUserStore';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();
  const updateProfile = useUserStore((state) => state.updateProfile);
  const updateStats = useUserStore((state) => state.updateStats);

  const fetchAndSyncProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      const data = response.data;
      
      updateProfile({
        name: data.name || 'Awakened User',
        bio: data.bio || '',
      });
      
      updateStats({
        strength: data.stats.strength,
        stamina: data.stats.stamina,
        speed: data.stats.speed,
        defense: data.stats.defense,
        level: data.stats.level,
        xp: data.stats.xp,
        mana: data.stats.mana,
        maxMana: data.stats.maxMana,
      });

      useUserStore.getState().addCoins(data.coins - useUserStore.getState().coins);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const syncWithBackend = async (firebaseEmail: string | null, firebaseUid: string) => {
    try {
      const response = await api.post('/auth/firebase-login', { email: firebaseEmail, uid: firebaseUid });
      if (response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await fetchAndSyncProfile();
        navigation.replace('Main');
      }
    } catch (error) {
      console.error('Backend sync failed:', error);
      Alert.alert('Error', 'Failed to connect to the game servers.');
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      
      await syncWithBackend(userCredential.user.email, userCredential.user.uid);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Authentication Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
        
        <TextInput 
          style={styles.input} 
          placeholder="Email" 
          placeholderTextColor="#A0A0B0"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Password" 
          placeholderTextColor="#A0A0B0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleEmailAuth} disabled={loading}>
          {loading ? <ActivityIndicator color="#13141C" /> : <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggleBtn}>
          <Text style={styles.toggleText}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#13141C',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00F0FF',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1E2130',
    color: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  button: {
    backgroundColor: '#00F0FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#13141C',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    color: '#A0A0B0',
    fontSize: 14,
  },
});
