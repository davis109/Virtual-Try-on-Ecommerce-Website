# ComfyUI Virtual Try-On Usage Guide

This guide explains how to use the ComfyUI Virtual Try-On workflow to create realistic virtual try-on images.

## Installation

1. Make sure you have ComfyUI installed. If not, follow the instructions at [ComfyUI GitHub repository](https://github.com/comfyanonymous/ComfyUI).

2. Clone this repository into your ComfyUI custom_nodes directory:
   ```
   cd ComfyUI/custom_nodes
   git clone https://github.com/yourusername/comfyvirtual.git
   ```

3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

## Using the Workflow in ComfyUI

### Basic Workflow

1. Start ComfyUI and load the workflow from `workflows/virtual_tryon_workflow.json`.

2. Connect your model image (a front-facing photo of a person) to the first `LoadImage` node.

3. Connect your cloth image (a frontal view of the clothing item) to the second `LoadImage` node.

4. Run the workflow by clicking the "Queue Prompt" button.

5. The result will be displayed in the `PreviewImage` node and saved to your ComfyUI output directory.

### Batch Processing

1. Load the workflow from `workflows/batch_processing_workflow.json`.

2. Create two directories: `models` and `clothes` in your ComfyUI working directory.

3. Place your model images in the `models` directory and your clothing images in the `clothes` directory.

4. Adjust the `process_count` parameter in the `BatchProcessor` node to control how many combinations to process.

5. Run the workflow to process multiple outfits on multiple models in a single run.

## Using the Python API

You can also use the virtual try-on functionality programmatically using the provided Python API:

```python
from nodes.preprocessing import ModelPreprocessor, ClothPreprocessor
from nodes.warping import ClothWarper
from nodes.fusion import ImageFusionNode
from nodes.postprocessing import PostProcessor

# Load images
model_img = load_image("path/to/model.jpg")
cloth_img = load_image("path/to/cloth.jpg")

# Process model image
model_processor = ModelPreprocessor()
processed_model, model_mask, pose_data = model_processor.process(model_img)

# Process cloth image
cloth_processor = ClothPreprocessor()
processed_cloth, cloth_mask = cloth_processor.process(cloth_img)

# Warp cloth to fit model
warper = ClothWarper()
warped_cloth, warped_mask = warper.warp(processed_cloth, cloth_mask, pose_data)

# Fuse images
fusion = ImageFusionNode()
fused_image = fusion.fuse(
    processed_model, warped_cloth, warped_mask, model_mask, 
    blend_mode="seamless", blend_strength=0.8
)[0]

# Post-process result
post_processor = PostProcessor()
final_image = post_processor.enhance(fused_image)[0]

# Save result
save_image(final_image, "result.png")
```

For a complete example, see `example.py`.

## Node Reference

### ModelPreprocessor

Processes the model image to extract pose keypoints and generate a segmentation mask.

**Inputs:**
- `image`: The model image
- `detect_pose`: Whether to detect pose keypoints
- `generate_mask`: Whether to generate a segmentation mask

**Outputs:**
- `processed_image`: The processed model image
- `segmentation_mask`: The segmentation mask
- `pose_keypoints`: The detected pose keypoints

### ClothPreprocessor

Processes the clothing image to extract the clothing region and remove the background.

**Inputs:**
- `image`: The clothing image
- `remove_background`: Whether to remove the background
- `threshold`: Threshold for background removal

**Outputs:**
- `processed_cloth`: The processed clothing image
- `cloth_mask`: The clothing mask

### ClothWarper

Warps the clothing image to fit the model's body shape using Thin Plate Spline (TPS) warping.

**Inputs:**
- `cloth_image`: The processed clothing image
- `cloth_mask`: The clothing mask
- `pose_data`: The pose keypoints from the model
- `warp_strength`: The strength of the warping effect
- `preserve_details`: Whether to preserve details in the warped image

**Outputs:**
- `warped_cloth`: The warped clothing image
- `warped_mask`: The warped clothing mask

### ImageFusionNode

Fuses the warped clothing onto the model image using advanced blending techniques.

**Inputs:**
- `model_image`: The processed model image
- `warped_cloth`: The warped clothing image
- `warped_mask`: The warped clothing mask
- `model_mask`: The model segmentation mask
- `blend_mode`: The blending mode to use (normal, poisson, seamless, alpha)
- `blend_strength`: The strength of the blending effect
- `refine_edges`: Whether to refine the edges of the blended region

**Outputs:**
- `fused_image`: The fused image

### PostProcessor

Enhances the fused image to improve quality and realism.

**Inputs:**
- `image`: The fused image
- `enhance_resolution`: Whether to enhance resolution
- `enhance_details`: Whether to enhance details
- `color_correction`: Whether to apply color correction
- `sharpness`: The sharpness enhancement factor
- `contrast`: The contrast enhancement factor
- `saturation`: The saturation enhancement factor

**Outputs:**
- `enhanced_image`: The enhanced image

## Tips for Best Results

1. **Model Images**: Use front-facing photos with good lighting and a neutral pose.

2. **Clothing Images**: Use images with a clean background and a frontal view of the clothing item.

3. **Warping Strength**: Adjust the `warp_strength` parameter to control how much the clothing is warped to fit the model.

4. **Blending Mode**: Try different blending modes to find the one that works best for your images:
   - `normal`: Simple alpha blending
   - `poisson`: Poisson blending for seamless integration
   - `seamless`: Gradient domain blending for smooth transitions
   - `alpha`: Alpha blending with adjustable strength

5. **Post-Processing**: Adjust the post-processing parameters to enhance the final result:
   - Increase `sharpness` to make details more visible
   - Adjust `contrast` and `saturation` to match the model image

## Troubleshooting

- **Poor Pose Detection**: If the pose detection is not accurate, try using a different model image with a clearer pose.

- **Warping Issues**: If the warping looks unnatural, try adjusting the `warp_strength` parameter or using a different clothing image.

- **Blending Artifacts**: If there are visible artifacts in the blended region, try a different blending mode or adjust the `blend_strength` parameter.

- **Out of Memory**: If you encounter memory issues, try reducing the image resolution or processing fewer images in batch mode. 