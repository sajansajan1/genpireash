"use server";

import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client for AI logging operations
 * Uses service role or anon key to bypass RLS for logging
 */
function getAILogsClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log("[AI-LOGS] Creating client with:", {
    url: supabaseUrl ? "URL present" : "URL missing",
    key: supabaseKey ? `Key present (${supabaseKey.substring(0, 20)}...)` : "Key missing",
    isServiceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Using service role" : "Using anon key"
  });
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn("[AI-LOGS] Supabase credentials not configured for AI logging");
    return null;
  }
  
  // Create a direct client without auth helpers
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
}

/**
 * Insert AI logs into the database
 */
export async function insertAILogs(logs: any[]) {
  console.log(`[AI-LOGS] Attempting to insert ${logs.length} logs`);
  
  const client = getAILogsClient();
  
  if (!client) {
    console.error("[AI-LOGS] Cannot insert AI logs - Supabase client not available");
    return { error: "Client not available" };
  }
  
  try {
    // Prepare logs for insertion
    const preparedLogs = logs.map(log => ({
      ...log,
      input: typeof log.input === 'object' ? JSON.stringify(log.input) : log.input,
      output: typeof log.output === 'object' ? JSON.stringify(log.output) : log.output,
      performance: typeof log.performance === 'object' ? JSON.stringify(log.performance) : log.performance,
      context: typeof log.context === 'object' ? JSON.stringify(log.context) : log.context
    }));
    
    console.log(`[AI-LOGS] Prepared logs for insertion:`, preparedLogs.map(l => ({
      model: l.model,
      function_name: l.function_name,
      timestamp: l.timestamp
    })));
    
    const { data, error } = await client
      .from("ai_logs")
      .insert(preparedLogs);
    
    if (error) {
      console.error("[AI-LOGS] Failed to insert AI logs:", error);
      return { error: error.message };
    }
    
    console.log(`[AI-LOGS] Successfully inserted ${logs.length} AI logs`);
    return { data, error: null };
  } catch (err) {
    console.error("[AI-LOGS] Exception inserting AI logs:", err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Fetch AI logs with filters
 */
export async function fetchAILogs(filters: {
  user_id?: string;
  tech_pack_id?: string;
  session_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
} = {}) {
  const client = getAILogsClient();
  
  if (!client) {
    console.error("Cannot fetch AI logs - Supabase client not available");
    return { data: [], error: "Client not available" };
  }
  
  try {
    let query = client
      .from("ai_logs")
      .select("*")
      .order("timestamp", { ascending: false });
    
    // Apply filters
    if (filters.user_id) {
      query = query.eq("context->user_id", filters.user_id);
    }
    if (filters.tech_pack_id) {
      query = query.eq("context->tech_pack_id", filters.tech_pack_id);
    }
    if (filters.session_id) {
      query = query.eq("context->session_id", filters.session_id);
    }
    if (filters.start_date) {
      query = query.gte("timestamp", filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte("timestamp", filters.end_date);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Failed to fetch AI logs:", error);
      return { data: [], error: error.message };
    }
    
    // Parse JSONB fields
    const parsedData = (data || []).map(row => ({
      ...row,
      input: typeof row.input === 'string' ? JSON.parse(row.input) : row.input,
      output: typeof row.output === 'string' ? JSON.parse(row.output) : row.output,
      performance: typeof row.performance === 'string' ? JSON.parse(row.performance) : row.performance,
      context: typeof row.context === 'string' ? JSON.parse(row.context) : row.context
    }));
    
    return { data: parsedData, error: null };
  } catch (err) {
    console.error("Exception fetching AI logs:", err);
    return { data: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Get AI usage statistics
 */
export async function getAIUsageStats(userId?: string, startDate?: string, endDate?: string) {
  const client = getAILogsClient();
  
  if (!client) {
    console.error("Cannot fetch AI usage stats - Supabase client not available");
    return null;
  }
  
  try {
    // Build the query based on filters
    let query = client.from("ai_logs").select("*");
    
    if (userId) {
      query = query.eq("context->user_id", userId);
    }
    if (startDate) {
      query = query.gte("timestamp", startDate);
    }
    if (endDate) {
      query = query.lte("timestamp", endDate);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Failed to fetch AI usage stats:", error);
      return null;
    }
    
    // Calculate statistics
    const stats = {
      total_requests: data?.length || 0,
      total_tokens: 0,
      total_cost: 0,
      by_model: {} as Record<string, { requests: number; tokens: number; cost: number }>,
      by_operation: {} as Record<string, { requests: number; tokens: number; cost: number }>,
      error_rate: 0,
      average_duration_ms: 0,
    };
    
    if (data && data.length > 0) {
      let totalDuration = 0;
      let errorCount = 0;
      
      data.forEach(log => {
        const output = typeof log.output === 'string' ? JSON.parse(log.output) : log.output;
        const performance = typeof log.performance === 'string' ? JSON.parse(log.performance) : log.performance;
        
        const tokens = output?.usage?.total_tokens || 0;
        const cost = output?.usage?.estimated_cost || 0;
        
        stats.total_tokens += tokens;
        stats.total_cost += cost;
        totalDuration += performance?.duration_ms || 0;
        
        if (performance?.status === "error") {
          errorCount++;
        }
        
        // By model
        if (!stats.by_model[log.model]) {
          stats.by_model[log.model] = { requests: 0, tokens: 0, cost: 0 };
        }
        stats.by_model[log.model].requests++;
        stats.by_model[log.model].tokens += tokens;
        stats.by_model[log.model].cost += cost;
        
        // By operation
        if (!stats.by_operation[log.operation_type]) {
          stats.by_operation[log.operation_type] = { requests: 0, tokens: 0, cost: 0 };
        }
        stats.by_operation[log.operation_type].requests++;
        stats.by_operation[log.operation_type].tokens += tokens;
        stats.by_operation[log.operation_type].cost += cost;
      });
      
      stats.error_rate = (errorCount / data.length) * 100;
      stats.average_duration_ms = totalDuration / data.length;
    }
    
    return stats;
  } catch (err) {
    console.error("Exception calculating AI usage stats:", err);
    return null;
  }
}

/**
 * Test the connection and table access
 */
export async function testAILogsConnection() {
  const client = getAILogsClient();
  
  if (!client) {
    return { success: false, error: "Client not available" };
  }
  
  try {
    // Try to query the table
    const { data, error } = await client
      .from("ai_logs")
      .select("id")
      .limit(1);
    
    if (error) {
      console.error("AI logs table access error:", error);
      return { success: false, error: error.message };
    }
    
    console.log("AI logs table connection successful");
    return { success: true, error: null };
  } catch (err) {
    console.error("AI logs connection test failed:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
