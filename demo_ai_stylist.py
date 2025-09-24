"""
Simple demonstration of the AI Stylist Virtual Try-On System
Shows how to use the system for styling requests without full API integration
"""

import os
import json
from datetime import datetime

def demo_clothing_retrieval():
    """Demonstrate clothing retrieval functionality"""
    print("🔍 Loading clothing database...")
    
    # Load clothing database
    with open('clothing_database.json', 'r') as f:
        data = json.load(f)
    
    clothing_items = data['clothing_items']
    print(f"📦 Loaded {len(clothing_items)} clothing items")
    
    # Display all items
    print("\n👔 Available Clothing Items:")
    print("-" * 50)
    for i, item in enumerate(clothing_items, 1):
        print(f"{i}. {item['name']}")
        print(f"   Category: {item['category']}")
        print(f"   Color: {item['color']}")
        print(f"   Style: {item['style']}")
        print(f"   Description: {item['description']}")
        print()
    
    return clothing_items

def demo_style_matching(clothing_items, user_request):
    """Simple style matching based on keywords"""
    print(f"🎯 Processing request: '{user_request}'")
    
    # Simple keyword matching
    request_lower = user_request.lower()
    matches = []
    
    for item in clothing_items:
        score = 0
        
        # Check category
        if item['category'] in request_lower:
            score += 10
        
        # Check style
        if item['style'] in request_lower:
            score += 8
        
        # Check color
        if item['color'] in request_lower:
            score += 6
        
        # Check tags
        for tag in item['tags']:
            if tag in request_lower:
                score += 4
        
        # Check occasion keywords
        if 'professional' in request_lower or 'business' in request_lower:
            if 'professional' in item['tags'] or 'business' in item['tags']:
                score += 12
        
        if 'casual' in request_lower:
            if item['style'] == 'casual':
                score += 10
        
        if 'formal' in request_lower:
            if item['style'] == 'formal':
                score += 10
        
        if score > 0:
            matches.append((item, score))
    
    # Sort by score
    matches.sort(key=lambda x: x[1], reverse=True)
    
    return matches

def generate_segmind_prompt(selected_item, user_request):
    """Generate a Segmind-optimized prompt"""
    
    prompt = f"""
Create a photorealistic virtual try-on image with the following specifications:

PRESERVE USER CHARACTERISTICS:
- Maintain exact body shape, pose, and positioning
- Preserve natural skin tone and facial features
- Keep hair and background unchanged
- Maintain original lighting conditions

CLOTHING REPLACEMENT:
- Replace existing clothing with: {selected_item['name']}
- Description: {selected_item['description']}
- Fabric: {selected_item['fabric']} with {selected_item['texture_description']}
- Color: {selected_item['color']}
- Fit: {selected_item['fit']}
- Style: {selected_item['style']}

MATERIAL PROPERTIES:
"""
    
    for prop, value in selected_item['material_properties'].items():
        prompt += f"- {prop.title()}: {value}\n"
    
    prompt += f"""
QUALITY REQUIREMENTS:
- Ultra-high resolution (4K), sharp details
- Realistic fabric texture and natural draping
- Accurate color representation: {selected_item['color']}
- Natural shadows and lighting consistency
- Seamless clothing integration without artifacts
- Professional photography quality
- Photorealistic rendering with proper garment physics

STYLE CONTEXT:
- Occasion appropriateness for: {user_request}
- Maintain {selected_item['style']} aesthetic
- Ensure proper fit and proportions
"""
    
    return prompt.strip()

def demo_complete_workflow():
    """Demonstrate the complete AI Stylist workflow"""
    print("🚀 AI Stylist Virtual Try-On Demo")
    print("=" * 50)
    
    # Load clothing database
    clothing_items = demo_clothing_retrieval()
    
    # Example user requests
    test_requests = [
        "I need a professional outfit for a business meeting",
        "Casual outfit for weekend",
        "Formal attire for evening event",
        "White shirt for office work"
    ]
    
    for request in test_requests:
        print("\n" + "="*60)
        print(f"🎯 USER REQUEST: {request}")
        print("="*60)
        
        # Find matching items
        matches = demo_style_matching(clothing_items, request)
        
        if matches:
            print(f"\n📋 Found {len(matches)} matching items:")
            
            # Show top 3 matches
            for i, (item, score) in enumerate(matches[:3], 1):
                print(f"{i}. {item['name']} (Score: {score})")
                print(f"   {item['description']}")
            
            # Select best match
            best_item, best_score = matches[0]
            print(f"\n✨ SELECTED: {best_item['name']} (Score: {best_score})")
            
            # Generate Segmind prompt
            prompt = generate_segmind_prompt(best_item, request)
            print(f"\n🎨 GENERATED SEGMIND PROMPT:")
            print("-" * 40)
            print(prompt[:300] + "..." if len(prompt) > 300 else prompt)
            
            # Style recommendations
            print(f"\n💡 STYLING RECOMMENDATIONS:")
            if best_item['category'] == 'shirt':
                print("- Pair with dark trousers for professional look")
                print("- Add a blazer for extra formality")
            elif best_item['category'] == 'jacket':
                print("- Wear over a crisp shirt")
                print("- Combine with matching trousers")
            elif best_item['category'] == 'dress':
                print("- Add heels for elegant look")
                print("- Consider a cardigan for layering")
            
        else:
            print("❌ No matching items found for this request")

def demo_api_simulation():
    """Simulate API responses"""
    print("\n🌐 API Response Simulation")
    print("-" * 30)
    
    sample_response = {
        "success": True,
        "final_image": "base64_encoded_image_would_be_here",
        "selected_clothing": {
            "id": "shirt_001",
            "name": "Classic White Cotton Shirt",
            "description": "Crisp white cotton dress shirt...",
            "fabric": "cotton",
            "color": "white",
            "style": "classic"
        },
        "ai_prompt": "Segmind-optimized prompt for photorealistic try-on...",
        "recommendations": [
            "Pair with dark trousers for professional look",
            "Add a blazer for formal occasions"
        ],
        "alternatives": [
            {"name": "Navy Blue Wool Blazer", "style": "formal"},
            {"name": "Dark Denim Jeans", "style": "casual"}
        ],
        "metadata": {
            "processing_method": "ai_styling",
            "pose_detected": True,
            "processing_time": "2.3 seconds"
        }
    }
    
    print("Sample API Response:")
    print(json.dumps(sample_response, indent=2))

if __name__ == "__main__":
    try:
        # Run demo
        demo_complete_workflow()
        demo_api_simulation()
        
        print("\n🎉 Demo completed successfully!")
        print("\n📝 Next Steps:")
        print("1. Add your API keys to .env file")
        print("2. Run: python ai_stylist_api.py")
        print("3. Test with real image uploads")
        print("4. Integrate with frontend")
        
    except FileNotFoundError:
        print("❌ clothing_database.json not found. Please ensure it exists.")
    except Exception as e:
        print(f"❌ Demo failed: {e}")