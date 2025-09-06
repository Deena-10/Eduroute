// frontend/src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration for upteduroute project
const firebaseConfig = {
  apiKey: "AIzaSyDxUVPzrdr8ZAC7A9qvG_5REDXWxc2EcX8",
  authDomain: "upteduroute.firebaseapp.com",
  projectId: "upteduroute",
  storageBucket: "upteduroute.firebasestorage.app",
  messagingSenderId: "175309370242",
  appId: "1:175309370242:web:3c3e24fe9834029848159b",
  measurementId: "G-GRECR0BMY5",
};

// Alternative: Use environment variables (recommended for production)
// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
//   authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.REACT_APP_FIREBASE_APP_ID,
// };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

// ✅ Firestore DB
export const db = getFirestore(app);
