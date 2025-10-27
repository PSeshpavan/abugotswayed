/**
 * Client-side image compression utility
 * Compresses images in the browser before upload to reduce file size and upload time
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

/**
 * Compress an image file using Canvas API
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 2000,
    maxHeight = 2000,
    quality = 0.85,
    mimeType = 'image/jpeg',
  } = options;

  // Don't compress videos
  if (file.type.startsWith('video/')) {
    return file;
  }

  // Don't compress if file is already small (< 500KB)
  if (file.size < 500 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw image with high quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // If compressed file is larger, use original
            if (blob.size >= file.size) {
              resolve(file);
              return;
            }

            // Create new file from blob
            const compressedFile = new File([blob], file.name, {
              type: mimeType,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress multiple images with progress callback
 * @param files - Array of files to compress
 * @param onProgress - Callback for progress updates
 * @returns Array of compressed files
 */
export async function compressImages(
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<File[]> {
  const compressed: File[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (onProgress) {
      onProgress(i + 1, files.length);
    }

    try {
      const compressedFile = await compressImage(file);
      compressed.push(compressedFile);
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error);
      // Use original file if compression fails
      compressed.push(file);
    }
  }

  return compressed;
}
