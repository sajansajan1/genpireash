"use client";

/**
 * Shared ImageViewerModal Component
 * Full-screen image viewer with zoom controls
 * Works in both authenticated and public modes
 * Uses React Portal to render at document body level (above all other elements)
 */

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut } from "lucide-react";

interface ImageViewerModalProps {
  /** Image data to display */
  image: {
    url: string;
    title?: string;
    description?: string;
  };
  /** Callback when modal is closed */
  onClose: () => void;
  /** Initial zoom level (default: 0.75) */
  initialZoom?: number;
  /** Minimum zoom level (default: 0.5) */
  minZoom?: number;
  /** Maximum zoom level (default: 3) */
  maxZoom?: number;
  /** Zoom step increment (default: 0.25) */
  zoomStep?: number;
}

export function ImageViewerModal({
  image,
  onClose,
  initialZoom = 0.75,
  minZoom = 0.5,
  maxZoom = 3,
  zoomStep = 0.25,
}: ImageViewerModalProps) {
  const [zoomLevel, setZoomLevel] = useState(initialZoom);
  const [mounted, setMounted] = useState(false);

  // Ensure we only render portal on client side
  useEffect(() => {
    setMounted(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + zoomStep, maxZoom));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - zoomStep, minZoom));

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            {image.title && (
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-white line-clamp-1 sm:truncate">
                {image.title}
              </h3>
            )}
            {image.description && (
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-300 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2">
                {image.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Zoom Controls */}
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              disabled={zoomLevel <= minZoom}
            >
              <ZoomOut className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
            </Button>

            <span className="text-white text-[10px] sm:text-xs md:text-sm px-0.5 sm:px-1 md:px-2 min-w-[45px] sm:min-w-[50px] md:min-w-[60px] text-center font-medium">
              {Math.round(zoomLevel * 100)}%
            </span>

            <Button
              variant="ghost"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              disabled={zoomLevel >= maxZoom}
            >
              <ZoomIn className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white h-7 sm:h-8 md:h-9 px-2 sm:ml-2 md:ml-4"
              onClick={onClose}
            >
              <X className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 sm:mr-1.5 md:mr-2" />
              <span className="hidden sm:inline text-xs md:text-sm">Close</span>
            </Button>
          </div>
        </div>

        {/* Image Container */}
        <div className="flex-1 relative bg-white/5 rounded-lg overflow-auto flex items-center justify-center">
          <div
            className="relative transition-transform duration-200"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={image.url}
              alt={image.title || "Image"}
              className="w-auto h-auto max-w-full max-h-[85vh] object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render at document body level, ensuring it's above all other elements
  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}

export default ImageViewerModal;
