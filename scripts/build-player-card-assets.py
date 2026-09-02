"""Build transparent runtime player-card frames from the approved generated art."""

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "concepts" / "player-cards" / "selected-frame-previews"
OUTPUT_DIR = ROOT / "app" / "assets" / "player-cards"


CARDS = {
    "silver": {
        "source": "silver-no-black-preview.png",
        "crop": (25, 37, 950, 1390),
    },
    "gold": {
        "source": "gold-no-black-preview.png",
        "crop": (130, 88, 966, 1336),
    },
    "shiny-gold": {
        "source": "shiny-gold-no-black-preview.png",
        "crop": (113, 90, 979, 1361),
    },
    "prismatic": {
        "source": "prismatic-no-black-preview.png",
        "crop": (109, 48, 1006, 1363),
    },
}


OUTER_SHAPE = (
    (0.13, 0.00),
    (0.87, 0.00),
    (1.00, 0.13),
    (1.00, 0.79),
    (0.94, 0.87),
    (0.78, 0.96),
    (0.50, 1.00),
    (0.22, 0.96),
    (0.06, 0.87),
    (0.00, 0.79),
    (0.00, 0.13),
)


def scaled_points(points, width, height):
    return [(round(x * (width - 1)), round(y * (height - 1))) for x, y in points]


def build_card(name, config):
    source = Image.open(SOURCE_DIR / config["source"]).convert("RGBA")
    frame = source.crop(config["crop"])
    width, height = frame.size

    alpha = Image.new("L", frame.size, 0)
    mask = ImageDraw.Draw(alpha)
    mask.polygon(scaled_points(OUTER_SHAPE, width, height), fill=255)

    # Remove the baked preview checkerboard from the square portrait opening.
    portrait_box = (
        round(width * 0.15),
        round(height * 0.22),
        round(width * 0.85),
        round(height * 0.72),
    )
    mask.rectangle(portrait_box, fill=0)

    frame.putalpha(alpha)
    output = OUTPUT_DIR / f"faceted-halo-{name}.png"
    frame.save(output, optimize=True)
    return output


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for name, config in CARDS.items():
        print(build_card(name, config).relative_to(ROOT))


if __name__ == "__main__":
    main()
