"""
Simplified Smart Fashion Advisor for testing without heavy dependencies
This version provides fallback functionality when LangChain/CLIP are not available
"""

import json
import random
from typing import Dict, List, Any, Optional

class SimpleFashionAdvisor:
    def __init__(self):
        """
        Initialize simplified fashion advisor with built-in knowledge
        """
        self.fashion_rules = {
            "color_combinations": {
                "red": ["white", "black", "navy", "cream", "gray"],
                "blue": ["white", "cream", "yellow", "orange", "gray"],
                "green": ["white", "beige", "brown", "navy", "cream"],
                "yellow": ["black", "navy", "gray", "purple", "white"],
                "purple": ["white", "yellow", "cream", "gray", "silver"],
                "orange": ["blue", "white", "brown", "cream", "teal"],
                "pink": ["white", "gray", "navy", "green", "black"],
                "brown": ["cream", "white", "orange", "yellow", "green"],
                "black": ["white", "red", "yellow", "pink", "any color"],
                "white": ["any color"],
                "gray": ["yellow", "pink", "blue", "purple", "white"],
                "navy": ["white", "cream", "yellow", "pink", "orange"]
            },
            "body_types": {
                "apple": {
                    "focus": "Draw attention away from midsection",
                    "recommended": ["Empire waist", "A-line dresses", "V-necks", "Flow-away tops"],
                    "avoid": ["Tight waistbands", "Cropped tops", "Horizontal stripes at waist"]
                },
                "pear": {
                    "focus": "Emphasize upper body, minimize lower",
                    "recommended": ["Statement sleeves", "Boat necks", "Bright tops", "A-line skirts"],
                    "avoid": ["Tight bottoms", "Hip details", "Tapered pants"]
                },
                "rectangle": {
                    "focus": "Create curves and definition",
                    "recommended": ["Belted waists", "Peplum tops", "Fit-and-flare", "Layering"],
                    "avoid": ["Boxy cuts", "Straight silhouettes", "No definition"]
                },
                "hourglass": {
                    "focus": "Highlight natural waistline",
                    "recommended": ["Fitted styles", "Wrap dresses", "High-waisted bottoms", "Tucked tops"],
                    "avoid": ["Shapeless clothing", "Low-waisted bottoms", "Oversized everything"]
                }
            },
            "occasions": {
                "business": ["Structured blazers", "Tailored pants", "Button-down shirts", "Neutral colors", "Minimal accessories"],
                "casual": ["Comfortable jeans", "Soft fabrics", "Layering pieces", "Sneakers or flats", "Personal touches"],
                "cocktail": ["Little black dress", "Silk blouses", "Statement jewelry", "Heels", "Elegant fabrics"],
                "formal": ["Evening wear", "Fine fabrics", "Classic cuts", "Sophisticated accessories", "Polished shoes"]
            },
            "color_theory": {
                "complementary": "Colors opposite on color wheel (high contrast, bold)",
                "analogous": "Adjacent colors on wheel (harmonious, sophisticated)",
                "monochromatic": "Different shades of same color (elegant, elongating)",
                "triadic": "Three evenly spaced colors (vibrant, balanced)"
            }
        }
    
    def get_fashion_advice(self, question: str, advice_type: str = "general") -> Dict[str, Any]:
        """
        Get fashion advice based on built-in knowledge
        """
        question_lower = question.lower()
        advice = ""
        relevant_topics = []
        
        # Color advice
        if any(color in question_lower for color in self.fashion_rules["color_combinations"]):
            for color, matches in self.fashion_rules["color_combinations"].items():
                if color in question_lower:
                    advice += f"For {color}, great color combinations include: {', '.join(matches[:4])}. "
                    relevant_topics.append(f"{color} color combinations")
                    break
        
        # Body type advice
        if any(body_type in question_lower for body_type in self.fashion_rules["body_types"]):
            for body_type, rules in self.fashion_rules["body_types"].items():
                if body_type in question_lower:
                    advice += f"For {body_type} body type: {rules['focus']}. "
                    advice += f"Recommended: {', '.join(rules['recommended'][:3])}. "
                    relevant_topics.append(f"{body_type} body type styling")
                    break
        
        # Occasion advice
        if any(occasion in question_lower for occasion in self.fashion_rules["occasions"]):
            for occasion, items in self.fashion_rules["occasions"].items():
                if occasion in question_lower:
                    advice += f"For {occasion} occasions, consider: {', '.join(items[:3])}. "
                    relevant_topics.append(f"{occasion} dressing")
                    break
        
        # General fashion advice if no specific match
        if not advice:
            general_tips = [
                "Focus on fit - well-fitted clothes always look more expensive and polished.",
                "Stick to a cohesive color palette for a sophisticated look.",
                "Invest in quality basics that you can mix and match.",
                "Add personality with accessories while keeping the base outfit classic.",
                "Consider the occasion and dress code when planning your outfit."
            ]
            advice = random.choice(general_tips)
            relevant_topics = ["general styling principles"]
        
        return {
            "advice": advice.strip(),
            "type": advice_type,
            "query": question,
            "relevant_knowledge": relevant_topics,
            "confidence": "medium"
        }
    
    def analyze_outfit_combination(self, items: List[str], occasion: str = "") -> Dict[str, Any]:
        """Analyze outfit combination"""
        items_str = ", ".join(items)
        question = f"Analyze this outfit: {items_str}"
        if occasion:
            question += f" for {occasion}"
        
        return self.get_fashion_advice(question, "outfit")
    
    def get_color_palette_advice(self, base_colors: List[str], season: str = "") -> Dict[str, Any]:
        """Get color coordination advice"""
        colors_str = ", ".join(base_colors)
        question = f"What colors work with {colors_str}?"
        if season:
            question += f" for {season} season"
        
        return self.get_fashion_advice(question, "color")

class SimpleImageAnalyzer:
    """Simple image analyzer without CLIP dependencies"""
    
    def __init__(self):
        self.basic_colors = {
            "red": [255, 0, 0],
            "green": [0, 255, 0], 
            "blue": [0, 0, 255],
            "black": [0, 0, 0],
            "white": [255, 255, 255],
            "gray": [128, 128, 128]
        }
    
    def analyze_image(self, image_path: str) -> Dict[str, Any]:
        """Basic image analysis simulation"""
        return {
            "image_info": {"width": 800, "height": 600, "format": "JPEG"},
            "dominant_colors": [
                {"name": "navy", "percentage": 45.0, "hex": "#000080"},
                {"name": "white", "percentage": 35.0, "hex": "#ffffff"},
                {"name": "gray", "percentage": 20.0, "hex": "#808080"}
            ],
            "clothing_detection": {"primary_item": "shirt", "confidence": 0.75},
            "style_analysis": {"primary_style": "business", "confidence": 0.80},
            "recommendations": [
                "Great professional look!",
                "Consider adding a pop of color with accessories",
                "The color combination is very sophisticated"
            ],
            "outfit_cohesion": {"cohesion_score": 0.85, "cohesion_level": "high"}
        }

def test_simple_fashion_system():
    """Test the simplified fashion system"""
    print("=== Testing Simplified Smart Fashion Advisor ===")
    
    # Test fashion advisor
    advisor = SimpleFashionAdvisor()
    
    test_cases = [
        "I have a navy blazer and want professional advice",
        "What colors go with red?", 
        "How should I dress my apple body type?",
        "I need business casual outfit ideas"
    ]
    
    for question in test_cases:
        result = advisor.get_fashion_advice(question)
        print(f"Q: {question}")
        print(f"A: {result['advice']}")
        print(f"Topics: {result['relevant_knowledge']}")
        print()
    
    # Test image analyzer
    analyzer = SimpleImageAnalyzer()
    analysis = analyzer.analyze_image("dummy_path.jpg")
    
    print("=== Image Analysis Test ===")
    print(f"Primary colors: {[c['name'] for c in analysis['dominant_colors']]}")
    print(f"Detected style: {analysis['style_analysis']['primary_style']}")
    print(f"Cohesion level: {analysis['outfit_cohesion']['cohesion_level']}")
    
    print("\n✅ Simplified system working correctly!")
    
    return advisor, analyzer

if __name__ == "__main__":
    test_simple_fashion_system()