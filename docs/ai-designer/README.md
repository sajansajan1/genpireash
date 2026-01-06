# AI Designer Documentation

This directory contains comprehensive documentation for the Genpire AI Designer system, covering architecture, workflows, and implementation details.

## 📚 Documentation Index

### 🎯 Start Here

1. **[GENPIRE_AI_DESIGNER_INDEX.md](./GENPIRE_AI_DESIGNER_INDEX.md)** (15K)
   - Master index with navigation guide
   - Entity reference and troubleshooting
   - **Best starting point for new developers**

2. **[COMPLETE_INDEX.md](./COMPLETE_INDEX.md)** (13K)
   - Alternative comprehensive index
   - Links to all major sections

### 🏗️ Architecture & System Overview

3. **[ai-designer-overview.md](./ai-designer-overview.md)** (23K)
   - High-level system overview
   - Module structure and organization
   - Key components and their roles

4. **[ARCHITECTURE.md](./ARCHITECTURE.md)** (51K)
   - **Most comprehensive architecture document**
   - Visual system architecture
   - Data flows and component interactions
   - State updates and workflows

5. **[architecture-diagram.md](./architecture-diagram.md)** (30K)
   - Visual diagrams and flowcharts
   - Component interaction maps
   - System-level architecture views

### 🔄 Revision System

6. **[REVISION_SYSTEM_SUMMARY.md](./REVISION_SYSTEM_SUMMARY.md)** (20K)
   - Complete revision creation flow
   - Database schema and data structures
   - **Essential for understanding versioning**

7. **[revision_system_analysis.md](./revision_system_analysis.md)** (18K)
   - Detailed analysis of revision logic
   - Edge cases and special scenarios

8. **[revision_flow_diagrams.md](./revision_flow_diagrams.md)** (27K)
   - Visual flow diagrams for revision creation
   - Step-by-step process illustrations

### 🖼️ View Generation System

9. **[view_generation_flow.md](./view_generation_flow.md)** (22K)
   - **Complete view generation workflow**
   - Front view special handling
   - Multi-view coordination
   - Image generation service integration

10. **[SUMMARY.md](./SUMMARY.md)** (12K)
    - Quick summary of view generation
    - Key distinctions between view types

### 🚀 Product Creation & Generation

11. **[genpire_product_creation_flow.md](./genpire_product_creation_flow.md)** (29K)
    - **Initial product generation workflow**
    - Complete user journey from creation to display
    - Timeline and sequence diagrams

12. **[EXPLORATION_SUMMARY.md](./EXPLORATION_SUMMARY.md)** (13K)
    - High-level overview of product generation
    - Quick reference for the creation flow

### ✏️ Edit & Regeneration Workflows

13. **[edit_workflow_summary.md](./edit_workflow_summary.md)** (21K)
    - **Complete design edit workflow**
    - Intent detection system
    - Edit request processing
    - Regeneration flows

14. **[edit_workflow_diagrams.md](./edit_workflow_diagrams.md)** (43K)
    - Visual diagrams for edit workflows
    - Intent detection flowcharts
    - Processing pipelines

15. **[FILE_LOCATIONS_AND_SUMMARY.md](./FILE_LOCATIONS_AND_SUMMARY.md)** (15K)
    - All file locations with line numbers
    - Implementation reference guide
    - Testing checklist

### 📖 Quick References

16. **[quick-reference.md](./quick-reference.md)** (11K)
    - File locations and type signatures
    - Workflows and schema references
    - Debugging tips

17. **[file_index.md](./file_index.md)** (11K)
    - Quick lookup for file paths
    - Component and function locations

---

## 🗺️ Documentation by Topic

### For Understanding Architecture
- Start: `GENPIRE_AI_DESIGNER_INDEX.md` → `ARCHITECTURE.md`
- Visuals: `architecture-diagram.md`

### For Understanding Revisions
- Start: `REVISION_SYSTEM_SUMMARY.md`
- Details: `revision_system_analysis.md`
- Visuals: `revision_flow_diagrams.md`

### For Understanding View Generation
- Start: `view_generation_flow.md`
- Quick: `SUMMARY.md`

### For Understanding Product Creation
- Start: `genpire_product_creation_flow.md`
- Quick: `EXPLORATION_SUMMARY.md`

### For Understanding Edits
- Start: `edit_workflow_summary.md`
- Visuals: `edit_workflow_diagrams.md`
- Reference: `FILE_LOCATIONS_AND_SUMMARY.md`

### For Quick Lookups
- Files: `file_index.md`
- APIs/Types: `quick-reference.md`

---

## 📊 Document Statistics

- **Total Documents**: 17 files
- **Total Size**: ~375KB
- **Coverage**: Architecture, Revisions, Views, Creation, Edits, References

---

## 🎯 Recommended Reading Paths

### Path 1: New Developer Onboarding
1. `GENPIRE_AI_DESIGNER_INDEX.md` (overview)
2. `ai-designer-overview.md` (system structure)
3. `genpire_product_creation_flow.md` (how products are created)
4. `edit_workflow_summary.md` (how edits work)

### Path 2: Deep Technical Understanding
1. `ARCHITECTURE.md` (complete architecture)
2. `REVISION_SYSTEM_SUMMARY.md` (revision system)
3. `view_generation_flow.md` (view generation)
4. `FILE_LOCATIONS_AND_SUMMARY.md` (implementation details)

### Path 3: Quick Reference
1. `quick-reference.md` (API/type lookups)
2. `file_index.md` (file locations)
3. `COMPLETE_INDEX.md` (navigation)

---

## 🔍 Key Concepts

### Revision System
- **One Revision = 3-5 Database Rows** (grouped by `batch_id`)
- **Per-View Versioning** (front/back/side track independently)
- **Revision 0** is immutable (initial generation)
- **Active Revisions** (only one per view type)

### View Generation
- **Front View** is generated first and requires approval
- **Additional Views** use front as reference
- **Stepped Workflow** ensures consistency
- **Progressive Regeneration** for better UX

### Edit Workflow
- **Intent Detection** routes to appropriate handlers
- **Three Request Methods**: Chat, Visual Annotations, Image Tools
- **Credit-Gated** (2 credits per regeneration)
- **Selective Regeneration** (only specified views updated)

---

## 🛠️ File Paths Reference

All documentation uses **absolute file paths** from project root:
\`\`\`
/Users/esmatnawahda/Documents/Projects/PJTs/Shoshani/genpire-pjt/Genpire/
\`\`\`

### Key Directories:
- `modules/ai-designer/` - Frontend components and logic
- `app/actions/` - Server actions and business logic
- `app/api/` - API route handlers
- `lib/` - Shared utilities and services
- `components/` - Reusable UI components

---

## 📝 Documentation Maintenance

These documents were generated through comprehensive codebase exploration on **November 14, 2025**.

### When to Update:
- Major architectural changes
- New view types added
- Revision system modifications
- Edit workflow changes
- Database schema updates

### How to Update:
1. Read the relevant document
2. Update the specific section
3. Update the file modification date
4. Update this README if structure changes

---

## ⚡ Quick Tips

1. **Use Ctrl+F/Cmd+F** to search across documents
2. **File paths include line numbers** for precise navigation
3. **Diagrams are ASCII-based** for easy viewing in any editor
4. **All examples are real code** from the actual implementation
5. **Cross-references** link between related documents

---

**Generated**: November 14, 2025
**Total Documentation**: 17 files, ~375KB
**Coverage**: Complete AI Designer System
