/**
 * Prompt enhancement and processing utilities
 */

/**
 * Build conversation context from messages
 */
export function buildConversationContext(
  messages: Array<{ type: string; content: string }>,
  productName?: string,
  limit = 10
): string {
  const recentMessages = messages.slice(-limit);

  // Extract user messages for context
  const userMessages = recentMessages
    .filter((msg) => msg.type === 'user')
    .map((msg) => cleanPromptContent(msg.content))
    .filter((content) => content.length > 0);

  let context = '';

  if (userMessages.length > 0) {
    context = `Context of previous edits in this session:\n${userMessages.join('\n- ')}\n\n`;
  }

  if (productName) {
    context += `Product: ${productName}\n\n`;
  }

  return context;
}

/**
 * Clean prompt content from technical markers
 */
export function cleanPromptContent(content: string): string {
  return content
    .replace(/\[Current Design Screenshot: https?:\/\/[^\]]+\]/g, '')
    .replace(/!\[Annotated Screenshot\]\([^)]+\)/g, '')
    .replace(/\[Full Session Context\]:[\s\S]*?\n\n/g, '')
    .replace(/\[Product Details\]:[\s\S]*?\n\n/g, '')
    .trim();
}

/**
 * Enhance prompt with context
 */
export function enhancePromptWithContext(
  prompt: string,
  context: string,
  isInitialGeneration: boolean
): string {
  if (!context || isInitialGeneration) {
    return prompt;
  }

  return `${context}Current modification request: ${prompt}\n\nIMPORTANT: Modify the existing product based on all previous requests and this current request. Do not create a new product.`;
}

/**
 * Extract product type from prompt
 */
export function extractProductType(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();

  const productTypes = [
    { keyword: 'shirt', type: 'shirt' },
    { keyword: 'pants', type: 'pants' },
    { keyword: 'dress', type: 'dress' },
    { keyword: 'jacket', type: 'jacket' },
    { keyword: 'shoe', type: 'footwear' },
    { keyword: 'hoodie', type: 'hoodie' },
    { keyword: 'sweater', type: 'sweater' },
    { keyword: 'skirt', type: 'skirt' },
    { keyword: 'coat', type: 'coat' },
    { keyword: 'bag', type: 'bag' },
    { keyword: 'hat', type: 'hat' },
    { keyword: 'accessory', type: 'accessory' },
  ];

  for (const { keyword, type } of productTypes) {
    if (lowerPrompt.includes(keyword)) {
      return type;
    }
  }

  return 'product';
}

/**
 * Extract design attributes from prompt
 */
export function extractDesignAttributes(prompt: string): {
  colors: string[] | null;
  materials: string[] | null;
  styles: string[] | null;
} {
  const colorPattern = /\b(black|white|red|blue|green|yellow|purple|pink|orange|grey|gray|brown|navy|maroon|beige|cream|teal)\b/gi;
  const materialPattern = /\b(cotton|silk|leather|denim|wool|polyester|linen|velvet|satin|nylon|canvas|suede)\b/gi;
  const stylePattern = /\b(casual|formal|sport|athletic|elegant|modern|vintage|classic|streetwear|minimalist|luxury)\b/gi;

  return {
    colors: prompt.match(colorPattern),
    materials: prompt.match(materialPattern),
    styles: prompt.match(stylePattern),
  };
}

/**
 * Check if prompt is an uploaded design
 */
export function isUploadedDesign(prompt: string): boolean {
  return (
    prompt.startsWith('data:image') ||
    /^https?:\/\/.*\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?.*)?$/i.test(prompt)
  );
}

/**
 * Generate contextual acknowledgment
 */
export function generateAcknowledgment(
  prompt: string,
  productType: string,
  isUploadedDesign: boolean
): string {
  if (isUploadedDesign) {
    return "I'll analyze your uploaded design and create the front, back, and side views. Generating all product perspectives now.";
  }

  const attributes = extractDesignAttributes(prompt);
  let acknowledgment = `I'll create a ${productType} design`;

  const contextParts = [];
  if (attributes.styles?.[0]) {
    contextParts.push(`${attributes.styles[0].toLowerCase()} style`);
  }
  if (attributes.colors?.[0]) {
    contextParts.push(`${attributes.colors[0].toLowerCase()} color`);
  }
  if (attributes.materials?.[0]) {
    contextParts.push(`${attributes.materials[0].toLowerCase()} material`);
  }

  if (contextParts.length > 0) {
    acknowledgment += ` with ${contextParts.join(', ')}`;
  }

  acknowledgment += `. Generating the front, back, and side views for you now.`;
  return acknowledgment;
}
