"""
Advanced Image Analysis for Fashion using CLIP and Computer Vision
Analyzes clothing attributes, colors, styles, and provides intelligent insights
"""

import torch
import clip
from PIL import Image, ImageDraw, ImageFont
import cv2
import numpy as np
from typing import Dict, List, Any, Tuple, Optional
import colorsys
from collections import Counter
import webcolors
import base64
from io import BytesIO
import requests

class ClothingImageAnalyzer:
    def __init__(self, device: str = "cpu"):
        """
        Initialize CLIP-based clothing image analyzer
        
        Args:
            device: Device to run CLIP on ('cpu' or 'cuda')
        """
        self.device = device
        
        # Load CLIP model
        try:
            self.model, self.preprocess = clip.load("ViT-B/32", device=device)
            self.clip_available = True
            print(f"CLIP model loaded on {device}")
        except Exception as e:
            print(f"CLIP not available: {e}. Falling back to basic analysis.")
            self.clip_available = False
            self.model = None
            self.preprocess = None
        
        # Define clothing categories and attributes
        self.clothing_categories = [
            "shirt", "t-shirt", "blouse", "top", "dress", "skirt", "pants", "jeans",
            "shorts", "jacket", "blazer", "coat", "sweater", "hoodie", "cardigan",
            "shoes", "sneakers", "boots", "sandals", "heels", "hat", "bag", "accessories"
        ]
        
        self.style_attributes = [
            "casual", "formal", "business", "elegant", "sporty", "bohemian", "vintage",
            "modern", "minimalist", "edgy", "romantic", "classic", "trendy", "avant-garde"
        ]
        
        self.color_names = [
            "red", "blue", "green", "yellow", "orange", "purple", "pink", "brown",
            "black", "white", "gray", "navy", "beige", "cream", "maroon", "teal"
        ]
        
        # Pattern and texture descriptions
        self.patterns = [
            "solid", "striped", "polka dot", "floral", "geometric", "plaid", "checkered",
            "leopard print", "zebra print", "abstract", "paisley", "houndstooth"
        ]
        
        self.textures = [
            "smooth", "textured", "knit", "woven", "leather", "denim", "silk", "cotton",
            "wool", "synthetic", "shiny", "matte", "velvet", "lace", "mesh"
        ]
    
    def analyze_image(self, image_path: str) -> Dict[str, Any]:
        """
        Comprehensive image analysis
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dictionary containing all analysis results
        """
        try:
            # Load image
            if image_path.startswith('http'):
                response = requests.get(image_path)
                image = Image.open(BytesIO(response.content))
            else:
                image = Image.open(image_path)
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Perform different types of analysis
            results = {
                "image_info": self._get_image_info(image),
                "dominant_colors": self._analyze_colors(image),
                "clothing_detection": self._detect_clothing_items(image) if self.clip_available else {},
                "style_analysis": self._analyze_style(image) if self.clip_available else {},
                "pattern_texture": self._analyze_patterns_textures(image) if self.clip_available else {},
                "fashion_attributes": self._extract_fashion_attributes(image),
                "outfit_cohesion": self._analyze_outfit_cohesion(image),
                "recommendations": self._generate_recommendations(image)
            }
            
            return results
            
        except Exception as e:
            return {"error": f"Failed to analyze image: {str(e)}"}
    
    def _get_image_info(self, image: Image.Image) -> Dict[str, Any]:
        """Get basic image information"""
        return {
            "width": image.width,
            "height": image.height,
            "mode": image.mode,
            "format": image.format,
            "aspect_ratio": round(image.width / image.height, 2)
        }
    
    def _analyze_colors(self, image: Image.Image) -> Dict[str, Any]:
        """
        Analyze dominant colors in the image
        
        Args:
            image: PIL Image
            
        Returns:
            Color analysis results
        """
        try:
            # Convert to numpy array
            img_array = np.array(image)
            
            # Reshape for color analysis
            pixels = img_array.reshape(-1, 3)
            
            # Use K-means clustering to find dominant colors
            from sklearn.cluster import KMeans
            
            # Reduce number of pixels for faster processing
            if len(pixels) > 10000:
                indices = np.random.choice(len(pixels), 10000, replace=False)
                pixels = pixels[indices]
            
            # Find dominant colors
            kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
            kmeans.fit(pixels)
            
            colors = kmeans.cluster_centers_.astype(int)
            labels = kmeans.labels_
            
            # Calculate color percentages
            label_counts = Counter(labels)
            total_pixels = len(labels)
            
            color_analysis = []
            for i, color in enumerate(colors):
                percentage = (label_counts[i] / total_pixels) * 100
                
                # Convert RGB to hex
                hex_color = "#{:02x}{:02x}{:02x}".format(color[0], color[1], color[2])
                
                # Get closest color name
                color_name = self._get_color_name(color)
                
                color_analysis.append({
                    "rgb": color.tolist(),
                    "hex": hex_color,
                    "name": color_name,
                    "percentage": round(percentage, 2)
                })
            
            # Sort by percentage
            color_analysis.sort(key=lambda x: x["percentage"], reverse=True)
            
            return {
                "dominant_colors": color_analysis,
                "primary_color": color_analysis[0]["name"] if color_analysis else "unknown",
                "color_harmony": self._analyze_color_harmony([c["rgb"] for c in color_analysis[:3]])
            }
            
        except Exception as e:
            return {"error": f"Color analysis failed: {str(e)}"}
    
    def _get_color_name(self, rgb_color: np.ndarray) -> str:
        """
        Get the closest color name for RGB values
        
        Args:
            rgb_color: RGB color values
            
        Returns:
            Closest color name
        """
        try:
            # Convert to hex
            hex_color = "#{:02x}{:02x}{:02x}".format(rgb_color[0], rgb_color[1], rgb_color[2])
            
            # Try to get exact match
            try:
                color_name = webcolors.hex_to_name(hex_color)
                return color_name
            except ValueError:
                pass
            
            # Find closest color
            min_colors = {}
            for key, name in webcolors.CSS3_HEX_TO_NAMES.items():
                r_c, g_c, b_c = webcolors.hex_to_rgb(key)
                rd = (r_c - rgb_color[0]) ** 2
                gd = (g_c - rgb_color[1]) ** 2
                bd = (b_c - rgb_color[2]) ** 2
                min_colors[(rd + gd + bd)] = name
            
            return min_colors[min(min_colors.keys())]
            
        except Exception:
            return "unknown"
    
    def _analyze_color_harmony(self, colors: List[List[int]]) -> str:
        """
        Analyze color harmony of the dominant colors
        
        Args:
            colors: List of RGB color values
            
        Returns:
            Color harmony type
        """
        if len(colors) < 2:
            return "monochromatic"
        
        try:
            # Convert to HSV for better harmony analysis
            hsv_colors = []
            for rgb in colors:
                r, g, b = [x/255.0 for x in rgb]
                h, s, v = colorsys.rgb_to_hsv(r, g, b)
                hsv_colors.append([h * 360, s * 100, v * 100])
            
            # Analyze hue differences
            hues = [color[0] for color in hsv_colors]
            
            # Check for complementary (opposite hues)
            for i in range(len(hues)):
                for j in range(i+1, len(hues)):
                    diff = abs(hues[i] - hues[j])
                    if 160 <= diff <= 200:  # Approximately opposite
                        return "complementary"
            
            # Check for analogous (similar hues)
            hue_range = max(hues) - min(hues)
            if hue_range <= 60:
                return "analogous"
            
            # Check for triadic
            if len(hues) >= 3:
                sorted_hues = sorted(hues)
                if abs(sorted_hues[1] - sorted_hues[0] - 120) <= 30 and \
                   abs(sorted_hues[2] - sorted_hues[1] - 120) <= 30:
                    return "triadic"
            
            return "complex"
            
        except Exception:
            return "unknown"
    
    def _detect_clothing_items(self, image: Image.Image) -> Dict[str, Any]:
        """
        Detect clothing items using CLIP
        
        Args:
            image: PIL Image
            
        Returns:
            Detected clothing items with confidence scores
        """
        if not self.clip_available:
            return {"error": "CLIP not available"}
        
        try:
            # Preprocess image
            image_tensor = self.preprocess(image).unsqueeze(0).to(self.device)
            
            # Create text prompts for clothing categories
            text_prompts = [f"a photo of {item}" for item in self.clothing_categories]
            text_tokens = clip.tokenize(text_prompts).to(self.device)
            
            # Get predictions
            with torch.no_grad():
                logits_per_image, logits_per_text = self.model(image_tensor, text_tokens)
                probs = logits_per_image.softmax(dim=-1).cpu().numpy()[0]
            
            # Get top predictions
            top_indices = np.argsort(probs)[::-1][:5]
            
            detected_items = []
            for idx in top_indices:
                if probs[idx] > 0.1:  # Threshold for confidence
                    detected_items.append({
                        "item": self.clothing_categories[idx],
                        "confidence": float(probs[idx])
                    })
            
            return {
                "detected_items": detected_items,
                "primary_item": detected_items[0]["item"] if detected_items else "unknown"
            }
            
        except Exception as e:
            return {"error": f"Clothing detection failed: {str(e)}"}
    
    def _analyze_style(self, image: Image.Image) -> Dict[str, Any]:
        """
        Analyze fashion style using CLIP
        
        Args:
            image: PIL Image
            
        Returns:
            Style analysis results
        """
        if not self.clip_available:
            return {"error": "CLIP not available"}
        
        try:
            # Preprocess image
            image_tensor = self.preprocess(image).unsqueeze(0).to(self.device)
            
            # Create style prompts
            style_prompts = [f"{style} fashion style" for style in self.style_attributes]
            text_tokens = clip.tokenize(style_prompts).to(self.device)
            
            # Get predictions
            with torch.no_grad():
                logits_per_image, logits_per_text = self.model(image_tensor, text_tokens)
                probs = logits_per_image.softmax(dim=-1).cpu().numpy()[0]
            
            # Get top style predictions
            top_indices = np.argsort(probs)[::-1][:3]
            
            style_scores = []
            for idx in top_indices:
                style_scores.append({
                    "style": self.style_attributes[idx],
                    "confidence": float(probs[idx])
                })
            
            return {
                "style_scores": style_scores,
                "primary_style": style_scores[0]["style"] if style_scores else "unknown"
            }
            
        except Exception as e:
            return {"error": f"Style analysis failed: {str(e)}"}
    
    def _analyze_patterns_textures(self, image: Image.Image) -> Dict[str, Any]:
        """
        Analyze patterns and textures using CLIP
        
        Args:
            image: PIL Image
            
        Returns:
            Pattern and texture analysis
        """
        if not self.clip_available:
            return {"error": "CLIP not available"}
        
        try:
            # Preprocess image
            image_tensor = self.preprocess(image).unsqueeze(0).to(self.device)
            
            # Analyze patterns
            pattern_prompts = [f"{pattern} pattern" for pattern in self.patterns]
            pattern_tokens = clip.tokenize(pattern_prompts).to(self.device)
            
            with torch.no_grad():
                logits_per_image, _ = self.model(image_tensor, pattern_tokens)
                pattern_probs = logits_per_image.softmax(dim=-1).cpu().numpy()[0]
            
            top_pattern_idx = np.argmax(pattern_probs)
            detected_pattern = {
                "pattern": self.patterns[top_pattern_idx],
                "confidence": float(pattern_probs[top_pattern_idx])
            }
            
            # Analyze textures
            texture_prompts = [f"{texture} texture" for texture in self.textures]
            texture_tokens = clip.tokenize(texture_prompts).to(self.device)
            
            with torch.no_grad():
                logits_per_image, _ = self.model(image_tensor, texture_tokens)
                texture_probs = logits_per_image.softmax(dim=-1).cpu().numpy()[0]
            
            top_texture_idx = np.argmax(texture_probs)
            detected_texture = {
                "texture": self.textures[top_texture_idx],
                "confidence": float(texture_probs[top_texture_idx])
            }
            
            return {
                "pattern": detected_pattern,
                "texture": detected_texture
            }
            
        except Exception as e:
            return {"error": f"Pattern/texture analysis failed: {str(e)}"}
    
    def _extract_fashion_attributes(self, image: Image.Image) -> Dict[str, Any]:
        """
        Extract general fashion attributes from the image
        
        Args:
            image: PIL Image
            
        Returns:
            Fashion attributes
        """
        # Basic analysis without CLIP
        width, height = image.size
        
        # Analyze brightness
        grayscale = image.convert('L')
        brightness = np.array(grayscale).mean()
        
        # Analyze contrast
        contrast = np.array(grayscale).std()
        
        return {
            "brightness": {
                "value": float(brightness),
                "category": "bright" if brightness > 150 else "medium" if brightness > 100 else "dark"
            },
            "contrast": {
                "value": float(contrast),
                "category": "high" if contrast > 50 else "medium" if contrast > 25 else "low"
            },
            "complexity": {
                "category": "complex" if contrast > 40 and brightness > 100 else "simple"
            }
        }
    
    def _analyze_outfit_cohesion(self, image: Image.Image) -> Dict[str, Any]:
        """
        Analyze how well the outfit elements work together
        
        Args:
            image: PIL Image
            
        Returns:
            Outfit cohesion analysis
        """
        # This is a simplified analysis - in practice, you'd use more sophisticated methods
        color_analysis = self._analyze_colors(image)
        
        cohesion_score = 0.5  # Base score
        
        if color_analysis.get("color_harmony") in ["complementary", "analogous", "monochromatic"]:
            cohesion_score += 0.3
        
        if len(color_analysis.get("dominant_colors", [])) <= 3:
            cohesion_score += 0.2  # Fewer colors often means better cohesion
        
        return {
            "cohesion_score": min(1.0, cohesion_score),
            "cohesion_level": "high" if cohesion_score > 0.7 else "medium" if cohesion_score > 0.4 else "low",
            "factors": {
                "color_harmony": color_analysis.get("color_harmony", "unknown"),
                "color_count": len(color_analysis.get("dominant_colors", []))
            }
        }
    
    def _generate_recommendations(self, image: Image.Image) -> List[str]:
        """
        Generate styling recommendations based on analysis
        
        Args:
            image: PIL Image
            
        Returns:
            List of recommendations
        """
        recommendations = []
        
        # Analyze colors for recommendations
        color_analysis = self._analyze_colors(image)
        primary_color = color_analysis.get("primary_color", "").lower()
        
        # Color-based recommendations
        if primary_color in ["black", "gray", "white"]:
            recommendations.append("Add a pop of color with accessories to brighten the look")
        elif primary_color in ["red", "orange", "yellow"]:
            recommendations.append("Balance warm colors with cool neutrals for sophisticated styling")
        elif primary_color in ["blue", "green", "purple"]:
            recommendations.append("Enhance with complementary warm tones or metallic accessories")
        
        # Brightness recommendations
        attributes = self._extract_fashion_attributes(image)
        brightness = attributes.get("brightness", {}).get("category", "")
        
        if brightness == "dark":
            recommendations.append("Consider adding lighter elements to create visual interest")
        elif brightness == "bright":
            recommendations.append("Ground bright pieces with darker accessories or shoes")
        
        # Cohesion recommendations
        cohesion = self._analyze_outfit_cohesion(image)
        if cohesion.get("cohesion_level") == "low":
            recommendations.append("Try limiting to 2-3 main colors for better outfit cohesion")
        
        # General styling tips
        recommendations.extend([
            "Add texture variety through different fabric types",
            "Consider the occasion and dress code appropriateness",
            "Ensure proper fit for a polished appearance"
        ])
        
        return recommendations[:5]  # Return top 5 recommendations

# Example usage
if __name__ == "__main__":
    analyzer = ClothingImageAnalyzer()
    
    # Test with a sample image (you would provide an actual image path)
    print("Fashion Image Analyzer initialized")
    print(f"CLIP available: {analyzer.clip_available}")
    
    # Example analysis structure
    sample_analysis = {
        "image_info": {"width": 800, "height": 1200, "aspect_ratio": 0.67},
        "dominant_colors": [
            {"name": "navy", "percentage": 45.2, "hex": "#1a237e"},
            {"name": "white", "percentage": 30.1, "hex": "#ffffff"},
            {"name": "gold", "percentage": 24.7, "hex": "#ffd700"}
        ],
        "style_analysis": {"primary_style": "business", "confidence": 0.85},
        "recommendations": [
            "Perfect for professional settings",
            "Add metallic accessories to enhance the gold accents",
            "Consider navy shoes to tie the look together"
        ]
    }
    
    print("\nSample Analysis Structure:")
    print(f"Colors: {len(sample_analysis['dominant_colors'])} detected")
    print(f"Style: {sample_analysis['style_analysis']['primary_style']}")
    print(f"Recommendations: {len(sample_analysis['recommendations'])} generated")