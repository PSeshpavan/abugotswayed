import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToDrive, uploadVideoToDrive } from '@/lib/google-drive';
import sharp from 'sharp';
import { Readable } from 'stream';

const fileToNodeStream = (file: File) =>
  Readable.fromWeb(file.stream() as any);

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_VIDEO_SIZE = 250 * 1024 * 1024; // 250MB in bytes

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

    let photosUploaded = 0;
    let videosUploaded = 0;

    // Process and upload files
    const uploadPromises = files.map(async (file) => {
      try {
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        // Validate file type
        if (!isImage && !isVideo) {
          console.error('Unsupported file type:', file.type);
          return { success: false, type: 'unknown' };
        }

        // Validate video format (MP4 only)
        if (isVideo && file.type !== 'video/mp4') {
          console.error('Only MP4 videos are supported:', file.type);
          return { success: false, type: 'video' };
        }

        // Validate video size (250MB limit)
        if (isVideo && file.size > MAX_VIDEO_SIZE) {
          console.error('Video too large:', file.size, 'bytes');
          return { success: false, type: 'video' };
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);

        if (isVideo) {
          // Upload video directly (no processing for performance)
          const fileName = `wedding_${timestamp}_${randomStr}.mp4`;
          const videoStream = fileToNodeStream(file);
          await uploadVideoToDrive(videoStream, fileName, file.type, file.size);
          return { success: true, type: 'video' };
        } else {
          // Optimize image using sharp
          const fileStream = fileToNodeStream(file);
          const optimizedStream = fileStream.pipe(
            sharp()
              .resize(2000, 2000, {
                fit: 'inside',
                withoutEnlargement: true,
              })
              .jpeg({ quality: 85, progressive: true })
          );

          const fileName = `wedding_${timestamp}_${randomStr}.jpg`;
          await uploadImageToDrive(optimizedStream, fileName, 'image/jpeg');
          return { success: true, type: 'image' };
        }
      } catch (error) {
        console.error('Error processing file:', error);
        return { success: false, type: 'unknown' };
      }
    });

    const results = await Promise.all(uploadPromises);
    const successCount = results.filter((r) => r.success).length;
    photosUploaded = results.filter((r) => r.success && r.type === 'image').length;
    videosUploaded = results.filter((r) => r.success && r.type === 'video').length;

    let message = '';
    if (photosUploaded > 0 && videosUploaded > 0) {
      message = `Successfully uploaded ${photosUploaded} photo${photosUploaded > 1 ? 's' : ''} and ${videosUploaded} video${videosUploaded > 1 ? 's' : ''}`;
    } else if (photosUploaded > 0) {
      message = `Successfully uploaded ${photosUploaded} photo${photosUploaded > 1 ? 's' : ''}`;
    } else if (videosUploaded > 0) {
      message = `Successfully uploaded ${videosUploaded} video${videosUploaded > 1 ? 's' : ''}`;
    } else {
      message = 'No files were uploaded';
    }

    return NextResponse.json({
      success: successCount > 0,
      message,
      filesUploaded: successCount,
      photosUploaded,
      videosUploaded,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Upload failed' },
      { status: 500 }
    );
  }
}
