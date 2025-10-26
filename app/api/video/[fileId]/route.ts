import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getOAuth2Client } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated Drive client
    const auth = getOAuth2Client();
    const drive = google.drive({ version: 'v3', auth });

    // Get file metadata to check if it exists and get mime type
    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType, size',
    });

    if (!fileMetadata.data.mimeType?.startsWith('video/')) {
      return NextResponse.json(
        { error: 'File is not a video' },
        { status: 400 }
      );
    }

    // Get the video file
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: 'media',
      },
      {
        responseType: 'stream',
      }
    );

    // Create a readable stream from the response
    const stream = response.data as any;

    // Return the video stream with proper headers
    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': fileMetadata.data.mimeType,
        'Content-Length': fileMetadata.data.size?.toString() || '',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error: any) {
    console.error('Error streaming video:', error);

    if (error.code === 404) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to stream video' },
      { status: 500 }
    );
  }
}
