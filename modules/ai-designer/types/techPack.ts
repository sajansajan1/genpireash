/**
 * Tech Pack Type Definitions
 * Complete TypeScript interfaces for tech pack data structures
 */

// ============================================================================
// Core Tech Pack Types
// ============================================================================

export interface TechPackData {
  id?: string;
  product_idea_id: string;
  revision_id?: string;
  user_id: string;
  revision_number?: number;
  is_active: boolean;
  tech_pack_data: TechPackContent;
  metadata?: TechPackMetadata;
  technical_images?: TechnicalImages;
  created_at?: string;
  updated_at?: string;
}

export interface TechPackContent {
  // Product Information
  productName: string;
  productOverview: string;
  productionNotes?: string;
  category_Subcategory?: string;
  intendedMarket_AgeRange?: string;
  careInstructions?: string;
  price?: number;
  estimatedLeadTime?: string;

  // Colors
  colors: ColorSection;

  // Materials (Bill of Materials)
  materials: Material[];

  // Hardware
  hardwareComponents?: HardwareComponents;

  // Construction
  constructionDetails: ConstructionDetails;

  // Dimensions/Measurements
  dimensions: Record<string, Dimension>;

  // Labeling
  labels?: Labels;

  // Packaging
  packaging?: Packaging;

  // Production & Logistics
  productionLogistics?: ProductionLogistics;

  // Sizes
  sizeRange?: SizeRange;

  // Quality Standards
  qualityStandards?: string;

  // Cost Structure
  costIncomeEstimation?: CostIncomeEstimation;
  costStructure?: CostStructure;
}

export interface TechPackMetadata {
  generated_at?: string;
  revision_context?: 'revision' | 'original';
  generation_source?: 'ai_designer' | 'tech_pack_page';
  [key: string]: any;
}

// ============================================================================
// Section-Specific Types
// ============================================================================

export interface ColorSection {
  styleNotes: string;
  trendAlignment: string;
  primaryColors: ColorItem[];
  accentColors: ColorItem[];
}

export interface ColorItem {
  name: string;
  hex: string;
}

export interface Material {
  component: string;
  material: string;
  specification: string;
  quantityPerUnit: number;
  unitCost: number;
  notes?: string;
}

export interface HardwareComponents {
  description: string;
  hardware: string[];
}

export interface ConstructionDetails {
  description: string;
  constructionFeatures: ConstructionFeature[];
}

export interface ConstructionFeature {
  featureName: string;
  details: string;
}

export interface Dimension {
  value: string;
  tolerance: string;
  description?: string;
}

export interface Labels {
  logo: string; // URL or text
  labelType: string;
  placement: string;
  dimensions: string;
  colorReference: string;
  content: string;
  preview?: string;
}

export interface Packaging {
  description: string;
  dimensions?: string;
  materials?: string[];
  packagingDetails?: PackagingDetails;
}

export interface PackagingDetails {
  packagingType: string;
  materialSpec: string;
  closureType: string;
  innerPackaging: string;
  artworkFileReference: string;
  barcodeAndLabelPlacement: string;
}

export interface ProductionLogistics {
  MOQ: string; // Minimum Order Quantity
  leadTime: string;
  sampleRequirements: string;
}

export interface SizeRange {
  gradingLogic: string;
  sizes: string[];
}

export interface CostIncomeEstimation {
  sampleCreation?: Record<string, any>;
  bulkProduction1000?: Record<string, any>;
}

export interface CostStructure {
  [key: string]: any;
}

// ============================================================================
// Technical Images
// ============================================================================

export interface TechnicalImages {
  technicalImage?: ImageData;
  vectorImage?: ImageData;
  detailImage?: ImageData;
  frontViewImage?: ImageData;
  backViewImage?: ImageData;
  constructionImage?: ImageData;
  calloutImage?: ImageData;
  measurementImage?: ImageData;
  scaleProportionImage?: ImageData;
}

export interface ImageData {
  url: string;
  type?: string;
}

// ============================================================================
// File Generation Types
// ============================================================================

export interface TechPackFiles {
  pdf?: FileInfo;
  excel?: FileInfo;
  technicalImages?: TechnicalFileInfo[];
  printFiles?: FileInfo;
}

export interface FileInfo {
  url?: string;
  name: string;
  size?: number;
  generatedAt?: string;
  status: 'pending' | 'ready' | 'failed';
}

export interface TechnicalFileInfo extends FileInfo {
  type: 'svg' | 'png' | 'jpg';
  category: 'technical' | 'vector' | 'detail' | 'front' | 'back' | 'construction' | 'callout';
}

// ============================================================================
// Generation Types
// ============================================================================

export interface GenerationStatus {
  status: 'idle' | 'generating' | 'completed' | 'failed';
  progress: number; // 0-100
  currentStep: string;
  taskId?: string;
  error?: string;
}

export interface GenerationResult {
  success: boolean;
  techPackId?: string;
  data?: TechPackData;
  error?: string;
}

export interface FileGenerationResult {
  success: boolean;
  files?: TechPackFiles;
  creditsUsed?: number;
  error?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface TechPackApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TechPackListResponse {
  success: boolean;
  techPacks?: TechPackData[];
  error?: string;
}

// ============================================================================
// Widget/UI Types
// ============================================================================

export interface TechPackWidgetProps {
  productId: string;
  isGenerated: boolean;
  isGenerating: boolean;
  generationProgress?: number;
  generationStep?: string;
  techPackData?: TechPackData;
  onGenerate: () => Promise<void>;
  onExpand: () => void;
  className?: string;
}

export interface TechPackDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  techPackData: TechPackData | null;
  onUpdate: (updates: Partial<TechPackContent>) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export type TechPackTab = 'guidelines' | 'technical' | 'files';

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseTechPackDataReturn {
  techPack: TechPackData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  update: (updates: Partial<TechPackContent>) => Promise<boolean>;
}

export interface UseTechPackFilesReturn {
  files: TechPackFiles;
  loading: boolean;
  downloadPDF: () => Promise<void>;
  downloadExcel: () => Promise<void>;
  downloadAllFiles: () => Promise<void>;
  generateTechnicalFiles: () => Promise<boolean>;
  shareTechPack: (method: 'email' | 'whatsapp', recipient: string) => Promise<boolean>;
}

export interface UseTechPackGenerationReturn {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
  error: string | null;
  generate: (productId: string, revisionId?: string) => Promise<boolean>;
  cancel: () => void;
}

export interface UseTechPackPollingReturn {
  status: GenerationStatus;
  startPolling: (taskId: string) => void;
  stopPolling: () => void;
}

// ============================================================================
// Product Dimensions Types (from product_ideas.product_dimensions)
// ============================================================================

export interface ProductDimensionValue {
  value: number;
  unit: string;
}

export interface ProductDimensionSet {
  height?: ProductDimensionValue;
  width?: ProductDimensionValue;
  length?: ProductDimensionValue;
  weight?: ProductDimensionValue;
  volume?: ProductDimensionValue;
  diameter?: ProductDimensionValue;
  additionalDimensions?: Array<{
    name: string;
    value: number;
    unit: string;
    description?: string;
  }>;
}

export interface ProductDimensionsData {
  user?: ProductDimensionSet;
  recommended?: ProductDimensionSet;
  productType?: string;
  marketStandard?: string;
  source?: string;
  generatedAt?: string;
  approvedAt?: string;
}

// Product Materials Types
export interface ProductMaterialItem {
  component: string;
  material: string;
  specification: string;
  color?: string;
  finish?: string;
  notes?: string;
}

export interface ProductMaterialsData {
  recommended?: ProductMaterialItem[];
  user?: ProductMaterialItem[];
  productType?: string;
  source?: string;
  generatedAt?: string;
  approvedAt?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type TechPackStatus = 'not_generated' | 'generating' | 'generated' | 'error';

export interface TechPackError {
  code: string;
  message: string;
  details?: any;
}

// ============================================================================
// Constants
// ============================================================================

export const TECH_PACK_CREDITS = {
  GENERATION: 0, // Free - included in product creation
  TECHNICAL_FILES: 6,
  MODEL_3D: 10,
} as const;

export const GENERATION_STEPS = [
  { progress: 0, message: 'Starting generation...' },
  { progress: 25, message: 'Analyzing product dimensions...' },
  { progress: 50, message: 'Generating materials BOM...' },
  { progress: 75, message: 'Creating construction details...' },
  { progress: 90, message: 'Finalizing specifications...' },
  { progress: 100, message: 'Complete!' },
] as const;

export const TECH_PACK_FILE_TYPES = {
  PDF: 'pdf',
  EXCEL: 'excel',
  SVG: 'svg',
  PNG: 'png',
  ZIP: 'zip',
} as const;

// ============================================================================
// Type Guards
// ============================================================================

export function isTechPackData(data: any): data is TechPackData {
  return (
    data &&
    typeof data === 'object' &&
    'product_idea_id' in data &&
    'tech_pack_data' in data
  );
}

export function hasTechnicalImages(data: any): data is { technical_images: TechnicalImages } {
  return data && typeof data === 'object' && 'technical_images' in data;
}

export function isGenerating(status: TechPackStatus): boolean {
  return status === 'generating';
}

export function isGenerated(status: TechPackStatus): boolean {
  return status === 'generated';
}
