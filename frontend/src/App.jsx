//C:\finalyearproject\career-roadmap-app\frontend\src\App.jsx
import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { clearCorruptedLocalStorage } from "./utils/safeJsonParser";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import OnboardingGate from "./components/OnboardingGate";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Questionnaire from "./pages/Questionnaire";
import Roadmap from "./pages/Roadmap";
import ChapterQuiz from "./pages/ChapterQuiz";
import TaskPage from "./pages/TaskPage";
import Profile from "./pages/Profile";
import Events from "./pages/Events";
import AdminPost from "./pages/AdminPost";

function App() {
  useEffect(() => {
    // Preventive: Clear any existing corrupted data on startup
    const clearedKeys = clearCorruptedLocalStorage();
    if (clearedKeys > 0) {
      console.log(`🧹 Preventively cleared ${clearedKeys} corrupted localStorage keys on startup`);
    }

    // Wake-up Ping: Fire a health check to completely wake Render app
    let toastTimeout;
    const apiUrl = (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) 
      ? process.env.REACT_APP_API_URL 
      : 'https://eduroute-1.onrender.com/api';
    const rootUrl = apiUrl.replace(/\/api\/?$/, '');

    toastTimeout = setTimeout(() => {
      if (typeof window !== 'undefined' && !document.getElementById('startup-toast')) {
        const toast = document.createElement('div');
        toast.id = "startup-toast";
        toast.style.cssText = `
          position:fixed;bottom:20px;right:20px;z-index:9999;
          padding:12px 16px;border-radius:12px;background:#EBF5EE;
          border:1px solid #B7E4C7;color:#2D6A4F;font-family:sans-serif;
          font-size:13px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);
        `;
        toast.innerHTML = `🔌 Connecting to server...`;
        document.body.appendChild(toast);
      }
    }, 3000);

    fetch(`${rootUrl}/health`)
      .then(() => {
        clearTimeout(toastTimeout);
        const el = document.getElementById("startup-toast");
        if (el) el.remove();
      })
      .catch(() => clearTimeout(toastTimeout));
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen" style={{ minHeight: "100dvh", position: "relative" }}>
        <div className="app-bg" aria-hidden="true" />
        <Navbar />
        <main className="pt-20 sm:pt-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin/post" element={<AdminPost />} />
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
                  <OnboardingGate>
                    <Roadmap />
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/roadmap/chapter/:unitNumber"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <ChapterQuiz />
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/roadmap/task/:taskId"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <TaskPage />
                  </OnboardingGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <Events />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <OnboardingGate>
                    <Profile />
                  </OnboardingGate>
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
