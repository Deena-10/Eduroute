// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebaseConfig';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const existingUser = localStorage.getItem('user');
        if (existingUser) {
            setUser(JSON.parse(existingUser));
            setLoading(false);
        } else {
            const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
                if (firebaseUser) {
                    const userData = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                        photoURL: firebaseUser.photoURL,
                        authType: 'firebase'
                    };
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                } else {
                    setUser(null);
                    localStorage.removeItem('user');
                }
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axiosInstance.post('/auth/login', { email, password });
            if (res.data.success) {
                const userData = { ...res.data.user, authType: 'backend' };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('token', res.data.token);
                return { success: true, user: userData };
            } else {
                return { success: false, error: res.data.message || 'Login failed' };
            }
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    };

    const signup = async (name, email, password) => {
        try {
            const res = await axiosInstance.post('/auth/signup', { name, email, password });
            if (res.data.success) {
                const userData = { ...res.data.user, authType: 'backend' };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('token', res.data.token);
                return { success: true, user: userData };
            } else {
                return { success: false, error: res.data.message || 'Signup failed' };
            }
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Signup failed' };
        }
    };

    const googleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            if (!result.user) throw new Error('Firebase authentication failed');

            const firebaseUserData = {
                uid: result.user.uid,
                email: result.user.email,
                name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
                photoURL: result.user.photoURL,
                authType: 'firebase'
            };

            // Send data to backend for profile creation/login
            const backendRes = await axiosInstance.post('/auth/google-signin', {
                uid: result.user.uid,
                email: result.user.email,
                name: firebaseUserData.name,
                photoURL: result.user.photoURL
            });

            if (backendRes.data.success) {
                const backendUser = { ...backendRes.data.user, authType: 'backend' };
                setUser(backendUser);
                localStorage.setItem('user', JSON.stringify(backendUser));
                localStorage.setItem('token', backendRes.data.token);
                return { success: true, user: backendUser };
            } else {
                setUser(firebaseUserData);
                localStorage.setItem('user', JSON.stringify(firebaseUserData));
                return { success: true, user: firebaseUserData };
            }
        } catch (error) {
            console.error('Google SignIn error:', error);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (user?.authType === 'firebase') await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };
      
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px',
                color: '#64748b'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, signup, googleSignIn, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
