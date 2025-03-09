import requests
import os
import base64
import json
import logging
from PIL import Image
import io
import time
import cv2
import numpy as np
import random

logger = logging.getLogger(__name__)

class SegmindVirtualTryOn:
    """
    Class to handle virtual try-on using Segmind's API
    """
    
    def __init__(self, api_key=None):
        """Initialize with API key"""
        self.api_key = api_key or os.environ.get("SEGMIND_API_KEY")
        if not self.api_key:
            logger.warning("No Segmind API key provided. Set SEGMIND_API_KEY environment variable or pass it to the constructor.")
        
        # Use the correct API endpoint from Segmind
        self.base_url = "https://api.segmind.com/v1/try-on-diffusion"
    
    def encode_image(self, image_path):
        """Encode image to base64"""
        try:
            # Open and convert image to RGB if needed
            img = Image.open(image_path)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Encode directly without resizing to maintain quality
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
            
        except Exception as e:
            logger.error(f"Error encoding image {image_path}: {str(e)}")
            raise
    
    def process_tryon(self, model_path, cloth_path, output_path=None, category=None):
        """
        Process virtual try-on using Segmind API
        
        Args:
            model_path: Path to the model image
            cloth_path: Path to the clothing image
            output_path: Path to save the result (optional)
            category: Clothing category (Upper body, Lower body, Dress)
            
        Returns:
            Path to the result image
        """
        if not self.api_key:
            raise ValueError("Segmind API key is required")
        
        try:
            # Log the paths for debugging
            logger.info(f"Processing try-on with model: {model_path}, cloth: {cloth_path}, category: {category}")
            
            # Verify files exist
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model image not found at {model_path}")
            if not os.path.exists(cloth_path):
                raise FileNotFoundError(f"Cloth image not found at {cloth_path}")
            
            # Encode images
            logger.info("Encoding images for API request")
            model_image_b64 = self.encode_image(model_path)
            cloth_image_b64 = self.encode_image(cloth_path)
            
            # Determine clothing category based on parameter or filename
            if category and category in ["Upper body", "Lower body", "Dress"]:
                # Use the provided category
                selected_category = category
                logger.info(f"Using provided category: {selected_category}")
            else:
                # Auto-detect category from filename
                cloth_filename = os.path.basename(cloth_path).lower()
                selected_category = "Upper body"  # Default category
                if "pant" in cloth_filename or "trouser" in cloth_filename or "jean" in cloth_filename:
                    selected_category = "Lower body"
                elif "dress" in cloth_filename:
                    selected_category = "Dress"
                logger.info(f"Auto-detected category: {selected_category}")
            
            # Generate a random seed for variety
            seed = random.randint(1, 100000)
            
            # Prepare payload with correct parameters for the API
            payload = {
                "model_image": model_image_b64,
                "cloth_image": cloth_image_b64,
                "category": selected_category,
                "num_inference_steps": 35,
                "guidance_scale": 2,
                "seed": seed,
                "base64": False
            }
            
            # Prepare headers
            headers = {
                "x-api-key": self.api_key,
                "Content-Type": "application/json"
            }
            
            # Make API request
            logger.info(f"Sending request to Segmind API at {self.base_url}")
            response = requests.post(
                self.base_url,
                headers=headers,
                json=payload,
                timeout=120  # Increased timeout for larger images
            )
            
            # Check response
            if response.status_code != 200:
                logger.error(f"Segmind API error: {response.status_code} - {response.text}")
                raise Exception(f"Segmind API error: {response.status_code} - {response.text}")
            
            # Save the image directly from the response content
            if not output_path:
                output_path = f"results/segmind_{int(time.time())}.png"
                
            # Save the binary image data directly
            with open(output_path, "wb") as image_file:
                image_file.write(response.content)
                
            logger.info(f"Saved Segmind result to {output_path}")
            return output_path
                
        except Exception as e:
            logger.error(f"Error in Segmind virtual try-on: {str(e)}")
            raise 