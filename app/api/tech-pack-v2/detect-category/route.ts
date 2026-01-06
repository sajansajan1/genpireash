/**
 * Tech Pack V2 - Category Detection API Route
 * POST /api/tech-pack-v2/detect-category
 *
 * First checks if category exists in product_ideas table.
 * Only calls AI classification if category is not already set.
 * Uses classifyProductWithAI for consistent category classification.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { classifyProductWithAI } from '@/lib/services/ai-category-classifier';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;

    // Validate required fields
    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: productId',
        },
        { status: 400 }
      );
    }

    // Get Supabase client for auth
    const supabase = await createClient();

    // First, check if category already exists in product_ideas table
    const { data: productIdea, error: fetchError } = await supabase
      .from('product_ideas')
      .select('category, category_subcategory, tech_pack, prompt')
      .eq('id', productId)
      .single();

    if (fetchError) {
      console.error('[detect-category] Error fetching product_ideas:', fetchError);
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      );
    }

    // If category exists in product_ideas, use it directly (no AI call needed)
    if (productIdea?.category && productIdea.category !== 'other') {
      console.log('[detect-category] Using existing category from product_ideas:', {
        productId,
        category: productIdea.category,
        subcategory: productIdea.category_subcategory,
      });

      return NextResponse.json({
        success: true,
        data: {
          category: productIdea.category,
          subcategory: productIdea.category_subcategory || 'general',
          confidence: 1.0, // High confidence since it was already classified
          timestamp: Date.now(),
          source: 'product_ideas',
        },
      });
    }

    // If no category in product_ideas, try to get from tech_pack
    const techPackCategory = productIdea?.tech_pack?.category;
    const techPackProductName = productIdea?.tech_pack?.productName;

    if (techPackCategory && techPackCategory !== 'other') {
      console.log('[detect-category] Using category from tech_pack:', {
        productId,
        category: techPackCategory,
      });

      // Classify using the tech pack category for consistency
      const classification = await classifyProductWithAI(techPackProductName || techPackCategory);

      // Update product_ideas category columns for future consistency
      await supabase
        .from('product_ideas')
        .update({
          category: classification.category,
          category_subcategory: classification.subcategory,
        })
        .eq('id', productId);

      return NextResponse.json({
        success: true,
        data: {
          category: classification.category,
          subcategory: classification.subcategory,
          confidence: classification.confidence,
          timestamp: Date.now(),
          source: 'tech_pack_classified',
        },
      });
    }

    // No existing category found - use product name/prompt to classify
    // Get text to classify from available data
    const textToClassify =
      productIdea?.tech_pack?.productName ||
      productIdea?.prompt ||
      '';

    if (!textToClassify) {
      console.log('[detect-category] No text available for classification:', { productId });
      return NextResponse.json({
        success: true,
        data: {
          category: 'other',
          subcategory: 'general',
          confidence: 0,
          timestamp: Date.now(),
          source: 'fallback',
        },
      });
    }

    console.log('[detect-category] Classifying product with AI:', {
      productId,
      textToClassify: textToClassify.substring(0, 100),
    });

    // Use classifyProductWithAI for consistent classification
    const classification = await classifyProductWithAI(textToClassify);

    // Save the detected category back to product_ideas for future use
    const { error: updateError } = await supabase
      .from('product_ideas')
      .update({
        category: classification.category,
        category_subcategory: classification.subcategory,
      })
      .eq('id', productId);

    if (updateError) {
      console.error('[detect-category] Error saving category to product_ideas:', updateError);
    } else {
      console.log('[detect-category] Saved classified category to product_ideas:', {
        productId,
        category: classification.category,
        subcategory: classification.subcategory,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        category: classification.category,
        subcategory: classification.subcategory,
        confidence: classification.confidence,
        timestamp: Date.now(),
        source: 'ai_classification',
      },
    });
  } catch (error) {
    console.error('Category detection API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Category detection failed',
      },
      { status: 500 }
    );
  }
}
