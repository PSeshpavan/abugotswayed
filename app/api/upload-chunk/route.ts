import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const UPLOAD_DIR = join(tmpdir(), 'wedding-uploads');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const chunk = formData.get('chunk') as Blob;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string);
    const totalChunks = parseInt(formData.get('totalChunks') as string);
    const fileId = formData.get('fileId') as string;
    const fileName = formData.get('fileName') as string;

    if (!chunk || chunkIndex === undefined || !totalChunks || !fileId) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Create file-specific directory
    const fileDir = join(UPLOAD_DIR, fileId);
    if (!existsSync(fileDir)) {
      await mkdir(fileDir, { recursive: true });
    }

    // Save chunk to temporary file
    const chunkPath = join(fileDir, `chunk-${chunkIndex}`);
    const buffer = Buffer.from(await chunk.arrayBuffer());
    await writeFile(chunkPath, buffer);

    console.log(`Saved chunk ${chunkIndex + 1}/${totalChunks} for file ${fileName}`);

    return NextResponse.json({
      success: true,
      chunkIndex,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded successfully`,
    });
  } catch (error: any) {
    console.error('Chunk upload error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to upload chunk' },
      { status: 500 }
    );
  }
}
