import requests
import os
import base64
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def encode_image(image_path):
    """Encode image to base64"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def test_segmind_api():
    # Get API key from environment variable
    api_key = os.getenv("SEGMIND_API_KEY")
    if not api_key:
        print("Error: SEGMIND_API_KEY environment variable not set")
        return
    
    print(f"Using API key: {api_key}")
    
    # Define the API endpoint
    url = "https://api.segmind.com/v1/try-on-diffusion"
    
    # Sample image paths - replace with actual paths to your test images
    model_image_path = "uploads/models/8656883e-7b96-49c7-81e2-9dab47791fbb_zz.png"  # Replace with your model image
    cloth_image_path = "uploads/clothes/e135ee78-2cad-489b-9e15-c69b00819197_WhatsApp Image 2025-03-10 at 01.43.51_240b9ad4.png"  # Replace with your cloth image
    
    # Check if files exist
    if not os.path.exists(model_image_path):
        print(f"Error: Model image not found at {model_image_path}")
        return
    
    if not os.path.exists(cloth_image_path):
        print(f"Error: Cloth image not found at {cloth_image_path}")
        return
    
    print("Encoding images...")
    
    # Encode images to base64
    model_image_b64 = encode_image(model_image_path)
    cloth_image_b64 = encode_image(cloth_image_path)
    
    print("Preparing request payload...")
    
    # Prepare payload
    payload = {
        "model_image": model_image_b64,
        "cloth_image": cloth_image_b64,
        "category": "Upper body",  # Valid categories: "Upper body", "Lower body", "Dress"
        "num_inference_steps": 35,
        "guidance_scale": 2,
        "seed": 12467,
        "base64": False
    }
    
    # Prepare headers
    headers = {
        'x-api-key': api_key,
        'Content-Type': 'application/json'
    }
    
    print("Sending request to Segmind API...")
    
    # Make API request
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=120)
        
        print(f"Response status code: {response.status_code}")
        
        # Check response
        if response.status_code == 200:
            print("Success! Saving result image...")
            
            # Save the result image
            output_path = "test_result.png"
            with open(output_path, "wb") as image_file:
                image_file.write(response.content)
            
            print(f"Result saved to {output_path}")
        else:
            print(f"Error: {response.status_code}")
            print(f"Response text: {response.text}")
    
    except Exception as e:
        print(f"Exception occurred: {str(e)}")

if __name__ == "__main__":
    test_segmind_api() 