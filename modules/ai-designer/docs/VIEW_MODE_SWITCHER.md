# Workflow Mode Switcher - Feature Documentation

## 🎯 Feature Overview

**Date**: 2025-11-19

Added a **Workflow Mode Switcher** that allows users to toggle between viewing all 5 product views or browsing front view versions/iterations after a design is completed.

### Use Case
After completing a design that went through multiple front view iterations:
- User wants to see all 5 views (front, back, side, top, bottom) - **"Multi-View" mode** (`workflowMode === "multi-view"`)
- User wants to browse and compare different front view versions - **"Front-View" mode** (`workflowMode === "front-view"`)

---

## 🎨 UI Components

### Desktop View
**Location**: Header, right side before credits display

\`\`\`tsx
┌─────────────────────────────────────────────────────┐
│ Product Name    [All Views] [Front Versions]  💰 123│
└─────────────────────────────────────────────────────┘
\`\`\`

- Toggle button group with 2 options
- Active button: Dark background (`bg-[#1C1917]`), white text
- Inactive button: Light gray text, hover effect
- Only shows when:
  - `generationState === "completed"`
  - `frontViewVersions.length > 0` (has iterations)

### Mobile View
**Location**: Top of "Design" tab content

\`\`\`
┌──────────────────────────────┐
│ [  All Views  ] [Front Ver.] │
├──────────────────────────────┤
│                              │
│    Design Content Here       │
│                              │
└──────────────────────────────┘
\`\`\`

- Full-width toggle in gray container
- Active button: White background with shadow
- Shown as fixed header above design content

---

## 🗂️ State Management

### Uses Existing Store State

**File**: `modules/ai-designer/store/editorStore.ts`

#### Uses Existing Type
\`\`\`typescript
export type WorkflowMode = 'front-view' | 'multi-view' | null;
\`\`\`

**Why Reuse WorkflowMode?**
- Already exists in the store
- Perfect semantic fit: 'front-view' = viewing front versions, 'multi-view' = viewing all views
- Maintains consistency with existing progressive workflow architecture
- No need for duplicate state

#### Existing State (Reused)
\`\`\`typescript
interface EditorState {
  // ...
  workflowMode: WorkflowMode;
  // ...
}
\`\`\`

#### Existing Action (Reused)
\`\`\`typescript
setWorkflowMode: (mode: WorkflowMode) => void;
\`\`\`

#### Default State
\`\`\`typescript
workflowMode: 'multi-view' // Default to showing all views after completion
\`\`\`

---

## 🔄 Rendering Logic

### Desktop (Lines 1836-1871)

\`\`\`typescript
{(generationState === "completed" ||
  (generationState === "idle" && !actualIsInitialGeneration) ||
  generationState === "creating_revision") && (
  <>
    {workflowMode === "multi-view" ? (
      // Show ViewsDisplay with all 5 views
      <ViewsDisplay ... />
    ) : (
      // Show FrontViewApproval with version browsing
      <FrontViewApproval
        frontViewUrl={frontViewApproval.imageUrl || currentViews.front}
        allVersions={frontViewVersions}
        onVersionChange={handleVersionChange}
        creditsForRemaining={0}  // View-only mode
        onApprove={() => {}}     // No-op callbacks
        onRequestEdit={() => {}} // View-only mode
      />
    )}
  </>
)}
\`\`\`

### Mobile (Lines 2011-2050)

Same logic as desktop, wrapped in mobile TabsContent.

---

## 📊 Component Behavior

### Multi-View Mode (`workflowMode === "multi-view"`)
- **Shows**: `ViewsDisplay` component
- **Displays**: All 5 product views in grid layout
- **Actions**: Zoom, pan, AI micro edits
- **Purpose**: Review complete product design

### Front-View Mode (`workflowMode === "front-view"`)
- **Shows**: `FrontViewApproval` component (read-only)
- **Displays**: Current front view with version dropdown
- **Actions**: Browse versions, zoom, view iteration history
- **Purpose**: Compare front view iterations
- **Special**:
  - `creditsForRemaining={0}` - Hides "Generate All Views" button
  - Empty callback functions - Disables approve/edit actions
  - `allVersions` prop populated with front view versions

---

## 🔍 When Switcher Appears

### Conditions (Both Desktop & Mobile)
\`\`\`typescript
generationState === "completed" &&
frontViewVersions.length > 0
\`\`\`

**Why these conditions?**
1. **`generationState === "completed"`**:
   - Design must be fully generated with all 5 views
   - Not in progress or awaiting approval

2. **`frontViewVersions.length > 0`**:
   - Must have at least one front view version
   - Only makes sense if there were iterations to compare

### When Switcher is Hidden
- During initial generation
- During front view approval (awaiting_front_approval state)
- During remaining views generation
- If no front view iterations exist (direct approval)

---

## 💡 User Flow Examples

### Example 1: Multiple Iterations
\`\`\`
User: "change main color to blue"
  → Front view generated (V1)
  → User: "Request Changes - make it darker"
  → Front view regenerated (V2)
  → User: "Request Changes - add stripes"
  → Front view regenerated (V3)
  → User: "Approve"
  → Remaining 4 views generated
  → Design completed

✅ Switcher appears: User has 3 front view versions to browse
\`\`\`

### Example 2: Direct Approval
\`\`\`
User: "change main color to blue"
  → Front view generated (V1)
  → User: "Approve"
  → Remaining 4 views generated
  → Design completed

✅ Switcher appears: User has 1 front view version
   (Still useful to see the front view large with details)
\`\`\`

### Example 3: No Switcher
\`\`\`
User: Fresh product with no iterations yet
  → generationState === "idle"
  → frontViewVersions.length === 0

❌ Switcher hidden: No versions to browse yet
\`\`\`

---

## 🎯 Benefits

1. **Version Comparison**: Easy way to see all front view iterations side-by-side
2. **Detail Review**: View front view in large format with all iteration history
3. **Non-destructive**: Browse versions without affecting the active design
4. **User Control**: Simple toggle, no complex navigation
5. **Mobile-Friendly**: Full-width toggle optimized for touch
6. **Performance**: Reuses existing FrontViewApproval component (no new code)

---

## 🔧 Technical Implementation

### Files Modified

1. **`modules/ai-designer/store/editorStore.ts`**
   - Updated `WorkflowMode` documentation to clarify usage
   - Changed default `workflowMode` from `null` to `'multi-view'`
   - Updated `resetWorkflowState()` to reset to `'multi-view'`

2. **`modules/ai-designer/components/MultiViewEditor/index.tsx`**
   - Added desktop switcher UI (header) - Lines 1600-1627
   - Added mobile switcher UI (tabs content) - Lines 1951-1980
   - Updated desktop rendering logic with `workflowMode` check - Lines 1834-1869
   - Updated mobile rendering logic with `workflowMode` check - Lines 2040-2079

### No Breaking Changes
- Reuses existing `workflowMode` state (no new state added)
- Existing functionality unchanged
- Default behavior: Show all views (`workflowMode === "multi-view"`)
- Progressive enhancement: Only appears when useful

---

## 🧪 Testing Checklist

### Desktop
- [ ] Switcher appears after completing design with iterations
- [ ] Switcher hidden during generation
- [ ] "All Views" button shows ViewsDisplay
- [ ] "Front Versions" button shows FrontViewApproval
- [ ] Active button has correct styling
- [ ] Switching between modes works smoothly
- [ ] Version dropdown works in Front Versions mode
- [ ] Zoom works in both modes

### Mobile
- [ ] Switcher appears at top of Design tab
- [ ] Full-width layout looks good
- [ ] Touch interaction works smoothly
- [ ] Mode switching works on mobile
- [ ] FrontViewApproval scrolls properly
- [ ] ViewsDisplay grid works on mobile

### Edge Cases
- [ ] Works with 1 front view version (direct approval)
- [ ] Works with many iterations (5+)
- [ ] Persists when navigating between tabs (mobile)
- [ ] Resets to "multi-view" when starting new product
- [ ] Doesn't appear during awaiting_front_approval state

---

## 🎨 Styling Details

### Desktop Switcher
\`\`\`css
Container: bg-white, rounded-lg, border, p-0.5
Active: bg-[#1C1917], text-white
Inactive: text-gray-600, hover:text-gray-900
Font: text-xs, font-medium
Padding: px-3 py-1.5
\`\`\`

### Mobile Switcher
\`\`\`css
Container: bg-gray-100, rounded-lg, p-0.5
Active: bg-white, shadow-sm, text-gray-900
Inactive: text-gray-600
Layout: flex-1 (equal width buttons)
Font: text-xs, font-medium
Padding: px-3 py-2
\`\`\`

---

## 🚀 Future Enhancements

Possible future improvements:
1. **Comparison View**: Side-by-side comparison of 2 versions
2. **Animation**: Smooth transition between modes
3. **Keyboard Shortcuts**: Quick toggle (e.g., `V` key)
4. **Version Labels**: Custom names for iterations
5. **Export Versions**: Download all front view versions
6. **Thumbnail Grid**: Small thumbnails of all versions

---

## ✅ Summary

**Purpose**: Allow users to browse front view iterations after design completion

**How**: Simple toggle between "Multi-View" and "Front-View" modes using existing `workflowMode` state

**Where**: Header (desktop) and Design tab (mobile)

**When**: After design completed with front view versions available

**Technical**: Reuses existing `WorkflowMode` type - no new state added, maintains consistency with progressive workflow architecture

**Result**: Better user control over viewing design iterations without disrupting workflow

---

Last Updated: 2025-11-19
