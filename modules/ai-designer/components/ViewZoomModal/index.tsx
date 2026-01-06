/**
 * ViewZoomModal component for displaying zoomed product views
 */

import React, { useEffect } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ViewType } from "../../types";

interface ViewZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewType: ViewType | null;
  imageUrl: string;
  productName?: string;
}

export function ViewZoomModal({
  isOpen,
  onClose,
  viewType,
  imageUrl,
  productName = "Product",
}: ViewZoomModalProps) {
  const [zoom, setZoom] = React.useState(0.7);
  const [rotation, setRotation] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const imageRef = React.useRef<HTMLDivElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setZoom(0.7);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(0.7);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleDownload = () => {
    if (!imageUrl) return;

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${productName}-${viewType}-view.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleDoubleClick = () => {
    handleReset();
  };

  if (!isOpen || !viewType || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in-0" />

      {/* Modal Content */}
      <div
        className="relative w-[90vw] h-[90vh] max-w-7xl bg-white rounded-xl shadow-2xl animate-in zoom-in-95 fade-in-0 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/50 to-transparent z-20 pointer-events-none" />
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold text-lg drop-shadow-lg">
              {viewType.charAt(0).toUpperCase() + viewType.slice(1)} View
            </span>
            <span className="text-white text-sm drop-shadow-lg">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleZoomOut}
              title="Zoom Out (Scroll Down)"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleZoomIn}
              title="Zoom In (Scroll Up)"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleRotate}
              title="Rotate 90°"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleDownload}
              title="Download Image"
            >
              <Download className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-white/30 mx-1" />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={onClose}
              title="Close (Esc)"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image Container */}
        <div
          ref={imageRef}
          className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
          style={{
            cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
          }}
        >
          <div
            className="relative transition-transform duration-200 ease-out"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: "center",
              pointerEvents: "none",
            }}
          >
            <img
              src={imageUrl}
              alt={`${viewType} view`}
              className="max-w-full max-h-[85vh] object-contain select-none"
              draggable={false}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-gray-600 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
          <span>Scroll to zoom</span>
          <span className="text-gray-400">•</span>
          <span>Drag to pan (when zoomed)</span>
          <span className="text-gray-400">•</span>
          <span>Double-click to reset</span>
        </div>
      </div>
    </div>
  );
}

export default ViewZoomModal;
