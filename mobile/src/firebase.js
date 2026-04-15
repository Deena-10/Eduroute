/**
 * Firebase config for React Native.
 * For Google Sign-In on mobile, use @react-native-google-signin/google-signin
 * and send the idToken to your backend (same as web).
 */
// Optional: uncomment when using @react-native-firebase
// import auth from '@react-native-firebase/auth';
// export const firebaseAuth = auth();

export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
};
