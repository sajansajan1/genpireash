/**
 * Tech Pack V2 Limits and Constraints Configuration
 * Defines operational limits, timeouts, and rate limiting
 */

export const LIMITS_CONFIG = {
  // Image constraints
  MAX_IMAGE_SIZE_MB: 10,
  SUPPORTED_IMAGE_FORMATS: ["image/jpeg", "image/png", "image/webp"] as const,
  MIN_IMAGE_DIMENSION: 512,
  MAX_IMAGE_DIMENSION: 4096,

  // Request limits
  MAX_CONCURRENT_ANALYSES: 5,
  REQUEST_TIMEOUT_MS: 60000, // 60 seconds

  // Batch processing
  MAX_BATCH_SIZE: {
    BASE_VIEWS: 5,
    CLOSE_UPS: 10,
    SKETCHES: 3,
  },

  // Rate limiting (per user)
  RATE_LIMIT: {
    windowMs: 60000, // 1 minute
    maxRequests: 30, // 30 requests per minute
  },

  // Cache settings
  CACHE_TTL_HOURS: 24,
  MAX_CACHE_ENTRIES: 10000,
} as const;

/**
 * Validate image constraints
 */
export function validateImageConstraints(
  width: number,
  height: number,
  sizeBytes: number
): { valid: boolean; error?: string } {
  const sizeMB = sizeBytes / (1024 * 1024);

  if (sizeMB > LIMITS_CONFIG.MAX_IMAGE_SIZE_MB) {
    return {
      valid: false,
      error: `Image size ${sizeMB.toFixed(2)}MB exceeds maximum ${LIMITS_CONFIG.MAX_IMAGE_SIZE_MB}MB`,
    };
  }

  if (width < LIMITS_CONFIG.MIN_IMAGE_DIMENSION || height < LIMITS_CONFIG.MIN_IMAGE_DIMENSION) {
    return {
      valid: false,
      error: `Image dimensions ${width}x${height} below minimum ${LIMITS_CONFIG.MIN_IMAGE_DIMENSION}px`,
    };
  }

  if (width > LIMITS_CONFIG.MAX_IMAGE_DIMENSION || height > LIMITS_CONFIG.MAX_IMAGE_DIMENSION) {
    return {
      valid: false,
      error: `Image dimensions ${width}x${height} exceed maximum ${LIMITS_CONFIG.MAX_IMAGE_DIMENSION}px`,
    };
  }

  return { valid: true };
}
