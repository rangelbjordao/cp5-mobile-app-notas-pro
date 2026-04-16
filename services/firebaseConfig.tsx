import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { addDoc, collection, getFirestore } from "firebase/firestore";

const { getReactNativePersistence } = require("firebase/auth") as any;

const firebaseConfig = {
  apiKey: "AIzaSyCCom_J5NkQG9JblPXXZsMsU302qA7Iwck",
  authDomain: "cp4-mobile-app-notas-9dca2.firebaseapp.com",
  projectId: "cp4-mobile-app-notas-9dca2",
  storageBucket: "cp4-mobile-app-notas-9dca2.firebasestorage.app",
  messagingSenderId: "654395996449",
  appId: "1:654395996449:web:7e0942904c188a1c9ea660",
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
