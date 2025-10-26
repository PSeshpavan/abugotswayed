# Wedding Photo App - Setup Guide

## Google Cloud Console Setup

Follow these steps to set up Google Drive API integration:

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Name your project (e.g., "Wedding Photos")
5. Click "Create"

### Step 2: Enable Google Drive API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google Drive API"
3. Click on it and press "Enable"

### Step 3: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Enter a name (e.g., "wedding-photo-uploader")
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

### Step 4: Generate Service Account Key

1. In the Credentials page, find your newly created service account
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" > "Create new key"
5. Select "JSON" format
6. Click "Create" - a JSON file will be downloaded

### Step 5: Get Your Google Drive Folder ID

1. Open Google Drive in your browser
2. Create a new folder for wedding photos (or use your existing folder)
3. Open the folder
4. Look at the URL in your browser. It will look like:
   ```
   https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz
   ```
5. Copy the part after `/folders/` - this is your FOLDER_ID

### Step 6: Share Folder with Service Account

1. Right-click on your Google Drive folder
2. Click "Share"
3. Paste the service account email (from the JSON file, it looks like: `xxx@xxx.iam.gserviceaccount.com`)
4. Give it "Editor" permissions
5. Click "Share"

### Step 7: Configure Environment Variables

1. Open the downloaded JSON file from Step 4
2. Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Fill in the values in `.env.local`:
   - `GOOGLE_CLIENT_EMAIL`: Copy the `client_email` from JSON file
   - `GOOGLE_PRIVATE_KEY`: Copy the entire `private_key` from JSON file (including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts)
   - `GOOGLE_DRIVE_FOLDER_ID`: The folder ID you copied in Step 5

**Important**: Make sure the private key is wrapped in double quotes and includes the `\n` newline characters as they appear in the JSON file.

Example `.env.local`:
```env
GOOGLE_CLIENT_EMAIL=wedding-photos@my-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhk...(rest of key)...==\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz
```

### Step 8: Test the Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)
4. Try uploading a test image

## Deployment to Vercel

1. Push your code to GitHub (make sure `.env.local` is in `.gitignore`!)

2. Go to [Vercel](https://vercel.com)

3. Click "New Project" and import your GitHub repository

4. In the "Environment Variables" section, add:
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_DRIVE_FOLDER_ID`

5. Click "Deploy"

6. Once deployed, copy your Vercel URL (e.g., `https://swarna-wedding.vercel.app`)

## Generate QR Code

After deploying, run this command to generate a QR code:

```bash
npm run generate-qr
```

This will create a QR code image in the `public` folder that you can print and share!

## Troubleshooting

### "Failed to upload images"
- Check that your service account email has Editor access to the Google Drive folder
- Verify all environment variables are set correctly
- Check the private key includes `\n` characters and is wrapped in quotes

### "Permission denied"
- Make sure you shared the Google Drive folder with the service account email
- Verify the folder ID is correct

### Images not appearing in gallery
- Check that files are actually being uploaded to the Google Drive folder
- Verify the folder permissions are set to "Anyone with the link can view"
- Clear your browser cache and refresh

## Performance Tips

- The app is optimized to load 15 images at a time
- Images are automatically compressed before upload
- New photos appear automatically every 10 seconds
- Uses Next.js Image optimization for fast loading

Enjoy capturing beautiful wedding memories! 💒✨
