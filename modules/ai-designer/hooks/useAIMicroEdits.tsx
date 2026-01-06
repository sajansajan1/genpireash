/**
 * useAIMicroEdits hook - handles annotation-based editing functionality
 * Separated from ViewsDisplay for better modularity and reusability
 */

import React, { useState } from "react";
import { useEditorStore } from "../store/editorStore";
import { useAnnotationStore } from "../store/annotationStore";
import { useViewportControls } from "./useViewportControls";
import { useChatStore } from "../store/chatStore";
import type { ViewType } from "../types";
import { devLog, devLogOnce } from "../utils/devLogger";

interface UseAIMicroEditsProps {
  onAnalysisComplete?: (analysisData: any) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  sendUserMessage?: (
    content: string,
    onEditViews?: (currentViews: any, prompt: string) => Promise<void>,
    selectedRevision?: any
  ) => Promise<void>;
  onEditViews?: (currentViews: any, prompt: string) => Promise<void>;
}

export const useAIMicroEdits = ({
  onAnalysisComplete,
  containerRef,
  sendUserMessage,
  onEditViews,
}: UseAIMicroEditsProps) => {
  const { isVisualEditMode, setVisualEditMode } = useEditorStore();
  const { zoomLevel } = useViewportControls();
  const {
    annotations,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
    undo,
    clearAnnotations,
  } = useAnnotationStore();
  const { addMessage } = useChatStore();

  // Annotation state
  const [, setActiveAnnotation] = useState<string | null>(null);
  const [annotationInput, setAnnotationInput] = useState("");
  const [pendingAnnotation, setPendingAnnotation] = useState<{
    id: string;
    x: number;
    y: number;
    view: ViewType;
  } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [draggedAnnotation, setDraggedAnnotation] = useState<string | null>(
    null
  );
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Click handler for individual view containers
  const handleAddAnnotationPoint = (
    e: React.MouseEvent<HTMLDivElement>,
    view: ViewType
  ) => {
    devLog("annotation-add", { view }, "Adding annotation point");

    // Don't add new point if we're already editing one
    if (pendingAnnotation) {
      devLog("annotation-add-skip", "Pending annotation exists", "Skipping");
      return;
    }

    // Find the main container (the one that has the transform scale)
    let mainContainer = containerRef.current;
    if (!mainContainer) {
      console.error("❌ Could not find main container");
      return;
    }

    // The annotation overlay is positioned relative to this main container
    const mainRect = mainContainer.getBoundingClientRect();

    // Calculate position relative to main container
    let x = e.clientX - mainRect.left;
    let y = e.clientY - mainRect.top;

    devLog("annotation-coords", { x, y, zoomLevel }, "Coordinate calculation");

    // No need to adjust for zoom scaling since the overlay is also scaled
    // The transform: scale() is applied to the parent, so coordinates are already in the right space

    // Store which view was clicked for filtering
    const annotationId = `annotation-${Date.now()}`;
    setPendingAnnotation({
      id: annotationId,
      x,
      y,
      view,
    });
    setActiveAnnotation(annotationId);
    setAnnotationInput("");

    devLog(
      "annotation-created",
      { annotationId },
      "Pending annotation created"
    );
  };

  // Handle saving annotation text
  const handleSaveAnnotation = () => {
    if (!pendingAnnotation || !annotationInput.trim()) {
      console.warn("⚠️ Cannot save annotation:", {
        hasPendingAnnotation: !!pendingAnnotation,
        hasInput: !!annotationInput.trim(),
        input: annotationInput,
      });
      return;
    }

    // Create annotation with correct structure
    const newAnnotation = {
      id: pendingAnnotation.id,
      x: pendingAnnotation.x,
      y: pendingAnnotation.y,
      label: annotationInput.trim(),
      isEditing: false,
      viewType: pendingAnnotation.view,
      type: "point" as const,
    };

    devLog(
      "annotation-save",
      { id: newAnnotation.id, label: newAnnotation.label },
      "Saving annotation"
    );

    // Add to store
    addAnnotation(newAnnotation);

    // Clear pending state
    setPendingAnnotation(null);
    setActiveAnnotation(null);
    setAnnotationInput("");

    devLog("annotation-saved", { id: newAnnotation.id }, "Annotation saved");
  };

  // Handle canceling annotation
  const handleCancelAnnotation = () => {
    setPendingAnnotation(null);
    setActiveAnnotation(null);
    setAnnotationInput("");
  };

  // Handle deleting annotation
  const handleDeleteAnnotation = (
    annotationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    removeAnnotation(annotationId);
  };

  // Handle starting drag
  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    annotationId: string
  ) => {
    e.stopPropagation();

    setIsDragging(true);
    setDraggedAnnotation(annotationId);

    const rect = e.currentTarget.getBoundingClientRect();
    let offsetX = e.clientX - rect.left;
    let offsetY = e.clientY - rect.top;

    // Adjust offset for zoom scaling
    const scale = zoomLevel / 100;
    offsetX = offsetX / scale;
    offsetY = offsetY / scale;

    setDragOffset({
      x: offsetX,
      y: offsetY,
    });
  };

  // Handle mouse move for dragging at grid level
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !draggedAnnotation) return;

    const rect = e.currentTarget.getBoundingClientRect();
    let newX = e.clientX - rect.left - dragOffset.x;
    let newY = e.clientY - rect.top - dragOffset.y;

    // Adjust for zoom scaling
    const scale = zoomLevel / 100;
    newX = newX / scale;
    newY = newY / scale;

    // Update annotation position with bounds checking
    updateAnnotation(draggedAnnotation, {
      x: Math.max(0, Math.min(rect.width / scale, newX)),
      y: Math.max(0, Math.min(rect.height / scale, newY)),
    });
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDraggedAnnotation(null);
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Handle undo
  const handleUndo = () => {
    undo();
  };

  // Handle cancel all annotations
  const handleCancel = () => {
    clearAnnotations();
    setVisualEditMode(false);

    // Clear pending annotation if any
    setPendingAnnotation(null);
    setActiveAnnotation(null);
    setAnnotationInput("");
  };

  // Generate comprehensive analysis prompt from annotation points
  const generateAnnotationAnalysisPrompt = (annotations: any[]) => {
    const annotationDetails = annotations
      .map((annotation, index) => {
        const viewName = annotation.viewType || "unknown view";
        const position = `(${Math.round(annotation.x)}, ${Math.round(annotation.y)})`;
        return `• **Point ${index + 1}** - ${viewName.toUpperCase()} VIEW at position ${position}:\n  Request: "${
          annotation.label
        }"`;
      })
      .join("\n\n");

    return `🎯 **PRODUCT DESIGN ANALYSIS REQUEST**

I've annotated this multi-view product design with ${annotations.length} specific edit point(s). Please provide a comprehensive analysis and actionable recommendations for each annotation.

**ANNOTATION DETAILS:**
${annotationDetails}

**ANALYSIS REQUIREMENTS:**
1. **Visual Understanding**: Carefully examine each marked point in the screenshot and understand its location on the specific product view
2. **Context Analysis**: Consider how each requested change affects the overall design, functionality, and manufacturing
3. **Detailed Recommendations**: For each point, provide:
   - Specific technical guidance on how to implement the requested change
   - Potential challenges or considerations
   - Impact on other views or product aspects
   - Material, color, or structural recommendations where applicable
4. **Implementation Priority**: Suggest the order of implementation if multiple changes are requested
5. **Design Coherence**: Ensure all recommendations maintain design consistency across all views

**RESPONSE FORMAT:**
Please structure your response with clear sections for each annotation point, providing detailed, actionable guidance that a product designer can implement.`;
  };

  // Handle apply edits - capture screenshot and analyze
  const handleApplyEdits = async () => {
    if (!annotations || annotations.length === 0) {
      handleCancel();
      return;
    }

    // Prevent multiple clicks
    if (isApplying) {
      devLog("apply-edits-skip", "Already applying", "Skipping");
      return;
    }

    setIsApplying(true);

    try {
      // Get the views grid element from parent component
      const viewsGrid = containerRef.current;
      if (!viewsGrid) {
        throw new Error("Views grid not available for screenshot");
      }

      devLog(
        "screenshot-capture",
        { annotationCount: annotations.length, isVisualEditMode },
        "Capturing screenshot"
      );

      // Ensure annotations are visible by checking visual edit mode
      if (!isVisualEditMode) {
        console.warn(
          "⚠️ Visual edit mode is false - annotations may not be visible!"
        );
        // Force visual edit mode temporarily for capture
        setVisualEditMode(true);
        // Wait for re-render
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Import the capture function
      const { captureAnnotatedScreenshot } = await import(
        "../services/annotationCapture"
      );

      // Capture screenshot with annotation points visible
      const annotatedScreenshotUrl = await captureAnnotatedScreenshot(
        viewsGrid,
        annotations
      );

      if (!annotatedScreenshotUrl) {
        throw new Error("Failed to capture annotated screenshot");
      }

      devLog(
        "screenshot-success",
        { url: annotatedScreenshotUrl },
        "Screenshot captured"
      );

      // Generate analysis prompt based on annotation points
      const analysisPrompt = generateAnnotationAnalysisPrompt(annotations);

      // Store analysis data in local storage for chat interface to pick up (fallback)
      const analysisData = {
        screenshotUrl: annotatedScreenshotUrl,
        analysisPrompt,
        annotations,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem("pendingAnalysis", JSON.stringify(analysisData));

      // Clear annotations and exit visual edit mode AFTER screenshot is captured
      clearAnnotations();
      setVisualEditMode(false);

      // Send analysis directly to chat if sendUserMessage is available
      if (sendUserMessage) {
        devLog("send-to-chat", "Sending analysis to chat");
        try {
          // Generate a simplified edit prompt from annotations for image generation
          const editPrompt = annotations
            .map((annotation) => annotation.label)
            .join(". ");

          // Use Vision API to optimize the prompt (matching chat flow behavior)
          // This ensures the AI preserves all details except the requested changes
          let optimizedPrompt = editPrompt;

          if (annotatedScreenshotUrl) {
            devLog(
              "vision-optimization",
              "Using Vision API to optimize annotation prompt"
            );

            // Add progress message to chat
            const analysisMessageId = `analysis-${Date.now()}`;
            addMessage({
              id: analysisMessageId,
              message_type: "processing",
              content:
                "Analyzing your design and annotations to preserve all details...",
              created_at: new Date().toISOString(),
            });

            const visionPrompt = `You are an expert at analyzing product designs and writing prompts for AI image generation.

Look at the provided product image with annotations and create a precise edit prompt.

REQUESTED CHANGES (from annotations):
${annotations.map((a, i) => `${i + 1}. ${a.label}`).join("\n")}

Create a simple, clear prompt that:
1. Identifies the EXACT product type from the image (including brand, logo, style)
2. Applies ONLY the specific changes requested in the annotations
3. KEEPS ALL OTHER DETAILS UNCHANGED (size, colors, logo, materials, features, proportions)

Output a simple prompt like:
"Generate three views of [exact product from image] with [specific changes from annotations].
CRITICAL: Keep ALL other details exactly as shown in the reference image - same dimensions, same resolution, same logo design and placement, same colors, same materials, same features, same style, same proportions. Change ONLY what the annotations specifically request."`;

            try {
              const visionResponse = await fetch("/api/ai-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  prompt: visionPrompt,
                  imageUrl: annotatedScreenshotUrl,
                  temperature: 0.7,
                  max_tokens: 1000,
                  useVision: true,
                }),
              });

              if (visionResponse.ok) {
                const visionData = await visionResponse.json();
                optimizedPrompt =
                  visionData.suggestion || visionData.message || editPrompt;
                devLog("vision-success", "Vision API optimized the prompt");

                // Update message to show completion
                addMessage({
                  id: `analysis-complete-${Date.now()}`,
                  message_type: "success",
                  content:
                    "Analysis complete! Applying your changes while preserving all other details...",
                  created_at: new Date().toISOString(),
                });
              } else {
                devLog(
                  "vision-fallback",
                  "Vision API failed, using simple prompt"
                );
                // Update message to show fallback
                addMessage({
                  id: `analysis-fallback-${Date.now()}`,
                  message_type: "system",
                  content: "Quick analysis mode - applying your changes...",
                  created_at: new Date().toISOString(),
                });
              }
            } catch (visionError) {
              console.error("Vision API error:", visionError);
              devLog("vision-error", "Vision API error, using simple prompt");
              // Update message to show error
              addMessage({
                id: `analysis-error-${Date.now()}`,
                message_type: "system",
                content: "Analysis skipped - applying your changes...",
                created_at: new Date().toISOString(),
              });
            }
          }

          // Include screenshot URL in the final prompt
          const editPromptWithScreenshot = `${optimizedPrompt}\n\n[Current Design Screenshot: ${annotatedScreenshotUrl}]`;

          await sendUserMessage(
            analysisPrompt, // Still send the full analysis prompt to chat for user feedback
            onEditViews
              ? async (currentViews: any) => {
                  devLog(
                    "trigger-generation",
                    "Triggering image generation with optimized prompt"
                  );
                  // Pass the Vision-optimized prompt WITH screenshot
                  await onEditViews(currentViews, editPromptWithScreenshot);
                }
              : undefined
          );
          devLog("chat-success", "Analysis sent to chat");
        } catch (chatError) {
          console.error("❌ Failed to send to chat:", chatError);
          // Chat sending failed, but we still have the localStorage fallback
        }
      }

      // Notify parent that analysis is complete
      onAnalysisComplete?.(analysisData);
    } catch (error) {
      alert(
        `Failed to process annotation points: ${error instanceof Error ? error.message : "Unknown error"}`
      );

      // Error occurred before we could clear, so clear now to prevent stuck state
      clearAnnotations();
      setVisualEditMode(false);
      setIsApplying(false);
    }
  };

  // Render annotation overlay at grid level
  const renderAnnotationOverlay = () => {
    devLog(
      "render-overlay",
      { isVisualEditMode, count: annotations.length },
      "Rendering annotation overlay"
    );

    if (!isVisualEditMode) return null;

    return (
      <div
        className="absolute inset-0 z-30 cursor-crosshair pointer-events-none"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {/* Render all saved annotation points */}
        {annotations.map((annotation: any) => {
          devLog(
            `render-annotation-${annotation.id}`,
            { x: annotation.x, y: annotation.y },
            `Rendering ${annotation.id}`
          );
          return (
            <div
              key={annotation.id}
              className="absolute z-50 pointer-events-auto"
              style={{
                left: `${annotation.x}px`,
                top: `${annotation.y}px`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Draggable annotation point - black filled with white border */}
              <div
                className="w-3 h-3 bg-black rounded-full border-2 border-white shadow-lg cursor-move hover:bg-gray-800 transition-colors"
                onMouseDown={(e) => handleMouseDown(e, annotation.id)}
              ></div>

              {/* Connecting line from dot center to label - positioned absolutely from dot */}
              {annotation.label && (
                <div
                  className="absolute bg-black"
                  style={{
                    width: "2px",
                    height: "18px",
                    left: "50%",
                    top: "6px", // Start from center of 12px dot (w-3 h-3)
                    transform: "translateX(-50%)",
                  }}
                ></div>
              )}

              {/* Only show text box if label exists */}
              {annotation.label && (
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                  {/* Text display box - multiline with fixed width */}
                  <div
                    className="bg-white rounded-lg shadow-lg border border-gray-300 p-2 min-w-[200px] max-w-[200px] group cursor-move hover:bg-gray-50 transition-colors"
                    onMouseDown={(e) => handleMouseDown(e, annotation.id)}
                  >
                    <div className="text-sm text-gray-800 break-words leading-relaxed whitespace-pre-wrap">
                      {annotation.label}
                    </div>
                    {/* Delete button - appears on hover */}
                    <button
                      onClick={(e) => handleDeleteAnnotation(annotation.id, e)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      title="Delete annotation"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Render pending annotation with inline input */}
        {pendingAnnotation && (
          <div
            className="absolute z-[100] pointer-events-auto"
            style={{
              left: `${pendingAnnotation.x}px`,
              top: `${pendingAnnotation.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Annotation point - black filled with white border */}
            <div className="w-3 h-3 bg-black rounded-full border-2 border-white shadow-lg"></div>

            {/* Connecting line from dot center to input - positioned absolutely from dot */}
            <div
              className="absolute bg-black"
              style={{
                width: "2px",
                height: "18px",
                left: "50%",
                top: "6px", // Start from center of 12px dot (w-3 h-3)
                transform: "translateX(-50%)",
              }}
            ></div>

            {/* Connection line and input box */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
              {/* Input box - multiline with fixed width */}
              <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-2 min-w-[200px] max-w-[200px]">
                <textarea
                  value={annotationInput}
                  onChange={(e) => setAnnotationInput(e.target.value)}
                  placeholder="Describe your edit..."
                  className="w-full px-2 py-1 border-0 text-sm focus:outline-none placeholder-gray-400 resize-none min-h-[60px]"
                  autoFocus
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.metaKey) {
                      handleSaveAnnotation();
                    } else if (e.key === "Escape") {
                      handleCancelAnnotation();
                    }
                  }}
                />
                <div className="flex gap-1.5 mt-2">
                  <button
                    onClick={handleSaveAnnotation}
                    disabled={!annotationInput.trim()}
                    className="px-3 py-1 bg-gray-800 text-white text-xs rounded hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelAnnotation}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render annotation controls - simplified and compact
  const renderAnnotationControls = () => {
    if (!isVisualEditMode) return null;

    return (
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-4 z-[110]">
        <div className="bg-white rounded-full shadow-lg px-5 py-2.5 flex items-center gap-4 border border-gray-200 min-w-[520px]">
          <span className="text-xs font-medium text-gray-900">
            {annotations.length} annotation{annotations.length !== 1 ? "s" : ""}
          </span>
          <div className="flex gap-3 ml-auto">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-full text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyEdits}
              disabled={annotations.length === 0 || isApplying}
              className="px-4 py-2 rounded-full text-xs font-medium transition-colors shadow-sm"
              style={{
                backgroundColor:
                  annotations.length === 0 || isApplying
                    ? "#9CA3AF"
                    : "#111827",
                color: "white",
                cursor:
                  annotations.length === 0 || isApplying
                    ? "not-allowed"
                    : "pointer",
              }}
              onMouseEnter={(e) => {
                if (annotations.length > 0 && !isApplying) {
                  e.currentTarget.style.backgroundColor = "#1F2937";
                }
              }}
              onMouseLeave={(e) => {
                if (annotations.length > 0) {
                  e.currentTarget.style.backgroundColor = "#111827";
                }
              }}
            >
              {isApplying ? "Applying..." : "Apply"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return {
    renderAnnotationOverlay,
    renderAnnotationControls,
    handleAddAnnotationPoint,
    isVisualEditMode,
    annotations,
    handleUndo,
    handleCancel,
  };
};
