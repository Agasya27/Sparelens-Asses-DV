import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { filesAPI } from '../services/api';

export default function FilesList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await filesAPI.getFiles(1, 100);
      setFiles(response.data.files);
    } catch (err) {
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await filesAPI.deleteFile(id);
      setFiles(files.filter(f => f.id !== id));
    } catch (err) {
      alert('Failed to delete file');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Files</h1>
        <button
          onClick={() => navigate('/upload')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Upload New File
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {files.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No files uploaded yet</p>
          <button
            onClick={() => navigate('/upload')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Upload Your First File
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex justify-between items-center"
            >
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {file.filename}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Rows: {file.row_count}</p>
                  <p>Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/dashboard/${file.id}`)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  View Dashboard
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
