//C:\finalyearproject\career-roadmap-app\frontend\src\App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import setupGlobalErrorHandler from "./utils/globalErrorHandler";
import { clearCorruptedLocalStorage } from "./utils/safeJsonParser";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Questionnaire from "./pages/Questionnaire";
import Roadmap from "./pages/Roadmap";
import TaskPage from "./pages/TaskPage";
import Profile from "./pages/Profile";

function App() {
  // Setup global error handler on app mount
  useEffect(() => {
    const cleanup = setupGlobalErrorHandler();
    
    // Preventive: Clear any existing corrupted data on startup
    const clearedKeys = clearCorruptedLocalStorage();
    if (clearedKeys > 0) {
      console.log(`🧹 Preventively cleared ${clearedKeys} corrupted localStorage keys on startup`);
    }
    
    return cleanup;
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen" style={{ backgroundColor: "#F6F6F6" }}>
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/questionnaire"
              element={
                <ProtectedRoute>
                  <Questionnaire />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roadmap"
              element={
                <ProtectedRoute>
                  <Roadmap />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roadmap/task/:taskId"
              element={
                <ProtectedRoute>
                  <TaskPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
