# Tech Files Migration Guide

## Quick Start

### Option 1: Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `create_tech_files_table.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Wait for completion (should take 2-5 seconds)

### Option 2: Supabase CLI

```bash
# Make sure you're in the project root
cd /path/to/Genpire

# Apply the migration
supabase db push

# Or apply specific file
supabase db execute -f supabase/migrations/create_tech_files_table.sql
```

### Option 3: Direct psql Connection

```bash
# Get your database connection string from Supabase dashboard
# Settings > Database > Connection string (URI)

psql "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres" \
  -f supabase/migrations/create_tech_files_table.sql
```

## Verification

After applying the migration, verify the tables were created:

```sql
-- Check all tech_files tables exist
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'tech_%'
ORDER BY tablename;

-- Expected output:
-- tech_file_collection_items
-- tech_file_collections
-- tech_file_versions
-- tech_files
```

### Verify Table Structure

```sql
-- Check tech_files table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tech_files'
ORDER BY ordinal_position;
```

### Verify Triggers

```sql
-- Check triggers exist
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN (
  'tech_files',
  'tech_file_collections'
);

-- Expected triggers:
-- tech_files_updated_at on tech_files
-- tech_file_collections_updated_at on tech_file_collections
-- archive_old_versions on tech_files
```

### Verify Functions

```sql
-- Check functions exist
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%tech%'
ORDER BY routine_name;

-- Expected functions:
-- archive_old_tech_file_versions
-- create_tech_file_version
-- update_tech_files_updated_at
```

### Verify RLS Policies

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'tech_%';

-- All should have rowsecurity = true

-- Check policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename LIKE 'tech_%'
ORDER BY tablename, cmd;
```

## Test the Migration

### 1. Test Creating a Tech File

```sql
-- Insert a test file
INSERT INTO tech_files (
  product_idea_id,
  user_id,
  file_type,
  view_type,
  file_url,
  analysis_data,
  status,
  credits_used
) VALUES (
  'test-product-id',
  auth.uid(), -- Or use a specific user ID
  'base_view',
  'front',
  'https://example.com/test.png',
  '{"test": true}'::jsonb,
  'completed',
  1
)
RETURNING *;

-- Clean up test data
DELETE FROM tech_files WHERE product_idea_id = 'test-product-id';
```

### 2. Test Version Creation Function

```sql
-- Create a tech file first
INSERT INTO tech_files (
  product_idea_id,
  user_id,
  file_type,
  file_url,
  analysis_data,
  status
) VALUES (
  'test-product',
  auth.uid(),
  'base_view',
  'https://example.com/test.png',
  '{"version": 1}'::jsonb,
  'completed'
)
RETURNING id;

-- Use the returned ID to create a version
SELECT create_tech_file_version(
  'file-id-from-above'::uuid,
  auth.uid(),
  'Test version creation'
);

-- Clean up
DELETE FROM tech_files WHERE product_idea_id = 'test-product';
```

### 3. Test Collections

```sql
-- Create a collection
INSERT INTO tech_file_collections (
  product_idea_id,
  user_id,
  collection_name,
  collection_type,
  status
) VALUES (
  'test-product',
  auth.uid(),
  'Test Collection',
  'tech_pack_v2',
  'processing'
)
RETURNING id;

-- Clean up
DELETE FROM tech_file_collections WHERE product_idea_id = 'test-product';
```

## Rollback (If Needed)

If you need to remove the tables:

```sql
-- WARNING: This will delete all data in these tables!
DROP TABLE IF EXISTS tech_file_collection_items CASCADE;
DROP TABLE IF EXISTS tech_file_versions CASCADE;
DROP TABLE IF EXISTS tech_file_collections CASCADE;
DROP TABLE IF EXISTS tech_files CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS create_tech_file_version CASCADE;
DROP FUNCTION IF EXISTS archive_old_tech_file_versions CASCADE;
DROP FUNCTION IF EXISTS update_tech_files_updated_at CASCADE;
```

## Troubleshooting

### Error: "relation already exists"

The tables already exist. You can either:
1. Drop the existing tables (see Rollback section)
2. Skip this migration if tables are correct

### Error: "permission denied"

You need admin/service role permissions. Use:
- Supabase Dashboard SQL Editor (has proper permissions)
- Service role key in your application

### Error: "function auth.uid() does not exist"

You're using a connection that doesn't have auth context. Use a specific user ID instead:
```sql
-- Instead of auth.uid()
'your-user-id-here'::uuid
```

### Trigger Not Firing

Check trigger exists and is enabled:
```sql
SELECT * FROM pg_trigger
WHERE tgname LIKE '%tech%';
```

## Post-Migration Checklist

- [ ] All 4 tables created successfully
- [ ] All triggers are active
- [ ] All functions are created
- [ ] RLS is enabled on all tables
- [ ] RLS policies are in place
- [ ] Test file creation works
- [ ] Test version creation works
- [ ] Test collection creation works
- [ ] Application code updated to use new tables
- [ ] Service layer functions tested

## Next Steps

After successful migration:

1. **Update Application Code**: Ensure all tech pack generation code uses the new `tech_files` tables
2. **Test in Development**: Create a few tech packs to verify everything works
3. **Monitor Performance**: Check query performance with new indexes
4. **Backup**: Take a database backup before deploying to production
5. **Deploy**: Roll out to production with monitoring

## Support

If you encounter issues:

1. Check the verification queries above
2. Review error messages in Supabase logs
3. Consult the TECH_FILES_README.md for usage examples
4. Check RLS policies if you get permission errors

## Migration Notes

- **Backwards Compatible**: The migration includes backwards compatibility by continuing to write to `revision_vision_analysis`
- **Credits Tracking**: All files now track individual credit usage
- **Versioning**: Automatic version archiving via triggers
- **Collections**: New feature for grouping related files
- **No Data Loss**: Existing `revision_vision_analysis` data remains intact
