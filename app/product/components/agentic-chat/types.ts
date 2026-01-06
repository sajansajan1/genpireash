/**
 * Type definitions for the Agentic Tech Pack Chat system
 * This is a standalone chat system separate from the ai-designer ChatInterface
 */

import type { TechFileData } from "@/app/actions/get-tech-files";

// ============================================
// Message Types
// ============================================

export interface AgenticMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: AgenticMessageMetadata;
}

export interface AgenticMessageMetadata {
  /** Which section this message relates to */
  section?: string;
  /** If AI is suggesting an edit */
  suggestedEdit?: EditSuggestion;
  /** If this was triggered by a quick action */
  quickAction?: string;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: string;
  /** Detected intent of the message */
  intent?: MessageIntent;
  /** Edit action that was applied */
  editAction?: EditAction;
  /** Whether the edit was successfully applied */
  editApplied?: boolean;
}

// ============================================
// Edit Suggestion Types
// ============================================

export interface EditSuggestion {
  id: string;
  section: string;
  field: string;
  currentValue: any;
  suggestedValue: any;
  reasoning: string;
  status: "pending" | "applied" | "rejected";
}

// ============================================
// Edit Action Types (for automatic edits)
// ============================================

export type MessageIntent = "edit" | "question" | "chat";

export interface EditAction {
  /** The type of edit action */
  type: "update_field" | "add_item" | "remove_item" | "replace_section";
  /** Target section in the tech pack */
  section: TechPackSection;
  /** The specific field to edit (for update_field and nested updates) */
  field?: string;
  /** The new value to set */
  value: any;
  /** Human-readable description of what's being changed */
  description: string;
}

export type TechPackSection =
  | "productName"
  | "productOverview"
  | "price"
  | "materials"
  | "dimensions"
  | "constructionDetails"
  | "hardwareComponents"
  | "colors"
  | "costStructure"
  | "costIncomeEstimation"
  | "sizeRange"
  | "packaging"
  | "careInstructions"
  | "qualityStandards"
  | "productionNotes"
  | "estimatedLeadTime"
  | "productionLogistics"
  | "category_Subcategory"
  | "intendedMarket_AgeRange";

/** Section to tab mapping */
export const SECTION_TO_TAB: Record<TechPackSection, string> = {
  productName: "overview",
  productOverview: "overview",
  price: "overview",
  materials: "materials",
  dimensions: "measurements",
  constructionDetails: "construction",
  hardwareComponents: "hardware",
  colors: "colors",
  costStructure: "overview",
  costIncomeEstimation: "overview",
  sizeRange: "sizes",
  packaging: "packaging",
  careInstructions: "care",
  qualityStandards: "quality",
  productionNotes: "production",
  estimatedLeadTime: "production",
  productionLogistics: "production",
  category_Subcategory: "overview",
  intendedMarket_AgeRange: "overview",
};

// ============================================
// Quick Action Types
// ============================================

export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: string;
  section?: string; // Optional - if specific to a section
}

// ============================================
// Product Context Types
// ============================================

export interface ProductImages {
  front: string;
  back: string | null;
  side?: string | null;
  bottom?: string | null;
  top?: string | null;
}

export interface TechFilesData {
  sketches: TechFileData[];
  closeups: TechFileData[];
  components: TechFileData[];
  baseViews: TechFileData[];
}

// ============================================
// Chat Panel Props
// ============================================

export interface AgenticChatPanelProps {
  /** Callback when AI applies an edit */
  onApplyEdit?: (section: TechPackSection, value: any, field?: string) => Promise<boolean>;

  /** Optional callback when AI suggests an edit (legacy) */
  onSuggestEdit?: (edit: EditSuggestion) => void;
}

// Props for MobileChatModal which doesn't use Zustand
export interface MobileChatModalProps {
  productId: string;
  productName: string;
  techPackData: any;
  techFilesData: TechFilesData | null;
  productImages: ProductImages;
  currentTechPack: any;
  activeSection: string;
  isOpen: boolean;
  onClose: () => void;
  onApplyEdit?: (section: TechPackSection, value: any, field?: string) => Promise<boolean>;
  onNavigateToSection?: (section: string) => void;
}

// ============================================
// Server Action Types
// ============================================

export interface AgenticChatRequest {
  message: string;
  productContext: string;
  conversationHistory: AgenticMessage[];
  activeSection?: string;
}

export interface AgenticChatResponse {
  success: boolean;
  response?: string;
  suggestedEdit?: EditSuggestion;
  /** Detected intent of the user message */
  intent?: MessageIntent;
  /** Edit action to apply automatically */
  editAction?: EditAction;
  error?: string;
}

// ============================================
// Hook Types
// ============================================

export interface UseAgenticChatReturn {
  messages: AgenticMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, quickActionId?: string) => Promise<void>;
  clearMessages: () => void;
}

// ============================================
// Quick Actions Configuration
// ============================================

export const QUICK_ACTIONS_BY_SECTION: Record<string, QuickAction[]> = {
  visualization: [
    {
      id: "describe-product",
      label: "Describe product",
      prompt: "Describe this product in detail based on all available data and images.",
      icon: "FileText",
    },
    {
      id: "suggest-improvements",
      label: "Suggest improvements",
      prompt: "What improvements would you suggest for this product design?",
      icon: "Lightbulb",
    },
  ],
  colors: [
    {
      id: "analyze-palette",
      label: "Analyze palette",
      prompt: "Analyze the color palette of this product. Are the colors well-balanced?",
      icon: "Palette",
    },
    {
      id: "suggest-colors",
      label: "Suggest alternatives",
      prompt: "Suggest alternative color combinations for this product.",
      icon: "Sparkles",
    },
  ],
  materials: [
    {
      id: "analyze-materials",
      label: "Analyze materials",
      prompt: "Analyze the materials used in this product. What are their properties?",
      icon: "Layers",
    },
    {
      id: "material-alternatives",
      label: "Suggest alternatives",
      prompt: "Suggest alternative materials that could reduce costs or improve quality.",
      icon: "RefreshCw",
    },
    {
      id: "sustainability-check",
      label: "Sustainability",
      prompt: "How sustainable are the current materials? What eco-friendly alternatives exist?",
      icon: "Leaf",
    },
  ],
  construction: [
    {
      id: "complexity-analysis",
      label: "Complexity analysis",
      prompt: "What is the manufacturing complexity of this design?",
      icon: "Settings",
    },
    {
      id: "cost-optimization",
      label: "Cost optimization",
      prompt: "How can we optimize the construction to reduce manufacturing costs?",
      icon: "DollarSign",
    },
    {
      id: "quality-check",
      label: "Quality factors",
      prompt: "What are the key quality control points for this construction?",
      icon: "CheckCircle",
    },
  ],
  measurements: [
    {
      id: "verify-dimensions",
      label: "Verify dimensions",
      prompt: "Are the measurements consistent across all views and sketches?",
      icon: "Ruler",
    },
    {
      id: "grading-suggestions",
      label: "Grading rules",
      prompt: "What grading rules would you suggest for scaling this product to different sizes?",
      icon: "Scale",
    },
  ],
  hardware: [
    {
      id: "hardware-analysis",
      label: "Analyze hardware",
      prompt: "Analyze the hardware components. Are they suitable for this product?",
      icon: "Wrench",
    },
    {
      id: "hardware-alternatives",
      label: "Alternatives",
      prompt: "Suggest alternative hardware options that could improve quality or reduce costs.",
      icon: "RefreshCw",
    },
  ],
  packaging: [
    {
      id: "packaging-analysis",
      label: "Analyze packaging",
      prompt: "Is the packaging suitable for this product? Any improvements needed?",
      icon: "Package",
    },
    {
      id: "eco-packaging",
      label: "Eco-friendly options",
      prompt: "What eco-friendly packaging alternatives would you suggest?",
      icon: "Leaf",
    },
  ],
  // Default actions for any section
  default: [
    {
      id: "explain-section",
      label: "Explain this",
      prompt: "Explain the current section and its importance in the tech pack.",
      icon: "HelpCircle",
    },
    {
      id: "suggest-edits",
      label: "Suggest edits",
      prompt: "Review this section and suggest any improvements or corrections.",
      icon: "Edit",
    },
  ],
};

export function getQuickActionsForSection(section: string): QuickAction[] {
  return QUICK_ACTIONS_BY_SECTION[section] || QUICK_ACTIONS_BY_SECTION.default;
}
