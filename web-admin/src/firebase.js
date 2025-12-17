import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
export const auth = getAuth(app);
export const db = getFirestore(app);
