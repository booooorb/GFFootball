"""Normalize the approved matte soft-arch card family for the game runtime."""

from math import cos, pi, sin
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "concepts" / "player-cards" / "soft-arch-matte-v3" / "source"
OUTPUT_DIR = ROOT / "app" / "assets" / "player-cards" / "soft-arch-matte-v3"
PREVIEW_PATH = ROOT / "concepts" / "player-cards" / "soft-arch-matte-v3" / "preview-on-dark.png"
TARGET_SIZE = (900, 1200)
PORTRAIT_OPENING = (118, 269, 782, 933)
TIERS = ("silver", "gold", "shiny-gold", "prismatic")


def outer_shape(width, height, scale=4):
    points = []
    for step in range(65):
        theta = pi - (pi * step / 64)
        x = 0.5 + 0.5 * cos(theta)
        y = 0.15 - 0.15 * sin(theta)
        points.append((round(x * width * scale), round(y * height * scale)))

    points.append((width * scale, round(height * 0.82 * scale)))
    for step in range(1, 33):
        t = step / 32
        x = (1 - t) ** 2 + 2 * (1 - t) * t * 0.91 + t**2 * 0.5
        y = (1 - t) ** 2 * 0.82 + 2 * (1 - t) * t * 0.91 + t**2
        points.append((round(x * width * scale), round(y * height * scale)))
    for step in range(1, 33):
        t = step / 32
        x = (1 - t) ** 2 * 0.5 + 2 * (1 - t) * t * 0.09
        y = (1 - t) ** 2 + 2 * (1 - t) * t * 0.91 + t**2 * 0.82
        points.append((round(x * width * scale), round(y * height * scale)))
    return points


def build_asset(tier):
    frame = Image.open(SOURCE_DIR / f"{tier}.png").convert("RGBA")
    frame = frame.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
    width, height = frame.size
    scale = 4

    alpha = Image.new("L", (width * scale, height * scale), 0)
    mask = ImageDraw.Draw(alpha)
    mask.polygon(outer_shape(width, height, scale), fill=255)
    left, top, right, bottom = PORTRAIT_OPENING
    mask.rectangle((left * scale, top * scale, right * scale, bottom * scale), fill=0)
    alpha = alpha.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
    frame.putalpha(alpha)

    output = OUTPUT_DIR / f"soft-arch-matte-{tier}.png"
    frame.save(output, optimize=True)
    return output


def build_preview(outputs):
    canvas = Image.new("RGB", (1800, 850), "#080a0c")
    labels = ("SILVER", "GOLD", "SHINY GOLD", "PRISMATIC")
    x_positions = (90, 520, 950, 1380)
    font = ImageFont.load_default(size=24)
    draw = ImageDraw.Draw(canvas)

    for output, label, x in zip(outputs, labels, x_positions):
        card = Image.open(output).convert("RGBA")
        card.thumbnail((330, 690), Image.Resampling.LANCZOS)
        px = x + (330 - card.width) // 2
        canvas.paste(card, (px, 48), card)
        text_box = draw.textbbox((0, 0), label, font=font)
        text_width = text_box[2] - text_box[0]
        draw.text((x + (330 - text_width) // 2, 760), label, fill="#e9edf0", font=font)

    canvas.save(PREVIEW_PATH, optimize=True)


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    outputs = [build_asset(tier) for tier in TIERS]
    build_preview(outputs)
    for output in outputs:
        print(output.relative_to(ROOT))
    print(PREVIEW_PATH.relative_to(ROOT))


if __name__ == "__main__":
    main()
