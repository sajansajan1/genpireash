/**
 * Product Category Constants
 * Standardized product categories supported by Genpire
 */

export const PRODUCT_CATEGORIES = [
  'apparel',
  'footwear',
  'accessories',
  'bags',
  'jewellery',
  'toys',
  'hats',
  'furniture',
  'other',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  apparel: 'Apparel / Garment',
  footwear: 'Footwear',
  accessories: 'Accessories',
  bags: 'Bags',
  jewellery: 'Jewellery',
  toys: 'Toys',
  hats: 'Hats',
  furniture: 'Furniture',
  other: 'Other',
};

/**
 * Subcategories for each product category
 * Each category has a list of valid subcategories
 */
export const CATEGORY_SUBCATEGORIES: Record<ProductCategory, string[]> = {
  apparel: ['shirt', 'dress', 'jacket', 'pants', 'trousers', 'hoodie', 'sweater', 'coat', 'skirt', 'blouse', 'shorts', 'vest', 'jumpsuit', 'romper', 'swimwear', 'underwear', 'sleepwear', 'activewear', 'uniform', 'suit'],
  footwear: ['sneakers', 'boots', 'sandals', 'slippers', 'heels', 'flats', 'loafers', 'oxfords', 'moccasins', 'espadrilles', 'clogs', 'mules', 'wedges', 'platforms', 'athletic'],
  accessories: ['belt', 'scarf', 'gloves', 'sunglasses', 'watch', 'wallet', 'tie', 'bowtie', 'cufflinks', 'keychain', 'lanyard', 'phone-case', 'umbrella', 'hair-accessory'],
  bags: ['handbag', 'backpack', 'tote', 'purse', 'clutch', 'luggage', 'suitcase', 'duffel', 'messenger', 'crossbody', 'shoulder', 'weekender', 'pouch', 'cosmetic-bag'],
  jewellery: ['necklace', 'bracelet', 'ring', 'earrings', 'pendant', 'anklet', 'brooch', 'cufflinks', 'charm', 'bangle', 'choker', 'chain'],
  toys: ['plush', 'doll', 'action-figure', 'puzzle', 'board-game', 'educational', 'outdoor', 'building', 'vehicle', 'electronic', 'stuffed-animal', 'puppet'],
  hats: ['cap', 'beanie', 'fedora', 'beret', 'visor', 'bucket', 'snapback', 'trucker', 'sun-hat', 'cowboy', 'newsboy', 'panama'],
  furniture: ['chair', 'table', 'sofa', 'desk', 'cabinet', 'shelf', 'bench', 'stool', 'bed', 'couch', 'ottoman', 'dresser', 'nightstand', 'bookshelf', 'wardrobe', 'stand', 'rack', 'console'],
  other: ['general', 'custom', 'specialty', 'misc'],
};

export type ProductSubcategory = typeof CATEGORY_SUBCATEGORIES[ProductCategory][number];

/**
 * Validates if a string is a valid product category
 */
export function isValidCategory(category: string | null | undefined): category is ProductCategory {
  if (!category) return false;
  return PRODUCT_CATEGORIES.includes(category.toLowerCase() as ProductCategory);
}

/**
 * Extracts category from category_Subcategory string
 * e.g., "Apparel → Shorts → Casual" -> "apparel"
 * e.g., "Apparel_Clothing" -> "apparel"
 */
export function extractCategoryFromSubcategory(categorySubcategory: string | null | undefined): string | null {
  if (!categorySubcategory) return null;

  // Handle arrow format: "Apparel → Shorts → Casual"
  if (categorySubcategory.includes('→')) {
    const firstPart = categorySubcategory.split('→')[0].trim();
    return firstPart.toLowerCase();
  }

  // Handle underscore format: "Apparel_Clothing"
  if (categorySubcategory.includes('_')) {
    const firstPart = categorySubcategory.split('_')[0].trim();
    return firstPart.toLowerCase();
  }

  // Handle space format: "Apparel Clothing"
  if (categorySubcategory.includes(' ')) {
    const firstPart = categorySubcategory.split(' ')[0].trim();
    return firstPart.toLowerCase();
  }

  return categorySubcategory.toLowerCase().trim();
}

/**
 * Normalizes a category string to a valid ProductCategory
 * Returns 'other' if the category doesn't match any supported category
 */
export function normalizeCategory(category: string | null | undefined): ProductCategory {
  if (!category) return 'other';

  const normalized = category.toLowerCase().trim();

  // Direct match
  if (PRODUCT_CATEGORIES.includes(normalized as ProductCategory)) {
    return normalized as ProductCategory;
  }

  // Handle common variations
  const categoryMap: Record<string, ProductCategory> = {
    // Apparel variations
    'garment': 'apparel',
    'clothing': 'apparel',
    'clothes': 'apparel',
    'garments': 'apparel',
    'apparel/garment': 'apparel',
    'shirt': 'apparel',
    'dress': 'apparel',
    'jacket': 'apparel',
    'pants': 'apparel',
    'trousers': 'apparel',
    't-shirt': 'apparel',
    'tshirt': 'apparel',
    'hoodie': 'apparel',
    'sweater': 'apparel',
    'coat': 'apparel',
    'skirt': 'apparel',
    'blouse': 'apparel',

    // Footwear variations
    'shoes': 'footwear',
    'shoe': 'footwear',
    'sneakers': 'footwear',
    'boots': 'footwear',
    'sandals': 'footwear',
    'slippers': 'footwear',

    // Bags variations
    'bag': 'bags',
    'handbag': 'bags',
    'backpack': 'bags',
    'tote': 'bags',
    'purse': 'bags',
    'clutch': 'bags',
    'luggage': 'bags',
    'suitcase': 'bags',

    // Accessories variations
    'accessory': 'accessories',
    'belt': 'accessories',
    'scarf': 'accessories',
    'gloves': 'accessories',
    'sunglasses': 'accessories',
    'watch': 'accessories',
    'wallet': 'accessories',

    // Jewellery variations
    'jewelry': 'jewellery',
    'necklace': 'jewellery',
    'bracelet': 'jewellery',
    'ring': 'jewellery',
    'earrings': 'jewellery',
    'pendant': 'jewellery',

    // Toys variations
    'toy': 'toys',
    'plush': 'toys',
    'plushie': 'toys',
    'stuffed animal': 'toys',
    'doll': 'toys',
    'action figure': 'toys',

    // Hats variations
    'hat': 'hats',
    'cap': 'hats',
    'beanie': 'hats',
    'headwear': 'hats',

    // Furniture variations
    'chair': 'furniture',
    'table': 'furniture',
    'sofa': 'furniture',
    'desk': 'furniture',
    'cabinet': 'furniture',
    'shelf': 'furniture',
    'bench': 'furniture',
    'stool': 'furniture',
    'bed': 'furniture',
    'couch': 'furniture',
    'ottoman': 'furniture',
    'dresser': 'furniture',
    'nightstand': 'furniture',
    'bookshelf': 'furniture',
    'wardrobe': 'furniture',
    'stand': 'furniture',
  };

  if (categoryMap[normalized]) {
    return categoryMap[normalized];
  }

  // Check if the category contains any of our keywords
  // Find ALL matching keywords and pick the longest one (most specific match)
  let bestMatch: { keyword: string; category: ProductCategory } | null = null;

  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (normalized.includes(keyword)) {
      // Pick the longest matching keyword as the most specific match
      if (!bestMatch || keyword.length > bestMatch.keyword.length) {
        bestMatch = { keyword, category };
      }
    }
  }

  if (bestMatch) {
    return bestMatch.category;
  }

  return 'other';
}

/**
 * Extracts subcategory from text based on the category
 * Returns the matched subcategory keyword or the first subcategory of the category as default
 */
export function extractSubcategory(text: string | null | undefined, category: ProductCategory): string {
  if (!text) return CATEGORY_SUBCATEGORIES[category][0] || 'general';

  const normalized = text.toLowerCase().trim();
  const subcategories = CATEGORY_SUBCATEGORIES[category];

  // Find the longest matching subcategory keyword
  let bestMatch: string | null = null;

  for (const subcategory of subcategories) {
    // Handle hyphenated subcategories (e.g., 'action-figure' should match 'action figure')
    const subcategoryVariants = [
      subcategory,
      subcategory.replace(/-/g, ' '), // action-figure -> action figure
      subcategory.replace(/-/g, ''),  // action-figure -> actionfigure
    ];

    for (const variant of subcategoryVariants) {
      if (normalized.includes(variant)) {
        if (!bestMatch || subcategory.length > bestMatch.length) {
          bestMatch = subcategory;
        }
      }
    }
  }

  // Return matched subcategory or default to first subcategory of the category
  return bestMatch || CATEGORY_SUBCATEGORIES[category][0] || 'general';
}

/**
 * Get the AI prompt instruction for category extraction
 */
export function getCategoryExtractionPrompt(): string {
  return `"category": "Extract and classify the product category. MUST be exactly one of: ${PRODUCT_CATEGORIES.slice(0, -1).join(', ')}. If the product doesn't fit any of these categories, use 'other'. Return only the lowercase category name."`;
}
