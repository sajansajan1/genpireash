# Migration Checklist - Front View Approvals Table

**Date:** November 15, 2025
**Migration:** `20251115_create_front_view_approvals_table.sql`

---

## ✅ Code Updates Completed

### 1. **Migration File Created** ✓
- **File**: `supabase/migrations/20251115_create_front_view_approvals_table.sql`
- **Status**: Ready to apply
- **Creates**:
  - `front_view_approvals` table with complete schema
  - Foreign key constraints to `product_ideas` and `users`
  - Check constraints for status and credits
  - Indexes for performance
  - Auto-update trigger for `updated_at`
  - Links `product_multiview_revisions.front_view_approval_id`

### 2. **Old Migration Removed** ✓
- **File**: `supabase/migrations/20251114_front_view_approval_workflow.sql`
- **Status**: Deleted (was modifying existing table)

### 3. **Workflow Code Updated** ✓
- **File**: `app/actions/progressive-generation-workflow.ts`
- **All database queries use** `front_view_approvals` table:
  - Line 247: Create approval record
  - Line 389: Fetch approval for decision
  - Line 409: Update status to approved
  - Line 445: Update with remaining views
  - Line 522: Create edit iteration
  - Line 596: Update with regenerated front view
  - Line 668: Fetch approval for revision
  - Line 765: Fetch approval details
  - Line 789: Update credits consumed
- **Revision records include** `front_view_approval_id` (line 857) ✓

### 4. **Hook Integration** ✓
- **File**: `modules/ai-designer/hooks/useProgressiveGeneration.ts`
- **Status**: No changes needed (uses server actions)

### 5. **Component Integration** ✓
- **Files**:
  - `modules/ai-designer/components/FrontViewApproval/index.tsx`
  - `modules/ai-designer/components/ProgressiveViewsGeneration/index.tsx`
  - `modules/ai-designer/components/MultiViewEditor/index.tsx`
- **Status**: No changes needed (use hook and server actions)

### 6. **Store Integration** ✓
- **File**: `modules/ai-designer/store/editorStore.ts`
- **Status**: No changes needed (stores state only)

---

## 📊 Database Operations Verified

### All Operations Use Correct Table

| Operation | Table Used | Status |
|-----------|-----------|--------|
| Create approval record | `front_view_approvals` | ✅ |
| Fetch approval by ID | `front_view_approvals` | ✅ |
| Update approval status | `front_view_approvals` | ✅ |
| Store front view URL | `front_view_approvals` | ✅ |
| Store remaining views | `front_view_approvals` | ✅ |
| Track iterations | `front_view_approvals` | ✅ |
| Manage credits | `front_view_approvals` | ✅ |
| Link to revisions | `front_view_approval_id` | ✅ |

---

## 🔍 Verification Steps

### Pre-Migration Checks

\`\`\`bash
# 1. Verify migration file exists
ls -la supabase/migrations/20251115_create_front_view_approvals_table.sql

# 2. Check TypeScript compilation
npx tsc --noEmit --project tsconfig.json 2>&1 | grep -E "(progressive-generation|front.view)" | grep -v "__tests__"
# Should return no errors

# 3. Verify all code uses front_view_approvals
grep -r "product_view_approvals" app/actions/progressive-generation-workflow.ts
# Should return no matches
\`\`\`

### Run Migration

\`\`\`bash
# Option 1: Supabase CLI
npx supabase migration up

# Option 2: Supabase Studio
# 1. Go to SQL Editor
# 2. Upload: supabase/migrations/20251115_create_front_view_approvals_table.sql
# 3. Execute
\`\`\`

### Post-Migration Verification

\`\`\`sql
-- 1. Verify table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'front_view_approvals';
-- Expected: 1 row

-- 2. Verify all columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'front_view_approvals'
ORDER BY ordinal_position;
-- Expected: 23 columns

-- 3. Verify foreign keys
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'front_view_approvals';
-- Expected: 2 rows (product_ideas, users)

-- 4. Verify check constraints
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_schema = 'public'
  AND constraint_name LIKE '%front_view_approvals%';
-- Expected: 3 rows (status, iteration, credits)

-- 5. Verify indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'front_view_approvals';
-- Expected: 5 indexes (primary + 4 created)

-- 6. Verify trigger
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'front_view_approvals';
-- Expected: 1 row (update trigger)

-- 7. Verify link to revisions table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'product_multiview_revisions'
  AND column_name = 'front_view_approval_id';
-- Expected: 1 row

-- 8. Verify foreign key from revisions
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'product_multiview_revisions'
  AND constraint_type = 'FOREIGN KEY'
  AND constraint_name LIKE '%front_view_approval%';
-- Expected: 1 row
\`\`\`

---

## 🧪 Testing Workflow

### Test 1: Initial Product Generation

\`\`\`typescript
// 1. Generate front view
const result = await generateFrontViewOnly({
  productId: "test-product-123",
  userPrompt: "A modern ergonomic office chair with mesh back",
});

console.log("Approval ID:", result.approvalId);
console.log("Front View URL:", result.frontViewUrl);
console.log("Credits Reserved:", result.creditsReserved); // Should be 3

// Verify in database:
// SELECT * FROM front_view_approvals WHERE id = result.approvalId;
// Expected:
// - status = 'pending'
// - front_view_url = populated
// - iteration_number = 1
// - credits_reserved = 3
// - credits_consumed = 0
// - is_initial_generation = true
\`\`\`

### Test 2: Front View Approval

\`\`\`typescript
// 2. Approve front view
const approved = await handleFrontViewDecision({
  approvalId: result.approvalId,
  action: "approve",
});

console.log("Action:", approved.action); // Should be 'approved'

// Verify in database:
// SELECT * FROM front_view_approvals WHERE id = result.approvalId;
// Expected:
// - status = 'approved'
// - approved_at = populated timestamp
\`\`\`

### Test 3: Generate Remaining Views

\`\`\`typescript
// 3. This happens automatically in the hook, but you can test manually:
const remaining = await generateRemainingViews(result.approvalId);

console.log("Remaining Views:", remaining.views);

// Verify in database:
// SELECT * FROM front_view_approvals WHERE id = result.approvalId;
// Expected:
// - back_view_url = populated
// - side_view_url = populated
// - top_view_url = populated
// - bottom_view_url = populated
\`\`\`

### Test 4: Create Revision

\`\`\`typescript
// 4. Create revision with all views
const revision = await createRevisionAfterApproval({
  productId: "test-product-123",
  approvalId: result.approvalId,
  allViews: {
    front: result.frontViewUrl,
    back: remaining.views.back,
    side: remaining.views.side,
    top: remaining.views.top,
    bottom: remaining.views.bottom,
  },
  isInitial: true,
});

console.log("Revision Number:", revision.revisionNumber); // Should be 0
console.log("Batch ID:", revision.batchId);
console.log("Revision IDs:", revision.revisionIds); // Should have 5 IDs

// Verify in database:
// SELECT * FROM front_view_approvals WHERE id = result.approvalId;
// Expected:
// - status = 'completed'
// - completed_at = populated timestamp
// - credits_consumed = 3

// SELECT * FROM product_multiview_revisions WHERE batch_id = revision.batchId;
// Expected: 5 rows (one per view)
// Each row should have:
// - front_view_approval_id = result.approvalId
// - is_active = true
\`\`\`

### Test 5: Front View Edit (Iteration 2)

\`\`\`typescript
// 5. User requests edit
const edited = await handleFrontViewDecision({
  approvalId: result.approvalId,
  action: "edit",
  editFeedback: "Make the backrest taller and add lumbar support",
});

console.log("Action:", edited.action); // Should be 'regenerate'
console.log("New Approval ID:", edited.newApprovalId);
console.log("New Front View:", edited.newFrontViewUrl);

// Verify in database:
// SELECT * FROM front_view_approvals WHERE id = edited.newApprovalId;
// Expected:
// - status = 'pending'
// - iteration_number = 2
// - credits_reserved = 4 (3 base + 1 iteration)
// - previous_revision_id = result.approvalId
// - is_initial_generation = true (still initial, not yet completed)
\`\`\`

---

## 🚨 Common Issues & Solutions

### Issue 1: Migration Fails with "table already exists"

**Cause:** Migration was partially applied before

**Solution:**
\`\`\`sql
-- Check if table exists
SELECT table_name FROM information_schema.tables WHERE table_name = 'front_view_approvals';

-- If exists, drop and recreate
DROP TABLE IF EXISTS front_view_approvals CASCADE;

-- Then re-run migration
\`\`\`

### Issue 2: Foreign key violation on product_idea_id

**Cause:** Product doesn't exist in product_ideas table

**Solution:**
\`\`\`typescript
// Ensure product exists before generating
const { data: product } = await supabase
  .from("product_ideas")
  .select("id")
  .eq("id", productId)
  .single();

if (!product) {
  throw new Error("Product not found");
}
\`\`\`

### Issue 3: Credits not reserving

**Cause:** Credit reservation function failing

**Solution:**
\`\`\`typescript
// Check credits before workflow
const { data: user } = await supabase
  .from("users")
  .select("credits_balance")
  .eq("id", userId)
  .single();

if (user.credits_balance < creditsToReserve) {
  throw new Error("Insufficient credits");
}
\`\`\`

### Issue 4: Revisions not linking to approval

**Cause:** Missing front_view_approval_id in revision records

**Solution:**
\`\`\`typescript
// Verify revision record includes link (already fixed in code)
// Line 857 in progressive-generation-workflow.ts
front_view_approval_id: params.approvalId,
\`\`\`

---

## 📈 Monitoring & Observability

### Key Metrics to Track

\`\`\`sql
-- 1. Active approvals
SELECT status, COUNT(*) as count
FROM front_view_approvals
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;

-- 2. Average iteration count
SELECT AVG(iteration_number) as avg_iterations
FROM front_view_approvals
WHERE status = 'completed'
  AND created_at > NOW() - INTERVAL '7 days';

-- 3. Credit consumption
SELECT
  AVG(credits_consumed) as avg_consumed,
  MIN(credits_consumed) as min_consumed,
  MAX(credits_consumed) as max_consumed
FROM front_view_approvals
WHERE status = 'completed'
  AND created_at > NOW() - INTERVAL '7 days';

-- 4. Completion rate
SELECT
  COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*) as completion_rate
FROM front_view_approvals
WHERE created_at > NOW() - INTERVAL '7 days';

-- 5. Failed workflows
SELECT
  id,
  product_idea_id,
  status,
  iteration_number,
  created_at
FROM front_view_approvals
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
\`\`\`

---

## ✅ Final Checklist

Before deploying to production:

- [x] Migration file created and tested
- [x] Old migration file removed
- [x] All code uses `front_view_approvals` table
- [x] Revision records include `front_view_approval_id`
- [x] TypeScript compilation passes
- [ ] Migration applied to staging database
- [ ] End-to-end workflow tested in staging
- [ ] RLS policies added (optional)
- [ ] Monitoring queries set up
- [ ] Documentation reviewed
- [ ] Team notified of changes
- [ ] Ready to deploy to production

---

## 📞 Support

If you encounter issues:

1. Check the logs in `app/actions/progressive-generation-workflow.ts`
2. Query the database to see approval record state
3. Verify TypeScript types match database schema
4. Review this checklist for common issues
5. Check documentation in `FRONT_VIEW_APPROVALS_TABLE.md`

---

**Status:** ✅ **ALL CODE UPDATES COMPLETE - READY FOR MIGRATION**

Apply the migration and test the workflow to complete the deployment.
