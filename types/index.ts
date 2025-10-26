export interface ImageData {
  id: string;
  name: string;
  thumbnailLink: string;
  webContentLink: string;
  createdTime: string;
  mimeType: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  filesUploaded?: number;
}

export interface ImagesResponse {
  images: ImageData[];
  nextPageToken?: string;
  hasMore: boolean;
}
