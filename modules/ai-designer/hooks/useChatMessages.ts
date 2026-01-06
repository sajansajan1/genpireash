/**
 * Custom hook for managing chat messages with database persistence
 */

import { useEffect, useState, useCallback } from "react";
import { useChatStore } from "../store/chatStore";
import { useEditorStore, type WorkflowMode } from "../store/editorStore";
import { getChatMessages, saveChatMessage } from "../services/chatSession";
import { detectMessageIntent } from "../services/aiIntentDetection";
import { captureDesignScreenshot } from "../services/annotationCapture";
import type { ChatMessage, ChatMessageType } from "../types";
import {
  generateFrontViewOnly,
  handleFrontViewDecision,
  generateRemainingViews,
  createRevisionAfterApproval,
  generateVirtualTryOn,
} from "@/app/actions/progressive-generation-workflow";
import { saveImageWithAIParsedIntent } from "@/app/actions/save-chat-uploaded-image";

/**
 * Generated tech files data for context-aware Q&A
 */
export interface TechFilesData {
  category?: {
    category: string;
    subcategory: string;
    confidence: number;
  };
  baseViews?: Array<{
    viewType: string;
    analysisData: any;
  }>;
  components?: Array<{
    componentName: string;
    componentType: string;
    guide: any;
  }>;
  closeUps?: Array<{
    shotMetadata: { focus_area: string; description: string };
    summary?: any;
  }>;
  sketches?: Array<{
    viewType: string;
    summary?: any;
    measurements?: Record<string, { value: string; unit: string }>;
  }>;
}

/**
 * Extracts relevant context from tech pack data for AI prompts
 */
function extractTechPackContext(techPackData: any): string {
  if (!techPackData?.tech_pack_data) return "";

  const data = techPackData.tech_pack_data;
  const sections: string[] = [];

  // Product info
  if (data.productName) sections.push(`Product: ${data.productName}`);
  if (data.category) sections.push(`Category: ${data.category}`);

  // Materials
  if (data.materials) {
    sections.push(`Materials: ${JSON.stringify(data.materials).slice(0, 500)}`);
  }

  // Construction
  if (data.construction) {
    sections.push(`Construction: ${JSON.stringify(data.construction).slice(0, 500)}`);
  }

  // Measurements
  if (data.measurements) {
    sections.push(`Measurements: ${JSON.stringify(data.measurements).slice(0, 500)}`);
  }

  // Trims and Hardware
  if (data.trims || data.hardware) {
    sections.push(`Trims/Hardware: ${JSON.stringify(data.trims || data.hardware).slice(0, 300)}`);
  }

  // Colors
  if (data.colors) {
    sections.push(`Colors: ${JSON.stringify(data.colors).slice(0, 200)}`);
  }

  return sections.join("\n");
}

/**
 * Extracts rich context from generated tech files (base views, components, close-ups, sketches)
 */
function extractTechFilesContext(techFilesData?: TechFilesData): string {
  if (!techFilesData) return "";

  const sections: string[] = [];

  // Category info
  if (techFilesData.category) {
    sections.push(`PRODUCT CATEGORY: ${techFilesData.category.category}${techFilesData.category.subcategory ? ` > ${techFilesData.category.subcategory}` : ''}`);
  }

  // Base views analysis data
  if (techFilesData.baseViews && techFilesData.baseViews.length > 0) {
    sections.push("\n=== BASE VIEW ANALYSIS ===");
    techFilesData.baseViews.forEach((view) => {
      if (view.analysisData) {
        sections.push(`\n[${view.viewType.toUpperCase()} VIEW]`);
        // Extract key information from analysis data
        const analysis = view.analysisData;
        if (analysis.materials_detected) {
          sections.push(`Materials: ${JSON.stringify(analysis.materials_detected).slice(0, 800)}`);
        }
        if (analysis.construction_details) {
          sections.push(`Construction: ${JSON.stringify(analysis.construction_details).slice(0, 800)}`);
        }
        if (analysis.measurements) {
          sections.push(`Measurements: ${JSON.stringify(analysis.measurements).slice(0, 500)}`);
        }
        if (analysis.colors) {
          sections.push(`Colors: ${JSON.stringify(analysis.colors).slice(0, 300)}`);
        }
        if (analysis.hardware_trims) {
          sections.push(`Hardware/Trims: ${JSON.stringify(analysis.hardware_trims).slice(0, 400)}`);
        }
      }
    });
  }

  // Components data
  if (techFilesData.components && techFilesData.components.length > 0) {
    sections.push("\n=== COMPONENT DETAILS ===");
    techFilesData.components.forEach((comp) => {
      sections.push(`\n[${comp.componentName}] (${comp.componentType})`);
      if (comp.guide) {
        sections.push(`Guide: ${JSON.stringify(comp.guide).slice(0, 600)}`);
      }
    });
  }

  // Close-ups with summaries
  if (techFilesData.closeUps && techFilesData.closeUps.length > 0) {
    sections.push("\n=== CLOSE-UP DETAILS ===");
    techFilesData.closeUps.forEach((closeUp) => {
      sections.push(`\n[${closeUp.shotMetadata.focus_area}]`);
      sections.push(`Description: ${closeUp.shotMetadata.description}`);
      if (closeUp.summary) {
        if (closeUp.summary.materialDetails) {
          sections.push(`Material Details: ${JSON.stringify(closeUp.summary.materialDetails).slice(0, 500)}`);
        }
        if (closeUp.summary.constructionTechniques) {
          sections.push(`Construction Techniques: ${JSON.stringify(closeUp.summary.constructionTechniques).slice(0, 500)}`);
        }
        if (closeUp.summary.qualityIndicators) {
          sections.push(`Quality Indicators: ${closeUp.summary.qualityIndicators.join(", ")}`);
        }
      }
    });
  }

  // Sketches with measurements and summaries
  if (techFilesData.sketches && techFilesData.sketches.length > 0) {
    sections.push("\n=== TECHNICAL SKETCH DATA ===");
    techFilesData.sketches.forEach((sketch) => {
      sections.push(`\n[${sketch.viewType.toUpperCase()} SKETCH]`);
      if (sketch.measurements) {
        const measurementsList = Object.entries(sketch.measurements)
          .map(([key, val]) => `${key}: ${val.value}${val.unit}`)
          .join(", ");
        sections.push(`Measurements: ${measurementsList}`);
      }
      if (sketch.summary) {
        if (sketch.summary.measurements) {
          sections.push(`Detailed Measurements: ${JSON.stringify(sketch.summary.measurements).slice(0, 400)}`);
        }
        if (sketch.summary.materials) {
          sections.push(`Materials: ${JSON.stringify(sketch.summary.materials).slice(0, 400)}`);
        }
        if (sketch.summary.construction) {
          sections.push(`Construction: ${JSON.stringify(sketch.summary.construction).slice(0, 400)}`);
        }
      }
    });
  }

  return sections.join("\n");
}

/**
 * Tech pack action handlers for triggering generation from chat
 */
export interface TechPackActionHandlers {
  generateBaseViews?: () => Promise<void>;
  generateCloseUps?: () => Promise<void>;
  generateSketches?: () => Promise<void>;
  generateComponents?: () => Promise<void>;
  generateAll?: () => Promise<void>;
}

/**
 * Tech pack state info for validation
 */
export interface TechPackStateInfo {
  /** Whether base views have been generated (required for other sections) */
  hasBaseViews: boolean;
}

/**
 * Parse user message to determine which tech pack action to take
 */
function parseTechPackAction(message: string): keyof TechPackActionHandlers | null {
  const lowerMessage = message.toLowerCase();

  // Check for "generate all" or "factory specs"
  if (
    lowerMessage.includes('generate all') ||
    lowerMessage.includes('all specs') ||
    lowerMessage.includes('factory specs') ||
    lowerMessage.includes('complete tech pack') ||
    lowerMessage.includes('everything')
  ) {
    return 'generateAll';
  }

  // Check for base views
  if (
    lowerMessage.includes('base view') ||
    lowerMessage.includes('base image') ||
    lowerMessage.includes('product view') ||
    lowerMessage.includes('main view')
  ) {
    return 'generateBaseViews';
  }

  // Check for close-ups
  if (
    lowerMessage.includes('close-up') ||
    lowerMessage.includes('closeup') ||
    lowerMessage.includes('close up') ||
    lowerMessage.includes('detail shot') ||
    lowerMessage.includes('detailed shot')
  ) {
    return 'generateCloseUps';
  }

  // Check for sketches
  if (
    lowerMessage.includes('sketch') ||
    lowerMessage.includes('technical drawing') ||
    lowerMessage.includes('line drawing')
  ) {
    return 'generateSketches';
  }

  // Check for components
  if (
    lowerMessage.includes('component') ||
    lowerMessage.includes('material image') ||
    lowerMessage.includes('isolated image')
  ) {
    return 'generateComponents';
  }

  return null;
}

export function useChatMessages(
  productId: string | null,
  productName: string = "Product",
  onRevisionSuccess?: () => void | Promise<void>,
  techPackData?: any,
  techFilesData?: TechFilesData,
  workflowMode?: WorkflowMode,
  techPackActions?: TechPackActionHandlers,
  onSwitchToTechPack?: () => void,
  techPackState?: TechPackStateInfo
) {
  const {
    messages,
    setMessages,
    addMessage,
    updateMessage,
    isProcessing,
    setIsProcessing,
  } = useChatStore();
  const {
    currentViews,
    setAllLoadingViews,
    setLoadingView,
    setGenerationState,
    setFrontViewApproval,
    setCurrentViews,
  } = useEditorStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load messages from database on mount or when productId changes
  useEffect(() => {
    if (!productId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getChatMessages(productId, 500);

        if (result.success && result.messages) {
          // Messages already have created_at from the database
          // Just ensure it's a Date object for consistent handling
          const formattedMessages = result.messages.map((msg: ChatMessage) => ({
            ...msg,
            created_at:
              msg.created_at instanceof Date
                ? msg.created_at
                : new Date(msg.created_at),
          }));
          setMessages(formattedMessages);
        } else {
          console.error("Failed to load messages:", result.error);
          setError(result.error || "Failed to load messages");
        }
      } catch (err) {
        console.error("Error loading messages:", err);
        setError("Failed to load messages");
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [productId, setMessages]);

  // Save message to database and add to store
  const sendMessage = useCallback(
    async (content: string, type: ChatMessageType = "user", metadata?: any) => {
      if (!productId) {
        console.error("No productId provided");
        return null;
      }

      // Create the message object
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        product_idea_id: productId,
        message_type: type,
        content,
        created_at: new Date(),
        metadata,
      };

      // Add to store immediately for optimistic update
      addMessage(newMessage);

      // Save to database
      try {
        const result = await saveChatMessage({
          productIdeaId: productId,
          messageType: type,
          content,
          metadata,
          batchId: `batch-${Date.now()}`,
        });

        if (!result.success) {
          console.error("Failed to save message to database:", result.error);
          // Optionally, you could remove the message from store on failure
        } else if (result.message) {
          // Update the message with the database ID and created_at
          updateMessage(newMessage.id, {
            id: result.message.id,
            created_at: new Date(result.message.created_at), // Use created_at from database
          });
        }
      } catch (err) {
        console.error("Error saving message:", err);
      }

      return newMessage;
    },
    [productId, addMessage, updateMessage]
  );

  // Handle conversational response (non-design edits)
  const handleConversationalResponse = useCallback(
    async (message: string, intent: string) => {
      try {
        // Build conversation history for context
        const conversationHistory = messages
          .slice(-10)
          .map((msg: ChatMessage) => {
            const role = msg.message_type === "user" ? "User" : "Assistant";
            return `${role}: ${msg.content}`;
          })
          .join("\n");

        // Extract tech pack context for product questions
        const techPackContext = extractTechPackContext(techPackData);
        // Extract generated tech files context (base views, components, close-ups, sketches)
        const techFilesContext = extractTechFilesContext(techFilesData);
        // Combine both contexts - tech files data is more detailed and up-to-date
        const fullProductContext = [techFilesContext, techPackContext].filter(Boolean).join("\n\n");

        // Prepare context based on intent
        let systemPrompt = "";
        const hasScreenshot = message.includes("[Current Design Screenshot:");

        switch (intent) {
          case "question":
            systemPrompt = `You are a helpful AI assistant for a product design tool.
            The user is asking a question about the product "${productName}".
            ${hasScreenshot ? "They have provided a screenshot of the current design. Analyze it and provide specific feedback." : ""}
            Provide a clear, informative answer.

            Conversation history:
            ${conversationHistory}`;
            break;

          case "product_question":
            systemPrompt = `You are a knowledgeable product specialist for "${productName}".
            The user is asking a specific question about this product's details.

            ${fullProductContext ? `PRODUCT DATA FROM GENERATED TECH FILES (use this to answer accurately):
${fullProductContext}` : "Note: No tech files have been generated yet. Suggest generating the Factory Specs (base views, close-ups, sketches) to get detailed product information."}

            IMPORTANT INSTRUCTIONS:
            - Use the product data above to answer the question accurately
            - Be specific and cite actual specifications, materials, measurements when available
            - If asking about dimensions/measurements, look in the TECHNICAL SKETCH DATA or BASE VIEW ANALYSIS sections
            - If asking about materials, look in COMPONENT DETAILS, CLOSE-UP DETAILS, or BASE VIEW ANALYSIS
            - If the data doesn't contain the answer, acknowledge what data IS available and suggest which files to generate

            Conversation history:
            ${conversationHistory}`;
            break;

          case "technical_info":
            systemPrompt = `You are a technical advisor for product design.
            The user wants technical details for "${productName}".
            ${hasScreenshot ? "Analyze the technical aspects visible in the screenshot." : ""}
            ${fullProductContext ? `\nAvailable technical data:\n${fullProductContext}` : ""}
            Provide detailed technical information.`;
            break;

          case "feedback":
            systemPrompt = `You are a design assistant.
            The user is providing feedback about "${productName}".
            ${hasScreenshot ? "Review the design screenshot and provide constructive feedback." : ""}
            Acknowledge their feedback and offer suggestions.`;
            break;

          case "greeting":
            systemPrompt = `You are a friendly AI assistant.
            Respond warmly and offer to help with their product design "${productName}".`;
            break;

          case "tech_pack_action":
            // Parse which action the user wants
            const actionType = parseTechPackAction(message);

            if (actionType && techPackActions) {
              // Check if base views are required but not generated yet
              const requiresBaseViews = actionType !== 'generateBaseViews' && actionType !== 'generateAll';
              const hasBaseViews = techPackState?.hasBaseViews ?? false;

              if (requiresBaseViews && !hasBaseViews) {
                // Inform user they need to generate base views first
                const sectionNames: Record<string, string> = {
                  generateCloseUps: "close-up shots",
                  generateSketches: "technical sketches",
                  generateComponents: "component images",
                };
                await sendMessage(
                  `To generate ${sectionNames[actionType] || "this section"}, you first need to generate the **Base View Analysis**. The base views provide essential product information that other sections depend on.\n\nWould you like me to generate the base views first? Just say "generate base views" or click the "Generate (1 credit)" button in the Factory Specs panel.`,
                  "ai"
                );
                return;
              }

              const actionHandler = techPackActions[actionType];
              if (actionHandler) {
                // Execute the action
                const actionNames: Record<string, string> = {
                  generateAll: "all factory specs (10 credits)",
                  generateBaseViews: "base views (free)",
                  generateCloseUps: "close-up shots (2 credits)",
                  generateSketches: "technical sketches (6 credits)",
                  generateComponents: "component images (2 credits)",
                };

                // If not on tech-pack tab, switch to it first
                if (workflowMode !== "tech-pack" && onSwitchToTechPack) {
                  await sendMessage(
                    "Switching to Factory Specs tab...",
                    "system"
                  );
                  onSwitchToTechPack();
                  // Wait for tab switch animation and React to complete re-render
                  // Use requestAnimationFrame to ensure DOM is updated, then wait for state to settle
                  await new Promise(resolve => {
                    requestAnimationFrame(() => {
                      requestAnimationFrame(() => {
                        setTimeout(resolve, 600);
                      });
                    });
                  });
                }

                await sendMessage(
                  `Starting generation of ${actionNames[actionType]}...`,
                  "ai"
                );

                // Longer delay to ensure UI is fully ready before triggering generation
                await new Promise(resolve => setTimeout(resolve, 200));

                try {
                  await actionHandler();
                  // Don't show success message - the UI will show progress
                } catch (error) {
                  await sendMessage(
                    `Failed to generate: ${error instanceof Error ? error.message : "Unknown error"}`,
                    "error"
                  );
                }
                return; // Don't continue to AI response
              }
            }

            // If no action handler available, provide guidance
            systemPrompt = `You are a factory specs assistant for "${productName}".
            The user wants to generate factory-ready files.

            Explain what files can be generated and their purposes:
            - Base Views (free): Product view analysis for reference
            - Close-up Shots (2 credits): Detailed shots of key features for quality control
            - Technical Sketches (6 credits): 3 technical drawings
            - Component Images (2 credits): Isolated component images for material sourcing

            Guide them on which files would be most useful for their needs.`;
            break;

          default:
            systemPrompt = `You are a knowledgeable AI assistant for product design.
            Help the user with "${productName}".
            ${hasScreenshot ? "Review the design and provide comprehensive feedback." : ""}`;
            break;
        }

        // Call AI chat endpoint
        const response = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`,
            productName: productName,
            temperature: 0.7,
            max_tokens: 300,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get AI response");
        }

        const data = await response.json();
        const aiResponse =
          data.suggestion ||
          data.message ||
          "I understand. How else can I help you?";

        // Add AI response
        await sendMessage(aiResponse, "ai", {
          intent,
          context: conversationHistory,
        });
      } catch (error) {
        console.error("Error in conversational response:", error);
        await sendMessage(
          "I apologize, but I encountered an error. Please try rephrasing your message.",
          "ai"
        );
      }
    },
    [messages, productName, sendMessage, techPackData, techFilesData, techPackActions, workflowMode, onSwitchToTechPack, techPackState]
  );

  // Get all user messages for context - ENHANCED VERSION
  const getUserMessagesContext = useCallback(() => {
    const userMessages = messages.filter((m: ChatMessage) => m.message_type === "user");
    if (userMessages.length === 0) return "";

    const firstMessage = userMessages[0];

    // Build cumulative context with ALL user messages
    let context = `Initial request: ${firstMessage.content}`;

    // Include ALL intermediate refinements (not just first + last)
    if (userMessages.length > 1) {
      context += "\n\nIterative refinements:";
      userMessages.slice(1).forEach((msg: ChatMessage, index: number) => {
        context += `\n${index + 1}. ${msg.content}`;
      });
    }

    // Add recent AI responses for richer context understanding
    const aiMessages = messages.filter((m: ChatMessage) => m.message_type === "ai");
    if (aiMessages.length > 0) {
      const lastAIMessages = aiMessages.slice(-3); // Last 3 AI responses
      context += "\n\nRecent AI understanding:";
      lastAIMessages.forEach((msg: ChatMessage) => {
        // Include first 150 chars of AI response for context
        const summary =
          msg.content.length > 150
            ? msg.content.substring(0, 150) + "..."
            : msg.content;
        context += `\n- ${summary}`;
      });
    }

    return context;
  }, [messages]);

  // Send a user message and handle processing state
  const sendUserMessage = useCallback(
    async (
      content: string,
      _onEditViews?: (currentViews: any, prompt: string) => Promise<void>,
      selectedRevision?: any,
      imageUrl?: string
    ) => {
      if (!content.trim() || !productId) return;

      // Check message limit (250 messages)
      if (messages.length >= 250) {
        await sendMessage(
          "Chat limit reached (250 messages). Please start a new product session.",
          "system"
        );
        return;
      }

      setIsProcessing(true);

      try {
        // 1. Save and display the user message with optional image
        await sendMessage(content, "user", imageUrl ? { imageUrl } : undefined);

        // 2. Analyzing indicator removed - going straight to processing

        // 3. Detect intent using AI (pass workflowMode for context-aware detection)
        // If user uploaded an image, force design_edit intent since they're providing reference material
        let intent: string;
        if (imageUrl) {
          // When user uploads an image with a message, treat it as a design edit request
          // This covers cases like "make it in gold" with a logo upload
          intent = "design_edit";
          console.log("[useChatMessages] Image uploaded - forcing design_edit intent");
        } else {
          intent = await detectMessageIntent(
            content,
            messages,
            productName,
            workflowMode
          );
        }

        // 4. Show detected intent
        const intentLabels: Record<string, string> = {
          design_edit: "Design Edit Request",
          question: "Question",
          technical_info: "Technical Info Request",
          feedback: "Feedback/Opinion Request",
          general_chat: "General Discussion",
          greeting: "Greeting",
          product_question: "Product Q&A",
          tech_pack_action: "Factory Specs Action",
        };

        await sendMessage(
          `Intent detected: ${intentLabels[intent] || intent}`,
          "system",
          {
            intent,
            isIntentDetection: true,
          }
        );

        // 5. Handle screenshot/reference image for design edits
        let screenshotUrl: string | null = null;
        let userUploadedImageUrl: string | null = null;
        let messageWithScreenshot = content;
        let enhancedPromptFromAI: string | null = null;

        // Track if this is a virtual try-on request
        let isVirtualTryOn = false;
        let parsedToolType: string | undefined;

        // Check if user uploaded an image - use AI to parse their intent
        if (imageUrl) {
          userUploadedImageUrl = imageUrl;

          await sendMessage(
            "Analyzing your image and request...",
            "processing",
            {
              imageUrl: imageUrl,
              isUserUpload: true,
              uploadType: "user_image",
            }
          );

          // Use AI to parse the user's intent from their message
          if (productId) {
            try {
              const parseResult = await saveImageWithAIParsedIntent(productId, imageUrl, content);

              if (parseResult.success && parseResult.intent) {
                // Store the tool type for later use
                parsedToolType = parseResult.intent.toolType;
                isVirtualTryOn = parsedToolType === "model";

                // Show what was detected
                const intentSummary: string[] = [];
                intentSummary.push(`Tool: ${parseResult.intent.toolType.toUpperCase()}`);

                if (parseResult.intent.position) {
                  intentSummary.push(`Position: ${parseResult.intent.position}`);
                }

                if (parseResult.intent.colorModification?.changeColor) {
                  intentSummary.push(`Color: ${parseResult.intent.colorModification.targetColor} (${parseResult.intent.colorModification.colorHex})`);
                }

                if (parseResult.intent.sizeModification?.size) {
                  intentSummary.push(`Size: ${parseResult.intent.sizeModification.size}`);
                }

                await sendMessage(
                  `AI detected: ${intentSummary.join(" | ")}`,
                  "system",
                  {
                    imageUrl: imageUrl,
                    isUserUpload: true,
                    uploadType: "user_image",
                    parsedIntent: parseResult.intent,
                    isAIParsed: true,
                  }
                );

                // Use the enhanced prompt from AI for generation
                if (parseResult.enhancedPrompt) {
                  enhancedPromptFromAI = parseResult.enhancedPrompt;
                }
              } else {
                await sendMessage(
                  "Image received - proceeding with your request",
                  "image-ready",
                  {
                    imageUrl: imageUrl,
                    isUserUpload: true,
                    uploadType: "user_image",
                  }
                );
              }
            } catch (parseError) {
              console.error("[useChatMessages] Error parsing image intent:", parseError);
              await sendMessage(
                "Image received as reference",
                "image-ready",
                {
                  imageUrl: imageUrl,
                  isUserUpload: true,
                  uploadType: "user_image",
                }
              );
            }
          }
        }

        // Check if message already contains screenshot
        const messageAlreadyHasScreenshot =
          content.includes("![Annotated Screenshot](") ||
          content.includes("[Current Design Screenshot:");

        // Determine if we should capture screenshot
        const lowerMessage = content.toLowerCase();

        // ALWAYS get current design reference for design edits, even with uploaded image
        if (intent !== "question") {
          // Priority 1: Use selected revision front view if available
          if (
            selectedRevision &&
            selectedRevision.views &&
            selectedRevision.views.front &&
            selectedRevision.views.front.imageUrl
          ) {
            screenshotUrl = selectedRevision.views.front.imageUrl;
            messageWithScreenshot = `${content}\n\n[Current Design Screenshot: ${screenshotUrl}]`;

            await sendMessage(
              `Using Revision #${selectedRevision.revisionNumber} front view as reference`,
              "image-ready",
              {
                imageUrl: screenshotUrl,
                isScreenshot: true,
                isViewGeneration: true,
                viewType: "front",
                revisionNumber: selectedRevision.revisionNumber,
                captureReason: "revision_reference",
              }
            );
          }
          // Priority 2: Use current views front image if available
          else if (
            currentViews &&
            currentViews.front &&
            typeof currentViews.front === "string"
          ) {
            screenshotUrl = currentViews.front;
            messageWithScreenshot = `${content}\n\n[Current Design Screenshot: ${screenshotUrl}]`;

            await sendMessage(
              `Using current front view as reference`,
              "image-ready",
              {
                imageUrl: screenshotUrl,
                isScreenshot: true,
                isViewGeneration: true,
                viewType: "front",
                captureReason: "current_design",
              }
            );
          }
          // Priority 3: Capture screenshot as fallback
          else {
            // ALWAYS capture screenshot for design edits or when user uploads an image
            const shouldCaptureScreenshot =
              !messageAlreadyHasScreenshot &&
              (intent === "design_edit" || // Always for edits without revision
                userUploadedImageUrl || // Always when user uploads an image
                (intent !== "greeting" &&
                  (lowerMessage.includes("opinion") ||
                    lowerMessage.includes("think") ||
                    lowerMessage.includes("feedback") ||
                    lowerMessage.includes("review") ||
                    lowerMessage.includes("look") ||
                    lowerMessage.includes("current") ||
                    lowerMessage.includes("design"))));

            // 6. Capture screenshot if needed (only when no revision is selected)
            if (shouldCaptureScreenshot) {
              await sendMessage(
                intent === "design_edit"
                  ? "Capturing current views for edit reference..."
                  : "Capturing current design for analysis...",
                "system",
                { isTemporary: true }
              );

              try {
                screenshotUrl = await captureDesignScreenshot();

                if (screenshotUrl) {
                  messageWithScreenshot = `${content}\n\n[Current Design Screenshot: ${screenshotUrl}]`;

                  await sendMessage(
                    intent === "design_edit"
                      ? "Current design captured for edit reference"
                      : "Current design captured for analysis",
                    "image-ready",
                    {
                      imageUrl: screenshotUrl,
                      isScreenshot: true,
                      isDesignGrid: true, // Mark as design grid
                      capturedViews: ["front", "back", "side", "top", "bottom"],
                      captureReason:
                        intent === "design_edit" ? "edit_request" : "analysis",
                    }
                  );
                }
              } catch (error) {
                console.error("Failed to capture screenshot:", error);
              }
            }
          }
        }

        // 7. Handle based on intent
        // =====================================================================
        // VIRTUAL TRY-ON: Special handling - generate only one image for chat
        // =====================================================================
        if (intent === "design_edit" && isVirtualTryOn && userUploadedImageUrl) {
          console.log("[useChatMessages] Virtual try-on detected - generating single image for chat");

          try {
            // Get the current product front view as reference
            const productImageUrl = screenshotUrl || currentViews?.front || selectedRevision?.views?.front?.imageUrl;

            if (!productImageUrl) {
              await sendMessage(
                "Cannot perform virtual try-on: No product design found. Please generate a product design first.",
                "error"
              );
              setIsProcessing(false);
              return;
            }

            await sendMessage(
              "Generating virtual try-on (1 credit)...",
              "processing",
              { isVirtualTryOn: true }
            );

            // Call the virtual try-on function
            const tryOnResult = await generateVirtualTryOn({
              productId: productId!,
              userPrompt: content,
              modelImageUrl: userUploadedImageUrl,
              productImageUrl: productImageUrl,
            });

            if (!tryOnResult.success || !tryOnResult.tryOnImageUrl) {
              throw new Error(tryOnResult.error || "Failed to generate virtual try-on");
            }

            // Display the result ONLY in chat - do not update product views
            await sendMessage(
              "Here's your virtual try-on result:",
              "ai",
              {
                imageUrl: tryOnResult.tryOnImageUrl,
                isVirtualTryOn: true,
                creditsUsed: tryOnResult.creditsUsed,
              }
            );

            await sendMessage(
              `✓ Virtual try-on generated successfully! (${tryOnResult.creditsUsed || 3} credits used)`,
              "success",
              { isVirtualTryOn: true }
            );

          } catch (error) {
            console.error("[useChatMessages] Virtual try-on error:", error);
            await sendMessage(
              `Failed to generate virtual try-on: ${error instanceof Error ? error.message : String(error)}`,
              "error"
            );
          }

          setIsProcessing(false);
          return; // Exit early - don't continue with normal design_edit flow
        }

        if (intent === "design_edit") {
          // =================================================================
          // PROGRESSIVE WORKFLOW: PHASE 1 - GENERATE FRONT VIEW ONLY
          // =================================================================

          // Check if product has existing revisions OR existing views - if yes, auto-approve front view
          // This ensures AI micro edits always stay in multi-view mode with loaders
          const hasExistingRevisions =
            messages.some((msg: ChatMessage) => msg.metadata?.revisionNumber) ||
            selectedRevision ||
            !!(currentViews.front || currentViews.back || currentViews.side || currentViews.top || currentViews.bottom);

          try {
            // For products with existing revisions, set loading immediately
            if (hasExistingRevisions) {
              // Set loading states for all views immediately when user sends message
              setAllLoadingViews(true);
            } else {
              // Set generation state to show front view is being generated
              setGenerationState("generating_front_view");
            }

            await sendMessage(
              hasExistingRevisions
                ? "Generating all views (5 credits)..."
                : "Generating front view for your approval (2 credits)...",
              "processing",
              { phase: 1, isProgressiveWorkflow: true }
            );

            // Call progressive workflow to generate ONLY front view
            // Backend will auto-approve if product has existing revisions
            // Use enhanced prompt from AI if available (includes logo position, color, etc.)
            const promptToUse = enhancedPromptFromAI || content;
            const frontResult = await generateFrontViewOnly({
              productId: productId!,
              userPrompt: promptToUse,
              isEdit: true,
              previousFrontViewUrl: screenshotUrl || undefined,
            });

            if (
              !frontResult.success ||
              !frontResult.frontViewUrl ||
              !frontResult.approvalId
            ) {
              throw new Error(
                frontResult.error || "Failed to generate front view"
              );
            }

            // If auto-approve is enabled (has existing revisions), skip approval and generate all views
            if (hasExistingRevisions) {
              // Loading already set above - keep showing loaders
              // Keep generation state as is (completed/idle) - don't switch to approval screens
              // Stay in MultiView Editor showing loaders

              await sendMessage("Auto-approving front view...", "processing", {
                phase: 2,
                isProgressiveWorkflow: true,
                skipApprovalUI: true,
              });

              try {
                // Auto-approve the front view
                const approvalResult = await handleFrontViewDecision({
                  approvalId: frontResult.approvalId,
                  action: "approve",
                });

                if (!approvalResult.success) {
                  throw new Error(
                    approvalResult.error || "Failed to approve front view"
                  );
                }

                await sendMessage("Generating remaining 4 views...", "processing", {
                  phase: 2,
                  isProgressiveWorkflow: true,
                  skipApprovalUI: true,
                });

                // Generate remaining views using the new front view
                const remainingViewsResult = await generateRemainingViews({
                  approvalId: frontResult.approvalId,
                  frontViewUrl: frontResult.frontViewUrl,
                });

                if (
                  !remainingViewsResult.success ||
                  !remainingViewsResult.views
                ) {
                  throw new Error(
                    remainingViewsResult.error ||
                      "Failed to generate remaining views"
                  );
                }

                // Update current views with all 5 views
                setCurrentViews({
                  front: frontResult.frontViewUrl,
                  back: remainingViewsResult.views.back,
                  side: remainingViewsResult.views.side,
                  top: remainingViewsResult.views.top,
                  bottom: remainingViewsResult.views.bottom,
                });

                await sendMessage("Creating revision...", "processing", {
                  phase: 2,
                  isProgressiveWorkflow: true,
                  skipApprovalUI: true,
                });

                // Create revision with all views
                const revisionResult = await createRevisionAfterApproval({
                  productId: productId!,
                  approvalId: frontResult.approvalId,
                  allViews: {
                    front: frontResult.frontViewUrl,
                    back: remainingViewsResult.views.back,
                    side: remainingViewsResult.views.side,
                    top: remainingViewsResult.views.top,
                    bottom: remainingViewsResult.views.bottom,
                  },
                  isInitial: false,
                });

                if (!revisionResult.success) {
                  throw new Error(
                    revisionResult.error || "Failed to create revision"
                  );
                }

                // Clear all loading states
                setAllLoadingViews(false);

                // Success message
                await sendMessage(
                  `✓ All views generated successfully! (Revision ${revisionResult.revisionNumber})`,
                  "success",
                  {
                    phase: 2,
                    allViewsGenerated: true,
                    revisionNumber: revisionResult.revisionNumber,
                  }
                );

                // Keep state as completed
                setGenerationState("completed");

                // Trigger callback to refresh revisions UI
                if (onRevisionSuccess) {
                  const result = onRevisionSuccess();
                  if (result instanceof Promise) {
                    await result;
                  }
                }
              } catch (error) {
                console.error("Failed to generate views:", error);
                setGenerationState("error");
                setAllLoadingViews(false);
                await sendMessage(
                  `Failed to generate views: ${error instanceof Error ? error.message : String(error)}`,
                  "error"
                );
              }
            } else {
              // Normal flow: Set the front view approval data in the editor store
              setFrontViewApproval({
                status: "pending",
                imageUrl: frontResult.frontViewUrl,
                approvalId: frontResult.approvalId,
                iterationCount: 1,
              });

              // Update current views with the front view
              setCurrentViews({ front: frontResult.frontViewUrl });

              // Set state to awaiting approval
              setGenerationState("awaiting_front_approval");

              // Add a message with the front view approval component
              await sendMessage(
                "Front view generated! Please review and approve or request changes.",
                "system",
                {
                  frontViewApproval: {
                    frontViewUrl: frontResult.frontViewUrl,
                    approvalId: frontResult.approvalId,
                    iterationCount: 1,
                  },
                  isAwaitingApproval: true,
                }
              );

              // Success - front view generated and awaiting approval
              await sendMessage(
                "✓ Front view ready for your approval",
                "success",
                { phase: 1, creditsUsed: frontResult.creditsReserved || 1 }
              );
            }
          } catch (error) {
            console.error("Failed to generate front view:", error);
            setGenerationState("idle"); // Reset state on error
            await sendMessage(
              `Failed to generate front view: ${error instanceof Error ? error.message : String(error)}`,
              "error"
            );
          }
        } else {
          // Show what type of response we're generating
          const intentLabels: Record<string, string> = {
            question: "Answering your question...",
            technical_info: "Gathering technical information...",
            feedback: "Processing your feedback...",
            greeting: "Preparing response...",
            general_chat: "Continuing conversation...",
            product_question: "Looking up product details...",
            tech_pack_action: "Preparing factory specs guidance...",
          };

          await sendMessage(
            intentLabels[intent] || "Processing your message...",
            "system",
            { processingType: intent }
          );

          // Handle conversational response
          await handleConversationalResponse(
            screenshotUrl ? messageWithScreenshot : content,
            intent
          );
        }
      } catch (err) {
        console.error("Error processing message:", err);
        await sendMessage(
          "I encountered an error processing your message. Please try again.",
          "error"
        );
      } finally {
        setIsProcessing(false);
        // Ensure loading state is cleared
        setAllLoadingViews(false);
      }
    },
    [
      sendMessage,
      setIsProcessing,
      productId,
      productName,
      messages,
      getUserMessagesContext,
      handleConversationalResponse,
      setAllLoadingViews,
      setLoadingView,
      currentViews,
      workflowMode,
    ]
  );

  // =================================================================
  // PROGRESSIVE WORKFLOW CALLBACKS
  // =================================================================

  // Handle front view approval - generates remaining 4 views
  const handleFrontViewApprove = useCallback(
    async (approvalId: string, frontViewUrl: string) => {
      if (!productId) return;

      setIsProcessing(true);
      try {
        // IMPORTANT: Mark all previous approval messages as inactive
        // This hides the FrontViewApproval component after user approves
        const updatedMessages = messages.map((msg: ChatMessage) => {
          if (
            msg.metadata?.frontViewApproval &&
            msg.metadata?.isAwaitingApproval
          ) {
            return {
              ...msg,
              metadata: {
                ...msg.metadata,
                isAwaitingApproval: false, // Hide approval UI after approval
                wasApproved: true,
              },
            };
          }
          return msg;
        });
        setMessages(updatedMessages);

        // Step 1: Mark as approved
        await sendMessage("Approving front view...", "processing", {
          phase: 2,
          step: "approval",
        });

        const approvalResult = await handleFrontViewDecision({
          approvalId,
          action: "approve",
        });

        if (!approvalResult.success) {
          throw new Error(
            approvalResult.error || "Failed to approve front view"
          );
        }

        // Step 2: Generate remaining views
        await sendMessage(
          "Generating remaining 4 views (2 credits)...",
          "processing",
          { phase: 2, step: "generation", creditsRequired: 2 }
        );

        const remainingResult = await generateRemainingViews({
          approvalId,
          frontViewUrl,
        });

        if (!remainingResult.success || !remainingResult.views) {
          throw new Error(
            remainingResult.error || "Failed to generate remaining views"
          );
        }

        // Step 3: Create revision with all 5 views
        await sendMessage("Creating revision with all views...", "processing", {
          phase: 2,
          step: "revision",
        });

        const revisionResult = await createRevisionAfterApproval({
          productId: productId!,
          approvalId,
          allViews: {
            front: frontViewUrl,
            back: remainingResult.views.back,
            side: remainingResult.views.side,
            top: remainingResult.views.top,
            bottom: remainingResult.views.bottom,
          },
          isInitial: false,
        });

        if (!revisionResult.success) {
          throw new Error(revisionResult.error || "Failed to create revision");
        }

        // Success!
        await sendMessage(
          `✓ All views generated successfully! Revision ${revisionResult.revisionNumber} created.`,
          "success",
          {
            phase: 2,
            revisionNumber: revisionResult.revisionNumber,
            totalCreditsUsed: 5, // 3 for front + 2 for remaining 4 views
          }
        );

        // Reset generation state to idle
        setGenerationState("idle");

        // Refresh credits if callback provided
        if (onRevisionSuccess) {
          onRevisionSuccess();
        }
      } catch (error) {
        console.error("Failed to approve and generate:", error);
        setGenerationState("idle"); // Reset state on error
        await sendMessage(
          `Failed to generate remaining views: ${error instanceof Error ? error.message : String(error)}`,
          "error"
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [
      productId,
      sendMessage,
      setIsProcessing,
      onRevisionSuccess,
      messages,
      setMessages,
    ]
  );

  // Handle front view edit request - generates new front view iteration
  const handleFrontViewEdit = useCallback(
    async (
      approvalId: string,
      editFeedback: string,
      currentIterationCount: number
    ) => {
      if (!productId) return;

      setIsProcessing(true);
      try {
        // IMPORTANT: Mark all previous approval messages as inactive
        // This ensures only the latest iteration shows the FrontViewApproval component
        const updatedMessages = messages.map((msg: ChatMessage) => {
          if (
            msg.metadata?.frontViewApproval &&
            msg.metadata?.isAwaitingApproval
          ) {
            return {
              ...msg,
              metadata: {
                ...msg.metadata,
                isAwaitingApproval: false, // Deactivate old approval UI
                wasSuperseded: true,
              },
            };
          }
          return msg;
        });
        setMessages(updatedMessages);

        await sendMessage(
          `Generating new front view with your changes (2 credits)...`,
          "processing",
          { phase: 1, iteration: currentIterationCount + 1 }
        );

        const result = await handleFrontViewDecision({
          approvalId,
          action: "edit",
          editFeedback,
        });

        if (!result.success || result.action !== "regenerate") {
          throw new Error(result.error || "Failed to generate new front view");
        }

        // Update the front view approval data in the editor store
        setFrontViewApproval({
          status: "pending",
          imageUrl: result.newFrontViewUrl!,
          approvalId: result.newApprovalId!,
          iterationCount: currentIterationCount + 1,
        });

        // Update current views with the new front view
        setCurrentViews({ front: result.newFrontViewUrl! });

        // Add message with updated front view approval
        await sendMessage(
          `New front view generated (Iteration ${currentIterationCount + 1})`,
          "system",
          {
            frontViewApproval: {
              frontViewUrl: result.newFrontViewUrl!,
              approvalId: result.newApprovalId!,
              iterationCount: currentIterationCount + 1,
            },
            isAwaitingApproval: true, // Only THIS message shows approval UI
            isIteration: true,
          }
        );

        await sendMessage(
          "✓ Front view updated based on your feedback",
          "success",
          { phase: 1, iteration: currentIterationCount + 1 }
        );
      } catch (error) {
        console.error("Failed to generate new iteration:", error);
        await sendMessage(
          `Failed to generate new iteration: ${error instanceof Error ? error.message : String(error)}`,
          "error"
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [
      productId,
      sendMessage,
      setIsProcessing,
      messages,
      setMessages,
      setFrontViewApproval,
      setCurrentViews,
    ]
  );

  return {
    messages,
    isLoading,
    isProcessing,
    error,
    sendMessage,
    sendUserMessage,
    handleFrontViewApprove,
    handleFrontViewEdit,
  };
}
