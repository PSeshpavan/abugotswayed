import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir, unlink, rmdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { uploadImageToDrive, uploadVideoToDrive } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

const UPLOAD_DIR = join(tmpdir(), 'wedding-uploads');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId, fileName, mimeType, totalChunks } = body;

    if (!fileId || !fileName || !mimeType || !totalChunks) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const fileDir = join(UPLOAD_DIR, fileId);

    // Read all chunks in order
    const chunks: Buffer[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = join(fileDir, `chunk-${i}`);
      const chunkBuffer = await readFile(chunkPath);
      chunks.push(chunkBuffer);
    }

    // Combine chunks into single buffer
    const fileBuffer = Buffer.concat(chunks);
    console.log(`Combined ${totalChunks} chunks into file of size ${fileBuffer.length} bytes`);

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);

    const isVideo = mimeType.startsWith('video/');
    const isImage = mimeType.startsWith('image/');

    let uploadedFileId: string;

    if (isVideo) {
      // Determine extension based on mime type
      let extension = 'mp4';
      if (mimeType === 'video/quicktime') extension = 'mov';
      else if (mimeType === 'video/x-m4v') extension = 'm4v';
      else if (fileName.includes('.')) {
        const fileExt = fileName.split('.').pop()?.toLowerCase();
        if (fileExt) extension = fileExt;
      }

      const finalFileName = `wedding_${timestamp}_${randomStr}.${extension}`;
      uploadedFileId = await uploadVideoToDrive(fileBuffer, finalFileName, mimeType);
    } else if (isImage) {
      // For images, optionally compress (but client already compressed)
      const finalFileName = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')
        ? `wedding_${timestamp}_${randomStr}.jpg`
        : `wedding_${timestamp}_${randomStr}.${fileName.split('.').pop()}`;

      uploadedFileId = await uploadImageToDrive(fileBuffer, finalFileName, mimeType);
    } else {
      throw new Error('Unsupported file type');
    }

    // Clean up chunks
    try {
      const files = await readdir(fileDir);
      for (const file of files) {
        await unlink(join(fileDir, file));
      }
      await rmdir(fileDir);
    } catch (cleanupError) {
      console.error('Cleanup error (non-fatal):', cleanupError);
    }

    return NextResponse.json({
      success: true,
      fileId: uploadedFileId,
      message: `Successfully uploaded ${fileName}`,
    });
  } catch (error: any) {
    console.error('Finalize upload error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to finalize upload' },
      { status: 500 }
    );
  }
}
