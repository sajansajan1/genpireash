/**
 * Supabase Service Layer for Product 3D Models
 * Handles CRUD operations for the product_3d_models table
 */

import { createClient } from "@/lib/supabase/server";

export interface ModelUrls {
  glb?: string;
  fbx?: string;
  usdz?: string;
  obj?: string;
  mtl?: string;
}

export interface TextureUrls {
  base_color?: string;
  metallic?: string;
  roughness?: string;
  normal?: string;
}

export interface InputImages {
  front?: string;
  back?: string;
  side?: string;
  top?: string;
  bottom?: string;
}

export interface Product3DModel {
  id: string;
  user_id: string;
  source_type: "product" | "collection";
  source_id: string;
  task_id: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED" | "EXPIRED";
  progress: number;
  model_urls: ModelUrls;
  thumbnail_url?: string;
  texture_urls?: TextureUrls[];
  input_images: InputImages;
  task_error?: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  finished_at?: string;
}

export interface CreateProduct3DModelInput {
  source_type: "product" | "collection";
  source_id: string;
  task_id: string;
  input_images: InputImages;
  status?: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED" | "EXPIRED";
  progress?: number;
  model_urls?: ModelUrls;
  thumbnail_url?: string;
  texture_urls?: TextureUrls[];
  task_error?: string;
  is_active?: boolean;
}

export interface UpdateProduct3DModelInput {
  status?: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED" | "EXPIRED";
  progress?: number;
  model_urls?: ModelUrls;
  thumbnail_url?: string;
  texture_urls?: TextureUrls[];
  task_error?: string;
  finished_at?: string;
  is_active?: boolean;
}

/**
 * Create a new 3D model record
 */
export async function createProduct3DModel(
  input: CreateProduct3DModelInput
): Promise<{ data: Product3DModel | null; error: any }> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { data: null, error: new Error("User not authenticated") };
  }

  const { data, error } = await supabase
    .from("product_3d_models")
    .insert({
      user_id: user.id,
      source_type: input.source_type,
      source_id: input.source_id,
      task_id: input.task_id,
      input_images: input.input_images,
      status: input.status || "PENDING",
      progress: input.progress || 0,
      model_urls: input.model_urls || {},
      thumbnail_url: input.thumbnail_url,
      texture_urls: input.texture_urls || [],
      task_error: input.task_error,
      is_active: input.is_active !== undefined ? input.is_active : true,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Update a 3D model record by task_id
 */
export async function updateProduct3DModelByTaskId(
  task_id: string,
  updates: UpdateProduct3DModelInput
): Promise<{ data: Product3DModel | null; error: any }> {
  const supabase = await createClient();

  // First check if record exists
  const { data: existingRecord } = await supabase
    .from("product_3d_models")
    .select("id")
    .eq("task_id", task_id)
    .maybeSingle();

  if (!existingRecord) {
    // Record doesn't exist yet - this can happen if webhook arrives before POST completes
    console.warn(`No record found for task_id: ${task_id}. Webhook will be retried by Meshy.`);
    return {
      data: null,
      error: {
        code: 'RECORD_NOT_FOUND',
        message: `No 3D model record found with task_id: ${task_id}`
      }
    };
  }

  const { data, error } = await supabase
    .from("product_3d_models")
    .update(updates)
    .eq("task_id", task_id)
    .select()
    .single();

  return { data, error };
}

/**
 * Update a 3D model record by ID
 */
export async function updateProduct3DModelById(
  id: string,
  updates: UpdateProduct3DModelInput
): Promise<{ data: Product3DModel | null; error: any }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_3d_models")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

/**
 * Get active 3D model for a product/collection
 */
export async function getActiveProduct3DModel(
  source_type: "product" | "collection",
  source_id: string
): Promise<{ data: Product3DModel | null; error: any }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_3d_models")
    .select("*")
    .eq("source_type", source_type)
    .eq("source_id", source_id)
    .eq("is_active", true)
    .eq("status", "SUCCEEDED")
    .single();

  return { data, error };
}

/**
 * Get all 3D model versions for a product/collection
 */
export async function getAllProduct3DModels(
  source_type: "product" | "collection",
  source_id: string
): Promise<{ data: Product3DModel[] | null; error: any }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_3d_models")
    .select("*")
    .eq("source_type", source_type)
    .eq("source_id", source_id)
    .order("version", { ascending: false });

  return { data, error };
}

/**
 * Get a 3D model by task_id
 */
export async function getProduct3DModelByTaskId(
  task_id: string
): Promise<{ data: Product3DModel | null; error: any }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_3d_models")
    .select("*")
    .eq("task_id", task_id)
    .single();

  return { data, error };
}

/**
 * Set a specific version as active (deactivates other versions automatically via trigger)
 */
export async function setActiveProduct3DModel(
  id: string
): Promise<{ data: Product3DModel | null; error: any }> {
  return updateProduct3DModelById(id, { is_active: true });
}

/**
 * Delete a 3D model version
 */
export async function deleteProduct3DModel(
  id: string
): Promise<{ error: any }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("product_3d_models")
    .delete()
    .eq("id", id);

  return { error };
}

/**
 * Get all 3D models for the current user (with pagination)
 */
export async function getUserProduct3DModels(
  page: number = 1,
  limit: number = 20,
  status?: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED" | "EXPIRED"
): Promise<{
  data: Product3DModel[] | null;
  count: number | null;
  error: any;
}> {
  const supabase = await createClient();

  const offset = (page - 1) * limit;

  let query = supabase
    .from("product_3d_models")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;

  return { data, count, error };
}

/**
 * Get 3D models with source details (joins with products/collections)
 * Returns enriched data with product/collection information
 */
export async function getProduct3DModelsWithSource(
  source_type: "product" | "collection",
  source_ids: string[]
): Promise<{ data: any[] | null; error: any }> {
  const supabase = await createClient();

  // Get all active 3D models for the given source IDs
  const { data, error } = await supabase
    .from("product_3d_models")
    .select("*")
    .eq("source_type", source_type)
    .in("source_id", source_ids)
    .eq("is_active", true)
    .eq("status", "SUCCEEDED");

  if (error) {
    return { data: null, error };
  }

  // Create a map of source_id -> 3D model for easy lookup
  const modelsMap = new Map<string, Product3DModel>();
  data?.forEach((model) => {
    modelsMap.set(model.source_id, model);
  });

  return { data: Array.from(modelsMap.values()), error: null };
}
