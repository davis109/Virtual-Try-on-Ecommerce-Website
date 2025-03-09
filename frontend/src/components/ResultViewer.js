import React, { useState } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const ResultContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
}));

const ResultImage = styled('img')({
  maxWidth: '100%',
  height: 'auto',
});

function ResultViewer({ imageUrl }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <ResultContainer>
      <Typography variant="h6" gutterBottom>
        Try-On Result
      </Typography>
      <Box sx={{ textAlign: 'center', minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {loading && <CircularProgress />}
        {error ? (
          <Typography color="error">Failed to load result image</Typography>
        ) : (
          <ResultImage 
            src={imageUrl} 
            alt="Virtual try-on result" 
            onLoad={handleImageLoad} 
            onError={handleImageError}
            style={{ display: loading ? 'none' : 'block' }}
          />
        )}
      </Box>
    </ResultContainer>
  );
}

export default ResultViewer; 