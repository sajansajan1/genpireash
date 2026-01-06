/**
 * Database types for images_uploads table
 */

export type ImageUploadType = 'original' | 'edited' | 'annotated' | 'revision';
export type ImageViewType = 'front' | 'back' | 'side' | 'top' | 'bottom';

export interface ImageUpload {
  id: string;
  product_idea_id: string;
  user_id: string;
  image_url: string;
  thumbnail_url?: string | null;
  upload_type: ImageUploadType;
  view_type: ImageViewType;
  file_name?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  width?: number | null;
  height?: number | null;
  metadata?: Record<string, any> | null;
  created_at: string;
  updated_at?: string | null;
}

export interface CreateImageUploadInput {
  product_idea_id: string;
  user_id: string;
  image_url: string;
  thumbnail_url?: string;
  upload_type: ImageUploadType;
  view_type: ImageViewType;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  metadata?: Record<string, any>;
}

export interface UpdateImageUploadInput {
  thumbnail_url?: string;
  file_size?: number;
  width?: number;
  height?: number;
  metadata?: Record<string, any>;
}
