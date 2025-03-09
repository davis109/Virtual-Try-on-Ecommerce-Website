import numpy as np
import torch
import cv2
from PIL import Image
import torch.nn.functional as F

class ImageFusionNode:
    """
    Node for fusing the warped clothing onto the model image
    using advanced blending techniques.
    """
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "model_image": ("IMAGE",),
                "warped_cloth": ("IMAGE",),
                "warped_mask": ("MASK",),
                "model_mask": ("MASK",),
                "blend_mode": (["normal", "poisson", "seamless", "alpha"], {"default": "seamless"}),
                "blend_strength": ("FLOAT", {"default": 0.8, "min": 0.0, "max": 1.0, "step": 0.05}),
                "refine_edges": ("BOOLEAN", {"default": True}),
            },
        }
    
    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("fused_image",)
    FUNCTION = "fuse"
    CATEGORY = "ComfyVirtual/Fusion"
    
    def fuse(self, model_image, warped_cloth, warped_mask, model_mask, 
             blend_mode="seamless", blend_strength=0.8, refine_edges=True):
        # Convert from ComfyUI image format (BCHW) to OpenCV format
        if isinstance(model_image, torch.Tensor):
            # Assuming image is in [0,1] range, BCHW format
            model_img = model_image[0].permute(1, 2, 0).cpu().numpy()
            model_img = (model_img * 255).astype(np.uint8)
        else:
            model_img = np.array(model_image)
            
        if isinstance(warped_cloth, torch.Tensor):
            # Assuming image is in [0,1] range, BCHW format
            cloth_img = warped_cloth[0].permute(1, 2, 0).cpu().numpy()
            cloth_img = (cloth_img * 255).astype(np.uint8)
        else:
            cloth_img = np.array(warped_cloth)
            
        if isinstance(warped_mask, torch.Tensor):
            # Assuming mask is in [0,1] range, B1HW format
            cloth_mask = warped_mask[0][0].cpu().numpy()
            cloth_mask = (cloth_mask * 255).astype(np.uint8)
        else:
            cloth_mask = np.array(warped_mask)
            
        if isinstance(model_mask, torch.Tensor):
            # Assuming mask is in [0,1] range, B1HW format
            person_mask = model_mask[0][0].cpu().numpy()
            person_mask = (person_mask * 255).astype(np.uint8)
        else:
            person_mask = np.array(model_mask)
        
        # Ensure all images have the same dimensions
        h, w, _ = model_img.shape
        cloth_img = cv2.resize(cloth_img, (w, h))
        cloth_mask = cv2.resize(cloth_mask, (w, h))
        person_mask = cv2.resize(person_mask, (w, h))
        
        # Refine the cloth mask if requested
        if refine_edges:
            # Apply morphological operations to smooth the mask edges
            kernel = np.ones((5, 5), np.uint8)
            cloth_mask = cv2.morphologyEx(cloth_mask, cv2.MORPH_CLOSE, kernel)
            cloth_mask = cv2.GaussianBlur(cloth_mask, (5, 5), 0)
        
        # Normalize masks to [0, 1]
        cloth_mask_norm = cloth_mask / 255.0
        person_mask_norm = person_mask / 255.0
        
        # Create the result image
        result = model_img.copy()
        
        # Apply different blending modes
        if blend_mode == "normal":
            # Simple alpha blending
            for c in range(3):
                result[:, :, c] = (1 - cloth_mask_norm) * model_img[:, :, c] + cloth_mask_norm * cloth_img[:, :, c]
                
        elif blend_mode == "poisson":
            # Enhanced Poisson blending for realistic results
            # Create a mask for the region to blend
            blend_mask = (cloth_mask > 127).astype(np.uint8) * 255
            
            # Refine the mask to avoid artifacts
            if refine_edges:
                # Apply morphological operations to smooth the mask edges
                kernel = np.ones((5, 5), np.uint8)
                blend_mask = cv2.morphologyEx(blend_mask, cv2.MORPH_CLOSE, kernel)
                blend_mask = cv2.morphologyEx(blend_mask, cv2.MORPH_OPEN, kernel)
                blend_mask = cv2.GaussianBlur(blend_mask, (5, 5), 0)
                # Threshold again to get a clean mask
                blend_mask = (blend_mask > 127).astype(np.uint8) * 255
            
            # Find contours to identify connected regions
            contours, _ = cv2.findContours(blend_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Create a copy of the model image for the result
            result = model_img.copy()
            
            # Process each contour separately for better blending
            for contour in contours:
                # Skip small contours
                if cv2.contourArea(contour) < 500:
                    continue
                
                # Create a mask for this contour
                contour_mask = np.zeros_like(blend_mask)
                cv2.drawContours(contour_mask, [contour], 0, 255, -1)
                
                # Find the center of this contour
                M = cv2.moments(contour)
                if M["m00"] != 0:
                    center_x = int(M["m10"] / M["m00"])
                    center_y = int(M["m01"] / M["m00"])
                    
                    # Apply Poisson blending for this contour
                    try:
                        # Color correction before blending
                        cloth_img_adjusted = cloth_img.copy()
                        
                        # Match color statistics in the blended region
                        for c in range(3):
                            mask_region = contour_mask > 0
                            if np.sum(mask_region) > 0:
                                target_mean = np.mean(model_img[:, :, c][mask_region])
                                target_std = np.std(model_img[:, :, c][mask_region])
                                source_mean = np.mean(cloth_img[:, :, c][mask_region])
                                source_std = np.std(cloth_img[:, :, c][mask_region])
                                
                                if source_std > 0:
                                    cloth_img_adjusted[:, :, c] = np.clip(
                                        (cloth_img[:, :, c] - source_mean) * (target_std / source_std) + target_mean,
                                        0, 255
                                    ).astype(np.uint8)
                        
                        # Apply seamless cloning with mixed mode for better texture preservation
                        temp_result = cv2.seamlessClone(
                            cloth_img_adjusted, result, contour_mask, (center_x, center_y), cv2.MIXED_CLONE
                        )
                        
                        # Apply the result only where the contour mask is active
                        result = np.where(
                            np.expand_dims(contour_mask, axis=2) > 0,
                            temp_result,
                            result
                        )
                        
                    except cv2.error as e:
                        print(f"Poisson blending error: {e}")
                        # Fallback to normal blending for this contour
                        contour_mask_norm = contour_mask.astype(np.float32) / 255.0
                        for c in range(3):
                            result[:, :, c] = np.where(
                                contour_mask > 0,
                                (1 - blend_strength) * model_img[:, :, c] + blend_strength * cloth_img[:, :, c],
                                result[:, :, c]
                            )
            
            # Final refinement
            # Apply bilateral filter to preserve edges while smoothing transitions
            result = cv2.bilateralFilter(result, 9, 75, 75)
        
        elif blend_mode == "seamless":
            # Enhanced seamless blending with multi-scale processing
            blend_mask = (cloth_mask > 127).astype(np.uint8) * 255
            
            # Convert to float32 for processing
            model_float = model_img.astype(np.float32) / 255.0
            cloth_float = cloth_img.astype(np.float32) / 255.0
            
            # Create a refined mask with edge preservation
            refined_mask = cv2.GaussianBlur(cloth_mask, (7, 7), 0)
            refined_mask = cv2.bilateralFilter(refined_mask, 9, 75, 75)
            refined_mask = refined_mask.astype(np.float32) / 255.0
            
            # Create multiple scale masks for progressive blending
            masks = []
            kernel_sizes = [(31, 31), (21, 21), (11, 11)]
            weights = [0.4, 0.3, 0.3]
            
            for size in kernel_sizes:
                mask = cv2.GaussianBlur(cloth_mask, size, 0)
                mask = cv2.bilateralFilter(mask, 9, 75, 75)
                masks.append(mask.astype(np.float32) / 255.0)
            
            # Initialize result
            result_float = np.zeros_like(model_float)
            
            # Multi-scale blending
            for i, (mask, weight) in enumerate(zip(masks, weights)):
                smooth_mask = np.clip(mask * blend_strength, 0, 1)
                for c in range(3):
                    result_float[:, :, c] += weight * ((1 - smooth_mask) * model_float[:, :, c] + 
                                                      smooth_mask * cloth_float[:, :, c])
            
            # Edge refinement
            edge_kernel = np.ones((3, 3), np.uint8)
            edges = cv2.Canny(cloth_mask, 100, 200)
            edges = cv2.dilate(edges, edge_kernel, iterations=1)
            edges = cv2.GaussianBlur(edges.astype(np.float32) / 255.0, (5, 5), 0)
            
            # Apply edge-aware filtering
            for c in range(3):
                result_float[:, :, c] = cv2.bilateralFilter(result_float[:, :, c], 9, 0.1, 7)
            
            # Color correction
            for c in range(3):
                # Match color statistics in the blended region
                mask_region = refined_mask > 0.1
                if mask_region.any():
                    target_mean = np.mean(model_float[:, :, c][mask_region])
                    target_std = np.std(model_float[:, :, c][mask_region])
                    blend_mean = np.mean(result_float[:, :, c][mask_region])
                    blend_std = np.std(result_float[:, :, c][mask_region])
                    
                    if blend_std > 0:
                        result_float[:, :, c][mask_region] = (
                            (result_float[:, :, c][mask_region] - blend_mean) * 
                            (target_std / blend_std) + target_mean
                        )
            
            # Final refinement
            result_float = cv2.bilateralFilter(result_float, 9, 0.1, 7)
            
            # Convert back to uint8
            result = np.clip(result_float * 255.0, 0, 255).astype(np.uint8)
        
        elif blend_mode == "alpha":
            # Alpha blending with adjustable strength
            # Create a smooth transition mask
            smooth_mask = cv2.GaussianBlur(cloth_mask, (15, 15), 0).astype(np.float32) / 255.0
            smooth_mask = np.clip(smooth_mask * blend_strength, 0, 1)
            
            # Apply the blending
            for c in range(3):
                result[:, :, c] = (1 - smooth_mask) * model_img[:, :, c] + smooth_mask * cloth_img[:, :, c]
        
        # Convert back to ComfyUI format
        result_tensor = torch.from_numpy(result).float() / 255.0
        result_tensor = result_tensor.permute(2, 0, 1).unsqueeze(0)
        
        return (result_tensor,) 