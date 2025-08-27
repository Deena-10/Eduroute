// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing user on app load
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser && storedUser !== 'null' && storedUser !== 'undefined') {
          const parsedUser = JSON.parse(storedUser);
          // Validate that the parsed user has required fields
          if (parsedUser && typeof parsedUser === 'object' && parsedUser.email) {
            setUser(parsedUser);
          } else {
            console.warn("Invalid user data in localStorage, clearing...");
            localStorage.removeItem("user");
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
        setUser(null);
      }
    };

    loadUser();
    setLoading(false);
  }, []);

  // Email login
  const login = async (email, password) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any email/password combination
      const userData = {
        uid: Date.now().toString(),
        email: email,
        name: email.split('@')[0],
        photoURL: null,
        token: 'demo-token-' + Date.now(),
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Login failed. Please try again." };
    }
  };

  // Email signup
  const signup = async (email, password, name) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, create user with provided data
      const userData = {
        uid: Date.now().toString(),
        email: email,
        name: name || email.split('@')[0],
        photoURL: null,
        token: 'demo-token-' + Date.now(),
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, message: "Signup failed. Please try again." };
    }
  };

  // Google login
  const googleSignIn = async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, create a mock Google user
      const userData = {
        uid: 'google-' + Date.now().toString(),
        email: 'demo@gmail.com',
        name: 'Demo User',
        photoURL: 'https://via.placeholder.com/150',
        token: 'google-demo-token-' + Date.now(),
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      console.error("Google login error:", error);
      return { success: false, message: "Google login failed. Please try again." };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen" style={{ backgroundColor: '#F6F6F6' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg" style={{ color: '#000000' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, login, signup, googleSignIn, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
