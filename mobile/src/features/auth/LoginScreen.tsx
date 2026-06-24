import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebaseConfig';
import api from '../../services/api';
import { useUserStore } from '../../store/useUserStore';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Missing Email', 'Please enter your email address first so we know where to send the reset link.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Success', 'A password reset link has been sent to your email.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      'Notice', 
      'Google Login requires custom native code and cannot be run inside standard Expo Go. If you want Google Login, please run "npx eas build" to compile a custom APK!'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image source={require('../../../../assets/icon.png')} style={styles.logo} />
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
        
        <View style={styles.passwordContainer}>
          <TextInput 
            style={styles.passwordInput} 
            placeholder="Password" 
            placeholderTextColor="#A0A0B0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Text style={styles.eyeBtnText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>

        {isLogin && (
          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

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
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 20,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2130',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    color: '#FFF',
    padding: 15,
  },
  eyeBtn: {
    padding: 15,
  },
  eyeBtnText: {
    color: '#00F0FF',
    fontWeight: 'bold',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#00F0FF',
    fontSize: 14,
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
