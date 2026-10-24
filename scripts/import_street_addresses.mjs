// Imports the street address matched to each shelter into data/shelter_streets.json.
//
// The matching itself runs outside this repo, on the applicant's own computer,
// because Lantmäteriet's decision LM2026/147116 only allows the raw address
// files there (see ~/shelter-addresses/scripts/match_shelter_addresses.py).
// Its output, one address per shelter, may be published with attribution.
//
// Usage: node scripts/import_street_addresses.mjs [path/to/shelter_addresses.csv]
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const input = process.argv[2] ?? path.join(os.homedir(), "shelter-addresses", "data", "shelter_addresses.csv");
const output = path.join(root, "data", "shelter_streets.json");

// Minimal CSV parsing for Python's csv.writer output: fields may be quoted,
// with "" for a literal quote.
function parseLine(line) {
  const fields = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      fields.push(field);
      field = "";
    } else {
      field += c;
    }
  }
  fields.push(field);
  return fields;
}

const lines = fs.readFileSync(input, "utf-8").split(/\r?\n/).filter(Boolean);
const attribution = lines.find((l) => l.startsWith("#"))?.replace(/^#\s*/, "");
if (!attribution) throw new Error("The attribution comment line is missing from the CSV.");
const rows = lines.filter((l) => !l.startsWith("#")).map(parseLine);
const header = rows.shift();
const col = Object.fromEntries(header.map((name, i) => [name, i]));
for (const name of ["id", "street", "postort"]) {
  if (!(name in col)) throw new Error(`Column "${name}" is missing from the CSV.`);
}

// "Maltesholmsvägen 80, Hässelby": what people say and type into a map.
const streets = {};
for (const r of rows) {
  const street = r[col.street].trim();
  if (!street) continue;
  const postort = r[col.postort].trim();
  streets[r[col.id]] = postort ? `${street}, ${postort}` : street;
}

fs.writeFileSync(output, JSON.stringify({ attribution, streets }));
const total = JSON.parse(fs.readFileSync(path.join(root, "data", "stats.json"), "utf-8")).shelterCount;
const count = Object.keys(streets).length;
console.log(`data/shelter_streets.json: ${count} of ${total} shelters (${((count / total) * 100).toFixed(1)}%) have a street address.`);
