"""
Fashion Knowledge Base for RAG-powered Smart Fashion Advisor
Creates and manages a comprehensive fashion database using FAISS vectorstore
"""

import os
import json
from typing import List, Dict, Any
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.schema import Document
from sentence_transformers import SentenceTransformer
import numpy as np

class FashionKnowledgeBase:
    def __init__(self, embeddings_model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize Fashion Knowledge Base with embeddings
        
        Args:
            embeddings_model_name: Name of the sentence transformer model for embeddings
        """
        self.embeddings = HuggingFaceEmbeddings(
            model_name=embeddings_model_name,
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        self.vectorstore = None
        self.knowledge_data = self._create_fashion_knowledge()
        
    def _create_fashion_knowledge(self) -> List[Dict[str, Any]]:
        """
        Create comprehensive fashion knowledge database
        
        Returns:
            List of fashion knowledge documents
        """
        fashion_knowledge = [
            # Color Theory and Coordination
            {
                "category": "color_theory",
                "topic": "Complementary Colors",
                "content": "Complementary colors sit opposite each other on the color wheel and create vibrant, high-contrast looks. Red pairs beautifully with green, blue with orange, and yellow with purple. These combinations are bold and eye-catching, perfect for statement pieces or when you want to stand out.",
                "tags": ["colors", "styling", "contrast", "bold"]
            },
            {
                "category": "color_theory",
                "topic": "Analogous Color Schemes",
                "content": "Analogous colors sit next to each other on the color wheel and create harmonious, pleasing combinations. Think blue-green-purple or red-orange-yellow. These schemes are calming and sophisticated, perfect for professional settings or everyday wear.",
                "tags": ["colors", "harmony", "professional", "sophisticated"]
            },
            {
                "category": "color_theory",
                "topic": "Monochromatic Styling",
                "content": "Monochromatic outfits use different shades, tints, and tones of the same color. This creates a sleek, elongating effect that's both elegant and modern. Navy with powder blue, or charcoal with light gray are classic examples.",
                "tags": ["colors", "monochrome", "elegant", "modern", "elongating"]
            },
            
            # Body Types and Fit
            {
                "category": "body_types",
                "topic": "Apple Body Type Styling",
                "content": "For apple-shaped bodies, focus on drawing attention away from the midsection. Empire waistlines, A-line dresses, and tops that flow away from the body work wonderfully. V-necks elongate the torso, while darker colors on top with brighter bottoms balance proportions.",
                "tags": ["body_type", "apple", "proportion", "v-neck", "empire_waist"]
            },
            {
                "category": "body_types",
                "topic": "Pear Body Type Styling",
                "content": "Pear-shaped bodies benefit from emphasizing the upper body while minimizing the lower half. Bright tops, statement sleeves, boat necks, and embellished details draw attention upward. Darker bottoms and A-line silhouettes balance the proportions beautifully.",
                "tags": ["body_type", "pear", "emphasis", "statement_sleeves", "boat_neck"]
            },
            {
                "category": "body_types",
                "topic": "Rectangle Body Type Styling",
                "content": "Rectangle body types can create curves with strategic styling. Belted waists, peplum tops, and fit-and-flare dresses add definition. Layering with blazers, cardigans, and scarves creates visual interest and dimension.",
                "tags": ["body_type", "rectangle", "curves", "belted", "peplum", "layering"]
            },
            
            # Seasonal Trends and Styling
            {
                "category": "seasonal",
                "topic": "Spring 2024 Trends",
                "content": "Spring 2024 embraces soft pastels, flowing fabrics, and romantic details. Key trends include butter yellow, sage green, oversized blazers, sheer fabrics, and delicate florals. Accessories focus on natural materials like woven bags and minimal jewelry.",
                "tags": ["spring", "2024", "pastels", "romantic", "oversized_blazers", "florals"]
            },
            {
                "category": "seasonal",
                "topic": "Fall Color Palette",
                "content": "Fall fashion celebrates rich, warm tones that mirror autumn foliage. Deep burgundy, burnt orange, mustard yellow, and forest green create cozy, sophisticated looks. Layer these colors with neutrals like camel, cream, and chocolate brown.",
                "tags": ["fall", "autumn", "burgundy", "burnt_orange", "layering", "warm_tones"]
            },
            
            # Occasion Dressing
            {
                "category": "occasions",
                "topic": "Business Professional",
                "content": "Business professional attire requires polished, conservative pieces. Structured blazers, tailored trousers, pencil skirts, and button-down shirts in neutral colors form the foundation. Keep accessories minimal and ensure everything is well-fitted and wrinkle-free.",
                "tags": ["business", "professional", "structured", "blazers", "neutral", "tailored"]
            },
            {
                "category": "occasions",
                "topic": "Cocktail Party Attire",
                "content": "Cocktail attire strikes a balance between formal and casual. Little black dresses, midi skirts with silk blouses, or dressy jumpsuits work perfectly. Add statement jewelry, heels, and a clutch bag. Fabrics like silk, chiffon, and velvet elevate the look.",
                "tags": ["cocktail", "party", "little_black_dress", "midi", "statement_jewelry", "silk"]
            },
            {
                "category": "occasions",
                "topic": "Casual Weekend",
                "content": "Weekend casual allows for comfort and personal expression. Well-fitted jeans, comfortable tops, sneakers or ankle boots, and layering pieces like cardigans or denim jackets create effortless style. Mix textures and add personal touches with accessories.",
                "tags": ["casual", "weekend", "jeans", "comfortable", "layering", "personal_expression"]
            },
            
            # Style Principles
            {
                "category": "principles",
                "topic": "The Rule of Three",
                "content": "The rule of three suggests limiting your outfit to three main colors or patterns. This creates cohesion without overwhelming the eye. You can have multiple shades of each color, but keep the palette focused for maximum impact.",
                "tags": ["rule_of_three", "cohesion", "color_palette", "balance"]
            },
            {
                "category": "principles",
                "topic": "Proportional Balance",
                "content": "Visual balance is key to flattering outfits. If you wear something loose on top, balance it with fitted bottoms, and vice versa. This creates pleasing proportions and prevents overwhelming your frame.",
                "tags": ["balance", "proportions", "fitted", "loose", "flattering"]
            },
            {
                "category": "principles",
                "topic": "Power of Accessories",
                "content": "Accessories can transform any outfit. A statement necklace elevates a simple dress, a silk scarf adds sophistication to casual wear, and the right shoes can change an outfit's entire mood. Use accessories to express personality and complete your look.",
                "tags": ["accessories", "transformation", "statement_pieces", "scarves", "shoes", "personality"]
            },
            
            # Fabric and Texture Guidelines
            {
                "category": "fabrics",
                "topic": "Summer Fabric Choices",
                "content": "Summer calls for breathable, lightweight fabrics. Cotton, linen, and bamboo allow air circulation and moisture wicking. Avoid heavy synthetics that trap heat. Choose loose weaves and natural fibers for maximum comfort in warm weather.",
                "tags": ["summer", "breathable", "cotton", "linen", "bamboo", "lightweight"]
            },
            {
                "category": "fabrics",
                "topic": "Winter Layering Fabrics",
                "content": "Winter layering requires strategic fabric choices. Wool and cashmere provide warmth, while cotton and silk work as base layers. Avoid bulky fabrics that add unnecessary volume. Choose fabrics that compress well for smooth layering.",
                "tags": ["winter", "layering", "wool", "cashmere", "compression", "warmth"]
            },
            
            # Sustainable Fashion
            {
                "category": "sustainability",
                "topic": "Building a Capsule Wardrobe",
                "content": "A capsule wardrobe focuses on versatile, high-quality pieces that mix and match effortlessly. Start with neutral basics: white button-down, well-fitted jeans, little black dress, blazer, and quality shoes. Add seasonal colors and personal touches gradually.",
                "tags": ["capsule_wardrobe", "versatile", "basics", "neutral", "quality", "timeless"]
            },
            {
                "category": "sustainability",
                "topic": "Investment Piece Guide",
                "content": "Investment pieces are timeless items worth spending more on. Classic trench coat, well-tailored blazer, leather handbag, quality shoes, and little black dress form the foundation. Choose neutral colors and classic cuts that won't go out of style.",
                "tags": ["investment", "timeless", "trench_coat", "leather", "classic", "quality"]
            }
        ]
        
        return fashion_knowledge
    
    def build_vectorstore(self, persist_directory: str = "fashion_vectorstore"):
        """
        Build FAISS vectorstore from fashion knowledge
        
        Args:
            persist_directory: Directory to save the vectorstore
        """
        # Create documents from knowledge data
        documents = []
        for item in self.knowledge_data:
            content = f"""
Category: {item['category']}
Topic: {item['topic']}
Content: {item['content']}
Tags: {', '.join(item['tags'])}
"""
            doc = Document(
                page_content=content.strip(),
                metadata={
                    "category": item['category'],
                    "topic": item['topic'],
                    "tags": item['tags']
                }
            )
            documents.append(doc)
        
        # Create FAISS vectorstore
        self.vectorstore = FAISS.from_documents(documents, self.embeddings)
        
        # Save vectorstore
        if persist_directory:
            self.vectorstore.save_local(persist_directory)
            print(f"Fashion knowledge vectorstore saved to {persist_directory}")
        
        return self.vectorstore
    
    def load_vectorstore(self, persist_directory: str = "fashion_vectorstore"):
        """
        Load existing FAISS vectorstore
        
        Args:
            persist_directory: Directory containing the vectorstore
        """
        if os.path.exists(persist_directory):
            self.vectorstore = FAISS.load_local(
                persist_directory, 
                self.embeddings,
                allow_dangerous_deserialization=True
            )
            print(f"Fashion knowledge vectorstore loaded from {persist_directory}")
            return self.vectorstore
        else:
            print(f"No vectorstore found at {persist_directory}. Building new one...")
            return self.build_vectorstore(persist_directory)
    
    def search_knowledge(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """
        Search fashion knowledge base
        
        Args:
            query: Search query
            k: Number of results to return
            
        Returns:
            List of relevant fashion knowledge items
        """
        if not self.vectorstore:
            raise ValueError("Vectorstore not loaded. Call build_vectorstore() or load_vectorstore() first.")
        
        # Search for relevant documents
        results = self.vectorstore.similarity_search_with_score(query, k=k)
        
        # Format results
        formatted_results = []
        for doc, score in results:
            formatted_results.append({
                "content": doc.page_content,
                "metadata": doc.metadata,
                "relevance_score": float(1 - score)  # Convert distance to similarity
            })
        
        return formatted_results
    
    def get_knowledge_by_category(self, category: str) -> List[Dict[str, Any]]:
        """
        Get all knowledge items from a specific category
        
        Args:
            category: Category to filter by
            
        Returns:
            List of knowledge items from the category
        """
        return [item for item in self.knowledge_data if item['category'] == category]
    
    def add_knowledge(self, category: str, topic: str, content: str, tags: List[str]):
        """
        Add new knowledge to the database
        
        Args:
            category: Knowledge category
            topic: Topic title
            content: Knowledge content
            tags: List of relevant tags
        """
        new_item = {
            "category": category,
            "topic": topic,
            "content": content,
            "tags": tags
        }
        self.knowledge_data.append(new_item)
        
        # Rebuild vectorstore if it exists
        if self.vectorstore:
            self.build_vectorstore()

if __name__ == "__main__":
    # Initialize and build fashion knowledge base
    fashion_kb = FashionKnowledgeBase()
    
    # Build vectorstore
    vectorstore = fashion_kb.build_vectorstore()
    
    # Test search functionality
    test_queries = [
        "What colors work well together?",
        "How to dress for apple body type?",
        "Business professional outfit ideas",
        "Spring fashion trends",
        "Sustainable wardrobe building"
    ]
    
    print("\n=== Fashion Knowledge Base Test Results ===\n")
    
    for query in test_queries:
        print(f"Query: {query}")
        results = fashion_kb.search_knowledge(query, k=2)
        
        for i, result in enumerate(results, 1):
            print(f"  {i}. {result['metadata']['topic']} (Score: {result['relevance_score']:.3f})")
            print(f"     Category: {result['metadata']['category']}")
        print()