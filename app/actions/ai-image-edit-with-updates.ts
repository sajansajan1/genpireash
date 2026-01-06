"use server";

import { applyMultiViewEdit } from "./ai-image-edit-new-table";
import { saveChatMessage } from "./ai-chat-messages";
import { 
  generateDynamicMessage, 
  generateEncouragementMessage,
  generateFollowUpMessage 
} from "./ai-chat-dynamic-messages";

export interface EditWithUpdatesParams {
  productId: string;
  currentViews: {
    front: string;
    back: string;
    side: string;
  };
  editPrompt: string;
  productName?: string;
  productDescription?: string;
  batchId: string;
  userId: string;
}

/**
 * Apply AI edit with real-time chat updates
 * This wraps the main edit function and saves status updates as chat messages
 */
export async function applyAIEditWithUpdates({
  productId,
  currentViews,
  editPrompt,
  productName = "Product",
  productDescription = "",
  batchId,
  userId
}: EditWithUpdatesParams) {
  try {
    // Generate dynamic initial processing message
    const initialMessage = await generateDynamicMessage({
      messageType: 'processing',
      productName,
      editPrompt,
      progress: 10
    });
    
    // Save initial processing message
    await saveChatMessage({
      productIdeaId: productId,
      messageType: "processing",
      content: initialMessage,
      metadata: { progress: 10 },
      batchId
    });

    // Save analysis starting message
    const analysisMessage = await generateDynamicMessage({
      messageType: 'analysis',
      productName,
      editPrompt,
      progress: 30
    });
    
    await saveChatMessage({
      productIdeaId: productId,
      messageType: "analysis",
      content: analysisMessage,
      metadata: { progress: 30 },
      batchId
    });

    // Call the main edit function
    const result = await applyMultiViewEdit({
      productId,
      currentViews,
      editPrompt,
      productName,
      productDescription
    });
    
    // Save processing message
    const processingMessage = await generateEncouragementMessage(70);
    await saveChatMessage({
      productIdeaId: productId,
      messageType: "processing",
      content: processingMessage,
      metadata: { progress: 70 },
      batchId
    });

    // Save success message with images
    if (result.success && result.views) {
      // Save messages for each generated view with dynamic content
      const viewMessages = [
        { view: 'front' as const, url: result.views.front },
        { view: 'back' as const, url: result.views.back },
        { view: 'side' as const, url: result.views.side }
      ];

      for (const viewMsg of viewMessages) {
        // Generate dynamic message for each view
        const viewMessage = await generateDynamicMessage({
          messageType: 'image-ready',
          productName,
          editPrompt,
          viewType: viewMsg.view
        });
        
        await saveChatMessage({
          productIdeaId: productId,
          messageType: "image-ready",
          content: viewMessage,
          metadata: {
            view: viewMsg.view,
            imageUrl: viewMsg.url
          },
          batchId
        });
      }

      // Generate dynamic final success message
      const successMessage = await generateDynamicMessage({
        messageType: 'completion',
        productName,
        editPrompt
      });
      
      // Final success message
      await saveChatMessage({
        productIdeaId: productId,
        messageType: "success",
        content: successMessage,
        batchId
      });
    } else if (!result.success) {
      // Generate dynamic error message
      const errorMessage = await generateDynamicMessage({
        messageType: 'error',
        productName,
        editPrompt,
        errorType: result.error
      });
      
      // Save error message
      await saveChatMessage({
        productIdeaId: productId,
        messageType: "error",
        content: errorMessage,
        batchId
      });
    }

    return result;
  } catch (error) {
    console.error("Error in applyAIEditWithUpdates:", error);
    
    // Generate dynamic error message
    const errorMessage = await generateDynamicMessage({
      messageType: 'error',
      productName,
      editPrompt,
      errorType: error instanceof Error ? error.message : "unexpected"
    }).catch(() => error instanceof Error ? error.message : "An unexpected error occurred");
    
    // Save error message
    await saveChatMessage({
      productIdeaId: productId,
      messageType: "error",
      content: errorMessage,
      batchId
    }).catch(console.error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to apply edits"
    };
  }
}

/**
 * Analyze image with detailed status updates
 */
export async function analyzeImageWithUpdates(
  imageUrl: string,
  productId: string,
  batchId: string
) {
  try {
    // Log the analysis start
    await saveChatMessage({
      productIdeaId: productId,
      messageType: "analysis",
      content: `Analyzing image with GPT-4 Vision: ${imageUrl}`,
      metadata: {
        imageUrl,
        step: "analysis_start"
      },
      batchId
    });

    // Add more detailed logging here based on your analysis flow
    
    return {
      success: true,
      message: "Analysis complete"
    };
  } catch (error) {
    console.error("Error in analyzeImageWithUpdates:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Analysis failed"
    };
  }
}
