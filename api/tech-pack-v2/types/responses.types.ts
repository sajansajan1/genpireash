/**
 * API Response Types
 * Standard response formats for all Tech Pack V2 endpoints
 */

import type {
  CategoryDetectionResult,
  BaseViewAnalysis,
  CloseUpAnalysis,
  CallOutData,
  AIEditResult,
  BatchProcessingStatus,
} from "./tech-pack.types";

// ============================================================================
// STANDARD RESPONSE WRAPPER
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: ResponseMetadata;
}

export interface ResponseMetadata {
  timestamp: string;
  requestId?: string;
  creditsUsed?: number;
  processingTime?: number;
  cacheHit?: boolean;
}

// ============================================================================
// CATEGORY DETECTION
// ============================================================================

export interface CategoryDetectionResponse extends ApiResponse<CategoryDetectionResult> {
  data?: CategoryDetectionResult;
}

// ============================================================================
// BASE VIEWS
// ============================================================================

export interface BaseViewsAnalysisResponse extends ApiResponse {
  data?: {
    analyses: BaseViewAnalysisItem[];
    creditsUsed: number;
    batchId: string;
  };
}

export interface BaseViewAnalysisItem {
  revisionId: string;
  viewType: string;
  analysisData: BaseViewAnalysis;
  confidenceScore: number;
  imageUrl: string;
  thumbnailUrl?: string;
}

// ============================================================================
// CLOSE-UPS
// ============================================================================

export interface CloseUpsGenerationResponse extends ApiResponse {
  data?: {
    closeupPlan: any;
    generatedImages: CloseUpItem[];
    creditsUsed: number;
    batchId: string;
  };
}

export interface CloseUpItem {
  revisionId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  shotName: string;
  analysisData: CloseUpAnalysis;
  order: number;
}

// ============================================================================
// TECHNICAL SKETCHES
// ============================================================================

export interface TechnicalSketchesResponse extends ApiResponse {
  data?: {
    sketches: TechnicalSketchItem[];
    creditsUsed: number;
    batchId: string;
  };
}

export interface TechnicalSketchItem {
  revisionId: string;
  viewType: "front" | "back" | "side";
  imageUrl: string;
  thumbnailUrl?: string;
  callouts: CallOutData;
  analysisData: any;
}

// ============================================================================
// AI EDIT
// ============================================================================

export interface AIEditResponse extends ApiResponse<AIEditResult> {
  data?: AIEditResult;
}

// ============================================================================
// REGENERATE
// ============================================================================

export interface RegenerateResponse extends ApiResponse {
  data?: {
    newRevisionId: string;
    analysisData: any;
    creditsUsed: number;
    imageUrl: string;
    thumbnailUrl?: string;
  };
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

export interface BatchOperationResponse extends ApiResponse {
  data?: {
    batchId: string;
    status: BatchProcessingStatus;
    items: any[];
  };
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

export interface ErrorResponse {
  success: false;
  error: string;
  errorCode?: string;
  details?: any;
  metadata?: ResponseMetadata;
}

export type TechPackApiResponse =
  | CategoryDetectionResponse
  | BaseViewsAnalysisResponse
  | CloseUpsGenerationResponse
  | TechnicalSketchesResponse
  | AIEditResponse
  | RegenerateResponse
  | BatchOperationResponse
  | ErrorResponse;
