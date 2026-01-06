# Genpire Database Schema Documentation

## Overview

The Genpire platform uses PostgreSQL with Supabase as the backend database. The schema is designed to support AI-powered fashion tech pack generation, multi-view product editing, creator-supplier collaboration, and comprehensive revision tracking.

## Database Architecture

### Core Design Principles

1. **UUID Primary Keys**: All tables use UUID for primary keys ensuring globally unique identifiers
2. **Soft Deletes**: Critical data uses soft delete patterns with `is_deleted` and `deleted_at` fields
3. **Audit Trail**: Comprehensive timestamp tracking with `created_at` and `updated_at` fields
4. **JSONB Storage**: Flexible data storage for AI responses, metadata, and dynamic content
5. **Foreign Key Integrity**: Strict referential integrity with proper cascade rules

## Table Categories

### 1. User Management
- `users` - Core user accounts
- `creator_profile` - Creator/designer profiles
- `supplier_profile` - Manufacturer/supplier profiles

### 2. Product & AI Generation
- `product_ideas` - Main product/tech pack storage
- `product_multiview_revisions` - Multi-view image revision tracking
- `product_image_revisions` - Single image revision history
- `image_analysis_cache` - AI analysis caching
- `product_view_approvals` - View approval workflow

### 3. Communication & Collaboration
- `chats` - Chat conversations
- `messages` - Chat messages
- `notifications` - System notifications
- `requests` - Creator-supplier connection requests

### 4. RFQ & Orders
- `rfq` - Request for quotation
- `supplier_rfqs` - Supplier RFQ associations
- `supplier_rfqs_quotes` - Supplier quotations
- `order_details` - Order information
- `order_items` - Order line items

### 5. Business & Manufacturing
- `manufacturing_capabilities` - Factory capabilities
- `brand_dna` - Brand identity information
- `payments` - Payment records

### 6. System & Analytics
- `ai_logs` - AI operation logging
- `view_revision_history` - View change tracking

## Detailed Table Documentation

### Core User Tables

#### `users`
Primary user authentication and account table.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, DEFAULT auth.uid() |
| email | text | User email | NOT NULL, UNIQUE |
| full_name | text | User's full name | |
| credits | text | Credit balance | DEFAULT '0' |
| verified_status | boolean | Email verification | DEFAULT false |
| created_at | timestamp | Account creation | DEFAULT now() |
| updated_at | timestamp | Last update | |

**Key Relationships:**
- Referenced by: All user-related tables via foreign keys
- One-to-one: `creator_profile`, `supplier_profile`
- One-to-many: `product_ideas`, `messages`, `notifications`

#### `creator_profile`
Designer/brand creator extended profile.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, DEFAULT gen_random_uuid() |
| user_id | uuid | Link to users table | FK → users(id) |
| full_name | text | Creator name | |
| role | text | User role | DEFAULT 'creator' |
| avatar_url | text | Profile picture URL | |
| country | text | Location country | |
| categories | text | Product categories | |
| bio | text | Creator biography | |
| brand_description | text | Brand details | |
| target_market | text | Target audience | |
| created_at | timestamp | Profile creation | DEFAULT now() |

#### `supplier_profile`
Manufacturer/supplier extended profile.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, DEFAULT gen_random_uuid() |
| user_id | uuid | Link to users table | FK → users(id) |
| company_name | text | Company name | |
| location | text | Factory location | |
| website | text | Company website | |
| company_description | text | About company | |
| manufacturingID | uuid | Manufacturing capabilities | FK → manufacturing_capabilities(id) |
| company_logo | text | Logo URL | |

### Product & AI Generation Tables

#### `product_ideas`
Core table for AI-generated tech packs and product concepts.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, DEFAULT gen_random_uuid() |
| user_id | uuid | Owner | FK → users(id), DEFAULT auth.uid() |
| prompt | text | Original generation prompt | |
| tech_pack | jsonb | Complete tech pack data | |
| image_data | jsonb | Generated images | |
| technical_images | jsonb | Technical drawings | |
| status | text | Generation status | |
| created_at | timestamp | Creation time | |
| updated_at | timestamp | Last update | DEFAULT now() |

**JSONB Structure - tech_pack:**
\`\`\`json
{
  "title": "Product name",
  "description": "Product description",
  "category": "Product category",
  "materials": ["Material 1", "Material 2"],
  "colors": ["Color 1", "Color 2"],
  "sizes": ["S", "M", "L", "XL"],
  "measurements": {},
  "construction_details": {},
  "care_instructions": [],
  "packaging": {},
  "cost_breakdown": {}
}
\`\`\`

#### `product_multiview_revisions`
Tracks all revisions for multi-view product images (front, back, side views).

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, DEFAULT gen_random_uuid() |
| product_idea_id | uuid | Parent product | FK → product_ideas(id) |
| user_id | uuid | Creator | FK → users(id) |
| revision_number | integer | Version number | NOT NULL, DEFAULT 0 |
| batch_id | text | Group multiple views | |
| view_type | text | View angle | CHECK IN ('front','back','side','bottom','illustration') |
| image_url | text | Image URL | NOT NULL |
| thumbnail_url | text | Thumbnail URL | |
| edit_prompt | text | AI edit instructions | |
| edit_type | text | Edit category | CHECK IN ('initial','ai_edit','manual_upload','rollback','generated') |
| ai_model | text | AI model used | DEFAULT 'gemini-2.5-flash-image-preview' |
| ai_parameters | jsonb | AI generation params | |
| generation_time_ms | integer | Processing time | |
| is_active | boolean | Current version flag | DEFAULT false |
| is_deleted | boolean | Soft delete flag | DEFAULT false |
| deleted_at | timestamp | Deletion timestamp | |
| metadata | jsonb | Additional data | |
| image_analysis | jsonb | AI analysis results | |

**Key Features:**
- Soft delete support with `is_deleted` and `deleted_at`
- Batch operations via `batch_id` for grouping related edits
- Complete audit trail with revision numbers
- AI model tracking for reproducibility

#### `image_analysis_cache`
Caches AI image analysis to reduce API calls and improve performance.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, DEFAULT gen_random_uuid() |
| image_url | text | Analyzed image | UNIQUE, NOT NULL |
| image_hash | text | Image fingerprint | |
| analysis_data | jsonb | Analysis results | NOT NULL |
| analysis_prompt | text | Analysis instructions | |
| model_used | text | AI model | DEFAULT 'gpt-4o' |
| product_idea_id | uuid | Related product | FK → product_ideas(id) |
| revision_id | uuid | Related revision | FK → product_multiview_revisions(id) |
| tokens_used | integer | API tokens consumed | |
| processing_time_ms | integer | Analysis duration | |
| confidence_score | float | Result confidence | |
| expires_at | timestamp | Cache expiration | |

### Communication Tables

#### `chats`
Chat conversation containers.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, DEFAULT gen_random_uuid() |
| participant_1 | uuid | First participant | FK → users(id) |
| participant_2 | uuid | Second participant | FK → users(id) |
| created_at | timestamp | Chat creation | DEFAULT now() |

#### `messages`
Individual chat messages.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, DEFAULT gen_random_uuid() |
| chats | uuid | Parent chat | FK → chats(id) |
| sender_id | uuid | Message sender | FK → users(id) |
| message | text | Message content | NOT NULL |
| created_at | timestamp | Send time | DEFAULT now() |

#### `notifications`
System notifications and alerts.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, DEFAULT gen_random_uuid() |
| senderId | uuid | Notification source | FK → users(id) |
| receiverId | uuid | Recipient | FK → users(id) |
| title | text | Notification title | NOT NULL |
| message | text | Notification body | NOT NULL |
| read | boolean | Read status | DEFAULT false |
| type | enum | Notification type | User-defined type |
| created_at | timestamp | Creation time | DEFAULT now() |

### RFQ & Order Management

#### `rfq`
Request for quotation management.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, DEFAULT gen_random_uuid() |
| title | text | RFQ title | NOT NULL |
| product_idea | text | Product description | NOT NULL |
| techpack_id | uuid | Related tech pack | FK → product_ideas(id) |
| timeline | text | Delivery timeline | NOT NULL |
| quantity | text | Order quantity | NOT NULL |
| target_price | text | Target unit price | NOT NULL |
| creator_id | uuid | RFQ creator | FK → creator_profile(id) |
| status | enum | RFQ status | DEFAULT 'open', CHECK rfq_status type |
| created_at | timestamp | Creation time | DEFAULT now() |
| updated_at | timestamp | Last update | DEFAULT now() |

#### `supplier_rfqs_quotes`
Supplier responses to RFQs.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, DEFAULT gen_random_uuid() |
| rfq_id | uuid | Parent RFQ | FK → rfq(id) |
| supplier_id | uuid | Quoting supplier | FK → supplier_profile(id) |
| sample_price | text | Sample cost | |
| moq | text | Minimum order quantity | |
| lead_time | text | Production timeline | |
| message | text | Quote details | |
| status | enum | Quote status | DEFAULT 'awaiting' |

### Manufacturing & Business

#### `manufacturing_capabilities`
Factory and supplier manufacturing capabilities.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, DEFAULT gen_random_uuid() |
| product_categories | array | Supported categories | |
| material_specialist | array | Material expertise | |
| moq | text | Minimum order quantity | |
| leadTimeMin | text | Minimum lead time | |
| leadTimeMax | text | Maximum lead time | |
| certifications | array | Factory certifications | |
| productionCapacity | text | Monthly capacity | |
| aboutFactory | text | Factory description | |
| product_images | array | Sample product images | |
| factory_gallery | array | Factory photos | |

#### `brand_dna`
Brand identity and guidelines storage.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, DEFAULT gen_random_uuid() |
| user_id | uuid | Brand owner | FK → users(id) |
| creator_id | uuid | Creator profile | FK → creator_profile(id) |
| brand_name | text | Brand name | |
| category | text | Brand category | |
| tagline | text | Brand tagline | |
| colors | array | Brand colors | |
| style_keyword | array | Style keywords | |
| materials | array | Preferred materials | |
| mood_board | array | Mood board images | |
| tone_values | text | Brand tone/voice | |
| restrictions | text | Design restrictions | |

### System & Analytics

#### `ai_logs`
Comprehensive AI operation logging for debugging and analytics.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key | PK, DEFAULT gen_random_uuid() |
| timestamp | timestamp | Log time | DEFAULT now() |
| model | text | AI model name | NOT NULL |
| provider | text | AI provider | CHECK IN ('openai','gemini','dalle','other') |
| function_name | text | Called function | NOT NULL |
| operation_type | text | Operation category | CHECK IN ('text_generation','image_generation','vision_analysis','embedding','moderation') |
| input | jsonb | Request data | DEFAULT '{}' |
| output | jsonb | Response data | DEFAULT '{}' |
| performance | jsonb | Performance metrics | DEFAULT '{}' |
| context | jsonb | Additional context | DEFAULT '{}' |

## Key Relationships Diagram

\`\`\`
users
├── creator_profile (1:1)
│   ├── brand_dna (1:n)
│   ├── rfq (1:n)
│   └── requests (1:n)
├── supplier_profile (1:1)
│   ├── manufacturing_capabilities (1:1)
│   ├── supplier_rfqs (1:n)
│   └── supplier_rfqs_quotes (1:n)
├── product_ideas (1:n)
│   ├── product_multiview_revisions (1:n)
│   ├── product_image_revisions (1:n)
│   ├── image_analysis_cache (1:n)
│   └── order_items (1:n)
├── chats (participant) (1:n)
├── messages (1:n)
├── notifications (1:n)
└── payments (1:n)
\`\`\`

## Common Query Patterns

### Get Active Product Revisions
\`\`\`sql
SELECT * FROM product_multiview_revisions
WHERE product_idea_id = $1
  AND is_active = true
  AND is_deleted = false
ORDER BY view_type;
\`\`\`

### Get User's Tech Packs with Latest Revisions
\`\`\`sql
SELECT 
  pi.*,
  pmr.image_url as front_image,
  pmr.revision_number
FROM product_ideas pi
LEFT JOIN product_multiview_revisions pmr ON 
  pmr.product_idea_id = pi.id 
  AND pmr.view_type = 'front'
  AND pmr.is_active = true
WHERE pi.user_id = $1
ORDER BY pi.created_at DESC;
\`\`\`

### Get Supplier Quotes for RFQ
\`\`\`sql
SELECT 
  srq.*,
  sp.company_name,
  sp.location
FROM supplier_rfqs_quotes srq
JOIN supplier_profile sp ON sp.id = srq.supplier_id
WHERE srq.rfq_id = $1
ORDER BY srq.created_at DESC;
\`\`\`

## Indexing Strategy

### Recommended Indexes
\`\`\`sql
-- Performance critical indexes
CREATE INDEX idx_product_ideas_user_id ON product_ideas(user_id);
CREATE INDEX idx_multiview_revisions_product_active ON product_multiview_revisions(product_idea_id, is_active) WHERE is_deleted = false;
CREATE INDEX idx_image_cache_url ON image_analysis_cache(image_url);
CREATE INDEX idx_messages_chat_created ON messages(chats, created_at DESC);
CREATE INDEX idx_notifications_receiver_read ON notifications(receiverId, read);

-- Composite indexes for common queries
CREATE INDEX idx_revisions_product_view_active ON product_multiview_revisions(product_idea_id, view_type, is_active);
CREATE INDEX idx_rfq_creator_status ON rfq(creator_id, status);
\`\`\`

## Best Practices

### 1. Data Integrity
- Always use transactions for multi-table operations
- Implement proper foreign key constraints
- Use CHECK constraints for enum-like fields
- Maintain soft delete consistency

### 2. Performance
- Cache frequently accessed data in `image_analysis_cache`
- Use JSONB GIN indexes for JSON queries
- Implement pagination for large result sets
- Consider materialized views for complex reports

### 3. Security
- Use Row Level Security (RLS) policies
- Sanitize all user inputs
- Encrypt sensitive data
- Audit all data modifications

### 4. Revision Management
- Always create new revisions, never update
- Maintain parent-child relationships
- Track all AI parameters for reproducibility
- Implement batch operations for related changes

## Migration Guidelines

### Adding New Tables
1. Use UUID primary keys
2. Include created_at and updated_at timestamps
3. Add appropriate foreign key constraints
4. Consider soft delete requirements
5. Document JSONB structures

### Modifying Existing Tables
1. Always create migrations, never modify directly
2. Maintain backward compatibility
3. Update related documentation
4. Test with existing data
5. Plan for rollback scenarios

## API Integration

### Supabase Client Setup
\`\`\`typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
\`\`\`

### Common Operations

#### Create Product with Revisions
\`\`\`typescript
// Start transaction
const { data: product, error: productError } = await supabase
  .from('product_ideas')
  .insert({
    user_id: userId,
    prompt: userPrompt,
    tech_pack: techPackData,
    status: 'generated'
  })
  .select()
  .single();

// Create initial revisions
const revisions = ['front', 'back', 'side'].map(view => ({
  product_idea_id: product.id,
  user_id: userId,
  view_type: view,
  image_url: images[view],
  revision_number: 0,
  edit_type: 'initial',
  is_active: true
}));

const { error: revisionError } = await supabase
  .from('product_multiview_revisions')
  .insert(revisions);
\`\`\`

#### Soft Delete Revision
\`\`\`typescript
const { error } = await supabase
  .from('product_multiview_revisions')
  .update({
    is_deleted: true,
    deleted_at: new Date().toISOString(),
    deleted_by: userId
  })
  .eq('id', revisionId);
\`\`\`

## Monitoring & Maintenance

### Key Metrics to Track
1. AI operation costs via `ai_logs`
2. Cache hit rates in `image_analysis_cache`
3. Revision creation patterns
4. User engagement metrics
5. RFQ conversion rates

### Regular Maintenance Tasks
1. Clean expired cache entries
2. Archive old soft-deleted records
3. Optimize JSONB field sizes
4. Update statistics for query planner
5. Monitor index usage and bloat

## Troubleshooting

### Common Issues

#### 1. Slow Queries
- Check for missing indexes
- Analyze query execution plans
- Consider query optimization
- Review JSONB query patterns

#### 2. Data Integrity Issues
- Verify foreign key constraints
- Check for orphaned records
- Validate JSONB structures
- Review transaction boundaries

#### 3. Storage Growth
- Monitor JSONB field sizes
- Implement data archival
- Compress image URLs
- Clean up soft-deleted records

## Version History

- **v1.0** - Initial schema design
- **v1.1** - Added multi-view revision system
- **v1.2** - Implemented soft delete patterns
- **v1.3** - Added AI logging and caching
- **v1.4** - Enhanced RFQ and order management

---

*Last Updated: January 2025*
*Database Version: PostgreSQL 15 with Supabase*
