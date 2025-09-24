import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import ImageUpload from './components/ImageUpload';
import ClothingSelector from './components/ClothingSelector';
import { apiService, stylistService, utils } from './services/api';
import './styles/globals.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const MainContent = styled.main`
  padding: 2rem 0;
`;

const HeroSection = styled.section`
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 3rem;
  
  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .hero-subtitle {
    font-size: 1.25rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto 2rem;
    line-height: 1.6;
  }
  
  .hero-features {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
    margin-top: 2rem;
  }
  
  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    opacity: 0.8;
  }
  
  @media (max-width: 768px) {
    padding: 2rem 0;
    
    .hero-title {
      font-size: 2.5rem;
    }
    
    .hero-subtitle {
      font-size: 1rem;
      padding: 0 1rem;
    }
    
    .hero-features {
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
  }
`;

const TryOnSection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const StepContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const StepCard = styled(motion.div)`
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .step-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 50%;
    font-weight: bold;
    font-size: 1.125rem;
    margin-bottom: 1rem;
  }
  
  .step-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 1rem;
  }
  
  .step-content {
    flex: 1;
  }
`;

const ResultSection = styled(motion.section)`
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin-top: 3rem;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }
`;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const ResultImage = styled.div`
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  background: #f9fafb;
  aspect-ratio: 3/4;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e5e7eb;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  }
`;

const ResultActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  .result-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #374151;
    margin-bottom: 1rem;
  }
  
  .result-details {
    background: #f9fafb;
    border-radius: 0.75rem;
    padding: 1rem;
    margin-bottom: 1rem;
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .label {
        font-weight: 500;
        color: #6b7280;
      }
      
      .value {
        color: #374151;
      }
    }
  }
`;

const ActionButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  }
  
  &.secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover {
      background: #e5e7eb;
    }
  }
`;

function App() {
  const [userImage, setUserImage] = useState(null);
  const [selectedClothing, setSelectedClothing] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState(true);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const [apiHealth, stylistHealth] = await Promise.all([
        apiService.checkBackendHealth(),
        stylistService.checkHealth()
      ]);
      
      setBackendStatus(apiHealth.status === 'healthy' && stylistHealth.ai_stylist_ready);
    } catch (error) {
      setBackendStatus(false);
      console.error('Backend status check failed:', error);
    }
  };

  const handleImageUpload = (file, error) => {
    setUploadError(error);
    if (file && !error) {
      setUserImage(file);
      toast.success('Image uploaded successfully!');
    }
  };

  const handleImageRemove = () => {
    setUserImage(null);
    setUploadError(null);
    setResultImage(null);
  };

  const handleClothingSelect = (clothing) => {
    setSelectedClothing(clothing);
    toast.success(`Selected: ${clothing.name}`);
  };

  const handleTryOn = async () => {
    if (!userImage || !selectedClothing) {
      toast.error('Please upload your photo and select clothing first');
      return;
    }

    setLoading(true);
    setResultImage(null);

    try {
      // Step 1: Upload user image to backend
      const modelUpload = await apiService.uploadModelImage(userImage);
      const modelPath = modelUpload.file_path;

      // Step 2: Process virtual try-on using your working backend
      const tryonResult = await apiService.processTryOn(
        modelPath,
        selectedClothing.image_path || 'test_cloth.jpg', // Fallback to test cloth
        selectedClothing.category
      );

      if (tryonResult.success || tryonResult.result_path) {
        const resultPath = tryonResult.result_path;
        setResultImage(`http://localhost:8000/${resultPath}`);
        toast.success('Virtual try-on completed successfully!');
      } else {
        throw new Error(tryonResult.error || 'Try-on processing failed');
      }

    } catch (error) {
      console.error('Try-on failed:', error);
      toast.error(`Try-on failed: ${error.message}`);
      
      // Try fallback with AI stylist API
      try {
        const base64Image = await utils.fileToBase64(userImage);
        const fallbackResult = await stylistService.virtualTryOnBase64(
          base64Image,
          selectedClothing.id
        );
        
        if (fallbackResult.success) {
          setResultImage(`http://localhost:8000/${fallbackResult.result_image_path}`);
          toast.success('Virtual try-on completed with fallback method!');
        } else {
          throw new Error('Both try-on methods failed');
        }
      } catch (fallbackError) {
        toast.error('All try-on methods failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResult = async () => {
    if (resultImage) {
      try {
        await utils.downloadImage(resultImage, `vitrz-tryon-result-${Date.now()}.jpg`);
        toast.success('Image downloaded successfully!');
      } catch (error) {
        toast.error('Download failed');
      }
    }
  };

  const handleTryAnother = () => {
    setResultImage(null);
    setSelectedClothing(null);
  };

  const canTryOn = userImage && selectedClothing && !loading;

  return (
    <AppContainer>
      <Header 
        onlineStatus={backendStatus}
        onLogoClick={() => window.location.reload()}
      />

      <HeroSection>
        <div className="container">
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Virtual Try-On Experience
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            See how you look in any outfit instantly with our AI-powered virtual fitting technology. 
            Upload your photo, choose your style, and get your perfect fit.
          </motion.p>
          <motion.div 
            className="hero-features"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="feature-item">
              <i className="fas fa-magic" />
              <span>AI-Powered Fitting</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-clock" />
              <span>Instant Results</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-mobile-alt" />
              <span>Mobile Friendly</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-shield-alt" />
              <span>Secure & Private</span>
            </div>
          </motion.div>
        </div>
      </HeroSection>

      <MainContent>
        <TryOnSection>
          <StepContainer>
            {/* Step 1: Upload Photo */}
            <StepCard
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="step-number">1</div>
              <h3 className="step-title">Upload Your Photo</h3>
              <div className="step-content">
                <ImageUpload
                  onFileSelect={handleImageUpload}
                  onFileRemove={handleImageRemove}
                  currentFile={userImage}
                  error={uploadError}
                  title="Upload Your Photo"
                  subtitle="Look straight at the camera for best results"
                />
              </div>
            </StepCard>

            {/* Step 2: Choose Clothing */}
            <StepCard
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="step-number">2</div>
              <h3 className="step-title">Choose Your Style</h3>
              <div className="step-content">
                <ClothingSelector
                  onClothingSelect={handleClothingSelect}
                  selectedClothing={selectedClothing}
                />
              </div>
            </StepCard>

            {/* Step 3: Try On */}
            <StepCard
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="step-number">3</div>
              <h3 className="step-title">See the Magic</h3>
              <div className="step-content">
                <div style={{ textAlign: 'center' }}>
                  <ActionButton
                    className="primary"
                    onClick={handleTryOn}
                    disabled={!canTryOn}
                    whileHover={{ scale: canTryOn ? 1.05 : 1 }}
                    whileTap={{ scale: canTryOn ? 0.95 : 1 }}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-magic" />
                        Try It On
                      </>
                    )}
                  </ActionButton>
                  
                  <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    {!userImage && !selectedClothing && 'Complete steps 1 & 2 to continue'}
                    {!userImage && selectedClothing && 'Please upload your photo first'}
                    {userImage && !selectedClothing && 'Please select clothing to try on'}
                    {canTryOn && 'Ready to see how you look!'}
                  </div>
                </div>
              </div>
            </StepCard>
          </StepContainer>

          {/* Results Section */}
          <AnimatePresence>
            {(resultImage || loading) && (
              <ResultSection
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.6 }}
              >
                <ResultGrid>
                  <ResultImage>
                    {resultImage && (
                      <img src={resultImage} alt="Try-on result" />
                    )}
                    {loading && (
                      <div className="loading-overlay">
                        <div className="loading-spinner" />
                        <p>Creating your virtual try-on...</p>
                      </div>
                    )}
                  </ResultImage>

                  <ResultActions>
                    <h2 className="result-title">
                      {loading ? 'Processing...' : 'Your Virtual Try-On Result'}
                    </h2>
                    
                    {selectedClothing && (
                      <div className="result-details">
                        <div className="detail-row">
                          <span className="label">Item:</span>
                          <span className="value">{selectedClothing.name}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Style:</span>
                          <span className="value">{selectedClothing.style}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Color:</span>
                          <span className="value">{selectedClothing.color}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Material:</span>
                          <span className="value">{selectedClothing.fabric}</span>
                        </div>
                      </div>
                    )}

                    {resultImage && (
                      <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                        <ActionButton
                          className="primary"
                          onClick={handleDownloadResult}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <i className="fas fa-download" />
                          Download Result
                        </ActionButton>
                        
                        <ActionButton
                          className="secondary"
                          onClick={handleTryAnother}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <i className="fas fa-redo" />
                          Try Another Style
                        </ActionButton>
                      </div>
                    )}
                  </ResultActions>
                </ResultGrid>
              </ResultSection>
            )}
          </AnimatePresence>
        </TryOnSection>
      </MainContent>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AppContainer>
  );
}

export default App;