import { google } from 'googleapis';
import { getOAuth2Client } from './auth';
import { Readable } from 'stream';

// Initialize Google Drive API with OAuth2 client
const getDrive = () => {
  const auth = getOAuth2Client();
  const drive = google.drive({ version: 'v3', auth });
  return drive;
};

type UploadBody = Buffer | NodeJS.ReadableStream;

const toReadable = (body: UploadBody) => {
  if (Buffer.isBuffer(body)) {
    const bufferStream = new Readable();
    bufferStream.push(body);
    bufferStream.push(null);
    return bufferStream;
  }
  return body;
};

export async function uploadImageToDrive(
  fileBody: UploadBody,
  fileName: string,
  mimeType: string,
  fileSize?: number
): Promise<string> {
  try {
    const drive = getDrive();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!folderId) {
      throw new Error('Google Drive folder ID not configured');
    }

    // Upload file to YOUR Drive (in the specified folder)
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
        mimeType: mimeType,
      },
      media: {
        mimeType: mimeType,
        body: toReadable(fileBody),
      },
      fields: 'id, name, webContentLink, thumbnailLink',
      uploadType: 'resumable',
    });

    // Make the file publicly accessible (anyone with link can view)
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return response.data.id!;
  } catch (error: any) {
    console.error('Error uploading to Google Drive:', error);

    // Provide helpful error messages
    if (error.code === 401) {
      throw new Error(
        'Authentication failed: Please verify your OAuth credentials and refresh token.'
      );
    }

    if (error.code === 403) {
      throw new Error(
        'Permission denied: Make sure your Google Drive folder exists and is accessible with your account.'
      );
    }

    if (error.code === 404) {
      throw new Error(
        'Folder not found: Please check the GOOGLE_DRIVE_FOLDER_ID in your environment variables.'
      );
    }

    throw error;
  }
}

export async function uploadVideoToDrive(
  fileBody: UploadBody,
  fileName: string,
  mimeType: string = 'video/mp4',
  fileSize?: number
): Promise<string> {
  try {
    const drive = getDrive();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!folderId) {
      throw new Error('Google Drive folder ID not configured');
    }

    // Upload video to YOUR Drive (in the specified folder)
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
        mimeType,
      },
      media: {
        mimeType,
        body: toReadable(fileBody),
      },
      fields: 'id, name, webContentLink, thumbnailLink',
      uploadType: 'resumable',
    });

    // Make the file publicly accessible (anyone with link can view)
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return response.data.id!;
  } catch (error: any) {
    console.error('Error uploading video to Google Drive:', error);

    if (error.code === 401) {
      throw new Error(
        'Authentication failed: Please verify your OAuth credentials and refresh token.'
      );
    }

    if (error.code === 403) {
      throw new Error(
        'Permission denied: Make sure your Google Drive folder exists and is accessible with your account.'
      );
    }

    throw error;
  }
}

export async function getMediaFromDrive(
  pageSize: number = 15,
  pageToken?: string
): Promise<{
  media: any[];
  nextPageToken?: string;
  hasMore: boolean;
}> {
  try {
    const drive = getDrive();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!folderId) {
      throw new Error('Google Drive folder ID not configured');
    }

    const response = await drive.files.list({
      q: `'${folderId}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed=false`,
      fields: 'nextPageToken, files(id, name, thumbnailLink, webContentLink, createdTime, mimeType)',
      orderBy: 'createdTime desc',
      pageSize: pageSize,
      pageToken: pageToken,
    });

    const files = (response.data.files || []).map((file) => ({
      ...file,
      isVideo: file.mimeType?.startsWith('video/') || false,
    }));
    const hasMore = !!response.data.nextPageToken;

    return {
      media: files,
      nextPageToken: response.data.nextPageToken || undefined,
      hasMore,
    };
  } catch (error: any) {
    console.error('Error fetching media from Google Drive:', error);

    if (error.code === 401) {
      throw new Error('Authentication failed: Please verify your OAuth credentials and refresh token.');
    }

    throw error;
  }
}

// Keep for backward compatibility
export const getImagesFromDrive = getMediaFromDrive;

export async function getDirectImageUrl(fileId: string): Promise<string> {
  // Use Google Drive's direct thumbnail API for better performance
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
}
