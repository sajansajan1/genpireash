'use server';

import { ImageService } from '@/lib/services/image-service';

export async function uploadAnnotationScreenshot(
  base64Data: string,
  productId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Remove data URL prefix if present
    const base64 = base64Data.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    // Convert base64 to Buffer
    const buffer = Buffer.from(base64, 'base64');

    // Upload to Supabase using ImageService with projectId
    const imageService = ImageService.getInstance();
    const uploadResult = await imageService.upload(buffer, {
      bucket: 'fileuploads',
      projectId: productId, // Use projectId for standard path generation
      preset: 'original', // Keep full quality for annotations
      preserveOriginal: true
    });

    if (!uploadResult.success || !uploadResult.url) {
      throw new Error(uploadResult.error || 'Failed to upload screenshot');
    }

    // The URL should already be in the correct format from ImageService
    console.log('Screenshot uploaded successfully:', uploadResult.url);

    // Verify the URL is accessible
    const testFetch = await fetch(uploadResult.url, { method: 'HEAD' });
    if (!testFetch.ok) {
      console.error('Warning: Uploaded screenshot URL is not accessible:', uploadResult.url, 'Status:', testFetch.status);
    }

    return {
      success: true,
      url: uploadResult.url
    };
  } catch (error) {
    console.error('Error uploading annotation screenshot:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload screenshot'
    };
  }
}
