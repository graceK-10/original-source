// src/lib/api.js

/**
 * Enhanced API module:
 * - Automatic token refresh (via httpOnly cookie)
 * - Silent auth for returning users
 * - Single-flight refresh to avoid races
 * - Resilient JSON handling
 */

// For API requests, we need to ensure the base URL is properly set
// Check for API base URL in this priority order:
// 1. VITE_API_BASE_URL environment variable
// 2. VITE_API_BASE environment variable (which seems to be used in your project)
// 3. Fallback to empty string which will use relative URLs
const API_BASE = (import.meta.env && (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE)) || "";

// For debugging - log the API base to console in development
if (import.meta.env.DEV) {
  console.log('[API] Using API base:', API_BASE || '(relative URLs)');
}

/* -------------------- JWT helpers -------------------- */

function decodeToken(token) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    // pad base64
    while (base64.length % 4) base64 += "=";
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isTokenExpiringSoon(token, bufferSeconds = 300) {
  if (!token) return true;
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  const now = Date.now();
  const expMs = payload.exp * 1000;
  return now + bufferSeconds * 1000 >= expMs;
}

/* -------------------- URL helper -------------------- */

function fullUrl(path) {
  // For absolute URLs, return as-is
  if (/^https?:\/\//i.test(path)) return path;
  
  const base = API_BASE || "";
  if (!path) return base || "";
  
  // For API endpoints, we don't need to adjust the path based on test/non-test
  // since the server is configured to handle both /api and /test/api endpoints
  return `${base}${path}`;
}

/* -------------------- Token refresh -------------------- */

let refreshingPromise = null; // single-flight guard

function clearStoredAuth() {
  try {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  } catch {
    // no-op
  }
}

async function refreshAccessToken() {
  const url = fullUrl("/api/auth/refresh");

  const res = await fetch(url, {
    method: "POST",
    credentials: "include", // send/receive cookies
    // no headers needed since there's no body
  });

  // Read as text first to avoid JSON parse explosions on unexpected HTML
  const raw = await res.text();

  if (!res.ok) {
    throw new Error(raw || `Refresh failed (${res.status})`);
  }

  let data = {};
  try {
    data = JSON.parse(raw);
  } catch (_err) {
    throw new Error(`Non-JSON refresh response: ${raw.slice(0, 120)}...`);
  }

  const accessToken = data && data.accessToken;
  if (!accessToken) throw new Error("Refresh succeeded but no accessToken");

  localStorage.setItem("authToken", accessToken);
  return accessToken;
}



/**
 * Ensure we have a fresh access token.
 * - If missing/expiring, refresh it (single-flight).
 * - Otherwise return the current token.
 */
export async function ensureFreshToken() {
  const current = localStorage.getItem("authToken");

  if (!current || isTokenExpiringSoon(current)) {
    if (!refreshingPromise) {
      refreshingPromise = (async () => {
        try {
          return await refreshAccessToken();
        } finally {
          refreshingPromise = null;
        }
      })();
    }
    try {
      return await refreshingPromise;
    } catch (e) {
      // Return existing (possibly stale) token; callers handle 401s.
      console.warn("[Auth] Proactive refresh failed:", e?.message || e);
      return current || "";
    }
  }

  return current;
}

/* -------------------- Silent auth -------------------- */

export async function attemptSilentAuth() {
  try {
    await refreshAccessToken(); // uses cookie
    return true;
  } catch (e) {
    console.log("[Auth] Silent authentication failed:", e?.message || e);
    return false;
  }
}

/* -------------------- Fetch helpers -------------------- */

function buildHeaders(initHeaders, token, body) {
  const headers = new Headers(initHeaders || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const hasBody = body !== undefined && body !== null;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const isBlob = typeof Blob !== "undefined" && body instanceof Blob;

  if (hasBody && !isFormData && !isBlob && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

/**
 * apiFetch(path, options, retry=true)
 * - Ensures token freshness
 * - Sends Authorization header
 * - Keeps cookies flowing (credentials: "include") so refresh cookie stays valid
 * - On 401, refreshes once then retries
 */
export async function apiFetch(path, options = {}, retry = true) {
  const url = fullUrl(path);

  let token;
  try {
    token = await ensureFreshToken();
  } catch (e) {
    console.warn("[apiFetch] Proactive refresh failed:", e?.message || e);
    token = localStorage.getItem("authToken") || "";
  }

  const headers = buildHeaders(options.headers, token, options.body);

  try {
    let res = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // keeps cookie path in sync; harmless for normal calls
    });

    if (res.status !== 401 || !retry) {
      return res;
    }

    // Try a one-time refresh & retry
    try {
      const newToken = await refreshAccessToken();
      const headers2 = buildHeaders(options.headers, newToken, options.body);
      res = await fetch(url, {
        ...options,
        headers: headers2,
        credentials: "include",
      });
      return res;
    } catch (refreshErr) {
      // Refresh failed; clear stale local auth so UI can redirect to login cleanly
      clearStoredAuth();

      // Return the original 401 if refresh also failed
      console.error("[apiFetch] Refresh failed:", refreshErr?.message || refreshErr);
      return res;
    }
  } catch (err) {
    throw new Error(`Network error calling ${url}: ${err.message}`);
  }
}

/* -------------------- Convenience JSON helpers -------------------- */

export async function apiGetJson(path) {
  const res = await apiFetch(path);
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}): ${text || res.statusText}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text; // allow non-JSON bodies
  }
}

export async function apiPostJson(path, payload) {
  const res = await apiFetch(path, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    let msg = text || res.statusText;
try {
  const data = JSON.parse(text);
  msg = data?.error || msg;
} catch {
  // ignore JSON parse errors
}

    throw new Error(`Request failed (${res.status}): ${msg}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
