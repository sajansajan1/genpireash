/**
 * Centralized Image URL Management System
 *
 * Standardizes all image URLs to follow the Genpire convention:
 * https://auth.genpire.com/storage/v1/object/public/fileuploads/uploads/{projectId}/{uuid}.{extension}
 */

import { v4 as uuidv4 } from 'uuid';

// Constants
const GENPIRE_BASE_URL = 'https://auth.genpire.com';
const STORAGE_PATH = '/storage/v1/object/public/fileuploads';
const UPLOADS_PREFIX = 'uploads';
const DEFAULT_EXTENSION = 'png';
const DEFAULT_CONTENT_TYPE = 'image/png';

// Placeholder image for errors/loading
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2U1ZTdlYiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+CiAgICBMb2FkaW5nLi4uCiAgPC90ZXh0Pgo8L3N2Zz4=';

export type ViewType = 'front' | 'back' | 'side';

/**
 * Generate a unique filename using UUID
 */
export function generateUniqueFilename(extension: string = DEFAULT_EXTENSION): string {
  const uuid = uuidv4();
  return `${uuid}.${extension}`;
}

/**
 * Generate the storage path for an image
 */
export function generateImagePath(projectId: string, viewType?: ViewType): string {
  const filename = generateUniqueFilename();
  return `${UPLOADS_PREFIX}/${projectId}/${filename}`;
}

/**
 * Build the full Genpire URL from a storage path
 */
export function buildGenpireUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Check if path already starts with 'fileuploads/' to avoid duplication
  if (cleanPath.startsWith('fileuploads/')) {
    // Path already contains bucket name, use different URL structure
    return `${GENPIRE_BASE_URL}/storage/v1/object/${cleanPath}`;
  }

  return `${GENPIRE_BASE_URL}${STORAGE_PATH}/${cleanPath}`;
}

/**
 * Build full URL from projectId and filename
 */
export function buildGenpireUrlFromParts(projectId: string, filename: string): string {
  const path = `${UPLOADS_PREFIX}/${projectId}/${filename}`;
  return buildGenpireUrl(path);
}

/**
 * Check if a URL is a valid Genpire storage URL
 */
export function isValidGenpireUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  // Check if it's a Genpire URL
  if (!url.startsWith(GENPIRE_BASE_URL)) return false;

  // Check if it follows the storage path pattern
  const pattern = new RegExp(
    `^${GENPIRE_BASE_URL}${STORAGE_PATH}/${UPLOADS_PREFIX}/[^/]+/[a-f0-9-]+\\.\\w+$`
  );

  return pattern.test(url);
}

/**
 * Extract projectId from a Genpire URL
 */
export function extractProjectIdFromUrl(url: string): string | null {
  if (!isValidGenpireUrl(url)) return null;

  // Extract the path after the base URL
  const pathMatch = url.match(new RegExp(`${STORAGE_PATH}/${UPLOADS_PREFIX}/([^/]+)/`));
  return pathMatch ? pathMatch[1] : null;
}

/**
 * Extract filename from a Genpire URL
 */
export function extractFilenameFromUrl(url: string): string | null {
  if (!url) return null;

  // Get the last part after the final slash
  const parts = url.split('/');
  return parts[parts.length - 1] || null;
}

/**
 * Check if a URL is a data URL (base64)
 */
export function isDataUrl(url: string): boolean {
  return !!url && url.startsWith('data:');
}

/**
 * Check if URL is a blob URL
 */
export function isBlobUrl(url: string): boolean {
  return !!url && url.startsWith('blob:');
}

/**
 * Convert data URL to Buffer for upload
 */
export function convertDataUrlToBuffer(dataUrl: string): Buffer | null {
  if (!isDataUrl(dataUrl)) return null;

  try {
    // Extract base64 data from data URL
    const base64Data = dataUrl.split(',')[1];
    if (!base64Data) return null;

    return Buffer.from(base64Data, 'base64');
  } catch (error) {
    console.error('Error converting data URL to buffer:', error);
    return null;
  }
}

/**
 * Get content type from data URL
 */
export function getContentTypeFromDataUrl(dataUrl: string): string {
  if (!isDataUrl(dataUrl)) return DEFAULT_CONTENT_TYPE;

  const match = dataUrl.match(/^data:([^;]+);/);
  return match ? match[1] : DEFAULT_CONTENT_TYPE;
}

/**
 * Normalize any image URL to Genpire format
 * Handles data URLs, blob URLs, and legacy formats
 */
export function normalizeImageUrl(url: string | null | undefined, projectId?: string): string {
  // Handle null/undefined
  if (!url) return '';

  // Already a valid Genpire URL
  if (isValidGenpireUrl(url)) return url;

  // Data URL - return as is (will be converted during upload)
  if (isDataUrl(url)) return url;

  // Blob URL - return as is (temporary browser URL)
  if (isBlobUrl(url)) return url;

  // Legacy Supabase URL - try to convert
  if (url.includes('supabase.co') || url.includes('supabase.io')) {
    // Extract the path after storage/v1/object/public/
    const pathMatch = url.match(/storage\/v1\/object\/public\/fileuploads\/(.*)/);
    if (pathMatch && pathMatch[1]) {
      return buildGenpireUrl(pathMatch[1]);
    }
  }

  // Relative path - build full URL
  if (url.startsWith('/')) {
    return buildGenpireUrl(url.slice(1));
  }

  // If it starts with uploads/, build full URL
  if (url.startsWith('uploads/')) {
    return buildGenpireUrl(url);
  }

  // Unknown format - return as is (might be external URL)
  console.warn('Unknown image URL format:', url);
  return url;
}

/**
 * Generate storage path for a specific view
 */
export function generateViewImagePath(projectId: string, viewType: ViewType): {
  path: string;
  filename: string;
  fullUrl: string;
} {
  const filename = generateUniqueFilename();
  const path = `${UPLOADS_PREFIX}/${projectId}/${filename}`;
  const fullUrl = buildGenpireUrl(path);

  return {
    path,
    filename,
    fullUrl
  };
}

/**
 * Batch generate paths for all views
 */
export function generateAllViewPaths(projectId: string): {
  front: { path: string; filename: string; fullUrl: string };
  back: { path: string; filename: string; fullUrl: string };
  side: { path: string; filename: string; fullUrl: string };
} {
  return {
    front: generateViewImagePath(projectId, 'front'),
    back: generateViewImagePath(projectId, 'back'),
    side: generateViewImagePath(projectId, 'side')
  };
}

/**
 * Validate and clean image URL for display
 * Returns the URL or a transparent placeholder
 */
export function getDisplayImageUrl(url: string | null | undefined, projectId?: string): string {
  // For empty/null/undefined, return a transparent 1x1 pixel
  // This prevents the "Loading..." text from showing
  if (!url || url === '') {
    // Transparent 1x1 pixel GIF
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  }

  // Normalize the URL
  const normalized = normalizeImageUrl(url, projectId);

  // If normalization returned empty, use transparent pixel
  if (!normalized || normalized === '') {
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  }

  // Otherwise return the normalized URL
  return normalized;
}

/**
 * Check if image needs to be uploaded (is data or blob URL)
 */
export function needsUpload(url: string): boolean {
  return isDataUrl(url) || isBlobUrl(url);
}

/**
 * Extract extension from URL or filename
 */
export function getExtensionFromUrl(url: string): string {
  if (isDataUrl(url)) {
    const contentType = getContentTypeFromDataUrl(url);
    const ext = contentType.split('/')[1];
    return ext || DEFAULT_EXTENSION;
  }

  const filename = extractFilenameFromUrl(url);
  if (!filename) return DEFAULT_EXTENSION;

  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : DEFAULT_EXTENSION;
}

/**
 * Build storage bucket path (without base URL)
 */
export function buildStoragePath(projectId: string, filename?: string): string {
  const file = filename || generateUniqueFilename();
  return `${UPLOADS_PREFIX}/${projectId}/${file}`;
}

/**
 * Get public URL from storage path
 */
export function getPublicUrlFromPath(path: string): string {
  return buildGenpireUrl(path);
}

// Export constants for external use
export const IMAGE_URL_CONSTANTS = {
  BASE_URL: GENPIRE_BASE_URL,
  STORAGE_PATH,
  UPLOADS_PREFIX,
  DEFAULT_EXTENSION,
  DEFAULT_CONTENT_TYPE,
  PLACEHOLDER_IMAGE
};
