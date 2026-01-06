/**
 * Image Hash Calculator
 * Calculate SHA-256 hash for image caching
 */

import crypto from "crypto";

/**
 * Calculate SHA-256 hash of image from URL
 * @param imageUrl URL of the image to hash
 * @returns SHA-256 hash string
 */
export async function calculateImageHash(imageUrl: string): Promise<string> {
  try {
    // Fetch image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Calculate SHA-256 hash
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");

    return hash;
  } catch (error) {
    console.error("Error calculating image hash:", error);
    throw error;
  }
}

/**
 * Calculate hash from buffer (for already-downloaded images)
 * @param buffer Image buffer
 * @returns SHA-256 hash string
 */
export function calculateBufferHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Calculate hash from base64 string
 * @param base64String Base64 encoded image
 * @returns SHA-256 hash string
 */
export function calculateBase64Hash(base64String: string): string {
  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  return calculateBufferHash(buffer);
}

/**
 * Check if two image hashes match
 * @param hash1 First hash
 * @param hash2 Second hash
 * @returns True if hashes match
 */
export function hashesMatch(hash1: string, hash2: string): boolean {
  return hash1 === hash2;
}
