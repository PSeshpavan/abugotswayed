# OAuth 2.0 Setup Guide - Wedding Photo Sharing App

This guide will walk you through setting up Google OAuth 2.0 authentication for your wedding photo app. This replaces the service account authentication and fixes the storage quota issue.

---

## Why OAuth 2.0?

**Problem with Service Accounts:**
- Service accounts have NO storage quota
- Cannot own files in personal Google Drive
- Results in "Service Accounts do not have storage quota" error

**Solution with OAuth 2.0:**
- Users upload files as themselves (using their own Google account)
- Files are stored in the user's own Drive (uses their quota)
- No storage quota errors
- More secure and compliant with Google's 2025 policies

---

## Step 1: Create OAuth 2.0 Credentials

### 1.1 Go to Google Cloud Console

Visit: https://console.cloud.google.com/apis/credentials

Make sure you're using the same project: **swarna-wedding**

### 1.2 Create OAuth Client ID

1. Click **"+ CREATE CREDENTIALS"** at the top
2. Select **"OAuth client ID"**

### 1.3 Configure Consent Screen (if prompted)

If this is your first time, you'll be asked to configure the consent screen:

1. Click **"CONFIGURE CONSENT SCREEN"**
2. Select **"External"** (for personal Gmail accounts)
3. Click **"CREATE"**

**Fill in required fields:**
- **App name:** Swarna Wedding Photos
- **User support email:** Your email address
- **Developer contact information:** Your email address

4. Click **"SAVE AND CONTINUE"**

**Add Scopes:**
5. Click **"ADD OR REMOVE SCOPES"**
6. Search for and select these scopes:
   - `https://www.googleapis.com/auth/drive.file`
   - `openid`
   - `email`
   - `profile`
7. Click **"UPDATE"** then **"SAVE AND CONTINUE"**

**Test Users (optional):**
8. You can add test users here, or skip this step
9. Click **"SAVE AND CONTINUE"**

10. Review and click **"BACK TO DASHBOARD"**

### 1.4 Create OAuth Client ID (continued)

1. Go back to **Credentials** page
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. **Application type:** Select **"Web application"**
4. **Name:** Swarna Wedding App (or any name you prefer)

**Authorized redirect URIs** (VERY IMPORTANT):

Add these TWO URIs:

For **local development:**
```
http://localhost:3000/api/auth/callback/google
```

For **production** (after deploying to Vercel):
```
https://your-app-name.vercel.app/api/auth/callback/google
```

Replace `your-app-name.vercel.app` with your actual Vercel URL.

5. Click **"CREATE"**

### 1.5 Save Your Credentials

You'll see a popup with:
- **Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abc123xyz`)

**IMPORTANT:** Copy these values! You'll need them in the next step.

---

## Step 2: Enable Google Drive API

1. In Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Drive API"**
3. Click on it
4. Click **"ENABLE"** (if not already enabled)

---

## Step 3: Update Environment Variables

### 3.1 Open (or create) `.env.local`

In your project folder: `c:\Users\Dark\Documents\Swarna-wedding\.env.local`

### 3.2 Replace contents with:

```env
# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret-here

# NextAuth Configuration
AUTH_SECRET=generate-a-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# Google Drive Folder ID (keep this from before)
GOOGLE_DRIVE_FOLDER_ID=10owBvniraOqfEnnDm_HgIBHsm71h3RnL
```

### 3.3 Fill in the values:

**GOOGLE_CLIENT_ID:**
- Paste the Client ID from Step 1.5

**GOOGLE_CLIENT_SECRET:**
- Paste the Client Secret from Step 1.5

**AUTH_SECRET:**
- Generate a random string (32+ characters)
- You can use this command in terminal:
  ```bash
  openssl rand -base64 32
  ```
- Or just type a long random string of letters and numbers

**NEXTAUTH_URL:**
- For development: `http://localhost:3000`
- For production: Change this to your Vercel URL (e.g., `https://your-app.vercel.app`)

**GOOGLE_DRIVE_FOLDER_ID:**
- Keep your existing folder ID: `10owBvniraOqfEnnDm_HgIBHsm71h3RnL`

### 3.4 Save the file

Make sure `.env.local` is saved and NOT committed to git (it should already be in `.gitignore`).

---

## Step 4: Test Locally

### 4.1 Start the development server

```bash
npm run dev
```

### 4.2 Open the app

Visit: http://localhost:3000

### 4.3 Test sign-in flow

1. You should see a **"Sign in with Google"** button
2. Click it
3. You'll be redirected to Google's login page
4. Sign in with your Google account
5. Google will ask for permission to:
   - See your basic profile info
   - View and manage files that this app creates in your Drive
6. Click **"Allow"**
7. You'll be redirected back to your app
8. You should now see the upload form!

### 4.4 Test upload

1. Select a test image
2. Click "Upload Photos"
3. Wait for success message
4. Check your Google Drive folder - the image should be there!
5. Go to the gallery page - the image should appear

**If everything works, continue to Step 5 for deployment!**

---

## Step 5: Deploy to Production (Vercel)

### 5.1 Update OAuth Redirect URI

1. Go back to **Google Cloud Console** → **Credentials**
2. Click on your OAuth client ID
3. Add your production redirect URI:
   ```
   https://your-actual-vercel-url.vercel.app/api/auth/callback/google
   ```
4. Click **"SAVE"**

### 5.2 Set Environment Variables in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

| Name | Value |
|------|-------|
| `GOOGLE_CLIENT_ID` | Your Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Client Secret |
| `AUTH_SECRET` | Your generated secret |
| `NEXTAUTH_URL` | Your Vercel URL (e.g., `https://swarna-wedding.vercel.app`) |
| `GOOGLE_DRIVE_FOLDER_ID` | `10owBvniraOqfEnnDm_HgIBHsm71h3RnL` |

5. For each variable, select **Production**, **Preview**, and **Development**
6. Click **"Save"**

### 5.3 Redeploy

```bash
git add .
git commit -m "Switch to OAuth 2.0 authentication"
git push
```

Vercel will automatically redeploy.

### 5.4 Test production

1. Visit your Vercel URL
2. Sign in with Google
3. Upload a test image
4. Verify it appears in your Drive and gallery

---

## Step 6: Update Folder Permissions (Important!)

Since users now upload as themselves, they need access to your folder:

### Option A: Make folder public (easier, less secure)

1. Open Google Drive: https://drive.google.com
2. Find your wedding photos folder
3. Right-click → **Share**
4. Change to **"Anyone with the link"** → **"Editor"**
5. Click **"Done"**

**Pros:**
- Anyone can upload without individual permissions
- Easy to set up

**Cons:**
- Anyone with the folder ID can upload
- Less control over who accesses

### Option B: Share with specific users (more secure)

1. Open Google Drive
2. Find your wedding photos folder
3. Right-click → **Share**
4. Add email addresses of people who should upload
5. Set permission to **"Editor"**

**Pros:**
- More secure
- Control exactly who can upload

**Cons:**
- Need to add each user manually
- Users must be signed in with the email you shared with

**Recommendation:** For a wedding, Option A (public with link) is usually fine, since you're sharing the QR code with guests anyway.

---

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause:** The redirect URI in your OAuth config doesn't match what NextAuth is using.

**Fix:**
1. Check the error message - it will show the URI that was attempted
2. Go to Google Cloud Console → Credentials
3. Add that exact URI to **Authorized redirect URIs**
4. Make sure there are NO trailing slashes
5. Save and try again

### Error: "Access blocked: Authorization Error"

**Cause:** Your OAuth consent screen is not configured properly.

**Fix:**
1. Go to Google Cloud Console → **OAuth consent screen**
2. Make sure **"External"** is selected
3. Add required scopes (`drive.file`, `email`, `profile`)
4. Save changes
5. Try signing in again

### Sign-in works but upload fails with 403

**Cause:** User doesn't have access to the Drive folder.

**Fix:**
1. Make folder **"Anyone with the link - Editor"** (see Step 6)
2. Or share folder with specific user emails

### Error: "Failed to fetch access token"

**Cause:** OAuth credentials are incorrect.

**Fix:**
1. Double-check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`
2. Make sure there are no extra spaces or quotes
3. Restart dev server: `npm run dev`

### Sign-in loop (keeps redirecting to Google)

**Cause:** `AUTH_SECRET` is missing or invalid.

**Fix:**
1. Generate a new `AUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```
2. Add it to `.env.local`
3. Restart server

---

## Security Best Practices

### 1. Never commit secrets

`.env.local` should be in your `.gitignore`. Never commit:
- `GOOGLE_CLIENT_SECRET`
- `AUTH_SECRET`

### 2. Use environment variables in Vercel

Always set secrets in Vercel dashboard, not in your code.

### 3. Minimal scopes

We only use `drive.file` scope - this gives access ONLY to files created by the app, not the user's entire Drive.

### 4. HTTPS only in production

Make sure your Vercel URL uses HTTPS (it does by default).

---

## What Changed from Service Account?

**Before (Service Account):**
- Used `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY`
- Service account uploaded files (no quota)
- Files needed to be in shared folder
- Got "storage quota" error

**Now (OAuth 2.0):**
- Uses `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Users upload files as themselves (uses their quota)
- Files go to the specified folder in their Drive
- No storage quota errors!

**User Experience:**
- Before: Direct upload (no sign-in)
- Now: Sign in with Google → Upload (one extra click)

**Trade-off:** Slightly more friction (sign-in step) for much better reliability and compliance.

---

## Next Steps

1. **Test thoroughly** - Try uploading from different accounts
2. **Generate QR code** - Run `npm run generate-qr https://your-url.vercel.app`
3. **Print QR codes** - For your wedding venue
4. **Communicate to guests** - Let them know they'll need to sign in with Google

---

## Need Help?

**Common Issues:**
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

**Still stuck?**
- Check Google Cloud Console logs
- Check Vercel function logs
- Check browser console (F12) for errors

---

**Congratulations!** Your wedding photo app now uses OAuth 2.0 and should work perfectly! 🎉
