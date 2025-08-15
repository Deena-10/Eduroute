import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Questionnaire from './pages/Questionnaire';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
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
    if (!user) {
        return <Navigate to="/login" />;
    }
    return children;
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                {/* 🎯 THE FIX: The main container now uses inline styles to fill the entire viewport. */}
                <div style={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    flexDirection: 'column',
                    // This padding is now applied to the container, not the routes themselves
                    paddingTop: '64px', // Assuming your Navbar has a height of 64px
                    boxSizing: 'border-box',
                }}>
                    <Navbar />
                    {/* The main content area that will be scrollable */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/profile" element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            } />
                            <Route path="/questionnaire" element={
                                <ProtectedRoute>
                                    <Questionnaire />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </div>
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;
