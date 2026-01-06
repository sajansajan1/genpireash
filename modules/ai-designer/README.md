# AI Designer Module

## Overview

This module contains all the refactored and modularized code for the AI Designer and MultiView Editor functionality. The original `multiview-editor.tsx` file (4,912 lines) has been broken down into manageable, maintainable modules.

## Structure

\`\`\`
modules/ai-designer/
├── types/               # All TypeScript type definitions
│   ├── revision.types.ts
│   ├── chat.types.ts
│   ├── annotation.types.ts
│   └── editor.types.ts
│
├── constants/           # Configuration and constants
│   ├── messages.ts     # Dynamic message templates
│   ├── defaults.ts     # Default configurations
│   └── intents.ts      # AI intent definitions
│
├── utils/              # Utility functions
│   ├── messageFormatters.ts
│   ├── imageProcessing.ts
│   ├── promptEnhancer.ts
│   └── validators.ts
│
├── store/              # Zustand state management
│   ├── editorStore.ts  # Main editor state
│   ├── chatStore.ts    # Chat state
│   └── annotationStore.ts # Annotation state
│
├── services/           # API and business logic services
│   ├── imageGeneration.ts
│   ├── chatSession.ts
│   ├── revisionManager.ts
│   ├── annotationCapture.ts
│   └── aiIntentDetection.ts
│
├── hooks/              # Custom React hooks
│   ├── useImageGeneration.ts
│   ├── useRevisionHistory.ts
│   ├── useChatSession.ts
│   ├── useAnnotations.ts
│   ├── useViewportControls.ts
│   └── useAIIntent.ts
│
└── components/         # React components
    ├── MultiViewEditor/    # Main editor container
    ├── ViewsDisplay/       # Product views grid
    ├── ChatInterface/      # AI chat panel
    ├── RevisionHistory/    # Revision sidebar
    ├── VisualEditor/       # Annotation tools
    ├── EditPrompt/         # Edit input area
    └── common/             # Shared components
\`\`\`

## Migration Status

### ✅ Completed
- Module structure created
- All TypeScript types extracted and organized
- Constants and configuration extracted
- Utility functions modularized
- Zustand stores set up for state management
- Service layer placeholders created
- Custom hooks structure established
- Component placeholders created

### 🚧 Next Steps

1. **Phase 1: Core Migration** (Week 1-2)
   - Move actual implementation from `multiview-editor.tsx` to service modules
   - Connect hooks to services
   - Wire up Zustand stores

2. **Phase 2: Component Implementation** (Week 2-3)
   - Implement ViewsDisplay component with all image handling
   - Build ChatInterface with full chat functionality
   - Create RevisionHistory with rollback features
   - Develop VisualEditor with annotation tools

3. **Phase 3: Integration** (Week 3-4)
   - Connect all components in MultiViewEditor
   - Update `ai-designer/page.tsx` to use new module
   - Migrate `tech-pack-maker` integration
   - Test all flows end-to-end

4. **Phase 4: Optimization** (Week 4)
   - Add lazy loading for heavy components
   - Implement proper error boundaries
   - Add comprehensive testing
   - Performance optimization

## Usage

### Import from the module

\`\`\`typescript
import {
  MultiViewEditor,
  useEditorStore,
  useImageGeneration,
  ChatInterface,
  ViewsDisplay,
  // ... other exports
} from '@/modules/ai-designer';
\`\`\`

### Use the modular MultiViewEditor

\`\`\`typescript
import { MultiViewEditor } from '@/modules/ai-designer';

function AIDesignerPage() {
  return (
    <MultiViewEditor
      isOpen={true}
      onClose={() => {}}
      productId="product-123"
      productName="My Product"
      currentViews={{ front: '', back: '', side: '' }}
      revisions={[]}
      onEditViews={async () => ({ success: true })}
    />
  );
}
\`\`\`

### Access stores directly

\`\`\`typescript
import { useEditorStore } from '@/modules/ai-designer';

function MyComponent() {
  const { currentViews, setCurrentViews } = useEditorStore();
  // Use store state and actions
}
\`\`\`

## Benefits

1. **Maintainability**: No file exceeds 500 lines (vs 4,912 lines originally)
2. **Testability**: Isolated logic in hooks and services
3. **Reusability**: Components can be used independently
4. **Performance**: Better code splitting and lazy loading
5. **Developer Experience**: Clear module boundaries and self-documenting structure

## Testing

\`\`\`bash
# Unit tests for utilities
npm test modules/ai-designer/utils

# Component tests
npm test modules/ai-designer/components

# Integration tests
npm test modules/ai-designer
\`\`\`

## Contributing

When adding new features:
1. Place types in `/types`
2. Add utilities in `/utils`
3. Create services in `/services`
4. Build hooks in `/hooks`
5. Develop components in `/components`
6. Update relevant stores in `/store`

## Notes

- The original `multiview-editor.tsx` is preserved during migration
- Both implementations can run in parallel until migration is complete
- All new features should be added to the modular version
- The modular structure follows React best practices and clean architecture principles
