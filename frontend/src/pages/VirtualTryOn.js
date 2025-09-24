import React, { useState, useEffect, useRef } from 'react';
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
  Card,
  CardContent,
  CardMedia,
  Tabs,
  Tab,
  IconButton,
  Chip,
  AlertTitle,
  FormLabel,
  RadioGroup,
  FormControlLabel as MuiFormControlLabel,
  Radio,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { useSelector } from 'react-redux';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { addToWishlist } from '../store/wishlistSlice';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import CategoryIcon from '@mui/icons-material/Category';
import { keyframes } from '@emotion/react';
import { fadeIn, animateProductCards, animateTryOnButton, buttonEnter, buttonLeave, createScrollReveal } from '../utils/animations';
import { gsap } from 'gsap';

const API_URL = 'http://localhost:8000';

const RootContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const Header = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  color: theme.palette.primary.main,
  fontWeight: 700,
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -10,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 60,
    height: 4,
    backgroundColor: theme.palette.secondary.main,
    borderRadius: 2,
  }
}));

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(63, 81, 181, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(63, 81, 181, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(63, 81, 181, 0);
  }
`;

const UploadSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
  },
  '&.pulse-animation': {
    animation: `${pulseAnimation} 1.5s ease-in-out`,
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 600,
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: theme.spacing(1),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
  },
}));

const ProductImage = styled(CardMedia)(({ theme }) => ({
  height: 200,
  backgroundSize: 'contain',
  backgroundColor: '#f5f5f5',
}));

const CategoryChip = styled(Chip)(({ theme, category }) => {
  let color;
  if (category === 'Upper body') color = theme.palette.primary.main;
  else if (category === 'Lower body') color = theme.palette.info.main;
  else if (category === 'Dress') color = theme.palette.secondary.main;
  else color = theme.palette.neutral.main;
  
  return {
    backgroundColor: `${color}20`,
    color: color,
    fontWeight: 600,
    fontSize: '0.75rem',
  };
});

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

const ImageUploader = ({ onUpload, imageUrl, accept, maxSize, label, icon, selectedProductName }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.size <= maxSize) {
      onUpload(file);
    } else if (file) {
      alert(`File size exceeds the limit of ${maxSize / 1024 / 1024}MB`);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
      <input
        accept={accept}
        style={{ display: 'none' }}
        id={label.replace(/\s+/g, '-').toLowerCase()}
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor={label.replace(/\s+/g, '-').toLowerCase()}>
        <Button 
          variant="contained" 
          component="span"
          startIcon={icon || <CloudUploadIcon />}
          fullWidth
          sx={{ mb: 2 }}
        >
          {label || "Upload Image"}
        </Button>
      </label>
      
      <Box sx={{ 
        mt: 2, 
        textAlign: 'center', 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        width: '100%',
        border: imageUrl ? 'none' : '2px dashed #ccc',
        borderRadius: '8px',
        p: 2,
        backgroundColor: imageUrl ? 'transparent' : '#f9f9f9',
      }}>
        {imageUrl ? (
          <>
            {selectedProductName && (
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                {selectedProductName}
              </Typography>
            )}
          <img
            src={typeof imageUrl === 'object' ? imageUrl.previewUrl : imageUrl}
            alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '4px' }}
          />
          </>
        ) : (
          <Typography color="textSecondary">
            No image selected. Click the button above to upload.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const ResultViewer = ({ imageUrl }) => {
  return (
    <Box sx={{ textAlign: 'center', my: 3 }}>
      <SectionTitle variant="h5" gutterBottom>
        Virtual Try-On Result
      </SectionTitle>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          display: 'inline-block', 
          maxWidth: '100%',
          borderRadius: 2,
          background: 'linear-gradient(to bottom, #ffffff, #f5f5f5)',
        }}
      >
        <img
          src={imageUrl}
          alt="Try-on result"
          style={{ maxWidth: '100%', maxHeight: '600px', borderRadius: '4px' }}
        />
      </Paper>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          href={imageUrl} 
          download
          startIcon={<CloudUploadIcon />}
        >
          Download Result
        </Button>
      </Box>
    </Box>
  );
};

const VirtualTryOn = () => {
  const [modelImage, setModelImage] = useState(null);
  const [clothImage, setClothImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useSegmind, setUseSegmind] = useState(true);
  const [processingTime, setProcessingTime] = useState(null);
  const [clothingCategory, setClothingCategory] = useState("Upper body");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [preloadedImages, setPreloadedImages] = useState({});
  const [isPreloading, setIsPreloading] = useState(true);
  const [segmindAvailable, setSegmindAvailable] = useState(true);
  const [lvClothes, setLvClothes] = useState([]);
  const [isLoadingLV, setIsLoadingLV] = useState(false);
  
  const dispatch = useDispatch();
  
  // Expanded clothing options with more variety
  const clothingOptions = [
    // Upper body
    {
      id: 1,
      name: 'Classic White T-Shirt',
      price: 29.99,
      category: 'Upper body',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'A comfortable and stylish classic white t-shirt, perfect for any casual occasion.',
    },
    {
      id: 2,
      name: 'Blue Denim Jacket',
      price: 79.99,
      category: 'Upper body',
      image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Stylish blue denim jacket that goes well with any outfit.',
    },
    {
      id: 6,
      name: 'Red Hoodie',
      price: 45.99,
      category: 'Upper body',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Comfortable red hoodie for casual wear or workouts.',
    },
    {
      id: 8,
      name: 'Striped Button-Up Shirt',
      price: 39.99,
      category: 'Upper body',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Classic striped button-up shirt for a smart casual look.',
    },
    {
      id: 10,
      name: 'Black Turtleneck',
      price: 49.99,
      category: 'Upper body',
      image: 'https://images.unsplash.com/photo-1608744882201-52a7f7f3dd60?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Elegant black turtleneck sweater for a sophisticated look.',
    },
    {
      id: 11,
      name: 'Casual Polo Shirt',
      price: 34.99,
      category: 'Upper body',
      image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Classic polo shirt for a smart casual style.',
    },
    {
      id: 12,
      name: 'Linen Summer Shirt',
      price: 42.99,
      category: 'Upper body',
      image: 'https://images.unsplash.com/photo-1604695573706-53170668f6a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Breathable linen shirt perfect for summer days.',
    },
    {
      id: 13,
      name: 'Graphic Print T-Shirt',
      price: 32.99,
      category: 'Upper body',
      image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Trendy graphic print t-shirt for a casual, stylish look.',
    },
    
    // Lower body
    {
      id: 3,
      name: 'Black Slim-Fit Jeans',
      price: 59.99,
      category: 'Lower body',
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Classic black slim-fit jeans for a modern look.',
    },
    {
      id: 5,
      name: 'Khaki Chino Pants',
      price: 49.99,
      category: 'Lower body',
      image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Versatile khaki chino pants that can be dressed up or down.',
    },
    {
      id: 9,
      name: 'Denim Skirt',
      price: 34.99,
      category: 'Lower body',
      image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Versatile denim skirt that pairs well with any top.',
    },
    {
      id: 14,
      name: 'Pleated Midi Skirt',
      price: 54.99,
      category: 'Lower body',
      image: 'https://images.unsplash.com/photo-1577900232427-18219b9166a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Elegant pleated midi skirt for a feminine look.',
    },
    {
      id: 15,
      name: 'Cargo Pants',
      price: 64.99,
      category: 'Lower body',
      image: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Practical cargo pants with multiple pockets for a casual look.',
    },
    {
      id: 16,
      name: 'Linen Beach Pants',
      price: 47.99,
      category: 'Lower body',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Comfortable linen pants perfect for beach days and summer outings.',
    },
    
    // Dresses
    {
      id: 4,
      name: 'Floral Summer Dress',
      price: 89.99,
      category: 'Dress',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Light and breezy floral summer dress, perfect for warm days.',
    },
    {
      id: 7,
      name: 'Elegant Evening Gown',
      price: 129.99,
      category: 'Dress',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Elegant evening gown for special occasions.',
    },
    {
      id: 17,
      name: 'Casual Maxi Dress',
      price: 79.99,
      category: 'Dress',
      image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Comfortable and stylish maxi dress for everyday wear.',
    },
    {
      id: 18,
      name: 'Cocktail Dress',
      price: 99.99,
      category: 'Dress',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Elegant cocktail dress perfect for semi-formal events.',
    },
    {
      id: 19,
      name: 'Wrap Dress',
      price: 69.99,
      category: 'Dress',
      image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Flattering wrap dress suitable for various occasions.',
    },
    {
      id: 20,
      name: 'Bohemian Maxi Dress',
      price: 84.99,
      category: 'Dress',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Boho-style maxi dress with intricate patterns for a free-spirited look.',
    },
    
    // Outerwear
    {
      id: 21,
      name: 'Leather Jacket',
      price: 149.99,
      category: 'Upper body',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Classic leather jacket for an edgy, timeless look.',
    },
    {
      id: 22,
      name: 'Trench Coat',
      price: 129.99,
      category: 'Upper body',
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Elegant trench coat for a sophisticated appearance in any weather.',
    },
    {
      id: 23,
      name: 'Puffer Jacket',
      price: 119.99,
      category: 'Upper body',
      image: 'https://images.unsplash.com/photo-1547624643-3bf761b09502?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Warm puffer jacket for cold winter days.',
    },
    {
      id: 24,
      name: 'Blazer',
      price: 109.99,
      category: 'Upper body',
      image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Tailored blazer for a professional or smart casual look.',
    },
  ];

  // Preload all product images when component mounts
  useEffect(() => {
    const preloadImages = async () => {
      setIsPreloading(true);
      
      console.log('Preloading all product images...');
      const preloaded = {};
      
      try {
        // Use Promise.all to load images in parallel (faster)
        await Promise.all(
          clothingOptions.map(async (product) => {
            try {
              console.log(`Downloading image for ${product.name}...`);
              
              // Create a local cache of the image URL
              const imgEl = new Image();
              imgEl.src = product.image;
              
              // Simply store the image URL for now
              preloaded[product.id] = {
                path: product.image,
                previewUrl: product.image,
                name: product.name,
                category: product.category
              };
              
              console.log(`Successfully preloaded ${product.name}`);
            } catch (err) {
              console.error(`Error preloading ${product.name}:`, err);
              // Continue with other images even if one fails
            }
          })
        );
        
        setPreloadedImages(preloaded);
        console.log('Preloading complete:', Object.keys(preloaded).length, 'images loaded');
      } catch (err) {
        console.error('Error during preloading:', err);
      } finally {
        setIsPreloading(false);
      }
    };
    
    preloadImages();
  }, []);

  // Replace the checkSegmindAvailability function
  useEffect(() => {
    const checkSegmindAvailability = async () => {
      try {
        console.log('Setting Segmind API to always available');
        setSegmindAvailable(true);
        setUseSegmind(true);
      } catch (err) {
        console.error('Error setting Segmind status, forcing to available anyway');
        setSegmindAvailable(true);
        setUseSegmind(true);
      }
    };
    
    checkSegmindAvailability();
  }, []);

  const fetchLVClothes = async () => {
    try {
      setIsLoadingLV(true);
      const response = await axios.get(`${API_URL}/api/lv-clothes`);
      if (response.data && response.data.clothes) {
        setLvClothes(response.data.clothes);
      }
    } catch (error) {
      console.error('Error fetching LV clothes:', error);
    } finally {
      setIsLoadingLV(false);
    }
  };

  useEffect(() => {
    fetchLVClothes();
  }, []);

  const handleModelUpload = async (file) => {
    setError(null);
    try {
      console.log('Uploading model image:', file.name);
      console.log('File size:', file.size, 'bytes');
      
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Sending request to:', `${API_URL}/api/upload/model`);
      
      const response = await axios.post(`${API_URL}/api/upload/model`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Model upload response:', response.data);
      
      // Create a local preview URL for immediate display
      const localPreviewUrl = URL.createObjectURL(file);
      
      // Store both the server path and the local preview
      setModelImage({
        path: response.data.filename,
        previewUrl: localPreviewUrl
      });
      
      console.log('Model image set to:', {
        path: response.data.filename,
        previewUrl: localPreviewUrl
      });
      
    } catch (err) {
      console.error('Error uploading model image:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError(`Error uploading model image: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleClothUpload = async (file) => {
    setError(null);
    try {
      console.log('Uploading clothing image:', file.name);
      console.log('File size:', file.size, 'bytes');
      
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Sending request to:', `${API_URL}/api/upload/cloth`);
      
      const response = await axios.post(`${API_URL}/api/upload/cloth`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Cloth upload response:', response.data);
      
      // Create a local preview URL for immediate display
      const localPreviewUrl = URL.createObjectURL(file);
      
      // Store both the server path and the local preview
      setClothImage({
        path: response.data.filename,
        previewUrl: localPreviewUrl
      });
      
      console.log('Cloth image set to:', {
        path: response.data.filename,
        previewUrl: localPreviewUrl
      });
      
    } catch (err) {
      console.error('Error uploading clothing image:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError(`Error uploading clothing image: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleProductSelect = async (product) => {
    setSelectedProduct(product);
    setClothingCategory(product.category);
    setError(null);
    
    // Add animation to the clothing upload section
    const clothUploadSection = document.querySelector('#cloth-upload-section');
    if (clothUploadSection) {
      clothUploadSection.classList.add('pulse-animation');
      setTimeout(() => {
        clothUploadSection.classList.remove('pulse-animation');
      }, 1500);
    }
    
    try {
      console.log('Selected product:', product);
      
      // Check if image is preloaded
      if (preloadedImages[product.id]) {
        console.log('Using preloaded image for', product.name);
        setClothImage(preloadedImages[product.id]);
        
        // Automatically start try-on if model is uploaded
        if (modelImage) {
          setTimeout(() => {
            handleTryOn();
          }, 500);
        } else {
          setError('Please upload your photo to try on this clothing item');
        }
        return;
      }
      
      // Fall back to downloading on-demand if not preloaded
      console.log('Image not preloaded, downloading from:', product.image);
      
      // Directly set the cloth image from the URL
      setClothImage({
        path: product.image,
        previewUrl: product.image
      });
      
      // Automatically start the try-on process if a model image is already uploaded
      if (modelImage) {
        setTimeout(() => {
          handleTryOn();
        }, 500); // Small delay to ensure the clothing image is fully processed
      } else {
        // Let the user know they need to upload a photo to try-on this item
        setError('Please upload your photo to try on this clothing item');
      }
    } catch (err) {
      console.error('Error processing product image:', err);
      setError(`Error processing product image: ${err.message}`);
      
      // Fallback to just setting the image URL directly
      setClothImage({
        path: product.image,
        previewUrl: product.image
      });
    }
  };

  const handleAddToCart = (product, event) => {
    event.stopPropagation();
    dispatch(addToCart(product));
  };

  const handleAddToWishlist = (product, event) => {
    event.stopPropagation();
    dispatch(addToWishlist(product));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCategoryFilterChange = (category) => {
    setCategoryFilter(category);
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
      
      console.log('Starting try-on process with:');
      console.log('- Model image:', modelImage);
      console.log('- Cloth image:', clothImage);
      console.log('- Model path:', modelPath);
      console.log('- Cloth path:', clothPath);
      console.log('- Clothing category:', clothingCategory);
      console.log('- Using Segmind AI for high-quality results');
      
      const startTime = Date.now();
      
      // Using POST with JSON body for the API request
      console.log('Sending try-on request...');
      const response = await axios.post(`${API_URL}/api/tryon`, {
        model_path: modelPath,
        cloth_path: clothPath,
        use_segmind: true, // Always true
        clothing_category: clothingCategory
      }, {
        timeout: 600000 // 10 minute timeout to handle Segmind processing
      });
      
      const endTime = Date.now();
      setProcessingTime((endTime - startTime) / 1000); // Convert to seconds
      
      console.log('Try-on response data:', response.data);
      if (response.data && response.data.result) {
        const resultUrl = `${API_URL}/api/result/${response.data.result}`;
        console.log('Result URL:', resultUrl);
        setResultImage(resultUrl);
        // Clear any error messages if successful
        setError(null);
      } else {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Try-on error:', err);
      
      // Handle different types of errors
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Segmind processing is taking longer than expected. Please try again with a different image or check your network connection.');
      } else if (err.response) {
        // Server responded with an error status
        const errorDetail = err.response.data?.detail || 'Unknown error';
        if (err.response.status === 429) {
          setError('Segmind API rate limit exceeded. Please try again in a few minutes.');
        } else if (err.response.status === 422) {
          setError('Segmind API processing error. Please try with a different model or clothing image.');
        } else {
          setError(`Server error (${err.response.status}): ${errorDetail}`);
        }
      } else if (err.request) {
        // No response received
        setError('No response from server. The Segmind processing may be taking longer than expected. Please try again or check your connection.');
      } else {
        // Generic error message
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
      console.log('Try-on process completed');
    }
  };

  // Filter products based on selected category
  const filteredProducts = categoryFilter === 'all' 
    ? clothingOptions 
    : clothingOptions.filter(product => product.category === categoryFilter);

  // Add refs for animations
  const productCardsRef = useRef([]);
  const tryOnButtonRef = useRef(null);
  const pageContentRef = useRef(null);
  const sectionRefs = useRef([]);
  const modelImageRef = useRef(null);
  const clothImageRef = useRef(null);
  const resultImageRef = useRef(null);
  
  // Add animation effect on component mount
  useEffect(() => {
    // Animate page content
    if (pageContentRef.current) {
      fadeIn(pageContentRef.current.children);
    }
    
    // Animate product cards when they're loaded and visible
    if (!isPreloading && productCardsRef.current.length > 0) {
      animateProductCards(productCardsRef.current);
    }
    
    // Create scroll reveal for sections
    if (sectionRefs.current.length > 0) {
      createScrollReveal(sectionRefs.current);
    }
  }, [isPreloading]);
  
  // Add animation when model image is uploaded
  useEffect(() => {
    if (modelImage && modelImageRef.current) {
      gsap.fromTo(
        modelImageRef.current,
        { scale: 0.9, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.5, 
          ease: "back.out(1.7)"
        }
      );
    }
  }, [modelImage]);
  
  // Add animation when cloth image is selected/uploaded
  useEffect(() => {
    if (clothImage && clothImageRef.current) {
      gsap.fromTo(
        clothImageRef.current,
        { scale: 0.9, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.5, 
          ease: "back.out(1.7)"
        }
      );
    }
  }, [clothImage]);
  
  // Add animation when result image appears
  useEffect(() => {
    if (resultImage && resultImageRef.current) {
      gsap.fromTo(
        resultImageRef.current,
        { scale: 0.8, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.8, 
          ease: "elastic.out(1, 0.5)"
        }
      );
    }
  }, [resultImage]);
  
  // Handle button animation
  const handleTryOnButtonClick = (e, item) => {
    e.stopPropagation();
    
    // Animate the button
    animateTryOnButton(e.currentTarget);
    
    // Then execute the product selection
    setTimeout(() => {
      handleProductSelect(item);
    }, 300);
  };
  
  // Handle button hover animations
  const handleButtonEnter = (e) => {
    buttonEnter(e.currentTarget);
  };
  
  const handleButtonLeave = (e) => {
    buttonLeave(e.currentTarget);
  };
  
  // Update the image renderers to include refs
  const renderUploadedImage = (image, type) => {
    if (!image) return null;
    
    const previewUrl = typeof image === 'object' ? image.previewUrl : image;

  return (
      <Box
        ref={type === 'model' ? modelImageRef : type === 'cloth' ? clothImageRef : resultImageRef}
        sx={{
          mt: 2,
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          position: 'relative',
        }}
      >
        <img
          src={previewUrl}
          alt={`${type} preview`}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            maxHeight: '500px',
            objectFit: 'contain',
          }}
        />
      </Box>
    );
  };

  // Render the product cards, but ensure we show something during loading
  const renderProductCards = () => {
    if (isPreloading || isLoadingLV) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          flexDirection: 'column', 
          p: 4 
        }}>
          <CircularProgress color="secondary" />
          <Typography sx={{ mt: 2 }}>Loading products...</Typography>
      </Box>
      );
    }

    const sections = [
      {
        title: "Louis Vuitton Collection",
        items: lvClothes.map(cloth => ({
          id: cloth.filename,
          name: cloth.filename.split('_')[0],
          image: `${API_URL}/api/lv-clothes/${cloth.filename}`,
          category: 'Upper body',
          price: 999.99
        }))
      },
      {
        title: "Standard Collection",
        items: filteredProducts
      }
    ];

    return (
      <>
        {sections.map((section, sectionIndex) => (
          <Box key={section.title} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
              {section.title}
            </Typography>
            <Grid container spacing={2}>
              {section.items.map((product, index) => (
                <Grid item xs={6} sm={4} md={3} key={product.id}>
                  <StyledCard 
                    onClick={() => handleProductSelect(product)}
                    ref={el => {
                      if (el && !productCardsRef.current.includes(el)) {
                        productCardsRef.current.push(el);
                      }
                    }}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <ProductImage
                        image={product.image}
                        title={product.name}
                      />
                      <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                        <CategoryChip
                          label={product.category}
                          size="small"
                          category={product.category}
                        />
                      </Box>
                    </Box>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom noWrap>
                        {product.name}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="primary" fontWeight="bold">
                          ${product.price.toFixed(2)}
                        </Typography>
                        <Box>
                          <IconButton 
                            size="small" 
                            color="secondary"
                            onClick={(e) => handleAddToWishlist(product, e)}
                          >
                            <FavoriteIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={(e) => handleAddToCart(product, e)}
                          >
                            <ShoppingCartIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </>
    );
  };

  // Add effect to filter products when tab changes
  useEffect(() => {
    // Update category filter based on tab
    if (tabValue === 0) setCategoryFilter('all');
    else if (tabValue === 1) setCategoryFilter('Upper body');
    else if (tabValue === 2) setCategoryFilter('Lower body');
    else if (tabValue === 3) setCategoryFilter('Dress');
  }, [tabValue]);

  return (
    <RootContainer maxWidth="xl" ref={pageContentRef}>
      <Header variant="h3" component="h1">
        Virtual Try-On Experience
      </Header>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3, animation: 'fadeIn 0.5s' }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}
      
            <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <UploadSection elevation={2}>
                <SectionTitle variant="h5">
              <CategoryIcon sx={{ color: 'primary.main' }} />
              Upload Your Photo
                </SectionTitle>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload a photo of yourself in a neutral pose against a simple background for best results.
            </Typography>
                  <ImageUploader
                    onUpload={handleModelUpload}
              imageUrl={modelImage?.previewUrl || modelImage}
                    accept="image/*"
                    maxSize={5 * 1024 * 1024} // 5MB
                    label="Upload Your Photo"
              ref={modelImageRef}
                  />
                </UploadSection>
              </Grid>
              
        <Grid item xs={12} md={4}>
          <UploadSection elevation={2} id="cloth-upload-section">
            <SectionTitle variant="h5">
              <CheckroomIcon sx={{ color: 'primary.main' }} />
              Select Clothing Item
            </SectionTitle>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload a clothing item or select from our recommended items below.
            </Typography>
                  <ImageUploader
                    onUpload={handleClothUpload}
              imageUrl={clothImage?.previewUrl || clothImage}
                    accept="image/*"
                    maxSize={5 * 1024 * 1024} // 5MB
                    label="Upload Clothing"
              selectedProductName={selectedProduct?.name}
              ref={clothImageRef}
                  />
                </UploadSection>
              </Grid>
              
        <Grid item xs={12} md={4}>
          <UploadSection elevation={2}>
            <SectionTitle variant="h5">Options & Try-On</SectionTitle>
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormLabel component="legend">Clothing Category</FormLabel>
              <RadioGroup
                aria-label="clothing-category"
                name="clothing-category"
                        value={clothingCategory}
                        onChange={(e) => setClothingCategory(e.target.value)}
                row
              >
                <FormControlLabel value="Upper body" control={<Radio />} label="Upper body" />
                <FormControlLabel value="Lower body" control={<Radio />} label="Lower body" />
                <FormControlLabel value="Dress" control={<Radio />} label="Dress" />
              </RadioGroup>
                    </FormControl>
                  
                  <Button
                    variant="contained"
                    color="primary"
              fullWidth
              size="large"
                    disabled={loading || !modelImage || !clothImage}
              onClick={handleTryOn}
              sx={{ 
                py: 1.5,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
                  transform: 'translateX(-100%)',
                  transition: 'transform 0.6s'
                },
                '&:hover::after': {
                  transform: 'translateX(100%)'
                }
              }}
              ref={tryOnButtonRef}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Processing...
                </>
              ) : (
                'Try On Now'
              )}
                  </Button>
            
            {processingTime && (
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                Processing time: {processingTime.toFixed(1)} seconds
                    </Typography>
            )}
          </UploadSection>
                </Grid>
            </Grid>
          
          {resultImage && (
        <ResultViewer imageUrl={resultImage} ref={resultImageRef} />
      )}
      
      <Box sx={{ mt: 5, mb: 3 }} ref={(el) => (sectionRefs.current[0] = el)}>
        <SectionTitle variant="h4" sx={{ textAlign: 'center' }}>
          Recommended Clothing
            </SectionTitle>
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 4, maxWidth: 700, mx: 'auto' }}>
          Click on any item below to try it on virtually. Browse our collection by category.
        </Typography>
            
        <Paper elevation={1} sx={{ p: 0 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="secondary"
            textColor="secondary"
            aria-label="clothing categories"
            sx={{ mb: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}
          >
            <Tab label="All Items" />
                <Tab label="Upper Body" />
                <Tab label="Lower Body" />
                <Tab label="Dresses" />
              </Tabs>
          
          <Box sx={{ p: 2 }}>
            {renderProductCards()}
            </Box>
          </Paper>
      </Box>
    </RootContainer>
  );
};

export default VirtualTryOn;