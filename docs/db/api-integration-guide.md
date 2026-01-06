# Genpire API Integration Guide

## Overview

This guide provides comprehensive documentation for integrating with the Genpire platform's API endpoints and database operations. The platform uses Supabase as the backend, providing both REST and real-time capabilities.

## Table of Contents

1. [Authentication Setup](#authentication-setup)
2. [Core API Endpoints](#core-api-endpoints)
3. [Database Operations](#database-operations)
4. [Real-time Subscriptions](#real-time-subscriptions)
5. [Error Handling](#error-handling)
6. [Best Practices](#best-practices)

## Authentication Setup

### Environment Configuration

\`\`\`typescript
// .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key // Server-side only
\`\`\`

### Client Initialization

\`\`\`typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
{
auth: {
autoRefreshToken: true,
persistSession: true,
detectSessionInUrl: true
}
}
);
\`\`\`

### Server-side Client

\`\`\`typescript
// lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!,
{
auth: {
autoRefreshToken: false,
persistSession: false
}
}
);
\`\`\`

## Core API Endpoints

### Product Ideas API

#### Create Tech Pack

\`\`\`typescript
// POST /api/products/create
interface CreateProductRequest {
prompt: string;
userId: string;
}

interface CreateProductResponse {
id: string;
techPack: TechPackData;
images: {
front: string;
back: string;
side: string;
};
}

async function createProduct(prompt: string): Promise<CreateProductResponse> {
// 1. Generate tech pack with AI
const techPack = await generateTechPack(prompt);

// 2. Generate multi-view images
const images = await generateProductImages(techPack);

// 3. Save to database
const { data: product, error } = await supabase
.from('product_ideas')
.insert({
prompt,
tech_pack: techPack,
image_data: images,
status: 'completed'
})
.select()
.single();

// 4. Create initial revisions
const batchId = `batch-${Date.now()}`;
const revisions = Object.entries(images).map(([view, url]) => ({
product_idea_id: product.id,
user_id: auth.uid(),
view_type: view,
image_url: url,
revision_number: 0,
batch_id,
edit_type: 'initial',
is_active: true
}));

await supabase
.from('product_multiview_revisions')
.insert(revisions);

return { id: product.id, techPack, images };
}
\`\`\`

#### Get User Products

\`\`\`typescript
// GET /api/products
interface GetProductsParams {
userId: string;
limit?: number;
offset?: number;
}

async function getUserProducts(params: GetProductsParams) {
const query = supabase
.from('product_ideas')
.select(`      *,
      product_multiview_revisions!inner(
        view_type,
        image_url,
        revision_number
      )
   `)
.eq('user_id', params.userId)
.eq('product_multiview_revisions.is_active', true)
.eq('product_multiview_revisions.is_deleted', false)
.order('created_at', { ascending: false });

if (params.limit) {
query.limit(params.limit);
}

if (params.offset) {
query.range(params.offset, params.offset + (params.limit || 10) - 1);
}

return await query;
}
\`\`\`

### AI Image Editing API

#### Create Revision

\`\`\`typescript
// POST /api/revisions/create
interface CreateRevisionRequest {
productId: string;
editPrompt: string;
views: ('front' | 'back' | 'side')[];
}

async function createAIRevision(request: CreateRevisionRequest) {
// 1. Get current active revisions
const { data: currentRevisions } = await supabase
.from('product_multiview_revisions')
.select('\*')
.eq('product_idea_id', request.productId)
.eq('is_active', true)
.in('view_type', request.views);

// 2. Generate new images with AI
const newImages = await generateAIEdits(
currentRevisions,
request.editPrompt
);

// 3. Deactivate current revisions
await supabase
.from('product_multiview_revisions')
.update({ is_active: false })
.eq('product_idea_id', request.productId)
.in('view_type', request.views);

// 4. Create new revisions
const batchId = `batch-${Date.now()}`;
const newRevisions = request.views.map(view => ({
product_idea_id: request.productId,
user_id: auth.uid(),
view_type: view,
image_url: newImages[view],
edit_prompt: request.editPrompt,
revision_number: currentRevisions[0].revision_number + 1,
batch_id,
edit_type: 'ai_edit',
is_active: true,
ai_model: 'gemini-2.5-flash-image-preview',
generation_time_ms: Date.now() - startTime
}));

const { data, error } = await supabase
.from('product_multiview_revisions')
.insert(newRevisions)
.select();

return { success: !error, revisions: data };
}
\`\`\`

#### Rollback Revision

\`\`\`typescript
// POST /api/revisions/rollback
async function rollbackRevision(
productId: string,
targetRevisionNumber: number
) {
// Start transaction
const { data: targetRevisions } = await supabase
.from('product_multiview_revisions')
.select('\*')
.eq('product_idea_id', productId)
.eq('revision_number', targetRevisionNumber);

// Deactivate all current revisions
await supabase
.from('product_multiview_revisions')
.update({ is_active: false })
.eq('product_idea_id', productId);

// Activate target revisions
await supabase
.from('product_multiview_revisions')
.update({ is_active: true })
.eq('product_idea_id', productId)
.eq('revision_number', targetRevisionNumber);

return { success: true, revisions: targetRevisions };
}
\`\`\`

### Image Analysis API

#### Analyze Product Image

\`\`\`typescript
// POST /api/analyze/image
interface AnalyzeImageRequest {
imageUrl: string;
analysisType: 'product' | 'material' | 'color';
}

async function analyzeImage(request: AnalyzeImageRequest) {
// 1. Check cache first
const { data: cached } = await supabase
.from('image_analysis_cache')
.select('\*')
.eq('image_url', request.imageUrl)
.single();

if (cached && !isExpired(cached.expires_at)) {
return cached.analysis_data;
}

// 2. Perform AI analysis
const analysis = await performAIAnalysis(
request.imageUrl,
request.analysisType
);

// 3. Cache results
await supabase
.from('image_analysis_cache')
.upsert({
image_url: request.imageUrl,
analysis_data: analysis,
model_used: 'gpt-4o',
expires_at: new Date(Date.now() + 7 _ 24 _ 60 _ 60 _ 1000), // 7 days
tokens_used: analysis.tokensUsed,
processing_time_ms: analysis.processingTime
});

return analysis;
}
\`\`\`

### RFQ Management API

#### Create RFQ

\`\`\`typescript
// POST /api/rfq/create
interface CreateRFQRequest {
title: string;
productIdea: string;
techpackId: string;
timeline: string;
quantity: string;
targetPrice: string;
}

async function createRFQ(request: CreateRFQRequest) {
// 1. Create RFQ
const { data: rfq, error } = await supabase
.from('rfq')
.insert({
...request,
creator_id: auth.uid(),
status: 'open'
})
.select()
.single();

// 2. Notify relevant suppliers
const suppliers = await findMatchingSuppliers(rfq);

const notifications = suppliers.map(supplier => ({
senderId: rfq.creator_id,
receiverId: supplier.user_id,
title: 'New RFQ Available',
message: `New RFQ: ${rfq.title}`,
type: 'rfq_new'
}));

await supabase
.from('notifications')
.insert(notifications);

return { rfq, notifiedSuppliers: suppliers.length };
}
\`\`\`

#### Submit Quote

\`\`\`typescript
// POST /api/rfq/quote
interface SubmitQuoteRequest {
rfqId: string;
samplePrice: string;
moq: string;
leadTime: string;
message: string;
}

async function submitQuote(request: SubmitQuoteRequest) {
const { data: quote, error } = await supabase
.from('supplier_rfqs_quotes')
.insert({
rfq_id: request.rfqId,
supplier_id: auth.uid(),
sample_price: request.samplePrice,
moq: request.moq,
lead_time: request.leadTime,
message: request.message,
status: 'submitted'
})
.select()
.single();

// Notify RFQ creator
const { data: rfq } = await supabase
.from('rfq')
.select('creator_id, title')
.eq('id', request.rfqId)
.single();

await supabase
.from('notifications')
.insert({
senderId: auth.uid(),
receiverId: rfq.creator_id,
title: 'New Quote Received',
message: `New quote for RFQ: ${rfq.title}`,
type: 'quote_received'
});

return quote;
}
\`\`\`

## Database Operations

### Transaction Patterns

\`\`\`typescript
// Using Supabase transactions with RPC
async function createProductWithRevisions(data: any) {
const { data: result, error } = await supabase
.rpc('create_product_with_revisions', {
p_prompt: data.prompt,
p_tech_pack: data.techPack,
p_images: data.images
});

if (error) throw error;
return result;
}

// SQL Function
/\*
CREATE OR REPLACE FUNCTION create_product_with_revisions(
p_prompt TEXT,
p_tech_pack JSONB,
p_images JSONB
) RETURNS TABLE(product_id UUID, revision_ids UUID[]) AS $$
DECLARE
v_product_id UUID;
v_revision_ids UUID[];
BEGIN
-- Insert product
INSERT INTO product_ideas (prompt, tech_pack, image_data)
VALUES (p_prompt, p_tech_pack, p_images)
RETURNING id INTO v_product_id;

-- Insert revisions
-- ... revision logic

RETURN QUERY SELECT v_product_id, v_revision_ids;
END;

$$
LANGUAGE plpgsql;
*/
\`\`\`

### Batch Operations

\`\`\`typescript
// Batch insert with conflict handling
async function batchInsertRevisions(revisions: any[]) {
  const { data, error } = await supabase
    .from('product_multiview_revisions')
    .upsert(revisions, {
      onConflict: 'product_idea_id,view_type,revision_number',
      ignoreDuplicates: false
    })
    .select();

  return { data, error };
}

// Batch update with filters
async function batchUpdateRevisions(
  productId: string,
  updates: any
) {
  const { data, error } = await supabase
    .from('product_multiview_revisions')
    .update(updates)
    .eq('product_idea_id', productId)
    .in('view_type', ['front', 'back', 'side'])
    .eq('is_active', true);

  return { data, error };
}
\`\`\`

### Complex Queries

\`\`\`typescript
// Join multiple tables with aggregations
async function getProductWithStats(productId: string) {
  const { data, error } = await supabase
    .from('product_ideas')
    .select(`
      *,
      creator:users!user_id(
        full_name,
        email
      ),
      revisions:product_multiview_revisions(
        count
      ),
      active_images:product_multiview_revisions!inner(
        view_type,
        image_url
      )
    `)
    .eq('id', productId)
    .eq('active_images.is_active', true)
    .single();

  return data;
}

// Aggregation with window functions
async function getRevisionHistory(productId: string) {
  const { data } = await supabase
    .rpc('get_revision_history', {
      p_product_id: productId
    });

  return data;
}
\`\`\`

## Real-time Subscriptions

### Subscribe to Changes

\`\`\`typescript
// Subscribe to product updates
function subscribeToProduct(
  productId: string,
  callback: (payload: any) => void
) {
  const subscription = supabase
    .channel(`product:${productId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'product_multiview_revisions',
        filter: `product_idea_id=eq.${productId}`
      },
      callback
    )
    .subscribe();

  return subscription;
}

// Subscribe to notifications
function subscribeToNotifications(
  userId: string,
  callback: (payload: any) => void
) {
  const subscription = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `receiverId=eq.${userId}`
      },
      callback
    )
    .subscribe();

  return subscription;
}
\`\`\`

### Presence & Broadcast

\`\`\`typescript
// Real-time collaboration
function setupCollaboration(productId: string) {
  const channel = supabase.channel(`collab:${productId}`);

  // Track presence
  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      console.log('Users online:', state);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', leftPresences);
    });

  // Broadcast changes
  channel
    .on('broadcast', { event: 'cursor' }, ({ payload }) => {
      console.log('Cursor moved:', payload);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: auth.uid(),
          online_at: new Date().toISOString()
        });
      }
    });

  return channel;
}
\`\`\`

## Error Handling

### Standard Error Response

\`\`\`typescript
interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

class APIErrorHandler {
  static handle(error: any): APIError {
    // Supabase errors
    if (error.code) {
      return {
        code: error.code,
        message: this.getErrorMessage(error.code),
        details: error.details,
        timestamp: new Date().toISOString()
      };
    }

    // Custom errors
    if (error.name === 'ValidationError') {
      return {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: error.errors,
        timestamp: new Date().toISOString()
      };
    }

    // Default error
    return {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    };
  }

  static getErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      '23505': 'Duplicate entry exists',
      '23503': 'Referenced record not found',
      '23502': 'Required field is missing',
      '22P02': 'Invalid input syntax',
      'PGRST116': 'No rows found',
      'PGRST204': 'No content to return'
    };

    return messages[code] || 'Database operation failed';
  }
}
\`\`\`

### Retry Logic

\`\`\`typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  options = { retries: 3, delay: 1000 }
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < options.retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on client errors
      if (error.code?.startsWith('4')) {
        throw error;
      }

      // Exponential backoff
      const delay = options.delay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Usage
const result = await withRetry(
  () => supabase.from('product_ideas').insert(data),
  { retries: 3, delay: 1000 }
);
\`\`\`

## Best Practices

### 1. Query Optimization

\`\`\`typescript
// ❌ Bad: Multiple queries
const product = await supabase.from('product_ideas').select().eq('id', id);
const revisions = await supabase.from('product_multiview_revisions').select().eq('product_idea_id', id);

// ✅ Good: Single query with joins
const product = await supabase
  .from('product_ideas')
  .select(`
    *,
    product_multiview_revisions(*)
  `)
  .eq('id', id)
  .single();
\`\`\`

### 2. Pagination

\`\`\`typescript
interface PaginationParams {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

async function paginatedQuery(
  table: string,
  params: PaginationParams
) {
  const from = (params.page - 1) * params.limit;
  const to = from + params.limit - 1;

  const query = supabase
    .from(table)
    .select('*', { count: 'exact' })
    .range(from, to);

  if (params.orderBy) {
    query.order(params.orderBy, {
      ascending: params.orderDirection === 'asc'
    });
  }

  const { data, count, error } = await query;

  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total: count,
      totalPages: Math.ceil((count || 0) / params.limit)
    }
  };
}
\`\`\`

### 3. Type Safety

\`\`\`typescript
// Generate types from database
import { Database } from '@/types/supabase';

type Product = Database['public']['Tables']['product_ideas']['Row'];
type ProductInsert = Database['public']['Tables']['product_ideas']['Insert'];
type ProductUpdate = Database['public']['Tables']['product_ideas']['Update'];

// Type-safe queries
const { data } = await supabase
  .from('product_ideas')
  .select()
  .returns<Product[]>();
\`\`\`

### 4. Caching Strategy

\`\`\`typescript
import { unstable_cache } from 'next/cache';

const getCachedProduct = unstable_cache(
  async (productId: string) => {
    const { data } = await supabase
      .from('product_ideas')
      .select('*')
      .eq('id', productId)
      .single();

    return data;
  },
  ['product'],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ['product']
  }
);

// Invalidate cache
import { revalidateTag } from 'next/cache';
revalidateTag('product');
\`\`\`

### 5. Security

\`\`\`typescript
// Row Level Security (RLS) policies
/*
-- Users can only see their own products
CREATE POLICY "Users can view own products" ON product_ideas
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only update their own products
CREATE POLICY "Users can update own products" ON product_ideas
  FOR UPDATE USING (auth.uid() = user_id);
*/

// Server-side validation
import { z } from 'zod';

const createProductSchema = z.object({
  prompt: z.string().min(10).max(1000),
  userId: z.string().uuid()
});

function validateInput(data: unknown) {
  return createProductSchema.parse(data);
}
\`\`\`

## Testing

### Unit Tests

\`\`\`typescript
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/products/create';

describe('Product Creation API', () => {
  it('should create product with valid input', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        prompt: 'Create a modern t-shirt design'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toHaveProperty('id');
  });
});
\`\`\`

### Integration Tests

\`\`\`typescript
import { supabase } from '@/lib/supabase/client';

describe('Database Operations', () => {
  beforeEach(async () => {
    // Setup test data
    await supabase.from('product_ideas').delete().eq('test', true);
  });

  it('should handle revision creation', async () => {
    // Create product
    const { data: product } = await supabase
      .from('product_ideas')
      .insert({ prompt: 'Test', test: true })
      .select()
      .single();

    // Create revision
    const { data: revision } = await supabase
      .from('product_multiview_revisions')
      .insert({
        product_idea_id: product.id,
        view_type: 'front',
        image_url: 'test.jpg'
      })
      .select()
      .single();

    expect(revision).toBeDefined();
    expect(revision.product_idea_id).toBe(product.id);
  });
});
\`\`\`

## Monitoring & Analytics

### Track API Usage

\`\`\`typescript
async function trackAPIUsage(
  operation: string,
  model: string,
  input: any,
  output: any,
  performance: any
) {
  await supabase.from('ai_logs').insert({
    model,
    provider: 'gemini',
    function_name: operation,
    operation_type: 'image_generation',
    input,
    output,
    performance,
    context: {
      user_id: auth.uid(),
      timestamp: new Date().toISOString()
    }
  });
}
\`\`\`

### Performance Monitoring

\`\`\`typescript
class PerformanceMonitor {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  async trackOperation<T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();

    try {
      const result = await operation();

      const duration = Date.now() - start;

      // Log if slow
      if (duration > 1000) {
        console.warn(`Slow operation: ${name} took ${duration}ms`);
      }

      // Track in database
      await this.logPerformance(name, duration, 'success');

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      await this.logPerformance(name, duration, 'error');
      throw error;
    }
  }

  private async logPerformance(
    operation: string,
    duration: number,
    status: string
  ) {
    // Log to monitoring service
    console.log({
      operation,
      duration,
      status,
      timestamp: new Date().toISOString()
    });
  }
}
\`\`\`

## Deployment Considerations

### Environment Variables

\`\`\`bash
# Production
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# AI Services
NEXT_PUBLIC_OPENAI_API_KEY=xxx
GEMINI_API_KEY=xxx

# Storage
NEXT_PUBLIC_STORAGE_BUCKET=product-images
\`\`\`

### Database Migrations

\`\`\`sql
-- Migration: 001_add_soft_delete.sql
ALTER TABLE product_multiview_revisions
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_revisions_not_deleted
ON product_multiview_revisions(product_idea_id, is_active)
WHERE is_deleted = false;
\`\`\`

### Health Checks

\`\`\`typescript
// pages/api/health.ts
export default async function handler(req: Request, res: Response) {
  try {
    // Check database
    const { error: dbError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (dbError) throw dbError;

    // Check storage
    const { error: storageError } = await supabase
      .storage
      .from('product-images')
      .list('', { limit: 1 });

    if (storageError) throw storageError;

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        storage: 'up'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
\`\`\`

---

*Last Updated: January 2025*
*API Version: v1.0*
$$
