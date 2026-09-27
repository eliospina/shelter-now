#!/usr/bin/env python3
"""Chart shelter places per 100 residents for all 290 municipalities.

Reads data/shelters_by_municipality.csv (from shelters_by_municipality.py)
and writes docs/shelters-per-100-residents.png.

    pip install -r scripts/requirements.txt
    python3 scripts/plot_shelters_per_municipality.py
"""
import csv
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "shelters_by_municipality.csv"
OUT = ROOT / "docs" / "shelters-per-100-residents.png"

HIGHLIGHT = {"0180", "0181"}  # Stockholm, Södertälje

SURFACE = "#fcfcfb"
INK = "#0b0b0b"
INK_2 = "#52514e"
MUTED = "#7a7973"
GRID = "#e7e6e0"
AXIS = "#c3c2b7"
ACCENT = "#2a78d6"
CONTEXT = "#c9c8c0"


def main():
    rows = list(csv.DictReader(SRC.open(encoding="utf-8")))
    for r in rows:
        r["ratio"] = 100 * int(r["places"]) / int(r["population_2025"])
    rows.sort(key=lambda r: (-r["ratio"], r["kommun"]))
    sweden = 100 * sum(int(r["places"]) for r in rows) / sum(int(r["population_2025"]) for r in rows)
    zero_from = next(i for i, r in enumerate(rows) if r["shelters"] == "0")
    n = len(rows)

    plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 11})
    fig, ax = plt.subplots(figsize=(12, 6.2), dpi=150)
    fig.patch.set_facecolor(SURFACE)
    ax.set_facecolor(SURFACE)

    xs = range(n)
    ax.bar(xs, [r["ratio"] for r in rows], width=0.62, linewidth=0,
           color=[ACCENT if r["kommun_code"] in HIGHLIGHT else CONTEXT for r in rows], zorder=2)

    ax.axhline(sweden, color=INK, linewidth=1.1, zorder=3)
    ax.text(n - 1, sweden + 2.2, f"Sweden average {sweden:.1f}", ha="right", va="bottom",
            fontsize=10, color=INK, fontweight="bold", zorder=4)

    def label(i, text, dy, ha="left"):
        y = rows[i]["ratio"]
        ax.annotate(text, xy=(i, y + 1), xytext=(i + (4 if ha == "left" else -4), y + dy),
                    ha=ha, va="bottom", fontsize=10, color=INK,
                    arrowprops=dict(arrowstyle="-", color=INK_2, linewidth=0.8, shrinkA=0, shrinkB=0))

    for i, r in enumerate(rows):
        if r["kommun_code"] in HIGHLIGHT:
            label(i, f"{r['kommun']} {r['ratio']:.1f}", 22, "left")
    label(0, f"{rows[0]['kommun']} {rows[0]['ratio']:.1f}", 6, "left")

    ax.annotate("", xy=(zero_from - 0.5, -3.5), xytext=(n - 0.5, -3.5),
                arrowprops=dict(arrowstyle="-", color=INK_2, linewidth=0.8), annotation_clip=False)
    ax.text(n - 0.5, -6, f"{n - zero_from} with no shelters", ha="right", va="top",
            fontsize=9, color=INK_2)

    ax.set_xlim(-1, n)
    ax.set_ylim(0, 156)
    ax.set_yticks(range(0, 151, 25))
    ax.yaxis.grid(True, color=GRID, linewidth=0.8, zorder=0)
    ax.tick_params(axis="y", colors=MUTED, length=0, labelsize=10)
    ax.set_xticks([])
    for side in ("top", "right", "left"):
        ax.spines[side].set_visible(False)
    ax.spines["bottom"].set_color(AXIS)
    ax.set_ylabel("Places per 100 residents", color=INK_2, fontsize=10)
    ax.set_xlabel(f"All {n} municipalities, ranked from most to fewest places per resident",
                  color=INK_2, fontsize=10, labelpad=24)

    fig.text(0.055, 0.955, "Shelter places per 100 residents, by municipality", fontsize=16,
             fontweight="bold", color=INK, ha="left", va="top")
    fig.text(0.055, 0.905, "Public civil-defence shelters (skyddsrum) in Sweden. Stockholm and Södertälje highlighted.",
             fontsize=11, color=INK_2, ha="left", va="top")
    fig.text(0.055, 0.025, "Sources: MCF shelter register (September 2026, temporarily restricted shelters excluded), "
             "SCB population 31 Dec 2025, Lantmäteriet district boundaries.  github.com/eliospina/shelter-now",
             fontsize=8.5, color=MUTED, ha="left", va="bottom")

    fig.subplots_adjust(left=0.07, right=0.985, top=0.84, bottom=0.14)
    OUT.parent.mkdir(exist_ok=True)
    fig.savefig(OUT, facecolor=SURFACE)
    print(f"Wrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
