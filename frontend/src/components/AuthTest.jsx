import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AuthTest = () => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  
  return (
    <div className="fixed top-20 right-4 bg-white p-4 rounded-lg shadow-lg border z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <p>Loading: {loading ? 'Yes' : 'No'}</p>
      <p>User: {user ? user.email : 'None'}</p>
      <p>Authenticated: {isAuthenticated() ? 'Yes' : 'No'}</p>
      <p>Token: {localStorage.getItem('token') ? 'Present' : 'None'}</p>
    </div>
  );
};

export default AuthTest;
