"""
Test script for AI Stylist Virtual Try-On System
Tests the core functionality without requiring API keys
"""

import os
import sys
import json
from datetime import datetime

def test_basic_imports():
    """Test if all required modules can be imported"""
    print("🔍 Testing basic imports...")
    
    try:
        import numpy as np
        print("✅ NumPy imported successfully")
    except ImportError as e:
        print(f"❌ NumPy import failed: {e}")
        return False
    
    try:
        import cv2
        print("✅ OpenCV imported successfully")
    except ImportError as e:
        print(f"❌ OpenCV import failed: {e}")
        return False
    
    try:
        from PIL import Image
        print("✅ PIL imported successfully")
    except ImportError as e:
        print(f"❌ PIL import failed: {e}")
        return False
    
    try:
        import torch
        print("✅ PyTorch imported successfully")
    except ImportError as e:
        print(f"❌ PyTorch import failed: {e}")
        return False
    
    return True

def test_langchain_imports():
    """Test LangChain related imports"""
    print("\n🔍 Testing LangChain imports...")
    
    try:
        from langchain.schema import Document
        print("✅ LangChain core imported successfully")
    except ImportError as e:
        print(f"❌ LangChain import failed: {e}")
        return False
    
    try:
        import faiss
        print("✅ FAISS imported successfully")
    except ImportError as e:
        print(f"❌ FAISS import failed: {e}")
        return False
    
    return True

def test_clothing_database():
    """Test clothing database loading"""
    print("\n🔍 Testing clothing database...")
    
    db_path = "clothing_database.json"
    if not os.path.exists(db_path):
        print(f"❌ Clothing database not found at {db_path}")
        return False
    
    try:
        with open(db_path, 'r') as f:
            data = json.load(f)
        
        if 'clothing_items' not in data:
            print("❌ Invalid database format: missing 'clothing_items'")
            return False
        
        items = data['clothing_items']
        print(f"✅ Database loaded successfully with {len(items)} items")
        
        # Display sample items
        for i, item in enumerate(items[:3]):
            print(f"   Item {i+1}: {item['name']} ({item['category']})")
        
        return True
        
    except Exception as e:
        print(f"❌ Database loading failed: {e}")
        return False

def test_ai_stylist_basic():
    """Test basic AI Stylist functionality without API keys"""
    print("\n🔍 Testing AI Stylist basic functionality...")
    
    try:
        # Import without initializing APIs
        sys.path.append('.')
        from ai_stylist import ClothingItem, UserProfile, ClothingRetriever
        
        # Test ClothingItem creation
        test_item = ClothingItem(
            id="test_001",
            name="Test Shirt",
            category="shirt",
            fabric="cotton",
            color="white",
            pattern="solid",
            fit="regular",
            style="casual",
            season="all",
            image_path="test.jpg",
            description="Test description",
            tags=["test"],
            texture_description="test texture",
            material_properties={"test": True}
        )
        print("✅ ClothingItem creation successful")
        
        # Test UserProfile creation
        test_profile = UserProfile(
            skin_tone="medium",
            body_type="athletic",
            style_preference="casual",
            occasion="work",
            season="spring",
            color_preferences=["blue", "white"],
            avoid_colors=["pink"]
        )
        print("✅ UserProfile creation successful")
        
        return True
        
    except Exception as e:
        print(f"❌ AI Stylist test failed: {e}")
        return False

def test_warping_module():
    """Test the warping module"""
    print("\n🔍 Testing warping module...")
    
    try:
        sys.path.append('.')
        from nodes.warping import ClothWarper
        
        warper = ClothWarper()
        print("✅ ClothWarper initialized successfully")
        
        # Test INPUT_TYPES method
        input_types = warper.INPUT_TYPES()
        required_keys = input_types.get('required', {}).keys()
        print(f"✅ Required inputs: {list(required_keys)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Warping module test failed: {e}")
        return False

def test_environment_setup():
    """Test environment configuration"""
    print("\n🔍 Testing environment setup...")
    
    # Check if .env.example exists
    if os.path.exists('.env.example'):
        print("✅ Environment example file found")
    else:
        print("❌ Environment example file not found")
        return False
    
    # Check if required directories exist
    required_dirs = ['uploads', 'results', 'public', 'nodes']
    for dir_name in required_dirs:
        if os.path.exists(dir_name):
            print(f"✅ Directory '{dir_name}' exists")
        else:
            print(f"⚠️  Directory '{dir_name}' not found (will be created)")
            try:
                os.makedirs(dir_name, exist_ok=True)
                print(f"✅ Created directory '{dir_name}'")
            except Exception as e:
                print(f"❌ Failed to create directory '{dir_name}': {e}")
    
    return True

def main():
    """Run all tests"""
    print("🚀 AI Stylist Virtual Try-On System Test Suite")
    print("=" * 50)
    
    test_results = []
    
    # Run tests
    test_results.append(("Basic Imports", test_basic_imports()))
    test_results.append(("LangChain Imports", test_langchain_imports()))
    test_results.append(("Clothing Database", test_clothing_database()))
    test_results.append(("Environment Setup", test_environment_setup()))
    test_results.append(("Warping Module", test_warping_module()))
    test_results.append(("AI Stylist Basic", test_ai_stylist_basic()))
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 TEST SUMMARY")
    print("=" * 50)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<20} {status}")
        if result:
            passed += 1
    
    print(f"\n📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! System is ready to run.")
        return True
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    
    if success:
        print("\n🚀 Next steps:")
        print("1. Copy .env.example to .env and add your API keys")
        print("2. Run: python ai_stylist_api.py")
        print("3. Test the API endpoints")
    
    sys.exit(0 if success else 1)