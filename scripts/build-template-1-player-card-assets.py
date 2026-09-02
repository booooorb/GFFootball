"""Preserve the approved Template 1 art while extracting real transparency."""

from collections import deque
from pathlib import Path
from statistics import median

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "concepts" / "player-cards" / "template-1-blank" / "source"
OUTPUT_DIR = ROOT / "app" / "assets" / "player-cards" / "template-1-blank"
TARGET_SIZE = (900, 1200)
TIERS = ("silver", "gold", "shiny-gold", "prismatic")


def checkerboard_pixel(pixel):
    red, green, blue = pixel
    return min(pixel) >= 220 and max(pixel) - min(pixel) <= 12


def extract_connected_checkerboard(frame):
    """Trace the real rim, then clear only the enclosed checkerboard opening."""
    rgb = frame.convert("RGB")
    width, height = rgb.size
    alpha = Image.new("L", rgb.size, 0)
    pixels = rgb.load()
    alpha_pixels = alpha.load()

    # Every approved frame has a continuous dark or saturated rim. Filling
    # between its first and last strong pixels preserves the exact generated
    # silhouette, including bright silver highlights that resemble the matte.
    detected_bounds = []
    for y in range(height):
        edge_pixels = []
        for x in range(width):
            pixel = pixels[x, y]
            if min(pixel) < 220 or max(pixel) - min(pixel) > 18:
                edge_pixels.append(x)
        if not edge_pixels:
            detected_bounds.append(None)
        else:
            detected_bounds.append((edge_pixels[0], edge_pixels[-1]))

    center_samples = [
        (left + right) / 2
        for bounds in detected_bounds
        if bounds is not None
        for left, right in (bounds,)
        if right - left > width * .4
    ]
    center = median(center_samples)
    row_bounds = []
    for bounds in detected_bounds:
        if bounds is None:
            row_bounds.append(None)
            continue
        left, detected_right = bounds
        mirrored_right = round(2 * center - left)
        right = detected_right if abs(detected_right - mirrored_right) <= 20 else mirrored_right
        row_bounds.append((left, right))

    for y, bounds in enumerate(row_bounds):
        nearby = [
            candidate
            for candidate in row_bounds[max(0, y - 8):min(height, y + 9)]
            if candidate is not None
        ]
        if bounds is None and not nearby:
            continue
        left = max(0, min(candidate[0] for candidate in nearby) - 2)
        right = min(width - 1, max(candidate[1] for candidate in nearby) + 2)
        for x in range(left, right + 1):
            alpha_pixels[x, y] = 255

    queue = deque([(width // 2, height // 2)])
    visited = bytearray(width * height)
    visited[(height // 2) * width + width // 2] = 1

    while queue:
        x, y = queue.popleft()
        if checkerboard_pixel(pixels[x, y]):
            alpha_pixels[x, y] = 0
        else:
            continue
        for next_x, next_y in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if not (0 <= next_x < width and 0 <= next_y < height):
                continue
            index = next_y * width + next_x
            if visited[index]:
                continue
            visited[index] = 1
            queue.append((next_x, next_y))

    frame.putalpha(alpha)
    return frame


def build_asset(tier):
    frame = Image.open(SOURCE_DIR / f"{tier}.png").convert("RGBA")
    frame = extract_connected_checkerboard(frame)
    frame = frame.resize(TARGET_SIZE, Image.Resampling.LANCZOS)

    output = OUTPUT_DIR / f"template-1-{tier}.png"
    frame.save(output, optimize=True)
    return output


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for tier in TIERS:
        print(build_asset(tier).relative_to(ROOT))


if __name__ == "__main__":
    main()
