// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCVmAn0q_rA3qDCS10GkOV6WCLArNAm5I4",
  authDomain: "edurouteai-8ef31.firebaseapp.com",
  projectId: "edurouteai-8ef31",
  storageBucket: "edurouteai-8ef31.firebasestorage.app",
  messagingSenderId: "1001267755909",
  appId: "1:1001267755909:web:1cb572a036d044cba722ec",
  measurementId: "G-G82PEH7JE9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, createUserWithEmailAndPassword, signInWithPopup };
