"""
Enhanced API endpoints with AI Stylist integration
Extends existing API with LangChain RAG-powered styling assistance
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
import base64
from datetime import datetime
import traceback

# Import integrated components
from virtual_tryon_integrator import VirtualTryOnIntegrator, create_config
from ai_stylist_integrated import AIStylistPipeline, UserProfile, ClothingItem, create_simplified_ai_stylist

app = Flask(__name__)
CORS(app)

# Global integrator instance
integrator = None

def initialize_integrator():
    """Initialize the virtual try-on integrator"""
    global integrator
    try:
        config = create_config()
        clothing_db_path = "clothing_database.json"
        integrator = VirtualTryOnIntegrator(clothing_db_path, config)
        print("✅ AI Stylist integrator initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize integrator: {e}")
        integrator = None

# Initialize on startup
initialize_integrator()

@app.route('/api/ai-styling/virtual-tryon', methods=['POST'])
def ai_styling_virtual_tryon():
    """
    AI-powered virtual try-on endpoint with LangChain RAG
    
    Expected JSON payload:
    {
        "user_image": "base64_encoded_image",
        "styling_request": "I need a professional outfit for a business meeting",
        "user_preferences": {
            "skin_tone": "medium",
            "body_type": "athletic",
            "style_preference": "smart casual",
            "occasion": "business meeting",
            "season": "spring",
            "color_preferences": ["navy", "white", "gray"],
            "avoid_colors": ["pink", "yellow"]
        },
        "use_ai_styling": true,
        "options": {
            "warp_strength": 1.0,
            "preserve_details": true,
            "return_alternatives": true
        }
    }
    """
    
    if not integrator:
        return jsonify({
            'success': False,
            'error': 'AI Stylist not properly initialized'
        }), 500
    
    try:
        # Parse request data
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
        
        # Extract required fields
        user_image_b64 = data.get('user_image')
        styling_request = data.get('styling_request', '')
        user_preferences = data.get('user_preferences', {})
        use_ai_styling = data.get('use_ai_styling', True)
        options = data.get('options', {})
        
        if not user_image_b64:
            return jsonify({'success': False, 'error': 'user_image is required'}), 400
        
        if not styling_request:
            return jsonify({'success': False, 'error': 'styling_request is required'}), 400
        
        # Save user image temporarily
        timestamp = int(datetime.now().timestamp())
        user_image_path = f"uploads/user_image_{timestamp}.jpg"
        
        # Decode and save image
        try:
            image_data = base64.b64decode(user_image_b64)
            with open(user_image_path, 'wb') as f:
                f.write(image_data)
        except Exception as e:
            return jsonify({'success': False, 'error': f'Invalid image data: {str(e)}'}), 400
        
        # Process virtual try-on with AI styling
        result = integrator.intelligent_virtual_tryon(
            user_image_path=user_image_path,
            styling_request=styling_request,
            user_preferences=user_preferences,
            use_ai_styling=use_ai_styling
        )
        
        # Add alternatives if requested
        if options.get('return_alternatives', False) and result.get('success'):
            alternatives = integrator.get_alternative_recommendations(
                styling_request=styling_request,
                count=3
            )
            result['alternatives'] = alternatives
        
        # Clean up temporary file
        try:
            os.remove(user_image_path)
        except:
            pass
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@app.route('/api/ai-styling/analyze-style', methods=['POST'])
def analyze_style_request():
    """
    Analyze styling request without generating image
    Returns clothing recommendations and styling advice
    """
    
    if not integrator:
        return jsonify({'success': False, 'error': 'AI Stylist not initialized'}), 500
    
    try:
        data = request.get_json()
        styling_request = data.get('styling_request', '')
        user_preferences = data.get('user_preferences', {})
        
        if not styling_request:
            return jsonify({'success': False, 'error': 'styling_request is required'}), 400
        
        # Create user profile
        user_profile = None
        if user_preferences:
            user_profile = integrator.create_user_profile_from_preferences(user_preferences)
        
        # Get clothing recommendations using RAG
        retrieved_items = integrator.ai_stylist.clothing_retriever.retrieve_clothing(
            query=styling_request,
            user_profile=user_profile,
            k=5
        )
        
        # Generate AI prompt without image processing
        ai_prompt = integrator.ai_stylist.prompt_engineer.craft_segmind_prompt(
            user_image_analysis={'pose_detected': True},
            retrieved_clothing=retrieved_items,
            user_query=styling_request,
            user_profile=user_profile
        )
        
        # Format response
        recommendations = []
        for item_data in retrieved_items:
            item = item_data['item']
            recommendations.append({
                'id': item.id,
                'name': item.name,
                'description': item.description,
                'category': item.category,
                'fabric': item.fabric,
                'color': item.color,
                'style': item.style,
                'image_path': item.image_path,
                'tags': item.tags,
                'relevance_score': item_data.get('relevance_score', 1.0),
                'match_reason': item_data.get('match_reason', '')
            })
        
        return jsonify({
            'success': True,
            'styling_request': styling_request,
            'ai_analysis': ai_prompt,
            'recommendations': recommendations,
            'user_profile': user_profile.__dict__ if user_profile else None
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@app.route('/api/ai-styling/get-alternatives', methods=['POST'])
def get_styling_alternatives():
    """Get alternative clothing recommendations for a styling request"""
    
    if not integrator:
        return jsonify({'success': False, 'error': 'AI Stylist not initialized'}), 500
    
    try:
        data = request.get_json()
        styling_request = data.get('styling_request', '')
        count = data.get('count', 5)
        
        if not styling_request:
            return jsonify({'success': False, 'error': 'styling_request is required'}), 400
        
        alternatives = integrator.get_alternative_recommendations(
            styling_request=styling_request,
            count=count
        )
        
        return jsonify({
            'success': True,
            'styling_request': styling_request,
            'alternatives': alternatives,
            'count': len(alternatives)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/ai-styling/clothing-database', methods=['GET'])
def get_clothing_database():
    """Get information about available clothing items"""
    
    if not integrator:
        return jsonify({'success': False, 'error': 'AI Stylist not initialized'}), 500
    
    try:
        clothing_items = integrator.ai_stylist.clothing_retriever.clothing_items
        
        items_data = []
        for item in clothing_items:
            items_data.append({
                'id': item.id,
                'name': item.name,
                'description': item.description,
                'category': item.category,
                'fabric': item.fabric,
                'color': item.color,
                'style': item.style,
                'season': item.season,
                'tags': item.tags
            })
        
        # Get statistics
        categories = list(set(item.category for item in clothing_items))
        fabrics = list(set(item.fabric for item in clothing_items))
        colors = list(set(item.color for item in clothing_items))
        styles = list(set(item.style for item in clothing_items))
        
        return jsonify({
            'success': True,
            'total_items': len(clothing_items),
            'items': items_data,
            'statistics': {
                'categories': categories,
                'fabrics': fabrics,
                'colors': colors,
                'styles': styles
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/ai-styling/health', methods=['GET'])
def health_check():
    """Health check endpoint for AI Stylist"""
    
    status = {
        'ai_stylist_initialized': integrator is not None,
        'timestamp': datetime.now().isoformat()
    }
    
    if integrator:
        status.update({
            'clothing_items_loaded': len(integrator.ai_stylist.clothing_retriever.clothing_items),
            'vector_store_ready': integrator.ai_stylist.clothing_retriever.vector_store is not None,
            'segmind_api_available': integrator.segmind_api is not None,
            'stability_api_available': integrator.stability_api is not None
        })
    
    return jsonify(status)


@app.route('/api/ai-styling/generate-segmind-prompt', methods=['POST'])
def generate_segmind_prompt_only():
    """
    Generate optimized Segmind prompt without image processing
    Useful for understanding what prompt would be generated
    """
    
    if not integrator:
        return jsonify({'success': False, 'error': 'AI Stylist not initialized'}), 500
    
    try:
        data = request.get_json()
        styling_request = data.get('styling_request', '')
        user_preferences = data.get('user_preferences', {})
        
        if not styling_request:
            return jsonify({'success': False, 'error': 'styling_request is required'}), 400
        
        # Create user profile
        user_profile = None
        if user_preferences:
            user_profile = integrator.create_user_profile_from_preferences(user_preferences)
        
        # Generate prompt using AI Stylist
        prompt = integrator.ai_stylist.process_styling_request(
            user_query=styling_request,
            user_image_path="dummy_path",  # Not used for prompt generation only
            user_profile=user_profile
        )
        
        return jsonify({
            'success': True,
            'styling_request': styling_request,
            'generated_prompt': prompt,
            'user_profile': user_profile.__dict__ if user_profile else None
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # Ensure required directories exist
    os.makedirs('uploads', exist_ok=True)
    os.makedirs('results', exist_ok=True)
    
    print("🚀 Starting AI Stylist API server...")
    print("📋 Available endpoints:")
    print("  POST /api/ai-styling/virtual-tryon - AI-powered virtual try-on")
    print("  POST /api/ai-styling/analyze-style - Analyze styling request")
    print("  POST /api/ai-styling/get-alternatives - Get alternative recommendations")
    print("  GET  /api/ai-styling/clothing-database - View clothing database")
    print("  GET  /api/ai-styling/health - Health check")
    print("  POST /api/ai-styling/generate-segmind-prompt - Generate Segmind prompt only")
    
    app.run(host='0.0.0.0', port=5000, debug=True)