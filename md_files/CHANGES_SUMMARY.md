# Changes Summary for Test Site Fix

This document summarizes all the changes made to fix the issues with the test site at `https://originalsource.co.za/test`.

## Issues Fixed

1. **404 Error on /test path**
   - The test site was returning a 404 error because the server wasn't properly configured to serve the React app at the /test path.

2. **Authentication Errors**
   - "Missing refresh token" error occurred because:
     - Cookies were restricted to the "/api/auth" path and weren't accessible from /test
     - API requests were going to localhost instead of the production URL
     - CORS and proxy configurations weren't handling the test path properly

## Files Changed

### 1. `.htaccess` (Root)
```apache
RewriteEngine On
RewriteBase /

# Don't rewrite files or directories
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Explicitly handle the /test path
RewriteRule ^test/(.*)$ /index.html [L]

# Rewrite everything else to index.html to allow the SPA to route
RewriteRule ^index\.html$ - [L]
RewriteRule . /index.html [L]
```
- Added explicit handling for the /test path to ensure the React app is served

### 2. `public/.htaccess`
- Created a comprehensive .htaccess file for production deployment
- Added rules for handling /test paths and API requests
- Included proper caching and security headers

### 3. `src/lib/api.js`
```javascript
// Check for API base URL in this priority order:
// 1. VITE_API_BASE_URL environment variable
// 2. VITE_API_BASE environment variable (which seems to be used in your project)
// 3. Fallback to empty string which will use relative URLs
const API_BASE = (import.meta.env && (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE)) || "";

// For debugging - log the API base to console in development
if (import.meta.env.DEV) {
  console.log('[API] Using API base:', API_BASE || '(relative URLs)');
}
```
- Fixed API URL configuration to properly handle both environment variables
- Added debugging logs to help identify URL issues

### 4. `vite.config.js`
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:4040',
      changeOrigin: true,
      secure: false,
    },
    // Add proxy for /test/api routes as well
    '/test/api': {
      target: 'http://localhost:4040',
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/test\/api/, '/api')
    },
  },
},
```
- Enhanced proxy configuration to handle /test/api routes
- Added path rewriting to ensure proper API path handling

### 5. `src/App.jsx`
```javascript
// Detect if the app is running under /test
const isTestPath = window.location.pathname.startsWith("/test");
const basename = isTestPath ? "/test" : "/";

// For debugging - log the basename to console in development
if (import.meta.env.DEV) {
  console.log('[App] Running with basename:', basename);
}
```
- Enhanced the code to better handle /test path
- Added development-mode logging for debugging

### 6. `server/utils/tokens.js`
```javascript
// Changed from:
// path: "/api/auth"
// To:
path: "/",  // root path to make cookie accessible from all paths including /test
```
- Updated cookie path to make cookies accessible from all paths

### 7. `server/routes/auth.js`
```javascript
// Use same cookie options for consistency (just without the value)
const cookieOptions = { ...refreshCookieOptions };
delete cookieOptions.maxAge; // Not needed for clearing

res.clearCookie("refreshToken", cookieOptions);
```
- Updated cookie clearing to use consistent options
- Ensures cookies are properly removed from all paths

### 8. `.env.production`
```
COOKIE_SAMESITE=lax
COOKIE_DOMAIN=.originalsource.co.za
HTTPS=true
NODE_ENV=production
```
- Created production-specific environment settings
- Properly configured cookies for production environment

## Documentation Created

1. **TEST_SITE_DEPLOYMENT.md**
   - Comprehensive guide for deploying the test site
   - Step-by-step instructions for all deployment tasks
   - Troubleshooting and debugging tips

2. **TEST_CHECKLIST.md**
   - Verification checklist for testing the implementation
   - Covers both development and production environments
   - Includes cross-browser testing steps

3. **TEST_SITE_IMPLEMENTATION_SUMMARY.md**
   - Technical overview of all changes made
   - Explanation of the root causes and solutions
   - Maintenance notes for future reference

4. **DEPLOYMENT_GUIDE.md**
   - General deployment guide for all production changes
   - Server configuration instructions
   - Environment setup details

## Next Steps

1. Follow the deployment instructions in TEST_SITE_DEPLOYMENT.md
2. Verify the deployment using the TEST_CHECKLIST.md
3. If issues persist, refer to the troubleshooting section in TEST_SITE_DEPLOYMENT.md

These changes should resolve both the 404 errors and authentication issues with your test site. The key fixes were:
1. Properly configuring the web server to handle /test routes
2. Making cookies accessible from all paths
3. Ensuring API URLs are correct in all environments
