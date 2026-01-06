# Genpire Database Query Examples & Patterns

## Table of Contents

1. [Common Query Patterns](#common-query-patterns)
2. [Product Management Queries](#product-management-queries)
3. [Revision Management Queries](#revision-management-queries)
4. [User Analytics Queries](#user-analytics-queries)
5. [RFQ & Order Queries](#rfq--order-queries)
6. [Performance Optimized Queries](#performance-optimized-queries)
7. [Maintenance Queries](#maintenance-queries)

## Common Query Patterns

### Basic CRUD Operations

\`\`\`sql
-- CREATE: Insert new product with returning clause
INSERT INTO product_ideas (user_id, prompt, tech_pack, status)
VALUES ($1, $2, $3, 'pending')
RETURNING id, created_at;

-- READ: Select with joins
SELECT 
  pi.*,
  u.full_name as creator_name,
  u.email as creator_email
FROM product_ideas pi
JOIN users u ON u.id = pi.user_id
WHERE pi.id = $1;

-- UPDATE: Update with timestamp
UPDATE product_ideas
SET 
  tech_pack = $2,
  updated_at = NOW()
WHERE id = $1
RETURNING *;

-- DELETE: Soft delete pattern
UPDATE product_multiview_revisions
SET 
  is_deleted = true,
  deleted_at = NOW(),
  deleted_by = $2
WHERE id = $1;
\`\`\`

### Pagination Pattern

\`\`\`sql
-- Efficient pagination with cursor
SELECT *
FROM product_ideas
WHERE user_id = $1
  AND created_at < $2  -- cursor
ORDER BY created_at DESC
LIMIT $3;

-- Count total for pagination
SELECT COUNT(*) OVER() as total_count, *
FROM product_ideas
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
\`\`\`

## Product Management Queries

### Get Products with Active Images

\`\`\`sql
-- Get all products with their current active images
WITH active_images AS (
  SELECT 
    product_idea_id,
    jsonb_object_agg(view_type, image_url) as images
  FROM product_multiview_revisions
  WHERE is_active = true 
    AND is_deleted = false
  GROUP BY product_idea_id
)
SELECT 
  pi.*,
  ai.images,
  u.full_name as creator_name
FROM product_ideas pi
LEFT JOIN active_images ai ON ai.product_idea_id = pi.id
LEFT JOIN users u ON u.id = pi.user_id
WHERE pi.user_id = $1
ORDER BY pi.created_at DESC;
\`\`\`

### Get Product Detail with Full History

\`\`\`sql
-- Complete product information with revision history
SELECT 
  pi.*,
  jsonb_build_object(
    'revisions', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', pmr.id,
          'revision_number', pmr.revision_number,
          'view_type', pmr.view_type,
          'image_url', pmr.image_url,
          'edit_prompt', pmr.edit_prompt,
          'created_at', pmr.created_at,
          'is_active', pmr.is_active
        ) ORDER BY pmr.revision_number DESC
      )
      FROM product_multiview_revisions pmr
      WHERE pmr.product_idea_id = pi.id
        AND pmr.is_deleted = false
    ),
    'creator', (
      SELECT jsonb_build_object(
        'id', u.id,
        'name', u.full_name,
        'email', u.email
      )
      FROM users u
      WHERE u.id = pi.user_id
    )
  ) as details
FROM product_ideas pi
WHERE pi.id = $1;
\`\`\`

### Search Products

\`\`\`sql
-- Full-text search on products
SELECT 
  pi.*,
  ts_rank(
    to_tsvector('english', 
      COALESCE(prompt, '') || ' ' || 
      COALESCE(tech_pack->>'title', '') || ' ' ||
      COALESCE(tech_pack->>'description', '')
    ),
    plainto_tsquery('english', $1)
  ) as relevance
FROM product_ideas pi
WHERE 
  to_tsvector('english', 
    COALESCE(prompt, '') || ' ' || 
    COALESCE(tech_pack->>'title', '') || ' ' ||
    COALESCE(tech_pack->>'description', '')
  ) @@ plainto_tsquery('english', $1)
  AND pi.user_id = $2
ORDER BY relevance DESC
LIMIT 20;
\`\`\`

## Revision Management Queries

### Get Revision Timeline

\`\`\`sql
-- Get complete revision timeline for a product
SELECT 
  pmr.revision_number,
  pmr.batch_id,
  pmr.edit_type,
  pmr.edit_prompt,
  pmr.created_at,
  pmr.ai_model,
  pmr.generation_time_ms,
  jsonb_object_agg(pmr.view_type, pmr.image_url) as images,
  u.full_name as edited_by
FROM product_multiview_revisions pmr
LEFT JOIN users u ON u.id = pmr.user_id
WHERE pmr.product_idea_id = $1
  AND pmr.is_deleted = false
GROUP BY 
  pmr.revision_number,
  pmr.batch_id,
  pmr.edit_type,
  pmr.edit_prompt,
  pmr.created_at,
  pmr.ai_model,
  pmr.generation_time_ms,
  u.full_name
ORDER BY pmr.revision_number DESC;
\`\`\`

### Compare Revisions

\`\`\`sql
-- Compare two revision sets
WITH revision_1 AS (
  SELECT view_type, image_url, edit_prompt
  FROM product_multiview_revisions
  WHERE product_idea_id = $1 
    AND revision_number = $2
    AND is_deleted = false
),
revision_2 AS (
  SELECT view_type, image_url, edit_prompt
  FROM product_multiview_revisions
  WHERE product_idea_id = $1 
    AND revision_number = $3
    AND is_deleted = false
)
SELECT 
  COALESCE(r1.view_type, r2.view_type) as view_type,
  r1.image_url as revision_1_image,
  r2.image_url as revision_2_image,
  r1.edit_prompt as revision_1_prompt,
  r2.edit_prompt as revision_2_prompt
FROM revision_1 r1
FULL OUTER JOIN revision_2 r2 ON r1.view_type = r2.view_type;
\`\`\`

### Batch Revision Operations

\`\`\`sql
-- Create multiple revisions in one transaction
WITH new_batch AS (
  SELECT gen_random_uuid() as batch_id
),
max_revision AS (
  SELECT COALESCE(MAX(revision_number), -1) + 1 as next_revision
  FROM product_multiview_revisions
  WHERE product_idea_id = $1
)
INSERT INTO product_multiview_revisions (
  product_idea_id, user_id, revision_number, batch_id,
  view_type, image_url, edit_prompt, edit_type, is_active
)
SELECT 
  $1, $2, mr.next_revision, nb.batch_id,
  v.view_type, v.image_url, $3, 'ai_edit', true
FROM (
  VALUES 
    ('front', $4),
    ('back', $5),
    ('side', $6)
) AS v(view_type, image_url)
CROSS JOIN new_batch nb
CROSS JOIN max_revision mr
RETURNING *;
\`\`\`

## User Analytics Queries

### User Activity Summary

\`\`\`sql
-- Get user activity statistics
SELECT 
  u.id,
  u.full_name,
  u.email,
  u.credits::integer as credits_balance,
  COUNT(DISTINCT pi.id) as total_products,
  COUNT(DISTINCT pmr.id) as total_revisions,
  COUNT(DISTINCT r.id) as total_rfqs,
  MAX(pi.created_at) as last_product_created,
  MAX(pmr.created_at) as last_revision_created
FROM users u
LEFT JOIN product_ideas pi ON pi.user_id = u.id
LEFT JOIN product_multiview_revisions pmr ON pmr.user_id = u.id
LEFT JOIN creator_profile cp ON cp.user_id = u.id
LEFT JOIN rfq r ON r.creator_id = cp.id
WHERE u.id = $1
GROUP BY u.id, u.full_name, u.email, u.credits;
\`\`\`

### Credit Usage Report

\`\`\`sql
-- Track credit usage over time
WITH credit_usage AS (
  SELECT 
    DATE_TRUNC('day', created_at) as usage_date,
    COUNT(*) * 3 as credits_used, -- 3 credits per generation
    'image_generation' as usage_type
  FROM product_multiview_revisions
  WHERE user_id = $1
    AND edit_type IN ('ai_edit', 'generated')
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY DATE_TRUNC('day', created_at)
)
SELECT 
  usage_date,
  usage_type,
  credits_used,
  SUM(credits_used) OVER (ORDER BY usage_date) as cumulative_usage
FROM credit_usage
ORDER BY usage_date DESC;
\`\`\`

### Top Creators Dashboard

\`\`\`sql
-- Get top creators by activity
SELECT 
  u.id,
  u.full_name,
  cp.avatar_url,
  cp.country,
  COUNT(DISTINCT pi.id) as products_created,
  COUNT(DISTINCT pmr.id) FILTER (WHERE pmr.edit_type = 'ai_edit') as ai_edits,
  COUNT(DISTINCT r.id) as rfqs_created,
  AVG(pmr.generation_time_ms) as avg_generation_time
FROM users u
JOIN creator_profile cp ON cp.user_id = u.id
LEFT JOIN product_ideas pi ON pi.user_id = u.id
LEFT JOIN product_multiview_revisions pmr ON pmr.user_id = u.id
LEFT JOIN rfq r ON r.creator_id = cp.id
WHERE pi.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.full_name, cp.avatar_url, cp.country
ORDER BY products_created DESC
LIMIT 10;
\`\`\`

## RFQ & Order Queries

### Active RFQs with Quote Count

\`\`\`sql
-- Get RFQs with supplier engagement
SELECT 
  r.*,
  pi.tech_pack->>'title' as product_title,
  COUNT(DISTINCT srq.supplier_id) as interested_suppliers,
  COUNT(DISTINCT sq.id) as quotes_received,
  MIN(sq.sample_price::numeric) as lowest_quote,
  MAX(sq.sample_price::numeric) as highest_quote
FROM rfq r
JOIN product_ideas pi ON pi.id = r.techpack_id
LEFT JOIN supplier_rfqs srq ON srq.rfqs_id = r.id
LEFT JOIN supplier_rfqs_quotes sq ON sq.rfq_id = r.id
WHERE r.status = 'open'
  AND r.creator_id = $1
GROUP BY r.id, pi.tech_pack
ORDER BY r.created_at DESC;
\`\`\`

### Supplier Matching

\`\`\`sql
-- Find suppliers matching RFQ requirements
WITH rfq_requirements AS (
  SELECT 
    r.id,
    pi.tech_pack->>'category' as product_category,
    r.quantity,
    r.timeline
  FROM rfq r
  JOIN product_ideas pi ON pi.id = r.techpack_id
  WHERE r.id = $1
)
SELECT 
  sp.*,
  mc.moq,
  mc.leadTimeMin,
  mc.leadTimeMax,
  mc.certifications,
  CASE 
    WHEN rr.product_category = ANY(mc.product_categories) THEN 100
    ELSE 0
  END as category_match_score
FROM supplier_profile sp
JOIN manufacturing_capabilities mc ON mc.id = sp.manufacturingID
CROSS JOIN rfq_requirements rr
WHERE 
  rr.product_category = ANY(mc.product_categories)
  OR mc.product_categories @> ARRAY['all']::text[]
ORDER BY category_match_score DESC;
\`\`\`

### Order Fulfillment Status

\`\`\`sql
-- Track order fulfillment pipeline
SELECT 
  od.order_number,
  od.customer_name,
  od.delivery_date,
  pi.tech_pack->>'title' as product_name,
  jsonb_agg(
    jsonb_build_object(
      'size', oi.size,
      'color', oi.color,
      'quantity', oi.quantity,
      'unit_price', oi.unit_price
    )
  ) as items,
  SUM(oi.quantity::integer * oi.unit_price::numeric) as total_value
FROM order_details od
JOIN order_items oi ON oi.order_detail_id = od.id
JOIN product_ideas pi ON pi.id = od.tech_pack_id
WHERE od.user_id = $1
GROUP BY 
  od.order_number,
  od.customer_name,
  od.delivery_date,
  pi.tech_pack
ORDER BY od.created_at DESC;
\`\`\`

## Performance Optimized Queries

### Cached Image Analysis

\`\`\`sql
-- Use cached analysis with fallback
WITH cached_analysis AS (
  SELECT 
    image_url,
    analysis_data,
    created_at,
    expires_at
  FROM image_analysis_cache
  WHERE image_url = $1
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1
)
SELECT 
  COALESCE(
    (SELECT analysis_data FROM cached_analysis),
    jsonb_build_object('status', 'not_cached')
  ) as analysis,
  EXISTS(SELECT 1 FROM cached_analysis) as is_cached;
\`\`\`

### Bulk Update with Conflict Resolution

\`\`\`sql
-- Bulk upsert with ON CONFLICT
INSERT INTO product_multiview_revisions (
  product_idea_id, user_id, view_type, 
  image_url, revision_number, is_active
)
SELECT * FROM (
  VALUES 
    ($1, $2, 'front', $3, 1, true),
    ($1, $2, 'back', $4, 1, true),
    ($1, $2, 'side', $5, 1, true)
) AS v(product_idea_id, user_id, view_type, image_url, revision_number, is_active)
ON CONFLICT (product_idea_id, view_type, revision_number) 
DO UPDATE SET 
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active,
  updated_at = NOW()
WHERE product_multiview_revisions.is_deleted = false;
\`\`\`

### Optimized Revision Cleanup

\`\`\`sql
-- Archive old revisions efficiently
WITH revisions_to_archive AS (
  SELECT id
  FROM product_multiview_revisions
  WHERE is_deleted = true
    AND deleted_at < NOW() - INTERVAL '30 days'
  LIMIT 1000
)
DELETE FROM product_multiview_revisions
WHERE id IN (SELECT id FROM revisions_to_archive)
RETURNING id;
\`\`\`

## Maintenance Queries

### Database Health Check

\`\`\`sql
-- Check table sizes and bloat
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
\`\`\`

### Find Orphaned Records

\`\`\`sql
-- Find orphaned revisions
SELECT pmr.*
FROM product_multiview_revisions pmr
LEFT JOIN product_ideas pi ON pi.id = pmr.product_idea_id
WHERE pi.id IS NULL;

-- Find orphaned cache entries
SELECT iac.*
FROM image_analysis_cache iac
LEFT JOIN product_multiview_revisions pmr ON pmr.id = iac.revision_id
WHERE iac.revision_id IS NOT NULL
  AND pmr.id IS NULL;
\`\`\`

### Index Usage Statistics

\`\`\`sql
-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
\`\`\`

### Slow Query Analysis

\`\`\`sql
-- Find slow queries (requires pg_stat_statements)
SELECT 
  substring(query, 1, 100) as query_preview,
  calls,
  round(total_time::numeric, 2) as total_time_ms,
  round(mean_time::numeric, 2) as mean_time_ms,
  round(max_time::numeric, 2) as max_time_ms,
  rows
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_time DESC
LIMIT 20;
\`\`\`

### Data Integrity Checks

\`\`\`sql
-- Check for duplicate active revisions
SELECT 
  product_idea_id,
  view_type,
  COUNT(*) as active_count
FROM product_multiview_revisions
WHERE is_active = true
  AND is_deleted = false
GROUP BY product_idea_id, view_type
HAVING COUNT(*) > 1;

-- Check for missing images
SELECT *
FROM product_multiview_revisions
WHERE image_url IS NULL
  OR image_url = ''
  AND is_deleted = false;
\`\`\`

### Cleanup Expired Data

\`\`\`sql
-- Clean expired cache
DELETE FROM image_analysis_cache
WHERE expires_at < NOW()
  AND expires_at IS NOT NULL;

-- Clean old notifications
DELETE FROM notifications
WHERE created_at < NOW() - INTERVAL '90 days'
  AND read = true;

-- Clean old AI logs
DELETE FROM ai_logs
WHERE timestamp < NOW() - INTERVAL '180 days';
\`\`\`

## Advanced Patterns

### Recursive CTE for Revision Tree

\`\`\`sql
-- Build complete revision tree
WITH RECURSIVE revision_tree AS (
  -- Base case: original revisions
  SELECT 
    id,
    product_idea_id,
    revision_number,
    parent_revision_id,
    edit_prompt,
    created_at,
    ARRAY[id] as path,
    0 as depth
  FROM product_multiview_revisions
  WHERE parent_revision_id IS NULL
    AND product_idea_id = $1
  
  UNION ALL
  
  -- Recursive case
  SELECT 
    r.id,
    r.product_idea_id,
    r.revision_number,
    r.parent_revision_id,
    r.edit_prompt,
    r.created_at,
    rt.path || r.id,
    rt.depth + 1
  FROM product_multiview_revisions r
  JOIN revision_tree rt ON r.parent_revision_id = rt.id
)
SELECT * FROM revision_tree
ORDER BY depth, created_at;
\`\`\`

### Window Functions for Analytics

\`\`\`sql
-- Analyze generation patterns
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as generations,
  AVG(generation_time_ms) as avg_time_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY generation_time_ms) as median_time_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY generation_time_ms) as p95_time_ms,
  LAG(COUNT(*), 1) OVER (ORDER BY DATE_TRUNC('hour', created_at)) as prev_hour_count,
  ROUND(
    100.0 * (COUNT(*) - LAG(COUNT(*), 1) OVER (ORDER BY DATE_TRUNC('hour', created_at))) / 
    NULLIF(LAG(COUNT(*), 1) OVER (ORDER BY DATE_TRUNC('hour', created_at)), 0),
    2
  ) as growth_rate
FROM product_multiview_revisions
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;
\`\`\`

### JSONB Aggregation for Reports

\`\`\`sql
-- Build comprehensive product report
SELECT jsonb_build_object(
  'product', jsonb_build_object(
    'id', pi.id,
    'title', pi.tech_pack->>'title',
    'created_at', pi.created_at
  ),
  'statistics', jsonb_build_object(
    'total_revisions', COUNT(DISTINCT pmr.id),
    'ai_edits', COUNT(DISTINCT pmr.id) FILTER (WHERE pmr.edit_type = 'ai_edit'),
    'unique_batches', COUNT(DISTINCT pmr.batch_id),
    'avg_generation_time', AVG(pmr.generation_time_ms)
  ),
  'current_images', (
    SELECT jsonb_object_agg(view_type, image_url)
    FROM product_multiview_revisions
    WHERE product_idea_id = pi.id
      AND is_active = true
      AND is_deleted = false
  ),
  'revision_timeline', (
    SELECT jsonb_agg(
      jsonb_build_object(
        'revision', revision_number,
        'date', created_at,
        'prompt', edit_prompt
      ) ORDER BY revision_number
    )
    FROM (
      SELECT DISTINCT ON (revision_number)
        revision_number,
        created_at,
        edit_prompt
      FROM product_multiview_revisions
      WHERE product_idea_id = pi.id
      ORDER BY revision_number, created_at
    ) r
  )
) as report
FROM product_ideas pi
LEFT JOIN product_multiview_revisions pmr ON pmr.product_idea_id = pi.id
WHERE pi.id = $1
GROUP BY pi.id;
\`\`\`

---

*Last Updated: January 2025*
*PostgreSQL Version: 15*
*Supabase Compatible*
