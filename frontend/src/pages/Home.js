import React, { useEffect, useRef } from 'react';
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
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import { addToCart } from '../store/cartSlice';
import { 
  animateHero, 
  buttonEnter, 
  buttonLeave, 
  animateFeatureCards, 
  animateProductCards, 
  createParallaxEffect, 
  createScrollReveal,
  add3DHoverEffect,
  create3DLayeredCard,
  createImagePopEffect,
  enhance3DProductImage,
  createFloatingEffect
} from '../utils/animations';
import { gsap } from 'gsap';

const HeroSection = styled(Box)(({ theme }) => ({
  color: 'white',
  padding: theme.spacing(12, 0),
  textAlign: 'center',
  backgroundColor: '#05071F', // Darker blue/black for space background
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  borderRadius: '0 0 20px 20px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  zIndex: 0, // Change to 0 to allow proper stacking
}));

const GradientText = styled(Typography)(({ theme }) => ({
  backgroundImage: `linear-gradient(135deg, #fff 0%, ${theme.palette.info.light} 50%, ${theme.palette.primary.light} 100%)`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 800,
  textShadow: 'none',
  position: 'relative',
  zIndex: 10 // Increase to ensure it's above the blobs
}));

const SubtitleGradientText = styled(Typography)(({ theme }) => ({
  backgroundImage: `linear-gradient(135deg, #fff 10%, ${theme.palette.info.main} 100%)`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: 'none',
  position: 'relative',
  zIndex: 10 // Increase to ensure it's above the blobs
}));

const BlobContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  zIndex: 5, // Set between background (0) and text (10)
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
});

const Blob = styled(Box)(({ color, size }) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: '50%',
  background: color,
  filter: 'blur(50px)',
  opacity: 0.65,
  zIndex: 5,
  mixBlendMode: 'screen',
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

// Add a milky way background container
const MilkyWayContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  zIndex: 1, // Above the background, below the blobs
});

// Star component for the milky way
const Star = styled(Box)(({ size, opacity }) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: '50%',
  backgroundColor: '#fff',
  opacity: opacity,
  zIndex: 1,
}));

// Create a milky way cloud component
const MilkyWayCloud = styled(Box)(({ color, size, blur }) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: '50%',
  background: color,
  filter: `blur(${blur}px)`,
  opacity: 0.1,
  zIndex: 2,
}));

const Home = () => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  
  // Create refs for elements that need animations
  const heroRef = useRef(null);
  const featureCardsRef = useRef([]);
  const productCardsRef = useRef([]);
  const heroBackgroundRef = useRef(null);
  const sectionsRef = useRef([]);
  const productImagesRef = useRef([]);
  const blobsRef = useRef([]);
  const starsRef = useRef([]);
  const milkyWayCloudsRef = useRef([]);
  
  // Create milky way animation
  useEffect(() => {
    // Create stars animation
    if (starsRef.current.length > 0) {
      starsRef.current.forEach((star, index) => {
        // Random flicker animation
        gsap.to(star, {
          opacity: Math.random() * 0.5 + 0.1, // Flicker between dimmer and brighter
          duration: Math.random() * 3 + 1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      });
    }
    
    // Create milky way clouds animation
    if (milkyWayCloudsRef.current.length > 0) {
      milkyWayCloudsRef.current.forEach((cloud, index) => {
        // Set initial position
        gsap.set(cloud, {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight * 0.7,
          rotation: Math.random() * 360
        });
        
        // Create slow rotation and movement
        gsap.to(cloud, {
          rotation: '+=360',
          duration: Math.random() * 200 + 150, // Very slow rotation
          repeat: -1,
          ease: "none"
        });
        
        // Slow drift across the screen
        gsap.to(cloud, {
          x: `+=${Math.random() * 50 - 25}%`,
          y: `+=${Math.random() * 30 - 15}%`,
          duration: Math.random() * 100 + 80,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      });
    }
  }, []);
  
  // Create blobs animation
  useEffect(() => {
    if (blobsRef.current.length > 0) {
      // Animate each blob
      blobsRef.current.forEach((blob, index) => {
        // Create a more noticeable movement pattern
        const xRandom = Math.random() * 40 - 20; // Increased movement range
        const yRandom = Math.random() * 40 - 20; // Increased movement range
        
        // Set starting positions
        gsap.set(blob, {
          x: Math.random() * window.innerWidth * 0.6 - window.innerWidth * 0.3, // Wider spread
          y: Math.random() * window.innerHeight * 0.6 - window.innerHeight * 0.3, // Wider spread
          scale: Math.random() * 0.5 + 0.8, // Slightly larger scale
          transformOrigin: 'center center',
        });
        
        // Create rotation animation with varying speeds based on index
        gsap.to(blob, {
          rotation: 360 * (index % 2 === 0 ? 1 : -1), // Alternate rotation directions
          duration: 30 + index * 10, // Different speed for each blob
          repeat: -1,
          ease: "none"
        });
        
        // Create a more dynamic movement animation
        gsap.to(blob, {
          x: `+=${xRandom * 2}%`, // Double the movement for more noticeable motion
          y: `+=${yRandom * 2}%`,
          duration: 15 + Math.random() * 20, // Faster movement
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
        
        // More pronounced pulsing effect
        gsap.to(blob, {
          opacity: 0.4,
          scale: '-=0.2', // Slight scale change during animation
          duration: 3 + Math.random() * 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      });
    }
  }, []);
  
  // Set up animations when component mounts
  useEffect(() => {
    // Hero animation
    if (heroRef.current) {
      animateHero(heroRef.current);
    }
    
    // Hero background parallax effect
    if (heroBackgroundRef.current) {
      createParallaxEffect(heroBackgroundRef.current, 0.3);
    }
    
    // Feature cards animation with 3D effect
    if (featureCardsRef.current.length > 0) {
      animateFeatureCards(featureCardsRef.current);
      
      // Add 3D layered cards effect for depth
      featureCardsRef.current.forEach(card => {
        create3DLayeredCard(card);
      });
    }
    
    // Product cards animation with 3D flip
    if (productCardsRef.current.length > 0) {
      animateProductCards(productCardsRef.current);
    }
    
    // Enhanced 3D effect for product images
    if (productImagesRef.current.length > 0) {
      productImagesRef.current.forEach(img => {
        if (img) {
          // Apply the new enhanced 3D rotation effect
          enhance3DProductImage(img, 0.8);
          // Add floating animation to product cards
          createFloatingEffect(img.closest('.MuiCard-root'));
        }
      });
    }
    
    // Sections reveal animation with 3D effect
    if (sectionsRef.current.length > 0) {
      createScrollReveal(sectionsRef.current);
    }
    
    // Add 3D hover effect to all buttons
    const buttons = document.querySelectorAll('button:not(.MuiIconButton-root)');
    add3DHoverEffect(Array.from(buttons), 0.7);
  }, []);
  
  // Keep button animation handlers
  const handleButtonEnter = (e) => {
    buttonEnter(e.currentTarget);
  };
  
  const handleButtonLeave = (e) => {
    buttonLeave(e.currentTarget);
  };

  // Featured products with real images
  const featuredProducts = [
    {
      id: 1,
      name: 'Classic White T-Shirt',
      price: 29.99,
      image: 'https://beyondtheshopdoor.com/wp-content/uploads/2023/04/Classic-Tee-White-Kowtow-Clothing.jpg',
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
      title: 'VTON',
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

  // Generate 100 random star positions for the component render
  const generateStars = () => {
    const stars = [];
    for (let i = 0; i < 150; i++) {
      const size = Math.random() * 2 + 1; // 1-3px
      const opacity = Math.random() * 0.7 + 0.3; // 0.3-1.0
      
      stars.push(
        <Star 
          key={`star-${i}`}
          size={`${size}px`}
          opacity={opacity}
          sx={{ 
            top: `${Math.random() * 100}%`, 
            left: `${Math.random() * 100}%`
          }}
          ref={el => starsRef.current[i] = el}
        />
      );
    }
    return stars;
  };
  
  // Generate 5 milky way clouds for the background
  const generateMilkyWayClouds = () => {
    const clouds = [];
    const colors = [
      'radial-gradient(circle, rgba(138, 43, 226, 0.3) 0%, rgba(138, 43, 226, 0.1) 70%, rgba(138, 43, 226, 0) 100%)',
      'radial-gradient(circle, rgba(75, 0, 130, 0.3) 0%, rgba(75, 0, 130, 0.1) 70%, rgba(75, 0, 130, 0) 100%)',
      'radial-gradient(circle, rgba(72, 61, 139, 0.3) 0%, rgba(72, 61, 139, 0.1) 70%, rgba(72, 61, 139, 0) 100%)',
      'radial-gradient(circle, rgba(106, 90, 205, 0.3) 0%, rgba(106, 90, 205, 0.1) 70%, rgba(106, 90, 205, 0) 100%)',
      'radial-gradient(circle, rgba(123, 104, 238, 0.3) 0%, rgba(123, 104, 238, 0.1) 70%, rgba(123, 104, 238, 0) 100%)'
    ];
    
    for (let i = 0; i < 5; i++) {
      const size = Math.random() * 700 + 300; // 300-1000px
      const blur = Math.random() * 60 + 40; // 40-100px
      
      clouds.push(
        <MilkyWayCloud
          key={`cloud-${i}`}
          color={colors[i % colors.length]}
          size={`${size}px`}
          blur={blur}
          ref={el => milkyWayCloudsRef.current[i] = el}
        />
      );
    }
    return clouds;
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section with milky way background and blurry blobs */}
      <HeroSection ref={heroBackgroundRef}>
        {/* Milky Way Background */}
        <MilkyWayContainer>
          {generateStars()}
          {generateMilkyWayClouds()}
        </MilkyWayContainer>
        
        {/* Blob Container */}
        <BlobContainer>
          <Blob 
            color="linear-gradient(135deg, #3B5EE8 0%, #5233EA 100%)" // Vivid blue/purple
            size="550px" 
            sx={{ top: '50%', left: '50%', transform: 'translate(-60%, -60%)' }}
            ref={el => blobsRef.current[0] = el}
          />
          <Blob 
            color="linear-gradient(135deg, #FC440F 0%, #FF7846 100%)" // Vibrant orange
            size="500px" 
            sx={{ top: '50%', left: '50%', transform: 'translate(30%, -30%)' }}
            ref={el => blobsRef.current[1] = el}
          />
          <Blob 
            color="linear-gradient(135deg, #00FFD1 0%, #47FFD1 100%)" // Bright teal
            size="450px" 
            sx={{ top: '50%', left: '50%', transform: 'translate(-40%, 20%)' }}
            ref={el => blobsRef.current[2] = el}
          />
          <Blob 
            color="linear-gradient(135deg, #CEFF2F 0%, #B4E33D 100%)" // Bright green/yellow
            size="400px" 
            sx={{ top: '50%', left: '50%', transform: 'translate(20%, 40%)' }}
            ref={el => blobsRef.current[3] = el}
          />
          <Blob 
            color="linear-gradient(135deg, #B83FE3 0%, #DA5FFE 100%)" // Bright purple/pink
            size="350px" 
            sx={{ top: '50%', left: '50%', transform: 'translate(0%, 0%)' }}
            ref={el => blobsRef.current[4] = el}
          />
        </BlobContainer>
        
        <Container maxWidth="md" ref={heroRef}>
          <GradientText 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              mb: 3,
              opacity: 0, // Start invisible for animation
              position: 'relative',
              zIndex: 10 // Ensure text is above blobs
            }}
          >
            Virtual Try-On Experience
          </GradientText>
          <SubtitleGradientText 
            variant="h5" 
            paragraph
            sx={{ 
              maxWidth: 700, 
              mx: 'auto', 
              mb: 5,
              opacity: 0, // Start invisible for animation
              position: 'relative',
              zIndex: 10 // Ensure text is above blobs
            }}
          >
            Experience clothes virtually before you buy them with our cutting-edge technology
          </SubtitleGradientText>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
            sx={{ mt: 4, position: 'relative', zIndex: 10 }}
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
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                opacity: 0 // Start invisible for animation
              }}
              onMouseEnter={handleButtonEnter}
              onMouseLeave={handleButtonLeave}
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
                transition: 'transform 0.3s ease, background-color 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white',
                },
                opacity: 0 // Start invisible for animation
              }}
              onMouseEnter={handleButtonEnter}
              onMouseLeave={handleButtonLeave}
            >
              Shop Collection
            </Button>
          </Stack>
        </Container>
      </HeroSection>

      <Container maxWidth="lg" sx={{ mt: 10, mb: 10 }}>
        {/* New Feature Highlight Section */}
        <Box sx={{ mb: 10 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.95), rgba(30, 30, 60, 0.8))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 242, 255, 0.1)',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <GradientText variant="h4" gutterBottom>
                  New: Text to Clothing Virtual Try-On
                </GradientText>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Imagine any clothing and try it on instantly! Our AI-powered text-to-clothing feature transforms your clothing descriptions into virtual garments you can try on.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                  <Chip 
                    icon={<AutoFixHighIcon />} 
                    label="AI-Powered" 
                    sx={{ 
                      bgcolor: 'rgba(0, 242, 255, 0.1)', 
                      border: '1px solid rgba(0, 242, 255, 0.3)' 
                    }} 
                  />
                  <Chip 
                    icon={<CheckroomIcon />} 
                    label="VTON" 
                    sx={{ 
                      bgcolor: 'rgba(252, 15, 192, 0.1)', 
                      border: '1px solid rgba(252, 15, 192, 0.3)' 
                    }} 
                  />
                </Box>
                <Button
                  component={RouterLink}
                  to="/text-to-clothing"
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<AutoFixHighIcon />}
                  onMouseEnter={handleButtonEnter}
                  onMouseLeave={handleButtonLeave}
                  sx={{ mt: 2 }}
                >
                  Try It Now
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    position: 'relative',
                    height: 320,
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(45deg, rgba(0, 242, 255, 0.1) 0%, rgba(252, 15, 192, 0.1) 100%)',
                      zIndex: 2
                    }
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundImage: 'url(/images/text-to-clothing-preview.svg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transition: 'transform 0.5s ease',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                  <Typography
                    variant="h5"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      padding: 2,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                      color: 'white',
                      zIndex: 3
                    }}
                  >
                    Design Your Dream Wardrobe
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* Features Section */}
        <Box ref={(el) => (sectionsRef.current[0] = el)} sx={{ mb: 10 }}>
          <Container 
            maxWidth="lg" 
            sx={{ py: 8 }}
          >
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
                  <FeatureCard 
                    elevation={1}
                    ref={(el) => (featureCardsRef.current[index] = el)}
                  >
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
        </Box>

        {/* Featured Products Section */}
        <Box ref={(el) => (sectionsRef.current[1] = el)} sx={{ mb: 10 }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <SectionTitle variant="h4" component="h2">
                Featured Products
              </SectionTitle>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', mt: 2 }}>
                Discover our most popular items that you can try on virtually before purchasing.
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {featuredProducts.map((product, index) => (
                <Grid item xs={12} sm={6} md={3} key={product.id}>
                  <ProductCard ref={(el) => (productCardsRef.current[index] = el)}>
                    <Box sx={{ position: 'relative' }}>
                      <ProductImage
                        image={product.image}
                        title={product.name}
                        ref={(el) => (productImagesRef.current[index] = el)}
                      />
                      <PriceChip
                        label={`$${product.price.toFixed(2)}`}
                        size="medium"
                      />
                    </Box>
                    <CardContent sx={{ 
                      flexGrow: 1, 
                      transform: 'translateZ(20px)',
                      transformStyle: 'preserve-3d'
                    }}>
                      <Typography variant="h6" component="h3" gutterBottom sx={{ 
                        fontWeight: 600,
                        transform: 'translateZ(30px)',
                        transformStyle: 'preserve-3d'
                      }}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        mb: 2,
                        transform: 'translateZ(15px)',
                        transformStyle: 'preserve-3d'
                      }}>
                        {product.description}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        mt: 2,
                        transform: 'translateZ(40px)',
                        transformStyle: 'preserve-3d'
                      }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<ShoppingCartIcon />}
                          onClick={() => handleAddToCart(product)}
                          sx={{
                            transformStyle: 'preserve-3d'
                          }}
                          onMouseEnter={handleButtonEnter}
                          onMouseLeave={handleButtonLeave}
                        >
                          Add to Cart
                        </Button>
                        <IconButton
                          size="small"
                          color={isInWishlist(product.id) ? "secondary" : "default"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWishlistToggle(product);
                          }}
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            bgcolor: 'white',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                            zIndex: 2,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transformStyle: 'preserve-3d'
                          }}
                          onMouseEnter={handleButtonEnter}
                          onMouseLeave={handleButtonLeave}
                        >
                          {isInWishlist(product.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </IconButton>
                      </Box>
                    </CardContent>
                  </ProductCard>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={RouterLink}
                to="/products"
                sx={{ px: 4, py: 1.2 }}
                onMouseEnter={handleButtonEnter}
                onMouseLeave={handleButtonLeave}
              >
                View All Products
              </Button>
            </Box>
          </Container>
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 