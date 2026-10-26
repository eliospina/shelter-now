#!/usr/bin/env python3
"""Import MCF's list of active shelters into data/mcf_register.json.

Source: "aktiva skyddsrum.xlsx", sent by Myndigheten för civilt försvar (MCF)
on request (2026-10-26). One row per active shelter: SkrNr, kommun, tätort,
places, Nybesiktningsdatum (first inspection, when the shelter was approved
as finished), latest approval and latest supervision.

The open shapefile lags behind the register, so convert_shelters.py uses this
list to decide which shelters are active. The first inspection year is kept
too: for older shelters the register often stores only the year (YYYY-01-01).

Usage: python3 scripts/import_mcf_register.py "path/to/aktiva skyddsrum.xlsx" 2026-10-26
"""
import html
import json
import re
import sys
import zipfile

OUT = "data/mcf_register.json"


def read_rows(path):
    """Read the first sheet of an .xlsx with the standard library only."""
    with zipfile.ZipFile(path) as z:
        strings = [
            html.unescape("".join(re.findall(r"<t[^>]*>(.*?)</t>", si, re.S)))
            for si in re.findall(r"<si>(.*?)</si>", z.read("xl/sharedStrings.xml").decode("utf-8"), re.S)
        ]
        sheet = z.read("xl/worksheets/sheet1.xml").decode("utf-8")
    for row in re.findall(r"<row[^>]*>(.*?)</row>", sheet, re.S):
        cells = {}
        for attrs, inner in re.findall(r"<c ([^>]*?)(?:/>|>(.*?)</c>)", row, re.S):
            col = re.search(r'r="([A-Z]+)', attrs).group(1)
            value = re.search(r"<v>(.*?)</v>", inner or "")
            value = value.group(1) if value else ""
            if 't="s"' in attrs and value:
                value = strings[int(value)]
            cells[col] = value
        yield cells


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    path, as_of = sys.argv[1], sys.argv[2]
    rows = read_rows(path)
    header = next(rows)
    col = {name: c for c, name in header.items()}
    id_col, first_col = col["SkrNr"], col["Nybesiktningsdatum"]

    first_year = {}
    for cells in rows:
        shelter_id = cells.get(id_col, "").strip()
        if not shelter_id:
            continue
        date = cells.get(first_col, "")
        year = int(date[:4]) if date[:4].isdigit() else None
        # Two shelters appear twice with different dates; keep the earliest.
        if shelter_id in first_year and first_year[shelter_id] is not None:
            year = min(y for y in (year, first_year[shelter_id]) if y is not None)
        first_year[shelter_id] = year

    out = {
        "source": "Myndigheten för civilt försvar (MCF), aktiva skyddsrum",
        "asOf": as_of,
        "firstInspectionYear": dict(sorted(first_year.items())),
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))

    known = sum(y is not None for y in first_year.values())
    print(f"{OUT}: {len(first_year)} active shelters, {known} with a first inspection year.")


if __name__ == "__main__":
    main()
