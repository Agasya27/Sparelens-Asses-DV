import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/files" className="text-xl font-bold text-blue-600">
              Data Dashboard
            </Link>
            <Link
              to="/files"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600"
            >
              Files
            </Link>
            <Link
              to="/upload"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600"
            >
              Upload
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <span className="text-gray-700 dark:text-gray-300">
              {user.username} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
