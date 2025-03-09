# ComfyUI Virtual Try-On Workflow

A comprehensive virtual try-on solution built with ComfyUI that allows users to visualize clothing items on model images with realistic results.

## Features

- **Model & Cloth Processing**: Extract pose, segmentation masks, and clothing regions
- **Intelligent Warping**: TPS (Thin Plate Spline) warping to fit clothing to model's body shape
- **Realistic Blending**: Seamless integration using diffusion models
- **High-Quality Output**: Super-resolution enhancement for photorealistic results
- **Batch Processing**: Try multiple outfits on multiple models in a single run

## Requirements

- Python 3.8+
- ComfyUI
- Required Python packages (see `requirements.txt`)

## Installation

1. Clone this repository into your ComfyUI custom_nodes directory:
   ```
   cd ComfyUI/custom_nodes
   git clone https://github.com/yourusername/comfyvirtual.git
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Start ComfyUI and load the workflow from the `workflows` directory.

## Usage

1. Load the workflow in ComfyUI
2. Connect your model image and clothing image to the appropriate inputs
3. Run the workflow to generate the virtual try-on result

## Directory Structure

- `nodes/`: Custom ComfyUI nodes for the virtual try-on pipeline
- `workflows/`: Example ComfyUI workflows
- `models/`: Pre-trained models for pose estimation, segmentation, etc.
- `examples/`: Example input and output images

## License

MIT 