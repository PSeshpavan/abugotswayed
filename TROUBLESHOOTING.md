# Troubleshooting Guide

## Common Issues and Solutions

### ❌ Error: "Service Accounts do not have storage quota"

**Cause:** The Google Drive folder is NOT properly shared with the service account, OR the code is missing the `supportsAllDrives` parameter (required for free Gmail accounts).

**Solution (2 Parts):**

#### Part 1: Share the folder correctly

1. Open [Google Drive](https://drive.google.com)
2. Find your wedding photos folder
3. Right-click the folder → Click "Share"
4. Look for your service account email (from the JSON file, e.g., `pavan-631@swarna-wedding.iam.gserviceaccount.com`)
5. If it's NOT there:
   - Click "Add people and groups"
   - Paste the service account email
   - Change permission to **"Editor"** (not Viewer!)
   - Uncheck "Notify people"
   - Click "Share"
6. If it IS there but says "Viewer":
   - Click the dropdown next to the email
   - Change to **"Editor"**
   - Save

**How to find your service account email:**
```bash
# Open your credentials JSON file and look for "client_email"
cat path/to/your-credentials.json | grep client_email
```

Or check your `.env.local` file - it's the value of `GOOGLE_CLIENT_EMAIL`.

#### Part 2: Verify supportsAllDrives is enabled

The code has been updated to include `supportsAllDrives: true` in all Google Drive API calls. This is REQUIRED for free Gmail accounts when using shared folders.

**Check that [lib/google-drive.ts](lib/google-drive.ts) includes:**
- `supportsAllDrives: true` in `drive.files.create()` calls (lines 55, 118)
- `supportsAllDrives: true` in `drive.permissions.create()` calls (lines 65, 128)
- `supportsAllDrives: true` and `includeItemsFromAllDrives: true` in `drive.files.list()` call (lines 168-169)

**After making these changes, restart your dev server:**
```bash
# Stop the server (Ctrl+C)
npm run dev
```

---

### ❌ Upload fails with "Permission denied"

**Solution:**
1. Verify the folder is shared with the service account (see above)
2. Make sure the permission is set to **"Editor"**, not "Viewer"
3. Double-check the `GOOGLE_DRIVE_FOLDER_ID` in `.env.local` matches your folder

**How to verify folder ID:**
1. Open your folder in Google Drive
2. Look at the URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
3. Copy everything after `/folders/`
4. Paste it into `.env.local` as `GOOGLE_DRIVE_FOLDER_ID`

---

### ❌ Error: "Invalid Credentials"

**Cause:** The Google API credentials in `.env.local` are incorrect.

**Solution:**

1. Open your downloaded credentials JSON file
2. Copy the `client_email` value exactly (including the full email)
3. Copy the `private_key` value exactly (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
4. Update `.env.local`:

```env
GOOGLE_CLIENT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"
```

**Important:**
- The private key MUST be wrapped in double quotes
- Keep the `\n` characters (they're important!)
- Don't remove any part of the key

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
