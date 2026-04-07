# Build and Deployment Guide for Authentication Fix

This guide provides step-by-step instructions for building and deploying the authentication fix for your Original Source website. The key issue was that your frontend code was still trying to connect to `localhost:4040` in production, which was causing the "Missing refresh token" error.

## 1. Configure Environment Variables

First, ensure your environment variables are correctly set up:

### For Local Development

Create or update your `.env` file in the project root:

```
# Development environment variables
VITE_API_BASE=http://localhost:4040
```

### For Production

Create or update a `.env.production` file in the project root:

```
# Production environment variables
VITE_API_BASE=https://originalsource.co.za
```

## 2. Build the Frontend

Run the production build with the production environment variables:

```bash
# Install dependencies if needed
npm install

# Build for production
npm run build
```

This will create a `dist` directory with all the production-ready files.

## 3. Deploy to Production

### Files to Transfer

Transfer the following files to your production server:

1. The entire `dist` directory (contains your built frontend)
2. The updated server files:
   - `server/utils/tokens.js`
   - `server/routes/auth.js`
   - `server/index.js`
3. The updated `.htaccess` files:
   - Root `.htaccess`
   - `public/.htaccess` (should go to your web server root)

### Server Configuration

Make sure your server's `.env` file includes the correct settings:

```
# JWT Configuration
JWT_SECRET=your-secret-key
REFRESH_JWT_SECRET=your-refresh-secret

# Cookie Configuration
COOKIE_SAMESITE=lax
COOKIE_DOMAIN=.originalsource.co.za
HTTPS=true

# Node Environment
NODE_ENV=production

# Client Origins
CLIENT_ORIGINS=https://originalsource.co.za,https://www.originalsource.co.za
```

## 4. Restart Services

After deploying the files, restart your services:

```bash
# Restart the Node.js API server
pm2 restart your-api-service-name

# Restart Apache/Nginx if needed
sudo systemctl restart apache2
# OR
sudo systemctl restart nginx
```

## 5. Clear Browser Cache

Before testing, it's important to clear your browser cache to ensure you're getting the latest files:

1. Open browser DevTools (F12 or Ctrl+Shift+I)
2. Go to Application tab > Storage
3. Select "Clear site data"
4. Try accessing your site again

## 6. Verify the Fix

### Testing the Main Site

1. Visit https://originalsource.co.za
2. Log in with your credentials
3. Verify that you can access protected pages

### Testing the Test Site

1. Visit https://originalsource.co.za/test
2. Verify that the site loads correctly
3. Check that you're still logged in (the session should be shared)
4. If you see any errors in the console, check for API requests going to localhost

## 7. Debug Issues

If you still encounter issues:

1. Check the browser console for API requests to localhost
2. Make sure the production build is using the correct `VITE_API_BASE` value
3. Ensure all cookies have the correct domain and path
4. Verify that the server is correctly configured with the production environment settings

## 8. Rollback Plan

If needed, you can roll back to the previous version:

1. Restore the original files from your backups
2. Rebuild the frontend with the original configuration
3. Redeploy and restart services

## 9. Additional Notes

- Make sure your `.htaccess` files have proper permissions (usually 644)
- Ensure your web server has `AllowOverride All` enabled to use .htaccess files
- If using a CDN, make sure to purge the cache after deployment

For further assistance, refer to the detailed documentation in DEPLOYMENT_GUIDE.md and TEST_SITE_DEPLOYMENT.md.
