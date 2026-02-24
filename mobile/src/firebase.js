/**
 * Firebase config for React Native.
 * For Google Sign-In on mobile, use @react-native-google-signin/google-signin
 * and send the idToken to your backend (same as web).
 */
// Optional: uncomment when using @react-native-firebase
// import auth from '@react-native-firebase/auth';
// export const firebaseAuth = auth();

export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyDxUVPzrdr8ZAC7A9qvG_5REDXWxc2EcX8',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'upteduroute.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'upteduroute',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'upteduroute.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '175309370242',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:175309370242:web:3c3e24fe9834029848159b',
};
