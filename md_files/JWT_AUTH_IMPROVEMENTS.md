# JWT Authentication Improvements

This document summarizes the improvements made to the authentication system and provides testing instructions.

## Changes Made

1. **Enhanced Token Management**
   - Increased access token lifetime to 30 minutes (from 15 minutes)
   - Set refresh token lifetime to 7 days (more secure than 30 days)
   - Added improved cookie configuration options for cross-domain support

2. **Proactive Token Refresh**
   - Added token expiration detection on the client side
   - Implemented proactive token refresh before expiration
   - Added silent authentication for returning users

3. **Improved Debugging**
   - Added detailed server-side logging for authentication processes
   - Enhanced client-side logging for token management
   - Better error handling and reporting

4. **Cross-Domain Support**
   - Configured cookies to work properly in cross-domain scenarios
   - Added environment variable control for cookie settings

## How to Test

### 1. Basic Authentication Flow

1. Start both the server and client:
   ```
   npm run dev
   ```

2. Open the application in your browser and log in with valid credentials
   - Check browser console for "[Auth]" logs showing successful authentication
   - Check server console for token and cookie information

3. Navigate around protected pages to verify authentication persists

### 2. Token Refresh

1. Log in to the application
2. Open browser dev tools and go to the Application tab
3. In Local Storage, look for the "authToken" and note its value
4. In the console, you can manually test token decoding:
   ```javascript
   // Paste in console to check token expiration
   const token = localStorage.getItem("authToken");
   const base64Url = token.split('.')[1];
   const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
   const payload = JSON.parse(atob(base64));
   console.log("Token expires at:", new Date(payload.exp * 1000));
   console.log("Current time:", new Date());
   console.log("Seconds until expiry:", payload.exp - Math.floor(Date.now()/1000));
   ```

5. Wait until close to token expiration or force refresh by clearing localStorage token:
   ```javascript
   // Keep the auth cookie but remove the token to force refresh
   localStorage.removeItem("authToken");
   // Then try to access a protected page
   ```

### 3. Silent Authentication

1. Log in to the application
2. Clear browser localStorage (but not cookies):
   - Open browser dev tools → Application → Local Storage
   - Delete items but keep cookies intact
3. Refresh the page
4. The system should automatically authenticate you without requiring login
   - Check console for "[Auth] Silent auth successful" message

### 4. Cross-Domain Testing (for Production)

In production environment with different domains for frontend and API:

1. Update `.env` file with:
   ```
   COOKIE_SAMESITE=none
   COOKIE_DOMAIN=.yourdomain.com  # If using subdomains
   HTTPS=true                      # Required for SameSite=None
   ```

2. Ensure both frontend and API are on HTTPS

## Troubleshooting

If you encounter authentication issues:

1. **Check Server Logs**
   - Look for "[Auth]" prefixed logs that show token verification steps

2. **Check Browser Console**
   - Look for auth-related errors or warnings

3. **Inspect Cookies**
   - In browser dev tools → Application → Cookies
   - Verify "refreshToken" cookie exists with proper settings

4. **Verify Environment Variables**
   - Ensure JWT_SECRET and REFRESH_JWT_SECRET are properly set
   - Check COOKIE_SAMESITE is appropriate for your deployment

5. **Cross-Domain Issues**
   - For cross-domain setups, HTTPS must be enabled
   - SameSite must be "none" for cross-domain
   - Ensure CORS is properly configured
