//frontend/src/components/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
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
                padding: '0 24px',
                maxWidth: '1200px',
                margin: '0 auto',
                minHeight: '64px'
            }}>
                
                {/* Logo / Brand */}
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '32px' }}>🚀</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>EduRoute AI</div>
                </Link>

                {/* Actions: Direct Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {!user ? (
                        <>
                            <Link
                                to="/login"
                                style={{
                                    textDecoration: 'none',
                                    color: isActive('/login') ? '#3b82f6' : '#1e293b',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    backgroundColor: isActive('/login') ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
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
                                    color: isActive('/') ? '#3b82f6' : '#1e293b',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    backgroundColor: isActive('/') ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    fontWeight: '500'
                                }}
                            >
                                🏠 Dashboard
                            </Link>
                            <Link
                                to="/profile"
                                style={{
                                    textDecoration: 'none',
                                    color: isActive('/profile') ? '#3b82f6' : '#1e293b',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    backgroundColor: isActive('/profile') ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
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
