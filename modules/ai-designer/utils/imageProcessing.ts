/**
 * Image processing and URL handling utilities
 */

/**
 * Get display-ready image URL
 */
export function getDisplayImageUrl(url: string | null | undefined): string {
  if (!url) return '';

  // Handle data URLs
  if (url.startsWith('data:')) {
    return url;
  }

  // Handle relative paths
  if (url.startsWith('/')) {
    return url;
  }

  // Handle full URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Default to empty string for invalid URLs
  return '';
}

/**
 * Check if a URL is a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;

  // Check for data URLs
  if (url.startsWith('data:image/')) {
    return true;
  }

  // Check for common image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const lowercaseUrl = url.toLowerCase();

  return imageExtensions.some(ext => lowercaseUrl.includes(ext));
}

/**
 * Convert blob URL to base64
 */
export async function blobUrlToBase64(blobUrl: string): Promise<string> {
  const response = await fetch(blobUrl);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Preload image to check dimensions and validity
 */
export function preloadImage(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };

    img.src = url;
  });
}

/**
 * Generate thumbnail from image URL
 */
export async function generateThumbnail(
  imageUrl: string,
  maxWidth = 200,
  maxHeight = 200
): Promise<string> {
  const img = new Image();
  img.crossOrigin = 'anonymous';

  return new Promise((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Calculate new dimensions
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;

        if (width > height) {
          width = maxWidth;
          height = width / aspectRatio;
        } else {
          height = maxHeight;
          width = height * aspectRatio;
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for thumbnail'));
    };

    img.src = imageUrl;
  });
}

/**
 * Check if all views have valid images
 */
export function hasValidImages(views: { front?: string; back?: string; side?: string; top?: string; bottom?: string }): boolean {
  return !!(
    views.front && views.front !== '' &&
    views.back && views.back !== '' &&
    views.side && views.side !== ''
    // Top and bottom are optional, so we don't require them for validity
  );
}
