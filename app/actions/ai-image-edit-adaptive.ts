"use server";

import { GeminiImageService } from "@/lib/ai/gemini";
import { createClient } from "@/lib/supabase/server";
import { uploadBufferToSupabase } from "@/lib/supabase/file_upload";
import { aiLogger } from "@/lib/logging/ai-logger";
import OpenAI from "openai";

const geminiService = new GeminiImageService();
const openai = new OpenAI({
  apiKey:
    process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
    process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

interface AdaptiveRevisionData {
  product_idea_id?: string;
  productIdeaId?: string;
  product_id?: string;

  user_id?: string;
  userId?: string;

  revision_number?: number;
  revisionNumber?: number;
  version?: number;

  view_type?: string;
  viewType?: string;
  view?: string;

  image_url?: string;
  imageUrl?: string;
  url?: string;

  thumbnail_url?: string;
  thumbnailUrl?: string;
  thumb?: string;

  [key: string]: any;
}

/**
 * Adaptive multi-view edit that works with any database schema
 */
export async function applyMultiViewEditAdaptive({
  productId,
  currentViews,
  editPrompt,
  productName = "Product",
  productDescription = "",
}: {
  productId: string;
  currentViews: { front: string; back: string; side: string };
  editPrompt: string;
  productName?: string;
  productDescription?: string;
}) {
  const logger = aiLogger.startOperation(
    "applyMultiViewEditAdaptive",
    "gemini-2.5-flash-image-preview",
    "gemini",
    "image_generation"
  );

  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    const timestamp = Date.now();
    const batchId = `batch-${timestamp}`;

    logger.setInput({
      prompt: editPrompt,
      metadata: { productId, productName, batchId },
    });

    logger.setContext({
      user_id: user.id,
      feature: "ai_multiview_editor_adaptive",
    });

    console.log("Starting adaptive multi-view edit");

    // First, detect the actual schema
    const { data: sampleRevision } = await supabase
      .from("product_multiview_revisions")
      .select("*")
      .limit(1);

    console.log(
      "Sample revision structure:",
      sampleRevision?.[0]
        ? Object.keys(sampleRevision[0])
        : "No existing revisions"
    );

    // Detect column names
    const columns = sampleRevision?.[0] ? Object.keys(sampleRevision[0]) : [];
    const schemaMap = {
      productId:
        columns.find(
          (c) => c.includes("product") && (c.includes("id") || c.includes("Id"))
        ) || "product_idea_id",
      userId:
        columns.find(
          (c) => c.includes("user") && (c.includes("id") || c.includes("Id"))
        ) || "user_id",
      revisionNumber:
        columns.find((c) => c.includes("revision") || c.includes("version")) ||
        "revision_number",
      viewType:
        columns.find(
          (c) =>
            c.includes("view") && (c.includes("type") || c.includes("Type"))
        ) ||
        columns.find((c) => c === "view") ||
        "view_type",
      imageUrl:
        columns.find(
          (c) =>
            (c.includes("image") || c.includes("Image")) &&
            (c.includes("url") || c.includes("Url"))
        ) ||
        columns.find((c) => c === "url") ||
        "image_url",
      thumbnailUrl: columns.find((c) => c.includes("thumb")) || "thumbnail_url",
      editPrompt:
        columns.find((c) => c.includes("prompt") || c.includes("edit")) ||
        "edit_prompt",
      editType:
        columns.find((c) => c.includes("edit") && c.includes("type")) ||
        "edit_type",
      isActive: columns.find((c) => c.includes("active")) || "is_active",
      createdAt: columns.find((c) => c.includes("created")) || "created_at",
    };

    console.log("Detected schema mapping:", schemaMap);

    // Analyze images with GPT-4 Vision
    console.log("Analyzing current product images with GPT-4 Vision...");

    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional product designer analyzing a product to help apply edits consistently across all views.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this ${productName} product and describe how to apply: "${editPrompt}"`,
            },
            {
              type: "image_url",
              image_url: { url: currentViews.front, detail: "high" },
            },
            {
              type: "image_url",
              image_url: { url: currentViews.back, detail: "high" },
            },
            {
              type: "image_url",
              image_url: { url: currentViews.side, detail: "high" },
            },
          ],
        },
      ],
      max_tokens: 800,
      temperature: 0.3,
    });

    const productAnalysis = analysisResponse.choices[0]?.message?.content || "";

    // Enhance prompt
    const enhancementResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Create a precise prompt for consistent product edits.`,
        },
        {
          role: "user",
          content: `Based on: "${productAnalysis}"\n\nUser wants: "${editPrompt}"\n\nEnhanced prompt:`,
        },
      ],
      max_tokens: 300,
      temperature: 0.5,
    });

    const finalPrompt =
      enhancementResponse.choices[0]?.message?.content || editPrompt;

    // Generate all views
    const viewPrompts = {
      front: `${productName} - FRONT VIEW: ${finalPrompt}. Professional product photo.`,
      back: `${productName} - BACK VIEW: ${finalPrompt}. Matching front design.`,
      side: `${productName} - SIDE VIEW: ${finalPrompt}. Profile view matching front/back.`,
    };

    const [frontResult, backResult, sideResult] = await Promise.all([
      geminiService.generateImage({
        prompt: viewPrompts.front,
        referenceImage: currentViews.front,
        options: { enhancePrompt: false, fallbackEnabled: true, retry: 3 },
      }),
      geminiService.generateImage({
        prompt: viewPrompts.back,
        referenceImage: currentViews.back,
        options: { enhancePrompt: false, fallbackEnabled: true, retry: 3 },
      }),
      geminiService.generateImage({
        prompt: viewPrompts.side,
        referenceImage: currentViews.side,
        options: { enhancePrompt: false, fallbackEnabled: true, retry: 3 },
      }),
    ]);

    if (!frontResult.url || !backResult.url || !sideResult.url) {
      throw new Error("Failed to generate all views");
    }

    // Convert and upload
    const dataUrlToBuffer = (dataUrl: string): Buffer => {
      const base64 = dataUrl.split(",")[1];
      return Buffer.from(base64, "base64");
    };

    const views = [
      { type: "front", result: frontResult },
      { type: "back", result: backResult },
      { type: "side", result: sideResult },
    ];

    const revisionIds: string[] = [];
    const resultViews: any = {};

    for (const view of views) {
      // Get next revision number
      const revisionQuery: any = {};
      revisionQuery[schemaMap.productId] = productId;
      revisionQuery[schemaMap.viewType] = view.type;

      const { data: existingRevisions } = await supabase
        .from("product_multiview_revisions")
        .select(schemaMap.revisionNumber)
        .match(revisionQuery)
        .order(schemaMap.revisionNumber, { ascending: false })
        .limit(1);

      const nextRevisionNumber =
        existingRevisions && existingRevisions.length > 0
          ? existingRevisions[0][schemaMap.revisionNumber] + 1
          : 1;

      // Upload images
      const buffer = dataUrlToBuffer(view.result.url);
      const fileName = `${productId}/${view.type}_edit_${timestamp}.png`;
      const thumbFileName = `${productId}/${view.type}_edit_${timestamp}_thumb.png`;

      const [imageUrl, thumbnailUrl] = await Promise.all([
        uploadBufferToSupabase(buffer, fileName),
        uploadBufferToSupabase(buffer, thumbFileName),
      ]);

      resultViews[view.type] = imageUrl;

      // Deactivate previous revisions
      const deactivateQuery: any = {};
      deactivateQuery[schemaMap.productId] = productId;
      deactivateQuery[schemaMap.viewType] = view.type;
      deactivateQuery[schemaMap.isActive] = true;

      await supabase
        .from("product_multiview_revisions")
        .update({ [schemaMap.isActive]: false })
        .match(deactivateQuery);

      // Build insert data dynamically based on detected schema
      const insertData: any = {};
      insertData[schemaMap.productId] = productId;
      insertData[schemaMap.userId] = user.id;
      insertData[schemaMap.revisionNumber] = nextRevisionNumber;
      insertData[schemaMap.viewType] = view.type;
      insertData[schemaMap.imageUrl] = imageUrl;
      insertData[schemaMap.thumbnailUrl] = thumbnailUrl;
      insertData[schemaMap.editPrompt] = editPrompt;
      insertData[schemaMap.editType] = "ai_edit";
      insertData[schemaMap.isActive] = true;

      // Add optional fields if they exist
      if (columns.includes("ai_model")) {
        insertData.ai_model = "gemini-2.5-flash-image-preview";
      }
      if (columns.includes("ai_parameters")) {
        insertData.ai_parameters = {
          batchId,
          analysisPrompt: productAnalysis.substring(0, 500),
          enhancedPrompt: finalPrompt.substring(0, 500),
        };
      }
      if (columns.includes("metadata")) {
        insertData.metadata = {
          productName,
          batchEdit: true,
          batchId,
        };
      }
      if (columns.includes("generation_time_ms")) {
        insertData.generation_time_ms = Date.now() - timestamp;
      }

      console.log(
        `Inserting revision for ${view.type} with data:`,
        Object.keys(insertData)
      );

      const { data: revision, error: dbError } = await supabase
        .from("product_multiview_revisions")
        .insert(insertData)
        .select()
        .single();

      if (dbError) {
        console.error(`Error saving ${view.type} revision:`, dbError);
        console.error(`Insert data was:`, insertData);
      } else if (revision) {
        console.log(`Saved ${view.type} revision successfully`);
        revisionIds.push(revision.id);
      }
    }

    logger.setOutput({
      content: `Successfully edited all views adaptively`,
      raw_response: { revisionIds, views: resultViews, batchId },
    });

    await logger.complete();

    return {
      success: true,
      views: resultViews,
      revisionIds,
    };
  } catch (error: any) {
    console.error("Adaptive multi-view edit error:", error);
    logger.setError(error);
    await logger.complete();

    return {
      success: false,
      error: error.message || "Failed to apply adaptive multi-view edit",
    };
  }
}

/**
 * Get revisions with adaptive schema
 */
export async function getAdaptiveRevisions(productId: string) {
  try {
    const supabase = await createClient();

    // First get a sample to understand the schema
    const { data: sample } = await supabase
      .from("product_multiview_revisions")
      .select("*")
      .limit(1);

    if (!sample || sample.length === 0) {
      return { success: true, revisions: [] };
    }

    // Detect column names
    const columns = Object.keys(sample[0]);
    const productIdCol =
      columns.find((c) => c.includes("product") && c.includes("id")) ||
      "product_idea_id";

    // Get all revisions for this product
    const { data, error } = await supabase
      .from("product_multiview_revisions")
      .select("*")
      .eq(productIdCol, productId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform to expected format
    const grouped: any[] = [];
    const batches = new Map();

    data?.forEach((rev: any) => {
      const batchId = rev.ai_parameters?.batchId || `single-${rev.id}`;
      const viewType = rev.view_type || rev.viewType || rev.view || "unknown";

      if (!batches.has(batchId)) {
        batches.set(batchId, {
          id: batchId,
          revisionNumber:
            rev.revision_number || rev.revisionNumber || rev.version || 0,
          views: {},
          editPrompt: rev.edit_prompt || rev.editPrompt || rev.prompt || "",
          editType: rev.edit_type || rev.editType || "ai_edit",
          createdAt:
            rev.created_at || rev.createdAt || new Date().toISOString(),
          isActive: false,
          metadata: rev.metadata || {},
        });
      }

      const batch = batches.get(batchId);
      batch.views[viewType] = {
        imageUrl: rev.image_url || rev.imageUrl || rev.url,
        thumbnailUrl: rev.thumbnail_url || rev.thumbnailUrl || rev.thumb,
      };

      if (rev.is_active || rev.isActive || rev.active) {
        batch.isActive = true;
      }
    });

    batches.forEach((batch) => {
      grouped.push(batch);
    });

    grouped.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      success: true,
      revisions: grouped,
    };
  } catch (error: any) {
    console.error("Error fetching adaptive revisions:", error);
    return {
      success: false,
      error: error.message,
      revisions: [],
    };
  }
}
