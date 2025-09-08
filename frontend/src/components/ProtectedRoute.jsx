import React, { useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Add a longer delay to allow authentication state to settle
      const timer = setTimeout(() => {
        const authStatus = isAuthenticated();
        console.log('ProtectedRoute: Authentication check result:', authStatus);
        if (!authStatus) {
          setShouldRedirect(true);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F6F6F6" }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg" style={{ color: "#000000" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (shouldRedirect) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
