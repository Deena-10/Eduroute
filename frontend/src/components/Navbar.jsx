import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null); 

    // This useEffect simulates a user authentication check.
    // It also handles the JSON parsing error.
    useEffect(() => {
        const fakeAuthCheck = () => {
            try {
                const loggedInUser = localStorage.getItem('user');
                // Only attempt to parse if the user exists and is not an empty string
                if (loggedInUser && loggedInUser !== 'null') {
                    setUser(JSON.parse(loggedInUser));
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Failed to parse user from localStorage:", error);
                setUser(null);
                localStorage.removeItem('user'); // Clear the bad data
            }
        };

        fakeAuthCheck();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav style={{
            backgroundColor: 'white', // 🎯 FIX: Changed background color to white
            color: '#1e293b', // 🎯 FIX: Changed font color to dark gray for contrast
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
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>EduRoute AI</div>
                </Link>

                {/* Actions: Direct Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {!user ? (
                        <>
                            <Link
                                to="/login"
                                style={{
                                    textDecoration: 'none',
                                    color: '#1e293b', // 🎯 FIX: Changed text color
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    backgroundColor: isActive('/login') ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
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
                                    color: '#1e293b', // 🎯 FIX: Changed text color
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    backgroundColor: isActive('/') ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                                    fontWeight: '500'
                                }}
                            >
                                🏠 Dashboard
                            </Link>
                            <Link
                                to="/profile"
                                style={{
                                    textDecoration: 'none',
                                    color: '#1e293b', // 🎯 FIX: Changed text color
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    backgroundColor: isActive('/profile') ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
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
