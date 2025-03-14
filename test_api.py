import requests
import os
import sys
import argparse

API_URL = 'http://localhost:8000'

def test_upload_model():
    """Test uploading a model image."""
    # Create a test image if it doesn't exist
    if not os.path.exists('test_model.jpg'):
        print("Creating test model image...")
        with open('test_model.jpg', 'wb') as f:
            f.write(b'test image data')
    
    # Upload the test image
    print("Uploading test model image...")
    with open('test_model.jpg', 'rb') as f:
        files = {'file': ('test_model.jpg', f, 'image/jpeg')}
        response = requests.post(f'{API_URL}/api/upload/model', files=files)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response content: {response.content}")
    
    if response.status_code == 200:
        print("Upload successful!")
        return response.json()['filename']
    else:
        print("Upload failed!")
        return None

def test_upload_cloth():
    """Test uploading a cloth image."""
    # Create a test image if it doesn't exist
    if not os.path.exists('test_cloth.jpg'):
        print("Creating test cloth image...")
        with open('test_cloth.jpg', 'wb') as f:
            f.write(b'test image data')
    
    # Upload the test image
    print("Uploading test cloth image...")
    with open('test_cloth.jpg', 'rb') as f:
        files = {'file': ('test_cloth.jpg', f, 'image/jpeg')}
        response = requests.post(f'{API_URL}/api/upload/cloth', files=files)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response content: {response.content}")
    
    if response.status_code == 200:
        print("Upload successful!")
        return response.json()['filename']
    else:
        print("Upload failed!")
        return None

def test_tryon(model_path, cloth_path, use_segmind=False, clothing_category="Upper body"):
    """Test the virtual try-on API."""
    print(f"Testing virtual try-on with model: {model_path}, cloth: {cloth_path}")
    print(f"Using Segmind: {use_segmind}, Category: {clothing_category}")
    
    params = {
        'model_path': model_path,
        'cloth_path': cloth_path,
        'use_segmind': str(use_segmind).lower(),
        'clothing_category': clothing_category
    }
    
    response = requests.post(f'{API_URL}/api/tryon', params=params)
    
    print(f"Response status code: {response.status_code}")
    print(f"Response content: {response.content}")
    
    if response.status_code == 200:
        print("Try-on successful!")
        result = response.json()['result']
        print(f"Result image: {API_URL}/api/result/{result}")
        return result
    else:
        print("Try-on failed!")
        return None

def test_url_image():
    """Test using a URL for the cloth image."""
    print("Testing with a URL image...")
    
    # First upload a model image
    model_path = test_upload_model()
    if not model_path:
        print("Model upload test failed!")
        return False
    
    # First upload a cloth image to get a valid path
    cloth_path = test_upload_cloth()
    if not cloth_path:
        print("Cloth upload test failed!")
        return False
    
    # Use the uploaded cloth image URL
    cloth_url = f"{API_URL}/uploads/clothes/{os.path.basename(cloth_path)}"
    print(f"Using cloth URL: {cloth_url}")
    
    # Test virtual try-on with URL
    result = test_tryon(model_path, cloth_url)
    if not result:
        print("Virtual try-on with URL test failed!")
        return False
    
    print("URL image test passed!")
    return True

def test_segmind():
    """Test the Segmind integration."""
    print("Testing Segmind integration...")
    
    # Upload model and cloth images
    model_path = test_upload_model()
    if not model_path:
        print("Model upload test failed!")
        return False
    
    cloth_path = test_upload_cloth()
    if not cloth_path:
        print("Cloth upload test failed!")
        return False
    
    # Test virtual try-on with Segmind
    result = test_tryon(model_path, cloth_path, use_segmind=True)
    if not result:
        print("Segmind integration test failed!")
        return False
    
    print("Segmind integration test passed!")
    return True

def main():
    """Run the tests."""
    parser = argparse.ArgumentParser(description='Test the Virtual Try-On API')
    parser.add_argument('--use-segmind', action='store_true', help='Use Segmind API for processing')
    parser.add_argument('--category', choices=['Upper body', 'Lower body', 'Dress'], 
                        default='Upper body', help='Clothing category')
    parser.add_argument('--test-url', action='store_true', help='Test with a URL image')
    parser.add_argument('--test-segmind', action='store_true', help='Test Segmind integration')
    
    args = parser.parse_args()
    
    print("Testing API...")
    
    # Test if the server is running
    try:
        response = requests.get(f'{API_URL}')
        print(f"Server is running. Status code: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("Server is not running!")
        sys.exit(1)
    
    if args.test_url:
        if test_url_image():
            print("URL image test passed!")
        else:
            print("URL image test failed!")
            sys.exit(1)
    elif args.test_segmind:
        if test_segmind():
            print("Segmind integration test passed!")
        else:
            print("Segmind integration test failed!")
            sys.exit(1)
    else:
        # Test uploading a model image
        model_path = test_upload_model()
        if not model_path:
            print("Model upload test failed!")
            sys.exit(1)
        
        # Test uploading a cloth image
        cloth_path = test_upload_cloth()
        if not cloth_path:
            print("Cloth upload test failed!")
            sys.exit(1)
        
        # Test virtual try-on
        result = test_tryon(model_path, cloth_path, args.use_segmind, args.category)
        if not result:
            print("Virtual try-on test failed!")
            sys.exit(1)
    
    print("All tests passed!")

if __name__ == '__main__':
    main() 