//auth.js
import API from './axios';

export const signup = async (name, email, password) => {
  try {
    const res = await API.post('/auth/signup', { name, email, password });
    alert(res.data.message);
    return true;
  } catch (err) {
    alert(err.response?.data?.message || 'Signup failed');
    return false;
  }
};

export const login = async (email, password) => {
  try {
    const res = await API.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (err) {
    alert(err.response?.data?.message || 'Login failed');
    return null;
  }
};

export const getUserProfile = async () => {
  try {
    const res = await API.get('/user/profile');
    return res.data;
  } catch (err) {
    console.error('Profile fetch error:', err);
    return null;
  }
};
