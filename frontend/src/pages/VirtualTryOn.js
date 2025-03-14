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
  let color = theme.palette.primary.main;
  if (category === 'Lower body') color = theme.palette.info.main;
  if (category === 'Dress') color = theme.palette.secondary.main;
  
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

const ImageUploader = ({ onUpload, imageUrl, accept, maxSize, label, icon }) => {
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
        alignItems: 'center', 
        justifyContent: 'center',
        width: '100%',
        border: imageUrl ? 'none' : '2px dashed #ccc',
        borderRadius: '8px',
        p: 2,
        backgroundColor: imageUrl ? 'transparent' : '#f9f9f9',
      }}>
        {imageUrl ? (
          <img
            src={typeof imageUrl === 'object' ? imageUrl.previewUrl : imageUrl}
            alt="Preview"
            style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '4px' }}
          />
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
  const [useSegmind, setUseSegmind] = useState(false);
  const [processingTime, setProcessingTime] = useState(null);
  const [clothingCategory, setClothingCategory] = useState("Upper body");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("all");
  
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
    
    try {
      console.log('Selected product:', product);
      
      // Download the image from the URL and upload it to the server
      console.log('Downloading product image from:', product.image);
      
      // Fetch the image
      const response = await fetch(product.image);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      // Convert to blob
      const imageBlob = await response.blob();
      
      // Create a file from the blob
      const fileName = product.image.split('/').pop() || 'product-image.jpg';
      const file = new File([imageBlob], fileName, { type: 'image/jpeg' });
      
      console.log('Created file from image:', file.name, 'Size:', file.size, 'bytes');
      
      // Upload the file to the server
      await handleClothUpload(file);
      
      console.log('Product image uploaded successfully');
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
      console.log('- Use Segmind:', useSegmind);
      console.log('- Clothing category:', clothingCategory);
      
      // If the cloth path is a URL (from product selection), download it first
      let finalClothPath = clothPath;
      if (clothPath.startsWith('http') && !clothPath.includes(API_URL)) {
        console.log('Cloth path is a URL, downloading it first...');
        try {
          // Fetch the image
          const response = await fetch(clothPath);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
          }
          
          // Convert to blob
          const imageBlob = await response.blob();
          
          // Create a file from the blob
          const fileName = clothPath.split('/').pop() || 'product-image.jpg';
          const file = new File([imageBlob], fileName, { type: 'image/jpeg' });
          
          console.log('Created file from image:', file.name, 'Size:', file.size, 'bytes');
          
          // Upload the file to the server
          const formData = new FormData();
          formData.append('file', file);
          
          const uploadResponse = await axios.post(`${API_URL}/api/upload/cloth`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          finalClothPath = uploadResponse.data.filename;
          console.log('Cloth image uploaded successfully, new path:', finalClothPath);
        } catch (err) {
          console.error('Error downloading and uploading cloth image:', err);
          throw new Error(`Failed to process cloth image: ${err.message}`);
        }
      }
      
      const startTime = Date.now();
      
      const apiUrl = `${API_URL}/api/tryon?model_path=${encodeURIComponent(modelPath)}&cloth_path=${encodeURIComponent(finalClothPath)}&use_segmind=${useSegmind}&clothing_category=${encodeURIComponent(clothingCategory)}`;
      console.log('API URL:', apiUrl);
      
      console.log('Sending try-on request...');
      const response = await axios.post(apiUrl);
      console.log('Try-on response received:', response);
      
      const endTime = Date.now();
      setProcessingTime((endTime - startTime) / 1000); // Convert to seconds
      
      console.log('Try-on response data:', response.data);
      if (response.data && response.data.result) {
        const resultUrl = `${API_URL}/api/result/${response.data.result}`;
        console.log('Result URL:', resultUrl);
        setResultImage(resultUrl);
        console.log('Result image set to:', resultUrl);
      } else {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Try-on error:', err);
      console.error('Error type:', err.constructor.name);
      console.error('Error message:', err.message);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      setError(`Error processing virtual try-on: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
      console.log('Try-on process completed');
    }
  };

  // Filter products based on selected category
  const filteredProducts = categoryFilter === 'all' 
    ? clothingOptions 
    : clothingOptions.filter(product => product.category === categoryFilter);

  return (
    <RootContainer maxWidth="lg">
      <Header variant="h3">Virtual Try-On Experience</Header>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" align="center" color="textSecondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Experience our cutting-edge virtual try-on technology. Upload your photo, select a garment, and see how it looks on you instantly!
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2, 
              border: '1px solid rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(to bottom, #ffffff, #f9f9f9)',
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <SectionTitle variant="h5">
                  <CheckroomIcon /> Try-On Process
                </SectionTitle>
                <Divider sx={{ mb: 3 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <UploadSection>
                  <SectionTitle variant="h6">Upload Your Photo</SectionTitle>
                  <ImageUploader
                    onUpload={handleModelUpload}
                    imageUrl={modelImage}
                    accept="image/*"
                    maxSize={5 * 1024 * 1024} // 5MB
                    label="Upload Your Photo"
                  />
                </UploadSection>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <UploadSection>
                  <SectionTitle variant="h6">Upload Clothing Item</SectionTitle>
                  <ImageUploader
                    onUpload={handleClothUpload}
                    imageUrl={clothImage}
                    accept="image/*"
                    maxSize={5 * 1024 * 1024} // 5MB
                    label="Upload Clothing"
                  />
                </UploadSection>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2, mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControl sx={{ minWidth: 200 }}>
                      <InputLabel id="clothing-category-label">Clothing Category</InputLabel>
                      <Select
                        labelId="clothing-category-label"
                        value={clothingCategory}
                        label="Clothing Category"
                        onChange={(e) => setClothingCategory(e.target.value)}
                      >
                        <MenuItem value="Upper body">Upper Body</MenuItem>
                        <MenuItem value="Lower body">Lower Body</MenuItem>
                        <MenuItem value="Dress">Full Dress</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <Tooltip title="Use our enhanced AI-powered virtual try-on for more realistic results">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={useSegmind}
                            onChange={(e) => setUseSegmind(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 0.5 }}>Use AI Engine</Typography>
                            {useSegmind && (
                              <Chip 
                                size="small" 
                                color="secondary" 
                                label="Enhanced" 
                                sx={{ height: 20, fontSize: '0.7rem' }} 
                              />
                            )}
                          </Box>
                        }
                      />
                    </Tooltip>
                  </Box>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleTryOn}
                    disabled={loading || !modelImage || !clothImage}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckroomIcon />}
                    sx={{ minWidth: 150 }}
                  >
                    {loading ? 'Processing...' : 'Try It On'}
                  </Button>
                </Box>
              </Grid>
              
              {error && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                </Grid>
              )}
              
              {loading && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                      {useSegmind ? 'AI Engine Processing...' : 'Processing Your Request...'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {useSegmind 
                        ? 'Our AI is working to create a realistic virtual try-on. This may take a few moments.' 
                        : 'Creating your virtual try-on. This will only take a moment.'}
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {processingTime && !loading && (
                <Grid item xs={12}>
                  <Alert 
                    severity="info" 
                    sx={{ mt: 2 }}
                    icon={useSegmind ? <CheckroomIcon /> : undefined}
                  >
                    <AlertTitle>{useSegmind ? 'AI Processing Complete' : 'Processing Complete'}</AlertTitle>
                    Completed in {processingTime.toFixed(2)} seconds
                    {useSegmind && ' using our enhanced AI engine'}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
          
          {resultImage && (
            <Box sx={{ mt: 4 }}>
              <ResultViewer imageUrl={resultImage} />
            </Box>
          )}
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2, 
              height: '100%',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(to bottom, #ffffff, #f9f9f9)',
            }}
          >
            <SectionTitle variant="h5">
              <CategoryIcon /> Select a Product
            </SectionTitle>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ mb: 3 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="All" />
                <Tab label="Upper Body" />
                <Tab label="Lower Body" />
                <Tab label="Dresses" />
              </Tabs>
            </Box>
            
            <Box sx={{ maxHeight: 600, overflow: 'auto', pr: 1 }}>
              <Grid container spacing={2}>
                {clothingOptions
                  .filter(item => {
                    if (tabValue === 0) return true;
                    if (tabValue === 1) return item.category === 'Upper body';
                    if (tabValue === 2) return item.category === 'Lower body';
                    if (tabValue === 3) return item.category === 'Dress';
                    return true;
                  })
                  .map((item) => (
                    <Grid item xs={12} key={item.id}>
                      <StyledCard 
                        onClick={() => handleProductSelect(item)}
                        sx={{ 
                          cursor: 'pointer',
                          border: selectedProduct?.id === item.id ? '2px solid' : '1px solid',
                          borderColor: selectedProduct?.id === item.id ? 'primary.main' : 'rgba(0, 0, 0, 0.08)',
                        }}
                      >
                        <ProductImage
                          image={item.image}
                          title={item.name}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                              {item.name}
                            </Typography>
                            <CategoryChip
                              label={item.category}
                              category={item.category}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {item.description}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                              ${item.price.toFixed(2)}
                            </Typography>
                            <Box>
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={(e) => handleAddToWishlist(item, e)}
                              >
                                <FavoriteIcon />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={(e) => handleAddToCart(item, e)}
                              >
                                <ShoppingCartIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </StyledCard>
                    </Grid>
                  ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </RootContainer>
  );
};

export default VirtualTryOn; 