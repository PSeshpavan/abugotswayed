import { google } from 'googleapis';
import { Readable } from 'stream';

// Initialize Google Drive API
const getAuth = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
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

    // Upload file
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
    });

    // Make the file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return response.data.id!;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
}

export async function getImagesFromDrive(
  pageSize: number = 15,
  pageToken?: string
): Promise<{
  images: any[];
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
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
      fields: 'nextPageToken, files(id, name, thumbnailLink, webContentLink, createdTime, mimeType)',
      orderBy: 'createdTime desc',
      pageSize: pageSize,
      pageToken: pageToken,
    });

    const files = response.data.files || [];
    const hasMore = !!response.data.nextPageToken;

    return {
      images: files,
      nextPageToken: response.data.nextPageToken || undefined,
      hasMore,
    };
  } catch (error) {
    console.error('Error fetching images from Google Drive:', error);
    throw error;
  }
}

export async function getDirectImageUrl(fileId: string): Promise<string> {
  // Use Google Drive's direct thumbnail API for better performance
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
}
