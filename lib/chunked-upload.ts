/**
 * Chunked file upload utility
 * Splits large files into 4MB chunks and uploads them sequentially
 */

const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks (well under Vercel's 4.5MB limit)

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  bytesUploaded: number;
  totalBytes: number;
  status: 'uploading' | 'finalizing' | 'completed' | 'error';
  error?: string;
}

export interface ChunkedUploadOptions {
  file: File;
  onProgress?: (progress: UploadProgress) => void;
}

/**
 * Upload a file in chunks
 */
export async function uploadFileInChunks({
  file,
  onProgress,
}: ChunkedUploadOptions): Promise<{ success: boolean; fileId?: string; error?: string }> {
  const fileId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  try {
    // Upload each chunk
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('fileId', fileId);
      formData.append('fileName', file.name);

      const response = await fetch('/api/upload-chunk', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to upload chunk ${chunkIndex + 1}`);
      }

      // Update progress
      const bytesUploaded = end;
      const progress = Math.round((bytesUploaded / file.size) * 90); // Save 10% for finalization

      if (onProgress) {
        onProgress({
          fileId,
          fileName: file.name,
          progress,
          bytesUploaded,
          totalBytes: file.size,
          status: 'uploading',
        });
      }
    }

    // Finalize upload
    if (onProgress) {
      onProgress({
        fileId,
        fileName: file.name,
        progress: 90,
        bytesUploaded: file.size,
        totalBytes: file.size,
        status: 'finalizing',
      });
    }

    const finalizeResponse = await fetch('/api/finalize-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileId,
        fileName: file.name,
        mimeType: file.type,
        totalChunks,
      }),
    });

    if (!finalizeResponse.ok) {
      const error = await finalizeResponse.json();
      throw new Error(error.message || 'Failed to finalize upload');
    }

    const result = await finalizeResponse.json();

    // Complete
    if (onProgress) {
      onProgress({
        fileId,
        fileName: file.name,
        progress: 100,
        bytesUploaded: file.size,
        totalBytes: file.size,
        status: 'completed',
      });
    }

    return { success: true, fileId: result.fileId };
  } catch (error: any) {
    console.error('Chunked upload error:', error);

    if (onProgress) {
      onProgress({
        fileId,
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

/**
 * Upload multiple files in chunks with combined progress
 */
export async function uploadFilesInChunks(
  files: File[],
  onProgress?: (currentFile: number, totalFiles: number, fileProgress: UploadProgress) => void
): Promise<{ success: boolean; uploadedCount: number; failedCount: number }> {
  let uploadedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const result = await uploadFileInChunks({
      file,
      onProgress: (progress) => {
        if (onProgress) {
          onProgress(i + 1, files.length, progress);
        }
      },
    });

    if (result.success) {
      uploadedCount++;
    } else {
      failedCount++;
    }
  }

  return {
    success: uploadedCount > 0,
    uploadedCount,
    failedCount,
  };
}
