import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Stack,
  Chip,
  Avatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import { addToCart } from '../store/cartSlice';

const HeroSection = styled(Box)(({ theme }) => ({
  color: 'white',
  padding: theme.spacing(12, 0),
  textAlign: 'center',
  backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  borderRadius: '0 0 20px 20px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  fontWeight: 700,
  position: 'relative',
  display: 'inline-block',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -10,
    left: 0,
    width: 60,
    height: 4,
    backgroundColor: theme.palette.secondary.main,
    borderRadius: 2,
  }
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius,
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.15)',
  },
}));

const ProductCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.15)',
  },
}));

const ProductImage = styled(CardMedia)(({ theme }) => ({
  height: 280,
  backgroundSize: 'cover',
  transition: 'transform 0.5s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const PriceChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  backgroundColor: theme.palette.secondary.main,
  color: 'white',
  fontWeight: 'bold',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
}));

const Home = () => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  
  // Featured products with real images
  const featuredProducts = [
    {
      id: 1,
      name: 'Classic White T-Shirt',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'A comfortable and stylish classic white t-shirt, perfect for any casual occasion.',
    },
    {
      id: 7,
      name: 'Elegant Evening Gown',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Stunning evening gown for special occasions and formal events.',
    },
    {
      id: 2,
      name: 'Blue Denim Jacket',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Stylish blue denim jacket that goes well with any outfit.',
    },
    {
      id: 3,
      name: 'Black Slim-Fit Jeans',
      price: 59.99,
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Classic black slim-fit jeans for a modern look.',
    },
  ];

  const features = [
    {
      icon: <CheckroomIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />,
      title: 'Virtual Try-On',
      description: 'Try clothes virtually before making a purchase decision.',
    },
    {
      icon: <LocalShippingIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />,
      title: 'Free Shipping',
      description: 'Free shipping on all orders over $50.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />,
      title: 'Secure Payments',
      description: 'Your payment information is always secure with us.',
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />,
      title: '24/7 Support',
      description: 'Our customer support team is available around the clock.',
    },
  ];

  const handleWishlistToggle = (product) => {
    const isInWishlist = wishlistItems.some(item => item.id === product.id);
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product));
    }
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="md">
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 800,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              mb: 3
            }}
          >
            Virtual Try-On Experience
          </Typography>
          <Typography 
            variant="h5" 
            paragraph
            sx={{ 
              maxWidth: 700, 
              mx: 'auto', 
              mb: 5,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            Experience clothes virtually before you buy them with our cutting-edge technology
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
            sx={{ mt: 4 }}
          >
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={RouterLink}
              to="/virtual-tryon"
              startIcon={<CheckroomIcon />}
              sx={{ 
                py: 1.5, 
                px: 4, 
                fontSize: '1.1rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}
            >
              Try Now
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              component={RouterLink}
              to="/products"
              startIcon={<ShoppingCartIcon />}
              sx={{ 
                py: 1.5, 
                px: 4, 
                fontSize: '1.1rem',
                borderColor: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white',
                }
              }}
            >
              Shop Collection
            </Button>
          </Stack>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <SectionTitle variant="h4" component="h2">
            Why Choose Us
          </SectionTitle>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', mt: 2 }}>
            We offer a unique shopping experience with our innovative features and commitment to customer satisfaction.
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <FeatureCard elevation={1}>
                {feature.icon}
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products Section */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <SectionTitle variant="h4" component="h2">
              Featured Products
            </SectionTitle>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', mt: 2 }}>
              Discover our most popular items that you can try on virtually before purchasing.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {featuredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product.id}>
                <ProductCard>
                  <Box sx={{ position: 'relative' }}>
                    <ProductImage
                      image={product.image}
                      title={product.name}
                    />
                    <PriceChip
                      label={`$${product.price.toFixed(2)}`}
                      size="medium"
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {product.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </Button>
                      <IconButton
                        color="secondary"
                        onClick={() => handleWishlistToggle(product)}
                        size="medium"
                        sx={{ ml: 1 }}
                      >
                        {isInWishlist(product.id) ? (
                          <FavoriteIcon />
                        ) : (
                          <FavoriteBorderIcon />
                        )}
                      </IconButton>
                    </Box>
                  </CardContent>
                </ProductCard>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              component={RouterLink}
              to="/products"
              sx={{ px: 4 }}
            >
              View All Products
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Virtual Try-On CTA Section */}
      <Box 
        sx={{ 
          py: 10,
          backgroundImage: 'linear-gradient(rgba(63, 81, 181, 0.9), rgba(63, 81, 181, 0.9)), url(https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Ready to Try Before You Buy?
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: 700, mx: 'auto', mb: 4, opacity: 0.9 }}>
            Our virtual try-on technology lets you see how clothes look on you without the hassle of a fitting room.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            component={RouterLink}
            to="/virtual-tryon"
            startIcon={<CheckroomIcon />}
            sx={{ 
              py: 1.5, 
              px: 4, 
              fontSize: '1.1rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            Try On Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 