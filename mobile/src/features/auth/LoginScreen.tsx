import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
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

  useEffect(() => {
    // Note: You must replace this webClientId with the one from your google-services.json -> client_info -> client_id array where client_type is 3
    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', 
    });
  }, []);

  const fetchAndSyncProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      const data = response.data;
      
      // Update store with fetched data
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

      // Update coins
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
        userCredential = await auth().signInWithEmailAndPassword(email, password);
      } else {
        userCredential = await auth().createUserWithEmailAndPassword(email, password);
      }
      
      await syncWithBackend(userCredential.user.email, userCredential.user.uid);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Authentication Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Get the users ID token
      const { data } = await GoogleSignin.signIn();

      // Create a Google credential with the token
      if (data?.idToken) {
        const googleCredential = auth.GoogleAuthProvider.credential(data.idToken);
        // Sign-in the user with the credential
        const userCredential = await auth().signInWithCredential(googleCredential);
        
        await syncWithBackend(userCredential.user.email, userCredential.user.uid);
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Google Sign-In Failed', error.message);
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

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin} disabled={loading}>
          <Text style={styles.googleBtnText}>Sign in with Google</Text>
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: '#A0A0B0',
    paddingHorizontal: 15,
    fontWeight: 'bold',
  },
  googleBtn: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  googleBtnText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleBtn: {
    marginTop: 10,
    alignItems: 'center',
  },
  toggleText: {
    color: '#A0A0B0',
    fontSize: 14,
  },
});
