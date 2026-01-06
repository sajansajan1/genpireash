export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
};

export type TechPack = {
  id: string;
  image_data?: {
    front: {
      url: string;
    };
  };
  tech_pack: {
    productName: string;
    productOverview: string;
    price?: string;
    estimatedLeadTime?: string | null;
    materials?: {
      alternatives: string[];
    }[];
  };
  created_at: string;
  updated_at: string | null;
  status: string;
  file_path: string | null;
};

export interface TechProductData {
  created_at: string;
  updated_at: string;
  status: string;
}

export interface creatorProfile {
  full_name?: string;
  avatar_url?: string;
  country?: string;
  categories?: string;
  address?: string;
  contact?: string;
  email?: string;
  bio?: string;
  website_url?: string;
  brand_description?: string;
  brand_size?: string;
  target_market?: string;
  order_size?: string;
  id?: string;
  user_id?: string;
  role?: string;
  designation?: string;
  team_size?: string;
  referredBy?: string;
  offers?: boolean;
  experience?: string
}

export interface supplierProfile {
  company_name: string | null;
  location: string | null;
  website: string | null;
  company_description: string | null;
  email: string | null;
  contact: string | null;
  full_name: string | null;
  address: string | null;
  company_logo?: string | null;
  manufacturingID?: string | null;
}

export interface rfq {
  title: string;
  product_idea: string;
  techpack_id: string;
  creator_id: string;
  timeline: string;
  quantity: string;
  target_price: string;
  status: string;
}

export interface supplierRfq {
  supplier_id: string;
  rfqs_id: string;
}

export interface manufacturing_capabilities {
  product_categories: string[];
  product_capability: string[];
  material_specialist: string[];
  export_market: string[];
  moq: string;
  leadTimeMin: string;
  leadTimeMax: string;
  samplePricing: string;
  productionCapacity: string;
  certifications: string[];
  isExclusive: boolean;
  aboutFactory: string;
}

export interface Message {
  id: string;
  created_at: string;
  message: string;
  sender_id: string;
  chats?: string;
  user: Participant;
}

export interface Participant {
  id: string;
  name: string;
  avatar_url?: string;
  company_logo?: string;
}

export interface Conversation {
  id: string;
  chatId: string;
  participant_1: string;
  participant_2: string;
  participant: Participant;
  lastMessage: Message | null;
  createdAt: string;
  updatedAt: string;
}

export interface RFQ {
  rfq: {
    id: string;
    created_at: string;
    title: string;
    product_idea: string;
    techpack_id: string;
    timeline: string;
    quantity: string;
    target_price: string;
    creator_id: string;
    status: string;
    updated_at: string;
  };
  techpack: {
    id: string;
    user_id: string;
    prompt: string;
    tech_pack: {
      price: string;
      colors: {
        styleNotes: string;
        accentColors: any[];
        primaryColors: {
          hex: string;
          name: string;
        }[];
        trendAlignment: string;
      };
      materials: {
        name: string;
        reason: string;
        costScore: number;
        alternatives: string[];
        sustainabilityScore: number;
      }[];
      packaging: {
        materials: string[];
        dimensions: string;
        description: string;
      };
      sizeRange: {
        sizes: string[];
        gradingLogic: string;
      };
      dimensions: {
        width: string;
        height: string;
        weight: string;
        sleeves: string;
        industryComparison: string;
      };
      productName: string;
      productOverview: string;
      productionNotes: string;
      careInstructions: string;
      qualityStandards: string;
      estimatedLeadTime: string;
      hardwareComponents: {
        hardware: any[];
        description: string;
      };
      constructionDetails: {
        description: string;
        construction: string[];
      };
    };
    image_data: {
      back: null | {
        url: string;
        created_at: string;
        prompt_used: string;
        regenerated: boolean;
      };
      side: null | {
        url: string;
        created_at: string;
        prompt_used: string;
        regenerated: boolean;
      };
      front: {
        url: string;
        created_at: string;
        prompt_used: string;
        regenerated: boolean;
      };
    };
    status: string;
    created_at: string;
    updated_at: string;
  };
  creator: {
    avatar_url: string;
    full_name: string;
    id: string;
    user_id: string;
    email?: string;
  };
  quote: {
    id: string;
    created_at: string;
    updated_at: string;
    rfq_id: string;
    supplier_id: string;
    sample_price: string;
    moq: string;
    lead_time: string;
    message: string;
    status: string;
  };
}

export interface SubmitRfq {
  rfq_id: string;
  supplier_id: string;
  sample_price: string;
  moq: string;
  lead_time: string;
  message: string;
  status: string;
}

export interface AcceptRFQ {
  rfq_id: string;
  supplier_id: string;
  status: string;
}

export interface RFQCreator {
  rfq: {
    id: string;
    created_at: string;
    title: string;
    product_idea: string;
    techpack_id: string;
    timeline: string;
    quantity: string;
    target_price: string;
    creator_id: string;
    status: string;
    updated_at: string;
  };
  techpack: {
    id: string;
    user_id: string;
    prompt: string;
    tech_pack: {
      price: string;
      colors: {
        styleNotes: string;
        accentColors: any[]; // Consider specifying a proper type here
        primaryColors: {
          hex: string;
          name: string;
        }[];
        trendAlignment: string;
      };
      materials: {
        name: string;
        reason: string;
        costScore: number;
        alternatives: string[];
        sustainabilityScore: number;
      }[];
      packaging: {
        materials: string[];
        dimensions: string;
        description: string;
      };
      sizeRange: {
        sizes: string[];
        gradingLogic: string;
      };
      dimensions: {
        width: string;
        height: string;
        weight: string;
        sleeves: string;
        industryComparison: string;
      };
      productName: string;
      productOverview: string;
      productionNotes: string;
      careInstructions: string;
      qualityStandards: string;
      estimatedLeadTime: string;
      hardwareComponents: {
        hardware: any[]; // Consider typing this more specifically
        description: string;
      };
      constructionDetails: {
        description: string;
        construction: string[];
      };
    };
    image_data: {
      back: null | {
        url: string;
        created_at: string;
        prompt_used: string;
        regenerated: boolean;
      };
      side: null | {
        url: string;
        created_at: string;
        prompt_used: string;
        regenerated: boolean;
      };
      front: {
        url: string;
        created_at: string;
        prompt_used: string;
        regenerated: boolean;
      };
    };
    status: string;
    created_at: string;
    updated_at: string;
  };
  suppliers: {
    profile: {
      location: string;
      company_name: string;
      id: string;
      user_id: string;
      company_logo: string;
    };
    quote?: {
      id: string;
      created_at: string;
      updated_at: string;
      rfq_id: string;
      supplier_id: string;
      sample_price: string;
      moq: string;
      lead_time: string;
      message: string;
      status: string;
    } | null;
  }[];
}

export interface Payments {
  user_id: string;
  quantity: number;
  price: string;
  payment_status: string;
  payer_id: string;
  payer_name: string;
  payer_address: string;
  payer_email: string;
  currency: string;
}

export interface CreateOrder {
  user_id: string;
  tech_pack_id: string;
  order_number: string;
  customer_name: string;
  delivery_date: string;
  payment_terms: string;
  minimum_order_quantity: string;
  special_instructions?: string;
}

export interface UserDetails {
  id: string;
  email: string;
  created_at: string;
  full_name: string;
  updated_at: string;
  credits: string;
  verified_status: Boolean;
  isAmbassador: Boolean;
  offers: boolean;
  referred_by_user?: {
    full_name: string;
  };
}

export interface SupplierDetails {
  id: string;
  email: string;
  created_at: string;
  full_name: string;
  updated_at: string;
  credits: string;
  verified_status: Boolean;
  isAmbassador: Boolean;
  offers: boolean;
  referred_by_user?: {
    full_name: string;
  };
}

export interface Manufacturing {
  created_at?: string;
  updated_at?: string;
  aboutFactory?: string;
  certifications?: string[];
  factory_gallery?: string | null;
  id?: string;
  isExclusive?: boolean;
  leadTimeMax?: string;
  leadTimeMin?: string;
  material_specialist?: string[];
  moq?: string;
  product_categories?: string[];
  product_images?: string | null;
  productionCapacity?: string;
  samplePricing?: string;
  manufacturingID?: string;
  website?: string;
  product_capability?: string[];
  export_market?: string[];
}
export interface UserProfile {
  address?: string | null;
  company_description?: string;
  company_logo?: string;
  company_name?: string;
  company_url?: string;
  contact?: string;
  created_at?: string;
  email?: string;
  full_name?: string;
  id?: string;
  location?: string;
  manufacturing?: Manufacturing;
  role?: string;
  updated_at?: string;
  user_id?: string;
  verified_profile?: boolean;
  website?: string;
}
export interface SupplierProfile {
  address?: string | null;
  company_description?: string;
  company_logo?: string;
  company_name?: string;
  company_url?: string;
  contact?: string;
  created_at?: string;
  email?: string;
  full_name?: string;
  id?: string;
  location?: string;
  manufacturing?: Manufacturing;
  role?: string;
  updated_at?: string;
  user_id?: string;
}

export interface ProductIdea {
  id: string;
  user_id: string;
  prompt: string;
  status: string;
  created_at: string;
  updated_at: string;
  tech_pack: TechPacks;
  image_data: ImageData;
}

/**
 * Supported product categories
 */
export type ProductCategoryType =
  | 'apparel'
  | 'footwear'
  | 'accessories'
  | 'bags'
  | 'jewellery'
  | 'toys'
  | 'hats'
  | 'furniture'
  | 'other';

export interface TechPacks {
  productName: string;
  productOverview: string;
  price: string;
  estimatedLeadTime?: string;
  careInstructions?: string;
  qualityStandards?: string;
  productionNotes?: string | ProductionNotes;
  colors: Colors;
  materials: Material[];
  packaging: Packaging;
  sizeRange: SizeRange;
  costIncomeEstimation: costIncomeEstimation;
  costStructure: CostStructure;
  dimensions: Dimensions;
  constructionDetails: ConstructionDetails;
  hardwareComponents: HardwareComponents;
  productionLogistics: ProductionLogistics | any;
  intendedMarket_AgeRange: string;
  category: ProductCategoryType; // Standardized category (apparel, footwear, etc.)
  category_Subcategory: string; // Detailed category with subcategories
  sectionSummaries?: SectionSummaries; // Brief explanations for each section
}

export type SampleCost = {
  materials: string;
  labor: string;
  overhead: string;
  toolingSetup: string;
  shipping: string;
  samplingAndDevelopmentFees: string;
  packagingAndLabelingCost: string;
  totalSampleCost: string;
};

export type ProductionCost = {
  materialsPerUnit: string;
  laborPerUnit: string;
  overheadPerUnit: string;
  qualityControl: string;
  packaging: string;
  orderQuantity: string;
};

export type LogisticsCost = {
  domesticShipping: string;
  internationalShipping: string;
  customsDutiesPercent: string; // percentage
  warehousing: string;
  insurancePercent: string; // percentage
};

export type ComplianceCost = {
  testing: string;
  certification: string;
  labeling: string;
  documentation: string;
};

export type PricingStrategy = {
  wholesaleMarkupPercent: string;
  retailMarkupPercent: string;
};

export type IncomeEstimation = {
  monthlyUnits: string;
  growthRatePercent: string;
  seasonalityFactor: string;
  marketPenetrationPercent: string;
};

export type CostStructure = {
  sampleCost: SampleCost;
  productionCost: ProductionCost;
  logisticsCost: LogisticsCost;
  complianceCost: ComplianceCost;
  pricingStrategy: PricingStrategy;
  incomeEstimation: IncomeEstimation;
  totalEstimatedCost: TotalEstimatedCost;
  costRange: string;
};

export interface costIncomeEstimation {
  sampleCreation: SampleCreation;
  shippingAndLogistics: ShippingAndLogistics;
  totalEstimatedCost: TotalEstimatedCost;
}

interface SampleCreation {
  materialCost: string;
  laborAndManufacturingCost: string;
  samplingAndDevelopmentFees: string;
  packagingAndLabelingCost: string;
  sampleCost: string;
}

interface ShippingAndLogistics {
  internationalCost: string;
}

interface TotalEstimatedCost {
  total: string;
  notes: string;
}

export interface Colors {
  styleNotes: string;
  trendAlignment: string;
  primaryColors: Color[];
  accentColors: Color[];
}

export interface Color {
  name: string;
  hex: string;
}

export interface Material {
  name: string;
  reason: string;
  alternatives: string[];
  sustainabilityScore: number;
  costScore: number;
}

export interface Packaging {
  materials: string[];
  dimensions: string;
  description: string;
  packagingDetails: any;
}

export interface SizeRange {
  sizes: string[];
  gradingLogic: string;
}

export interface Dimensions {
  weight: string;
  details: any;
  industryComparison: string;
}

export interface DimensionDetail {
  name: string;
  value: string;
  reason: string;
}

export interface ConstructionFeature {
  featureName: string;
  details: string;
  category?: "assembly" | "joining" | "finishing" | "reinforcement" | "treatment";
}

export interface CriticalTolerance {
  feature: string;
  tolerance: string;
  inspectionMethod: string;
}

export interface ConstructionDetails {
  description: string;
  constructionFeatures: ConstructionFeature[];
  assemblySequence?: string[];
  criticalTolerances?: CriticalTolerance[];
  specialEquipment?: string[];
}

export interface FactoryRequirements {
  certifications: string[];
  equipmentNeeded: string[];
  skillLevel: string;
}

export interface QualityControl {
  inlineInspection: string;
  finalInspection: string;
  testingRequired: string[];
}

export interface ProductionLogistics {
  MOQ: string;
  leadTime: string;
  sampleRequirements: string;
  productionCapacity?: string;
  factoryRequirements?: FactoryRequirements;
  qualityControl?: QualityControl;
  packingMethod?: string;
}

export interface ProductionNotes {
  manufacturingWarnings?: string[];
  specialInstructions?: string[];
  commonDefects?: string[];
  materialHandling?: string;
  wastageAllowance?: string;
  productionTips?: string[];
}

export interface HardwareComponents {
  description: string;
  hardware: string[];
}

/**
 * Section summaries provide brief explanations of each product section
 * These help users understand the purpose and content of each section
 */
export interface SectionSummaries {
  visual?: string;
  factorySpecs?: string;
  specifications?: string;
  construction?: string;
  production?: string;
}

export interface ImageData {
  front?: ImageMeta;
  back?: ImageMeta;
}

export interface ImageMeta {
  url: string;
  created_at: string;
  prompt_used: string;
  regenerated: boolean;
}
