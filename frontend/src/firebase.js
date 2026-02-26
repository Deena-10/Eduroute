// c:\finalyearproject\career-roadmap-app\frontend\src\firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDxUVPzrdr8ZAC7A9qvG_5REDXWxc2EcX8",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "upteduroute.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "upteduroute",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "upteduroute.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "175309370242",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:175309370242:web:3c3e24fe9834029848159b",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// FIX: Ensure the user stays logged in within the current tab session
setPersistence(auth, browserSessionPersistence);

export const googleProvider = new GoogleAuthProvider();
// Pre-set parameters to avoid extra re-renders during popup
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = getFirestore(app);