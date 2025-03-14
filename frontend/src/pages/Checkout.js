import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Alert,
  Paper,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';

// Simplified payment form that doesn't require actual Stripe integration
const PaymentForm = ({ onPaymentSuccess, shippingInfo, amount }) => {
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!cardComplete) {
      setError('Please complete your card details');
      return;
    }

    setProcessing(true);

    try {
      // For demo purposes, we'll simulate a successful payment
      setTimeout(() => {
        setProcessing(false);
        onPaymentSuccess();
      }, 2000);
    } catch (err) {
      setError('Payment processing failed. Please try again.');
      setProcessing(false);
    }
  };

  // Mock card element that doesn't require Stripe
  const MockCardElement = () => (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 2, 
        border: '1px solid #e0e0e0', 
        borderRadius: 1,
        '&:focus-within': {
          borderColor: 'primary.main',
        }
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Card Number"
            placeholder="4242 4242 4242 4242"
            variant="standard"
            onChange={() => setCardComplete(true)}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Expiry Date"
            placeholder="MM/YY"
            variant="standard"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="CVC"
            placeholder="123"
            variant="standard"
          />
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Payment Details
      </Typography>
      <Box sx={{ mb: 3 }}>
        <MockCardElement />
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={processing}
        sx={{ mt: 2 }}
      >
        {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
};

const steps = ['Shipping Information', 'Payment Details', 'Review Order'];

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, total } = useSelector((state) => state.cart);
  const [activeStep, setActiveStep] = useState(0);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    // Redirect to cart if cart is empty
    if (items.length === 0 && !orderComplete) {
      navigate('/cart');
    }
  }, [items, navigate, orderComplete]);

  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handlePaymentSuccess = () => {
    setOrderComplete(true);
    dispatch(clearCart());
    setActiveStep(steps.length);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="First Name"
                name="firstName"
                value={shippingInfo.firstName}
                onChange={handleShippingInfoChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Last Name"
                name="lastName"
                value={shippingInfo.lastName}
                onChange={handleShippingInfoChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={shippingInfo.email}
                onChange={handleShippingInfoChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Address"
                name="address"
                value={shippingInfo.address}
                onChange={handleShippingInfoChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="City"
                name="city"
                value={shippingInfo.city}
                onChange={handleShippingInfoChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="State"
                name="state"
                value={shippingInfo.state}
                onChange={handleShippingInfoChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="ZIP Code"
                name="zipCode"
                value={shippingInfo.zipCode}
                onChange={handleShippingInfoChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Country"
                name="country"
                value={shippingInfo.country}
                onChange={handleShippingInfoChange}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <PaymentForm 
            onPaymentSuccess={handlePaymentSuccess} 
            shippingInfo={shippingInfo}
            amount={total}
          />
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            {items.map((item) => (
              <Box key={item.id} sx={{ mb: 2 }}>
                <Typography>
                  {item.name} x {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">
              Total: ${total.toFixed(2)}
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  if (activeStep === steps.length) {
    return (
      <Container sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h4" gutterBottom>
              Thank You For Your Order!
            </Typography>
            <Typography variant="body1" paragraph>
              Your order has been placed successfully. You will receive a confirmation email shortly.
            </Typography>
            <Typography variant="body1" paragraph>
              Order Number: #{Math.floor(Math.random() * 1000000)}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/')}
              sx={{ mt: 3 }}
            >
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Checkout
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent>
          {renderStepContent(activeStep)}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep > 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
            {activeStep < steps.length - 1 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
            {activeStep === steps.length - 1 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handlePaymentSuccess}
              >
                Place Order
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Checkout; 