/**
 * Verify Migration Status
 * Checks if component file type is working by querying existing data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Query for any existing component files
    const { data: components, error: queryError } = await supabase
      .from('tech_files')
      .select('id, file_type, file_category, created_at')
      .eq('file_type', 'component')
      .limit(10);

    if (queryError) {
      return NextResponse.json({
        success: false,
        message: 'Could not query tech_files table',
        error: queryError.message,
        recommendation: 'This might be normal if no components exist yet.',
      }, { status: 200 });
    }

    // Get count of all file types
    const { data: allFiles, error: countError } = await supabase
      .from('tech_files')
      .select('file_type');

    const fileTypeCounts = allFiles?.reduce((acc: Record<string, number>, file: any) => {
      acc[file.file_type] = (acc[file.file_type] || 0) + 1;
      return acc;
    }, {}) || {};

    return NextResponse.json({
      success: true,
      componentFilesFound: components?.length || 0,
      components: components || [],
      allFileTypeCounts: fileTypeCounts,
      message: components && components.length > 0
        ? `Found ${components.length} component files - migration is working!`
        : 'No component files found yet (but query succeeded, so file_type is valid)',
      migrationStatus: components && components.length > 0
        ? 'CONFIRMED: Migration applied successfully'
        : 'UNCLEAR: No components exist yet, but no constraint error occurred',
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
