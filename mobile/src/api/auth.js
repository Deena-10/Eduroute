import axiosInstance from './axiosInstance';
import storage from '../storage/asyncStorage';

export const signup = async (name, email, password) => {
  try {
    const res = await axiosInstance.post('/auth/signup', { name, email, password });
    return { success: true, data: res.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || 'Signup failed',
    };
  }
};

export const login = async (email, password) => {
  try {
    const res = await axiosInstance.post('/auth/login', { email, password });
    const { token, user } = res.data;
    await storage.setItem(storage.keys.TOKEN, token);
    await storage.setItem(storage.keys.USER, JSON.stringify(user));
    return { success: true, user, token };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || 'Login failed',
    };
  }
};

export const getUserProfile = async () => {
  try {
    const res = await axiosInstance.get('/user/profile');
    return res.data;
  } catch (err) {
    console.error('Profile fetch error:', err);
    return null;
  }
};
