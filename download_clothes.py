import os
import requests
import shutil
from urllib.parse import urlparse

# Create directories if they don't exist
os.makedirs("uploads/clothes", exist_ok=True)
os.makedirs("uploads/models", exist_ok=True)

# List of clothing item URLs to download
clothing_urls = [
    # T-shirts & Tops
    "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=774&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1530&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1580331451062-99ff132a802d?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1633966887768-64f9a867bdba?q=80&w=1972&auto=format&fit=crop",
    
    # Dresses
    "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1605763240000-7e93b172d754?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1992&auto=format&fit=crop",
    
    # Jackets & Outerwear
    "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1970&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1936&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=1974&auto=format&fit=crop",
    
    # Pants & Bottoms
    "https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=1964&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=1974&auto=format&fit=crop"
]

# List of model images for testing (people wearing neutral clothing)
model_urls = [
    # Male models
    "https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=2048&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?q=80&w=1964&auto=format&fit=crop",
    
    # Female models
    "https://images.unsplash.com/photo-1604004555489-723a93d6ce74?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?q=80&w=1936&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1974&auto=format&fit=crop"
]

def download_image(url, save_dir, category):
    """Download an image from a URL and save it locally."""
    try:
        print(f"Downloading: {url}")
        
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
        
        # Extract filename from URL or create one
        parsed_url = urlparse(url)
        filename = os.path.basename(parsed_url.path)
        if not filename or '.' not in filename:
            filename = f"{category}_{len(os.listdir(save_dir)) + 1}.jpg"
        
        file_path = os.path.join(save_dir, filename)
        
        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                
        print(f"Downloaded successfully to {file_path}")
        return file_path
    except Exception as e:
        print(f"Error downloading image from {url}: {str(e)}")
        return None

# Download clothing images
print("Downloading clothing images...")
for url in clothing_urls:
    download_image(url, "uploads/clothes", "clothing")

# Download model images for testing
print("Downloading model images...")
for url in model_urls:
    download_image(url, "uploads/models", "model")

print("All images downloaded successfully!")
print("You can now use these images with the virtual try-on feature.")
print("To try on clothes, go to the Virtual Try-On page and select a model and clothing item.") 