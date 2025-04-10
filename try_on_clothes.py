import os
import argparse
import requests
from PIL import Image
import glob
import webbrowser
import time
import json

def list_files(directory):
    """List all image files in the specified directory with numbered indices."""
    files = glob.glob(os.path.join(directory, "*.*"))
    # Filter only image files
    image_files = [f for f in files if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
    
    print(f"\n{'='*50}")
    print(f"Available {os.path.basename(directory)}:")
    print(f"{'='*50}")
    
    for idx, file in enumerate(image_files):
        print(f"[{idx+1}] {os.path.basename(file)}")
    
    return image_files

def select_file(files, prompt):
    """Let user select a file from the list by number."""
    while True:
        try:
            choice = int(input(prompt))
            if 1 <= choice <= len(files):
                return files[choice-1]
            else:
                print(f"Please enter a number between 1 and {len(files)}")
        except ValueError:
            print("Please enter a valid number")

def process_tryon(model_path, cloth_path, use_segmind=True, clothing_category="Upper body"):
    """Send a request to the API to process the virtual try-on."""
    api_url = "http://localhost:8000/api/tryon"
    
    # Add file:// prefix for local files to ensure the API can read them
    model_path = f"file://{os.path.abspath(model_path)}"
    cloth_path = f"file://{os.path.abspath(cloth_path)}"
    
    params = {
        "model_path": model_path,
        "cloth_path": cloth_path,
        "use_segmind": "true" if use_segmind else "false",
        "clothing_category": clothing_category
    }
    
    try:
        print(f"\nProcessing try-on with Segmind API: {use_segmind}")
        print(f"Model: {os.path.basename(model_path)}")
        print(f"Clothing: {os.path.basename(cloth_path)}")
        print(f"Category: {clothing_category}")
        
        response = requests.get(api_url, params=params)
        response.raise_for_status()
        
        result = response.json()
        result_path = f"results/{result['result']}"
        
        print(f"\nTry-on completed! Result saved to: {result_path}")
        
        # Open the result image
        try:
            # Try to use built-in image viewer
            img = Image.open(result_path)
            img.show()
        except Exception:
            # If that fails, try to open in browser
            webbrowser.open(f"file://{os.path.abspath(result_path)}")
        
        return result_path
    except Exception as e:
        print(f"Error processing try-on: {str(e)}")
        return None

def select_clothing_category():
    """Let user select the clothing category."""
    categories = ["Upper body", "Lower body", "Full body"]
    
    print(f"\n{'='*50}")
    print("Select clothing category:")
    print(f"{'='*50}")
    
    for idx, category in enumerate(categories):
        print(f"[{idx+1}] {category}")
    
    while True:
        try:
            choice = int(input("\nEnter category number (1-3): "))
            if 1 <= choice <= len(categories):
                return categories[choice-1]
            else:
                print(f"Please enter a number between 1 and {len(categories)}")
        except ValueError:
            print("Please enter a valid number")

def main():
    print("\n" + "="*60)
    print("       VIRTUAL TRY-ON WITH SEGMIND API")
    print("="*60)
    print("\nThis script will help you try on clothes using the Segmind API.")
    print("First, we'll select a model image and a clothing item image.")
    
    # List available model images
    model_files = list_files("uploads/models")
    if not model_files:
        print("No model images found. Please run download_clothes.py first.")
        return
    
    # Let user select a model
    model_path = select_file(model_files, "\nEnter model number: ")
    
    # List available clothing images
    clothing_files = list_files("uploads/clothes")
    if not clothing_files:
        print("No clothing images found. Please run download_clothes.py first.")
        return
    
    # Let user select a clothing item
    cloth_path = select_file(clothing_files, "\nEnter clothing number: ")
    
    # Let user select clothing category
    category = select_clothing_category()
    
    # Ask about using Segmind API
    use_segmind = input("\nUse Segmind API for better results? (y/n): ").lower() == 'y'
    
    # Process the try-on
    process_tryon(model_path, cloth_path, use_segmind, category)
    
    print("\nThank you for using the Virtual Try-On tool!")

if __name__ == "__main__":
    main() 