# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Tadaa Personal Concierge application.

## Prerequisites

- A Google Cloud Platform account
- Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Tadaa Personal Concierge")
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in the required information:
   - App name: Tadaa Personal Concierge
   - User support email: Your email
   - Developer contact information: Your email
5. Click "Save and Continue"
6. On the Scopes page, click "Add or Remove Scopes"
7. Add the following scopes:
   - `openid`
   - `email`
   - `profile`
8. Click "Save and Continue"
9. Add test users if needed (for development)
10. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Enter a name (e.g., "Tadaa Web Client")
5. Add Authorized JavaScript origins:
   - `http://localhost:5173` (for frontend development)
   - `http://localhost:3000` (alternative frontend port)
6. Add Authorized redirect URIs:
   - `http://localhost:8000/auth/google/callback` (for backend OAuth flow)
   - `http://localhost:5173` (for frontend OAuth flow)
7. Click "Create"
8. Copy the **Client ID** and **Client Secret**

## Step 5: Configure Backend Environment Variables

1. Open `backend/.env` file (create it if it doesn't exist by copying `.env.example`)
2. Add your Google OAuth credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

## Step 6: Configure Frontend Environment Variables

1. Open `frontend/.env` file (create it if it doesn't exist by copying `.env.example`)
2. Add your Google Client ID:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here
VITE_API_BASE_URL=http://localhost:8000
```

## Step 7: Install Dependencies

### Backend
```bash
cd backend
pip3 install -r requirements.txt
```

### Frontend
```bash
cd frontend
npm install
```

## Step 8: Start the Application

### Start Backend
```bash
cd backend
python3 -m uvicorn main:app --reload
```

### Start Frontend
```bash
cd frontend
npm run dev
```

## Step 9: Test Google Login

1. Open your browser and navigate to `http://localhost:5173/login`
2. Click the "Sign in with Google" button
3. Select your Google account
4. Grant the requested permissions
5. You should be redirected back to the application and logged in

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure the redirect URI in your Google Cloud Console matches exactly with the one configured in your backend
- Check that there are no trailing slashes or typos

### "Error 401: invalid_client"
- Verify that your Client ID and Client Secret are correct
- Make sure you're using the credentials from the correct Google Cloud project

### Google Sign-In button not appearing
- Check that `VITE_GOOGLE_CLIENT_ID` is set correctly in `frontend/.env`
- Restart the frontend development server after changing environment variables
- Check the browser console for any errors

### Token verification fails
- Ensure your backend is running and accessible
- Check that the API base URL is correct in the frontend configuration
- Verify that CORS is properly configured in the backend

## Production Deployment

When deploying to production:

1. Update the OAuth consent screen to "Production" status
2. Add your production domain to Authorized JavaScript origins and redirect URIs
3. Update environment variables with production URLs
4. Use HTTPS for all OAuth redirects
5. Keep your Client Secret secure and never commit it to version control

## Security Best Practices

- Never commit `.env` files to version control
- Use environment-specific configuration files
- Rotate credentials regularly
- Implement rate limiting on authentication endpoints
- Use HTTPS in production
- Validate and sanitize all user inputs
- Implement proper session management

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Websites](https://developers.google.com/identity/sign-in/web)
- [OAuth 2.0 Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)