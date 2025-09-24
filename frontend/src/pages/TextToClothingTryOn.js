import React, { useState, useRef, useEffect } from 'react';
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
  Chip,
  Alert,
  Tooltip,
  Fade,
  Snackbar,
  Slider,
  FormControl,
  InputLabel, 
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  RefreshRounded, 
  CloudUpload, 
  CheckCircleOutline, 
  ErrorOutline, 
  Autorenew, 
  Info,
  ArrowBack,
  ContentCopy,
  LibraryBooks,
  CollectionsBookmarkOutlined,
  AutoAwesome
} from '@mui/icons-material';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

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

// Example prompts to help users
const examplePrompts = [
  "A red floral summer dress with short sleeves",
  "A black leather jacket with silver zippers",
  "A blue striped button-up shirt with long sleeves",
  "A pair of dark blue slim fit jeans",
  "A yellow graphic t-shirt with a sunset design",
  "A green hoodie with a small logo on the chest"
];

// Add pre-generated clothing catalog
const preGeneratedClothing = [
  { 
    id: 1, 
    title: "Red Summer Dress", 
    description: "Vibrant red summer dress with floral pattern",
    imageUrl: "/images/catalog/red-dress.jpg" 
  },
  { 
    id: 2, 
    title: "Blue Denim Jacket", 
    description: "Classic blue denim jacket with metal buttons",
    imageUrl: "/images/catalog/denim-jacket.jpg" 
  },
  { 
    id: 3, 
    title: "Black Leather Jacket", 
    description: "Stylish black leather jacket with zipper details",
    imageUrl: "/images/catalog/leather-jacket.jpg" 
  },
  { 
    id: 4, 
    title: "White Cotton Shirt", 
    description: "Crisp white cotton button-up shirt",
    imageUrl: "/images/catalog/white-shirt.jpg" 
  },
  { 
    id: 5, 
    title: "Green Hoodie", 
    description: "Comfortable green hoodie with front pocket",
    imageUrl: "/images/catalog/green-hoodie.jpg" 
  },
  { 
    id: 6, 
    title: "Blue Jeans", 
    description: "Classic blue jeans with straight cut",
    imageUrl: "/images/catalog/blue-jeans.jpg" 
  }
];

// Clothing styles for suggestion
const clothingStyles = [
  "Casual", "Formal", "Sportswear", "Vintage", "Bohemian", 
  "Minimalist", "Streetwear", "Business", "Party", "Beachwear"
];

// Color options for suggestion
const colorOptions = [
  "Red", "Blue", "Green", "Yellow", "Purple", "Pink", 
  "Orange", "Black", "White", "Gray", "Brown"
];

// Season options
const seasonOptions = [
  "Spring", "Summer", "Fall", "Winter", "All Season"
];

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
  backgroundColor: 'rgba(25, 25, 40, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
  }
}));

const GlowingSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  backgroundColor: 'rgba(25, 25, 40, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(0, 242, 255, 0.1)',
  boxShadow: '0 0 15px rgba(0, 242, 255, 0.15)',
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0 0 20px rgba(0, 242, 255, 0.25)',
  }
}));

const TextToClothingTryOn = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modelImage, setModelImage] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const [generatedClothingImage, setGeneratedClothingImage] = useState(null);
  const [finalTryOnImage, setFinalTryOnImage] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("Casual");
  const [selectedColor, setSelectedColor] = useState("Blue");
  const [selectedSeason, setSelectedSeason] = useState("All Season");
  const [formalityLevel, setFormalityLevel] = useState(5);
  const [preferredFeatures, setPreferredFeatures] = useState({
    patterns: false,
    buttons: false,
    zippers: false,
    pockets: false,
    hood: false,
    stripes: false
  });
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

  const useExamplePrompt = (examplePrompt) => {
    setPrompt(examplePrompt);
    setSnackbarMessage('Example prompt added! Click "Next" to continue.');
    setSnackbarOpen(true);
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
    setAttemptCount(prev => prev + 1);
    
    // Show a notification that generation has started
    setSnackbarMessage('Generating clothing... This may take up to 30 seconds.');
    setSnackbarOpen(true);
    
    try {
      // Step 1 & 2: Send text prompt to generate clothing image
      const response = await axios.post('/api/generate-clothing', { prompt }, {
        // Set longer timeout for API call
        timeout: 60000
      });
      
      setGeneratedClothingImage(response.data.imageUrl);
      setActiveStep(3);
      
      // Show success message
      setSnackbarMessage('Clothing generated successfully! Now you can try it on.');
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Generation error:", err);
      
      // Check if we got an error response with an image
      if (err.response?.data?.imageUrl) {
        setGeneratedClothingImage(err.response.data.imageUrl);
        
        if (err.response.data.message && err.response.data.message.includes("fallback")) {
          // Show more helpful error for fallback case
          setError(
            `Stability AI service returned an error and a fallback image was created instead. The image quality will be limited. ` +
            `This may happen due to service limits or connectivity issues. You can still proceed with this image or try again with a different description.`
          );
        } else {
          setError(`Failed to generate clothing: ${err.response.data.message || 'API error'}. Using fallback image.`);
        }
      } else {
        // Handle network or unexpected errors
        const errorMessage = err.response?.data?.detail || err.message || 'Unknown error';
        setError(
          `Failed to generate clothing image: ${errorMessage}. ` +
          `This might be due to connectivity issues or API limits. Try again with a simpler description or different wording.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const applyTryOn = async () => {
    if (!modelFile || !generatedClothingImage) {
      setError('Model image and clothing image are required to continue');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Show processing notification
    setSnackbarMessage('Processing virtual try-on... This may take up to 30 seconds.');
    setSnackbarOpen(true);
    
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
          },
          // Set longer timeout
          timeout: 60000
        }
      );
      
      setFinalTryOnImage(response.data.resultUrl);
      setActiveStep(4);
      
      // Show success message
      setSnackbarMessage('Try-on completed successfully!');
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Try-on error:", err);
      
      // Provide more helpful error messages based on common issues
      if (err.code === 'ECONNABORTED') {
        setError('The request timed out. The server might be busy or the image processing is taking longer than expected. Please try again.');
      } else if (err.response?.status === 413) {
        setError('The uploaded image is too large. Please use a smaller image (less than 5MB).');
      } else if (err.response?.status === 415) {
        setError('The image format is not supported. Please use JPG or PNG images.');
      } else {
        setError('Failed to process try-on: ' + (err.response?.data?.detail || err.message) + 
                '. Try using a different model image or clothing description.');
      }
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
  
  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setSnackbarMessage('Prompt copied to clipboard!');
    setSnackbarOpen(true);
  };

  // Function to select pre-generated clothing
  const selectCatalogItem = (item) => {
    setPrompt(item.description);
    setSnackbarMessage(`Selected "${item.title}" - now click "Next" to continue`);
    setSnackbarOpen(true);
    setShowCatalog(false);
  };

  // Function to handle change in preferred features
  const handleFeatureChange = (event) => {
    setPreferredFeatures({
      ...preferredFeatures,
      [event.target.name]: event.target.checked
    });
  };
  
  // Function to generate clothing suggestion
  const generateSuggestion = () => {
    // Build a clothing description based on user preferences
    let suggestion = `A ${selectedColor.toLowerCase()} ${selectedStyle.toLowerCase()} `;
    
    // Add clothing type based on style
    if (selectedStyle === "Casual") {
      suggestion += formalityLevel < 5 ? "t-shirt" : "button-up shirt";
    } else if (selectedStyle === "Formal") {
      suggestion += formalityLevel > 7 ? "suit jacket" : "dress shirt";
    } else if (selectedStyle === "Sportswear") {
      suggestion += "athletic shirt";
    } else if (selectedStyle === "Vintage") {
      suggestion += formalityLevel > 5 ? "retro jacket" : "vintage shirt";
    } else if (selectedStyle === "Streetwear") {
      suggestion += formalityLevel < 5 ? "graphic tee" : "urban jacket";
    } else {
      suggestion += "shirt";
    }
    
    // Add features
    const features = [];
    if (preferredFeatures.patterns) features.push("with patterns");
    if (preferredFeatures.buttons) features.push("with buttons");
    if (preferredFeatures.zippers) features.push("with zipper details");
    if (preferredFeatures.pockets) features.push("with pockets");
    if (preferredFeatures.hood) features.push("with a hood");
    if (preferredFeatures.stripes) features.push("with stripes");
    
    if (features.length > 0) {
      suggestion += " " + features.join(" ");
    }
    
    // Add season
    if (selectedSeason !== "All Season") {
      suggestion += ` perfect for ${selectedSeason.toLowerCase()}`;
    }
    
    // Set the suggestion as prompt
    setPrompt(suggestion);
    setSnackbarMessage("Clothing suggestion generated!");
    setSnackbarOpen(true);
    setShowSuggestionDialog(false);
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            component={RouterLink}
            to="/"
            startIcon={<ArrowBack />}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h3" sx={{ 
            background: 'linear-gradient(90deg, #00f2ff, #fc0fc0)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            Text to Clothing Virtual Try-On
          </Typography>
        </Box>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => setError('')}
              >
                DISMISS
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        
        <Grid container spacing={4}>
          {/* Step 1: Text Input */}
          {activeStep === 0 && (
            <Grid item xs={12}>
              <GlowingSection>
                <Typography variant="h5" gutterBottom color="primary">
                  Describe the Clothing
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Be as detailed as possible about color, pattern, style, and material for best results.
                </Typography>
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Describe the clothing you want to try on (e.g., 'A red floral summer dress with short sleeves')"
                  value={prompt}
                  onChange={handlePromptChange}
                  variant="outlined"
                  disabled={loading}
                  sx={{ mb: 3 }}
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Tooltip title="Copy your prompt">
                    <IconButton onClick={copyPrompt} disabled={!prompt} size="small" sx={{ mr: 1 }}>
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                    Example prompts:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {examplePrompts.map((examplePrompt, index) => (
                      <Chip 
                        key={index} 
                        label={examplePrompt.slice(0, 20) + (examplePrompt.length > 20 ? '...' : '')} 
                        onClick={() => {
                          setPrompt(examplePrompt);
                          setSnackbarMessage('Example prompt added! Click "Next" to continue.');
                          setSnackbarOpen(true);
                        }}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
                
                {/* Add catalog toggle button after the examples */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={showCatalog ? <ArrowBack /> : <CollectionsBookmarkOutlined />}
                    onClick={() => setShowCatalog(!showCatalog)}
                  >
                    {showCatalog ? "Hide Catalog" : "Browse Clothing Catalog"}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<AutoAwesome />}
                    onClick={() => setShowSuggestionDialog(true)}
                  >
                    Suggest Clothing
                  </Button>
                </Box>
                
                {/* Catalog Section */}
                {showCatalog && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Clothing Catalog
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Select from our pre-designed clothing items or use them as inspiration for your text prompts.
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {preGeneratedClothing.map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                          <Card 
                            sx={{ 
                              cursor: 'pointer',
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                              }
                            }}
                            onClick={() => selectCatalogItem(item)}
                          >
                            <CardMedia
                              component="img"
                              height="140"
                              image={item.imageUrl}
                              alt={item.title}
                              sx={{ objectFit: 'cover' }}
                            />
                            <Box sx={{ p: 2 }}>
                              <Typography variant="subtitle1" component="div" gutterBottom>
                                {item.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {item.description}
                              </Typography>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
                
                {/* Suggestion Dialog */}
                <Dialog 
                  open={showSuggestionDialog} 
                  onClose={() => setShowSuggestionDialog(false)}
                  maxWidth="md"
                  fullWidth
                >
                  <DialogTitle>Get Clothing Suggestions</DialogTitle>
                  <DialogContent dividers>
                    <Typography variant="body2" gutterBottom>
                      Tell us your preferences and we'll generate a clothing description for you!
                    </Typography>
                    
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                          <InputLabel>Style</InputLabel>
                          <Select
                            value={selectedStyle}
                            label="Style"
                            onChange={(e) => setSelectedStyle(e.target.value)}
                          >
                            {clothingStyles.map((style) => (
                              <MenuItem key={style} value={style}>{style}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        
                        <FormControl fullWidth sx={{ mb: 3 }}>
                          <InputLabel>Color</InputLabel>
                          <Select
                            value={selectedColor}
                            label="Color"
                            onChange={(e) => setSelectedColor(e.target.value)}
                          >
                            {colorOptions.map((color) => (
                              <MenuItem key={color} value={color}>{color}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        
                        <FormControl fullWidth>
                          <InputLabel>Season</InputLabel>
                          <Select
                            value={selectedSeason}
                            label="Season"
                            onChange={(e) => setSelectedSeason(e.target.value)}
                          >
                            {seasonOptions.map((season) => (
                              <MenuItem key={season} value={season}>{season}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography gutterBottom>Formality Level</Typography>
                        <Box sx={{ px: 2 }}>
                          <Slider
                            value={formalityLevel}
                            onChange={(e, newValue) => setFormalityLevel(newValue)}
                            valueLabelDisplay="auto"
                            step={1}
                            marks
                            min={1}
                            max={10}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: -1 }}>
                            <Typography variant="caption">Casual</Typography>
                            <Typography variant="caption">Formal</Typography>
                          </Box>
                        </Box>
                        
                        <Typography gutterBottom sx={{ mt: 3 }}>Features</Typography>
                        <FormGroup>
                          <Grid container>
                            <Grid item xs={6}>
                              <FormControlLabel
                                control={
                                  <Checkbox 
                                    checked={preferredFeatures.patterns} 
                                    onChange={handleFeatureChange}
                                    name="patterns"
                                  />
                                }
                                label="Patterns"
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <FormControlLabel
                                control={
                                  <Checkbox 
                                    checked={preferredFeatures.buttons} 
                                    onChange={handleFeatureChange}
                                    name="buttons"
                                  />
                                }
                                label="Buttons"
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <FormControlLabel
                                control={
                                  <Checkbox 
                                    checked={preferredFeatures.zippers} 
                                    onChange={handleFeatureChange}
                                    name="zippers"
                                  />
                                }
                                label="Zippers"
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <FormControlLabel
                                control={
                                  <Checkbox 
                                    checked={preferredFeatures.pockets} 
                                    onChange={handleFeatureChange}
                                    name="pockets"
                                  />
                                }
                                label="Pockets"
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <FormControlLabel
                                control={
                                  <Checkbox 
                                    checked={preferredFeatures.hood} 
                                    onChange={handleFeatureChange}
                                    name="hood"
                                  />
                                }
                                label="Hood"
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <FormControlLabel
                                control={
                                  <Checkbox 
                                    checked={preferredFeatures.stripes} 
                                    onChange={handleFeatureChange}
                                    name="stripes"
                                  />
                                }
                                label="Stripes"
                              />
                            </Grid>
                          </Grid>
                        </FormGroup>
                      </Grid>
                    </Grid>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setShowSuggestionDialog(false)}>Cancel</Button>
                    <Button 
                      variant="contained" 
                      onClick={generateSuggestion}
                      color="primary"
                    >
                      Generate Suggestion
                    </Button>
                  </DialogActions>
                </Dialog>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setActiveStep(1)}
                  disabled={!prompt || loading}
                  fullWidth
                  sx={{ 
                    mt: 2,
                    background: 'linear-gradient(45deg, #00f2ff 0%, #fc0fc0 100%)',
                    py: 1.5
                  }}
                >
                  Next: Upload Model
                </Button>
              </GlowingSection>
            </Grid>
          )}
          
          {/* Step 2: Model Upload */}
          {activeStep === 1 && (
            <Grid item xs={12}>
              <GlowingSection>
                <Typography variant="h5" gutterBottom color="primary">
                  Upload Your Model Photo
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Please upload a well-lit photo of yourself (or the model) in a neutral pose against a clean background.
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  p: 4,
                  border: '2px dashed rgba(0, 242, 255, 0.3)',
                  borderRadius: 2,
                  mb: 3
                }}>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUpload />}
                    sx={{ mb: 2 }}
                  >
                    Upload Photo
                    <VisuallyHiddenInput 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef}
                      onChange={handleModelUpload}
                    />
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Supported formats: JPG, PNG, WEBP (Max 10MB)
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setActiveStep(0)}
                    disabled={loading}
                  >
                    Back
                  </Button>
                </Box>
              </GlowingSection>
            </Grid>
          )}

          {/* Step 3: Generate Clothing */}
          {activeStep === 2 && (
            <Grid item xs={12} md={6}>
              <GlowingSection sx={{ height: '100%' }}>
                <Typography variant="h5" gutterBottom color="primary">
                  Ready to Generate Clothing
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Your Description:</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.2)', borderRadius: 1 }}>
                    <Typography>{prompt}</Typography>
                  </Paper>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Your Model:</Typography>
                  {modelImage && (
                    <Box sx={{ 
                      width: '100%',
                      height: 300,
                      backgroundImage: `url(${modelImage})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      borderRadius: 1,
                      mb: 2
                    }} />
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setActiveStep(1)}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={generateClothing}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <Autorenew />}
                  >
                    {loading ? 'Generating...' : 'Generate Clothing'}
                  </Button>
                </Box>
              </GlowingSection>
            </Grid>
          )}
          
          {/* Step 3: Generated Clothing Display */}
          {activeStep === 2 && generatedClothingImage && (
            <Grid item xs={12} md={6}>
              <StyledCard>
                <CardMedia
                  component="img"
                  image={generatedClothingImage}
                  alt="Generated Clothing"
                  sx={{ 
                    height: 400,
                    objectFit: 'contain',
                    bgcolor: 'rgba(255, 255, 255, 0.05)'
                  }}
                />
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Generated Clothing
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={generateClothing}
                      startIcon={<RefreshRounded />}
                      disabled={loading}
                    >
                      Regenerate
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={applyTryOn}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={24} color="inherit" /> : null}
                    >
                      {loading ? 'Processing...' : 'Try It On'}
                    </Button>
                  </Box>
                </Box>
              </StyledCard>
            </Grid>
          )}
          
          {/* Step 4: Final Result */}
          {activeStep === 3 && finalTryOnImage && (
            <Grid item xs={12}>
              <GlowingSection>
                <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
                  Your Virtual Try-On Result
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" gutterBottom>Original Model</Typography>
                    <Box sx={{ 
                      width: '100%',
                      height: 400,
                      backgroundImage: `url(${modelImage})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      borderRadius: 1,
                      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }} />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" gutterBottom>Generated Clothing</Typography>
                    <Box sx={{ 
                      width: '100%',
                      height: 400,
                      backgroundImage: `url(${generatedClothingImage})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      borderRadius: 1,
                      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }} />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" gutterBottom>
                      Final Result
                      <Tooltip title="What you see is the AI's best attempt to visualize the clothing on your model. Results may vary based on image quality.">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <Info fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Typography>
                    <Box sx={{ 
                      width: '100%',
                      height: 400,
                      backgroundImage: `url(${finalTryOnImage})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      borderRadius: 1,
                      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }} />
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={resetProcess}
                    startIcon={<RefreshRounded />}
                  >
                    Start Over
                  </Button>
                  <Button
                    variant="contained"
                    component="a"
                    href={finalTryOnImage}
                    download="virtual-tryon-result.png"
                    color="primary"
                  >
                    Download Result
                  </Button>
                </Box>
              </GlowingSection>
            </Grid>
          )}
        </Grid>
      </Paper>
      
      {/* Tips and Information Section */}
      <GlowingSection sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom color="primary">
          Tips for Best Results
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Detailed Descriptions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Be specific about colors, patterns, materials, and style. The more details you provide, the better the generation.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Model Photos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use photos with good lighting, clean backgrounds, and a neutral pose facing the camera for best try-on results.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Experiment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try different descriptions and regenerate items if needed. AI generation can vary, so experiment to get the perfect result.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </GlowingSection>
      
      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TextToClothingTryOn; 