/**
 * Tech Pack V2 - Update Analysis API Route
 * PATCH /api/tech-pack-v2/update-analysis
 * Updates analysis data for a base view
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { revisionId, fieldPath, value, analysisData } = body;

    // Validate required fields
    if (!revisionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: revisionId',
        },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // If full analysisData is provided, update the entire analysis
    if (analysisData) {
      // Update in tech_files table
      const { error: techFilesError } = await supabase
        .from('tech_files')
        .update({
          analysis_data: analysisData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', revisionId)
        .eq('user_id', user.id);

      if (techFilesError) {
        console.error('Failed to update tech_files:', techFilesError);
        throw new Error('Failed to update analysis data');
      }

      // Also update in revision_vision_analysis for backwards compatibility
      const { error: visionAnalysisError } = await supabase
        .from('revision_vision_analysis')
        .update({
          analysis_data: analysisData,
          updated_at: new Date().toISOString(),
        })
        .eq('revision_id', revisionId)
        .eq('user_id', user.id);

      if (visionAnalysisError) {
        console.warn('Failed to update revision_vision_analysis:', visionAnalysisError);
        // Don't throw - legacy table update is optional
      }

      return NextResponse.json({
        success: true,
        data: { analysisData },
      });
    }

    // If fieldPath and value are provided, update a specific field
    if (fieldPath !== undefined && value !== undefined) {
      // First, fetch the current analysis data
      const { data: techFile, error: fetchError } = await supabase
        .from('tech_files')
        .select('analysis_data')
        .eq('id', revisionId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !techFile) {
        throw new Error('Failed to fetch current analysis data');
      }

      // Deep clone and update the specific field
      const updatedAnalysisData = JSON.parse(JSON.stringify(techFile.analysis_data || {}));
      const pathParts = fieldPath.split('.');
      let current = updatedAnalysisData;

      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!current[part]) current[part] = {};
        current = current[part];
      }

      const lastPart = pathParts[pathParts.length - 1];
      current[lastPart] = value;

      // Update in tech_files table
      const { error: updateError } = await supabase
        .from('tech_files')
        .update({
          analysis_data: updatedAnalysisData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', revisionId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to update tech_files:', updateError);
        throw new Error('Failed to update analysis field');
      }

      // Also update in revision_vision_analysis
      const { error: visionUpdateError } = await supabase
        .from('revision_vision_analysis')
        .update({
          analysis_data: updatedAnalysisData,
          updated_at: new Date().toISOString(),
        })
        .eq('revision_id', revisionId)
        .eq('user_id', user.id);

      if (visionUpdateError) {
        console.warn('Failed to update revision_vision_analysis:', visionUpdateError);
      }

      return NextResponse.json({
        success: true,
        data: { fieldPath, value, analysisData: updatedAnalysisData },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Either analysisData or both fieldPath and value must be provided',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update analysis API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update analysis',
      },
      { status: 500 }
    );
  }
}
