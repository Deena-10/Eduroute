// frontend/src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Load user from localStorage safely
    useEffect(() => {
        const loadUser = () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser && storedUser !== 'null') {
                    setUser(JSON.parse(storedUser));
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Failed to parse user from localStorage:", error);
                setUser(null);
                localStorage.removeItem('user');
            }
        };

        loadUser();

        // Optional: Listen for cross-tab logout/login
        const handleStorageChange = () => loadUser();
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav style={{
            backgroundColor: 'white',
            color: '#1e293b',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 16px',
                maxWidth: '1200px',
                margin: '0 auto',
                minHeight: '50px'
            }}>
                {/* Logo / Brand */}
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/logo1.png" alt="EduRoute AI Logo" style={{ height: '40px' }} />
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>EduRoute AI</span>
                </Link>

                {/* Navigation Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {!user ? (
                        <>
                            <Link
                                to="/login"
                                style={{
                                    textDecoration: 'none',
                                    color: '#1e293b',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    backgroundColor: isActive('/login') ? 'rgba(0,0,0,0.05)' : 'transparent',
                                    fontWeight: '500'
                                }}
                            >
                                🔐 Login
                            </Link>
                            <Link
                                to="/signup"
                                style={{
                                    textDecoration: 'none',
                                    color: 'white',
                                    backgroundColor: '#3b82f6',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    fontWeight: '600'
                                }}
                            >
                                Get Started
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/"
                                style={{
                                    textDecoration: 'none',
                                    color: '#1e293b',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    backgroundColor: isActive('/') ? 'rgba(0,0,0,0.05)' : 'transparent',
                                    fontWeight: '500'
                                }}
                            >
                                🏠 Dashboard
                            </Link>
                            <Link
                                to="/profile"
                                style={{
                                    textDecoration: 'none',
                                    color: '#1e293b',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    backgroundColor: isActive('/profile') ? 'rgba(0,0,0,0.05)' : 'transparent',
                                    fontWeight: '500'
                                }}
                            >
                                👤 Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                style={{
                                    background: 'none',
                                    border: '1px solid #ef4444',
                                    color: '#ef4444',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                🚪 Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
