// frontend/src/components/Navbar.jsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: '#F6F6F6' }}>
      <div className="bg-white shadow-lg border-b border-gray-300 p-3">
        <div className="flex items-center justify-between">
          {/* Logo and Name - Left Side */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <img src="/logo1.png" alt="EduRoute AI Logo" className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold" style={{ color: '#000000' }}>
              EduRoute AI
            </span>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className="px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-100"
              style={{ color: '#000000' }}
            >
              Home
            </Link>
            <Link
              to="/questionnaire"
              className="px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-100"
              style={{ color: '#000000' }}
            >
              AI Chat
            </Link>
            <Link
              to="/roadmap"
              className="px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-100"
              style={{ color: '#000000' }}
            >
              Roadmap
            </Link>
            {user && (
              <Link
                to="/profile"
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-100"
                style={{ color: '#000000' }}
              >
                Profile
              </Link>
            )}
          </div>

          {/* User Profile / Auth - Right Side */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#000000' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-300">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-100"
                style={{ color: '#000000' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {user && (
                <Link
                  to="/questionnaire"
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-100"
                  style={{ color: '#000000' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  AI Chat
                </Link>
              )}
              <Link
                to="/roadmap"
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-100"
                style={{ color: '#000000' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Roadmap
              </Link>
              {user && (
                <Link
                  to="/profile"
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-100"
                  style={{ color: '#000000' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
