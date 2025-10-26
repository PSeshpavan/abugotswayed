# Wedding Photo Sharing App

A beautiful, high-performance photo sharing platform for wedding celebrations. Built with Next.js 15, TypeScript, and Tailwind CSS.

## How It Works

- **Guests:** No sign-in required - scan QR code and upload immediately! 📱
- **Storage:** All photos/videos go to YOUR Google Drive (centralized)
- **Gallery:** Real-time updates every 10 seconds with infinite scroll
- **Performance:** Optimized for speed with minimal bundle size

---

## Quick Setup

**🚀 Complete setup in 20 minutes:** [SETUP_GUIDE_PERSONAL_OAUTH.md](SETUP_GUIDE_PERSONAL_OAUTH.md)

1. Create OAuth 2.0 credentials in Google Cloud Console
2. Run `npm run setup-oauth` to get your refresh token
3. Add credentials to `.env.local`
4. Start uploading!

---

## Features

### For Guests
- ✅ **No sign-in required** - instant access via QR code
- 📸 **Photo upload** - drag & drop or click to select
- 🎥 **Video upload** - MP4 format, up to 100MB
- 🖼️ **Live gallery** - see everyone's photos in real-time
- 📱 **Fully responsive** - works perfectly on all devices

### For You (Wedding Organizer)
- 💾 **Centralized storage** - all photos in YOUR Google Drive folder
- 🔒 **Full control** - you own all the uploaded media
- 📊 **Your quota** - uses your 15GB free Google storage
- 🎨 **Customizable** - easy to modify colors and branding
- 🚀 **Fast deployment** - deploy to Vercel in minutes

### Technical Features
- **Automatic image optimization** - resized to 2000x2000px, 85% quality JPEG
- **Progressive loading** - images load gradually for better UX
- **Video support** - native HTML5 player with modal playback
- **Infinite scroll** - loads 15 items at a time
- **Real-time polling** - gallery updates every 10 seconds
- **QR code generation** - built-in script to create access codes

---

## Prerequisites

- Node.js 18+ installed
- Google account (free Gmail works!)
- Google Drive folder for storing photos
- Google Cloud project (free tier)

---

## Installation

### 1. Clone and Install

```bash
git clone https://github.com/your-username/swarna-wedding.git
cd swarna-wedding
npm install
```

### 2. Create OAuth Credentials

See [SETUP_GUIDE_PERSONAL_OAUTH.md](SETUP_GUIDE_PERSONAL_OAUTH.md) for detailed instructions.

**Quick summary:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add redirect URI: `http://localhost:3001/oauth/callback`
4. Save Client ID and Client Secret

### 3. Get Refresh Token

Run the setup script:

```bash
npm run setup-oauth
```

This will:
- Open your browser for Google OAuth
- Ask you to sign in and grant permissions
- Generate a refresh token
- Display it in the terminal

### 4. Configure Environment

Create `.env.local`:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
GOOGLE_REFRESH_TOKEN=1//0gABCDEF...
GOOGLE_DRIVE_FOLDER_ID=your-folder-id-here
```

### 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 and test uploading!

---

## Usage

### Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Deployment

```bash
npm run setup-oauth  # Get OAuth refresh token (one-time)
npm run generate-qr  # Generate QR code for guests
```

### Testing

1. Visit http://localhost:3000
2. Upload a test photo (no sign-in required!)
3. Check your Google Drive folder - photo should be there
4. Visit http://localhost:3000/gallery - photo should appear

---

## Project Structure

```
swarna-wedding/
├── app/                      # Next.js 15 App Router
│   ├── page.tsx             # Upload page (home)
│   ├── gallery/             # Gallery page
│   ├── qr/                  # QR code display
│   └── api/                 # API routes
│       ├── upload/          # Upload endpoint
│       └── images/          # Fetch media endpoint
├── components/              # React components
│   ├── upload-form.tsx      # File upload UI
│   ├── image-gallery.tsx    # Gallery grid
│   ├── video-modal.tsx      # Video player
│   └── ui/                  # shadcn components
├── lib/                     # Utilities
│   ├── auth.ts              # OAuth helper
│   └── google-drive.ts      # Drive API functions
├── scripts/                 # Utility scripts
│   ├── setup-oauth.ts       # OAuth token generator
│   └── generate-qr.ts       # QR code generator
└── types/                   # TypeScript types
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_CLIENT_ID` | OAuth Client ID from Google Cloud Console | Yes |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret | Yes |
| `GOOGLE_REFRESH_TOKEN` | Refresh token from `npm run setup-oauth` | Yes |
| `GOOGLE_DRIVE_FOLDER_ID` | Google Drive folder ID for uploads | Yes |

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import your repository
3. Don't deploy yet!

### 3. Add Environment Variables

In Vercel project settings → Environment Variables, add:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_DRIVE_FOLDER_ID`

### 4. Update OAuth Redirect URI

Go to Google Cloud Console → Credentials:
- Add: `https://your-app.vercel.app/oauth/callback`
- Save

### 5. Deploy

Click "Deploy" in Vercel. Done!

### 6. Generate QR Code

```bash
npm run generate-qr https://your-app.vercel.app
```

Print the generated `wedding-qr-code.png` for your wedding!

---

## How Guests Use It

1. **Scan QR code** at wedding venue
2. **Upload form appears** immediately (no sign-in!)
3. **Select photos/videos** from their phone
4. **Click upload** - done!
5. **View gallery** to see all photos

**That's it!** No accounts, no friction, just pure simplicity.

---

## Technical Details

### Authentication Flow
- You run `npm run setup-oauth` once
- You sign in with YOUR Google account
- Script saves your refresh token
- Backend uses your token to upload files
- Guests never see auth - they just upload

### File Processing
- **Images:** Resized to max 2000x2000px, converted to JPEG 85% quality
- **Videos:** Uploaded as-is (MP4 only, max 100MB)
- **Naming:** `wedding_timestamp_randomstr.jpg/mp4`
- **Permissions:** Set to public (anyone with link can view)

### Storage
- All files go to your specified Google Drive folder
- Uses your 15GB free storage (or paid plan if you have one)
- You can browse/download files anytime from Drive

### Security
- Refresh token stored in environment variables only
- Never exposed to clients
- OAuth scopes: `drive` and `drive.file`
- Files made public for easy viewing in gallery

---

## Troubleshooting

See [SETUP_GUIDE_PERSONAL_OAUTH.md](SETUP_GUIDE_PERSONAL_OAUTH.md) for complete troubleshooting guide.

**Common issues:**

**Upload fails:**
- Check refresh token is correct in `.env.local`
- Verify folder ID is correct
- Make sure folder exists in your Drive

**"redirect_uri_mismatch" during setup:**
- Add `http://localhost:3001/oauth/callback` to Google Cloud Console
- Make sure there are no typos or trailing slashes

**"No refresh token received":**
- Revoke app access at https://myaccount.google.com/permissions
- Run `npm run setup-oauth` again

---

## Customization

### Change Colors

Edit `app/globals.css`:

```css
:root {
  --primary: 350 100% 88%;  /* Pastel pink */
  --secondary: 210 100% 88%; /* Pastel blue */
}
```

### Change Upload Limit

Edit `app/api/upload/route.ts`:

```typescript
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // Change to desired size
```

### Change Gallery Items Per Page

Edit `components/image-gallery.tsx`:

```typescript
const pageSize = 15; // Change to desired number
```

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Image Processing:** Sharp
- **Storage:** Google Drive API
- **Auth:** Google OAuth 2.0
- **Deployment:** Vercel
- **QR Codes:** qrcode package

---

## License

MIT

---

## Support

For setup help, see [SETUP_GUIDE_PERSONAL_OAUTH.md](SETUP_GUIDE_PERSONAL_OAUTH.md)

For issues, check the troubleshooting section in the setup guide.

---

## Credits

Built for Swarna's wedding with love ❤️

---

**Happy wedding! May your drive be full of beautiful memories!** 🎊📸
