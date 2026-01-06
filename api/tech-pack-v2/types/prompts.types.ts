/**
 * Prompt Template Types
 * Type definitions for AI prompt structures
 */

// ============================================================================
// PROMPT STRUCTURE
// ============================================================================

export interface PromptTemplate {
  systemPrompt: string;
  userPromptTemplate: (...args: any[]) => string;
}

export interface CategoryPromptTemplate extends PromptTemplate {
  userPromptTemplate: (imageUrl: string) => string;
}

export interface ViewAnalysisPromptTemplate extends PromptTemplate {
  userPromptTemplate: (viewType: string, imageUrl: string) => string;
}

export interface CloseUpPlanPromptTemplate extends PromptTemplate {
  userPromptTemplate: (productCategory: string, baseViewAnalysis: string) => string;
}

export interface CloseUpAnalysisPromptTemplate extends PromptTemplate {
  userPromptTemplate: (shotName: string, analysisFocus: string[], imageUrl: string) => string;
}

export interface ComponentPlanPromptTemplate extends PromptTemplate {
  userPromptTemplate: (productCategory: string, baseViewAnalysis: string, productContext: string) => string;
}

export interface ComponentSummaryPromptTemplate extends PromptTemplate {
  userPromptTemplate: (productCategory: string, componentName: string, componentImageUrl: string, productAnalysis: any) => string;
}

export interface SketchPromptTemplate extends PromptTemplate {
  userPromptTemplate: (
    productCategory: string,
    productAnalysis: string,
    viewType: "front" | "back" | "side"
  ) => string;
}

export interface CallOutPromptTemplate extends PromptTemplate {
  userPromptTemplate: (
    productCategory: string,
    viewType: string,
    sketchAnalysis: string,
    detailedAnalysis: string
  ) => string;
}

// ============================================================================
// PROMPT CONTEXT
// ============================================================================

export interface PromptContext {
  productId: string;
  userId: string;
  category?: string;
  imageUrl: string;
  viewType?: string;
  additionalContext?: Record<string, any>;
}

// ============================================================================
// PROMPT BUILDING
// ============================================================================

export interface PromptBuilderOptions {
  includeSystemPrompt: boolean;
  maxLength?: number;
  temperature?: number;
  model?: string;
}

export interface BuildPromptResult {
  systemPrompt?: string;
  userPrompt: string;
  metadata: {
    promptLength: number;
    estimatedTokens: number;
    model: string;
  };
}
