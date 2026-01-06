/**
 * Tech Files Service
 * Service layer for interacting with the tech_files database tables
 * Handles CRUD operations, versioning, and collections
 */

"use server";

import { createClient } from "../../lib/supabase/server";

// ===================================
// Type Definitions
// ===================================

export type TechFileType =
  | "base_view"
  | "component"
  | "closeup"
  | "sketch"
  | "flat_sketch"
  | "assembly_view"
  | "category"
  | "complete_pack";
export type TechFileViewType = "front" | "back" | "side";
export type TechFileStatus = "processing" | "completed" | "failed" | "archived";
export type CollectionType =
  | "tech_pack_v2"
  | "base_views_set"
  | "sketches_set"
  | "closeups_set";
export type CollectionStatus =
  | "processing"
  | "completed"
  | "failed"
  | "partial";

export interface TechFile {
  id: string;
  product_idea_id: string;
  revision_id: string | null;
  user_id: string;
  version: number;
  parent_file_id: string | null;
  is_latest: boolean;
  file_type: TechFileType;
  file_category: string | null;
  view_type: TechFileViewType | null;
  file_url: string;
  thumbnail_url: string | null;
  file_size_bytes: number | null;
  file_format: string | null;
  analysis_data: any;
  metadata: any;
  generation_batch_id: string | null;
  ai_model_used: string | null;
  generation_prompt: string | null;
  generation_config: any;
  confidence_score: number | null;
  quality_score: number | null;
  status: TechFileStatus;
  processing_time_ms: number | null;
  error_message: string | null;
  credits_used: number;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface TechFileVersion {
  id: string;
  tech_file_id: string;
  version_number: number;
  file_url: string;
  thumbnail_url: string | null;
  analysis_data: any;
  metadata: any;
  created_by: string;
  change_description: string | null;
  created_at: string;
}

export interface TechFileCollection {
  id: string;
  product_idea_id: string;
  revision_id: string | null;
  user_id: string;
  collection_name: string;
  collection_type: CollectionType;
  description: string | null;
  generation_batch_id: string | null;
  total_credits_used: number;
  status: CollectionStatus;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CreateTechFileInput {
  product_idea_id: string;
  revision_id?: string | null;
  user_id: string;
  file_type: TechFileType;
  file_category?: string | null;
  view_type?: TechFileViewType | null;
  file_url: string;
  thumbnail_url?: string | null;
  file_size_bytes?: number | null;
  file_format?: string | null;
  analysis_data?: any;
  metadata?: any;
  generation_batch_id?: string | null;
  ai_model_used?: string | null;
  generation_prompt?: string | null;
  generation_config?: any;
  confidence_score?: number | null;
  quality_score?: number | null;
  status?: TechFileStatus;
  processing_time_ms?: number | null;
  credits_used?: number;
}

export interface CreateCollectionInput {
  product_idea_id: string;
  revision_id?: string | null;
  user_id: string;
  collection_name: string;
  collection_type: CollectionType;
  description?: string | null;
  generation_batch_id?: string | null;
}

// ===================================
// Tech Files CRUD Operations
// ===================================

/**
 * Create a new tech file
 */
export async function createTechFile(
  input: CreateTechFileInput
): Promise<TechFile> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tech_files")
    .insert({
      product_idea_id: input.product_idea_id,
      revision_id: input.revision_id || null,
      user_id: input.user_id,
      file_type: input.file_type,
      file_category: input.file_category || null,
      view_type: input.view_type || null,
      file_url: input.file_url,
      thumbnail_url: input.thumbnail_url || null,
      file_size_bytes: input.file_size_bytes || null,
      file_format: input.file_format || null,
      analysis_data: input.analysis_data || {},
      metadata: input.metadata || {},
      generation_batch_id: input.generation_batch_id || null,
      ai_model_used: input.ai_model_used || null,
      generation_prompt: input.generation_prompt || null,
      generation_config: input.generation_config || {},
      confidence_score: input.confidence_score || null,
      quality_score: input.quality_score || null,
      status: input.status || "processing",
      processing_time_ms: input.processing_time_ms || null,
      credits_used: input.credits_used || 0,
      is_latest: true,
      version: 1,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create tech file: ${error.message}`);
  }

  return data as TechFile;
}

/**
 * Get latest tech files for a product
 * Special handling for closeups: Returns last 6 closeups by created_at, regardless of is_latest flag
 */
export async function getLatestTechFiles(
  productId: string,
  options?: {
    fileType?: TechFileType;
    viewType?: TechFileViewType;
    revisionId?: string;
    limit?: number;
  }
): Promise<TechFile[]> {
  const limit = options?.limit || 1;
  const supabase = await createClient();

  console.log("[getLatestTechFiles] Query params:", {
    productId,
    fileType: options?.fileType,
    viewType: options?.viewType,
    revisionId: options?.revisionId,
    limit,
  });

  // Special handling for closeups: Get ALL closeups from the same revision/generation
  // All closeups within the same generation batch should be treated as latest
  if (options?.fileType === "closeup") {
    let query = supabase
      .from("tech_files")
      .select("*")
      .eq("product_idea_id", productId)
      .eq("file_type", "closeup")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (options?.revisionId) {
      query = query.eq("revision_id", options.revisionId);
    }

    const { data, error } = await query;

    console.log(
      "[getLatestTechFiles] Closeup query result (all from revision):",
      {
        count: data?.length || 0,
        closeups: data?.map((f) => ({
          id: f.id.substring(0, 8),
          category: f.file_category,
          revision: f.revision_id?.substring(0, 8),
          isLatest: f.is_latest,
          status: f.status,
          createdAt: f.created_at,
        })),
      }
    );

    if (error) {
      throw new Error(`Failed to fetch closeup files: ${error.message}`);
    }

    return (data as TechFile[]) || [];
  }

  // Standard query for other file types (base_view, sketch, etc.)
  let query = supabase
    .from("tech_files")
    .select("*")
    .eq("product_idea_id", productId)
    // .eq("is_latest", true)
    .order("created_at", { ascending: false });

  if (options?.fileType) {
    query = query.eq("file_type", options.fileType);
  }

  if (options?.viewType) {
    query = query.eq("view_type", options.viewType);
  }

  if (options?.revisionId) {
    query = query.eq("revision_id", options.revisionId);
  }

  // Apply limit after all filters
  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  console.log("[getLatestTechFiles] Query result:", {
    count: data?.length || 0,
    fileTypes: data?.map((f) => ({
      id: f.id,
      type: f.file_type,
      view: f.view_type,
      revision: f.revision_id,
      isLatest: f.is_latest,
      status: f.status,
    })),
  });

  if (error) {
    throw new Error(`Failed to fetch tech files: ${error.message}`);
  }

  return (data as TechFile[]) || [];
}

/**
 * Get a specific tech file by ID
 */
export async function getTechFileById(
  fileId: string
): Promise<TechFile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tech_files")
    .select("*")
    .eq("id", fileId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Failed to fetch tech file: ${error.message}`);
  }

  return data as TechFile;
}

/**
 * Update tech file status
 */
export async function updateTechFileStatus(
  fileId: string,
  status: TechFileStatus,
  errorMessage?: string | null
): Promise<TechFile> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tech_files")
    .update({
      status,
      error_message: errorMessage || null,
    })
    .eq("id", fileId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update tech file status: ${error.message}`);
  }

  return data as TechFile;
}

/**
 * Archive a tech file (soft delete)
 */
export async function archiveTechFile(fileId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tech_files")
    .update({
      status: "archived",
      archived_at: new Date().toISOString(),
    })
    .eq("id", fileId);

  if (error) {
    throw new Error(`Failed to archive tech file: ${error.message}`);
  }
}

// ===================================
// Versioning Operations
// ===================================

/**
 * Create a new version of a tech file
 * Uses the database function create_tech_file_version
 */
export async function createTechFileVersion(
  techFileId: string,
  userId: string,
  changeDescription?: string
): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("create_tech_file_version", {
    p_tech_file_id: techFileId,
    p_user_id: userId,
    p_change_description: changeDescription || null,
  });

  if (error) {
    throw new Error(`Failed to create tech file version: ${error.message}`);
  }

  return data as string; // Returns version ID
}

/**
 * Get all versions of a tech file
 */
export async function getTechFileVersions(
  techFileId: string
): Promise<TechFileVersion[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tech_file_versions")
    .select("*")
    .eq("tech_file_id", techFileId)
    .order("version_number", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch tech file versions: ${error.message}`);
  }

  return (data as TechFileVersion[]) || [];
}

// ===================================
// Collections Operations
// ===================================

/**
 * Create a new tech file collection
 */
export async function createTechFileCollection(
  input: CreateCollectionInput
): Promise<TechFileCollection> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tech_file_collections")
    .insert({
      product_idea_id: input.product_idea_id,
      revision_id: input.revision_id || null,
      user_id: input.user_id,
      collection_name: input.collection_name,
      collection_type: input.collection_type,
      description: input.description || null,
      generation_batch_id: input.generation_batch_id || null,
      status: "processing",
      completion_percentage: 0,
      total_credits_used: 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create tech file collection: ${error.message}`);
  }

  return data as TechFileCollection;
}

/**
 * Add files to a collection
 */
export async function addFilesToCollection(
  collectionId: string,
  fileIds: string[],
  options?: {
    section?: string;
    displayOrder?: number;
  }
): Promise<void> {
  const supabase = await createClient();

  const items = fileIds.map((fileId, index) => ({
    collection_id: collectionId,
    tech_file_id: fileId,
    section: options?.section || null,
    display_order:
      options?.displayOrder !== undefined
        ? options.displayOrder + index
        : index,
  }));

  const { error } = await supabase
    .from("tech_file_collection_items")
    .insert(items);

  if (error) {
    throw new Error(`Failed to add files to collection: ${error.message}`);
  }
}

/**
 * Get collection with all files
 */
export async function getCollectionWithFiles(
  collectionId: string
): Promise<TechFileCollection & { files: TechFile[] }> {
  const supabase = await createClient();

  // Get collection
  const { data: collection, error: collectionError } = await supabase
    .from("tech_file_collections")
    .select("*")
    .eq("id", collectionId)
    .single();

  if (collectionError) {
    throw new Error(`Failed to fetch collection: ${collectionError.message}`);
  }

  // Get collection items with files
  const { data: items, error: itemsError } = await supabase
    .from("tech_file_collection_items")
    .select(
      `
      display_order,
      section,
      tech_files (*)
    `
    )
    .eq("collection_id", collectionId)
    .order("display_order", { ascending: true });

  if (itemsError) {
    throw new Error(`Failed to fetch collection items: ${itemsError.message}`);
  }

  const files = (items || [])
    .map((item: any) => item.tech_files)
    .filter(Boolean);

  return {
    ...(collection as TechFileCollection),
    files: files as TechFile[],
  };
}

/**
 * Update collection status and completion percentage
 */
export async function updateCollectionProgress(
  collectionId: string,
  completionPercentage: number,
  status?: CollectionStatus
): Promise<void> {
  const supabase = await createClient();

  const updates: any = {
    completion_percentage: completionPercentage,
  };

  if (status) {
    updates.status = status;
  }

  if (status === "completed") {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("tech_file_collections")
    .update(updates)
    .eq("id", collectionId);

  if (error) {
    throw new Error(`Failed to update collection progress: ${error.message}`);
  }
}

/**
 * Update collection total credits used
 */
export async function updateCollectionCredits(
  collectionId: string,
  creditsToAdd: number
): Promise<void> {
  const supabase = await createClient();

  // Fetch current credits
  const { data: collection, error: fetchError } = await supabase
    .from("tech_file_collections")
    .select("total_credits_used")
    .eq("id", collectionId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch collection: ${fetchError.message}`);
  }

  const newTotal = (collection.total_credits_used || 0) + creditsToAdd;

  const { error } = await supabase
    .from("tech_file_collections")
    .update({ total_credits_used: newTotal })
    .eq("id", collectionId);

  if (error) {
    throw new Error(`Failed to update collection credits: ${error.message}`);
  }
}

/**
 * Get all collections for a product
 */
export async function getProductCollections(
  productId: string,
  collectionType?: CollectionType
): Promise<TechFileCollection[]> {
  const supabase = await createClient();

  let query = supabase
    .from("tech_file_collections")
    .select("*")
    .eq("product_idea_id", productId)
    .order("created_at", { ascending: false });

  if (collectionType) {
    query = query.eq("collection_type", collectionType);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch collections: ${error.message}`);
  }

  return (data as TechFileCollection[]) || [];
}

// ===================================
// Batch Operations
// ===================================

/**
 * Get all files from a specific generation batch
 */
export async function getBatchFiles(batchId: string): Promise<TechFile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tech_files")
    .select("*")
    .eq("generation_batch_id", batchId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch batch files: ${error.message}`);
  }

  return (data as TechFile[]) || [];
}

/**
 * Get generation statistics for a product
 */
export async function getProductGenerationStats(productId: string): Promise<{
  totalFiles: number;
  totalCreditsUsed: number;
  filesByType: Record<TechFileType, number>;
  filesByStatus: Record<TechFileStatus, number>;
}> {
  const supabase = await createClient();

  const { data: files, error } = await supabase
    .from("tech_files")
    .select("file_type, status, credits_used")
    .eq("product_idea_id", productId);

  if (error) {
    throw new Error(`Failed to fetch generation stats: ${error.message}`);
  }

  const totalFiles = files?.length || 0;
  const totalCreditsUsed =
    files?.reduce((sum, file) => sum + (file.credits_used || 0), 0) || 0;

  const filesByType =
    files?.reduce(
      (acc, file) => {
        const fileType = file.file_type as TechFileType;
        acc[fileType] = (acc[fileType] || 0) + 1;
        return acc;
      },
      {} as Record<TechFileType, number>
    ) || ({} as Record<TechFileType, number>);

  const filesByStatus =
    files?.reduce(
      (acc, file) => {
        const status = file.status as TechFileStatus;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<TechFileStatus, number>
    ) || ({} as Record<TechFileStatus, number>);

  return {
    totalFiles,
    totalCreditsUsed,
    filesByType,
    filesByStatus,
  };
}
