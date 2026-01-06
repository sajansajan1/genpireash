/**
 * Brand DNA Context Service
 *
 * A centralized, reusable service for injecting Brand DNA context into AI prompts.
 * This service handles:
 * - Generating context prompts from Brand DNA fields
 * - Injecting brand context into any AI prompt
 * - Caching and optimizing context generation
 * - Providing consistent brand context across all features
 */

import { getOpenAIClientSingleton } from "@/lib/ai/openai-client";
import OpenAI from "openai";

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface BrandDNA {
  id: string;
  user_id: string;
  creator_id?: string;
  brand_name?: string;
  brand_title?: string;
  brand_subtitle?: string;
  category?: string;
  tagline?: string;
  summary?: string;
  style_keyword?: string[];
  colors?: string[];
  materials?: string[];
  patterns?: string[];
  tone_values?: string;
  audience?: string;
  restrictions?: string;
  mood_board?: string[];
  logo_url?: string;
  brand_assets?: string[];
  company_techpack?: any;
  website_url?: string;
  insta_url?: string;
  tiktok_url?: string;
  pinterest_url?: string;
  context_prompt?: string; // Pre-generated context prompt for injection
  status?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BrandContextOptions {
  /** Include full detailed context (default: false for concise) */
  detailed?: boolean;
  /** Include specific sections only */
  includeSections?: Array<
    | "identity"
    | "style"
    | "materials"
    | "colors"
    | "audience"
    | "restrictions"
    | "techpack"
  >;
  /** Custom prefix for the context injection */
  prefix?: string;
  /** Custom suffix for the context injection */
  suffix?: string;
}

export interface PromptWithContext {
  /** The original prompt */
  originalPrompt: string;
  /** The brand context to inject */
  brandContext: string;
  /** The final combined prompt */
  combinedPrompt: string;
  /** Whether brand context was applied */
  hasContext: boolean;
}

export interface LogoSource {
  /** The logo URL or base64 data */
  logo: string;
  /** Source of the logo */
  source: "chat_upload" | "product_metadata" | "brand_dna";
}

export interface LogoFallbackOptions {
  /** Logo from chat upload (highest priority) */
  chatUploadedLogo?: string;
  /** Logo from product metadata */
  productLogo?: string;
  /** Brand DNA object (for logo_url) */
  brandDna?: BrandDNA | null;
}

// ============================================================================
// Brand DNA Context Service
// ============================================================================

export class BrandDnaContextService {
  private static instance: BrandDnaContextService;

  private constructor() {
    // No initialization needed - we use the singleton from openai-client
  }

  /**
   * Get OpenAI client (server-side only)
   * Returns null if called on client-side
   */
  private getOpenAI(): OpenAI | null {
    if (typeof window !== "undefined") {
      return null;
    }
    try {
      return getOpenAIClientSingleton();
    } catch {
      return null;
    }
  }

  /**
   * Get singleton instance of the service
   */
  public static getInstance(): BrandDnaContextService {
    if (!BrandDnaContextService.instance) {
      BrandDnaContextService.instance = new BrandDnaContextService();
    }
    return BrandDnaContextService.instance;
  }

  // --------------------------------------------------------------------------
  // Core Context Generation Methods
  // --------------------------------------------------------------------------

  /**
   * Generate a context prompt from Brand DNA fields
   * This creates a reusable prompt that can be stored and used directly
   */
  public generateContextPrompt(brandDna: BrandDNA): string {
    if (!brandDna) return "";

    const sections: string[] = [];

    // Brand Identity Section
    const identity = this.buildIdentitySection(brandDna);
    if (identity) sections.push(identity);

    // Style & Aesthetics Section
    const style = this.buildStyleSection(brandDna);
    if (style) sections.push(style);

    // Materials Section
    const materials = this.buildMaterialsSection(brandDna);
    if (materials) sections.push(materials);

    // Color Palette Section
    const colors = this.buildColorsSection(brandDna);
    if (colors) sections.push(colors);

    // Target Audience Section
    const audience = this.buildAudienceSection(brandDna);
    if (audience) sections.push(audience);

    // Restrictions & Guidelines Section
    const restrictions = this.buildRestrictionsSection(brandDna);
    if (restrictions) sections.push(restrictions);

    if (sections.length === 0) return "";

    return `[BRAND DNA CONTEXT]
${sections.join("\n")}
[END BRAND DNA CONTEXT]`;
  }

  /**
   * Generate a concise context prompt for token-efficient injection
   */
  public generateConciseContextPrompt(brandDna: BrandDNA): string {
    if (!brandDna) return "";

    const parts: string[] = [];

    if (brandDna.brand_name) {
      parts.push(`Brand: ${brandDna.brand_name}`);
    }

    if (brandDna.style_keyword?.length) {
      parts.push(`Style: ${brandDna.style_keyword.join(", ")}`);
    }

    if (brandDna.colors?.length) {
      parts.push(`Colors: ${brandDna.colors.slice(0, 5).join(", ")}`);
    }

    if (brandDna.materials?.length) {
      parts.push(`Materials: ${brandDna.materials.slice(0, 5).join(", ")}`);
    }

    if (brandDna.tone_values) {
      parts.push(`Tone: ${brandDna.tone_values}`);
    }

    if (brandDna.audience) {
      parts.push(`Audience: ${brandDna.audience}`);
    }

    if (parts.length === 0) return "";

    return `[Brand Context: ${parts.join(" | ")}]`;
  }

  /**
   * Generate an AI-enhanced context prompt using OpenAI
   * This creates a more natural, comprehensive brand context
   */
  public async generateAIContextPrompt(brandDna: BrandDNA): Promise<string> {
    const openai = this.getOpenAI();
    if (!openai || !brandDna) {
      return this.generateContextPrompt(brandDna);
    }

    const brandSummary = this.buildBrandSummaryForAI(brandDna);
    if (!brandSummary) {
      return this.generateContextPrompt(brandDna);
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a brand strategist. Create a concise, actionable brand context prompt (100-150 words) that can be injected into AI image/product generation prompts to ensure brand consistency. Focus on visual identity, style guidelines, and brand personality. Be specific and practical.`,
          },
          {
            role: "user",
            content: `Create a brand context prompt for this brand:\n\n${brandSummary}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      const generatedPrompt = completion.choices[0]?.message?.content;
      if (generatedPrompt) {
        return `[BRAND DNA CONTEXT]\n${generatedPrompt.trim()}\n[END BRAND DNA CONTEXT]`;
      }
    } catch (error) {
      console.error("Error generating AI context prompt:", error);
    }

    // Fallback to standard generation
    return this.generateContextPrompt(brandDna);
  }

  // --------------------------------------------------------------------------
  // Prompt Injection Methods
  // --------------------------------------------------------------------------

  /**
   * Inject brand context into a prompt
   * Main method for applying Brand DNA to any AI prompt
   */
  public injectContext(
    prompt: string,
    brandDna: BrandDNA | null,
    options: BrandContextOptions = {}
  ): PromptWithContext {
    // If no brand DNA or no useful context, return original
    if (!brandDna) {
      return {
        originalPrompt: prompt,
        brandContext: "",
        combinedPrompt: prompt,
        hasContext: false,
      };
    }

    // Use stored context_prompt if available, otherwise generate
    let brandContext =
      brandDna.context_prompt || this.generateContextFromOptions(brandDna, options);

    if (!brandContext) {
      return {
        originalPrompt: prompt,
        brandContext: "",
        combinedPrompt: prompt,
        hasContext: false,
      };
    }

    // Apply prefix/suffix if provided
    if (options.prefix) {
      brandContext = `${options.prefix}\n${brandContext}`;
    }
    if (options.suffix) {
      brandContext = `${brandContext}\n${options.suffix}`;
    }

    // Combine prompt with context
    const combinedPrompt = `${brandContext}\n\n${prompt}`;

    return {
      originalPrompt: prompt,
      brandContext,
      combinedPrompt,
      hasContext: true,
    };
  }

  /**
   * Inject brand context for collection generation
   */
  public injectForCollection(
    collectionDescription: string,
    brandDna: BrandDNA | null
  ): PromptWithContext {
    return this.injectContext(collectionDescription, brandDna, {
      detailed: true,
      includeSections: ["identity", "style", "colors", "materials", "audience"],
      prefix: "Design a product collection that aligns with this brand:",
    });
  }

  /**
   * Inject brand context for product image generation
   */
  public injectForImageGeneration(
    imagePrompt: string,
    brandDna: BrandDNA | null
  ): PromptWithContext {
    return this.injectContext(imagePrompt, brandDna, {
      detailed: false,
      includeSections: ["style", "colors", "materials"],
    });
  }

  /**
   * Inject brand context for tech pack generation
   */
  public injectForTechPack(
    techPackPrompt: string,
    brandDna: BrandDNA | null
  ): PromptWithContext {
    return this.injectContext(techPackPrompt, brandDna, {
      detailed: true,
      includeSections: ["identity", "materials", "colors", "restrictions", "techpack"],
    });
  }

  // --------------------------------------------------------------------------
  // Logo Fallback Hierarchy Methods
  // --------------------------------------------------------------------------

  /**
   * Resolve logo using fallback hierarchy
   *
   * Priority (highest to lowest):
   * 1. Chat-uploaded logo (user explicitly uploaded for this product)
   * 2. Product metadata logo (original product logo)
   * 3. Brand DNA logo (brand identity logo)
   *
   * @param options - Logo sources to check
   * @returns LogoSource with the resolved logo and its source, or null if no logo found
   *
   * @example
   * ```typescript
   * const result = service.resolveLogoWithFallback({
   *   chatUploadedLogo: metadata.chatUploadedImage,
   *   productLogo: metadata.logo,
   *   brandDna: activeBrandDna,
   * });
   * if (result) {
   *   console.log(`Using ${result.source} logo`);
   * }
   * ```
   */
  public resolveLogoWithFallback(options: LogoFallbackOptions): LogoSource | null {
    // Priority 1: Chat-uploaded logo (highest)
    if (options.chatUploadedLogo && this.isValidLogo(options.chatUploadedLogo)) {
      return {
        logo: options.chatUploadedLogo,
        source: "chat_upload",
      };
    }

    // Priority 2: Product metadata logo
    if (options.productLogo && this.isValidLogo(options.productLogo)) {
      return {
        logo: options.productLogo,
        source: "product_metadata",
      };
    }

    // Priority 3: Brand DNA logo
    if (options.brandDna?.logo_url && this.isValidLogo(options.brandDna.logo_url)) {
      return {
        logo: options.brandDna.logo_url,
        source: "brand_dna",
      };
    }

    // No logo found
    return null;
  }

  /**
   * Check if a logo value is valid (non-empty string)
   */
  private isValidLogo(logo: string | undefined | null): boolean {
    return typeof logo === "string" && logo.trim().length > 0;
  }

  /**
   * Get logo with fallback for image generation
   * Returns just the logo string (or undefined if no logo)
   */
  public getLogoForGeneration(options: LogoFallbackOptions): string | undefined {
    const result = this.resolveLogoWithFallback(options);
    return result?.logo;
  }

  // --------------------------------------------------------------------------
  // Private Helper Methods
  // --------------------------------------------------------------------------

  private generateContextFromOptions(
    brandDna: BrandDNA,
    options: BrandContextOptions
  ): string {
    if (options.detailed) {
      return this.generateContextPrompt(brandDna);
    }

    if (options.includeSections?.length) {
      return this.generateSectionedContext(brandDna, options.includeSections);
    }

    return this.generateConciseContextPrompt(brandDna);
  }

  private generateSectionedContext(
    brandDna: BrandDNA,
    sections: BrandContextOptions["includeSections"]
  ): string {
    if (!sections) return "";

    const parts: string[] = [];

    for (const section of sections) {
      switch (section) {
        case "identity":
          const identity = this.buildIdentitySection(brandDna);
          if (identity) parts.push(identity);
          break;
        case "style":
          const style = this.buildStyleSection(brandDna);
          if (style) parts.push(style);
          break;
        case "materials":
          const materials = this.buildMaterialsSection(brandDna);
          if (materials) parts.push(materials);
          break;
        case "colors":
          const colors = this.buildColorsSection(brandDna);
          if (colors) parts.push(colors);
          break;
        case "audience":
          const audience = this.buildAudienceSection(brandDna);
          if (audience) parts.push(audience);
          break;
        case "restrictions":
          const restrictions = this.buildRestrictionsSection(brandDna);
          if (restrictions) parts.push(restrictions);
          break;
        case "techpack":
          const techpack = this.buildTechpackSection(brandDna);
          if (techpack) parts.push(techpack);
          break;
      }
    }

    if (parts.length === 0) return "";

    return `[BRAND DNA CONTEXT]\n${parts.join("\n")}\n[END BRAND DNA CONTEXT]`;
  }

  private buildIdentitySection(brandDna: BrandDNA): string {
    const parts: string[] = [];

    if (brandDna.brand_name) parts.push(`Brand: ${brandDna.brand_name}`);
    if (brandDna.tagline) parts.push(`Tagline: ${brandDna.tagline}`);
    if (brandDna.category) parts.push(`Category: ${brandDna.category}`);
    if (brandDna.summary) parts.push(`Description: ${brandDna.summary}`);

    return parts.length > 0 ? `Identity: ${parts.join(" | ")}` : "";
  }

  private buildStyleSection(brandDna: BrandDNA): string {
    const parts: string[] = [];

    if (brandDna.style_keyword?.length) {
      parts.push(`Keywords: ${brandDna.style_keyword.join(", ")}`);
    }
    if (brandDna.tone_values) {
      parts.push(`Tone: ${brandDna.tone_values}`);
    }
    if (brandDna.patterns?.length) {
      parts.push(`Patterns: ${brandDna.patterns.join(", ")}`);
    }

    return parts.length > 0 ? `Style: ${parts.join(" | ")}` : "";
  }

  private buildMaterialsSection(brandDna: BrandDNA): string {
    if (!brandDna.materials?.length) return "";
    return `Materials: ${brandDna.materials.join(", ")}`;
  }

  private buildColorsSection(brandDna: BrandDNA): string {
    if (!brandDna.colors?.length) return "";
    return `Colors: ${brandDna.colors.join(", ")}`;
  }

  private buildAudienceSection(brandDna: BrandDNA): string {
    if (!brandDna.audience) return "";
    return `Target Audience: ${brandDna.audience}`;
  }

  private buildRestrictionsSection(brandDna: BrandDNA): string {
    if (!brandDna.restrictions) return "";
    return `Guidelines: ${brandDna.restrictions}`;
  }

  private buildTechpackSection(brandDna: BrandDNA): string {
    if (!brandDna.company_techpack) return "";

    const techpack = brandDna.company_techpack;
    const parts: string[] = [];

    if (techpack.materialsAndComponents?.fabricComposition?.length) {
      parts.push(
        `Fabrics: ${techpack.materialsAndComponents.fabricComposition.join(", ")}`
      );
    }
    if (techpack.colorData?.colorNames?.length) {
      parts.push(`Standard Colors: ${techpack.colorData.colorNames.join(", ")}`);
    }
    if (techpack.constructionDetails?.stitchTypes?.length) {
      parts.push(
        `Construction: ${techpack.constructionDetails.stitchTypes.join(", ")}`
      );
    }

    return parts.length > 0 ? `Tech Specs: ${parts.join(" | ")}` : "";
  }

  private buildBrandSummaryForAI(brandDna: BrandDNA): string {
    const parts: string[] = [];

    if (brandDna.brand_name) parts.push(`Brand Name: ${brandDna.brand_name}`);
    if (brandDna.category) parts.push(`Category: ${brandDna.category}`);
    if (brandDna.tagline) parts.push(`Tagline: ${brandDna.tagline}`);
    if (brandDna.summary) parts.push(`Summary: ${brandDna.summary}`);
    if (brandDna.style_keyword?.length) {
      parts.push(`Style Keywords: ${brandDna.style_keyword.join(", ")}`);
    }
    if (brandDna.colors?.length) {
      parts.push(`Color Palette: ${brandDna.colors.join(", ")}`);
    }
    if (brandDna.materials?.length) {
      parts.push(`Preferred Materials: ${brandDna.materials.join(", ")}`);
    }
    if (brandDna.tone_values) parts.push(`Brand Tone: ${brandDna.tone_values}`);
    if (brandDna.audience) parts.push(`Target Audience: ${brandDna.audience}`);
    if (brandDna.restrictions) {
      parts.push(`Design Guidelines: ${brandDna.restrictions}`);
    }

    return parts.join("\n");
  }
}

// ============================================================================
// Utility Functions (for direct usage without class instantiation)
// ============================================================================

/**
 * Get the Brand DNA Context Service instance
 */
export function getBrandDnaContextService(): BrandDnaContextService {
  return BrandDnaContextService.getInstance();
}

/**
 * Inject brand context into a prompt (convenience function)
 */
export function injectBrandContext(
  prompt: string,
  brandDna: BrandDNA | null,
  options?: BrandContextOptions
): PromptWithContext {
  return getBrandDnaContextService().injectContext(prompt, brandDna, options);
}

/**
 * Generate a context prompt from Brand DNA (convenience function)
 */
export function generateBrandContextPrompt(
  brandDna: BrandDNA,
  concise: boolean = false
): string {
  const service = getBrandDnaContextService();
  return concise
    ? service.generateConciseContextPrompt(brandDna)
    : service.generateContextPrompt(brandDna);
}

/**
 * Generate an AI-enhanced context prompt (convenience function)
 */
export async function generateAIBrandContextPrompt(
  brandDna: BrandDNA
): Promise<string> {
  return getBrandDnaContextService().generateAIContextPrompt(brandDna);
}

/**
 * Resolve logo using fallback hierarchy (convenience function)
 *
 * Priority (highest to lowest):
 * 1. Chat-uploaded logo
 * 2. Product metadata logo
 * 3. Brand DNA logo
 */
export function resolveLogoWithFallback(options: LogoFallbackOptions): LogoSource | null {
  return getBrandDnaContextService().resolveLogoWithFallback(options);
}

/**
 * Get logo for generation with fallback (convenience function)
 * Returns the logo string or undefined if no logo found
 */
export function getLogoForGeneration(options: LogoFallbackOptions): string | undefined {
  return getBrandDnaContextService().getLogoForGeneration(options);
}
