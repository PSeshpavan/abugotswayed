import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToDrive } from '@/lib/google-drive';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No files provided' },
        { status: 400 }
      );
    }

    // Process and upload files
    const uploadPromises = files.map(async (file) => {
      try {
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Optimize image using sharp
        const optimizedBuffer = await sharp(buffer)
          .resize(2000, 2000, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const fileName = `wedding_${timestamp}_${randomStr}.jpg`;

        // Upload to Google Drive
        await uploadImageToDrive(optimizedBuffer, fileName, 'image/jpeg');

        return { success: true };
      } catch (error) {
        console.error('Error processing file:', error);
        return { success: false };
      }
    });

    const results = await Promise.all(uploadPromises);
    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${successCount} out of ${files.length} images`,
      filesUploaded: successCount,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Upload failed' },
      { status: 500 }
    );
  }
}
