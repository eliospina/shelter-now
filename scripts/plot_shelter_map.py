"""Draws Sweden using only its shelters: one dot per shelter, sized by its
number of places, with no map outline or roads. Writes docs/sweden-drawn-by-its-shelters.png.

    python3 scripts/plot_shelter_map.py   (needs rsvg-convert for the PNG)
"""

import json
import math
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHELTERS = ROOT / "data" / "shelters.geojson"
SVG = ROOT / "docs" / "sweden-drawn-by-its-shelters.svg"
PNG = SVG.with_suffix(".png")
WIDTH = 1200


def main():
    features = json.loads(SHELTERS.read_text(encoding="utf-8"))["features"]
    shelters = [(f["properties"]["lon"], f["properties"]["lat"], f["properties"]["places"]) for f in features]

    # Equirectangular projection, with longitude scaled for Sweden's latitude.
    k = math.cos(math.radians(62))
    xs = [lon * k for lon, _, _ in shelters]
    ys = [lat for _, lat, _ in shelters]
    min_x, max_x, min_y, max_y = min(xs), max(xs), min(ys), max(ys)
    scale = (WIDTH - 160) / (max_x - min_x)
    height = int((max_y - min_y) * scale + 220)

    total = sum(places for _, _, places in shelters)
    lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {height}" width="{WIDTH}" height="{height}">',
        f'<rect width="{WIDTH}" height="{height}" fill="#0f0e0c"/>',
    ]
    # Small shelters first, so the large ones are drawn on top.
    for (_, _, places), x, y in sorted(zip(shelters, xs, ys), key=lambda s: s[0][2]):
        px = 80 + (x - min_x) * scale
        py = 110 + (max_y - y) * scale
        r = 0.6 + math.sqrt(min(places, 1500)) * 0.05
        lines.append(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="{r:.2f}" fill="#f4c56a" fill-opacity="0.55"/>')
    font = 'font-family="Helvetica Neue, Helvetica, Arial, sans-serif"'
    lines += [
        f'<text x="80" y="70" {font} font-size="30" fill="#eeebe4">Sverige, ritat med sina skyddsrum</text>',
        f'<text x="80" y="{height - 60}" {font} font-size="17" fill="#9a958a">'
        f'{len(shelters):,} skyddsrum · {total:,} platser · en punkt per skyddsrum, storleken efter antal platser</text>'.replace(",", " "),
        f'<text x="80" y="{height - 34}" {font} font-size="14" fill="#6b675e">Data: Myndigheten för civilt försvar · Bunker Now</text>',
        "</svg>",
    ]
    SVG.write_text("\n".join(lines), encoding="utf-8")

    if not shutil.which("rsvg-convert"):
        raise SystemExit(f"Wrote {SVG}. Install rsvg-convert (brew install librsvg) to make the PNG.")
    subprocess.run(["rsvg-convert", "-w", str(WIDTH), str(SVG), "-o", str(PNG)], check=True)
    SVG.unlink()
    print(f"Wrote {PNG.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
