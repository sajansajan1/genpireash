/**
 * ViewsDisplay component for showing product images with annotation support
 * Connected to Zustand store for state management
 * Now uses useAIMicroEdits hook for annotation functionality
 */

import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { useEditorStore } from "../../store/editorStore";
import { useViewportControls } from "../../hooks/useViewportControls";
import { useAIMicroEdits } from "../../hooks/useAIMicroEdits";
import { useSingleViewRegeneration } from "../../hooks/useSingleViewRegeneration";
import { LoadingSkeleton } from "../common/LoadingSkeleton";
import { ImageViewerModal } from "@/app/product/shared/ImageViewerModal";
import { SingleViewControls } from "../SingleViewControls";
import { Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewType } from "../../types";

interface ViewsDisplayProps {
  onViewClick?: (view: ViewType) => void;
  sendUserMessage?: (
    content: string,
    onEditViews?: (currentViews: any, prompt: string) => Promise<void>,
    selectedRevision?: any
  ) => Promise<void>;
  onEditViews?: (currentViews: any, prompt: string) => Promise<void>;
  isLoadingState?: boolean; // Blur effect when loading product state
  // Single view regeneration props
  productId?: string | null;
  currentRevisionId?: string | null;
  onSingleViewRegenerated?: (
    viewType: ViewType,
    newUrl: string,
    newRevisionId: string,
    newRevisionNumber: number
  ) => void;
  enableSingleViewEdit?: boolean; // Feature flag
}

export const ViewsDisplay = forwardRef<HTMLDivElement, ViewsDisplayProps>(
  ({
    onViewClick,
    sendUserMessage,
    onEditViews,
    isLoadingState = false,
    productId,
    currentRevisionId,
    onSingleViewRegenerated,
    enableSingleViewEdit = false,
  }, ref) => {
    const {
      currentViews,
      loadingViews,
      currentProcessingView,
      isVisualEditMode,
    } = useEditorStore();
    const { zoomLevel } = useViewportControls();
    const containerRef = useRef<HTMLDivElement>(null);

    // Canvas dragging state
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

    // AI Micro Edits functionality
    const microEdits = useAIMicroEdits({
      containerRef: containerRef as React.RefObject<HTMLDivElement>,
      onAnalysisComplete: () => {
        // Trigger analysis view after annotation analysis is complete
        onViewClick?.("front" as ViewType);
      },
      sendUserMessage,
      onEditViews,
    });

    // Single view regeneration functionality
    const { regenerateView, isViewRegenerating } = useSingleViewRegeneration({
      productId: productId || null,
      currentRevisionId: currentRevisionId || null,
      currentViews,
      onViewRegenerated: onSingleViewRegenerated,
    });

    // Zoom modal state
    const [zoomModalOpen, setZoomModalOpen] = useState(false);
    const [zoomView, setZoomView] = useState<ViewType | null>(null);

    // Expose ref to parent for screenshot capture
    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    // Handle zoom modal
    const openZoomModal = (view: ViewType) => {
      if (currentViews[view]) {
        setZoomView(view);
        setZoomModalOpen(true);
      }
    };

    const closeZoomModal = () => {
      setZoomModalOpen(false);
      setZoomView(null);
    };

    // Canvas dragging handlers - Mouse events
    const handleMouseDown = (e: React.MouseEvent) => {
      // Only enable dragging in non-visual-edit mode and if not clicking on a view card
      if (isVisualEditMode) return;

      const target = e.target as HTMLElement;
      // Don't start dragging if clicking on a view card or its children
      if (target.closest("[data-view]")) return;

      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPanOffset({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleMouseLeave = () => {
      setIsDragging(false);
    };

    // Canvas dragging handlers - Touch events for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
      // Only enable dragging in non-visual-edit mode and if not touching a view card
      if (isVisualEditMode) return;

      const target = e.target as HTMLElement;
      // Don't start dragging if touching on a view card or its children
      if (target.closest("[data-view]")) return;

      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - panOffset.x,
        y: touch.clientY - panOffset.y,
      });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging) return;

      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;
      setPanOffset({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    // All annotation logic moved to useAIMicroEdits hook

    const renderViewCard = (view: ViewType) => {
      const isLoading = loadingViews[view];
      const isProcessing = currentProcessingView === view;
      const hasImage = currentViews[view] && currentViews[view] !== "";

      // Canvas references removed - using DOM-based annotation system

      return (
        <div key={view} className="text-center" data-view={view}>
          <h3 className="text-[11px] sm:text-sm font-medium mb-2 sm:mb-3 text-muted-foreground uppercase tracking-wider">
            {view.charAt(0).toUpperCase() + view.slice(1)} View
          </h3>
          <div className="relative group">
            <div
              className={cn(
                "relative w-full max-w-[350px] mx-auto aspect-square transition-transform min-h-[200px] sm:min-h-[250px]",
                !isVisualEditMode &&
                  hasImage &&
                  "cursor-pointer hover:scale-105",
                isVisualEditMode && "cursor-crosshair",
                isProcessing && "ring-2 ring-navy ring-offset-2"
              )}
              data-view={view}
              onClick={(e) => {
                // Don't open zoom modal if clicking on edit controls
                const target = e.target as HTMLElement;
                if (target.closest('[data-single-view-edit]')) {
                  return;
                }

                if (!isVisualEditMode && hasImage) {
                  openZoomModal(view);
                  onViewClick?.(view);
                } else if (isVisualEditMode) {
                  // Handle annotation clicks
                  microEdits.handleAddAnnotationPoint?.(e, view);
                }
              }}
            >
              <div className={cn(
                "relative w-full h-full rounded-lg sm:rounded-xl overflow-hidden bg-white shadow-md sm:shadow-2xl ring-1 ring-border/10",
                isLoading && "filter blur-[2px] opacity-60"
              )}>
                {/* Loading overlay - show when loading (even with existing image) */}
                {isLoading && (
                  <div className="absolute inset-0 bg-cream/80 backdrop-blur-xl flex flex-col items-center justify-center z-20">
                    {/* Same loading state for both initial generation and edits */}
                    <div className="text-center">
                      <div className="relative">
                        {/* Animated rings */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-16 w-16 rounded-full border-2 border-navy/20 animate-pulse"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-12 w-12 rounded-full border-t-2 border-navy animate-spin"></div>
                        </div>
                        {/* Center dot */}
                        <div className="relative flex items-center justify-center h-16 w-16">
                          <div className="h-2 w-2 rounded-full bg-navy animate-pulse"></div>
                        </div>
                      </div>
                      <div className="text-navy/80 text-sm font-medium mt-4 tracking-wide">
                        {isProcessing ? "Generating" : "Loading"}
                      </div>
                      {isProcessing && (
                        <div className="flex items-center gap-1 mt-2">
                          <span className="h-1 w-1 rounded-full bg-taupe animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="h-1 w-1 rounded-full bg-taupe animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="h-1 w-1 rounded-full bg-taupe animate-bounce"></span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Image or placeholder */}
                {hasImage ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={currentViews[view]}
                      alt={`${view} view`}
                      className="max-w-full max-h-full object-contain"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      onLoad={() => {
                        // console.log(`${view} view image loaded`);
                      }}
                      onError={() => {
                        console.error(`Failed to load ${view} view image`);
                      }}
                    />
                    {/* Zoom icon overlay on hover */}
                    {!isVisualEditMode && !enableSingleViewEdit && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center pointer-events-none">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 rounded-full p-3 shadow-lg">
                          <Maximize2 className="h-6 w-6 text-gray-800" />
                        </div>
                      </div>
                    )}

                    {/* Single View Edit Controls */}
                    {enableSingleViewEdit && !isVisualEditMode && productId && currentRevisionId && (
                      <SingleViewControls
                        viewType={view}
                        viewUrl={currentViews[view]}
                        isLoading={isViewRegenerating(view)}
                        onEdit={async (editInstructions) => {
                          await regenerateView(view, editInstructions);
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    {/* Subtle background pattern */}
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: `
                          radial-gradient(circle at 30% 40%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
                          radial-gradient(circle at 70% 60%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
                          radial-gradient(circle at 50% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                          radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
                        `,
                        filter: "blur(40px)",
                      }}
                    />
                    {/* Grid pattern overlay */}
                    <div
                      className="absolute inset-0 opacity-[0.03]"
                      style={{
                        backgroundImage: `
                          repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(0, 0, 0, 0.03) 35px, rgba(0, 0, 0, 0.03) 36px),
                          repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(0, 0, 0, 0.03) 35px, rgba(0, 0, 0, 0.03) 36px)
                        `,
                      }}
                    />
                    {/* Content */}
                    <div className="relative flex flex-col items-center justify-center h-full p-8">
                      {isLoading ? (
                        <LoadingSkeleton count={3} />
                      ) : (
                        <>
                          <div className="text-sm text-gray-400 font-medium">
                            No {view} image
                          </div>
                          <div className="text-xs mt-2 text-gray-300">
                            Click to generate
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <>
        <div
          ref={containerRef}
          className="relative w-full h-full overflow-visible canvas-drag-area"
          style={{
            background:
              "linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            backgroundColor: "#f9f9f9",
            cursor: isVisualEditMode
              ? "crosshair"
              : isDragging
                ? "grabbing"
                : "grab",
            touchAction: isVisualEditMode ? "auto" : "none", // Prevent default touch behavior during pan
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Canvas container that scales with zoom and can be dragged */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel / 100})`,
              transformOrigin: "center",
              transition: isDragging ? "none" : "transform 0.2s ease-out",
            }}
          >
            {/* Grid of views - 2 row layout with uniform sizes, centered */}
            <div
              className="flex flex-col gap-6 lg:gap-10 max-w-5xl mx-auto pointer-events-auto"
              data-views-grid
              data-product-id={"default"}
            >
              {/* First row: Front, Back, Side */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-10 min-h-[250px] sm:min-h-[300px]">
                {(["front", "back", "side"] as ViewType[]).map(renderViewCard)}
              </div>

              {/* Second row: Top and Bottom centered */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-10 max-w-[700px] mx-auto w-full min-h-[250px] sm:min-h-[300px]">
                {renderViewCard("top" as ViewType)}
                {renderViewCard("bottom" as ViewType)}
              </div>
            </div>
          </div>

          {/* AI Micro Edits annotation overlay - Grid level */}
          {microEdits.renderAnnotationOverlay()}
        </div>

        {/* AI Micro Edits annotation controls */}
        {microEdits.renderAnnotationControls()}

        {/* Image Viewer Modal - Shared component used across the app */}
        {zoomModalOpen && zoomView && currentViews[zoomView] && (
          <ImageViewerModal
            image={{
              url: currentViews[zoomView],
              title: `${zoomView.charAt(0).toUpperCase() + zoomView.slice(1)} View`,
            }}
            onClose={closeZoomModal}
          />
        )}
      </>
    );
  }
);

ViewsDisplay.displayName = "ViewsDisplay";

export default ViewsDisplay;
