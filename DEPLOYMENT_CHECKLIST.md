# Deployment Checklist for Wedding Photo App

## Pre-Deployment Setup

### 1. Google Cloud Console Setup ✅
- [ ] Created Google Cloud Project
- [ ] Enabled Google Drive API
- [ ] Created Service Account
- [ ] Downloaded JSON credentials
- [ ] Shared Google Drive folder with service account email
- [ ] Tested upload locally

### 2. Environment Variables ✅
- [ ] Created `.env.local` file
- [ ] Added `GOOGLE_CLIENT_EMAIL`
- [ ] Added `GOOGLE_PRIVATE_KEY` (with proper formatting)
- [ ] Added `GOOGLE_DRIVE_FOLDER_ID`
- [ ] Verified `.env.local` is in `.gitignore`

### 3. Local Testing ✅
- [ ] Ran `npm install` successfully
- [ ] Ran `npm run dev` without errors
- [ ] Tested image upload functionality
- [ ] Verified images appear in Google Drive folder
- [ ] Tested gallery page loads images
- [ ] Tested infinite scroll
- [ ] Tested on mobile viewport (responsive design)

## Deployment to Vercel

### 4. GitHub Setup 🚀
- [ ] Initialized git repository: `git init`
- [ ] Created GitHub repository
- [ ] Added all files: `git add .`
- [ ] Created initial commit: `git commit -m "Initial commit: Wedding photo sharing app"`
- [ ] Pushed to GitHub: `git push origin main`
- [ ] Verified `.env.local` was NOT pushed (check `.gitignore`)

### 5. Vercel Deployment 🚀
- [ ] Logged in to [Vercel](https://vercel.com)
- [ ] Clicked "New Project"
- [ ] Imported GitHub repository
- [ ] Added Environment Variables:
  - `GOOGLE_CLIENT_EMAIL`
  - `GOOGLE_PRIVATE_KEY`
  - `GOOGLE_DRIVE_FOLDER_ID`
- [ ] Clicked "Deploy"
- [ ] Waited for deployment to complete
- [ ] Copied production URL

### 6. Post-Deployment Testing 🧪
- [ ] Visited production URL
- [ ] Tested upload functionality on production
- [ ] Verified images upload to Google Drive
- [ ] Tested gallery loads correctly
- [ ] Tested on mobile device
- [ ] Tested real-time updates (wait 10 seconds after upload)
- [ ] Tested infinite scroll with 20+ images

### 7. QR Code Generation 📱
- [ ] Ran: `npm run generate-qr https://your-vercel-url.vercel.app`
- [ ] Found QR code at `public/qr-code.png`
- [ ] Printed QR code
- [ ] Tested QR code scans correctly

### 8. Wedding Day Setup 💒
- [ ] Print QR code posters/cards
- [ ] Place QR codes at wedding venue
- [ ] Test QR code at venue (check WiFi works)
- [ ] Brief someone to monitor for inappropriate uploads (optional)

## Performance Checklist

- [x] Images auto-compressed to 85% quality
- [x] Images auto-resized to max 2000px
- [x] Lazy loading enabled
- [x] Infinite scroll (15 images per page)
- [x] Real-time polling (10s interval)
- [x] Next.js Image optimization
- [x] Responsive design for all devices

## Troubleshooting

### Images not uploading
1. Check Vercel logs for errors
2. Verify environment variables are set correctly
3. Check service account has Editor access to Drive folder
4. Verify folder ID is correct

### Images not appearing in gallery
1. Check images are in the Drive folder
2. Verify folder permissions (service account has access)
3. Check browser console for errors
4. Try hard refresh (Ctrl+Shift+R)

### QR code not working
1. Verify URL is correct
2. Test URL in browser first
3. Check QR code scanner app
4. Ensure URL uses HTTPS (Vercel provides this automatically)

## Important Notes

⚠️ **NEVER commit `.env.local` to GitHub**
⚠️ **Make sure Google Drive folder has enough storage**
⚠️ **Test everything before the wedding day**
⚠️ **Have a backup plan (paper photo box)**

## Support

If you encounter issues:
1. Check the [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Check Vercel deployment logs
3. Check browser console for errors
4. Verify all environment variables

---

**Estimated Setup Time**: 30-45 minutes
**Wedding Day**: Just scan and share! 📸
