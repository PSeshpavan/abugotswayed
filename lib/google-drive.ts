import { google } from 'googleapis';
import { Readable } from 'stream';

// Initialize Google Drive API
const getAuth = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
    ],
  });
  return auth;
};

const getDrive = async () => {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });
  return drive;
};

export async function uploadImageToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  try {
    const drive = await getDrive();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!folderId) {
      throw new Error('Google Drive folder ID not configured');
    }

    // Create a readable stream from buffer
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);

    // Upload file with supportsAllDrives for shared folder compatibility
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
        mimeType: mimeType,
      },
      media: {
        mimeType: mimeType,
        body: bufferStream,
      },
      fields: 'id, name, webContentLink, thumbnailLink',
      supportsAllDrives: true,
    });

    // Make the file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      supportsAllDrives: true,
    });

    return response.data.id!;
  } catch (error: any) {
    console.error('Error uploading to Google Drive:', error);

    // Provide helpful error messages
    if (error.message?.includes('storage quota') || error.code === 403) {
      throw new Error(
        'Permission denied: Make sure the Google Drive folder is shared with the service account email with "Editor" permissions. Check SETUP_GUIDE.md Step 6.'
      );
    }

    if (error.message?.includes('Invalid Credentials')) {
      throw new Error(
        'Invalid credentials: Check that GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY are correct in your .env.local file.'
      );
    }

    throw error;
  }
}

export async function uploadVideoToDrive(
  fileBuffer: Buffer,
  fileName: string
): Promise<string> {
  try {
    const drive = await getDrive();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!folderId) {
      throw new Error('Google Drive folder ID not configured');
    }

    // Create a readable stream from buffer
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);

    // Upload file with supportsAllDrives for shared folder compatibility
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
        mimeType: 'video/mp4',
      },
      media: {
        mimeType: 'video/mp4',
        body: bufferStream,
      },
      fields: 'id, name, webContentLink, thumbnailLink',
      supportsAllDrives: true,
    });

    // Make the file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      supportsAllDrives: true,
    });

    return response.data.id!;
  } catch (error: any) {
    console.error('Error uploading video to Google Drive:', error);

    // Provide helpful error messages
    if (error.message?.includes('storage quota') || error.code === 403) {
      throw new Error(
        'Permission denied: Make sure the Google Drive folder is shared with the service account email with "Editor" permissions. Check SETUP_GUIDE.md Step 6.'
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
    const drive = await getDrive();
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
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
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
  } catch (error) {
    console.error('Error fetching media from Google Drive:', error);
    throw error;
  }
}

// Keep for backward compatibility
export const getImagesFromDrive = getMediaFromDrive;

export async function getDirectImageUrl(fileId: string): Promise<string> {
  // Use Google Drive's direct thumbnail API for better performance
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
}
