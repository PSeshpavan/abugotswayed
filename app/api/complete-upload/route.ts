import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getOAuth2Client } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId } = body;

    if (!fileId) {
      return NextResponse.json(
        { success: false, message: 'Missing file ID' },
        { status: 400 }
      );
    }

    const auth = getOAuth2Client();
    const drive = google.drive({ version: 'v3', auth });

    // Make the file publicly accessible (anyone with link can view)
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    console.log(`Set permissions for file ${fileId}`);

    return NextResponse.json({
      success: true,
      fileId,
      message: 'Upload completed successfully',
    });
  } catch (error: any) {
    console.error('Complete upload error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to complete upload' },
      { status: 500 }
    );
  }
}
