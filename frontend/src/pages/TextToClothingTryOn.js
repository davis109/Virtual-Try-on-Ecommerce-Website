import React, { useState, useRef } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Box, 
  Paper, 
  CircularProgress,
  Step,
  Stepper,
  StepLabel,
  Card,
  CardMedia,
  Divider,
  IconButton,
  Chip
} from '@mui/material';
import { RefreshRounded, CloudUpload, CheckCircleOutline, ErrorOutline } from '@mui/icons-material';
import axios from 'axios';
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const TextToClothingTryOn = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modelImage, setModelImage] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const [generatedClothingImage, setGeneratedClothingImage] = useState(null);
  const [finalTryOnImage, setFinalTryOnImage] = useState(null);
  const fileInputRef = useRef(null);
  
  const steps = [
    'Enter Clothing Description', 
    'Upload Model', 
    'Generate Clothing Image', 
    'Try On Result'
  ];

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleModelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setModelFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setModelImage(e.target.result);
      };
      reader.readAsDataURL(file);
      setActiveStep(2);
    }
  };

  const generateClothing = async () => {
    if (!prompt) {
      setError('Please enter a clothing description');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Step 1 & 2: Send text prompt to generate clothing image
      const response = await axios.post('/api/generate-clothing', { prompt });
      setGeneratedClothingImage(response.data.imageUrl);
      setActiveStep(3);
    } catch (err) {
      setError('Failed to generate clothing image: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const applyTryOn = async () => {
    if (!modelFile || !generatedClothingImage) {
      setError('Model and clothing image are required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create form data for the files
      const formData = new FormData();
      formData.append('model', modelFile);
      
      // Step 3 & 4: Process the clothing image and apply to model
      const response = await axios.post('/api/text-to-tryon', 
        formData, 
        {
          params: {
            clothingImageUrl: generatedClothingImage,
            category: detectClothingCategory(prompt)
          },
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setFinalTryOnImage(response.data.resultUrl);
      setActiveStep(4);
    } catch (err) {
      setError('Failed to process try-on: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const detectClothingCategory = (prompt) => {
    const lowerPrompt = prompt.toLowerCase();
    
    // Simple keyword-based category detection
    if (lowerPrompt.includes('shirt') || 
        lowerPrompt.includes('t-shirt') || 
        lowerPrompt.includes('tee') || 
        lowerPrompt.includes('blouse') ||
        lowerPrompt.includes('top') ||
        lowerPrompt.includes('sweater') ||
        lowerPrompt.includes('hoodie') ||
        lowerPrompt.includes('jacket')) {
      return 'Upper body';
    } else if (lowerPrompt.includes('pants') || 
               lowerPrompt.includes('jeans') || 
               lowerPrompt.includes('shorts') ||
               lowerPrompt.includes('skirt') ||
               lowerPrompt.includes('trousers')) {
      return 'Lower body';
    } else if (lowerPrompt.includes('dress') ||
               lowerPrompt.includes('gown') ||
               lowerPrompt.includes('jumpsuit') ||
               lowerPrompt.includes('outfit') ||
               lowerPrompt.includes('suit')) {
      return 'Full body';
    }
    
    // Default to upper body
    return 'Upper body';
  };

  const resetProcess = () => {
    setPrompt('');
    setModelImage(null);
    setModelFile(null);
    setGeneratedClothingImage(null);
    setFinalTryOnImage(null);
    setActiveStep(0);
    setError('');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 2,
          background: 'rgba(19, 19, 31, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 242, 255, 0.1)'
        }}
      >
        <Typography variant="h3" align="center" gutterBottom sx={{ 
          mb: 4,
          background: 'linear-gradient(90deg, #00f2ff, #fc0fc0)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          Text to Clothing Virtual Try-On
        </Typography>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Box 
            sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: 'rgba(255, 62, 62, 0.1)', 
              borderRadius: 1,
              border: '1px solid rgba(255, 62, 62, 0.3)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ErrorOutline color="error" sx={{ mr: 1 }} />
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        
        <Grid container spacing={4}>
          {/* Step 1: Text Input */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Describe the Clothing</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Describe the clothing you want to try on (e.g., 'A red floral summer dress with short sleeves')"
              value={prompt}
              onChange={handlePromptChange}
              variant="outlined"
              disabled={loading || activeStep > 2}
              sx={{ mb: 2 }}
            />
            {activeStep === 0 && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setActiveStep(1)}
                disabled={!prompt || loading}
                fullWidth
              >
                Next
              </Button>
            )}
          </Grid>

          {/* Steps 2-4: Visual Outputs */}
          <Grid item xs={12} md={6}>
            {activeStep >= 1 && (
              <>
                <Typography variant="h6" gutterBottom>
                  {activeStep === 1 ? 'Upload Your Model' : 'Your Model'}
                </Typography>
                <Box 
                  sx={{ 
                    border: '1px dashed rgba(0, 242, 255, 0.5)',
                    borderRadius: 2, 
                    p: 2, 
                    mb: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: modelImage ? 'auto' : 200,
                  }}
                >
                  {modelImage ? (
                    <Box sx={{ position: 'relative', width: '100%' }}>
                      <img 
                        src={modelImage} 
                        alt="Model" 
                        style={{ width: '100%', borderRadius: 8 }}
                      />
                      <IconButton 
                        onClick={() => fileInputRef.current.click()}
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8,
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.8)'
                          }
                        }}
                      >
                        <RefreshRounded fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <>
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUpload />}
                        disabled={loading}
                      >
                        Upload Model Image
                        <VisuallyHiddenInput 
                          type="file" 
                          accept="image/*" 
                          onChange={handleModelUpload}
                          ref={fileInputRef}
                        />
                      </Button>
                      <Typography variant="caption" sx={{ mt: 2, textAlign: 'center' }}>
                        Upload a full-body photo of yourself to try on the clothing
                      </Typography>
                    </>
                  )}
                </Box>
              </>
            )}

            {activeStep >= 2 && generatedClothingImage && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Generated Clothing</Typography>
                <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    image={generatedClothingImage}
                    alt="Generated Clothing"
                    sx={{ height: 240, objectFit: 'contain' }}
                  />
                </Card>
              </Box>
            )}

            {activeStep >= 3 && finalTryOnImage && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Final Result</Typography>
                <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    image={finalTryOnImage}
                    alt="Try-On Result"
                    sx={{ height: 350, objectFit: 'contain' }}
                  />
                </Card>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Chip 
                    icon={<CheckCircleOutline />} 
                    label="Try-On Complete" 
                    color="success" 
                    variant="outlined"
                  />
                </Box>
              </Box>
            )}
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={resetProcess}
                disabled={loading}
              >
                Start Over
              </Button>
              
              {activeStep === 1 && !modelImage && (
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUpload />}
                  disabled={loading}
                >
                  Upload Model
                  <VisuallyHiddenInput 
                    type="file" 
                    accept="image/*" 
                    onChange={handleModelUpload}
                    ref={fileInputRef}
                  />
                </Button>
              )}
              
              {activeStep === 2 && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={generateClothing}
                  disabled={loading || !prompt || !modelImage}
                >
                  {loading ? <CircularProgress size={24} /> : "Generate Clothing"}
                </Button>
              )}
              
              {activeStep === 3 && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={applyTryOn}
                  disabled={loading || !generatedClothingImage || !modelImage}
                >
                  {loading ? <CircularProgress size={24} /> : "Apply Try-On"}
                </Button>
              )}
              
              {activeStep === 4 && finalTryOnImage && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = finalTryOnImage;
                    link.download = 'tryon-result.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  Download Result
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default TextToClothingTryOn; 