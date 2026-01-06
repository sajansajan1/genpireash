"use server";

import { createClient } from "@/lib/supabase/server";

interface ProductImages {
  front?: string;
  back?: string;
  side?: string;
  top?: string;
  bottom?: string;
  source: 'image_data' | 'revisions' | 'front_view_approval' | 'none';
  hasPendingApproval?: boolean;
}

/**
 * Get product images from various sources in priority order:
 * 1. image_data (legacy format)
 * 2. product_multiview_revisions (first revision)
 * 3. front_view_approvals (pending approval)
 */
export async function getProductImages(productId: string): Promise<ProductImages> {
  const supabase = await createClient();

  // First, check the product_ideas table for image_data
  const { data: product } = await supabase
    .from('product_ideas')
    .select('image_data')
    .eq('id', productId)
    .single();

  if (product?.image_data) {
    const hasAnyImage =
      product.image_data.front?.url ||
      product.image_data.back?.url ||
      product.image_data.side?.url ||
      product.image_data.top?.url ||
      product.image_data.bottom?.url;

    if (hasAnyImage) {
      return {
        front: product.image_data.front?.url,
        back: product.image_data.back?.url,
        side: product.image_data.side?.url,
        top: product.image_data.top?.url,
        bottom: product.image_data.bottom?.url,
        source: 'image_data',
      };
    }
  }

  // Second, check for revisions (revision_number = 1 for first revision)
  const { data: revisions } = await supabase
    .from('product_multiview_revisions')
    .select('view_type, image_url, revision_number')
    .eq('product_idea_id', productId)
    .eq('is_deleted', false)
    .order('revision_number', { ascending: true })
    .order('created_at', { ascending: true });

  if (revisions && revisions.length > 0) {
    // Get the first revision images
    const firstRevisionNumber = revisions[0].revision_number;
    const firstRevisionImages = revisions.filter(r => r.revision_number === firstRevisionNumber);

    const images: ProductImages = {
      source: 'revisions',
    };

    firstRevisionImages.forEach(rev => {
      const view = rev.view_type as keyof Omit<ProductImages, 'source' | 'hasPendingApproval'>;
      if (view && rev.image_url) {
        images[view] = rev.image_url;
      }
    });

    return images;
  }

  // Third, check for front_view_approvals (pending approval)
  const { data: approval } = await supabase
    .from('front_view_approvals')
    .select('*')
    .eq('product_idea_id', productId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (approval) {
    return {
      front: approval.front_view_url || undefined,
      back: approval.back_view_url || undefined,
      side: approval.side_view_url || undefined,
      top: approval.top_view_url || undefined,
      bottom: approval.bottom_view_url || undefined,
      source: 'front_view_approval',
      hasPendingApproval: approval.status === 'pending',
    };
  }

  return {
    source: 'none',
  };
}
