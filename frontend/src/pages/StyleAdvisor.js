import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Card,
  CardMedia,
  CardContent,
  TextField,
  Chip,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  IconButton,
  Alert,
  Stack,
  Snackbar,
  Avatar
} from '@mui/material';
import {
  ArrowBack,
  Refresh,
  Save,
  Share,
  FilterList,
  AutoAwesome,
  Favorite,
  FavoriteBorder,
  Add
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Sample user wardrobe data
const SAMPLE_WARDROBE = [
  { id: 1, type: 'top', name: 'White T-Shirt', image: '/images/catalog/placeholder.png', color: 'white' },
  { id: 2, type: 'bottom', name: 'Black Jeans', image: '/images/catalog/placeholder.png', color: 'black' },
  { id: 3, type: 'shoes', name: 'Sneakers', image: '/images/catalog/placeholder.png', color: 'white' },
  { id: 4, type: 'jacket', name: 'Denim Jacket', image: '/images/catalog/placeholder.png', color: 'blue' },
  { id: 5, type: 'dress', name: 'Red Dress', image: '/images/catalog/placeholder.png', color: 'red' },
  { id: 6, type: 'accessory', name: 'Silver Necklace', image: '/images/catalog/placeholder.png', color: 'silver' },
];

// Sample outfit recommendations
const SAMPLE_RECOMMENDATIONS = [
  {
    id: 1, 
    title: 'Casual Day Out',
    description: 'Perfect for a casual day out with friends or shopping',
    occasion: 'casual',
    season: 'spring',
    items: [1, 2, 3, 6],
    image: '/images/catalog/placeholder.png'
  },
  {
    id: 2, 
    title: 'Evening Event',
    description: 'Elegant outfit for dinner or evening events',
    occasion: 'formal',
    season: 'all',
    items: [5, 3, 6],
    image: '/images/catalog/placeholder.png'
  },
  {
    id: 3, 
    title: 'Cool Weather Look',
    description: 'Stylish and practical for cooler days',
    occasion: 'casual',
    season: 'fall',
    items: [1, 2, 4],
    image: '/images/catalog/placeholder.png'
  }
];

const StyleAdvisor = () => {
  const [loading, setLoading] = useState(false);
  const [generatingOutfit, setGeneratingOutfit] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [recommendations, setRecommendations] = useState(SAMPLE_RECOMMENDATIONS);
  const [userWardrobe, setUserWardrobe] = useState(SAMPLE_WARDROBE);
  const [stylePreferences, setStylePreferences] = useState({
    occasion: 'casual',
    season: 'all',
    style: 'modern',
    colorScheme: 'balanced'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [stylePrompt, setStylePrompt] = useState('');

  // Handle broken images by replacing with a default placeholder
  const handleImageError = (e) => {
    e.target.src = '/images/catalog/placeholder.png';
  };

  const handleItemSelect = (item) => {
    if (selectedItems.find(i => i.id === item.id)) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handlePreferenceChange = (event) => {
    setStylePreferences({
      ...stylePreferences,
      [event.target.name]: event.target.value
    });
  };

  const handleGenerateOutfits = async () => {
    setGeneratingOutfit(true);
    setLoading(true);
    
    try {
      // Create a prompt for Stability AI based on selected items and preferences
      const selectedItemNames = selectedItems.map(item => item.name).join(', ');
      const prompt = `Create a complete outfit including ${selectedItemNames} for ${stylePreferences.occasion} occasion in ${stylePreferences.season} season with a ${stylePreferences.style} style and ${stylePreferences.colorScheme} color scheme.`;
      
      setStylePrompt(prompt);
      
      // Call the backend API to generate the outfit
      const response = await axios.post('/api/generate-outfit', {
        prompt,
        items: selectedItems.map(item => item.id),
        preferences: stylePreferences
      });
      
      if (response.data && response.data.imageUrl) {
        // Create a new recommendation with the generated image
        const newRecommendation = {
          id: recommendations.length + 1,
          title: `${stylePreferences.style.charAt(0).toUpperCase() + stylePreferences.style.slice(1)} ${stylePreferences.occasion} Outfit`,
          description: `AI-generated outfit for ${stylePreferences.occasion} in ${stylePreferences.season} season`,
          occasion: stylePreferences.occasion,
          season: stylePreferences.season,
          items: selectedItems.map(item => item.id),
          image: response.data.imageUrl
        };
        
        setRecommendations([newRecommendation, ...recommendations]);
        setSnackbar({
          open: true,
          message: 'New outfit generated successfully!',
          severity: 'success'
        });
      } else {
        throw new Error('Failed to generate outfit image');
      }
    } catch (error) {
      console.error('Error generating outfit:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to generate outfit. Please try again.',
        severity: 'error'
      });
    } finally {
      setGeneratingOutfit(false);
      setLoading(false);
    }
  };

  const handleSaveOutfit = (outfitId) => {
    setSnackbar({
      open: true,
      message: 'Outfit saved to your collection!',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const StyledCard = motion(Card);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          background: 'rgba(19, 19, 31, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 242, 255, 0.1)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
              AI Style Advisor
            </Typography>
          </Box>
          <Chip 
            icon={<AutoAwesome />} 
            label="Powered by Stability AI" 
            variant="outlined" 
            sx={{ 
              border: '1px solid rgba(0, 242, 255, 0.5)',
              color: 'primary.main'
            }}
          />
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 3, 
              background: 'rgba(25, 25, 40, 0.5)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              height: '100%'
            }}>
              <Typography variant="h5" gutterBottom>
                Your Wardrobe
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Select items from your wardrobe to get AI-powered outfit recommendations
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={1}>
                  {userWardrobe.map(item => (
                    <Grid item xs={6} key={item.id}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          border: selectedItems.find(i => i.id === item.id) 
                            ? '2px solid #00f2ff' 
                            : '2px solid transparent',
                          transition: 'all 0.3s ease',
                          transform: selectedItems.find(i => i.id === item.id)
                            ? 'scale(1.05)'
                            : 'scale(1)',
                          mb: 1
                        }}
                        onClick={() => handleItemSelect(item)}
                      >
                        <CardMedia
                          component="img"
                          height="120"
                          image={item.image}
                          alt={item.name}
                          onError={handleImageError}
                          sx={{ objectFit: 'cover' }}
                        />
                        <Box sx={{ 
                          p: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Typography variant="caption" noWrap>
                            {item.name}
                          </Typography>
                          <Chip 
                            label={item.type} 
                            size="small" 
                            sx={{ 
                              height: 20, 
                              fontSize: '0.6rem',
                              backgroundColor: 'rgba(0, 242, 255, 0.2)',
                            }} 
                          />
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
              
              <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
              
              <Typography variant="h6" gutterBottom>
                Style Preferences
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                  <InputLabel>Occasion</InputLabel>
                  <Select
                    name="occasion"
                    value={stylePreferences.occasion}
                    onChange={handlePreferenceChange}
                    label="Occasion"
                  >
                    <MenuItem value="casual">Casual</MenuItem>
                    <MenuItem value="formal">Formal</MenuItem>
                    <MenuItem value="office">Office</MenuItem>
                    <MenuItem value="party">Party</MenuItem>
                    <MenuItem value="date">Date Night</MenuItem>
                    <MenuItem value="outdoor">Outdoor</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                  <InputLabel>Season</InputLabel>
                  <Select
                    name="season"
                    value={stylePreferences.season}
                    onChange={handlePreferenceChange}
                    label="Season"
                  >
                    <MenuItem value="all">All Seasons</MenuItem>
                    <MenuItem value="spring">Spring</MenuItem>
                    <MenuItem value="summer">Summer</MenuItem>
                    <MenuItem value="fall">Fall</MenuItem>
                    <MenuItem value="winter">Winter</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                  <InputLabel>Style</InputLabel>
                  <Select
                    name="style"
                    value={stylePreferences.style}
                    onChange={handlePreferenceChange}
                    label="Style"
                  >
                    <MenuItem value="modern">Modern</MenuItem>
                    <MenuItem value="classic">Classic</MenuItem>
                    <MenuItem value="bohemian">Bohemian</MenuItem>
                    <MenuItem value="minimalist">Minimalist</MenuItem>
                    <MenuItem value="streetwear">Streetwear</MenuItem>
                    <MenuItem value="preppy">Preppy</MenuItem>
                    <MenuItem value="vintage">Vintage</MenuItem>
                    <MenuItem value="sporty">Sporty</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Color Scheme</InputLabel>
                  <Select
                    name="colorScheme"
                    value={stylePreferences.colorScheme}
                    onChange={handlePreferenceChange}
                    label="Color Scheme"
                  >
                    <MenuItem value="balanced">Balanced</MenuItem>
                    <MenuItem value="monochrome">Monochrome</MenuItem>
                    <MenuItem value="contrast">High Contrast</MenuItem>
                    <MenuItem value="vibrant">Vibrant</MenuItem>
                    <MenuItem value="pastel">Pastel</MenuItem>
                    <MenuItem value="neutral">Neutral</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleGenerateOutfits}
                disabled={generatingOutfit}
                startIcon={generatingOutfit ? <CircularProgress size={24} color="inherit" /> : <AutoAwesome />}
                sx={{ 
                  mt: 2,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #00f2ff 30%, #00dbff 90%)',
                  fontWeight: 'bold'
                }}
              >
                {generatingOutfit ? 'Generating...' : 'Generate Outfit Ideas'}
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                AI-Powered Recommendations
              </Typography>
              
              {stylePrompt && (
                <Alert 
                  severity="info" 
                  variant="outlined"
                  sx={{ 
                    mb: 3,
                    backgroundColor: 'rgba(76, 181, 255, 0.1)', 
                    border: '1px solid rgba(76, 181, 255, 0.3)' 
                  }}
                >
                  <Typography variant="body2">
                    <strong>AI Prompt:</strong> {stylePrompt}
                  </Typography>
                </Alert>
              )}
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="h6" color="primary">
                      AI is creating your perfect outfit...
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                      Our AI is analyzing your style preferences, selected items, and fashion trends to craft personalized outfit recommendations.
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {recommendations.map((outfit, index) => (
                    <Grid item xs={12} sm={6} key={outfit.id}>
                      <StyledCard 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                        }}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            height="240"
                            image={outfit.image}
                            alt={outfit.title}
                            onError={handleImageError}
                          />
                          <Box sx={{ 
                            position: 'absolute', 
                            top: 12, 
                            right: 12,
                            display: 'flex',
                            gap: 1
                          }}>
                            <IconButton 
                              size="small" 
                              sx={{ 
                                bgcolor: 'rgba(0, 0, 0, 0.5)', 
                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
                              }}
                              onClick={() => handleSaveOutfit(outfit.id)}
                            >
                              <FavoriteBorder sx={{ color: 'white' }} />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              sx={{ 
                                bgcolor: 'rgba(0, 0, 0, 0.5)', 
                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' }
                              }}
                            >
                              <Share sx={{ color: 'white' }} />
                            </IconButton>
                          </Box>
                        </Box>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ mb: 1, display: 'flex', gap: 0.5 }}>
                            <Chip 
                              label={outfit.occasion} 
                              size="small" 
                              sx={{ 
                                backgroundColor: 'rgba(252, 15, 192, 0.2)',
                                color: 'secondary.main',
                                fontWeight: 'bold'
                              }} 
                            />
                            <Chip 
                              label={outfit.season} 
                              size="small" 
                              sx={{ 
                                backgroundColor: 'rgba(0, 242, 255, 0.2)',
                                color: 'primary.main',
                                fontWeight: 'bold'
                              }} 
                            />
                          </Box>
                          
                          <Typography variant="h6" gutterBottom>
                            {outfit.title}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {outfit.description}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                            {outfit.items.map(itemId => {
                              const item = userWardrobe.find(i => i.id === itemId);
                              return item ? (
                                <Chip
                                  key={item.id}
                                  size="small"
                                  avatar={<Avatar 
                                    src={item.image} 
                                    onError={handleImageError}
                                  />}
                                  label={item.name}
                                  sx={{ mb: 1 }}
                                />
                              ) : null;
                            })}
                          </Box>
                        </CardContent>
                      </StyledCard>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StyleAdvisor; 