import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../../services/supabaseConfig';
import api from '../../services/api';
import { useUserStore } from '../../store/useUserStore';

WebBrowser.maybeCompleteAuthSession();

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation<any>();
  const updateProfile = useUserStore((state) => state.updateProfile);
  const updateStats = useUserStore((state) => state.updateStats);

  // Handle incoming deep links (e.g. email confirmation redirect or OAuth return)
  useEffect(() => {
    const processAuthUrl = async (url: string) => {
      try {
        if (!url) return;
        // Parse token or session from URL hash or query params
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
          const hash = url.substring(hashIndex + 1);
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            setLoading(true);
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (data?.session?.user) {
              Alert.alert('Email Confirmed! 🎉', 'Your email has been verified successfully.');
              await syncWithBackend(data.session.user.email ?? null, data.session.user.id);
              return;
            }
          }
        }

        const queryIndex = url.indexOf('?');
        if (queryIndex !== -1) {
          const query = url.substring(queryIndex + 1);
          const params = new URLSearchParams(query);
          const code = params.get('code');
          if (code) {
            setLoading(true);
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (data?.session?.user) {
              Alert.alert('Email Confirmed! 🎉', 'Your email has been verified successfully.');
              await syncWithBackend(data.session.user.email ?? null, data.session.user.id);
              return;
            }
          }
        }
      } catch (err) {
        console.error('Error handling auth deep link:', err);
      } finally {
        setLoading(false);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) processAuthUrl(url);
    });

    const subscription = Linking.addEventListener('url', (event) => {
      if (event.url) processAuthUrl(event.url);
    });

    return () => subscription.remove();
  }, []);

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

  const syncWithBackend = async (userEmail: string | null, userUid: string) => {
    try {
      const response = await api.post('/auth/supabase-login', { email: userEmail, uid: userUid });
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
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // 1. Try Supabase Auth first
        let supabaseSuccess = false;
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          });
          if (!error && data.user) {
            supabaseSuccess = true;
            await syncWithBackend(data.user.email ?? trimmedEmail, data.user.id);
            return;
          }
        } catch (supaErr) {
          console.log('Supabase sign-in failed, trying backend fallback...', supaErr);
        }

        // 2. Fallback to Direct Backend Login
        if (!supabaseSuccess) {
          try {
            const backendRes = await api.post('/auth/login', {
              email: trimmedEmail,
              password,
            });
            if (backendRes.data?.token) {
              await AsyncStorage.setItem('userToken', backendRes.data.token);
              await fetchAndSyncProfile();
              navigation.replace('Main');
              return;
            }
          } catch (backendErr: any) {
            console.log('Backend login failed:', backendErr?.response?.data || backendErr.message);
          }

          // If both fail:
          Alert.alert(
            'Authentication Failed',
            'Invalid email or password. If you do not have an account yet, please tap "Don\'t have an account? Sign Up" below to create one.'
          );
        }
      } else {
        // Sign Up Mode with Mobile App Redirect Scheme
        let supabaseSuccess = false;
        try {
          const redirectUrl = Linking.createURL('auth/callback');
          const { data, error } = await supabase.auth.signUp({
            email: trimmedEmail,
            password,
            options: {
              emailRedirectTo: redirectUrl,
            },
          });
          if (!error && data.user) {
            supabaseSuccess = true;
            if (data.session) {
              // Direct login if email confirmation is disabled in Supabase
              await syncWithBackend(data.user.email ?? trimmedEmail, data.user.id);
            } else {
              // Email confirmation required by Supabase
              Alert.alert(
                'Verification Email Sent 📧',
                `We have sent a verification link to ${trimmedEmail}.\n\nPlease check your email inbox and tap the link to activate your account.`
              );
            }
            return;
          }
        } catch (supaErr) {
          console.log('Supabase sign-up failed, trying backend fallback...', supaErr);
        }

        // Fallback to Direct Backend Sign Up
        if (!supabaseSuccess) {
          try {
            const backendRes = await api.post('/auth/signup', {
              email: trimmedEmail,
              password,
            });
            if (backendRes.data?.token) {
              await AsyncStorage.setItem('userToken', backendRes.data.token);
              await fetchAndSyncProfile();
              navigation.replace('Main');
              return;
            }
          } catch (backendErr: any) {
            const msg = backendErr?.response?.data?.error || 'Failed to create account.';
            Alert.alert('Sign Up Failed', msg);
          }
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert('Authentication Failed', error.message || 'An error occurred during authentication.');
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
      const redirectUrl = Linking.createURL('auth/callback');
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });
      if (error) throw error;
      Alert.alert('Success', 'A password reset link has been sent to your email.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleOAuthLogin = async () => {
    try {
      setLoading(true);
      const redirectUrl = Linking.createURL('auth/callback');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        if (res.type === 'success' && res.url) {
          // Process the returned URL containing session hash or tokens
          const hashIndex = res.url.indexOf('#');
          if (hashIndex !== -1) {
            const hash = res.url.substring(hashIndex + 1);
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
              const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              if (sessionData?.session?.user) {
                Alert.alert('Google Sign-In Success 🚀', `Welcome back, ${sessionData.session.user.email}!`);
                await syncWithBackend(sessionData.session.user.email ?? null, sessionData.session.user.id);
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Sign-In Failed', error.message || 'An error occurred during Google Sign-In.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTestLogin = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/supabase-login', {
        email: 'test@example.com',
        uid: 'test-user-123',
      });

      if (response.data?.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await fetchAndSyncProfile();
        navigation.replace('Main');
      }
    } catch (error) {
      console.error('Quick test login failed:', error);
      Alert.alert('Error', 'Could not complete test login. Please make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image source={require('../../../assets/icon.png')} style={styles.logo} />
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

        <TouchableOpacity style={styles.quickTestBtn} onPress={handleQuickTestLogin} disabled={loading}>
          <Text style={styles.quickTestBtnText}>⚡ Quick Test Login (1-Tap Access)</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity style={styles.googleBtn} onPress={handleOAuthLogin} disabled={loading}>
          <Text style={styles.googleBtnText}>Sign in with Google (Supabase)</Text>
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
  quickTestBtn: {
    backgroundColor: '#FF0055',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FF3377',
  },
  quickTestBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
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
