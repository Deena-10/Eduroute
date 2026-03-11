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

function App() {
  useEffect(() => {
    // Preventive: Clear any existing corrupted data on startup
    const clearedKeys = clearCorruptedLocalStorage();
    if (clearedKeys > 0) {
      console.log(`🧹 Preventively cleared ${clearedKeys} corrupted localStorage keys on startup`);
    }
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
