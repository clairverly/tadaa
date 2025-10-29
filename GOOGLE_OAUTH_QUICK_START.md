# Google OAuth Quick Start Guide

Follow these steps to set up Google OAuth for your application in about 5-10 minutes.

## Step 1: Go to Google Cloud Console

1. Open your browser and go to: **https://console.cloud.google.com/**
2. Sign in with your Google account

## Step 2: Create a New Project

1. Click on the **project dropdown** at the top of the page (next to "Google Cloud")
2. Click **"NEW PROJECT"** button in the top right
3. Enter project details:
   - **Project name**: `Tadaa Personal Concierge` (or any name you prefer)
   - **Organization**: Leave as default (No organization)
4. Click **"CREATE"**
5. Wait a few seconds for the project to be created
6. Click **"SELECT PROJECT"** when it appears

## Step 3: Enable Required APIs

1. In the left sidebar, click **"APIs & Services"** > **"Library"**
2. In the search bar, type: `Google+ API`
3. Click on **"Google+ API"** from the results
4. Click the blue **"ENABLE"** button
5. Wait for it to enable (takes a few seconds)

## Step 4: Configure OAuth Consent Screen

1. In the left sidebar, click **"OAuth consent screen"**
2. Select **"External"** user type (this allows anyone with a Google account to sign in)
3. Click **"CREATE"**

### Fill in App Information:
- **App name**: `Tadaa Personal Concierge`
- **User support email**: Select your email from the dropdown
- **App logo**: (Optional - you can skip this)
- **Application home page**: Leave blank for now
- **Application privacy policy link**: Leave blank for now
- **Application terms of service link**: Leave blank for now
- **Authorized domains**: Leave blank for now
- **Developer contact information**: Enter your email address

4. Click **"SAVE AND CONTINUE"**

### Scopes Page:
5. Click **"ADD OR REMOVE SCOPES"**
6. In the filter box, search for and check these scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
7. Click **"UPDATE"** at the bottom
8. Click **"SAVE AND CONTINUE"**

### Test Users Page:
9. Click **"ADD USERS"**
10. Enter your email address (the one you'll use for testing)
11. Click **"ADD"**
12. Click **"SAVE AND CONTINUE"**

### Summary Page:
13. Review the information
14. Click **"BACK TO DASHBOARD"**

## Step 5: Create OAuth 2.0 Credentials

1. In the left sidebar, click **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**

### Configure OAuth Client:
4. **Application type**: Select **"Web application"**
5. **Name**: `Tadaa Web Client` (or any name you prefer)

6. **Authorized JavaScript origins** - Click **"+ ADD URI"** and add:
   ```
   http://localhost:5173
   ```
   Click **"+ ADD URI"** again and add:
   ```
   http://localhost:3000
   ```

7. **Authorized redirect URIs** - Click **"+ ADD URI"** and add:
   ```
   http://localhost:8000/auth/google/callback
   ```
   Click **"+ ADD URI"** again and add:
   ```
   http://localhost:5173
   ```

8. Click **"CREATE"**

## Step 6: Copy Your Credentials

A popup will appear with your credentials:

1. **Copy the Client ID** - it looks like:
   ```
   123456789-abcdefghijklmnop.apps.googleusercontent.com
   ```

2. **Copy the Client Secret** - it looks like:
   ```
   GOCSPX-abcdefghijklmnopqrstuvwx
   ```

3. Click **"OK"** to close the popup

**IMPORTANT**: Keep these credentials safe! Don't share them publicly.

## Step 7: Configure Your Backend

1. Open the file: `backend/.env`
2. Find these lines and replace with your credentials:
   ```env
   GOOGLE_CLIENT_ID=paste-your-client-id-here
   GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
   GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
   ```

Example:
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwx
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

3. Save the file

## Step 8: Configure Your Frontend

1. Open the file: `frontend/.env`
2. Find this line and replace with your Client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=paste-your-client-id-here
   ```

Example:
```env
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

3. Save the file

## Step 9: Restart Your Servers

### Backend:
1. Stop the backend server (Ctrl+C in the terminal)
2. Start it again:
   ```bash
   cd backend
   python3 -m uvicorn main:app --reload
   ```

### Frontend:
1. Stop the frontend server (Ctrl+C in the terminal)
2. Start it again:
   ```bash
   cd frontend
   npm run dev
   ```

## Step 10: Test Your Login

1. Open your browser and go to: **http://localhost:5173/login**
2. You should see a **"Sign in with Google"** button
3. Click the button
4. Select your Google account
5. Click **"Continue"** to grant permissions
6. You should be redirected back to your app and logged in!

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Go back to Google Cloud Console > Credentials
- Click on your OAuth client ID
- Make sure the redirect URIs exactly match:
  - `http://localhost:8000/auth/google/callback`
  - `http://localhost:5173`
- No trailing slashes, no typos!

### "Error 403: access_denied"
- Make sure you added yourself as a test user in the OAuth consent screen
- The app is in "Testing" mode, so only test users can sign in

### Google button not showing
- Check that you copied the Client ID correctly to `frontend/.env`
- Make sure you restarted the frontend server after changing `.env`
- Check browser console for errors (F12 > Console tab)

### "Error 401: invalid_client"
- Check that you copied both Client ID and Client Secret correctly to `backend/.env`
- Make sure there are no extra spaces or quotes
- Restart the backend server

## What's Next?

Once you've successfully logged in with Google:
- Your user information is automatically saved to the database
- You can access protected routes in the app
- Your profile picture from Google will be displayed

## Publishing Your App (Later)

When you're ready to deploy to production:
1. Go back to OAuth consent screen
2. Click **"PUBLISH APP"**
3. Update the authorized domains and redirect URIs with your production URLs
4. Use HTTPS for all production URLs

## Need More Help?

- Full detailed guide: See `GOOGLE_OAUTH_SETUP.md`
- Google's official docs: https://developers.google.com/identity/protocols/oauth2
- If you get stuck, check the browser console (F12) for error messages