"use server";

/**
 * Server action for getting AI responses in the Agentic Tech Pack Chat
 * This is separate from the ai-designer chat system
 *
 * Features:
 * - Detects user intent (edit vs question vs chat)
 * - Returns structured edit actions for automatic application
 * - Navigates to appropriate sections
 */

import OpenAI from "openai";
import type {
  AgenticMessage,
  AgenticChatResponse,
  EditSuggestion,
  MessageIntent,
  EditAction,
  TechPackSection
} from "../components/agentic-chat/types";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
});

interface GetAgenticChatResponseParams {
  message: string;
  productContext: string;
  conversationHistory: AgenticMessage[];
  activeSection?: string;
  currentTechPack?: any; // Current tech pack data for context
}

/**
 * Valid tech pack sections
 */
const VALID_SECTIONS: TechPackSection[] = [
  "productName", "productOverview", "price", "materials", "dimensions",
  "constructionDetails", "hardwareComponents", "colors", "costStructure",
  "costIncomeEstimation", "sizeRange", "packaging", "careInstructions",
  "qualityStandards", "productionNotes", "estimatedLeadTime", "productionLogistics",
  "category_Subcategory", "intendedMarket_AgeRange"
];

/**
 * Detect if user message is an edit request
 */
function detectEditIntent(message: string): MessageIntent {
  const editPatterns = [
    /\b(change|update|modify|edit|set|make|replace|adjust|alter)\b/i,
    /\bto\s+be\b/i,
    /\bshould\s+be\b/i,
    /\bneeds?\s+to\s+be\b/i,
    /\bwant\s+(to\s+)?(change|update|modify|set|make)\b/i,
    /\bcan\s+you\s+(change|update|modify|set|make)\b/i,
  ];

  const questionPatterns = [
    /^(what|why|how|when|where|who|which|is|are|do|does|can|could|would|should)\b/i,
    /\?$/,
    /\b(explain|describe|tell\s+me|what\s+is|what\s+are)\b/i,
  ];

  // Check for edit patterns first (higher priority)
  for (const pattern of editPatterns) {
    if (pattern.test(message)) {
      return "edit";
    }
  }

  // Check for question patterns
  for (const pattern of questionPatterns) {
    if (pattern.test(message)) {
      return "question";
    }
  }

  return "chat";
}

/**
 * Get an AI response for the agentic chat
 */
export async function getAgenticChatResponse(
  params: GetAgenticChatResponseParams
): Promise<AgenticChatResponse> {
  const { message, productContext, conversationHistory, activeSection, currentTechPack } = params;

  try {
    // First, detect intent
    const intent = detectEditIntent(message);

    // Build the system prompt based on intent
    let systemPrompt = productContext;

    if (intent === "edit") {
      // Add edit-specific instructions with detailed structure examples
      systemPrompt += `

## EDIT MODE INSTRUCTIONS
The user wants to make an edit to the tech pack. You MUST:
1. Understand exactly what they want to change
2. Identify the correct section and field
3. Return your response in a SPECIFIC FORMAT with the EXACT data structure shown below

After your helpful explanation, you MUST include an EDIT_ACTION block in this exact format:

\`\`\`EDIT_ACTION
{
  "type": "update_field",
  "section": "<section_name>",
  "field": "<field_name_if_nested>",
  "value": <the_new_value_in_exact_structure>,
  "description": "<human readable description of the change>"
}
\`\`\`

Valid sections: ${VALID_SECTIONS.join(", ")}

## CRITICAL: EXACT DATA STRUCTURES FOR EACH SECTION

### STRING FIELDS (value is a simple string):
- productName: "My Product Name"
- productOverview: "Description text..."
- price: "$99.99" or "99.99 USD"
- careInstructions: "Machine wash cold..."
- qualityStandards: "ISO 9001 certified..."
- productionNotes: "Special handling required..."
- estimatedLeadTime: "4-6 weeks"
- category_Subcategory: "Bags > Backpacks"
- intendedMarket_AgeRange: "Adults 18-35"

### MATERIALS (value MUST be an ARRAY of objects):
\`\`\`json
[
  {
    "component": "Main Body",
    "material": "Full Grain Leather",
    "notes": "Italian sourced",
    "quantityPerUnit": "2 sq ft",
    "specification": "1.2mm thickness",
    "unitCost": "$15.00"
  },
  {
    "component": "Lining",
    "material": "Cotton Canvas",
    "notes": "Pre-washed",
    "quantityPerUnit": "1 sq ft",
    "specification": "8oz weight",
    "unitCost": "$3.00"
  }
]
\`\`\`

### DIMENSIONS (value is an object with length/height/width/weight):
\`\`\`json
{
  "length": { "value": "12", "unit": "inches" },
  "height": { "value": "15", "unit": "inches" },
  "width": { "value": "5", "unit": "inches" },
  "weight": { "value": "2.5", "unit": "lbs" }
}
\`\`\`

### COLORS (value is an object with arrays for colors):
\`\`\`json
{
  "styleNotes": "Modern minimalist aesthetic",
  "trendAlignment": "Fall 2024 color trends",
  "primaryColors": ["#000000", "#FFFFFF", "#8B4513"],
  "accentColors": ["#FFD700", "#C0C0C0"]
}
\`\`\`

### CONSTRUCTION DETAILS (value is an object with description and array):
\`\`\`json
{
  "description": "Double-stitched construction throughout",
  "constructionFeatures": [
    "Reinforced stress points",
    "Hidden zipper compartment",
    "Padded laptop sleeve"
  ]
}
\`\`\`

### HARDWARE COMPONENTS (value is an object with description and array):
\`\`\`json
{
  "description": "Premium metal hardware throughout",
  "hardware": [
    "YKK #5 metal zipper",
    "Solid brass D-rings",
    "Nickel-plated snap buttons"
  ]
}
\`\`\`

### SIZE RANGE (value is an object with sizes array and grading logic):
\`\`\`json
{
  "sizes": ["XS", "S", "M", "L", "XL"],
  "gradingLogic": "1 inch increment per size"
}
\`\`\`

### PACKAGING (value is an object):
\`\`\`json
{
  "notes": "Eco-friendly packaging preferred",
  "packagingDetails": {
    "primaryPackaging": "Dust bag",
    "secondaryPackaging": "Recycled cardboard box",
    "insertCards": "Care card and authenticity certificate"
  },
  "description": "Gift-ready presentation"
}
\`\`\`

### PRODUCTION LOGISTICS (value is an object):
\`\`\`json
{
  "MOQ": "100 units",
  "leadTime": "4-6 weeks",
  "sampleRequirements": "2 samples required before bulk order"
}
\`\`\`

### COST STRUCTURE (value is an object with nested objects):
\`\`\`json
{
  "costRange": "$50-$75",
  "sampleCost": { "amount": "$150", "notes": "Includes shipping" },
  "logisticsCost": { "domestic": "$5", "international": "$15" },
  "complianceCost": { "testing": "$200", "certification": "$100" },
  "productionCost": { "perUnit": "$45", "setup": "$500" },
  "pricingStrategy": { "wholesale": "$75", "retail": "$150", "margin": "50%" },
  "incomeEstimation": { "monthly": "$5000", "annually": "$60000" },
  "totalEstimatedCost": { "sample": "$150", "bulk1000": "$45000" }
}
\`\`\`

### COST INCOME ESTIMATION (value is an object):
\`\`\`json
{
  "sampleCreation": { "cost": "$150", "timeline": "2 weeks" },
  "bulkProduction1000": { "totalCost": "$45000", "perUnit": "$45" },
  "unitVsSampleNote": { "note": "Unit cost decreases 70% in bulk" }
}
\`\`\`

## IMPORTANT RULES:
1. For array fields (materials, primaryColors, accentColors, constructionFeatures, hardware, sizes), the value MUST be an array []
2. For object fields (dimensions, colors, constructionDetails, etc.), the value MUST be an object {}
3. For string fields, the value MUST be a simple string ""
4. NEVER return a string when an array is expected
5. NEVER return a string when an object is expected
6. When updating a single field within an object, use the "field" property to specify which nested field

## EXAMPLES OF CORRECT EDIT_ACTION:

### Updating product name (string field):
\`\`\`EDIT_ACTION
{
  "type": "update_field",
  "section": "productName",
  "value": "Premium Leather Backpack",
  "description": "Changed product name to Premium Leather Backpack"
}
\`\`\`

### Updating materials (array field - MUST be array):
\`\`\`EDIT_ACTION
{
  "type": "update_field",
  "section": "materials",
  "value": [
    { "component": "Body", "material": "Canvas", "notes": "", "quantityPerUnit": "1", "specification": "", "unitCost": "$10" }
  ],
  "description": "Updated materials list"
}
\`\`\`

### Updating just the primary colors (nested array):
\`\`\`EDIT_ACTION
{
  "type": "update_field",
  "section": "colors",
  "field": "primaryColors",
  "value": ["#FF0000", "#00FF00", "#0000FF"],
  "description": "Updated primary colors to red, green, blue"
}
\`\`\`

### Updating dimensions (object field):
\`\`\`EDIT_ACTION
{
  "type": "update_field",
  "section": "dimensions",
  "value": {
    "length": { "value": "14", "unit": "inches" },
    "height": { "value": "18", "unit": "inches" },
    "width": { "value": "6", "unit": "inches" },
    "weight": { "value": "3", "unit": "lbs" }
  },
  "description": "Updated all dimensions"
}
\`\`\`

Current tech pack data for reference:
${currentTechPack ? JSON.stringify(currentTechPack, null, 2) : "No tech pack data available"}

IMPORTANT: Always include the EDIT_ACTION block for edit requests. The system will automatically apply the change. Double-check your data structure matches the examples above EXACTLY.`;
    }

    // Build conversation messages for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    // Add conversation history (last 10 messages to keep context manageable)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      if (msg.role === "user" || msg.role === "assistant") {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add the current user message
    messages.push({
      role: "user",
      content: message,
    });

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 1500,
      temperature: 0.7,
    });

    const aiResponse = response.choices[0]?.message?.content;

    if (!aiResponse) {
      return {
        success: false,
        error: "No response generated from AI",
      };
    }

    // Parse edit action from response if present
    const editAction = parseEditAction(aiResponse);

    // Clean the response (remove the EDIT_ACTION block for display)
    const cleanedResponse = aiResponse
      .replace(/```EDIT_ACTION[\s\S]*?```/g, "")
      .trim();

    // Check if the response contains an edit suggestion (legacy)
    const suggestedEdit = parseEditSuggestion(cleanedResponse, activeSection);

    return {
      success: true,
      response: cleanedResponse,
      suggestedEdit,
      intent,
      editAction,
    };
  } catch (error) {
    console.error("Error in getAgenticChatResponse:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get AI response",
    };
  }
}

/**
 * Sections that expect array values
 */
const ARRAY_SECTIONS = ["materials"];
const ARRAY_FIELDS: Record<string, string[]> = {
  colors: ["primaryColors", "accentColors"],
  constructionDetails: ["constructionFeatures"],
  hardwareComponents: ["hardware"],
  sizeRange: ["sizes"],
};

/**
 * Sections that expect object values
 */
const OBJECT_SECTIONS = [
  "dimensions", "colors", "constructionDetails", "hardwareComponents",
  "sizeRange", "packaging", "productionLogistics", "costStructure",
  "costIncomeEstimation"
];

/**
 * Sections that expect string values
 */
const STRING_SECTIONS = [
  "productName", "productOverview", "price", "careInstructions",
  "qualityStandards", "productionNotes", "estimatedLeadTime",
  "category_Subcategory", "intendedMarket_AgeRange"
];

/**
 * Validate and potentially fix the value structure based on section
 */
function validateAndFixValue(section: TechPackSection, field: string | undefined, value: any): any {
  // If updating a specific nested field
  if (field) {
    const arrayFields = ARRAY_FIELDS[section];
    if (arrayFields && arrayFields.includes(field)) {
      // This field should be an array
      if (!Array.isArray(value)) {
        console.warn(`Field ${field} in section ${section} should be an array, got:`, typeof value);
        if (typeof value === "string") {
          // Try to convert comma-separated string to array
          return value.split(",").map(s => s.trim()).filter(Boolean);
        }
        return [value]; // Wrap single value in array
      }
    }
    return value;
  }

  // Check if section expects an array
  if (ARRAY_SECTIONS.includes(section)) {
    if (!Array.isArray(value)) {
      console.warn(`Section ${section} should be an array, got:`, typeof value);
      if (typeof value === "string") {
        // Try to parse if it looks like JSON
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          // Not valid JSON, wrap in array
        }
        return [{ component: value, material: "", notes: "", quantityPerUnit: "", specification: "", unitCost: "" }];
      }
      return [value];
    }
    // Ensure each item has required fields for materials
    if (section === "materials") {
      return value.map((item: any) => ({
        component: item?.component || "",
        material: item?.material || "",
        notes: item?.notes || "",
        quantityPerUnit: item?.quantityPerUnit || "",
        specification: item?.specification || "",
        unitCost: item?.unitCost || "",
      }));
    }
    return value;
  }

  // Check if section expects an object
  if (OBJECT_SECTIONS.includes(section)) {
    if (typeof value !== "object" || Array.isArray(value) || value === null) {
      console.warn(`Section ${section} should be an object, got:`, typeof value);
      // Can't reasonably convert to object, return default structure
      return getDefaultStructure(section);
    }
    // Validate nested arrays within objects
    const arrayFields = ARRAY_FIELDS[section];
    if (arrayFields) {
      const fixed = { ...value };
      for (const arrayField of arrayFields) {
        if (fixed[arrayField] !== undefined && !Array.isArray(fixed[arrayField])) {
          console.warn(`Field ${arrayField} in section ${section} should be an array`);
          if (typeof fixed[arrayField] === "string") {
            fixed[arrayField] = fixed[arrayField].split(",").map((s: string) => s.trim()).filter(Boolean);
          } else {
            fixed[arrayField] = [fixed[arrayField]];
          }
        }
      }
      return fixed;
    }
    return value;
  }

  // Check if section expects a string
  if (STRING_SECTIONS.includes(section)) {
    if (typeof value !== "string") {
      console.warn(`Section ${section} should be a string, got:`, typeof value);
      return String(value);
    }
    return value;
  }

  return value;
}

/**
 * Get default structure for object sections
 */
function getDefaultStructure(section: TechPackSection): any {
  switch (section) {
    case "dimensions":
      return { length: {}, height: {}, width: {}, weight: {} };
    case "colors":
      return { styleNotes: "", trendAlignment: "", primaryColors: [], accentColors: [] };
    case "constructionDetails":
      return { description: "", constructionFeatures: [] };
    case "hardwareComponents":
      return { description: "", hardware: [] };
    case "sizeRange":
      return { sizes: [], gradingLogic: "" };
    case "packaging":
      return { notes: "", packagingDetails: {}, description: "" };
    case "productionLogistics":
      return { MOQ: "", leadTime: "", sampleRequirements: "" };
    case "costStructure":
      return { costRange: "", sampleCost: {}, logisticsCost: {}, complianceCost: {}, productionCost: {}, pricingStrategy: {}, incomeEstimation: {}, totalEstimatedCost: {} };
    case "costIncomeEstimation":
      return { sampleCreation: {}, bulkProduction1000: {}, unitVsSampleNote: {} };
    default:
      return {};
  }
}

/**
 * Parse EDIT_ACTION block from AI response
 */
function parseEditAction(response: string): EditAction | undefined {
  const editActionMatch = response.match(/```EDIT_ACTION\s*([\s\S]*?)\s*```/);

  if (!editActionMatch) {
    return undefined;
  }

  try {
    const actionJson = editActionMatch[1].trim();
    const action = JSON.parse(actionJson);

    // Validate the action structure
    if (!action.type || !action.section || action.value === undefined) {
      console.error("Invalid edit action structure:", action);
      return undefined;
    }

    // Validate section is valid
    if (!VALID_SECTIONS.includes(action.section)) {
      console.error("Invalid section in edit action:", action.section);
      return undefined;
    }

    // Validate and fix the value structure
    const validatedValue = validateAndFixValue(
      action.section as TechPackSection,
      action.field,
      action.value
    );

    return {
      type: action.type || "update_field",
      section: action.section as TechPackSection,
      field: action.field,
      value: validatedValue,
      description: action.description || "Update requested",
    };
  } catch (error) {
    console.error("Failed to parse edit action:", error);
    return undefined;
  }
}

/**
 * Parse the AI response to check if it contains an edit suggestion
 * This is a simple implementation - could be enhanced with structured output
 */
function parseEditSuggestion(
  response: string,
  activeSection?: string
): EditSuggestion | undefined {
  // Look for patterns like "I suggest changing X to Y" or "Consider updating X"
  // This is a basic implementation - could be improved with structured output

  const suggestionPatterns = [
    /suggest(?:ing)?\s+(?:changing|updating|modifying)\s+(.+?)\s+(?:to|from)\s+(.+?)(?:\.|,|$)/i,
    /recommend(?:ing)?\s+(?:changing|updating|modifying)\s+(.+?)\s+(?:to|from)\s+(.+?)(?:\.|,|$)/i,
    /consider\s+(?:changing|updating|modifying)\s+(.+?)\s+(?:to|from)\s+(.+?)(?:\.|,|$)/i,
  ];

  for (const pattern of suggestionPatterns) {
    const match = response.match(pattern);
    if (match) {
      return {
        id: `edit-${Date.now()}`,
        section: activeSection || "general",
        field: match[1].trim(),
        currentValue: null, // Would need to look this up
        suggestedValue: match[2].trim(),
        reasoning: response.slice(0, 200),
        status: "pending",
      };
    }
  }

  return undefined;
}

/**
 * Get a quick response for simple queries (uses less tokens)
 */
export async function getQuickAgenticResponse(
  message: string,
  productName: string
): Promise<AgenticChatResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful product assistant for "${productName}". Give brief, helpful responses.`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const aiResponse = response.choices[0]?.message?.content;

    return {
      success: !!aiResponse,
      response: aiResponse || "I couldn't generate a response.",
    };
  } catch (error) {
    console.error("Error in getQuickAgenticResponse:", error);
    return {
      success: false,
      error: "Failed to get response",
    };
  }
}

/**
 * Stream response for longer conversations (not implemented yet)
 * Could be added later for better UX with long responses
 */
export async function streamAgenticChatResponse(
  params: GetAgenticChatResponseParams
): Promise<ReadableStream<string>> {
  // TODO: Implement streaming for better UX
  // For now, just use the regular response
  throw new Error("Streaming not implemented yet");
}
