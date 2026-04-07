# Test Site Deployment Guide

This guide provides instructions for deploying the `/test` version of your website at `https://originalsource.co.za/test`. We've made several critical updates to fix the 404 errors and authentication issues.

## Overview of Changes Made

1. **Updated .htaccess Files**
   - Root .htaccess: Added explicit handling for the /test path
   - public/.htaccess: Created with comprehensive rules for production

2. **Fixed API URL Configuration**
   - Updated src/lib/api.js to properly handle both VITE_API_BASE_URL and VITE_API_BASE
   - Added debugging logs to help identify URL issues

3. **Enhanced Vite Proxy Configuration**
   - Added specific proxy rules for /test/api routes
   - Set up rewriting to ensure proper API path handling

4. **Updated React Router Configuration**
   - Enhanced App.jsx to better handle the /test path
   - Added development-mode logging to help with debugging

## Deployment Steps

### 1. Build the Application

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

### 2. Update Server Configuration

Transfer these critical files to your production server:

```bash
# Main files to copy to server root
.htaccess
public/.htaccess  (should go to your web root)

# Updated application files
dist/            (all built files)
server/utils/tokens.js
server/routes/auth.js
server/index.js
```

### 3. Configure Environment Variables

Make sure your production server has the correct environment variables:

1. Copy `.env.production` to your server as `.env`
2. Verify these critical settings:
   ```
   VITE_API_BASE=https://originalsource.co.za
   NODE_ENV=production
   HTTPS=true
   COOKIE_DOMAIN=.originalsource.co.za
   COOKIE_SAMESITE=lax
   ```

### 4. Configure Apache Virtual Host

Make sure your Apache configuration includes:

```apache
<VirtualHost *:443>
    ServerName originalsource.co.za
    ServerAlias www.originalsource.co.za
    
    DocumentRoot /path/to/your/dist
    
    <Directory /path/to/your/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/your/certificate.crt
    SSLCertificateKeyFile /path/to/your/private.key
    SSLCertificateChainFile /path/to/your/ca-bundle.crt
    
    # Enable HTTP/2
    Protocols h2 http/1.1
    
    # Other standard settings
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

### 5. Restart Services

```bash
# Restart Apache
sudo systemctl restart apache2

# Restart Node.js API server
cd /path/to/your/server
npm install  # If dependencies changed
pm2 restart your-api-service
```

## Testing the Deployment

### Test the Main Site
1. Visit https://originalsource.co.za
2. Verify the site loads correctly
3. Log in and check authentication works

### Test the Test Site
1. Visit https://originalsource.co.za/test
2. Verify the site loads without 404 errors
3. Check if you're automatically logged in if you were logged in on main site
4. If not, try logging in directly on the test site
5. Verify protected routes are accessible

### Debug Common Issues

#### 404 Errors on Test Site
- Check that both .htaccess files were properly deployed
- Verify Apache has AllowOverride All enabled
- Check Apache error logs for rewrite rule issues

#### Authentication Issues
- Open browser DevTools > Application > Cookies
- Verify the refreshToken cookie has:
  - Domain: .originalsource.co.za
  - Path: /
  - Secure: true
  - HttpOnly: true
- Check browser console for API errors
- Verify API requests are going to the correct URL (not localhost)

#### API Connection Issues
- Check that VITE_API_BASE is correctly set in your .env file
- Verify the API server is running
- Check CORS headers in Network responses

## Rollback Plan

If issues persist:

1. Keep a backup of your original files before deployment
2. To rollback, restore:
   - Original .htaccess
   - Original src/lib/api.js
   - Original server/routes/auth.js
   - Original server/utils/tokens.js

## Support

If you continue to experience issues after following these steps, collect:
1. Apache error logs
2. Browser console errors
3. Network request details for failing authentication
4. Screenshots of cookie settings

These details will help diagnose any persistent issues.
