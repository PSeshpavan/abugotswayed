import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, mimeType, fileSize } = body;

    if (!fileName || !mimeType || !fileSize) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const auth = getOAuth2Client();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!folderId) {
      throw new Error('Google Drive folder ID not configured');
    }

    // Get access token for client-side upload
    const accessToken = await auth.getAccessToken();

    if (!accessToken.token) {
      throw new Error('Failed to get access token');
    }

    console.log(`Providing upload credentials for ${fileName} (${fileSize} bytes)`);

    return NextResponse.json({
      success: true,
      accessToken: accessToken.token,
      folderId,
      fileName,
      mimeType,
      message: 'Upload session created',
    });
  } catch (error: any) {
    console.error('Start upload error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to start upload' },
      { status: 500 }
    );
  }
}
