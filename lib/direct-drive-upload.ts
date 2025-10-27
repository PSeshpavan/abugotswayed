/**
 * Direct client-to-Google Drive upload
 * Bypasses server completely for large files
 */

const CHUNK_SIZE = 256 * 1024; // 256KB chunks for resumable upload

export interface DirectUploadProgress {
  fileName: string;
  progress: number;
  bytesUploaded: number;
  totalBytes: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

/**
 * Upload file directly to Google Drive using resumable upload
 */
export async function uploadDirectlyToDrive(
  file: File,
  onProgress?: (progress: DirectUploadProgress) => void
): Promise<{ success: boolean; fileId?: string; error?: string }> {
  try {
    // Step 1: Get upload credentials from our server
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);

    let extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const fileName = `wedding_${timestamp}_${randomStr}.${extension}`;

    const credentialsResponse = await fetch('/api/start-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName,
        mimeType: file.type,
        fileSize: file.size,
      }),
    });

    if (!credentialsResponse.ok) {
      throw new Error('Failed to get upload credentials');
    }

    const { accessToken, folderId } = await credentialsResponse.json();

    // Step 2: Create resumable upload session with Google Drive
    const metadata = {
      name: fileName,
      mimeType: file.type,
      parents: [folderId],
    };

    const initResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      }
    );

    if (!initResponse.ok) {
      throw new Error('Failed to initialize upload session');
    }

    const uploadUrl = initResponse.headers.get('Location');
    if (!uploadUrl) {
      throw new Error('No upload URL received');
    }

    // Step 3: Upload file in chunks
    let uploadedBytes = 0;

    while (uploadedBytes < file.size) {
      const chunk = file.slice(uploadedBytes, uploadedBytes + CHUNK_SIZE);
      const chunkSize = chunk.size;

      const chunkResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Length': chunkSize.toString(),
          'Content-Range': `bytes ${uploadedBytes}-${uploadedBytes + chunkSize - 1}/${file.size}`,
        },
        body: chunk,
      });

      if (!chunkResponse.ok && chunkResponse.status !== 308) {
        // 308 = Resume Incomplete (expected during chunked upload)
        throw new Error(`Upload failed: ${chunkResponse.statusText}`);
      }

      uploadedBytes += chunkSize;
      const progress = Math.round((uploadedBytes / file.size) * 90); // Save 10% for finalization

      if (onProgress) {
        onProgress({
          fileName: file.name,
          progress,
          bytesUploaded: uploadedBytes,
          totalBytes: file.size,
          status: 'uploading',
        });
      }

      // If we got a 200/201, upload is complete
      if (chunkResponse.status === 200 || chunkResponse.status === 201) {
        const result = await chunkResponse.json();
        const fileId = result.id;

        // Step 4: Set permissions
        if (onProgress) {
          onProgress({
            fileName: file.name,
            progress: 95,
            bytesUploaded: file.size,
            totalBytes: file.size,
            status: 'uploading',
          });
        }

        await fetch('/api/complete-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileId }),
        });

        if (onProgress) {
          onProgress({
            fileName: file.name,
            progress: 100,
            bytesUploaded: file.size,
            totalBytes: file.size,
            status: 'completed',
          });
        }

        return { success: true, fileId };
      }
    }

    throw new Error('Upload completed but no file ID received');
  } catch (error: any) {
    console.error('Direct upload error:', error);

    if (onProgress) {
      onProgress({
        fileName: file.name,
        progress: 0,
        bytesUploaded: 0,
        totalBytes: file.size,
        status: 'error',
        error: error.message,
      });
    }

    return { success: false, error: error.message };
  }
}
