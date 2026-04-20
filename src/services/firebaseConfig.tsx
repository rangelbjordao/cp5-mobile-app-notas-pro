import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { addDoc, collection, getFirestore } from "firebase/firestore";

const { getReactNativePersistence } = require("firebase/auth") as any;

const firebaseConfig = {
  apiKey: "AIzaSyDAeXw_ffiJ64SDqSA65a64u0XxBxWIDXA",
  authDomain: "appnotaspro.firebaseapp.com",
  projectId: "appnotaspro",
  storageBucket: "appnotaspro.firebasestorage.app",
  messagingSenderId: "132741489282",
  appId: "1:132741489282:web:36bb6afebe4732b6de8a9b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Config Firestore
const db = getFirestore(app);

export { addDoc, collection, db };
