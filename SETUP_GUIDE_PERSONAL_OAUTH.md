# Setup Guide - Personal OAuth Authentication

This guide will help you set up the wedding photo sharing app using **your personal Google account**. Guests can upload photos WITHOUT signing in, and all files go to YOUR Google Drive.

**Estimated time:** 20-25 minutes

---

## How It Works

- **Guests:** No sign-in required - just scan QR and upload
- **Backend:** Uses YOUR OAuth credentials to upload files
- **Storage:** All photos/videos go to YOUR Google Drive folder
- **Quota:** Uses YOUR 15GB free Google storage

---

## Prerequisites

- Google account (free Gmail or Workspace)
- Google Drive folder ID (where photos will be uploaded)
- Node.js installed
- Project dependencies installed (`npm install`)

---

## Step 1: Create OAuth 2.0 Credentials (10 min)

### 1.1 Go to Google Cloud Console

Visit: https://console.cloud.google.com/apis/credentials

Make sure you're using the correct project: **swarna-wedding**

### 1.2 Configure OAuth Consent Screen

1. Click **"OAuth consent screen"** in the left sidebar
2. If not already configured, select **"External"** user type
3. Click **"CREATE"**

**Fill in required fields:**
- **App name:** Swarna Wedding Photos
- **User support email:** Your email address
- **Developer contact information:** Your email address

4. Click **"SAVE AND CONTINUE"**

**Add Scopes:**
5. Click **"ADD OR REMOVE SCOPES"**
6. Filter and select these scopes:
   - `https://www.googleapis.com/auth/drive` (Full Drive access)
   - `https://www.googleapis.com/auth/drive.file` (App-created files)
   - `openid`
   - `email`
   - `profile`

7. Click **"UPDATE"** then **"SAVE AND CONTINUE"**

**Test Users (optional):**
8. Add your email as a test user (optional)
9. Click **"SAVE AND CONTINUE"**

10. Review and click **"BACK TO DASHBOARD"**

### 1.3 Create OAuth Client ID

1. Go back to **"Credentials"** page
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. **Application type:** Select **"Web application"**
4. **Name:** Swarna Wedding App

**Authorized redirect URIs** (Important!):

Add these URIs:

For setup script (localhost):
```
http://localhost:3001/oauth/callback
```

For production (after deploying to Vercel):
```
https://your-app-name.vercel.app/oauth/callback
```

5. Click **"CREATE"**

### 1.4 Save Your Credentials

You'll see a popup with:
- **Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abc123xyz`)

**Copy these values** - you'll need them in the next step!

---

## Step 2: Enable Google Drive API (2 min)

1. In Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Drive API"**
3. Click on it
4. Click **"ENABLE"** (if not already enabled)

---

## Step 3: Configure Environment Variables (3 min)

### 3.1 Create `.env.local` File

In your project root: `c:\Users\Dark\Documents\Swarna-wedding\.env.local`

### 3.2 Add OAuth Credentials

```env
# OAuth Credentials from Step 1.4
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret-here

# Refresh token (we'll get this in Step 4)
GOOGLE_REFRESH_TOKEN=you-will-get-this-in-next-step

# Your Google Drive folder ID
GOOGLE_DRIVE_FOLDER_ID=10owBvniraOqfEnnDm_HgIBHsm71h3RnL
```

**Don't add the refresh token yet** - we'll get it in Step 4!

---

## Step 4: Run OAuth Setup Script (5 min)

This is the magic step that gets your refresh token!

### 4.1 Run the Setup Script

```bash
npm run setup-oauth
```

### 4.2 What Happens:

1. **Local server starts** on port 3001
2. **Browser opens automatically** to Google OAuth page
3. **Sign in with YOUR Google account** (the one that owns the Drive folder)
4. **Grant permissions** when asked:
   - View and manage files in your Drive
   - View your email and profile info
5. **Redirected back** to localhost
6. **Terminal displays your refresh token**

### 4.3 Copy the Refresh Token

The terminal will show something like:

```
GOOGLE_REFRESH_TOKEN=1//0gABCDEFGHIJKLMNOP...
```

**Copy the entire line** and add it to your `.env.local` file.

### 4.4 Complete `.env.local` Example

```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz
GOOGLE_REFRESH_TOKEN=1//0gABCDEFGHIJKLMNOP...
GOOGLE_DRIVE_FOLDER_ID=10owBvniraOqfEnnDm_HgIBHsm71h3RnL
```

---

## Step 5: Test Locally (5 min)

### 5.1 Start Development Server

```bash
npm run dev
```

### 5.2 Test Upload

1. Open http://localhost:3000
2. **NO sign-in required** - you should see the upload form immediately!
3. Upload a test image
4. Wait for success message

### 5.3 Verify

**Check Google Drive:**
1. Go to https://drive.google.com
2. Navigate to your folder (ID: `10owBvniraOqfEnnDm_HgIBHsm71h3RnL`)
3. **The test image should be there!**

**Check Gallery:**
1. Go to http://localhost:3000/gallery
2. Your test image should appear within 10 seconds

**✅ If both work, setup is complete!**

---

## Step 6: Deploy to Production (Optional)

### 6.1 Update OAuth Redirect URI

1. Go back to Google Cloud Console → Credentials
2. Click your OAuth client ID
3. Add production redirect URI:
   ```
   https://your-actual-vercel-url.vercel.app/oauth/callback
   ```
4. Click **"SAVE"**

### 6.2 Set Environment Variables in Vercel

1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Add each variable:

| Name | Value |
|------|-------|
| `GOOGLE_CLIENT_ID` | Your Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Client Secret |
| `GOOGLE_REFRESH_TOKEN` | Your Refresh Token |
| `GOOGLE_DRIVE_FOLDER_ID` | `10owBvniraOqfEnnDm_HgIBHsm71h3RnL` |

3. For each variable, select: **Production**, **Preview**, and **Development**
4. Click **"Save"**

### 6.3 Deploy

```bash
git add .
git commit -m "Setup personal OAuth authentication"
git push
```

Vercel will automatically deploy.

### 6.4 Test Production

1. Visit your Vercel URL
2. Upload a test image (NO sign-in required!)
3. Verify it appears in your Drive and gallery

---

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause:** The redirect URI doesn't match what's in Google Cloud Console.

**Fix:**
1. Check the error - it shows the attempted URI
2. Go to Google Cloud Console → Credentials → Your OAuth Client
3. Add the exact URI from the error
4. Must be: `http://localhost:3001/oauth/callback` for setup script
5. Save and try again

### Error: "No refresh token received"

**Cause:** You've already authorized this app before.

**Fix:**
1. Go to https://myaccount.google.com/permissions
2. Find "Swarna Wedding Photos" app
3. Click "Remove Access"
4. Run `npm run setup-oauth` again
5. Make sure to grant permissions

### Error: "Missing OAuth credentials"

**Cause:** `.env.local` doesn't have `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET`.

**Fix:**
1. Verify `.env.local` exists in project root
2. Check it has both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
3. Make sure there are no typos or extra spaces
4. Restart the script

### Error: "Missing refresh token" when uploading

**Cause:** `.env.local` doesn't have `GOOGLE_REFRESH_TOKEN` or the script is not reading it.

**Fix:**
1. Check `.env.local` has `GOOGLE_REFRESH_TOKEN=...`
2. Make sure the value is the full token (starts with `1//0`)
3. Restart dev server: `npm run dev`

### Upload fails with 403 or 404

**Cause:** Folder doesn't exist or you don't have access.

**Fix:**
1. Verify `GOOGLE_DRIVE_FOLDER_ID` is correct
2. Sign in to https://drive.google.com with the SAME account you used for OAuth
3. Navigate to the folder using the ID in the URL
4. Make sure the folder exists and is accessible

### Port 3001 already in use

**Cause:** Another process is using port 3001.

**Fix:**
1. Find and stop the process using port 3001
2. Or restart your computer
3. Run `npm run setup-oauth` again

---

## Security Best Practices

### 1. Never Commit Secrets

`.env.local` should be in your `.gitignore`. Never commit:
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`

### 2. Refresh Token Storage

- Store refresh token ONLY in environment variables
- Never expose it in client-side code
- Never log it in console or errors

### 3. Revoke Access

If your refresh token is ever compromised:
1. Go to https://myaccount.google.com/permissions
2. Remove access for "Swarna Wedding Photos"
3. Run `npm run setup-oauth` again to get a new token
4. Update `.env.local` and Vercel environment variables

### 4. Minimal Scopes

We request full Drive scope (`drive`) because we need to:
- Upload files to an existing folder
- List files from the folder
- Create public permissions

---

## What Changed from Previous Approaches?

### vs. Service Account (Original):
- **Before:** Service account uploads (no quota) → Error
- **Now:** YOUR account uploads (uses your quota) → Works!

### vs. Multi-User OAuth (My Previous Implementation):
- **Before:** Each guest signs in → Files scattered
- **Now:** No guest sign-in → All files in YOUR Drive → Correct!

---

## User Experience

### Guest Flow:
1. Scan QR code
2. Upload form appears **immediately** (no sign-in!)
3. Upload photos/videos
4. Success! Photos appear in gallery

### Behind the Scenes:
1. Guest uploads files
2. Server uses **YOUR refresh token**
3. Gets fresh access token automatically
4. Uploads to **YOUR Google Drive**
5. Files appear in **YOUR folder**
6. Gallery shows all photos from **YOUR folder**

---

## FAQ

**Q: Do guests need a Google account?**
A: No! Guests don't sign in at all.

**Q: Where are the files stored?**
A: In YOUR Google Drive folder, using YOUR 15GB free quota.

**Q: What if I run out of storage?**
A: Upgrade to Google One for more storage, or delete old files.

**Q: Can I change which account owns the files?**
A: Yes! Just run `npm run setup-oauth` again with a different Google account.

**Q: Is the refresh token safe?**
A: Yes, as long as it's only in `.env.local` and Vercel env vars (never in code/git).

**Q: Can I revoke access later?**
A: Yes! Go to https://myaccount.google.com/permissions and remove the app.

**Q: What if the refresh token expires?**
A: Refresh tokens don't expire unless revoked. If it stops working, run setup again.

---

## Next Steps

1. ✅ Setup complete? Test a few more uploads
2. ✅ Everything working? Deploy to Vercel
3. ✅ Deployed? Generate QR code: `npm run generate-qr https://your-url.vercel.app`
4. ✅ Print QR codes for wedding venue
5. ✅ Test with your phone before the wedding!

---

**Congratulations! Your wedding photo sharing app is ready!** 🎉

All guests can now upload photos without any friction, and everything goes to your Google Drive automatically.
