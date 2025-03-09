#!/usr/bin/env python3
"""
ComfyUI Virtual Try-On Example Script

This script demonstrates how to use the ComfyVirtual nodes programmatically
without the ComfyUI interface.
"""

import os
import sys
import argparse
import cv2
import numpy as np
from PIL import Image
import torch

# Add the current directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import our custom nodes
from nodes.preprocessing import ModelPreprocessor, ClothPreprocessor
from nodes.warping import ClothWarper
from nodes.fusion import ImageFusionNode
from nodes.postprocessing import PostProcessor

def load_image(image_path):
    """Load an image and convert it to the format expected by our nodes."""
    img = Image.open(image_path).convert('RGB')
    img_np = np.array(img)
    # Convert to tensor (BCHW format)
    img_tensor = torch.from_numpy(img_np).float() / 255.0
    img_tensor = img_tensor.permute(2, 0, 1).unsqueeze(0)
    return img_tensor

def save_image(tensor, output_path):
    """Save a tensor as an image."""
    if isinstance(tensor, torch.Tensor):
        # Convert from BCHW to HWC
        img_np = tensor[0].permute(1, 2, 0).cpu().numpy()
        img_np = (img_np * 255).astype(np.uint8)
        img = Image.fromarray(img_np)
        img.save(output_path)
        print(f"Saved result to {output_path}")
    else:
        print("Error: Input is not a tensor")

def main():
    parser = argparse.ArgumentParser(description="ComfyUI Virtual Try-On Example")
    parser.add_argument("--model", required=True, help="Path to the model image")
    parser.add_argument("--cloth", required=True, help="Path to the cloth image")
    parser.add_argument("--output", default="result.png", help="Path to save the result")
    args = parser.parse_args()
    
    # Check if input files exist
    if not os.path.exists(args.model):
        print(f"Error: Model image not found at {args.model}")
        return
    
    if not os.path.exists(args.cloth):
        print(f"Error: Cloth image not found at {args.cloth}")
        return
    
    print("Loading images...")
    model_img = load_image(args.model)
    cloth_img = load_image(args.cloth)
    
    print("Processing model image...")
    model_processor = ModelPreprocessor()
    processed_model, model_mask, pose_data = model_processor.process(model_img)
    
    print("Processing cloth image...")
    cloth_processor = ClothPreprocessor()
    processed_cloth, cloth_mask = cloth_processor.process(cloth_img)
    
    print("Warping cloth to fit model...")
    warper = ClothWarper()
    warped_cloth, warped_mask = warper.warp(processed_cloth, cloth_mask, pose_data)
    
    print("Fusing images...")
    fusion = ImageFusionNode()
    fused_image = fusion.fuse(
        processed_model, warped_cloth, warped_mask, model_mask, 
        blend_mode="seamless", blend_strength=0.8
    )[0]
    
    print("Post-processing result...")
    post_processor = PostProcessor()
    final_image = post_processor.enhance(fused_image)[0]
    
    print("Saving result...")
    save_image(final_image, args.output)
    
    print("Done!")

if __name__ == "__main__":
    main() 