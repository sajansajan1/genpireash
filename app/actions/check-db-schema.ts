"use server";

import { createClient } from "@/lib/supabase/server";

export async function checkProductMultiviewRevisionsSchema() {
  try {
    const supabase = await createClient();
    
    // Try to get schema information
    const { data, error } = await supabase
      .from("product_multiview_revisions")
      .select("*")
      .limit(1);
    
    if (error) {
      console.log("Schema check error:", error);
      return {
        exists: false,
        error: error.message,
        columns: []
      };
    }
    
    // If we get here, table exists
    // Get actual column names from a test query
    const testInsert = {
      product_idea_id: "00000000-0000-0000-0000-000000000000",
      user_id: "00000000-0000-0000-0000-000000000000",
      revision_number: 999999,
    };
    
    // Try different column combinations
    const columnTests = [
      { name: "view_type", value: "test" },
      { name: "viewType", value: "test" },
      { name: "view", value: "test" },
      { name: "image_url", value: "test" },
      { name: "imageUrl", value: "test" },
      { name: "url", value: "test" },
    ];
    
    const existingColumns: string[] = [];
    
    for (const test of columnTests) {
      try {
        const { error: testError } = await supabase
          .from("product_multiview_revisions")
          .select(test.name)
          .limit(1);
        
        if (!testError) {
          existingColumns.push(test.name);
        }
      } catch (e) {
        // Column doesn't exist
      }
    }
    
    return {
      exists: true,
      columns: existingColumns,
      sample: data?.[0] || null
    };
  } catch (error: any) {
    return {
      exists: false,
      error: error.message,
      columns: []
    };
  }
}

export async function getActualTableSchema() {
  try {
    const supabase = await createClient();
    
    // Query the information schema to get actual column names
    const { data, error } = await supabase
      .rpc('get_table_columns', { table_name: 'product_multiview_revisions' })
      .select('*');
    
    if (error) {
      // Try a direct query
      const { data: sampleData, error: sampleError } = await supabase
        .from('product_multiview_revisions')
        .select('*')
        .limit(1);
      
      if (sampleData && sampleData.length > 0) {
        return {
          success: true,
          columns: Object.keys(sampleData[0]),
          sample: sampleData[0]
        };
      }
      
      return {
        success: false,
        error: error.message || sampleError?.message
      };
    }
    
    return {
      success: true,
      columns: data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
