# roadmap.py
from PIL import Image, ImageDraw, ImageFont
import io
import os

def generate_roadmap_image(roadmap_steps, user_id):
    """
    Generate roadmap image and save to local folder.
    roadmap_steps: List of steps with description
    """
    width, height = 800, 100 + 50 * len(roadmap_steps)
    image = Image.new("RGB", (width, height), color="white")
    draw = ImageDraw.Draw(image)
    font_path = os.environ.get("FONT_PATH", None)
    font = ImageFont.load_default()
    if font_path and os.path.exists(font_path):
        font = ImageFont.truetype(font_path, 16)

    y = 50
    for idx, step in enumerate(roadmap_steps, start=1):
        draw.text((50, y), f"Step {idx}: {step}", fill="black", font=font)
        y += 50

    folder = "roadmap_images"
    os.makedirs(folder, exist_ok=True)
    file_path = os.path.join(folder, f"roadmap_{user_id}.png")
    image.save(file_path)
    return file_path
