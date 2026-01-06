"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  History,
  Download,
  Loader2,
  Send,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Layers,
  Clock,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export interface ImageRevision {
  id: string;
  revisionNumber: number;
  imageUrl: string;
  thumbnailUrl?: string;
  editPrompt?: string;
  editType: "initial" | "ai_edit" | "manual_upload" | "rollback";
  createdAt: string;
  isActive: boolean;
  metadata?: {
    zoomLevel?: number;
    rotation?: number;
    [key: string]: any;
  };
}

export interface ImageView {
  type: "front" | "back" | "side" | "bottom" | "illustration";
  url: string;
  revisions: ImageRevision[];
}

interface AIImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageView[];
  productId: string;
  productName?: string;
  onSave?: (images: ImageView[]) => Promise<void>;
  onEditImage: (
    viewType: string,
    currentImageUrl: string,
    editPrompt: string
  ) => Promise<{ url: string; success: boolean; error?: string }>;
  className?: string;
}

export function AIImageEditor({
  isOpen,
  onClose,
  images,
  productId,
  productName = "Product",
  onSave,
  onEditImage,
  className,
}: AIImageEditorProps) {
  const [selectedView, setSelectedView] = useState<string>("front");
  const [currentImages, setCurrentImages] = useState<ImageView[]>(images);
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showHistory, setShowHistory] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareRevision, setCompareRevision] = useState<ImageRevision | null>(null);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  // Update currentImages when images prop changes
  useEffect(() => {
    console.log("AIImageEditor received images:", images);
    setCurrentImages(images);
  }, [images]);

  // Get current view data
  const currentView = currentImages.find((img) => img.type === selectedView);
  const activeRevision =
    currentView?.revisions.find((r) => r.isActive) || currentView?.revisions[currentView.revisions.length - 1];

  // Handle zoom with mouse wheel
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -10 : 10;
        setZoomLevel((prev) => Math.max(50, Math.min(300, prev + delta)));
      }
    };

    const container = imageContainerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  // Handle image dragging when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 100) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 100) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle AI edit
  const handleAIEdit = async () => {
    if (!editPrompt.trim() || !currentView || !activeRevision) return;

    setIsEditing(true);
    try {
      const result = await onEditImage(currentView.type, activeRevision.imageUrl, editPrompt);

      if (result.success) {
        // Create new revision
        const newRevision: ImageRevision = {
          id: `rev-${Date.now()}`,
          revisionNumber: currentView.revisions.length + 1,
          imageUrl: result.url,
          editPrompt,
          editType: "ai_edit",
          createdAt: new Date().toISOString(),
          isActive: true,
          metadata: { zoomLevel, ...imagePosition },
        };

        // Update current view with new revision
        const updatedImages = currentImages.map((img) => {
          if (img.type === selectedView) {
            return {
              ...img,
              revisions: [...img.revisions.map((r) => ({ ...r, isActive: false })), newRevision],
            };
          }
          return img;
        });

        setCurrentImages(updatedImages);
        setEditPrompt("");
        toast({
          title: "Edit Applied",
          description: "Your image has been updated successfully.",
        });
      } else {
        throw new Error(result.error || "Failed to edit image");
      }
    } catch (error: any) {
      toast({
        title: "Edit Failed",
        description: error.message || "Failed to apply edit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  // Handle revision rollback
  const handleRevisionRollback = (revision: ImageRevision) => {
    const updatedImages = currentImages.map((img) => {
      if (img.type === selectedView) {
        return {
          ...img,
          revisions: img.revisions.map((r) => ({
            ...r,
            isActive: r.id === revision.id,
          })),
        };
      }
      return img;
    });

    setCurrentImages(updatedImages);
  };

  // Reset to original image
  const handleResetToOriginal = () => {
    // Look for the original generated image (revision 0) first
    const originalRevision =
      currentView?.revisions.find((r) => r.revisionNumber === 0 || r.metadata?.generated === true) ||
      currentView?.revisions.find(
        (r) => r.revisionNumber === 1 || r.editType === "initial" || r.metadata?.original === true
      );

    if (originalRevision) {
      handleRevisionRollback(originalRevision);
    } else {
      toast({
        title: "Original Not Found",
        description: "Could not find the original image version.",
        variant: "destructive",
      });
    }
  };

  // Handle save
  const handleSave = async () => {
    if (onSave) {
      await onSave(currentImages);
      onClose();
    }
  };

  // Preset edit suggestions
  const editSuggestions = [
    "Remove background",
    "Change color to blue",
    "Add shadow effect",
    "Make it more vibrant",
    "Adjust brightness",
    "Add texture details",
    "Smooth edges",
    "Enhance details",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-7xl w-[95vw] h-[90vh] p-0 overflow-hidden",
          isFullscreen && "max-w-full w-full h-full",
          className
        )}
      >
        <div className="flex h-full">
          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-4">
                <DialogTitle className="text-xl font-semibold">AI Image Editor - {productName}</DialogTitle>
                <Badge variant="outline">{selectedView} view</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setShowHistory(!showHistory)}>
                  <History className={cn("h-4 w-4", showHistory && "text-zinc-900")} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}>
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* View Selector */}
            <div className="p-4 border-b">
              <Tabs value={selectedView} onValueChange={setSelectedView}>
                <TabsList className="grid grid-cols-3 lg:grid-cols-5 w-full">
                  {currentImages.map((view) => (
                    <TabsTrigger key={view.type} value={view.type} className="capitalize">
                      {view.type}
                      {view.revisions.length > 1 && (
                        <Badge variant="secondary" className="ml-2 h-5 px-1">
                          {view.revisions.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Image Display Area */}
            <div className="flex-1 relative bg-muted/20 overflow-hidden">
              <div
                ref={imageContainerRef}
                className="absolute inset-0 flex items-center justify-center"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: zoomLevel > 100 ? (isDragging ? "grabbing" : "grab") : "default" }}
              >
                {activeRevision && (
                  <div
                    className="relative transition-transform duration-200"
                    style={{
                      transform: `scale(${zoomLevel / 100}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                    }}
                  >
                    <img
                      src={activeRevision.imageUrl}
                      alt={`${selectedView} view`}
                      className="max-w-full max-h-full object-contain select-none"
                      draggable={false}
                    />

                    {/* Compare Mode Overlay */}
                    {compareMode && compareRevision && (
                      <div className="absolute inset-0 mix-blend-difference opacity-50">
                        <img src={compareRevision.imageUrl} alt="Compare" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Zoom Controls */}
              <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur rounded-lg p-2 flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
                  disabled={zoomLevel <= 50}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium w-12 text-center">{zoomLevel}%</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setZoomLevel(Math.min(300, zoomLevel + 25))}
                  disabled={zoomLevel >= 300}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setZoomLevel(100);
                    setImagePosition({ x: 0, y: 0 });
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              {/* Loading Overlay */}
              {isEditing && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-sm text-[#1C1917]">Applying AI edits...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Edit Controls */}
            <div className="p-4 border-t bg-background">
              <div className="space-y-4">
                {/* Quick Suggestions */}
                <div className="flex flex-wrap gap-2">
                  {editSuggestions.map((suggestion) => (
                    <Button key={suggestion} variant="outline" size="sm" onClick={() => setEditPrompt(suggestion)}>
                      {suggestion}
                    </Button>
                  ))}
                </div>

                {/* Edit Input */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Describe what you want to change... (e.g., 'make the colors more vibrant', 'add a shadow', 'change material to leather')"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    className="flex-1 min-h-[60px] max-h-[100px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        handleAIEdit();
                      }
                    }}
                  />
                  <Button onClick={handleAIEdit} disabled={!editPrompt.trim() || isEditing} className="px-6">
                    {isEditing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Apply Edit
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* History Sidebar */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l bg-muted/10 overflow-hidden"
              >
                <div className="w-80 h-full flex flex-col">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Revision History
                      </h3>
                      <Button variant="ghost" size="sm" onClick={handleResetToOriginal} title="Reset to original image">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-[#1C1917]">{currentView?.revisions.length || 0} revisions</p>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-4 space-y-3">
                      {currentView?.revisions
                        .slice()
                        .reverse()
                        .map((revision, index) => (
                          <Card
                            key={revision.id}
                            className={cn(
                              "cursor-pointer transition-all hover:shadow-md",
                              revision.isActive && "ring-2 ring-primary"
                            )}
                            onClick={() => handleRevisionRollback(revision)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start gap-3">
                                <div className="relative w-16 h-16 rounded overflow-hidden bg-muted">
                                  <img
                                    src={revision.thumbnailUrl || revision.imageUrl}
                                    alt={`Revision ${revision.revisionNumber}`}
                                    className="w-full h-full object-cover"
                                  />
                                  {revision.isActive && (
                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                      <Check className="h-4 w-4 text-zinc-900" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={revision.isActive ? "default" : "secondary"}>
                                      {revision.revisionNumber === 0 ? "Original" : `#${revision.revisionNumber}`}
                                    </Badge>
                                    {(revision.revisionNumber === 0 || revision.metadata?.generated === true) && (
                                      <Badge variant="outline" className="text-xs">
                                        Generated
                                      </Badge>
                                    )}
                                    {revision.editType === "ai_edit" && <Sparkles className="h-3 w-3 text-zinc-900" />}
                                  </div>
                                  {revision.editPrompt && (
                                    <p className="text-xs text-[#1C1917] mt-1 line-clamp-2">{revision.editPrompt}</p>
                                  )}
                                  <p className="text-xs text-[#1C1917] mt-1">
                                    {new Date(revision.createdAt).toLocaleTimeString()}
                                  </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-6 w-6"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setCompareRevision(revision);
                                            setCompareMode(true);
                                          }}
                                        >
                                          <Layers className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Compare</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </ScrollArea>

                  {/* Actions */}
                  <div className="p-4 border-t space-y-2">
                    {compareMode && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setCompareMode(false);
                          setCompareRevision(null);
                        }}
                      >
                        <EyeOff className="h-4 w-4 mr-2" />
                        Exit Compare Mode
                      </Button>
                    )}
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export Current
                    </Button>
                    <Button onClick={handleSave} className="w-full">
                      <Check className="h-4 w-4 mr-2" />
                      Save & Continue
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
