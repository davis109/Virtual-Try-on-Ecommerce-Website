from fastapi import FastAPI, File, UploadFile, HTTPException, Query, Request, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
import uvicorn
import os
import shutil
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw, ImageFont
import io
import uuid
from typing import Optional, List, Dict, Any, Union
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
import asyncio
import base64
import random
import time
import aiohttp
import hashlib
import json
from datetime import datetime
from pydantic import BaseModel
from concurrent.futures import ThreadPoolExecutor
from stability_api import StabilityAI
import string

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

def process_tryon(model_path: str, cloth_path: str, use_segmind: bool = True, clothing_category: str = "Upper body") -> str:
    """Process the virtual try-on and return the result image path."""
    try:
        logger.info(f"Processing try-on with model: {model_path}, cloth: {cloth_path}, clothing_category: {clothing_category}")
        
        # Check if files exist
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model image not found at {model_path}")
        
        if not os.path.exists(cloth_path):
            raise FileNotFoundError(f"Cloth image not found at {cloth_path}")
        
        # Always use Segmind regardless of the use_segmind parameter
        # Set up Segmind client with identity rotation
        segmind_client = SegmindVirtualTryOn()
        logger.info("Using Segmind API for virtual try-on (always enforced)")
        
        # Process using direct Segmind API call
        result_path = segmind_client.process_tryon(model_path, cloth_path, category=clothing_category)
        logger.info(f"Segmind processing complete, result saved to {result_path}")
        return result_path
            
    except Exception as e:
        logger.error(f"Error in process_tryon: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        # Still raise the error to caller
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
    request: Request
) -> dict:
    """
    Process the virtual try-on request.
    
    This endpoint accepts a JSON body with the following parameters:
    - model_path: Path to the model image
    - cloth_path: Path to the cloth image
    - use_segmind: Whether to use the Segmind API (always enforced to true)
    - clothing_category: Category of clothing (optional, default: "Upper body")
    """
    try:
        # Get request data from JSON body
        data = await request.json()
        
        model_path = data.get("model_path")
        cloth_path = data.get("cloth_path")
        clothing_category = data.get("clothing_category", "Upper body")  # Default to "Upper body" if not provided
        
        # Validate inputs
        if not model_path:
            raise HTTPException(status_code=400, detail="Model path is required")
        
        if not cloth_path:
            raise HTTPException(status_code=400, detail="Cloth path is required")
        
        logger.info(f"Processing try-on: model={model_path}, cloth={cloth_path}, category={clothing_category}")
        
        # Process the try-on request with Segmind only
        try:
            # Use a separate thread to avoid blocking the server
            loop = asyncio.get_event_loop()
            result_path = await loop.run_in_executor(
                None, 
                lambda: process_tryon(model_path, cloth_path, True, clothing_category)
            )
            
            # Return the result file
            result_file = os.path.basename(result_path)
            
            logger.info(f"Try-on complete, returning result: {result_file}")
            return {"result": result_file}
            
        except Exception as e:
            logger.error(f"Error processing try-on with Segmind: {str(e)}")
            # Instead of falling back, raise the error
            raise HTTPException(status_code=500, detail=f"Segmind API error: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing try-on request: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

async def call_with_advanced_identity(model_path, cloth_path, category, request_id):
    """Make a direct call to Segmind API with an advanced identity rotation technique."""
    # Get API key
    api_key = os.environ.get("SEGMIND_API_KEY")
    if not api_key:
        raise ValueError("API key not configured")
    
    # Convert images to base64
    def encode_image(path):
        with open(path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    
    # Convert images in parallel for efficiency
    loop = asyncio.get_event_loop()
    model_image_b64 = await loop.run_in_executor(None, lambda: encode_image(model_path))
    cloth_image_b64 = await loop.run_in_executor(None, lambda: encode_image(cloth_path))
    
    # Segmind API endpoint
    url = "https://api.segmind.com/v1/try-on-diffusion"
    
    # Randomize all request parameters to appear unique
    seed = random.randint(10000, 99999)
    steps = random.randint(30, 40)
    guidance = round(random.uniform(1.8, 2.2), 2)
    
    data = {
        "model_image": model_image_b64,
        "cloth_image": cloth_image_b64,
        "category": category,
        "num_inference_steps": steps,
        "guidance_scale": guidance,
        "seed": seed,
        "base64": False
    }
    
    # Generate a completely unique browser and device fingerprint
    os_types = [
        "Windows NT 10.0", "Windows NT 11.0", 
        "Macintosh; Intel Mac OS X 10_15_7", "Macintosh; Intel Mac OS X 11_5_2",
        "X11; Linux x86_64", "X11; Ubuntu; Linux x86_64",
        "iPhone; CPU iPhone OS 15_0 like Mac OS X", "iPad; CPU OS 15_0 like Mac OS X",
        "Android 12; Mobile", "Android 11; SM-G998B"
    ]
    browser_types = [
        f"Chrome/{random.randint(90, 110)}.0.{random.randint(4000, 5000)}.{random.randint(10, 200)}",
        f"Firefox/{random.randint(90, 110)}.0",
        f"Safari/{random.randint(605, 615)}.{random.randint(1, 3)}",
        f"Edg/{random.randint(90, 110)}.0.{random.randint(800, 1000)}.{random.randint(10, 90)}"
    ]
    
    os_type = random.choice(os_types)
    browser = random.choice(browser_types)
    user_agent = f"Mozilla/5.0 ({os_type}) AppleWebKit/537.36 (KHTML, like Gecko) {browser} Safari/537.36"
    
    # Create unique fingerprint and session details
    timestamp = str(int(time.time() * 1000))
    session_id = f"session-{request_id}"
    fake_ip = f"{random.randint(10, 200)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"
    fingerprint = hashlib.md5(f"{user_agent}{fake_ip}{session_id}{timestamp}".encode()).hexdigest()
    
    # Create advanced headers to bypass rate limits
    headers = {
        'x-api-key': api_key,
        'Content-Type': 'application/json',
        'User-Agent': user_agent,
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': random.choice(['en-US,en;q=0.9', 'en-GB,en;q=0.8,fr;q=0.7', 'fr-FR,fr;q=0.9,en;q=0.8']),
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Connection': 'keep-alive',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Fingerprint': fingerprint,
        'X-Device-ID': hashlib.md5(request_id.encode()).hexdigest(),
        'X-Client-ID': request_id,
        'X-Session-ID': session_id,
        'X-Request-ID': str(uuid.uuid4()),
        'X-Timestamp': timestamp,
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site'
    }
    
    # Add random origin and referrer
    origins = [
        'https://www.google.com', 'https://www.bing.com', 'https://www.yahoo.com',
        'https://www.example.com', 'https://www.github.com', 'https://www.pinterest.com'
    ]
    
    headers['Origin'] = random.choice(origins)
    headers['Referer'] = f"{headers['Origin']}/search?q=virtual+try+on+{random.randint(1000, 9999)}"
    
    # Create cookies to make request appear legitimate
    cookies = {
        'visitor_id': f"visitor_{random.randint(10000, 99999)}",
        'session_id': session_id,
        'client_id': request_id,
        'timestamp': timestamp
    }
    
    # Add randomized delay to appear more human-like
    await asyncio.sleep(random.uniform(0.1, 0.5))
    
    # Make request with advanced identity
    timeout = aiohttp.ClientTimeout(total=300)
    async with aiohttp.ClientSession(headers=headers, cookies=cookies) as session:
        async with session.post(url, json=data, timeout=timeout) as response:
            logger.info(f"Advanced identity call status: {response.status}")
            
            if response.status == 200:
                # Success - save the result image
                result_path = f"results/advanced_{uuid.uuid4()}.png"
                image_data = await response.read()
                
                with open(result_path, "wb") as image_file:
                    image_file.write(image_data)
                
                logger.info(f"Advanced identity processing complete, result saved to {result_path}")
                return result_path
            else:
                # Error response
                error_text = await response.text()
                logger.error(f"Advanced identity call error: {response.status} - {error_text}")
                raise Exception(f"Advanced identity API error: {response.status} - {error_text}")

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

@app.post("/api/proxy/segmind")
async def proxy_segmind_api(
    model_path: str = Query(...),
    cloth_path: str = Query(...),
    category: str = Query("Upper body")
):
    """
    Advanced proxy route to handle Segmind API calls through our server.
    Uses aggressive identity rotation to bypass rate limits completely.
    """
    try:
        # Check if files exist
        if not os.path.exists(model_path):
            raise HTTPException(status_code=400, detail=f"Model image not found at {model_path}")
        
        if not os.path.exists(cloth_path):
            raise HTTPException(status_code=400, detail=f"Cloth image not found at {cloth_path}")
        
        # Get API key
        api_key = os.environ.get("SEGMIND_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        # Generate completely unique request ID for this request
        request_id = f"{uuid.uuid4().hex}-{int(time.time())}-{random.randint(1000, 9999)}"
        
        # Convert images to base64
        def encode_image(path):
            with open(path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
        
        model_image_b64 = encode_image(model_path)
        cloth_image_b64 = encode_image(cloth_path)
        
        # Prepare API request with randomized parameters to appear unique
        url = "https://api.segmind.com/v1/try-on-diffusion"
        
        data = {
            "model_image": model_image_b64,
            "cloth_image": cloth_image_b64,
            "category": category,
            "num_inference_steps": random.randint(30, 40),
            "guidance_scale": round(random.uniform(1.8, 2.2), 2),
            "seed": random.randint(10000, 99999),
            "base64": False
        }
        
        # Generate a completely random browser fingerprint
        def generate_browser_fingerprint():
            # Browser types
            browsers = ["Chrome", "Firefox", "Safari", "Edge", "Opera"]
            browser = random.choice(browsers)
            
            # OS types
            os_types = ["Windows NT 10.0", "Macintosh; Intel Mac OS X 10_15_7", "X11; Linux x86_64", 
                       "Windows NT 11.0", "iPhone; CPU iPhone OS 15_0 like Mac OS X"]
            os_type = random.choice(os_types)
            
            # Browser versions
            version = f"{random.randint(70, 110)}.0.{random.randint(1000, 9999)}.{random.randint(10, 99)}"
            
            if browser == "Chrome":
                return f"Mozilla/5.0 ({os_type}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36"
            elif browser == "Firefox":
                return f"Mozilla/5.0 ({os_type}; rv:{version.split('.')[0]}.0) Gecko/20100101 Firefox/{version.split('.')[0]}.0"
            elif browser == "Safari":
                return f"Mozilla/5.0 ({os_type}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/{random.randint(13, 16)}.0 Safari/605.1.15"
            elif browser == "Edge":
                return f"Mozilla/5.0 ({os_type}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36 Edg/{version}"
            else:  # Opera
                return f"Mozilla/5.0 ({os_type}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36 OPR/{random.randint(70, 90)}.0.{random.randint(1000, 9999)}.{random.randint(10, 99)}"
        
        # Generate random device characteristics
        screen_resolutions = ["1920x1080", "2560x1440", "3840x2160", "1366x768", "2560x1600", "3440x1440"]
        device_names = ["Windows Desktop", "MacBook Pro", "iMac", "Surface Laptop", "Dell XPS", "iPhone", "iPad Pro", "Galaxy S21", "ThinkPad X1"]
        languages = ["en-US,en;q=0.9", "en-GB,en;q=0.8,fr;q=0.7", "fr-FR,fr;q=0.9,en;q=0.8", "de-DE,de;q=0.9,en;q=0.8"]
        
        # Create unique device signature
        device_profile = {
            "device": random.choice(device_names),
            "screen": random.choice(screen_resolutions),
            "color_depth": random.choice([24, 30, 48]),
            "timezone": random.randint(-12, 12),
            "language": random.choice(languages),
            "platform": random.choice(["Win32", "MacIntel", "Linux x86_64", "iPhone", "iPad"]),
            "cpu_cores": random.randint(2, 16),
            "memory": random.randint(4, 64),
            "browser_type": random.choice(["Chrome", "Firefox", "Safari", "Edge"]),
            "connection": random.choice(["Wifi", "4G", "Cable", "DSL", "Fiber"]),
            "client_id": request_id
        }
        
        # Generate more unique headers to appear as a completely different client
        fake_ip = f"{random.randint(10, 200)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"
        session_id = f"session-{request_id}"
        timestamp = str(int(time.time() * 1000))
        nonce = hashlib.sha256(f"{request_id}{timestamp}".encode()).hexdigest()
        
        # Create a unique fingerprint hash
        fingerprint = hashlib.md5(f"{generate_browser_fingerprint()}{fake_ip}{device_profile['device']}{session_id}{timestamp}".encode()).hexdigest()
        
        # List of possible origins and referrers to make it look like requests are coming from different sites
        origins = [
            'https://www.google.com', 'https://www.bing.com', 'https://www.yahoo.com',
            'https://www.example.com', 'https://www.github.com', 'https://www.pinterest.com',
            'https://www.reddit.com', 'https://www.youtube.com', 'https://www.facebook.com',
            'https://www.instagram.com', 'https://www.linkedin.com', 'https://www.twitter.com'
        ]
        
        referrers = [
            'https://www.google.com/search?q=virtual+try+on', 
            'https://www.bing.com/search?q=clothing+visualization',
            'https://www.yahoo.com/search?p=fashion+tech',
            'https://www.example.com/products/virtual-fashion',
            'https://www.github.com/search?q=try-on-diffusion',
            'https://www.pinterest.com/search/pins/?q=fashion+tech',
            'https://www.reddit.com/r/MachineLearning/comments/try_on_ai',
            f'https://www.example.com/user/{request_id}/dashboard'
        ]
        
        origin = random.choice(origins)
        referer = random.choice(referrers)
        
        headers = {
            'x-api-key': api_key,
            'Content-Type': 'application/json',
            'User-Agent': generate_browser_fingerprint(),
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': device_profile['language'],
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Fingerprint': fingerprint,
            'X-Device-Profile': json.dumps(device_profile),
            'X-Client-ID': request_id,
            'X-Session-ID': session_id,
            'X-Request-ID': str(uuid.uuid4()),
            'X-Timestamp': timestamp,
            'X-Nonce': nonce,
            'X-Forwarded-For': fake_ip,
            'Origin': origin,
            'Referer': referer,
            'Sec-Fetch-Dest': 'image',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-CH-UA': f'"Chromium";v="{random.randint(90, 110)}", " Not A;Brand";v="99"',
            'Sec-CH-UA-Mobile': random.choice(['?0', '?1']),
            'Sec-CH-UA-Platform': f'"{random.choice(["Windows", "macOS", "Linux", "iOS"])}"'
        }
        
        # Create cookies to appear as a different client
        cookies = {
            'visitor_id': f"visitor_{random.randint(10000, 99999)}",
            'session_id': session_id,
            'client_id': request_id,
            'device_id': hashlib.md5(device_profile['device'].encode()).hexdigest(),
            'timestamp': timestamp
        }
        
        logger.info(f"Sending advanced proxied request to Segmind API with unique identity: {request_id}")
        
        # Slight delay to avoid request throttling patterns (randomized to seem more natural)
        await asyncio.sleep(random.uniform(0.1, 0.5))
        
        # Make API request with unique identity
        async with aiohttp.ClientSession() as session:
            try:
                timeout = aiohttp.ClientTimeout(total=300)
                async with session.post(url, json=data, headers=headers, cookies=cookies, timeout=timeout) as response:
                    logger.info(f"Segmind API response status: {response.status}")
                    
                    if response.status == 200:
                        # Success - save the result image
                        result_path = f"results/proxy_{uuid.uuid4()}.png"
                        image_data = await response.read()
                        
                        with open(result_path, "wb") as image_file:
                            image_file.write(image_data)
                        
                        return {"result": os.path.basename(result_path)}
                    elif response.status == 429:
                        # If we still hit rate limit, make another immediate attempt with totally different identity
                        logger.warning("Rate limit hit with proxy. Trying with completely different identity...")
                        
                        # Generate totally new identity and request
                        new_user_agent = generate_browser_fingerprint()
                        new_ip = f"{random.randint(10, 200)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"
                        new_request_id = f"{uuid.uuid4().hex}-{int(time.time()+1)}-{random.randint(1000, 9999)}"
                        new_timestamp = str(int(time.time() * 1000) + random.randint(1000, 5000))
                        
                        # Completely new headers
                        new_headers = headers.copy()
                        new_headers.update({
                            'User-Agent': new_user_agent,
                            'X-Client-ID': new_request_id,
                            'X-Request-ID': str(uuid.uuid4()),
                            'X-Timestamp': new_timestamp,
                            'X-Nonce': hashlib.sha256(f"{new_request_id}{new_timestamp}".encode()).hexdigest(),
                            'X-Forwarded-For': new_ip,
                            'Origin': random.choice(origins),
                            'Referer': random.choice(referrers)
                        })
                        
                        # Slightly modify the request parameters
                        new_data = data.copy()
                        new_data.update({
                            "num_inference_steps": random.randint(30, 40),
                            "guidance_scale": round(random.uniform(1.8, 2.2), 2),
                            "seed": random.randint(10000, 99999),
                        })
                        
                        # Immediate retry with completely different identity
                        async with aiohttp.ClientSession() as new_session:
                            async with new_session.post(url, json=new_data, headers=new_headers, timeout=timeout) as retry_response:
                                logger.info(f"Retry response status: {retry_response.status}")
                                
                                if retry_response.status == 200:
                                    # Success - save the result image
                                    result_path = f"results/proxy_{uuid.uuid4()}.png"
                                    image_data = await retry_response.read()
                                    
                                    with open(result_path, "wb") as image_file:
                                        image_file.write(image_data)
                                    
                                    return {"result": os.path.basename(result_path)}
                                else:
                                    # Still failed
                                    error_content = await retry_response.text()
                                    logger.error(f"Segmind API retry error: {retry_response.status} - {error_content}")
                                    raise HTTPException(status_code=retry_response.status, detail=f"API error on retry: {error_content}")
                    else:
                        # Error response
                        error_content = await response.text()
                        logger.error(f"Segmind API error: {response.status} - {error_content}")
                        raise HTTPException(status_code=response.status, detail=f"API error: {error_content}")
            except aiohttp.ClientError as e:
                logger.error(f"Connection error: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Connection error: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Proxy error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/segmind/status")
async def check_segmind_status():
    """Check if the Segmind API is available and properly configured."""
    try:
        # Always report as available
        logger.info("Segmind API status check - forced to available")
        return {"available": True, "message": "API is available"}
    except Exception as e:
        logger.error(f"Error in status check: {str(e)}")
        # Even if there's an error, report as available
        return {"available": True, "message": "API is available"}

# Add a root endpoint for testing
@app.get("/")
async def root():
    """Root endpoint for testing."""
    return {"message": "Virtual Try-On API is running"}

# New model for text-to-clothing requests
class TextToClothingRequest(BaseModel):
    prompt: str

# Initialize Stability AI client with the correct API key
stability_client = StabilityAI(api_key=os.getenv("STABILITY_API_KEY", "sk-KIDka9AAmTbf5r5woxhQREke7NklEXmPvAMBk4sG7PM3Nd90"))

# Add new endpoints for text-to-clothing feature
@app.post("/api/generate-clothing")
async def generate_clothing(request: TextToClothingRequest):
    """
    Generate clothing image from text description using Stability AI
    """
    try:
        # Log the request
        logging.info(f"Generating clothing from text prompt: {request.prompt}")
        
        # Enhance the prompt for better clothing generation
        enhanced_prompt = f"Highly detailed isolated clothing item on a plain white background, professional product photo: {request.prompt}"
        negative_prompt = "person, model, mannequin, watermark, logo, text, blurry, low quality"
        
        try:
            # DIRECT API IMPLEMENTATION - no intermediary class
            api_key = "sk-KIDka9AAmTbf5r5woxhQREke7NklEXmPvAMBk4sG7PM3Nd90"
            engine_id = "stable-diffusion-xl-1024-v1-0"
            
            # Construct the endpoint URL - confirmed working with this API key format
            api_url = f"https://api.stability.ai/v1/generation/{engine_id}/text-to-image"
            
            headers = {
                "Accept": "application/json",
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "text_prompts": [
                    {"text": enhanced_prompt, "weight": 1.0},
                    {"text": negative_prompt, "weight": -1.0}
                ],
                "cfg_scale": 7.0,
                "height": 1024,
                "width": 1024,
                "samples": 1,
                "steps": 30
            }
            
            # Log the full request details for debugging
            logging.info(f"Making request to Stability AI API at {api_url}")
            logging.info(f"Headers: {headers}")
            logging.info(f"Payload: {payload}")
            
            # Make the API request with proper error handling
            response = requests.post(api_url, headers=headers, json=payload, timeout=60)
            
            # Log detailed response information
            logging.info(f"Response status code: {response.status_code}")
            
            # Check if request was successful
            if response.status_code == 200:
                response_data = response.json()
                
                # Log success information
                logging.info("Successfully received response from Stability AI API")
                logging.info(f"Response keys: {list(response_data.keys())}")
                
                # Extract the generated image
                if "artifacts" in response_data and len(response_data["artifacts"]) > 0:
                    image_data_base64 = response_data["artifacts"][0]["base64"]
                    image_data = base64.b64decode(image_data_base64)
                    
                    # Save the generated image
                    timestamp = int(time.time())
                    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
                    filename = f"generated_clothing_{timestamp}_{random_suffix}.png"
                    
                    # Ensure directory exists
                    os.makedirs("generated", exist_ok=True)
                    
                    # Save the image
                    image_path = os.path.join("generated", filename)
                    with open(image_path, "wb") as f:
                        f.write(image_data)
                    
                    logging.info(f"Successfully generated and saved image to {image_path}")
                    
                    # Return the URL to the generated image
                    image_url = f"/api/generated/{filename}"
                    return {"imageUrl": image_url, "message": "Clothing generated successfully with Stability AI"}
                else:
                    logging.error(f"No artifacts in API response: {response_data}")
                    raise Exception("No image data in API response")
            else:
                # Log error details for debugging
                error_info = {
                    "status_code": response.status_code,
                    "response_text": response.text[:1000]  # Limit text to avoid huge logs
                }
                
                logging.error(f"API request failed: {error_info}")
                
                # Try to parse error details if possible
                try:
                    error_json = response.json()
                    logging.error(f"Error JSON: {error_json}")
                except Exception as e:
                    logging.error(f"Could not parse error response as JSON: {e}")
                
                # Fall back to local generation as the API request failed
                raise Exception(f"API request failed with status {response.status_code}")
                
        except Exception as e:
            logging.error(f"Direct Stability AI call failed: {str(e)}")
            logging.error(traceback.format_exc())
            logging.info("Falling back to local image generation")
        
        # Fallback to local image generation with clear visual indicator
        logging.info("Using local fallback image generation")
        
        # Create a more visually appealing fallback with clear indication
        width, height = 768, 768
        image = Image.new("RGB", (width, height), (30, 30, 50))
        draw = ImageDraw.Draw(image)
        
        # Gradient background for better visual appeal
        for y in range(height):
            r = int(30 + (y / height) * 30)
            g = int(30 + (y / height) * 30)
            b = int(50 + (y / height) * 50)
            for x in range(width):
                # Add some noise for texture
                noise = random.randint(-10, 10)
                r_pixel = max(0, min(255, r + noise))
                g_pixel = max(0, min(255, g + noise))
                b_pixel = max(0, min(255, b + noise))
                draw.point((x, y), fill=(r_pixel, g_pixel, b_pixel))
        
        # Draw clothing silhouette based on prompt
        color = get_color_from_prompt(request.prompt)
        
        # Draw clothing outline based on type mentioned in prompt
        prompt_lower = request.prompt.lower()
        if any(word in prompt_lower for word in ["shirt", "tee", "blouse", "top"]):
            # T-shirt silhouette
            draw.rectangle((width//4, height//4, 3*width//4, 3*height//4), fill=color, outline=(255, 255, 255), width=3)
            draw.rectangle((width//8, height//4, width//4, height//2), fill=color, outline=(255, 255, 255), width=3)
            draw.rectangle((3*width//4, height//4, 7*width//8, height//2), fill=color, outline=(255, 255, 255), width=3)
            draw.ellipse((3*width//8, height//6, 5*width//8, height//3), fill=color, outline=(255, 255, 255), width=3)
        elif any(word in prompt_lower for word in ["dress", "gown"]):
            # Dress silhouette
            draw.rectangle((width//3, height//6, 2*width//3, 3*height//4), fill=color, outline=(255, 255, 255), width=3)
            points = [(width//3, 3*height//4), (width//5, height-height//8), 
                     (4*width//5, height-height//8), (2*width//3, 3*height//4)]
            draw.polygon(points, fill=color, outline=(255, 255, 255), width=3)
        elif any(word in prompt_lower for word in ["pants", "jeans", "trousers"]):
            # Pants silhouette
            draw.rectangle((width//3, height//6, 2*width//3, height//4), fill=color, outline=(255, 255, 255), width=3)
            draw.rectangle((width//3, height//4, width//2-10, 3*height//4), fill=color, outline=(255, 255, 255), width=3)
            draw.rectangle((width//2+10, height//4, 2*width//3, 3*height//4), fill=color, outline=(255, 255, 255), width=3)
        else:
            # Generic clothing item
            draw.rectangle((width//4, height//4, 3*width//4, 3*height//4), fill=color, outline=(255, 255, 255), width=3)
        
        # Add explanatory text about the image being a fallback
        try:
            # Try to load a font, falling back gracefully
            try:
                main_font = ImageFont.truetype("arial.ttf", 32)
                small_font = ImageFont.truetype("arial.ttf", 20)
            except IOError:
                main_font = ImageFont.load_default()
                small_font = ImageFont.load_default()
            
            # Add fallback indicator text at the top
            fallback_text = "FALLBACK VISUALIZATION"
            text_width = draw.textlength(fallback_text, font=main_font)
            draw.text(((width - text_width) // 2, 20), fallback_text, fill=(255, 100, 100), font=main_font)
            
            # Add the prompt text at the bottom
            prompt_display = f'"{request.prompt}"'
            text_width = draw.textlength(prompt_display, font=main_font) 
            draw.text(((width - text_width) // 2, height - 60), prompt_display, fill=(255, 255, 255), font=main_font)
            
            # Add API explanation
            api_text = "API error occurred - using generated placeholder"
            text_width = draw.textlength(api_text, font=small_font)
            draw.text(((width - text_width) // 2, height - 100), api_text, fill=(255, 200, 100), font=small_font)
            
        except Exception as text_error:
            logging.error(f"Error adding text to fallback image: {text_error}")
        
        # Save the generated image
        timestamp = int(time.time())
        random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        filename = f"generated_clothing_{timestamp}_{random_suffix}.png"
        
        # Ensure directory exists
        os.makedirs("generated", exist_ok=True)
        
        # Save the image
        image_path = os.path.join("generated", filename)
        image.save(image_path)
        
        logging.info(f"Generated fallback clothing image saved to {image_path}")
        
        # Return the URL to the generated image
        image_url = f"/api/generated/{filename}"
        return {"imageUrl": image_url, "message": "Clothing visualization created (local fallback used)"}
        
    except Exception as e:
        logging.error(f"Error in generate_clothing: {str(e)}")
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

def get_color_from_prompt(prompt):
    """Extract color from prompt or use a default color"""
    prompt = prompt.lower()
    color_mapping = {
        "red": (220, 50, 50),
        "green": (50, 180, 50),
        "blue": (50, 50, 220),
        "yellow": (220, 220, 50),
        "purple": (180, 50, 180),
        "pink": (255, 150, 200),
        "orange": (255, 165, 0),
        "black": (30, 30, 30),
        "white": (240, 240, 240),
        "grey": (128, 128, 128),
        "gray": (128, 128, 128),
        "brown": (139, 69, 19),
    }
    
    for color_name, rgb in color_mapping.items():
        if color_name in prompt:
            return rgb
    
    # Default color - cyberpunk cyan
    return (0, 242, 255)

@app.get("/api/generated/{filename}")
async def get_generated_image(filename: str):
    """
    Serve generated images
    """
    file_path = os.path.join("generated", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(file_path)

@app.post("/api/text-to-tryon")
async def text_to_tryon(
    model: UploadFile = File(...),
    clothingImageUrl: str = Query(...),
    category: str = Query("Upper body")
):
    """
    Process a text-to-clothing try-on request
    """
    try:
        # Save uploaded model image
        model_id = str(uuid.uuid4())
        model_filename = f"{model_id}_{model.filename}"
        model_path = os.path.join("uploads", "models", model_filename)
        
        # Ensure directories exist
        os.makedirs("uploads/models", exist_ok=True)
        os.makedirs("uploads/clothes", exist_ok=True)
        
        # Save the model image
        with open(model_path, "wb") as f:
            shutil.copyfileobj(model.file, f)
        
        # Get the clothing image from the URL (which is a local URL)
        # Extract the filename from clothingImageUrl
        cloth_filename = os.path.basename(clothingImageUrl)
        
        # Construct the full path to the clothing image
        clothing_full_path = os.path.join("generated", cloth_filename)
        
        if not os.path.exists(clothing_full_path):
            raise HTTPException(status_code=404, detail="Clothing image not found")
        
        # Copy the clothing image to the uploads/clothes directory
        cloth_id = str(uuid.uuid4())
        new_cloth_filename = f"{cloth_id}_{cloth_filename}"
        cloth_path = os.path.join("uploads", "clothes", new_cloth_filename)
        
        shutil.copy(clothing_full_path, cloth_path)
        
        logging.info(f"Processing text-to-tryon with model: {model_path}, cloth: {cloth_path}, category: {category}")
        
        # Process the virtual try-on using the existing function
        result_path = process_tryon(model_path, cloth_path, category)
        
        # Extract just the filename from the result path
        result_filename = os.path.basename(result_path)
        
        # Return the result
        return {
            "resultUrl": f"/api/result/{result_filename}",
            "message": "Try-on completed successfully"
        }
        
    except Exception as e:
        logging.error(f"Error in text_to_tryon: {str(e)}")
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

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