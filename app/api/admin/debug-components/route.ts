/**
 * Debug Components Endpoint
 * Shows all components in database with their associations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get all component files
    const { data: components, error } = await supabase
      .from('tech_files')
      .select('*')
      .eq('file_type', 'component')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 500 });
    }

    // Group by product
    const byProduct = components?.reduce((acc: any, comp: any) => {
      const prodId = comp.product_idea_id;
      if (!acc[prodId]) {
        acc[prodId] = [];
      }
      acc[prodId].push({
        id: comp.id.substring(0, 8),
        revisionId: comp.revision_id?.substring(0, 8),
        category: comp.file_category,
        componentName: comp.metadata?.component_name || comp.analysis_data?.component_shot?.component_name,
        status: comp.status,
        hasUrl: !!comp.file_url,
        hasGuide: !!comp.analysis_data?.component_guide,
        createdAt: comp.created_at,
      });
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      totalComponents: components?.length || 0,
      components: components?.map((c: any) => ({
        id: c.id.substring(0, 8),
        productId: c.product_idea_id.substring(0, 8),
        revisionId: c.revision_id?.substring(0, 8),
        category: c.file_category,
        componentName: c.metadata?.component_name || c.analysis_data?.component_shot?.component_name || 'Unknown',
        status: c.status,
        hasUrl: !!c.file_url,
        hasGuide: !!c.analysis_data?.component_guide,
        createdAt: c.created_at,
      })),
      byProduct,
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
