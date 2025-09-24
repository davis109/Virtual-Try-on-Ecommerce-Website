import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';
import { utils } from '../services/api';

const UploadContainer = styled(motion.div)`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const DropzoneArea = styled(motion.div)`
  border: 2px dashed ${props => props.isDragActive ? '#667eea' : '#d1d5db'};
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragActive ? 'rgba(102, 126, 234, 0.05)' : '#f9fafb'};
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.02);
  }
  
  .upload-icon {
    font-size: 3rem;
    color: ${props => props.isDragActive ? '#667eea' : '#9ca3af'};
    margin-bottom: 1rem;
    transition: all 0.3s ease;
  }
  
  .upload-text {
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
  }
  
  .upload-subtext {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 1rem;
  }
  
  .upload-formats {
    font-size: 0.75rem;
    color: #9ca3af;
  }
`;

const PreviewContainer = styled(motion.div)`
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  background: #f9fafb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: block;
`;

const PreviewOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.8));
  display: flex;
  align-items: flex-end;
  padding: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${PreviewContainer}:hover & {
    opacity: 1;
  }
`;

const PreviewActions = styled.div`
  display: flex;
  gap: 0.5rem;
  width: 100%;
`;

const ActionButton = styled(motion.button)`
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.primary {
    background: #667eea;
    color: white;
    
    &:hover {
      background: #5a6fd8;
    }
  }
  
  &.secondary {
    background: rgba(255, 255, 255, 0.9);
    color: #374151;
    
    &:hover {
      background: white;
    }
  }
`;

const FileInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 0 0 1rem 1rem;
  border-top: 1px solid #e5e7eb;
  
  .file-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .file-size {
    font-size: 0.75rem;
    color: #6b7280;
  }
`;

const UploadProgress = styled(motion.div)`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  background: #667eea;
  border-radius: 0 0 1rem 1rem;
`;

const ErrorMessage = styled(motion.div)`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-top: 1rem;
  color: #dc2626;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .error-icon {
    color: #dc2626;
  }
`;

const ImageUpload = ({ 
  onFileSelect, 
  onFileRemove, 
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxSize = 10 * 1024 * 1024, // 10MB
  title = "Upload Your Photo",
  subtitle = "Drag and drop or click to select",
  currentFile = null,
  loading = false,
  error = null,
  className = ""
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      let errorMessage = 'File upload failed';
      
      if (rejection.errors.some(e => e.code === 'file-too-large')) {
        errorMessage = `File is too large. Maximum size is ${utils.formatFileSize(maxSize)}`;
      } else if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
        errorMessage = 'Invalid file type. Please upload an image file';
      }
      
      onFileSelect(null, errorMessage);
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      try {
        utils.validateImageFile(file);
        onFileSelect(file, null);
        
        // Simulate upload progress
        setUploadProgress(0);
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              return 100;
            }
            return prev + 10;
          });
        }, 100);
      } catch (validationError) {
        onFileSelect(null, validationError.message);
      }
    }
  }, [onFileSelect, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedTypes.map(type => type.replace('image/', '.'))
    },
    maxSize,
    multiple: false
  });

  const handleRemove = () => {
    setUploadProgress(0);
    onFileRemove();
  };

  const previewUrl = currentFile ? utils.createImagePreview(currentFile) : null;

  return (
    <UploadContainer className={className}>
      <AnimatePresence mode="wait">
        {!currentFile ? (
          <DropzoneArea
            key="dropzone"
            {...getRootProps()}
            isDragActive={isDragActive}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input {...getInputProps()} />
            <motion.div
              className="upload-icon"
              animate={{ 
                y: isDragActive ? -5 : 0,
                scale: isDragActive ? 1.1 : 1 
              }}
            >
              <i className={isDragActive ? "fas fa-cloud-upload-alt" : "fas fa-image"} />
            </motion.div>
            <div className="upload-text">{title}</div>
            <div className="upload-subtext">{subtitle}</div>
            <div className="upload-formats">
              Supported formats: JPEG, PNG, WebP (max {utils.formatFileSize(maxSize)})
            </div>
          </DropzoneArea>
        ) : (
          <PreviewContainer
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {previewUrl && (
              <PreviewImage 
                src={previewUrl} 
                alt="Preview" 
                onLoad={() => setUploadProgress(100)}
              />
            )}
            
            <PreviewOverlay>
              <PreviewActions>
                <ActionButton
                  className="secondary"
                  onClick={handleRemove}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-trash" /> Remove
                </ActionButton>
                <ActionButton
                  className="primary"
                  onClick={() => document.querySelector('input[type="file"]').click()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-sync" /> Replace
                </ActionButton>
              </PreviewActions>
            </PreviewOverlay>
            
            {loading && uploadProgress < 100 && (
              <UploadProgress
                style={{ width: `${uploadProgress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            )}
            
            <FileInfo>
              <div>
                <div className="file-name">{currentFile.name}</div>
                <div className="file-size">{utils.formatFileSize(currentFile.size)}</div>
              </div>
            </FileInfo>
          </PreviewContainer>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {error && (
          <ErrorMessage
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <i className="fas fa-exclamation-triangle error-icon" />
            {error}
          </ErrorMessage>
        )}
      </AnimatePresence>
    </UploadContainer>
  );
};

export default ImageUpload;