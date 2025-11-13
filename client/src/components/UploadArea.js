import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function UploadArea({ onFileUpload }) {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 1
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: isDragActive ? '2px dashed #ffffff' : '2px dashed #404040',
        borderRadius: '4px',
        padding: '60px 40px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive ? '#2d2d2d' : '#242424',
        transition: 'all 0.2s ease'
      }}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <div>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            📥
          </div>
          <p style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#ffffff',
            margin: 0
          }}>
            Drop your image here
          </p>
        </div>
      ) : (
        <div>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            📸
          </div>
          <p style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#ffffff',
            marginBottom: '8px'
          }}>
            Drag and drop an image here
          </p>
          <p style={{
            fontSize: '14px',
            color: '#a0a0a0',
            marginBottom: '16px'
          }}>
            or click to browse
          </p>
          <p style={{
            fontSize: '13px',
            color: '#707070',
            margin: 0
          }}>
            Supported: JPG, PNG • Max size: 5MB
          </p>
        </div>
      )}
    </div>
  );
}

export default UploadArea; 