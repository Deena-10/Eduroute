/**
 * AsyncStorage wrapper - drop-in replacement for localStorage in React Native.
 * Use this for persistent data (user, token, preferences).
 *
 * Usage:
 *   import storage from '../storage/asyncStorage';
 *   await storage.setItem('token', token);
 *   const token = await storage.getItem('token');
 *   await storage.removeItem('token');
 *   await storage.clear();
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const keys = {
  USER: 'user',
  TOKEN: 'token',
  AUTH: 'auth',
  FIREBASE: 'firebase',
};

const storage = {
  async getItem(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn('AsyncStorage getItem error:', e);
      return null;
    }
  },

  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch (e) {
      console.warn('AsyncStorage setItem error:', e);
    }
  },

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn('AsyncStorage removeItem error:', e);
    }
  },

  async clear() {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.warn('AsyncStorage clear error:', e);
    }
  },

  async multiGet(keysList) {
    try {
      return await AsyncStorage.multiGet(keysList);
    } catch (e) {
      console.warn('AsyncStorage multiGet error:', e);
      return [];
    }
  },

  keys,
};

export default storage;
