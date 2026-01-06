// types/product.ts
export interface GeneratedImage {
  id: string;
  type:
    | "vector"
    | "detail"
    | "technical"
    | "back"
    | "front"
    | "construction"
    | "callout"
    | "measurement"
    | "scaleProportion";
  url: string;
  description: string;
  relatedArea?: string;
  format?: "svg" | "png" | "jpg";
  isVector?: boolean;
  category?: string;
  technicalSpecs?: {
    dimensions?: string;
    materials?: string[];
    constructionNotes?: string;
  };
}

export interface TechPackData {
  id: string;
  user_id: string;
  prompt: string;
  tech_pack: {
    price: string;
    colors: {
      styleNotes: string;
      accentColors: {
        hex: string;
        name: string;
      }[];
      primaryColors: {
        hex: string;
        name: string;
      }[];
      trendAlignment: string;
    };
    materials: {
      notes: string;
      material: string;
      unitCost: string;
      component: string;
      specification: string;
      quantityPerUnit: string;
    }[];
    packaging: {
      notes: string;
      description: string;
      packagingDetails: {
        closureType: string;
        materialSpec: string;
        packagingType: string;
        innerPackaging: string;
        artworkFileReference: string;
        barcodeAndLabelPlacement: string;
      };
    };
    sizeRange: {
      sizes: string[];
      gradingLogic: string;
    };
    dimensions: {
      details: {
        width: { value: string; tolerance: string };
        height: { value: string; tolerance: string };
        length: { value: string; tolerance: string };
        weight: { value: string; tolerance: string };
      }[];
    };
    productName: string;
    costStructure: {
      costRange: string;
      sampleCost: {
        labor: string;
        overhead: string;
        shipping: string;
        materials: string;
        toolingSetup: string;
        totalSampleCost: string;
        packagingAndLabelingCost: string;
        samplingAndDevelopmentFees: string;
      };
      logisticsCost: {
        warehousing: string;
        domesticShipping: string;
        insurancePercent: string;
        customsDutiesPercent: string;
        internationalShipping: string;
      };
      complianceCost: {
        testing: string;
        labeling: string;
        certification: string;
        documentation: string;
      };
      productionCost: {
        packaging: string;
        laborPerUnit: string;
        orderQuantity: string;
        qualityControl: string;
        overheadPerUnit: string;
        materialsPerUnit: string;
      };
      pricingStrategy: {
        retailMarkupPercent: string;
        wholesaleMarkupPercent: string;
      };
      incomeEstimation: {
        monthlyUnits: string;
        growthRatePercent: string;
        seasonalityFactor: string;
        marketPenetrationPercent: string;
      };
      totalEstimatedCost: {
        notes: string;
        total: string;
      };
    };
    productOverview: string;
    productionNotes: string;
    careInstructions: string;
    qualityStandards: string;
    estimatedLeadTime: string;
    hardwareComponents: {
      hardware: string[];
      description: string;
    };
    constructionDetails: {
      rules: string[];
      description: string;
      constructionFeatures: {
        details: string;
        featureName: string;
      }[];
    };
    productionLogistics: {
      MOQ: string;
      leadTime: string;
      sampleRequirements: string;
    };
    category_Subcategory: string;
    costIncomeEstimation: {
      costRange: string;
      sampleCreation: {
        sampleCost: string;
        materialCost: string;
        packagingAndLabelingCost: string;
        laborAndManufacturingCost: string;
        samplingAndDevelopmentFees: string;
      };
      totalEstimatedCost: {
        notes: string;
        total: string;
      };
      shippingAndLogistics: {
        internationalCost: string;
      };
    };
    intendedMarket_AgeRange: string;
  };
  image_data: {
    back: {
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
}

export interface GeneratedTechPackImages {
  vectorImage?: GeneratedImage;
  detailImage?: GeneratedImage;
  technicalImage?: GeneratedImage;
  frontViewImage?: GeneratedImage;
  backViewImage?: GeneratedImage;
  constructionImage?: GeneratedImage;
  calloutImage?: GeneratedImage;
  measurementImage?: GeneratedImage;
  scaleProportionImage?: GeneratedImage;
  componentMeasurements?: any; // Component measurement data for display
  category: string;
}

export interface ImageGenerationOptions {
  quality?: "standard" | "hd";
  style?: "natural" | "vivid";
  size?: "1024x1024";
  includeMetadata?: boolean;
}
