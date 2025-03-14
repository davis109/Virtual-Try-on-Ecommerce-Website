from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uvicorn
import os
import shutil
from PIL import Image, ImageEnhance, ImageFilter
import io
import uuid
from typing import Optional
import numpy as np
import torch
import cv2
import gc
import logging
import sys
from fastapi.middleware.gzip import GZipMiddleware
from dotenv import load_dotenv
import requests
from segmind_api import SegmindVirtualTryOn

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('server.log')
    ]
)
logger = logging.getLogger(__name__)

# Import our virtual try-on modules
# Comment these out for testing if modules are not available
# from nodes.preprocessing import ModelPreprocessor, ClothPreprocessor
# from nodes.warping import ClothWarper
# from nodes.fusion import ImageFusionNode
# from nodes.postprocessing import PostProcessor

def cleanup_memory():
    """Clean up memory to prevent memory leaks."""
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

def load_image(image_path):
    """Load an image and convert it to the format expected by our nodes."""
    try:
        # Increase PIL's decompression bomb limit
        Image.MAX_IMAGE_PIXELS = None  # Disable the limit (use with caution)
        
        img = Image.open(image_path).convert('RGB')
        
        # Check if image is too large and resize if necessary
        max_dimension = 1024  # Maximum dimension for width or height
        if img.width > max_dimension or img.height > max_dimension:
            logger.info(f"Resizing large image: {img.width}x{img.height}")
            # Calculate new dimensions while maintaining aspect ratio
            if img.width > img.height:
                new_width = max_dimension
                new_height = int(img.height * (max_dimension / img.width))
            else:
                new_height = max_dimension
                new_width = int(img.width * (max_dimension / img.height))
            
            img = img.resize((new_width, new_height), Image.LANCZOS)
            logger.info(f"Resized to: {img.width}x{img.height}")
            
            # Save the resized image back to the same path
            img.save(image_path)
            
        img_np = np.array(img)
        # Ensure we're in RGB format (OpenCV uses BGR)
        if len(img_np.shape) == 3 and img_np.shape[2] == 3:
            img_np = cv2.cvtColor(img_np, cv2.COLOR_BGR2RGB)
        # Convert to tensor (BCHW format)
        img_tensor = torch.from_numpy(img_np).float() / 255.0
        img_tensor = img_tensor.permute(2, 0, 1).unsqueeze(0)
        
        # Clean up
        del img
        del img_np
        cleanup_memory()
        
        return img_tensor
    except Exception as e:
        logger.error(f"Error loading image {image_path}: {str(e)}")
        raise

def save_image(tensor, output_path):
    """Save a tensor as an image."""
    if isinstance(tensor, torch.Tensor):
        # Convert from BCHW to HWC
        img_np = tensor[0].permute(1, 2, 0).cpu().numpy()
        img_np = (img_np * 255).astype(np.uint8)
        img = Image.fromarray(img_np)
        img.save(output_path)
        print(f"Saved result to {output_path}")
    else:
        print("Error: Input is not a tensor")

def download_image(url, save_path):
    """Download an image from a URL and save it locally."""
    try:
        logger.info(f"Downloading image from {url} to {save_path}")
        
        # Create a session with proper headers to avoid 403 errors
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.google.com/'
        })
        
        response = session.get(url, stream=True, timeout=15)
        response.raise_for_status()
        
        # Ensure the directory exists
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        with open(save_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                
        logger.info(f"Image downloaded successfully to {save_path}")
        return save_path
    except Exception as e:
        logger.error(f"Error downloading image from {url}: {str(e)}")
        raise

app = FastAPI(title="Virtual Try-On API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload directories if they don't exist
os.makedirs("uploads/models", exist_ok=True)
os.makedirs("uploads/clothes", exist_ok=True)
os.makedirs("results", exist_ok=True)

def process_tryon(model_path: str, cloth_path: str, use_segmind: bool = False, clothing_category: str = "Upper body") -> str:
    """Process the virtual try-on and return the result image path."""
    try:
        logger.info(f"Processing try-on with model: {model_path}, cloth: {cloth_path}, use_segmind: {use_segmind}, clothing_category: {clothing_category}")
        
        # Check if files exist
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model image not found at {model_path}")
        
        if not os.path.exists(cloth_path):
            raise FileNotFoundError(f"Cloth image not found at {cloth_path}")
        
        # If using Segmind API
        if use_segmind:
            try:
                # Initialize Segmind client
                segmind_client = SegmindVirtualTryOn()
                
                # Process using Segmind API with the specified clothing category
                result_path = segmind_client.process_tryon(model_path, cloth_path, category=clothing_category)
                logger.info(f"Segmind processing complete, result saved to {result_path}")
                return result_path
            except Exception as e:
                logger.error(f"Segmind API error: {str(e)}")
                logger.info("Falling back to local processing")
                # Fall back to local processing
        
        # Local processing - create a more sophisticated blend based on clothing category
        try:
            # Open the images
            model_img = Image.open(model_path).convert('RGB')
            cloth_img = Image.open(cloth_path).convert('RGB')
            
            # Resize cloth to fit model if needed
            if cloth_img.size != model_img.size:
                cloth_img = cloth_img.resize(model_img.size, Image.LANCZOS)
            
            # Create a result image (start with a copy of the model)
            result_img = model_img.copy()
            
            # Create a mask based on category
            mask = Image.new('L', model_img.size, 0)
            width, height = model_img.size
            
            if clothing_category == "Upper body":
                # For upper body, blend the top 40%
                upper_body_height = int(height * 0.4)
                for y in range(upper_body_height):
                    # Gradient alpha from top to bottom
                    alpha = int(255 * (1 - y / upper_body_height * 0.5))
                    for x in range(width):
                        mask.putpixel((x, y), alpha)
            elif clothing_category == "Lower body":
                # For lower body, blend the bottom 60%
                lower_body_start = int(height * 0.4)
                for y in range(lower_body_start, height):
                    # Gradient alpha from top to bottom
                    alpha = int(255 * (y - lower_body_start) / (height - lower_body_start) * 0.8)
                    for x in range(width):
                        mask.putpixel((x, y), alpha)
            else:  # Full dress
                # For full dress, blend with gradient
                for y in range(height):
                    # Gradient alpha from top to bottom
                    alpha = int(255 * (0.3 + 0.5 * y / height))
                    for x in range(width):
                        mask.putpixel((x, y), alpha)
            
            # Enhance the cloth image
            enhancer = ImageEnhance.Contrast(cloth_img)
            cloth_enhanced = enhancer.enhance(1.2)
            
            # Paste the cloth onto the model using the mask
            result_img.paste(cloth_enhanced, (0, 0), mask)
            
            # Apply some final enhancements
            enhancer = ImageEnhance.Contrast(result_img)
            result_img = enhancer.enhance(1.1)
            result_img = result_img.filter(ImageFilter.SMOOTH_MORE)
            
            # Save the result
            result_path = f"results/{uuid.uuid4()}.png"
            result_img.save(result_path)
            
            logger.info(f"Simple blend created and saved to {result_path}")
            return result_path
            
        except Exception as e:
            logger.error(f"Error during simple blending: {str(e)}")
            raise
            
    except Exception as e:
        logger.error(f"Error in process_tryon: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise

@app.post("/api/upload/model")
async def upload_model(file: UploadFile = File(...)) -> dict:
    """Upload a model image."""
    try:
        file_path = f"uploads/models/{uuid.uuid4()}_{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"filename": file_path}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/upload/cloth")
async def upload_cloth(file: UploadFile = File(...)) -> dict:
    """Upload a clothing image."""
    try:
        file_path = f"uploads/clothes/{uuid.uuid4()}_{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"filename": file_path}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/tryon")
async def virtual_tryon(
    model_path: str = Query(...), 
    cloth_path: str = Query(...),
    use_segmind: bool = Query(False, description="Use Segmind API for processing"),
    clothing_category: str = Query("Upper body", description="Clothing category for Segmind API")
) -> dict:
    """Process virtual try-on with uploaded images."""
    try:
        # Check if paths are URLs and download if needed
        if model_path.startswith(('http://', 'https://')):
            local_model_path = f"uploads/models/{uuid.uuid4()}_downloaded.jpg"
            model_path = download_image(model_path, local_model_path)
            
        if cloth_path.startswith(('http://', 'https://')):
            local_cloth_path = f"uploads/clothes/{uuid.uuid4()}_downloaded.jpg"
            cloth_path = download_image(cloth_path, local_cloth_path)
            
        result_path = process_tryon(model_path, cloth_path, use_segmind, clothing_category)
        return {"result": os.path.basename(result_path)}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/result/{filename}")
async def get_result(filename: str):
    """Get a result image."""
    file_path = f"results/{filename}"
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="Image not found")

@app.get("/uploads/{folder}/{filename}")
async def get_upload(folder: str, filename: str):
    """Get an uploaded file."""
    file_path = f"uploads/{folder}/{filename}"
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")

# Add a root endpoint for testing
@app.get("/")
async def root():
    """Root endpoint for testing."""
    return {"message": "Virtual Try-On API is running"}

if __name__ == "__main__":
    # Configure server
    config = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=8000,
        workers=1,  # Single worker for better stability
        loop="asyncio",
        timeout_keep_alive=300,  # Increased keep-alive timeout
        access_log=True,
        log_level="info"
    )
    
    # Add gzip compression
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    # Run server
    server = uvicorn.Server(config)
    try:
        server.run()
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        cleanup_memory() 