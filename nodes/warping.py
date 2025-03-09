import numpy as np
import torch
import cv2
import scipy.interpolate as interpolate
from scipy.spatial import Delaunay

class ClothWarper:
    """
    Node for warping the clothing image to fit the model's body shape
    using Thin Plate Spline (TPS) warping.
    """
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "cloth_image": ("IMAGE",),
                "cloth_mask": ("MASK",),
                "pose_data": ("POSE_DATA",),
                "warp_strength": ("FLOAT", {"default": 1.0, "min": 0.1, "max": 2.0, "step": 0.1}),
                "preserve_details": ("BOOLEAN", {"default": True}),
            },
        }
    
    RETURN_TYPES = ("IMAGE", "MASK")
    RETURN_NAMES = ("warped_cloth", "warped_mask")
    FUNCTION = "warp"
    CATEGORY = "ComfyVirtual/Warping"
    
    def warp(self, cloth_image, cloth_mask, pose_data, warp_strength=1.0, preserve_details=True):
        # Convert from ComfyUI image format (BCHW) to OpenCV format
        if isinstance(cloth_image, torch.Tensor):
            # Assuming image is in [0,1] range, BCHW format
            cloth_img = cloth_image[0].permute(1, 2, 0).cpu().numpy()
            cloth_img = (cloth_img * 255).astype(np.uint8)
        else:
            cloth_img = np.array(cloth_image)
            
        if isinstance(cloth_mask, torch.Tensor):
            # Assuming mask is in [0,1] range, B1HW format
            mask = cloth_mask[0][0].cpu().numpy()
            mask = (mask * 255).astype(np.uint8)
        else:
            mask = np.array(cloth_mask)
        
        # Get dimensions
        h, w, _ = cloth_img.shape
        
        # Check if pose data is valid
        if not pose_data or 'keypoints' not in pose_data:
            # If no valid pose data, return the original image
            warped_cloth = cloth_img.copy()
            warped_mask = mask.copy()
        else:
            # Extract keypoints from pose data
            keypoints = pose_data['keypoints']
            target_h = pose_data['image_dimensions']['height']
            target_w = pose_data['image_dimensions']['width']
            
            # Resize cloth image to match target dimensions if needed
            if h != target_h or w != target_w:
                cloth_img = cv2.resize(cloth_img, (target_w, target_h))
                mask = cv2.resize(mask, (target_w, target_h))
                h, w, _ = cloth_img.shape
            
            # Define source control points (on cloth image)
            src_points = np.array([
                [w * 0.3, h * 0.15],  # Left shoulder
                [w * 0.7, h * 0.15],  # Right shoulder
                [w * 0.2, h * 0.35],  # Left armpit
                [w * 0.8, h * 0.35],  # Right armpit
                [w * 0.3, h * 0.5],  # Left mid-torso
                [w * 0.7, h * 0.5],  # Right mid-torso
                [w * 0.25, h * 0.7],  # Left lower torso
                [w * 0.75, h * 0.7],  # Right lower torso
                [w * 0.3, h * 0.85],  # Left hip
                [w * 0.7, h * 0.85],  # Right hip
                [w * 0.5, h * 0.1],   # Neck
                [w * 0.5, h * 0.3],   # Upper chest
                [w * 0.5, h * 0.5],   # Mid chest
                [w * 0.5, h * 0.7],   # Lower chest
                [w * 0.5, h * 0.9],   # Bottom center
            ])
            
            # Define target control points (on model image)
            # Extract from pose keypoints with more precise positioning
            neck_y = min(keypoints['left_shoulder']['y'], keypoints['right_shoulder']['y']) - 20
            shoulder_y = (keypoints['left_shoulder']['y'] + keypoints['right_shoulder']['y']) / 2
            hip_y = (keypoints['left_hip']['y'] + keypoints['right_hip']['y']) / 2
            torso_height = hip_y - shoulder_y
            
            target_points = np.array([
                [keypoints['left_shoulder']['x'], keypoints['left_shoulder']['y']],  # Left shoulder
                [keypoints['right_shoulder']['x'], keypoints['right_shoulder']['y']],  # Right shoulder
                [keypoints['left_shoulder']['x'] - 30, keypoints['left_shoulder']['y'] + torso_height * 0.2],  # Left armpit
                [keypoints['right_shoulder']['x'] + 30, keypoints['right_shoulder']['y'] + torso_height * 0.2],  # Right armpit
                [(keypoints['left_shoulder']['x'] + keypoints['left_hip']['x']) / 2, (keypoints['left_shoulder']['y'] + keypoints['left_hip']['y']) / 2],  # Left mid-torso
                [(keypoints['right_shoulder']['x'] + keypoints['right_hip']['x']) / 2, (keypoints['right_shoulder']['y'] + keypoints['right_hip']['y']) / 2],  # Right mid-torso
                [keypoints['left_hip']['x'] + (keypoints['left_shoulder']['x'] - keypoints['left_hip']['x']) * 0.3, hip_y - torso_height * 0.2],  # Left lower torso
                [keypoints['right_hip']['x'] + (keypoints['right_shoulder']['x'] - keypoints['right_hip']['x']) * 0.3, hip_y - torso_height * 0.2],  # Right lower torso
                [keypoints['left_hip']['x'], keypoints['left_hip']['y']],  # Left hip
                [keypoints['right_hip']['x'], keypoints['right_hip']['y']],  # Right hip
                [(keypoints['left_shoulder']['x'] + keypoints['right_shoulder']['x']) / 2, neck_y],  # Neck
                [(keypoints['left_shoulder']['x'] + keypoints['right_shoulder']['x']) / 2, shoulder_y + torso_height * 0.2],  # Upper chest
                [(keypoints['left_shoulder']['x'] + keypoints['right_shoulder']['x']) / 2, shoulder_y + torso_height * 0.5],  # Mid chest
                [(keypoints['left_hip']['x'] + keypoints['right_hip']['x']) / 2, hip_y - torso_height * 0.3],  # Lower chest
                [(keypoints['left_hip']['x'] + keypoints['right_hip']['x']) / 2, hip_y + 40],  # Bottom center
            ])
            
            # Apply warp strength adjustment
            if warp_strength != 1.0:
                # Calculate the centroid of target points
                centroid = np.mean(target_points, axis=0)
                
                # Adjust target points based on warp strength
                for i in range(len(target_points)):
                    # Vector from centroid to point
                    vector = target_points[i] - centroid
                    
                    # Scale the vector by warp_strength
                    scaled_vector = vector * warp_strength
                    
                    # Update the target point
                    target_points[i] = centroid + scaled_vector
            
            # Perform Thin Plate Spline warping
            try:
                tps = cv2.createThinPlateSplineShapeTransformer()
                
                # Reshape points for OpenCV
                src_points = src_points.reshape(1, -1, 2)
                target_points = target_points.reshape(1, -1, 2)
                
                # Ensure points are valid
                if np.any(np.isnan(src_points)) or np.any(np.isnan(target_points)):
                    raise ValueError("Invalid points detected")
                
                # Set the matches
                matches = [cv2.DMatch(i, i, 0) for i in range(src_points.shape[1])]
                
                # Set the corresponding points
                if not tps.estimateTransformation(target_points, src_points, matches)[0]:
                    raise ValueError("Failed to estimate transformation")
                
                # Apply the transformation
                warped_cloth = np.zeros_like(cloth_img)
                if not tps.applyTransformation(cloth_img, warped_cloth)[0]:
                    raise ValueError("Failed to apply transformation")
                
                # Apply the same transformation to the mask
                warped_mask = np.zeros_like(mask)
                mask_3ch = cv2.merge([mask, mask, mask])
                warped_mask_3ch = np.zeros_like(mask_3ch)
                if not tps.applyTransformation(mask_3ch, warped_mask_3ch)[0]:
                    raise ValueError("Failed to apply transformation to mask")
                warped_mask = warped_mask_3ch[:, :, 0]
                
            except Exception as e:
                print(f"Warning: TPS warping failed ({str(e)}), falling back to affine transform")
                # Fallback to simpler affine transform
                src_center = np.mean(src_points.reshape(-1, 2), axis=0)
                target_center = np.mean(target_points.reshape(-1, 2), axis=0)
                
                # Calculate scale based on the bounding box of points
                src_bbox = np.ptp(src_points.reshape(-1, 2), axis=0)
                target_bbox = np.ptp(target_points.reshape(-1, 2), axis=0)
                scale = np.mean(target_bbox / (src_bbox + 1e-6))
                
                # Create affine transform matrix
                M = cv2.getAffineTransform(
                    src_points.reshape(-1, 2)[:3].astype(np.float32),
                    target_points.reshape(-1, 2)[:3].astype(np.float32)
                )
                
                # Apply affine transform
                warped_cloth = cv2.warpAffine(cloth_img, M, (w, h))
                warped_mask = cv2.warpAffine(mask, M, (w, h))
            
            # Preserve details if requested
            if preserve_details:
                # Apply bilateral filter for edge preservation
                warped_cloth = cv2.bilateralFilter(warped_cloth, 9, 75, 75)
                # Enhance details
                warped_cloth = cv2.detailEnhance(warped_cloth, sigma_s=15, sigma_r=0.2)
                # Adjust contrast and brightness
                warped_cloth = cv2.convertScaleAbs(warped_cloth, alpha=1.1, beta=5)
        
        # Convert back to ComfyUI format
        warped_tensor = torch.from_numpy(warped_cloth).float() / 255.0
        warped_tensor = warped_tensor.permute(2, 0, 1).unsqueeze(0)
        
        warped_mask_tensor = torch.from_numpy(warped_mask).float() / 255.0
        warped_mask_tensor = warped_mask_tensor.unsqueeze(0).unsqueeze(0)
        
        return (warped_tensor, warped_mask_tensor) 