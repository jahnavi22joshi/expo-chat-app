import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAG7iA8Njc_s_baBkulmSxDZXvTRXnaAJE",
  authDomain: "expochatapp-52eb9.firebaseapp.com",
  projectId: "expochatapp-52eb9",
  storageBucket: "expochatapp-52eb9.firebasestorage.app",
  messagingSenderId: "215181416336",
  appId: "1:215181416336:web:69b3d5cabdb7e9326e0515",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔥 IMPORTANT EXPORTS
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);