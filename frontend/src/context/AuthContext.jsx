// c:\finalyearproject\career-roadmap-app\frontend\src\context\AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { auth, googleProvider } from "../firebase";
import { signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from "firebase/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const storedUser = localStorage.getItem("user");
      if (firebaseUser && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (_) {
          setUser(null);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await new Promise((r) => setTimeout(r, 400));
      if (cancelled) return;
      try {
        const result = await getRedirectResult(auth);
        if (!result) return;
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
          window.location.replace("/");
        }
      } catch (err) {
        console.error("Google redirect result error:", err);
      }
    })();
    return () => { cancelled = true; };
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

  const googleSignIn = async () => {
    try {
      sessionStorage.setItem("googleRedirectInProgress", "1");
      await signInWithRedirect(auth, googleProvider);
      return { success: true, message: "Redirecting to Google..." };
    } catch (error) {
      sessionStorage.removeItem("googleRedirectInProgress");
      console.error("Google sign-in error:", error);
      return { success: false, message: error.message || "Google sign-in failed" };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (_) {}
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const isAuthenticated = useCallback(() => Boolean(user || localStorage.getItem("token")), [user]);

  return (
    <AuthContext.Provider value={{ user, login, googleSignIn, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};