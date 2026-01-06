/**
 * Text Detection Service using Tesseract.js
 * Detects text regions in images for editing
 */

import Tesseract from 'tesseract.js';

export interface DetectedTextRegion {
  id: string;
  text: string;
  confidence: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
  // Normalized coordinates (0-1) for responsive scaling
  normalized: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface TextDetectionResult {
  regions: DetectedTextRegion[];
  imageWidth: number;
  imageHeight: number;
  processingTime: number;
}

/**
 * Detect text regions in an image using Tesseract OCR
 * @param imageUrl - URL of the image to process
 * @param minConfidence - Minimum confidence threshold (0-100)
 * @returns Promise<TextDetectionResult>
 */
export async function detectTextRegions(
  imageUrl: string,
  minConfidence: number = 60
): Promise<TextDetectionResult> {
  const startTime = performance.now();

  try {
    // Create worker with English language
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`[TextDetection] Progress: ${Math.round((m.progress || 0) * 100)}%`);
        }
      },
    });

    // Recognize text with bounding boxes
    const { data } = await worker.recognize(imageUrl);

    // Get image dimensions
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    const imageWidth = img.naturalWidth;
    const imageHeight = img.naturalHeight;

    // Extract word-level regions (more precise than line-level for editing)
    const regions: DetectedTextRegion[] = [];
    let idCounter = 0;

    // Process words and group them into logical text blocks
    if (data.words) {
      data.words.forEach((word) => {
        if (word.confidence >= minConfidence && word.text.trim().length > 0) {
          const bbox = word.bbox;
          regions.push({
            id: `text-${idCounter++}`,
            text: word.text,
            confidence: word.confidence,
            bbox: {
              x0: bbox.x0,
              y0: bbox.y0,
              x1: bbox.x1,
              y1: bbox.y1,
            },
            normalized: {
              x: bbox.x0 / imageWidth,
              y: bbox.y0 / imageHeight,
              width: (bbox.x1 - bbox.x0) / imageWidth,
              height: (bbox.y1 - bbox.y0) / imageHeight,
            },
          });
        }
      });
    }

    // Also get line-level data for multi-word selections
    if (data.lines) {
      data.lines.forEach((line) => {
        if (line.confidence >= minConfidence && line.text.trim().length > 1) {
          const bbox = line.bbox;
          // Only add if it contains multiple words (for grouping)
          const wordCount = line.text.trim().split(/\s+/).length;
          if (wordCount > 1) {
            regions.push({
              id: `line-${idCounter++}`,
              text: line.text.trim(),
              confidence: line.confidence,
              bbox: {
                x0: bbox.x0,
                y0: bbox.y0,
                x1: bbox.x1,
                y1: bbox.y1,
              },
              normalized: {
                x: bbox.x0 / imageWidth,
                y: bbox.y0 / imageHeight,
                width: (bbox.x1 - bbox.x0) / imageWidth,
                height: (bbox.y1 - bbox.y0) / imageHeight,
              },
            });
          }
        }
      });
    }

    // Terminate worker
    await worker.terminate();

    const processingTime = performance.now() - startTime;
    console.log(`[TextDetection] Completed in ${processingTime.toFixed(0)}ms, found ${regions.length} text regions`);

    return {
      regions,
      imageWidth,
      imageHeight,
      processingTime,
    };
  } catch (error) {
    console.error('[TextDetection] Error:', error);
    throw new Error(`Failed to detect text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Group nearby text regions that likely belong together
 * (e.g., "CLOUD" and "CHASERS" on the same title)
 */
export function groupTextRegions(
  regions: DetectedTextRegion[],
  verticalThreshold: number = 0.05, // 5% of image height
  horizontalThreshold: number = 0.1 // 10% of image width
): DetectedTextRegion[][] {
  const groups: DetectedTextRegion[][] = [];
  const used = new Set<string>();

  regions.forEach((region) => {
    if (used.has(region.id)) return;

    const group = [region];
    used.add(region.id);

    // Find nearby regions
    regions.forEach((other) => {
      if (used.has(other.id)) return;

      const verticalDistance = Math.abs(region.normalized.y - other.normalized.y);
      const horizontalDistance = Math.abs(
        (region.normalized.x + region.normalized.width) - other.normalized.x
      );

      // Check if on same line and close horizontally
      if (verticalDistance < verticalThreshold && horizontalDistance < horizontalThreshold) {
        group.push(other);
        used.add(other.id);
      }
    });

    // Sort group by x position (left to right)
    group.sort((a, b) => a.normalized.x - b.normalized.x);
    groups.push(group);
  });

  return groups;
}

/**
 * Merge a group of text regions into a single region
 */
export function mergeRegionGroup(group: DetectedTextRegion[]): DetectedTextRegion {
  if (group.length === 0) {
    throw new Error('Cannot merge empty group');
  }

  if (group.length === 1) {
    return group[0];
  }

  const text = group.map((r) => r.text).join(' ');
  const avgConfidence = group.reduce((sum, r) => sum + r.confidence, 0) / group.length;

  // Calculate bounding box that encompasses all regions
  const x0 = Math.min(...group.map((r) => r.bbox.x0));
  const y0 = Math.min(...group.map((r) => r.bbox.y0));
  const x1 = Math.max(...group.map((r) => r.bbox.x1));
  const y1 = Math.max(...group.map((r) => r.bbox.y1));

  // Get image dimensions from first region's normalized values
  const first = group[0];
  const imageWidth = first.bbox.x0 / first.normalized.x;
  const imageHeight = first.bbox.y0 / first.normalized.y;

  return {
    id: `merged-${group.map((r) => r.id).join('-')}`,
    text,
    confidence: avgConfidence,
    bbox: { x0, y0, x1, y1 },
    normalized: {
      x: x0 / imageWidth,
      y: y0 / imageHeight,
      width: (x1 - x0) / imageWidth,
      height: (y1 - y0) / imageHeight,
    },
  };
}
