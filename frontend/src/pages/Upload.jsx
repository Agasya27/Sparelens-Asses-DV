import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { filesAPI } from '../services/api';

export default function Upload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError('');
    setSuccess(null);
    setProgress(0);

    try {
      const response = await filesAPI.upload(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      });

      setSuccess(response.data);
      setTimeout(() => {
        navigate(`/dashboard/${response.data.id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    disabled: uploading
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Upload File</h1>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="text-6xl mb-4">📊</div>
        {isDragActive ? (
          <p className="text-xl text-blue-600 dark:text-blue-400">Drop the file here...</p>
        ) : (
          <div>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">
              Drag and drop a CSV or Excel file here
            </p>
            <p className="text-gray-500 dark:text-gray-400">or click to select a file</p>
          </div>
        )}
      </div>

      {uploading && (
        <div className="mt-6">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-center mt-2 text-gray-600 dark:text-gray-400">
            Uploading... {progress}%
          </p>
        </div>
      )}

      {error && (
        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="font-semibold">File uploaded successfully!</p>
          <p>Filename: {success.filename}</p>
          <p>Rows: {success.row_count}</p>
          <p>Columns: {success.columns.join(', ')}</p>
          <p className="mt-2 text-sm">Redirecting to dashboard...</p>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => navigate('/files')}
          className="text-blue-600 hover:underline"
        >
          ← Back to Files
        </button>
      </div>
    </div>
  );
}
