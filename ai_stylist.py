"""
AI Stylist Integration with Working API Backend
Streamlined version that integrates with the proven api.py virtual try-on system
"""

import os
import numpy as np
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import json
import base64
from io import BytesIO
from PIL import Image
import random
import logging

# Import the working backend components
from segmind_api import SegmindVirtualTryOn
from stability_api import StabilityAI

# Set up logging
logger = logging.getLogger(__name__)


@dataclass
class ClothingItem:
    """Represents a clothing item with all metadata"""
    id: str
    name: str
    category: str
    fabric: str
    color: str
    pattern: str
    fit: str
    style: str
    season: str
    image_path: str
    description: str
    tags: List[str]
    texture_description: str
    material_properties: Dict[str, Any]


@dataclass
class UserProfile:
    """User characteristics for personalized styling"""
    skin_tone: str
    body_type: str
    style_preference: str
    occasion: str
    season: str
    color_preferences: List[str]
    avoid_colors: List[str]


class MultimodalEmbeddings:
    """Simplified text embeddings for clothing retrieval with fallback"""
    
    def __init__(self):
        try:
            self.openai_embeddings = OpenAIEmbeddings()
            self.use_openai = True
        except:
            self.use_openai = False
            # Fallback to simple text-based similarity
            print("⚠️ OpenAI embeddings not available, using fallback text similarity")
    
    def _simple_text_embedding(self, text: str) -> np.ndarray:
        """Simple hash-based text embedding as fallback"""
        import hashlib
        # Create a simple feature vector from text
        words = text.lower().split()
        features = np.zeros(384)  # Smaller dimension for fallback
        
        for i, word in enumerate(words[:20]):  # Limit to first 20 words
            hash_val = int(hashlib.md5(word.encode()).hexdigest()[:8], 16)
            features[hash_val % 384] += 1
        
        # Normalize
        norm = np.linalg.norm(features)
        if norm > 0:
            features = features / norm
        return features
    
    def embed_clothing_item(self, item: ClothingItem) -> np.ndarray:
        """Create text embedding from clothing item metadata"""
        
        # Combine all text content
        text_content = f"{item.name} {item.description} {item.fabric} {item.color} {item.pattern} {item.style} {item.category} {' '.join(item.tags)}"
        
        if self.use_openai:
            try:
                embedding = self.openai_embeddings.embed_query(text_content)
                return np.array(embedding)
            except Exception as e:
                print(f"OpenAI embedding failed for {item.name}: {e}")
                self.use_openai = False  # Switch to fallback
        
        # Use fallback embedding
        return self._simple_text_embedding(text_content)
    
    def embed_query(self, query: str) -> np.ndarray:
        """Create embedding for user query"""
        if self.use_openai:
            try:
                embedding = self.openai_embeddings.embed_query(query)
                return np.array(embedding)
            except:
                self.use_openai = False
        
        return self._simple_text_embedding(query)
        try:
            embedding = self.openai_embeddings.embed_query(query)
            return np.array(embedding)
        except Exception as e:
            print(f"Error creating query embedding: {e}")
            return np.zeros(1536)  # OpenAI embedding size


class ClothingRetriever:
    """RAG-based clothing retrieval system"""
    
    def __init__(self, clothing_database_path: str, vector_db_path: str = None):
        self.embeddings_model = MultimodalEmbeddings()
        self.clothing_items: List[ClothingItem] = []
        self.vector_store = None
        self.load_clothing_database(clothing_database_path)
        
        if vector_db_path and os.path.exists(vector_db_path):
            self.load_vector_store(vector_db_path)
        else:
            self.build_vector_store()
    
    def load_clothing_database(self, database_path: str):
        """Load clothing items from JSON database"""
        try:
            with open(database_path, 'r') as f:
                data = json.load(f)
                
            for item_data in data['clothing_items']:
                item = ClothingItem(**item_data)
                self.clothing_items.append(item)
                
            print(f"Loaded {len(self.clothing_items)} clothing items")
        except Exception as e:
            print(f"Error loading clothing database: {e}")
            # Create sample data if file doesn't exist
            self.create_sample_database()
    
    def create_sample_database(self):
        """Create sample clothing data for testing"""
        sample_items = [
            ClothingItem(
                id="shirt_001",
                name="Classic White Cotton Shirt",
                category="shirt",
                fabric="cotton",
                color="white",
                pattern="solid",
                fit="regular",
                style="classic",
                season="all",
                image_path="public/images/white_shirt.jpg",
                description="Crisp white cotton dress shirt perfect for professional and casual wear",
                tags=["professional", "versatile", "classic"],
                texture_description="smooth cotton weave",
                material_properties={"breathable": True, "wrinkle_resistant": False}
            ),
            ClothingItem(
                id="jeans_001",
                name="Dark Denim Jeans",
                category="pants",
                fabric="denim",
                color="dark blue",
                pattern="solid",
                fit="slim",
                style="casual",
                season="all",
                image_path="public/images/dark_jeans.jpg",
                description="Premium dark wash denim jeans with modern slim fit",
                tags=["casual", "versatile", "modern"],
                texture_description="structured denim weave",
                material_properties={"durable": True, "stretch": True}
            )
        ]
        self.clothing_items = sample_items
    
    def build_vector_store(self):
        """Build FAISS vector store from clothing items"""
        documents = []
        
        for item in self.clothing_items:
            # Create document with metadata
            doc_content = f"{item.name}: {item.description} - {item.fabric} {item.color} {item.style}"
            metadata = {
                'id': item.id,
                'category': item.category,
                'fabric': item.fabric,
                'color': item.color,
                'style': item.style,
                'image_path': item.image_path
            }
            
            doc = Document(page_content=doc_content, metadata=metadata)
            documents.append(doc)
        
        # Create FAISS vector store using embeddings model
        try:
            # Try to use the embeddings model directly
            if hasattr(self.embeddings_model, 'openai_embeddings') and self.embeddings_model.use_openai:
                self.vector_store = FAISS.from_documents(documents, self.embeddings_model.openai_embeddings)
            else:
                # Use custom embeddings wrapper for fallback
                class CustomEmbeddings:
                    def __init__(self, embedding_model):
                        self.embedding_model = embedding_model
                    
                    def embed_documents(self, texts):
                        return [self.embedding_model._simple_text_embedding(text).tolist() for text in texts]
                    
                    def embed_query(self, text):
                        return self.embedding_model._simple_text_embedding(text).tolist()
                
                custom_embeddings = CustomEmbeddings(self.embeddings_model)
                self.vector_store = FAISS.from_documents(documents, custom_embeddings)
        except Exception as e:
            print(f"Error creating vector store: {e}")
            # Fallback to simple storage
            self.vector_store = None
        
        print(f"Built vector store with {len(documents)} clothing items")
    
    def retrieve_clothing(self, query: str, user_profile: UserProfile = None, k: int = 5) -> List[Dict]:
        """Retrieve top-K relevant clothing items"""
        if not self.vector_store:
            return []
        
        # Enhance query with user profile
        enhanced_query = self.enhance_query_with_profile(query, user_profile)
        
        # Retrieve similar items
        retriever = self.vector_store.as_retriever(search_kwargs={"k": k})
        relevant_docs = retriever.get_relevant_documents(enhanced_query)
        
        # Extract clothing details
        retrieved_items = []
        for doc in relevant_docs:
            clothing_item = self.get_clothing_by_id(doc.metadata['id'])
            if clothing_item:
                retrieved_items.append({
                    'item': clothing_item,
                    'relevance_score': 1.0,  # Could implement actual scoring
                    'metadata': doc.metadata,
                    'match_reason': doc.page_content
                })
        
        return retrieved_items
    
    def enhance_query_with_profile(self, query: str, profile: UserProfile) -> str:
        """Enhance user query with profile information"""
        if not profile:
            return query
        
        enhancements = []
        if profile.occasion:
            enhancements.append(f"for {profile.occasion}")
        if profile.style_preference:
            enhancements.append(f"{profile.style_preference} style")
        if profile.color_preferences:
            enhancements.append(f"in {', '.join(profile.color_preferences)} colors")
        
        enhanced = f"{query} {' '.join(enhancements)}"
        return enhanced
    
    def get_clothing_by_id(self, item_id: str) -> Optional[ClothingItem]:
        """Get clothing item by ID"""
        for item in self.clothing_items:
            if item.id == item_id:
                return item
        return None


class SegmindPromptEngineer:
    """Optimizes prompts for Segmind API virtual try-on"""
    
    def __init__(self):
        self.base_prompt_template = """
        Create a photorealistic virtual try-on image with the following specifications:
        
        PRESERVE USER CHARACTERISTICS:
        - Maintain exact body shape, pose, and positioning
        - Preserve skin tone: {skin_tone}
        - Keep facial features and hair unchanged
        - Maintain original background and lighting
        
        CLOTHING REPLACEMENT:
        - Replace existing clothing with: {clothing_description}
        - Fabric: {fabric} with {texture_description}
        - Color: {color}
        - Fit: {fit} 
        - Style: {style}
        
        QUALITY REQUIREMENTS:
        - Ultra-high resolution, sharp details
        - Realistic fabric texture and draping
        - Natural shadows and lighting consistency
        - Seamless clothing integration
        - Professional photography quality
        - No artifacts or distortions
        
        TECHNICAL SPECS:
        - Photorealistic rendering
        - Accurate garment physics and fit
        - Color accuracy: {color}
        - Material properties: {material_properties}
        """
    
    def craft_segmind_prompt(self, 
                           user_image_analysis: Dict,
                           retrieved_clothing: List[Dict],
                           user_query: str,
                           user_profile: UserProfile = None) -> str:
        """Create optimized prompt for Segmind API"""
        
        if not retrieved_clothing:
            return "Error: No suitable clothing items found"
        
        # Select best matching item
        best_match = retrieved_clothing[0]['item']
        
        # Extract user characteristics
        skin_tone = user_profile.skin_tone if user_profile else "natural"
        
        # Build detailed clothing description
        clothing_desc = f"{best_match.name} - {best_match.description}"
        
        # Material properties as string
        material_props = ", ".join([f"{k}: {v}" for k, v in best_match.material_properties.items()])
        
        # Generate the optimized prompt
        optimized_prompt = self.base_prompt_template.format(
            skin_tone=skin_tone,
            clothing_description=clothing_desc,
            fabric=best_match.fabric,
            texture_description=best_match.texture_description,
            color=best_match.color,
            fit=best_match.fit,
            style=best_match.style,
            material_properties=material_props
        )
        
        # Add specific enhancements based on query
        if "formal" in user_query.lower():
            optimized_prompt += "\n- Professional, formal appearance"
        elif "casual" in user_query.lower():
            optimized_prompt += "\n- Relaxed, casual styling"
        
        # Add seasonal considerations
        if user_profile and user_profile.season:
            optimized_prompt += f"\n- Appropriate for {user_profile.season} season"
        
        return optimized_prompt.strip()


class AIStylistPipeline:
    """Main LangChain pipeline orchestrating the AI stylist workflow"""
    
    def __init__(self, clothing_db_path: str, openai_api_key: str = None):
        self.clothing_retriever = ClothingRetriever(clothing_db_path)
        self.prompt_engineer = SegmindPromptEngineer()
        
        # Initialize LangChain components
        if openai_api_key:
            os.environ["OPENAI_API_KEY"] = openai_api_key
            self.llm = OpenAI(temperature=0.7)
        
        # Create style analysis chain
        self.setup_style_analysis_chain()
    
    def setup_style_analysis_chain(self):
        """Setup LangChain for style analysis and query understanding"""
        style_prompt = PromptTemplate(
            input_variables=["query", "user_profile"],
            template="""
            As an expert fashion stylist, analyze this request and extract key styling requirements:
            
            User Query: {query}
            User Profile: {user_profile}
            
            Provide:
            1. Clothing categories needed
            2. Style preferences (formal, casual, trendy, classic)
            3. Color palette suggestions
            4. Fabric preferences
            5. Occasion appropriateness
            
            Analysis:
            """
        )
        
        # Initialize LLM and style chain
        try:
            self.llm = OpenAI(temperature=0.7)
            self.llm_available = True
            
            # Create modern RunnableSequence instead of deprecated LLMChain
            self.style_chain = style_prompt | self.llm
            
        except Exception as e:
            print(f"⚠️ OpenAI LLM not available: {e}")
            self.llm_available = False
            self.style_chain = None
    
    def process_styling_request(self, 
                              user_query: str,
                              user_image_path: str,
                              user_profile: UserProfile = None) -> str:
        """Main pipeline method - returns Segmind-ready prompt"""
        
        try:
            # Step 1: Analyze user query with LangChain
            if self.llm_available and self.style_chain:
                profile_str = str(user_profile.__dict__) if user_profile else "No profile provided"
                style_analysis = self.style_chain.invoke({
                    "query": user_query, 
                    "user_profile": profile_str
                })
                print(f"Style Analysis: {style_analysis}")
            else:
                style_analysis = f"Fallback analysis for: {user_query}"
            
            # Step 2: Retrieve relevant clothing items using RAG
            retrieved_items = self.clothing_retriever.retrieve_clothing(
                query=user_query,
                user_profile=user_profile,
                k=3
            )
            
            if not retrieved_items:
                return "No suitable clothing items found for your request."
            
            # Step 3: Analyze user image (placeholder - would integrate with pose detection)
            user_image_analysis = self.analyze_user_image(user_image_path)
            
            # Step 4: Generate optimized Segmind prompt
            segmind_prompt = self.prompt_engineer.craft_segmind_prompt(
                user_image_analysis=user_image_analysis,
                retrieved_clothing=retrieved_items,
                user_query=user_query,
                user_profile=user_profile
            )
            
            return segmind_prompt
            
        except Exception as e:
            return f"Error processing styling request: {str(e)}"
    
    def analyze_user_image(self, image_path: str) -> Dict:
        """Analyze user image for pose, body type, etc."""
        # Placeholder - would integrate with existing pose detection
        return {
            'pose_detected': True,
            'body_type': 'average',
            'clothing_detected': ['shirt', 'pants'],
            'background': 'simple',
            'lighting': 'natural'
        }


# Example usage and testing
def create_sample_clothing_db():
    """Create sample clothing database for testing"""
    sample_db = {
        "clothing_items": [
            {
                "id": "shirt_001",
                "name": "Classic White Cotton Shirt",
                "category": "shirt",
                "fabric": "cotton",
                "color": "white",
                "pattern": "solid",
                "fit": "regular",
                "style": "classic",
                "season": "all",
                "image_path": "public/images/white_shirt.jpg",
                "description": "Crisp white cotton dress shirt perfect for professional and casual wear",
                "tags": ["professional", "versatile", "classic"],
                "texture_description": "smooth cotton weave with subtle texture",
                "material_properties": {"breathable": True, "wrinkle_resistant": False, "stretch": False}
            },
            {
                "id": "blazer_001",
                "name": "Navy Blue Wool Blazer",
                "category": "jacket",
                "fabric": "wool",
                "color": "navy blue",
                "pattern": "solid",
                "fit": "tailored",
                "style": "formal",
                "season": "fall",
                "image_path": "public/images/navy_blazer.jpg",
                "description": "Premium wool blazer with tailored fit for professional occasions",
                "tags": ["formal", "professional", "elegant"],
                "texture_description": "fine wool weave with structured drape",
                "material_properties": {"breathable": True, "wrinkle_resistant": True, "stretch": False}
            }
        ]
    }
    
    db_path = "clothing_database.json"
    with open(db_path, 'w') as f:
        json.dump(sample_db, f, indent=2)
    
    return db_path


if __name__ == "__main__":
    # Create sample database
    db_path = create_sample_clothing_db()
    
    # Initialize AI Stylist
    stylist = AIStylistPipeline(db_path)
    
    # Example user profile
    user_profile = UserProfile(
        skin_tone="medium",
        body_type="athletic",
        style_preference="smart casual",
        occasion="business meeting",
        season="spring",
        color_preferences=["navy", "white", "gray"],
        avoid_colors=["pink", "yellow"]
    )
    
    # Example request
    user_query = "I need a professional outfit for a business presentation"
    user_image_path = "test_model.jpg"
    
    # Generate Segmind prompt
    prompt = stylist.process_styling_request(
        user_query=user_query,
        user_image_path=user_image_path,
        user_profile=user_profile
    )
    
    print("Generated Segmind Prompt:")
    print("=" * 50)
    print(prompt)