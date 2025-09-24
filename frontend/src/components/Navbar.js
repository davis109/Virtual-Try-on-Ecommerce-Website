import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Container,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Menu as MenuIcon, 
  ShoppingCart as CartIcon, 
  Person as AccountIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Home as HomeIcon,
  Category as CategoryIcon,
  Checkroom as CheckroomIcon,
  Favorite as FavoriteIcon,
  AutoFixHigh as MagicWandIcon,
  Close as CloseIcon,
  AutoAwesome
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { animateNavItems, buttonEnter, buttonLeave, linkEnter, linkLeave, animateLogo } from '../utils/animations';

const Navbar = () => {
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navRef = useRef(null);
  const buttonsRef = useRef([]);
  const iconButtonsRef = useRef([]);
  const logoRef = useRef(null);
  
  // Set up refs for animations
  useEffect(() => {
    if (!isMobile && navRef.current) {
      // Animate navigation items when component mounts
      animateNavItems(buttonsRef.current);
    }
    
    // Animate the logo
    if (logoRef.current) {
      // Delay the logo animation to make it appear after initial load
      setTimeout(() => {
        animateLogo(logoRef.current);
      }, 3000);
    }
  }, [isMobile]);
  
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };
  
  const handleButtonEnter = (e) => {
    buttonEnter(e.currentTarget);
  };
  
  const handleButtonLeave = (e) => {
    buttonLeave(e.currentTarget);
  };
  
  const handleIconEnter = (e) => {
    linkEnter(e.currentTarget);
  };
  
  const handleIconLeave = (e) => {
    linkLeave(e.currentTarget);
  };
  
  const navItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Products', icon: <CategoryIcon />, path: '/products' },
    { text: 'VITON', icon: <CheckroomIcon />, path: '/virtual-tryon' },
    { text: 'Text to Clothing', icon: <MagicWandIcon />, path: '/text-to-clothing' },
    { text: 'Style Polling', icon: <FavoriteIcon />, path: '/style-polling' },
    { text: 'Style Advisor', icon: <AutoAwesome />, path: '/style-advisor' },
    { text: 'Wishlist', icon: <FavoriteIcon />, path: '/wishlist' },
  ];
  
  const drawer = (
    <Box sx={{ width: 280 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          VITON
        </Typography>
        <IconButton onClick={toggleDrawer(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {navItems.map((item, index) => (
          <ListItem 
            button 
            key={item.text} 
            component={RouterLink} 
            to={item.path}
            sx={{
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              '&:hover': {
                bgcolor: 'rgba(63, 81, 181, 0.08)',
              }
            }}
            onMouseEnter={handleButtonEnter}
            onMouseLeave={handleButtonLeave}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
              onMouseEnter={handleIconEnter}
              onMouseLeave={handleIconLeave}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h5"
            component={RouterLink}
            to="/"
            sx={{
              fontWeight: 'bold',
              textDecoration: 'none',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.3s ease, opacity 0.3s ease',
              '&:hover': {
                opacity: 0.9,
                transform: 'translateY(-2px)'
              }
            }}
          >
            <CheckroomIcon sx={{ mr: 1, fontSize: 28 }} ref={logoRef} />
            VITON
          </Typography>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }} ref={navRef}>
              {navItems.map((item, index) => (
                <Button
                  key={item.text}
                  color="inherit"
                  component={RouterLink}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{ 
                    fontWeight: 500,
                    mx: 0.5,
                    opacity: 0, // Start with opacity 0 for animation
                    '&:hover': {
                      bgcolor: 'rgba(63, 81, 181, 0.08)',
                    }
                  }}
                  onMouseEnter={handleButtonEnter}
                  onMouseLeave={handleButtonLeave}
                  ref={(el) => buttonsRef.current[index] = el}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="primary"
              component={RouterLink}
              to="/wishlist"
              sx={{ 
                mx: 0.5,
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  transform: 'scale(0)',
                },
                '&:hover::after': {
                  opacity: 1,
                  transform: 'scale(2)',
                  transition: 'transform 0.5s ease, opacity 0.3s ease',
                }
              }}
              onMouseEnter={handleIconEnter}
              onMouseLeave={handleIconLeave}
              ref={(el) => iconButtonsRef.current[0] = el}
            >
              <Badge badgeContent={wishlistItems.length} color="secondary">
                <FavoriteIcon />
              </Badge>
            </IconButton>
            <IconButton
              color="primary"
              component={RouterLink}
              to="/cart"
              sx={{ 
                mx: 0.5,
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  transform: 'scale(0)',
                },
                '&:hover::after': {
                  opacity: 1,
                  transform: 'scale(2)',
                  transition: 'transform 0.5s ease, opacity 0.3s ease',
                }
              }}
              onMouseEnter={handleIconEnter}
              onMouseLeave={handleIconLeave}
              ref={(el) => iconButtonsRef.current[1] = el}
            >
              <Badge badgeContent={cartItems.length} color="secondary">
                <CartIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navbar; 