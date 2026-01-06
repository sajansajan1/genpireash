/**
 * Tab-specific canned suggestions for the ChatInterface
 * Each workflow mode has its own set of relevant suggestions
 */

import type { WorkflowMode } from '../store/editorStore';

export interface TabSuggestion {
  text: string;
  actionType?: 'design_edit' | 'question' | 'generate' | 'general';
}

/**
 * Suggestions for "All Views" tab (multi-view mode)
 * Focus on design editing and refinements
 */
export const MULTI_VIEW_SUGGESTIONS: TabSuggestion[] = [
  { text: "Refine fit, shape, or structure", actionType: "design_edit" },
  { text: "Suggest alternative materials", actionType: "question" },
  { text: "Make it stronger and more durable", actionType: "design_edit" },
  { text: "Estimate unit cost (materials, labor, MOQ)", actionType: "question" },
  { text: "Reduce cost without losing quality", actionType: "design_edit" },
  { text: "Best factory types for production", actionType: "question" },
  { text: "Create a sustainable version", actionType: "design_edit" },
  { text: "Upgrade to luxury-tier finish", actionType: "design_edit" },
  { text: "Suggest pricing tiers and margins", actionType: "question" },
];

/**
 * Suggestions for "Front Versions" tab (front-view mode)
 * Focus on front view iterations and approvals
 */
export const FRONT_VIEW_SUGGESTIONS: TabSuggestion[] = [
  { text: "Improve the front silhouette", actionType: "design_edit" },
  { text: "Change the front color scheme", actionType: "design_edit" },
  { text: "Add front detailing or embellishments", actionType: "design_edit" },
  { text: "Compare this version with previous", actionType: "question" },
  { text: "What makes this front view stand out?", actionType: "question" },
  { text: "Adjust proportions of the front", actionType: "design_edit" },
  { text: "Make the front more minimal", actionType: "design_edit" },
  { text: "Add branding elements to front", actionType: "design_edit" },
];

/**
 * Suggestions for "Factory Specs" tab (tech-pack mode)
 * Focus on tech pack generation, Q&A about specs, and factory readiness
 */
export const TECH_PACK_SUGGESTIONS: TabSuggestion[] = [
  { text: "Generate base views from product images", actionType: "generate" },
  { text: "Generate detailed close-up shots", actionType: "generate" },
  { text: "Generate technical sketches", actionType: "generate" },
  { text: "Generate all factory specs", actionType: "generate" },
  { text: "What materials are recommended?", actionType: "question" },
  { text: "Explain the construction details", actionType: "question" },
  { text: "List all required trims and hardware", actionType: "question" },
  { text: "What are the key measurements?", actionType: "question" },
  { text: "Recommend factories for this product", actionType: "question" },
  { text: "Estimate production timeline", actionType: "question" },
];

/**
 * Get suggestions for a specific workflow mode
 */
export function getSuggestionsForMode(mode: WorkflowMode): TabSuggestion[] {
  switch (mode) {
    case 'multi-view':
      return MULTI_VIEW_SUGGESTIONS;
    case 'front-view':
      return FRONT_VIEW_SUGGESTIONS;
    case 'tech-pack':
      return TECH_PACK_SUGGESTIONS;
    default:
      return MULTI_VIEW_SUGGESTIONS; // Default to multi-view suggestions
  }
}

/**
 * Get placeholder text for a specific workflow mode
 */
export function getPlaceholderForMode(mode: WorkflowMode): string {
  switch (mode) {
    case 'multi-view':
      return "Describe your design changes...";
    case 'front-view':
      return "Refine the front view or ask questions...";
    case 'tech-pack':
      return "Ask about specs or generate factory files...";
    default:
      return "Describe your design changes...";
  }
}

/**
 * Get disabled message for a specific workflow mode
 */
export function getDisabledMessageForMode(mode: WorkflowMode, reason: string): string {
  switch (mode) {
    case 'front-view':
      return "Please approve or edit the front view first";
    case 'tech-pack':
      return "Factory Specs chat coming soon";
    default:
      return reason || "Chat is currently disabled";
  }
}
