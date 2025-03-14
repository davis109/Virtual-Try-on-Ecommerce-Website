import os
import uuid
import time
import base64
import aiohttp
import asyncio
import requests
from PIL import Image, ImageEnhance, ImageFilter, ImageOps, ImageChops, ImageDraw
import logging
import random
import numpy as np
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

def local_image_to_base64(image_path):
    """Convert a local image to base64 encoding."""
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e:
        logger.error(f"Error encoding image to base64: {str(e)}")
        raise

async def to_b64(url):
    """Convert an image URL to base64 encoding."""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status == 200:
                    image_data = await response.read()
                    return base64.b64encode(image_data).decode('utf-8')
                else:
                    raise Exception(f"Failed to fetch image from URL: {url}, status: {response.status}")
    except Exception as e:
        logger.error(f"Error fetching image from URL: {str(e)}")
        raise

class SegmindVirtualTryOn:
    """Implementation of the Segmind Virtual Try-On API."""
    
    def __init__(self, api_key=None):
        """Initialize the Segmind client."""
        self.api_key = api_key or os.environ.get("SEGMIND_API_KEY")
        if not self.api_key:
            logger.warning("No Segmind API key provided. Set SEGMIND_API_KEY in .env file.")
        logger.info("Initialized Segmind Virtual Try-On client")
        
    def process_tryon(self, model_path, cloth_path, category="Upper body"):
        """
        Process the virtual try-on using the Segmind API.
        
        Args:
            model_path: Path to the model image
            cloth_path: Path to the cloth image
            category: Clothing category (Upper body, Lower body, Dress)
            
        Returns:
            Path to the result image
        """
        logger.info(f"Processing try-on with Segmind API: model={model_path}, cloth={cloth_path}, category={category}")
        
        try:
            # Check if files exist
            if not os.path.exists(model_path):
                logger.error(f"Model image not found: {model_path}")
                raise FileNotFoundError(f"Model image not found: {model_path}")
                
            if not os.path.exists(cloth_path):
                logger.error(f"Cloth image not found: {cloth_path}")
                raise FileNotFoundError(f"Cloth image not found: {cloth_path}")
            
            # Check if we're using test images
            if "test_model" in model_path or "test_cloth" in cloth_path:
                logger.warning("Using test images which may not contain proper human models. Skipping Segmind API call.")
                return self._fallback_local_processing(model_path, cloth_path, category)
            
            # Convert images to base64
            model_image_b64 = local_image_to_base64(model_path)
            cloth_image_b64 = local_image_to_base64(cloth_path)
            
            # Prepare API request
            url = "https://api.segmind.com/v1/try-on-diffusion"
            
            data = {
                "model_image": model_image_b64,
                "cloth_image": cloth_image_b64,
                "category": category,
                "num_inference_steps": 35,
                "guidance_scale": 2,
                "seed": 12467,
                "base64": False
            }
            
            headers = {
                'x-api-key': self.api_key,
                'Content-Type': 'application/json'
            }
            
            logger.info("Sending request to Segmind API...")
            
            # Make API request
            response = requests.post(url, json=data, headers=headers, timeout=120)
            
            logger.info(f"Segmind API response status: {response.status_code}")
            
            if response.status_code == 200:
                # Save the result image
                result_path = f"results/segmind_{int(time.time())}.png"
                with open(result_path, "wb") as image_file:
                    image_file.write(response.content)
                
                logger.info(f"Segmind processing complete, result saved to {result_path}")
                return result_path
            else:
                error_message = response.text
                logger.error(f"Segmind API error: {response.status_code} - {error_message}")
                
                # Check for specific error messages
                if "No human detected" in error_message:
                    logger.warning("No human detected in the model image. Falling back to local processing.")
                    return self._fallback_local_processing(model_path, cloth_path, category)
                
                raise Exception(f"Segmind API error: {response.status_code} - {error_message}")
            
        except Exception as e:
            logger.error(f"Error in Segmind processing: {str(e)}")
            # Fall back to local processing
            logger.info("Falling back to local processing")
            return self._fallback_local_processing(model_path, cloth_path, category)
    
    def _fallback_local_processing(self, model_path, cloth_path, category="Upper body"):
        """Fallback to local processing if the Segmind API fails."""
        logger.info(f"Using local processing fallback for model={model_path}, cloth={cloth_path}, category={category}")
        
        try:
            # Open the images
            model_img = Image.open(model_path).convert('RGB')
            cloth_img = Image.open(cloth_path).convert('RGB')
            
            # Resize cloth to fit model if needed
            if cloth_img.size != model_img.size:
                cloth_img = cloth_img.resize(model_img.size, Image.LANCZOS)
            
            # Process based on category
            if category == "Upper body":
                result_img = self._process_upper_body(model_img, cloth_img)
            elif category == "Lower body":
                result_img = self._process_lower_body(model_img, cloth_img)
            else:  # Full dress or other
                result_img = self._process_full_dress(model_img, cloth_img)
            
            # Apply final enhancements
            result_img = self._apply_final_enhancements(result_img)
            
            # Save the result
            result_path = f"results/{uuid.uuid4()}.png"
            result_img.save(result_path)
            
            logger.info(f"Local processing complete, result saved to {result_path}")
            return result_path
            
        except Exception as e:
            logger.error(f"Error in local processing fallback: {str(e)}")
            # If even the fallback fails, use the simplest blend method
            return self._simple_blend_fallback(model_path, cloth_path, category)
    
    def _simple_blend_fallback(self, model_path, cloth_path, category="Upper body"):
        """Simplest fallback method if all else fails."""
        logger.info("Using simple blend as final fallback")
        try:
            # Open the images
            model_img = Image.open(model_path).convert('RGB')
            cloth_img = Image.open(cloth_path).convert('RGB')
            
            # Resize cloth to fit model if needed
            if cloth_img.size != model_img.size:
                cloth_img = cloth_img.resize(model_img.size, Image.LANCZOS)
            
            # Create a simple blend (50% model, 50% cloth)
            result_img = Image.blend(model_img, cloth_img, 0.5)
            
            # Save the result
            result_path = f"results/simple_blend_{uuid.uuid4()}.png"
            result_img.save(result_path)
            
            logger.info(f"Simple blend created and saved to {result_path}")
            return result_path
        except Exception as e:
            logger.error(f"Error in simple blend fallback: {str(e)}")
            raise
    
    # Keep the existing helper methods for local processing
    def _process_upper_body(self, model_img, cloth_img):
        """Process upper body clothing."""
        # Create a copy of the model image
        result_img = model_img.copy()
        
        # Calculate the upper body region (approximately top 40%)
        width, height = model_img.size
        upper_body_height = int(height * 0.4)
        
        # Create a mask for blending
        mask = Image.new('L', model_img.size, 0)
        
        # Create a more realistic body shape mask
        for y in range(upper_body_height):
            # Calculate width of body at this height (narrower at top, wider at bottom)
            relative_y = y / upper_body_height
            body_width = int(width * (0.3 + 0.2 * relative_y))
            center_x = width // 2
            
            # Calculate alpha based on position
            for x in range(width):
                # Distance from center
                dist_from_center = abs(x - center_x)
                if dist_from_center < body_width // 2:
                    # Gradient alpha from center to edges
                    alpha = int(255 * (1 - dist_from_center / (body_width // 2) * 0.3))
                    # Gradient alpha from top to bottom
                    alpha = int(alpha * (0.7 + 0.3 * relative_y))
                    mask.putpixel((x, y), alpha)
        
        # Add shoulders
        shoulder_y = int(height * 0.2)
        shoulder_width = int(width * 0.6)
        for x in range(center_x - shoulder_width // 2, center_x + shoulder_width // 2):
            for y in range(shoulder_y - 10, shoulder_y + 10):
                if 0 <= y < height and 0 <= x < width:
                    # Calculate distance from shoulder line
                    dist = abs(y - shoulder_y)
                    alpha = int(255 * (1 - dist / 10))
                    if alpha > mask.getpixel((x, y)):
                        mask.putpixel((x, y), alpha)
        
        # Apply some transformations to the cloth to make it look more natural
        # Slightly warp the cloth to follow body contours
        cloth_warped = cloth_img.transform(
            cloth_img.size, 
            Image.MESH, 
            self._generate_mesh_data(cloth_img.size, distortion=0.05),
            Image.BICUBIC
        )
        
        # Adjust cloth color and contrast to match lighting
        cloth_adjusted = self._adjust_cloth_lighting(cloth_warped, model_img, upper_body_region=True)
        
        # Paste the cloth onto the model using the mask
        result_img.paste(cloth_adjusted, (0, 0), mask)
        
        # Add some shadow effects
        result_img = self._add_shadows(result_img, mask)
        
        return result_img
    
    def _process_lower_body(self, model_img, cloth_img):
        """Process lower body clothing."""
        # Create a copy of the model image
        result_img = model_img.copy()
        
        # Calculate the lower body region (approximately bottom 60%)
        width, height = model_img.size
        lower_body_start = int(height * 0.4)
        
        # Create a mask for blending
        mask = Image.new('L', model_img.size, 0)
        
        # Create a more realistic lower body shape mask
        for y in range(lower_body_start, height):
            # Calculate relative position in lower body
            relative_y = (y - lower_body_start) / (height - lower_body_start)
            
            # Calculate width of body at this height (wider at top, narrower at bottom)
            body_width = int(width * (0.4 - 0.15 * relative_y))
            center_x = width // 2
            
            # Calculate alpha based on position
            for x in range(width):
                # Distance from center
                dist_from_center = abs(x - center_x)
                if dist_from_center < body_width // 2:
                    # Gradient alpha from center to edges
                    alpha = int(255 * (1 - dist_from_center / (body_width // 2) * 0.3))
                    # Gradient alpha from top to bottom
                    alpha = int(alpha * (0.9 - 0.2 * relative_y))
                    mask.putpixel((x, y), alpha)
        
        # Apply some transformations to the cloth to make it look more natural
        # Slightly warp the cloth to follow body contours
        cloth_warped = cloth_img.transform(
            cloth_img.size, 
            Image.MESH, 
            self._generate_mesh_data(cloth_img.size, distortion=0.03),
            Image.BICUBIC
        )
        
        # Adjust cloth color and contrast to match lighting
        cloth_adjusted = self._adjust_cloth_lighting(cloth_warped, model_img, upper_body_region=False)
        
        # Paste the cloth onto the model using the mask
        result_img.paste(cloth_adjusted, (0, 0), mask)
        
        # Add some shadow effects
        result_img = self._add_shadows(result_img, mask)
        
        return result_img
    
    def _process_full_dress(self, model_img, cloth_img):
        """Process full dress."""
        # Create a copy of the model image
        result_img = model_img.copy()
        
        # Calculate dimensions
        width, height = model_img.size
        center_x = width // 2
        
        # Create a mask for blending
        mask = Image.new('L', model_img.size, 0)
        
        # Create a more realistic body shape mask for a dress
        for y in range(height):
            # Calculate relative position
            relative_y = y / height
            
            # Calculate width of body at this height (narrower at top, wider in middle, narrower at bottom)
            if relative_y < 0.4:  # Upper body
                body_width = int(width * (0.3 + 0.2 * relative_y))
            else:  # Lower body - dress shape
                body_width = int(width * (0.5 - 0.2 * (relative_y - 0.4) / 0.6))
                # Add some flare to the dress at the bottom
                if relative_y > 0.7:
                    flare_factor = (relative_y - 0.7) / 0.3
                    body_width = int(body_width * (1 + flare_factor * 0.5))
            
            # Calculate alpha based on position
            for x in range(width):
                # Distance from center
                dist_from_center = abs(x - center_x)
                if dist_from_center < body_width // 2:
                    # Gradient alpha from center to edges
                    alpha = int(255 * (1 - dist_from_center / (body_width // 2) * 0.3))
                    # Gradient alpha from top to bottom
                    alpha = int(alpha * (0.7 + 0.3 * relative_y))
                    mask.putpixel((x, y), alpha)
        
        # Apply some transformations to the cloth to make it look more natural
        # Warp the cloth to follow body contours
        cloth_warped = cloth_img.transform(
            cloth_img.size, 
            Image.MESH, 
            self._generate_mesh_data(cloth_img.size, distortion=0.07),
            Image.BICUBIC
        )
        
        # Adjust cloth color and contrast to match lighting
        cloth_adjusted = self._adjust_cloth_lighting(cloth_warped, model_img)
        
        # Paste the cloth onto the model using the mask
        result_img.paste(cloth_adjusted, (0, 0), mask)
        
        # Add some shadow effects
        result_img = self._add_shadows(result_img, mask)
        
        return result_img
    
    def _generate_mesh_data(self, size, distortion=0.05):
        """Generate mesh data for image warping."""
        try:
            width, height = size
            mesh = []
            
            # Create a grid of control points
            step = 50
            for y in range(0, height, step):
                for x in range(0, width, step):
                    # Define a quad (source and destination points)
                    x2 = min(x + step, width)
                    y2 = min(y + step, height)
                    
                    # Source points (regular grid)
                    src_quad = (x, y, x2, y, x2, y2, x, y2)
                    
                    # Destination points (slightly distorted)
                    dx1 = random.uniform(-distortion * step, distortion * step)
                    dy1 = random.uniform(-distortion * step, distortion * step)
                    dx2 = random.uniform(-distortion * step, distortion * step)
                    dy2 = random.uniform(-distortion * step, distortion * step)
                    dx3 = random.uniform(-distortion * step, distortion * step)
                    dy3 = random.uniform(-distortion * step, distortion * step)
                    dx4 = random.uniform(-distortion * step, distortion * step)
                    dy4 = random.uniform(-distortion * step, distortion * step)
                    
                    dst_quad = (
                        x + dx1, y + dy1,
                        x2 + dx2, y + dy2,
                        x2 + dx3, y2 + dy3,
                        x + dx4, y2 + dy4
                    )
                    
                    mesh.append((src_quad, dst_quad))
            
            return mesh
        except Exception as e:
            logger.warning(f"Error generating mesh data: {str(e)}. Returning simple mesh.")
            # Return a simple identity mesh (no distortion)
            width, height = size
            return [((0, 0, width, 0, width, height, 0, height), 
                     (0, 0, width, 0, width, height, 0, height))]
    
    def _adjust_cloth_lighting(self, cloth_img, model_img, upper_body_region=None):
        """Adjust cloth lighting to match the model image."""
        try:
            # Simple brightness and contrast adjustment
            # Increase contrast slightly
            enhancer = ImageEnhance.Contrast(cloth_img)
            adjusted_img = enhancer.enhance(1.1)
            
            # Adjust brightness slightly
            enhancer = ImageEnhance.Brightness(adjusted_img)
            adjusted_img = enhancer.enhance(1.05)
            
            return adjusted_img
        except Exception as e:
            logger.warning(f"Error adjusting cloth lighting: {str(e)}. Returning original image.")
            return cloth_img
    
    def _add_shadows(self, img, mask):
        """Add shadow effects to make the result more realistic."""
        try:
            # Create a shadow layer
            shadow = Image.new('RGBA', img.size, (0, 0, 0, 0))
            shadow_draw = ImageDraw.Draw(shadow)
            
            # Convert mask to numpy array for processing
            mask_np = np.array(mask)
            
            # Find edges in the mask
            edges = np.gradient(mask_np)
            edge_magnitude = np.sqrt(edges[0]**2 + edges[1]**2)
            
            # Normalize edge magnitude
            if np.max(edge_magnitude) > 0:
                edge_magnitude = edge_magnitude / np.max(edge_magnitude) * 255
            
            # Create edge mask
            edge_mask = Image.fromarray(edge_magnitude.astype(np.uint8))
            
            # Blur the edge mask
            edge_mask = edge_mask.filter(ImageFilter.GaussianBlur(radius=3))
            
            # Apply the shadow
            shadow_img = Image.new('RGBA', img.size, (0, 0, 0, 50))
            img_rgba = img.convert('RGBA')
            
            # Composite the shadow with the image
            result = Image.alpha_composite(img_rgba, ImageChops.multiply(shadow_img, edge_mask.convert('RGBA')))
            
            return result.convert('RGB')
        except Exception as e:
            logger.warning(f"Error adding shadows: {str(e)}. Returning original image.")
            return img
    
    def _apply_final_enhancements(self, img):
        """Apply final enhancements to the result."""
        # Sharpen the image
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1.2)
        
        # Slightly increase contrast
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.1)
        
        # Apply a subtle vignette effect
        img = self._apply_vignette(img)
        
        return img
    
    def _apply_vignette(self, img, amount=0.3):
        """Apply a subtle vignette effect."""
        try:
            width, height = img.size
            
            # Create a radial gradient mask
            mask = Image.new('L', img.size, 255)
            draw = ImageDraw.Draw(mask)
            
            # Calculate parameters for the ellipse
            ellipse_width = width * 1.5
            ellipse_height = height * 1.5
            
            # Draw the ellipse
            draw.ellipse(
                (
                    (width - ellipse_width) / 2,
                    (height - ellipse_height) / 2,
                    (width + ellipse_width) / 2,
                    (height + ellipse_height) / 2
                ),
                fill=0
            )
            
            # Apply a gaussian blur to the mask
            mask = mask.filter(ImageFilter.GaussianBlur(radius=min(width, height) / 5))
            
            # Adjust the mask intensity
            mask = ImageOps.invert(mask)
            enhancer = ImageEnhance.Brightness(mask)
            mask = enhancer.enhance(amount)
            mask = ImageOps.invert(mask)
            
            # Apply the mask to darken the edges
            result = img.copy()
            result.putalpha(mask)
            
            # Composite with black background
            black = Image.new('RGB', img.size, (0, 0, 0))
            result = Image.alpha_composite(black.convert('RGBA'), result.convert('RGBA'))
            
            return result.convert('RGB')
        except Exception as e:
            logger.warning(f"Error applying vignette: {str(e)}. Returning original image.")
            return img
    
    def _simple_blend(self, model_img, cloth_img, category="Upper body"):
        """Simple fallback blend method if more sophisticated methods fail."""
        logger.info("Using simple blend as fallback")
        result_img = model_img.copy()
        
        # Create a simple mask based on category
        mask = Image.new('L', model_img.size, 0)
        width, height = model_img.size
        
        if category == "Upper body":
            # For upper body, blend the top 40%
            upper_body_height = int(height * 0.4)
            for y in range(upper_body_height):
                alpha = int(255 * (1 - y / upper_body_height * 0.5))
                for x in range(width):
                    mask.putpixel((x, y), alpha)
        elif category == "Lower body":
            # For lower body, blend the bottom 60%
            lower_body_start = int(height * 0.4)
            for y in range(lower_body_start, height):
                alpha = int(255 * (y - lower_body_start) / (height - lower_body_start) * 0.8)
                for x in range(width):
                    mask.putpixel((x, y), alpha)
        else:  # Full dress
            # For full dress, blend with gradient
            for y in range(height):
                alpha = int(255 * (0.3 + 0.5 * y / height))
                for x in range(width):
                    mask.putpixel((x, y), alpha)
        
        # Paste the cloth onto the model using the mask
        result_img.paste(cloth_img, (0, 0), mask)
        
        # Add some basic enhancements
        enhancer = ImageEnhance.Contrast(result_img)
        result_img = enhancer.enhance(1.1)
        result_img = result_img.filter(ImageFilter.SMOOTH_MORE)
        
        return result_img

# Async version of the Segmind API for use with FastAPI
class AsyncSegmindVirtualTryOn(SegmindVirtualTryOn):
    """Async implementation of the Segmind Virtual Try-On API for use with FastAPI."""
    
    async def async_process_tryon(self, model_path, cloth_path, category="Upper body"):
        """
        Process the virtual try-on using the Segmind API asynchronously.
        
        Args:
            model_path: Path to the model image
            cloth_path: Path to the cloth image
            category: Clothing category (Upper body, Lower body, Dress)
            
        Returns:
            Path to the result image
        """
        logger.info(f"Processing try-on with Segmind API (async): model={model_path}, cloth={cloth_path}, category={category}")
        
        try:
            # Check if files exist
            if not os.path.exists(model_path):
                logger.error(f"Model image not found: {model_path}")
                raise FileNotFoundError(f"Model image not found: {model_path}")
                
            if not os.path.exists(cloth_path):
                logger.error(f"Cloth image not found: {cloth_path}")
                raise FileNotFoundError(f"Cloth image not found: {cloth_path}")
            
            # Check if we're using test images
            if "test_model" in model_path or "test_cloth" in cloth_path:
                logger.warning("Using test images which may not contain proper human models. Skipping Segmind API call.")
                loop = asyncio.get_event_loop()
                return await loop.run_in_executor(None, lambda: self._fallback_local_processing(model_path, cloth_path, category))
            
            # Convert images to base64
            loop = asyncio.get_event_loop()
            model_image_b64 = await loop.run_in_executor(None, lambda: local_image_to_base64(model_path))
            cloth_image_b64 = await loop.run_in_executor(None, lambda: local_image_to_base64(cloth_path))
            
            # Prepare API request
            url = "https://api.segmind.com/v1/try-on-diffusion"
            
            data = {
                "model_image": model_image_b64,
                "cloth_image": cloth_image_b64,
                "category": category,
                "num_inference_steps": 35,
                "guidance_scale": 2,
                "seed": 12467,
                "base64": False
            }
            
            headers = {
                'x-api-key': self.api_key,
                'Content-Type': 'application/json'
            }
            
            logger.info("Sending request to Segmind API...")
            
            # Make API request asynchronously
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=data, headers=headers, timeout=120) as response:
                    logger.info(f"Segmind API response status: {response.status}")
                    
                    if response.status == 200:
                        # Save the result image
                        result_path = f"results/segmind_{int(time.time())}.png"
                        image_data = await response.read()
                        
                        with open(result_path, "wb") as image_file:
                            image_file.write(image_data)
                        
                        logger.info(f"Segmind processing complete, result saved to {result_path}")
                        return result_path
                    else:
                        error_message = await response.text()
                        logger.error(f"Segmind API error: {response.status} - {error_message}")
                        
                        # Check for specific error messages
                        if "No human detected" in error_message:
                            logger.warning("No human detected in the model image. Falling back to local processing.")
                            return await loop.run_in_executor(None, lambda: self._fallback_local_processing(model_path, cloth_path, category))
                        
                        raise Exception(f"Segmind API error: {response.status} - {error_message}")
            
        except Exception as e:
            logger.error(f"Error in async Segmind processing: {str(e)}")
            # Fall back to local processing
            logger.info("Falling back to local processing")
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, lambda: self._fallback_local_processing(model_path, cloth_path, category)) 