import React, { createContext, useState, useEffect, useCallback } from 'react';
import storage from '../storage/asyncStorage';
import { API_ORIGIN } from '../config/api';

export const AuthContext = createContext();

const corruptPatterns = [
  'You need to enable JavaScript',
  '<!DOCTYPE',
  '<html',
  'SyntaxError',
  'Unexpected token',
  'You need t',
  'script',
  'body',
  'head',
];

const isCorrupted = (value) => {
  if (!value || typeof value !== 'string') return false;
  return corruptPatterns.some((p) => value.includes(p)) || value.startsWith('<');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const storedUser = await storage.getItem(storage.keys.USER);
      const token = await storage.getItem(storage.keys.TOKEN);

      if (storedUser && isCorrupted(storedUser)) {
        await storage.clear();
        setUser(null);
        setLoading(false);
        return;
      }

      if (token && (!storedUser || storedUser === 'null' || storedUser === 'undefined')) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload?.id) {
              const restored = {
                id: payload.id,
                uid: String(payload.id),
                email: payload.email || 'user@example.com',
                name: payload.name || 'User',
                photoURL: null,
                token,
              };
              setUser(restored);
              await storage.setItem(storage.keys.USER, JSON.stringify(restored));
              setLoading(false);
              return;
            }
          }
        } catch (_) {}
      }

      if (storedUser && storedUser !== 'null' && storedUser !== 'undefined' && token) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed && typeof parsed === 'object' && parsed.email) {
            setUser(parsed);
            if (parsed.token && !(await storage.getItem(storage.keys.TOKEN))) {
              await storage.setItem(storage.keys.TOKEN, parsed.token);
            }
          } else {
            await storage.removeItem(storage.keys.USER);
            await storage.removeItem(storage.keys.TOKEN);
            setUser(null);
          }
        } catch (_) {
          if (token) {
            setUser({
              id: 'temp',
              uid: 'temp',
              email: 'user@example.com',
              name: 'User',
              photoURL: null,
              token,
            });
          } else {
            await storage.removeItem(storage.keys.USER);
            await storage.removeItem(storage.keys.TOKEN);
            setUser(null);
          }
        }
      } else if (token && (!storedUser || storedUser === 'null' || storedUser === 'undefined')) {
        setUser({
          id: 'temp',
          uid: 'temp',
          email: 'user@example.com',
          name: 'User',
          photoURL: null,
          token,
        });
      } else if (storedUser && storedUser !== 'null' && storedUser !== 'undefined') {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed?.email && parsed?.token) {
            setUser(parsed);
            await storage.setItem(storage.keys.TOKEN, parsed.token);
          } else {
            await storage.removeItem(storage.keys.USER);
            setUser(null);
          }
        } catch (_) {
          await storage.removeItem(storage.keys.USER);
          setUser(null);
        }
      } else {
        await storage.removeItem(storage.keys.USER);
        await storage.removeItem(storage.keys.TOKEN);
        setUser(null);
      }
    } catch (error) {
      console.error('loadUser error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_ORIGIN}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        const userData = {
          id: data.user.id,
          uid: String(data.user.id),
          email: data.user.email,
          name: data.user.name,
          photoURL: null,
          token: data.token,
        };
        setUser(userData);
        await storage.setItem(storage.keys.USER, JSON.stringify(userData));
        await storage.setItem(storage.keys.TOKEN, data.token);
        return { success: true, user: userData };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const signup = async (email, password, name) => {
    try {
      const response = await fetch(`${API_ORIGIN}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await response.json();
      if (data.success) {
        const userData = {
          id: data.user.id,
          uid: String(data.user.id),
          email: data.user.email,
          name: data.user.name,
          photoURL: null,
          token: data.token,
        };
        setUser(userData);
        await storage.setItem(storage.keys.USER, JSON.stringify(userData));
        await storage.setItem(storage.keys.TOKEN, data.token);
        return { success: true, user: userData };
      }
      return { success: false, message: data.message || 'Signup failed' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Signup failed. Please try again.' };
    }
  };

  const googleSignIn = async () => {
    // On React Native, use @react-native-google-signin/google-signin to get idToken,
    // then POST to your backend /api/auth/google-signin with { token: idToken }.
    return {
      success: false,
      message: 'Use Google Sign-In native module and send idToken to backend.',
    };
  };

  const logout = async () => {
    setUser(null);
    await storage.removeItem(storage.keys.USER);
    await storage.removeItem(storage.keys.TOKEN);
  };

  const isAuthenticated = useCallback(() => {
    if (user) return true;
    return false;
  }, [user]);

  const clearCorruptedData = async () => {
    await storage.clear();
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    googleSignIn,
    logout,
    loading,
    isAuthenticated,
    clearCorruptedData,
  };

  if (loading) {
    return (
      <>
        {children}
        {/* Loading state can be handled by a splash or first screen */}
      </>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
