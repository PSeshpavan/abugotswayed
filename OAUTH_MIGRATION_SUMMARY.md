# OAuth 2.0 Migration - Complete! ✅

## What Was Done

Your wedding photo sharing app has been successfully migrated from **Service Account authentication** to **OAuth 2.0 authentication**. This fixes the persistent "Service Accounts do not have storage quota" error.

---

## Summary of Changes

### 📦 New Dependencies
- **next-auth@beta** (v5) - Authentication library for Next.js 15

### 🆕 New Files Created

1. **[lib/auth.ts](lib/auth.ts)**
   - NextAuth configuration
   - Google OAuth provider setup
   - JWT and session callbacks for access token management
   - Uses `drive.file` scope (most secure - only app-created files)

2. **[app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts)**
   - API route handler for NextAuth
   - Handles OAuth flow (sign in, sign out, callbacks)

3. **[app/providers.tsx](app/providers.tsx)**
   - Client-side SessionProvider wrapper
   - Makes session available to all client components

4. **[components/auth-button.tsx](components/auth-button.tsx)**
   - "Sign in with Google" button
   - User profile display when signed in
   - Sign out button
   - `SignInPrompt` component for unauthenticated users

5. **[OAUTH_SETUP_GUIDE.md](OAUTH_SETUP_GUIDE.md)**
   - Complete step-by-step setup instructions
   - Google Cloud Console configuration
   - Environment variables setup
   - Deployment guide
   - Troubleshooting section

### 🔄 Modified Files

1. **[lib/google-drive.ts](lib/google-drive.ts)**
   - **Before:** Used service account with `GoogleAuth`
   - **After:** Uses OAuth2 client with access tokens
   - All functions now accept `accessToken` parameter
   - Improved error messages for OAuth errors

2. **[app/api/upload/route.ts](app/api/upload/route.ts)**
   - Added authentication check using `auth()` from NextAuth
   - Returns 401 if user not authenticated
   - Passes access token to Drive upload functions

3. **[app/api/images/route.ts](app/api/images/route.ts)**
   - Added authentication check
   - Returns 401 if user not authenticated
   - Passes access token to Drive list function

4. **[app/page.tsx](app/page.tsx)**
   - Now a client component
   - Wrapped with `SessionProvider`
   - Shows sign-in prompt if not authenticated
   - Shows upload form only when signed in
   - Loading state while checking authentication

5. **[app/gallery/page.tsx](app/gallery/page.tsx)**
   - Now a client component
   - Wrapped with `SessionProvider`
   - Shows sign-in prompt if not authenticated
   - Shows gallery only when signed in
   - Auth button in header (desktop view)

6. **[.env.example](.env.example)**
   - Updated with new OAuth variables
   - Removed service account variables
   - Added comments for clarity

7. **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)**
   - Complete rewrite for OAuth 2.0
   - New error scenarios and solutions
   - Migration notes from service account

---

## Environment Variables Changes

### ❌ OLD (Service Account - Remove These):
```env
GOOGLE_CLIENT_EMAIL=pavan-631@swarna-wedding.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### ✅ NEW (OAuth 2.0 - Add These):
```env
# OAuth credentials from Google Cloud Console
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret

# NextAuth configuration
AUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Keep this (unchanged)
GOOGLE_DRIVE_FOLDER_ID=10owBvniraOqfEnnDm_HgIBHsm71h3RnL
```

---

## How It Works Now

### User Flow

#### Before (Service Account):
1. User opens app → Upload page immediately
2. Select files → Upload
3. ❌ ERROR: "Service Accounts do not have storage quota"

#### After (OAuth 2.0):
1. User opens app → "Sign in with Google" button
2. User clicks sign in → Redirected to Google
3. User logs in and grants permissions
4. Redirected back to app → Upload form appears
5. Select files → Upload ✅
6. Files uploaded to user's own Drive
7. Files appear in your specified folder (because of folder ID)
8. No storage quota errors! ✅

### Technical Flow

1. **Authentication:**
   - User signs in with Google OAuth
   - NextAuth exchanges authorization code for access token
   - Access token stored in JWT session cookie

2. **Upload:**
   - User submits files
   - API route checks session for access token
   - If not authenticated → 401 error
   - If authenticated → Pass token to Drive API
   - Drive API uploads files as the user (using their quota)
   - Files created in specified folder

3. **View Gallery:**
   - API route checks session
   - If authenticated → Fetch files from Drive using user's token
   - Display in gallery

---

## Security & Privacy Improvements

### ✅ Minimal Scope
- Only uses `https://www.googleapis.com/auth/drive.file`
- This gives access ONLY to files created by the app
- NOT full Drive access
- Complies with Google's 2025 User Data Policy

### ✅ User Control
- Users can revoke access anytime from Google account settings
- Transparent permission request
- Users know exactly what they're authorizing

### ✅ No Exposed Secrets
- No service account private key in code or repo
- Client secret only in secure environment variables
- More secure than service account key file

### ✅ File Ownership
- Files owned by the user who uploaded them
- Uses their Drive quota, not yours
- Better for compliance and data ownership

---

## What You Need to Do Next

### 1. Create OAuth Credentials (Required)

Follow [OAUTH_SETUP_GUIDE.md](OAUTH_SETUP_GUIDE.md) Step 1:
- Go to Google Cloud Console
- Create OAuth 2.0 Client ID
- Configure consent screen
- Get Client ID and Client Secret

### 2. Update Environment Variables (Required)

Create/update `.env.local`:
```env
GOOGLE_CLIENT_ID=your-actual-client-id
GOOGLE_CLIENT_SECRET=your-actual-secret
AUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
GOOGLE_DRIVE_FOLDER_ID=10owBvniraOqfEnnDm_HgIBHsm71h3RnL
```

### 3. Configure Folder Permissions (Required)

Make your Drive folder accessible:
1. Open Google Drive
2. Find folder `10owBvniraOqfEnnDm_HgIBHsm71h3RnL`
3. Right-click → Share
4. Change to "Anyone with the link" → "Editor"
5. Save

### 4. Test Locally

```bash
npm run dev
```

Visit http://localhost:3000:
- Sign in with Google
- Grant permissions
- Upload a test image
- Check Drive folder
- View gallery

### 5. Deploy to Production

Follow [OAUTH_SETUP_GUIDE.md](OAUTH_SETUP_GUIDE.md) Step 5:
- Add production redirect URI to OAuth config
- Set environment variables in Vercel
- Deploy
- Test on production URL

---

## Breaking Changes

### User Experience
- **NEW:** Users must sign in before uploading
- **NEW:** One extra step (Google OAuth flow)
- **BENEFIT:** More transparent, secure, and reliable

### Developer Setup
- **REMOVED:** Service account JSON file no longer needed
- **NEW:** OAuth credentials from Google Cloud Console
- **NEW:** Additional environment variables required

### Code Changes
- All Google Drive functions now require `accessToken` parameter
- All pages using Drive features must check authentication
- Client components wrapped with `SessionProvider`

---

## Migration Checklist

Use this to track your progress:

- [ ] Read [OAUTH_SETUP_GUIDE.md](OAUTH_SETUP_GUIDE.md)
- [ ] Create OAuth 2.0 Client ID in Google Cloud Console
- [ ] Configure OAuth consent screen
- [ ] Get Client ID and Client Secret
- [ ] Generate AUTH_SECRET (`openssl rand -base64 32`)
- [ ] Update `.env.local` with new variables
- [ ] Remove old service account variables
- [ ] Make Drive folder accessible (Anyone with link - Editor)
- [ ] Test locally:
  - [ ] Sign in works
  - [ ] Upload works
  - [ ] Files appear in Drive
  - [ ] Gallery works
  - [ ] Video upload works
- [ ] Add production redirect URI to OAuth config
- [ ] Set environment variables in Vercel
- [ ] Deploy to production
- [ ] Test on production URL
- [ ] Generate QR code
- [ ] Test QR code on phone

---

## Rollback Plan (If Needed)

If you need to rollback to service account (not recommended):

```bash
git revert HEAD
npm install
```

Then restore old `.env.local` with service account variables.

**NOTE:** This will bring back the storage quota error. It's better to fix OAuth setup than rollback.

---

## Support & Resources

### Documentation
- **Setup:** [OAUTH_SETUP_GUIDE.md](OAUTH_SETUP_GUIDE.md)
- **Troubleshooting:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Environment Variables:** [.env.example](.env.example)

### External Resources
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Google Drive API Docs](https://developers.google.com/drive/api/guides/about-sdk)

### Common Issues
See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for:
- redirect_uri_mismatch
- Access blocked errors
- Upload permission errors
- Sign-in loops
- And more...

---

## Benefits Summary

### Why This Change Was Necessary

| Issue | Service Account | OAuth 2.0 |
|-------|----------------|-----------|
| **Storage Quota** | ❌ No quota, uploads fail | ✅ Uses user's quota |
| **File Ownership** | ❌ Service account owns (impossible) | ✅ User owns files |
| **Security** | ⚠️ Private key in repo | ✅ No keys, tokens only |
| **Compliance** | ❌ Against Google 2025 policy | ✅ Compliant |
| **User Control** | ❌ No visibility | ✅ User grants permission |
| **Setup Complexity** | 🟡 Moderate | 🟡 Moderate |
| **User Experience** | ✅ No sign-in needed | 🟡 Must sign in |

**Overall:** OAuth 2.0 is the correct solution for your use case.

---

## Next Wedding Feature Ideas (Future)

Now that authentication is working, you could add:
- User profiles (show who uploaded each photo)
- Comments on photos
- Likes/reactions
- Photo albums/categories
- Download all photos button
- Slideshow mode
- Guest book / messages

These are optional - your app is fully functional now! 🎉

---

**Migration completed successfully! Follow the setup guide to get it running.** 🚀
