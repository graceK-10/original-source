// tokens.js
import crypto from "crypto";
import jwt from "jsonwebtoken";

/**
 * Sign an access token with the configured secret and expiration time
 * Default expiry: 30 minutes (can be overridden in .env)
 */
export function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30m",
  });
}

/**
 * Sign a refresh token with the configured secret and expiration time
 * Default expiry: 7 days (can be overridden in .env)
 */
export function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.REFRESH_JWT_SECRET, {
    expiresIn: process.env.REFRESH_JWT_EXPIRES_IN || "7d",
  });
}

/**
 * Verify an access token
 */
export function verifyAccess(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

/**
 * Verify a refresh token
 */
export function verifyRefresh(token) {
  return jwt.verify(token, process.env.REFRESH_JWT_SECRET);
}

/**
 * Hash a token for secure storage in the database
 */
export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generate a cryptographically secure random token for one-time flows
 */
export function generateSecureToken(byteLength = 32) {
  return crypto.randomBytes(byteLength).toString("hex");
}

/**
 * Decode a JWT token without verifying it
 * Useful for extracting payload info without throwing on expired tokens
 */
export function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (err) {
    return null;
  }
}

/**
 * COOKIE CONFIGURATION
 * 
 * Cookie settings are critical for proper auth workflow across domains.
 * - sameSite: 
 *   - "lax" is best for same-domain setups (default)
 *   - "none" is required for cross-domain (different domain for API and frontend)
 *   - "strict" is most secure but can cause refresh issues with some navigation patterns
 * - secure: 
 *   - true for HTTPS (required for sameSite=none)
 *   - false only for local development without HTTPS
 */

// Environment detection
const isProd = process.env.NODE_ENV === "production";

// HTTPS detection - use explicit env var if available, otherwise infer from NODE_ENV
const isHTTPS = process.env.HTTPS === "true" || isProd;

// Cookie domain configuration
// - For production with subdomains, use .domain.com format
// - For local development, leave undefined to work with localhost
const domain = process.env.COOKIE_DOMAIN || (isProd ? ".originalsource.co.za" : undefined);

// SameSite cookie policy
// - From .env if specified
// - 'none' for cross-domain setups (required for production with different subdomains)
// - 'lax' for same-origin setups (good for local development)
const SAME_SITE_STRATEGY = process.env.COOKIE_SAMESITE || 
                           (isProd ? "none" : "lax");

export const refreshCookieOptions = {
  httpOnly: true,
  // secure: isHTTPS,                   // true on HTTPS (required for sameSite:'none')
  // sameSite: SAME_SITE_STRATEGY,      // 'none' for subdomains, 'lax' for same-origin
  sameSite: "none",
secure: true,
  path: "/",                         // root path to make cookie accessible from all paths including /test
  maxAge: 1000 * 60 * 60 * 24 * 7,   // 7 days
  // domain,                            // shared across subdomains in prod
  domain: undefined
};

// When sameSite is 'none', secure MUST be true, so enforce it
if (SAME_SITE_STRATEGY === "none" && !isHTTPS) {
  console.warn("WARNING: sameSite='none' requires secure=true. Forcing secure cookies.");
  refreshCookieOptions.secure = true;
}


// Log cookie config on startup (helpful for debugging)
console.log(`Auth cookie config: sameSite=${SAME_SITE_STRATEGY}, secure=${refreshCookieOptions.secure}, domain=${domain || 'not set'}, path=${refreshCookieOptions.path}`);
console.log(`Environment: NODE_ENV=${process.env.NODE_ENV}, isHTTPS=${isHTTPS}, isProd=${isProd}`);
