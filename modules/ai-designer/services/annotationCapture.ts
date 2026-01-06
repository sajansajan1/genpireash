/**
 * Annotation and screenshot capture service
 */

import html2canvas from 'html2canvas';
import type { Annotation } from '../types';
import { devLog } from '../utils/devLogger';

/**
 * Capture design screenshot of the views grid
 */
export async function captureDesignScreenshot(
  gridElement?: HTMLElement | null
): Promise<string | null> {
  try {
    // If no element provided, try to find the views grid automatically
    let targetElement = gridElement;
    if (!targetElement) {
      // Try to find the views grid element
      targetElement = document.querySelector('.views-grid') as HTMLElement;
      if (!targetElement) {
        targetElement = document.querySelector('[data-views-grid]') as HTMLElement;
      }
      if (!targetElement) {
        // Try to find by ID or other common selectors
        targetElement = document.getElementById('views-grid') as HTMLElement;
      }
    }

    if (!targetElement) {
      console.error('Grid element not available for screenshot');
      return null;
    }

    // Wait for images to be fully loaded
    const images = targetElement.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          if (!img.src) {
            resolve(false);
          }
        });
      })
    );

    // Small delay to ensure rendering is complete
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Capture the grid
    const canvas = await html2canvas(targetElement, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png');

    // Upload to server and get public URL
    // Extract productId from grid element if available
    const productId = targetElement.getAttribute('data-product-id') || 'default';
    const uploadResult = await uploadAnnotationScreenshot(dataUrl, productId);

    if (uploadResult.success && uploadResult.url) {
      return uploadResult.url;
    } else {
      console.error('Failed to upload screenshot:', uploadResult.error);
      return null;
    }
  } catch (error) {
    console.error('Error capturing design screenshot:', error);
    return null;
  }
}

/**
 * Capture annotated screenshot with visual annotations
 */
export async function captureAnnotatedScreenshot(
  element: HTMLElement | null,
  annotations?: Annotation[]
): Promise<string | null> {
  try {
    if (!element) {
      console.error('Element not available for annotated screenshot');
      return null;
    }

    devLog('annotation-capture', { annotationCount: annotations?.length || 0 }, 'Capturing annotated screenshot');

    // Wait for images to be fully loaded
    const images = element.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          if (!img.src) {
            resolve(false);
          }
        });
      })
    );

    // Small delay to ensure rendering is complete and annotations are visible
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Log what we're about to capture
    devLog('annotation-capture-element', { elementTag: element.tagName, childrenCount: element.children.length }, 'Capturing element');

    // Capture the element including annotation overlays
    // The annotation overlay is rendered as a child of the element
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: true, // Enable logging to debug
      useCORS: true,
      allowTaint: true,
      // Capture all overlays and positioned elements
      ignoreElements: (el) => {
        // Don't ignore any elements - we want to capture everything including overlays
        return false;
      },
      // Handle CSS transforms properly
      onclone: (clonedDoc) => {
        // Find annotation overlays in the cloned document and ensure they're visible
        const annotationOverlays = clonedDoc.querySelectorAll('[class*="z-30"], [class*="z-50"]');
        devLog('annotation-overlays', { count: annotationOverlays.length }, 'Found overlays in clone');

        // Ensure overlays are visible
        annotationOverlays.forEach((overlay) => {
          const el = overlay as HTMLElement;
          el.style.opacity = '1';
          el.style.visibility = 'visible';
          el.style.display = el.style.display || 'block';
        });
      }
    });

    // If annotations are provided, draw them directly onto the canvas
    if (annotations && annotations.length > 0) {
      devLog('annotation-draw', { count: annotations.length, canvasWidth: canvas.width, canvasHeight: canvas.height }, 'Drawing annotations');

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Scale factor matches html2canvas scale
        const scale = 2;

        annotations.forEach((annotation, index) => {
          devLog(`annotation-draw-${index}`, { x: annotation.x, y: annotation.y }, `Drawing annotation ${index + 1}`);

          const x = annotation.x * scale;
          const y = annotation.y * scale;

          // Draw the dot (black circle with white border)
          ctx.beginPath();
          ctx.arc(x, y, 6 * scale, 0, 2 * Math.PI);
          ctx.fillStyle = '#000000';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2 * scale;
          ctx.stroke();

          // Draw the connecting line if there's a label
          if (annotation.label) {
            ctx.beginPath();
            ctx.moveTo(x, y + 6 * scale);
            ctx.lineTo(x, y + 24 * scale);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2 * scale;
            ctx.stroke();

            // Draw the label box
            const labelY = y + 24 * scale;
            const labelWidth = 200 * scale;
            const labelHeight = 60 * scale; // Approximate height
            const labelX = x - labelWidth / 2;

            // Draw white background with border
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = 1 * scale;
            ctx.roundRect(labelX, labelY, labelWidth, labelHeight, 8 * scale);
            ctx.fill();
            ctx.stroke();

            // Draw label text
            ctx.fillStyle = '#000000';
            ctx.font = `${14 * scale}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';

            // Word wrap text
            const words = annotation.label.split(' ');
            const maxWidth = labelWidth - (16 * scale);
            let line = '';
            let lineY = labelY + (8 * scale);
            const lineHeight = 18 * scale;

            for (let word of words) {
              const testLine = line + word + ' ';
              const metrics = ctx.measureText(testLine);
              if (metrics.width > maxWidth && line !== '') {
                ctx.fillText(line.trim(), x, lineY);
                line = word + ' ';
                lineY += lineHeight;
              } else {
                line = testLine;
              }
            }
            ctx.fillText(line.trim(), x, lineY);
          }
        });
        devLog('annotation-draw-complete', { count: annotations.length }, 'Annotations drawn');
      }
    }

    const dataUrl = canvas.toDataURL('image/png');
    const productId = element.getAttribute('data-product-id') || 'default';
    const uploadResult = await uploadAnnotationScreenshot(dataUrl, productId);

    if (uploadResult.success && uploadResult.url) {
      devLog('screenshot-upload', { url: uploadResult.url }, 'Screenshot uploaded');
      return uploadResult.url;
    }

    return null;
  } catch (error) {
    console.error('Error capturing annotated screenshot:', error);
    return null;
  }
}

/**
 * Upload screenshot to server
 */
export async function uploadAnnotationScreenshot(
  dataUrl: string,
  productId: string = 'default'
): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    // Dynamic import to avoid circular dependencies
    const { uploadAnnotationScreenshot: upload } = await import(
      '@/app/actions/upload-annotation-screenshot'
    );

    const result = await upload(dataUrl, productId);
    return result;
  } catch (error) {
    console.error('Failed to upload screenshot:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}
