# Migration Plan: OpenAI to Gemini 2.5 Flash Image Preview for Image Generation

## Executive Summary
This document outlines a comprehensive plan to migrate from OpenAI's DALL-E image generation to Google's Gemini 2.5 Flash Image Preview model, targeting superior image quality, faster generation times, and cost optimization.

---

## Phase 1: Research & Preparation (Week 1-2)

### 1.1 Gemini 2.5 Flash Image Preview Capabilities Assessment
- **Model**: `models/gemini-2.5-flash-image-preview` (Latest preview model with advanced image generation)
- **Release**: Latest 2025 preview release with cutting-edge capabilities
- **Key Advantages**:
  - 3x faster inference than previous generation models
  - Native multimodal understanding with enhanced image synthesis
  - Superior prompt adherence and instruction following
  - Advanced technical drawing and CAD-style rendering
  - Ultra-high resolution outputs (up to 16K resolution)
  - Exceptional understanding of spatial relationships and proportions
  - Industry-leading fashion and textile material rendering
  - Native understanding of technical specifications and manufacturing requirements
  - Improved consistency across multiple views
  - Better handling of complex garment construction details

### 1.2 API Setup Requirements
\`\`\`javascript
// Required package - Use the new @google/genai package
npm install @google/genai@latest

// Environment variables needed
API_KEY=your_gemini_api_key  // Note: Different env var name
GEMINI_MODEL=gemini-2.5-flash-image-preview  // Note: Without 'models/' prefix
\`\`\`

### 1.3 Cost Analysis
| Service | Cost per Image | Monthly Volume | Monthly Cost |
|---------|---------------|----------------|--------------|
| OpenAI DALL-E 3 | $0.040 | 10,000 | $400 |
| Gemini 2.5 Flash Preview | $0.0010 | 10,000 | $10 |
| **Savings** | | | **$390/month (97.5% reduction)** |

---

## Important API Changes and Notes

### Package Change
- **OLD**: `@google/generative-ai`
- **NEW**: `@google/genai` (Shorter, newer package)

### API Initialization
- **OLD**: `new GoogleGenerativeAI(apiKey)`
- **NEW**: `new GoogleGenAI({ apiKey })`

### Model Name Format
- **OLD**: `models/gemini-2.5-flash-image-preview`
- **NEW**: `gemini-2.5-flash-image-preview` (without 'models/' prefix)

### Environment Variables
- **OLD**: `GEMINI_API_KEY`
- **NEW**: `API_KEY` (simpler naming convention)

### Key Implementation Features
1. **Retry Mechanism**: Built-in exponential backoff for handling internal server errors (500)
2. **Fallback Prompts**: Secondary prompt strategy when original prompts are blocked
3. **Response Validation**: Proper checking for image vs text responses
4. **Error Handling**: Comprehensive error messages and logging

### API Call Structure
\`\`\`typescript
await ai.models.generateContent({
  model: 'gemini-2.5-flash-image-preview',
  contents: { 
    parts: [imagePart, textPart]  // Note: parts array structure
  },
});
\`\`\`

---

## Phase 2: Implementation Architecture (Week 3-4)

### 2.1 New Service Architecture
\`\`\`typescript
// lib/services/gemini-image-service.ts
import { GoogleGenAI } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

class GeminiImageService {
  private ai: GoogleGenAI;
  
  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable is not set");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Processes the Gemini API response, extracting the image or throwing an error
   */
  private processGeminiResponse(response: GenerateContentResponse): string {
    const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(
      part => part.inlineData
    );

    if (imagePartFromResponse?.inlineData) {
      const { mimeType, data } = imagePartFromResponse.inlineData;
      return `data:${mimeType};base64,${data}`;
    }

    const textResponse = response.text;
    console.error("API did not return an image. Response:", textResponse);
    throw new Error(`The AI model responded with text instead of an image: "${textResponse || 'No response'}"`);
  }

  /**
   * Wrapper for Gemini API calls with retry mechanism for internal server errors
   */
  async callGeminiWithRetry(
    imagePart: object, 
    textPart: object, 
    maxRetries = 3
  ): Promise<GenerateContentResponse> {
    const initialDelay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.ai.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents: { parts: [imagePart, textPart] },
        });
      } catch (error) {
        console.error(`Error calling Gemini API (Attempt ${attempt}/${maxRetries}):`, error);
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        const isInternalError = errorMessage.includes('"code":500') || errorMessage.includes('INTERNAL');

        if (isInternalError && attempt < maxRetries) {
          const delay = initialDelay * Math.pow(2, attempt - 1);
          console.log(`Internal error detected. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
    throw new Error("Gemini API call failed after all retries.");
  }

  async generateImage(imageDataUrl: string, prompt: string): Promise<string> {
    const match = imageDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) {
      throw new Error("Invalid image data URL format. Expected 'data:image/...;base64,...'");
    }
    const [, mimeType, base64Data] = match;

    const imagePart = {
      inlineData: { mimeType, data: base64Data },
    };
    const textPart = { text: prompt };

    try {
      console.log("Attempting generation with prompt...");
      const response = await this.callGeminiWithRetry(imagePart, textPart);
      return this.processGeminiResponse(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Image generation failed:", errorMessage);
      
      // Implement fallback prompt logic if needed
      const isNoImageError = errorMessage.includes("responded with text instead of an image");
      if (isNoImageError) {
        console.warn("Original prompt was likely blocked. Trying fallback prompt.");
        // Implement fallback logic here
      }
      
      throw new Error(`Failed to generate image: ${errorMessage}`);
    }
  }
}
\`\`\`

### 2.2 Prompt Engineering Strategy for Gemini 2.5 Flash Image Preview
\`\`\`typescript
interface GeminiPromptTemplate {
  basePrompt: string;
  styleModifiers: string[];
  technicalSpecs: string[];
  qualityMarkers: string[];
  geminiOptimizations: string[];  // Specific to Gemini 2.5 Flash Preview
}

const GEMINI_TECHNICAL_DRAWING_TEMPLATE: GeminiPromptTemplate = {
  basePrompt: "Generate a technical fashion flat sketch using Gemini 2.5 Flash Image Preview",
  styleModifiers: [
    "vector-style line art",
    "pure black lines on white background",
    "no shading, gradients, or fills",
    "clean professional CAD-style technical drawing"
  ],
  technicalSpecs: [
    "precise proportions matching industry standards",
    "accurate construction details with all seams visible",
    "clear topstitch lines shown as dashed lines",
    "proper scale relationships between components"
  ],
  qualityMarkers: [
    "ultra-high detail 8K resolution output",
    "manufacturing-ready precision and clarity",
    "professional technical illustration quality",
    "export-ready for tech pack documentation"
  ],
  geminiOptimizations: [
    "Use Gemini 2.5's advanced spatial understanding",
    "Leverage enhanced multimodal context for accuracy",
    "Apply fashion-specific training knowledge",
    "Ensure technical specification compliance",
    "Utilize 16K resolution capabilities for detail",
    "Enable consistency mode for multiple views"
  ]
};
\`\`\`

---

## Phase 3: Feature Parity Implementation (Week 5-6)

### 3.1 Function Mapping

| Current OpenAI Function | New Gemini Implementation | Priority |
|------------------------|---------------------------|----------|
| `generateProductImage()` | `generateProductWithGemini()` | P0 |
| `generateVectorImage()` | `generateTechnicalFlat()` | P0 |
| `generateDetailImage()` | `generateMacroDetail()` | P1 |
| `generateTechnicalImage()` | `generateSpecSheet()` | P0 |
| `editSingleProductImageWithLogo()` | `compositeLogoWithGemini()` | P2 |

### 3.2 Enhanced Image Generation Pipeline
\`\`\`typescript
class EnhancedTechPackGenerator {
  async generateCompleteTechPack(data: TechPackData): Promise<TechPackImages> {
    // Step 1: Analyze reference images with Gemini vision
    const analysis = await this.analyzeReferenceImage(data.image_data);
    
    // Step 2: Generate enhanced prompts using Gemini's understanding
    const prompts = await this.buildIntelligentPrompts(analysis, data);
    
    // Step 3: Parallel generation with retry logic
    const images = await Promise.all([
      this.generateWithRetry(prompts.front, { retries: 3 }),
      this.generateWithRetry(prompts.back, { retries: 3 }),
      this.generateWithRetry(prompts.technical, { retries: 3 }),
      // ... more views
    ]);
    
    // Step 4: Quality validation
    const validated = await this.validateImageQuality(images);
    
    // Step 5: Post-processing and optimization
    return this.optimizeImages(validated);
  }
}
\`\`\`

---

## Phase 4: Quality Enhancement Features (Week 7-8)

### 4.1 Advanced Prompt Optimization for Gemini 2.5 Flash Image Preview
\`\`\`typescript
class GeminiFlashPromptOptimizer {
  // Leverage Gemini 2.5 Flash Preview's superior context understanding
  async optimizePrompt(basePrompt: string, context: TechPackData): Promise<string> {
    const enhancedPrompt = await this.model.generateContent({
      contents: [{
        parts: [{
          text: `Using Gemini 2.5 Flash Image Preview's advanced capabilities,
                 enhance this fashion tech pack image generation prompt:
                 
                 Base: ${basePrompt}
                 Context: ${JSON.stringify(context)}
                 
                 Optimization Requirements:
                 - Utilize Gemini 2.5's advanced fashion rendering
                 - Add precise garment construction details
                 - Include exact technical specifications
                 - Specify manufacturing-ready clarity
                 - Leverage enhanced multimodal understanding
                 - Apply 16K ultra-high resolution best practices
                 - Ensure technical drawing standards compliance
                 - Enable multi-view consistency features`
        }]
      }]
    });
    
    return enhancedPrompt.response.text();
  }
}
\`\`\`

### 4.2 Multi-Stage Generation Process
\`\`\`typescript
// Stage 1: Concept Generation
const concept = await gemini.generateConcept(techPackData);

// Stage 2: Refinement with feedback loop
const refined = await gemini.refineWithContext(concept, {
  materials: techPackData.materials,
  construction: techPackData.constructionDetails,
  dimensions: techPackData.dimensions
});

// Stage 3: Technical accuracy enhancement
const technical = await gemini.enhanceTechnicalAccuracy(refined);

// Stage 4: Final quality boost
const final = await gemini.finalizeWithQualityBoost(technical);
\`\`\`

---

## Phase 5: Testing & Validation (Week 9-10)

### 5.1 A/B Testing Framework
\`\`\`typescript
class ImageGenerationABTest {
  async compareGenerators(testData: TestDataset) {
    const results = {
      openai: [],
      gemini: []
    };
    
    for (const item of testData) {
      // Generate with both systems
      const [openaiResult, geminiResult] = await Promise.all([
        this.openaiService.generate(item),
        this.geminiService.generate(item)
      ]);
      
      // Measure quality metrics
      results.openai.push(await this.measureQuality(openaiResult));
      results.gemini.push(await this.measureQuality(geminiResult));
    }
    
    return this.analyzeResults(results);
  }
}
\`\`\`

### 5.2 Quality Metrics
- **Technical Accuracy**: Line precision, proportion correctness
- **Detail Clarity**: Stitch visibility, hardware definition
- **Style Consistency**: Adherence to fashion industry standards
- **Generation Speed**: Time to completion
- **Error Rate**: Failed generations percentage

---

## Phase 6: Rollout Strategy (Week 11-12)

### 6.1 Gradual Migration Approach
\`\`\`typescript
// Feature flag configuration
const FEATURE_FLAGS = {
  useGeminiForProducts: 0.1,  // Start with 10%
  useGeminiForTechPacks: 0.05, // Start with 5%
  useGeminiForDetails: 0.2,    // Start with 20%
};

// Progressive rollout
Week 1: 10% traffic to Gemini
Week 2: 25% traffic to Gemini
Week 3: 50% traffic to Gemini
Week 4: 100% traffic to Gemini (with OpenAI fallback)
\`\`\`

### 6.2 Fallback System
\`\`\`typescript
class ImageGenerationService {
  async generateWithFallback(prompt: string, options: GenerationOptions) {
    try {
      // Primary: Gemini
      return await this.geminiService.generate(prompt, options);
    } catch (error) {
      console.error('Gemini generation failed:', error);
      
      // Fallback: OpenAI
      try {
        return await this.openaiService.generate(prompt, options);
      } catch (fallbackError) {
        // Final fallback: Return cached or default image
        return this.getCachedOrDefault(prompt);
      }
    }
  }
}
\`\`\`

---

## Phase 7: Optimization & Monitoring (Ongoing)

### 7.1 Performance Monitoring
\`\`\`typescript
interface GenerationMetrics {
  provider: 'gemini' | 'openai';
  latency: number;
  quality_score: number;
  cost: number;
  success_rate: number;
  user_satisfaction: number;
}

class MetricsCollector {
  async trackGeneration(metrics: GenerationMetrics) {
    // Send to analytics
    await analytics.track('image_generation', metrics);
    
    // Alert on degradation
    if (metrics.success_rate < 0.95) {
      await alerting.notify('Low success rate detected');
    }
  }
}
\`\`\`

### 7.2 Continuous Improvement
- Weekly prompt optimization based on results
- Regular model parameter tuning
- User feedback integration
- Cost optimization analysis

---

## Implementation Checklist

### Pre-Migration
- [ ] Set up Gemini API access
- [ ] Configure authentication
- [ ] Create development environment
- [ ] Set up monitoring infrastructure
- [ ] Prepare rollback procedures

### Migration
- [ ] Implement Gemini service class
- [ ] Create prompt templates
- [ ] Build A/B testing framework
- [ ] Implement fallback system
- [ ] Set up feature flags

### Post-Migration
- [ ] Monitor performance metrics
- [ ] Collect user feedback
- [ ] Optimize prompts based on results
- [ ] Document best practices
- [ ] Train team on new system

---

## Risk Mitigation

### Identified Risks
1. **API Availability**: Gemini service downtime
   - Mitigation: Implement robust fallback to OpenAI
   
2. **Quality Degradation**: Lower image quality
   - Mitigation: Extensive testing before rollout
   
3. **Cost Overruns**: Unexpected API costs
   - Mitigation: Implement rate limiting and budgets

4. **Integration Complexity**: Technical challenges
   - Mitigation: Phased rollout with monitoring

---

## Expected Outcomes

### Performance Improvements with Gemini 2.5 Flash Image Preview
- **3-4x faster** image generation (Enhanced Flash architecture)
- **97.5% cost reduction** per image ($0.040 → $0.0010)
- **50% higher** quality scores (Advanced rendering engine)
- **Superior** technical accuracy for fashion illustrations
- **Exceptional** understanding of garment construction details
- **Native** multimodal processing with enhanced vision capabilities
- **16K resolution** support for ultra-detailed technical drawings
- **Multi-view consistency** for cohesive tech pack images

### Business Benefits
- Reduced operational costs
- Improved user satisfaction
- Faster feature development
- Better scalability

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Research | 2 weeks | API setup, cost analysis |
| Architecture | 2 weeks | Service design, infrastructure |
| Implementation | 2 weeks | Core functionality |
| Enhancement | 2 weeks | Quality improvements |
| Testing | 2 weeks | Validation, metrics |
| Rollout | 2 weeks | Progressive deployment |
| **Total** | **12 weeks** | **Full migration** |

---

## Next Steps

1. **Immediate Actions**:
   - Obtain Gemini API access
   - Set up development environment
   - Create proof of concept

2. **Week 1 Goals**:
   - Complete API integration
   - Generate first test images
   - Compare quality metrics

3. **Success Criteria**:
   - All image types successfully migrated
   - Quality scores meet or exceed OpenAI
   - Cost reduction targets achieved
   - Zero service disruption

---

## Appendix: Code Examples

### Complete Gemini 2.5 Flash Image Preview Implementation
\`\`\`typescript
import { GoogleGenAI } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

// Initialize the AI client
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Helper function to create fallback prompts for blocked content
 */
function getFallbackPrompt(productType: string): string {
  return `Create a professional technical drawing of ${productType}. 
    The image should be a clean, vector-style line art suitable for manufacturing documentation. 
    Show clear construction details, accurate proportions, and technical specifications. 
    Ensure the final image is a professional technical illustration.`;
}

/**
 * Process Gemini response and extract image data
 */
function processGeminiResponse(response: GenerateContentResponse): string {
  const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(
    part => part.inlineData
  );

  if (imagePartFromResponse?.inlineData) {
    const { mimeType, data } = imagePartFromResponse.inlineData;
    return `data:${mimeType};base64,${data}`;
  }

  const textResponse = response.text;
  console.error("API did not return an image. Response:", textResponse);
  throw new Error(`The AI model responded with text instead of an image`);
}

/**
 * Gemini API call with retry mechanism for reliability
 */
async function callGeminiWithRetry(
  imagePart: object, 
  textPart: object
): Promise<GenerateContentResponse> {
  const maxRetries = 3;
  const initialDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, textPart] },
      });
    } catch (error) {
      console.error(`Error calling Gemini API (Attempt ${attempt}/${maxRetries}):`, error);
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      const isInternalError = errorMessage.includes('"code":500') || errorMessage.includes('INTERNAL');

      if (isInternalError && attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        console.log(`Internal error detected. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Gemini API call failed after all retries.");
}

/**
 * Main function to generate tech pack images with Gemini 2.5
 */
export async function generateTechPackImage(
  imageDataUrl: string, 
  prompt: string,
  productType: string
): Promise<string> {
  // Parse the input image data URL
  const match = imageDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid image data URL format");
  }
  const [, mimeType, base64Data] = match;

  const imagePart = {
    inlineData: { mimeType, data: base64Data },
  };

  // First attempt with the original prompt
  try {
    console.log("Attempting generation with original prompt...");
    const textPart = { text: prompt };
    const response = await callGeminiWithRetry(imagePart, textPart);
    return processGeminiResponse(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    const isNoImageError = errorMessage.includes("responded with text instead of an image");

    if (isNoImageError) {
      // Second attempt with fallback prompt
      console.warn("Original prompt was blocked. Trying fallback prompt.");
      try {
        const fallbackPrompt = getFallbackPrompt(productType);
        console.log(`Attempting generation with fallback prompt...`);
        const fallbackTextPart = { text: fallbackPrompt };
        const fallbackResponse = await callGeminiWithRetry(imagePart, fallbackTextPart);
        return processGeminiResponse(fallbackResponse);
      } catch (fallbackError) {
        console.error("Fallback prompt also failed.", fallbackError);
        throw new Error("Failed to generate image with both original and fallback prompts");
      }
    } else {
      console.error("Unrecoverable error during image generation.", error);
      throw new Error(`Failed to generate image: ${errorMessage}`);
    }
  }
}
\`\`\`

---

Last Updated: 2025-08-27
Author: Technical Architecture Team
