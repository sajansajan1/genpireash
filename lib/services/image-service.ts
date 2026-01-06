/**
 * Centralized Image Service
 *
 * A comprehensive service for all image operations including:
 * - Upload with automatic optimization
 * - Format conversion (WebP for web)
 * - Batch processing
 * - Retry logic and error handling
 * - Background processing
 * - Caching strategies
 * - Progressive loading support
 */

import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { uploadBufferToSupabase } from "@/lib/supabase/file_upload";
import {
  generateUniqueFilename,
  buildStoragePath,
  getPublicUrlFromPath,
} from "@/lib/utils/image-urls";
import { executeInBackground } from "@/lib/utils/background-execution";

// ============================================================================
// Types and Interfaces
// ============================================================================

export type ImageInput = File | Buffer | string | Blob;

export type ImageFormat = "jpeg" | "png" | "webp" | "avif";

export interface ImagePreset {
  name: string;
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format?: ImageFormat;
  progressive?: boolean;
}

export interface UploadOptions {
  bucket?: string;
  path?: string;
  fileName?: string;
  projectId?: string; // Add projectId for new URL structure
  preset?: keyof typeof IMAGE_PRESETS | ImagePreset;
  generateWebP?: boolean;
  generateThumbnail?: boolean;
  preserveOriginal?: boolean;
  metadata?: Record<string, any>;
  maxRetries?: number;
}

export interface BatchUploadOptions extends UploadOptions {
  parallel?: boolean;
  maxConcurrent?: number;
}

export interface SafeUploadOptions extends UploadOptions {
  fallbackUrl?: string;
  timeout?: number;
  onError?: (error: Error) => void;
}

export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: ImageFormat;
  progressive?: boolean;
  removeMetadata?: boolean;
  sharpen?: boolean;
}

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  thumbnailUrl?: string;
  webpUrl?: string;
  metadata?: {
    width: number;
    height: number;
    format: string;
    size: number;
    optimized: boolean;
  };
  error?: string;
}

export interface BatchUploadResult {
  success: boolean;
  results: ImageUploadResult[];
  failed: number;
  succeeded: number;
}

// ============================================================================
// Image Quality Presets
// ============================================================================

export const IMAGE_PRESETS: Record<string, ImagePreset> = {
  // Ultra small thumbnails for lists
  micro: {
    name: "micro",
    maxWidth: 64,
    maxHeight: 64,
    quality: 70,
    format: "webp",
  },

  // Small thumbnails
  thumbnail: {
    name: "thumbnail",
    maxWidth: 200,
    maxHeight: 200,
    quality: 80,
    format: "webp",
  },

  // Preview images
  preview: {
    name: "preview",
    maxWidth: 600,
    maxHeight: 600,
    quality: 85,
    format: "webp",
    progressive: true,
  },

  // Standard web display
  standard: {
    name: "standard",
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 85,
    format: "jpeg",
    progressive: true,
  },

  // High quality display
  highQuality: {
    name: "highQuality",
    maxWidth: 1800,
    maxHeight: 1800,
    quality: 90,
    format: "jpeg",
    progressive: true,
  },

  // Keep original quality but optimize
  original: {
    name: "original",
    maxWidth: 3000,
    maxHeight: 3000,
    quality: 95,
    progressive: true,
  },

  // AI analysis optimized
  aiAnalysis: {
    name: "aiAnalysis",
    maxWidth: 800,
    maxHeight: 800,
    quality: 75,
    format: "jpeg",
  },

  // Logo preset - preserves PNG transparency for logos with transparent backgrounds
  logo: {
    name: "logo",
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 90,
    format: "png", // PNG to preserve transparency
  },

  // Social media optimized
  social: {
    name: "social",
    maxWidth: 1080,
    maxHeight: 1080,
    quality: 85,
    format: "jpeg",
    progressive: true,
  },
};

// ============================================================================
// Main Image Service Class
// ============================================================================

export class ImageService {
  private static instance: ImageService;
  private cache: Map<string, { url: string; timestamp: number }> = new Map();
  private cacheTimeout = 15 * 60 * 1000; // 15 minutes

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  // ==========================================================================
  // Core Upload Methods
  // ==========================================================================

  /**
   * Upload image with automatic optimization
   */
  async upload(
    image: ImageInput,
    options: UploadOptions = {}
  ): Promise<ImageUploadResult> {
    try {
      // Convert input to buffer
      const buffer = await this.toBuffer(image);

      // Get optimization preset
      const preset = this.getPreset(options.preset);

      // Optimize image
      const optimized = await this.optimizeBuffer(buffer, preset);

      // Generate file name and path
      let fullPath: string;
      let fileName: string;

      if (options.projectId) {
        // New format with projectId and UUID
        const extension = preset.format || "png";
        fileName = generateUniqueFilename(extension);
        fullPath = buildStoragePath(options.projectId, fileName);
      } else {
        // Legacy format
        fileName = this.generateFileName(options.fileName, preset.format);
        const path = options.path || "uploads";
        fullPath = `${path}/${fileName}`;
      }

      // Upload main image
      const url = await uploadBufferToSupabase(
        optimized.buffer,
        fullPath,
        options.bucket || "fileuploads",
        `image/${preset.format || "jpeg"}`,
        options.projectId
      );

      if (!url) {
        throw new Error("Upload failed");
      }

      const result: ImageUploadResult = {
        success: true,
        url,
        metadata: {
          width: optimized.metadata.width || 0,
          height: optimized.metadata.height || 0,
          format: optimized.metadata.format || preset.format || "jpeg",
          size: optimized.buffer.length,
          optimized: true,
        },
      };

      // Generate WebP version in background if requested (non-blocking)
      if (options.generateWebP && preset.format !== "webp") {
        executeInBackground(
          async () => {
            const webpBuffer = await this.convertToWebP(buffer, preset);
            let webpPath: string;

            if (options.projectId) {
              // New format: store WebP with UUID too
              const webpFilename = generateUniqueFilename("webp");
              webpPath = buildStoragePath(options.projectId, webpFilename);
            } else {
              // Legacy format
              const path = options.path || "uploads";
              webpPath = `${path}/webp/${fileName.replace(/\.[^.]+$/, ".webp")}`;
            }

            const webpUrl = await uploadBufferToSupabase(
              webpBuffer,
              webpPath,
              options.bucket || "fileuploads",
              "image/webp",
              options.projectId
            );
            return webpUrl;
          },
          {
            onSuccess: () => {
              // WebP uploaded successfully in background
            },
            onError: (error) => {
              console.error("[Background] WebP generation failed:", error.message);
            },
            timeout: 30000, // 30 second timeout
            retries: 2, // Retry twice on failure
          }
        );
      }

      // Generate thumbnail in background if requested (non-blocking)
      if (options.generateThumbnail) {
        executeInBackground(
          async () => {
            const thumbPreset = IMAGE_PRESETS.thumbnail;
            const thumbnail = await this.optimizeBuffer(buffer, thumbPreset);
            let thumbPath: string;

            if (options.projectId) {
              // New format: store thumbnail with UUID too
              const thumbExtension = thumbPreset.format || "jpeg";
              const thumbFilename = generateUniqueFilename(thumbExtension);
              thumbPath = buildStoragePath(options.projectId, thumbFilename);
            } else {
              // Legacy format
              const path = options.path || "uploads";
              thumbPath = `${path}/thumbnails/${fileName}`;
            }

            const thumbUrl = await uploadBufferToSupabase(
              thumbnail.buffer,
              thumbPath,
              options.bucket || "fileuploads",
              `image/${thumbPreset.format || "jpeg"}`,
              options.projectId
            );
            return thumbUrl;
          },
          {
            onSuccess: () => {
              // Thumbnail uploaded successfully in background
            },
            onError: (error) => {
              console.error("[Background] Thumbnail generation failed:", error.message);
            },
            timeout: 30000, // 30 second timeout
            retries: 2, // Retry twice on failure
          }
        );
      }

      // Cache the result
      this.cacheResult(fullPath, result);

      return result;
    } catch (error) {
      console.error("Image upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  /**
   * Optimize image based on preset or custom options
   */
  async optimize(
    image: ImageInput,
    preset: keyof typeof IMAGE_PRESETS | ImagePreset | OptimizationOptions
  ): Promise<Buffer> {
    const buffer = await this.toBuffer(image);
    const options = typeof preset === "string" ? IMAGE_PRESETS[preset] : preset;

    const result = await this.optimizeBuffer(buffer, options as any);
    return result.buffer;
  }

  /**
   * Batch upload multiple images
   */
  async uploadBatch(
    images: ImageInput[],
    options: BatchUploadOptions = {}
  ): Promise<BatchUploadResult> {
    const { parallel = true, maxConcurrent = 5, ...uploadOptions } = options;

    if (!parallel) {
      // Sequential upload
      const results: ImageUploadResult[] = [];
      for (const image of images) {
        const result = await this.upload(image, uploadOptions);
        results.push(result);
      }

      return this.compileBatchResult(results);
    }

    // Parallel upload with concurrency limit
    const results = await this.processInBatches(
      images,
      async (image) => this.upload(image, uploadOptions),
      maxConcurrent
    );

    return this.compileBatchResult(results);
  }

  /**
   * Safe upload with retry and fallback
   */
  async safeUpload(
    image: ImageInput,
    options: SafeUploadOptions = {}
  ): Promise<ImageUploadResult> {
    const {
      maxRetries = 3,
      timeout = 30000,
      fallbackUrl,
      onError,
      ...uploadOptions
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<ImageUploadResult>((_, reject) => {
          setTimeout(() => reject(new Error("Upload timeout")), timeout);
        });

        // Race between upload and timeout
        const uploadPromise = this.upload(image, uploadOptions);
        const result = await Promise.race([uploadPromise, timeoutPromise]);

        if (result.success) {
          return result;
        }

        lastError = new Error(result.error || "Upload failed");
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");
        console.error(`Upload attempt ${attempt} failed:`, lastError.message);

        if (onError) {
          onError(lastError);
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // All attempts failed
    console.error("All upload attempts failed:", lastError);

    // Return fallback if provided
    if (fallbackUrl) {
      return {
        success: true,
        url: fallbackUrl,
        metadata: {
          width: 0,
          height: 0,
          format: "unknown",
          size: 0,
          optimized: false,
        },
      };
    }

    return {
      success: false,
      error: lastError?.message || "Upload failed after all retries",
    };
  }

  /**
   * Upload in background without blocking
   */
  async uploadInBackground(
    image: ImageInput,
    options: UploadOptions = {},
    callback?: (result: ImageUploadResult) => void
  ): Promise<void> {
    // Start upload without awaiting
    (async () => {
      try {
        const result = await this.safeUpload(image, options);

        if (callback) {
          callback(result);
        }

        // Store result in database if needed
        if (result.success && options.metadata?.projectId) {
          await this.storeUploadMetadata(result, options.metadata);
        }
      } catch (error) {
        console.error("Background upload error:", error);

        if (callback) {
          callback({
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Background upload failed",
          });
        }
      }
    })();
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  /**
   * Convert input to buffer
   */
  private async toBuffer(input: ImageInput): Promise<Buffer> {
    if (Buffer.isBuffer(input)) {
      return input;
    }

    if (typeof input === "string") {
      // Data URL
      if (input.startsWith("data:")) {
        const base64 = input.split(",")[1];
        return Buffer.from(base64, "base64");
      }

      // URL
      if (input.startsWith("http")) {
        const response = await fetch(input);
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }

      // Assume base64
      return Buffer.from(input, "base64");
    }

    if (input instanceof File || input instanceof Blob) {
      const arrayBuffer = await input.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    throw new Error("Unsupported image input type");
  }

  /**
   * Optimize buffer with Sharp
   */
  private async optimizeBuffer(
    buffer: Buffer,
    options: ImagePreset | OptimizationOptions
  ): Promise<{ buffer: Buffer; metadata: sharp.Metadata }> {
    const sharpInstance = sharp(buffer);
    const metadata = await sharpInstance.metadata();

    // Calculate dimensions
    const { width = 0, height = 0 } = metadata;
    let newWidth = width;
    let newHeight = height;

    if (options.maxWidth || options.maxHeight) {
      const maxWidth = options.maxWidth || newWidth;
      const maxHeight = options.maxHeight || newHeight;

      if (newWidth > maxWidth || newHeight > maxHeight) {
        const aspectRatio = newWidth / newHeight;

        if (newWidth > maxWidth) {
          newWidth = maxWidth;
          newHeight = Math.round(maxWidth / aspectRatio);
        }

        if (newHeight > maxHeight) {
          newHeight = maxHeight;
          newWidth = Math.round(maxHeight * aspectRatio);
        }
      }

      sharpInstance.resize(newWidth, newHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Apply format conversion
    const format = options.format || "jpeg";
    switch (format) {
      case "webp":
        sharpInstance.webp({
          quality: options.quality || 85,
          effort: 6, // Higher effort for better compression
        });
        break;
      case "avif":
        sharpInstance.avif({
          quality: options.quality || 85,
          effort: 6,
        });
        break;
      case "png":
        sharpInstance.png({
          quality: options.quality || 85,
          compressionLevel: 9,
          palette: true,
        });
        break;
      case "jpeg":
      default:
        sharpInstance.jpeg({
          quality: options.quality || 85,
          progressive: options.progressive !== false,
          mozjpeg: true, // Use mozjpeg encoder for better compression
        });
    }

    // Apply additional optimizations
    if ("removeMetadata" in options && options.removeMetadata !== false) {
      sharpInstance.withMetadata({
        orientation: metadata.orientation, // Preserve orientation only
      });
    }

    if ("sharpen" in options && options.sharpen) {
      sharpInstance.sharpen();
    }

    const optimizedBuffer = await sharpInstance.toBuffer();

    // Log optimization results (silenced for cleaner output)
    // const originalSize = buffer.length;
    // const optimizedSize = optimizedBuffer.length;
    // const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    // console.log(
    //   `Image optimized: ${(originalSize / 1024).toFixed(1)}KB → ` +
    //   `${(optimizedSize / 1024).toFixed(1)}KB (${reduction}% reduction)`
    // );

    return {
      buffer: optimizedBuffer,
      metadata: {
        ...metadata,
        width: newWidth,
        height: newHeight,
        format,
      },
    };
  }

  /**
   * Convert image to WebP format
   */
  private async convertToWebP(
    buffer: Buffer,
    preset: ImagePreset
  ): Promise<Buffer> {
    const webpOptions: ImagePreset = {
      ...preset,
      format: "webp",
      quality: Math.max(preset.quality - 5, 70), // Slightly lower quality for WebP
    };

    const result = await this.optimizeBuffer(buffer, webpOptions);
    return result.buffer;
  }

  /**
   * Get preset configuration
   */
  private getPreset(
    preset?: keyof typeof IMAGE_PRESETS | ImagePreset
  ): ImagePreset {
    if (!preset) {
      return IMAGE_PRESETS.standard;
    }

    if (typeof preset === "string") {
      return IMAGE_PRESETS[preset] || IMAGE_PRESETS.standard;
    }

    return preset;
  }

  /**
   * Generate unique file name
   */
  private generateFileName(fileName?: string, format?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const extension = format || "jpg";

    if (fileName) {
      // Replace extension if needed
      return fileName.replace(/\.[^.]+$/, `.${extension}`);
    }

    return `image_${timestamp}_${random}.${extension}`;
  }

  /**
   * Process items in batches with concurrency limit
   */
  private async processInBatches<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    maxConcurrent: number
  ): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += maxConcurrent) {
      const batch = items.slice(i, i + maxConcurrent);
      const batchResults = await Promise.all(
        batch.map((item) =>
          processor(item).catch(
            (error) =>
              ({
                success: false,
                error: error.message,
              }) as any
          )
        )
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Compile batch upload results
   */
  private compileBatchResult(results: ImageUploadResult[]): BatchUploadResult {
    const succeeded = results.filter((r) => r.success).length;
    const failed = results.length - succeeded;

    return {
      success: failed === 0,
      results,
      succeeded,
      failed,
    };
  }

  /**
   * Cache upload result
   */
  private cacheResult(key: string, result: ImageUploadResult): void {
    if (result.success && result.url) {
      this.cache.set(key, {
        url: result.url,
        timestamp: Date.now(),
      });

      // Clean old cache entries
      this.cleanCache();
    }
  }

  /**
   * Clean expired cache entries
   */
  private cleanCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Store upload metadata in database
   */
  private async storeUploadMetadata(
    result: ImageUploadResult,
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      const supabase = await createClient();
      await supabase.from("images_uploads").insert({
        url: result.url,
        thumbnail_url: result.thumbnailUrl,
        webp_url: result.webpUrl,
        width: result.metadata?.width,
        height: result.metadata?.height,
        format: result.metadata?.format,
        size: result.metadata?.size,
        project_id: metadata.projectId,
        user_id: metadata.userId,
        metadata,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to store upload metadata:", error);
    }
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ==========================================================================
  // Static Helper Methods
  // ==========================================================================

  /**
   * Check if image URL is valid
   */
  static isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.toLowerCase();
      return /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif)$/i.test(path);
    } catch {
      return false;
    }
  }

  /**
   * Get image dimensions from URL without downloading
   */
  static async getImageDimensions(
    url: string
  ): Promise<{ width: number; height: number } | null> {
    try {
      const response = await fetch(url, { method: "HEAD" });
      const contentType = response.headers.get("content-type");

      if (!contentType?.startsWith("image/")) {
        return null;
      }

      // For now, we need to download to get dimensions
      // In production, you might want to use a CDN that provides this in headers
      const imageResponse = await fetch(url);
      const buffer = await imageResponse.arrayBuffer();
      const metadata = await sharp(Buffer.from(buffer)).metadata();

      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
      };
    } catch (error) {
      console.error("Error getting image dimensions:", error);
      return null;
    }
  }

  /**
   * Generate srcset for responsive images
   */
  static generateSrcSet(
    baseUrl: string,
    sizes: number[] = [400, 800, 1200]
  ): string {
    return sizes.map((size) => `${baseUrl}?w=${size} ${size}w`).join(", ");
  }

  /**
   * Generate blur data URL for progressive loading
   */
  static async generateBlurDataUrl(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();

      const blurBuffer = await sharp(Buffer.from(buffer))
        .resize(10, 10, { fit: "inside" })
        .blur(1)
        .jpeg({ quality: 50 })
        .toBuffer();

      return `data:image/jpeg;base64,${blurBuffer.toString("base64")}`;
    } catch (error) {
      console.error("Error generating blur data URL:", error);
      return "";
    }
  }
}

// ============================================================================
// Export singleton instance and utility functions
// ============================================================================

export const imageService = ImageService.getInstance();

// Convenience functions
export const uploadImage = (image: ImageInput, options?: UploadOptions) =>
  imageService.upload(image, options);

export const optimizeImage = (
  image: ImageInput,
  preset: keyof typeof IMAGE_PRESETS | ImagePreset
) => imageService.optimize(image, preset);

export const uploadBatch = (
  images: ImageInput[],
  options?: BatchUploadOptions
) => imageService.uploadBatch(images, options);

export const safeUpload = (image: ImageInput, options?: SafeUploadOptions) =>
  imageService.safeUpload(image, options);

export const uploadInBackground = (
  image: ImageInput,
  options?: UploadOptions,
  callback?: Function
) => imageService.uploadInBackground(image, options, callback as any);
