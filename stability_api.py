import requests
import logging
import time
import traceback
import os
import base64
import io
from PIL import Image
import random

class StabilityAI:
    """
    Client for interacting with Stability.ai's API for image generation
    """
    
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.stability.ai"
        self.engine_id = "stable-diffusion-xl-1024-v1-0"
        self.logger = logging.getLogger(__name__)
        
        # Set up logging
        if not self.logger.handlers:
            self.logger.setLevel(logging.INFO)
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
        
        self.logger.info("Initialized Stability AI client")
    
    def check_api_key(self):
        """Check if the API key is valid"""
        if not self.api_key or self.api_key == "your_api_key_here":
            self.logger.warning("No valid Stability AI API key provided. Using fallback mode.")
            return False
        return True
    
    def generate_image(self, prompt, negative_prompt="", width=1024, height=1024, steps=30, cfg_scale=7.0, samples=1):
        """
        Generate an image using Stability AI's API
        
        Args:
            prompt (str): Text description of the desired image
            negative_prompt (str): Text description of what to avoid
            width (int): Image width
            height (int): Image height
            steps (int): Number of diffusion steps
            cfg_scale (float): How strictly to follow the prompt
            samples (int): Number of images to generate
            
        Returns:
            bytes: The generated image data
        """
        try:
            self.logger.info(f"Generating image with prompt: {prompt}")
            
            # Check if API key is valid
            if not self.check_api_key():
                return self._generate_fallback_image(prompt)
            
            # Use the REST API endpoint directly - this works better with the provided key format
            url = f"{self.base_url}/v1/generation/{self.engine_id}/text-to-image"
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            # Log the full headers for debugging
            self.logger.info(f"Request headers: {headers}")
            
            # Build the request payload
            payload = {
                "text_prompts": [],
                "cfg_scale": cfg_scale,
                "height": height,
                "width": width,
                "samples": samples,
                "steps": steps
            }
            
            # Add positive prompt
            payload["text_prompts"].append({
                "text": prompt,
                "weight": 1.0
            })
            
            # Add negative prompt if provided
            if negative_prompt:
                payload["text_prompts"].append({
                    "text": negative_prompt,
                    "weight": -1.0
                })
            
            # Log the full payload for debugging
            self.logger.info(f"Request payload: {payload}")
            
            # Make the API request with extended timeout
            response = requests.post(url, headers=headers, json=payload, timeout=120)
            
            # Log the response status
            self.logger.info(f"Stability API response status: {response.status_code}")
            
            # Handle the response
            if response.status_code == 200:
                data = response.json()
                
                # Log the response structure
                self.logger.info(f"Response structure: {list(data.keys())}")
                
                # Get the first generated image
                if "artifacts" in data and len(data["artifacts"]) > 0:
                    image_data_base64 = data["artifacts"][0]["base64"]
                    # Convert base64 to bytes
                    image_data = base64.b64decode(image_data_base64)
                    self.logger.info("Successfully generated image")
                    return image_data
                else:
                    self.logger.error(f"No image data in response: {data}")
                    return self._generate_fallback_image(prompt)
            else:
                self.logger.error(f"API request failed with status {response.status_code}: {response.text}")
                # Log the specific error details
                try:
                    error_details = response.json()
                    self.logger.error(f"Error details: {error_details}")
                except:
                    self.logger.error("Could not parse error response as JSON")
                
                return self._generate_fallback_image(prompt)
                
        except Exception as e:
            self.logger.error(f"Error generating image: {str(e)}")
            self.logger.error(traceback.format_exc())
            return self._generate_fallback_image(prompt)
    
    def _generate_fallback_image(self, prompt):
        """
        Generate a fallback image when the API is not available
        
        Args:
            prompt (str): The original prompt (used for logging only)
            
        Returns:
            bytes: A placeholder image
        """
        self.logger.warning(f"Using fallback image generation for prompt: {prompt}")
        
        try:
            # Create a simple colored image with text as a fallback
            width, height = 768, 768
            color = (
                random.randint(50, 200),
                random.randint(50, 200),
                random.randint(50, 200)
            )
            
            # Create a colored image
            image = Image.new("RGB", (width, height), color)
            
            # If PIL has ImageDraw, add the prompt text to the image
            try:
                from PIL import ImageDraw, ImageFont
                draw = ImageDraw.Draw(image)
                
                # Try to load a font, fall back to default if not available
                try:
                    font = ImageFont.truetype("arial.ttf", 24)
                except:
                    font = ImageFont.load_default()
                
                # Wrap the text to fit within the image
                prompt_lines = []
                words = prompt.split()
                current_line = ""
                for word in words:
                    test_line = current_line + " " + word if current_line else word
                    if font.getlength(test_line) < width - 40:
                        current_line = test_line
                    else:
                        prompt_lines.append(current_line)
                        current_line = word
                if current_line:
                    prompt_lines.append(current_line)
                
                # Draw each line of text
                y_position = 40
                for line in prompt_lines:
                    draw.text((20, y_position), line, fill=(255, 255, 255), font=font)
                    y_position += 30
                
                # Draw a label indicating this is a fallback image
                draw.text((20, height - 40), "Generated Fallback Image", fill=(255, 255, 255), font=font)
            except:
                # If ImageDraw is not available, just use the colored image
                pass
            
            # Save the image to bytes
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='PNG')
            img_byte_arr.seek(0)
            
            return img_byte_arr.read()
            
        except Exception as e:
            self.logger.error(f"Error in fallback image generation: {str(e)}")
            
            # Last resort - return a small blank image
            blank_image = Image.new("RGB", (768, 768), (100, 100, 100))
            blank_byte_arr = io.BytesIO()
            blank_image.save(blank_byte_arr, format='PNG')
            blank_byte_arr.seek(0)
            
            return blank_byte_arr.read() 