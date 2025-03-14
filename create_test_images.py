from PIL import Image, ImageDraw
import numpy as np
import os
import traceback

def create_model_image():
    """Create a simple model image (silhouette of a person)."""
    try:
        print("Starting to create model image...")
        # Create a white background
        img = Image.new('RGB', (512, 768), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)
        
        # Draw a simple silhouette
        # Head
        draw.ellipse([(200, 100), (300, 200)], fill=(200, 150, 150))
        
        # Body
        draw.rectangle([(220, 200), (280, 400)], fill=(200, 150, 150))
        
        # Arms
        draw.rectangle([(180, 200), (220, 350)], fill=(200, 150, 150))
        draw.rectangle([(280, 200), (320, 350)], fill=(200, 150, 150))
        
        # Legs
        draw.rectangle([(220, 400), (250, 600)], fill=(200, 150, 150))
        draw.rectangle([(250, 400), (280, 600)], fill=(200, 150, 150))
        
        # Save the image
        print(f"Saving model image to {os.path.abspath('test_model.jpg')}")
        img.save('test_model.jpg')
        print("Created test model image: test_model.jpg")
        return True
    except Exception as e:
        print(f"Error creating model image: {e}")
        traceback.print_exc()
        return False

def create_cloth_image():
    """Create a simple t-shirt image."""
    try:
        print("Starting to create cloth image...")
        # Create a white background
        img = Image.new('RGB', (512, 768), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)
        
        # Draw a simple t-shirt
        # T-shirt body
        points = [
            (150, 200),  # Top left
            (350, 200),  # Top right
            (380, 250),  # Shoulder right
            (380, 400),  # Bottom right
            (120, 400),  # Bottom left
            (120, 250),  # Shoulder left
        ]
        draw.polygon(points, fill=(0, 100, 255))
        
        # Sleeve left
        sleeve_left = [
            (120, 250),  # Shoulder
            (80, 300),   # Sleeve end
            (100, 330),  # Sleeve bottom
            (150, 280),  # Armpit
        ]
        draw.polygon(sleeve_left, fill=(0, 100, 255))
        
        # Sleeve right
        sleeve_right = [
            (380, 250),  # Shoulder
            (420, 300),  # Sleeve end
            (400, 330),  # Sleeve bottom
            (350, 280),  # Armpit
        ]
        draw.polygon(sleeve_right, fill=(0, 100, 255))
        
        # Add some texture/pattern
        for i in range(10):
            x = np.random.randint(150, 350)
            y = np.random.randint(250, 380)
            size = np.random.randint(5, 15)
            draw.ellipse([(x, y), (x+size, y+size)], fill=(0, 50, 200))
        
        # Save the image
        print(f"Saving cloth image to {os.path.abspath('test_cloth.jpg')}")
        img.save('test_cloth.jpg')
        print("Created test cloth image: test_cloth.jpg")
        return True
    except Exception as e:
        print(f"Error creating cloth image: {e}")
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("Current working directory:", os.getcwd())
    print("Starting test image creation...")
    
    model_success = create_model_image()
    cloth_success = create_cloth_image()
    
    if model_success and cloth_success:
        print("All test images created successfully!")
    else:
        print("There were errors creating the test images.") 