"""Extract true-alpha runtime frames from the approved compact card renders."""

from math import cos, pi, sin
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "concepts" / "player-cards" / "compact-soft-arch-v2" / "source"
OUTPUT_DIR = ROOT / "app" / "assets" / "player-cards" / "compact-soft-arch-v2"
PREVIEW_PATH = ROOT / "concepts" / "player-cards" / "compact-soft-arch-v2" / "preview-on-dark.png"
TARGET_SIZE = (900, 1200)
TARGET_PORTRAIT = (120, 270, 780, 930)


CARDS = {
    "silver": {
        "crop": (112, 39, 1010, 1363),
        "portrait": (118, 313, 776, 973),
    },
    "gold": {
        "crop": (112, 124, 974, 1378),
        "portrait": (114, 308, 744, 909),
    },
    "shiny-gold": {
        "crop": (107, 52, 981, 1410),
        "portrait": (113, 328, 762, 990),
    },
    "prismatic": {
        "crop": (143, 115, 946, 1339),
        "portrait": (106, 309, 693, 903),
    },
}


def outer_shape(width, height, scale=4):
    """Return a smooth, symmetric soft-arch/point path at supersampled scale."""
    points = []
    for step in range(49):
        theta = pi - (pi * step / 48)
        x = 0.5 + 0.5 * cos(theta)
        y = 0.16 - 0.16 * sin(theta)
        points.append((round(x * width * scale), round(y * height * scale)))

    points.append((width * scale, round(height * 0.82 * scale)))
    for step in range(1, 25):
        t = step / 24
        x = (1 - t) ** 2 + 2 * (1 - t) * t * 0.91 + t**2 * 0.5
        y = (1 - t) ** 2 * 0.82 + 2 * (1 - t) * t * 0.91 + t**2
        points.append((round(x * width * scale), round(y * height * scale)))
    for step in range(1, 25):
        t = step / 24
        x = (1 - t) ** 2 * 0.5 + 2 * (1 - t) * t * 0.09
        y = (1 - t) ** 2 + 2 * (1 - t) * t * 0.91 + t**2 * 0.82
        points.append((round(x * width * scale), round(y * height * scale)))
    return points


def build_asset(name, config):
    source = Image.open(SOURCE_DIR / f"{name}.png").convert("RGBA")
    cropped = source.crop(config["crop"])
    source_width, source_height = cropped.size
    portrait_left, portrait_top, portrait_right, portrait_bottom = config["portrait"]
    width, height = TARGET_SIZE

    # Normalize every tier to the same compact footprint. The top, square
    # portrait, and lower name zones are scaled independently so the opening
    # stays square instead of being stretched with the overall card.
    frame = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
    bands = (
        ((0, 0, source_width, portrait_top), (0, 0, width, TARGET_PORTRAIT[1])),
        (
            (0, portrait_top, source_width, portrait_bottom),
            (0, TARGET_PORTRAIT[1], width, TARGET_PORTRAIT[3]),
        ),
        (
            (0, portrait_bottom, source_width, source_height),
            (0, TARGET_PORTRAIT[3], width, height),
        ),
    )
    for source_box, target_box in bands:
        band = cropped.crop(source_box)
        target_width = target_box[2] - target_box[0]
        target_height = target_box[3] - target_box[1]
        band = band.resize((target_width, target_height), Image.Resampling.LANCZOS)
        frame.paste(band, (target_box[0], target_box[1]))

    scale = 4

    mask = Image.new("L", (width * scale, height * scale), 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon(outer_shape(width, height, scale), fill=255)

    left, top, right, bottom = TARGET_PORTRAIT
    draw.rectangle(
        (left * scale, top * scale, right * scale, bottom * scale),
        fill=0,
    )
    mask = mask.resize(frame.size, Image.Resampling.LANCZOS)
    frame.putalpha(mask)

    output = OUTPUT_DIR / f"soft-arch-{name}.png"
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
        box = draw.textbbox((0, 0), label, font=font)
        text_width = box[2] - box[0]
        draw.text((x + (330 - text_width) // 2, 760), label, fill="#e9edf0", font=font)

    canvas.save(PREVIEW_PATH, optimize=True)


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    outputs = [build_asset(name, config) for name, config in CARDS.items()]
    build_preview(outputs)
    for output in outputs:
        print(output.relative_to(ROOT))
    print(PREVIEW_PATH.relative_to(ROOT))


if __name__ == "__main__":
    main()
