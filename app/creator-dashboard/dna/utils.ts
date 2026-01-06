import { FormData } from "@/lib/types/brand_dna";

export const initialFormData = {
  websiteUrl: "",
  instagramHandle: "",
  tiktokHandle: "",
  pinterestHandle: "",
  brandName: "",
  category: "",
  targetAudience: "",
  tagline: "",
  styleKeywords: [],
  colorPalette: [],
  materials: [],
  patterns: [],
  tone: "",
  inspirationImages: [],
  dosAndDonts: "",
  summary: "",
  logo_url: "",
  status: false,
  brand_title: "",
  brand_subtitle: "",
  brand_assets: [],
  company_techpack: [],
  context_prompt: "",
};

export const getUpdatedFields = (formData: any, existing: any) => {
  if (!existing) return null;

  const fieldMap = {
    websiteUrl: "website_url",
    status: "status",
    brand_title: "brand_title",
    brand_subtitle: "brand_subtitle",
    summary: "summary",
    logo_url: "logo_url",
    instagramHandle: "insta_url",
    tiktokHandle: "tiktok_url",
    pinterestHandle: "pinterest_url",
    brandName: "brand_name",
    category: "category",
    tagline: "tagline",
    colorPalette: "colors",
    styleKeywords: "style_keyword",
    materials: "materials",
    inspirationImages: "mood_board",
    tone: "tone_values",
    dosAndDonts: "restrictions",
    patterns: "patterns",
    targetAudience: "audience",
    brand_assets: "brand_assets",
    company_techpack: "company_techpack",
    context_prompt: "context_prompt",
  };

  const updated: any = {};

  Object.entries(fieldMap).forEach(([formKey, apiKey]) => {
    const newValue = formData[formKey];
    const oldValue = existing[apiKey];

    const isArray = Array.isArray(newValue);
    console.log("isArray ==> ", isArray);

    if (isArray) {
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        updated[apiKey] = newValue;
      }
    } else {
      if (newValue !== oldValue) {
        updated[apiKey] = newValue;
      }
    }
  });

  return updated;
};

export const getCreatePayload = (formData: FormData, creatorProfile: any) => ({
  creator_id: creatorProfile?.id || null,
  website_url: formData.websiteUrl,
  insta_url: formData.instagramHandle,
  tiktok_url: formData.tiktokHandle,
  pinterest_url: formData.pinterestHandle,
  brand_name: formData.brandName,
  brand_title: formData.brand_title,
  brand_subtitle: formData.brand_subtitle,
  category: formData.category,
  tagline: formData.tagline,
  colors: formData.colorPalette,
  style_keyword: formData.styleKeywords,
  materials: formData.materials,
  mood_board: formData.inspirationImages,
  tone_values: formData.tone,
  restrictions: formData.dosAndDonts,
  patterns: formData.patterns,
  audience: formData.targetAudience,
  summary: formData.summary,
  logo_url: formData.logo_url,
  brand_assets: formData.brand_assets,
  company_techpack: formData.company_techpack,
  status: formData.status,
  context_prompt: formData.context_prompt,
});

export const mapFormDataToSuggestedData = (form: FormData) => ({
  brand_name: form.brandName || "",
  category: form.category || "",
  style_keywords: form.styleKeywords || [],
  color_palette: form.colorPalette || [],
  materials: form.materials || [],
  patterns: form.patterns || [],
  tagline: form.tagline || "",
  audience: form.targetAudience || [],
  inspiration_images: form.inspirationImages || [],
  brand_title: form.brand_title || "",
  brand_subtitle: form.brand_subtitle || "",
  brand_assets: form.brand_assets || [],
  logo_url: form.logo_url || "",
});

export const mapCreatorDnaToSuggestions = (dna: any) => ({
  brand_name: dna.brand_name || "",
  category: dna.category || "",
  style_keywords: Array.isArray(dna.style_keyword) ? dna.style_keyword : [],
  color_palette: Array.isArray(dna.colors) ? dna.colors : [],
  materials: Array.isArray(dna.materials) ? dna.materials : [],
  patterns: Array.isArray(dna.patterns) ? dna.patterns : [],
  tagline: dna.tagline || "Sustainable, Minimal, Elegant",
  audience: dna.target_audience || [],
  inspiration_images: Array.isArray(dna.mood_board) ? dna.mood_board : [],
  brand_title: dna.brand_title || "",
  brand_subtitle: dna.brand_subtitle || "",
  brand_assets: dna.brand_assets || [],
  logo_url: dna.logo_url || "",
});

export const mapCreatorDnaToForm = (dna: any) => ({
  websiteUrl: dna.website_url || "",
  instagramHandle: dna.insta_url || "",
  tiktokHandle: dna.tiktok_url || "",
  pinterestHandle: dna.pinterest_url || "",
  brandName: dna.brand_name || "",
  category: dna.category || "",
  targetAudience: dna.audience || [],
  tagline: dna.tagline || "",
  styleKeywords: Array.isArray(dna.style_keyword) ? dna.style_keyword : [],
  colorPalette: Array.isArray(dna.colors) ? dna.colors : [],
  materials: Array.isArray(dna.materials) ? dna.materials : [],
  patterns: Array.isArray(dna.patterns) ? dna.patterns : [],
  tone: dna.tone_values || "",
  inspirationImages: Array.isArray(dna.mood_board) ? dna.mood_board : [],
  dosAndDonts: dna.restrictions || "",
  summary: dna.summary || "",
  logo_url: dna.logo_url || "",
  status: dna.status || "",
  brand_title: dna.brand_title || "",
  brand_subtitle: dna.brand_subtitle || "",
  brand_assets: dna.brand_assets || [],
  company_techpack: dna.company_techpack || [],
  context_prompt: dna.context_prompt || "",
});

// formatTechpackJson.ts
export const formatTechpackJson = (techpack: any): string => {
  if (!techpack) return "{}";

  const safeArray = (arr: any[]) => (arr || []).map((item) => `"${item}"`).join(", ");

  return `{
  "coreProductAttributes": {
    "productName": "${techpack?.coreProductAttributes?.productName ?? ""}",
    "category": "${techpack?.coreProductAttributes?.category ?? ""}",
    "subcategory": "${techpack?.coreProductAttributes?.subcategory ?? ""}",
    "season": "${techpack?.coreProductAttributes?.season ?? ""}",
    "gender": "${techpack?.coreProductAttributes?.gender ?? ""}",
    "skuNamingConventions": "${techpack?.coreProductAttributes?.skuNamingConventions ?? ""}"
  },
  "materialsAndComponents": {
    "fabricComposition": [${safeArray(techpack?.materialsAndComponents?.fabricComposition)}],
    "gsm": "${techpack?.materialsAndComponents?.gsm ?? ""}",
    "trims": [${safeArray(techpack?.materialsAndComponents?.trims)}],
    "hardware": [${safeArray(techpack?.materialsAndComponents?.hardware)}],
    "labels": [${safeArray(techpack?.materialsAndComponents?.labels)}]
  },
  "colorData": {
    "colorNames": [${safeArray(techpack?.colorData?.colorNames)}],
    "pantoneCodes": [${safeArray(techpack?.colorData?.pantoneCodes)}],
    "dominantColorFamilies": [${safeArray(techpack?.colorData?.dominantColorFamilies)}]
  },
  "fitAndMeasurements": {
    "sizeSpecs": "${techpack?.fitAndMeasurements?.sizeSpecs ?? ""}",
    "tolerances": "${techpack?.fitAndMeasurements?.tolerances ?? ""}",
    "silhouettes": [${safeArray(techpack?.fitAndMeasurements?.silhouettes)}]
  },
  "constructionDetails": {
    "stitchTypes": [${safeArray(techpack?.constructionDetails?.stitchTypes)}],
    "seamAllowances": "${techpack?.constructionDetails?.seamAllowances ?? ""}",
    "finishingDetails": "${techpack?.constructionDetails?.finishingDetails ?? ""}"
  },
  "graphicAndPrintData": {
    "artworkPlacement": "${techpack?.graphicAndPrintData?.artworkPlacement ?? ""}",
    "fileReferences": [${safeArray(techpack?.graphicAndPrintData?.fileReferences)}],
    "printSizes": [${safeArray(techpack?.graphicAndPrintData?.printSizes)}]
  },
  "packagingAndLabeling": {
    "packagingTypes": "${techpack?.packagingAndLabeling?.packagingTypes ?? ""}",
    "hangTags": "${techpack?.packagingAndLabeling?.hangTags ?? ""}",
    "labelingDetails": "${techpack?.packagingAndLabeling?.labelingDetails ?? ""}"
  },
  "pricingAndCost": {
    "targetPrice": ${techpack?.pricingAndCost?.targetPrice ?? 0},
    "landedCost": ${techpack?.pricingAndCost?.landedCost ?? 0}
  },
  "supplierAndManufacturer": {
    "factoryIds": [${safeArray(techpack?.supplierAndManufacturer?.factoryIds)}],
    "regions": [${safeArray(techpack?.supplierAndManufacturer?.regions)}]
  }
}`;
};
