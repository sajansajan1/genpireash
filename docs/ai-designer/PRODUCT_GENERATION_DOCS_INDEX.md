# Genpire Product Generation Documentation Index

**Created:** November 14, 2025  
**Scope:** Complete workflow from product creation to first generated views

---

## Document Overview

This folder contains three comprehensive documents explaining the Genpire initial product generation workflow. Choose which document to read based on your needs:

### Document 1: EXPLORATION_SUMMARY.md (13 KB)
**Read this first - High-level overview**

Best for:
- Getting oriented quickly
- Understanding the big picture
- Learning key insights
- Deciding what to dive into next

Contains:
- 8-step process overview
- Why the architecture is smart
- Critical functions table
- Timeline example
- Files to read in order

Time to read: 10-15 minutes

---

### Document 2: PRODUCT_CREATION_QUICK_REFERENCE.md (7.8 KB)
**Handy reference guide**

Best for:
- Quick lookups while coding
- Testing checklist
- Common user actions
- Performance metrics
- Error recovery strategies

Contains:
- The 8-step flow
- Key files table
- Database schema summary
- Credit system
- Testing checklist
- Architecture decisions rationale

Time to read: 10 minutes  
Time to reference: 1-2 minutes per lookup

---

### Document 3: PRODUCT_CREATION_WORKFLOW.md (29 KB)
**Complete deep-dive documentation**

Best for:
- Deep understanding of every component
- Implementation details
- Code examples and actual API calls
- Debugging specific issues
- Teaching others

Contains:
- All 8 steps with detailed code
- Complete database schema
- Stepped workflow architecture
- AI services documentation
- Credit system details
- Error handling & recovery
- Progress tracking system
- Testing points and edge cases
- Complete data flow diagrams

Time to read: 30-45 minutes  
Time to reference: 5-10 minutes per lookup

---

## Reading Order Recommendation

### Scenario 1: New to Genpire
1. Start with **EXPLORATION_SUMMARY.md** (10 min)
2. Read **PRODUCT_CREATION_QUICK_REFERENCE.md** (10 min)
3. Bookmark **PRODUCT_CREATION_WORKFLOW.md** for deep dives
4. Read actual code: idea-upload/page.tsx → designer.tsx → idea-generation.ts

### Scenario 2: Implementing a Feature
1. Skim **EXPLORATION_SUMMARY.md** (5 min)
2. Check **PRODUCT_CREATION_QUICK_REFERENCE.md** for relevant section
3. Reference **PRODUCT_CREATION_WORKFLOW.md** for detailed code
4. Review actual implementation in corresponding file

### Scenario 3: Debugging an Issue
1. Check timeline in **PRODUCT_CREATION_QUICK_REFERENCE.md**
2. Look up error in **PRODUCT_CREATION_WORKFLOW.md** (section: Error Handling)
3. Find corresponding code in the files listed
4. Trace execution path with debugger

### Scenario 4: Teaching a Team Member
1. Have them read **EXPLORATION_SUMMARY.md**
2. Walk through **PRODUCT_CREATION_WORKFLOW.md** together
3. Show actual code examples
4. Use diagrams from the documents

---

## Quick Navigation by Topic

### Understanding the Process
- **Overview:** EXPLORATION_SUMMARY.md - "The Complete 8-Step Process"
- **Detailed Flow:** PRODUCT_CREATION_WORKFLOW.md - "Part 1-8"
- **Timeline:** PRODUCT_CREATION_QUICK_REFERENCE.md - "What Happens When User Creates Product"

### User Entry Points
- **Location:** EXPLORATION_SUMMARY.md - "Entry Points (Where Users Start)"
- **Implementation:** PRODUCT_CREATION_WORKFLOW.md - "Part 1: User Entry Point"

### Database & Data Model
- **Schema:** PRODUCT_CREATION_QUICK_REFERENCE.md - "Database Schema"
- **Detailed:** PRODUCT_CREATION_WORKFLOW.md - "Part 5: First Revision Creation"
- **Diagrams:** PRODUCT_CREATION_WORKFLOW.md - "Complete Data Flow Diagram"

### AI Services
- **Which ones:** PRODUCT_CREATION_QUICK_REFERENCE.md - "AI Services"
- **How they're used:** PRODUCT_CREATION_WORKFLOW.md - "Part 4: Image Generation Pipeline"
- **Details:** PRODUCT_CREATION_WORKFLOW.md - "Part 7: AI Tools & Services Used"

### Image Generation
- **Overview:** EXPLORATION_SUMMARY.md - "Stepped Workflow Architecture"
- **Implementation:** PRODUCT_CREATION_WORKFLOW.md - "Part 4: Image Generation Pipeline"
- **Code:** Check `stepped-image-generation.ts`

### Revisions & Versioning
- **How it works:** PRODUCT_CREATION_QUICK_REFERENCE.md - "Common User Actions & Their Flow"
- **Creation:** PRODUCT_CREATION_WORKFLOW.md - "Part 5: First Revision Creation"
- **Implementation:** `create-initial-product-revision.ts`

### Credits & Billing
- **System:** PRODUCT_CREATION_QUICK_REFERENCE.md - "Credit System"
- **Detailed:** PRODUCT_CREATION_WORKFLOW.md - "Credit System"
- **Implementation:** `stepped-image-generation.ts` line 97

### Testing
- **Checklist:** PRODUCT_CREATION_QUICK_REFERENCE.md - "Testing Checklist"
- **Detailed:** PRODUCT_CREATION_WORKFLOW.md - "Testing Points"

### Debugging
- **Common issues:** PRODUCT_CREATION_QUICK_REFERENCE.md - "Error Recovery"
- **All errors:** PRODUCT_CREATION_WORKFLOW.md - "Error Handling & Recovery"

---

## Key Metrics

| Metric | Value |
|--------|-------|
| Total workflow time | 2.5-3 minutes |
| Time to editor | <2 seconds |
| Time to first view | ~30 seconds |
| Images generated | 5 (front, back, side, top, bottom) |
| AI service calls | 5 (one per view) |
| Database records created | 6 (1 product_ideas + 5 product_multiview_revisions) |
| Credits reserved | 3 per initial generation |

---

## Architecture Quick Facts

- **Stepped Workflow:** Front view first, others use it as reference
- **Immediate Feedback:** Database entry instant, generation async
- **Revision System:** Revision 0 immutable, edits create new revisions
- **Data Integrity:** Batch IDs group multi-view operations
- **Credit Management:** Reserved early, refunded on failure
- **Progress Tracking:** Real-time modal with fun facts

---

## Code Files Referenced

| File | Purpose | Key Functions |
|------|---------|---|
| `components/idea-upload/page.tsx` | User input form | buildInitialChatMessage, handleSubmitNew |
| `app/actions/create-product-entry.ts` | DB operations | createMinimalProductEntry, updateProductImages |
| `app/actions/idea-generation.ts` | Main orchestrator | generateIdea, generateProductImage |
| `app/actions/stepped-image-generation.ts` | Image generation | generateFrontView, generateAdditionalViews |
| `lib/services/centralized-generation-service.ts` | Service layer | generateMultiViewProduct |
| `app/ai-designer/designer.tsx` | Display layer | loadProjectAndInitialize, handleInitialGenerationWithProgress |
| `app/actions/create-initial-product-revision.ts` | Revision creation | createInitialProductRevision |
| `app/actions/chat-session.ts` | Context storage | createChatSession |

---

## Common Questions

**Q: Where does the user start?**  
A: Two paths - Creator Dashboard (/creator-dashboard) or AI Designer (/ai-designer)

**Q: How fast is the initial response?**  
A: <2 seconds (user sees editor immediately)

**Q: How long does generation take?**  
A: 2.5-3 minutes for all 5 views

**Q: What AI models are used?**  
A: Gemini for images, OpenAI for later tech pack generation

**Q: How many images are generated?**  
A: 5 views (front, back, side, top, bottom)

**Q: What's a "Revision"?**  
A: A set of 5 product views. Revision 0 is initial, edits create new revisions

**Q: How are views kept consistent?**  
A: Front view generated first, all others use it as reference

**Q: How are credits managed?**  
A: 3 credits reserved upfront, refunded if generation fails

**Q: Can I revert to previous designs?**  
A: Yes, revision history keeps all previous versions

---

## Next Steps

1. Choose your reading path (see "Reading Order Recommendation" above)
2. Read the appropriate document(s)
3. Review actual code in the files listed
4. Run through the workflow in a debugger to see real data flow

---

**Index Created:** November 14, 2025  
**Last Updated:** November 14, 2025  
**Total Documentation:** ~50 KB covering 5000+ lines of code analysis

---

## Document Locations

All documents are in the project root:
- `/EXPLORATION_SUMMARY.md` - This overview
- `/PRODUCT_CREATION_QUICK_REFERENCE.md` - Quick reference
- `/PRODUCT_CREATION_WORKFLOW.md` - Complete detailed guide
- `/PRODUCT_GENERATION_DOCS_INDEX.md` - This file
