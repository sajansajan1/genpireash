import { GeminiImageService } from "@/lib/ai";
import OpenAI from "openai";

export type GenerationType = "Ads" | "Creative" | "Ecommerce" | "Logo" | "Social" | "Print";

interface ImageVariation {
  url: string;
  style: string;
  name: string;
}

interface AdConcept {
  name: string;
  description: string;
}

export class ImageEditor {
  private openai: OpenAI;
  private geminiImageService: GeminiImageService;

  constructor() {
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      throw new Error(
        "NEXT_PUBLIC_OPENAI_API_KEY is not set in environment variables."
      );
    }
    this.openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });
    this.geminiImageService = new GeminiImageService();
  }

  /**
   * Generates ad concepts for 'Ads' and 'Creative' types.
   */
  private async generateAdConcepts(
    userPrompt: string,
    count: number
  ): Promise<AdConcept[]> {
    console.log(`Generating ${count} ad concepts with OpenAI...`);
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert creative director for social media ads. Based on the user's product, generate a JSON object with a key "concepts" containing an array of ${count} unique objects, each with "name" and "description".
- "name": A one-to-two-word creative title (e.g., "Urban Scene").
- "description": A compelling phrase setting a scene for a social media ad (e.g., "Product in a chic, urban environment").
The response must be only the JSON object.`,
          },
          {
            role: "user",
            content: `Generate ad concepts for this product: "${userPrompt}"`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const responseObject = JSON.parse(
        completion.choices[0].message.content || "{}"
      );
      const concepts = responseObject.concepts;

      if (!Array.isArray(concepts) || concepts.length === 0)
        throw new Error("Invalid concepts format.");
      return concepts.slice(0, count);
    } catch (error) {
      console.error(
        "Error generating ad concepts, falling back to defaults:",
        error
      );
      return [
        {
          name: "Minimalist Studio",
          description: "Minimalist studio shot with soft, diffused lighting",
        },
        {
          name: "Outdoor Lifestyle",
          description:
            "Lifestyle image with the product in a natural, outdoor setting",
        },
        {
          name: "Vibrant Flat Lay",
          description:
            "Vibrant, eye-catching flat lay with complementary props",
        },
      ].slice(0, count);
    }
  }

  private async generateCreativePrompts(
    userPrompt: string,
    count: number
  ): Promise<AdConcept[]> {
    console.log(`Generating ${count} style prompts with OpenAI...`);
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a creative assistant. Based on the user's request, generate a JSON object with a key "styles" containing an array of ${count} unique, one-to-two-word artistic styles for image generation. The response must be only the JSON object.`,
          },
          {
            role: "user",
            content: `Generate styles for this prompt: "${userPrompt}"`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("OpenAI did not return any content for styles.");
      }

      const responseObject = JSON.parse(content);
      const styles = responseObject.styles;

      if (!Array.isArray(styles) || styles.length === 0) {
        throw new Error(
          "Failed to parse a valid array of styles from OpenAI response."
        );
      }

      return styles.slice(0, count).map((style: string) => ({
        name: style,
        description: style,
      }));
    } catch (error) {
      console.error(
        "Error generating styles from OpenAI, falling back to defaults:",
        error
      );
      return [
        "Cinematic",
        "Vibrant",
        "Minimalist",
        "Vintage",
        "Moody",
        "Dreamy",
      ]
        .slice(0, count)
        .map((style) => ({
          name: style,
          description: style,
        }));
    }
  }

  /**
   * Generates model-based concepts for 'Ecommerce' type.
   */
  private async generateEcommerceConcepts(
    userPrompt: string,
    count: number
  ): Promise<AdConcept[]> {
    console.log(`Generating ${count} e-commerce concepts with OpenAI...`);
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert catalog photographer. For the user's product, generate a JSON object with a key "concepts" containing an array of ${count} unique objects, each with "name" and "description".
- "name": A one-to-two-word title for a model pose (e.g., "Action Shot", "Hand Held").
- "description": A clear instruction for how a photorealistic human model should display the product against a clean background (e.g., "A model running dynamically while wearing the shoes, full body shot", "A close-up of a model's hands holding the product").
The response must be only the JSON object.`,
          },
          {
            role: "user",
            content: `Generate e-commerce model concepts for this product: "${userPrompt}"`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const responseObject = JSON.parse(
        completion.choices[0].message.content || "{}"
      );
      const concepts = responseObject.concepts;
      if (!Array.isArray(concepts) || concepts.length === 0)
        throw new Error("Invalid concepts format.");
      return concepts.slice(0, count);
    } catch (error) {
      console.error(
        "Error generating e-commerce concepts, falling back to defaults:",
        error
      );
      return [
        {
          name: "Model Wearing",
          description:
            "A full-body shot of a photorealistic model wearing the product against a pure white background.",
        },
        {
          name: "Action Pose",
          description:
            "A photorealistic model in a dynamic pose (e.g., walking, running, jumping) to showcase the product in use, against a light gray studio background.",
        },
        {
          name: "Hand Held",
          description:
            "A close-up shot of a model's hands holding or interacting with the product, emphasizing its details, on a clean studio background.",
        },
      ].slice(0, count);
    }
  }

  /**
   * Generates logo style concepts for 'Logo' type.
   */
  private async generateLogoConcepts(
    userPrompt: string,
    count: number
  ): Promise<AdConcept[]> {
    console.log(`Generating ${count} logo concepts with OpenAI...`);
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert logo designer and brand identity specialist. Based on the user's brand or product, generate a JSON object with a key "concepts" containing an array of ${count} unique objects, each with "name" and "description".
- "name": A one-to-two-word logo style title (e.g., "Minimalist", "Wordmark", "Emblem", "Mascot", "Abstract", "Lettermark", "Geometric", "Vintage Badge").
- "description": A detailed description of the logo style including visual elements, color approach, and overall aesthetic (e.g., "A clean minimalist wordmark logo with modern sans-serif typography, using negative space creatively, monochromatic color scheme on pure white background").
IMPORTANT: All logo descriptions MUST explicitly mention "on pure white background" or "on transparent background" to ensure clean, isolated logo designs suitable for any usage.
Focus on professional, versatile logo styles suitable for branding. Include a mix of: wordmarks, lettermarks, pictorial marks, abstract marks, emblems, combination marks, and mascot logos.
The response must be only the JSON object.`,
          },
          {
            role: "user",
            content: `Generate logo style concepts for this brand/product: "${userPrompt}"`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const responseObject = JSON.parse(
        completion.choices[0].message.content || "{}"
      );
      const concepts = responseObject.concepts;

      if (!Array.isArray(concepts) || concepts.length === 0)
        throw new Error("Invalid concepts format.");

      // Ensure all descriptions mention white/transparent background
      return concepts.slice(0, count).map(concept => ({
        ...concept,
        description: concept.description.includes("background")
          ? concept.description
          : `${concept.description}, on pure white background`
      }));
    } catch (error) {
      console.error(
        "Error generating logo concepts, falling back to defaults:",
        error
      );
      return [
        {
          name: "Minimalist Wordmark",
          description:
            "A clean, modern wordmark logo using elegant sans-serif typography with balanced letter spacing, monochromatic design on pure white background",
        },
        {
          name: "Abstract Symbol",
          description:
            "An abstract geometric symbol that represents the brand essence, using bold colors and clean lines, scalable and memorable, on pure white background",
        },
        {
          name: "Lettermark",
          description:
            "A sophisticated lettermark using the brand initials with creative typography, interlocking or overlapping letters, professional color palette on pure white background",
        },
        {
          name: "Emblem Badge",
          description:
            "A vintage-inspired emblem or badge logo with the brand name enclosed in a circular or shield shape, classic typography with decorative elements on pure white background",
        },
        {
          name: "Combination Mark",
          description:
            "A versatile combination logo featuring both a unique icon/symbol and wordmark that work together or separately, modern and balanced design on pure white background",
        },
        {
          name: "Geometric Modern",
          description:
            "A contemporary geometric logo using simple shapes (circles, triangles, squares) arranged creatively, gradient or flat colors, tech-forward aesthetic on pure white background",
        },
      ].slice(0, count);
    }
  }

  /**
   * NEW: Generates Instagram Stories visual scene concepts for 'Social' type.
   */
  private async generateSocialConcepts(
    userPrompt: string,
    count: number
  ): Promise<AdConcept[]> {
    console.log(`Generating ${count} Instagram Stories scene concepts with OpenAI...`);
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert Instagram content creator specializing in creating viral Instagram Stories content. Based on the user's product/brand, generate a JSON object with a key "concepts" containing an array of ${count} unique objects, each with "name" and "description".
- "name": A catchy 1-3 word title for the Stories scene (e.g., "Morning Coffee", "Urban Flex", "Cozy Vibes", "Night Out", "Fit Check", "Daily Essentials").
- "description": A detailed, specific visual scene description for an Instagram Story featuring the product/brand. The description must paint a clear picture of:
  * WHERE the scene takes place (specific location/environment)
  * WHO is in the scene (if applicable - person, lifestyle context)
  * HOW the product is being used/displayed naturally
  * WHAT the overall mood/vibe is
  * SPECIFIC visual details (lighting, colors, composition, angle)

IMPORTANT: Focus on creating REAL, relatable Instagram Stories scenarios where the product is naturally featured - NOT abstract aesthetic descriptions. Think about actual moments people would share on their Stories.

Examples of GOOD concepts:
- "A person showing off their new sneakers in front of a colorful street art mural, shot from above looking down at their feet, late afternoon golden hour lighting, urban cool vibe"
- "Flat lay on a marble countertop with morning coffee and the product artfully arranged, soft natural window light, minimalist aesthetic, shot from directly above"
- "Person wearing/using the product while getting ready in a modern minimalist bathroom mirror selfie, warm lighting, casual authentic moment"

Examples of BAD concepts (too abstract):
- "Neon cyberpunk aesthetic with gradients" ❌
- "Soft pastel colors with grain texture" ❌
- "Bold pop art style" ❌

The response must be only the JSON object.`,
          },
          {
            role: "user",
            content: `Generate Instagram Stories visual scene concepts for this product/brand: "${userPrompt}"`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const responseObject = JSON.parse(
        completion.choices[0].message.content || "{}"
      );
      const concepts = responseObject.concepts;

      if (!Array.isArray(concepts) || concepts.length === 0)
        throw new Error("Invalid concepts format.");
      return concepts.slice(0, count);
    } catch (error) {
      console.error(
        "Error generating social concepts, falling back to defaults:",
        error
      );
      return [
        {
          name: "Morning Routine",
          description: "A vertical photo of the product featured on a minimalist marble countertop during morning routine, styled with coffee cup and natural morning light streaming through a window, soft shadows, Instagram-worthy flat lay, shot from directly above, warm and inviting mood",
        },
        {
          name: "Street Style",
          description: "Person showcasing the product in an urban street setting with vibrant graffiti wall background, shot at eye level with the product as the focal point, golden hour lighting, candid lifestyle moment, modern and trendy vibe",
        },
        {
          name: "Cozy Moment",
          description: "Product featured in a cozy home setting on a soft blanket or aesthetic background, warm ambient lighting creating intimate atmosphere, lifestyle context with hands naturally interacting with product, shot at a slight angle, comfortable and relatable mood",
        },
        {
          name: "Fit Check",
          description: "Full-body or half-body mirror selfie showing the product being worn/used, modern clean interior background, good natural lighting, casual pose that feels authentic, shot vertically optimized for Stories, confident and stylish vibe",
        },
        {
          name: "Night Out",
          description: "Product featured in an evening/night setting with ambient city lights or neon glow in the background, elevated aesthetic with deeper colors and dramatic lighting, lifestyle moment getting ready or out with friends, energetic and exciting mood",
        },
        {
          name: "Daily Essentials",
          description: "Product arranged as part of a curated everyday carry or daily essentials flat lay on a clean surface, organized and aesthetic arrangement, bright even lighting, shot from above, practical yet aspirational vibe, shows product in context of lifestyle",
        },
      ].slice(0, count);
    }
  }

  /**
   * Generates print design concepts for 'Print' type.
   */
  private async generatePrintConcepts(
    userPrompt: string,
    count: number
  ): Promise<AdConcept[]> {
    console.log(`Generating ${count} print design concepts with OpenAI...`);
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert textile and graphic designer specializing in apparel prints (t-shirts, hoodies, merch). Based on the user's request, generate a JSON object with a key "concepts" containing an array of ${count} unique objects, each with "name" and "description".
- "name": A one-to-two-word style title (e.g., "Vintage Cartoon", "Bold Typography", "Cyberpunk Vector", "Minimalist Lineart", "Graffiti Style", "Pop Art").
- "description": A detailed visual description of the print design. Focus on:
  *   **Subject/Content:** What is depicted (e.g., "A retro 1930s rubberhose style cartoon character holding a coffee cup").
  *   **Artistic Style:** The specific technique (e.g., "Vector illustration with clean lines", "Distressed vintage texture", "3D puffed print effect").
  *   **Colors:** Color palette suitable for printing (e.g., "Limited 3-color palette", "Vibrant neon colors", "Monochromatic black and white").
  *   **Composition:** How it should sit on a garment (e.g., "Centered chest placement", "Pocket print").
IMPORTANT: Ensure diversity in the styles generated (e.g., include at least one text-based/typography design, one illustration/cartoon, one abstract/pattern).
All descriptions must explicitly mention "isolated on pure white background" to ensure the design can be easily extracted.
The response must be only the JSON object.`,
          },
          {
            role: "user",
            content: `Generate print design concepts for this prompt: "${userPrompt}"`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const responseObject = JSON.parse(
        completion.choices[0].message.content || "{}"
      );
      const concepts = responseObject.concepts;

      if (!Array.isArray(concepts) || concepts.length === 0)
        throw new Error("Invalid concepts format.");

      return concepts.slice(0, count).map((concept) => ({
        ...concept,
        description: concept.description.includes("background")
          ? concept.description
          : `${concept.description}, on pure white background`,
      }));
    } catch (error) {
      console.error(
        "Error generating print concepts, falling back to defaults:",
        error
      );
      return [
        {
          name: "Vintage Cartoon",
          description:
            "A retro 1930s rubberhose style cartoon character illustration, playful and nostalgic, with a distressed texture effect, simple bold colors, isolated on pure white background",
        },
        {
          name: "Modern Typography",
          description:
            "Bold, modern typography design featuring the key phrase, using distorted or melted font effects, streetwear aesthetic, monochrome black print isolated on pure white background",
        },
        {
          name: "Vector Illustration",
          description:
            "Clean, sharp vector art illustration, minimalist flat design with poppy colors, scalable graphic style suitable for screen printing, isolated on pure white background",
        },
        {
          name: "Graffiti Art",
          description:
            "Street art inspired graffiti tag style, vivid spray paint colors with drips and splatter effects, energetic and edgy, isolated on pure white background",
        },
        {
          name: "Geometric Pattern",
          description:
            "Abstract geometric shapes arranged in a cohesive composition, Bauhaus inspired, clean lines and primary colors, modern art aesthetic, isolated on pure white background",
        },
        {
          name: "Detailed Sketch",
          description:
            "Intricate hand-drawn pen and ink sketch style, high detail cross-hatching, blackwork tattoo aesthetic, artistic and raw, isolated on pure white background",
        },
      ].slice(0, count);
    }
  }

  /**
   * Main function to generate image variations based on the selected type.
   */
  async generateImageVariations(
    originalImageUrl: string,
    userPrompt: string,
    generationType: GenerationType,
    numberOfVariations: number = 6,
    characterImage?: string | null,
    aspectRatio?: any
  ): Promise<ImageVariation[]> {
    let concepts: AdConcept[];
    let promptBuilder: (
      userPrompt: string,
      conceptDescription: string,
      characterImage?: string | null,
      aspectRatio?: any
    ) => string;

    // Step 1: Select the concept generation and prompt building strategy based on type
    if (generationType === "Ecommerce") {
      concepts = await this.generateEcommerceConcepts(
        userPrompt,
        numberOfVariations
      );
      promptBuilder = this.buildEcommerceImagePrompt.bind(this);
    } else if (generationType === "Ads") {
      console.log("adddddddddddsssssssss");
      concepts = await this.generateAdConcepts(userPrompt, numberOfVariations);
      promptBuilder = this.buildAdImagePrompt.bind(this);
    } else if (generationType === "Logo") {
      concepts = await this.generateLogoConcepts(userPrompt, numberOfVariations);
      promptBuilder = this.buildLogoPrompt.bind(this);
    } else if (generationType === "Social") {
      concepts = await this.generateSocialConcepts(userPrompt, numberOfVariations);
      promptBuilder = this.buildSocialPrompt.bind(this);
    } else if (generationType === "Print") {
      concepts = await this.generatePrintConcepts(userPrompt, numberOfVariations);
      promptBuilder = this.buildPrintPrompt.bind(this);
    } else {
      concepts = await this.generateCreativePrompts(
        userPrompt,
        numberOfVariations
      );
      promptBuilder = this.buildCreativePrompt.bind(this);
    }

    console.log(
      `Dynamically Generated Concepts for type "${generationType}":`,
      concepts
    );

    // Step 2: Generate images using the selected strategy
    try {
      const generationPromises = concepts.map(async (concept) => {
        const imageResult = await this.geminiImageService.generateImage({
          prompt: promptBuilder(userPrompt, concept.description, characterImage),
          referenceImage: generationType === "Logo" ? undefined : originalImageUrl,
          characterImage: generationType === "Logo" || generationType === "Print" ? undefined : (characterImage || undefined),
          options: { enhancePrompt: true, fallbackEnabled: true, retry: 3 },
          aspectRatio: generationType === "Logo" ? "1:1" : generationType === "Social" ? "9:16" : generationType === "Print" ? "1:1" : aspectRatio,
        });

        const variationStyle = concept.name;
        const variationName = generationType;
        console.log("variationName ==> ", variationName);

        return {
          url: imageResult.url,
          style: variationName,
          name: variationStyle,
        };
      });

      return await Promise.all(generationPromises);
    } catch (error) {
      console.error(
        `Error generating image variations for type "${generationType}":`,
        error
      );
      throw new Error(
        `Failed to generate variations from Gemini service for type "${generationType}".`
      );
    }
  }

  /**
   * Builds the prompt for 'Ads' images.
   */
  private buildAdImagePrompt(
    userPrompt: string,
    conceptDescription: string,
    characterImage?: string | null
  ): string {
    const basePrompt = `Task: Create a compelling advertisement image for social media (Facebook/Instagram) using the provided product photograph.
            Product Details: "${userPrompt}"
            Ad Concept: "${conceptDescription}"

            Platform Guidelines:
            - Aspect Ratio: Create a visually balanced image suitable for a 1:1 (square) or 4:5 (vertical) crop.
            - Composition: The product must be the clear hero and focal point. The scene should be visually stunning and designed to stop a user from scrolling their feed.
            - Branding Space: The composition must leave some clean, uncluttered space (e.g., at the top or bottom) where a brand logo or text can be easily overlaid later. Do NOT generate any text or logos yourself.
            - Authenticity: The output must be a high-resolution, photorealistic image. It should feel aspirational, professional, and authentic, avoiding an overly "AI-generated" look.

            Execution:
            - Seamlessly integrate the original product from the reference image into the new ad scene described in the "Ad Concept".`;

    if (characterImage) {
      return basePrompt + `
            - A custom character/model image has been provided. Use this specific person/character from the character image in the scene. The character should naturally interact with or wear the product.
            - The character from the provided image should be the main model in the ad, maintaining their appearance, style, and identity.
            - The lighting, environment, and mood must align perfectly with the ad concept to tell a cohesive visual story.
            - Ensure all details are sharp and the overall quality is premium.`;
    }

    return basePrompt + `
            - The lighting, environment, and mood must align perfectly with the ad concept to tell a cohesive visual story.
            - Ensure all details are sharp and the overall quality is premium.`;
  }

  /**
   * Builds the prompt for 'Creative' images.
   */
  private buildCreativePrompt(
    userPrompt: string,
    style: string,
    characterImage?: string | null
  ): string {
    const basePrompt = `Task: Edit the provided product photograph based on the user's instruction, applying a specific artistic style.
            Instruction: "${userPrompt}"
            Style: Apply a "${style}" aesthetic to the entire image.
            Requirements:
            - The output must be a high-resolution image that strictly adheres to the requested style.
            - Maintain the original product's core identity but adapt its look to the new style.`;

    if (characterImage) {
      return basePrompt + `
            - A custom character/model image has been provided. Include this specific person/character in the creative composition, naturally interacting with or showcasing the product.
            - Maintain the character's appearance and identity from the provided image while applying the creative style.
            - The lighting, background, and mood should all reflect the specified style while featuring the character from the provided image.`;
    }

    return basePrompt + `
            - The lighting, background, and mood should all reflect the specified style.`;
  }

  /**
   * Builds the prompt for 'Ecommerce' model images.
   */
  private buildEcommerceImagePrompt(
    userPrompt: string,
    conceptDescription: string,
    characterImage?: string | null
  ): string {
    if (characterImage) {
      return `Task: Create a photorealistic e-commerce catalog image featuring the provided product with the specific model from the character image.
            Product Details: "${userPrompt}"
            Scene Instruction: "${conceptDescription}"

            Guidelines:
            - Background: The background must be a clean, solid, neutral color, typically pure white (#FFFFFF) or light gray (#F0F0F0). It should be completely non-distracting.
            - Model: Use the EXACT person/character from the provided character image as the model. Maintain their appearance, facial features, hairstyle, and identity. The model should interact naturally with the product as described in the scene instruction.
            - Product Integration: The product from the reference image must be seamlessly and realistically integrated onto the specific model from the character image (e.g., worn on feet, held in hand, worn as clothing). The product must be the primary focus while the character from the provided image wears/holds it.
            - Realism and Quality: The final image must be high-resolution, sharp, and look like a professional studio photograph. Avoid any signs of being AI-generated. The lighting should be bright and even, typical of catalog photography.
            - Character Consistency: Ensure the model's appearance exactly matches the character from the provided image. Do NOT generate a different person.
            - No Text or Logos: Do not generate any text, brand names, or logos.`;
    }

    return `Task: Create a photorealistic e-commerce catalog image featuring the provided product with a human model.
            Product Details: "${userPrompt}"
            Scene Instruction: "${conceptDescription}"

            Guidelines:
            - Background: The background must be a clean, solid, neutral color, typically pure white (#FFFFFF) or light gray (#F0F0F0). It should be completely non-distracting.
            - Model: The model should be photorealistic and interact naturally with the product as described. Their face should be neutral or partially obscured unless specified. Use a diverse range of ethnicities and appearances.
            - Product Integration: The product from the reference image must be seamlessly and realistically integrated onto the model (e.g., worn on feet, held in hand). It must be the primary focus of the image.
            - Realism and Quality: The final image must be high-resolution, sharp, and look like a professional studio photograph. Avoid any signs of being AI-generated. The lighting should be bright and even, typical of catalog photography.
            - No Text or Logos: Do not generate any text, brand names, or logos.`;
  }

  /**
   * Builds the prompt for 'Logo' images.
   */
  private buildLogoPrompt(
    userPrompt: string,
    conceptDescription: string,
    characterImage?: string | null
  ): string {
    return `Task: Create a professional, high-quality logo design for a brand.
          Brand/Product: "${userPrompt}"
          Logo Style: "${conceptDescription}"

          Design Guidelines:
          - Background: CRITICAL - Generate the logo on a PURE WHITE background (#FFFFFF) or completely transparent background. The logo must be cleanly isolated from the background with NO shadows, gradients, or textures in the background itself. The background should be completely uniform and flat white.
          - Isolation: Ensure the logo design is centered with adequate padding/whitespace around it, making it easy to extract or place on any other background.
          - Simplicity: The logo must be clean, simple, and easily recognizable. Avoid overly complex designs with too many elements.
          - Scalability: Design must be clear and legible at any size, from favicon (16x16px) to billboard scale.
          - Versatility: The logo should work in both color and monochrome versions.
          - Typography: If text is included, use clean, professional fonts. Ensure perfect letter spacing and alignment.
          - Color Palette: Use a cohesive color palette with 2-3 colors maximum for the logo itself. Colors should be bold and memorable.
          - Uniqueness: The design must be original, distinctive, and memorable. Avoid generic clip-art style elements.
          - Balance: Ensure visual balance and proper proportions in all elements.
          - Professionalism: The output must look like it was created by a professional graphic designer for a real brand.
          - Vector-Ready: Design with clean lines and shapes that could be easily converted to vector format. Sharp, crisp edges are essential.
          - No Background Elements: Do NOT include any decorative elements, patterns, textures, or colors in the background area. The background must be completely blank and pure white.
          
          Quality Requirements:
          - High resolution with crisp, clean edges and NO anti-aliasing artifacts against the white background
          - Perfect edge definition between logo elements and the white background
          - No blur, artifacts, rough edges, or color bleeding
          - Centered composition with generous, equal padding on all sides (minimum 10% margin)
          - No watermarks, no stock photo elements, no background textures
          - The logo should convey the brand's personality and values
          - Modern, timeless design that won't look dated quickly
          - Output should be suitable for immediate use or easy background removal to transparent PNG`;
  }

  /**
   * Builds the prompt for 'Social' Instagram Stories scene images.
   */
  private buildSocialPrompt(
    userPrompt: string,
    conceptDescription: string,
    characterImage?: string | null
  ): string {
    const basePrompt = `Task: Create a photorealistic, scroll-stopping Instagram Stories image featuring the product in a natural, relatable scenario.
            Product/Content: "${userPrompt}"
            Scene Description: "${conceptDescription}"

            CRITICAL: Create the EXACT SCENE described above. This is NOT an abstract aesthetic - it's a specific visual scenario that must be executed precisely.

            Instagram Stories Format Requirements (9:16 Vertical):
            - Dimensions: Vertical Stories format (1080px × 1920px / 9:16 aspect ratio)
            - Composition: Frame the scene vertically with the product as a natural focal point
            - Safe Zones: Keep critical visual elements in the center, leaving top 250px and bottom 250px relatively clear for potential text/stickers users may add
            - Product Prominence: The product must be clearly visible and recognizable, but integrated naturally into the scene
            - Vertical Framing: Think vertical first - use the tall canvas to create depth and visual interest

            Visual Execution Guidelines:
            - REALISM IS KEY: The image must look like a real photo someone would naturally share on their Instagram Stories - photorealistic quality, not overly staged
            - Natural Lighting: Use lighting that matches the scene (morning light for morning scenes, golden hour for street shots, ambient lighting for indoor scenes, etc.)
            - Authentic Moments: The scene should feel candid and genuine, as if captured in a real moment, not a studio photoshoot
            - Modern Aesthetic: Clean, contemporary styling that feels current and Instagram-worthy
            - Mobile-Optimized: Colors should be vibrant and pop on phone screens, details should be clear at mobile resolution
            - Lifestyle Context: Show the product in its natural usage context - how people actually use/wear/display it in real life

            Story-Specific Considerations:
            - The image should invite engagement - make viewers want to swipe up, tap, or respond
            - Leave strategic negative space (usually top or bottom third) for text overlays without obscuring key elements
            - The overall vibe should match what's trending on Instagram Stories right now - authentic, relatable, aspirational but achievable
            - NO text, watermarks, logos, brand names, or UI elements (users will add their own)
            - The scene should feel like a moment worth sharing, not an advertisement

            Quality Standards:
            - High resolution and sharp focus on the main subject
            - Natural depth of field where appropriate (slight background blur for portraits, sharp details for flat lays)
            - Realistic shadows, reflections, and lighting physics
            - No obvious AI artifacts or unrealistic elements
            - Professional quality but with an authentic, un-staged feel

            Execution:`;

    if (characterImage) {
      return basePrompt + `
            - A custom character/model image has been provided. This SPECIFIC PERSON must be the main subject in the scene
            - Maintain the character's exact appearance, facial features, style, and identity from the provided image
            - Position the character naturally in the scene described, with the product integrated authentically
            - The character should interact with the product in a realistic way that matches the scene (wearing it, holding it, using it, etc.)
            - Frame the shot for vertical Stories format - consider if it's a full-body shot, half-body, portrait, etc. based on the scene
            - The character's pose, expression, and energy should feel natural and match the mood of the scene
            - Ensure the character from the provided image is recognizable and looks natural in the environment
            - Background and lighting should complement both the character and the scene description`;
    }

    return basePrompt + `
            - Execute the scene exactly as described, with the product from the reference image seamlessly integrated
            - If the scene involves a person (mirror selfie, wearing product, etc.), include a photorealistic model that fits the context
            - The product should be the hero but feel naturally placed in the lifestyle moment
            - Match the specific environment, lighting, angle, and mood described in the scene
            - Make it look like premium Instagram Stories content - the kind that gets screenshots and shares
            - The final image should be indistinguishable from a real, high-quality photo someone would post to their Stories`;
  }

  /**
   * Builds the prompt for 'Print' images.
   */
  private buildPrintPrompt(
    userPrompt: string,
    conceptDescription: string,
    characterImage?: string | null
  ): string {
    return `Task: Create a professional, high-quality vector-style graphic design for apparel printing (T-shirt/Hoodie).
          Design Request: "${userPrompt}"
          Style/Concept: "${conceptDescription}"

          Design Guidelines:
          - Background: CRITICAL - Generate the design on a PURE WHITE background (#FFFFFF). The design must be cleanly isolated. NO garment mockup, NO t-shirt texture in the background. Just the raw design file.
          - Style: The image should look like a digital art file ready for a print shop (Screen print, DTG, or Heat transfer).
          - Quality: High resolution, 300 DPI equivalent. Crisp, clean edges. NO blurry photos.
          - Visuals:
            *   If the concept is "Cartoon": Use bold outlines, defined colors, and expressive character design.
            *   If the concept is "Typography": Ensure text is legible, stylish, and the central focus. (Note: AI text spelling may vary, focus on the visual style of letters).
            *   If the concept is "Vector": Use flat colors or clean gradients, avoiding messy photographic noise.
          - Colors: Use distinct, separable colors suitable for printing.
          - Composition: Centered design with clear boundaries.

          Execution:
          - Create ONLY the graphic design/artwork.
          - Do NOT render it onto a 3D shirt model.
          - The output should be the flat artwork file itself.`;
  }
}
