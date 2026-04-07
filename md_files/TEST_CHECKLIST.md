# Implementation Verification Checklist

Use this checklist to verify that the test site implementation is working correctly in both development and production environments.

## Local Development Testing

### Basic Setup
- [ ] Start the development server with `npm run dev` (frontend)
- [ ] Start the backend server with appropriate command (e.g., `npm run server`)
- [ ] Verify both servers are running without errors in the console

### Main Site Testing (http://localhost:5173)
- [ ] Navigate to the main site
- [ ] Log in with valid credentials
- [ ] Check that authentication state is maintained when navigating between pages
- [ ] Verify protected routes are accessible
- [ ] Check browser's Application > Cookies tab to verify refresh token has:
  - [ ] Path: "/"
  - [ ] HttpOnly: true

### Test Site Testing (http://localhost:5173/test)
- [ ] Navigate to the test site path
- [ ] Verify the site loads correctly
- [ ] If previously logged in on the main site, verify you're still authenticated
- [ ] Test logging in directly on the test site
- [ ] Verify protected routes are accessible
- [ ] Log out and confirm authentication state is cleared

### CORS and Network
- [ ] Check browser console for any CORS errors
- [ ] Using Network tab, verify API calls succeed from both main and test paths
- [ ] Verify the refresh token request succeeds when tokens expire

## Production Environment Testing

### Server Deployment
- [ ] Deploy the updated files to the production server
- [ ] Update the .env file with production settings
- [ ] Restart the server
- [ ] Check server logs for:
  - [ ] Cookie configuration message: `Auth cookie config: sameSite=lax, secure=true, domain=.originalsource.co.za, path=/`
  - [ ] CORS configuration: `CORS origins configured: [list of origins]`

### Main Site Testing (https://originalsource.co.za)
- [ ] Navigate to the main production site
- [ ] Verify the site loads without errors
- [ ] Log in with valid credentials
- [ ] Check authentication works properly
- [ ] Verify protected routes are accessible
- [ ] Check browser's Application > Cookies tab to verify refresh token has:
  - [ ] Domain: `.originalsource.co.za`
  - [ ] Path: "/"
  - [ ] HttpOnly: true
  - [ ] Secure: true

### Test Site Testing (https://originalsource.co.za/test)
- [ ] Navigate to the test production site
- [ ] Verify the site loads without errors
- [ ] If previously logged in on main site, verify you're still authenticated
- [ ] Try accessing protected routes
- [ ] Log in directly on the test site
- [ ] Verify protected routes remain accessible
- [ ] Log out and confirm authentication state is cleared

### Cross-browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge (if applicable)
- [ ] Test on a mobile device

## Error Scenarios
- [ ] Test with expired tokens
- [ ] Test with invalid credentials
- [ ] Clear cookies and verify proper re-authentication

## Additional Tests
- [ ] Verify any API endpoints requiring authentication work from test path
- [ ] Check that logout clears cookies from all paths
- [ ] Verify CORS headers in Network tab responses

## Notes
- If any tests fail, consult the DEPLOYMENT_GUIDE.md file for troubleshooting steps
- Document any unexpected behavior and the steps to reproduce it
- For persistent issues, collect browser console logs, network requests, and server logs
