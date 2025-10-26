# Quick Start - OAuth 2.0 Setup

**Estimated time: 15-20 minutes**

This is the fastest path to get your app running with OAuth 2.0.

---

## Step 1: Get OAuth Credentials (5 min)

1. **Go to:** https://console.cloud.google.com/apis/credentials
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted, configure consent screen:
   - User type: **External**
   - App name: **Swarna Wedding Photos**
   - Your email for support and developer contact
   - Add scopes: `drive.file`, `email`, `profile`
   - Save
4. Back to credentials:
   - Application type: **Web application**
   - Name: **Swarna Wedding App**
   - Add redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Click **CREATE**
5. **Copy** the Client ID and Client Secret

---

## Step 2: Set Environment Variables (2 min)

Create `c:\Users\Dark\Documents\Swarna-wedding\.env.local`:

```env
GOOGLE_CLIENT_ID=paste-your-client-id-here
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
AUTH_SECRET=run-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
GOOGLE_DRIVE_FOLDER_ID=10owBvniraOqfEnnDm_HgIBHsm71h3RnL
```

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```
Paste the output as AUTH_SECRET value.

---

## Step 3: Configure Drive Folder (2 min)

1. Open https://drive.google.com
2. Find your folder (ID: `10owBvniraOqfEnnDm_HgIBHsm71h3RnL`)
3. Right-click → **Share**
4. Click **"Change to anyone with the link"**
5. Set permission to **"Editor"**
6. Click **"Done"**

---

## Step 4: Test It! (5 min)

```bash
cd c:\Users\Dark\Documents\Swarna-wedding
npm run dev
```

1. Open http://localhost:3000
2. Click **"Sign in with Google"**
3. Choose your Google account
4. Grant permissions
5. Upload a test image
6. Check your Drive folder - image should be there!
7. Go to gallery - image should appear

**✅ If it works, you're done!**

---

## Step 5: Deploy to Vercel (5 min)

1. Add production redirect URI to OAuth config:
   - Go back to Google Cloud Console → Credentials
   - Add: `https://your-app.vercel.app/api/auth/callback/google`
   - Save

2. Set environment variables in Vercel:
   - Go to Vercel dashboard → Your project → Settings → Environment Variables
   - Add all 5 variables from your `.env.local`
   - Change `NEXTAUTH_URL` to your Vercel URL

3. Deploy:
   ```bash
   git add .
   git commit -m "Migrate to OAuth 2.0"
   git push
   ```

4. Test on production URL

**🎉 Done! Generate QR code:**
```bash
npm run generate-qr https://your-app.vercel.app
```

---

## Troubleshooting

**"redirect_uri_mismatch"**
- Add the exact URI from error to Google Cloud Console → Credentials

**"Access blocked"**
- Check OAuth consent screen has all required fields and scopes

**Upload fails with 403**
- Make sure folder is shared as "Anyone with link - Editor"

**Sign-in loop**
- Check AUTH_SECRET is set correctly
- Restart dev server

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more help.

---

**Need detailed instructions?** See [OAUTH_SETUP_GUIDE.md](OAUTH_SETUP_GUIDE.md)
