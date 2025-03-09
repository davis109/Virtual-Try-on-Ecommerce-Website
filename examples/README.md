# Example Images for ComfyUI Virtual Try-On

This directory contains example images for testing the virtual try-on workflow.

## Directory Structure

- `models/`: Place model images (front-facing photos of people) in this directory.
- `clothes/`: Place clothing images (frontal views of clothing items) in this directory.

## Usage

1. Add your own model and clothing images to the respective directories.
2. Use the provided workflows to process these images.
3. For batch processing, load the `batch_processing_workflow.json` workflow and point the image loaders to these directories.

## Example Command

```bash
python example.py --model examples/models/model1.jpg --cloth examples/clothes/tshirt1.jpg --output result.png
```

## Tips for Good Results

- Model images should be front-facing with good lighting and a neutral pose.
- Clothing images should have a clean background and show a frontal view of the item.
- For best results, use high-resolution images (at least 512x512 pixels). 