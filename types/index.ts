export interface MediaData {
  id: string;
  name: string;
  thumbnailLink: string;
  webContentLink: string;
  createdTime: string;
  mimeType: string;
  isVideo: boolean;
}

// Keep ImageData for backward compatibility
export type ImageData = MediaData;

export interface UploadResponse {
  success: boolean;
  message: string;
  filesUploaded?: number;
  photosUploaded?: number;
  videosUploaded?: number;
}

export interface MediaResponse {
  media: MediaData[];
  nextPageToken?: string;
  hasMore: boolean;
}

// Keep ImagesResponse for backward compatibility
export type ImagesResponse = MediaResponse;
