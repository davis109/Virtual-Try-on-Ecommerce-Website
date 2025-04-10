import React, { useState, useEffect, useRef } from 'react';
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
import { 
  buttonEnter, 
  buttonLeave, 
  fadeIn, 
  animateTryOnButton,
  create3DLayeredCard,
  animateProductDetail,
  enhance3DProductImage,
  createFloatingEffect
} from '../utils/animations';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  
  // Refs for animations
  const productImageRef = useRef(null);
  const productInfoRef = useRef(null);
  const ctaButtonsRef = useRef(null);
  const tryOnButtonRef = useRef(null);
  const tabsContainerRef = useRef(null);
  const productDetailContainerRef = useRef(null);
  
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

  // Initialize animations
  useEffect(() => {
    if (!loading && product) {
      // Apply 3D animations to product detail page
      animateProductDetail(productDetailContainerRef.current);
      
      // Apply individual effects as needed
      fadeIn(productInfoRef.current);
      fadeIn(tabsContainerRef.current, { delay: 0.3 });
      
      // Setup button hover effects
      const buttons = ctaButtonsRef.current?.querySelectorAll('button') || [];
      buttons.forEach(button => {
        button.addEventListener('mouseenter', () => buttonEnter(button));
        button.addEventListener('mouseleave', () => buttonLeave(button));
      });
      
      // Animate Try On button if it exists
      const tryOnButton = document.querySelector('.try-on-btn');
      if (tryOnButton) {
        animateTryOnButton(tryOnButton);
      }
      
      // Enhanced 3D product image effect
      const productImage = productImageRef.current.querySelector('img');
      if (productImage) {
        enhance3DProductImage(productImage, 1.2);
      }
      
      // Create 3D layered effect for the product image
      if (productImageRef.current) {
        create3DLayeredCard(productImageRef.current, {
          depth: 40,
          layers: 2,
          rotation: 5
        });
      }
    }
    
    // Cleanup function
    return () => {
      const buttons = ctaButtonsRef.current?.querySelectorAll('button') || [];
      buttons.forEach(button => {
        button.removeEventListener('mouseenter', () => buttonEnter(button));
        button.removeEventListener('mouseleave', () => buttonLeave(button));
      });
    };
  }, [loading, product]);

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
    <div className="product-detail-page" ref={productDetailContainerRef}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box 
            ref={productImageRef} 
            sx={{ 
              borderRadius: '8px', 
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              transform: 'perspective(1000px)',
              transformStyle: 'preserve-3d',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}
          >
            <img
              src={product.image}
              alt={product.name}
              style={{ 
                width: '100%', 
                height: 'auto', 
                borderRadius: '4px',
                transition: 'transform 0.5s ease-out'
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              ref={tryOnButtonRef}
              variant="contained"
              color="secondary"
              component={RouterLink}
              to="/virtual-tryon"
              sx={{ 
                mx: 1,
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)',
                  transform: 'translateX(-100%)',
                  transition: 'transform 0.6s'
                },
                '&:hover::after': {
                  transform: 'translateX(100%)'
                }
              }}
            >
              Try On Virtually
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box 
            ref={productInfoRef} 
            sx={{ 
              transformStyle: 'preserve-3d',
              perspective: '1000px' 
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ 
                  transform: 'translateZ(10px)',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                {product.name}
              </Typography>
              <Tooltip title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}>
                <IconButton 
                  color="secondary" 
                  onClick={handleWishlistToggle}
                  sx={{ 
                    ml: 1,
                    transform: 'translateZ(5px)'
                  }}
                >
                  {isInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Tooltip>
            </Box>
            <Typography 
              variant="h5" 
              color="primary" 
              gutterBottom
              sx={{ transform: 'translateZ(8px)' }}
            >
              ${product.price}
            </Typography>
            <Typography 
              variant="body1" 
              paragraph
              sx={{ transform: 'translateZ(5px)' }}
            >
              {product.description}
            </Typography>
            
            <Box sx={{ my: 3, transform: 'translateZ(5px)' }}>
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
                    sx={{ 
                      minWidth: '40px',
                      transition: 'all 0.3s ease'
                    }}
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
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.15) translateZ(10px)',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box 
            ref={ctaButtonsRef} 
            sx={{ 
              display: 'flex', 
              gap: 2, 
              mb: 3,
              perspective: '1000px' 
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleAddToCart}
              fullWidth
              sx={{ 
                transformStyle: 'preserve-3d',
                transition: 'all 0.3s ease'
              }}
            >
              Add to Cart
            </Button>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/cart"
              size="large"
              fullWidth
              sx={{ 
                transformStyle: 'preserve-3d',
                transition: 'all 0.3s ease'
              }}
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
            sx={{ 
              mb: 3,
              transformStyle: 'preserve-3d',
              transition: 'all 0.3s ease'
            }}
          >
            {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </Button>
        </Grid>
      </Grid>
      
      <Paper 
        ref={tabsContainerRef} 
        sx={{ 
          mt: 4,
          transformStyle: 'preserve-3d',
          perspective: '1000px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 15px 40px rgba(0,0,0,0.15)'
          }
        }}
      >
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
            <Typography sx={{ transform: 'translateZ(5px)' }}>
              {product.description}
              <br /><br />
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </Typography>
          )}
          {tabValue === 1 && (
            <Box sx={{ transform: 'translateZ(5px)' }}>
              <Typography variant="subtitle1">Material: 100% Cotton</Typography>
              <Typography variant="subtitle1">Care: Machine wash cold</Typography>
              <Typography variant="subtitle1">Origin: Made in USA</Typography>
            </Box>
          )}
          {tabValue === 2 && (
            <Typography sx={{ transform: 'translateZ(5px)' }}>
              No reviews yet. Be the first to review this product!
            </Typography>
          )}
        </Box>
      </Paper>
    </div>
  );
};

export default ProductDetail; 