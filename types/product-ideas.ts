/**
 * TypeScript interfaces for product_ideas table
 */

export interface ProductImageData {
  front?: {
    url: string;
    prompt_used?: string;
  };
  back?: {
    url: string;
    prompt_used?: string;
  };
  side?: {
    url: string;
    prompt_used?: string;
  };
  top?: {
    url: string;
    prompt_used?: string;
  };
  bottom?: {
    url: string;
    prompt_used?: string;
  };
  illustration?: {
    url: string;
    prompt_used?: string;
  };
}

export interface TechnicalFilesV2 {
  images: {
    flatSketch: {
      front: string; // URL to front flat sketch image
      back: string; // URL to back flat sketch image
    };
    measurementSheet: string; // URL to measurement diagram
    constructionSheet: string; // URL to construction callout diagram
    detailViews?: Array<{
      url: string; // URL to detail image
      area: string; // description of detail area
    }>; // optional, only for complex products
  };
  textPanels: {
    flatSketch: {
      title: string;
      views: string[];
      specifications: {
        productName: string;
        category: string;
        description: string;
        keyFeatures: string[];
        constructionNotes: string;
      };
    };
    measurements: {
      title: string;
      measurementTable: {
        headers: string[];
        rows: Array<{
          point: string;
          value: string;
          tolerance: string;
          grading: string;
        }>;
      };
      notes: string[];
    };
    construction: {
      title: string;
      calloutLegend: Array<{
        number: number;
        description: string;
        type: "material" | "hardware" | "construction";
      }>;
      bomTable: {
        headers: string[];
        rows: Array<{
          item: string;
          material: string;
          quantity: string;
          placement: string;
        }>;
      };
      constructionNotes: {
        seamType: string;
        stitchesPerInch: string;
        finishing: string;
        specialInstructions: string[];
      };
    };
    details?: {
      title: string;
      details: Array<{
        viewName: string;
        specifications: {
          construction: string;
          materials: string[];
          hardware?: string;
          specialNotes: string[];
        };
      }>;
    }; // optional, only for complex products
  };
  metadata: {
    generatedAt: string; // ISO timestamp
    productName: string;
    hasComplexFeatures: boolean;
    version: string;
  };
}

export interface ProductDimensionValue {
  value: string;
  unit: string;
}

export interface ProductDimensions {
  height?: ProductDimensionValue;
  width?: ProductDimensionValue;
  length?: ProductDimensionValue;
  weight?: ProductDimensionValue;
  volume?: ProductDimensionValue;
  additionalDimensions?: Array<{
    name: string;
    value: string;
    unit: string;
    description?: string;
  }>;
}

export interface ProductDimensionsData {
  recommended: ProductDimensions;
  user: ProductDimensions | null;
  productType: string;
  marketStandard: string;
  source: "ai_generated" | "user_defined" | "hybrid";
  generatedAt: string;
  approvedAt?: string;
}

export interface ProductMaterial {
  component: string;
  material: string;
  specification: string;
  color?: string;
  finish?: string;
  notes?: string;
}

export interface ProductMaterialsData {
  recommended: ProductMaterial[];
  user: ProductMaterial[] | null;
  productType: string;
  source: "ai_generated" | "user_defined" | "hybrid";
  generatedAt: string;
  approvedAt?: string;
}

/**
 * Supported product categories in Genpire
 */
export type ProductCategory =
  | 'apparel'
  | 'footwear'
  | 'accessories'
  | 'bags'
  | 'jewellery'
  | 'toys'
  | 'hats'
  | 'furniture'
  | 'other';

export interface ProductIdea {
  id: string; // uuid
  user_id: string; // uuid
  prompt: string;
  tech_pack?: any; // jsonb - could be further typed based on your tech pack structure
  image_data?: ProductImageData; // jsonb
  status?: string;
  category?: ProductCategory | null; // Standardized product category (apparel, footwear, etc.)
  category_subcategory?: string | null; // Detailed category with subcategories (e.g., "Plush Toy → Animal → Safari Collection")
  created_at: string; // timestamp with time zone
  updated_at?: string; // timestamp with time zone
  technical_images?: any; // jsonb - legacy field?
  technical_files_v2?: TechnicalFilesV2; // jsonb
  product_dimensions?: ProductDimensionsData; // jsonb - AI-recommended and user dimensions
  product_materials?: ProductMaterialsData; // jsonb - AI-recommended and user materials
}

// Type for updating image_data
export interface UpdateImageDataParams {
  productId: string;
  imageData: Partial<ProductImageData>;
  merge?: boolean; // Whether to merge with existing data or replace
}
