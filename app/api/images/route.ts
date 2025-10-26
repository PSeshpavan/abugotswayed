import { NextRequest, NextResponse } from 'next/server';
import { getImagesFromDrive } from '@/lib/google-drive';
import type { ImagesResponse } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageToken = searchParams.get('pageToken') || undefined;
    const pageSize = parseInt(searchParams.get('pageSize') || '15');

    const result = await getImagesFromDrive(pageSize, pageToken);

    const response: ImagesResponse = {
      images: result.images,
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
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { images: [], hasMore: false, error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}
