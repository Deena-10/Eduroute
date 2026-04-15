// c:\finalyearproject\career-roadmap-app\frontend\src\context\AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { getFirebaseAuth, isFirebaseLoaded } from "../firebaseAuth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const looksLikeHtml = (value) =>
    typeof value === "string" &&
    (value.includes("You need to enable JavaScript") ||
      value.trim().startsWith("<!doctype") ||
      value.trim().startsWith("<html"));

  // Initial state from localStorage only - NO Firebase import to avoid gapi errors on load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (looksLikeHtml(storedUser) || looksLikeHtml(token)) {
        // Guard against cached HTML accidentally persisted to localStorage.
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setLoading(false);
        return;
      }
      if (storedUser && token) {
        const parsed = JSON.parse(storedUser);
        if (parsed && typeof parsed === "object" && parsed.email) {
          setUser(parsed);
        }
      }
    } catch (_) {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axiosInstance.post("/auth/login", { email, password });
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
      const { data } = await axiosInstance.post("/auth/signup", {
        email,
        password,
        name,
      });

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
      const response = await axiosInstance.post("/auth/google-signin", { token: idToken });
      if (response.data?.success && response.data?.data) {
        const { user: backendUser, token } = response.data.data;
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
      return { success: false, message: response.data?.message || "Google sign-in failed" };
    } catch (error) {
      console.error("Google sign-in error:", error);
      return { success: false, message: error.message || "Google sign-in failed" };
    }
  };

  const logout = async () => {
    try {
      // Only call Firebase signOut if we've already loaded it (user used Google sign-in)
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
