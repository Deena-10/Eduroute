// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Global error handler for JSON parsing
  useEffect(() => {
    const handleGlobalError = (event) => {
      if (
        event.error &&
        event.error.message &&
        (event.error.message.includes("JSON") ||
          event.error.message.includes("Unexpected token") ||
          event.error.message.includes("You need t"))
      ) {
        console.warn("Global JSON parsing error caught:", event.error.message);
        // Clear potentially corrupted localStorage
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          console.log("Error clearing storage:", e);
        }
        // Don't let JSON parsing errors crash the app
        event.preventDefault();
      }
    };

    const handleUnhandledRejection = (event) => {
      if (
        event.reason &&
        event.reason.message &&
        (event.reason.message.includes("JSON") ||
          event.reason.message.includes("Unexpected token"))
      ) {
        console.warn("Unhandled JSON parsing error:", event.reason.message);
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          console.log("Error clearing storage:", e);
        }
        event.preventDefault();
      }
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  // Check for existing user on app load
  useEffect(() => {
    const loadUser = async () => {
      try {
        // First, clear any corrupted localStorage data
        try {
          // Check all localStorage keys for corruption
          const keysToCheck = ["user", "token", "auth", "firebase"];
          let hasCorruption = false;

          // Check each key for corruption
          for (const key of keysToCheck) {
            try {
              const value = localStorage.getItem(key);
              if (value) {
                // Check for common corruption patterns
                if (
                  value.includes("You need to enable JavaScript") ||
                  value.includes("<!DOCTYPE") ||
                  value.includes("<html") ||
                  value.includes("SyntaxError") ||
                  value.includes("Unexpected token") ||
                  value.includes("You need t") ||
                  value.startsWith("<") ||
                  value.includes("script") ||
                  value.includes("body") ||
                  value.includes("head")
                ) {
                  console.log(
                    `Found corrupted data in localStorage key '${key}', clearing all...`
                  );
                  hasCorruption = true;
                  break;
                }

                // Try to parse as JSON to catch JSON parsing errors
                try {
                  JSON.parse(value);
                } catch (jsonError) {
                  console.log(
                    `Invalid JSON in localStorage key '${key}', clearing all...`
                  );
                  hasCorruption = true;
                  break;
                }
              }
            } catch (e) {
              console.log(
                `Error checking localStorage key '${key}', clearing all...`
              );
              hasCorruption = true;
              break;
            }
          }

          // Also check all localStorage keys for any corruption
          try {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key) {
                const value = localStorage.getItem(key);
                if (
                  value &&
                  (value.includes("You need to enable JavaScript") ||
                    value.includes("<!DOCTYPE") ||
                    value.includes("<html") ||
                    value.includes("SyntaxError") ||
                    value.includes("Unexpected token") ||
                    value.includes("You need t"))
                ) {
                  console.log(
                    `Found corrupted data in localStorage key '${key}', clearing all...`
                  );
                  hasCorruption = true;
                  break;
                }
              }
            }
          } catch (e) {
            console.log(
              "Error checking all localStorage keys, clearing all..."
            );
            hasCorruption = true;
          }

          if (hasCorruption) {
            localStorage.clear();
            // Also clear sessionStorage to be safe
            sessionStorage.clear();
            console.log(
              "Cleared all corrupted localStorage and sessionStorage data"
            );
          }
        } catch (e) {
          console.log("Error checking localStorage, clearing all...");
          localStorage.clear();
          sessionStorage.clear();
        }

        // Check for Google OAuth redirect result first
        try {
          const { getRedirectResult } = await import("firebase/auth");
          const { auth } = await import("../firebase");
          const redirectResult = await getRedirectResult(auth);

          if (redirectResult) {
            console.log("Google OAuth redirect result found, processing...");
            const user = redirectResult.user;
            const idToken = await user.getIdToken();

            // Send the token to your backend
            const response = await fetch(
              "http://localhost:5000/api/auth/google-signin",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: idToken }),
              }
            );

            const data = await response.json();

            if (data.success) {
              console.log(
                "Google OAuth successful, setting user data:",
                data.user
              );
              const userData = {
                id: data.user.id,
                uid: data.user.id.toString(),
                email: data.user.email,
                name: data.user.name,
                photoURL: data.user.profilePicture,
                token: data.token,
              };

              setUser(userData);
              localStorage.setItem("user", JSON.stringify(userData));
              localStorage.setItem("token", data.token);
              setLoading(false);

              // Redirect to home page after successful login
              console.log("Redirecting to home page...");
              window.location.href = "/";
              return;
            } else {
              console.error("Google OAuth backend error:", data.message);
              setLoading(false);
            }
          }
        } catch (redirectError) {
          console.log("No redirect result or error:", redirectError);
        }

        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        console.log("Loading user from localStorage:", {
          storedUser: storedUser ? storedUser.substring(0, 50) + "..." : null,
          token: token ? "present" : null,
        });

        // Check for the specific corrupted data we're seeing
        if (
          storedUser &&
          storedUser.includes("You need to enable JavaScript")
        ) {
          console.log("Found corrupted data, clearing localStorage completely");
          localStorage.clear();
          setUser(null);
          return;
        }

        // If we have a token but no user, try to restore user from token
        if (
          token &&
          (!storedUser || storedUser === "null" || storedUser === "undefined")
        ) {
          console.log(
            "Token exists but no user data, attempting to restore..."
          );
          // Try to decode basic user info from token (if it's a JWT)
          try {
            const tokenParts = token.split(".");
            if (tokenParts.length === 3) {
              const tokenPayload = JSON.parse(atob(tokenParts[1]));
              if (tokenPayload && tokenPayload.id) {
                const restoredUser = {
                  id: tokenPayload.id,
                  uid: tokenPayload.id.toString(),
                  email: tokenPayload.email || "user@example.com",
                  name: tokenPayload.name || "User",
                  photoURL: null,
                  token: token,
                };
                setUser(restoredUser);
                localStorage.setItem("user", JSON.stringify(restoredUser));
                console.log("User restored from token");
                return;
              }
            }
          } catch (tokenError) {
            console.log("Could not decode token, proceeding with normal flow");
          }
        }

        if (
          storedUser &&
          storedUser !== "null" &&
          storedUser !== "undefined" &&
          token
        ) {
          try {
            const parsedUser = JSON.parse(storedUser);
            // Validate that the parsed user has required fields
            if (
              parsedUser &&
              typeof parsedUser === "object" &&
              parsedUser.email
            ) {
              console.log("Setting user from localStorage:", parsedUser);
              setUser(parsedUser);
              // Ensure token is stored
              if (parsedUser.token && !localStorage.getItem("token")) {
                localStorage.setItem("token", parsedUser.token);
                console.log("Restored token from user object");
              }
            } else {
              console.warn(
                "Invalid user data structure in localStorage, clearing..."
              );
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              setUser(null);
            }
          } catch (parseError) {
            console.error(
              "Error parsing user JSON from localStorage:",
              parseError
            );
            console.log("Raw storedUser value:", storedUser);
            // Don't clear everything on parse error, try to keep token
            if (token) {
              console.log("Keeping token despite user parse error");
              setUser({
                id: "temp",
                uid: "temp",
                email: "user@example.com",
                name: "User",
                photoURL: null,
                token: token,
              });
            } else {
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              setUser(null);
            }
          }
        } else if (
          storedUser &&
          storedUser !== "null" &&
          storedUser !== "undefined"
        ) {
          // We have user data but no token - try to parse and restore
          try {
            const parsedUser = JSON.parse(storedUser);
            if (
              parsedUser &&
              typeof parsedUser === "object" &&
              parsedUser.email &&
              parsedUser.token
            ) {
              console.log(
                "Found user data without token, restoring token from user object"
              );
              setUser(parsedUser);
              localStorage.setItem("token", parsedUser.token);
            } else {
              console.warn("User data exists but no token found, clearing...");
              localStorage.removeItem("user");
              setUser(null);
            }
          } catch (parseError) {
            console.error("Error parsing user JSON:", parseError);
            localStorage.removeItem("user");
            setUser(null);
          }
        } else {
          // Clear any invalid data
          console.log("No valid user data in localStorage, clearing...");
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (error) {
        console.error("Error in loadUser:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
      }
    };

    loadUser();
    setLoading(false);
  }, []);

  // Email login
  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const userData = {
          id: data.user.id,
          uid: data.user.id.toString(), // For compatibility
          email: data.user.email,
          name: data.user.name,
          photoURL: null,
          token: data.token,
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", data.token);

        return { success: true, user: userData };
      } else {
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Login failed. Please try again." };
    }
  };

  // Email signup
  const signup = async (email, password, name) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (data.success) {
        const userData = {
          id: data.user.id,
          uid: data.user.id.toString(), // For compatibility
          email: data.user.email,
          name: data.user.name,
          photoURL: null,
          token: data.token,
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", data.token);

        return { success: true, user: userData };
      } else {
        return { success: false, message: data.message || "Signup failed" };
      }
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, message: "Signup failed. Please try again." };
    }
  };

  // Google login
  const googleSignIn = async () => {
    try {
      // Import Firebase auth dynamically to avoid SSR issues
      const { getAuth, signInWithRedirect, GoogleAuthProvider } = await import(
        "firebase/auth"
      );
      const { auth, googleProvider } = await import("../firebase");

      // Start the redirect flow
      console.log("Starting Google OAuth redirect...");
      await signInWithRedirect(auth, googleProvider);
      return { success: true, message: "Redirecting to Google..." };
    } catch (error) {
      console.error("Google login error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        return { success: false, message: "Sign in was cancelled" };
      }
      return {
        success: false,
        message: "Google login failed. Please try again.",
      };
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Import Firebase auth dynamically
      const { getAuth, signOut } = await import("firebase/auth");
      const { auth } = await import("../firebase");

      // Sign out from Firebase
      await signOut(auth);
    } catch (error) {
      console.log("Firebase logout error (non-critical):", error);
    }

    // Clear local state
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    const hasUser = user !== null;
    const hasToken = localStorage.getItem("token") !== null;
    const token = localStorage.getItem("token");

    console.log("Auth check:", {
      hasUser,
      hasToken,
      user: user ? { id: user.id, email: user.email, name: user.name } : null,
      token: token ? token.substring(0, 20) + "..." : null,
    });

    // If we have a user but no token, try to get token from user object
    if (hasUser && !hasToken && user.token) {
      console.log("Found token in user object, restoring to localStorage");
      localStorage.setItem("token", user.token);
      return true;
    }

    // If we have a token but no user, try to restore user
    if (!hasUser && hasToken) {
      console.log("Have token but no user, attempting to restore...");
      // This will trigger the useEffect to run again
      setUser({
        id: "temp",
        uid: "temp",
        email: "user@example.com",
        name: "User",
        photoURL: null,
        token: token,
      });
      return true;
    }

    return hasUser && hasToken;
  };

  // Clear corrupted localStorage data
  const clearCorruptedData = () => {
    console.log("Clearing corrupted localStorage data...");
    try {
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      console.log("Successfully cleared all storage data");
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  };

  if (loading) {
    return (
      <div
        className="flex justify-center items-center h-screen"
        style={{ backgroundColor: "#F6F6F6" }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg" style={{ color: "#000000" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        googleSignIn,
        logout,
        loading,
        isAuthenticated,
        clearCorruptedData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
