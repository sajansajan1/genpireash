# ✨ New Feature: Image Tools

## 🎯 Overview

Instead of just uploading an image and typing what it's for, users now select a **tool type** before uploading, which automatically enhances their prompt based on the intended use.

## 🛠️ Tool Types

Users can choose from 3 tool types when uploading an image:

### 1. **Logo** 🎨
- **Purpose**: Brand logo to apply on the design
- **Auto-enhancement**: "Apply this logo to the design. Place it prominently on the product."
- **Icon**: Sparkles (✨)
- **Color**: Blue

### 2. **Sketch** ✏️
- **Purpose**: Hand-drawn sketch or concept art
- **Auto-enhancement**: "Use this sketch as the design concept. Recreate this design professionally on the product."
- **Icon**: FileImage (📄)
- **Color**: Purple

### 3. **Reference Image** 🖼️
- **Purpose**: Inspiration or style reference
- **Auto-enhancement**: "Use this as a reference for the style, colors, and overall aesthetic of the design."
- **Icon**: Image (🖼️)
- **Color**: Green

## 📝 User Flow

### Before (Old):
1. Click upload button
2. Select file
3. File uploads
4. User types: "This is my logo, please add it to the design"
5. Send

### After (New):
1. Click upload button (now labeled "Tools")
2. Select file
3. **🆕 Tool selection dialog appears**
4. User selects tool type (logo/sketch/reference)
5. User optionally adds notes
6. Click "Upload & Continue"
7. File uploads with tool context
8. **Prompt is automatically enhanced**
9. Send

## 🎨 Dialog Design

\`\`\`
┌─────────────────────────────────────┐
│  Select Image Tool                  │
├─────────────────────────────────────┤
│  What type of image are you         │
│  uploading? This helps us better    │
│  understand your needs.             │
│                                     │
│  📄 example.jpg                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ✨ Logo                      │   │
│  │ Your brand logo to apply    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📄 Sketch                    │   │
│  │ Hand-drawn sketch or        │   │
│  │ concept art                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🖼️  Reference Image          │   │
│  │ Inspiration or style ref    │   │
│  └─────────────────────────────┘   │
│                                     │
│  Additional Notes (Optional)        │
│  ┌─────────────────────────────┐   │
│  │ Add specific instructions...│   │
│  └─────────────────────────────┘   │
│                                     │
│     [Cancel]  [Upload & Continue]   │
└─────────────────────────────────────┘
\`\`\`

## 💻 Technical Implementation

### Files Created:
- `modules/ai-designer/components/ChatInterface/ImageToolDialog.tsx`

### Files Modified:
- `modules/ai-designer/components/ChatInterface/index.tsx`

### New State Variables:

\`\`\`typescript
const [isToolDialogOpen, setIsToolDialogOpen] = useState(false);
const [pendingFile, setPendingFile] = useState<File | null>(null);
const [uploadedImage, setUploadedImage] = useState<{
  file: File;
  preview: string;
  url?: string;
  toolSelection?: ImageToolSelection; // NEW
} | null>(null);
\`\`\`

### New Types:

\`\`\`typescript
export type ImageToolType = "logo" | "sketch" | "reference";

export interface ImageToolSelection {
  toolType: ImageToolType;
  note?: string;
}
\`\`\`

### Flow:

\`\`\`typescript
// 1. User clicks upload → File selected
handleImageSelect(e) {
  setPendingFile(file);
  setIsToolDialogOpen(true); // Show dialog
}

// 2. User selects tool type → Confirms
handleToolConfirm(toolSelection) {
  setUploadedImage({ file, preview, toolSelection });
  // Upload file...
}

// 3. User sends message → Prompt enhanced
if (uploadedImage?.toolSelection) {
  messageToSend = enhancePromptWithTool(trimmedValue, toolSelection);
}
\`\`\`

### Prompt Enhancement Function:

\`\`\`typescript
export function enhancePromptWithTool(
  originalPrompt: string,
  toolSelection: ImageToolSelection
): string {
  const parts: string[] = [];

  // 1. Add tool-specific enhancement
  parts.push(toolOption.promptEnhancement);

  // 2. Add user's note (optional)
  if (toolSelection.note) {
    parts.push(toolSelection.note);
  }

  // 3. Add original prompt (optional)
  if (originalPrompt.trim()) {
    parts.push(originalPrompt);
  }

  return parts.join(" ");
}
\`\`\`

## 📊 Example Prompts

### Example 1: Logo Upload

**User action:**
- Uploads `mylogo.png`
- Selects: **Logo**
- Note: "Place on the left chest"
- Types: "Blue t-shirt"

**Final prompt sent to AI:**
\`\`\`
Apply this logo to the design. Place it prominently on the product. Place on the left chest. Blue t-shirt
\`\`\`

### Example 2: Sketch Upload

**User action:**
- Uploads `sketch.jpg`
- Selects: **Sketch**
- Note: "" (empty)
- Types: "Make it realistic"

**Final prompt sent to AI:**
\`\`\`
Use this sketch as the design concept. Recreate this design professionally on the product. Make it realistic
\`\`\`

### Example 3: Reference Image Upload

**User action:**
- Uploads `inspiration.png`
- Selects: **Reference Image**
- Note: "I love the color palette"
- Types: "" (empty)

**Final prompt sent to AI:**
\`\`\`
Use this as a reference for the style, colors, and overall aesthetic of the design. I love the color palette
\`\`\`

## 🎯 Benefits

### For Users:
- ✅ **No need to explain** what the image is for
- ✅ **Faster workflow** - select tool type, done
- ✅ **Better results** - AI understands intent clearly
- ✅ **Optional notes** for specific instructions
- ✅ **Clear visual feedback** - icons and colors

### For AI:
- ✅ **Clear context** about image purpose
- ✅ **Better prompt quality** - structured enhancement
- ✅ **Consistent results** - standardized instructions
- ✅ **Less ambiguity** - predefined use cases

## 🔧 Customization

### Adding New Tool Types:

\`\`\`typescript
// In ImageToolDialog.tsx
const TOOL_OPTIONS = [
  // ... existing tools
  {
    type: "pattern", // NEW
    label: "Pattern",
    description: "Repeating pattern or texture",
    icon: Grid,
    color: "border-orange-500 bg-orange-50",
    promptEnhancement: "Use this pattern across the entire product surface.",
  },
];
\`\`\`

### Modifying Prompt Templates:

Edit `promptEnhancement` in `TOOL_OPTIONS` array to change auto-generated prompts.

## 📱 UI/UX Details

### Button:
- **Label**: "Tools" (tooltip)
- **Icon**: ImagePlus (📸)
- **States**:
  - Normal: Gray border
  - Hover: Light gray background
  - Disabled: 40% opacity
  - Active: Darker gray background

### Dialog:
- **Size**: 500px max width
- **Position**: Center screen
- **Overlay**: Semi-transparent backdrop
- **Animation**: Fade in/out
- **Responsive**: Adapts to mobile

### Tool Cards:
- **Layout**: Full width, stacked
- **States**:
  - Unselected: White background, gray border
  - Selected: Colored background (blue/purple/green), colored border
  - Hover: Shadow effect
- **Accessibility**: Keyboard navigable, screen reader friendly

## ✅ Testing Checklist

- [ ] Dialog opens when file is selected
- [ ] All 3 tool types can be selected
- [ ] Optional note field works
- [ ] Cancel button resets state and clears file input
- [ ] Upload & Continue button is disabled until tool selected
- [ ] Prompt enhancement works for each tool type
- [ ] Prompt includes user's note when provided
- [ ] Prompt includes original message when provided
- [ ] File uploads successfully after tool selection
- [ ] Dialog closes after confirmation
- [ ] Image preview displays correctly in chat
- [ ] Multiple uploads in succession work

---

**Status**: ✅ Implemented - Ready to test
**Last Updated**: 2025-11-08
**Files Added**: 1 new component
**Files Modified**: 1 (ChatInterface)
