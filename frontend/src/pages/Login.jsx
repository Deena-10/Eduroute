import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const authContext = useContext(AuthContext);
  const login = authContext?.login;
  const googleSignIn = authContext?.googleSignIn;
  const navigate = useNavigate();

  if (!authContext || typeof login !== "function") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F6F6F6" }}>
        <p className="text-red-600">Auth not available. Please refresh the page.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        navigate("/");
      } else {
        setError(result.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);

    try {
      const result = await googleSignIn();

      if (result.success) {
        navigate("/"); // ✅ Navigate immediately (Popup mode)
      } else {
        setError(result.message || "Google sign in failed");
      }
    } catch (err) {
      setError(err.message || "Google sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F6F6" }}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mx-auto mb-4">
              <img
                src="/logo.png"
                alt="EduRoute AI Logo"
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: "#000000" }}>
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to continue your career journey
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-300 shadow-2xl">
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-700 text-center font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium disabled:opacity-50"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-50 text-gray-800 py-3 px-4 rounded-xl font-medium border border-gray-300 shadow-sm disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? "Signing in..." : "Continue with Google"}
            </button>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;