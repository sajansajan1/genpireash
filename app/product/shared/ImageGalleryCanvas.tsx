"use client";

/**
 * Shared ImageGalleryCanvas Component
 * Full-width canvas-style image gallery with grid background and draggable viewport
 * Works in both authenticated (Zustand store) and public (props) modes
 */

import { useState, useMemo, useRef } from "react";
import { Maximize2, RefreshCw, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface ImageItem {
  key: string;
  url: string;
  label: string;
}

interface ProductImagesInput {
  front?: string;
  back?: string | null;
  side?: string | null;
  bottom?: string | null;
  top?: string | null;
}

interface ImageGalleryCanvasProps {
  /** Product images - if not provided, uses Zustand store */
  productImages?: ProductImagesInput;
  /** Whether images are currently being generated */
  isGenerating?: boolean;
  /** Callback when an image is clicked for full view */
  onImageClick?: (url: string, title?: string, description?: string) => void;
}

export function ImageGalleryCanvas({
  productImages = {},
  isGenerating = false,
  onImageClick,
  comments = [],
  onAddComment, // Function to call when a comment is added via pin
}: ImageGalleryCanvasProps & {
  comments?: any[];
  onAddComment?: (text: string, metadata: { x: number; y: number; view: string }) => void;
}) {
  const pathname = usePathname()
  const isProductDetailPage =
    /^\/product\/[a-f0-9-]+$/i.test(pathname);
  // Canvas dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Comment/Pin state
  const [isCommentMode, setIsCommentMode] = useState(false);
  const [tempMarker, setTempMarker] = useState<{ x: number; y: number; view: string } | null>(null);
  const [commentText, setCommentText] = useState("");

  // Build array of all view images
  const images = useMemo<ImageItem[]>(() => {
    const items: ImageItem[] = [];

    if (productImages.front) {
      items.push({ key: "front", url: productImages.front, label: "Front View" });
    }
    if (productImages.back) {
      items.push({ key: "back", url: productImages.back, label: "Back View" });
    }
    if (productImages.side) {
      items.push({ key: "side", url: productImages.side, label: "Side View" });
    }
    if (productImages.top) {
      items.push({ key: "top", url: productImages.top, label: "Top View" });
    }
    if (productImages.bottom) {
      items.push({ key: "bottom", url: productImages.bottom, label: "Bottom View" });
    }

    // Fallback: if no images at all, show placeholder
    if (items.length === 0) {
      items.push({ key: "front", url: "", label: "Front View" });
    }

    return items;
  }, [productImages]);

  // Canvas dragging handlers - Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-view]") || target.closest(".comment-marker-input")) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPanOffset({ x: newX, y: newY });
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-view]") || target.closest(".comment-marker-input")) return;

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

  const handleTouchEnd = () => setIsDragging(false);

  const handleImageClick = (e: React.MouseEvent, image: ImageItem) => {
    // If in comment mode, place a pin
    if (isCommentMode) {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setTempMarker({ x, y, view: image.key });
      setCommentText("");
      return;
    }

    // Otherwise standard click
    if (onImageClick && image.url) {
      onImageClick(image.url, image.label, `Product ${image.label.toLowerCase()}`);
    }
  };

  const submitComment = () => {
    if (tempMarker && commentText.trim() && onAddComment) {
      onAddComment(commentText, tempMarker);
      setTempMarker(null);
      setCommentText("");
      setIsCommentMode(false); // Optional: Exit mode after commenting
    }
  };

  const renderViewCard = (image: ImageItem) => {
    const hasImage = image.url && !image.url.includes("placeholder");
    const viewComments = comments.filter((c: any) => c.metadata?.view === image.key);

    return (
      <div key={image.key} data-view={image.key} className="w-full h-full relative">
        <div className="relative group w-full h-full">
          <div
            className={cn(
              "relative w-full h-full aspect-square transition-all duration-200",
              hasImage && !isCommentMode && "cursor-pointer hover:scale-[1.02]",
              isCommentMode && "cursor-crosshair"
            )}
            onClick={(e) => hasImage && handleImageClick(e, image)}
          >
            <div
              className={cn(
                "relative w-full h-full rounded-xl overflow-hidden bg-white shadow-lg ring-1 ring-border/10",
                isGenerating && "filter blur-[2px] opacity-60"
              )}
            >
              {/* Loading overlay */}
              {isGenerating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full border-2 border-primary/20 animate-pulse" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full border-t-2 border-primary animate-spin" />
                    </div>
                    <div className="relative flex items-center justify-center h-12 w-12">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              {/* Image */}
              {hasImage ? (
                <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <img
                    src={image.url}
                    alt={image.label}
                    className="max-w-full max-h-full object-contain"
                    draggable={false}
                  />

                  {/* Zoom icon overlay on hover (only if not comment mode) */}
                  {!isCommentMode && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center pointer-events-none">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 rounded-full p-2.5 shadow-lg">
                        <Maximize2 className="h-5 w-5 text-gray-800" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mb-2 opacity-30" />
                  <p className="text-sm font-medium">{image.label}</p>
                  <p className="text-xs opacity-60">No image yet</p>
                </div>
              )}
            </div>

            {/* Markers (Outside overflow-hidden container) */}
            {hasImage && (
              <>
                {/* Existing Comments Markers */}
                {viewComments.map((comment: any) => (
                  <div
                    key={comment.id}
                    className="absolute w-6 h-6 -ml-3 -mt-3 bg-stone-900 border-2 border-white rounded-full shadow-lg flex items-center justify-center z-10 group/marker cursor-pointer hover:scale-110 transition-transform"
                    style={{
                      left: `${comment.metadata.x}%`,
                      top: `${comment.metadata.y}%`,
                    }}
                    title={comment.content}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Could open sidebar or show tooltip
                    }}
                  >
                    <div className="w-2 h-2 bg-white rounded-full" />
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-stone-900 text-white text-xs p-2 rounded opacity-0 group-hover/marker:opacity-100 pointer-events-none transition-opacity z-20">
                      <p className="font-semibold mb-0.5">{comment.user?.full_name || comment.full_name || "Anonymous"}</p>
                      <p className="line-clamp-2">{comment.content}</p>
                    </div>
                  </div>
                ))}

                {/* Temporary Marker for new comment */}
                {tempMarker && tempMarker.view === image.key && (
                  <div
                    className="absolute z-20"
                    style={{
                      left: `${tempMarker.x}%`,
                      top: `${tempMarker.y}%`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-6 h-6 -ml-3 -mt-3 bg-primary border-2 border-white rounded-full shadow-lg flex items-center justify-center animate-bounce">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>

                    {/* Input Popover */}
                    <div className="comment-marker-input absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-lg shadow-xl p-3 border border-stone-200 z-30">
                      <textarea
                        className="w-full text-sm border rounded-md p-2 mb-2 focus:ring-2 focus:ring-primary focus:outline-none min-h-[60px]"
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        autoFocus
                      />
                      <div className="flex justify-between gap-2">
                        <button
                          onClick={() => setTempMarker(null)}
                          className="flex-1 px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={submitComment}
                          disabled={!commentText.trim()}
                          className="flex-1 px-3 py-1.5 text-xs bg-stone-900 text-white rounded hover:bg-black disabled:opacity-50"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        background:
          "linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        backgroundColor: "#f9f9f9",
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mode Toggle Button */}
      {!isProductDetailPage && <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={() => {
            setIsCommentMode(!isCommentMode);
            setTempMarker(null);
          }}
          className={cn(
            "px-4 py-2 rounded-full shadow-lg text-sm font-medium transition-all flex items-center gap-2",
            isCommentMode
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-white text-stone-700 hover:bg-gray-50"
          )}
        >
          <div className={cn("w-2 h-2 rounded-full", isCommentMode ? "bg-white" : "bg-stone-400")} />
          {isCommentMode ? "Click image to comment" : "Add Comment"}
        </button>
      </div>}

      {/* Canvas container that can be dragged */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
          transition: isDragging ? "none" : "transform 0.2s ease-out",
        }}
      >
        {/* Grid of views - single unified grid for consistent spacing */}
        <div
          className={cn(
            "grid gap-3 md:gap-4 justify-items-center pointer-events-auto p-4",
            // Responsive columns: 1 on mobile, 2 on tablet, 3 on desktop
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
            // Constrain card sizes
            "[&>div]:w-[200px] [&>div]:h-[200px]",
            "sm:[&>div]:w-[220px] sm:[&>div]:h-[220px]",
            "lg:[&>div]:w-[260px] lg:[&>div]:h-[260px]"
          )}
        >
          {images.map(renderViewCard)}
        </div>
      </div>

      {/* Loading indicator */}
      {isGenerating && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 shadow-md text-xs font-medium text-primary z-10">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          Generating images...
        </div>
      )}
    </div>
  );
}

export default ImageGalleryCanvas;
