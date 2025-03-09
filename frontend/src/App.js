import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Paper,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ImageUploader from './components/ImageUploader';
import ResultViewer from './components/ResultViewer';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

const RootContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const Header = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  color: theme.palette.primary.main,
}));

const UploadSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

function App() {
  const [modelImage, setModelImage] = useState(null);
  const [clothImage, setClothImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useSegmind, setUseSegmind] = useState(false);
  const [processingTime, setProcessingTime] = useState(null);
  const [clothingCategory, setClothingCategory] = useState("Upper body");

  const handleModelUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${API_URL}/api/upload/model`, formData);
      console.log('Model upload response:', response.data);
      
      // Create a local preview URL for immediate display
      const localPreviewUrl = URL.createObjectURL(file);
      
      // Store both the server path and the local preview
      setModelImage({
        path: response.data.filename,
        previewUrl: localPreviewUrl
      });
      
      setError(null);
    } catch (err) {
      setError('Error uploading model image');
      console.error(err);
    }
  };

  const handleClothUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${API_URL}/api/upload/cloth`, formData);
      console.log('Cloth upload response:', response.data);
      
      // Create a local preview URL for immediate display
      const localPreviewUrl = URL.createObjectURL(file);
      
      // Store both the server path and the local preview
      setClothImage({
        path: response.data.filename,
        previewUrl: localPreviewUrl
      });
      
      setError(null);
    } catch (err) {
      setError('Error uploading clothing image');
      console.error(err);
    }
  };

  const handleTryOn = async () => {
    if (!modelImage || !clothImage) {
      setError('Please upload both model and clothing images');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResultImage(null); // Clear previous result
      setProcessingTime(null); // Clear previous processing time
      
      // Get the paths from the image objects
      const modelPath = typeof modelImage === 'object' ? modelImage.path : modelImage;
      const clothPath = typeof clothImage === 'object' ? clothImage.path : clothImage;
      
      console.log('Sending try-on request with:', { modelPath, clothPath, useSegmind, clothingCategory });
      
      const startTime = Date.now();
      
      const response = await axios.post(
        `${API_URL}/api/tryon?model_path=${encodeURIComponent(modelPath)}&cloth_path=${encodeURIComponent(clothPath)}&use_segmind=${useSegmind}&clothing_category=${encodeURIComponent(clothingCategory)}`
      );
      
      const endTime = Date.now();
      setProcessingTime((endTime - startTime) / 1000); // Convert to seconds
      
      console.log('Try-on response:', response.data);
      if (response.data && response.data.result) {
        setResultImage(`${API_URL}/api/result/${response.data.result}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Try-on error details:', err.response?.data || err.message);
      setError(`Error processing virtual try-on: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RootContainer maxWidth="lg">
      <Header variant="h3" component="h1">
        Virtual Try-On
      </Header>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <UploadSection>
            <Typography variant="h6" gutterBottom>
              Upload Model Image
            </Typography>
            <ImageUploader
              onUpload={handleModelUpload}
              imageUrl={modelImage}
              accept="image/*"
              maxSize={10485760} // 10MB
            />
          </UploadSection>
        </Grid>

        <Grid item xs={12} md={6}>
          <UploadSection>
            <Typography variant="h6" gutterBottom>
              Upload Clothing Image
            </Typography>
            <ImageUploader
              onUpload={handleClothUpload}
              imageUrl={clothImage}
              accept="image/*"
              maxSize={10485760} // 10MB
            />
            
            {clothImage && (
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="clothing-category-label">Clothing Category</InputLabel>
                  <Select
                    labelId="clothing-category-label"
                    id="clothing-category"
                    value={clothingCategory}
                    label="Clothing Category"
                    onChange={(e) => setClothingCategory(e.target.value)}
                  >
                    <MenuItem value="Upper body">Upper Body (Shirts, T-shirts, Jackets)</MenuItem>
                    <MenuItem value="Lower body">Lower Body (Pants, Jeans, Skirts)</MenuItem>
                    <MenuItem value="Dress">Full Dress</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </UploadSection>
        </Grid>
      </Grid>

      <Box sx={{ textAlign: 'center', my: 3 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Processing Options
          </Typography>
          <Tooltip title="Use Segmind's AI-powered virtual try-on API for more realistic results (requires API key)">
            <FormControlLabel
              control={
                <Switch
                  checked={useSegmind}
                  onChange={(e) => setUseSegmind(e.target.checked)}
                  color="primary"
                />
              }
              label="Use Segmind AI (External API)"
            />
          </Tooltip>
          
          {useSegmind && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Using Segmind API may take longer but can provide more realistic results.
              The clothing category selection will be used for better fitting results.
            </Alert>
          )}
        </Paper>
        
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleTryOn}
          disabled={loading || !modelImage || !clothImage}
        >
          {loading ? <CircularProgress size={24} /> : 'Try On'}
        </Button>
      </Box>

      {error && (
        <Typography color="error" align="center" gutterBottom>
          {error}
        </Typography>
      )}

      {resultImage && (
        <>
          <ResultViewer imageUrl={resultImage} />
          {processingTime && (
            <Typography variant="body2" align="center" color="textSecondary" sx={{ mt: 1 }}>
              Processing time: {processingTime.toFixed(2)} seconds
              {useSegmind && " (using Segmind AI)"}
            </Typography>
          )}
        </>
      )}
    </RootContainer>
  );
}

export default App; 