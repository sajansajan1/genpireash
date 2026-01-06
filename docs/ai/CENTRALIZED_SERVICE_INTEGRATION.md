# Centralized Generation Service Integration Plan

## Overview
This document outlines the integration of the new centralized generation service into the existing Genpire codebase.

## Current State
- **Primary Generation**: `/app/actions/idea-generation.ts` (OpenAI)
- **Gemini Generation**: `/app/actions/idea-generation-gemini.ts`
- **Stepped Workflow**: `/app/actions/stepped-image-generation.ts`
- **Revisions**: Multiple AI image edit files

## New Architecture

### Core Services
1. **`/lib/services/centralized-generation-service.ts`**
   - Main entry point: `generateMultiViewProduct()`
   - Handles both stepped and direct workflows
   - Manages logo integration and reference images
   
2. **`/lib/services/revision-generation-service.ts`**
   - `createRevision()` - New revisions with selective regeneration
   - `createInitialRevision()` - Track initial generation
   - `getRevisionHistory()` - Retrieve all revisions
   
3. **`/lib/services/generation/index.ts`**
   - Unified exports for all generation services

## Integration Steps

### Phase 1: Update Main Generation (idea-generation.ts)
Replace the current complex logic with centralized service calls:

\`\`\`typescript
// OLD: Complex stepped workflow
const frontViewResult = await generateFrontView({...});
const approvalResult = await handleFrontViewApproval({...});
const additionalViewsResult = await generateAdditionalViews(...);

// NEW: Single centralized call
const result = await generateMultiViewProduct(prompt, {
  useSteppedWorkflow: true,
  generateExtraViews: generateMoreImages,
  logo: logoConfig,
  referenceImage: uploadedImage,
  autoApprove: true
});
\`\`\`

### Phase 2: Update Gemini Generation
Modify `/app/actions/idea-generation-gemini.ts` similarly:

\`\`\`typescript
// Use same centralized service, just without useOpenAI flag
const result = await generateMultiViewProduct(prompt, {
  useSteppedWorkflow: true,
  generateExtraViews: generateMoreImages,
  // Gemini is default, no need to specify
});
\`\`\`

### Phase 3: Update Revision Flows
Replace revision logic in AI image edit files:

\`\`\`typescript
// Use revision service
import { createRevision } from '@/lib/services/generation';

const revision = await createRevision({
  projectId: projectId,
  userPrompt: editPrompt,
  viewsToRegenerate: ['front', 'back'],
  preserveViews: ['side']
});
\`\`\`

## Migration Checklist

### Files to Update:
- [ ] `/app/actions/idea-generation.ts`
- [ ] `/app/actions/idea-generation-gemini.ts`
- [ ] `/app/actions/ai-image-edit.ts`
- [ ] `/app/actions/ai-image-edit-multiview.ts`
- [ ] `/app/actions/ai-image-edit-adaptive.ts`

### Functions to Replace:
- [ ] `regenerateImageData()` → `generateMultiViewProduct()`
- [ ] Direct Gemini/OpenAI calls → Centralized service
- [ ] Manual revision tracking → `createRevision()`

## Benefits After Integration

1. **Single Source of Truth**: All generation logic in one place
2. **Consistency**: Same workflow everywhere
3. **Easier Maintenance**: Update logic in one location
4. **Better Testing**: Test one service instead of many
5. **Revision Tracking**: Built-in revision management

## Testing Plan

### Unit Tests
- Test `generateMultiViewProduct()` with various configs
- Test revision creation and management
- Test selective view regeneration

### Integration Tests
1. Create new product with all views
2. Create revision with partial regeneration
3. Upload image and generate views
4. Test with and without logo

### End-to-End Tests
1. Complete product creation flow
2. Edit and revision flow
3. View comparison and restoration

## Rollback Plan
If issues arise:
1. Git revert the integration commits
2. Restore original functions from backup
3. Document issues for resolution

## Timeline
- Phase 1: Update main generation - 30 mins
- Phase 2: Update Gemini generation - 20 mins
- Phase 3: Update revision flows - 45 mins
- Testing: 1 hour

Total estimated time: ~2.5 hours
