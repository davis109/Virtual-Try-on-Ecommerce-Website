import React from 'react';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const pulse = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
`;

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: 'linear-gradient(to bottom right, #ffffff, #f5f5f5)',
  animation: `${pulse} 2s infinite ease-in-out`,
  maxWidth: 400,
  margin: '0 auto',
}));

const LoadingOverlay = ({ message, submessage, isAI }) => {
  return (
    <Box sx={{ py: 4 }}>
      <StyledPaper elevation={3}>
        <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
        <Typography variant="h6" color="primary.main" gutterBottom sx={{ fontWeight: 600 }}>
          {message || (isAI ? 'AI Engine Processing...' : 'Processing...')}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {submessage || (isAI 
            ? 'Our AI is working to create a realistic virtual try-on. This may take a few moments.' 
            : 'Creating your virtual try-on. This will only take a moment.')}
        </Typography>
      </StyledPaper>
    </Box>
  );
};

export default LoadingOverlay; 