"""
Integration layer connecting AI Stylist with existing Virtual Try-On pipeline
Integrates LangChain RAG with the warping and processing modules
"""

import os
import sys
import json
import base64
from typing import Dict, List, Any, Optional, Tuple
from io import BytesIO
from PIL import Image
import numpy as np

# Import existing modules
from ai_stylist import AIStylistPipeline, UserProfile
from nodes.warping import ClothWarper
from segmind_api import SegmindVirtualTryOn
from stability_api import StabilityAI

class VirtualTryOnIntegrator:
    """
    Integrates AI Stylist (LangChain + RAG) with existing virtual try-on pipeline
    """
    
    def __init__(self, clothing_db_path: str, config: Dict[str, Any]):
        """
        Initialize the integrated virtual try-on system
        
        Args:
            clothing_db_path: Path to clothing database
            config: Configuration dictionary with API keys and settings
        """
        self.config = config
        
        # Initialize AI Stylist with RAG
        self.ai_stylist = AIStylistPipeline(
            clothing_db_path=clothing_db_path,
            openai_api_key=config.get('openai_api_key')
        )
        
        # Initialize existing components
        self.cloth_warper = ClothWarper()
        self.segmind_api = SegmindVirtualTryOn() if 'segmind_api_key' in config else None
        self.stability_api = StabilityAI(config['stability_api_key']) if 'stability_api_key' in config else None
        
        # Processing state
        self.current_session = {}
    
    def create_user_profile_from_preferences(self, preferences: Dict) -> UserProfile:
        """Create UserProfile from user preferences dictionary"""
        return UserProfile(
            skin_tone=preferences.get('skin_tone', 'medium'),
            body_type=preferences.get('body_type', 'average'),
            style_preference=preferences.get('style_preference', 'casual'),
            occasion=preferences.get('occasion', 'everyday'),
            season=preferences.get('season', 'all'),
            color_preferences=preferences.get('color_preferences', []),
            avoid_colors=preferences.get('avoid_colors', [])
        )
    
    def intelligent_virtual_tryon(self, 
                                 user_image_path: str,
                                 styling_request: str,
                                 user_preferences: Dict = None,
                                 use_ai_styling: bool = True) -> Dict[str, Any]:
        """
        Complete virtual try-on with AI styling intelligence
        
        Args:
            user_image_path: Path to user's image
            styling_request: Natural language styling request
            user_preferences: User preferences dictionary
            use_ai_styling: Whether to use AI styling or manual selection
            
        Returns:
            Dictionary with results including image, metadata, and recommendations
        """
        
        try:
            # Step 1: Create user profile
            user_profile = None
            if user_preferences:
                user_profile = self.create_user_profile_from_preferences(user_preferences)
            
            # Step 2: AI Styling (if enabled)
            if use_ai_styling:
                print("🤖 AI Stylist analyzing your request...")
                
                # Get AI-generated Segmind prompt
                ai_prompt = self.ai_stylist.process_styling_request(
                    user_query=styling_request,
                    user_image_path=user_image_path,
                    user_profile=user_profile
                )
                
                print(f"✨ AI Generated Prompt: {ai_prompt[:200]}...")
                
                # Extract clothing items from AI recommendation
                retrieved_items = self.ai_stylist.clothing_retriever.retrieve_clothing(
                    query=styling_request,
                    user_profile=user_profile,
                    k=3
                )
                
                if not retrieved_items:
                    return {
                        'success': False,
                        'error': 'No suitable clothing items found',
                        'ai_prompt': ai_prompt
                    }
                
                selected_item = retrieved_items[0]['item']
                
            else:
                # Manual clothing selection (fallback)
                selected_item = self._manual_clothing_selection(styling_request)
                ai_prompt = "Manual selection - no AI prompt generated"
            
            # Step 3: Process user image and extract pose data
            print("📸 Processing user image...")
            pose_data = self._extract_pose_data(user_image_path)
            
            # Step 4: Load and prepare clothing image
            print("👕 Preparing clothing item...")
            cloth_image, cloth_mask = self._prepare_clothing_item(selected_item)
            
            # Step 5: Warp clothing to fit user
            print("🔄 Warping clothing to fit...")
            warped_cloth, warped_mask = self.cloth_warper.warp(
                cloth_image=cloth_image,
                cloth_mask=cloth_mask,
                pose_data=pose_data,
                warp_strength=1.0,
                preserve_details=True
            )
            
            # Step 6: Generate final image using AI APIs
            print("🎨 Generating final try-on image...")
            final_image = self._generate_final_image(
                user_image_path=user_image_path,
                warped_cloth=warped_cloth,
                warped_mask=warped_mask,
                ai_prompt=ai_prompt if use_ai_styling else None
            )
            
            # Step 7: Prepare response
            result = {
                'success': True,
                'final_image': final_image,
                'ai_prompt': ai_prompt,
                'selected_clothing': {
                    'id': selected_item.id,
                    'name': selected_item.name,
                    'description': selected_item.description,
                    'fabric': selected_item.fabric,
                    'color': selected_item.color,
                    'style': selected_item.style
                },
                'recommendations': self._generate_styling_recommendations(selected_item, user_profile),
                'metadata': {
                    'user_preferences': user_preferences,
                    'styling_request': styling_request,
                    'processing_method': 'ai_styling' if use_ai_styling else 'manual',
                    'pose_detected': pose_data is not None
                }
            }
            
            # Store session for further interactions
            self.current_session = result
            
            return result
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'traceback': str(e)
            }
    
    def _extract_pose_data(self, image_path: str) -> Optional[Dict]:
        """Extract pose data from user image"""
        # This would integrate with existing pose detection
        # For now, return mock data
        return {
            'keypoints': {
                'left_shoulder': {'x': 100, 'y': 150},
                'right_shoulder': {'x': 200, 'y': 150},
                'left_hip': {'x': 110, 'y': 300},
                'right_hip': {'x': 190, 'y': 300}
            },
            'image_dimensions': {'width': 512, 'height': 768}
        }
    
    def _prepare_clothing_item(self, clothing_item) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare clothing image and mask"""
        try:
            # Load clothing image
            cloth_image = Image.open(clothing_item.image_path).convert('RGB')
            cloth_array = np.array(cloth_image)
            
            # Create or load mask (simplified)
            mask = np.ones((cloth_array.shape[0], cloth_array.shape[1]), dtype=np.uint8) * 255
            
            return cloth_array, mask
            
        except Exception as e:
            print(f"Error preparing clothing item: {e}")
            # Return default/placeholder
            default_image = np.ones((512, 512, 3), dtype=np.uint8) * 128
            default_mask = np.ones((512, 512), dtype=np.uint8) * 255
            return default_image, default_mask
    
    def _generate_final_image(self, 
                            user_image_path: str,
                            warped_cloth: np.ndarray,
                            warped_mask: np.ndarray,
                            ai_prompt: str = None) -> str:
        """Generate final try-on image using AI APIs"""
        
        # Method 1: Use Segmind API with AI-generated prompt
        if self.segmind_api and ai_prompt:
            try:
                segmind_result = self.segmind_api.generate_tryon(
                    user_image_path=user_image_path,
                    cloth_image=warped_cloth,
                    prompt=ai_prompt
                )
                if segmind_result.get('success'):
                    return segmind_result['image_base64']
            except Exception as e:
                print(f"Segmind API failed: {e}")
        
        # Method 2: Use Stability API
        if self.stability_api:
            try:
                stability_result = self.stability_api.generate_tryon(
                    user_image_path=user_image_path,
                    cloth_image=warped_cloth
                )
                if stability_result.get('success'):
                    return stability_result['image_base64']
            except Exception as e:
                print(f"Stability API failed: {e}")
        
        # Method 3: Simple blending fallback
        return self._simple_blend_fallback(user_image_path, warped_cloth, warped_mask)
    
    def _simple_blend_fallback(self, user_image_path: str, warped_cloth: np.ndarray, warped_mask: np.ndarray) -> str:
        """Simple blending as fallback"""
        try:
            # Load user image
            user_image = Image.open(user_image_path).convert('RGB')
            user_array = np.array(user_image)
            
            # Resize if needed
            if user_array.shape[:2] != warped_cloth.shape[:2]:
                user_image = user_image.resize((warped_cloth.shape[1], warped_cloth.shape[0]))
                user_array = np.array(user_image)
            
            # Simple alpha blending
            alpha = warped_mask / 255.0
            alpha = np.expand_dims(alpha, axis=2)
            
            blended = user_array * (1 - alpha) + warped_cloth * alpha
            blended = blended.astype(np.uint8)
            
            # Convert to base64
            result_image = Image.fromarray(blended)
            buffer = BytesIO()
            result_image.save(buffer, format='PNG')
            image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            return image_base64
            
        except Exception as e:
            print(f"Blending fallback failed: {e}")
            return ""
    
    def _manual_clothing_selection(self, request: str):
        """Manual clothing selection fallback"""
        # Simple keyword matching for fallback
        items = self.ai_stylist.clothing_retriever.clothing_items
        
        if "shirt" in request.lower():
            for item in items:
                if item.category == "shirt":
                    return item
        elif "blazer" in request.lower() or "jacket" in request.lower():
            for item in items:
                if item.category == "jacket":
                    return item
        
        # Return first item if no match
        return items[0] if items else None
    
    def _generate_styling_recommendations(self, selected_item, user_profile) -> List[str]:
        """Generate additional styling recommendations"""
        recommendations = []
        
        # Basic recommendations based on selected item
        if selected_item.category == "shirt":
            recommendations.append("Pair with dark trousers for a professional look")
            recommendations.append("Add a blazer for formal occasions")
        elif selected_item.category == "jacket":
            recommendations.append("Wear over a crisp shirt for business meetings")
            recommendations.append("Combine with matching trousers for a suit look")
        
        # User profile based recommendations
        if user_profile:
            if user_profile.occasion == "business meeting":
                recommendations.append("Consider adding a tie for extra formality")
            elif user_profile.occasion == "casual":
                recommendations.append("Roll up sleeves for a relaxed appearance")
        
        return recommendations
    
    def get_alternative_recommendations(self, styling_request: str, count: int = 3) -> List[Dict]:
        """Get alternative clothing recommendations"""
        retrieved_items = self.ai_stylist.clothing_retriever.retrieve_clothing(
            query=styling_request,
            k=count + 1  # Get one extra to skip the already selected item
        )
        
        alternatives = []
        for item_data in retrieved_items[1:count+1]:  # Skip first item (already used)
            item = item_data['item']
            alternatives.append({
                'id': item.id,
                'name': item.name,
                'description': item.description,
                'image_path': item.image_path,
                'style': item.style,
                'color': item.color,
                'fabric': item.fabric
            })
        
        return alternatives


# Configuration and example usage
def create_config():
    """Create configuration dictionary"""
    return {
        'openai_api_key': os.getenv('OPENAI_API_KEY'),
        'segmind_api_key': os.getenv('SEGMIND_API_KEY'),
        'stability_api_key': os.getenv('STABILITY_API_KEY'),
        'enable_ai_styling': True,
        'enable_logging': True
    }


def example_usage():
    """Example usage of the integrated system"""
    
    # Configuration
    config = create_config()
    clothing_db_path = "clothing_database.json"
    
    # Initialize integrated system
    integrator = VirtualTryOnIntegrator(clothing_db_path, config)
    
    # Example user preferences
    user_preferences = {
        'skin_tone': 'medium',
        'body_type': 'athletic',
        'style_preference': 'smart casual',
        'occasion': 'business meeting',
        'season': 'spring',
        'color_preferences': ['navy', 'white', 'gray'],
        'avoid_colors': ['pink', 'yellow']
    }
    
    # Virtual try-on request
    styling_request = "I need a professional outfit for an important client presentation"
    user_image_path = "test_model.jpg"
    
    # Process request
    result = integrator.intelligent_virtual_tryon(
        user_image_path=user_image_path,
        styling_request=styling_request,
        user_preferences=user_preferences,
        use_ai_styling=True
    )
    
    if result['success']:
        print("✅ Virtual try-on completed successfully!")
        print(f"Selected clothing: {result['selected_clothing']['name']}")
        print(f"AI Prompt: {result['ai_prompt'][:200]}...")
        print(f"Recommendations: {result['recommendations']}")
        
        # Get alternatives
        alternatives = integrator.get_alternative_recommendations(styling_request)
        print(f"Alternative options: {len(alternatives)} items found")
        
    else:
        print(f"❌ Virtual try-on failed: {result['error']}")


if __name__ == "__main__":
    example_usage()