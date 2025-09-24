"""
Simplified AI Stylist API that integrates with your working api.py backend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import base64
from datetime import datetime
import traceback
import logging

# Import the integrated AI stylist
from ai_stylist_integrated import create_simplified_ai_stylist, UserProfile, ClothingItem

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global AI stylist instance
ai_stylist = None

def initialize_ai_stylist():
    """Initialize the AI stylist with backend integration"""
    global ai_stylist
    try:
        ai_stylist = create_simplified_ai_stylist(
            clothing_db_path="clothing_database.json",
            api_base_url="http://localhost:8000"  # Your working api.py backend
        )
        logger.info("✅ AI Stylist initialized with backend integration")
    except Exception as e:
        logger.error(f"❌ Failed to initialize AI stylist: {e}")
        ai_stylist = None

# Initialize on startup
initialize_ai_stylist()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'ai_stylist_ready': ai_stylist is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/style-analysis', methods=['POST'])
def style_analysis():
    """
    Analyze user's style request and provide recommendations
    
    Expected JSON:
    {
        "query": "I need a professional outfit for work",
        "user_profile": {
            "style_preference": "professional",
            "color_preferences": ["navy", "white"],
            "age_range": "25-35",
            "occasion": "business meeting"
        }
    }
    """
    try:
        if not ai_stylist:
            return jsonify({
                'success': False,
                'error': 'AI Stylist not initialized'
            }), 500
        
        data = request.get_json()
        query = data.get('query', '')
        user_profile_data = data.get('user_profile', {})
        
        # Create user profile
        user_profile = UserProfile(
            style_preference=user_profile_data.get('style_preference', 'casual'),
            color_preferences=user_profile_data.get('color_preferences', []),
            age_range=user_profile_data.get('age_range', ''),
            occasion=user_profile_data.get('occasion', ''),
            budget_range=user_profile_data.get('budget_range', ''),
            size=user_profile_data.get('size', '')
        )
        
        # Get style analysis
        result = ai_stylist.analyze_style_request(query, user_profile)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Style analysis error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/virtual-tryon', methods=['POST'])
def virtual_tryon():
    """
    Process virtual try-on using your working backend
    
    Expected JSON:
    {
        "user_image": "base64_encoded_image_data",
        "clothing_item_id": "1",
        "user_profile": {...}
    }
    """
    try:
        if not ai_stylist:
            return jsonify({
                'success': False,
                'error': 'AI Stylist not initialized'
            }), 500
        
        data = request.get_json()
        user_image = data.get('user_image', '')
        clothing_item_id = data.get('clothing_item_id', '')
        
        if not user_image or not clothing_item_id:
            return jsonify({
                'success': False,
                'error': 'Missing user_image or clothing_item_id'
            }), 400
        
        # Find the clothing item
        clothing_item = None
        for item in ai_stylist.clothing_retriever.clothing_items:
            if item.id == clothing_item_id:
                clothing_item = item
                break
        
        if not clothing_item:
            return jsonify({
                'success': False,
                'error': f'Clothing item {clothing_item_id} not found'
            }), 404
        
        # Process virtual try-on
        result = ai_stylist.process_virtual_tryon(user_image, clothing_item)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Virtual try-on error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/virtual-tryon-with-local-images', methods=['POST'])
def virtual_tryon_local():
    """
    Process virtual try-on with local image files (direct api.py integration)
    
    Expected JSON:
    {
        "model_image_path": "path/to/model/image.jpg",
        "clothing_item_id": "1"
    }
    """
    try:
        if not ai_stylist:
            return jsonify({
                'success': False,
                'error': 'AI Stylist not initialized'
            }), 500
        
        data = request.get_json()
        model_image_path = data.get('model_image_path', '')
        clothing_item_id = data.get('clothing_item_id', '')
        
        if not model_image_path or not clothing_item_id:
            return jsonify({
                'success': False,
                'error': 'Missing model_image_path or clothing_item_id'
            }), 400
        
        # Find the clothing item
        clothing_item = None
        for item in ai_stylist.clothing_retriever.clothing_items:
            if item.id == clothing_item_id:
                clothing_item = item
                break
        
        if not clothing_item:
            return jsonify({
                'success': False,
                'error': f'Clothing item {clothing_item_id} not found'
            }), 404
        
        # Process virtual try-on with local images (direct integration)
        result = ai_stylist.process_with_local_images(model_image_path, clothing_item)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Local virtual try-on error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/clothing-items', methods=['GET'])
def get_clothing_items():
    """Get all available clothing items"""
    try:
        if not ai_stylist:
            return jsonify({
                'success': False,
                'error': 'AI Stylist not initialized'
            }), 500
        
        items = [ai_stylist._item_to_dict(item) for item in ai_stylist.clothing_retriever.clothing_items]
        
        return jsonify({
            'success': True,
            'items': items,
            'count': len(items)
        })
        
    except Exception as e:
        logger.error(f"Get clothing items error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/search-clothing', methods=['POST'])
def search_clothing():
    """
    Search for clothing items
    
    Expected JSON:
    {
        "query": "blue shirt",
        "user_profile": {...},
        "limit": 5
    }
    """
    try:
        if not ai_stylist:
            return jsonify({
                'success': False,
                'error': 'AI Stylist not initialized'
            }), 500
        
        data = request.get_json()
        query = data.get('query', '')
        user_profile_data = data.get('user_profile', {})
        limit = data.get('limit', 5)
        
        # Create user profile if provided
        user_profile = None
        if user_profile_data:
            user_profile = UserProfile(
                style_preference=user_profile_data.get('style_preference', 'casual'),
                color_preferences=user_profile_data.get('color_preferences', []),
                age_range=user_profile_data.get('age_range', ''),
                occasion=user_profile_data.get('occasion', '')
            )
        
        # Search clothing items
        items = ai_stylist.clothing_retriever.search_clothing(query, user_profile, k=limit)
        items_dict = [ai_stylist._item_to_dict(item) for item in items]
        
        return jsonify({
            'success': True,
            'items': items_dict,
            'count': len(items_dict),
            'query': query
        })
        
    except Exception as e:
        logger.error(f"Search clothing error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/test-backend-integration', methods=['GET'])
def test_backend_integration():
    """Test the integration with your api.py backend"""
    try:
        # Test if we can import from api.py
        import sys
        import os
        sys.path.append(os.getcwd())
        
        from api import process_tryon
        
        return jsonify({
            'success': True,
            'message': 'Backend integration successful',
            'api_backend_available': True,
            'process_tryon_function': 'available'
        })
        
    except Exception as e:
        logger.error(f"Backend integration test failed: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'api_backend_available': False
        })

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get detailed status information"""
    try:
        status = {
            'ai_stylist_initialized': ai_stylist is not None,
            'timestamp': datetime.now().isoformat(),
            'version': '1.0.0-integrated'
        }
        
        if ai_stylist:
            status.update({
                'clothing_items_count': len(ai_stylist.clothing_retriever.clothing_items),
                'style_templates': list(ai_stylist.style_templates.keys()),
                'api_integration_ready': True
            })
        
        return jsonify(status)
        
    except Exception as e:
        logger.error(f"Status error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Starting AI Stylist API with backend integration...")
    print("📋 Available endpoints:")
    print("  - GET  /health - Health check")
    print("  - POST /api/style-analysis - Get style recommendations")
    print("  - POST /api/virtual-tryon - Virtual try-on with base64 images")
    print("  - POST /api/virtual-tryon-with-local-images - Virtual try-on with local files")
    print("  - GET  /api/clothing-items - Get all clothing items")
    print("  - POST /api/search-clothing - Search clothing items")
    print("  - GET  /api/test-backend-integration - Test api.py integration")
    print("  - GET  /api/status - Get system status")
    print("")
    print("🔗 Integration with your working api.py backend enabled!")
    print("📍 Make sure your api.py is running on http://localhost:8000")
    print("")
    
    app.run(host='0.0.0.0', port=5001, debug=True)