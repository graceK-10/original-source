# Deployment Guide: Test Site Configuration

This guide explains how to deploy the changes needed to support the test site at `https://originalsource.co.za/test` with proper authentication.

## Overview of the Issue

The original error `Missing refresh token` occurred because:
- The auth cookies were being set with path="/api/auth"
- When accessing from `/test` path, these cookies weren't accessible
- CORS settings were not configured to handle the test subdirectory properly

## Changes Made

We've made several changes to fix these issues:

1. **Updated Cookie Path Configuration**:
   - Changed refresh cookie path from "/api/auth" to "/" in `server/utils/tokens.js`
   - This makes cookies accessible from all paths including the /test subdirectory
   - Added proper handling of SameSite and Secure attributes for production

2. **Updated Cookie Clearing on Logout**:
   - Modified logout endpoint to use consistent cookie options
   - Ensures cookies are properly removed from all paths

3. **Enhanced CORS Configuration**:
   - Added explicit support for test paths in CORS configuration
   - Improved origin checking to handle subdirectories 

4. **Created Production Environment File**:
   - Added `.env.production` with settings optimized for production use
   - Includes proper domain, cookie, and CORS configurations

## Deployment Steps

### 1. Update Server Files

Transfer these files to your production server:

- `server/utils/tokens.js` (Updated cookie configuration)
- `server/routes/auth.js` (Updated logout handling)
- `server/index.js` (Updated CORS handling)
- `server/.env.production` (Production environment settings)

### 2. Configure Production Environment

1. SSH into your production server
2. Back up your existing `.env` file:
   ```bash
   cp /path/to/your/app/.env /path/to/your/app/.env.backup
   ```

3. Copy the new production environment file:
   ```bash
   cp server/.env.production /path/to/your/app/.env
   ```

4. Review and edit if needed:
   ```bash
   nano /path/to/your/app/.env
   ```
   
   Ensure these settings are correct:
   - `COOKIE_DOMAIN=.originalsource.co.za`
   - `COOKIE_SAMESITE=lax` (or "none" if your API is on a different subdomain)
   - `HTTPS=true`
   - `NODE_ENV=production`
   - `CLIENT_ORIGINS` includes both your main domains and /test paths

### 3. Restart Your Server

Depending on your hosting setup:

```bash
# If using PM2
pm2 restart your-app-name

# If using systemd
sudo systemctl restart your-service-name

# If using supervisor
supervisorctl restart your-app-name

# If using a direct Node process
cd /path/to/your/app
npm run start
```

### 4. Verify Deployment

1. Check server logs for cookie configuration:
   ```
   Auth cookie config: sameSite=lax, secure=true, domain=.originalsource.co.za, path=/
   ```

2. Verify CORS configuration:
   ```
   CORS origins configured: [list should include your domains]
   ```

3. Test authentication flow:
   - Visit the main site and log in 
   - Without logging out, navigate to the test site
   - You should remain authenticated
   - Check browser developer tools under Application > Cookies to verify cookie settings

### 5. Test Both Sites

1. Main site (`https://originalsource.co.za/`)
   - Log in
   - Access protected areas
   - Log out

2. Test site (`https://originalsource.co.za/test/`)
   - Verify you can access it without authentication errors
   - Test login functionality
   - Access protected areas
   - Verify logout works properly

## Troubleshooting

### Issue: Still Getting "Missing Refresh Token" Errors

1. **Check Cookie Settings**:
   - Open browser DevTools > Application > Cookies
   - Verify that refreshToken cookie:
     - Has domain `.originalsource.co.za` (with the leading dot)
     - Has path set to "/"
     - Shows "Secure" flag for HTTPS sites

2. **Verify Server Configuration**:
   - Check server logs for the cookie configuration message
   - Ensure NODE_ENV is set to "production"
   - Confirm HTTPS=true is set for production

3. **Test with Browser Network Tab**:
   - Open DevTools > Network
   - Find failed refresh token request
   - Check "Request Headers" for the Cookie header
   - Verify it contains the refreshToken cookie

### Issue: CORS Errors

1. **Check Origin Headers**:
   - Look for CORS errors in browser console
   - Note the exact origin that's being blocked
   - Add that origin to CLIENT_ORIGINS in .env file

2. **Verify CORS Configuration**:
   - Check server logs for "CORS allowed/blocked" messages
   - Review the exact origins being used in requests

3. **Clear Browser Cache**:
   - Try hard refreshing (Ctrl+F5)
   - Clear browser cookies and local storage

## Contact Support

If you continue to experience issues, please collect:
1. Server logs showing startup configuration
2. Browser console errors
3. Network request details for failing authentication
4. Cookie information from browser DevTools

Send these details to your development team for further assistance.
