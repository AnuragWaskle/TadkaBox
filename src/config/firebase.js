import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ IMPORTANT: Replace these values with your Firebase Project Configuration
// You can find these in the Firebase Console -> Project Settings
const firebaseConfig = {
    apiKey: "AIzaSyDE6Egdx6xDo1DPnmO2y0BjOeX9pViaSKs",
    authDomain: "foodorderingapp-3acfc.firebaseapp.com",
    projectId: "foodorderingapp-3acfc",
    storageBucket: "foodorderingapp-3acfc.firebasestorage.app",
    messagingSenderId: "727960268796",
    appId: "1:727960268796:web:e95d2b50d82e5847f5cc79",
    measurementId: "G-LBMZWS3CK3"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence for React Native
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);
