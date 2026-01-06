# Data Storage Flow - front_view_approvals Table

**Where and when data is stored in the `front_view_approvals` table**

---

## 📊 Complete Data Flow

### Step 1️⃣: Initial Front View Generation
**Function:** `generateFrontViewOnly()`
**Location:** Line 247

\`\`\`typescript
// INSERT into front_view_approvals
await supabase
  .from("front_view_approvals")
  .insert({
    user_id: user.id,                          // ✅ Who created it
    product_idea_id: params.productId,         // ✅ Which product
    session_id: sessionId,                     // ✅ Session tracking
    front_view_url: uploadedUrl,               // ✅ Generated image URL
    front_view_prompt: frontViewPrompt,        // ✅ Prompt used
    status: "pending",                         // ✅ Waiting for approval
    iteration_number: 1,                       // ✅ First iteration
    credits_reserved: creditsToReserve,        // ✅ 3 credits reserved
    credits_consumed: 0,                       // ✅ Not consumed yet
    is_initial_generation: !isEdit,            // ✅ true/false
    user_feedback: null,                       // ✅ No feedback yet
    created_at: new Date().toISOString(),      // ✅ Timestamp
  })
\`\`\`

**Result:** Creates a new record with status `pending`

---

### Step 2A: User Approves Front View
**Function:** `handleFrontViewDecision()` with `action: "approve"`
**Location:** Line 410

\`\`\`typescript
// UPDATE front_view_approvals
await supabase
  .from("front_view_approvals")
  .update({
    status: "approved",                        // ✅ Status changed
    approved_at: new Date().toISOString(),     // ✅ When approved
    user_feedback: params.editFeedback || null,// ✅ Optional feedback
    extracted_features: extractedFeatures,     // ✅ Color, materials, dimensions
  })
  .eq("id", params.approvalId);
\`\`\`

**Result:** Updates record with approval details

---

### Step 2B: User Requests Edit
**Function:** `handleFrontViewDecision()` with `action: "edit"`
**Location:** Line 446 → Line 522

#### First: Mark current as rejected (Line 446)
\`\`\`typescript
// UPDATE current approval to rejected
await supabase
  .from("front_view_approvals")
  .update({
    status: "rejected",                        // ✅ Marked as rejected
    user_feedback: params.editFeedback || "User requested changes",
  })
  .eq("id", params.approvalId);
\`\`\`

#### Second: Create new approval for iteration 2 (Line 522)
\`\`\`typescript
// INSERT new approval record
const { data: newApproval } = await supabase
  .from("front_view_approvals")
  .insert({
    user_id: user.id,
    product_idea_id: approval.product_idea_id,
    session_id: sessionId,
    front_view_url: newUploadedUrl,            // ✅ NEW front view
    front_view_prompt: newPrompt,              // ✅ Updated prompt
    status: "pending",                         // ✅ Awaiting approval again
    iteration_number: approval.iteration_number + 1, // ✅ 2, 3, 4...
    credits_reserved: creditsToReserve,        // ✅ 3 + iterations
    credits_consumed: 0,
    is_initial_generation: approval.is_initial_generation, // ✅ Same as before
    previous_revision_id: params.approvalId,   // ✅ Link to previous
    user_feedback: params.editFeedback,
    created_at: new Date().toISOString(),
  })
  .select()
  .single();
\`\`\`

**Result:** Old record rejected, new record created for iteration

---

### Step 3️⃣: Generate Remaining Views (After Approval)
**Function:** `generateRemainingViews()`
**Location:** Line 669

\`\`\`typescript
// UPDATE with all remaining views
await supabase
  .from("front_view_approvals")
  .update({
    back_view_url: backView.url,               // ✅ Back view image
    back_view_prompt: backView.prompt,         // ✅ Back view prompt
    side_view_url: sideView.url,               // ✅ Side view image
    side_view_prompt: sideView.prompt,         // ✅ Side view prompt
    top_view_url: topView.url,                 // ✅ Top view image
    top_view_prompt: topView.prompt,           // ✅ Top view prompt
    bottom_view_url: bottomView.url,           // ✅ Bottom view image
    bottom_view_prompt: bottomView.prompt,     // ✅ Bottom view prompt
  })
  .eq("id", params.approvalId);
\`\`\`

**Result:** All 5 view URLs and prompts stored in single record

---

### Step 4️⃣: Create Final Revision
**Function:** `createRevisionAfterApproval()`
**Location:** Line 790

\`\`\`typescript
// UPDATE credits consumed and mark completed
await supabase
  .from("front_view_approvals")
  .update({
    credits_consumed: creditsToConsume,        // ✅ Actual credits used
  })
  .eq("id", params.approvalId);

// Later, after revision success (not shown in current code)
// Should also update:
// - status: "completed"
// - completed_at: timestamp
\`\`\`

**Result:** Credits tracked, ready to mark as completed

---

## 📋 Complete Field Mapping

### Fields Populated in Each Step

| Field | Step 1 (Initial) | Step 2A (Approve) | Step 2B (Edit) | Step 3 (Remaining) | Step 4 (Revision) |
|-------|------------------|-------------------|----------------|--------------------|--------------------|
| `id` | ✅ Generated | - | ✅ New ID | - | - |
| `user_id` | ✅ Set | - | ✅ Set | - | - |
| `product_idea_id` | ✅ Set | - | ✅ Set | - | - |
| `session_id` | ✅ Set | - | ✅ Set | - | - |
| `front_view_url` | ✅ Set | - | ✅ New URL | - | - |
| `front_view_prompt` | ✅ Set | - | ✅ Updated | - | - |
| `status` | ✅ "pending" | ✅ "approved" | ✅ "rejected" → "pending" | - | ⚠️ Should set "completed" |
| `iteration_number` | ✅ 1 | - | ✅ 2, 3, 4... | - | - |
| `credits_reserved` | ✅ 3 | - | ✅ 3 + iter | - | - |
| `credits_consumed` | ✅ 0 | - | ✅ 0 | - | ✅ Actual |
| `is_initial_generation` | ✅ true/false | - | ✅ Same | - | - |
| `user_feedback` | ✅ null | ✅ Optional | ✅ Set | - | - |
| `previous_revision_id` | - | - | ✅ Previous ID | - | - |
| `created_at` | ✅ Now | - | ✅ Now | - | - |
| `approved_at` | - | ✅ Now | - | - | - |
| `extracted_features` | - | ✅ Set | - | - | - |
| `back_view_url` | - | - | - | ✅ Set | - |
| `back_view_prompt` | - | - | - | ✅ Set | - |
| `side_view_url` | - | - | - | ✅ Set | - |
| `side_view_prompt` | - | - | - | ✅ Set | - |
| `top_view_url` | - | - | - | ✅ Set | - |
| `top_view_prompt` | - | - | - | ✅ Set | - |
| `bottom_view_url` | - | - | - | ✅ Set | - |
| `bottom_view_prompt` | - | - | - | ✅ Set | - |
| `completed_at` | - | - | - | - | ⚠️ Should set |

---

## 🔍 Example Data Journey

### Scenario: User Creates Chair, Edits Once, Then Approves

#### Record 1: Initial Generation
\`\`\`json
{
  "id": "abc-123",
  "user_id": "user-456",
  "product_idea_id": "prod-789",
  "session_id": "sess-001",
  "front_view_url": "https://storage/chair-v1.jpg",
  "front_view_prompt": "Modern ergonomic office chair",
  "status": "rejected",  // After user requests edit
  "iteration_number": 1,
  "credits_reserved": 3,
  "credits_consumed": 0,
  "is_initial_generation": true,
  "user_feedback": "Make the backrest taller",
  "previous_revision_id": null,
  "created_at": "2025-01-15T10:00:00Z",
  "approved_at": null,
  "back_view_url": null,
  // ... other views null
}
\`\`\`

#### Record 2: After Edit (Iteration 2)
\`\`\`json
{
  "id": "def-456",
  "user_id": "user-456",
  "product_idea_id": "prod-789",
  "session_id": "sess-002",
  "front_view_url": "https://storage/chair-v2.jpg",
  "front_view_prompt": "Modern ergonomic office chair\nUser feedback: Make the backrest taller",
  "status": "approved",  // After user approves
  "iteration_number": 2,
  "credits_reserved": 4,  // 3 base + 1 iteration
  "credits_consumed": 0,
  "is_initial_generation": true,  // Still initial (not completed)
  "user_feedback": "Make the backrest taller",
  "previous_revision_id": "abc-123",  // Links to record 1
  "created_at": "2025-01-15T10:05:00Z",
  "approved_at": "2025-01-15T10:06:00Z",
  "extracted_features": {
    "colors": [{"hex": "#333333", "name": "charcoal", "usage": "frame"}],
    "materials": ["mesh", "aluminum"],
    // ...
  },
  "back_view_url": "https://storage/chair-v2-back.jpg",
  "back_view_prompt": "Back view of modern ergonomic office chair...",
  "side_view_url": "https://storage/chair-v2-side.jpg",
  "side_view_prompt": "Side view of modern ergonomic office chair...",
  "top_view_url": "https://storage/chair-v2-top.jpg",
  "top_view_prompt": "Top view of modern ergonomic office chair...",
  "bottom_view_url": "https://storage/chair-v2-bottom.jpg",
  "bottom_view_prompt": "Bottom view of modern ergonomic office chair...",
  "credits_consumed": 4,  // After revision created
  "completed_at": "2025-01-15T10:08:00Z"  // ⚠️ Should be set
}
\`\`\`

---

## 🐛 Missing Update Found!

### Issue: `completed_at` and final `status` not being set

**Problem:** After creating the revision, we update `credits_consumed` but don't mark the workflow as complete.

**Location:** `createRevisionAfterApproval()` - Line 790

**Current Code:**
\`\`\`typescript
await supabase
  .from("front_view_approvals")
  .update({
    credits_consumed: creditsToConsume,
  })
  .eq("id", params.approvalId);
\`\`\`

**Should Be:**
\`\`\`typescript
await supabase
  .from("front_view_approvals")
  .update({
    credits_consumed: creditsToConsume,
    status: "completed",                       // ✅ Mark as complete
    completed_at: new Date().toISOString(),    // ✅ Set completion time
  })
  .eq("id", params.approvalId);
\`\`\`

---

## 📊 Database Queries to View Data

### Get Current Approval State
\`\`\`sql
SELECT
  id,
  status,
  iteration_number,
  front_view_url,
  back_view_url,
  side_view_url,
  top_view_url,
  bottom_view_url,
  credits_reserved,
  credits_consumed,
  created_at,
  approved_at,
  completed_at
FROM front_view_approvals
WHERE product_idea_id = 'your-product-id'
ORDER BY created_at DESC;
\`\`\`

### Get Iteration History
\`\`\`sql
SELECT
  iteration_number,
  status,
  user_feedback,
  front_view_url,
  created_at,
  approved_at
FROM front_view_approvals
WHERE product_idea_id = 'your-product-id'
ORDER BY iteration_number ASC;
\`\`\`

### Get Completed Workflows with All Views
\`\`\`sql
SELECT
  id,
  status,
  iteration_number,
  front_view_url,
  back_view_url,
  side_view_url,
  top_view_url,
  bottom_view_url,
  credits_consumed,
  completed_at
FROM front_view_approvals
WHERE status = 'completed'
  AND product_idea_id = 'your-product-id';
\`\`\`

---

## ✅ Summary

### Data is stored in `front_view_approvals` table at:

1. **Line 247** - INSERT initial front view
2. **Line 410** - UPDATE when approved
3. **Line 446** - UPDATE when rejected
4. **Line 522** - INSERT new iteration on edit
5. **Line 669** - UPDATE with remaining 4 views
6. **Line 790** - UPDATE credits consumed

### What gets stored:
- ✅ Front view URL and prompt
- ✅ All 5 view URLs and prompts (after approval)
- ✅ User feedback and iteration tracking
- ✅ Status transitions (pending → approved/rejected → completed)
- ✅ Credit management
- ✅ Session and user tracking
- ✅ Extracted features (colors, materials, dimensions)
- ⚠️ Missing: Final `status: "completed"` and `completed_at` timestamp

---

**Next:** Fix the missing completion status update in `createRevisionAfterApproval()`
