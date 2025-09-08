import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const AuthStatus = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return (
      <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-50">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">Not logged in</div>
          <a
            href="/login"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-50 min-w-64">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {user?.name || "User"}
            </div>
            <div className="text-sm text-gray-500">{user?.email}</div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AuthStatus;
