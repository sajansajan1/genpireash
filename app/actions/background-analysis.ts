/**
 * Background Image Analysis Utility
 * 
 * This module provides utilities for running image analysis in the background
 * without blocking the user experience. All analysis operations are fire-and-forget
 * to ensure fast response times.
 */

import { analyzeAndSaveProductImages } from "./analyze-product-images";

/**
 * Triggers image analysis in the background without blocking the current operation
 * 
 * @param productId - The product ID to analyze
 * @param imageData - The image data containing URLs for different views
 * @param productName - The name of the product
 * @param revisionId - Optional revision ID if this is part of a revision
 * @param revisionNumber - Optional revision number
 * @returns void - This function doesn't return anything as it runs in background
 */
export function triggerBackgroundAnalysis(
  productId: string,
  imageData: any,
  productName: string = "Product",
  revisionId: string | null = null,
  revisionNumber: number | null = null
): void {
  console.log(`[Background Analysis] Starting for product: ${productId}`);
  
  // Run the analysis asynchronously without blocking
  Promise.resolve()
    .then(() => {
      return analyzeAndSaveProductImages(
        productId,
        imageData,
        productName,
        revisionId,
        revisionNumber ?? undefined
      );
    })
    .then((result) => {
      if (result.success) {
        console.log(`[Background Analysis] ✓ Completed for product: ${productId}`);
      } else {
        console.error(`[Background Analysis] ✗ Failed for product: ${productId}`, result.error);
      }
    })
    .catch((error) => {
      console.error(`[Background Analysis] ✗ Error for product: ${productId}`, error);
      // Silently fail - this is non-critical background work
    });
}

/**
 * Batch trigger multiple background analyses
 * Useful when processing multiple products or revisions
 * 
 * @param analyses - Array of analysis parameters
 */
export function triggerBatchBackgroundAnalysis(
  analyses: Array<{
    productId: string;
    imageData: any;
    productName?: string;
    revisionId?: string | null;
    revisionNumber?: number | null;
  }>
): void {
  console.log(`[Background Analysis] Starting batch analysis for ${analyses.length} items`);
  
  analyses.forEach((analysis) => {
    triggerBackgroundAnalysis(
      analysis.productId,
      analysis.imageData,
      analysis.productName || "Product",
      analysis.revisionId || null,
      analysis.revisionNumber || null
    );
  });
}

/**
 * Triggers background analysis with retry logic
 * Useful for critical analyses that should eventually complete
 * 
 * @param productId - The product ID to analyze
 * @param imageData - The image data containing URLs for different views
 * @param productName - The name of the product
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param retryDelay - Delay between retries in milliseconds (default: 5000)
 */
export function triggerBackgroundAnalysisWithRetry(
  productId: string,
  imageData: any,
  productName: string = "Product",
  maxRetries: number = 3,
  retryDelay: number = 5000
): void {
  console.log(`[Background Analysis] Starting with retry for product: ${productId}`);
  
  let retryCount = 0;
  
  const attemptAnalysis = () => {
    analyzeAndSaveProductImages(productId, imageData, productName)
      .then((result) => {
        if (result.success) {
          console.log(`[Background Analysis] ✓ Completed for product: ${productId}`);
        } else {
          throw new Error(result.error || "Analysis failed");
        }
      })
      .catch((error) => {
        retryCount++;
        if (retryCount <= maxRetries) {
          console.log(`[Background Analysis] Retry ${retryCount}/${maxRetries} for product: ${productId}`);
          setTimeout(attemptAnalysis, retryDelay);
        } else {
          console.error(`[Background Analysis] ✗ Failed after ${maxRetries} retries for product: ${productId}`, error);
        }
      });
  };
  
  // Start the first attempt
  attemptAnalysis();
}
