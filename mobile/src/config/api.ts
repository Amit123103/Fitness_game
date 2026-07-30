import { Platform } from 'react-native';

// For local development with Expo:
// Android Emulator: 10.0.2.2
// iOS Simulator: localhost
// Physical Device: Use your machine's local IP (e.g., 192.168.1.XX)

const LOCAL_IP = '192.168.1.3'; // Local machine IP for device/emulator testing

export const BASE_URL = Platform.select({
  android: `http://${LOCAL_IP}:5000`,
  ios: 'http://localhost:5000',
  default: 'http://localhost:5000',
});

export const API_ENDPOINTS = {
  PROFILE: `${BASE_URL}/api/user/profile`,
  STATS: `${BASE_URL}/api/user/stats`,
  AUTH: {
    LOGIN: `${BASE_URL}/api/auth/login`,
    SIGNUP: `${BASE_URL}/api/auth/signup`,
  }
};
