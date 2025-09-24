import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Paper,
  Chip,
  Avatar,
  Divider,
  Grid,
  LinearProgress,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ThumbUp,
  ThumbDown,
  Photo,
  Share,
  ArrowBack,
  Close,
  Add,
  CloudUpload,
  FavoriteBorder,
  SwapHoriz
} from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';

// Sample data for polls
const SAMPLE_POLLS = [
  {
    id: 1,
    user: 'Jessica',
    userAvatar: '/images/avatars/placeholder.png',
    outfitImage: '/images/catalog/placeholder.png',
    title: 'Perfect for a date night?',
    description: 'Not sure if this is good for a fancy dinner date...',
    votes: { yes: 24, no: 8 },
    comments: [
      { user: 'Mike', text: 'Looks amazing!', avatar: '/images/avatars/placeholder.png' },
      { user: 'Sarah', text: 'I would go with a different color', avatar: '/images/avatars/placeholder.png' }
    ]
  },
  {
    id: 2,
    user: 'Marcus',
    userAvatar: '/images/avatars/placeholder.png',
    outfitImage: '/images/catalog/placeholder.png',
    title: 'Casual Friday outfit?',
    description: 'Thinking of wearing this to the office on Friday',
    votes: { yes: 18, no: 3 },
    comments: [
      { user: 'Emma', text: 'Perfect for casual Friday!', avatar: '/images/avatars/placeholder.png' }
    ]
  },
  {
    id: 3,
    user: 'Taylor',
    userAvatar: '/images/avatars/placeholder.png',
    outfitImage: '/images/catalog/placeholder.png',
    title: 'Too casual for a first date?',
    description: 'I like to be comfortable but want to make a good impression',
    votes: { yes: 7, no: 12 },
    comments: []
  }
];

// Styled components
const GlowingCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  background: 'rgba(25, 25, 40, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
  },
  overflow: 'visible'
}));

const TinderCard = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 550,
  borderRadius: 20,
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  touchAction: 'none',
}));

const ActionButton = styled(Button)(({ theme, color }) => ({
  fontWeight: 600,
  borderRadius: 30,
  padding: '10px 20px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)'
  }
}));

const CardBadge = styled(Box)(({ theme, type }) => ({
  position: 'absolute',
  top: 40,
  padding: '10px 20px',
  borderRadius: 8,
  fontWeight: 'bold',
  fontSize: 24,
  boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
  transform: type === 'like' ? 'rotate(-25deg)' : 'rotate(25deg)',
  left: type === 'like' ? 20 : 'auto',
  right: type === 'dislike' ? 20 : 'auto',
  background: type === 'like' ? 'rgba(76, 217, 100, 0.9)' : 'rgba(255, 59, 48, 0.9)',
  color: 'white',
  border: '2px solid white',
  zIndex: 10,
  display: 'none'
}));

const StylePolling = () => {
  const [polls, setPolls] = useState(SAMPLE_POLLS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [pollTitle, setPollTitle] = useState('');
  const [pollDescription, setPollDescription] = useState('');
  const [pollImage, setPollImage] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // Handle broken images by replacing with a default placeholder
  const handleImageError = (e) => {
    e.target.src = '/images/catalog/placeholder.png';
  };

  const cardRef = useRef(null);
  const likeRef = useRef(null);
  const dislikeRef = useRef(null);

  // Spring animation for the card
  const [{ x, rotate }, setSpring] = useSpring(() => ({ 
    x: 0, 
    rotate: 0,
    config: { tension: 300, friction: 20 }
  }));

  const handleDragStart = (e) => {
    if (!cardRef.current) return;
    
    const startX = e.clientX || e.touches[0].clientX;
    const startY = e.clientY || e.touches[0].clientY;
    let currentX;
    let currentY;

    const handleMove = (e) => {
      currentX = e.clientX || e.touches[0].clientX;
      currentY = e.clientY || e.touches[0].clientY;
      
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
      
      // Update the spring values
      setSpring({ 
        x: deltaX, 
        rotate: deltaX / 15 
      });
      
      // Show the appropriate badge based on swipe direction
      if (deltaX > 80) {
        if (likeRef.current) likeRef.current.style.display = 'block';
        if (dislikeRef.current) dislikeRef.current.style.display = 'none';
      } else if (deltaX < -80) {
        if (dislikeRef.current) dislikeRef.current.style.display = 'block';
        if (likeRef.current) likeRef.current.style.display = 'none';
      } else {
        if (likeRef.current) likeRef.current.style.display = 'none';
        if (dislikeRef.current) dislikeRef.current.style.display = 'none';
      }
    };

    const handleEnd = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
      
      // Determine if we should consider this a swipe
      if (currentX - startX > 150) {
        handleLike();
      } else if (currentX - startX < -150) {
        handleDislike();
      } else {
        // Reset the card position
        setSpring({ x: 0, rotate: 0 });
        if (likeRef.current) likeRef.current.style.display = 'none';
        if (dislikeRef.current) dislikeRef.current.style.display = 'none';
      }
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);
  };

  const handleLike = () => {
    setDirection('right');
    
    // Update the poll like count
    const newPolls = [...polls];
    newPolls[currentIndex].votes.yes += 1;
    setPolls(newPolls);
    
    // Animate the card off screen
    setSpring({ 
      x: window.innerWidth, 
      rotate: 30,
      onRest: () => {
        setSpring({ x: 0, rotate: 0 });
        moveToNextCard();
      }
    });
    
    showFeedback('Vote recorded: Yes!', 'success');
  };

  const handleDislike = () => {
    setDirection('left');
    
    // Update the poll dislike count
    const newPolls = [...polls];
    newPolls[currentIndex].votes.no += 1;
    setPolls(newPolls);
    
    // Animate the card off screen
    setSpring({ 
      x: -window.innerWidth, 
      rotate: -30,
      onRest: () => {
        setSpring({ x: 0, rotate: 0 });
        moveToNextCard();
      }
    });
    
    showFeedback('Vote recorded: No!', 'info');
  };

  const moveToNextCard = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex < polls.length - 1 ? prevIndex + 1 : 0
    );
  };

  const handleCreatePoll = () => {
    if (!pollTitle || !pollDescription || !pollImage) {
      showFeedback('Please fill in all fields', 'error');
      return;
    }
    
    const newPoll = {
      id: polls.length + 1,
      user: 'You',
      userAvatar: '/images/avatars/placeholder.png',
      outfitImage: URL.createObjectURL(pollImage),
      title: pollTitle,
      description: pollDescription,
      votes: { yes: 0, no: 0 },
      comments: []
    };
    
    setPolls([newPoll, ...polls]);
    setCreateDialogOpen(false);
    setPollTitle('');
    setPollDescription('');
    setPollImage(null);
    setCurrentIndex(0);
    
    showFeedback('Your style poll was created!', 'success');
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPollImage(e.target.files[0]);
    }
  };

  const showFeedback = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          background: 'rgba(19, 19, 31, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 242, 255, 0.1)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            component={RouterLink}
            to="/"
            startIcon={<ArrowBack />}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h3" sx={{ 
            background: 'linear-gradient(90deg, #00f2ff, #fc0fc0)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            Style Polling Room
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box sx={{ 
              position: 'relative',
              height: 600,
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {polls.length > 0 ? (
                <animated.div 
                  ref={cardRef}
                  style={{ 
                    x,
                    rotate,
                    touchAction: 'none',
                    transform: 'translateX(0px) rotate(0deg)'
                  }}
                  onMouseDown={handleDragStart}
                  onTouchStart={handleDragStart}
                >
                  <TinderCard>
                    <CardBadge type="like" ref={likeRef}>LIKE</CardBadge>
                    <CardBadge type="dislike" ref={dislikeRef}>NOPE</CardBadge>
                    <CardMedia
                      component="img"
                      height="550"
                      image={polls[currentIndex].outfitImage}
                      alt={polls[currentIndex].title}
                      onError={handleImageError}
                      sx={{ objectFit: 'cover' }}
                    />
                    <Box sx={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      width: '100%', 
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                      p: 2
                    }}>
                      <Typography variant="h5" color="white" gutterBottom>
                        {polls[currentIndex].title}
                      </Typography>
                      <Typography variant="body1" color="white">
                        {polls[currentIndex].description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Avatar 
                          src={polls[currentIndex].userAvatar} 
                          onError={handleImageError} 
                          sx={{ width: 32, height: 32 }}
                        />
                        <Typography variant="subtitle2" color="white" sx={{ ml: 1 }}>
                          {polls[currentIndex].user}
                        </Typography>
                      </Box>
                    </Box>
                  </TinderCard>
                </animated.div>
              ) : (
                <Typography variant="h5" color="text.secondary">
                  No polls available. Create one!
                </Typography>
              )}
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mt: 2,
              px: 4,
              pb: 2
            }}>
              <ActionButton
                variant="contained"
                color="error"
                startIcon={<ThumbDown />}
                onClick={handleDislike}
                sx={{ 
                  background: 'linear-gradient(45deg, #FF416C, #FF4B2B)',
                  boxShadow: '0 4px 15px rgba(255, 75, 43, 0.4)'
                }}
                disabled={polls.length === 0}
              >
                Nope
              </ActionButton>
              
              <ActionButton
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{ 
                  background: 'linear-gradient(45deg, #654ea3, #eaafc8)',
                  boxShadow: '0 4px 15px rgba(101, 78, 163, 0.4)'
                }}
              >
                Create Poll
              </ActionButton>
              
              <ActionButton
                variant="contained"
                color="success"
                endIcon={<ThumbUp />}
                onClick={handleLike}
                sx={{ 
                  background: 'linear-gradient(45deg, #00b09b, #96c93d)',
                  boxShadow: '0 4px 15px rgba(0, 176, 155, 0.4)'
                }}
                disabled={polls.length === 0}
              >
                Like It
              </ActionButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              height: '100%', 
              p: 3, 
              background: 'rgba(25, 25, 40, 0.5)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 2
            }}>
              <Typography variant="h5" gutterBottom>
                Poll Results
              </Typography>
              
              {polls.length > 0 && (
                <>
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">
                        Like ({polls[currentIndex].votes.yes})
                      </Typography>
                      <Typography variant="body1">
                        Nope ({polls[currentIndex].votes.no})
                      </Typography>
                    </Box>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={
                        polls[currentIndex].votes.yes + polls[currentIndex].votes.no > 0
                          ? (polls[currentIndex].votes.yes / (polls[currentIndex].votes.yes + polls[currentIndex].votes.no)) * 100
                          : 50
                      }
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        background: 'rgba(255, 59, 48, 0.3)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'rgba(76, 217, 100, 0.9)'
                        }
                      }}
                    />
                  </Box>
                  
                  <Typography variant="h6" gutterBottom>
                    Comments
                  </Typography>
                  
                  <Box sx={{ 
                    maxHeight: 320,
                    overflowY: 'auto',
                    mb: 2,
                    pr: 1 
                  }}>
                    {polls[currentIndex].comments.length > 0 ? (
                      polls[currentIndex].comments.map((comment, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <Avatar 
                              src={comment.avatar} 
                              onError={handleImageError} 
                              sx={{ width: 32, height: 32, mr: 1 }}
                            />
                            <Box>
                              <Typography variant="subtitle2">{comment.user}</Typography>
                              <Typography variant="body2">{comment.text}</Typography>
                            </Box>
                          </Box>
                          {index < polls[currentIndex].comments.length - 1 && (
                            <Divider sx={{ my: 1.5 }} />
                          )}
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No comments yet
                      </Typography>
                    )}
                  </Box>
                  
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Add a comment..."
                    InputProps={{
                      sx: { 
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 2
                      }
                    }}
                  />
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Create Poll Dialog */}
      <Dialog 
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Create Style Poll
          <IconButton
            onClick={() => setCreateDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Upload Outfit Photo
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              border: '2px dashed rgba(0, 242, 255, 0.3)',
              borderRadius: 2,
              py: 3,
              backgroundColor: 'rgba(0, 0, 0, 0.05)'
            }}>
              {pollImage ? (
                <Box sx={{ position: 'relative', width: '100%' }}>
                  <img 
                    src={URL.createObjectURL(pollImage)} 
                    alt="Outfit preview" 
                    style={{ 
                      width: '100%', 
                      maxHeight: '250px', 
                      objectFit: 'contain',
                      borderRadius: 8
                    }} 
                  />
                  <IconButton
                    size="small"
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
                    }}
                    onClick={() => setPollImage(null)}
                  >
                    <Close sx={{ color: 'white' }} />
                  </IconButton>
                </Box>
              ) : (
                <>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUpload />}
                    sx={{ mb: 2 }}
                  >
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageUpload}
                    />
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Supported formats: JPG, PNG (Max 5MB)
                  </Typography>
                </>
              )}
            </Box>
          </Box>
          
          <TextField
            fullWidth
            label="Poll Question"
            variant="outlined"
            placeholder="e.g., Is this good for a date night?"
            margin="normal"
            value={pollTitle}
            onChange={(e) => setPollTitle(e.target.value)}
          />
          
          <TextField
            fullWidth
            label="Description"
            variant="outlined"
            placeholder="Add more details about your outfit..."
            margin="normal"
            multiline
            rows={3}
            value={pollDescription}
            onChange={(e) => setPollDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreatePoll}
            disabled={!pollTitle || !pollDescription || !pollImage}
          >
            Create Poll
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StylePolling; 