import React, { useEffect, useRef, useState } from 'react';
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
  AutoFixHigh as AutoFixHighIcon
} from '@mui/icons-material';
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
  padding: theme.spacing(20, 0), // Increased vertical padding for more spacious feel
  textAlign: 'center',
  background: 'linear-gradient(135deg, #050729 0%, #0B0F2E 50%, #131638 100%)', // Richer gradient background
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  borderRadius: '0 0 50px 50px', // More pronounced rounded corners
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)', // Deeper shadow
  overflow: 'hidden',
  zIndex: 0,
  '&::before': { // Create a subtle mesh grid overlay effect
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'linear-gradient(rgba(25, 25, 51, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(25, 25, 51, 0.05) 1px, transparent 1px)',
    backgroundSize: '30px 30px',
    backgroundPosition: 'center center',
    zIndex: 1,
  }
}));

const GradientText = styled(Typography)(({ theme }) => ({
  backgroundImage: `linear-gradient(135deg, #FFFFFF 0%, ${theme.palette.info.light} 40%, #E879F9 70%, ${theme.palette.primary.light} 100%)`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 900, // Bolder text
  letterSpacing: '1px', // Wider letter spacing
  textShadow: 'none',
  position: 'relative',
  zIndex: 10, 
  textTransform: 'uppercase',
  '&::before': { // Enhanced inner glow effect
    content: '""',
    position: 'absolute',
    top: -5,
    left: -5,
    width: 'calc(100% + 10px)',
    height: 'calc(100% + 10px)',
    filter: 'blur(20px)',
    backgroundImage: `linear-gradient(135deg, ${theme.palette.info.light} 40%, #E879F9 70%, ${theme.palette.primary.light} 100%)`,
    opacity: 0.5,
    zIndex: -1,
  }
}));

const SubtitleGradientText = styled(Typography)(({ theme }) => ({
  backgroundImage: `linear-gradient(135deg, #fff 10%, #B4EDFC 50%, #89CFF0 100%)`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: 'none',
  letterSpacing: '0.5px', // Improved letter spacing
  position: 'relative',
  zIndex: 10,
  maxWidth: '800px',
  margin: '0 auto',
  fontWeight: 500, // Medium font weight for better readability
  lineHeight: 1.8, // Increased line height for better readability
  fontSize: '1.3rem', // Slightly larger font
}));

const BlobContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  zIndex: 5,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  mixBlendMode: 'soft-light', // Add blend mode for more integrated look
});

const Blob = styled(Box)(({ color, size }) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%', // Organic blob shape instead of circle
  background: color,
  filter: 'blur(70px)', // Increased blur for a softer glow
  opacity: 0.85, // Increased opacity for more vibrant colors
  zIndex: 5,
  mixBlendMode: 'screen',
  transition: 'all 0.8s ease',
  '&:hover': {
    filter: 'blur(60px)',
    opacity: 0.9,
  }
}));

// Adding a new animated glow effect component
const GlowingOrb = styled(Box)(({ size, color }) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: '50%',
  background: `radial-gradient(circle, ${color} 0%, rgba(255,255,255,0) 70%)`,
  filter: 'blur(8px)',
  opacity: 0.7,
  zIndex: 4,
  animation: 'pulse 4s infinite alternate ease-in-out',
  '@keyframes pulse': {
    '0%': { opacity: 0.5, transform: 'scale(0.8)' },
    '100%': { opacity: 0.9, transform: 'scale(1.2)' }
  }
}));

// Creating a cyberpunk-style grid component
const CyberpunkGrid = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: -50,
  left: '-10%',
  width: '120%',
  height: '30%',
  backgroundImage: 'linear-gradient(0deg, rgba(0, 242, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 242, 255, 0.2) 1px, transparent 1px)',
  backgroundSize: '40px 40px',
  transform: 'perspective(500px) rotateX(60deg)',
  transformOrigin: 'bottom',
  opacity: 0.5,
  zIndex: 2,
  animation: 'grid-move 20s linear infinite',
  '@keyframes grid-move': {
    '0%': { backgroundPosition: '0 0' },
    '100%': { backgroundPosition: '40px 40px' }
  }
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
  boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)', // Add glow to stars
  animation: `twinkle ${Math.random() * 3 + 2}s infinite ease-in-out`,
  '@keyframes twinkle': {
    '0%, 100%': { opacity: opacity, transform: 'scale(1)' },
    '50%': { opacity: opacity * 1.5, transform: 'scale(1.1)' }
  }
}));

// Create a milky way cloud component
const MilkyWayCloud = styled(Box)(({ color, size, blur }) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: '50%',
  background: color,
  filter: `blur(${blur}px)`,
  opacity: 0.15, // Increased opacity for more vibrant clouds
  zIndex: 2,
  mixBlendMode: 'screen', // Add better color blending
}));

// Add a shooting star component
const ShootingStar = styled(Box)(({ delay, duration, size }) => ({
  position: 'absolute',
  width: size,
  height: '2px',
  background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%)',
  borderRadius: '50%',
  opacity: 0,
  zIndex: 2,
  animation: `shooting ${duration}s ${delay}s infinite linear`,
  '@keyframes shooting': {
    '0%': { 
      opacity: 0,
      transform: 'translateX(-100px) translateY(100px) rotate(45deg) scale(0.5)'
    },
    '5%': {
      opacity: 1
    },
    '20%': {
      opacity: 1,
      transform: 'translateX(100px) translateY(-100px) rotate(45deg) scale(1)'
    },
    '25%, 100%': {
      opacity: 0,
      transform: 'translateX(200px) translateY(-200px) rotate(45deg) scale(0.5)'
    }
  }
}));

// Add a new animated wave component for the hero background
const AnimatedWave = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '200%',
  height: '45%',
  backgroundImage: 'linear-gradient(to top, rgba(10, 12, 32, 0.8) 0%, rgba(10, 12, 32, 0.1) 100%)',
  opacity: 0.6,
  zIndex: 2,
  transform: 'rotate(1deg) translateY(50%)',
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='.25' fill='%23ffffff'/%3E%3Cpath d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z' opacity='.5' fill='%233b82f6'/%3E%3Cpath d='M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z' fill='%238b5cf6' opacity='.3'/%3E%3C/svg%3E")`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    animation: 'wave 25s linear infinite',
    '@keyframes wave': {
      '0%': { transform: 'translateX(0)' },
      '50%': { transform: 'translateX(-50%)' },
      '100%': { transform: 'translateX(0)' }
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '10%',
    left: '5%',
    width: '100%',
    height: '100%',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z' fill='%230ea5e9' opacity='.2'/%3E%3C/svg%3E")`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    animation: 'wave-reverse 30s linear infinite',
    '@keyframes wave-reverse': {
      '0%': { transform: 'translateX(0)' },
      '50%': { transform: 'translateX(50%)' },
      '100%': { transform: 'translateX(0)' }
    }
  }
}));

// Add a floating tag badges component
const FeatureBadge = styled(Box)(({ theme, color }) => ({
  backgroundColor: `rgba(${color}, 0.15)`,
  border: `1px solid rgba(${color}, 0.3)`,
  borderRadius: '50px',
  padding: theme.spacing(0.75, 2),
  margin: theme.spacing(0.5),
  display: 'inline-flex',
  alignItems: 'center',
  color: 'white',
  fontSize: '0.85rem',
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
    backgroundColor: `rgba(${color}, 0.25)`,
  }
}));

// Add a particle component for interactive background
const ParticleContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  zIndex: 3
});

const Particle = styled(Box)(({ size, color }) => ({
  position: 'absolute',
  width: size,
  height: size,
  backgroundColor: color,
  borderRadius: '50%',
  opacity: 0.5,
  pointerEvents: 'none'
}));

// Add an animated mouse indicator component
const MouseIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '15%',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 20,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  opacity: 0.8,
  transition: 'opacity 0.3s ease',
  animation: 'fadeInUp 1.5s ease-out forwards 2s',
  '@keyframes fadeInUp': {
    '0%': { opacity: 0, transform: 'translate(-50%, 20px)' },
    '100%': { opacity: 0.8, transform: 'translate(-50%, 0)' }
  },
  '&:hover': {
    opacity: 1
  }
}));

const MouseIcon = styled(Box)(({ theme }) => ({
  width: '26px',
  height: '42px',
  border: '2px solid rgba(255, 255, 255, 0.6)',
  borderRadius: '20px',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    top: '8px',
    left: '50%',
    transform: 'translateX(-50%)',
    animation: 'mouse-scroll 2s infinite',
    '@keyframes mouse-scroll': {
      '0%': { opacity: 1, top: '8px' },
      '50%': { opacity: 0.5, top: '20px' },
      '100%': { opacity: 0, top: '32px' }
    }
  }
}));

const Home = () => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  
  // State for animated headline text
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Array of headlines to cycle through
  const headlines = [
    "Experience The Future Of Shopping",
    "Transform Your Style Virtually",
    "Try Before You Buy, Digitally",
    "Reimagine Fashion Shopping",
    "See How Clothes Fit You"
  ];
  
  // Array of subtitles to cycle through
  const subtitles = [
    "Our AI-powered virtual try-on technology lets you see exactly how clothes will look on you before buying.",
    "Advanced algorithms create realistic visualizations of outfits on your body shape and size.",
    "Eliminate uncertainty and reduce returns with our virtual fitting room technology.",
    "Save time and shop confidently with AI-powered clothing visualization.",
    "Browse, try on, and purchase - all from the comfort of your home."
  ];
  
  // Effect to cycle through headlines at intervals
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        
        // Animate current text out
        const headlineElement = document.querySelector('.animated-headline');
        const subtitleElement = document.querySelector('.animated-subtitle');
        
        if (headlineElement && subtitleElement) {
          // Animation sequence
          gsap.timeline()
            .to(headlineElement, {
              opacity: 0,
              y: -20,
              duration: 0.5,
              ease: "power2.out",
              onComplete: () => {
                // Update text indices
                setHeadlineIndex((prev) => (prev + 1) % headlines.length);
                setSubtitleIndex((prev) => (prev + 1) % subtitles.length);
                
                // Animate new text in
                gsap.timeline()
                  .set(headlineElement, { y: 20 })
                  .set(subtitleElement, { y: 20 })
                  .to(headlineElement, {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "power2.out",
                  })
                  .to(subtitleElement, {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "power2.out",
                    onComplete: () => {
                      setIsAnimating(false);
                    }
                  }, "-=0.3");
              }
            })
            .to(subtitleElement, {
              opacity: 0,
              y: -20,
              duration: 0.5,
              ease: "power2.out",
            }, "-=0.3");
        }
      }
    }, 7000); // Change text every 7 seconds
    
    return () => clearInterval(interval);
  }, [isAnimating, headlines.length, subtitles.length]);
  
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
  const particlesRef = useRef([]);
  
  // Create particles and add mouse interaction
  useEffect(() => {
    // Create particles
    const particles = particlesRef.current;
    if (particles.length > 0 && heroBackgroundRef.current) {
      const heroSection = heroBackgroundRef.current;
      
      // Create mouse move handler to animate particles
      const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const rect = heroSection.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        // Calculate distance from mouse to center
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Animate each particle based on mouse position
        particles.forEach((particle, index) => {
          if (!particle) return;
          
          // Calculate movement factors based on particle position
          const particleRect = particle.getBoundingClientRect();
          const particleX = particleRect.left - rect.left + particleRect.width / 2;
          const particleY = particleRect.top - rect.top + particleRect.height / 2;
          
          // Distance factor - farther particles move less
          const distanceX = (particleX - x) / 20;
          const distanceY = (particleY - y) / 20;
          
          // Move particles away from mouse with varying intensity
          const moveX = distanceX * (0.5 + Math.random() * 0.5) * (index % 3 === 0 ? 1.5 : 1);
          const moveY = distanceY * (0.5 + Math.random() * 0.5) * (index % 2 === 0 ? 1.5 : 1);
          
          // Apply movement with GSAP
          gsap.to(particle, {
            x: `+=${moveX}`,
            y: `+=${moveY}`,
            opacity: 0.7,
            duration: 2,
            ease: "power2.out"
          });
        });
      };
      
      // Gently animate particles on intervals for ambient movement
      const animateParticles = () => {
        particles.forEach((particle, index) => {
          if (!particle) return;
          
          gsap.to(particle, {
            x: `+=${Math.random() * 20 - 10}`,
            y: `+=${Math.random() * 20 - 10}`,
            duration: 3 + Math.random() * 2,
            ease: "sine.inOut",
            onComplete: () => {
              if (particle) {
                gsap.to(particle, {
                  x: 0,
                  y: 0,
                  duration: 3 + Math.random() * 2,
                  ease: "sine.inOut"
                });
              }
            }
          });
        });
      };
      
      // Set up event listeners
      heroSection.addEventListener('mousemove', handleMouseMove);
      
      // Start ambient animation
      const ambientAnimationInterval = setInterval(animateParticles, 5000);
      
      // Initial ambient animation
      animateParticles();
      
      // Cleanup function
      return () => {
        heroSection.removeEventListener('mousemove', handleMouseMove);
        clearInterval(ambientAnimationInterval);
      };
    }
  }, []);
  
  // Generate interactive particles
  const generateParticles = () => {
    const particles = [];
    const particleCount = 30;
    const colors = ['#4F46E5', '#06B6D4', '#F43F5E', '#22C55E', '#D946EF', '#FFFFFF'];
    
    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 6 + 3; // 3-9px
      const color = colors[Math.floor(Math.random() * colors.length)];
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      
      particles.push(
        <Particle
          key={`particle-${i}`}
          size={`${size}px`}
          color={color}
          sx={{
            top: `${top}%`,
            left: `${left}%`,
            boxShadow: `0 0 ${size * 2}px ${color}`,
          }}
          ref={el => particlesRef.current[i] = el}
        />
      );
    }
    
    return particles;
  };
  
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

  // Generate stars for the space background
  const generateStars = () => {
    const stars = [];
    // Create more stars for a denser effect
    for (let i = 0; i < 300; i++) { 
      // Vary star sizes more dramatically
      const size = Math.random() < 0.8 
        ? Math.random() * 2 + 1 // 80% are small (1-3px)
        : Math.random() * 4 + 3; // 20% are larger (3-7px)
      
      // Vary star brightness for more realism
      const opacity = Math.random() * 0.7 + 0.3; 
      
      // Create colored stars occasionally
      const hasColor = Math.random() < 0.2; // 20% of stars have color
      const colors = ['#FFD700', '#FF8F8F', '#8FFFFF', '#FFFFFF', '#C0FFFF']; // Gold, pink, light blue, white, cyan
      const color = hasColor ? colors[Math.floor(Math.random() * colors.length)] : '#FFFFFF';
      
      // Add some stars with glow effect
      const hasGlow = size > 2.5 && Math.random() < 0.6; // Larger stars have glow
      const glowIntensity = hasGlow ? `0 0 ${Math.floor(size * 3)}px ${color}` : 'none';
      
      stars.push(
        <Star 
          key={`star-${i}`}
          size={`${size}px`}
          opacity={opacity}
          sx={{ 
            top: `${Math.random() * 100}%`, 
            left: `${Math.random() * 100}%`,
            backgroundColor: color,
            boxShadow: glowIntensity,
            animation: `twinkle ${Math.random() * 5 + 2}s infinite ${Math.random() * 5}s ease-in-out`
          }}
          ref={el => starsRef.current[i] = el}
        />
      );
    }
    return stars;
  };
  
  // Generate improved milky way clouds for a more vibrant cosmic background
  const generateMilkyWayClouds = () => {
    const clouds = [];
    // More diverse color palette for cosmic nebula effect
    const colors = [
      'radial-gradient(circle, rgba(138, 43, 226, 0.6) 0%, rgba(138, 43, 226, 0.2) 70%, rgba(138, 43, 226, 0) 100%)', // Purple
      'radial-gradient(circle, rgba(75, 0, 130, 0.6) 0%, rgba(75, 0, 130, 0.2) 70%, rgba(75, 0, 130, 0) 100%)', // Indigo
      'radial-gradient(circle, rgba(0, 150, 255, 0.5) 0%, rgba(0, 150, 255, 0.2) 70%, rgba(0, 150, 255, 0) 100%)', // Blue
      'radial-gradient(circle, rgba(106, 90, 205, 0.6) 0%, rgba(106, 90, 205, 0.2) 70%, rgba(106, 90, 205, 0) 100%)', // Slate blue
      'radial-gradient(circle, rgba(147, 112, 219, 0.6) 0%, rgba(147, 112, 219, 0.2) 70%, rgba(147, 112, 219, 0) 100%)', // Medium purple
      'radial-gradient(circle, rgba(221, 160, 221, 0.4) 0%, rgba(221, 160, 221, 0.2) 70%, rgba(221, 160, 221, 0) 100%)', // Plum
      'radial-gradient(circle, rgba(238, 130, 238, 0.4) 0%, rgba(238, 130, 238, 0.2) 70%, rgba(238, 130, 238, 0) 100%)', // Violet
      'radial-gradient(circle, rgba(216, 191, 216, 0.3) 0%, rgba(216, 191, 216, 0.1) 70%, rgba(216, 191, 216, 0) 100%)', // Thistle
      'radial-gradient(circle, rgba(255, 110, 180, 0.4) 0%, rgba(255, 110, 180, 0.2) 70%, rgba(255, 110, 180, 0) 100%)', // Hot pink
      'radial-gradient(circle, rgba(70, 130, 180, 0.5) 0%, rgba(70, 130, 180, 0.2) 70%, rgba(70, 130, 180, 0) 100%)' // Steel blue
    ];
    
    // Create more cloud variations for a rich cosmic background
    for (let i = 0; i < 12; i++) { 
      // Vary cloud sizes dramatically for depth
      const size = Math.random() * 900 + 300; // 300-1200px for varying scales
      
      // Vary blur levels for different cloud densities
      const blur = Math.random() * 100 + 40; // 40-140px
      
      // Different blending modes for some clouds
      const blendModes = ['screen', 'soft-light', 'lighten'];
      const blendMode = blendModes[Math.floor(Math.random() * blendModes.length)];
      
      // Add rotation for more organic feel
      const rotation = Math.random() * 360; // 0-360 degrees
      
      clouds.push(
        <MilkyWayCloud
          key={`cloud-${i}`}
          color={colors[i % colors.length]}
          size={`${size}px`}
          blur={blur}
          sx={{
            mixBlendMode: blendMode,
            transform: `rotate(${rotation}deg)`,
            opacity: Math.random() * 0.15 + 0.05 // Vary cloud opacity
          }}
          ref={el => milkyWayCloudsRef.current[i] = el}
        />
      );
    }
    return clouds;
  };
  
  // Generate more dynamic shooting stars for the hero background
  const generateShootingStars = () => {
    const shootingStars = [];
    for (let i = 0; i < 8; i++) { // Increased number of shooting stars
      const delay = Math.random() * 20; // Random delay up to 20s
      const duration = Math.random() * 3 + 2; // 2-5s duration
      const size = Math.random() * 150 + 100; // 100-250px length
      const top = Math.random() * 70; // Positioned in top 70% of the hero
      const left = Math.random() * 80; // Positioned across 80% of the hero
      const angle = Math.random() * 60 - 30; // Varied angle between -30 and 30 degrees
      const brightness = Math.random() * 0.4 + 0.6; // Varied brightness
      
      shootingStars.push(
        <ShootingStar
          key={`shooting-star-${i}`}
          delay={delay}
          duration={duration}
          size={`${size}px`}
          sx={{
            top: `${top}%`,
            left: `${left}%`,
            transform: `rotate(${45 + angle}deg)`,
            opacity: brightness
          }}
        />
      );
    }
    return shootingStars;
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section with milky way background and blurry blobs */}
      <HeroSection ref={heroBackgroundRef}>
        {/* Milky Way Background */}
        <MilkyWayContainer>
          {generateStars()}
          {generateMilkyWayClouds()}
          {generateShootingStars()}
        </MilkyWayContainer>
        
        {/* Interactive Particles Layer */}
        <ParticleContainer>
          {generateParticles()}
        </ParticleContainer>
        
        {/* Cyberpunk Grid */}
        <CyberpunkGrid />
        
        {/* Animated Wave Background */}
        <AnimatedWave />
        
        {/* Blob Container */}
        <BlobContainer>
          <Blob 
            color="linear-gradient(135deg, #4F46E5 0%, #7E22CE 100%)" // Electric purple/blue
            size="600px" 
            sx={{ top: '45%', left: '50%', transform: 'translate(-70%, -60%)' }}
            ref={el => blobsRef.current[0] = el}
          />
          <Blob 
            color="linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)" // Vibrant red
            size="550px" 
            sx={{ top: '40%', left: '55%', transform: 'translate(30%, -30%)' }}
            ref={el => blobsRef.current[1] = el}
          />
          <Blob 
            color="linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)" // Cyan blue
            size="500px" 
            sx={{ top: '60%', left: '40%', transform: 'translate(-40%, 20%)' }}
            ref={el => blobsRef.current[2] = el}
          />
          <Blob 
            color="linear-gradient(135deg, #22C55E 0%, #16A34A 100%)" // Vibrant green
            size="450px" 
            sx={{ top: '65%', left: '60%', transform: 'translate(20%, 40%)' }}
            ref={el => blobsRef.current[3] = el}
          />
          <Blob 
            color="linear-gradient(135deg, #D946EF 0%, #C026D3 100%)" // Bright magenta
            size="400px" 
            sx={{ top: '50%', left: '50%', transform: 'translate(0%, 0%)' }}
            ref={el => blobsRef.current[4] = el}
          />
        </BlobContainer>
        
        {/* Glowing Orbs */}
        <GlowingOrb size="100px" color="rgba(255, 255, 255, 0.8)" sx={{ top: '30%', left: '25%' }} />
        <GlowingOrb size="80px" color="rgba(14, 165, 233, 0.8)" sx={{ top: '20%', right: '20%' }} />
        <GlowingOrb size="120px" color="rgba(217, 70, 239, 0.8)" sx={{ bottom: '25%', right: '30%' }} />
        
        <Container maxWidth="md" ref={heroRef}>
          <GradientText 
            variant="h2" 
            component="h1" 
            gutterBottom
            className="animated-headline"
            sx={{ 
              mb: 3,
              fontSize: { xs: '2.8rem', sm: '3.8rem', md: '4.5rem' },
              opacity: 0, // Start invisible for animation
              position: 'relative',
              zIndex: 10, // Ensure text is above blobs
              textShadow: '0 5px 30px rgba(0, 0, 0, 0.3)',
              minHeight: { xs: '85px', sm: '120px', md: '135px' }, // Prevent layout shift
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {headlines[headlineIndex]}
          </GradientText>
          <SubtitleGradientText 
            variant="h5" 
            paragraph
            className="animated-subtitle"
            sx={{ 
              maxWidth: 700, 
              mx: 'auto', 
              mb: 3,
              fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' },
              fontWeight: 400,
              lineHeight: 1.6,
              opacity: 0, // Start invisible for animation
              position: 'relative',
              zIndex: 10,
              minHeight: { xs: '60px', sm: '72px', md: '80px' } // Prevent layout shift
            }}
          >
            {subtitles[subtitleIndex]}
          </SubtitleGradientText>
          
          {/* Additional descriptive text */}
          <Box 
            sx={{ 
              maxWidth: 750, 
              mx: 'auto', 
              mb: 3, 
              opacity: 0,  // Start invisible for animation
              position: 'relative',
              zIndex: 10,
              animation: 'fadeIn 1s ease forwards 1.2s',
              '@keyframes fadeIn': {
                '0%': { opacity: 0, transform: 'translateY(20px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            <Typography variant="body1" color="white" sx={{ fontSize: '1.05rem', textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)', mb: 3, opacity: 0.85 }}>
              Wave goodbye to fitting room frustrations and online shopping uncertainties. Our state-of-the-art
              technology creates a personalized shopping experience that's both fun and practical.
              Try before you buy — without leaving your home.
            </Typography>
            
            {/* Feature badges */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
              <FeatureBadge color="0, 242, 255">
                <CheckCircleOutline sx={{ fontSize: 16, mr: 0.5 }} /> Perfect Fit Guarantee
              </FeatureBadge>
              <FeatureBadge color="252, 15, 192">
                <CheckCircleOutline sx={{ fontSize: 16, mr: 0.5 }} /> Advanced AI Technology
              </FeatureBadge>
              <FeatureBadge color="34, 197, 94">
                <CheckCircleOutline sx={{ fontSize: 16, mr: 0.5 }} /> Reduced Returns
              </FeatureBadge>
              <FeatureBadge color="79, 70, 229">
                <CheckCircleOutline sx={{ fontSize: 16, mr: 0.5 }} /> Eco-Friendly Shopping
              </FeatureBadge>
            </Box>
          </Box>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent="center"
            sx={{ mt: 5, position: 'relative', zIndex: 10 }}
          >
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={RouterLink}
              to="/virtual-tryon"
              startIcon={<CheckroomIcon />}
              sx={{ 
                py: 1.8, 
                px: 5, 
                fontSize: '1.2rem',
                fontWeight: 700,
                borderRadius: '12px',
                boxShadow: '0 15px 30px rgba(0,0,0,0.3), 0 0 20px rgba(0, 242, 255, 0.3)',
                background: 'linear-gradient(45deg, #4F46E5 0%, #7E22CE 100%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(0, 242, 255, 0.4)',
                },
                opacity: 0 // Start invisible for animation
              }}
              onMouseEnter={handleButtonEnter}
              onMouseLeave={handleButtonLeave}
            >
              Try On Now
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              component={RouterLink}
              to="/products"
              startIcon={<ShoppingCartIcon />}
              sx={{ 
                py: 1.8, 
                px: 5, 
                fontSize: '1.2rem',
                fontWeight: 700,
                borderRadius: '12px',
                borderWidth: '2px',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
                opacity: 0 // Start invisible for animation
              }}
              onMouseEnter={handleButtonEnter}
              onMouseLeave={handleButtonLeave}
            >
              Browse Collection
            </Button>
          </Stack>
          
          {/* Mouse interaction indicator */}
          <MouseIndicator>
            <MouseIcon />
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                mt: 1, 
                fontSize: '0.75rem', 
                letterSpacing: 1,
                textTransform: 'uppercase'
              }}
            >
              Move Mouse to Interact
            </Typography>
          </MouseIndicator>
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
                    height: 420, // Increased height for more content
                    borderRadius: 3, // More rounded corners
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)', // Deeper shadow
                    background: 'linear-gradient(135deg, #13172b 0%, #1f2442 100%)',
                    transition: 'transform 0.4s ease-in-out, box-shadow 0.4s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-10px) scale(1.02)',
                      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(0, 242, 255, 0.15), transparent 40%), radial-gradient(circle at 80% 80%, rgba(252, 15, 192, 0.15), transparent 40%)',
                      zIndex: 1
                    }
                  }}
                >
                  {/* Animated tech circuit lines */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0.4,
                      zIndex: 2,
                      background: 'url(/images/tech-circuit.svg)',
                      backgroundSize: 'cover',
                      animation: 'pulse 10s infinite linear',
                      '@keyframes pulse': {
                        '0%': { opacity: 0.3 },
                        '50%': { opacity: 0.5 },
                        '100%': { opacity: 0.3 }
                      }
                    }}
                  />
                  
                  {/* Floating particles */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      zIndex: 2,
                      overflow: 'hidden'
                    }}
                  >
                    {[...Array(10)].map((_, i) => (
                      <Box
                        key={i}
                        sx={{
                          position: 'absolute',
                          width: i % 3 === 0 ? '8px' : i % 3 === 1 ? '5px' : '3px',
                          height: i % 3 === 0 ? '8px' : i % 3 === 1 ? '5px' : '3px',
                          backgroundColor: i % 2 === 0 ? '#00f2ff' : '#fc0fc0',
                          borderRadius: '50%',
                          opacity: 0.6,
                          top: `${Math.floor(Math.random() * 100)}%`,
                          left: `${Math.floor(Math.random() * 100)}%`,
                          animation: `float-${i % 5} ${5 + i * 2}s infinite ease-in-out`,
                          '@keyframes float-0': {
                            '0%, 100%': { transform: 'translate(0, 0)' },
                            '50%': { transform: 'translate(20px, 20px)' }
                          },
                          '@keyframes float-1': {
                            '0%, 100%': { transform: 'translate(0, 0)' },
                            '50%': { transform: 'translate(-25px, 30px)' }
                          },
                          '@keyframes float-2': {
                            '0%, 100%': { transform: 'translate(0, 0)' },
                            '50%': { transform: 'translate(30px, -25px)' }
                          },
                          '@keyframes float-3': {
                            '0%, 100%': { transform: 'translate(0, 0)' },
                            '50%': { transform: 'translate(-20px, -20px)' }
                          },
                          '@keyframes float-4': {
                            '0%, 100%': { transform: 'translate(0, 0)' },
                            '50%': { transform: 'translate(25px, 10px)' }
                          }
                        }}
                      />
                    ))}
                  </Box>
                  
                  {/* Content container */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      zIndex: 3,
                      padding: 3
                    }}
                  >
                    {/* Header section */}
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Typography
                        variant="h3"
                        component="h3"
                        sx={{
                          fontSize: { xs: '1.8rem', sm: '2.5rem' },
                          fontWeight: 800,
                          letterSpacing: '0.5px',
                          textShadow: '0 2px 15px rgba(0,0,0,0.5)',
                          mb: 1,
                          background: 'linear-gradient(90deg, #00f2ff, #fc0fc0)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        Text to Clothing
                      </Typography>
                      
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: 'white',
                          opacity: 0.9,
                          fontWeight: 400,
                          textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                          mb: 1,
                          maxWidth: '90%',
                          mx: 'auto'
                        }}
                      >
                        Describe any clothing and try it on instantly
                      </Typography>
                    </Box>
                    
                    {/* Modern UI mockup */}
                    <Box 
                      sx={{ 
                        width: '100%',
                        maxWidth: 450,
                        backgroundColor: 'rgba(20, 20, 35, 0.65)',
                        borderRadius: 4,
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25), inset 0 0 30px rgba(0, 242, 255, 0.05)',
                        p: 2.5,
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Input area with typing animation */}
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          mb: 2.5,
                          position: 'relative'
                        }}
                      >
                        <Typography
                          sx={{
                            color: '#00f2ff',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          <AutoFixHighIcon fontSize="small" /> Describe your dream clothing:
                        </Typography>
                        
                        <Box 
                          sx={{ 
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(0, 242, 255, 0.2)',
                            borderRadius: 2,
                            p: 1.5,
                            position: 'relative'
                          }}
                        >
                          <Typography
                            sx={{
                              color: 'white',
                              fontFamily: 'monospace',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              width: '100%',
                              animation: 'typing 3.5s steps(40, end), blink-caret .75s step-end infinite',
                              '@keyframes typing': {
                                'from': { width: '0' }
                              },
                              '@keyframes blink-caret': {
                                'from, to': { borderColor: 'transparent' },
                                '50%': { borderColor: 'white' }
                              },
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                right: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '2px',
                                height: '1.2em',
                                backgroundColor: '#00f2ff',
                                animation: 'blink 1s infinite',
                                '@keyframes blink': {
                                  '0%, 100%': { opacity: 0 },
                                  '50%': { opacity: 1 }
                                }
                              }
                            }}
                          >
                            A red floral t-shirt with short sleeves
                          </Typography>
                        </Box>
                        
                        {/* AI Processing animation */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: -10,
                            left: 0,
                            width: '100%',
                            height: '2px',
                            overflow: 'hidden'
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: '30%',
                              background: 'linear-gradient(90deg, transparent, #00f2ff, #fc0fc0, transparent)',
                              animation: 'loading 1.5s infinite',
                              '@keyframes loading': {
                                '0%': { marginLeft: '-30%' },
                                '100%': { marginLeft: '130%' }
                              }
                            }}
                          />
                        </Box>
                      </Box>
                      
                      {/* Result display with before/after comparison */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 2
                        }}
                      >
                        {/* Original model */}
                        <Box
                          sx={{
                            flex: 1,
                            borderRadius: 3,
                            overflow: 'hidden',
                            height: 160,
                            position: 'relative',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.3)'
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              backgroundColor: 'rgba(0, 0, 0, 0.6)',
                              color: 'white',
                              fontSize: '0.75rem',
                              p: 0.5,
                              borderBottomRightRadius: 8
                            }}
                          >
                            Model
                          </Box>
                          
                          <Box 
                            component="img"
                            src="/images/person-silhouette.png"
                            alt="Person silhouette"
                            sx={{ 
                              height: '85%', 
                              width: '85%',
                              objectFit: 'contain',
                              opacity: 0.8
                            }}
                          />
                        </Box>
                        
                        {/* AI-generated outfit on model */}
                        <Box
                          sx={{
                            flex: 1,
                            borderRadius: 3,
                            overflow: 'hidden',
                            height: 160,
                            position: 'relative',
                            border: '1px solid rgba(0, 242, 255, 0.2)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(252, 15, 192, 0.1) 100%)',
                            boxShadow: 'inset 0 0 20px rgba(252, 15, 192, 0.15)'
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              backgroundColor: 'rgba(0, 0, 0, 0.6)',
                              color: '#fc0fc0',
                              fontSize: '0.75rem',
                              p: 0.5,
                              borderBottomRightRadius: 8
                            }}
                          >
                            Result
                          </Box>
                          
                          <Box 
                            component="img"
                            src="/images/model-with-red-shirt.png"
                            alt="Person with red floral shirt"
                            sx={{ 
                              height: '85%', 
                              width: '85%',
                              objectFit: 'contain',
                              animation: 'fadeIn 1s ease-out',
                              '@keyframes fadeIn': {
                                '0%': { opacity: 0 },
                                '100%': { opacity: 1 }
                              }
                            }}
                          />
                          
                          {/* AI indicators */}
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 5,
                              right: 5,
                              display: 'flex',
                              gap: 0.5
                            }}
                          >
                            {[...Array(3)].map((_, i) => (
                              <Box
                                key={i}
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  backgroundColor: i === 0 ? '#00f2ff' : i === 1 ? '#fc0fc0' : '#9d4edd',
                                  animation: `pulse-dot-${i} 1.5s infinite`,
                                  animationDelay: `${i * 0.3}s`,
                                  '@keyframes pulse-dot-0': {
                                    '0%, 100%': { opacity: 0.3 },
                                    '50%': { opacity: 1 }
                                  },
                                  '@keyframes pulse-dot-1': {
                                    '0%, 100%': { opacity: 0.3 },
                                    '50%': { opacity: 1 }
                                  },
                                  '@keyframes pulse-dot-2': {
                                    '0%, 100%': { opacity: 0.3 },
                                    '50%': { opacity: 1 }
                                  }
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    
                    {/* CTA Button */}
                    <Button
                      variant="contained"
                      color="secondary"
                      component={RouterLink}
                      to="/text-to-clothing"
                      startIcon={<AutoFixHighIcon />}
                      sx={{ 
                        mt: 3,
                        px: 4,
                        py: 1.2,
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #00f2ff 0%, #fc0fc0 100%)',
                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 242, 255, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 8,
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        '&:hover': {
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 242, 255, 0.4)',
                          transform: 'translateY(-3px) scale(1.02)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Try It Now
                    </Button>
                  </Box>
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