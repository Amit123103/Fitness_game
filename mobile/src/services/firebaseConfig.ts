import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAuQLzowzJcQZfvmydgc-f62OrihFN6v20",
  authDomain: "fitnessgame-64c42.firebaseapp.com",
  projectId: "fitnessgame-64c42",
  storageBucket: "fitnessgame-64c42.firebasestorage.app",
  messagingSenderId: "23874766515",
  appId: "1:23874766515:android:007d13bf2b9f3df29ad2c6"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth (with persistence, avoiding hot-reload crashes)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error: any) {
  // If it throws an already-initialized error, just get the existing instance
  auth = getAuth(app);
}

export { app, auth };
