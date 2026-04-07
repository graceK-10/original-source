// server/routes/auth.js
import express from "express";
import fs from "fs";
import path from "path";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
  refreshCookieOptions,
  hashToken,
} from "../utils/tokens.js";
import {
  saveRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  isValidRefreshRow,
} from "../models/RefreshToken.js";

const router = express.Router();

// ---------- Load & map pnumbers.json ----------
const PNUMBERS_PATH = path.join(process.cwd(), "data", "pnumbers.json");
let PNUMBERS = [];

try {
  if (fs.existsSync(PNUMBERS_PATH)) {
    const raw = JSON.parse(fs.readFileSync(PNUMBERS_PATH, "utf8"));
    // Map possible CSV headers to consistent keys
    PNUMBERS = raw.map((row) => {
      const name =
        row["Name and Surname"] ?? row.name ?? row.fullName ?? "";
      const pNumber =
        row["P Number"] ?? row.pNumber ?? row.p_number ?? row.pNum ?? "";
      const email = row["Email"] ?? row.email ?? "";
      const phone = row["Tel No"] ?? row.phone ?? row.tel ?? "";
      const expiryDate =
        row["Expiry Date"] ?? row.expiryDate ?? row.expiry ?? null;
      return { name, pNumber: String(pNumber), email, phone, expiryDate };
    });
  }
} catch (e) {
  console.error("Failed to load pnumbers.json:", e);
}

function computeId(rec) {
  return `p_${Buffer.from(`${rec.name}:${rec.pNumber}`).toString("hex")}`;
}
function findUserById(id) {
  return PNUMBERS.find(r => computeId(r) === id);
}


// ---------- Normalizers ----------
const norm = (s) =>
  String(s ?? "")
    .trim()
    .replace(/\s+/g, " "); // collapse spaces

const normLower = (s) => norm(s).toLowerCase();

// strip all non-alphanum so "P-123 456" === "p123456"
const normP = (p) => String(p ?? "").replace(/[^a-z0-9]/gi, "").toLowerCase();

function parseExpiry(expiry) {
  if (!expiry) return null;
  const d = new Date(expiry);
  return Number.isNaN(+d) ? null : d;
}
function isExpired(expiry) {
  const d = parseExpiry(expiry);
  if (!d) return false;
  const today = new Date();
  return d < today;
}

// ---------- Lookup ----------
function findUserByNameAndP(nameInput, pInput) {
  const nIn = normLower(nameInput);
  const pIn = normP(pInput);

  // Find by normalised p-number; allow flexible name match
  for (const r of PNUMBERS) {
    const rName = normLower(r.name);
    const rP = normP(r.pNumber);

    if (rP === pIn) {
      // Accept exact, startsWith, or includes to be forgiving with middle names
      if (
        rName === nIn ||
        rName.startsWith(nIn) ||
        nIn.startsWith(rName) ||
        rName.includes(nIn) ||
        nIn.includes(rName)
      ) {
        return {
          id: `p_${Buffer.from(`${r.name}:${r.pNumber}`).toString("hex")}`,
          name: r.name,
          pNumber: r.pNumber,
          email: r.email || "",
          phone: r.phone || "",
          expiryDate: r.expiryDate || null,
        };
      }
    }
  }
  return null;
}

// ---------- POST  ----------
/**
 * Body: { name, pNumber }
 * Returns: { accessToken, user }
 * Also sets httpOnly refresh cookie
 */
router.post("/login", async (req, res) => {
  const { name, pNumber } = req.body || {};
  if (!name || !pNumber) {
    return res.status(400).json({ error: "name and pNumber are required" });
  }

  const user = findUserByNameAndP(name, pNumber);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  if (isExpired(user.expiryDate)) {
    return res.status(401).json({ error: "P Number expired" });
  }

  const accessToken = signAccessToken({
    id: user.id,
    name: user.name,
    pNumber: user.pNumber,
    email: user.email,
    phone: user.phone,
  });
  const refreshToken = signRefreshToken({ id: user.id });

  // Persist refresh token (store hashed)
  const decoded = verifyRefresh(refreshToken);
  const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : null;
  await saveRefreshToken(user.id, hashToken(refreshToken), expiresAt);

  // httpOnly cookie
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  return res.json({
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      pNumber: user.pNumber,
      email: user.email,
      phone: user.phone,
      expiryDate: user.expiryDate,
      isValidated: true, // if your UI relies on this
    },
  });
});

// ---------- GET /api/auth/validate-pnumber ----------
/**
 * Query: ?pNumber=...
 * Returns: { valid: boolean, reason?: string, expiry?: string|null }
 */
router.get("/validate-pnumber", (req, res) => {
  const p = req.query?.pNumber;
  if (!p) return res.status(400).json({ error: "pNumber is required" });

  const pNorm = normP(p);
  const rec = PNUMBERS.find((r) => normP(r.pNumber) === pNorm);
  if (!rec) return res.json({ valid: false, reason: "not_found" });
  if (isExpired(rec.expiryDate)) {
    return res.json({ valid: false, reason: "expired", expiry: rec.expiryDate || null });
  }
  return res.json({ valid: true, expiry: rec.expiryDate || null });
});

// ---------- POST /api/auth/refresh ----------
router.post("/refresh", async (req, res) => {
  console.log("[Auth] Refresh token request received");
  
  // Debug cookie information
  const hasRefreshCookie = !!req.cookies?.refreshToken;
  console.log(`[Auth] Refresh cookie present: ${hasRefreshCookie}`);
  console.log(`[Auth] Available cookies: ${Object.keys(req.cookies || {}).join(', ')}`);
  
  const token = req.cookies?.refreshToken;
  if (!token) {
    console.log("[Auth] Refresh failed: Missing refresh token cookie");
    return res.status(401).json({ error: "Missing refresh token" });
  }

  try {
    console.log("[Auth] Verifying refresh token...");
    const payload = verifyRefresh(token); // { id: ... }
    console.log(`[Auth] Token verified for user ID: ${payload.id}`);

    // Validate stored hashed token
    const hashedToken = hashToken(token);
    console.log(`[Auth] Looking up token in database...`);
    const row = await findRefreshToken(payload.id, hashedToken);
    
    if (!isValidRefreshRow(row)) {
      console.log(`[Auth] Refresh token validation failed: Token not found in database or invalid`);
      return res.status(401).json({ error: "Refresh token invalid/expired/revoked" });
    }
    console.log(`[Auth] Refresh token validated successfully`);

    // Rotate: revoke old, issue new
    console.log(`[Auth] Revoking old token...`);
    await revokeRefreshToken(payload.id, hashToken(token));

    // Get user details for the new token
    const u = findUserById(payload.id);
    if (!u) {
      console.log(`[Auth] Warning: User ${payload.id} not found when refreshing token`);
    } else {
      console.log(`[Auth] Found user details for ${u.name} (${u.pNumber})`);
    }
    
    console.log(`[Auth] Generating new access token...`);
    const newAccess = signAccessToken({
      id: payload.id,
      name: u?.name,
      pNumber: u?.pNumber,
      email: u?.email || "",
      phone: u?.phone || "",
    });

    console.log(`[Auth] Generating new refresh token...`);
    const newRefresh = signRefreshToken({ id: payload.id });
    const decodedNew = verifyRefresh(newRefresh);
    const expiresAt = decodedNew?.exp ? new Date(decodedNew.exp * 1000) : null;
    
    console.log(`[Auth] Saving new refresh token to database...`);
    await saveRefreshToken(payload.id, hashToken(newRefresh), expiresAt);

    console.log(`[Auth] Setting refresh token cookie with options:`, JSON.stringify({
      ...refreshCookieOptions,
      // Don't log the actual token
      value: '(token value hidden)'
    }));
    
    res.cookie("refreshToken", newRefresh, refreshCookieOptions);
    
    console.log(`[Auth] Refresh completed successfully`);
    return res.json({ accessToken: newAccess });
  } catch (err) {
    console.error(`[Auth] Refresh token error:`, err.message || err);
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

// ---------- POST /api/auth/logout ----------
router.post("/logout", async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const payload = verifyRefresh(token);
      // IMPORTANT: revoke by hashed value (matches how we saved it)
      await revokeRefreshToken(payload.id, hashToken(token));
    } catch {
      // ignore errors on logout
    }
  }
  // Use same cookie options for consistency (just without the value)
  const cookieOptions = { ...refreshCookieOptions };
  delete cookieOptions.maxAge; // Not needed for clearing
  
  res.clearCookie("refreshToken", cookieOptions);
  return res.json({ success: true });
});

export default router;
