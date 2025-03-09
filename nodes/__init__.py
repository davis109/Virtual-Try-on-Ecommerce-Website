"""
ComfyUI Virtual Try-On Nodes
"""

from .preprocessing import ModelPreprocessor, ClothPreprocessor
from .warping import ClothWarper
from .fusion import ImageFusionNode
from .postprocessing import PostProcessor

NODE_CLASS_MAPPINGS = {
    "ModelPreprocessor": ModelPreprocessor,
    "ClothPreprocessor": ClothPreprocessor,
    "ClothWarper": ClothWarper,
    "ImageFusionNode": ImageFusionNode,
    "PostProcessor": PostProcessor
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "ModelPreprocessor": "Model Preprocessor",
    "ClothPreprocessor": "Cloth Preprocessor",
    "ClothWarper": "Cloth Warper",
    "ImageFusionNode": "Image Fusion",
    "PostProcessor": "Post Processor"
}

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS'] 