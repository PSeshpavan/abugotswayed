import { NextRequest, NextResponse } from 'next/server';
import { getMediaFromDrive } from '@/lib/google-drive';
import type { MediaResponse } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageToken = searchParams.get('pageToken') || undefined;
    const pageSize = parseInt(searchParams.get('pageSize') || '15');

    const result = await getMediaFromDrive(pageSize, pageToken);

    const response: MediaResponse = {
      media: result.media,
      nextPageToken: result.nextPageToken,
      hasMore: result.hasMore,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { media: [], hasMore: false, error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}
