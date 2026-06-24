import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAuQLzowzJcQZfvmydgc-f62OrihFN6v20",
  authDomain: "fitnessgame-64c42.firebaseapp.com",
  projectId: "fitnessgame-64c42",
  storageBucket: "fitnessgame-64c42.firebasestorage.app",
  messagingSenderId: "23874766515",
  appId: "1:23874766515:android:007d13bf2b9f3df29ad2c6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
