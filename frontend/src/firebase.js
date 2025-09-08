// frontend/src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration - using environment variables for security
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDxUVPzrdr8ZAC7A9qvG_5REDXWxc2EcX8",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "upteduroute.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "upteduroute",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "upteduroute.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "175309370242",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:175309370242:web:3c3e24fe9834029848159b",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-GRECR0BMY5",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

// ✅ Firestore DB
export const db = getFirestore(app);
