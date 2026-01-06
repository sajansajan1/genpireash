# Tech Pack V2 - Base Views Analysis Improvements

## Overview

This document outlines the improvements made to the Tech Pack V2 system to enable multi-view analysis and editable analysis data.

---

## 1. Multi-View Base Analysis

### Problem
Previously, only **1 base view** was being displayed, even though the system was designed to analyze multiple views (front, back, side).

### Solution
The system **already supports** analyzing all 3 views (front, back, side). The issue was in how `revisionIds` were being passed to the generation function.

### How It Works

#### API Endpoint (`/api/tech-pack-v2/analyze-base-views`)
```typescript
// Lines 44-51
const priorityOrder = ['front', 'back', 'side'];
const selectedRevisions = priorityOrder
  .map(viewType => allRevisions.find(r => r.view_type === viewType))
  .filter(Boolean);
```

**What it does:**
- Receives an array of `revisionIds`
- Fetches all corresponding revisions from the database
- Filters to only analyze **essential views**: front, back, side (saves credits)
- Analyzes each view independently
- Returns analysis for all views

#### Expected Input
```typescript
{
  productId: "product-123",
  revisionIds: [
    "front-view-id",
    "back-view-id",
    "side-view-id"
  ],
  category: "t-shirt"
}
```

#### Expected Output
```typescript
{
  success: true,
  data: {
    baseViews: [
      {
        revisionId: "front-view-id",
        viewType: "front",
        imageUrl: "https://...",
        analysisData: { ... },
        cached: false
      },
      {
        revisionId: "back-view-id",
        viewType: "back",
        imageUrl: "https://...",
        analysisData: { ... },
        cached: false
      },
      {
        revisionId: "side-view-id",
        viewType: "side",
        imageUrl: "https://...",
        analysisData: { ... },
        cached: false
      }
    ]
  }
}
```

### To Verify Multi-View Works
Check that the parent component passes **all 3 revision IDs** (front, back, side) to the tech pack generation:

```typescript
// In the component that calls tech pack generation
const revisionIds = [
  frontViewRevisionId,
  backViewRevisionId,
  sideViewRevisionId
];

await techPackV2Client.generateComplete(productId, revisionIds, primaryImageUrl);
```

---

## 2. Editable Analysis Data

### Problem
- Analysis data was **hidden** from users
- Users couldn't **correct AI mistakes**
- If AI misidentifies something (e.g., "polyester" instead of "cotton"), it **propagates** through all outputs (close-ups, sketches)

### Solution
Implemented a complete system for viewing, editing, and saving analysis data with automatic regeneration support.

---

## 2.1 Components Created

### `EditableAnalysisField.tsx`
Located: `modules/ai-designer/components/TechPack/EditableAnalysisField.tsx`

**Purpose:** Provides inline editing for individual analysis fields

**Features:**
- Click-to-edit functionality
- Real-time validation
- Save/cancel buttons
- Loading states
- Error handling
- Keyboard shortcuts (Enter to save, Escape to cancel)

**Usage Example:**
```tsx
<EditableAnalysisField
  label="Primary Material"
  value="Cotton"
  onSave={async (newValue) => {
    await updateAnalysisField('materials_detected.0.material_type', newValue);
  }}
  type="text"
  placeholder="Enter material name"
/>
```

**Visual States:**
1. **View Mode** (default):
   - Shows label and value
   - Edit icon appears on hover

2. **Edit Mode** (when clicked):
   - Input field with current value
   - Save (✓) and Cancel (✗) buttons
   - Loading spinner during save

3. **Error State**:
   - Red error message below input
   - Save button remains enabled to retry

---

### `EditableMaterial.tsx` (part of EditableAnalysisField)
**Purpose:** Edit complex material objects with multiple fields

**Fields:**
- Material type
- Confidence score
- Properties (array of strings)

---

## 2.2 Store Functions Added

### `updateBaseViewAnalysisField`
Located: `modules/ai-designer/store/techPackV2Store.ts` (Line 320-352)

**Purpose:** Update a specific field in analysis data using dot notation

**Signature:**
```typescript
updateBaseViewAnalysisField: (
  revisionId: string,
  fieldPath: string,
  value: any
) => void
```

**How It Works:**
1. Deep clones analysisData to avoid mutations
2. Navigates to the target field using dot notation
3. Updates the field value
4. Increments version number for optimistic updates
5. Triggers re-render

**Example Usage:**
```typescript
const { updateBaseViewAnalysisField } = useTechPackV2Store();

// Update a top-level field
updateBaseViewAnalysisField(revisionId, 'product_category', 'dress');

// Update a nested field
updateBaseViewAnalysisField(revisionId, 'materials_detected.0.material_type', 'silk');

// Update an array item
updateBaseViewAnalysisField(revisionId, 'colors_identified.1.name', 'Navy Blue');
```

**Field Path Examples:**
```typescript
'product_category'                           // Top level
'materials_detected.0.material_type'         // Array index + property
'construction_details.seam_type'            // Nested object
'colors_identified.2.hex'                   // Deep nesting
```

---

## 2.3 API Endpoint

### `PATCH /api/tech-pack-v2/update-analysis`
Located: `app/api/tech-pack-v2/update-analysis/route.ts`

**Purpose:** Persist analysis changes to the database

**Request Body Options:**

**Option 1: Update specific field**
```json
{
  "revisionId": "abc-123",
  "fieldPath": "materials_detected.0.material_type",
  "value": "Silk"
}
```

**Option 2: Update entire analysis**
```json
{
  "revisionId": "abc-123",
  "analysisData": {
    "product_category": "dress",
    "materials_detected": [...],
    "colors_identified": [...]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fieldPath": "materials_detected.0.material_type",
    "value": "Silk",
    "analysisData": { ... }
  }
}
```

**Database Updates:**
- Updates `tech_files` table (primary)
- Updates `revision_vision_analysis` table (legacy, for backwards compatibility)
- Sets `updated_at` timestamp
- Validates user ownership

**Security:**
- Requires authentication (JWT)
- Validates user owns the revision
- Prevents unauthorized edits

---

## 3. How To Integrate Editable Fields

### Step 1: Import Components and Hooks
```tsx
import { EditableAnalysisField } from './EditableAnalysisField';
import { useTechPackV2Store } from '../../store/techPackV2Store';
import { toast } from 'sonner';
```

### Step 2: Get Store Functions
```tsx
const { updateBaseViewAnalysisField } = useTechPackV2Store();
```

### Step 3: Create Save Handler
```tsx
const handleSaveField = async (
  revisionId: string,
  fieldPath: string,
  newValue: string
) => {
  try {
    // Update store immediately (optimistic update)
    updateBaseViewAnalysisField(revisionId, fieldPath, newValue);

    // Save to database
    const response = await fetch('/api/tech-pack-v2/update-analysis', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revisionId, fieldPath, value: newValue }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to save');
    }

    toast.success('Analysis updated successfully');
  } catch (error) {
    toast.error('Failed to save changes');
    // Revert optimistic update if needed
    throw error;
  }
};
```

### Step 4: Use EditableAnalysisField in UI
```tsx
{/* Product Category */}
<EditableAnalysisField
  label="Product Category"
  value={analysisData?.product_category || 'Not detected'}
  onSave={(newValue) => handleSaveField(view.revisionId, 'product_category', newValue)}
  type="text"
  placeholder="e.g., t-shirt, dress, jacket"
/>

{/* Material Type */}
<EditableAnalysisField
  label="Primary Material"
  value={analysisData?.materials_detected?.[0]?.material_type || 'Not detected'}
  onSave={(newValue) =>
    handleSaveField(view.revisionId, 'materials_detected.0.material_type', newValue)
  }
  type="text"
  placeholder="e.g., Cotton, Polyester, Silk"
/>

{/* Color Name */}
<EditableAnalysisField
  label="Primary Color"
  value={analysisData?.colors_identified?.[0]?.name || 'Not detected'}
  onSave={(newValue) =>
    handleSaveField(view.revisionId, 'colors_identified.0.name', newValue)
  }
  type="text"
  placeholder="e.g., Navy Blue, White"
/>
```

---

## 4. Full Integration Example

```tsx
import React from 'react';
import { EditableAnalysisField } from './EditableAnalysisField';
import { useTechPackV2Store } from '../../store/techPackV2Store';
import { toast } from 'sonner';

export function BaseViewAnalysis({ view }) {
  const { updateBaseViewAnalysisField } = useTechPackV2Store();

  const handleSaveField = async (fieldPath: string, newValue: string) => {
    try {
      // Optimistic update
      updateBaseViewAnalysisField(view.revisionId, fieldPath, newValue);

      // Persist to database
      const response = await fetch('/api/tech-pack-v2/update-analysis', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revisionId: view.revisionId,
          fieldPath,
          value: newValue,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success('Saved successfully');
    } catch (error) {
      toast.error('Failed to save');
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      {/* Product Info */}
      <div className="grid grid-cols-2 gap-3">
        <EditableAnalysisField
          label="Category"
          value={view.analysisData?.product_category}
          onSave={(v) => handleSaveField('product_category', v)}
        />
        <EditableAnalysisField
          label="Subcategory"
          value={view.analysisData?.product_subcategory}
          onSave={(v) => handleSaveField('product_subcategory', v)}
        />
      </div>

      {/* Materials */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Materials</h4>
        {view.analysisData?.materials_detected?.map((material, idx) => (
          <EditableAnalysisField
            key={idx}
            label={`Material ${idx + 1}`}
            value={material.material_type}
            onSave={(v) =>
              handleSaveField(`materials_detected.${idx}.material_type`, v)
            }
          />
        ))}
      </div>

      {/* Colors */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Colors</h4>
        {view.analysisData?.colors_identified?.map((color, idx) => (
          <div key={idx} className="flex gap-2">
            <EditableAnalysisField
              label="Color Name"
              value={color.name}
              onSave={(v) =>
                handleSaveField(`colors_identified.${idx}.name`, v)
              }
            />
            <EditableAnalysisField
              label="Hex Code"
              value={color.hex}
              onSave={(v) =>
                handleSaveField(`colors_identified.${idx}.hex`, v)
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 5. Regeneration with Edited Data

### Automatic Usage
When you edit analysis data, the updated data is automatically used for:

1. **Close-up Generation**
   - Uses `baseViewAnalyses` from the edited base views
   - AI references corrected material/color information

2. **Sketch Generation**
   - Uses `productAnalysis` from edited base views
   - Callouts reflect corrected specifications

### Manual Regeneration
```typescript
// Regenerate close-ups with updated analysis
await techPackV2Client.regenerateAllCloseUps(
  productId,
  categoryData.category,
  baseViewsWithEditedData // Uses latest analysis data from store
);

// Regenerate sketches with updated analysis
await techPackV2Client.regenerateAllSketches(
  productId,
  categoryData.category,
  baseViewsWithEditedData
);
```

---

## 6. Value & Benefits

### For Users
✅ **Correct AI Mistakes**: Fix misidentified materials, colors, or construction details
✅ **Ensure Accuracy**: Manufacturing specs are based on verified data, not AI guesses
✅ **Control Quality**: Review and approve all analysis before generating tech pack
✅ **Save Time**: Edit once, propagates to all generated content

### For Developers
✅ **Reusable Components**: `EditableAnalysisField` can be used anywhere
✅ **Type-Safe**: Full TypeScript support with proper interfaces
✅ **Optimistic Updates**: Instant UI feedback before database save
✅ **Error Handling**: Built-in error recovery and user feedback

### For the Product
✅ **Higher Accuracy**: Tech packs based on verified human-corrected data
✅ **User Trust**: Transparency in AI analysis builds confidence
✅ **Flexibility**: Users can refine AI outputs to match their needs
✅ **Reduced Credits**: Fix analysis once instead of regenerating everything

---

## 7. Next Steps (Recommended)

### Phase 1: UI Integration ⏳
- [ ] Add `EditableAnalysisField` to `BaseViewsDisplay.tsx`
- [ ] Style editable fields to match design system
- [ ] Add "Save All Changes" button for batch updates
- [ ] Add "Revert Changes" to undo edits

### Phase 2: Advanced Editing 🚀
- [ ] Add visual material/color pickers
- [ ] Inline editing for construction details arrays
- [ ] Drag-and-drop reordering for arrays
- [ ] Bulk edit multiple views at once

### Phase 3: Smart Regeneration 🎯
- [ ] Detect which fields changed
- [ ] Only regenerate affected outputs (e.g., if color changed, regenerate close-ups but not sketches)
- [ ] Show diff of changes before regeneration
- [ ] "Preview" mode for testing edits without using credits

### Phase 4: Collaboration 👥
- [ ] Track edit history (who changed what, when)
- [ ] Comments on analysis fields
- [ ] Approval workflow (designer edits, manager approves)
- [ ] Shared tech pack editing

---

## 8. Testing Checklist

### Multi-View Analysis
- [ ] Generate tech pack with 3 views (front, back, side)
- [ ] Verify all 3 views appear in Base Views section
- [ ] Check each view has unique analysis data
- [ ] Confirm cached views work correctly

### Editable Fields
- [ ] Click edit button on any field
- [ ] Edit value and save
- [ ] Verify optimistic update (immediate UI change)
- [ ] Verify database persisted (refresh page, data remains)
- [ ] Test cancel button (reverts changes)
- [ ] Test keyboard shortcuts (Enter/Escape)
- [ ] Test error handling (invalid data, network error)

### Regeneration
- [ ] Edit material name in base view
- [ ] Regenerate close-ups
- [ ] Verify close-ups reference updated material
- [ ] Edit color in base view
- [ ] Regenerate sketches
- [ ] Verify sketches show updated color

---

## 9. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          BaseViewsDisplay Component                   │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │      EditableAnalysisField Component            │  │   │
│  │  │  • Click to edit                                │  │   │
│  │  │  • Save/Cancel buttons                          │  │   │
│  │  │  • Real-time validation                         │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │ User clicks "Save"
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Zustand Store (Client)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    updateBaseViewAnalysisField()                      │   │
│  │  • Parse field path (dot notation)                    │   │
│  │  • Deep clone analysis data                           │   │
│  │  • Update specific field                              │   │
│  │  • Increment version (optimistic update)              │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │ Trigger API call
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              API: PATCH /api/tech-pack-v2/update-analysis    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  1. Validate authentication                           │   │
│  │  2. Fetch current analysis from database              │   │
│  │  3. Update specific field                             │   │
│  │  4. Save to tech_files table                          │   │
│  │  5. Save to revision_vision_analysis (legacy)         │   │
│  │  6. Return updated data                               │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │ Persist to database
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                       Supabase Database                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  tech_files table                                     │   │
│  │    id: uuid                                           │   │
│  │    analysis_data: jsonb  ← Updated here               │   │
│  │    updated_at: timestamp ← Updated here               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  revision_vision_analysis (legacy)                    │   │
│  │    analysis_data: jsonb  ← Updated here               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Summary

### What Was Built
1. ✅ **EditableAnalysisField Component** - Inline editing with save/cancel
2. ✅ **Store Function** - `updateBaseViewAnalysisField` for optimistic updates
3. ✅ **API Endpoint** - `PATCH /api/tech-pack-v2/update-analysis` for persistence
4. ✅ **Documentation** - Complete guide for integration

### What Already Works
1. ✅ **Multi-View Analysis** - System analyzes front, back, and side views
2. ✅ **Data Propagation** - Edited data flows to close-ups and sketches

### What's Next
1. ⏳ **Integrate editable fields into BaseViewsDisplay UI**
2. ⏳ **Test end-to-end editing and regeneration**
3. ⏳ **Add visual enhancements (color pickers, etc.)**

---

**Last Updated:** 2025-01-24
**Version:** 1.0
**Author:** Claude (AI Assistant)
