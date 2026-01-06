/**
 * Admin API Route: Migrate Assembly View Constraint
 * This endpoint adds 'assembly_view' to the valid_file_type constraint
 *
 * WARNING: This is a temporary admin endpoint. Remove after migration is complete.
 *
 * To use: Navigate to http://localhost:3002/api/admin/migrate-assembly-view-constraint
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    console.log("[Migration] Starting assembly_view constraint migration...");

    // Get admin Supabase client with service role (bypasses RLS)
    const supabase = await createClient();

    // For admin operations, we need service role key
    // First check if we have it in env
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    let adminClient = supabase;
    if (serviceRoleKey && supabaseUrl) {
      // Create admin client that bypasses RLS
      const { createClient: createAdminClient } = await import(
        "@supabase/supabase-js"
      );
      adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      console.log("[Migration] Using service role client (bypasses RLS)");
    } else {
      console.log("[Migration] Using regular client (RLS enabled)");
    }

    console.log("[Migration] Testing constraint by attempting insert...");

    // Note: Supabase client can't execute DDL (ALTER TABLE) statements directly
    // We need to use a different approach

    const migrationSteps = {
      message: "Migration SQL prepared",
      instructions: "Please run this SQL in Supabase Dashboard > SQL Editor",
      sql: `
-- Add 'assembly_view' to valid_file_type constraint in tech_files table
ALTER TABLE tech_files
DROP CONSTRAINT IF EXISTS valid_file_type;

ALTER TABLE tech_files
ADD CONSTRAINT valid_file_type CHECK (file_type IN (
  'base_view',
  'component',
  'closeup',
  'sketch',
  'flat_sketch',
  'assembly_view',
  'category',
  'complete_pack'
));
      `.trim(),
      steps: [
        "1. Go to https://supabase.com/dashboard",
        "2. Select your project",
        '3. Click "SQL Editor" in left sidebar',
        '4. Click "New Query"',
        "5. Paste the SQL shown above",
        "6. Click \"Run\" or press Cmd/Ctrl + Enter",
      ],
      currentConstraint: "Unable to query directly (will test via insert)",
    };

    // Try to test if assembly_view type is allowed
    console.log(
      "[Migration] Testing if assembly_view type is currently allowed..."
    );

    const testInsert = {
      product_idea_id: "00000000-0000-0000-0000-000000000000",
      user_id: "00000000-0000-0000-0000-000000000000",
      revision_id: "00000000-0000-0000-0000-000000000000",
      file_type: "assembly_view",
      file_category: "exploded",
      view_type: null,
      file_url: `https://test.com/migration-test-${Date.now()}.jpg`,
      file_format: "jpg",
      analysis_data: {},
      status: "pending",
    };

    const { data: insertData, error: insertError } = await adminClient
      .from("tech_files")
      .insert(testInsert)
      .select()
      .single();

    if (insertError) {
      if (
        insertError.message.includes('violates check constraint "valid_file_type"')
      ) {
        return NextResponse.json(
          {
            success: false,
            migrationNeeded: true,
            status: "Assembly view type NOT allowed - Migration REQUIRED",
            error: insertError.message,
            ...migrationSteps,
          },
          { status: 200 }
        );
      } else if (
        insertError.message.includes("violates foreign key constraint")
      ) {
        // Foreign key error means check constraint passed!
        return NextResponse.json(
          {
            success: true,
            migrationNeeded: false,
            status:
              "Assembly view type IS allowed - Migration already applied! ✓",
            message:
              'The database constraint already includes "assembly_view" file type.',
            note: "Foreign key error is expected with test UUIDs, but check constraint passed.",
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            migrationNeeded: true,
            status: "Unknown error - Migration recommended",
            error: insertError.message,
            ...migrationSteps,
          },
          { status: 200 }
        );
      }
    }

    // If insert succeeded, delete test record
    await adminClient
      .from("tech_files")
      .delete()
      .eq("file_url", testInsert.file_url);

    return NextResponse.json(
      {
        success: true,
        migrationNeeded: false,
        status: "Assembly view type IS allowed - Migration already applied! ✓",
        message:
          "Test insert succeeded. The database is ready for assembly view storage.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Migration] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Could not check migration status",
      },
      { status: 500 }
    );
  }
}
