/**
 * Custom Component Generation Types
 * Types and constants for custom component image generation
 */

// Credit cost for custom component generation
export const CUSTOM_COMPONENT_CREDITS = 1;

/**
 * Result of component validation
 */
export interface ComponentValidationResult {
  exists: boolean;
  confidence: number;
  matchedComponent: {
    name: string;
    type: string;
    location: string;
    description: string;
  } | null;
  imageGenerationPrompt: string | null;
  negativePrompt: string | null;
  reason: string;
  suggestions: string[];
}

/**
 * Result of custom component generation
 */
export interface CustomComponentResult {
  success: boolean;
  error?: string;
  validation?: ComponentValidationResult;
  component?: {
    analysisId: string;
    componentName: string;
    componentType: string;
    imageUrl: string;
    thumbnailUrl?: string;
    guide: any;
  };
  creditsUsed?: number;
}
