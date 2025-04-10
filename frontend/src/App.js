import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import VirtualTryOn from './pages/VirtualTryOn';
import Wishlist from './pages/Wishlist';

// Coolors palette: https://coolors.co/fc440f-1effbc-7c9299-1f01b9-b4e33d
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1F01B9', // Duke Blue
      light: '#5232e8',
      dark: '#14018a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FC440F', // Orioles Orange
      light: '#ff6f3c',
      dark: '#c93000',
      contrastText: '#ffffff',
    },
    info: {
      main: '#1EFFBC', // Aquamarine
      light: '#6fffcf',
      dark: '#00cc96',
      contrastText: '#000000',
    },
    success: {
      main: '#B4E33D', // Yellow-Green
      light: '#cfff71',
      dark: '#8fb000',
      contrastText: '#000000',
    },
    neutral: {
      main: '#7C9299', // Light Slate Gray
      light: '#a6c0c8',
      dark: '#54666c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#7C9299',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #1F01B9 30%, #5232e8 90%)',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #FC440F 30%, #ff6f3c 90%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#1F01B920',
          color: '#1F01B9',
        },
        colorSecondary: {
          backgroundColor: '#FC440F20',
          color: '#FC440F',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/virtual-tryon" element={<VirtualTryOn />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 