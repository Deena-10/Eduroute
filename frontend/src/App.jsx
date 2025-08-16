import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Profile from './pages/Profile.jsx';
import Questionnaire from './pages/Questionnaire.jsx';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';

// Protected Route Component
// This component checks if the user is authenticated before rendering the child components.
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
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

// The main application component
const App = () => {
    return (
        <AuthProvider>
            {/* The main container now fills the entire viewport. 
              We've removed the explicit padding and will instead let the page content flow 
              naturally below the fixed-position Navbar.
            */}
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#f1f5f9',
            }}>
                {/* The Navbar component is rendered outside of the Routes */}
                <Navbar />
                <main style={{ padding: '24px' }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route 
                            path="/profile" 
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/questionnaire" 
                            element={
                                <ProtectedRoute>
                                    <Questionnaire />
                                </ProtectedRoute>
                            } 
                        />
                    </Routes>
                </main>
            </div>
        </AuthProvider>
    );
};

export default App;
