/**
 * Input validation utilities
 */

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate product name
 */
export function isValidProductName(name: string): boolean {
  return name.length >= 1 && name.length <= 100;
}

/**
 * Validate edit prompt
 */
export function isValidEditPrompt(prompt: string): boolean {
  const trimmed = prompt.trim();
  return trimmed.length >= 3 && trimmed.length <= 1000;
}

/**
 * Validate chat message
 */
export function isValidChatMessage(message: string): boolean {
  const trimmed = message.trim();
  return trimmed.length >= 1 && trimmed.length <= 2000;
}

/**
 * Validate image file
 */
export function isValidImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Allowed: JPEG, PNG, WebP, SVG' };
  }

  return { valid: true };
}

/**
 * Validate annotation position
 */
export function isValidAnnotationPosition(x: number, y: number): boolean {
  return x >= 0 && x <= 100 && y >= 0 && y <= 100;
}

/**
 * Validate zoom level
 */
export function isValidZoomLevel(zoom: number, min = 25, max = 200): boolean {
  return zoom >= min && zoom <= max;
}

/**
 * Sanitize user input for display
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate batch ID format
 */
export function isValidBatchId(batchId: string): boolean {
  return /^batch-\d+-[a-z0-9]+$/.test(batchId);
}

/**
 * Check if chat limit is reached
 */
export function isChatLimitReached(messageCount: number, limit = 250): boolean {
  return messageCount >= limit;
}
