// server/middleware/auth.js
import dotenv from "dotenv";
import { validatePNumber } from "../utils/jsonValidator.js";
import { verifyAccess } from "../utils/tokens.js";

dotenv.config();

/**
 * auth
 * - Verifies the Bearer access token
 * - Attaches decoded payload to req.user
 * - Computes req.user.isValidated (non-blocking)
 *
 * Use this on any route that requires authentication.
 * If you need to BLOCK when P Number is invalid/expired, chain requireValidated.
 */
export const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ error: "No authentication token, access denied" });
    }

    // Verify token with your helper (jwt.verify under the hood)
    const payload = verifyAccess(token);
    req.user = payload || {};

    // Best-effort validation flag (do not block here)
    if (req.user.pNumber) {
      try {
        const validation = await validatePNumber(req.user.pNumber);
        req.user.isValidated = Boolean(validation?.valid);
      } catch {
        req.user.isValidated = false;
      }
    } else {
      req.user.isValidated = false;
    }

    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token, authorization denied" });
  }
};

/**
 * requireValidated
 * - Enforces a valid (non-expired) P Number
 * - Use on routes that must be blocked if P Number is invalid
 *
 * Example:
 *   router.post("/orders", auth, requireValidated, createOrder)
 */
export const requireValidated = async (req, res, next) => {
  try {
    const pNumber = req.user?.pNumber;
    if (!pNumber) {
      return res.status(401).json({ error: "Missing user identity" });
    }

    const validation = await validatePNumber(pNumber);
    if (!validation?.valid) {
      return res.status(401).json({
        error: validation?.message || "Your P Number is no longer valid",
        expired: true,
      });
    }

    // Mark validated and continue
    req.user.isValidated = true;
    return next();
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};
