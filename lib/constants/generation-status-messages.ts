/**
 * User-friendly status messages for product generation/editing
 * These messages explain what's happening in the backend in simple terms
 * to keep users engaged during the ~2 minute wait time
 *
 * Icons use Lucide React components with custom color scheme
 */

export interface GenerationStatusMessage {
  id: number;
  message: string;
  description: string;
  icon: string; // Name of Lucide React icon
  duration: number; // milliseconds
}

export const GENERATION_STATUS_MESSAGES: GenerationStatusMessage[] = [
  {
    id: 1,
    message: "Understanding your design vision...",
    description: "Our AI is analyzing your product idea",
    icon: "Brain",
    duration: 5000, // milliseconds
  },
  {
    id: 2,
    message: "Bringing your idea to life...",
    description: "Creating your unique product design",
    icon: "Sparkles",
    duration: 6000,
  },
  {
    id: 3,
    message: "Perfecting every detail...",
    description: "Ensuring your design looks professional",
    icon: "Scan",
    duration: 5000,
  },
  {
    id: 4,
    message: "Crafting the front view...",
    description: "Generating high-quality product imagery",
    icon: "Image",
    duration: 8000,
  },
  {
    id: 5,
    message: "Designing the back view...",
    description: "Creating consistent multi-angle views",
    icon: "RotateCw",
    duration: 8000,
  },
  {
    id: 6,
    message: "Building the side perspective...",
    description: "Adding depth to your product",
    icon: "Maximize2",
    duration: 7000,
  },
  {
    id: 7,
    message: "Creating overhead view...",
    description: "Capturing every angle perfectly",
    icon: "Layout",
    duration: 7000,
  },
  {
    id: 8,
    message: "Optimizing image quality...",
    description: "Making sure everything looks crystal clear",
    icon: "Sparkle",
    duration: 6000,
  },
  {
    id: 9,
    message: "Enhancing colors and textures...",
    description: "Adding realistic materials and finishes",
    icon: "Palette",
    duration: 5000,
  },
  {
    id: 10,
    message: "Calculating product dimensions...",
    description: "Determining accurate measurements",
    icon: "Ruler",
    duration: 5000,
  },
  {
    id: 11,
    message: "Analyzing design feasibility...",
    description: "Ensuring your product can be manufactured",
    icon: "Search",
    duration: 6000,
  },
  {
    id: 12,
    message: "Writing product specifications...",
    description: "Creating detailed technical information",
    icon: "FileText",
    duration: 6000,
  },
  {
    id: 13,
    message: "Preparing manufacturing guidelines...",
    description: "Making it factory-ready",
    icon: "Factory",
    duration: 5000,
  },
  {
    id: 14,
    message: "Estimating production costs...",
    description: "Calculating sample and bulk pricing",
    icon: "DollarSign",
    duration: 5000,
  },
  {
    id: 15,
    message: "Organizing product data...",
    description: "Structuring all the information",
    icon: "Package",
    duration: 4000,
  },
  {
    id: 16,
    message: "Saving your design securely...",
    description: "Protecting your intellectual property",
    icon: "Lock",
    duration: 4000,
  },
  {
    id: 17,
    message: "Creating revision history...",
    description: "Setting up version tracking",
    icon: "FolderOpen",
    duration: 4000,
  },
  {
    id: 18,
    message: "Running quality checks...",
    description: "Ensuring everything meets standards",
    icon: "CheckCircle2",
    duration: 5000,
  },
  {
    id: 19,
    message: "Finalizing your product...",
    description: "Adding the finishing touches",
    icon: "Target",
    duration: 5000,
  },
  {
    id: 20,
    message: "Almost ready to launch...",
    description: "Preparing your product dashboard",
    icon: "Rocket",
    duration: 3000,
  },
];

// Calculate total duration (should be around 2 minutes / 120 seconds)
export const TOTAL_GENERATION_TIME = GENERATION_STATUS_MESSAGES.reduce(
  (total, msg) => total + msg.duration,
  0
);

// ~115 seconds total
