# AI Designer Modular Version - Testing Guide

## 🚀 Quick Start Testing

### 1. Access the AI Designer Page

Navigate to the AI Designer page with a project ID:
\`\`\`
http://localhost:3000/ai-designer?projectId=[YOUR_PROJECT_ID]
\`\`\`

### 2. Toggle Between Versions

Look for the **toggle button** in the top-right corner:
- **"Using Original Version"** - The existing 4,912-line component
- **"Using Modular Version"** - The new clean architecture implementation

Click to switch between versions at any time!

## 🧪 Testing Scenarios

### Test Case 1: Basic UI Components

**Modular Version Should Display:**

1. **Header Section**
   - Product name
   - Revision counter
   - Toolbar with zoom, visual edit, save, and tech pack buttons

2. **Three-Panel Layout**
   - Left: Revision History (desktop only)
   - Center: Product Views (Front, Back, Side)
   - Right: AI Chat Interface (desktop only)

3. **Bottom Section**
   - Edit prompt input area
   - Quick action buttons

**Steps to Test:**
1. Open the modular version
2. Verify all UI components are visible
3. Check responsive behavior (resize window)
4. Verify mobile layout shows tabs at bottom

### Test Case 2: Image Display & Loading States

**Test Loading States:**
1. Watch for loading overlays on each view
2. Check for "Generating..." text during processing
3. Verify smooth transitions when images load

**Test Zoom Controls:**
1. Click Zoom In (+) button - views should enlarge
2. Click Zoom Out (-) button - views should shrink
3. Click Reset (↻) button - should return to 95% zoom

### Test Case 3: Chat Interface

**Test Chat Functionality:**

1. **Send a Design Edit Message:**
   \`\`\`
   "Make the product more colorful"
   \`\`\`
   - Should detect intent as "Design Edit Request"
   - Should show processing state
   - Should attempt to edit the design

2. **Send a Question:**
   \`\`\`
   "What materials is this made from?"
   \`\`\`
   - Should detect intent as "Question"
   - Should provide conversational response

3. **Use Quick Actions:**
   - Click "🎨 Add Color" button
   - Click "🧵 Change Material" button
   - Click "✨ Modernize" button
   - Each should populate the input field

### Test Case 4: Revision History

**Test Revision Management:**

1. **View Revisions:**
   - Check revision list shows all past edits
   - Active revision should be highlighted in blue
   - Each revision shows timestamp and edit prompt

2. **Rollback Function:**
   - Click "Rollback" on an older revision
   - Should revert to that version
   - Button should be disabled for active revision

3. **Delete Revision:**
   - Click trash icon on a revision
   - Should remove from list

### Test Case 5: Visual Edit Mode

**Test Annotation Tools:**

1. Click the Pen (✏️) button in toolbar
2. Should enable visual edit mode
3. Try clicking on views to add annotations
4. Test undo functionality (Ctrl/Cmd + Z)

### Test Case 6: State Management

**Test Zustand Store Integration:**

1. **Make an edit in chat**
2. **Switch to original version**
3. **Switch back to modular version**
4. State should persist correctly

## 🔍 Debug Testing

### Console Monitoring

Open browser DevTools and monitor for:

1. **Store Updates:**
   \`\`\`javascript
   // In console, you can inspect stores:
   window.__ZUSTAND_DEVTOOLS__
   \`\`\`

2. **API Calls:**
   - Watch Network tab for `/api/ai-chat` calls
   - Check for proper intent detection
   - Verify image generation requests

3. **Error Handling:**
   - Look for error boundaries catching issues
   - Check console for error messages

### Performance Testing

1. **Component Re-renders:**
   - Use React DevTools Profiler
   - Check that only affected components re-render

2. **Memory Usage:**
   - Monitor memory in Performance tab
   - Check for memory leaks during extended use

## 📊 Comparison Checklist

Compare both versions for:

| Feature | Original | Modular | Status |
|---------|----------|---------|--------|
| Image Display | ✓ | ✓ | ✅ |
| Chat Interface | ✓ | ✓ | ✅ |
| Revision History | ✓ | ✓ | ✅ |
| Zoom Controls | ✓ | ✓ | ✅ |
| Visual Edit Mode | ✓ | ✓ | 🚧 |
| Intent Detection | ✓ | ✓ | ✅ |
| Screenshot Capture | ✓ | ✓ | ✅ |
| State Persistence | ✓ | ✓ | ✅ |
| Mobile Responsive | ✓ | ✓ | ✅ |
| Error Handling | ✓ | ✓ | ✅ |

## 🐛 Known Issues & Workarounds

### Issue 1: Visual Edit Mode
- **Status**: Partially implemented
- **Workaround**: Use original version for complex annotations

### Issue 2: Initial Generation
- **Status**: Service stub needs full implementation
- **Workaround**: Use original version for initial generation

## 🎯 Testing Commands

### Quick Test URLs

\`\`\`bash
# Test with existing project
http://localhost:3000/ai-designer?projectId=123

# Test initial generation flow
http://localhost:3000/ai-designer

# Test with specific product
http://localhost:3000/ai-designer?projectId=YOUR_PROJECT_ID
\`\`\`

### Browser Testing

Test in multiple browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Device Testing

Test responsive design:
- Desktop (1920x1080)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667)

## 📝 Reporting Issues

When reporting issues, include:

1. **Version**: Original or Modular
2. **Steps to Reproduce**
3. **Expected Behavior**
4. **Actual Behavior**
5. **Console Errors** (if any)
6. **Screenshots** (if applicable)
7. **Browser & OS**

## ✅ Testing Verification

### Successful Test Indicators:

1. ✅ All UI components render correctly
2. ✅ Chat messages appear with proper styling
3. ✅ Intent detection shows correct badges
4. ✅ Zoom controls affect all three views
5. ✅ Revision history updates on changes
6. ✅ Mobile layout shows tabs correctly
7. ✅ No console errors during normal use
8. ✅ State persists when switching versions
9. ✅ Loading states show appropriately
10. ✅ Error boundaries catch and display errors gracefully

## 🚦 Go/No-Go Criteria

### Ready for Production When:

- [ ] All test cases pass
- [ ] No critical console errors
- [ ] Performance metrics match or exceed original
- [ ] Mobile experience is smooth
- [ ] State management is reliable
- [ ] Error handling is comprehensive
- [ ] User feedback is positive

## 📞 Support

If you encounter issues during testing:

1. Check this guide first
2. Review console for errors
3. Try toggling to original version
4. Clear browser cache and retry
5. Report persistent issues with details

---

**Happy Testing! 🎉**

Remember: The toggle button lets you switch between versions instantly, making A/B testing easy!
