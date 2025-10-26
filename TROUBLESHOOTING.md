# Troubleshooting Guide

## 🔄 IMPORTANT: App Now Uses OAuth 2.0

**This app has been updated to use OAuth 2.0 authentication instead of service accounts.**

If you previously set up a service account, you need to switch to OAuth 2.0. See [OAUTH_SETUP_GUIDE.md](OAUTH_SETUP_GUIDE.md) for complete instructions.

---

## Common Issues and Solutions (OAuth 2.0)

### ❌ Error: "Unauthorized: Please sign in to upload files"

**Cause:** You're not signed in with Google.

**Solution:**
1. Click the **"Sign in with Google"** button on the homepage
2. Choose your Google account
3. Grant permissions when prompted
4. You should be redirected back to the app

---

### ❌ Error: "redirect_uri_mismatch"

**Cause:** The OAuth redirect URI doesn't match what's configured in Google Cloud Console.

**Solution:**

1. Look at the full error message - it shows the URI that was attempted
2. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
3. Click your OAuth 2.0 Client ID
4. Under **"Authorized redirect URIs"**, add the exact URI from the error:
   - For local: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://your-app.vercel.app/api/auth/callback/google`
5. Make sure there are NO trailing slashes
6. Click **"SAVE"**
7. Wait 1-2 minutes for changes to propagate
8. Try signing in again

---

### ❌ Error: "Access blocked: Authorization Error"

**Cause:** OAuth consent screen is not properly configured.

**Solution:**

1. Go to [Google Cloud Console → OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Make sure user type is **"External"**
3. Verify all required fields are filled:
   - App name
   - User support email
   - Developer contact information
4. Under **"Scopes"**, make sure these are added:
   - `https://www.googleapis.com/auth/drive.file`
   - `openid`
   - `email`
   - `profile`
5. Save changes
6. Try signing in again

---

### ❌ Sign-in works but upload fails with 403 error

**Cause:** User doesn't have permission to upload to the Google Drive folder.

**Solution:**

Make the folder accessible to all users:

1. Open [Google Drive](https://drive.google.com)
2. Find your wedding photos folder (ID: `10owBvniraOqfEnnDm_HgIBHsm71h3RnL`)
3. Right-click → **"Share"**
4. Click **"Change to anyone with the link"**
5. Set permission to **"Editor"**
6. Click **"Done"**

Now anyone who signs in can upload to the folder.

**Alternative (more secure):**
- Share the folder with specific email addresses
- Set permission to "Editor" for each user

---

### ❌ Error: "Failed to fetch" when signing in

**Cause:** OAuth credentials are missing or incorrect in environment variables.

**Solution:**

1. Check your `.env.local` file has these variables:
   ```env
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   AUTH_SECRET=...
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_DRIVE_FOLDER_ID=...
   ```

2. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`:
   - Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
   - Find your OAuth 2.0 Client ID
   - Compare the values

3. Generate a new `AUTH_SECRET` if missing:
   ```bash
   openssl rand -base64 32
   ```

4. Restart your dev server:
   ```bash
   npm run dev
   ```

---

### ❌ Sign-in loop (keeps redirecting to Google)

**Cause:** `AUTH_SECRET` is missing, invalid, or not properly configured.

**Solution:**

1. Generate a new secure random secret:
   ```bash
   openssl rand -base64 32
   ```

2. Add it to `.env.local`:
   ```env
   AUTH_SECRET=your-generated-secret-here
   ```

3. Make sure it's at least 32 characters long

4. Restart the dev server:
   ```bash
   npm run dev
   ```

---

### ❌ Error: "NEXTAUTH_URL environment variable is not set"

**Cause:** Missing `NEXTAUTH_URL` in environment variables.

**Solution:**

Add to `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3000
```

For production (Vercel), set:
```env
NEXTAUTH_URL=https://your-actual-url.vercel.app
```

Restart server after changes.

---

### ❌ Upload fails with "Folder not found"

**Cause:** `GOOGLE_DRIVE_FOLDER_ID` is incorrect or missing.

**Solution:**

1. Open your folder in Google Drive
2. Look at the URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
3. Copy everything after `/folders/`
4. Update `.env.local`:
   ```env
   GOOGLE_DRIVE_FOLDER_ID=your-folder-id-here
   ```
5. For this project, it should be: `10owBvniraOqfEnnDm_HgIBHsm71h3RnL`

---

### ❌ Error: "Invalid Credentials" (old service account error)

**This error means you're still using the old service account setup.**

**Solution:**

You need to switch to OAuth 2.0:
1. Read [OAUTH_SETUP_GUIDE.md](OAUTH_SETUP_GUIDE.md)
2. Create OAuth 2.0 credentials in Google Cloud Console
3. Update your `.env.local` with new variables
4. Remove old variables (`GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`)
5. Restart server

---

### ❌ Images not appearing in gallery

**Possible causes:**

1. **Images aren't uploaded yet**
   - Check your Google Drive folder
   - Are the images there? If not, uploads failed

2. **Wrong folder ID**
   - Verify `GOOGLE_DRIVE_FOLDER_ID` in `.env.local`
   - Make sure it matches the folder where images are being uploaded

3. **Browser cache**
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Try in incognito/private browsing mode

4. **Service account can't read the folder**
   - The service account needs "Editor" or "Viewer" permission (Editor is better)
   - Check folder sharing settings

---

### ❌ "No files provided" error

**Cause:** File input is not working correctly.

**Solution:**
- Make sure you're selecting image files (JPG, PNG, etc.)
- Try selecting one image first to test
- Check browser console for errors (F12 → Console tab)

---

### ❌ Build fails with TypeScript errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

---

### ❌ Vercel deployment fails

**Common issues:**

1. **Missing environment variables**
   - Go to Vercel dashboard → Your project → Settings → Environment Variables
   - Add all three variables:
     - `GOOGLE_CLIENT_EMAIL`
     - `GOOGLE_PRIVATE_KEY`
     - `GOOGLE_DRIVE_FOLDER_ID`
   - Redeploy

2. **Private key formatting**
   - In Vercel, paste the ENTIRE private key including quotes
   - Example: `"-----BEGIN PRIVATE KEY-----\n....\n-----END PRIVATE KEY-----\n"`
   - Keep the `\n` characters

3. **Build errors**
   - Check Vercel deployment logs
   - Look for specific error messages
   - Make sure the build works locally first: `npm run build`

---

### ❌ QR code doesn't work

**Solutions:**

1. **QR code not generated**
   ```bash
   npm run generate-qr https://your-vercel-url.vercel.app
   ```

2. **Wrong URL**
   - Make sure you use your actual Vercel URL
   - Include `https://` at the beginning

3. **QR code too small to scan**
   - Print it larger (8x10 inches or bigger)
   - Ensure high print quality
   - Test scanning before the event

---

### ❌ Slow performance / Images load slowly

**Solutions:**

1. **Check internet connection**
   - Both yours and your guests'
   - Venue WiFi might be slow

2. **Too many concurrent uploads**
   - Google Drive API has rate limits
   - Users should upload in smaller batches (10-20 images at a time)

3. **Large image files**
   - The app automatically compresses images
   - Original files > 10MB might take longer

---

### ❌ Real-time updates not working

**Expected behavior:**
- New images appear automatically every 10 seconds
- No need to refresh the page

**If not working:**
1. Check browser console for errors (F12)
2. Verify images are actually uploading to Drive
3. Try hard refresh: `Ctrl+Shift+R`
4. Check if JavaScript is enabled
5. Try a different browser

---

## Testing Checklist

Before the wedding, test these:

- [ ] Upload a single image
- [ ] Upload multiple images at once
- [ ] Check images appear in Google Drive folder
- [ ] Check images appear in gallery within 10 seconds
- [ ] Test on mobile phone
- [ ] Scan QR code with phone
- [ ] Upload from phone
- [ ] Test on different browsers (Chrome, Safari, Firefox)
- [ ] Test infinite scroll (upload 20+ images, scroll down)
- [ ] Test on slow internet connection

---

## Getting More Help

1. **Check the logs:**
   - Local: Check terminal where `npm run dev` is running
   - Vercel: Dashboard → Your project → Deployments → Click latest → View Function Logs

2. **Verify environment variables:**
   ```bash
   # Check if .env.local exists
   ls -la .env.local

   # Make sure it has all three variables (don't print the values!)
   grep -c "GOOGLE_CLIENT_EMAIL\|GOOGLE_PRIVATE_KEY\|GOOGLE_DRIVE_FOLDER_ID" .env.local
   # Should output: 3
   ```

3. **Test Google Drive API:**
   - Try manually uploading a file to the folder
   - Check if the service account can see the folder
   - Verify folder permissions

---

## Quick Fixes

### Reset Everything
```bash
# Stop the server (Ctrl+C)

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build

# Start fresh
npm run dev
```

### Verify Setup
```bash
# Check all files exist
ls app/api/upload/route.ts
ls app/api/images/route.ts
ls lib/google-drive.ts
ls .env.local

# Check build
npm run build
```

---

## Still Having Issues?

1. Re-read the [SETUP_GUIDE.md](./SETUP_GUIDE.md) carefully
2. Follow [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) step-by-step
3. Check [QUICK_START.md](./QUICK_START.md) for the correct sequence
4. Review this troubleshooting guide again
5. Check browser console for specific error messages (F12)

---

**Most common mistake:** Not sharing the Google Drive folder with the service account email with "Editor" permissions! Double-check this first.
