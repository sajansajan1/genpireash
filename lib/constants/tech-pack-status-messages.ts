/**
 * User-friendly status messages for tech pack generation
 * These messages explain what's happening during tech pack creation
 * in simple terms to keep users engaged during the generation process
 *
 * Icons use Lucide React components with custom color scheme
 */

import type { GenerationStatusMessage } from "./generation-status-messages";

// Tech pack uses the same interface as generation status messages
export type TechPackStatusMessage = GenerationStatusMessage;

export const TECH_PACK_STATUS_MESSAGES: TechPackStatusMessage[] = [
  {
    id: 1,
    message: "Analyzing your product design...",
    description: "Our AI is reviewing your product specifications",
    icon: "Search",
    duration: 6000,
  },
  {
    id: 2,
    message: "Calculating precise measurements...",
    description: "Determining accurate dimensions and sizing",
    icon: "Ruler",
    duration: 8000,
  },
  {
    id: 3,
    message: "Identifying materials and fabrics...",
    description: "Selecting the best materials for your product",
    icon: "Layers",
    duration: 8000,
  },
  {
    id: 4,
    message: "Creating technical drawings...",
    description: "Generating detailed product schematics",
    icon: "PenTool",
    duration: 9000,
  },
  {
    id: 5,
    message: "Defining construction methods...",
    description: "Outlining manufacturing processes",
    icon: "Wrench",
    duration: 8000,
  },
  {
    id: 6,
    message: "Writing material specifications...",
    description: "Documenting fabric and component details",
    icon: "FileText",
    duration: 8000,
  },
  {
    id: 7,
    message: "Adding grading and sizing charts...",
    description: "Creating size specifications for production",
    icon: "BarChart3",
    duration: 8000,
  },
  {
    id: 8,
    message: "Preparing color and finish details...",
    description: "Specifying exact colors and textures",
    icon: "Palette",
    duration: 7000,
  },
  {
    id: 9,
    message: "Generating bill of materials...",
    description: "Listing all components and quantities needed",
    icon: "List",
    duration: 8000,
  },
  {
    id: 10,
    message: "Calculating production costs...",
    description: "Estimating sample and bulk manufacturing prices",
    icon: "DollarSign",
    duration: 8000,
  },
  {
    id: 11,
    message: "Writing quality control guidelines...",
    description: "Setting standards for product inspection",
    icon: "CheckCircle2",
    duration: 7000,
  },
  {
    id: 12,
    message: "Creating packaging specifications...",
    description: "Defining how your product will be packaged",
    icon: "Package",
    duration: 7000,
  },
  {
    id: 13,
    message: "Adding manufacturing instructions...",
    description: "Writing step-by-step assembly guidance",
    icon: "BookOpen",
    duration: 8000,
  },
  {
    id: 14,
    message: "Preparing factory-ready documents...",
    description: "Formatting for manufacturer use",
    icon: "Factory",
    duration: 8000,
  },
  {
    id: 15,
    message: "Finalizing technical specifications...",
    description: "Completing all production details",
    icon: "FileCheck",
    duration: 7000,
  },
  {
    id: 16,
    message: "Organizing tech pack sections...",
    description: "Structuring the complete documentation",
    icon: "FolderOpen",
    duration: 7000,
  },
  {
    id: 17,
    message: "Running final quality checks...",
    description: "Ensuring all specifications are complete",
    icon: "Shield",
    duration: 7000,
  },
  {
    id: 18,
    message: "Generating downloadable files...",
    description: "Preparing your tech pack for export",
    icon: "Download",
    duration: 7000,
  },
  {
    id: 19,
    message: "Almost ready...",
    description: "Adding final touches to your tech pack",
    icon: "Sparkles",
    duration: 5000,
  },
  {
    id: 20,
    message: "Tech pack complete!",
    description: "Your factory-ready documentation is ready",
    icon: "CheckCircle",
    duration: 3000,
  },
];

// Calculate total duration (should be around 150 seconds / 2.5 minutes)
export const TOTAL_TECH_PACK_TIME = TECH_PACK_STATUS_MESSAGES.reduce(
  (total, msg) => total + msg.duration,
  0
);

// ~150 seconds total
