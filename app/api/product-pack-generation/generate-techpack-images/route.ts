import { TechPackImageService } from "@/app/actions/Sketech-generation";
import { TechPackData } from "@/lib/types/sketch-generation";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received body keys:", Object.keys(body));
    
    let {
      techPackData,
      imageType = "all",
      options = {},
    }: {
      techPackData: TechPackData;
      imageType?: "vector" | "detail" | "technical" | "all";
      options?: any;
    } = body;
    
    // The frontend sends getTechPack which is already the full TechPackData structure
    // So techPackData is already the complete object we need
    console.log("techPackData structure:", {
      hasTechPack: !!techPackData,
      hasTechPackField: !!techPackData?.tech_pack,
      hasImageData: !!techPackData?.image_data,
      techPackKeys: techPackData ? Object.keys(techPackData) : [],
      productName: techPackData?.tech_pack?.productName,
    });
    
    if (!techPackData) {
      return NextResponse.json({ message: "Tech pack data is required" }, { status: 400 });
    }
    
    // Ensure tech_pack has productName (fallback to a default if missing)
    if (!techPackData.tech_pack.productName) {
      techPackData.tech_pack.productName = "Product";
    }

    const imageService = new TechPackImageService();

    let result;
    switch (imageType) {
      case "vector":
        result = await imageService.generateVectorImage(techPackData, options);
        break;
      case "detail":
        result = await imageService.generateDetailImage(techPackData, options);
        break;
      case "technical":
        result = await imageService.generateTechnicalImage(techPackData, options);
        break;
      case "all":
      default:
        result = await imageService.generateAllImages(techPackData, options);
        break;
    }

    // Update product status to completed after successfully generating technical files
    if (techPackData.id) {
      try {
        const supabase = await createClient();
        const { error: statusUpdateError } = await supabase
          .from('product_ideas')
          .update({
            status: 'Completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', techPackData.id);

        if (statusUpdateError) {
          console.error('⚠️ Failed to update product status to completed:', statusUpdateError);
        } else {
          console.log('✅ Product status updated to completed after generating technical files');
        }
      } catch (statusError) {
        console.error('⚠️ Error updating product status:', statusError);
        // Don't fail the whole operation - files were generated successfully
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      imageType,
    });
  } catch (error) {
    console.error("❌ API Error - Failed to generate tech pack images");
    console.error("Error object:", error);
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate tech pack images",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
