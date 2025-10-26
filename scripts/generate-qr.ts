import QRCode from 'qrcode';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function generateQRCode() {
  // Get URL from command line or use default
  const url = process.argv[2] || 'http://localhost:3000';

  console.log(`Generating QR code for: ${url}`);

  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: 800,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    // Convert data URL to buffer
    const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Save to public folder
    const outputPath = join(process.cwd(), 'public', 'qr-code.png');
    writeFileSync(outputPath, buffer);

    console.log(`✅ QR code generated successfully!`);
    console.log(`📍 Location: ${outputPath}`);
    console.log(`🔗 URL: ${url}`);
    console.log(`\nYou can now print the QR code from public/qr-code.png`);
  } catch (error) {
    console.error('Error generating QR code:', error);
    process.exit(1);
  }
}

generateQRCode();
