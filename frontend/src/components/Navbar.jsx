import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../style/Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="nav-brand">
                    <Link to="/" className="brand-link">
                        <div className="brand-icon">🚀</div>
                        <span className="brand-text">EduRoute AI</span>
                    </Link>
                </div>

                <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    {!user ? (
                        <div className="nav-links">
                            <Link 
                                to="/login" 
                                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="nav-icon">🔐</span>
                                Login
                            </Link>
                            <Link 
                                to="/signup" 
                                className={`nav-link signup-btn ${isActive('/signup') ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="nav-icon">✨</span>
                                Sign Up
                            </Link>
                            <Link 
                                to="/signup" 
                                className={`nav-link get-started-btn ${isActive('/signup') ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="nav-icon">🚀</span>
                                Get Started
                            </Link>
                        </div>
                    ) : (
                        <div className="nav-links">
                            <Link 
                                to="/" 
                                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="nav-icon">🏠</span>
                                Dashboard
                            </Link>
                            <Link 
                                to="/profile" 
                                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="nav-icon">👤</span>
                                Profile
                            </Link>
                            <div className="user-menu">
                                <button 
                                    className="user-menu-btn"
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                >
                                    <div className="user-avatar">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <span className="user-name">{user.name || 'User'}</span>
                                    <span className="dropdown-icon">▼</span>
                                </button>
                                {isMenuOpen && (
                                    <div className="dropdown-menu">
                                        <div className="dropdown-header">
                                            <div className="user-info">
                                                <div className="user-avatar-large">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div className="user-details">
                                                    <div className="user-name-large">{user.name || 'User'}</div>
                                                    <div className="user-email">{user.email}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        <Link 
                                            to="/profile" 
                                            className="dropdown-item"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <span className="dropdown-icon">⚙️</span>
                                            Account Settings
                                        </Link>
                                        <Link 
                                            to="/" 
                                            className="dropdown-item"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <span className="dropdown-icon">📊</span>
                                            My Dashboard
                                        </Link>
                                        <div className="dropdown-divider"></div>
                                        <button 
                                            className="dropdown-item logout-btn"
                                            onClick={handleLogout}
                                        >
                                            <span className="dropdown-icon">🚪</span>
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    className={`hamburger ${isMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
