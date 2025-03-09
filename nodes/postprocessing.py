import numpy as np
import torch
import cv2
from PIL import Image, ImageEnhance, ImageFilter

class PostProcessor:
    """
    Node for post-processing the fused image to enhance quality
    and realism of the virtual try-on result.
    """
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "image": ("IMAGE",),
                "enhance_resolution": ("BOOLEAN", {"default": True}),
                "enhance_details": ("BOOLEAN", {"default": True}),
                "color_correction": ("BOOLEAN", {"default": True}),
                "sharpness": ("FLOAT", {"default": 1.2, "min": 0.0, "max": 2.0, "step": 0.1}),
                "contrast": ("FLOAT", {"default": 1.1, "min": 0.5, "max": 1.5, "step": 0.1}),
                "saturation": ("FLOAT", {"default": 1.05, "min": 0.5, "max": 1.5, "step": 0.05}),
            },
        }
    
    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("enhanced_image",)
    FUNCTION = "enhance"
    CATEGORY = "ComfyVirtual/Postprocessing"
    
    def enhance(self, image, enhance_resolution=True, enhance_details=True, 
                color_correction=True, sharpness=1.2, contrast=1.1, saturation=1.05):
        # Convert from ComfyUI image format (BCHW) to OpenCV/PIL format
        if isinstance(image, torch.Tensor):
            # Assuming image is in [0,1] range, BCHW format
            img_np = image[0].permute(1, 2, 0).cpu().numpy()
            img_np = (img_np * 255).astype(np.uint8)
        else:
            img_np = np.array(image)

        # Save original for texture preservation
        original = img_np.copy()
        
        # Convert to LAB color space for better processing
        img_lab = cv2.cvtColor(img_np, cv2.COLOR_RGB2LAB)
        
        if enhance_details:
            # Enhanced detail preservation with texture awareness
            # Process L channel for detail enhancement
            l_channel = img_lab[:, :, 0]
            
            # Calculate texture features
            texture_kernel = np.array([[-1,-1,-1], [-1,8,-1], [-1,-1,-1]])
            texture_map = cv2.filter2D(l_channel, -1, texture_kernel)
            texture_mask = cv2.threshold(texture_map, 20, 1, cv2.THRESH_BINARY)[1]
            
            # Multi-scale detail enhancement with texture preservation
            detail_enhanced = np.float32(l_channel)
            for radius in [15, 7, 3]:
                # Apply bilateral filter at different scales
                filtered = cv2.bilateralFilter(detail_enhanced, radius, 20, 20)
                detail_layer = detail_enhanced - filtered
                
                # Apply detail enhancement with texture awareness
                detail_enhanced += detail_layer * 0.5 * (1 + texture_mask * 0.5)
            
            # Apply adaptive sharpening with reduced strength for natural look
            kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]]) / 9.5
            detail_enhanced = cv2.filter2D(detail_enhanced, -1, kernel)
            
            # Update L channel
            img_lab[:, :, 0] = np.clip(detail_enhanced, 0, 255).astype(np.uint8)
        
        if color_correction:
            # Natural color correction
            # Process a and b channels
            for i in range(1, 3):
                channel = img_lab[:, :, i]
                
                # Subtle contrast enhancement for natural look
                mean = np.mean(channel)
                channel = np.clip((channel - mean) * contrast + mean, 0, 255)
                
                # Subtle saturation adjustment
                channel = np.clip((channel - 128) * saturation + 128, 0, 255)
                
                img_lab[:, :, i] = channel

        # Convert back to RGB
        img_enhanced = cv2.cvtColor(img_lab, cv2.COLOR_LAB2RGB)
        
        if enhance_resolution:
            # Realistic detail enhancement
            # Use bilateral filter for edge-aware smoothing instead of guided filter
            img_enhanced = cv2.bilateralFilter(img_enhanced, 9, 75, 75)
            
            # Apply subtle detail enhancement
            detail_layer = cv2.detailEnhance(img_enhanced, sigma_s=10, sigma_r=0.1)
            img_enhanced = cv2.addWeighted(img_enhanced, 0.7, detail_layer, 0.3, 0)
            
            # Preserve original textures in detailed areas
            texture_kernel = np.array([[-1,-1,-1], [-1,8,-1], [-1,-1,-1]])
            texture_map = cv2.filter2D(cv2.cvtColor(original, cv2.COLOR_RGB2GRAY), -1, texture_kernel)
            texture_mask = cv2.threshold(texture_map, 30, 1, cv2.THRESH_BINARY)[1]
            texture_mask = cv2.dilate(texture_mask.astype(np.uint8), np.ones((3,3), np.uint8), iterations=1)
            texture_mask = cv2.GaussianBlur(texture_mask.astype(np.float32), (5, 5), 0)
            
            # Blend original textures back in
            for c in range(3):
                img_enhanced[:,:,c] = img_enhanced[:,:,c] * (1 - texture_mask * 0.3) + original[:,:,c] * (texture_mask * 0.3)
        
        # Natural-looking local contrast enhancement
        clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8,8))
        lab = cv2.cvtColor(img_enhanced, cv2.COLOR_RGB2LAB)
        lab[:,:,0] = clahe.apply(lab[:,:,0])
        img_enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
        
        # Final touches for realism
        # Subtle denoise while preserving edges
        img_enhanced = cv2.fastNlMeansDenoisingColored(img_enhanced, None, 3, 3, 5, 15)
        
        # Subtle vignette effect for natural look
        rows, cols = img_enhanced.shape[:2]
        kernel_x = cv2.getGaussianKernel(cols, cols/4)
        kernel_y = cv2.getGaussianKernel(rows, rows/4)
        kernel = kernel_y * kernel_x.T
        mask = kernel / np.max(kernel)
        mask = np.tile(mask[:, :, np.newaxis], [1, 1, 3])
        
        # Apply very subtle vignette
        img_enhanced = img_enhanced * (0.95 + 0.05 * mask)
        img_enhanced = np.clip(img_enhanced, 0, 255).astype(np.uint8)
        
        # Convert back to ComfyUI format
        result_tensor = torch.from_numpy(img_enhanced).float() / 255.0
        result_tensor = result_tensor.permute(2, 0, 1).unsqueeze(0)
        
        return (result_tensor,)


class BatchProcessor:
    """
    Node for batch processing multiple outfits on multiple models.
    """
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "model_images": ("IMAGE",),
                "cloth_images": ("IMAGE",),
                "process_count": ("INT", {"default": 1, "min": 1, "max": 10, "step": 1}),
            },
        }
    
    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("batch_results",)
    FUNCTION = "process_batch"
    CATEGORY = "ComfyVirtual/Postprocessing"
    
    def process_batch(self, model_images, cloth_images, process_count=1):
        # This is a placeholder for batch processing functionality
        # In a real implementation, this would iterate through combinations
        # of model and cloth images and process them using the virtual try-on pipeline
        
        # For now, we'll just return the first model image as a placeholder
        if isinstance(model_images, torch.Tensor) and model_images.shape[0] > 0:
            return (model_images[:process_count],)
        else:
            # Return empty tensor if no images
            return (torch.zeros((1, 3, 512, 512)),) 