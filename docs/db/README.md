# Database Documentation

## Overview

This directory contains comprehensive documentation for the Genpire database architecture, API integration patterns, and query examples.

## 📚 Documentation Files

### 1. [Database Schema](./database-schema.md)
Complete database architecture documentation including:
- All 24 tables with detailed column descriptions
- Foreign key relationships and constraints
- JSONB structure examples
- Indexing strategies
- Migration guidelines
- Best practices for data integrity

### 2. [API Integration Guide](./api-integration-guide.md)
Comprehensive guide for integrating with the database through Supabase:
- Authentication setup and client initialization
- Core API endpoints with TypeScript examples
- Real-time subscriptions and presence
- Error handling patterns
- Performance optimization
- Testing strategies

### 3. [Database Queries](./database-queries.md)
Collection of 50+ SQL query examples including:
- Common CRUD patterns
- Product and revision management
- User analytics queries
- RFQ and order management
- Performance optimized queries
- Maintenance and health checks
- Advanced patterns with CTEs

## 🗄️ Quick Reference

### Key Tables

| Table | Purpose |
|-------|---------|
| `users` | Core user authentication |
| `product_ideas` | AI-generated tech packs |
| `product_multiview_revisions` | Image revision tracking |
| `rfq` | Request for quotation |
| `supplier_profile` | Manufacturer profiles |
| `image_analysis_cache` | AI analysis caching |

### Common Operations

#### Get Product with Active Images
\`\`\`sql
SELECT * FROM product_multiview_revisions
WHERE product_idea_id = $1
  AND is_active = true
  AND is_deleted = false;
\`\`\`

#### Create New Revision
\`\`\`typescript
const { data } = await supabase
  .from('product_multiview_revisions')
  .insert({
    product_idea_id,
    view_type,
    image_url,
    edit_type: 'ai_edit',
    is_active: true
  });
\`\`\`

## 🔧 Database Features

### Soft Delete Pattern
- Tables use `is_deleted` and `deleted_at` fields
- Allows data recovery and audit trails
- Maintains referential integrity

### Revision Tracking
- Complete history of all changes
- Batch operations for related edits
- AI model and parameter tracking

### Performance Optimization
- Strategic indexing on common queries
- Image analysis caching
- JSONB for flexible data storage

## 📊 Entity Relationship Overview

\`\`\`
users
├── creator_profile
│   └── product_ideas
│       └── product_multiview_revisions
├── supplier_profile
│   └── manufacturing_capabilities
└── notifications, messages, payments
\`\`\`

## 🚀 Getting Started

1. **Review the Schema**: Start with [database-schema.md](./database-schema.md) to understand the data model
2. **Learn the APIs**: Check [api-integration-guide.md](./api-integration-guide.md) for integration patterns
3. **Query Examples**: Use [database-queries.md](./database-queries.md) as a reference for common operations

## 🔒 Security Considerations

- Row Level Security (RLS) enabled on all tables
- User data isolation through foreign keys
- Soft delete for data recovery
- Comprehensive audit logging

## 📈 Performance Tips

1. Use indexes on frequently queried columns
2. Leverage the image analysis cache
3. Implement pagination for large datasets
4. Use JSONB GIN indexes for JSON queries
5. Monitor slow queries regularly

## 🛠️ Maintenance

Regular maintenance tasks:
- Clean expired cache entries
- Archive old soft-deleted records
- Update table statistics
- Monitor index usage
- Review slow query logs

---

*Last Updated: January 2025*
*Database: PostgreSQL 15 with Supabase*
