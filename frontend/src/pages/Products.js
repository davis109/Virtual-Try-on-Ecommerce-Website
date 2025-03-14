import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  TextField,
  MenuItem,
  IconButton,
  CardActions,
  Tooltip,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState('all');
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  // Product data with real images
  useEffect(() => {
    const realProducts = [
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
        id: 3,
        name: 'Black Slim-Fit Jeans',
        price: 59.99,
        category: 'Lower body',
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        description: 'Classic black slim-fit jeans for a modern look.',
      },
      {
        id: 4,
        name: 'Floral Summer Dress',
        price: 89.99,
        category: 'Dress',
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        description: 'Light and breezy floral summer dress, perfect for warm days.',
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
        id: 6,
        name: 'Red Hoodie',
        price: 45.99,
        category: 'Upper body',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        description: 'Comfortable red hoodie for casual wear or workouts.',
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
        id: 8,
        name: 'Striped Button-Up Shirt',
        price: 39.99,
        category: 'Upper body',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        description: 'Classic striped button-up shirt for a smart casual look.',
      },
      {
        id: 9,
        name: 'Denim Skirt',
        price: 34.99,
        category: 'Lower body',
        image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        description: 'Versatile denim skirt that pairs well with any top.',
      }
    ];
    setProducts(realProducts);
    setFilteredProducts(realProducts);
  }, []);

  const handleCategoryChange = (event) => {
    const selectedCategory = event.target.value;
    setCategory(selectedCategory);
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.category === selectedCategory));
    }
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  const handleWishlistToggle = (product) => {
    const isInWishlist = wishlistItems.some(item => item.id === product.id);
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product));
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Our Collection
        </Typography>
        <TextField
          select
          label="Category"
          value={category}
          onChange={handleCategoryChange}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">All Categories</MenuItem>
          <MenuItem value="Upper body">Upper Body</MenuItem>
          <MenuItem value="Lower body">Lower Body</MenuItem>
          <MenuItem value="Dress">Dresses</MenuItem>
        </TextField>
      </Box>

      <Grid container spacing={4}>
        {filteredProducts.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="300"
                  image={product.image}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />
                <Tooltip title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(255, 255, 255, 0.7)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                      },
                    }}
                    onClick={() => handleWishlistToggle(product)}
                  >
                    {isInWishlist(product.id) ? (
                      <FavoriteIcon color="secondary" />
                    ) : (
                      <FavoriteBorderIcon color="secondary" />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {product.description}
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  ${product.price}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleAddToCart(product)}
                  sx={{ mb: 1 }}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  component={RouterLink}
                  to={`/product/${product.id}`}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Products; 