// c:\finalyearproject\career-roadmap-app\frontend\src\firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "",
};

const requiredFirebaseFields = ["apiKey", "authDomain", "projectId", "appId"];
const missingFields = requiredFirebaseFields.filter((k) => !firebaseConfig[k]);
if (missingFields.length > 0) {
  console.warn(`Firebase config missing: ${missingFields.join(", ")}. Set REACT_APP_FIREBASE_* env vars.`);
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// FIX: Ensure the user stays logged in within the current tab session
setPersistence(auth, browserSessionPersistence);

export const googleProvider = new GoogleAuthProvider();
// Pre-set parameters to avoid extra re-renders during popup
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = getFirestore(app);