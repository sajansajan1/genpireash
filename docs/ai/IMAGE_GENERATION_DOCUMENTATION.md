# Image Generation Documentation

## Overview

This document provides a comprehensive overview of all image generation functionality within the Genpire codebase. The system generates images through various methods including AI-powered generation, image processing, and HTML-to-canvas conversion.

## Image Generation Locations and Methods

### 1. AI-Powered Product Image Generation

**Location**: `/app/actions/idea-generation.ts:246-319`  
**Function**: `generateProductImage()`  
**Technology**: OpenAI DALL-E (gpt-image-1 model)  
**Purpose**: Generates multiple views of products for visualization

#### Generated Views:

- Front view
- Back view
- Side profile view (optional)
- Bottom view (optional)
- Lifestyle illustration (optional)

#### Key Features:

- Supports both basic (front/back) and extended view generation
- Creates photorealistic product photography with clean backgrounds
- Generates lifestyle illustrations showing products in context

---

### 2. Logo Overlay and Image Editing

**Location**: `/app/actions/idea-generation.ts:321-429`  
**Functions**:

- `overlayLogoOnProduct()` - Composites logo onto product image
- `editSingleProductImageWithLogo()` - Sends merged image to OpenAI for refinement
- `generateProductImageWithLogoEdit()` - Processes multiple views with logos

**Technology**:

- Sharp.js for image processing and compositing
- OpenAI Image Edit API for AI-powered refinement

**Purpose**: Adds branding/logos to product images and regenerates them for natural integration

#### Process Flow:

1. Logo is resized and positioned using Sharp
2. Images are composited together
3. OpenAI refines the merged image for realistic appearance

---

### 3. Technical Drawing Generation (Tech Pack Images)

**API Endpoint**: `/app/api/generate-techpack-images/route.ts`  
**Service File**: `/app/actions/Sketech-generation.ts`  
**Class**: `TechPackImageService`

#### Generated Image Types:

| Image Type       | Function                         | Line Numbers | Description                              |
| ---------------- | -------------------------------- | ------------ | ---------------------------------------- |
| Vector           | `generateVectorImage()`          | 20-90        | Black and white line art drawings        |
| Detail           | `generateDetailImage()`          | 92-176       | Close-up macro views of specific areas   |
| Technical        | `generateTechnicalImage()`       | 178-244      | Specification drawings with measurements |
| Front View       | `generateFrontImage()`           | 246-307      | Technical front view flat sketch         |
| Back View        | `generateBackImage()`            | 309-362      | Technical back view flat sketch          |
| Construction     | `generateConstructionImage()`    | 364-417      | Assembly and construction details        |
| Callout          | `generateCalloutImage()`         | 419-472      | Annotated diagrams with callouts         |
| Measurement      | `generateMeasurementImage()`     | 474-527      | Points of measure (POM) diagrams         |
| Scale/Proportion | `generateScaleProportionImage()` | 529-585      | Scale reference diagrams                 |

**Technology Stack**:

- OpenAI GPT-4o for intelligent prompt generation
- DALL-E (gpt-image-1) for actual image generation
- Supabase for image storage

**Purpose**: Creates comprehensive technical drawings for fashion tech packs, suitable for manufacturing documentation

#### Workflow:

1. GPT-4o analyzes tech pack data and reference images
2. Generates optimized prompts for DALL-E
3. DALL-E creates technical drawings based on prompts
4. Images are uploaded to Supabase storage
5. Database is updated with image URLs

---

### 4. PDF Generation with Embedded Images

**Location**: `/components/pdfgenerator/downloadPdf.ts`  
**Functions**:

- `generatePdfFromData()` (Lines 4-441) - Generates PDF from RFQ data
- `generatePdffromTechpack()` (Lines 443-879) - Generates PDF from tech pack

**Technology**:

- html2canvas - Converts HTML elements to canvas images
- jsPDF - Creates PDF documents with embedded images

**Purpose**: Generates downloadable PDF documents with product images and technical specifications

#### Process:

1. Creates hidden HTML elements with formatted content
2. Uses html2canvas to convert HTML to image data
3. Embeds images into PDF pages using jsPDF
4. Outputs as downloadable file or base64 string

---

### 5. Image Analysis and Tech Pack Generation

**Location**: `/app/actions/idea-generation.ts:155-208`  
**Function**: `generateTechPackFromImage()`  
**Technology**: OpenAI GPT-4o vision model  
**Purpose**: Analyzes uploaded product images to automatically generate tech pack specifications

#### Capabilities:

- Extracts product details from visual analysis
- Identifies materials, colors, and construction details
- Generates structured tech pack data from images

---

## Integration Points

### API Routes

- `/api/generate-techpack-images` - POST endpoint for tech pack image generation

### File Upload and Storage

- Supabase storage bucket for persistent image storage
- Base64 encoding for temporary image handling
- Buffer manipulation for image processing

### Database Updates

- `product_ideas` table stores image URLs and metadata
- `technical_images` field contains all generated tech pack images

---

## Environment Requirements

### Required Environment Variables:

\`\`\`
NEXT_PUBLIC_OPENAI_API_KEY - OpenAI API access
SUPABASE_URL - Supabase project URL
SUPABASE_SERVICE_KEY - Supabase service key
\`\`\`

### Dependencies:

- `openai` - OpenAI SDK for API access
- `sharp` - High-performance image processing
- `html2canvas` - HTML to canvas conversion
- `jspdf` - PDF generation
- `form-data` - Multipart form data handling
- `axios` - HTTP client for API calls

---

## Performance Considerations

1. **Parallel Generation**: Tech pack images are generated in parallel using `Promise.all()`
2. **Image Compression**: JPEG format with quality settings for optimal file sizes
3. **Caching**: 15-minute cache for web fetch operations
4. **Error Handling**: Graceful fallbacks for failed image generation

---

## Security Considerations

1. API keys stored as environment variables
2. Image URLs validated before processing
3. File size limits enforced
4. CORS configuration for cross-origin image access

---

## Future Enhancement Opportunities

1. Implement image caching layer
2. Add support for additional image formats
3. Implement batch processing for multiple products
4. Add image optimization pipeline
5. Implement progressive image loading
6. Add support for 3D visualization
7. Implement AI-powered image enhancement

---

## Maintenance Notes

- Regular monitoring of OpenAI API usage and costs
- Periodic cleanup of unused images in Supabase storage
- Update prompts based on generation quality feedback
- Monitor and optimize image file sizes
- Keep dependencies updated for security patches

---

## Contact and Support

For questions or issues related to image generation functionality, refer to the technical documentation or contact the development team.

Last Updated: 2025-08-27
