import os
import numpy as np
import torch
import cv2
from PIL import Image
import mediapipe as mp
from torchvision import transforms

class ModelPreprocessor:
    """
    Node for preprocessing the model image:
    - Extract pose keypoints
    - Generate segmentation mask
    - Identify body landmarks
    """
    
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.mp_selfie_segmentation = mp.solutions.selfie_segmentation
        
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "image": ("IMAGE",),
                "detect_pose": ("BOOLEAN", {"default": True}),
                "generate_mask": ("BOOLEAN", {"default": True}),
            },
        }
    
    RETURN_TYPES = ("IMAGE", "MASK", "POSE_DATA")
    RETURN_NAMES = ("processed_image", "segmentation_mask", "pose_keypoints")
    FUNCTION = "process"
    CATEGORY = "ComfyVirtual/Preprocessing"
    
    def process(self, image, detect_pose=True, generate_mask=True):
        # Convert from ComfyUI image format (BCHW) to OpenCV format
        if isinstance(image, torch.Tensor):
            # Assuming image is in [0,1] range, BCHW format
            img = image[0].permute(1, 2, 0).cpu().numpy()
            img = (img * 255).astype(np.uint8)
        else:
            img = np.array(image)
        
        # Make a copy for output
        processed_img = img.copy()
        
        # Initialize return values
        pose_data = {}
        segmentation_mask = np.zeros((img.shape[0], img.shape[1]), dtype=np.uint8)
        
        # Pose detection
        if detect_pose:
            with self.mp_pose.Pose(
                static_image_mode=True,
                model_complexity=2,
                enable_segmentation=True,
                min_detection_confidence=0.5
            ) as pose:
                results = pose.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
                
                if results.pose_landmarks:
                    landmarks = results.pose_landmarks.landmark
                    
                    # Extract key body landmarks
                    h, w, _ = img.shape
                    keypoints = {}
                    
                    # Map important keypoints
                    keypoint_mapping = {
                        'left_shoulder': self.mp_pose.PoseLandmark.LEFT_SHOULDER,
                        'right_shoulder': self.mp_pose.PoseLandmark.RIGHT_SHOULDER,
                        'left_hip': self.mp_pose.PoseLandmark.LEFT_HIP,
                        'right_hip': self.mp_pose.PoseLandmark.RIGHT_HIP,
                        'left_elbow': self.mp_pose.PoseLandmark.LEFT_ELBOW,
                        'right_elbow': self.mp_pose.PoseLandmark.RIGHT_ELBOW,
                        'left_wrist': self.mp_pose.PoseLandmark.LEFT_WRIST,
                        'right_wrist': self.mp_pose.PoseLandmark.RIGHT_WRIST,
                        'neck': self.mp_pose.PoseLandmark.NOSE,  # Approximation
                    }
                    
                    for name, landmark_id in keypoint_mapping.items():
                        landmark = landmarks[landmark_id.value]
                        keypoints[name] = {
                            'x': int(landmark.x * w),
                            'y': int(landmark.y * h),
                            'visibility': landmark.visibility
                        }
                    
                    pose_data = {
                        'keypoints': keypoints,
                        'image_dimensions': {'height': h, 'width': w}
                    }
        
        # Segmentation mask generation
        if generate_mask:
            with self.mp_selfie_segmentation.SelfieSegmentation(model_selection=1) as selfie_seg:
                results = selfie_seg.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
                
                if results.segmentation_mask is not None:
                    segmentation_mask = (results.segmentation_mask * 255).astype(np.uint8)
        
        # Convert back to ComfyUI format
        processed_tensor = torch.from_numpy(processed_img).float() / 255.0
        processed_tensor = processed_tensor.permute(2, 0, 1).unsqueeze(0)
        
        mask_tensor = torch.from_numpy(segmentation_mask).float() / 255.0
        mask_tensor = mask_tensor.unsqueeze(0).unsqueeze(0)
        
        return (processed_tensor, mask_tensor, pose_data)


class ClothPreprocessor:
    """
    Node for preprocessing the clothing image:
    - Extract clothing region
    - Remove background
    - Normalize for warping
    """
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "image": ("IMAGE",),
                "remove_background": ("BOOLEAN", {"default": True}),
                "threshold": ("FLOAT", {"default": 0.5, "min": 0.1, "max": 0.9, "step": 0.1}),
            },
        }
    
    RETURN_TYPES = ("IMAGE", "MASK")
    RETURN_NAMES = ("processed_cloth", "cloth_mask")
    FUNCTION = "process"
    CATEGORY = "ComfyVirtual/Preprocessing"
    
    def process(self, image, remove_background=True, threshold=0.5):
        # Convert from ComfyUI image format (BCHW) to OpenCV format
        if isinstance(image, torch.Tensor):
            # Assuming image is in [0,1] range, BCHW format
            img = image[0].permute(1, 2, 0).cpu().numpy()
            img = (img * 255).astype(np.uint8)
        else:
            img = np.array(image)
        
        # Make a copy for output
        processed_img = img.copy()
        
        # Initialize cloth mask
        cloth_mask = np.zeros((img.shape[0], img.shape[1]), dtype=np.uint8)
        
        if remove_background:
            # Convert to grayscale for processing
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Apply Otsu's thresholding
            _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Find contours
            contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Find the largest contour (assuming it's the clothing item)
            if contours:
                largest_contour = max(contours, key=cv2.contourArea)
                
                # Create mask from the largest contour
                cloth_mask = np.zeros_like(gray)
                cv2.drawContours(cloth_mask, [largest_contour], 0, 255, -1)
                
                # Apply mask to the image
                for c in range(3):
                    processed_img[:, :, c] = cv2.bitwise_and(processed_img[:, :, c], processed_img[:, :, c], mask=cloth_mask)
        
        # Convert back to ComfyUI format
        processed_tensor = torch.from_numpy(processed_img).float() / 255.0
        processed_tensor = processed_tensor.permute(2, 0, 1).unsqueeze(0)
        
        mask_tensor = torch.from_numpy(cloth_mask).float() / 255.0
        mask_tensor = mask_tensor.unsqueeze(0).unsqueeze(0)
        
        return (processed_tensor, mask_tensor) 