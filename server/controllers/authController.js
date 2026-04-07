// server/controllers/authController.js
import dotenv from "dotenv";
import {
  validatePNumber,
  getUserByNameAndPNumber,
  reloadData,
  getUserByPNumber,
} from "../utils/jsonValidator.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
  refreshCookieOptions,
} from "../utils/tokens.js";

dotenv.config();

const norm = (s) =>
  (s ?? "")
    .toString()
    .trim()
    .replace(/\s+/g, " ");

const normLower = (s) => norm(s).toLowerCase();
const normP = (p) => norm(p).replace(/[^a-z0-9]/gi, "");

function parseExpiry(expiryDate) {
  if (!expiryDate) return null;
  if (expiryDate instanceof Date) return expiryDate;
  const d = new Date(expiryDate);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isExpired(expiryDate) {
  const d = parseExpiry(expiryDate);
  if (!d) return false;
  return d < new Date();
}

export const login = async (req, res) => {
  try {
    let { name, pNumber } = req.body || {};
    if (!name || !pNumber) {
      return res.status(400).json({ error: "Name and SAHPRA Number are required" });
    }

    const nameIn = normLower(name);
    const pIn = normP(pNumber);

    const userValidation = await getUserByNameAndPNumber(nameIn, pIn);
    if (!userValidation) {
      return res.status(401).json({ error: "Invalid credentials. Name + SAHPRA Number not found." });
    }

    if (userValidation.valid === false) {
      const expiredUser = userValidation.user || {};
      return res.status(401).json({
        error: userValidation.message || "Your SAHPRA Number has expired",
        expired: true,
        expiryDate: expiredUser.expiryDate || null,
        name: expiredUser.name || name,
      });
    }

    const user = userValidation.user || {};
    if (isExpired(user.expiryDate)) {
      return res.status(401).json({
        error: "Your SAHPRA Number has expired",
        expired: true,
        expiryDate: user.expiryDate || null,
        name: user.name || name,
      });
    }

    const payload = {
      id: user._id || user.id || user.pNumber || user.email || undefined,
      name: user.name || name,
      pNumber: user.pNumber || pIn,
      email: user.email || "",
      phone: user.phone || "",
      expiryDate: user.expiryDate || null,
      isValidated: true,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.json({
      accessToken,
      user: {
        name: payload.name,
        pNumber: payload.pNumber,
        email: payload.email,
        phone: payload.phone,
        expiryDate: payload.expiryDate,
        isValidated: true,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error during login" });
  }
};

export const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: "No refresh token" });

    let payload;
    try {
      payload = verifyRefresh(token);
    } catch {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    if (isExpired(payload?.expiryDate)) {
      return res.status(401).json({ error: "Your SAHPRA Number has expired" });
    }

    const accessToken = signAccessToken({
      id: payload.id,
      name: payload.name,
      pNumber: payload.pNumber,
      email: payload.email,
      phone: payload.phone,
      expiryDate: payload.expiryDate || null,
      isValidated: true,
    });

    return res.json({ accessToken });
  } catch (e) {
    console.error("Refresh error:", e);
    return res.status(500).json({ error: "Server error during refresh" });
  }
};

export const logout = (_req, res) => {
  try {
    res.clearCookie("refreshToken", {
      ...refreshCookieOptions,
      maxAge: 0,
    });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: "Server error during logout" });
  }
};

export const validatePNumberEndpoint = async (req, res) => {
  try {
    const pNumberRaw = req.query?.pNumber ?? req.body?.pNumber;
    if (!pNumberRaw) {
      return res.status(400).json({ error: "SAHPRA Number is required" });
    }

    const pNumber = normP(pNumberRaw);
    const validation = await validatePNumber(pNumber);
    return res.json(validation);
  } catch (error) {
    console.error("SAHPRA Number validation error:", error);
    return res.status(500).json({ error: "Server error during validation" });
  }
};

export const reloadCSVData = (_req, res) => {
  try {
    reloadData();
    return res.json({ success: true, message: "CSV data reloaded successfully" });
  } catch (error) {
    console.error("CSV reload error:", error);
    return res.status(500).json({ error: "Server error during CSV reload" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const { pNumber } = req.user || {};
    if (!pNumber) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = await getUserByPNumber(normP(pNumber));
    if (!user) {
      return res.status(404).json({ error: "User not found in records" });
    }
    if (isExpired(user.expiryDate)) {
      return res.status(401).json({ error: "Your SAHPRA Number is no longer valid" });
    }

    return res.json({
      name: user.name,
      pNumber: user.pNumber,
      expiryDate: user.expiryDate || null,
      email: user.email || "",
      phone: user.phone || "",
      isValidated: true,
    });
  } catch (e) {
    console.error("getCurrentUser error:", e);
    return res.status(500).json({ error: "Server error" });
  }
};
