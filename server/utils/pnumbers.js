// server/utils/pnumbers.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSON_FILE_PATH = path.join(__dirname, "..", "data", "pnumbers.json");

// normalize helpers
const norm = (s) =>
  (s ?? "")
    .toString()
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const normP = (p) => norm(p).replace(/[^a-z0-9]/gi, ""); // strip spaces/dashes if any

let cacheByP = new Map();

export function reloadPnumbers() {
  cacheByP = new Map();
  if (!fs.existsSync(JSON_FILE_PATH)) return;

  const raw = JSON.parse(fs.readFileSync(JSON_FILE_PATH, "utf8"));

  // Map your CSV columns here. Common headers:
  // "Name and Surname", "P Number", "Email", "Tel No", "Expiry Date", etc.
  for (const row of raw) {
    const name = row["Name and Surname"] ?? row.name ?? "";
    const pNumber = row["P Number"] ?? row.pNumber ?? row.p_number ?? "";
    const email = row["Email"] ?? row.email ?? "";
    const phone = row["Tel No"] ?? row.phone ?? row.tel ?? "";
    const expiry = row["Expiry Date"] ?? row.expiry ?? row.expiryDate ?? "";

    if (!pNumber) continue;
    cacheByP.set(normP(pNumber), {
      name,
      pNumber,
      email,
      phone,
      expiry, // keep as string; we’ll parse later
    });
  }
}

export function findByNameAndP(name, pNumber) {
  if (!cacheByP.size) reloadPnumbers();

  const key = normP(pNumber);
  const rec = cacheByP.get(key);
  if (!rec) return null;

  // name match (case/whitespace-insensitive)
  const n1 = norm(name);
  const n2 = norm(rec.name);

  // allow exact or startsWith (to be forgiving with middle names)
  if (n2 === n1 || n2.startsWith(n1) || n1.startsWith(n2)) {
    return rec;
  }
  return null;
}

export function isExpired(expiry) {
  if (!expiry) return false;
  const d = new Date(expiry);
  if (Number.isNaN(+d)) return false; // ignore bad dates
  const today = new Date();
  // consider expired if expiry date is strictly before today:
  return d < new Date(today.toDateString());
}

// Initialize on first import
reloadPnumbers();
