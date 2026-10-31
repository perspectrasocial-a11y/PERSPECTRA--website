"""
Generate PERSPECTRA's spectral caustics texture.
Requirements: Python 3.10+, numpy, Pillow
Run from the project root:
    python tools/generate_caustics.py
Output:
    assets/spectral-caustics.png
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "spectral-caustics.png"
SIZE = 1024

def main():
    y, x = np.mgrid[0:SIZE, 0:SIZE].astype(np.float32)
    u, v = x / SIZE, y / SIZE
    field = np.zeros((SIZE, SIZE), dtype=np.float32)

    # Layered wave interference gives the caustic field a natural, irregular flow.
    for k in range(7):
        angle = k * 0.73
        frequency = 2.0 + k * 0.57
        phase = k * 1.91
        coord = (u * np.cos(angle) + v * np.sin(angle)) * frequency * 2 * np.pi + phase
        field += np.sin(coord + 0.8 * np.sin(
            (u * np.sin(angle) - v * np.cos(angle)) * 5 + phase
        ))
    field /= 7.0

    ribbons = np.exp(-((v - (0.47 + 0.11 * np.sin(u * 7.5 + 0.4))) / 0.018) ** 2)
    ribbons += 0.55 * np.exp(-((v - (0.58 + 0.07 * np.sin(u * 5.2 + 1.8))) / 0.028) ** 2)
    intensity = np.clip((field * 0.5 + 0.5) ** 2.7 * 0.46 + ribbons * 0.24, 0, 1)

    palette = np.array([
        [0.96, 0.43, 0.13], [1.00, 0.72, 0.36], [0.96, 0.91, 0.82],
        [0.35, 0.63, 0.98], [0.43, 0.30, 0.83]
    ], dtype=np.float32)
    position = u * (len(palette) - 1)
    index = np.minimum(position.astype(int), len(palette) - 2)
    blend = (position - index)[..., None]
    colour = palette[index] * (1 - blend) + palette[index + 1] * blend

    rgb = np.clip(colour * intensity[..., None] * 1.7, 0, 1)
    alpha = np.clip(intensity * 1.15, 0, 0.72)
    rgba = np.dstack((rgb, alpha))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray((rgba * 255).astype(np.uint8), "RGBA").filter(
        ImageFilter.GaussianBlur(1.1)
    ).save(OUT)
    print(f"Generated: {OUT}")

if __name__ == "__main__":
    main()
