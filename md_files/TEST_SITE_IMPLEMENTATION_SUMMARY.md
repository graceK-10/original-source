# Test Site Implementation Summary

## Overview

This document summarizes the changes made to support a test website at `https://originalsource.co.za/test` with proper authentication.

## Problem Statement

The original site was experiencing authentication errors when accessed via the `/test` path:
```
[Auth] No stored credentials, attempting silent auth
[Auth] Attempting to refresh access token
[Auth] Refresh failed: (401) {"error":"Missing refresh token"}
[Auth] Token refresh error: Refresh failed (401) {"error":"Missing refresh token"}
[Auth] Silent authentication failed: Token refresh error: Refresh failed (401) {"error":"Missing refresh token"}
```

## Root Cause Analysis

The issue was caused by three primary factors:

1. **Cookie Path Restriction**: 
   - Cookies were set with path="/api/auth"
   - This made them inaccessible from the `/test` path

2. **CORS Configuration**: 
   - CORS settings weren't properly configured to handle requests from the test subdirectory

3. **Environment Configuration**: 
   - Production environment lacked proper cookie domain and security settings

## Solutions Implemented

1. **Cookie Path Update**:
   - Changed cookie path from "/api/auth" to "/" in `server/utils/tokens.js`
   - Made cookies available across all paths including `/test`

2. **Cookie Security Enhancement**:
   - Improved SameSite and Secure attribute handling
   - Added automatic enforcement of Secure=true when SameSite=none
   - Better production vs. development detection

3. **CORS Configuration Update**:
   - Added support for test paths in allowed origins
   - Enhanced origin checking to accept subdirectories of allowed origins

4. **Environment Optimization**:
   - Created production-specific environment configuration
   - Added better domain and cookie configuration

## Files Modified

1. **server/utils/tokens.js**
   - Changed cookie path from "/api/auth" to "/"
   - Added SameSite and Secure attribute logic
   - Improved logging for debugging

2. **server/routes/auth.js**
   - Updated logout route to use consistent cookie settings
   - Ensured cookies are properly cleared from all paths

3. **server/index.js**
   - Enhanced CORS configuration to support test paths
   - Added better origin checking for subdirectories
   - Improved logging for CORS decisions

4. **Added server/.env.production**
   - Created production-ready environment file
   - Includes proper domain, cookie, and CORS settings

## Testing & Verification

To verify the changes are working correctly:

1. **Authentication Flow**:
   - Log in at the main site (`https://originalsource.co.za`)
   - Navigate to the test site (`https://originalsource.co.za/test`)
   - Verify you remain logged in
   
2. **Cookie Inspection**:
   - Open browser DevTools > Application > Cookies
   - Verify refreshToken cookie has:
     - Domain: `.originalsource.co.za` (with leading dot)
     - Path: "/"
     - Secure flag: Enabled
     - HttpOnly flag: Enabled

3. **Server Logs**:
   - Check for proper cookie configuration message
   - Verify CORS origins are correctly configured

## Maintenance Notes

1. **Adding New Domains/Paths**:
   - Add new origins to the `CLIENT_ORIGINS` environment variable
   - Format: comma-separated list of full URLs

2. **Security Considerations**:
   - Cookie settings are critical for security
   - SameSite=none requires Secure=true
   - Leading dot in domain (.originalsource.co.za) allows cookies to be shared across subdomains

3. **Troubleshooting**:
   - Server logs contain detailed cookie configuration info
   - CORS decisions are logged for debugging purposes
   - Check browser DevTools for cookie and CORS issues

## References

- [MDN: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [MDN: SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [CORS Configuration](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
