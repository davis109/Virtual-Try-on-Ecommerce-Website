import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const API_URL = 'http://localhost:8000';

const DropZone = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  border: `2px dashed ${theme.palette.primary.main}`,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const PreviewImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '300px',
  objectFit: 'contain',
});

function ImageUploader({ onUpload, imageUrl, accept, maxSize }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles[0]);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  // Handle different types of image URLs
  const getDisplayUrl = () => {
    if (!imageUrl) return null;
    
    // If it's an object with previewUrl, use that
    if (typeof imageUrl === 'object' && imageUrl.previewUrl) {
      return imageUrl.previewUrl;
    }
    
    // If it's a full URL, use it directly
    if (typeof imageUrl === 'string') {
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      
      // If it's a file path from the backend, construct the URL
      return `${API_URL}/${imageUrl}`;
    }
    
    return null;
  };

  const displayUrl = getDisplayUrl();

  return (
    <Box>
      <DropZone {...getRootProps()}>
        <input {...getInputProps()} />
        {displayUrl ? (
          <PreviewImage src={displayUrl} alt="Preview" />
        ) : (
          <Box sx={{ p: 3 }}>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography>
              {isDragActive
                ? 'Drop the image here'
                : 'Drag and drop an image here, or click to select'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Maximum file size: {Math.round(maxSize / 1024 / 1024)}MB
            </Typography>
          </Box>
        )}
      </DropZone>
    </Box>
  );
}

export default ImageUploader; 