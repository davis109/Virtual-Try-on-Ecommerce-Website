import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Divider,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isInWishlist = product ? wishlistItems.some(item => item.id === product.id) : false;

  // Mock product data - replace with actual API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockProduct = {
        id: parseInt(id),
        name: `Product ${id}`,
        price: 59.99,
        category: id % 3 === 0 ? 'Dress' : id % 2 === 0 ? 'Lower body' : 'Upper body',
        image: `https://via.placeholder.com/600x800?text=Product+${id}`,
        description: 'This is a detailed description of the product. It includes information about the material, fit, and care instructions.',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Black', 'White', 'Blue', 'Red'],
      };
      setProduct(mockProduct);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart(product));
    }
  };

  const handleWishlistToggle = () => {
    if (product) {
      if (isInWishlist) {
        dispatch(removeFromWishlist(product.id));
      } else {
        dispatch(addToWishlist(product));
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Loading product details...</Typography>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Product not found</Typography>
        <Button component={RouterLink} to="/products" variant="contained" sx={{ mt: 2 }}>
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              component={RouterLink}
              to="/virtual-tryon"
              sx={{ mx: 1 }}
            >
              Try On Virtually
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>
            <Tooltip title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}>
              <IconButton 
                color="secondary" 
                onClick={handleWishlistToggle}
                sx={{ ml: 1 }}
              >
                {isInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="h5" color="primary" gutterBottom>
            ${product.price}
          </Typography>
          <Typography variant="body1" paragraph>
            {product.description}
          </Typography>
          
          <Box sx={{ my: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Category: {product.category}
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Available Sizes:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {product.sizes.map((size) => (
                <Button
                  key={size}
                  variant="outlined"
                  size="small"
                  sx={{ minWidth: '40px' }}
                >
                  {size}
                </Button>
              ))}
            </Box>
            
            <Typography variant="subtitle1" gutterBottom>
              Available Colors:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {product.colors.map((color) => (
                <Box
                  key={color}
                  sx={{
                    width: 30,
                    height: 30,
                    bgcolor: color.toLowerCase(),
                    border: '1px solid #ddd',
                    borderRadius: '50%',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleAddToCart}
              fullWidth
            >
              Add to Cart
            </Button>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/cart"
              size="large"
              fullWidth
            >
              Go to Cart
            </Button>
          </Box>
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            onClick={handleWishlistToggle}
            startIcon={isInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            fullWidth
            sx={{ mb: 3 }}
          >
            {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </Button>
        </Grid>
      </Grid>
      
      <Paper sx={{ mt: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Description" />
          <Tab label="Specifications" />
          <Tab label="Reviews" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Typography>
              {product.description}
              <br /><br />
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </Typography>
          )}
          {tabValue === 1 && (
            <Box>
              <Typography variant="subtitle1">Material: 100% Cotton</Typography>
              <Typography variant="subtitle1">Care: Machine wash cold</Typography>
              <Typography variant="subtitle1">Origin: Made in USA</Typography>
            </Box>
          )}
          {tabValue === 2 && (
            <Typography>
              No reviews yet. Be the first to review this product!
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ProductDetail; 