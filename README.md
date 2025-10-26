# Wedding Photo Sharing App

A beautiful, high-performance photo sharing platform for wedding celebrations. Built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Easy Upload**: Simple drag-and-drop interface for uploading photos
- **Real-time Gallery**: View photos uploaded by all guests with automatic updates every 10 seconds
- **Infinite Scroll**: Smooth infinite scrolling with lazy loading (15 images at a time)
- **Optimized Performance**:
  - Automatic image compression and optimization
  - Progressive image loading
  - Next.js Image optimization
  - Minimal JavaScript bundle
- **Mobile-Responsive**: Beautiful pastel design that works on all devices
- **QR Code Access**: Generate QR codes for easy guest access
- **Google Drive Storage**: All photos securely stored in Google Drive

## Quick Start

### 1. Setup Google Drive API

Follow the detailed instructions in [SETUP_GUIDE.md](./SETUP_GUIDE.md) to:
- Create a Google Cloud project
- Enable Google Drive API
- Create a service account
- Get your credentials

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in your Google Drive credentials in `.env.local`:

```env
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=your-folder-id
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Generate QR Code

After deployment, generate a QR code for easy sharing:

```bash
npm run generate-qr https://your-vercel-url.vercel.app
```

The QR code will be saved to `public/qr-code.png` - print it and place it at your wedding venue!

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Storage**: Google Drive API
- **Image Processing**: Sharp
- **QR Code**: qrcode
- **Hosting**: Vercel

## Project Structure

```
swarna-wedding/
├── app/
│   ├── page.tsx              # Upload page
│   ├── gallery/page.tsx      # Gallery page
│   ├── api/
│   │   ├── upload/route.ts   # Upload API endpoint
│   │   └── images/route.ts   # Fetch images API endpoint
│   └── layout.tsx
├── components/
│   ├── upload-form.tsx       # Upload form component
│   ├── image-gallery.tsx     # Gallery component with infinite scroll
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── google-drive.ts       # Google Drive API integration
│   └── utils.ts              # Utility functions
├── types/
│   └── index.ts              # TypeScript type definitions
└── scripts/
    └── generate-qr.ts        # QR code generator script

## Performance Optimizations

- **Image Compression**: All uploaded images are automatically compressed to 85% quality and resized to max 2000px
- **Lazy Loading**: Images load progressively as you scroll
- **Thumbnail API**: Uses Google Drive's thumbnail API for optimized image delivery
- **Infinite Scroll**: Loads 15 images at a time to prevent overwhelming the browser
- **Real-time Polling**: Efficient polling mechanism (10s interval) for new images
- **Next.js Optimization**: Leverages Next.js Image component for automatic optimization
- **Edge Caching**: Static assets cached on Vercel's edge network

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Private project for personal use.

---

Made with ❤️ for Swarna's Wedding
