# Testing Guide - Wedding Photo Sharing App

## ✅ Complete Testing Checklist

Follow these steps to verify everything works before your wedding!

---

## Step 1: Verify Google Drive Setup

### Check Service Account Sharing
1. Open [Google Drive](https://drive.google.com)
2. Navigate to your wedding photos folder (ID: `10owBvniraOqfEnnDm_HgIBHsm71h3RnL`)
3. Right-click the folder → "Share"
4. Verify `pavan-631@swarna-wedding.iam.gserviceaccount.com` is listed with **"Editor"** permission
5. If not, add it now following [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### Check Environment Variables
```bash
# Make sure .env.local exists
ls .env.local

# Verify it has all three variables (without printing values)
echo "Checking environment variables..."
grep -q "GOOGLE_CLIENT_EMAIL" .env.local && echo "✅ GOOGLE_CLIENT_EMAIL found"
grep -q "GOOGLE_PRIVATE_KEY" .env.local && echo "✅ GOOGLE_PRIVATE_KEY found"
grep -q "GOOGLE_DRIVE_FOLDER_ID" .env.local && echo "✅ GOOGLE_DRIVE_FOLDER_ID found"
```

---

## Step 2: Start Development Server

```bash
# If server is running, stop it first (Ctrl+C)

# Start fresh
npm run dev
```

Expected output:
```
   ▲ Next.js 15.x.x
   - Local:        http://localhost:3000
   - ready started server on [::]:3000
```

---

## Step 3: Test Image Upload

### Test Single Image Upload
1. Open http://localhost:3000 in your browser
2. Click the drop zone or "Choose Files"
3. Select ONE test image (JPG/PNG)
4. Click "Upload Photos"
5. Wait for success message

**Expected results:**
- ✅ Success message: "Successfully uploaded 1 photo"
- ✅ Image appears in your Google Drive folder within 5 seconds
- ✅ Redirected to gallery page
- ✅ Image appears in gallery within 10 seconds

**If it fails:**
- Check browser console (F12) for errors
- Check terminal for error messages
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for solutions

### Test Multiple Image Upload
1. Go back to upload page
2. Select 3-5 test images
3. Upload them
4. Verify all appear in Drive and gallery

---

## Step 4: Test Video Upload

### Test Single Video Upload
1. Go to upload page
2. Select ONE MP4 video (under 100MB)
3. Upload it

**Expected results:**
- ✅ Success message: "Successfully uploaded 1 video"
- ✅ Video appears in Google Drive folder
- ✅ Video appears in gallery with play button overlay
- ✅ Clicking play button opens modal
- ✅ Video plays smoothly

**If it fails:**
- Verify video is MP4 format
- Verify video is under 100MB
- Check console for errors

### Test Mixed Upload
1. Select 2 images + 1 video
2. Upload together
3. Verify success message: "Successfully uploaded 2 photos and 1 video"

---

## Step 5: Test Gallery Features

### Test Infinite Scroll
1. Upload 20+ images/videos (use small test files)
2. Go to gallery
3. Scroll to bottom
4. Verify next batch loads automatically
5. Check loading spinner appears during fetch

### Test Real-time Updates
1. Open gallery in Browser 1
2. Open upload page in Browser 2
3. Upload a new image from Browser 2
4. Wait 10 seconds
5. Verify image appears automatically in Browser 1 (no refresh needed)

### Test Video Playback
1. Click any video in gallery
2. Verify modal opens
3. Verify video plays
4. Press Escape key → modal should close
5. Click outside modal → modal should close

---

## Step 6: Test Responsiveness

### Test Mobile View (Chrome DevTools)
1. Open Chrome DevTools (F12)
2. Click device toolbar icon (phone icon)
3. Select "iPhone 12 Pro" or "Pixel 5"
4. Test these features:
   - Upload page layout (should be single column)
   - Gallery grid (should be 2 columns)
   - Video modal (should fit screen)
   - Buttons (should be full width on upload page)

### Test Tablet View
1. Select "iPad Air" in DevTools
2. Verify gallery shows 3-4 columns
3. Verify all text is readable
4. Test upload functionality

### Test Desktop View
1. Close DevTools (back to full screen)
2. Verify gallery shows 5-6 columns
3. Test all features work

---

## Step 7: Test Different Browsers

Test in at least 2 browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Safari (if on Mac)
- [ ] Firefox

For each browser:
1. Upload 1 image
2. Upload 1 video
3. View gallery
4. Play a video

---

## Step 8: Performance Testing

### Check Load Times
1. Clear browser cache (Ctrl+Shift+Delete)
2. Open gallery with 20+ items
3. Use Network tab in DevTools
4. Verify images load progressively
5. Verify no lag when scrolling

### Check Upload Speed
1. Upload 5 images at once
2. Measure time from click to success message
3. Should be under 30 seconds (depending on file sizes and internet)

---

## Step 9: Test Error Handling

### Test No Files Selected
1. Go to upload page
2. Click "Upload Photos" without selecting files
3. Verify helpful error message

### Test Large Video
1. Try uploading a video over 100MB
2. Verify error message appears
3. Verify upload is blocked

### Test Non-MP4 Video
1. Try uploading a .MOV or .AVI video (if you have one)
2. Verify error message appears

---

## Step 10: Production Deployment Test

After deploying to Vercel:

### Test Production URL
1. Visit your Vercel URL (e.g., `https://swarna-wedding.vercel.app`)
2. Test image upload
3. Test video upload
4. Test gallery
5. Test on mobile phone (scan QR code)

### Test QR Code
1. Generate QR code:
   ```bash
   npm run generate-qr https://your-vercel-url.vercel.app
   ```
2. Scan with phone camera
3. Verify it opens your app
4. Upload from phone
5. Verify upload works

---

## 🎯 Pre-Wedding Final Test (Do this 1 day before!)

1. **Fresh test from phone:**
   - Clear browser cache on phone
   - Scan QR code
   - Upload 1 photo
   - Verify it appears in gallery

2. **Check venue internet:**
   - Test upload speed at venue (if possible)
   - Have a backup plan (mobile hotspot)

3. **Print QR codes:**
   - Print multiple copies (8x10 inches minimum)
   - High quality (300 DPI+)
   - Test scanning the print

4. **Verify storage:**
   - Check Google Drive has enough space
   - You have 15GB free on free Gmail
   - Each optimized photo is ~200-500KB
   - Videos use original size (up to 100MB each)

---

## 🐛 Common Issues During Testing

### Images don't appear in gallery
- Wait 10 seconds (auto-refresh interval)
- Hard refresh: `Ctrl+Shift+R`
- Check Google Drive folder - are they there?
- Check browser console for errors

### Upload fails
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) Step 1
- Verify folder sharing is correct
- Check environment variables

### Slow performance
- Check internet speed
- Reduce upload batch size (5-10 at a time)
- Verify image optimization is working (check file sizes in Drive)

### Videos don't play
- Verify format is MP4
- Try different browser
- Check browser console for errors

---

## ✅ Testing Complete Checklist

Before the wedding, verify ALL these work:

- [ ] Single image upload
- [ ] Multiple image upload (5+ images)
- [ ] Single video upload (MP4)
- [ ] Multiple video upload
- [ ] Mixed image + video upload
- [ ] Images appear in Google Drive
- [ ] Images appear in gallery
- [ ] Gallery infinite scroll
- [ ] Real-time gallery updates (10 second polling)
- [ ] Video playback in modal
- [ ] Mobile responsiveness (phone viewport)
- [ ] Tablet responsiveness
- [ ] Desktop responsiveness
- [ ] Works in Chrome
- [ ] Works in Safari/Firefox
- [ ] QR code scans correctly
- [ ] Upload from phone works
- [ ] Production deployment works
- [ ] Fast loading (no lag)
- [ ] Error messages work correctly

---

## 📊 Expected Performance Metrics

**Upload times (good internet):**
- 1 image: 2-5 seconds
- 5 images: 10-20 seconds
- 1 video (50MB): 30-60 seconds

**Gallery load time:**
- Initial 15 items: 1-2 seconds
- Next 15 items (scroll): 1-2 seconds

**Real-time updates:**
- New uploads appear: Within 10 seconds

---

## 🎉 Ready for Production?

If all tests pass, you're ready! If you encounter issues, check:
1. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common problems and fixes
2. [SOLUTION_SUMMARY.md](SOLUTION_SUMMARY.md) - Overview of all features
3. [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Vercel deployment steps

---

**Good luck with your sister's wedding! 🎊**
