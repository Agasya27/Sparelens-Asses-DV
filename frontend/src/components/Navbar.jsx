import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { filesAPI } from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToDashboard = async () => {
    try {
      // Try to open the most recent/first file; fallback to files list
      const res = await filesAPI.getFiles(1, 1);
      const first = res?.data?.files?.[0];
      if (first?.id) {
        navigate(`/dashboard/${first.id}`);
      } else {
        navigate('/files');
      }
    } catch {
      navigate('/files');
    }
  };

  if (!user) return null;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-4">
            <button onClick={goToDashboard} className="text-left text-xl font-bold text-blue-600">
              Data Dashboard
            </button>
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
