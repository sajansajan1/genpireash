"use server";

import { imageService } from "@/lib/services/image-service";

/**
 * Server-side image optimization for PDF/Excel generation
 * This runs on the server to avoid browser compatibility issues with sharp
 */
export async function optimizeImagesForExport(
  imageData: any,
  options?: {
    type?: 'pdf' | 'excel';
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
  }
): Promise<{ success: boolean; optimizedImages?: any; error?: string }> {
  try {
    if (!imageData) {
      return { success: true, optimizedImages: {} };
    }

    const optimizedImages: any = {};
    const imagePromises: Promise<void>[] = [];
    
    // Default settings based on export type
    const settings = {
      pdf: {
        maxWidth: options?.maxWidth || 800,
        maxHeight: options?.maxHeight || 800,
        quality: options?.quality || 85,
        format: 'jpeg' as const,
      },
      excel: {
        maxWidth: options?.maxWidth || 400,
        maxHeight: options?.maxHeight || 400,
        quality: options?.quality || 85,
        format: 'jpeg' as const,
      }
    };
    
    const exportSettings = settings[options?.type || 'pdf'];
    
    // Process each image in parallel
    Object.keys(imageData).forEach(key => {
      if (imageData[key]?.url) {
        imagePromises.push(
          (async () => {
            try {
              // Optimize image using the centralized service
              const optimizedBuffer = await imageService.optimize(imageData[key].url, {
                maxWidth: exportSettings.maxWidth,
                maxHeight: exportSettings.maxHeight,
                quality: exportSettings.quality,
                format: exportSettings.format,
                progressive: false,
                removeMetadata: true
              });
              
              // Convert to data URL for embedding
              optimizedImages[key] = {
                ...imageData[key],
                url: `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`,
                optimized: true
              };
            } catch (error) {
              console.error(`Failed to optimize ${key} image:`, error);
              // Fallback to original URL if optimization fails
              optimizedImages[key] = imageData[key];
            }
          })()
        );
      } else {
        optimizedImages[key] = imageData[key];
      }
    });
    
    // Wait for all optimizations to complete
    await Promise.all(imagePromises);
    
    return {
      success: true,
      optimizedImages
    };
  } catch (error) {
    console.error('Image optimization error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to optimize images'
    };
  }
}

/**
 * Optimize technical images for export
 */
export async function optimizeTechnicalImagesForExport(
  technicalImages: any,
  options?: {
    type?: 'pdf' | 'excel';
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
  }
): Promise<{ success: boolean; optimizedImages?: any; error?: string }> {
  try {
    if (!technicalImages) {
      return { success: true, optimizedImages: {} };
    }

    const optimizedImages: any = {};
    const imagePromises: Promise<void>[] = [];
    
    // Technical images need higher quality
    const settings = {
      pdf: {
        maxWidth: options?.maxWidth || 1200,
        maxHeight: options?.maxHeight || 1200,
        quality: options?.quality || 90,
        format: 'jpeg' as const,
        sharpen: true
      },
      excel: {
        maxWidth: options?.maxWidth || 600,
        maxHeight: options?.maxHeight || 600,
        quality: options?.quality || 85,
        format: 'jpeg' as const,
      }
    };
    
    const exportSettings = settings[options?.type || 'pdf'];
    
    // Process each technical image
    Object.keys(technicalImages).forEach(key => {
      if (technicalImages[key]?.url) {
        imagePromises.push(
          (async () => {
            try {
              const optimizedBuffer = await imageService.optimize(technicalImages[key].url, {
                maxWidth: exportSettings.maxWidth,
                maxHeight: exportSettings.maxHeight,
                quality: exportSettings.quality,
                format: exportSettings.format,
                progressive: false,
                removeMetadata: true,
                sharpen: (exportSettings as any).sharpen || false
              });
              
              optimizedImages[key] = {
                ...technicalImages[key],
                url: `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`,
                optimized: true
              };
            } catch (error) {
              console.error(`Failed to optimize technical ${key} image:`, error);
              optimizedImages[key] = technicalImages[key];
            }
          })()
        );
      } else {
        optimizedImages[key] = technicalImages[key];
      }
    });
    
    await Promise.all(imagePromises);
    
    return {
      success: true,
      optimizedImages
    };
  } catch (error) {
    console.error('Technical image optimization error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to optimize technical images'
    };
  }
}
