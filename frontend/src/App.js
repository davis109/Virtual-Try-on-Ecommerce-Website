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
import TextToClothingTryOn from './pages/TextToClothingTryOn';
import BackgroundAnimation from './components/three/BackgroundAnimation';

// Dark Cyberpunk Theme with neon accents
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00f2ff', // Neon Cyan
      light: '#66ffff',
      dark: '#00b8cc',
      contrastText: '#000000',
    },
    secondary: {
      main: '#fc0fc0', // Neon Pink
      light: '#ff56f3',
      dark: '#c6008f',
      contrastText: '#000000',
    },
    info: {
      main: '#7b68ee', // Medium Slate Blue
      light: '#aa9af7',
      dark: '#4c39e5',
      contrastText: '#ffffff',
    },
    success: {
      main: '#39ff14', // Neon Green
      light: '#78ff5d',
      dark: '#00c800',
      contrastText: '#000000',
    },
    neutral: {
      main: '#8899a6', // Slate Gray
      light: '#b6c5d5',
      dark: '#5d6f7a',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0a0a14', // Very Dark Blue
      paper: '#13131f', // Dark Blue Gray
    },
    text: {
      primary: '#ffffff',
      secondary: '#8899a6',
    },
    error: {
      main: '#ff3e3e', // Bright Red
    },
    warning: {
      main: '#ffbb00', // Bright Yellow
    },
  },
  typography: {
    fontFamily: '"Orbitron", "Rajdhani", "Roboto", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '0.05em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '0.05em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '0.04em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '0.03em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '0.03em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.05em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#6b6b6b #13131f",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#13131f",
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#6b6b6b",
            border: "2px solid #13131f",
          },
          "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
            backgroundColor: "#00f2ff",
          },
          "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#00f2ff",
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          boxShadow: '0 0 10px rgba(0, 242, 255, 0.3)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 8,
            padding: '2px',
            background: 'linear-gradient(45deg, #00f2ff, #fc0fc0)',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            pointerEvents: 'none',
          },
          '&:hover': {
            boxShadow: '0 0 20px rgba(0, 242, 255, 0.6)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease',
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #00f2ff 30%, #81d8f7 90%)',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #fc0fc0 30%, #ff56f3 90%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(to bottom, rgba(20, 20, 31, 0.9), rgba(19, 19, 31, 0.95))',
          boxShadow: '0 8px 32px rgba(0, 242, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 8,
            padding: '1px',
            background: 'linear-gradient(45deg, rgba(0, 242, 255, 0.3), rgba(252, 15, 192, 0.3))',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            pointerEvents: 'none',
            zIndex: 0,
          },
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(0, 242, 255, 0.15)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 15px 30px rgba(0, 242, 255, 0.2)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(0, 242, 255, 0) 70%, rgba(0, 242, 255, 0.4) 100%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
          },
          '&:hover::after': {
            opacity: 1,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          background: 'rgba(10, 10, 20, 0.8)',
          borderBottom: '1px solid rgba(0, 242, 255, 0.2)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: 'rgba(0, 242, 255, 0.2)',
          color: '#00f2ff',
          border: '1px solid rgba(0, 242, 255, 0.3)',
        },
        colorSecondary: {
          backgroundColor: 'rgba(252, 15, 192, 0.2)',
          color: '#fc0fc0',
          border: '1px solid rgba(252, 15, 192, 0.3)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(136, 153, 166, 0.5)',
              transition: 'border-color 0.3s ease',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 242, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00f2ff',
              boxShadow: '0 0 8px rgba(0, 242, 255, 0.3)',
            },
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BackgroundAnimation />
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
          <Route path="/text-to-clothing" element={<TextToClothingTryOn />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 