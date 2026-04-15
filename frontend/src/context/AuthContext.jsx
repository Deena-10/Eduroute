// c:\finalyearproject\career-roadmap-app\frontend\src\context\AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from "react";
import api from "../api/axiosInstance";
import { getFirebaseAuth, isFirebaseLoaded } from "../firebaseAuth";
import { safeLocalStorageParse } from "../utils/safeJsonParser";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial state from localStorage only - NO Firebase import to avoid gapi errors on load
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      // Use the safeJsonParser utility instead of manual JSON.parse
      const parsedUser = safeLocalStorageParse("user");

      if (parsedUser && token) {
        setUser(parsedUser);
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (_) {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const data = res.data; // Always use res.data directly

      if (data?.success && data?.data) {
        const { user: backendUser, token } = data.data;
        const userData = {
          id: backendUser.id,
          email: backendUser.email,
          name: backendUser.name,
          token,
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);
        return { success: true };
      }
      return { success: false, message: data?.message || "Login failed" };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      return { success: false, message: msg };
    }
  };

  const signup = async (email, password, name) => {
    try {
      const res = await api.post("/auth/signup", {
        email,
        password,
        name,
      });
      const data = res.data; // Always use res.data directly

      if (data?.success && data?.data) {
        const { user: backendUser, token } = data.data;
        const userData = {
          id: backendUser.id,
          email: backendUser.email,
          name: backendUser.name,
          token,
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);
        return { success: true };
      }

      return { success: false, message: data?.message || "Signup failed" };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Signup failed";
      return { success: false, message: msg };
    }
  };

  const googleSignIn = async () => {
    try {
      // Lazy-load Firebase only when user clicks - avoids gapi errors on initial page load
      const { auth, googleProvider } = await getFirebaseAuth();
      const { signInWithPopup } = await import("firebase/auth");
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const res = await api.post("/auth/google-signin", { token: idToken });
      const data = res.data; // Always use res.data directly

      if (data?.success && data?.data) {
        const { user: backendUser, token } = data.data;
        const userData = {
          id: backendUser.id,
          email: backendUser.email,
          name: backendUser.name,
          photoURL: backendUser.profilePicture || null,
          token,
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);
        return { success: true };
      }
      return { success: false, message: data?.message || "Google sign-in failed" };
    } catch (error) {
      console.error("Google sign-in error:", error);
      return { success: false, message: error.message || "Google sign-in failed" };
    }
  };

  const logout = async () => {
    try {
      if (isFirebaseLoaded()) {
        const { auth } = await getFirebaseAuth();
        const { signOut } = await import("firebase/auth");
        await signOut(auth);
      }
    } catch (_) {}
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const isAuthenticated = useCallback(() => Boolean(user || localStorage.getItem("token")), [user]);

  return (
    <AuthContext.Provider value={{ user, login, signup, googleSignIn, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
