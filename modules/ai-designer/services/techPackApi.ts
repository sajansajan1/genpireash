/**
 * Tech Pack API Service
 * Wrapper for all tech pack-related API calls
 * Uses existing backend endpoints without modifications
 */

import type {
  TechPackData,
  TechPackApiResponse,
  TechPackContent,
  GenerationResult,
  FileGenerationResult,
  TechnicalImages,
} from "../types/techPack";

/**
 * Tech Pack API Service Class
 * Provides methods for all tech pack operations
 */
export class TechPackApiService {
  /**
   * Fetch tech pack data for a product
   */
  async getTechPack(productId: string): Promise<TechPackData | null> {
    try {
      const response = await fetch("/api/tech-pack/get-techpack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch tech pack");
      }

      const data = await response.json();

      // The API returns { productIdea: {...} }
      // Extract tech_pack from product_ideas table
      if (data.productIdea?.tech_pack) {
        return {
          id: data.productIdea.id || productId,
          product_idea_id: productId,
          user_id: data.productIdea.user_id || "",
          is_active: true,
          tech_pack_data: data.productIdea.tech_pack,
          technical_images: data.productIdea.technical_images,
          image_data: data.productIdea.image_data,
        } as TechPackData;
      }

      return null;
    } catch (error) {
      console.error("Error fetching tech pack:", error);
      throw error;
    }
  }

  /**
   * Generate tech pack for a product
   * Uses existing endpoint from create-product-entry.ts
   */
  async generateTechPack(
    productId: string,
    revisionId?: string
  ): Promise<GenerationResult> {
    try {
      // Import the action dynamically to avoid server/client issues
      const { generateTechPackForProduct } = await import(
        "@/app/actions/create-product-entry"
      );
      console.log(
        "generateTechPackForProduct ------- ",
        generateTechPackForProduct
      );

      const result = await generateTechPackForProduct(
        productId,
        // @ts-ignore
        revisionId ? { id: revisionId } : undefined
      );

      if (result.success) {
        return {
          success: true,
          techPackId: productId,
        };
      } else {
        return {
          success: false,
          error: result.error || "Failed to generate tech pack",
        };
      }
    } catch (error) {
      console.error("Error generating tech pack:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update tech pack data
   */
  async updateTechPack(
    productId: string,
    updates: Partial<TechPackContent>
  ): Promise<TechPackApiResponse> {
    try {
      const response = await fetch("/api/tech-pack/update-techpack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: productId,
          updatedTechpack: updates,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update tech pack");
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error updating tech pack:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate technical specification files (6 credits)
   */
  async generateTechnicalFiles(
    productId: string,
    techPackData?: TechPackData
  ): Promise<FileGenerationResult> {
    try {
      // If techPackData is not provided, fetch it first
      if (!techPackData) {
        const fetchResult = await this.getTechPack(productId);
        if (!fetchResult) {
          throw new Error("Failed to fetch tech pack data");
        }
        techPackData = fetchResult;
      }

      // Transform the data structure to match what the API expects
      // API expects: { tech_pack: {...}, image_data: {...}, id: string }
      // We have: { tech_pack_data: {...}, technical_images: {...} }
      const apiPayload = {
        tech_pack: techPackData.tech_pack_data,
        image_data: (techPackData as any).image_data,
        technical_images: techPackData.technical_images,
        id: techPackData.id || techPackData.product_idea_id, // Use id or fallback to product_idea_id
        user_id: techPackData.user_id,
      };

      console.log("Sending to API:", {
        hasId: !!apiPayload.id,
        id: apiPayload.id,
        hasTechPack: !!apiPayload.tech_pack,
        hasImageData: !!apiPayload.image_data,
      });

      const response = await fetch(
        "/api/product-pack-generation/generate-techpack-images",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            techPackData: apiPayload,
            imageType: "all",
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || error.error || "Failed to generate technical files"
        );
      }

      const data = await response.json();

      return {
        success: true,
        files: {
          technicalImages: data.images || [],
        },
        creditsUsed: 6,
      };
    } catch (error) {
      console.error("Error generating technical files:", error);
      console.error("Error details:", {
        productId,
        hasTechPackData: !!techPackData,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate print files
   */
  async generatePrintFiles(productId: string): Promise<Blob> {
    try {
      const response = await fetch("/api/print-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate print files");
      }

      return await response.blob();
    } catch (error) {
      console.error("Error generating print files:", error);
      throw error;
    }
  }

  /**
   * Download PDF
   * Note: PDF generation happens on-demand, not pre-generated
   */
  async downloadPDF(techPackData: TechPackData): Promise<Blob> {
    try {
      // Import PDF generator dynamically
      const { generatePdfBase64 } = await import("@/components/pdf-generator");

      const pdfBase64 = await generatePdfBase64({ tech_pack: techPackData });

      // Convert base64 to blob
      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: "application/pdf" });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      throw error;
    }
  }

  /**
   * Download Excel
   */
  async downloadExcel(techPackData: TechPackData): Promise<Blob> {
    try {
      // Import Excel generator dynamically
      const { generateExcelFromData } = await import(
        "@/components/excel-generator"
      );

      const workbook = await generateExcelFromData({ tech_pack: techPackData });
      const buffer = await workbook.xlsx.writeBuffer();

      return new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    } catch (error) {
      console.error("Error downloading Excel:", error);
      throw error;
    }
  }

  /**
   * Convert image to SVG
   */
  async convertToSVG(imageUrl: string): Promise<Blob> {
    try {
      const response = await fetch("/api/svg-converter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to convert to SVG");
      }

      return await response.blob();
    } catch (error) {
      console.error("Error converting to SVG:", error);
      throw error;
    }
  }

  /**
   * Share tech pack via email
   */
  async shareTechPackByEmail(
    techPackData: TechPackData,
    email: string
  ): Promise<boolean> {
    try {
      const { generatePdfBase64 } = await import("@/components/pdf-generator");
      const pdfBase64 = await generatePdfBase64({ tech_pack: techPackData });

      const fileName = `${techPackData.tech_pack_data.productName}.pdf`;

      const response = await fetch("/api/pdfSender/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          pdfBuffer: pdfBase64,
          fileName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      return true;
    } catch (error) {
      console.error("Error sharing via email:", error);
      return false;
    }
  }

  /**
   * Share tech pack via WhatsApp
   */
  async shareTechPackByWhatsApp(
    techPackData: TechPackData,
    phoneNumber: string
  ): Promise<boolean> {
    try {
      // Note: WhatsApp requires a public URL
      // This would need additional implementation for URL generation
      const fileName = `${techPackData.tech_pack_data.productName}.pdf`;

      const response = await fetch("/api/pdfSender/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          pdfUrl: "https://temp-url.com", // TODO: Generate temp URL
          fileName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send WhatsApp message");
      }

      return true;
    } catch (error) {
      console.error("Error sharing via WhatsApp:", error);
      return false;
    }
  }

  /**
   * Check generation status (for polling)
   * Note: This might need to be implemented on the backend
   */
  async checkGenerationStatus(taskId: string): Promise<{
    completed: boolean;
    progress: number;
    step: string;
    error?: string;
    data?: TechPackData;
  }> {
    try {
      // This endpoint might not exist yet - placeholder implementation
      const response = await fetch(`/api/tech-pack/status?taskId=${taskId}`);

      if (!response.ok) {
        throw new Error("Failed to check status");
      }

      return await response.json();
    } catch (error) {
      console.error("Error checking generation status:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const techPackApi = new TechPackApiService();

// Export as default for easier imports
export default techPackApi;
