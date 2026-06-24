import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Replace with your actual backend IP/URL. For testing on emulator, 10.0.2.2 is localhost.
// If testing on a physical device, this must be the local IP address of your machine running the backend (e.g., 192.168.x.x)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api'; 

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to attach the JWT token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
